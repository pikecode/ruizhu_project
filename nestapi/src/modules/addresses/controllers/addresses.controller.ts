import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AddressesService } from '../services/addresses.service';
import { CreateAddressDto, UpdateAddressDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('addresses')
@Controller('api/addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  /**
   * Create new address
   * POST /api/addresses
   */
  @Post()
  @ApiOperation({ summary: 'Create new delivery address' })
  async createAddress(
    @Request() req,
    @Body() createDto: CreateAddressDto,
  ) {
    return await this.addressesService.createAddress(req.user.id, createDto);
  }

  /**
   * Get all addresses for current user with pagination
   * GET /api/addresses?page=1&limit=20
   */
  @Get()
  @ApiOperation({ summary: 'Get user addresses' })
  async getAddresses(
    @Request() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return await this.addressesService.getAddresses(
      req.user.id,
      page,
      limit,
    );
  }

  /**
   * Get default address
   * GET /api/addresses/default/current
   * Must be before :addressId route
   */
  @Get('default/current')
  @ApiOperation({ summary: 'Get default address' })
  async getDefaultAddress(@Request() req) {
    return await this.addressesService.getDefaultAddress(req.user.id);
  }

  /**
   * Get address for checkout
   * GET /api/addresses/checkout/default
   * Must be before :addressId route
   */
  @Get('checkout/default')
  @ApiOperation({ summary: 'Get address for checkout' })
  async getAddressForCheckout(@Request() req) {
    return await this.addressesService.getAddressForCheckout(req.user.id);
  }

  /**
   * Check if user has any addresses
   * GET /api/addresses/status/has-address
   * Must be before :addressId route
   */
  @Get('status/has-address')
  @ApiOperation({ summary: 'Check if user has addresses' })
  async hasAddresses(@Request() req) {
    const hasAddresses = await this.addressesService.hasAddresses(
      req.user.id,
    );
    return { hasAddresses };
  }

  /**
   * Get single address by ID
   * GET /api/addresses/:addressId
   * Must be after all specific routes
   */
  @Get(':addressId')
  @ApiOperation({ summary: 'Get address details' })
  async getAddress(
    @Request() req,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return await this.addressesService.getAddress(req.user.id, addressId);
  }

  /**
   * Update address details
   * PUT /api/addresses/:addressId
   */
  @Put(':addressId')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(
    @Request() req,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() updateDto: UpdateAddressDto,
  ) {
    return await this.addressesService.updateAddress(
      req.user.id,
      addressId,
      updateDto,
    );
  }

  /**
   * Set address as default
   * PUT /api/addresses/:addressId/set-default
   */
  @Put(':addressId/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefaultAddress(
    @Request() req,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return await this.addressesService.setDefaultAddress(
      req.user.id,
      addressId,
    );
  }

  /**
   * Delete address
   * DELETE /api/addresses/:addressId
   */
  @Delete(':addressId')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(
    @Request() req,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    await this.addressesService.deleteAddress(req.user.id, addressId);
    return { message: 'Address deleted successfully' };
  }
}
