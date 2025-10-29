# Mini Program Home Page Banner Feature Guide

## Overview

This feature allows you to manage home page banners for your mini program (WeChat Mini Program, Alipay, ByteDance, etc.) with support for:
- ✅ Image banners (JPEG, PNG, WebP)
- ✅ Video banners (Auto-converted to WebP format with high-quality compression)
- ✅ Video thumbnails (Auto-generated from video frames)
- ✅ Click-through links (Products, Categories, Collections, Custom URLs)
- ✅ Sortable and toggleable display

## Database Schema

### Table: `banners`

```sql
CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  main_title VARCHAR(255) NOT NULL COMMENT '大标题',
  subtitle VARCHAR(255) COMMENT '小标题',
  description TEXT COMMENT '描述',

  type ENUM('image', 'video') DEFAULT 'image' COMMENT '类型：image或video',
  image_url VARCHAR(500) COMMENT '图片URL (COS)',
  image_key VARCHAR(255) COMMENT '图片文件Key (COS)',

  video_url VARCHAR(500) COMMENT '视频URL (COS) - webp格式',
  video_key VARCHAR(255) COMMENT '视频文件Key (COS)',
  video_thumbnail_url VARCHAR(500) COMMENT '视频封面图URL',
  video_thumbnail_key VARCHAR(255) COMMENT '视频封面文件Key',

  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',

  link_type ENUM('none', 'product', 'category', 'collection', 'url') DEFAULT 'none',
  link_value VARCHAR(500) COMMENT '链接值（产品ID、分类ID、URL等）',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Backend API Endpoints

### 1. Get Banner List

**GET** `/api/v1/banners?page=1&limit=10`

```json
{
  "code": 200,
  "message": "Successfully retrieved banner list",
  "data": {
    "items": [
      {
        "id": 1,
        "mainTitle": "Summer Sale",
        "subtitle": "Up to 50% off",
        "description": "Shop the latest collection",
        "type": "image",
        "imageUrl": "https://ruizhu-xxx.cos.ap-guangzhou.myqcloud.com/banners/xxx.jpg",
        "isActive": true,
        "sortOrder": 1,
        "linkType": "category",
        "linkValue": "summer-collection",
        "createdAt": "2025-10-29T10:00:00Z",
        "updatedAt": "2025-10-29T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### 2. Get Home Page Banners (Active Only)

**GET** `/api/v1/banners/home`

Returns only active banners sorted by sortOrder, used for mini program home page display.

```json
{
  "code": 200,
  "message": "Successfully retrieved home banners",
  "data": [
    {
      "id": 1,
      "mainTitle": "Summer Sale",
      "type": "image",
      "imageUrl": "https://...",
      "isActive": true,
      "sortOrder": 1,
      ...
    }
  ]
}
```

### 3. Get Banner Detail

**GET** `/api/v1/banners/:id`

### 4. Create Banner

**POST** `/api/v1/banners`

```json
{
  "mainTitle": "Summer Sale",
  "subtitle": "Up to 50% off",
  "description": "Shop the latest collection",
  "sortOrder": 1,
  "isActive": true,
  "linkType": "category",
  "linkValue": "summer-collection"
}
```

### 5. Update Banner

**PUT** `/api/v1/banners/:id`

```json
{
  "mainTitle": "Summer Sale Updated",
  "subtitle": "Up to 60% off",
  "isActive": true
}
```

### 6. Delete Banner

**DELETE** `/api/v1/banners/:id`

### 7. Upload Image

**POST** `/api/v1/banners/:id/upload-image`

- **Content-Type**: `multipart/form-data`
- **File field**: `file`
- **Supported formats**: JPEG, PNG, WebP
- **Max size**: Depends on COS configuration

```bash
curl -X POST http://localhost:3000/api/v1/banners/1/upload-image \
  -F "file=@/path/to/image.jpg"
```

### 8. Upload Video (Auto-converts to WebP)

**POST** `/api/v1/banners/:id/upload-video`

- **Content-Type**: `multipart/form-data`
- **File field**: `file`
- **Supported formats**: MP4, MOV, AVI, MPEG
- **Auto-processing**:
  1. Converts to WebP format (high quality, q=80)
  2. Generates video thumbnail from 2-second frame
  3. Uploads both files to COS
  4. Returns both URLs and thumbnail URL

```bash
curl -X POST http://localhost:3000/api/v1/banners/1/upload-video \
  -F "file=@/path/to/video.mp4"
```

## Admin Dashboard

### Features

1. **Banner List View**
   - Table showing all banners with pagination
   - Filter by type (Image/Video)
   - Sort by order, status, creation date

2. **Create/Edit Banner**
   - Form with fields: Title, Subtitle, Description
   - Media upload buttons (Image or Video)
   - Link configuration
   - Enable/Disable toggle
   - Sort order adjustment

3. **Media Management**
   - Image upload with progress bar
   - Video upload with progress bar
   - Auto-conversion to WebP for videos
   - Video thumbnail generation

4. **Actions**
   - Edit banner details
   - Upload/Replace media files
   - Delete banner with confirmation

### Usage in Admin

1. Navigate to Banner Management section
2. Click "Create Banner" button
3. Fill in banner details:
   - **Main Title** (required): Large display text
   - **Subtitle** (optional): Secondary text
   - **Description** (optional): Additional details
   - **Sort Order**: Display order (lower numbers first)
   - **Active**: Enable/disable display
   - **Link Type**: What happens when clicked
   - **Link Value**: ID or URL target

4. Click "Create" to save (media upload is optional at this stage)
5. Once created, you can upload media:
   - **For Images**: Click "Upload Image" and select JPEG/PNG/WebP
   - **For Videos**: Click "Upload Video" and select MP4/MOV/AVI/MPEG
     - Auto-converts to WebP with quality=80
     - Auto-generates thumbnail
     - Shows upload progress

## Video Processing

### Requirements

Your server must have FFmpeg installed for video processing.

**Installation:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# CentOS
sudo yum install ffmpeg
```

### Video Conversion Parameters

```bash
ffmpeg -i input.mp4 \
  -c:v libwebp_aom \      # WebP video codec (high quality)
  -q:v 80 \               # Quality (1-100, 80 is high quality)
  -pix_fmt yuva420p \     # Pixel format with alpha channel
  -c:a libopus \          # Audio codec
  -b:a 128k \             # Audio bitrate
  output.webp
```

**Quality vs File Size:**
- `q:v 80-90`: High quality, larger files (~5-10MB for 10s video)
- `q:v 60-79`: Medium quality, medium files (~2-5MB)
- `q:v 40-59`: Lower quality, smaller files (~1-2MB)

### Video Processing Flow

1. User uploads MP4/MOV/AVI/MPEG video
2. Server validates file type
3. Creates temporary directory
4. Uses FFmpeg to convert to WebP (q=80)
5. Uses FFmpeg to extract thumbnail from 2-second frame
6. Uploads WebP video to COS
7. Uploads thumbnail to COS
8. Deletes temporary files
9. Returns URLs to client
10. Stores in database

## Frontend Mini Program Integration

### Get Home Page Banners

```typescript
// Fetch banners when loading home page
async function getHomeBanners() {
  const response = await fetch('https://api.yourdomain.com/api/v1/banners/home');
  const data = await response.json();

  if (data.code === 200) {
    return data.data; // Array of active banners
  }
}
```

### Render Banners

```typescript
// Example for WeChat Mini Program
<swiper indicator-dots="true" autoplay="true" interval="5000">
  <swiper-item wx:for="{{banners}}" wx:key="id">
    {#if item.type === 'image'}
      <image
        src="{{item.imageUrl}}"
        mode="aspectFill"
        bindtap="handleBannerClick"
        data-banner="{{item}}"
      />
    {#else if item.type === 'video'}
      <video
        src="{{item.videoUrl}}"
        poster="{{item.videoThumbnailUrl}}"
        controls="false"
        autoplay="true"
        muted="true"
        style="width: 100%; height: 300px;"
      />
    {/if}
  </swiper-item>
</swiper>
```

### Handle Banner Click

```typescript
function handleBannerClick(event) {
  const banner = event.currentTarget.dataset.banner;

  switch(banner.linkType) {
    case 'product':
      // Navigate to product detail
      wx.navigateTo({
        url: `/pages/product-detail/index?id=${banner.linkValue}`
      });
      break;

    case 'category':
      // Navigate to category page
      wx.navigateTo({
        url: `/pages/category/index?id=${banner.linkValue}`
      });
      break;

    case 'collection':
      // Navigate to collection page
      wx.navigateTo({
        url: `/pages/collection/index?id=${banner.linkValue}`
      });
      break;

    case 'url':
      // Open external URL
      wx.openDocument({
        filePath: banner.linkValue
      });
      break;

    default:
      // No action for 'none' type
      break;
  }
}
```

## Performance Considerations

1. **Image Optimization**
   - Store original images as JPEG (smaller size than PNG)
   - Consider using image CDN for caching

2. **Video Optimization**
   - WebP format reduces file size by 30-50% vs MP4
   - Quality setting of 80 provides good balance
   - Videos are ideal for eye-catching animations
   - Consider max duration of 10-15 seconds

3. **Database Optimization**
   - Indexed on `sortOrder`, `isActive`, `type`, `createdAt`
   - Use pagination for admin list view
   - Cache home banners in Redis for 1-2 hours

4. **API Response Caching**
   - Cache `/api/v1/banners/home` response for 1-2 hours
   - Cache banner images and videos on client side
   - Use CDN for media file delivery

## Troubleshooting

### Video Upload Fails

1. **Error: "Failed to convert video to WebP format"**
   - FFmpeg not installed or not in PATH
   - Run: `which ffmpeg` to verify installation
   - Reinstall: `brew install ffmpeg`

2. **Error: "Only MP4, MOV, AVI, and MPEG videos are allowed"**
   - File format not supported
   - Convert video to MP4 using: `ffmpeg -i input.mov output.mp4`

3. **Large file size after conversion**
   - Adjust quality setting (lower q:v value = smaller file)
   - Current setting: q:v 80 (high quality)
   - Try: q:v 60-70 for smaller files

### Image Upload Fails

1. **Error: "Only JPEG, PNG, and WebP images are allowed"**
   - Use supported image format
   - Convert: `convert image.gif image.jpg`

2. **Image not displaying**
   - Check COS URL accessibility
   - Verify image file permissions

## Configuration

### Environment Variables

Add to `.env`:

```env
# COS Configuration
COS_SECRET_ID=your_secret_id
COS_SECRET_KEY=your_secret_key
COS_BUCKET=your_bucket_name
COS_REGION=ap-guangzhou

# Database
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

### COS Setup (Tencent Cloud)

1. Create a COS bucket for media files
2. Enable CORS: Allow all origins for development
3. Get Secret ID and Secret Key from Console
4. Configure bucket region

## Git Commits

```
Database Migration:
- Create banners table with image/video support
- Add indexes for optimal query performance

Backend Implementation:
- Add Banner Entity (TypeORM)
- Create Banner Service with media upload and FFmpeg conversion
- Add Banner Controller with 8 API endpoints
- Create Banner Module
- Integrate into AppModule

Admin Frontend:
- Create BannerManager component
- Implement banner CRUD operations
- Add image/video upload with progress tracking
- Create banner service for API calls

Video Processing:
- Convert videos to WebP format (quality=80)
- Generate video thumbnails from 2-second frame
- Auto-cleanup temporary files
```

## Future Enhancements

1. **Batch Operations**
   - Bulk enable/disable banners
   - Bulk reorder banners
   - Bulk delete banners

2. **Advanced Features**
   - A/B testing for different banner versions
   - Analytics tracking (impressions, clicks)
   - Scheduled display (start/end dates)
   - Geolocation-based targeting
   - Device type filtering (iPhone, Android, etc.)

3. **Performance**
   - Server-side image resizing
   - Adaptive image delivery (WebP for modern browsers)
   - Video stream optimization

4. **Admin UX**
   - Banner preview on different screen sizes
   - Drag-and-drop reordering
   - Batch upload multiple banners
   - Template system for common banner types

---

**Last Updated**: October 29, 2025
**Status**: Ready for Production
**Version**: 1.0.0
