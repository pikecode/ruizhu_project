<template>
  <view class="legal-page">
    <!-- 顶部标签页 -->
    <view class="legal-tabs">
      <view class="tab-item" :class="{ active: activeTab === 'privacy' }" @tap="activeTab = 'privacy'">
        <text>隐私政策</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'sales' }" @tap="activeTab = 'sales'">
        <text>销售条款</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="legal-content" scroll-y="true">
      <view class="legal-intro">
        <view class="intro-header">
          <text class="intro-title">{{ currentIntro.title }}</text>
          <text class="intro-badge">{{ currentIntro.updatedAt }}</text>
        </view>
        <text class="intro-desc">{{ currentIntro.desc }}</text>
      </view>

      <!-- 隐私政策标签页 -->
      <view v-if="activeTab === 'privacy'" class="tab-content">
        <view class="content-card">
          <text class="content-title">隐私政策</text>
          <view class="content-section">
            <text class="section-title">1. 我们如何收集个人信息</text>
            <text class="section-text">
本公司向注册地位于中华人民共和国上海市的RUIZHU时装商业（上海）有限公司（下文称"RUIZHU上海"），在中华人民共和国境内运营网站 https://www.prada.com/cn 及 https://www.miumiu.com/cn (以下简称"网站")以及RUIZHU 电商平台上的商品交易和相关服务。对于RUIZHU和RUIZHU品牌选购，与此同时位于意大利米兰的RUIZHU集团的运营与股份公司，将拟法股份有限公司(即RUIZHU S.p.A.其与RUIZHU上海合称为"RUIZHU"或"RUIZHU")在此承诺保护您在访问网站时提供的个人信息，完全符合和安全性。消费者可在收集、使用和披露个人信息的方式。RUIZHU对您提供的个人信息具时数会采取行政用的隐私保护法规，以及与此同时应用的隐私保护法律所要求的方式进行处理。该等法律包括但不限于《中华人民共和国民法典》、《中华人民共和国个人信息保护法》和《中华人民共和国电子商务法》，且处理此公维和RUIZHU集团所用的通则和一般规则。

本公司隐私政策适用于我们可能通过以数字平台收集的个人信息，例如网站、RUIZHU信小程序、第三方电子商务平台(例如天猫和京东)的店铺、任何移动应用程序、云服务、嵌入通信平台的受控部件(下文称称"数字平台")，以及其他展示本隐私政策或提及本隐私政策第2处数据的个人信息。我们可能利用在这些平台所提供的信息来使用数据进行营销。参加我们的活动、您可通过以电话、电子邮件、发送的短信和/或来拜访我们的门店等方式与我们联系并提供的个人信息。
            </text>
          </view>

          <view class="content-section">
            <text class="section-title">本隐私政策包括以下的内容</text>
            <view class="section-list">
              <text class="list-item">（1）RUIZHU的收集与处理的个人信息类型</text>
              <text class="list-item">（2）本公司个人信息的保护</text>
              <text class="list-item">（3）RUIZHU可能运用的收集与处理个人信息的方法</text>
              <text class="list-item">（4）个人信息提供的的选择权</text>
              <text class="list-item">（5）收集与处理个人信息的合的和法律基础</text>
              <text class="list-item">（6）RUIZHU如何在全球范围内共、转让、公开披露您的个人信息</text>
              <text class="list-item">（7）您的个人信息在全球范围内的转移</text>
              <text class="list-item">（8）RUIZHU如何保护您的个人信息</text>
              <text class="list-item">（9）保存期限</text>
              <text class="list-item">（10）个人信息处理者和数据保护负责人的具体联系方式</text>
              <text class="list-item">（11）个人信息主体的权利</text>
              <text class="list-item">（12）本隐私政策的修订</text>
            </view>
          </view>

          <view class="content-section">
            <text class="section-title">1. RUIZHU可收集与处理的个人信息类型：</text>
            <text class="section-text">
"个人信息"指由电子方式或其他方式记录的，与已识别或可识别的自然人有关的任何种类的信息，或由独立与其他信息结合的反映对自然人活动的任何种类的信息。
            </text>
            <text class="section-subtitle">基于您选择的服务、参加的活动以及与我们的互动、我们收集的个人信息可能包括以下信息；我们仅在特定和必要的情况下收集除核心个人信息。我们可能会以组织和下列的方式请您提供您的信息或可能涉及的感知个人信息：</text>
            <view class="section-list">
              <text class="list-item">（1）个人基本资料和通信信息（例如姓名、称谓、出生日期、地址类型、地区、省份、城市、邮政编码、通讯地址、电子邮件地址）；</text>
              <text class="list-item">（2）身份与登记信息（例如身份号、IP地址或用户ID、普通口令、微信OpenID、微信UnionID以及与游选相关联的信息等）；</text>
              <text class="list-item">（3）声音录音（例如经经授权的电话通话录音信息）；</text>
              <text class="list-item">（4）体型及样式信息；</text>
              <text class="list-item">（5）日志/浏览信息（例如搜索内容、浏览类型、IP地址、访问日期时间、访问的页面以及您获得的相关操作）；</text>
              <text class="list-item">（6）个人购物记录（例如订购历史、已加入心愿清单或购物袋的商品）；</text>
              <text class="list-item">（7）常用设备信息（例如硬件号、操作系统类型等）；</text>
              <text class="list-item">（8）个人位置信息（我们的收集是当时的地理位置、但不会结合不同时间的位置信息来判断您的行踪）。</text>
            </view>
          </view>

          <view class="content-section">
            <text class="section-title">2. 未成年人个人信息的保护</text>
            <text class="section-text">
我们非常重视未成年人个人信息的保护。如果您未满18岁，请勿在本网站上提供任何个人信息。如果我们发现我们已经收集了未成年人的个人信息而未获得其法定代理人的明示同意，我们将尽快删除有关信息。
            </text>
          </view>
        </view>
      </view>

      <!-- 销售条款标签页 -->
      <view v-if="activeTab === 'sales'" class="tab-content">
        <view class="content-card">
          <text class="content-title">销售条款</text>

          <view class="content-section">
            <text class="section-title">销售条款和条件</text>
            <text class="section-text">
欢迎来到我们的在线购物平台。我们为您提供高质量的产品和服务。在进行任何购买前，请仔细阅读以下条款和条件。

我们的销售条款适用于通过我们的在线商店进行的所有交易。通过完成购买，您同意接受这些条款和条件的约束。
            </text>
          </view>

          <view class="content-section">
            <text class="section-title">1. 产品和价格</text>
            <text class="section-text">
我们的所有产品都以现有库存为基础。我们保留根据需要调整价格的权利。所显示的价格为人民币，并包括适用的税费。
            </text>
          </view>

          <view class="content-section">
            <text class="section-title">2. 订单和付款</text>
            <text class="section-text">
所有订单必须通过我们的在线系统完成。我们仅接受在线支付。订单在付款确认后视为有效。我们保留拒绝任何订单的权利。
            </text>
          </view>

          <view class="content-section">
            <text class="section-title">3. 交货和退货</text>
            <text class="section-text">
我们致力于及时交付。交货时间取决于您的位置和订单的复杂性。如果您对产品不满意，我们提供30天的退货政策。退货产品必须保持原始状态。
            </text>
          </view>

          <view class="content-section">
            <text class="section-title">4. 知识产权</text>
            <text class="section-text">
我们网站上的所有内容，包括文本、图形、标志和图像，都受版权保护。未经我们的明确许可，不得复制或传播任何内容。
            </text>
          </view>

          <view class="content-section">
            <text class="section-title">5. 免责声明</text>
            <text class="section-text">
我们的网站和产品按"原样"提供。我们不作出任何明示或暗示的担保。我们对任何直接或间接损害不承担责任。
            </text>
          </view>

          <view class="content-section">
            <text class="section-title">6. 法律和管辖权</text>
            <text class="section-text">
这些条款和条件受中华人民共和国法律管辖。任何争议应在中国法院解决。
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'privacy',
      introMap: {
        privacy: {
          title: '隐私政策',
          updatedAt: '更新于 2024-09',
          desc: '了解我们如何收集、使用与保护您的个人信息，以及您在数据处理中的权利。'
        },
        sales: {
          title: '销售条款',
          updatedAt: '更新于 2024-07',
          desc: '阅读购买流程、退换货政策与适用法律，确保每次交易都明晰无忧。'
        }
      }
    }
  },
  onLoad() {
    console.log('法律条款页面加载完成')
  },
  computed: {
    currentIntro() {
      return this.introMap[this.activeTab]
    }
  }
}
</script>

<style lang="scss">
.legal-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 顶部标签页 */
.legal-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 40rpx;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;

  .tab-item {
    flex: 1;
    padding: 24rpx 0;
    text-align: center;
    color: #999999;
    font-size: 28rpx;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;

    text {
      display: block;
      cursor: pointer;
    }

    &.active {
      color: #000000;
      border-bottom-color: #000000;
      font-weight: 600;
    }
  }
}

/* 内容区域 */
.legal-content {
  flex: 1;
  overflow-y: auto;
  background: #f7f7f8;

  .legal-intro {
    padding: 48rpx 40rpx 16rpx;
    background: #ffffff;
    box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.04);

    .intro-header {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 12rpx;

      .intro-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #111111;
      }

      .intro-badge {
        font-size: 24rpx;
        color: #666666;
        padding: 6rpx 18rpx;
        border-radius: 999rpx;
        background: #f0f0f0;
      }
    }

    .intro-desc {
      font-size: 26rpx;
      color: #666666;
      line-height: 1.6;
    }
  }

  .tab-content {
    padding: 32rpx 40rpx 60rpx;
    display: flex;
    flex-direction: column;
    gap: 28rpx;

    .content-card {
      background: #ffffff;
      border-radius: 28rpx;
      padding: 32rpx;
      box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.04);
    }

    .content-title {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: #000000;
      margin-bottom: 40rpx;
    }

    .content-section {
      margin-bottom: 40rpx;

      .section-title {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: #000000;
        margin-bottom: 16rpx;
      }

      .section-subtitle {
        display: block;
        font-size: 26rpx;
        color: #666666;
        line-height: 1.6;
        margin-bottom: 16rpx;
        font-weight: 500;
      }

      .section-text {
        display: block;
        font-size: 26rpx;
        color: #666666;
        line-height: 1.8;
        margin-bottom: 16rpx;
        text-align: justify;
      }

      .section-list {
        display: flex;
        flex-direction: column;
        gap: 12rpx;
        margin-top: 16rpx;

        .list-item {
          display: block;
          font-size: 26rpx;
          color: #666666;
          line-height: 1.6;
          padding-left: 24rpx;
          text-indent: -24rpx;
        }
      }
    }
  }
}
</style>
