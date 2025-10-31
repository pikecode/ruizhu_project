import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * 用于保护需要JWT认证的端点
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
