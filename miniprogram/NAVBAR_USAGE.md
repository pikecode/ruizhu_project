# CustomNavbar 组件快速使用指南

## 📦 组件位置
`src/components/CustomNavbar.vue`

## 🚀 快速开始

### 第一步：导入组件
```javascript
import CustomNavbar from '@/components/CustomNavbar.vue'
```

### 第二步：注册组件
```javascript
export default {
  components: {
    CustomNavbar
  }
}
```

### 第三步：使用组件
```vue
<CustomNavbar title="页面标题" />
```

## 📋 常见用法

### 1️⃣ 基础用法 - 只显示标题
```vue
<CustomNavbar title="RUIZHU" />
```

### 2️⃣ 添加返回按钮
```vue
<CustomNavbar title="商品详情">
  <template #left>
    <text @tap="$emit('back')">← 返回</text>
  </template>
</CustomNavbar>
```

### 3️⃣ 添加右侧操作按钮
```vue
<CustomNavbar>
  <template #right>
    <text @tap="onShare">分享</text>
  </template>
</CustomNavbar>
```

### 4️⃣ 添加搜索框
```vue
<CustomNavbar>
  <template #center>
    <input v-model="searchKeyword" placeholder="搜索" />
  </template>
</CustomNavbar>
```

### 5️⃣ 完整自定义
```vue
<CustomNavbar>
  <template #left>
    <image src="/logo.png" style="width: 60rpx; height: 60rpx;" />
  </template>

  <template #center>
    <view class="search-box">
      <input placeholder="搜索商品..." />
    </view>
  </template>

  <template #right>
    <text>🔔</text>
  </template>
</CustomNavbar>
```

## ⚙️ Props 配置

```vue
<CustomNavbar
  title="页面标题"
  :showBorder="true"
  :enableBlur="true"
  backgroundColor="#ffffff"
  :zIndex="1000"
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | String | 'RUIZHU' | 导航栏标题 |
| showBorder | Boolean | true | 显示下方边框 |
| enableBlur | Boolean | true | 启用毛玻璃效果 |
| backgroundColor | String | '#ffffff' | 背景颜色 |
| zIndex | Number | 1000 | Z层级 |

## 🎨 插槽 (Slots)

三个插槽可以自由组合使用：

- **#left** - 左侧内容（默认：品牌标题）
- **#center** - 中间内容
- **#right** - 右侧内容

## ✅ 已应用页面

- ✅ `src/pages/index/index.vue` - 首页
- ✅ `src/pages/gifts/gifts.vue` - VIP私人定制

## 📝 迁移指南

如果您的页面有自定义导航栏，按以下步骤迁移：

### 原来的代码：
```vue
<template>
  <view class="page">
    <view class="custom-navbar">
      <view class="navbar-content">
        <text class="brand-logo">RUIZHU</text>
      </view>
    </view>
  </view>
</template>

<style>
.custom-navbar { ... }
.navbar-content { ... }
.brand-logo { ... }
</style>
```

### 迁移后的代码：
```vue
<template>
  <view class="page">
    <CustomNavbar title="RUIZHU" />
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'

export default {
  components: {
    CustomNavbar
  }
}
</script>
```

**优势：**
- 🎯 代码减少 50%+
- 🔄 完全可复用
- 🛡️ 一致的样式
- 🚀 更容易维护

## 🔧 常见问题

### Q: 如何改变导航栏高度？
**A:** 修改组件中 `.navbar-content` 的 `height` 属性。

### Q: 如何移除边框？
**A:** `<CustomNavbar :showBorder="false" />`

### Q: 如何移除毛玻璃效果？
**A:** `<CustomNavbar :enableBlur="false" />`

### Q: 如何改变背景颜色？
**A:** `<CustomNavbar backgroundColor="#f5f5f5" />`

## 📚 完整文档
更详细的文档请查看：`src/components/CustomNavbar.md`
