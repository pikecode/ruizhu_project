import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { Consultation } from '../../entities/consultation.entity';
import {
  CreateConsultationDto,
  ConsultationResponseDto,
  QueryConsultationDto,
} from './dto';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
  ) {}

  /**
   * 创建咨询
   */
  async createConsultation(
    createConsultationDto: CreateConsultationDto,
  ): Promise<ConsultationResponseDto> {
    const consultation = this.consultationRepository.create(
      createConsultationDto,
    );
    const savedConsultation = await this.consultationRepository.save(
      consultation,
    );
    return this.mapToResponseDto(savedConsultation);
  }

  /**
   * 获取咨询列表
   */
  async getConsultations(
    query: QueryConsultationDto,
  ): Promise<{ items: ConsultationResponseDto[]; total: number; page: number; limit: number; pages: number }> {
    const { page = 1, limit = 20, status, productId, categoryId, keyword } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Consultation> = {};

    if (status) {
      where.status = status;
    }

    if (productId) {
      where.productId = productId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 搜索条件：电话或用户名
    let queryBuilder = this.consultationRepository.createQueryBuilder('c');

    // 应用基础过滤条件
    if (status) {
      queryBuilder = queryBuilder.where('c.status = :status', { status });
    }

    if (productId) {
      queryBuilder = queryBuilder.andWhere('c.productId = :productId', {
        productId,
      });
    }

    if (categoryId) {
      queryBuilder = queryBuilder.andWhere('c.categoryId = :categoryId', {
        categoryId,
      });
    }

    if (keyword) {
      queryBuilder = queryBuilder.andWhere(
        '(c.userPhone LIKE :keyword OR c.userName LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 排序和分页
    queryBuilder = queryBuilder
      .orderBy('c.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

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
   * 获取单个咨询
   */
  async getConsultationById(id: number): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
    });

    if (!consultation) {
      throw new Error(`Consultation with id ${id} not found`);
    }

    // 标记为已读
    await this.consultationRepository.update(id, { status: 'read' });

    return this.mapToResponseDto(consultation);
  }

  /**
   * 更新咨询状态
   */
  async updateConsultationStatus(
    id: number,
    status: 'unread' | 'read' | 'processing' | 'completed',
  ): Promise<ConsultationResponseDto> {
    await this.consultationRepository.update(id, { status });

    const consultation = await this.consultationRepository.findOne({
      where: { id },
    });

    if (!consultation) {
      throw new Error(`Consultation with id ${id} not found`);
    }

    return this.mapToResponseDto(consultation);
  }

  /**
   * 删除咨询
   */
  async deleteConsultation(id: number): Promise<void> {
    const result = await this.consultationRepository.delete(id);

    if (result.affected === 0) {
      throw new Error(`Consultation with id ${id} not found`);
    }
  }

  /**
   * 删除多个咨询
   */
  async deleteConsultations(ids: number[]): Promise<void> {
    await this.consultationRepository.delete(ids);
  }

  /**
   * 获取统计数据
   */
  async getStats(): Promise<{
    total: number;
    unread: number;
    read: number;
    processing: number;
    completed: number;
  }> {
    const total = await this.consultationRepository.count();
    const unread = await this.consultationRepository.count({
      where: { status: 'unread' },
    });
    const read = await this.consultationRepository.count({
      where: { status: 'read' },
    });
    const processing = await this.consultationRepository.count({
      where: { status: 'processing' },
    });
    const completed = await this.consultationRepository.count({
      where: { status: 'completed' },
    });

    return { total, unread, read, processing, completed };
  }

  /**
   * 将实体映射到响应DTO
   */
  private mapToResponseDto(consultation: Consultation): ConsultationResponseDto {
    return {
      id: consultation.id,
      productId: consultation.productId,
      productName: consultation.productName,
      categoryId: consultation.categoryId,
      categoryName: consultation.categoryName,
      userName: consultation.userName,
      userPhone: consultation.userPhone,
      userEmail: consultation.userEmail,
      color: consultation.color,
      height: consultation.height,
      weight: consultation.weight,
      chest: consultation.chest,
      waist: consultation.waist,
      hip: consultation.hip,
      shoeSize: consultation.shoeSize,
      ringSize: consultation.ringSize,
      jewelrySize: consultation.jewelrySize,
      jewelryMaterial: consultation.jewelryMaterial,
      perfumePreference: consultation.perfumePreference,
      remarks: consultation.remarks,
      status: consultation.status,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  }
}
