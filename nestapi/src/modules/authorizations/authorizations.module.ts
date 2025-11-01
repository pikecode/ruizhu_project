import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthorization } from './entities/user-authorization.entity';
import { AuthorizationsService } from './services/authorizations.service';
import { AuthorizationsController } from './controllers/authorizations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthorization])],
  controllers: [AuthorizationsController],
  providers: [AuthorizationsService],
  exports: [AuthorizationsService],
})
export class AuthorizationsModule {}
