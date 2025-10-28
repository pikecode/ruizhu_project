# Tencent Cloud COS Configuration Guide

## Problem
Currently, COS images return **403 AccessDenied** when accessed directly because the bucket is **private** by default.

## Solutions

### 1. **SIMPLEST: Make Bucket Public-Read** (Recommended for Development)

**Steps:**
1. Login to [Tencent Cloud Console](https://console.cloud.tencent.com/)
2. Navigate to **COS** → **Bucket List**
3. Find bucket `ruizhu-1256655507` and click it
4. Go to **权限管理** (Permissions Management) tab
5. Find **Bucket Access Permissions** section
6. Under **Object Permissions**, change to **Public-Read**
7. Click **Save**

**Result:**
- ✅ All image URLs can be accessed directly without authentication
- ✅ Images can be viewed in browsers, on mobile apps, etc.
- ✅ CDN can cache images for faster delivery
- ⚠️ All files in the bucket are publicly readable

**Configuration:**
```env
# .env
COS_BUCKET=ruizhu-1256655507
COS_REGION=ap-guangzhou
COS_SECRET_ID=your_secret_id      # Kept on backend only
COS_SECRET_KEY=your_secret_key    # Kept on backend only
```

---

### 2. **SECURE: Enable CDN + Keep Bucket Private**

Use Tencent Cloud CDN to serve images while keeping the bucket private.

**Steps:**
1. In **Bucket Details** page, find **Domains and Transfer** section
2. Click **CDN Acceleration Domains**
3. Enable CDN acceleration
4. Configure CDN cache settings
5. Bucket remains **private**

**Result:**
- ✅ High-speed image delivery via CDN
- ✅ Bucket remains private
- ✅ Reduced bandwidth costs
- ⚠️ Requires CDN cost

**Usage:**
- Upload images via backend using credentials
- Return CDN URL to frontend instead of direct COS URL
- Frontend accesses via CDN

---

### 3. **FLEXIBLE: Use Signed URLs**

Generate temporary signed URLs that expire after a time period.

**Implementation:**
```typescript
// In media.service.ts
generateSignedUrl(key: string, expiresIn: number = 3600): string {
  // Generates a URL with signature valid for expiresIn seconds
  // Only accessible with the signature
}
```

**Usage:**
- Bucket remains private
- Frontend accesses via signed URLs that expire
- Useful for sensitive content with time-limited access

---

### 4. **HYBRID: Public-Read + CDN (Best Practice)**

Make bucket public-read AND enable CDN for optimal performance.

**Benefits:**
- ✅ Fast image delivery via CDN
- ✅ Backup direct COS access if CDN fails
- ✅ Good for e-commerce (public product images)
- ✅ Cost-effective

**Steps:**
1. Make bucket public-read (Option 1 above)
2. Enable CDN acceleration (Option 2 above)
3. Update image URLs in database to use CDN domain

---

## Current Code Configuration

```typescript
// media.service.ts - Current Setup
const bucket = 'ruizhu-1256655507';
const region = 'ap-guangzhou';
const url = `https://${bucket}.cos.${region}.myqcloud.com/products/...`;
// ❌ This URL fails with 403 if bucket is private

// With CDN enabled:
const cdnUrl = `https://your-cdn-domain.com/products/...`;
// ✅ This works if CDN is configured
```

---

## Security Considerations

### ⚠️ Current Risk
The `getUploadCredentials()` endpoint returns `COS_SECRET_ID` and `COS_SECRET_KEY` to frontend:

```typescript
// 🚨 SECURITY RISK
credentials: {
  tmpSecretId: secretId,     // Long-term credentials exposed!
  tmpSecretKey: secretKey,   // Frontend can use these to modify bucket!
}
```

### ✅ Better Approach - Use STS (Temporary Credentials)

For production, use Tencent Cloud STS to generate temporary credentials:

1. **Backend generates temporary credentials** (1 hour validity)
2. **Frontend uploads files** with limited permissions
3. **Credentials expire** automatically
4. Even if credentials leak, damage is limited

**Implementation:**
```bash
npm install tencentcloud-sdk-nodejs
```

```typescript
// In media.service.ts
import { STSClient } from 'tencentcloud-sdk-nodejs/sts/client';

async getUploadCredentials() {
  // Call STS API to get temporary credentials
  // Valid for 1 hour only
  // Can only upload, not delete or modify bucket
}
```

---

## Recommended Setup

For a production e-commerce platform:

1. **Make bucket public-read** (product images are public)
2. **Enable CDN** (faster image delivery)
3. **Use STS credentials** (secure frontend uploads)
4. **Implement image validation** (check mime type, size)
5. **Set lifecycle policy** (auto-delete old/abandoned uploads)

---

## Quick Testing

Once bucket is public-read, test with:

```bash
# Should return image data (no 403 error)
curl -I "https://ruizhu-1256655507.cos.ap-guangzhou.myqcloud.com/products/..."

# If this fails with 403, bucket is still private
# If this succeeds with 200 OK, bucket is public
```

---

## Bucket Policy Example

If you want **public-read for products folder only**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "cos:GetObject",
      "Resource": "arn:aws:cos:ap-guangzhou:1256655507:bucket/ruizhu-1256655507/products/*"
    }
  ]
}
```

This allows **anyone to read** files in `products/` folder but **not other folders**.

---

## Next Steps

1. **Immediate** (Development): Make bucket public-read
2. **Short-term**: Enable CDN acceleration
3. **Long-term**: Implement STS temporary credentials for security
4. **Production**: Add image validation, CDN, and monitoring

---

## References

- [Tencent COS Bucket Access Control](https://cloud.tencent.com/document/product/436/18023)
- [COS CDN Acceleration](https://cloud.tencent.com/document/product/436/18669)
- [STS Temporary Credentials](https://cloud.tencent.com/document/product/436/14048)
