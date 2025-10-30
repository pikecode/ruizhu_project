"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 视频相关
      videoUrl: "/static/video.mp4",
      showPlayBtn: true,
      indicatorColor: "rgba(255, 255, 255, 0.5)",
      indicatorActiveColor: "#ffffff",
      currentBannerIndex: 0,
      bannerList: [
        {
          title: "Ruizhu Collection",
          subtitle: "即刻探索",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
        },
        {
          title: "新品上市",
          subtitle: "限时优惠",
          image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
        },
        {
          title: "经典系列",
          subtitle: "永恒之选",
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
        }
      ],
      memberCards: [
        {
          label: "会员专享",
          image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80"
        },
        {
          label: "积分商城",
          image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80"
        }
      ],
      products: [
        {
          name: "经典手袋",
          price: "12800",
          image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80"
        },
        {
          name: "时尚背包",
          price: "8600",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
        },
        {
          name: "优雅钱包",
          price: "3200",
          image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80"
        },
        {
          name: "商务公文包",
          price: "15800",
          image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80"
        }
      ]
    };
  },
  onLoad() {
    console.log("Ruizhu 首页加载完成");
  },
  methods: {
    onVideoImageTap() {
      common_vendor.index.navigateTo({
        url: "/pages/video-player/video-player",
        // 需要创建此页面
        fail: () => {
          common_vendor.index.showToast({
            title: "视频播放器开发中",
            icon: "none"
          });
        }
      });
    },
    onSwiperChange(e) {
      this.currentBannerIndex = e.detail.current;
    },
    onCardTap(card) {
      common_vendor.index.showToast({
        title: card.label,
        icon: "none"
      });
    },
    onProductTap(product) {
      common_vendor.index.showToast({
        title: product.name,
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.bannerList, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.subtitle),
        d: index
      };
    }),
    b: $data.indicatorColor,
    c: $data.indicatorActiveColor,
    d: common_vendor.o((...args) => $options.onSwiperChange && $options.onSwiperChange(...args)),
    e: common_vendor.f($data.memberCards, (card, index, i0) => {
      return {
        a: card.image,
        b: common_vendor.t(card.label),
        c: index,
        d: common_vendor.o(($event) => $options.onCardTap(card), index)
      };
    }),
    f: common_vendor.f($data.products, (product, index, i0) => {
      return {
        a: product.image,
        b: common_vendor.t(product.name),
        c: common_vendor.t(product.price),
        d: index,
        e: common_vendor.o(($event) => $options.onProductTap(product), index)
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
