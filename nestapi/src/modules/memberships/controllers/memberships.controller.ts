import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MembershipsService } from '../services/memberships.service';
import { CreateMembershipDto, UpdateMembershipDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('memberships')
@Controller('memberships')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  /**
   * Create membership profile
   * POST /api/memberships
   */
  @Post()
  @ApiOperation({ summary: 'Create membership profile' })
  async createMembership(
    @Request() req,
    @Body() createDto: CreateMembershipDto,
  ) {
    return await this.membershipsService.createMembership(req.user.id, createDto);
  }

  /**
   * Get user's membership profile
   * GET /api/memberships
   */
  @Get()
  @ApiOperation({ summary: 'Get user membership profile' })
  async getMembership(@Request() req) {
    const membership = await this.membershipsService.getMembership(req.user.id);

    if (!membership) {
      return {
        hasProfile: false,
        message: 'No membership profile found',
      };
    }

    return {
      hasProfile: true,
      ...membership,
    };
  }

  /**
   * Update membership profile
   * PUT /api/memberships
   */
  @Put()
  @ApiOperation({ summary: 'Update membership profile' })
  async updateMembership(
    @Request() req,
    @Body() updateDto: UpdateMembershipDto,
  ) {
    return await this.membershipsService.updateMembership(req.user.id, updateDto);
  }

  /**
   * Check if user has membership
   * GET /api/memberships/status/has-profile
   */
  @Get('status/has-profile')
  @ApiOperation({ summary: 'Check if user has membership profile' })
  async hasMembership(@Request() req) {
    const hasMembership = await this.membershipsService.hasMembership(req.user.id);
    return { hasMembership };
  }

  /**
   * Get membership statistics (admin only - for now public)
   * GET /api/memberships/stats
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get membership statistics' })
  async getStats() {
    return await this.membershipsService.getMembershipStats();
  }
}
