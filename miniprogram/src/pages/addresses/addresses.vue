<template>
  <view class="page">
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- 地址列表 -->
    <view v-else-if="addresses.length > 0" class="addresses-list">
      <view
        v-for="(address, index) in addresses"
        :key="index"
        class="address-item"
        @tap="selectAddress(index)"
      >
        <!-- 地址卡片 -->
        <view class="address-card">
          <!-- 中间地址信息 -->
          <view class="address-info">
            <view class="address-header">
              <text class="address-name">{{ address.name }}</text>
              <text class="address-phone">{{ address.phone }}</text>
            </view>
            <text class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }}
            </text>
            <text class="address-detail">
              {{ address.detail }}
            </text>
          </view>

          <!-- 右侧操作按钮 -->
          <view class="address-actions">
            <text class="action-btn edit-btn" @tap.stop="editAddress(index)">编辑</text>
            <text class="action-btn delete-btn" @tap.stop="deleteAddress(index)">删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <view class="empty-illustration">
        <text class="empty-icon">📍</text>
      </view>
      <text class="empty-title">还没有收货地址</text>
      <text class="empty-description">添加地址以便顺利完成购物</text>
    </view>

    <!-- 底部添加按钮 -->
    <view class="address-footer">
      <view class="add-address-btn" @tap="addAddress">
        <text>+ 添加新地址</text>
      </view>
    </view>
  </view>
</template>

<script>
import { api } from '../../services/api'

export default {
  data() {
    return {
      addresses: [],
      isLoading: true
    }
  },
  onLoad() {
    this.loadAddresses()
  },
  onShow() {
    // 每次页面显示时重新加载地址列表，确保显示最新数据
    this.loadAddresses()
  },
  methods: {
    /**
     * 从服务器加载地址列表
     */
    async loadAddresses() {
      this.isLoading = true
      try {
        const token = uni.getStorageSync('accessToken')
        if (!token) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        const response = await api.get('/addresses')

        console.log('地址列表响应:', response)

        if (response) {
          // 提取 addresses 数组（后端返回 { addresses, total, page, totalPages } 或直接是数组）
          let addressList = Array.isArray(response) ? response : response.addresses || []

          // 字段映射：后端返回 receiverName/receiverPhone，前端期望 name/phone
          this.addresses = addressList.map(addr => ({
            ...addr,
            name: addr.receiverName || addr.name,
            phone: addr.receiverPhone || addr.phone
          }))
        } else {
          console.warn('获取地址列表失败')
          uni.showToast({
            title: '加载地址失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载地址出错:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },
    /**
     * 添加新地址
     */
    addAddress() {
      uni.navigateTo({
        url: '/pages/addresses/add-edit?mode=add'
      })
      // onShow() 生命周期会在返回时自动刷新列表
    },

    /**
     * 编辑地址
     */
    editAddress(index) {
      const address = this.addresses[index]
      uni.navigateTo({
        url: `/pages/addresses/add-edit?mode=edit&id=${address.id}`
      })
      // onShow() 生命周期会在返回时自动刷新列表
    },
    /**
     * 选择地址
     */
    selectAddress(index) {
      const address = this.addresses[index]

      console.log('📍 [Addresses] 📌 用户选择了地址:', JSON.stringify(address))

      // 验证地址数据完整性
      if (!address || !address.id) {
        console.error('📍 [Addresses] ❌ 地址数据无效，缺少必要字段')
        uni.showToast({
          title: '地址数据无效',
          icon: 'none'
        })
        return
      }

      // 构造返回数据（确保包含所有必要字段）
      const addressData = {
        id: address.id,
        name: address.name || '',
        phone: address.phone || '',
        province: address.province || '',
        city: address.city || '',
        district: address.district || '',
        detail: address.detail || '',
        // 备用字段名，用于兼容不同的字段命名
        receiverName: address.name || '',
        receiverPhone: address.phone || '',
        addressDetail: address.detail || ''
      }
      console.log('📍 [Addresses] ✅ 构造的地址数据:', JSON.stringify(addressData))

      // 获取 eventChannel（来自调用方）
      const eventChannel = this.$getOpenerEventChannel()
      console.log('📍 [Addresses] eventChannel 是否存在:', !!eventChannel)

      if (!eventChannel) {
        console.error('📍 [Addresses] ❌ eventChannel 不存在，无法返回数据给调用方')
        uni.showToast({
          title: '无法返回地址数据',
          icon: 'none'
        })
        // 2秒后仍然返回（降级处理）
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
        return
      }

      console.log('📍 [Addresses] 🚀 准备通过 eventChannel 发送地址数据')

      try {
        // 发送数据到调用方
        eventChannel.emit('selectAddress', addressData)
        console.log('📍 [Addresses] ✅ 地址数据发送成功')

        // 显示成功提示
        uni.showToast({
          title: '地址已发送',
          icon: 'success',
          duration: 1000
        })

        // 延迟返回，确保事件传递完成
        setTimeout(() => {
          console.log('📍 [Addresses] 📤 返回到上一页面')
          uni.navigateBack()
        }, 300)
      } catch (err) {
        console.error('📍 [Addresses] ❌ 发送数据失败:', err)
        uni.showToast({
          title: '地址发送失败',
          icon: 'none'
        })
      }
    },

    /**
     * 删除地址
     */
    deleteAddress(index) {
      const address = this.addresses[index]
      uni.showModal({
        title: '删除地址',
        content: '确定要删除此地址吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.delete(`/addresses/${address.id}`)

              this.addresses.splice(index, 1)

              uni.showToast({
                title: '地址已删除',
                icon: 'success'
              })
            } catch (error) {
              console.error('删除地址出错:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: #f9f9f9;
  padding-bottom: 200rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  font-size: 28rpx;
  color: #999999;
}

/* 地址列表 */
.addresses-list {
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.address-item {
  background: #ffffff;
  border-radius: 8rpx;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;

  &:active {
    background: #f9f9f9;
    border-color: #e0e0e0;
  }

  .address-card {
    display: flex;
    gap: 12rpx;
    padding: 16rpx;
    cursor: pointer;

    .address-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;

      .address-header {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .address-name {
          font-size: 26rpx;
          font-weight: 600;
          color: #000000;
        }

        .address-phone {
          font-size: 24rpx;
          color: #999999;
        }

        .default-badge {
          padding: 4rpx 8rpx;
          background: #f0f0f0;
          border-radius: 4rpx;
          font-size: 18rpx;
          color: #666666;
        }
      }

      .address-detail {
        display: block;
        font-size: 24rpx;
        color: #666666;
        line-height: 1.4;
      }
    }

    .address-actions {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      flex-shrink: 0;

      .action-btn {
        display: block;
        padding: 6rpx 12rpx;
        border-radius: 4rpx;
        font-size: 20rpx;
        text-align: center;
        min-width: 60rpx;
        cursor: pointer;

        &.edit-btn {
          background: #f0f0f0;
          color: #666666;

          &:active {
            background: #d0d0d0;
          }
        }

        &.delete-btn {
          background: #ffe0e0;
          color: #cc0000;

          &:active {
            background: #ffcccc;
          }
        }
      }
    }
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;

  .empty-illustration {
    margin-bottom: 24rpx;

    .empty-icon {
      font-size: 80rpx;
      display: block;
    }
  }

  .empty-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 8rpx;
  }

  .empty-description {
    display: block;
    font-size: 26rpx;
    color: #999999;
  }
}

/* 底部按钮 */
.address-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .add-address-btn {
    width: 100%;
    height: 72rpx;
    border: 2px dashed #d0d0d0;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666666;
    cursor: pointer;

    &:active {
      background: #f9f9f9;
    }
  }
}
</style>
