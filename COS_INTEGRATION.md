# 腾讯云 COS 文件管理系统集成指南

## 项目概述

本文档详细说明了如何在 Ruizhu 电商平台中集成腾讯云对象存储（COS）服务，用于文件上传、下载和管理。

---

## 已完成的集成内容

### 1. 环境配置

**文件**: `nestapi/.env`

```env
# Tencent COS Configuration
COS_SECRET_ID=AKIDiSyGOJzdDdrunW7Xp5A3lJkz51oQzMYZ
COS_SECRET_KEY=rW6VigP5bv1wgtvjMp581kGXaSwIQNlw
COS_REGION=ap-guangzhou
COS_BUCKET=ruizhu-1256655507
COS_UPLOAD_MAX_SIZE=52428800  # 50MB
```

### 2. 后端实现

#### 2.1 依赖安装

```bash
npm install cos-nodejs-sdk-v5 --legacy-peer-deps --save
npm install typeorm --legacy-peer-deps --save
```

#### 2.2 数据库模型

**文件**: `nestapi/src/files/entities/file.entity.ts`

```typescript
@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  fileName: string          // 保存的文件名

  @Column({ type: 'varchar', length: 255 })
  originalName: string      // 原始文件名

  @Column({ type: 'varchar', length: 500 })
  cosKey: string           // COS 中的文件路径

  @Column({ type: 'varchar', length: 500 })
  url: string              // 文件 URL

  @Column({ type: 'varchar', length: 100 })
  mimeType: string         // 文件 MIME 类型

  @Column({ type: 'bigint' })
  size: number            // 文件大小

  @Column({ type: 'varchar', length: 50, nullable: true })
  fileType: string        // 文件扩展名

  @Column({ type: 'varchar', length: 255, nullable: true })
  uploadedBy: string      // 上传者

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean      // 软删除标记
}
```

#### 2.3 COS 服务层

**文件**: `nestapi/src/files/services/cos.service.ts`

核心功能：
- `uploadFile()` - 上传文件到 COS
- `deleteFile()` - 删除 COS 中的文件
- `getSignedUrl()` - 生成预签名 URL（用于下载）
- `getAuthenticatedUrl()` - 获取临时访问 URL

#### 2.4 文件管理服务

**文件**: `nestapi/src/files/services/files.service.ts`

核心功能：
- `uploadFile()` - 上传文件（包含数据库记录）
- `getAllFiles()` - 获取文件列表（分页）
- `getFileById()` - 获取单个文件信息
- `deleteFile()` - 删除文件（软删除）
- `getDownloadUrl()` - 获取下载链接
- `getFileStats()` - 获取文件统计信息

#### 2.5 API 控制器

**文件**: `nestapi/src/files/controllers/files.controller.ts`

API 端点：

```
POST   /api/v1/files/upload              上传文件
GET    /api/v1/files                     获取文件列表（分页）
GET    /api/v1/files/:id                 获取单个文件信息
DELETE /api/v1/files/:id                 删除文件
GET    /api/v1/files/:id/download-url    获取下载链接
GET    /api/v1/files/stats/overview      获取统计信息
```

#### 2.6 模块集成

**文件**: `nestapi/src/files/files.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([File]), ConfigModule],
  providers: [FilesService, CosService],
  controllers: [FilesController],
  exports: [FilesService, CosService],
})
export class FilesModule {}
```

### 3. 前端实现

#### 3.1 API 服务

**文件**: `admin/src/services/files.ts`

提供以下方法：
- `uploadFile()` - 上传文件
- `getFilesList()` - 获取文件列表
- `getFileById()` - 获取文件信息
- `deleteFile()` - 删除文件
- `getDownloadUrl()` - 获取下载链接
- `getFileStats()` - 获取统计信息

#### 3.2 上传组件

**文件**: `admin/src/components/UploadFile.tsx`

功能：
- 文件选择
- 文件大小验证
- 上传进度显示
- 错误处理

**样式**: `admin/src/components/UploadFile.module.scss`

#### 3.3 文件管理页面

**文件**: `admin/src/pages/FileManager.tsx`

功能：
- 上传文件
- 文件列表展示（分页）
- 文件删除
- 文件下载
- 文件预览
- 文件统计信息

**样式**: `admin/src/pages/FileManager.module.scss`

#### 3.4 路由配置

**文件**: `admin/src/routes.tsx`

```typescript
{
  path: '/files',
  element: withSuspense(FileManagerPage),
}
```

#### 3.5 导航菜单

**文件**: `admin/src/components/Layout.tsx`

添加了"Files"菜单项用于导航到文件管理页面。

---

## API 使用示例

### 上传文件

```bash
curl -X POST http://localhost:8888/api/v1/files/upload \
  -F "file=@/path/to/file.pdf" \
  -H "Authorization: Bearer <token>"
```

响应：
```json
{
  "id": 1,
  "fileName": "1698345600000-abc123.pdf",
  "originalName": "document.pdf",
  "cosKey": "uploads/1698345600000-abc123.pdf",
  "url": "https://ruizhu-1256655507.cos.ap-guangzhou.myqcloud.com/uploads/1698345600000-abc123.pdf",
  "mimeType": "application/pdf",
  "size": 524288,
  "fileType": "pdf",
  "uploadedBy": "admin",
  "createdAt": "2024-10-26T02:30:00.000Z",
  "updatedAt": "2024-10-26T02:30:00.000Z"
}
```

### 获取文件列表

```bash
curl "http://localhost:8888/api/v1/files?limit=20&offset=0" \
  -H "Authorization: Bearer <token>"
```

响应：
```json
{
  "data": [
    { /* file object */ }
  ],
  "total": 42
}
```

### 删除文件

```bash
curl -X DELETE http://localhost:8888/api/v1/files/1 \
  -H "Authorization: Bearer <token>"
```

### 获取下载链接

```bash
curl "http://localhost:8888/api/v1/files/1/download-url?expiresIn=3600" \
  -H "Authorization: Bearer <token>"
```

响应：
```json
{
  "url": "https://ruizhu-1256655507.cos.ap-guangzhou.myqcloud.com/uploads/1698345600000-abc123.pdf?..."
}
```

### 获取统计信息

```bash
curl "http://localhost:8888/api/v1/files/stats/overview" \
  -H "Authorization: Bearer <token>"
```

响应：
```json
{
  "total": 42,
  "byType": [
    { "type": "pdf", "count": 15 },
    { "type": "jpg", "count": 20 },
    { "type": "png", "count": 7 }
  ],
  "totalSize": 1073741824
}
```

---

## 前端使用示例

### 在 React 组件中使用上传

```tsx
import { UploadFileComponent } from '@/components/UploadFile'
import { FileInfo } from '@/services/files'

function MyComponent() {
  const handleUploadSuccess = (file: FileInfo) => {
    console.log('文件上传成功:', file.url)
    // 可以在这里更新 UI，重新加载文件列表等
  }

  return (
    <UploadFileComponent
      onSuccess={handleUploadSuccess}
      maxSize={52428800}  // 50MB
      accept="image/*,application/pdf"
    />
  )
}
```

### 在 React 组件中使用文件列表

```tsx
import { getFilesList, deleteFile } from '@/services/files'
import { useEffect, useState } from 'react'

function MyFileList() {
  const [files, setFiles] = useState([])

  useEffect(() => {
    const loadFiles = async () => {
      const result = await getFilesList(20, 0)
      setFiles(result.data)
    }
    loadFiles()
  }, [])

  return (
    <div>
      {files.map(file => (
        <div key={file.id}>
          <span>{file.originalName}</span>
          <a href={file.url} target="_blank">查看</a>
          <button onClick={() => deleteFile(file.id)}>删除</button>
        </div>
      ))}
    </div>
  )
}
```

---

## 文件目录结构

```
nestapi/
├── src/
│   ├── files/
│   │   ├── controllers/
│   │   │   └── files.controller.ts
│   │   ├── services/
│   │   │   ├── cos.service.ts
│   │   │   └── files.service.ts
│   │   ├── entities/
│   │   │   └── file.entity.ts
│   │   └── files.module.ts
│   ├── database/
│   │   └── database.module.ts (已更新)
│   └── app.module.ts (已更新)

admin/
├── src/
│   ├── components/
│   │   ├── UploadFile.tsx
│   │   └── UploadFile.module.scss
│   ├── pages/
│   │   ├── FileManager.tsx
│   │   └── FileManager.module.scss
│   ├── services/
│   │   └── files.ts
│   └── routes.tsx (已更新)
```

---

## 访问文件管理页面

启动所有服务后，在浏览器中访问：

```
http://localhost:5174/files
```

或点击管理后台左侧导航中的 "Files" 菜单项。

---

## 注意事项

### 安全性

1. **凭证管理**: 不要在代码中硬编码 COS 凭证，使用环境变量
2. **权限控制**: 建议添加基于角色的访问控制（RBAC）
3. **文件验证**: 验证文件类型和大小，防止恶意上传
4. **HTTPS**: 生产环境务必使用 HTTPS

### 性能优化

1. **分片上传**: 对于大文件，可以实现分片上传以提高成功率
2. **CDN 加速**: 为 COS 配置 CDN 加速以提高下载速度
3. **缓存**: 合理设置缓存策略以减少请求

### 成本控制

1. **存储容量**: 监控 COS 存储使用量
2. **流量**: 注意 COS 出流量成本
3. **请求数**: 批量操作时优化 API 调用次数

---

## 常见问题

### Q: 如何修改最大上传文件大小？

A: 修改 `nestapi/.env` 中的 `COS_UPLOAD_MAX_SIZE` 参数（单位：字节）

### Q: 如何修改文件上传路径？

A: 在 `nestapi/src/files/services/files.service.ts` 中修改 `cosKey` 生成逻辑

### Q: 如何启用文件下载防盗链？

A: 在腾讯云 COS 控制台配置防盗链规则

### Q: 支持哪些文件类型？

A: 默认支持所有文件类型，可在 `accept` 参数中指定限制

---

## 后续改进方向

1. 🎯 实现分片上传功能
2. 📊 添加文件使用统计分析
3. 🔐 实现基于角色的文件访问控制
4. 🖼️ 自动生成图片缩略图
5. 🎬 支持视频文件处理和转码
6. 📤 批量上传和下载功能
7. 🗂️ 文件分类和标签管理
8. 🔍 文件搜索功能

---

## 参考资源

- [腾讯云 COS 文档](https://cloud.tencent.com/document/product/436)
- [COS Node.js SDK](https://github.com/tencentyun/cos-nodejs-sdk-v5)
- [NestJS 官方文档](https://docs.nestjs.com)
- [React 官方文档](https://react.dev)

---

**最后更新**: 2024-10-26
**集成状态**: ✅ 完成
