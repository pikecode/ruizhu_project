# 腾讯云COS 详细配置指南（一步一步）

## 第一步：注册腾讯云账号

### 1.1 打开腾讯云官网
```
网址：https://cloud.tencent.com
```

### 1.2 点击注册
```
页面右上角 → 点击 "注册"
```

### 1.3 选择注册方式
```
可选：
- 邮箱注册
- 微信扫码注册 ⭐ 最快
- QQ扫码注册 ⭐ 最快
```

### 1.4 完成实名认证
```
1. 登录后，进入控制台
2. 右上角账户 → 账户中心
3. 左侧 → 实名认证
4. 选择认证方式：
   - 个人：身份证
   - 企业：营业执照
5. 上传证件照 + 人脸识别
6. 等待审核（通常1-2小时）
```

**⚠️ 重要：没有完成实名认证，无法使用COS服务！**

---

## 第二步：开通COS服务

### 2.1 搜索COS
```
1. 登录腾讯云控制台
2. 顶部搜索框 → 输入 "COS"
3. 搜索结果中点击 "对象存储 COS"
```

### 2.2 开通服务
```
1. 进入COS页面
2. 点击 "立即使用" 或 "开通服务"
3. 阅读服务协议
4. 点击 "同意并开通"
5. 跳转到COS控制台
```

**现在你已经开通了COS服务！** ✅

---

## 第三步：创建存储桶（Bucket）

### 3.1 进入控制台
```
网址：https://console.cloud.tencent.com/cos
或者：
腾讯云首页 → 搜索 "COS" → 进入控制台
```

### 3.2 创建存储桶
```
页面左侧菜单 → 存储桶列表
点击 "创建存储桶" 按钮
```

### 3.3 填写存储桶配置

**重要参数说明：**

#### 3.3.1 存储桶名称
```
格式：自定义名称-账户ID

示例：prada-1234567890

说明：
- 必须是全球唯一的
- 只能包含小写字母、数字、中划线
- 不能以中划线开头或结尾
- 长度3-63个字符

⚠️ 常见错误：输入大写字母或特殊字符
```

**怎么获取账户ID？**
```
1. 右上角 → 账户信息
2. 复制账户ID（如：1234567890）
3. 存储桶名称 = prada-{账户ID}
```

#### 3.3.2 所属地域
```
选择离你最近的地域：

华北：ap-beijing      （北京）
华东：ap-shanghai     （上海）
华南：ap-guangzhou    （广州）
西部：ap-chengdu      （成都）

推荐：ap-beijing（北京）
```

#### 3.3.3 访问权限
```
三个选项：
1. 私有读写 ❌ 不选
   - 所有请求都需要鉴权
   - 不适合图片访问

2. 公有读私有写 ✅ 选这个
   - 任何人可以读（查看图片）
   - 只有你可以写（上传图片）
   - 适合产品图片展示

3. 公有读写 ❌ 不选
   - 任何人都可以上传删除
   - 非常危险
```

### 3.4 点击确认创建
```
所有信息填写完成后 → 点击 "下一步" → 点击 "创建"

等待几秒钟，存储桶创建完成 ✅
```

---

## 第四步：获取API密钥

### 4.1 进入密钥管理
```
1. 点击右上角账户 → 访问管理
2. 左侧菜单 → API密钥管理
3. 点击 "新建密钥"
```

### 4.2 保存密钥信息
```
获得两个重要信息：

SecretId:  AKID12345678901234567890  ← 复制保存
SecretKey: AbCd1234567890efghijklmnop ← 复制保存

⚠️ 关键：密钥只显示一次！
务必妥善保管，不要分享给他人
```

### 4.3 创建本地 .env 文件
```
在项目根目录创建 .env 文件

内容：
TENCENT_SECRET_ID=AKID12345678901234567890
TENCENT_SECRET_KEY=AbCd1234567890efghijklmnop
TENCENT_BUCKET=prada-1234567890
TENCENT_REGION=ap-beijing
```

**⚠️ 重要：把 .env 加入 .gitignore，不要上传到Git！**

```
# .gitignore
.env
.env.local
.env.*.local
```

---

## 第五步：配置CORS（跨域访问）

### 5.1 进入存储桶配置
```
1. 登录COS控制台
2. 左侧 → 存储桶列表
3. 点击你的存储桶名称（prada-1234567890）
4. 进入桶详情页
```

### 5.2 配置CORS规则
```
左侧菜单 → 安全管理 → CORS

点击 "添加规则" 按钮
```

### 5.3 填写CORS配置

```
字段               填写值                说明
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
来源              *                  允许所有来源
允许方法          GET, PUT, POST, DELETE
允许Headers       *                  允许所有headers
暴露Headers       *                  暴露所有headers
Max-Age seconds   3600               缓存时间1小时
```

**简单版本（只用GET）：**
```
来源：*
允许方法：GET, HEAD
允许Headers：*
暴露Headers：*
```

### 5.4 保存配置
```
点击 "保存" 按钮

配置成功 ✅
```

---

## 第六步：后端配置（Node.js）

### 6.1 安装依赖
```bash
# 进入项目目录
cd your-project

# 安装必要的包
npm install express multer cos-nodejs-sdk-v5 dotenv
```

### 6.2 创建上传路由
```javascript
// routes/upload.js
const express = require('express');
const multer = require('multer');
const COS = require('cos-nodejs-sdk-v5');
require('dotenv').config();

const router = express.Router();

// 初始化COS客户端
const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY
});

// 配置multer（内存存储）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB限制
});

// 上传图片接口
router.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    // ========== 1. 校验文件 ==========
    if (!req.file) {
      return res.json({
        code: 400,
        msg: '没有选择文件'
      });
    }

    // 校验文件类型
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.json({
        code: 400,
        msg: '只支持 JPG/PNG 格式'
      });
    }

    // 校验文件大小
    if (req.file.size > 5 * 1024 * 1024) {
      return res.json({
        code: 400,
        msg: '文件大小不能超过 5MB'
      });
    }

    // ========== 2. 生成文件名 ==========
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const ext = req.file.originalname.split('.').pop();
    const key = `products/${timestamp}-${random}.${ext}`;

    // ========== 3. 上传到腾讯云COS ==========
    const uploadResult = await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.TENCENT_BUCKET,
        Region: process.env.TENCENT_REGION,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      }, (err, data) => {
        if (err) {
          console.error('COS上传错误:', err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // ========== 4. 生成访问URL ==========
    // 方式1：直接URL（需要Bucket设为公有读）
    const cosUrl = `https://${process.env.TENCENT_BUCKET}.cos.${process.env.TENCENT_REGION}.myqcloud.com/${key}`;

    // 方式2：如果有CDN域名，用CDN URL（更快）
    // const cdnUrl = `https://${process.env.TENCENT_CDN_DOMAIN}/${key}`;

    // ========== 5. 返回结果 ==========
    return res.json({
      code: 200,
      msg: '上传成功',
      data: {
        url: cosUrl,
        key: key,
        bucket: process.env.TENCENT_BUCKET,
        region: process.env.TENCENT_REGION,
        size: req.file.size,
        filename: req.file.originalname
      }
    });

  } catch (error) {
    console.error('上传失败:', error);
    return res.json({
      code: 500,
      msg: '上传失败，请稍后重试'
    });
  }
});

module.exports = router;
```

### 6.3 在主应用中使用
```javascript
// app.js 或 server.js
const express = require('express');
const uploadRouter = require('./routes/upload');

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 使用上传路由
app.use('/api/admin/products', uploadRouter);

// 其他路由...

app.listen(3000, () => {
  console.log('服务器启动在 http://localhost:3000');
});
```

---

## 第七步：前端配置（Vue 3）

### 7.1 创建上传组件
```vue
<!-- components/ImageUpload.vue -->
<template>
  <div class="image-upload-container">
    <h3>上传商品图片</h3>

    <!-- 已上传图片预览 -->
    <div class="preview-grid" v-if="uploadedImages.length > 0">
      <div v-for="(img, idx) in uploadedImages" :key="idx" class="preview-item">
        <img :src="img.url" :alt="`图片${idx + 1}`" />
        <div class="actions">
          <el-button
            type="danger"
            size="small"
            @click="removeImage(idx)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 上传组件 -->
    <el-upload
      action="/api/admin/products/upload-image"
      list-type="picture-card"
      :auto-upload="true"
      :multiple="true"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :before-upload="beforeUpload"
      :limit="10"
    >
      <el-icon class="avatar-uploader-icon">
        <Plus />
      </el-icon>
      <template #tip>
        <div class="el-upload__tip">
          支持 JPG/PNG 格式，单个文件不超过 5MB，最多上传 10 张
        </div>
      </template>
    </el-upload>

    <!-- 已上传列表 -->
    <div class="uploaded-list" v-if="uploadedImages.length > 0">
      <h4>已上传图片列表</h4>
      <el-table :data="uploadedImages" stripe size="small">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="url" label="图片" width="100">
          <template #default="{ row }">
            <img :src="row.url" style="max-width: 80px; max-height: 80px;" />
          </template>
        </el-table-column>
        <el-table-column prop="key" label="存储路径" show-overflow-tooltip />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ (row.size / 1024).toFixed(2) }} KB
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row, $index }">
            <el-button
              type="danger"
              link
              @click="removeImage($index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// 已上传的图片列表
const uploadedImages = ref([]);

// 上传前校验
const beforeUpload = (file) => {
  // 校验文件类型
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
  if (!isImage) {
    ElMessage.error('只支持 JPG/PNG 格式！');
    return false;
  }

  // 校验文件大小
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB！');
    return false;
  }

  return true;
};

// 上传成功回调
const handleUploadSuccess = (response, file) => {
  if (response.code === 200) {
    uploadedImages.value.push({
      url: response.data.url,
      key: response.data.key,
      size: response.data.size,
      uploadTime: new Date().toLocaleString(),
      filename: response.data.filename
    });
    ElMessage.success('图片上传成功！');
  } else {
    ElMessage.error(response.msg || '上传失败');
  }
};

// 上传失败回调
const handleUploadError = (error) => {
  console.error('上传错误:', error);
  ElMessage.error('上传失败，请检查网络连接！');
};

// 删除图片
const removeImage = (index) => {
  uploadedImages.value.splice(index, 1);
  ElMessage.success('已删除');
};

// 获取所有已上传图片的URL（保存到数据库用）
const getImageUrls = () => {
  return uploadedImages.value.map(img => img.url);
};

// 暴露方法给父组件
defineExpose({
  getImageUrls,
  uploadedImages
});
</script>

<style scoped lang="scss">
.image-upload-container {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;

  h3 {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 600;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 15px;
    margin-bottom: 20px;

    .preview-item {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      background: white;

      img {
        width: 100%;
        height: 100px;
        object-fit: cover;
        display: block;
      }

      .actions {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.6);
        padding: 5px;
        display: flex;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .actions {
        opacity: 1;
      }
    }
  }

  .uploaded-list {
    margin-top: 30px;

    h4 {
      margin-bottom: 15px;
      font-size: 14px;
      font-weight: 600;
    }
  }

  :deep(.el-upload-list__item) {
    transition: all 0.3s;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
```

### 7.2 在父组件中使用
```vue
<!-- pages/admin/product-edit.vue -->
<template>
  <div class="product-edit">
    <h1>编辑商品</h1>

    <!-- 商品基本信息 -->
    <el-form :model="formData" label-width="100px">
      <el-form-item label="商品名称">
        <el-input v-model="formData.name" />
      </el-form-item>

      <!-- 使用图片上传组件 -->
      <el-form-item label="商品图片">
        <ImageUpload ref="imageUploadRef" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">保存商品</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ImageUpload from '@/components/ImageUpload.vue';

const formData = ref({
  name: '',
  images: []
});

const imageUploadRef = ref();

// 提交表单
const submitForm = () => {
  // 获取已上传的图片URL
  const imageUrls = imageUploadRef.value.getImageUrls();

  formData.value.images = imageUrls;

  // 发送到后端保存
  console.log('提交的数据:', formData.value);

  // fetch('/api/admin/products', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(formData.value)
  // })
};
</script>
```

---

## 第八步：测试上传

### 8.1 启动后端服务
```bash
# 终端1：启动Node.js后端
node app.js
# 或
npm start

# 输出：服务器启动在 http://localhost:3000
```

### 8.2 启动前端开发服务
```bash
# 终端2：启动Vue前端
npm run dev

# 输出：http://localhost:5173
```

### 8.3 测试上传
```
1. 打开浏览器 → http://localhost:5173
2. 进入商品编辑页面
3. 点击上传图片
4. 选择一张JPG或PNG图片（<5MB）
5. 观察上传进度
6. 上传成功后，应该看到：
   ✅ 图片显示在预览区
   ✅ 返回的URL能正确访问
```

### 8.4 验证COS存储
```
1. 登录腾讯云COS控制台
2. 进入你的存储桶
3. 左侧 → 文件列表
4. 应该能看到 products/ 目录
5. 目录内有你上传的图片文件
```

---

## 第九步：配置CDN加速（可选）

### 9.1 为什么需要CDN？
```
直接访问COS：
用户 → 腾讯云COS → 返回图片
速度：一般

使用CDN加速：
用户 → 就近CDN节点 → 腾讯云COS → 返回图片
速度：快 ⚡
```

### 9.2 配置CDN（简单版）
```
1. 进入COS控制台
2. 选择你的存储桶
3. 左侧 → 域名与传输管理 → 加速域名
4. 点击 "创建加速域名"
5. 系统会为你分配一个CDN域名
6. 将域名添加到 .env 文件：
   TENCENT_CDN_DOMAIN=your-cdn-domain.myqcloud.com
```

### 9.3 修改后端代码（使用CDN）
```javascript
// 如果有CDN，用CDN URL；否则用COS直接URL
const imageUrl = process.env.TENCENT_CDN_DOMAIN
  ? `https://${process.env.TENCENT_CDN_DOMAIN}/${key}`
  : `https://${process.env.TENCENT_BUCKET}.cos.${process.env.TENCENT_REGION}.myqcloud.com/${key}`;
```

---

## 第十步：部署到生产环境

### 10.1 部署前检查清单
```
☑️ 实名认证完成
☑️ 创建Bucket完成
☑️ 获取API密钥完成
☑️ CORS配置完成
☑️ 本地测试通过
☑️ .env 文件已配置
☑️ .env 已加入 .gitignore
```

### 10.2 部署到服务器
```bash
# 1. 克隆代码到服务器
git clone your-repo-url

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 在服务器上创建 .env 文件，填入腾讯云密钥

# 4. 启动应用
npm start
# 或使用 PM2
pm2 start app.js --name "prada-admin"
```

### 10.3 验证生产环境
```
1. 访问生产环境地址
2. 上传一张图片
3. 检查返回的URL能否访问
4. 登录COS控制台验证文件是否存在
```

---

## 常见问题排查

### ❌ 问题1：出现 "认证失败" 错误

**可能原因：**
```
1. SecretId 或 SecretKey 错误
2. .env 文件未被加载
3. 密钥有效期已过期
```

**解决方案：**
```javascript
// 检查密钥是否正确加载
console.log('SecretId:', process.env.TENCENT_SECRET_ID);
console.log('SecretKey:', process.env.TENCENT_SECRET_KEY);

// 确保 .env 文件在项目根目录
// 确保有 require('dotenv').config();
```

---

### ❌ 问题2：上传失败，出现 "Permission denied" 错误

**可能原因：**
```
1. Bucket访问权限不是"公有读私有写"
2. 密钥没有COS权限
3. CORS配置错误
```

**解决方案：**
```
1. 登录COS控制台
2. 进入存储桶 → 权限管理
3. 检查访问权限是否为"公有读私有写"
4. 如果不是，修改为"公有读私有写"
```

---

### ❌ 问题3：前端上传成功，但返回的URL无法访问

**可能原因：**
```
1. Bucket不是公有读
2. 图片文件实际未上传成功
3. URL生成有误
```

**解决方案：**
```javascript
// 检查上传返回的response
console.log('COS响应:', response);
console.log('生成的URL:', cosUrl);

// 手动访问URL测试
// 在浏览器中打开返回的URL，看是否能下载文件
```

---

### ❌ 问题4：本地测试通过，但服务器上传失败

**可能原因：**
```
1. 服务器的 .env 文件配置有误
2. 服务器时间与腾讯云时间不同步
3. 网络防火墙阻止了到COS的连接
```

**解决方案：**
```bash
# 1. 检查服务器上的 .env 文件
cat .env

# 2. 同步服务器时间
sudo ntpdate ntp.aliyun.com

# 3. 检查防火墙规则
sudo firewall-cmd --list-all

# 4. 查看日志
pm2 logs
```

---

### ❌ 问题5：上传时出现跨域错误 (CORS error)

**可能原因：**
```
1. CORS配置未保存
2. 浏览器缓存问题
3. 来源URL与配置不匹配
```

**解决方案：**
```
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 重新配置CORS规则
3. 检查前端发送请求的来源是否在白名单中
```

---

## 快速参考表

### 常用COS URL格式

```
直接访问（公有读）：
https://prada-1234567890.cos.ap-beijing.myqcloud.com/products/xxx.jpg

CDN加速：
https://your-cdn-domain.myqcloud.com/products/xxx.jpg

私有访问（需签名）：
https://prada-1234567890.cos.ap-beijing.myqcloud.com/products/xxx.jpg?q-sign-algorithm=...
```

---

## 后续优化方案

### 1. 图片压缩
```javascript
const sharp = require('sharp');

// 压缩并上传
const buffer = await sharp(req.file.buffer)
  .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toBuffer();
```

### 2. 生成缩略图
```javascript
// 上传原图
const key = `products/${timestamp}-${random}.jpg`;

// 生成缩略图
const thumbBuffer = await sharp(buffer).resize(300, 300).toBuffer();
const thumbKey = `products/thumb-${timestamp}-${random}.jpg`;

await cos.putObject({ Key: thumbKey, Body: thumbBuffer });
```

### 3. 图片防盗链
```
1. 进入COS控制台 → 安全管理 → 防盗链
2. 配置允许的来源域名
3. 设置黑名单或白名单
```

---

## 完整工作流总结

```
1. 注册 & 实名认证 (5分钟)
2. 创建存储桶 (1分钟)
3. 获取API密钥 (1分钟)
4. 配置CORS (2分钟)
5. 后端代码 (10分钟)
6. 前端代码 (10分钟)
7. 本地测试 (5分钟)
8. 部署上线 (15分钟)

━━━━━━━━━━━
总耗时：约 50 分钟 ✅
```

**现在你已经完全掌握腾讯云COS配置了！** 🎉
