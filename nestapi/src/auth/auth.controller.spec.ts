import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    wechatPhoneLogin: jest.fn(),
    wechatOpenIdLogin: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/wechat/phone-login', () => {
    it('应该成功登录并返回token', async () => {
      const loginDto = {
        openId: 'test_open_id',
        encryptedPhone: 'encrypted_data',
        iv: 'iv_data',
        sessionKey: 'session_key',
      };

      const expectedResponse = {
        access_token: 'test_token_12345',
        user: {
          id: 1,
          phone: '13800138000',
          openId: 'test_open_id',
          nickname: '测试用户',
          isPhoneAuthorized: true,
        },
      };

      mockAuthService.wechatPhoneLogin.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/wechat/phone-login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockAuthService.wechatPhoneLogin).toHaveBeenCalledWith(
        loginDto.openId,
        loginDto.encryptedPhone,
        loginDto.iv,
        loginDto.sessionKey,
      );
    });

    it('应该在参数缺失时返回400', async () => {
      const invalidDto = {
        openId: 'test_open_id',
        // 缺少encryptedPhone, iv, sessionKey
      };

      await request(app.getHttpServer())
        .post('/auth/wechat/phone-login')
        .send(invalidDto)
        .expect(400);
    });

    it('应该处理解密失败的情况', async () => {
      const loginDto = {
        openId: 'test_open_id',
        encryptedPhone: 'invalid_data',
        iv: 'iv_data',
        sessionKey: 'session_key',
      };

      mockAuthService.wechatPhoneLogin.mockRejectedValue(
        new Error('手机号解密失败'),
      );

      await request(app.getHttpServer())
        .post('/auth/wechat/phone-login')
        .send(loginDto)
        .expect(500);
    });
  });

  describe('POST /auth/wechat/open-id-login', () => {
    it('应该成功进行openId登录', async () => {
      const loginDto = {
        openId: 'new_user_open_id',
        nickName: '微信用户',
        avatarUrl: 'https://example.com/avatar.jpg',
        gender: 1,
      };

      const expectedResponse = {
        access_token: 'new_token_12345',
        user: {
          id: 2,
          phone: null,
          openId: 'new_user_open_id',
          nickname: '微信用户',
          avatarUrl: 'https://example.com/avatar.jpg',
          gender: 'male',
        },
      };

      mockAuthService.wechatOpenIdLogin.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/wechat/open-id-login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockAuthService.wechatOpenIdLogin).toHaveBeenCalledWith(
        loginDto.openId,
        expect.objectContaining({
          nickName: loginDto.nickName,
          avatarUrl: loginDto.avatarUrl,
          gender: loginDto.gender,
        }),
      );
    });

    it('应该支持仅使用openId登录', async () => {
      const loginDto = {
        openId: 'simple_open_id',
      };

      const expectedResponse = {
        access_token: 'simple_token',
        user: {
          id: 3,
          phone: null,
          openId: 'simple_open_id',
          nickname: null,
        },
      };

      mockAuthService.wechatOpenIdLogin.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/wechat/open-id-login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
    });

    it('应该在openId缺失时返回400', async () => {
      const invalidDto = {
        nickName: '用户名',
        // 缺少openId
      };

      await request(app.getHttpServer())
        .post('/auth/wechat/open-id-login')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('应该成功进行用户名密码登录', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'testpass123',
      };

      const expectedResponse = {
        access_token: 'jwt_token_12345',
        user: {
          id: 1,
          username: 'testuser',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
    });

    it('应该在密码错误时返回401', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'wrongpass',
      };

      mockAuthService.login.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(500);
    });
  });

  describe('POST /auth/register', () => {
    it('应该成功注册新用户', async () => {
      const registerDto = {
        username: 'newuser',
        password: 'newpass123',
        email: 'newuser@example.com',
      };

      const expectedResponse = {
        id: 4,
        username: 'newuser',
        email: 'newuser@example.com',
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('应该在用户已存在时返回409', async () => {
      const registerDto = {
        username: 'existinguser',
        password: 'pass123',
        email: 'existing@example.com',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('User already exists'),
      );

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(500);
    });
  });
});
