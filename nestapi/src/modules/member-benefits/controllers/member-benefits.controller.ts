import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MemberBenefitsService } from '../services/member-benefits.service';
import {
  MemberBenefitResponseDto,
  MemberBenefitListResponseDto,
} from '../dto/member-benefit.dto';

@ApiTags('Member Benefits')
@Controller('member-benefits')
export class MemberBenefitsController {
  constructor(private memberBenefitsService: MemberBenefitsService) {}

  /**
   * 获取首页展示的会员礼遇列表（仅启用的）
   * GET /api/v1/member-benefits
   */
  @Get()
  @ApiOperation({ summary: 'Get active member benefits for homepage' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member benefits',
  })
  async getActiveMemberBenefits(): Promise<{
    code: number;
    message: string;
    data: MemberBenefitResponseDto[];
  }> {
    const data = await this.memberBenefitsService.getActiveMemberBenefits();
    return {
      code: 200,
      message: 'Successfully retrieved member benefits',
      data,
    };
  }

  /**
   * 获取单个会员礼遇详情
   * GET /api/v1/member-benefits/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get member benefit by ID' })
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
}
