import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AdminUsersModule } from '../modules/admin-users/admin-users.module';
import { AdminAuthService } from '../modules/auth/admin-auth.service';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@Module({
  imports: [
    UsersModule,
    AdminUsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminAuthService,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    AdminAuthGuard,
  ],
  exports: [
    AuthService,
    AdminAuthService,
    RolesGuard,
    PermissionsGuard,
    AdminAuthGuard,
  ],
})
export class AuthModule {}
