# 产品媒体管理优化方案

## 📋 概述

本方案提供了一个完整的**图片和视频管理解决方案**，集成腾讯云COS，支持高性能上传、预览、管理等功能。

---

## 🎯 核心优化方案

### 1. **媒体上传组件（MediaUploader）**

#### 特性
- ✅ 支持图片和视频上传
- ✅ 拖拽上传体验
- ✅ 实时进度显示
- ✅ 批量上传支持
- ✅ 文件验证（类型、大小）
- ✅ 图片预览和视频缩略图
- ✅ 响应式网格布局

#### 文件位置
```
/admin/src/components/MediaUploader.tsx
/admin/src/components/MediaUploader.module.scss
```

#### 使用示例
```tsx
import MediaUploader from '@/components/MediaUploader'

<MediaUploader
  value={mediaFiles}
  onChange={setMediaFiles}
  maxCount={10}
  maxSize={500}
  onUploadToCloud={handleUploadToCOS}
/>
```

---

### 2. **媒体服务（mediaService）**

#### 功能清单
- `getUploadCredentials()` - 获取腾讯云COS临时凭证
- `uploadMedia(file)` - 上传单个文件到后端
- `deleteMedia(url)` - 删除媒体文件
- `getImageInfo(url)` - 获取图片尺寸信息
- `generateThumbnail(url)` - 生成视频缩略图
- `uploadMediaBatch(files)` - 批量上传文件
- `uploadToCOS(file)` - 直接上传到腾讯云COS

#### 文件位置
```
/admin/src/services/media.ts
```

---

## 🏗️ 架构设计

### 上传流程图

```
┌─────────────────┐
│  选择文件       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 验证文件类型/大小 │
└────────┬────────┘
         │
    是否有onUploadToCloud
         │
    ┌────┴────┐
    │          │
   有         无
    │          │
    ▼          ▼
┌────────┐  ┌────────┐
│直接上传│  │后端代理│
│到COS   │  │上传    │
└────┬───┘  └────┬───┘
     │          │
     └────┬─────┘
          │
          ▼
     ┌─────────┐
     │获取URL  │
     └────┬────┘
          │
          ▼
     ┌──────────┐
     │更新列表  │
     └──────────┘
```

---

## 🔧 集成步骤

### 1. 更新ProductForm组件

```tsx
// 在表单中添加媒体标签页
const formTabs = [
  {
    label: '基本信息',
    key: 'basic',
    children: ( /* 现有内容 */ )
  },
  {
    label: '媒体管理',
    key: 'media',
    children: (
      <MediaUploader
        value={form.getFieldValue('images') || []}
        onChange={(files) => form.setFieldValue('images', files)}
        onUploadToCloud={mediaService.uploadMedia}
      />
    )
  }
]
```

### 2. 后端API期望

#### 获取COS凭证
```
GET /api/v1/media/cos-credentials

Response:
{
  "code": 200,
  "data": {
    "cosUrl": "https://bucket.cos.region.myqcloud.com",
    "bucket": "bucket-name",
    "region": "ap-beijing",
    "credentials": {
      "sessionToken": "xxx",
      "tmpSecretId": "xxx",
      "tmpSecretKey": "xxx"
    },
    "expiredTime": 1700000000
  }
}
```

#### 上传媒体文件
```
POST /api/v1/media/upload
Content-Type: multipart/form-data

Body:
- file: [Binary]
- type: "image" | "video"

Response:
{
  "code": 200,
  "data": {
    "url": "https://bucket.cos.region.myqcloud.com/products/xxx.jpg",
    "type": "image",
    "size": 102400,
    "width": 1920,
    "height": 1080
  }
}
```

#### 删除媒体文件
```
DELETE /api/v1/media/delete

Body:
{
  "url": "https://bucket.cos.region.myqcloud.com/products/xxx.jpg"
}
```

---

## 📊 性能优化建议

### 1. **图片优化**
```typescript
// 压缩大图片（使用 lossless 压缩）
- 自动转换为 WebP 格式（支持的浏览器）
- 生成多种尺寸的缩略图
- 懒加载预览图
```

### 2. **视频优化**
```typescript
// 对视频进行处理
- 生成视频缩略图（第一帧或指定帧）
- 限制视频文件大小（默认500MB）
- 支持 HLS/DASH 流媒体格式
- 获取视频基本信息（时长、分辨率等）
```

### 3. **上传优化**
```typescript
// 实现分片上传（大文件）
- 将大文件分割成小块（5MB/块）
- 并发上传多个分片（3-5个并发）
- 支持暂停/继续/取消
- 失败自动重试（3次）

// 带宽限制
- 限制上传速度（可选）
- 检测网络状态，4G/WiFi 不同处理
```

---

## 🎨 UI/UX 设计考虑

### 1. **上传区域**
```
┌─────────────────────────────────┐
│  📤  拖拽文件到此处              │
│      或点击选择                  │
│                                 │
│  ✅ 支持 JPG, PNG, GIF 等      │
│  ✅ 支持 MP4, WebM 等          │
│  ⚠️  单个文件不超过 500MB      │
└─────────────────────────────────┘
```

### 2. **已上传文件卡片**
```
┌──────────────┐
│ [图片/视频]  │
├──────────────┤
│ 文件名.jpg   │
│ 2.5 MB       │
│ 图片 | 🔗 🗑  │
└──────────────┘
```

### 3. **进度显示**
```
上传中: 文件名.mp4
████████░░░░░░░░░░░░  65%
```

---

## 🔐 安全考虑

### 1. **文件验证**
- ✅ 服务器端文件类型验证（MIME type）
- ✅ 病毒扫描（可选，使用第三方服务）
- ✅ 文件大小限制
- ✅ 上传速率限制

### 2. **访问控制**
- ✅ 需要认证的用户才能上传
- ✅ 只有文件所有者能删除
- ✅ COS 文件设置私有访问（使用签名URL）
- ✅ 定期清理过期文件

### 3. **数据安全**
- ✅ HTTPS 传输
- ✅ 上传前客户端加密（可选）
- ✅ 文件名随机化（防止目录遍历）

---

## 📱 响应式设计

### 断点布局
```
Mobile (xs)  : 1 列布局
Tablet (md)  : 2 列布局
Desktop (lg) : 4 列布局
```

---

## 🚀 腾讯云COS集成指南

### 1. **安装SDK**
```bash
npm install cos-js-sdk-v5
```

### 2. **配置COS客户端**
```typescript
import COS from 'cos-js-sdk-v5'

const cos = new COS({
  getAuthorization(options, callback) {
    // 获取临时凭证
    const { TmpSecretId, TmpSecretKey, SessionToken, ExpiredTime } = credentials
    callback({
      TmpSecretId,
      TmpSecretKey,
      SecurityToken: SessionToken,
      ExpiredTime,
    })
  },
})
```

### 3. **上传到COS**
```typescript
const uploadToCOS = async (file: File) => {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: 'bucket-name',
        Region: 'ap-beijing',
        Key: `products/${Date.now()}-${file.name}`,
        Body: file,
        onProgress(progressData) {
          console.log('进度:', progressData.percent)
        },
      },
      (err, data) => {
        if (err) reject(err)
        else resolve(`https://${data.Bucket}.cos.${data.Region}.myqcloud.com/${data.Key}`)
      }
    )
  })
}
```

---

## 📈 扩展功能建议

### Phase 2
- [ ] 图片编辑（裁剪、滤镜）
- [ ] 视频编辑（剪辑、水印）
- [ ] 媒体库管理（分类、标签）
- [ ] CDN 加速（自动选择最优节点）

### Phase 3
- [ ] AI 内容审核
- [ ] 自动生成产品描述（从图片/视频）
- [ ] 媒体分析（点击热力图）
- [ ] A/B 测试（不同图片的转化率）

---

## 🔍 常见问题

### Q: 如何处理大文件上传（>500MB）？
A: 使用分片上传
```typescript
// 将文件分成 5MB 的块
const chunkSize = 5 * 1024 * 1024
const chunks = Math.ceil(file.size / chunkSize)
// 并发上传 3 个块
```

### Q: 如何支持视频预览？
A: 生成缩略图
```typescript
// 后端：使用 FFmpeg 从视频第一帧生成缩略图
// 前端：显示缩略图作为视频封面
```

### Q: 上传失败如何重试？
A: 自动重试机制
```typescript
const uploadWithRetry = async (file: File, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await mediaService.uploadMedia(file)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * (i + 1))) // 指数退避
    }
  }
}
```

---

## 📚 参考资源

- [腾讯云COS文档](https://cloud.tencent.com/document/product/436)
- [Ant Design Upload组件](https://ant.design/components/upload-cn/)
- [文件上传最佳实践](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload)

---

## 📋 Checklist

- [ ] 创建 MediaUploader 组件
- [ ] 创建 mediaService 服务
- [ ] 集成到 ProductForm 表单
- [ ] 后端实现上传接口
- [ ] 后端集成腾讯云COS
- [ ] 测试文件上传流程
- [ ] 添加错误处理和重试机制
- [ ] 性能优化（图片压缩、缩略图）
- [ ] 安全性检查（文件验证、访问控制）
- [ ] 产品文档和用户指南

