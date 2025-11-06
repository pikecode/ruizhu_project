<template>
  <view class="page">
    <!-- 自定义顶部导航栏 -->
    <ConsultationNavbar :title="selectedCategoryName + '定制服务'" />

    <!-- 页面标题 -->
    <view class="header-section">
      <text class="title">专属定制服务</text>
      <text class="subtitle">选择您感兴趣的产品开启定制之旅</text>
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
            <text class="tab-name">{{ category.name }}</text>
          </view>
        </view>
      </scroll-view>
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

        <!-- 通用颜色选择（珠宝和香水产品除外） -->
        <view v-if="selectedProduct.categoryId !== 2 && selectedProduct.categoryId !== 4" class="form-group">
          <text class="label">颜色</text>
          <input v-model="consultForm.color" type="text" placeholder="请输入颜色，如：红色、黑色等" />
        </view>

        <!-- 服装类产品表单 -->
        <view v-if="selectedProduct.categoryId === 1" class="form-section">
          <view class="section-title">服装尺码信息</view>
          <view class="form-group">
            <text class="label">通用尺码 *</text>
            <view class="size-selector">
              <view
                v-for="size in ['XS', 'S', 'M', 'L', 'XL', 'XXL']"
                :key="size"
                :class="['size-btn', { active: consultForm.clothingSize === size }]"
                @tap="consultForm.clothingSize = size"
              >
                <text>{{ size }}</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="label">身高 (cm)</text>
            <input v-model="consultForm.height" type="number" placeholder="请输入身高，如170" />
          </view>
          <view class="form-group">
            <text class="label">体重 (kg)</text>
            <input v-model="consultForm.weight" type="number" placeholder="请输入体重，如65" />
          </view>
          <view class="form-group">
            <text class="label">胸围 (cm)</text>
            <input v-model="consultForm.chest" type="number" placeholder="请输入胸围" />
          </view>
          <view class="form-group">
            <text class="label">腰围 (cm)</text>
            <input v-model="consultForm.waist" type="number" placeholder="请输入腰围" />
          </view>
          <view class="form-group">
            <text class="label">臀围 (cm)</text>
            <input v-model="consultForm.hip" type="number" placeholder="请输入臀围" />
          </view>
        </view>

        <!-- 鞋履类产品表单 -->
        <view v-if="selectedProduct.categoryId === 3" class="form-section">
          <view class="section-title">鞋码信息</view>
          <view class="form-group">
            <text class="label">鞋码 (欧码) *</text>
            <input v-model="consultForm.shoeSize" type="text" placeholder="如：40, 41, 42等" />
          </view>
        </view>

        <!-- 珠宝类产品表单 - 直接使用备注说明定制需求 -->

        <view class="form-group">
          <text class="label">备注信息</text>
          <textarea
            v-model="consultForm.remarks"
            placeholder="请输入您的定制需求或特殊要求"
            maxlength="500"
          ></textarea>
          <text class="char-count">{{ consultForm.remarks.length }}/500</text>
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
import { getProducts } from '@/services/products'
import { submitConsultation } from '@/services/consultations'

export default {
  components: {
    ConsultationNavbar
  },
  data() {
    return {
      // UI状态
      selectedProduct: null,
      selectedCategory: 0, // 0表示全部
      searchKeyword: '',
      isLoading: false,
      currentPage: 1,
      pageSize: 8,
      hasMore: true,
      totalProducts: 0,

      // 表单数据
      consultForm: {
        name: '',
        phone: '',
        email: '',
        color: '',
        // 服装相关
        clothingSize: '',
        height: '',
        weight: '',
        chest: '',
        waist: '',
        hip: '',
        // 鞋子相关
        shoeSize: '',
        // 珠宝相关
        ringSize: '',
        jewelrySize: '',
        jewelryMaterial: '',
        // 香水相关
        perfumePreference: '',
        // 通用
        remarks: ''
      },

      // 分类数据
      categories: [
        { id: 0, name: '全部', icon: '🎯' },
        { id: 1, name: '服装', icon: '👔' },
        { id: 2, name: '珠宝', icon: '✨' },
        { id: 3, name: '鞋履', icon: '👞' },
        { id: 4, name: '香水', icon: '🌸' }
      ],

      // 所有产品数据（从API加载）
      allProducts: [],

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
    // 将后端产品数据转换为前端格式
    mapApiProductToFrontend(apiProduct) {
      // 默认颜色选项
      const defaultColors = [
        { name: '颜色选项', value: '#999999' }
      ]

      console.log('转换产品数据:', apiProduct)

      return {
        id: apiProduct.id,
        name: apiProduct.name,
        color: apiProduct.category || '标准款', // 使用 category 代替 subtitle
        price: apiProduct.price, // 已经是元为单位的格式
        image: apiProduct.image || 'https://via.placeholder.com/300',
        categoryId: apiProduct.categoryId,
        isNew: apiProduct.isNew || false,
        isFavorite: false,
        colors: defaultColors
      }
    },

    // 选择分类
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
      this.currentPage = 1
      this.displayProducts = []
      this.hasMore = true
      this.filterAndDisplayProducts()
    },

    // 加载产品（从API获取私人定制产品）
    async loadProducts() {
      this.isLoading = true
      console.log('[consultation] 开始加载产品...')

      try {
        // 构建查询选项
        const options = {
          page: this.currentPage,
          limit: this.pageSize,
          productType: 'custom' // 获取私人定制产品
        }

        console.log('[consultation] 查询选项:', options)

        // 调用API获取产品（不在API层面过滤，在前端过滤）
        const apiProducts = await getProducts(options)
        console.log('[consultation] 从API获取的产品数量:', apiProducts.length)
        console.log('[consultation] API返回的产品数据:', apiProducts)

        if (!apiProducts || apiProducts.length === 0) {
          console.warn('[consultation] 没有获取到私人定制产品')
        }

        // 转换数据格式
        const frontendProducts = apiProducts.map(p => this.mapApiProductToFrontend(p))
        console.log('[consultation] 转换后的产品数据:', frontendProducts)

        // 如果是第一页，替换数据；否则追加
        if (this.currentPage === 1) {
          this.allProducts = frontendProducts
        } else {
          this.allProducts = this.allProducts.concat(frontendProducts)
        }

        // 应用搜索和分类过滤
        this.filterAndDisplayProducts()

        console.log('[consultation] 当前显示产品数:', this.displayProducts.length)
        console.log('[consultation] 总产品数:', this.totalProducts)

      } catch (error) {
        console.error('[consultation] 加载产品失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    // 过滤和显示产品（根据搜索关键词和分类）
    filterAndDisplayProducts() {
      let filtered = this.allProducts

      // 1. 先按搜索关键词过滤
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(keyword) ||
          p.color.toLowerCase().includes(keyword)
        )
      }

      // 2. 再按分类过滤
      if (this.selectedCategory !== 0) {
        filtered = filtered.filter(p => p.categoryId === this.selectedCategory)
      }

      // 3. 更新显示的产品列表
      this.totalProducts = filtered.length
      this.displayProducts = filtered.slice(0, this.currentPage * this.pageSize)
      this.hasMore = this.displayProducts.length < this.totalProducts

      console.log('[consultation] 过滤后的产品数:', this.displayProducts.length)
    },

    // 加载更多
    loadMoreProducts() {
      this.currentPage++
      this.filterAndDisplayProducts()
    },

    // 搜索输入
    onSearchInput() {
      // 搜索时重置到第一页
      this.currentPage = 1
      this.filterAndDisplayProducts()
    },

    // 选择产品
    onProductSelect(product) {
      this.selectedProduct = product
      this.consultForm = {
        name: '',
        phone: '',
        email: '',
        color: '',
        // 服装相关
        clothingSize: '',
        height: '',
        weight: '',
        chest: '',
        waist: '',
        hip: '',
        // 鞋子相关
        shoeSize: '',
        // 珠宝相关
        ringSize: '',
        jewelrySize: '',
        jewelryMaterial: '',
        // 香水相关
        perfumePreference: '',
        // 通用
        remarks: ''
      }
    },

    // 切换收藏
    toggleFavorite(productId) {
      // 在所有产品中查找
      const productIndex = this.allProducts.findIndex(p => p.id === productId)
      if (productIndex !== -1) {
        const newFavoriteState = !this.allProducts[productIndex].isFavorite
        this.$set(this.allProducts[productIndex], 'isFavorite', newFavoriteState)

        // 同步到显示列表
        const displayIndex = this.displayProducts.findIndex(p => p.id === productId)
        if (displayIndex !== -1) {
          this.$set(this.displayProducts[displayIndex], 'isFavorite', newFavoriteState)
        }

        // 这里可以调用后端API保存收藏状态
        // await addToWishlist(productId) 或 removeFromWishlist(productId)

        uni.showToast({
          title: newFavoriteState ? '已收藏' : '已移除收藏',
          icon: 'none',
          duration: 1000
        })
      }
    },

    // 提交咨询
    async submitConsultation() {
      // 验证基础字段
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

      // 根据产品类别验证特定字段
      if (this.selectedProduct.categoryId === 1) {
        // 服装类 - 验证尺码选择
        if (!this.consultForm.clothingSize) {
          uni.showToast({
            title: '请选择尺码',
            icon: 'none'
          })
          return
        }
      } else if (this.selectedProduct.categoryId === 3) {
        // 鞋履类
        if (!this.consultForm.shoeSize.trim()) {
          uni.showToast({
            title: '请输入鞋码',
            icon: 'none'
          })
          return
        }
      }

      // 构建提交数据
      const submitData = {
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        categoryId: this.selectedProduct.categoryId,
        categoryName: this.selectedCategoryName,
        userName: this.consultForm.name.trim(),
        userPhone: this.consultForm.phone.trim(),
        userEmail: this.consultForm.email?.trim() || undefined,
        color: this.consultForm.color?.trim() || undefined,
        // 服装相关
        clothingSize: this.consultForm.clothingSize || undefined,
        height: this.consultForm.height?.trim() || undefined,
        weight: this.consultForm.weight?.trim() || undefined,
        chest: this.consultForm.chest?.trim() || undefined,
        waist: this.consultForm.waist?.trim() || undefined,
        hip: this.consultForm.hip?.trim() || undefined,
        // 鞋履相关
        shoeSize: this.consultForm.shoeSize?.trim() || undefined,
        // 珠宝相关
        ringSize: this.consultForm.ringSize?.trim() || undefined,
        jewelrySize: this.consultForm.jewelrySize?.trim() || undefined,
        jewelryMaterial: this.consultForm.jewelryMaterial?.trim() || undefined,
        // 香水相关
        perfumePreference: this.consultForm.perfumePreference?.trim() || undefined,
        // 通用
        remarks: this.consultForm.remarks?.trim() || undefined
      }

      try {
        uni.showLoading({
          title: '提交中...',
          mask: true
        })

        console.log('[consultation] 提交咨询数据:', submitData)

        // 调用提交咨询API
        await submitConsultation(submitData)

        uni.hideLoading()

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
            color: '',
            // 服装相关
            clothingSize: '',
            height: '',
            weight: '',
            chest: '',
            waist: '',
            hip: '',
            // 鞋子相关
            shoeSize: '',
            // 珠宝相关
            ringSize: '',
            jewelrySize: '',
            jewelryMaterial: '',
            // 香水相关
            perfumePreference: '',
            // 通用
            remarks: ''
          }
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        console.error('[consultation] 提交咨询失败:', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
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
  }

}

/* 尺码选择器 */
.size-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;

  .size-btn {
    padding: 12rpx 24rpx;
    background: #f5f5f5;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    color: #333333;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      opacity: 0.8;
    }

    &.active {
      background: #000000;
      color: #ffffff;
      border-color: #000000;
    }

    text {
      font-weight: 500;
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

    .form-section {
      margin-bottom: 24rpx;
      padding: 16rpx;
      background: #f9f9f9;
      border-radius: 8rpx;

      .section-title {
        font-size: 24rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 16rpx;
        padding-bottom: 12rpx;
        border-bottom: 2rpx solid #e0e0e0;
      }

      .form-group {
        margin-bottom: 16rpx;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

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
