# Banner Feature - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Database Migration

```bash
# Execute migration on your database
mysql -h your_host -u root -p database < nestapi/src/database/migrations/006-create-banners-table.sql
```

### 2. Environment Variables

Add to `.env`:
```env
COS_SECRET_ID=your_secret_id
COS_SECRET_KEY=your_secret_key
COS_BUCKET=your_bucket
COS_REGION=ap-guangzhou
```

### 3. Install FFmpeg (for video processing)

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Verify installation
ffmpeg -version
```

### 4. Build & Run

```bash
# Backend
cd nestapi
npm install
npm run build
npm run start

# Frontend (Admin)
cd admin
npm install
npm run dev  # or npm run build for production
```

---

## 📡 API Quick Reference

### Get Home Banners (for frontend display)
```bash
curl http://localhost:3000/api/v1/banners/home
```

### Get All Banners (Admin)
```bash
curl http://localhost:3000/api/v1/banners?page=1&limit=20
```

### Create Banner
```bash
curl -X POST http://localhost:3000/api/v1/banners \
  -H "Content-Type: application/json" \
  -d '{
    "mainTitle": "Summer Sale",
    "subtitle": "Up to 50% off",
    "sortOrder": 1,
    "isActive": true,
    "linkType": "category",
    "linkValue": "summer-2025"
  }'
```

### Upload Image
```bash
curl -X POST http://localhost:3000/api/v1/banners/1/upload-image \
  -F "file=@image.jpg"
```

### Upload Video (Auto-converts to WebP)
```bash
curl -X POST http://localhost:3000/api/v1/banners/1/upload-video \
  -F "file=@video.mp4"
```

### Update Banner
```bash
curl -X PUT http://localhost:3000/api/v1/banners/1 \
  -H "Content-Type: application/json" \
  -d '{
    "mainTitle": "New Title",
    "isActive": false
  }'
```

### Delete Banner
```bash
curl -X DELETE http://localhost:3000/api/v1/banners/1
```

---

## 🎨 Admin Dashboard Usage

### Access Admin Panel
Navigate to: `http://localhost:3000/admin` (or your admin URL)

### Create Banner
1. Click "Create Banner" button
2. Fill in:
   - **Main Title** (required)
   - **Subtitle** (optional)
   - **Description** (optional)
   - **Sort Order** (default: 0)
   - **Status** (default: Active)
   - **Link Type** (default: None)
   - **Link Value** (if applicable)
3. Click "Create"

### Upload Media
After creating banner:
1. If type is "Image": Click "Upload Image" → Select JPEG/PNG/WebP
2. If type is "Video": Click "Upload Video" → Select MP4/MOV/AVI/MPEG
   - Auto-converts to WebP
   - Auto-generates thumbnail
   - Shows upload progress

### Edit Banner
1. Click Edit icon in table
2. Modify fields
3. Click "Update"
4. Can re-upload media anytime

### Delete Banner
1. Click Delete icon (trash button)
2. Confirm deletion
3. Media files automatically cleaned up

---

## 📱 Mini Program Integration

### Display Banners in Swiper

```typescript
// Fetch banners
async function getHomeBanners() {
  const response = await fetch('https://api.yourdomain.com/api/v1/banners/home');
  const data = await response.json();
  return data.data;
}

// Render in template (WeChat Mini Program)
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
        autoplay="true"
        muted="true"
      />
    {/if}
  </swiper-item>
</swiper>

// Handle click
function handleBannerClick(event) {
  const banner = event.currentTarget.dataset.banner;

  switch(banner.linkType) {
    case 'product':
      wx.navigateTo({ url: `/pages/product?id=${banner.linkValue}` });
      break;
    case 'category':
      wx.navigateTo({ url: `/pages/category?id=${banner.linkValue}` });
      break;
    case 'url':
      wx.openDocument({ filePath: banner.linkValue });
      break;
  }
}
```

---

## 🎬 Video Processing Explained

### Process Flow
1. **Upload**: User uploads MP4/MOV/AVI/MPEG video
2. **Validation**: Check file type and size
3. **Conversion**: Convert to WebP using FFmpeg
   ```
   Quality: 80/100 (high quality)
   Codec: libwebp_aom
   Bitrate: Auto-optimized
   ```
4. **Thumbnail**: Extract frame at 2 seconds
5. **Upload**: Both WebP and thumbnail uploaded to COS
6. **Cleanup**: Temporary files deleted

### File Sizes (Typical)
- Input: 50-100MB (MP4)
- Output: 5-10MB (WebP at q=80)
- Compression: 80-90% size reduction

### Adjustment
To reduce file size further:
```bash
# In banners.service.ts, change q:v value:
-q:v 80   # Current (high quality)
-q:v 60   # Medium quality (smaller size)
-q:v 40   # Lower quality (smallest size)
```

---

## ✅ Checklist

- [ ] Database migration executed
- [ ] FFmpeg installed on server
- [ ] Environment variables configured
- [ ] Backend compiled successfully
- [ ] Frontend built successfully
- [ ] Admin dashboard accessible
- [ ] Can create banner
- [ ] Can upload image
- [ ] Can upload video
- [ ] API endpoints working
- [ ] Mini program displaying banners

---

## 🐛 Troubleshooting

### Video Upload Fails
**Error**: "Failed to convert video to WebP format"

**Solution**:
```bash
# Check FFmpeg installation
which ffmpeg

# Reinstall if needed
brew install ffmpeg  # macOS
sudo apt-get install ffmpeg  # Ubuntu
```

### Image Not Displaying
**Error**: Image URL returns 404

**Solution**:
1. Check COS bucket is properly configured
2. Verify COS credentials in .env
3. Check COS access permissions

### Upload Timeout
**Error**: Request timeout on large files

**Solution**:
1. Increase timeout in controller (default 30s)
2. Compress video before upload
3. Check network connection

---

## 📊 Database Structure

| Field | Type | Example |
|-------|------|---------|
| id | INT | 1 |
| main_title | VARCHAR(255) | "Summer Sale" |
| subtitle | VARCHAR(255) | "Up to 50% off" |
| description | TEXT | "Shop the latest..." |
| type | ENUM | "image" or "video" |
| image_url | VARCHAR(500) | "https://..." |
| video_url | VARCHAR(500) | "https://..." |
| video_thumbnail_url | VARCHAR(500) | "https://..." |
| is_active | BOOLEAN | true/false |
| sort_order | INT | 1, 2, 3... |
| link_type | ENUM | "product", "url", etc |
| link_value | VARCHAR(500) | "123" or "https://..." |

---

## 🎯 Common Use Cases

### Use Case 1: Promotional Image Banner
```json
{
  "mainTitle": "Flash Sale",
  "subtitle": "Limited time only",
  "type": "image",
  "isActive": true,
  "sortOrder": 1,
  "linkType": "category",
  "linkValue": "flash-sale-items"
}
```

### Use Case 2: Video Banner with Sound
```json
{
  "mainTitle": "New Product Launch",
  "subtitle": "Check out our latest collection",
  "type": "video",
  "isActive": true,
  "sortOrder": 2,
  "linkType": "product",
  "linkValue": "123456"
}
```

### Use Case 3: External Link Banner
```json
{
  "mainTitle": "Visit Our Blog",
  "description": "Read our latest articles",
  "type": "image",
  "isActive": true,
  "sortOrder": 3,
  "linkType": "url",
  "linkValue": "https://blog.yourdomain.com"
}
```

---

## 📈 Performance Tips

1. **Image Optimization**
   - Use JPEG for photos (smaller than PNG)
   - Use PNG for logos with transparency
   - Resize before upload (recommended: 1080px width)

2. **Video Optimization**
   - Keep videos under 30 seconds
   - Quality setting: q=80 (default, good balance)
   - Typical size: 5-10MB per 10 seconds

3. **Caching**
   - Cache `/banners/home` response for 2 hours
   - Cache banner images on client for 24 hours
   - Use CDN for media delivery

---

## 📞 Getting Help

For detailed information:
- **Full Guide**: `BANNER_FEATURE_GUIDE.md`
- **Implementation Details**: `BANNER_IMPLEMENTATION_SUMMARY.md`
- **Code Comments**: Check source files

---

**Status**: ✅ Ready for Production
**Last Updated**: October 29, 2025
