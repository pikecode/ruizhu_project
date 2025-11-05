import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberBenefit } from '../../../entities/member-benefit.entity';
import {
  CreateMemberBenefitDto,
  UpdateMemberBenefitDto,
  MemberBenefitResponseDto,
  MemberBenefitListResponseDto,
} from '../dto/member-benefit.dto';
import { UrlHelper } from '../../../common/utils/url.helper';

@Injectable()
export class MemberBenefitsService {
  constructor(
    @InjectRepository(MemberBenefit)
    private memberBenefitRepository: Repository<MemberBenefit>,
    private urlHelper: UrlHelper,
  ) {}

  /**
   * 获取会员礼遇列表（仅包括启用的，用于前端展示）
   */
  async getActiveMemberBenefits(): Promise<MemberBenefitResponseDto[]> {
    const benefits = await this.memberBenefitRepository.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });

    return benefits.map((item) => this.mapToResponseDto(item));
  }

  /**
   * 获取会员礼遇列表（分页，用于后台管理）
   */
  async getMemberBenefitList(
    page: number = 1,
    limit: number = 20,
  ): Promise<MemberBenefitListResponseDto> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.memberBenefitRepository.findAndCount({
      skip,
      take: limit,
      order: {
        sortOrder: 'ASC',
        createdAt: 'DESC',
      },
    });

    const pages = Math.ceil(total / limit);

    return {
      items: items.map((item) => this.mapToResponseDto(item)),
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * 获取单个会员礼遇
   */
  async getMemberBenefitById(id: number): Promise<MemberBenefitResponseDto> {
    const benefit = await this.memberBenefitRepository.findOne({
      where: { id },
    });

    if (!benefit) {
      throw new NotFoundException(`MemberBenefit with ID ${id} not found`);
    }

    return this.mapToResponseDto(benefit);
  }

  /**
   * 创建会员礼遇
   */
  async createMemberBenefit(
    dto: CreateMemberBenefitDto,
  ): Promise<MemberBenefitResponseDto> {
    const benefit = this.memberBenefitRepository.create({
      title: dto.title,
      subtitle: dto.subtitle || null,
      sortOrder: dto.sortOrder || 0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const saved = await this.memberBenefitRepository.save(benefit);
    return this.mapToResponseDto(saved);
  }

  /**
   * 更新会员礼遇
   */
  async updateMemberBenefit(
    id: number,
    dto: UpdateMemberBenefitDto,
  ): Promise<MemberBenefitResponseDto> {
    const benefit = await this.memberBenefitRepository.findOne({
      where: { id },
    });

    if (!benefit) {
      throw new NotFoundException(`MemberBenefit with ID ${id} not found`);
    }

    if (dto.title !== undefined) {
      benefit.title = dto.title;
    }
    if (dto.subtitle !== undefined) {
      benefit.subtitle = dto.subtitle;
    }
    if (dto.sortOrder !== undefined) {
      benefit.sortOrder = dto.sortOrder;
    }
    if (dto.isActive !== undefined) {
      benefit.isActive = dto.isActive;
    }

    const saved = await this.memberBenefitRepository.save(benefit);
    return this.mapToResponseDto(saved);
  }

  /**
   * 删除会员礼遇
   */
  async deleteMemberBenefit(id: number): Promise<void> {
    const benefit = await this.memberBenefitRepository.findOne({
      where: { id },
    });

    if (!benefit) {
      throw new NotFoundException(`MemberBenefit with ID ${id} not found`);
    }

    await this.memberBenefitRepository.remove(benefit);
  }

  /**
   * 更新图片（通过mediaService上传）
   * 只存储文件键，不存储完整URL
   * 前端可以通过 UrlHelper 动态拼接完整URL
   */
  async updateMemberBenefitImage(
    id: number,
    imageKey: string,
  ): Promise<MemberBenefitResponseDto> {
    const benefit = await this.memberBenefitRepository.findOne({
      where: { id },
    });

    if (!benefit) {
      throw new NotFoundException(`MemberBenefit with ID ${id} not found`);
    }

    // 如果有旧的图片，暂时保存 imageKey
    // 前端会根据 key 动态生成 URL
    benefit.imageKey = imageKey;
    benefit.imageUrl = null; // 清除 URL 字段

    const saved = await this.memberBenefitRepository.save(benefit);
    return this.mapToResponseDto(saved);
  }

  /**
   * 将实体映射到响应DTO
   * 使用 imageKey 动态生成完整的 imageUrl
   */
  private mapToResponseDto(benefit: MemberBenefit): MemberBenefitResponseDto {
    // 如果有 imageKey，使用 UrlHelper 动态生成完整 URL
    // 否则使用 imageUrl（向后兼容旧数据）
    const imageUrl = benefit.imageKey
      ? this.urlHelper.generateUrl(benefit.imageKey)
      : benefit.imageUrl;

    return {
      id: benefit.id,
      title: benefit.title,
      subtitle: benefit.subtitle,
      imageUrl,
      isActive: benefit.isActive,
      sortOrder: benefit.sortOrder,
      createdAt: benefit.createdAt,
      updatedAt: benefit.updatedAt,
    };
  }
}
