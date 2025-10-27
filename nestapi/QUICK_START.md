# Authentication System - Quick Start Guide

## Get Started in 5 Minutes

### Step 1: Run Database Migration (1 minute)
```bash
mysql -u root -p ruizhu < migrations/001_auth_system_setup.sql
```

### Step 2: Update Environment Variables (1 minute)
Check your `.env` file has these settings:
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
DB_NAME=ruizhu
```

### Step 3: Start the Server (1 minute)
```bash
npm run start:dev
```

### Step 4: Test Registration (1 minute)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Step 5: Test Login (1 minute)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }'
```

## ✅ Done!

You now have a working authentication system.

## Next Steps

1. **Read the Full Documentation**: `AUTH_SYSTEM_GUIDE.md`
2. **Test All Endpoints**: Use `AUTH_TESTING.http`
3. **Review Implementation**: Check `AUTH_IMPLEMENTATION_SUMMARY.md`
4. **Integrate with Frontend**: Use the access tokens in your frontend

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | No | Register user |
| `/auth/login` | POST | No | Login user |
| `/auth/me` | GET | Yes | Get user info |
| `/auth/profile` | PUT | Yes | Update profile |
| `/auth/change-password` | POST | Yes | Change password |
| `/auth/refresh-token` | POST | No | Refresh token |
| `/auth/logout` | POST | Yes | Logout |

## Default Admin Credentials

After running the migration, you can create an admin user with:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'
```

Then manually update the role in database:
```sql
UPDATE users SET roleId = 2 WHERE username = 'admin';
```

## Protect Your Routes

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from './auth/jwt.guard';
import { CurrentUser } from './auth/current-user.decorator';

@Get('protected')
@UseGuards(JwtGuard)
getProtected(@CurrentUser() user: any) {
  return { message: 'Protected data', user };
}
```

## Need Help?

- **Complete Documentation**: See `AUTH_SYSTEM_GUIDE.md`
- **Testing Examples**: See `AUTH_TESTING.http`
- **Implementation Details**: See `AUTHENTICATION_SYSTEM_README.md`

---

**Status**: ✅ Production Ready
