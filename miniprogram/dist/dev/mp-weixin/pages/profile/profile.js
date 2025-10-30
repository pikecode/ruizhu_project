"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      appVersion: "1.0.0",
      userInfo: {
        name: "李明",
        id: "RZ20241017001",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        memberLevel: "VIP 金牌会员"
      },
      userStats: {
        orders: 12,
        points: 2680,
        coupons: 5
      },
      shoppingMenu: [
        { id: "orders", label: "我的订单", icon: "📦" },
        { id: "favorites", label: "收藏夹", icon: "❤️" },
        { id: "reviews", label: "我的评价", icon: "⭐" },
        { id: "rewards", label: "积分商城", icon: "🎁" }
      ],
      accountMenu: [
        { id: "profile-edit", label: "编辑资料", icon: "👤" },
        { id: "addresses", label: "收货地址", icon: "📍" },
        { id: "payment", label: "支付方式", icon: "💳" },
        { id: "notifications", label: "消息通知", icon: "🔔" }
      ],
      otherMenu: [
        { id: "about", label: "关于我们", icon: "ℹ️" },
        { id: "help", label: "帮助与反馈", icon: "💬" },
        { id: "service", label: "服务条款", icon: "📋" }
      ]
    };
  },
  onLoad() {
    console.log("个人中心页面加载完成");
  },
  methods: {
    onMenuTap(item) {
      const messages = {
        orders: "我的订单",
        favorites: "收藏夹",
        reviews: "我的评价",
        rewards: "积分商城",
        "profile-edit": "编辑资料",
        addresses: "收货地址",
        payment: "支付方式",
        notifications: "消息通知",
        about: "关于我们",
        help: "帮助与反馈",
        service: "服务条款"
      };
      common_vendor.index.showToast({
        title: messages[item.id] || item.label,
        icon: "none",
        duration: 1500
      });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要登出账户吗?",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "已登出",
              icon: "none",
              duration: 1500
            });
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatar,
    b: common_vendor.t($data.userInfo.name),
    c: common_vendor.t($data.userInfo.id),
    d: common_vendor.t($data.userInfo.memberLevel),
    e: common_vendor.t($data.userStats.orders),
    f: common_vendor.t($data.userStats.points),
    g: common_vendor.t($data.userStats.coupons),
    h: common_vendor.f($data.shoppingMenu, (item, index, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.label),
        c: index,
        d: common_vendor.o(($event) => $options.onMenuTap(item), index)
      };
    }),
    i: common_vendor.f($data.accountMenu, (item, index, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.label),
        c: index,
        d: common_vendor.o(($event) => $options.onMenuTap(item), index)
      };
    }),
    j: common_vendor.f($data.otherMenu, (item, index, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.label),
        c: index,
        d: common_vendor.o(($event) => $options.onMenuTap(item), index)
      };
    }),
    k: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args)),
    l: common_vendor.t($data.appVersion)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
