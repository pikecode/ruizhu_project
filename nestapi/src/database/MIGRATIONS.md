# Database Migrations

## Overview
This directory contains all database migrations for the Ruizhu e-commerce platform.

## Applied Migrations

### 1. AddCoverImageFieldsToProducts (2025-10-28)
**Status:** Applied ✅

**Description:**
Added two new fields to the `products` table to cache the cover image information:
- `cover_image_url` (varchar 500) - URL of the first product image
- `cover_image_id` (int) - ID of the first product image

**Purpose:**
- Eliminate need for LEFT JOIN product_images in list queries
- Improve query performance by caching cover image data
- Reduce database load for frequently accessed list views

**Tables Modified:**
- `products` - Added 2 columns, 1 index

**Performance Impact:**
- List queries: -33% JOIN operations
- Query complexity: Reduced
- Load times: Improved

**How to Rollback:**
```sql
ALTER TABLE products DROP COLUMN cover_image_url;
ALTER TABLE products DROP COLUMN cover_image_id;
ALTER TABLE products DROP INDEX idx_cover_image_id;
```

## Migration Naming Convention

Migrations are named with the following format:
```
{timestamp}-{description}.sql
```

Examples:
- `1729094400000-AddCoverImageFieldsToProducts.sql`

The timestamp is in milliseconds since Unix epoch (January 1, 1970).

## Running Migrations

To apply a migration manually:
```bash
mysql -h {host} -P {port} -u {username} -p{password} {database} < migration-file.sql
```

Example:
```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb < 1729094400000-AddCoverImageFieldsToProducts.sql
```

## Future Migrations

Consider implementing automated migration system using TypeORM CLI:
```bash
npm run typeorm:migration:generate -- src/migrations/AddNewFeature
npm run typeorm:migration:run
npm run typeorm:migration:revert
```

## Important Notes

1. **Backup First**: Always backup your database before running migrations on production
2. **Testing**: Test migrations on development/staging environment first
3. **Rollback Plan**: Keep rollback SQL statements documented
4. **Atomic Operations**: Each migration should be idempotent if possible
5. **Naming**: Use clear, descriptive names for migrations
