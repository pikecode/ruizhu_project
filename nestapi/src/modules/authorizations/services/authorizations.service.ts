import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAuthorization } from '../entities/user-authorization.entity';
import { UpdateAuthorizationDto } from '../dto';

@Injectable()
export class AuthorizationsService {
  constructor(
    @InjectRepository(UserAuthorization)
    private readonly authorizationRepository: Repository<UserAuthorization>,
  ) {}

  /**
   * Initialize default authorizations for a new user
   */
  async initializeAuthorizations(userId: number): Promise<UserAuthorization> {
    const authorization = this.authorizationRepository.create({
      userId,
      registration: 1, // 默认同意注册
      analysis: 1, // 默认同意分析
      marketing: 1, // 默认同意营销
      transfer: 1, // 默认同意跨境转移
    });

    return await this.authorizationRepository.save(authorization);
  }

  /**
   * Get user's authorizations
   */
  async getAuthorizations(
    userId: number,
  ): Promise<UserAuthorization | null> {
    return await this.authorizationRepository.findOne({
      where: { userId },
    });
  }

  /**
   * Update user's authorizations
   */
  async updateAuthorizations(
    userId: number,
    updateDto: UpdateAuthorizationDto,
  ): Promise<UserAuthorization> {
    let authorization = await this.authorizationRepository.findOne({
      where: { userId },
    });

    // If authorization record doesn't exist, create one
    if (!authorization) {
      authorization = this.authorizationRepository.create({
        userId,
        registration: updateDto.registration ? 1 : 0,
        analysis: updateDto.analysis ? 1 : 0,
        marketing: updateDto.marketing ? 1 : 0,
        transfer: updateDto.transfer ? 1 : 0,
      });
    } else {
      // Convert boolean to 0/1 for each field
      if (updateDto.registration !== undefined) {
        const regValue = updateDto.registration === 1 || updateDto.registration === true ? 1 : 0;
        authorization.registration = regValue;
      }
      if (updateDto.analysis !== undefined) {
        const anaValue = updateDto.analysis === 1 || updateDto.analysis === true ? 1 : 0;
        authorization.analysis = anaValue;
      }
      if (updateDto.marketing !== undefined) {
        const marValue = updateDto.marketing === 1 || updateDto.marketing === true ? 1 : 0;
        authorization.marketing = marValue;
      }
      if (updateDto.transfer !== undefined) {
        const traValue = updateDto.transfer === 1 || updateDto.transfer === true ? 1 : 0;
        authorization.transfer = traValue;
      }
    }

    return await this.authorizationRepository.save(authorization);
  }

  /**
   * Check if user has agreed to a specific authorization
   */
  async hasAuthorization(
    userId: number,
    authorizationType: string,
  ): Promise<boolean> {
    const authorization = await this.authorizationRepository.findOne({
      where: { userId },
    });

    if (!authorization) {
      return false;
    }

    return authorization[authorizationType] === 1;
  }
}
