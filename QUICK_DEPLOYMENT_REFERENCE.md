# Quick Deployment Reference Guide

## Current Deployment Status
- **Server**: Tencent Cloud (123.207.14.67)
- **Status**: ✅ OPERATIONAL (Both services running)
- **Backend Uptime**: 3+ hours (stable)

---

## Quick Service Checks

```bash
# Check if both services are running
ssh root@123.207.14.67

# See all services
pm2 list

# See backend process
pm2 info ruizhu-backend

# Test backend API
curl http://localhost:8888/health

# Test admin frontend
curl http://localhost/

# View recent logs
pm2 logs ruizhu-backend | head -20
```

---

## Deploy New Code (5 Steps)

### 1. Build locally
```bash
cd /path/to/nestapi
npm run build
```

### 2. Upload to server
```bash
rsync -avz dist/ root@123.207.14.67:/opt/ruizhu-app/nestapi-dist/dist/
```

### 3. Backup current version
```bash
ssh root@123.207.14.67
cd /opt/ruizhu-app
cp -r nestapi-dist nestapi-dist-backup-$(date +%Y%m%d)
```

### 4. Restart PM2
```bash
pm2 restart ruizhu-backend
```

### 5. Verify
```bash
pm2 logs ruizhu-backend
# Should see "listening on port 3000"
```

---

## Rollback (if needed)

```bash
ssh root@123.207.14.67
pm2 stop ruizhu-backend
cp -r nestapi-dist-backup-YYYYMMDD nestapi-dist
pm2 start ruizhu-backend
```

---

## Important Locations

| Component | Location |
|-----------|----------|
| Backend Code | `/opt/ruizhu-app/nestapi-dist/dist/` |
| Admin Files | `/opt/ruizhu-app/admin/` |
| PM2 Config | `/opt/ruizhu-app/ecosystem.config.js` |
| Environment | `/opt/ruizhu-app/.env.production` |
| Nginx Config | `/etc/nginx/conf.d/ruizhu.conf` |
| Error Log | `/var/log/pm2/ruizhu-backend-error.log` |
| Access Log | `/var/log/nginx/ruizhu-access.log` |

---

## Service Management Commands

```bash
# View all processes
pm2 list

# View specific process info
pm2 info ruizhu-backend

# Restart backend
pm2 restart ruizhu-backend

# Stop backend
pm2 stop ruizhu-backend

# Start backend
pm2 start ruizhu-backend

# View logs (real-time)
pm2 logs ruizhu-backend

# View error logs only
pm2 logs ruizhu-backend --err

# Reload Nginx
nginx -s reload

# Restart Nginx
systemctl restart nginx
```

---

## Database Connection

**For direct MySQL queries**:
```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p"Pp123456"
```

**Connection string**:
```
mysql://root:Pp123456@gz-cdb-qtjza6az.sql.tencentcdb.com:27226/mydb
```

---

## Architecture at a Glance

```
Client Request (port 80)
    ↓
Nginx Reverse Proxy
    ├─ /api/*  → Backend (127.0.0.1:8888)
    └─ /      → Admin Frontend (/opt/ruizhu-app/admin/)
    ↓
NestAPI Backend (PM2, PID: 679539)
    ├─ Port: 3000 (internal)
    ├─ Process: fork mode (single instance)
    └─ Memory: ~112 MB
    ↓
Tencent Cloud Database (CDB)
    └─ mydb
```

---

## Configuration Details

### NestAPI Backend (PM2)
- **Script**: `./dist/main.js`
- **Working Dir**: `/opt/ruizhu-app/nestapi-dist`
- **Port**: 3000
- **Memory Limit**: 512MB (auto-restart)
- **Status**: Auto-restart enabled
- **Watch**: Disabled

### Admin Frontend (Nginx)
- **Root**: `/opt/ruizhu-app/admin/`
- **Default File**: `index.html`
- **SPA Mode**: Fallback to index.html
- **Cache**: 30 days for static assets
- **Compression**: Gzip enabled

### Nginx Reverse Proxy
- **Listen**: Port 80
- **Backend Upstream**: `127.0.0.1:8888`
- **Keep-Alive**: 64 connections
- **Timeouts**: 60 seconds
- **Max Upload**: 50 MB

---

## Environment Variables (.env.production)

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
DB_HOST=gz-cdb-qtjza6az.sql.tencentcdb.com
DB_PORT=27226
DB_USER=root
DB_PASSWORD=Pp123456
DB_NAME=mydb
```

---

## Common Issues & Quick Fixes

### Backend not responding
```bash
pm2 logs ruizhu-backend --err
# Check the error, then restart:
pm2 restart ruizhu-backend
```

### Admin shows blank page
```bash
# Check if files exist
ls /opt/ruizhu-app/admin/index.html

# Check Nginx config
nginx -t

# Reload Nginx
nginx -s reload
```

### Database connection error
```bash
# Test connection
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p

# Verify credentials in .env.production
cat /opt/ruizhu-app/.env.production | grep DB_
```

### High memory usage
```bash
# Check memory
pm2 list | grep memory

# If > 512MB, PM2 auto-restarts
# Check why in logs:
pm2 logs ruizhu-backend
```

---

## Monitoring Commands

```bash
# Check process status
pm2 list

# Monitor in real-time
pm2 monit

# Check if ports are open
lsof -i :80      # Nginx
lsof -i :8888    # Backend

# Check database connection
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -p"Pp123456" -e "SELECT 1;"

# View recent errors
tail -50 /var/log/pm2/ruizhu-backend-error.log
tail -50 /var/log/nginx/ruizhu-error.log

# Count error occurrences
grep ERROR /var/log/pm2/ruizhu-backend-error.log | wc -l
```

---

## Before Deploying New Code

- [ ] Code changes committed to git
- [ ] `npm run build` successful
- [ ] No TypeScript errors
- [ ] Tested locally
- [ ] Ready for backup and restart

## After Deploying

- [ ] Monitor logs for 5 minutes
- [ ] Test key endpoints
- [ ] Check database is responsive
- [ ] Verify admin dashboard loads
- [ ] Monitor memory usage

---

## Access Points

| Service | URL | Status |
|---------|-----|--------|
| Admin Dashboard | http://123.207.14.67/ | ✅ |
| API Base | http://123.207.14.67/api/ | ✅ |
| Health Check | http://123.207.14.67/health | ✅ |

---

## Backup Versions

```
Current:        /opt/ruizhu-app/nestapi-dist/
Previous:       /opt/ruizhu-app/nestapi-dist-old/
Earlier:        /opt/ruizhu-app/nestapi-dist-old-wrong/
```

To rollback: `cp -r nestapi-dist-old nestapi-dist && pm2 restart`

---

## Next Deployment: Inventory-Order-Purchase Flow Updates

New code changes to deploy:
- ✅ Optimistic locking (version field)
- ✅ Order timeout (30 minutes auto-cancel)
- ✅ Payment verification (fraud detection)
- ✅ Address persistence (complete data)

**Deployment steps**: Same as above (build → upload → restart)

---

**Last Updated**: 2025-11-06
**Status**: Production Ready ✅
