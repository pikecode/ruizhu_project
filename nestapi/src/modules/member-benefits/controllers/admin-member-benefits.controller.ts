import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MemberBenefitsService } from '../services/member-benefits.service';
import {
  CreateMemberBenefitDto,
  UpdateMemberBenefitDto,
  MemberBenefitResponseDto,
  MemberBenefitListResponseDto,
} from '../dto/member-benefit.dto';
import { MediaService } from '../../media/media.service';

/**
 * Admin Member Benefits Controller
 * 路由前缀: /api/admin/member-benefits
 * 注：管理系统使用独立的 /admin/* 路由与消费端区分
 */
@ApiTags('Admin Member Benefits')
@Controller('admin/member-benefits')
export class AdminMemberBenefitsController {
  constructor(
    private memberBenefitsService: MemberBenefitsService,
    private mediaService: MediaService,
  ) {}

  /**
   * 获取会员礼遇列表（分页，后台管理）
   * GET /api/admin/member-benefits?page=1&limit=20
   */
  @Get()
  @ApiOperation({ summary: 'Get member benefits list with pagination (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member benefits list',
  })
  async getMemberBenefitList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{
    code: number;
    message: string;
    data: MemberBenefitListResponseDto;
  }> {
    const data = await this.memberBenefitsService.getMemberBenefitList(
      page,
      limit,
    );
    return {
      code: 200,
      message: 'Successfully retrieved member benefits list',
      data,
    };
  }

  /**
   * 获取单个会员礼遇详情
   * GET /api/admin/member-benefits/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get member benefit by ID (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Member benefit ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member benefit',
  })
  async getMemberBenefitById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{
    code: number;
    message: string;
    data: MemberBenefitResponseDto;
  }> {
    const data = await this.memberBenefitsService.getMemberBenefitById(id);
    return {
      code: 200,
      message: 'Successfully retrieved member benefit',
      data,
    };
  }

  /**
   * 创建会员礼遇
   * POST /api/admin/member-benefits
   * Body: { title, subtitle?, sortOrder?, isActive? }
   */
  @Post()
  @ApiOperation({ summary: 'Create a new member benefit (admin)' })
  @ApiResponse({
    status: 201,
    description: 'Member benefit created successfully',
  })
  async createMemberBenefit(
    @Body() createDto: CreateMemberBenefitDto,
  ): Promise<{
    code: number;
    message: string;
    data: MemberBenefitResponseDto;
  }> {
    const data = await this.memberBenefitsService.createMemberBenefit(createDto);
    return {
      code: 201,
      message: 'Member benefit created successfully',
      data,
    };
  }

  /**
   * 更新会员礼遇
   * PUT /api/admin/member-benefits/:id
   * Body: { title?, subtitle?, sortOrder?, isActive? }
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update member benefit (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Member benefit ID' })
  @ApiResponse({
    status: 200,
    description: 'Member benefit updated successfully',
  })
  async updateMemberBenefit(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMemberBenefitDto,
  ): Promise<{
    code: number;
    message: string;
    data: MemberBenefitResponseDto;
  }> {
    const data = await this.memberBenefitsService.updateMemberBenefit(
      id,
      updateDto,
    );
    return {
      code: 200,
      message: 'Member benefit updated successfully',
      data,
    };
  }

  /**
   * 删除会员礼遇
   * DELETE /api/admin/member-benefits/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete member benefit (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Member benefit ID' })
  @ApiResponse({
    status: 200,
    description: 'Member benefit deleted successfully',
  })
  async deleteMemberBenefit(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{
    code: number;
    message: string;
  }> {
    await this.memberBenefitsService.deleteMemberBenefit(id);
    return {
      code: 200,
      message: 'Member benefit deleted successfully',
    };
  }

  /**
   * 上传会员礼遇图片
   * POST /api/admin/member-benefits/:id/upload-image
   * Content-Type: multipart/form-data
   * File field: file (image/jpeg, image/png, image/webp)
   */
  @Post(':id/upload-image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload member benefit image (admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Member benefit ID' })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
  })
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    code: number;
    message: string;
    data: MemberBenefitResponseDto;
  }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // 使用统一的 mediaService 上传图片
    const result = await this.mediaService.uploadMedia(file, 'image');

    // 更新数据库，只存储文件键
    const data = await this.memberBenefitsService.updateMemberBenefitImage(
      id,
      result.key,
    );

    return {
      code: 200,
      message: 'Image uploaded successfully',
      data,
    };
  }
}
