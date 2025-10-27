export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    email: string;
    realName?: string;
    phone?: string;
    avatar?: string;
    role?: {
      id: number;
      name: string;
      code: string;
      permissions: Array<{
        id: number;
        name: string;
        code: string;
      }>;
    };
  };
}
