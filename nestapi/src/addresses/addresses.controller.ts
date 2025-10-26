import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('addresses')
@UseGuards(JwtGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  /**
   * Create a new address (requires JWT authentication)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const address = await this.addressesService.create(user.id, createAddressDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '地址添加成功',
      data: address,
    };
  }

  /**
   * Get all addresses for current user
   */
  @Get()
  async findAll(@CurrentUser() user: any) {
    const addresses = await this.addressesService.findByUserId(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: '获取地址列表成功',
      data: addresses,
    };
  }

  /**
   * Get default address for current user
   */
  @Get('default')
  async getDefault(@CurrentUser() user: any) {
    const address = await this.addressesService.getDefaultAddress(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: '获取默认地址成功',
      data: address,
    };
  }

  /**
   * Get a single address by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const address = await this.addressesService.findOne(+id);
    if (!address) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: '地址不存在',
        data: null,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: '获取地址成功',
      data: address,
    };
  }

  /**
   * Update an address
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const address = await this.addressesService.update(+id, updateAddressDto);
    return {
      statusCode: HttpStatus.OK,
      message: '地址更新成功',
      data: address,
    };
  }

  /**
   * Set an address as default
   */
  @Patch(':id/set-default')
  async setDefault(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const address = await this.addressesService.setDefault(user.id, +id);
    return {
      statusCode: HttpStatus.OK,
      message: '设置默认地址成功',
      data: address,
    };
  }

  /**
   * Delete an address
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.addressesService.remove(+id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: '地址删除成功',
    };
  }
}
