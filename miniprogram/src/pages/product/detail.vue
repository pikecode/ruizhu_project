<template>
  <view class="detail-page">
    <!-- 手机号授权弹窗 -->
    <phone-auth-modal
      :visible="showPhoneAuthModal"
      :on-success="handlePhoneAuthSuccess"
      :on-cancel="handlePhoneAuthCancel"
      @close="showPhoneAuthModal = false"
    ></phone-auth-modal>

    <!-- 商品图片轮播 -->
    <swiper
      class="product-swiper"
      :indicator-dots="true"
      :indicator-color="indicatorColor"
      :indicator-active-color="indicatorActiveColor"
      @change="onImageChange"
    >
      <swiper-item v-for="(image, index) in productImages" :key="index">
        <image class="swiper-image" :src="image" mode="aspectFill"></image>
      </swiper-item>
    </swiper>

    <!-- 商品信息 -->
    <view class="product-info">
      <!-- 标题和价格 -->
      <text class="product-name">{{ productData.name }}</text>
      <view class="price-section">
        <text class="current-price">¥{{ productData.price }}</text>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 商品描述 -->
      <view class="description-section">
        <text class="section-title">商品描述</text>
        <text class="description-text">{{ productData.description }}</text>
      </view>

      <!-- 数量选择 - 只在非定制产品时显示 -->
      <view v-if="productData.productType !== 'custom'" class="quantity-section">
        <text class="section-title">数量</text>
        <view class="quantity-control">
          <view class="qty-btn" @tap="decreaseQuantity">−</view>
          <text class="qty-value">{{ quantity }}</text>
          <view class="qty-btn" @tap="increaseQuantity">+</view>
        </view>
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer-actions">
      <!-- 定制产品：只显示咨询按钮 -->
      <view v-if="productData.productType === 'custom'" class="action-btn consult-btn" @tap="openConsultation">
        <text>立即咨询</text>
      </view>

      <!-- 普通产品：显示加入购物袋和立即购买 -->
      <template v-else>
        <view class="action-btn add-cart" @tap="addToCart">
          <text>加入购物袋</text>
        </view>
        <view class="action-btn buy-now" @tap="buyNow">
          <text>立即购买</text>
        </view>
      </template>
    </view>

    <!-- 遮罩层 -->
    <view v-if="showConsultForm" class="mask" @tap="closeConsultation"></view>

    <!-- 咨询表单（浮窗） -->
    <view class="consultation-form" v-if="showConsultForm">
      <view class="form-header">
        <text class="form-title">定制咨询</text>
        <text class="close-btn" @tap="closeConsultation">✕</text>
      </view>

      <view class="form-content">
        <!-- 产品预览 -->
        <view class="product-preview">
          <image v-if="productImages && productImages.length > 0" :src="productImages[0]" mode="aspectFit"></image>
          <text class="preview-name">{{ productData.name }}</text>
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
        <view v-if="productData.categoryId !== 2 && productData.categoryId !== 4" class="form-group">
          <text class="label">颜色</text>
          <input v-model="consultForm.color" type="text" placeholder="请输入颜色，如：红色、黑色等" />
        </view>

        <!-- 服装类产品表单 -->
        <view v-if="productData.categoryId === 1" class="form-section">
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
        <view v-if="productData.categoryId === 3" class="form-section">
          <view class="section-title">鞋码信息</view>
          <view class="form-group">
            <text class="label">鞋码 (欧码) *</text>
            <input v-model="consultForm.shoeSize" type="text" placeholder="如：40, 41, 42等" />
          </view>
        </view>

        <view class="form-group">
          <text class="label">备注信息</text>
          <textarea
            v-model="consultForm.remarks"
            placeholder="请输入您的定制需求或特殊要求"
            maxlength="500"
          ></textarea>
          <text class="char-count">{{ (consultForm.remarks || '').length }}/500</text>
        </view>

        <!-- 提交按钮 -->
        <view class="form-actions">
          <view class="cancel-btn" @tap="closeConsultation">
            <text>取消</text>
          </view>
          <view class="submit-btn" @tap="submitConsultation">
            <text>提交咨询</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductDetail } from '../../services/products'
import { cartService } from '../../services/cart'
import { authService } from '../../services/auth'
import { api } from '../../services/api'
import { submitConsultation } from '../../services/consultations'
import PhoneAuthModal from '../../components/PhoneAuthModal.vue'

export default {
  components: {
    PhoneAuthModal
  },
  data() {
    return {
      indicatorColor: 'rgba(0, 0, 0, 0.3)',
      indicatorActiveColor: '#000000',
      currentImageIndex: 0,
      quantity: 1,
      isLoading: true,
      productImages: [],
      productData: {
        id: 0,
        name: '加载中...',
        price: '0',
        description: '加载中...'
      },
      showPhoneAuthModal: false,
      pendingAction: null,
      // 咨询表单相关
      showConsultForm: false,
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
      }
    }
  },
  async onLoad(options) {
    try {
      // 从URL参数获取产品ID
      const productId = options?.id || 1
      console.log('商品详情页加载，商品ID:', productId)

      // 从API获取商品详情
      const productDetail = await getProductDetail(parseInt(productId))

      console.log('getProductDetail返回的数据:', productDetail)

      if (productDetail) {
        // 绑定产品数据 - 合并coverImageUrl和images数组
        let images = []
        if (productDetail.coverImageUrl) {
          images.push(productDetail.coverImageUrl)
        }
        if (productDetail.images && productDetail.images.length > 0) {
          // 提取每个图片对象的imageUrl
          const imageUrls = productDetail.images.map(img => img.imageUrl)
          images.push(...imageUrls)
        }
        this.productImages = images

        // 处理价格数据：从price对象中提取currentPrice并转换单位（分→元）
        const priceData = productDetail.price
        const currentPrice = priceData?.currentPrice ? (priceData.currentPrice / 100).toFixed(2) : '0.00'
        const originalPrice = priceData?.originalPrice ? (priceData.originalPrice / 100).toFixed(2) : '0.00'

        this.productData = {
          id: productDetail.id,
          name: productDetail.name,
          price: currentPrice,
          originalPrice: originalPrice,
          description: productDetail.description,
          productType: productDetail.productType,  // 需要传递productType以便支付时检测VIP产品
          categoryId: productDetail.categoryId,  // 需要传递categoryId以便咨询表单显示对应的类别字段
          categoryName: productDetail.categoryName || ''  // 需要传递categoryName以便提交咨询时使用
        }

        console.log('绑定到页面的productData:', this.productData)
      } else {
        // 获取失败，显示错误提示
        uni.showToast({
          title: '商品加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('Failed to load product detail:', error)
      uni.showToast({
        title: '商品加载失败',
        icon: 'none'
      })
    } finally {
      this.isLoading = false
    }
  },
  methods: {
    /**
     * 检查用户是否已授权
     * 如果未授权，显示手机号授权弹窗
     * @param action 待执行的操作 ('addToCart' 或 'buyNow')
     * @returns 如果已授权返回 true，否则显示弹窗并返回 false
     */
    checkUserAuthorization(action) {
      if (authService.isLoggedIn()) {
        return true
      }

      // 用户未登录，显示手机号授权弹窗
      this.pendingAction = action
      this.showPhoneAuthModal = true
      return false
    },

    /**
     * 手机号授权成功回调
     */
    handlePhoneAuthSuccess() {
      // 调试：确认回调被执行
      console.log('🔐 handlePhoneAuthSuccess 被调用')
      console.log('当前登录状态 (isLoggedIn):', authService.isLoggedIn())
      console.log('accessToken 值:', uni.getStorageSync('accessToken') ? '存在' : '不存在')

      // 授权成功，继续执行之前的操作
      const action = this.pendingAction
      this.pendingAction = null

      console.log('待执行的操作:', action)

      if (action === 'addToCart') {
        this.proceedAddToCart()
      } else if (action === 'buyNow') {
        this.proceedBuyNow()
      } else if (action === 'testPayment') {
        console.log('✓ 执行 proceedTestPayment')
        this.proceedTestPayment()
      }
    },

    /**
     * 手机号授权取消回调
     */
    handlePhoneAuthCancel() {
      this.pendingAction = null
      uni.showToast({
        title: '已取消授权',
        icon: 'none',
        duration: 1500
      })
    },

    onImageChange(e) {
      this.currentImageIndex = e.detail.current
    },
    increaseQuantity() {
      this.quantity++
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    addToCart() {
      // 检查用户是否已授权
      if (!this.checkUserAuthorization('addToCart')) {
        return
      }

      // 用户已授权，执行添加购物车操作
      this.proceedAddToCart()
    },

    /**
     * 执行添加购物车操作
     */
    async proceedAddToCart() {
      try {
        uni.showLoading({
          title: '添加中...'
        })

        // 调用API添加到购物车
        const result = await cartService.addToCart(
          this.productData.id,
          this.quantity
        )

        uni.hideLoading()

        if (result) {
          uni.showToast({
            title: `已添加 ${this.quantity} 件到购物袋`,
            icon: 'success',
            duration: 1500
          })

          // 延迟后跳转到购物车
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/cart/cart'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: '添加失败，请重试',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to add to cart:', error)

        // 获取错误信息和错误类型
        let errorMsg = ''
        let errorType = ''
        if (error instanceof Error) {
          errorMsg = error.message || ''
          errorType = (error as any).errorType || ''
        } else if (typeof error === 'string') {
          errorMsg = error
        } else {
          errorMsg = JSON.stringify(error)
        }

        console.log('🛒 [AddToCart] 错误消息:', errorMsg)
        console.log('🛒 [AddToCart] 错误类型:', errorType)

        // 根据错误类型或消息文本判断
        if (errorMsg.includes('登录过期') || errorMsg.includes('401')) {
          // 显示手机号授权弹窗
          this.pendingAction = 'addToCart'
          this.showPhoneAuthModal = true
        } else if (errorType === 'INSUFFICIENT_STOCK' || errorMsg.includes('库存不足')) {
          // 处理库存不足的智能提示
          this.handleInsufficientStock(errorMsg)
        } else {
          uni.showToast({
            title: errorMsg || '添加失败，请重试',
            icon: 'none'
          })
        }
      }
    },

    /**
     * 处理库存不足情况的智能提示
     */
    handleInsufficientStock(errorMsg) {
      console.log('📦 [Stock] 库存不足提示:', errorMsg)

      // 首先显示 Toast 提示
      uni.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 1500
      })

      // 延迟后显示模态框让用户选择
      setTimeout(() => {
        uni.showModal({
          title: '库存提示',
          content: errorMsg || '您选择的数量超过可用库存，请调整数量或查看购物车',
          confirmText: '查看购物车',
          cancelText: '继续购物',
          success: (res) => {
            if (res.confirm) {
              // 用户选择查看购物车
              console.log('📦 [Stock] 用户选择查看购物车')
              uni.switchTab({
                url: '/pages/cart/cart'
              })
            } else {
              // 用户选择继续购物，保持在当前页面
              console.log('📦 [Stock] 用户选择继续购物')
              uni.showToast({
                title: '您可以调整数量后重试',
                icon: 'none',
                duration: 1500
              })
            }
          }
        })
      }, 500)
    },
    buyNow() {
      // 检查用户是否已授权
      if (!this.checkUserAuthorization('buyNow')) {
        return
      }

      // 用户已授权，执行立即购买操作
      this.proceedBuyNow()
    },

    /**
     * 执行立即购买操作 - 直接生成订单，不涉及购物车
     * 购物车是独立的功能，与立即购买流程无关
     */
    async proceedBuyNow() {
      try {
        // 先检查库存 - 通过尝试添加到购物车来验证库存
        // 这样可以提前检测库存问题，而不需要修改API
        try {
          await cartService.addToCart(this.productData.id, this.quantity)
          // 添加成功后不需要保留在购物车中，只是用于验证
          // 实际上后续流程中我们会直接生成购买订单
        } catch (validationError) {
          // 库存验证失败，显示对话框并返回
          const errorMsg = validationError.message || ''
          const errorType = (validationError as any).errorType || ''
          if (errorType === 'INSUFFICIENT_STOCK' || errorMsg.includes('库存不足')) {
            this.handleInsufficientStock(errorMsg)
            return
          }
          throw validationError // 其他错误继续抛出
        }

        uni.showLoading({
          title: '正在跳转...'
        })

        // 直接生成订单对象，仅包含当前商品
        const buyNowOrder = {
          items: [
            {
              id: this.productData.id,
              name: this.productData.name,
              price: Math.round(parseFloat(this.productData.price) * 100),  // 从productData获取元，转换为分（乘以100后四舍五入）
              quantity: this.quantity,
              image: this.productImages[0] || '',
              color: '默认',
              productType: this.productData.productType  // 添加productType以便支付时检测VIP产品
            }
          ],
          source: 'buyNow'  // 标记为立即购买来源
        }

        // 保存到本地存储供结账页面使用
        uni.setStorageSync('buyNowOrder', buyNowOrder)
        console.log('✅ [BuyNow] 订单已生成并保存:', buyNowOrder)

        uni.hideLoading()

        // 直接跳转到结算页面，不显示toast
        uni.navigateTo({
          url: '/pages/checkout/checkout'
        })
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to proceed with purchase:', error)

        // 获取错误信息和错误类型
        let errorMsg = ''
        let errorType = ''
        if (error instanceof Error) {
          errorMsg = error.message || ''
          errorType = (error as any).errorType || ''
        } else if (typeof error === 'string') {
          errorMsg = error
        } else {
          errorMsg = JSON.stringify(error)
        }

        console.log('🛒 [BuyNow] 错误消息:', errorMsg)
        console.log('🛒 [BuyNow] 错误类型:', errorType)

        // 根据错误类型或消息文本判断
        if (errorMsg.includes('登录过期') || errorMsg.includes('401')) {
          // 显示手机号授权弹窗
          this.pendingAction = 'buyNow'
          this.showPhoneAuthModal = true
        } else if (errorType === 'INSUFFICIENT_STOCK' || errorMsg.includes('库存不足')) {
          // 显示库存不足对话框
          this.handleInsufficientStock(errorMsg)
        } else {
          uni.showToast({
            title: errorMsg || '操作失败，请重试',
            icon: 'none'
          })
        }
      }
    },

    /**
     * 测试支付 - 检查授权
     */
    testPayment() {
      // 检查用户是否已授权
      if (!this.checkUserAuthorization('testPayment')) {
        return
      }
      // 授权通过，继续执行实际的支付流程
      this.proceedTestPayment()
    },

    /**
     * 执行测试支付 - 使用 0.01 元金额测试 WeChat 支付流程
     */
    async proceedTestPayment() {
      uni.showLoading({
        title: '正在初始化支付...'
      })

      try {
        // 获取用户信息用于API调用
        const userInfo = uni.getStorageSync('userInfo') || {}
        // 获取令牌 - 使用正确的键名 'accessToken'
        const token = uni.getStorageSync('accessToken')

        // 调试：检查token是否存在
        console.log('proceedTestPayment - 获取的token:', token ? '存在' : '不存在')
        console.log('当前登录状态 (isLoggedIn):', authService.isLoggedIn())

        if (!token) {
          uni.hideLoading()
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        // 调用后端 API 创建支付订单
        // 使用 0.01 元作为测试金额
        const responseData = await api.post('/checkout', {
          items: [
            {
              productId: 1,
              quantity: 1,
              price: 0.01  // 测试金额：0.01 元 (1分)
            }
          ],
          addressId: 1,
          paymentMethod: 'wechat'
        })

        uni.hideLoading()

        console.log('API 响应:', responseData)

        if (responseData) {
          const orderData = responseData.order
          const paymentData = responseData.payment

          console.log('订单创建成功:', orderData)
          console.log('支付参数获取成功:', paymentData)

          // 调用微信支付（使用后端直接返回的支付参数）
          wx.requestPayment({
            timeStamp: paymentData.timeStamp,
            nonceStr: paymentData.nonceStr,
            package: `prepay_id=${paymentData.prepayId}`,
            signType: paymentData.signType || 'MD5',
            paySign: paymentData.paySign,
            success: (res) => {
              console.log('支付成功:', res)
              uni.showToast({
                title: '支付成功！',
                icon: 'success',
                duration: 2000
              })

              // 查询支付状态 - 使用订单号（orderNo）而不是 ID
              setTimeout(() => {
                this.queryPaymentStatus(orderData.orderNo, token)
              }, 500)
            },
            fail: (err) => {
              console.log('支付失败:', err)
              uni.showToast({
                title: '支付已取消',
                icon: 'none',
                duration: 1500
              })
            }
          })
        } else {
          uni.showToast({
            title: '创建订单失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('支付测试出错:', error)
        uni.showToast({
          title: '支付测试出错，请检查网络',
          icon: 'none'
        })
      }
    },

    /**
     * 查询支付状态 - 使用订单号查询
     */
    async queryPaymentStatus(orderNumber, token) {
      try {
        const result = await api.get(`/checkout/payment-status?orderNumber=${orderNumber}`)

        console.log('支付状态查询结果:', result)

        if (result) {
          if (result.status === 'paid' || result.paymentStatus === 'completed') {
            uni.showToast({
              title: '订单已支付',
              icon: 'success',
              duration: 1500
            })
          } else {
            uni.showToast({
              title: `订单状态: ${result.status}`,
              icon: 'none'
            })
          }
        } else {
          console.warn('支付状态查询失败')
        }
      } catch (error) {
        console.error('查询支付状态异常:', error)
      }
    },

    /**
     * 打开咨询表单
     */
    openConsultation() {
      this.showConsultForm = true
      // 重置表单
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

    /**
     * 关闭咨询表单
     */
    closeConsultation() {
      this.showConsultForm = false
    },

    /**
     * 提交咨询
     */
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
      if (this.productData.categoryId === 1) {
        // 服装类 - 验证尺码选择
        if (!this.consultForm.clothingSize) {
          uni.showToast({
            title: '请选择尺码',
            icon: 'none'
          })
          return
        }
      } else if (this.productData.categoryId === 3) {
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
        productId: this.productData.id,
        productName: this.productData.name,
        categoryId: this.productData.categoryId,
        categoryName: this.productData.categoryName,
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

        console.log('[detail] 提交咨询数据:', submitData)

        // 调用提交咨询API
        await submitConsultation(submitData)

        uni.hideLoading()

        uni.showToast({
          title: '咨询已提交，我们会尽快联系您',
          icon: 'success',
          duration: 2000
        })

        // 关闭表单
        setTimeout(() => {
          this.closeConsultation()
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        console.error('[detail] 提交咨询失败:', error)
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
.detail-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 160rpx;
}

/* 商品图片轮播 */
.product-swiper {
  width: 100%;
  height: 800rpx;
  background: #f5f5f5;
}

.swiper-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息 */
.product-info {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;

  .product-name {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 24rpx;
    line-height: 1.4;
  }

  .price-section {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin-bottom: 24rpx;

    .current-price {
      display: block;
      font-size: 40rpx;
      font-weight: 700;
      color: #000000;
    }
  }

  .divider {
    height: 1px;
    background: #f0f0f0;
    margin: 24rpx 0;
  }

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 20rpx;
  }

  .description-section {
    margin-bottom: 24rpx;

    .description-text {
      display: block;
      font-size: 26rpx;
      color: #666666;
      line-height: 1.6;
    }
  }

  .quantity-section {
    margin-bottom: 24rpx;

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 12rpx;
      width: fit-content;

      .qty-btn {
        width: 44rpx;
        height: 44rpx;
        border: 1px solid #e0e0e0;
        border-radius: 4rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        color: #666666;
        cursor: pointer;

        &:active {
          opacity: 0.8;
        }
      }

      .qty-value {
        min-width: 60rpx;
        text-align: center;
        font-size: 26rpx;
        color: #000000;
      }
    }
  }

}

/* 底部操作按钮 */
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  z-index: 99;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 600;
    cursor: pointer;
    min-width: 0;

    &:active {
      opacity: 0.9;
    }
  }

  .add-cart {
    background: #f5f5f5;
    color: #000000;
  }

  .buy-now {
    background: #000000;
    color: #ffffff;
  }

  .consult-btn {
    background: #000000;
    color: #ffffff;
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
      margin-bottom: 32rpx;

      .label {
        display: block;
        font-size: 28rpx;
        color: #333333;
        font-weight: 500;
        margin-bottom: 16rpx;
      }

      input,
      textarea {
        width: 100%;
        padding: 24rpx 20rpx;
        font-size: 28rpx;
        line-height: 1.5;
        border: 2rpx solid #e0e0e0;
        border-radius: 12rpx;
        color: #333333;
        background: #ffffff;
        box-sizing: border-box;
        min-height: 88rpx;

        &::placeholder {
          color: #cccccc;
        }

        &:focus {
          border-color: #000000;
          outline: none;
        }
      }

      textarea {
        min-height: 160rpx;
        resize: none;
        padding: 20rpx;
      }

      .char-count {
        display: block;
        text-align: right;
        font-size: 22rpx;
        color: #999999;
        margin-top: 12rpx;
      }
    }

    .form-section {
      margin-bottom: 32rpx;
      padding: 24rpx;
      background: #f9f9f9;
      border-radius: 12rpx;

      .section-title {
        font-size: 26rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 20rpx;
        padding-bottom: 16rpx;
        border-bottom: 2rpx solid #e0e0e0;
      }

      .form-group {
        margin-bottom: 24rpx;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .size-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .size-btn {
        padding: 16rpx 28rpx;
        background: #ffffff;
        border: 2rpx solid #e0e0e0;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #333333;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 80rpx;

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
