# Deployment Architecture - 部署架构

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TENCENT CLOUD DEPLOYMENT                         │
│                     Region: ap-guangzhou                            │
│                   Server: 123.207.14.67                             │
└─────────────────────────────────────────────────────────────────────┘

                              INTERNET
                                │
                                │ HTTP (port 80)
                                ▼
                    ┌───────────────────────────┐
                    │   Nginx Reverse Proxy     │
                    │   (Port 80)               │
                    │   /etc/nginx/conf.d/...  │
                    └───────┬───────┬───────────┘
                            │       │
                  /api/*     │       │    / (root)
                            │       │
                ┌───────────▼─┐   ┌─┴─────────────────────┐
                │             │   │                       │
                │  NestAPI    │   │  Admin Frontend       │
                │  Backend    │   │  (Static Files)       │
                │             │   │                       │
        ┌───────┤             │   │  /opt/ruizhu-app/     │
        │       │ Port 8888   │   │  admin/               │
        │       │ (internal:  │   │                       │
        │       │  3000)      │   │  • index.html         │
        │       │             │   │  • assets/            │
        │       │ PM2 Fork    │   │  • vite.svg           │
        │       │ Mode        │   │                       │
        │       │ PID:679539  │   │  Served by Nginx      │
        │       │             │   │                       │
        │       │ Features:   │   │  Features:            │
        │       │ ✓ TypeORM   │   │  ✓ SPA routing        │
        │       │ ✓ @nestjs   │   │  ✓ Caching (30d)      │
        │       │ ✓ JWT auth  │   │  ✓ Gzip compression   │
        │       │ ✓ COS Upload│   │  ✓ Vue.js app         │
        │       │ ✓ Cron jobs │   │  ✓ Admin dashboard    │
        │       └─────────┬───┘   └─────────────────────┘
        │                 │
        │                 │ SQL queries
        │                 ▼
        │      ┌──────────────────────┐
        │      │  .env.production     │
        │      │  PORT=3000           │
        │      │  NODE_ENV=production │
        │      │  DB_*=config         │
        │      │  COS_*=credentials   │
        │      │  WECHAT_*=config     │
        │      └──────────────────────┘
        │
        └─────────────────┬──────────────────────────────────┐
                          │                                  │
                          │ (Tencent Cloud)                 │
                          ▼                                  ▼
        ┌──────────────────────────────┐    ┌──────────────────────────┐
        │   CDB (Cloud Database)       │    │  COS (Object Storage)    │
        │   MySQL 5.7+                 │    │  (File Upload)           │
        │                              │    │                          │
        │ Host: gz-cdb-qtjza6az        │    │ Bucket:                  │
        │ Port: 27226                  │    │ ruizhu-1256655507        │
        │ Database: mydb               │    │ Region: ap-guangzhou     │
        │ User: root                   │    │                          │
        │ Tables:                      │    │ Use Cases:               │
        │  • users                     │    │ • Product images         │
        │  • products                  │    │ • User avatar            │
        │  • orders                    │    │ • File uploads           │
        │  • cart_items                │    │ • Backups                │
        │  • payments                  │    └──────────────────────────┘
        │  • addresses                 │
        │  • categories                │
        │  • (others)                  │
        │                              │
        │ Connected from: NestAPI      │
        │ Connection string:           │
        │ mysql://root:***@...         │
        └──────────────────────────────┘
```

---

## Request Flow Examples

### Example 1: User Accessing Admin Dashboard

```
User Browser                Nginx              Admin Frontend
    │                         │                    │
    ├─→ GET http://123.207.14.67/
    │                         │
    │                    Location: /
    │                    Serves static file
    │                         │
    │                    /opt/ruizhu-app/admin/index.html
    │                    ◄───────
    ├─────────────────────────────────────────────────◄─
    │                         │
    [Browser renders index.html]
    │                         │
    │                    Loads assets/ (JS, CSS)
    │                         │
    ├─→ GET /assets/app.abc123.js
    │                         │
    │                    Cached response (30 days)
    │                         ├─→ /opt/ruizhu-app/admin/assets/
    │                    ◄────────────────────────────◄─
    │
    [Admin dashboard loaded in browser]
```

---

### Example 2: API Request (Create Order)

```
Mini Program          Nginx            NestAPI Backend      Database
    │                  │                    │                 │
    ├─→ POST /api/orders
    │   (with JWT token)
    │                  │
    │            Location: /api/
    │            Proxy to: 127.0.0.1:8888
    │                  │                    │
    │                  ├──→ POST /orders
    │                  │   (with headers)
    │                  │                    │
    │                  │              [Validate JWT]
    │                  │              [Process request]
    │                  │              [Deduct inventory]
    │                  │              [Save order]
    │                  │                    │
    │                  │                    ├─→ INSERT INTO orders
    │                  │                    ├─→ UPDATE products
    │                  │                    │   (stockQuantity--)
    │                  │                    │   (version++)
    │                  │              ◄─────┤
    │                  │    JSON response
    │                  │    {orderId, status, ...}
    │                  ◄────
    │  Order created
    │
    [Mini program stores orderId, initiates payment]
```

---

### Example 3: Payment Callback Flow

```
WeChat Server         Nginx            NestAPI Backend      Database
    │                  │                    │                 │
    ├─→ POST /api/wechat/payment/callback
    │   (signed payload)
    │                  │
    │            Routes to backend
    │                  │
    │                  ├──→ Payment Callback Handler
    │                  │    [Verify signature]
    │                  │    [Check amount matches]
    │                  │    [Mark order as paid]
    │                  │    [Apply VIP discount if applicable]
    │                  │                    │
    │                  │                    ├─→ UPDATE orders
    │                  │                    │   SET status='paid'
    │                  │                    │   WHERE orderNo=XXX
    │                  │                    │
    │                  │                    ├─→ UPDATE users
    │                  │                    │   SET discount=0.8
    │                  │                    │   WHERE id=YYY
    │                  │              ◄─────┤
    │                  │    200 OK (success response)
    │                  ◄────
    │  Payment confirmed
    │
    [Order status updated in database]
```

---

## Process Management Details

### PM2 Configuration

**File**: `/opt/ruizhu-app/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'ruizhu-backend',           // Process name
      script: './dist/main.js',         // Entry point
      cwd: '/opt/ruizhu-app/nestapi-dist',  // Working directory
      
      instances: 1,                     // Number of instances
      exec_mode: 'fork',                // Single fork (not cluster)
      
      env: {                            // Environment variables
        NODE_ENV: 'production',
        PORT: 3000,                     // NestJS listens on this
      },
      
      max_memory_restart: '512M',       // Restart if memory exceeds 512MB
      autorestart: true,                // Auto-restart on crash
      watch: false,                     // Don't watch files (prevent restart loop)
      
      listen_timeout: 10000,            // 10s to start listening
      kill_timeout: 5000,               // 5s to shutdown gracefully
      
      // Logging
      error_file: '/var/log/pm2/ruizhu-backend-error.log',
      out_file: '/var/log/pm2/ruizhu-backend-out.log',
    },
  ],
};
```

### Process Lifecycle

```
[System Startup]
       │
       ▼
[PM2 loads ecosystem.config.js]
       │
       ▼
[PM2 starts NestAPI process]
    (PID: 679539)
       │
       ▼
[NestJS app loads]
 • Initialize modules
 • Connect to database
 • Register routes
 • Start scheduled tasks
       │
       ▼
[Listening on port 3000]
 (Nginx proxies to 8888)
       │
       ▼
[Ready for requests]

[During Runtime]
 • Monitor memory usage
 • If exceeds 512MB → Auto-restart
 • If crashes → Auto-restart
 • Logs written to files
```

---

## Environment-Specific Configuration

### Local Development

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ruizhu_dev
# ... (local paths and credentials)
```

**Startup**: `npm run start:dev` (with hot reload)

### Production (Tencent Cloud)

```
PORT=3000                    (internal)
NODE_ENV=production
DB_HOST=gz-cdb-qtjza6az.sql.tencentcdb.com
DB_PORT=27226               (cloud database)
DB_NAME=mydb
COS_SECRET_ID=AKID...       (cloud storage)
WECHAT_APP_ID=...           (payment)
# ... (Tencent Cloud resources)
```

**Startup**: `pm2 start ecosystem.config.js` (via PM2)

---

## Nginx Port Mapping

```
External Traffic
    ↓
Nginx (Port 80)
    │
    ├─ /api/v1/*  →  Backend (127.0.0.1:8888)
    │               └─ PM2 runs NestAPI on 3000
    │                  └─ Proxied as 8888 in setup script
    │
    └─ / (root)   →  Admin Frontend (/opt/ruizhu-app/admin/)
                      └─ Static file serving
```

---

## File System Structure

```
/opt/ruizhu-app/
│
├── nestapi-dist/                    ← CURRENT (RUNNING)
│   ├── dist/                        ← Compiled code
│   │   ├── main.js                  ← Entry point (PM2 executes)
│   │   ├── modules/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── users/
│   │   │   ├── wechat/
│   │   │   └── ...
│   │   └── entities/
│   │
│   ├── package.json                 ← Dependencies manifest
│   ├── node_modules/                ← All dependencies (npm install)
│   │   ├── @nestjs/
│   │   ├── typeorm/
│   │   ├── mysql2/
│   │   └── (1000+ packages)
│   │
│   └── [other files]
│
├── nestapi-dist-old/                ← Previous version (rollback)
├── nestapi-dist-old-wrong/          ← Earlier backup
│
├── admin/                           ← Admin Frontend (STATIC)
│   ├── index.html                   ← SPA entry
│   ├── vite.svg
│   ├── assets/
│   │   ├── index.[hash].js          ← App JS
│   │   ├── index.[hash].css         ← App CSS
│   │   ├── vendor.[hash].js         ← Dependencies
│   │   └── [images, fonts]
│   │
│   └── [compiled artifacts]
│
├── ecosystem.config.js              ← PM2 configuration
├── .env.production                  ← Environment variables
├── server-setup.sh                  ← Initial setup script
├── database-init-corrected.sql      ← Database init script
│
├── dist.tar.gz                      ← Backup archive
└── [other files]

/etc/nginx/conf.d/
├── ruizhu.conf                      ← Nginx configuration

/var/log/
├── pm2/
│   ├── ruizhu-backend-out.log       ← App output logs
│   └── ruizhu-backend-error.log     ← App error logs
└── nginx/
    ├── ruizhu-access.log            ← HTTP access logs
    └── ruizhu-error.log             ← Nginx errors
```

---

## Security Considerations

### Implemented Security Features

✅ **JWT Authentication**
   - Tokens required for most endpoints
   - Expired tokens rejected
   - Payload validated on each request

✅ **Nginx Security Headers**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection enabled
   - Referrer-Policy configured

✅ **Database Credentials**
   - Stored in .env.production (not in code)
   - Database on Tencent Cloud (not exposed)
   - Connection over standard MySQL port

✅ **Payment Security**
   - WeChat signature verification
   - Amount validation before marking paid
   - Transaction protection for critical operations

✅ **File Upload Security**
   - Files stored in Tencent COS (not on server)
   - Size limit enforced (50MB)
   - Type validation available

### Recommendations for Production

- [ ] Use HTTPS (configure SSL certificate with Nginx)
- [ ] Change default database password
- [ ] Rotate JWT_SECRET regularly
- [ ] Set up firewall rules (whitelist trusted IPs)
- [ ] Enable database backups
- [ ] Monitor logs regularly
- [ ] Set up alerting for errors/crashes
- [ ] Use strong admin credentials

---

## Performance Characteristics

### NestAPI Backend

```
Memory Usage:       ~112 MB (at rest)
CPU Usage:          < 1% (idle)
Restart Threshold:  512 MB (auto-restart if exceeded)
Response Time:      ~50-200ms (depends on query)
Concurrent Users:   Tested with 100+ concurrent requests
Database Conn Pool: TypeORM default settings
```

### Admin Frontend

```
Bundle Size:        ~150-300 KB (after compression)
Cache Duration:     30 days for static assets
Load Time:          ~1-2s (depends on network)
SPA Framework:      Vue.js 3
Build Tool:         Vite (fast HMR in dev)
```

### Nginx Reverse Proxy

```
Connections:        Unlimited (configurable)
Keep-Alive:         Enabled (64 connections per upstream)
Gzip Compression:   Enabled (6 compression level)
Max Upload Size:    50 MB
Timeout:            60 seconds (connect/read/send)
```

---

## Monitoring & Alerts

### What to Monitor

1. **Backend Process**
   - Memory usage (should stay < 500 MB)
   - Restart count (should be 0)
   - Response time (should be < 500ms)
   - Error rate (should be < 1%)

2. **Database**
   - Connection count
   - Query performance
   - Data disk usage
   - Backup status

3. **Nginx**
   - Error logs (5xx errors)
   - Access patterns
   - Cache hit rate
   - Upstream health

4. **Application**
   - Scheduled job execution
   - Payment processing success rate
   - Order creation rate
   - Inventory accuracy

### Suggested Alert Thresholds

```
Memory > 400 MB               → Warning
Memory > 450 MB               → Alert (restart triggered)
Error logs > 10/min           → Warning
API response > 1s             → Warning
Crash/Restart                 → Critical alert
Database disconnected         → Critical alert
Nginx returning 5xx > 5/min   → Warning
```

---

## Deployment Checklist

Before deploying new code:

- [ ] Code committed to git
- [ ] All tests passing locally
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Database migration script tested (if needed)
- [ ] Environment variables documented

During deployment:

- [ ] Backup current version
- [ ] Upload new code to server
- [ ] Restart PM2 process
- [ ] Monitor logs for errors
- [ ] Test API endpoints
- [ ] Test admin dashboard
- [ ] Verify database still responsive

After deployment:

- [ ] Check PM2 uptime (should be increasing)
- [ ] Monitor error logs for 30 minutes
- [ ] Verify user functionality works
- [ ] Check database performance
- [ ] Plan rollback if issues occur

---

## Summary

This deployment uses:
- **PM2** for process management (auto-restart, monitoring)
- **Nginx** as reverse proxy (port routing, caching, compression)
- **Tencent Cloud Services** (CVM, CDB, COS)
- **TypeORM** for database access
- **Vue.js** for admin frontend
- **NestJS** for backend API

The architecture is **simple, stable, and maintainable** with clear separation of concerns and easy rollback capability.

