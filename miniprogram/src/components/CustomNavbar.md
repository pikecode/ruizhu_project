# CustomNavbar 组件文档

## 组件概述
CustomNavbar 是一个可复用的自定义顶部导航栏组件，支持品牌标题显示和灵活的插槽扩展。

## 组件特性
- ✅ 粘性定位（sticky）- 滚动时保持在顶部
- ✅ 安全区域适配 - 自动处理刘海屏
- ✅ 毛玻璃效果 - 现代化视觉设计
- ✅ 灵活的插槽系统 - 支持自定义左/中/右内容
- ✅ 响应式设计 - RPX 单位适配所有屏幕

## 基础用法

### 最简单的用法 - 仅显示标题
```vue
<CustomNavbar title="YUNJIE" />
```

### 带自定义内容的用法
```vue
<CustomNavbar title="RUIZHU">
  <!-- 左侧内容 -->
  <template #left>
    <text>左侧内容</text>
  </template>

  <!-- 中间内容 -->
  <template #center>
    <text>中间内容</text>
  </template>

  <!-- 右侧内容 -->
  <template #right>
    <text>右侧内容</text>
  </template>
</CustomNavbar>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `title` | String | 'YUNJIE' | 品牌标题/LOGO 文本 |
| `showBorder` | Boolean | true | 是否显示下方边框 |
| `enableBlur` | Boolean | true | 是否启用毛玻璃效果 |
| `backgroundColor` | String | '#ffffff' | 背景颜色 |
| `zIndex` | Number | 1000 | CSS z-index 层级 |

## Slots 插槽

### left 插槽
左侧内容区域，默认显示品牌标题。

**示例：**
```vue
<CustomNavbar>
  <template #left>
    <image src="/logo.png" class="navbar-logo" />
  </template>
</CustomNavbar>
```

### center 插槽
中间内容区域，通常用于搜索框或标签。

**示例：**
```vue
<CustomNavbar>
  <template #center>
    <view class="search-box">
      <input type="text" placeholder="搜索..." />
    </view>
  </template>
</CustomNavbar>
```

### right 插槽
右侧内容区域，通常用于按钮或图标。

**示例：**
```vue
<CustomNavbar>
  <template #right>
    <text class="icon-btn">🔔</text>
    <text class="icon-btn">👤</text>
  </template>
</CustomNavbar>
```

## 实际使用示例

### 示例 1: 首页导航栏
```vue
<template>
  <view class="page">
    <CustomNavbar title="YUNJIE" />
    <!-- 页面内容 -->
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

### 示例 2: 搜索页面导航栏
```vue
<template>
  <view class="page">
    <CustomNavbar>
      <template #center>
        <view class="search-wrapper">
          <input v-model="keyword" placeholder="搜索商品" />
        </view>
      </template>
      <template #right>
        <text class="search-btn" @tap="onSearch">搜索</text>
      </template>
    </CustomNavbar>
    <!-- 页面内容 -->
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'

export default {
  components: {
    CustomNavbar
  },
  data() {
    return {
      keyword: ''
    }
  },
  methods: {
    onSearch() {
      // 搜索逻辑
    }
  }
}
</script>

<style scoped>
.search-wrapper {
  flex: 1;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
}

.search-btn {
  margin-left: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
}
</style>
```

### 示例 3: 详情页导航栏（带返回按钮）
```vue
<template>
  <view class="page">
    <CustomNavbar title="商品详情">
      <template #left>
        <text class="back-btn" @tap="goBack">← 返回</text>
      </template>
      <template #right>
        <text class="share-btn" @tap="onShare">分享</text>
      </template>
    </CustomNavbar>
    <!-- 页面内容 -->
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'

export default {
  components: {
    CustomNavbar
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    onShare() {
      // 分享逻辑
    }
  }
}
</script>

<style scoped>
.back-btn {
  font-size: 28rpx;
  color: #000;
  cursor: pointer;
}

.share-btn {
  font-size: 28rpx;
  color: #000;
  cursor: pointer;
  margin-left: 20rpx;
}
</style>
```

### 示例 4: 自定义背景色和无边框
```vue
<CustomNavbar
  title="特殊页面"
  :showBorder="false"
  backgroundColor="#f5f5f5"
/>
```

## 样式定制

组件使用 scoped CSS，如需全局覆盖样式，可以在父组件中使用 `:deep()` 选择器：

```vue
<style scoped>
:deep(.custom-navbar) {
  background: linear-gradient(90deg, #fff 0%, #f9f9f9 100%);
}

:deep(.brand-logo) {
  font-size: 52rpx;
}
</style>
```

## 已应用到的页面
- ✅ `/pages/index/index.vue` - 首页
- ✅ `/pages/gifts/gifts.vue` - VIP私人定制页面

## 注意事项
1. 确保在使用的页面中正确导入组件
2. 组件已内置安全区域适配，无需额外处理
3. 插槽内容会自动与导航栏高度对齐
4. 建议使用此组件替代手动编写导航栏代码
