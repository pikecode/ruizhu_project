<template>
  <view class="page">
    <!-- 地址列表 -->
    <view v-if="addresses.length > 0" class="addresses-list">
      <view
        v-for="(address, index) in addresses"
        :key="index"
        class="address-item"
        :class="{ selected: selectedAddressIndex === index }"
      >
        <!-- 地址卡片 -->
        <view class="address-card" @tap="selectAddress(index)">
          <!-- 左侧选择框 -->
          <view class="address-checkbox">
            <view class="checkbox" :class="{ checked: selectedAddressIndex === index }">
              <text v-if="selectedAddressIndex === index">✓</text>
            </view>
          </view>

          <!-- 中间地址信息 -->
          <view class="address-info">
            <view class="address-header">
              <text class="address-name">{{ address.name }}</text>
              <text class="address-phone">{{ address.phone }}</text>
              <view v-if="address.isDefault" class="default-badge">默认</view>
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
      <view v-if="addresses.length > 0" class="confirm-btn" @tap="confirmSelection">
        <text>确认选择</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      addresses: [],
      selectedAddressIndex: 0
    }
  },
  onLoad() {
    this.loadAddresses()
  },
  methods: {
    loadAddresses() {
      try {
        const addresses = uni.getStorageSync('userAddresses') || []
        if (addresses.length === 0) {
          // 模拟初始地址数据
          this.addresses = [
            {
              id: 1,
              name: '张三',
              phone: '18912345678',
              province: '广东省',
              city: '深圳市',
              district: '福田区',
              detail: '中心广场写字楼A座2501室',
              isDefault: true
            },
            {
              id: 2,
              name: '李四',
              phone: '13800138000',
              province: '上海市',
              city: '浦东新区',
              district: '陆家嘴',
              detail: '世纪大道1号',
              isDefault: false
            }
          ]
          this.saveAddresses()
        } else {
          this.addresses = addresses
        }
      } catch (e) {
        console.error('Failed to load addresses:', e)
      }
    },
    saveAddresses() {
      try {
        uni.setStorageSync('userAddresses', this.addresses)
      } catch (e) {
        console.error('Failed to save addresses:', e)
      }
    },
    selectAddress(index) {
      this.selectedAddressIndex = index
    },
    confirmSelection() {
      const selectedAddress = this.addresses[this.selectedAddressIndex]

      // 保存到存储
      try {
        uni.setStorageSync('selectedAddress', selectedAddress)
      } catch (e) {
        console.error('Failed to save selected address:', e)
      }

      // 通过事件通知上层页面（如果存在）
      try {
        if (this.$wx && typeof this.$wx.getOpenerEventChannel === 'function') {
          const eventChannel = this.$wx.getOpenerEventChannel()
          if (eventChannel) {
            eventChannel.emit('selectAddress', selectedAddress)
          }
        }
      } catch (e) {
        console.error('Failed to emit event:', e)
      }

      // 返回上一页
      uni.navigateBack()
    },
    addAddress() {
      uni.navigateTo({
        url: '/pages/addresses/add-edit?mode=add',
        events: {
          addressAdded: (data) => {
            this.addresses.push(data)
            this.saveAddresses()
          }
        }
      })
    },
    editAddress(index) {
      const address = this.addresses[index]
      uni.navigateTo({
        url: `/pages/addresses/add-edit?mode=edit&id=${address.id}`,
        events: {
          addressUpdated: (data) => {
            this.$set(this.addresses, index, data)
            this.saveAddresses()
          }
        }
      })
    },
    deleteAddress(index) {
      uni.showModal({
        title: '删除地址',
        content: '确定要删除此地址吗？',
        success: (res) => {
          if (res.confirm) {
            this.addresses.splice(index, 1)
            this.saveAddresses()

            // 如果删除的是当前选中的地址，选择第一个
            if (this.selectedAddressIndex >= this.addresses.length) {
              this.selectedAddressIndex = 0
            }

            uni.showToast({
              title: '地址已删除',
              icon: 'success'
            })
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

  &.selected {
    border-color: #000000;
  }

  .address-card {
    display: flex;
    gap: 12rpx;
    padding: 16rpx;

    .address-checkbox {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 4rpx;
      flex-shrink: 0;

      .checkbox {
        width: 28rpx;
        height: 28rpx;
        border: 2px solid #d0d0d0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        text {
          font-size: 16rpx;
          font-weight: 600;
          color: transparent;
        }

        &.checked {
          background: #000000;
          border-color: #000000;

          text {
            color: #ffffff;
          }
        }
      }
    }

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

  .confirm-btn {
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
