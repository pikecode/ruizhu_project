<template>
  <view class="page">
   
    <!-- 费用明细 -->
    <view class="fee-summary-section">
      <view class="section-title">费用明细</view>
      <view class="fee-item">
        <text class="fee-label">商品小计</text>
        <text class="fee-value">¥{{ subtotal }}</text>
      </view>
      <view v-if="discountAmount > 0" class="fee-item discount">
        <text class="fee-label">VIP折扣 ({{ discountPercent }}%)</text>
        <text class="fee-value">-¥{{ discountAmount }}</text>
      </view>
      <view class="fee-item total">
        <text class="fee-label">应付金额</text>
        <text class="fee-value">¥{{ totalAmount }}</text>
      </view>
    </view>

    <!-- 微信支付说明 -->
    <view class="payment-methods-section">
      <view class="section-title">支付方式</view>
      <view class="wechat-payment-info">
        <view class="method-icon">微</view>
        <view class="method-details">
          <text class="method-name">微信支付</text>
          <text class="method-desc">使用微信钱包安全快捷支付</text>
        </view>
      </view>
    </view>

    <!-- 订单信息预览 -->
    <view class="order-summary-section">
      <view class="section-title">订单信息</view>
      <view class="summary-item">
        <text class="label">订单号</text>
        <text class="value">{{ orderId }}</text>
      </view>
      <view class="summary-item">
        <text class="label">商品数量</text>
        <text class="value">{{ itemCount }} 件</text>
      </view>
      <view class="summary-item">
        <text class="label">配送地址</text>
        <text class="value">{{ address }}</text>
      </view>
    </view>

    <!-- 底部支付按钮 -->
    <view class="payment-footer">
      <view class="payment-btn" @tap="processPayment">
        <text>确认支付 ¥{{ totalAmount }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import wechatPaymentService from '../../services/wechatPayment'
import ordersService from '../../services/orders'
import usersService from '../../services/users'
import * as productsService from '../../services/products'

export default {
  data() {
    return {
      totalAmount: '0',
      subtotal: '0',
      discountAmount: '0',
      discountPercent: 0,
      itemCount: 0,
      address: '',
      orderId: '',
      order: null,
      isLoading: false,
      memberProductDiscount: null  // 存储会员产品的折扣值
    }
  },
  onLoad() {
    this.loadPaymentInfo()
  },
  methods: {
    loadPaymentInfo() {
      try {
        const order = uni.getStorageSync('currentOrder')
        console.log('📡 [Payment] 加载订单信息:', order)

        if (order) {
          this.order = order
          this.itemCount = order.items ? order.items.length : 0

          // 计算小计（从order.items中推导）
          // order.items 中的 price 是以分为单位的
          const subtotalInFen = order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0
          const subtotalInYuan = subtotalInFen / 100
          this.subtotal = subtotalInYuan.toFixed(2)

          // 从本地存储读取用户折扣信息
          console.log('👤 [Payment] 从本地存储读取用户信息...')
          let userInfo = uni.getStorageSync('user')
          console.log('👤 [Payment] 原始用户信息:', userInfo)
          console.log('👤 [Payment] 原始用户信息类型:', typeof userInfo)

          let userDiscount = 1.0  // 默认无折扣

          // 处理可能被存储为字符串的 JSON 数据
          if (typeof userInfo === 'string') {
            console.warn('⚠️ [Payment] 用户信息被存储为字符串，需要解析')
            try {
              userInfo = JSON.parse(userInfo)
              console.log('✅ [Payment] 用户信息已解析为对象:', JSON.stringify(userInfo))
            } catch (e) {
              console.error('❌ [Payment] 解析用户信息失败:', e)
              userInfo = {}
            }
          }

          console.log('👤 [Payment] 解析后的用户信息:', JSON.stringify(userInfo))
          console.log('👤 [Payment] userInfo.discount 值:', userInfo?.discount)

          if (userInfo && userInfo.discount) {
            userDiscount = parseFloat(userInfo.discount)
            console.log('💳 [Payment] 用户折扣倍数:', userDiscount)
          } else {
            console.warn('⚠️ [Payment] 用户没有折扣，使用默认值 1.0')
          }

          // 根据用户折扣计算最终应付金额
          const finalAmount = subtotalInYuan * userDiscount
          this.totalAmount = finalAmount.toFixed(2)

          // 计算折扣金额 = 小计 - 最终应付
          const discount = (subtotalInYuan - finalAmount).toFixed(2)
          this.discountAmount = discount

          // 计算折扣百分比
          if (subtotalInYuan > 0 && discount > 0) {
            this.discountPercent = Math.round(((subtotalInYuan - finalAmount) / subtotalInYuan) * 100)
          } else {
            this.discountPercent = 0
          }

          // 安全地处理地址信息
          if (order.address && typeof order.address === 'object') {
            const city = order.address.city || ''
            const district = order.address.district || ''
            this.address = `${city} ${district}`.trim()
          } else {
            this.address = '地址待完善'
          }

          this.orderId = order.orderId
          console.log('✅ [Payment] 订单信息加载成功')
          console.log('💰 [Payment] 小计:', this.subtotal, '折扣:', this.discountAmount, '折扣百分比:', this.discountPercent + '%', '应付:', this.totalAmount)
        } else {
          console.warn('⚠️ [Payment] 订单信息为空')
        }
      } catch (e) {
        console.error('❌ Failed to load payment info:', e)
        uni.showToast({
          title: '加载订单信息失败',
          icon: 'none'
        })
      }
    },
    async processPayment() {
      if (!this.order) {
        uni.showToast({
          title: '订单信息缺失',
          icon: 'none'
        })
        return
      }

      if (this.isLoading) return
      this.isLoading = true

      try {
        // 验证订单信息完整性
        if (!this.order || !this.order.orderId) {
          console.error('❌ [Payment] 订单信息不完整:', this.order)
          uni.showToast({
            title: '订单号缺失，无法发起支付',
            icon: 'none'
          })
          this.isLoading = false
          return
        }

        // 获取用户的 openid
        const openid = uni.getStorageSync('openId')
        if (!openid) {
          uni.showToast({
            title: '缺少微信认证信息，请重新登录',
            icon: 'none'
          })
          this.isLoading = false
          return
        }

        // 调用后端创建支付订单
        console.log('📡 [Payment] 正在请求支付订单...')
        console.log('📡 [Payment] 订单ID:', this.order.orderId)
        console.log('📡 [Payment] 订单对象:', this.order)

        // 从本地存储获取用户信息以获取userId
        const userStr = uni.getStorageSync('user')
        let userId = null
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            userId = user.id
            console.log('📡 [Payment] 从本地存储获取userId:', userId)
          } catch (e) {
            console.warn('⚠️ [Payment] 解析用户信息失败:', e)
          }
        }

        if (!userId) {
          uni.showToast({
            title: '无法获取用户ID，无法进行支付',
            icon: 'none'
          })
          this.isLoading = false
          return
        }

        // 使用折扣后的金额（this.totalAmount）而不是原始订单金额
        const finalPaymentAmount = Math.round(parseFloat(this.totalAmount) * 100) // 转换为分
        console.log('💰 [Payment] 最终支付金额（元）:', this.totalAmount, '转换为分:', finalPaymentAmount)

        const paymentOrder = await wechatPaymentService.createPaymentOrder({
          openid,
          outTradeNo: this.order.orderId,
          totalFee: finalPaymentAmount, // 使用折扣后的金额
          body: `订单 ${this.order.orderId}`,
          metadata: {
            orderId: this.order.id,
            userId: userId
          }
        })

        if (!paymentOrder) {
          uni.showToast({
            title: '创建支付订单失败',
            icon: 'none'
          })
          return
        }

        console.log('📡 [Payment] 支付参数:', paymentOrder)

        // 在支付前，检查订单是否包含会员产品，如果有则准备更新 discount
        this.prepareMemberProductDiscount()

        // 调起微信支付
        this.requestWechatPayment(paymentOrder)
      } catch (error) {
        console.error('Failed to process payment:', error)
        uni.showToast({
          title: error.message || '支付失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },
    // 准备会员产品折扣信息
    // 从后端返回的订单项中读取产品类型和折扣（存储在 selectedAttributes 中）
    prepareMemberProductDiscount() {
      try {
        if (!this.order || !this.order.items || this.order.items.length === 0) {
          console.log('📡 [Payment] 订单无商品，无需准备会员折扣')
          return
        }

        console.log('📡 [Payment] 开始检查订单中的会员产品...')
        console.log('📡 [Payment] 订单项数据:', JSON.stringify(this.order.items))

        // 遍历订单项，检查是否有会员产品
        for (const item of this.order.items) {
          // 从多个可能的字段中获取产品类型（支持不同的数据结构）
          let productType = ''

          // 首先尝试从 selectedAttributes 中获取（这是后端保存的地方）
          if (item.selectedAttributes && typeof item.selectedAttributes === 'object') {
            productType = item.selectedAttributes.productType || ''
          }

          // 其次尝试直接字段
          if (!productType) {
            productType = item.productType || item.type || ''
          }

          console.log('📡 [Payment] 检查产品项:', {
            productId: item.productId,
            productName: item.productName,
            productType,
            selectedAttributes: item.selectedAttributes
          })

          // 检查是否是会员产品
          const isMemberProduct = productType.toLowerCase().includes('vip') ||
                                 productType.toLowerCase().includes('recharge') ||
                                 productType.toLowerCase().includes('member')

          if (isMemberProduct) {
            // 尝试从 selectedAttributes 中获取折扣
            let discount = null
            if (item.selectedAttributes && typeof item.selectedAttributes === 'object') {
              discount = item.selectedAttributes.discount
            }

            // 其次尝试直接字段
            if (!discount) {
              discount = item.discount
            }

            if (discount) {
              this.memberProductDiscount = parseFloat(discount)
              console.log('🎁 [Payment] 找到会员产品，折扣倍数:', this.memberProductDiscount)
              console.log('🎁 [Payment] 产品类型:', productType)
              break  // 只取第一个会员产品
            }
          }
        }
      } catch (error) {
        console.error('❌ [Payment] 准备会员折扣时出错:', error)
      }
    },

    requestWechatPayment(paymentData) {
      console.log('📡 [Payment] 调起微信支付，参数:', {
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.prepayId ? `prepay_id=${paymentData.prepayId}` : 'prepay_id=mock',
        signType: paymentData.signType || 'MD5',
        paySign: '***'
      })

      wx.requestPayment({
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: `prepay_id=${paymentData.prepayId}`,
        signType: paymentData.signType || 'MD5',
        paySign: paymentData.paySign,
        success: async (res) => {
          console.log('✅ [Payment] 微信支付成功:', res)

          // 立即标记订单为已支付（在显示成功提示时同步更新）
          try {
            if (this.order && this.order.id) {
              console.log('📡 [Payment] 开始调用 markOrderAsPaid 接口...')
              console.log('📡 [Payment] 订单ID:', this.order.id)
              console.log('📡 [Payment] 订单对象:', JSON.stringify(this.order))

              console.log('📡 [Payment] ordersService 已加载，即将调用 markOrderAsPaid')
              console.log('📡 [Payment] 调用参数: orderId=' + this.order.id)

              const response = await ordersService.markOrderAsPaid(this.order.id)

              console.log('✅ [Payment] markOrderAsPaid 接口调用成功!')
              console.log('✅ [Payment] 响应数据:', JSON.stringify(response))
              console.log('✅ [Payment] 订单状态:', response?.status || '未知')

              if (response && response.id) {
                console.log('✅ [Payment] 订单数据已更新: id=' + response.id + ', status=' + response.status + ', paidAt=' + response.paidAt)
              }
            } else {
              console.warn('⚠️ [Payment] 订单信息缺失: order=' + JSON.stringify(this.order))
            }
          } catch (error) {
            console.error('❌ [Payment] 调用 markOrderAsPaid 接口异常!')
            console.error('❌ [Payment] 错误类型:', typeof error)
            console.error('❌ [Payment] 错误消息:', error?.message || '(无消息)')
            console.error('❌ [Payment] 错误代码:', error?.code || '(无代码)')
            console.error('❌ [Payment] 完整错误:', JSON.stringify(error))
            if (error?.response) {
              console.error('❌ [Payment] HTTP 响应状态:', error.response.status)
              console.error('❌ [Payment] HTTP 响应体:', JSON.stringify(error.response.data))
            }
            // 不阻止支付流程，继续进行
          }

          // 支付成功后查询订单状态确认
          console.log('📡 [Payment] 微信回调处理完成，开始确认支付状态...')
          await this.confirmPaymentSuccess(paymentData.outTradeNo)
        },
        fail: (err) => {
          console.error('❌ [Payment] 微信支付失败:', err)
          if (err.errMsg?.includes('cancel')) {
            uni.showToast({
              title: '已取消支付',
              icon: 'none'
            })
          } else {
            uni.showToast({
              title: '支付失败，请重试',
              icon: 'none'
            })
          }
        }
      })
    },
    async confirmPaymentSuccess(outTradeNo, retryCount = 0, maxRetries = 5) {
      try {
        // 获取用户的 openid
        const openid = uni.getStorageSync('openId')

        // 查询支付状态确认
        console.log(`📡 [Payment] 查询支付状态... (重试 ${retryCount}/${maxRetries})`)
        const status = await wechatPaymentService.queryPaymentStatus(outTradeNo, openid)
        console.log('📡 [Payment] 支付状态查询结果:', status)

        if (status === 'success') {
          console.log('📡 [Payment] 支付状态已确认为成功，开始更新订单状态...')

          // 再次确保订单状态已更新（作为补充保障，以防前面的调用失败）
          try {
            if (this.order && this.order.id) {
              console.log('📡 [Payment] 再次调用 markOrderAsPaid 确保订单状态已更新...')
              const updateResponse = await ordersService.markOrderAsPaid(this.order.id)
              console.log('✅ [Payment] 订单状态更新成功:', updateResponse?.status)
            }
          } catch (error) {
            console.warn('⚠️ [Payment] 订单状态更新失败 (可能已由前面的调用更新):', error?.message)
          }

          uni.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 1500
          })

          // 从后端刷新最新的订单信息（订单状态已由前面的调用或微信回调更新）
          let freshOrder = null
          try {
            if (this.order && this.order.id) {
              console.log('📡 [Payment] 从后端刷新订单信息...')
              freshOrder = await ordersService.getOrderDetail(this.order.id)
              if (freshOrder) {
                console.log('✅ [Payment] 订单已从后端刷新:', JSON.stringify(freshOrder))
                console.log('✅ [Payment] 订单最新状态:', freshOrder.status, '支付状态:', freshOrder.paymentStatus)
              }
            }
          } catch (error) {
            console.warn('⚠️ [Payment] 刷新订单信息失败:', error?.message)
          }

          // 从订单的 productIds 字段查找会员充值产品，提取其 discount，更新用户的 discount
          try {
            console.log('📡 [Payment] 从订单 productIds 中查找会员充值产品...')

            let memberDiscount = null

            // 检查订单是否有 productIds 字段（用分号分隔的产品ID，如 "56;2;3"）
            if (freshOrder && freshOrder.productIds && typeof freshOrder.productIds === 'string') {
              const productIds = freshOrder.productIds
                .split(';')
                .map(id => parseInt(id.trim(), 10))
                .filter(id => !isNaN(id))

              console.log('📡 [Payment] 从 productIds 提取的产品ID:', productIds)

              // 遍历每个产品ID，查询产品信息以找到会员充值产品
              for (const productId of productIds) {
                try {
                  console.log('📡 [Payment] 查询产品信息: productId=' + productId)
                  const product = await productsService.getProductDetail(productId)

                  if (product) {
                    console.log('📡 [Payment] 产品信息:', {
                      id: product.id,
                      name: product.name,
                      productType: product.productType,
                      discount: product.discount
                    })

                    // 检查是否是会员充值产品，并有 discount 信息
                    if (product.productType === 'vip_recharge' && product.discount) {
                      memberDiscount = product.discount
                      console.log('✅ [Payment] 找到会员充值产品折扣:', memberDiscount)
                      break
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ [Payment] 查询产品信息失败 (productId=' + productId + '):', error?.message)
                  // 继续查询下一个产品
                }
              }
            } else {
              console.log('📡 [Payment] 订单中没有 productIds 字段，跳过折扣查询')
            }

            // 如果找到了会员折扣，则更新用户信息
            if (memberDiscount !== null) {
              let userInfo = uni.getStorageSync('user')

              // 处理可能被存储为字符串的 JSON 数据
              if (typeof userInfo === 'string') {
                try {
                  userInfo = JSON.parse(userInfo)
                } catch (e) {
                  console.warn('⚠️ [Payment] 解析用户信息失败，使用空对象')
                  userInfo = {}
                }
              }

              if (userInfo && userInfo.id) {
                userInfo.discount = memberDiscount
                uni.setStorageSync('user', userInfo)
                uni.setStorageSync('userInfo', userInfo)
                console.log('✅ [Payment] 用户折扣已更新:', memberDiscount)
                console.log('✅ [Payment] 完整用户数据:', JSON.stringify(userInfo))
              }
            } else {
              console.log('📡 [Payment] 订单中没有会员充值产品或产品没有折扣信息，跳过折扣更新')
            }
          } catch (error) {
            console.error('❌ [Payment] 更新用户折扣失败:', error)
          }

          // 清除所有临时缓存（流程完成，不再需要本地缓存）
          try {
            uni.removeStorageSync('currentOrder')
            uni.removeStorageSync('buyNowOrder')
            uni.removeStorageSync('checkoutItems')
            console.log('✅ [Payment] 已清除临时缓存')
          } catch (e) {
            console.warn('⚠️ [Payment] 清除缓存出错:', e)
          }

          // 延迟后跳转到首页，订单列表会从 API 获取最新数据
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        } else if (retryCount < maxRetries) {
          console.log(`⏳ [Payment] 支付状态为 ${status}，继续重试... (${retryCount + 1}/${maxRetries})`)
          // 支付可能正在处理中，增加延迟后重试
          // 使用指数退避：第1次2秒，第2次3秒，第3次4秒...
          const delayTime = (retryCount + 2) * 1000
          setTimeout(() => {
            this.confirmPaymentSuccess(outTradeNo, retryCount + 1, maxRetries)
          }, delayTime)
        } else {
          // 重试次数已用尽，显示支付成功提示并刷新订单
          console.warn('⚠️ [Payment] 查询次数已达上限，假设支付成功并继续')
          uni.showToast({
            title: '支付已提交，正在确认',
            icon: 'success',
            duration: 1500
          })

          // 不再重试，直接清除缓存并跳转
          try {
            uni.removeStorageSync('currentOrder')
            uni.removeStorageSync('buyNowOrder')
            uni.removeStorageSync('checkoutItems')
            console.log('✅ [Payment] 已清除临时缓存')
          } catch (e) {
            console.warn('⚠️ [Payment] 清除缓存出错:', e)
          }

          // 延迟后跳转到首页，订单列表会从 API 获取最新数据
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      } catch (error) {
        console.error('Failed to confirm payment:', error)
        uni.showToast({
          title: '确认支付状态失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: #f9f9f9;
  padding-bottom: 120rpx;
}

 

/* 费用明细 */
.fee-summary-section {
  background: #ffffff;
  margin: 16rpx 20rpx;
  padding: 24rpx;
  border-radius: 8rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 20rpx;
  }

  .fee-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .fee-label {
      font-size: 26rpx;
      color: #666666;
    }

    .fee-value {
      font-size: 26rpx;
      color: #000000;
      font-weight: 500;
    }

    &.discount {
      .fee-label {
        color: #ff6b6b;
      }

      .fee-value {
        color: #ff6b6b;
      }
    }

    &.total {
      padding-top: 16rpx;
      margin-top: 12rpx;
      border-top: 2px solid #f0f0f0;

      .fee-label {
        font-size: 28rpx;
        color: #000000;
        font-weight: 600;
      }

      .fee-value {
        font-size: 32rpx;
        color: #000000;
        font-weight: 700;
      }
    }
  }
}

/* 支付方式 */
.payment-methods-section {
  background: #ffffff;
  margin: 16rpx 20rpx;
  padding: 24rpx;
  border-radius: 8rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
  }

  .wechat-payment-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx;
    border: 2px solid #000000;
    border-radius: 8rpx;
    background: #f9f9f9;

    .method-icon {
      width: 48rpx;
      height: 48rpx;
      background: #000000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      font-weight: 600;
      color: #ffffff;
      flex-shrink: 0;
    }

    .method-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .method-name {
        display: block;
        font-size: 26rpx;
        font-weight: 600;
        color: #000000;
      }

      .method-desc {
        display: block;
        font-size: 22rpx;
        color: #999999;
      }
    }
  }
}

/* 订单信息 */
.order-summary-section {
  background: #ffffff;
  margin: 16rpx 20rpx;
  padding: 24rpx;
  border-radius: 8rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 26rpx;
      color: #666666;
    }

    .value {
      font-size: 26rpx;
      color: #000000;
      font-weight: 500;
      text-align: right;
      flex: 1;
      margin-left: 16rpx;
    }
  }
}

/* 底部按钮 */
.payment-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  padding: 16rpx 20rpx;

  .payment-btn {
    width: 100%;
    height: 80rpx;
    background: #000000;
    color: #ffffff;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 600;
    cursor: pointer;

    &:active {
      background: #333333;
    }
  }
}
</style>
