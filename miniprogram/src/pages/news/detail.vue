<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <ConsultationNavbar title="资讯详情" :showBack="true" :showHome="true" />

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 详情内容 -->
    <view v-else-if="newsItem" class="content">
      <!-- 标题和元信息 -->
      <view class="news-header">
        <text class="news-title">{{ newsItem.title }}</text>

        <!-- 副标题 -->
        <text v-if="newsItem.subtitle" class="news-subtitle">{{ newsItem.subtitle }}</text>

        <!-- 发布时间 -->
        <text class="news-date">{{ formatDate(newsItem.createdAt) }}</text>
      </view>

      <!-- 分隔线 -->
      <view class="divider"></view>

      <!-- 详情内容 -->
      <view class="news-body">
        <text class="news-description">{{ newsItem.description }}</text>

        <!-- 详情图 -->
        <view v-if="newsItem.detailImageUrl" class="detail-image">
          <image :src="newsItem.detailImageUrl" mode="aspectFill"></image>
        </view>
      </view>
    </view>

    <!-- 未加载到数据 -->
    <view v-else class="empty">
      <text>未找到资讯详情</text>
    </view>
  </view>
</template>

<script>
import ConsultationNavbar from '@/components/ConsultationNavbar.vue'
import { newsService } from '@/services/news'

export default {
  name: 'NewsDetail',
  components: {
    ConsultationNavbar
  },
  data() {
    return {
      newsId: null,
      newsItem: null,
      loading: false
    }
  },
  onLoad(options) {
    // 获取资讯ID
    if (options.id) {
      this.newsId = parseInt(options.id)
      this.loadNewsDetail()
    } else {
      console.warn('Missing news ID')
      uni.showToast({ title: '缺少资讯ID', icon: 'error' })
    }
  },
  methods: {
    /**
     * 加载资讯详情
     */
    async loadNewsDetail() {
      try {
        this.loading = true
        const news = await newsService.getNewsDetail(this.newsId)

        if (news) {
          this.newsItem = news
          console.log('资讯详情加载成功:', news)
        } else {
          console.warn('未获取到资讯详情')
        }
      } catch (error) {
        console.error('加载资讯详情失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 格式化日期
     */
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },

  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 加载状态 */
.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #999999;
}

/* 空状态 */
.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #999999;
}

/* 主内容区 */
.content {
  flex: 1;
  overflow-y: auto;
}

/* 新闻头部 */
.news-header {
  padding: 40rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .news-title {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #000000;
    line-height: 1.4;
  }

  .news-subtitle {
    display: block;
    font-size: 28rpx;
    color: #666666;
    line-height: 1.3;
  }

  .news-date {
    display: block;
    font-size: 24rpx;
    color: #999999;
  }
}

/* 分隔线 */
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 24rpx;
}

/* 新闻正文 */
.news-body {
  padding: 40rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  .news-description {
    display: block;
    font-size: 28rpx;
    color: #333333;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .detail-image {
    width: 100%;
    height: 300rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    overflow: hidden;
    margin-top: 16rpx;

    image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
}
</style>
