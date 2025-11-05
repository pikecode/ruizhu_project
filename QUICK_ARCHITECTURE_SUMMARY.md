# Ruizhu E-Commerce Platform - Quick Architecture Summary

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    RUIZHU E-COMMERCE PLATFORM                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼──────────────┐
                │             │              │
         ┌──────▼────────┐ ┌──▼────────────┐ ┌──▼───────────────┐
         │ Mini Program  │ │ Admin Panel   │ │  API Backend     │
         │ (UniApp/Vue3) │ │ (React)       │ │  (NestJS)        │
         │ H5/WeChat/MP  │ │ Ant Design    │ │  TypeORM/MySQL   │
         └──────┬────────┘ └──┬────────────┘ └──┬───────────────┘
                │             │                  │
                └─────────────┼──────────────────┘
                              │
                    ┌─────────▼────────┐
                    │ REST API (v1)    │
                    │ JWT Auth         │
                    │ 100+ Endpoints   │
                    └─────────┬────────┘
                              │
                ┌─────────────┼─────────────────┐
                │             │                 │
        ┌───────▼────────┐ ┌──▼──────────────┐ ┌──▼────────────┐
        │ MySQL Database │ │ Tencent COS    │ │ WeChat Pay    │
        │ (Tencent CDB)  │ │ (Media Storage)│ │ (Payment API) │
        │ 15+ Tables     │ │ Custom Domain  │ │ Integration   │
        └────────────────┘ └────────────────┘ └───────────────┘
```

## Technology Stack at a Glance

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| **Backend Framework** | NestJS | 11.0.1 | REST API, Business Logic |
| **Language** | TypeScript | 5.7.3 | Type Safety |
| **Database ORM** | TypeORM | 0.3.21 | Database Operations |
| **Database** | MySQL | 5.7+ | Data Storage (Tencent CDB) |
| **Authentication** | JWT + Passport.js | Latest | User Authentication |
| **Frontend (Mini)** | UniApp/Vue 3 | 3.0.0-alpha | Multi-Platform Frontend |
| **Frontend (Admin)** | React | 18.2.0 | Admin Dashboard |
| **State Mgmt (Admin)** | Zustand | 4.4.7 | Global State |
| **UI Components (Admin)** | Ant Design | 5.11.5 | Rich UI Library |
| **Cloud Storage** | Tencent COS SDK | 2.15.4 | File Storage |
| **Payment** | WeChat API v3 | Latest | Payment Processing |
| **Testing** | Jest | 30.0.0 | Unit & Integration Tests |
| **API Docs** | Swagger/OpenAPI | 11.2.1 | Auto Documentation |

## Project Structure (High-Level)

```
nestapi/               (Backend - 17,848 LoC)
├── auth/              Authentication module (JWT)
├── modules/           18 business modules
│   ├── products/      CRUD, search, filtering
│   ├── cart/          Shopping cart logic
│   ├── orders/        Order management
│   ├── wechat/        Payment & notifications
│   ├── banners/       Promotional content
│   ├── collections/   Product collections
│   └── ... 12 more
├── entities/          15 database entities
└── database/          Config, migrations

miniprogram/           (Frontend - Multi-platform)
├── pages/             22 page components
├── components/        Reusable UI components
├── services/          API integration layer
└── types/             TypeScript definitions

admin/                 (Admin Dashboard)
├── pages/             17 management pages
├── components/        Reusable components
├── services/          API clients
└── store/             Zustand state stores
```

## Core Features

### E-Commerce (6 major subsystems)
- **Product Management**: CRUD, search, filtering, hot products
- **Shopping Cart**: Add/remove items, price snapshots, checkout
- **Orders**: Placement, tracking, status updates, refunds
- **Payments**: WeChat Pay integration with callback verification
- **Inventory**: Stock tracking, status management
- **User System**: Phone/WeChat login, profiles, addresses

### Content Management (3 subsystems)
- **Collections**: Manual curation + dynamic array-based system
- **Banners**: Promotional content for multiple pages
- **News**: Blog/article publishing system

### Advanced Features
- **VIP/Membership**: Exclusive products and pricing
- **Consultations**: Product inquiry workflow
- **Wishlists**: Save favorites
- **Admin RBAC**: Role-based access control
- **Multi-Platform**: Mini program runs on WeChat, H5, Alipay, etc.

## API Design

### Authentication
```
Login → JWT Token (24h) → LocalStorage → 
Authorization: Bearer {token} → JWT Guard → Protected Route
```

### Endpoints Summary
- **Auth**: 7+ endpoints (login, register, profile, etc.)
- **Products**: 15+ endpoints (list, search, hot, by category)
- **Cart**: 6+ endpoints (add, remove, checkout)
- **Orders**: 8+ endpoints (create, list, track, refund)
- **Collections**: 12+ endpoints (list, create, items management)
- **WeChat**: 6+ endpoints (create order, callback, refund)
- **Banners**: 8+ endpoints (CRUD operations)
- **Users**: 10+ endpoints (consumer & admin management)
- **Other**: Addresses, wishlists, consultations, news, categories
- **Total**: 100+ REST endpoints

### Documentation
- Auto-generated Swagger/OpenAPI at `/docs`
- Full API specification available
- Request/Response examples included

## Database Design

### Entity Relationships
```
User
├── Orders (1:N)
├── CartItems (1:N)
├── Addresses (1:N)
├── Wishlists (1:N)
└── Consultations (1:N)

Product
├── Category (N:1)
├── CartItems (1:N)
├── Collections (N:N)
├── ArrayCollectionItems (N:N)
└── WechatPayments (1:N via Order)

Order
├── User (N:1)
├── Address (N:1)
├── WechatPayment (1:1)
└── Items (1:N via CartItems)

Collection
├── Products (N:N)
└── ArrayCollectionItems (1:N)
```

### Key Tables
1. **users** - Consumer accounts
2. **products** - Product catalog with stock/pricing
3. **categories** - Hierarchical product categories
4. **cart_items** - Shopping cart with price snapshot
5. **orders** - Customer orders with full lifecycle
6. **user_addresses** - Shipping addresses
7. **collections** - Manual product collections
8. **array_collections** - Dynamic array-based collections
9. **banners** - Promotional content
10. **wechat_payments** - Payment records & status
11. **wechat_notifications** - Notification delivery logs
12. Plus: roles, permissions, news, consultations, wishlists

## Deployment Architecture

### Local Development
```bash
npm install:all        # Install all dependencies
npm start             # Start all services concurrently

# Or separately:
Terminal 1: cd nestapi && npm run start:dev (port 3000)
Terminal 2: cd miniprogram && npm run dev:h5 (port 5173)
Terminal 3: cd admin && npm run dev (port 5174)
```

### Production
- **Backend**: NestJS + PM2 process management
- **Frontend (Mini)**: Pre-built static files
- **Frontend (Admin)**: Vite SPA with CDN
- **Database**: Tencent Cloud CDB MySQL
- **Storage**: Tencent COS with custom domain
- **Domain**: yunjie.online

### Configuration Files
```
.env files:
├── nestapi/.env          Database, JWT, WeChat, COS configs
├── admin/.env            API URL, app name
└── miniprogram/.env      (Production API URL)
```

## Security Architecture

### Authentication Layer
- JWT with HS256 signing
- 24-hour token expiry
- Refresh token mechanism
- BCryptjs password hashing
- Multiple login methods (phone, WeChat, username)

### Payment Security
- WeChat API v3 (latest standard)
- Signature verification on callbacks
- Notification logging for audit trail
- Order status verification

### Data Protection
- Unique constraints on phone, email, username
- Soft deletes for audit trails
- Timestamp tracking (created_at, updated_at)
- CORS protection
- Input validation with class-validator

### Cloud Security
- Tencent COS with separate API credentials
- Custom domain masking direct URLs
- Backend-controlled file access

## Performance Optimization

### Database Level
- Composite indexes on frequently queried columns
- Enum types for status fields
- Relationships optimized for common queries
- Connection pooling via TypeORM

### Application Level
- Service layer caching
- Price snapshots (prevent recalculation)
- Pagination on list endpoints
- Request validation early in pipeline
- Global exception handling (no stack traces in production)

### Frontend Level
- Lazy loading in admin routes
- Zustand lightweight state management
- Axios request/response interceptors
- Token auto-refresh on 401

## Development Workflow

### Adding a New Feature
1. **Create Database Layer**
   - Define entity in `src/entities`
   - Create migration if needed
   - Update relationships

2. **Create Service Layer**
   - Create service in `src/modules/feature/services`
   - Implement business logic
   - Add error handling

3. **Create API Layer**
   - Create controller in `src/modules/feature/controllers`
   - Define DTOs for validation
   - Map routes to service methods

4. **Create Frontend Integration**
   - Create API service in `services/feature.ts`
   - Use in page components
   - Add error handling and loading states

5. **Testing & Documentation**
   - Write unit tests
   - Update Swagger decorators
   - Document in README

## Monitoring & Maintenance

### Health Checks
- GET / returns HTML status page
- GET /docs shows API documentation
- Database migrations track schema changes

### Logging
- Console logging in development
- Winston/Pino recommended for production
- Request/response logging available
- Payment transaction logging

### Testing
- Jest framework configured
- Test specs for modules available
- Coverage reporting

## Recent Improvements

1. **Cache Management**: Clear temporal caches post-payment
2. **Order Data Sync**: Fetch fresh data from backend after payment
3. **Status Verification**: Automatic order status updates
4. **Payment Validation**: Enhanced logging and verification

## File Paths Reference

```
/Users/peakom/work/ruizhu_project/
├── nestapi/src/           Backend source code
├── miniprogram/src/       Mini program source code
├── admin/src/             Admin dashboard source code
├── scripts/               Startup and setup scripts
├── DATABASE_SCHEMA_DESIGN.md
├── README.md              Main documentation
└── PROJECT_ARCHITECTURE_ANALYSIS.md (this detailed analysis)
```

## Next Steps for Development

1. **Understanding a Module**:
   - Start with entity definition
   - Review service methods
   - Check controller endpoints
   - Trace frontend integration

2. **Adding a Feature**:
   - Follow the workflow above
   - Use existing modules as templates
   - Maintain consistent patterns

3. **Debugging Issues**:
   - Check NestJS logs (port 3000)
   - Verify API responses in Swagger UI
   - Check browser console for frontend errors
   - Review database with MySQL client

4. **Performance Tuning**:
   - Review database queries in logs
   - Add caching where beneficial
   - Profile endpoints with slow queries
   - Optimize N+1 queries with relationships

## Quick Reference

| Need | Location | Command |
|------|----------|---------|
| Start all | Project root | `npm start` |
| Start backend | nestapi/ | `npm run start:dev` |
| Start mini program | miniprogram/ | `npm run dev:h5` |
| Start admin | admin/ | `npm run dev` |
| API Docs | http://localhost:3000/docs | Browser |
| Build backend | nestapi/ | `npm run build` |
| Run tests | any project | `npm test` |
| Format code | any project | `npm run format` |
| Lint code | any project | `npm run lint` |

---

**Last Updated**: November 5, 2025  
**Version**: 1.0.0  
**Status**: Production-Ready
