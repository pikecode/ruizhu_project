<template>
  <view class="grid-section">
    <text class="section-title">{{ title }}</text>
    <view class="grid-container" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
      <view
        v-for="(item, index) in items"
        :key="index"
        class="grid-item"
        :class="[cardType, { 'grid-item-disabled': item.isSold }]"
        @tap="onItemTap(item)"
      >
        <!-- 卡片图片 -->
        <view class="image-wrapper">
          <image class="item-image" :src="item.image" mode="aspectFill"></image>
          <!-- 库存状态徽章 -->
          <view v-if="item.isSold" class="product-badge sold-out">售罄</view>
        </view>

        <!-- 会员卡片标签 -->
        <text v-if="cardType === 'member-card'" class="card-label">{{ item.label }}</text>

        <!-- 产品卡片信息 -->
        <view v-if="cardType === 'product-card'" class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <text class="product-price">¥{{ item.price }}</text>
        </view>

        <!-- 推荐商品卡片标题和价格 -->
        <view v-if="cardType === 'recommend-card'" class="recommend-info">
          <text class="recommend-name">{{ item.name }}</text>
          <text v-if="item.price" class="recommend-price">¥{{ item.price }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'GridSection',
  props: {
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    cardType: {
      type: String,
      default: 'member-card',
      validator: (value) => ['member-card', 'product-card', 'recommend-card'].includes(value)
    },
    columns: {
      type: Number,
      default: 2
    }
  },
  methods: {
    onItemTap(item) {
      // 如果商品售罄,跳转到咨询页面
      if (item.isSold) {
        uni.navigateTo({
          url: '/pages/consultation/consultation'
        })
      } else {
        // 否则触发父组件的点击事件
        this.$emit('item-tap', item)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.grid-section {
  padding: 60rpx 40rpx;

  .section-title {
    display: block;
    font-size: 48rpx;
    font-weight: 500;
    color: #000000;
    text-align: center;
    margin-bottom: 60rpx;
    letter-spacing: 2rpx;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
  }

  .grid-item {
    border-radius: 8rpx;
    overflow: hidden;
    background: #ffffff;
    cursor: pointer;

    &:active {
      opacity: 0.9;
    }


    .image-wrapper {
      position: relative;
      width: 100%;
    }

    .item-image {
      width: 100%;
      height: 400rpx;
      background: #f5f5f5;
      display: block;
    }

    .product-badge {
      position: absolute;
      top: 12rpx;
      right: 12rpx;
      background: rgba(0, 0, 0, 0.7);
      color: #ffffff;
      padding: 8rpx 16rpx;
      border-radius: 4rpx;
      font-size: 20rpx;
      font-weight: 600;
      text-align: center;
      z-index: 10;

      &.sold-out {
        background: rgba(0, 0, 0, 0.8);
      }
    }
  }

  // 会员卡片样式
  .grid-item.member-card {
    position: relative;
    height: 400rpx;

    .item-image {
      height: 100%;
    }

    .card-label {
      position: absolute;
      bottom: 30rpx;
      left: 30rpx;
      right: 30rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #ffffff;
      text-align: center;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
    }
  }

  // 产品卡片样式
  .grid-item.product-card {
    display: flex;
    flex-direction: column;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

    .item-image {
      height: 340rpx;
      flex-shrink: 0;
    }

    .product-info {
      padding: 24rpx;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .product-name {
        display: block;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 12rpx;
        font-weight: 400;
      }

      .product-price {
        display: block;
        font-size: 32rpx;
        color: #000000;
        font-weight: 600;
      }
    }
  }

  // 推荐商品卡片样式
  .grid-item.recommend-card {
    display: flex;
    flex-direction: column;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

    .item-image {
      height: 280rpx;
      flex-shrink: 0;
    }

    .recommend-info {
      padding: 16rpx 12rpx;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      justify-content: center;
      text-align: center;
      min-height: 80rpx;

      .recommend-name {
        display: block;
        font-size: 24rpx;
        color: #333333;
        line-height: 1.4;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .recommend-price {
        display: block;
        font-size: 26rpx;
        color: #000000;
        font-weight: 600;
      }
    }
  }
}
</style>
