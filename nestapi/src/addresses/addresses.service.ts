import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  /**
   * Create a new address
   */
  async create(userId: number, createAddressDto: CreateAddressDto): Promise<Address> {
    // If isDefault is true, set other addresses to non-default
    if (createAddressDto.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = this.addressRepository.create({
      userId,
      ...createAddressDto,
    });

    return this.addressRepository.save(address);
  }

  /**
   * Get all addresses for a user
   */
  async findByUserId(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', updatedAt: 'DESC' },
    });
  }

  /**
   * Get a single address by ID
   */
  async findOne(id: number): Promise<Address | null> {
    return this.addressRepository.findOne({ where: { id } });
  }

  /**
   * Get default address for a user
   */
  async getDefaultAddress(userId: number): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  /**
   * Update an address
   */
  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address | null> {
    // If setting as default, unset other defaults
    if (updateAddressDto.isDefault) {
      const address = await this.addressRepository.findOne({ where: { id } });
      if (address) {
        await this.addressRepository.update(
          { userId: address.userId, isDefault: true },
          { isDefault: false }
        );
      }
    }

    await this.addressRepository.update(id, updateAddressDto);
    return this.findOne(id);
  }

  /**
   * Delete an address
   */
  async remove(id: number): Promise<void> {
    await this.addressRepository.delete(id);
  }

  /**
   * Set an address as default
   */
  async setDefault(userId: number, addressId: number): Promise<Address | null> {
    // Unset other defaults
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // Set this one as default
    await this.addressRepository.update(
      { id: addressId },
      { isDefault: true }
    );

    return this.findOne(addressId);
  }
}
