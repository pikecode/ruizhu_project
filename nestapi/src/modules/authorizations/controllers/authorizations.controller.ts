import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthorizationsService } from '../services/authorizations.service';
import { UpdateAuthorizationDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('authorizations')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuthorizationsController {
  constructor(private readonly authorizationsService: AuthorizationsService) {}

  /**
   * Get user's authorization settings
   * GET /api/user/authorizations
   */
  @Get('authorizations')
  @ApiOperation({ summary: 'Get user authorization settings' })
  async getAuthorizations(@Request() req) {
    const authorization = await this.authorizationsService.getAuthorizations(
      req.user.id,
    );

    if (!authorization) {
      // Return default authorizations if not found
      return {
        userId: req.user.id,
        registration: 1,
        analysis: 1,
        marketing: 1,
        transfer: 1,
      };
    }

    return authorization;
  }

  /**
   * Update user's authorization settings
   * PUT /api/user/authorizations
   */
  @Put('authorizations')
  @ApiOperation({ summary: 'Update user authorization settings' })
  async updateAuthorizations(
    @Request() req,
    @Body() updateDto: UpdateAuthorizationDto,
  ) {
    return await this.authorizationsService.updateAuthorizations(
      req.user.id,
      updateDto,
    );
  }

  /**
   * Check if user has agreed to specific authorization
   * GET /api/user/authorizations/:type
   * Types: registration, analysis, marketing, transfer
   */
  @Get('authorizations/:type')
  @ApiOperation({ summary: 'Check specific authorization status' })
  async checkAuthorization(@Request() req, @Body('type') type: string) {
    const hasAuth = await this.authorizationsService.hasAuthorization(
      req.user.id,
      type,
    );

    return { type, authorized: hasAuth };
  }
}
