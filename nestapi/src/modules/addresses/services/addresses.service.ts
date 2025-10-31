import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from '../entities/user-address.entity';
import { CreateAddressDto, UpdateAddressDto } from '../dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly addressRepository: Repository<UserAddress>,
  ) {}

  /**
   * Create new address for user
   */
  async createAddress(
    userId: number,
    createDto: CreateAddressDto,
  ): Promise<UserAddress> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // If this is the first address, set it as default
    const existingCount = await this.addressRepository.count({
      where: { userId, isDeleted: 0 },
    });

    const address = this.addressRepository.create({
      userId,
      ...createDto,
      isDefault: existingCount === 0 ? 1 : 0,
    });

    return await this.addressRepository.save(address);
  }

  /**
   * Get all addresses for user with pagination
   */
  async getAddresses(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    addresses: UserAddress[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [addresses, total] = await this.addressRepository.findAndCount({
      where: { userId, isDeleted: 0 },
      skip,
      take: limit,
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });

    return {
      addresses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single address by ID
   */
  async getAddress(userId: number, addressId: number): Promise<UserAddress> {
    const address = await this.addressRepository.findOne({
      where: {
        id: addressId,
        userId,
        isDeleted: 0,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  /**
   * Update address details
   */
  async updateAddress(
    userId: number,
    addressId: number,
    updateDto: UpdateAddressDto,
  ): Promise<UserAddress> {
    const address = await this.getAddress(userId, addressId);

    // Update fields if provided
    Object.assign(address, updateDto);

    return await this.addressRepository.save(address);
  }

  /**
   * Delete address (soft delete)
   */
  async deleteAddress(userId: number, addressId: number): Promise<void> {
    const address = await this.getAddress(userId, addressId);

    // If this was the default address, set another as default
    if (address.isDefault === 1) {
      const nextDefault = await this.addressRepository.findOne({
        where: { userId, isDeleted: 0, id: { $ne: addressId } as any },
        order: { createdAt: 'DESC' },
      });

      if (nextDefault) {
        nextDefault.isDefault = 1;
        await this.addressRepository.save(nextDefault);
      }
    }

    address.isDeleted = 1;
    await this.addressRepository.save(address);
  }

  /**
   * Get default address for user
   */
  async getDefaultAddress(userId: number): Promise<UserAddress | null> {
    return await this.addressRepository.findOne({
      where: { userId, isDefault: 1, isDeleted: 0 },
    });
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(userId: number, addressId: number): Promise<UserAddress> {
    const address = await this.getAddress(userId, addressId);

    // Remove default flag from all other addresses
    await this.addressRepository.update(
      { userId, isDeleted: 0 },
      { isDefault: 0 },
    );

    // Set this address as default
    address.isDefault = 1;
    return await this.addressRepository.save(address);
  }

  /**
   * Get default address for order creation
   * If no default set, return most recent
   */
  async getAddressForCheckout(userId: number): Promise<UserAddress> {
    // Try to get default address
    let address = await this.getDefaultAddress(userId);

    // If no default, get most recent
    if (!address) {
      address = await this.addressRepository.findOne({
        where: { userId, isDeleted: 0 },
        order: { createdAt: 'DESC' },
      });
    }

    if (!address) {
      throw new NotFoundException(
        'No delivery address found. Please add an address first.',
      );
    }

    return address;
  }

  /**
   * Check if user has any addresses
   */
  async hasAddresses(userId: number): Promise<boolean> {
    const count = await this.addressRepository.count({
      where: { userId, isDeleted: 0 },
    });
    return count > 0;
  }

  /**
   * Get address count for user
   */
  async getAddressCount(userId: number): Promise<number> {
    return await this.addressRepository.count({
      where: { userId, isDeleted: 0 },
    });
  }
}
