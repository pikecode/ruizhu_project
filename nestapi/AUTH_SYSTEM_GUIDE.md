# NestJS Authentication System - Complete Implementation Guide

## Overview

This is a production-ready authentication system for NestJS with JWT tokens, refresh tokens, role-based access control (RBAC), permission management, and comprehensive security features.

## Features

- User registration and login with email/username
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt (12 rounds)
- Refresh token rotation for enhanced security
- Role-based access control (RBAC)
- Fine-grained permission system
- Login/logout tracking
- Password change functionality
- User profile management
- IP address and user agent tracking
- Comprehensive error handling
- Input validation with class-validator

## Project Structure

```
nestapi/
├── src/
│   ├── auth/
│   │   ├── decorators/
│   │   │   ├── permissions.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   ├── auth-login.dto.ts
│   │   │   ├── auth-register.dto.ts
│   │   │   ├── auth-response.dto.ts
│   │   │   ├── change-password.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── update-profile.dto.ts
│   │   ├── entities/
│   │   │   ├── login-log.entity.ts
│   │   │   ├── permission.entity.ts
│   │   │   └── refresh-token.entity.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── current-user.decorator.ts
│   │   ├── jwt.guard.ts
│   │   ├── jwt.strategy.ts
│   │   ├── permissions.guard.ts
│   │   └── roles.guard.ts
│   ├── users/
│   │   ├── entities/
│   │   │   └── user.entity.ts (updated)
│   │   ├── users.module.ts (updated)
│   │   └── users.service.ts (updated)
│   └── roles/
│       └── entities/
│           └── role.entity.ts (updated)
└── migrations/
    └── 001_auth_system_setup.sql
```

## Database Schema

### Tables Created/Modified

1. **users** - Updated with authentication fields
2. **roles** - Updated with code and level fields
3. **permissions** - New table for permission management
4. **role_permissions** - Junction table for many-to-many relationship
5. **refresh_tokens** - Stores refresh tokens for users
6. **login_logs** - Tracks login attempts and history

## Installation & Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ruizhu

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d

# Optional: Database URL (alternative to individual DB vars)
DB_URL=mysql://user:password@localhost:3306/ruizhu
```

### 2. Run Database Migration

```bash
# Connect to MySQL
mysql -u root -p

# Select your database
USE ruizhu;

# Run migration
source migrations/001_auth_system_setup.sql
```

### 3. Install Dependencies (if needed)

All required dependencies are already in package.json:

```bash
npm install
```

Required packages:
- @nestjs/jwt
- @nestjs/passport
- @nestjs/typeorm
- passport
- passport-jwt
- bcryptjs
- class-validator
- class-transformer

### 4. Start the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "StrongPass123",
  "phone": "13800138000",  // Optional
  "realName": "John Doe"   // Optional
}

Response (201):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "realName": "John Doe",
    "phone": "13800138000",
    "avatar": null,
    "role": {
      "id": 4,
      "name": "User",
      "code": "user",
      "permissions": [...]
    }
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "StrongPass123"
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": 86400,
  "user": { ... }
}
```

#### 3. Get Current User (Protected)
```http
GET /auth/me
Authorization: Bearer <access_token>

Response (200):
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": { ... }
}
```

#### 4. Update Profile (Protected)
```http
PUT /auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "realName": "John Smith",
  "phone": "13900139000",
  "avatar": "https://example.com/avatar.jpg"
}

Response (200):
{
  "id": 1,
  "username": "johndoe",
  "email": "newemail@example.com",
  ...
}
```

#### 5. Change Password (Protected)
```http
POST /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "StrongPass123",
  "newPassword": "NewStrongPass456",
  "confirmPassword": "NewStrongPass456"
}

Response (200):
{
  "message": "Password changed successfully"
}
```

#### 6. Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}

Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "new_refresh_token...",
  "expiresIn": 86400,
  "user": { ... }
}
```

#### 7. Logout (Protected)
```http
POST /auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}

Response (200):
{
  "message": "Logged out successfully"
}
```

## Using Guards and Decorators

### 1. Protect Routes with JWT

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/jwt.guard';
import { CurrentUser } from './auth/current-user.decorator';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(JwtGuard)
  getProtectedData(@CurrentUser() user: any) {
    return {
      message: 'This is protected data',
      user: user,
    };
  }
}
```

### 2. Role-Based Access Control

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/jwt.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin', 'super_admin')
  getAllUsers() {
    return { message: 'Only admins can see this' };
  }
}
```

### 3. Permission-Based Access Control

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/jwt.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { Permissions } from './auth/decorators/permissions.decorator';

@Controller('products')
@UseGuards(JwtGuard, PermissionsGuard)
export class ProductsController {
  @Post()
  @Permissions('products.create')
  createProduct() {
    return { message: 'Product created' };
  }
}
```

## Password Requirements

- Minimum 6 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number

## Security Features

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT Tokens**: Signed with secret key, 1 day expiration
3. **Refresh Tokens**: 7 day expiration, stored in database
4. **Token Rotation**: Old refresh token revoked when new one issued
5. **Login Tracking**: IP address and user agent logged
6. **Failed Login Tracking**: All failed attempts logged
7. **Account Status Check**: Inactive accounts cannot login
8. **Password Change Security**: Requires current password verification

## Default Roles & Permissions

### Roles
1. **Super Admin** (level 0) - Full system access
2. **Admin** (level 1) - Administrative access
3. **Manager** (level 2) - Product and order management
4. **User** (level 3) - Basic user permissions

### Permission Modules
- Users Management (view, create, update, delete)
- Roles Management (view, create, update, delete)
- Products Management (view, create, update, delete)
- Orders Management (view, update, delete)
- Categories Management (view, manage)
- Coupons Management (view, manage)
- Settings (view, update)

## Testing the Implementation

### 1. Test Registration
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }'
```

### 3. Test Protected Route
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Common Issues

1. **JWT Secret Not Found**
   - Make sure JWT_SECRET is set in .env file
   - Restart the application after adding environment variables

2. **Database Connection Failed**
   - Verify database credentials in .env
   - Ensure MySQL server is running
   - Check if database exists

3. **Migration Errors**
   - Check if tables already exist
   - Verify MySQL user has proper permissions
   - Review error messages for constraint violations

4. **Token Validation Failed**
   - Ensure token hasn't expired
   - Check if JWT_SECRET matches between token generation and validation
   - Verify Bearer token format in Authorization header

## Production Deployment Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set secure database credentials
- [ ] Enable HTTPS
- [ ] Set appropriate CORS policies
- [ ] Configure rate limiting
- [ ] Set up logging and monitoring
- [ ] Enable database backups
- [ ] Review and test all security features
- [ ] Set synchronize: false in TypeORM config
- [ ] Use environment-specific configurations

## Support & Documentation

For more information:
- NestJS Documentation: https://docs.nestjs.com
- TypeORM Documentation: https://typeorm.io
- Passport.js Documentation: http://www.passportjs.org
- JWT Documentation: https://jwt.io

## License

This authentication system is part of the Ruizhu E-commerce Platform.
