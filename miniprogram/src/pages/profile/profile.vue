<template>
  <view class="page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="card-background"></view>
      <view class="user-info">
        <view class="avatar-section">
          <image class="user-avatar" :src="userInfo.avatar"></image>
        </view>
        <view class="info-section">
          <text class="user-name">{{ userInfo.name }}</text>
          <text class="user-id">ID: {{ userInfo.id }}</text>
          <view class="member-badge">
            <text class="badge-text">{{ userInfo.memberLevel }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-number">{{ userStats.orders }}</text>
        <text class="stat-label">订单</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ userStats.points }}</text>
        <text class="stat-label">积分</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ userStats.coupons }}</text>
        <text class="stat-label">优惠券</text>
      </view>
    </view>

    <!-- 菜单项 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-group-title">我的购物</view>
        <view
          v-for="(item, index) in shoppingMenu"
          :key="index"
          class="menu-item"
          @tap="onMenuTap(item)"
        >
          <view class="menu-item-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text class="menu-label">{{ item.label }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-group-title">账户</view>
        <view
          v-for="(item, index) in accountMenu"
          :key="index"
          class="menu-item"
          @tap="onMenuTap(item)"
        >
          <view class="menu-item-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text class="menu-label">{{ item.label }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-group-title">其他</view>
        <view
          v-for="(item, index) in otherMenu"
          :key="index"
          class="menu-item"
          @tap="onMenuTap(item)"
        >
          <view class="menu-item-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text class="menu-label">{{ item.label }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 登出按钮 -->
    <view class="logout-section">
      <view class="logout-btn" @tap="handleLogout">
        <text>登出</text>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">Ruizhu {{ appVersion }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      appVersion: '1.0.0',
      userInfo: {
        name: '李明',
        id: 'RZ20241017001',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        memberLevel: 'VIP 金牌会员'
      },
      userStats: {
        orders: 12,
        points: 2680,
        coupons: 5
      },
      shoppingMenu: [
        { id: 'orders', label: '我的订单', icon: '📦' },
        { id: 'favorites', label: '收藏夹', icon: '❤️' },
        { id: 'reviews', label: '我的评价', icon: '⭐' },
        { id: 'rewards', label: '积分商城', icon: '🎁' }
      ],
      accountMenu: [
        { id: 'profile-edit', label: '编辑资料', icon: '👤' },
        { id: 'addresses', label: '收货地址', icon: '📍' },
        { id: 'payment', label: '支付方式', icon: '💳' },
        { id: 'notifications', label: '消息通知', icon: '🔔' }
      ],
      otherMenu: [
        { id: 'about', label: '关于我们', icon: 'ℹ️' },
        { id: 'help', label: '帮助与反馈', icon: '💬' },
        { id: 'service', label: '服务条款', icon: '📋' }
      ]
    }
  },
  onLoad() {
    console.log('个人中心页面加载完成')
  },
  methods: {
    onMenuTap(item) {
      const messages = {
        orders: '我的订单',
        favorites: '收藏夹',
        reviews: '我的评价',
        rewards: '积分商城',
        'profile-edit': '编辑资料',
        addresses: '收货地址',
        payment: '支付方式',
        notifications: '消息通知',
        about: '关于我们',
        help: '帮助与反馈',
        service: '服务条款'
      }

      uni.showToast({
        title: messages[item.id] || item.label,
        icon: 'none',
        duration: 1500
      })

      // 可以根据 item.id 导航到相应的页面
      // 例如：
      // if (item.id === 'orders') {
      //   uni.navigateTo({
      //     url: '/pages/orders/orders'
      //   })
      // }
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要登出账户吗?',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已登出',
              icon: 'none',
              duration: 1500
            })
            // 可以清除本地存储的用户信息
            // uni.removeStorageSync('userToken')
            // uni.switchTab({
            //   url: '/pages/index/index'
            // })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background: #f9f9f9;
  padding-bottom: 120rpx;
}

/* 用户信息卡片 */
.user-card {
  position: relative;
  margin: 40rpx 40rpx 0;
  border-radius: 12rpx;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .card-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80rpx;
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    z-index: 1;
  }

  .user-info {
    position: relative;
    z-index: 2;
    padding: 40rpx;
    display: flex;
    gap: 32rpx;
    align-items: flex-start;

    .avatar-section {
      flex-shrink: 0;
    }

    .user-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      background: #f5f5f5;
      border: 4rpx solid #ffffff;
    }

    .info-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-top: 20rpx;

      .user-name {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #000000;
        margin-bottom: 8rpx;
      }

      .user-id {
        display: block;
        font-size: 24rpx;
        color: #999999;
        margin-bottom: 16rpx;
      }

      .member-badge {
        display: inline-block;
        padding: 8rpx 16rpx;
        background: #f9d71c;
        border-radius: 20rpx;
        width: fit-content;

        .badge-text {
          font-size: 24rpx;
          font-weight: 500;
          color: #333333;
        }
      }
    }
  }
}

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  padding: 24rpx 40rpx;

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24rpx;
    background: #ffffff;
    border-radius: 8rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    .stat-number {
      display: block;
      font-size: 40rpx;
      font-weight: 700;
      color: #000000;
      margin-bottom: 8rpx;
    }

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #999999;
    }
  }
}

/* 菜单部分 */
.menu-section {
  padding: 24rpx 0;
  margin-top: 24rpx;

  .menu-group {
    margin-bottom: 24rpx;
    background: #ffffff;
    padding: 24rpx 0;

    .menu-group-title {
      display: block;
      padding: 0 40rpx;
      margin-bottom: 16rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #666666;
    }

    .menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 40rpx;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background-color: #f5f5f5;
      }

      .menu-item-left {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .menu-icon {
          font-size: 36rpx;
          display: block;
          width: 40rpx;
          text-align: center;
        }

        .menu-label {
          display: block;
          font-size: 28rpx;
          color: #333333;
          font-weight: 400;
        }
      }

      .menu-arrow {
        font-size: 32rpx;
        color: #cccccc;
      }
    }
  }
}

/* 登出部分 */
.logout-section {
  padding: 40rpx;
  padding-bottom: 80rpx;

  .logout-btn {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    color: #ff6b6b;
    border-radius: 8rpx;
    font-size: 32rpx;
    font-weight: 600;
    border: 1px solid #ff6b6b;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      background: #fff5f5;
    }

    text {
      display: block;
    }
  }
}

/* 版本信息 */
.version-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;

  .version-text {
    font-size: 24rpx;
    color: #cccccc;
  }
}
</style>
