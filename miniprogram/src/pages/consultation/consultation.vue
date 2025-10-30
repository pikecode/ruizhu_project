<template>
  <view class="page">
    <!-- 自定义顶部导航栏 -->
    <ConsultationNavbar :title="selectedCategoryName + '定制服务'" />

    <!-- 页面标题 -->
    <view class="header-section">
      <text class="title">专属定制服务</text>
      <text class="subtitle">选择您感兴趣的产品开启定制之旅</text>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <scroll-view scroll-x class="tabs-scroll">
        <view class="tabs-wrapper">
          <view
            v-for="category in categories"
            :key="category.id"
            :class="['tab-item', { active: selectedCategory === category.id }]"
            @tap="selectCategory(category.id)"
          >
            <view class="tab-icon" v-if="category.icon">{{ category.icon }}</view>
            <text class="tab-name">{{ category.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索产品..."
          @input="onSearchInput"
          class="search-input"
        />
      </view>
    </view>

    <!-- 产品网格 -->
    <view class="products-container">
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-state">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="displayProducts.length === 0" class="empty-state">
        <text class="empty-text">暂无相关产品</text>
      </view>

      <!-- 产品网格 -->
      <view v-else class="product-grid">
        <view
          v-for="(product, index) in displayProducts"
          :key="index"
          class="product-card"
          @tap="onProductSelect(product)"
        >
          <!-- 产品图片 -->
          <view class="product-image-wrapper">
            <image class="product-image" :src="product.image" mode="aspectFill"></image>
            <view class="badge">{{ product.isNew ? '新品' : '' }}</view>
            <text class="favorite-icon" @tap.stop="toggleFavorite(product.id)">
              {{ product.isFavorite ? '♥' : '♡' }}
            </text>
          </view>

          <!-- 产品信息 -->
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-color">{{ product.color }}</text>
            <text class="product-price">¥{{ product.price }}</text>
          </view>

          <!-- 颜色选择 -->
          <view class="color-dots">
            <view
              v-for="(color, i) in product.colors"
              :key="i"
              class="color-dot"
              :style="{ backgroundColor: color.value }"
              :title="color.name"
            ></view>
          </view>
        </view>
      </view>

      <!-- 加载更多按钮 -->
      <view v-if="hasMore && displayProducts.length > 0" class="load-more">
        <view class="load-more-btn" @tap="loadMoreProducts">
          <text>加载更多</text>
        </view>
      </view>
    </view>

    <!-- 咨询表单（浮窗） -->
    <view class="consultation-form" v-if="selectedProduct">
      <view class="form-header">
        <text class="form-title">定制咨询</text>
        <text class="close-btn" @tap="selectedProduct = null">✕</text>
      </view>

      <view class="form-content">
        <!-- 产品预览 -->
        <view class="product-preview">
          <image :src="selectedProduct.image" mode="aspectFit"></image>
          <text class="preview-name">{{ selectedProduct.name }}</text>
        </view>

        <!-- 咨询表单 -->
        <view class="form-group">
          <text class="label">姓名 *</text>
          <input v-model="consultForm.name" type="text" placeholder="请输入您的姓名" />
        </view>

        <view class="form-group">
          <text class="label">电话 *</text>
          <input v-model="consultForm.phone" type="tel" placeholder="请输入您的电话" />
        </view>

        <view class="form-group">
          <text class="label">邮箱</text>
          <input v-model="consultForm.email" type="email" placeholder="请输入您的邮箱" />
        </view>

        <view class="form-group">
          <text class="label">选择颜色</text>
          <picker
            :range="selectedProduct.colors"
            :value="consultForm.colorIndex"
            @change="onColorChange"
            range-key="name"
          >
            <view class="picker-wrapper">
              <text class="picker-value">
                {{ selectedProduct.colors[consultForm.colorIndex]?.name || '请选择颜色' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="form-group">
          <text class="label">备注信息</text>
          <textarea
            v-model="consultForm.remarks"
            placeholder="请输入您的定制需求或特殊要求"
            maxlength="200"
          ></textarea>
          <text class="char-count">{{ consultForm.remarks.length }}/200</text>
        </view>

        <!-- 提交按钮 -->
        <view class="form-actions">
          <view class="cancel-btn" @tap="selectedProduct = null">
            <text>取消</text>
          </view>
          <view class="submit-btn" @tap="submitConsultation">
            <text>提交咨询</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 遮罩层 -->
    <view v-if="selectedProduct" class="mask" @tap="selectedProduct = null"></view>
  </view>
</template>

<script>
import ConsultationNavbar from '@/components/ConsultationNavbar.vue'

export default {
  components: {
    ConsultationNavbar
  },
  data() {
    return {
      // UI状态
      selectedProduct: null,
      selectedCategory: 1,
      searchKeyword: '',
      isLoading: false,
      currentPage: 1,
      pageSize: 8,
      hasMore: true,

      // 表单数据
      consultForm: {
        name: '',
        phone: '',
        email: '',
        colorIndex: 0,
        remarks: ''
      },

      // 分类数据
      categories: [
        { id: 1, name: '全部', icon: '🎯' },
        { id: 2, name: '服装', icon: '👔' },
        { id: 3, name: '珠宝', icon: '✨' },
        { id: 4, name: '鞋履', icon: '👞' },
        { id: 5, name: '香水', icon: '🌸' }
      ],

      // 所有产品数据（模拟后端数据）
      allProducts: [
        // 服装系列
        {
          id: 1,
          name: '再生尼龙羽绒夹克',
          color: '棕色',
          price: '28,400',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400&q=80',
          categoryId: 2,
          isNew: true,
          isFavorite: false,
          colors: [
            { name: '棕色', value: '#8B4513' },
            { name: '黑色', value: '#000000' },
            { name: '深绿', value: '#2F5233' }
          ]
        },
        {
          id: 11,
          name: '纯羊毛针织衫',
          color: '米色',
          price: '12,800',
          image: 'https://images.unsplash.com/photo-1556821552-5f9c4d0c5a9d?w=400&q=80',
          categoryId: 2,
          isNew: true,
          isFavorite: false,
          colors: [
            { name: '米色', value: '#F5DEB3' },
            { name: '灰色', value: '#808080' }
          ]
        },
        {
          id: 12,
          name: '贴身棉质T恤',
          color: '白色',
          price: '6,900',
          image: 'https://images.unsplash.com/photo-1568826065481-e80fcf6a9398?w=400&q=80',
          categoryId: 2,
          isNew: false,
          isFavorite: false,
          colors: [
            { name: '白色', value: '#FFFFFF' },
            { name: '黑色', value: '#000000' },
            { name: '灰色', value: '#D3D3D3' }
          ]
        },
        {
          id: 13,
          name: '高腰直筒牛仔裤',
          color: '深蓝',
          price: '9,900',
          image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
          categoryId: 2,
          isNew: false,
          isFavorite: false,
          colors: [
            { name: '深蓝', value: '#00008B' },
            { name: '浅蓝', value: '#87CEEB' }
          ]
        },

        // 珠宝系列
        {
          id: 2,
          name: '精致珍珠项链',
          color: '银色',
          price: '18,900',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          categoryId: 3,
          isNew: true,
          isFavorite: false,
          colors: [
            { name: '银色', value: '#C0C0C0' },
            { name: '金色', value: '#FFD700' }
          ]
        },
        {
          id: 21,
          name: '钻石手镯',
          color: '白金',
          price: '45,800',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          categoryId: 3,
          isNew: true,
          isFavorite: false,
          colors: [
            { name: '白金', value: '#E8E8E8' },
            { name: '黄金', value: '#FFD700' }
          ]
        },
        {
          id: 22,
          name: '翡翠玉石耳坠',
          color: '深绿',
          price: '22,500',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          categoryId: 3,
          isNew: false,
          isFavorite: false,
          colors: [
            { name: '深绿', value: '#2F5233' },
            { name: '浅绿', value: '#90EE90' }
          ]
        },
        {
          id: 23,
          name: '珍珠戒指',
          color: '银色',
          price: '15,600',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
          categoryId: 3,
          isNew: false,
          isFavorite: false,
          colors: [
            { name: '银色', value: '#C0C0C0' }
          ]
        },

        // 鞋履系列
        {
          id: 3,
          name: '亮面牛皮革乐福鞋',
          color: '棕色',
          price: '10,300',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
          categoryId: 4,
          isNew: true,
          isFavorite: false,
          colors: [
            { name: '棕色', value: '#8B4513' },
            { name: '黑色', value: '#000000' }
          ]
        },
        {
          id: 31,
          name: '高跟皮鞋',
          color: '黑色',
          price: '12,800',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
          categoryId: 4,
          isNew: true,
          isFavorite: false,
          colors: [
            { name: '黑色', value: '#000000' },
            { name: '红色', value: '#FF0000' }
          ]
        },
        {
          id: 32,
          name: '运动休闲鞋',
          color: '白色',
          price: '8,900',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
          categoryId: 4,
          isNew: false,
          isFavorite: false,
          colors: [
            { name: '白色', value: '#FFFFFF' },
            { name: '灰色', value: '#808080' }
          ]
        },
        {
          id: 33,
          name: '长靴',
          color: '棕色',
          price: '16,500',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
          categoryId: 4,
          isNew: false,
          isFavorite: false,
          colors: [
            { name: '棕色', value: '#8B4513' },
            { name: '黑色', value: '#000000' }
          ]
        },

        // 香水系列
        {
          id: 4,
          name: '经典香水系列',
          color: '透明',
          price: '15,600',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
          categoryId: 5,
          isNew: false,
          isFavorite: false,
          colors: [
            { name: '透明', value: '#FFFFFF' },
            { name: '琥珀', value: '#FFBF00' }
          ]
        },
        {
          id: 41,
          name: '玫瑰香水',
          color: '粉色',
          price: '12,500',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
          categoryId: 5,
          isNew: true,
          isFavorite: false,
          colors: [
            { name: '粉色', value: '#FFB6C1' }
          ]
        },
        {
          id: 42,
          name: '花香调香水',
          color: '淡蓝',
          price: '14,800',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
          categoryId: 5,
          isNew: true,
          isFavorite: false,
          colors: [
            { name: '淡蓝', value: '#ADD8E6' }
          ]
        },
        {
          id: 43,
          name: '木质香水',
          color: '琥珀色',
          price: '16,900',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
          categoryId: 5,
          isNew: false,
          isFavorite: false,
          colors: [
            { name: '琥珀色', value: '#FFBF00' }
          ]
        }
      ],

      // 当前显示的产品（分页）
      displayProducts: []
    }
  },
  computed: {
    selectedCategoryName() {
      const category = this.categories.find(c => c.id === this.selectedCategory)
      return category ? category.name : '全部'
    }
  },
  mounted() {
    this.loadProducts()
  },
  methods: {
    // 选择分类
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
      this.currentPage = 1
      this.displayProducts = []
      this.hasMore = true
      this.loadProducts()
    },

    // 加载产品
    loadProducts() {
      this.isLoading = true

      // 模拟网络请求延迟
      setTimeout(() => {
        // 根据分类和搜索关键词过滤产品
        let filteredProducts = this.allProducts

        // 如果不是"全部"，按分类过滤
        if (this.selectedCategory !== 1) {
          filteredProducts = filteredProducts.filter(p => p.categoryId === this.selectedCategory)
        }

        // 按搜索关键词过滤
        if (this.searchKeyword.trim()) {
          const keyword = this.searchKeyword.toLowerCase()
          filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(keyword) ||
            p.color.toLowerCase().includes(keyword)
          )
        }

        // 分页处理
        const startIndex = (this.currentPage - 1) * this.pageSize
        const endIndex = startIndex + this.pageSize
        const pageProducts = filteredProducts.slice(startIndex, endIndex)

        // 添加到显示列表
        this.displayProducts = this.displayProducts.concat(pageProducts)

        // 检查是否还有更多数据
        this.hasMore = endIndex < filteredProducts.length

        this.isLoading = false
      }, 300)
    },

    // 加载更多
    loadMoreProducts() {
      this.currentPage++
      this.loadProducts()
    },

    // 搜索输入
    onSearchInput() {
      this.currentPage = 1
      this.displayProducts = []
      this.hasMore = true
      this.loadProducts()
    },

    // 选择产品
    onProductSelect(product) {
      this.selectedProduct = product
      this.consultForm = {
        name: '',
        phone: '',
        email: '',
        colorIndex: 0,
        remarks: ''
      }
    },

    // 切换收藏
    toggleFavorite(productId) {
      const productIndex = this.allProducts.findIndex(p => p.id === productId)
      if (productIndex !== -1) {
        this.$set(this.allProducts[productIndex], 'isFavorite', !this.allProducts[productIndex].isFavorite)

        // 同步到显示列表
        const displayIndex = this.displayProducts.findIndex(p => p.id === productId)
        if (displayIndex !== -1) {
          this.$set(this.displayProducts[displayIndex], 'isFavorite', this.allProducts[productIndex].isFavorite)
        }

        uni.showToast({
          title: this.allProducts[productIndex].isFavorite ? '已收藏' : '已移除收藏',
          icon: 'none',
          duration: 1000
        })
      }
    },

    // 颜色变化
    onColorChange(e) {
      this.consultForm.colorIndex = e.detail.value
    },

    // 提交咨询
    submitConsultation() {
      // 验证表单
      if (!this.consultForm.name.trim()) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return
      }

      if (!this.consultForm.phone.trim()) {
        uni.showToast({
          title: '请输入电话',
          icon: 'none'
        })
        return
      }

      // 验证电话格式
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.consultForm.phone)) {
        uni.showToast({
          title: '请输入有效的手机号码',
          icon: 'none'
        })
        return
      }

      // 提交表单
      uni.showToast({
        title: '咨询已提交，我们会尽快联系您',
        icon: 'success',
        duration: 2000
      })

      // 清空表单
      setTimeout(() => {
        this.selectedProduct = null
        this.consultForm = {
          name: '',
          phone: '',
          email: '',
          colorIndex: 0,
          remarks: ''
        }
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 120rpx;
  position: relative;
}

/* 页面头部 */
.header-section {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
    letter-spacing: 1rpx;
  }

  .subtitle {
    display: block;
    font-size: 28rpx;
    color: #666666;
    line-height: 1.5;
  }
}

/* 分类标签 */
.category-tabs {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;

  .tabs-scroll {
    white-space: nowrap;
    padding: 0 20rpx;
  }

  .tabs-wrapper {
    display: flex;
    gap: 0;
  }

  .tab-item {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 20rpx 24rpx;
    font-size: 26rpx;
    color: #999999;
    border-bottom: 4rpx solid transparent;
    white-space: nowrap;
    transition: all 0.3s ease;

    &.active {
      color: #000000;
      font-weight: 600;
      border-bottom-color: #000000;
    }

    .tab-icon {
      font-size: 28rpx;
    }

    .tab-name {
      display: block;
    }
  }
}

/* 搜索框 */
.search-bar {
  padding: 16rpx 20rpx;
  background: #ffffff;

  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 12rpx 16rpx;
    background: #f5f5f5;
    border-radius: 24rpx;

    .search-icon {
      font-size: 24rpx;
      color: #999999;
    }

    .search-input {
      flex: 1;
      font-size: 26rpx;
      color: #333333;
      background: transparent;
      border: none;
      outline: none;

      &::placeholder {
        color: #cccccc;
      }
    }
  }
}

/* 产品网格 */
.products-container {
  padding: 0 20rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300rpx;

  text {
    font-size: 28rpx;
    color: #999999;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.product-card {
  background: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
  cursor: pointer;

  &:active {
    opacity: 0.9;
  }

  .product-image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: #f5f5f5;
    overflow: hidden;

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
      position: absolute;
      top: 12rpx;
      right: 12rpx;
      padding: 6rpx 12rpx;
      background: #000000;
      color: #ffffff;
      font-size: 20rpx;
      font-weight: 600;
      border-radius: 4rpx;
    }

    .favorite-icon {
      position: absolute;
      top: 12rpx;
      left: 12rpx;
      font-size: 32rpx;
      cursor: pointer;
      z-index: 5;
    }
  }

  .product-info {
    padding: 16rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .product-name {
      display: block;
      font-size: 26rpx;
      color: #333333;
      font-weight: 500;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-color {
      display: block;
      font-size: 20rpx;
      color: #999999;
    }

    .product-price {
      display: block;
      font-size: 28rpx;
      color: #000000;
      font-weight: 600;
    }
  }

  .color-dots {
    padding: 0 16rpx 16rpx;
    display: flex;
    gap: 8rpx;

    .color-dot {
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      border: 2rpx solid #e0e0e0;
      cursor: pointer;
    }
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;

  .empty-text {
    font-size: 28rpx;
    color: #999999;
  }
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;

  .load-more-btn {
    padding: 16rpx 40rpx;
    background: #f5f5f5;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      background: #e0e0e0;
    }

    text {
      font-size: 26rpx;
      color: #333333;
      font-weight: 500;
    }
  }
}

/* 咨询表单（浮窗） */
.consultation-form {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 40rpx;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    background: #ffffff;

    .form-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #000000;
    }

    .close-btn {
      font-size: 40rpx;
      color: #999999;
      cursor: pointer;
    }
  }

  .form-content {
    padding: 24rpx 40rpx 80rpx;

    .product-preview {
      text-align: center;
      margin-bottom: 32rpx;
      padding: 20rpx;
      background: #f9f9f9;
      border-radius: 8rpx;

      image {
        width: 100%;
        max-height: 240rpx;
        object-fit: contain;
        margin-bottom: 12rpx;
      }

      .preview-name {
        display: block;
        font-size: 24rpx;
        color: #333333;
        font-weight: 500;
      }
    }

    .form-group {
      margin-bottom: 24rpx;

      .label {
        display: block;
        font-size: 26rpx;
        color: #333333;
        font-weight: 500;
        margin-bottom: 12rpx;
      }

      input,
      textarea {
        width: 100%;
        padding: 16rpx;
        font-size: 26rpx;
        border: 1px solid #e0e0e0;
        border-radius: 8rpx;
        color: #333333;
        background: #ffffff;

        &::placeholder {
          color: #cccccc;
        }

        &:focus {
          border-color: #000000;
          outline: none;
        }
      }

      textarea {
        min-height: 120rpx;
        resize: none;
      }

      .char-count {
        display: block;
        text-align: right;
        font-size: 20rpx;
        color: #999999;
        margin-top: 8rpx;
      }

      .picker-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16rpx;
        border: 1px solid #e0e0e0;
        border-radius: 8rpx;
        background: #ffffff;

        .picker-value {
          font-size: 26rpx;
          color: #333333;
        }

        .picker-arrow {
          font-size: 32rpx;
          color: #999999;
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 16rpx;
      margin-top: 32rpx;

      .cancel-btn,
      .submit-btn {
        flex: 1;
        padding: 20rpx;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 600;
        cursor: pointer;

        &:active {
          opacity: 0.9;
        }
      }

      .cancel-btn {
        background: #f5f5f5;
        color: #333333;
      }

      .submit-btn {
        background: #000000;
        color: #ffffff;
      }
    }
  }
}

/* 遮罩层 */
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
