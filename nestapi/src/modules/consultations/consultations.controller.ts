import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import {
  CreateConsultationDto,
  ConsultationResponseDto,
  QueryConsultationDto,
} from './dto';

@Controller('consultations')
export class ConsultationsController {
  constructor(private consultationsService: ConsultationsService) {}

  /**
   * 创建咨询
   * POST /consultations
   */
  @Post()
  async createConsultation(
    @Body() createConsultationDto: CreateConsultationDto,
  ): Promise<{ code: number; message: string; data: ConsultationResponseDto }> {
    const data = await this.consultationsService.createConsultation(
      createConsultationDto,
    );

    return {
      code: 0,
      message: '咨询提交成功',
      data,
    };
  }

  /**
   * 获取咨询列表
   * GET /consultations?page=1&limit=20&status=unread
   */
  @Get()
  async getConsultations(
    @Query() query: QueryConsultationDto,
  ): Promise<{
    code: number;
    message: string;
    data: {
      items: ConsultationResponseDto[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const data = await this.consultationsService.getConsultations(query);

    return {
      code: 0,
      message: '获取咨询列表成功',
      data,
    };
  }

  /**
   * 获取单个咨询
   * GET /consultations/:id
   */
  @Get(':id')
  async getConsultation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string; data: ConsultationResponseDto }> {
    const data = await this.consultationsService.getConsultationById(id);

    return {
      code: 0,
      message: '获取咨询详情成功',
      data,
    };
  }

  /**
   * 更新咨询状态
   * PATCH /consultations/:id/status
   */
  @Patch(':id/status')
  async updateConsultationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { status: 'unread' | 'read' | 'processing' | 'completed' },
  ): Promise<{ code: number; message: string; data: ConsultationResponseDto }> {
    const data = await this.consultationsService.updateConsultationStatus(
      id,
      body.status,
    );

    return {
      code: 0,
      message: '更新咨询状态成功',
      data,
    };
  }

  /**
   * 删除咨询
   * DELETE /consultations/:id
   */
  @Delete(':id')
  async deleteConsultation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string }> {
    await this.consultationsService.deleteConsultation(id);

    return {
      code: 0,
      message: '删除咨询成功',
    };
  }

  /**
   * 批量删除咨询
   * DELETE /consultations
   */
  @Delete()
  async deleteConsultations(
    @Body() body: { ids: number[] },
  ): Promise<{ code: number; message: string }> {
    await this.consultationsService.deleteConsultations(body.ids);

    return {
      code: 0,
      message: '批量删除咨询成功',
    };
  }

  /**
   * 获取咨询统计数据
   * GET /consultations/stats/overview
   */
  @Get('stats/overview')
  async getStats(): Promise<{
    code: number;
    message: string;
    data: {
      total: number;
      unread: number;
      read: number;
      processing: number;
      completed: number;
    };
  }> {
    const data = await this.consultationsService.getStats();

    return {
      code: 0,
      message: '获取统计数据成功',
      data,
    };
  }
}
