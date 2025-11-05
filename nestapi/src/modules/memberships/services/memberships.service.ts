import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { CreateMembershipDto, UpdateMembershipDto } from '../dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) {}

  /**
   * Create membership for user
   */
  async createMembership(
    userId: number,
    createDto: CreateMembershipDto,
  ): Promise<Membership> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Check if user already has membership
    const existingMembership = await this.membershipRepository.findOne({
      where: { userId },
    });

    if (existingMembership) {
      throw new BadRequestException('User already has a membership');
    }

    // Convert boolean to 0/1
    const membership = this.membershipRepository.create({
      userId,
      ...createDto,
      requiredConsent: createDto.requiredConsent === 1 || createDto.requiredConsent === true ? 1 : 0,
      marketingConsent: createDto.marketingConsent === 1 || createDto.marketingConsent === true ? 1 : 0,
      analysisConsent: createDto.analysisConsent === 1 || createDto.analysisConsent === true ? 1 : 0,
      marketingOptionalConsent: createDto.marketingOptionalConsent === 1 || createDto.marketingOptionalConsent === true ? 1 : 0,
    });

    return await this.membershipRepository.save(membership);
  }

  /**
   * Get user's membership
   */
  async getMembership(userId: number): Promise<Membership | null> {
    return await this.membershipRepository.findOne({
      where: { userId },
    });
  }

  /**
   * Update membership
   */
  async updateMembership(
    userId: number,
    updateDto: UpdateMembershipDto,
  ): Promise<Membership> {
    let membership = await this.membershipRepository.findOne({
      where: { userId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Convert boolean values to 0/1
    if (updateDto.requiredConsent !== undefined) {
      const value = updateDto.requiredConsent === 1 || updateDto.requiredConsent === true ? 1 : 0;
      updateDto.requiredConsent = value as any;
    }
    if (updateDto.marketingConsent !== undefined) {
      const value = updateDto.marketingConsent === 1 || updateDto.marketingConsent === true ? 1 : 0;
      updateDto.marketingConsent = value as any;
    }
    if (updateDto.analysisConsent !== undefined) {
      const value = updateDto.analysisConsent === 1 || updateDto.analysisConsent === true ? 1 : 0;
      updateDto.analysisConsent = value as any;
    }
    if (updateDto.marketingOptionalConsent !== undefined) {
      const value = updateDto.marketingOptionalConsent === 1 || updateDto.marketingOptionalConsent === true ? 1 : 0;
      updateDto.marketingOptionalConsent = value as any;
    }

    // Update fields from DTO
    Object.assign(membership, updateDto);

    return await this.membershipRepository.save(membership);
  }

  /**
   * Check if user has completed membership
   */
  async hasMembership(userId: number): Promise<boolean> {
    const membership = await this.membershipRepository.findOne({
      where: { userId },
    });
    return !!membership;
  }

  /**
   * Get membership statistics
   */
  async getMembershipStats(): Promise<{
    totalMembers: number;
    marketingConsents: number;
    analysisConsents: number;
  }> {
    const total = await this.membershipRepository.count();
    const marketingCount = await this.membershipRepository.count({
      where: { marketingConsent: 1 },
    });
    const analysisCount = await this.membershipRepository.count({
      where: { analysisConsent: 1 },
    });

    return {
      totalMembers: total,
      marketingConsents: marketingCount,
      analysisConsents: analysisCount,
    };
  }
}
