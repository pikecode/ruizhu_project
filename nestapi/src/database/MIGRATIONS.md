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

### 2. CreateArrayCollectionsTable (2025-10-28)
**Status:** Pending ⏳

**Description:**
Creates the `array_collections` table to store array-type collections with multiple card items.

**Tables Created:**
- `array_collections` - Main collection table with title, description, sort order, and status

**Fields:**
- `id` (INT) - Primary key
- `title` (VARCHAR 100) - Collection title
- `description` (VARCHAR 500) - Optional description
- `sort_order` (INT) - Display order
- `is_active` (TINYINT) - Active status flag
- `remark` (TEXT) - Notes/comments
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_is_active_sort_order` - For filtering active collections by sort order
- `idx_created_at` - For sorting by creation date

**How to Rollback:**
```sql
DROP TABLE IF EXISTS `array_collections`;
```

### 3. CreateArrayCollectionItemsTable (2025-10-28)
**Status:** Pending ⏳

**Description:**
Creates the `array_collection_items` table to store individual card items within array collections.

**Tables Created:**
- `array_collection_items` - Card items table with title, description, image URL, and sort order

**Fields:**
- `id` (INT) - Primary key
- `array_collection_id` (INT) - Foreign key to array_collections
- `title` (VARCHAR 100) - Card title
- `description` (VARCHAR 500) - Card description
- `cover_image_url` (VARCHAR 500) - Card cover image URL
- `sort_order` (INT) - Display order within collection
- `created_at`, `updated_at` - Timestamps

**Indexes:**
- `idx_array_collection_sort` - For ordering cards within collections
- `idx_created_at` - For sorting by creation date

**Relationships:**
- Foreign key to `array_collections` with CASCADE delete

**How to Rollback:**
```sql
DROP TABLE IF EXISTS `array_collection_items`;
```

### 4. CreateArrayCollectionItemProductsTable (2025-10-28)
**Status:** Pending ⏳

**Description:**
Creates the `array_collection_item_products` table to associate products with card items and manage their display order.

**Tables Created:**
- `array_collection_item_products` - Product association table with sort order

**Fields:**
- `id` (INT) - Primary key
- `array_collection_item_id` (INT) - Foreign key to array_collection_items
- `product_id` (INT) - Foreign key to products
- `sort_order` (INT) - Display order within the card item
- `created_at` - Creation timestamp

**Constraints:**
- `uk_item_product` - Unique constraint on (array_collection_item_id, product_id) to prevent duplicates

**Indexes:**
- `idx_item_sort` - For ordering products within card items
- `idx_product_id` - For product lookups

**Relationships:**
- Foreign key to `array_collection_items` with CASCADE delete

**How to Rollback:**
```sql
DROP TABLE IF EXISTS `array_collection_item_products`;
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
