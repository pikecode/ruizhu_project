# W1 用户认证系统 - 完整开发指南

**周期**: 2025-10-27 ~ 2025-11-02
**模块**: 用户认证系统 (Priority 1️⃣)
**状态**: 🚀 开发中

---

## 📋 任务清单

### 第一步：数据库设计 ✅ 已完成
- [x] 设计用户表 (users) ✅ 2025-10-27
- [x] 设计用户角色表 (user_roles) ✅ 2025-10-27
- [x] 设计权限表 (permissions) ✅ 2025-10-27
- [x] 创建初始化 SQL 脚本 ✅ 2025-10-27

**文件**: `nestapi/db/01-auth-system.sql`

**数据库表设计总览**:
```
users 表 (用户)
├── id, username, email, phone
├── password (加密), nickname, avatar_url
├── status, is_email_verified, is_phone_verified
├── user_type (customer/seller/admin)
├── last_login_at, last_login_ip, login_count
└── created_at, updated_at, deleted_at (软删除)

roles 表 (角色)
├── id, name (admin/seller/customer), description
├── status
└── created_at, updated_at

permissions 表 (权限)
├── id, name, resource, action
├── status
└── created_at, updated_at

关联表:
├── user_roles (用户-角色)
├── role_permissions (角色-权限)
├── refresh_tokens (刷新令牌)
└── login_logs (登录日志)
```

---

### 第二步：NestJS API 开发 ⏳ 进行中

#### 2.1 创建 TypeORM Entities

文件位置: `nestapi/src/users/entities/`

需要创建的 Entity 文件:
```
user.entity.ts
├── User (users 表)
├── Role (roles 表)
├── Permission (permissions 表)
├── RefreshToken (refresh_tokens 表)
└── LoginLog (login_logs 表)
```

**User Entity 示例**:
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // 加密存储

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({ name: 'user_roles' })
  roles: Role[];

  // ... 其他字段
}
```

#### 2.2 创建 DTO (Data Transfer Objects)

文件位置: `nestapi/src/users/dtos/`

需要创建的 DTO 文件:
```
auth-register.dto.ts        # 注册请求
auth-login.dto.ts           # 登录请求
auth-change-password.dto.ts # 修改密码请求
update-profile.dto.ts       # 更新个人信息
refresh-token.dto.ts        # 刷新令牌请求
```

**示例 DTO**:
```typescript
// auth-register.dto.ts
export class AuthRegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

// auth-login.dto.ts
export class AuthLoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
```

#### 2.3 创建 Auth Service

文件位置: `nestapi/src/auth/services/auth.service.ts`

核心方法:
```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 用户注册
  async register(registerDto: AuthRegisterDto) {
    // 1. 验证用户名/邮箱是否已存在
    // 2. 加密密码 (bcrypt)
    // 3. 创建用户
    // 4. 返回用户信息 (不包含密码)
  }

  // 用户登录
  async login(loginDto: AuthLoginDto) {
    // 1. 查找用户
    // 2. 验证密码
    // 3. 生成 JWT 和 Refresh Token
    // 4. 记录登录日志
    // 5. 返回令牌
  }

  // 刷新令牌
  async refreshToken(token: string) {
    // 1. 验证 Refresh Token
    // 2. 生成新的 Access Token
    // 3. 返回新令牌
  }

  // 验证令牌
  async validateToken(token: string) {
    // 1. 解析 JWT
    // 2. 验证过期时间
    // 3. 返回用户信息
  }

  // 修改密码
  async changePassword(userId: number, dto: ChangePasswordDto) {
    // 1. 验证旧密码
    // 2. 加密新密码
    // 3. 更新用户密码
    // 4. 撤销所有 Refresh Token
  }
}
```

#### 2.4 创建 Auth Controller

文件位置: `nestapi/src/auth/controllers/auth.controller.ts`

API 端点:
```typescript
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /api/v1/auth/register
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  async register(@Body() registerDto: AuthRegisterDto) {
    return this.authService.register(registerDto);
  }

  // POST /api/v1/auth/login
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() loginDto: AuthLoginDto) {
    return this.authService.login(loginDto);
  }

  // GET /api/v1/auth/me
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取当前用户信息' })
  async getCurrentUser(@Request() req) {
    return req.user;
  }

  // PUT /api/v1/auth/profile
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新个人信息' })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  // POST /api/v1/auth/change-password
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  // POST /api/v1/auth/refresh-token
  @Post('refresh-token')
  @ApiOperation({ summary: '刷新令牌' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  // POST /api/v1/auth/logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '登出' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}
```

#### 2.5 创建 JWT Strategy

文件位置: `nestapi/src/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.id, username: payload.username };
  }
}
```

#### 2.6 创建 Auth Module

文件位置: `nestapi/src/auth/auth.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, RefreshToken, LoginLog]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
```

#### 2.7 更新主 App Module

在 `nestapi/src/app.module.ts` 中导入 AuthModule:

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot(),
    AuthModule, // 添加这一行
    UsersModule,
    // ... 其他模块
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 🔄 API 接口设计 (Swagger)

### 1. 用户注册

**POST** `/api/v1/auth/register`

**请求体**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "13800138000"
}
```

**响应 (201)**:
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "13800138000",
  "avatar_url": null,
  "status": "active",
  "user_type": "customer",
  "created_at": "2025-10-27T10:30:00Z"
}
```

---

### 2. 用户登录

**POST** `/api/v1/auth/login`

**请求体**:
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**响应 (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "avatar_url": null,
    "user_type": "customer"
  },
  "expiresIn": 604800
}
```

---

### 3. 获取当前用户

**GET** `/api/v1/auth/me`

**请求头**:
```
Authorization: Bearer <accessToken>
```

**响应 (200)**:
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "13800138000",
  "avatar_url": null,
  "status": "active",
  "user_type": "customer",
  "last_login_at": "2025-10-27T10:30:00Z",
  "login_count": 5
}
```

---

### 4. 修改密码

**POST** `/api/v1/auth/change-password`

**请求头**:
```
Authorization: Bearer <accessToken>
```

**请求体**:
```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**响应 (200)**:
```json
{
  "message": "密码修改成功"
}
```

---

### 5. 刷新令牌

**POST** `/api/v1/auth/refresh-token`

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应 (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

---

## 🧪 本地测试指南

### 使用 Postman 测试

**1. 注册测试**:
```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPass123"
}
```

**2. 登录测试**:
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "TestPass123"
}
```

**3. 获取当前用户**:
```bash
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer <从登录响应获取的 accessToken>
```

---

## 📦 依赖包检查

在 `nestapi/package.json` 中确保以下包已安装:

```json
{
  "dependencies": {
    "@nestjs/core": "^10.x",
    "@nestjs/common": "^10.x",
    "@nestjs/jwt": "^12.x",
    "@nestjs/passport": "^10.x",
    "passport": "^0.7.x",
    "passport-jwt": "^4.0.x",
    "bcrypt": "^5.1.x",
    "@nestjs/config": "^3.x",
    "typeorm": "^0.3.x"
  }
}
```

**安装缺失的包**:
```bash
npm install @nestjs/jwt passport-jwt bcrypt --save
npm install @types/bcrypt --save-dev
```

---

## ⚡ 快速命令

```bash
# 启动 NestJS 开发服务器
npm run start:dev

# 启动生产服务器
npm run start

# 运行测试
npm run test

# 构建项目
npm run build

# 查看 API 文档 (Swagger)
# http://localhost:3000/api/docs

# 执行数据库初始化脚本
mysql -h localhost -u root -p < nestapi/db/01-auth-system.sql
```

---

## 📊 开发进度检查表

### 数据库 (Database)
- [x] 创建 users 表
- [x] 创建 roles 表
- [x] 创建 permissions 表
- [x] 创建 user_roles 表
- [x] 创建 role_permissions 表
- [x] 创建 refresh_tokens 表
- [x] 创建 login_logs 表
- [ ] 在云数据库中执行 SQL

### NestJS 开发
- [ ] 创建 User Entity
- [ ] 创建 Auth Service
- [ ] 创建 Auth Controller
- [ ] 创建 JWT Strategy
- [ ] 创建 DTO 类
- [ ] 实现注册接口
- [ ] 实现登录接口
- [ ] 实现获取用户接口
- [ ] 实现修改密码接口
- [ ] 实现刷新令牌接口

### 测试与文档
- [ ] Postman API 测试
- [ ] 单元测试编写
- [ ] Swagger 文档更新
- [ ] API 集成测试

---

## 🔗 相关文件

| 文件 | 说明 |
|------|------|
| `nestapi/db/01-auth-system.sql` | 数据库设计脚本 |
| `nestapi/src/users/entities/user.entity.ts` | User Entity |
| `nestapi/src/auth/services/auth.service.ts` | 认证服务 |
| `nestapi/src/auth/controllers/auth.controller.ts` | API 控制器 |
| `nestapi/src/auth/strategies/jwt.strategy.ts` | JWT 策略 |
| `nestapi/src/auth/auth.module.ts` | 认证模块 |

---

## ✅ 验收标准

W1 完成标准:
- [x] 数据库设计完成
- [ ] 所有 6 个 API 接口实现
- [ ] Postman 测试通过
- [ ] Swagger 文档完整
- [ ] 单元测试覆盖率 > 80%
- [ ] 代码提交到 GitHub

---

**下一步**: 实现 NestJS API 接口

**预计完成**: 2025-11-02

**问题跟踪**: 遇到问题请在 DEVELOPMENT_PROGRESS.md 中记录
