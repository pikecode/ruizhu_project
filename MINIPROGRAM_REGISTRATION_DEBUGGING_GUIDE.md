# 微信小程序注册功能调试指南

## 问题症状
- 用户在小程序中点击注册后，显示"注册成功"提示
- 但在 MySQL 数据库中未找到新注册的用户数据
- 需要确认注册请求是否真实到达后端

## 调试步骤（按顺序执行）

---

## 第一步：验证后端服务是否正常运行

### 1.1 检查后端进程状态

```bash
# 使用 npm 开发模式
cd /Users/peak/work/pikecode/ruizhu_project/nestapi
npm run start:dev

# 或使用生产构建
npm run build
npm run start
```

**预期输出**：
```
[Nest] 12:34:56  - 10/27/2025, 12:34:56 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12:34:57  - 10/27/2025, 12:34:57 PM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12:34:57  - 10/27/2025, 12:34:57 PM     LOG [RoutesResolver] AuthController {/api/v1/auth}: true
[Nest] 12:34:57  - 10/27/2025, 12:34:57 PM     LOG [NestApplication] Nest application successfully started
```

### 1.2 测试后端健康检查端点

```bash
# 在另一个终端运行
curl -v http://localhost:8888/api/v1/auth/me
```

**预期结果**：
- 如果未登录应该返回 401 Unauthorized
- 如果返回无法连接，说明后端没有运行

---

## 第二步：监控微信小程序 HTTP 请求

### 2.1 使用微信开发者工具的网络调试工具

1. 打开微信开发者工具
2. 选择 **Debugger** 标签页
3. 点击 **Network** 标签（或类似的网络调试选项）
4. 在小程序中进行注册操作
5. 查看是否有 POST 请求到 `http://localhost:8888/api/v1/auth/register`

### 2.2 检查 HTTP 请求详情

**查看内容**：
- **Request Headers**：
  - 是否包含 `Content-Type: application/json`
  - Authorization Bearer Token（如果需要）

- **Request Body**：
  ```json
  {
    "username": "testuser123",
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- **Response Status**：
  - 201 (Created) = 注册成功
  - 409 (Conflict) = 用户名或邮箱已存在
  - 400 (Bad Request) = 请求参数错误
  - 500 (Server Error) = 服务器错误

- **Response Body**：
  ```json
  {
    "accessToken": "eyJhbGc...",
    "refreshToken": "a1b2c3d4...",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "username": "testuser123",
      "email": "test@example.com"
    }
  }
  ```

### 2.3 如果请求没有发送

检查 `miniprogram/src/services/api.ts` 中的 BASE_URL 配置：

```typescript
const BASE_URL = 'http://localhost:8888/api/v1'

// 验证这个地址是否正确：
// - localhost:8888 必须与后端运行的地址一致
// - 如果后端运行在其他端口，需要修改这里
```

---

## 第三步：在后端添加日志记录（帮助调试）

### 3.1 修改 auth.service.ts 添加调试日志

打开 `nestapi/src/auth/auth.service.ts`，在 register 方法中添加日志：

```typescript
async register(
  registerDto: AuthRegisterDto,
  ipAddress?: string,
  userAgent?: string,
): Promise<AuthResponseDto> {
  console.log('📝 开始处理注册请求:', {
    username: registerDto.username,
    email: registerDto.email,
    ipAddress,
  });

  // 检查用户名是否存在
  const existingUserByUsername = await this.usersService.findByUsername(
    registerDto.username,
  );
  if (existingUserByUsername) {
    console.log('❌ 用户名已存在:', registerDto.username);
    throw new ConflictException('Username already exists');
  }

  // 检查邮箱是否存在
  const existingUserByEmail = await this.usersService.findByEmail(
    registerDto.email,
  );
  if (existingUserByEmail) {
    console.log('❌ 邮箱已存在:', registerDto.email);
    throw new ConflictException('Email already exists');
  }

  // 哈希密码
  console.log('🔐 开始哈希密码...');
  const hashedPassword = await bcrypt.hash(registerDto.password, 12);

  // 创建用户
  console.log('👤 开始创建用户...');
  const user = await this.usersService.create({
    ...registerDto,
    password: hashedPassword,
  });
  console.log('✅ 用户创建成功:', { id: user.id, username: user.username, email: user.email });

  // 生成 Token
  console.log('🔑 开始生成认证令牌...');
  const authResponse = await this.generateAuthResponse(user, ipAddress, userAgent);
  console.log('✅ 认证响应生成成功');

  return authResponse;
}
```

### 3.2 修改 users.service.ts 添加日志

打开 `nestapi/src/users/users.service.ts`：

```typescript
async create(createUserDto: CreateUserDto): Promise<User> {
  console.log('💾 开始保存用户到数据库:', { username: createUserDto.username });

  try {
    const user = this.usersRepository.create(createUserDto);
    console.log('📝 实体已创建');

    const savedUser = await this.usersRepository.save(user);
    console.log('✅ 用户已保存到数据库, ID:', savedUser.id);

    const result = await this.findOne(savedUser.id);
    console.log('✅ 用户详情查询完成');

    return result;
  } catch (error) {
    console.error('❌ 保存用户失败:', error.message, error);
    throw error;
  }
}
```

---

## 第四步：直接查询数据库

### 4.1 使用 MySQL 命令行工具

```bash
# 连接到 MySQL
mysql -h localhost -u root -p

# 选择数据库
USE ruizhu;

# 查看 users 表中所有用户
SELECT id, username, email, createdAt, updatedAt FROM users ORDER BY createdAt DESC;

# 查看最新创建的 5 个用户
SELECT id, username, email, createdAt FROM users ORDER BY createdAt DESC LIMIT 5;

# 查询特定用户
SELECT * FROM users WHERE username = 'testuser123' \G

# 检查表结构
DESCRIBE users;
```

### 4.2 预期结果

如果注册成功，应该看到类似这样的结果：

```
+----+-------------+---------------------+---------------------+---------------------+
| id | username    | email               | createdAt           | updatedAt           |
+----+-------------+---------------------+---------------------+---------------------+
| 1  | testuser123 | test@example.com    | 2025-10-27 12:34:56 | 2025-10-27 12:34:56 |
+----+-------------+---------------------+---------------------+---------------------+
```

---

## 第五步：完整的端到端测试流程

### 5.1 准备测试账户信息

```javascript
// 测试数据
const testAccount = {
  username: `user_${Date.now()}`,  // 使用时间戳确保唯一性
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!'
};
```

### 5.2 测试步骤

1. **启动后端**
   ```bash
   cd nestapi
   npm run start:dev
   # 查看终端日志，确保看到 "Nest application successfully started"
   ```

2. **启动小程序开发者工具**
   - 打开微信开发者工具
   - 导入 miniprogram 目录
   - 点击"编译"

3. **打开网络调试工具**
   - 微信开发者工具 → Debugger → Network

4. **进行注册操作**
   - 点击"没有账号？立即注册"
   - 填入测试账户信息
   - 点击注册按钮

5. **检查网络请求**
   - 确认 POST `/api/v1/auth/register` 请求已发送
   - 查看响应状态码和响应体
   - 如果返回错误，记下错误信息

6. **检查后端日志**
   - 在后端终端中查看是否有上面添加的日志输出
   - 如果没有日志，说明请求没有到达后端

7. **查询数据库**
   ```bash
   mysql -u root -p ruizhu
   SELECT * FROM users WHERE username LIKE 'user_%' ORDER BY createdAt DESC LIMIT 5;
   ```

---

## 常见问题及解决方案

### 问题 1：请求显示 "ERR_CONNECTION_REFUSED"

**原因**：后端服务未运行或地址配置错误

**解决方案**：
```bash
# 确保后端正在运行
cd nestapi
npm run start:dev

# 验证后端监听的端口
lsof -i :8888
```

### 问题 2：返回 409 Conflict "Username already exists"

**原因**：用户名已被使用

**解决方案**：
- 使用时间戳创建唯一用户名：`user_${Date.now()}`
- 或在数据库中删除测试用户重新注册

### 问题 3：返回 400 Bad Request

**原因**：请求参数格式错误

**检查项**：
```typescript
// 检查 api.ts 中的请求格式
api.post('/auth/register', {
  username: string,    // 必需，最少 3 个字符
  email: string,       // 必需，有效邮箱格式
  password: string     // 必需，最少 8 个字符
})
```

### 问题 4：返回 500 Server Error

**原因**：服务器内部错误（通常是数据库相关）

**调试步骤**：
1. 检查后端终端日志（应该有错误信息）
2. 检查 MySQL 数据库连接是否正常
3. 检查 users 表是否存在

```bash
# 验证数据库连接
mysql -h localhost -u root -p -e "SELECT version();"

# 查看表是否存在
mysql -u root -p ruizhu -e "SHOW TABLES;"
```

### 问题 5：请求显示成功，但数据库中没有用户

**原因**：可能是以下几种情况：
1. 数据被保存到了不同的数据库
2. 数据被保存但时间范围内没有查询到
3. 程序有未处理的异常导致回滚

**检查步骤**：
```bash
# 1. 检查所有数据库
mysql -u root -p -e "SHOW DATABASES;"

# 2. 检查 ruizhu 数据库中的 users 表
mysql -u root -p ruizhu -e "SELECT COUNT(*) as user_count FROM users;"

# 3. 查看最新的 10 条记录（无论何时创建）
mysql -u root -p ruizhu -e "SELECT * FROM users LIMIT 10;"

# 4. 检查是否有错误日志表
mysql -u root -p ruizhu -e "SHOW TABLES LIKE '%log%';"
```

---

## 第六步：添加客户端调试日志

### 6.1 修改 miniprogram/src/services/auth.ts

添加更详细的日志：

```typescript
export const authService = {
  async register(username: string, email: string, password: string) {
    console.log('📝 开始注册请求:', { username, email });

    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        username,
        email,
        password,
      });

      console.log('✅ 注册成功响应:', response);

      // 保存到本地存储
      uni.setStorageSync('accessToken', response.accessToken);
      uni.setStorageSync('refreshToken', response.refreshToken);
      uni.setStorageSync('user', JSON.stringify(response.user));
      uni.setStorageSync('loginTime', new Date().getTime());

      console.log('💾 Token 已保存到本地存储');
      return response;
    } catch (error: any) {
      console.error('❌ 注册失败:', error.message);
      throw error;
    }
  },

  async login(username: string, password: string) {
    console.log('🔐 开始登录请求:', { username });

    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        username,
        password,
      });

      console.log('✅ 登录成功响应:', response);

      // 保存到本地存储
      uni.setStorageSync('accessToken', response.accessToken);
      uni.setStorageSync('refreshToken', response.refreshToken);
      uni.setStorageSync('user', JSON.stringify(response.user));
      uni.setStorageSync('loginTime', new Date().getTime());

      console.log('💾 Token 已保存到本地存储');
      return response;
    } catch (error: any) {
      console.error('❌ 登录失败:', error.message);
      throw error;
    }
  }
};
```

### 6.2 修改 miniprogram/src/services/api.ts 添加请求/响应日志

```typescript
export const request = async <T = any>(
  method: string,
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<T> => {
  const token = uni.getStorageSync('accessToken');

  console.log(`🌐 [${method}] ${BASE_URL}${url}`, {
    data,
    hasToken: !!token,
  });

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.header,
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method: method as any,
      data,
      header,
      timeout: options.timeout || 10000,
      success: (res: any) => {
        console.log(`✅ [${method}] ${url} - 状态码: ${res.statusCode}`, {
          response: res.data,
        });

        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data as T)
        } else if (res.statusCode === 401) {
          console.log('⚠️ Token 已过期，清空本地数据');
          uni.removeStorageSync('accessToken')
          uni.removeStorageSync('refreshToken')
          uni.removeStorageSync('user')
          uni.redirectTo({ url: '/pages/auth/login' })
          reject(new Error('登录过期，请重新登录'))
        } else {
          console.error(`❌ [${method}] ${url} - 错误:`, res.data?.message);
          reject(new Error(res.data?.message || '请求失败'))
        }
      },
      fail: (err: any) => {
        console.error(`❌ [${method}] ${url} - 网络错误:`, err.errMsg);
        reject(new Error(err.errMsg || '网络请求失败'))
      },
    })
  })
}
```

---

## 第七步：验证数据库配置

### 7.1 检查 database.module.ts 配置

```bash
cd nestapi
# 查看数据库配置
cat src/database/database.module.ts
```

**验证内容**：
- `type: 'mysql'` ✓
- `host: 'localhost'` (或正确的数据库服务器地址)
- `port: 3306` (标准 MySQL 端口)
- `username: 'root'` (或正确的用户名)
- `database: 'ruizhu'` ✓
- `synchronize: true` (开发环境) ✓

### 7.2 测试数据库连接

```typescript
// 在 main.ts 或其他地方添加测试代码
import { TypeOrmModule } from '@nestjs/typeorm';

// 测试连接
const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'your_password',
  database: 'ruizhu',
});

try {
  await dataSource.initialize();
  console.log('✅ 数据库连接成功');
} catch (error) {
  console.error('❌ 数据库连接失败:', error);
}
```

---

## 调试检查清单

- [ ] 后端服务正在运行（`npm run start:dev`）
- [ ] 小程序开发者工具已打开并编译
- [ ] Network 调试工具已打开
- [ ] 进行了注册操作
- [ ] 确认 HTTP 请求已发送到 `http://localhost:8888/api/v1/auth/register`
- [ ] 响应状态码为 201 (Created)
- [ ] 响应中包含有效的 accessToken 和 refreshToken
- [ ] 后端日志中看到了日志输出
- [ ] 数据库中查询到了新用户
- [ ] 用户表中的字段都有正确的值

---

## 如果还是找不到问题

请收集以下信息并提供：

1. **微信开发者工具中的完整网络请求和响应**
   - 请求 URL、方法、Headers、Body
   - 响应状态码、Headers、Body

2. **后端终端的完整日志输出**
   ```bash
   # 启动后端并保存日志
   npm run start:dev 2>&1 | tee backend.log
   ```

3. **数据库查询结果**
   ```bash
   # 导出 users 表数据
   mysql -u root -p ruizhu -e "SELECT * FROM users" > users.sql
   ```

4. **api.ts 中的 BASE_URL 配置**
   ```typescript
   const BASE_URL = 'http://localhost:8888/api/v1'
   ```

---

## 总结

完整的数据流应该是：

```
微信小程序 (Register 页面)
    ↓
小程序 API 服务层 (api.ts)
    ↓
HTTP POST /auth/register
    ↓
后端 (localhost:8888)
    ↓
AuthController → AuthService → UsersService
    ↓
MySQL 数据库 (ruizhu.users 表)
```

按照上面的步骤逐个检查每个环节，就能找到问题所在。

