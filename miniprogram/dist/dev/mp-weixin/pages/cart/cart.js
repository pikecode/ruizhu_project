"use strict";
const common_vendor = require("../../common/vendor.js");
const services_auth = require("../../services/auth.js");
const PhoneAuthModal = () => "../../components/PhoneAuthModal.js";
const _sfc_main = {
  components: {
    PhoneAuthModal
  },
  data() {
    return {
      showAuthModal: false,
      expressPrice: 0,
      discount: 0,
      cartItems: [
        {
          id: 1,
          name: "经典皮质手袋",
          category: "手袋",
          price: "12800",
          image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
          quantity: 1
        },
        {
          id: 4,
          name: "高端旅行背包",
          category: "背包",
          price: "8600",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
          quantity: 2
        },
        {
          id: 7,
          name: "优雅钱包",
          category: "钱包",
          price: "3200",
          image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
          quantity: 1
        }
      ]
    };
  },
  computed: {
    productTotal() {
      return this.cartItems.reduce((sum, item) => sum + parseInt(item.price) * item.quantity, 0).toString();
    },
    totalPrice() {
      const total = parseInt(this.productTotal) + this.expressPrice - this.discount;
      return total.toString();
    }
  },
  onLoad() {
    console.log("购物袋页面加载完成");
  },
  methods: {
    increaseQuantity(index) {
      this.cartItems[index].quantity++;
      this.$forceUpdate();
    },
    decreaseQuantity(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--;
        this.$forceUpdate();
      }
    },
    removeItem(index) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "是否确认删除此商品?",
        success: (res) => {
          if (res.confirm) {
            this.cartItems.splice(index, 1);
            this.$forceUpdate();
            common_vendor.index.showToast({
              title: "已移出购物袋",
              icon: "none",
              duration: 1500
            });
          }
        }
      });
    },
    continueShopping() {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    },
    handleCheckout() {
      if (!services_auth.authService.isPhoneAuthorized()) {
        this.showAuthModal = true;
      } else {
        this.proceedToCheckout();
      }
    },
    handleAuthSuccess() {
      this.showAuthModal = false;
      this.proceedToCheckout();
    },
    handleAuthCancel() {
      this.showAuthModal = false;
    },
    proceedToCheckout() {
      common_vendor.index.showToast({
        title: "前往支付",
        icon: "none",
        duration: 1500
      });
    }
  }
};
if (!Array) {
  const _component_PhoneAuthModal = common_vendor.resolveComponent("PhoneAuthModal");
  _component_PhoneAuthModal();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $data.showAuthModal = false),
    b: common_vendor.p({
      visible: $data.showAuthModal,
      onSuccess: $options.handleAuthSuccess,
      onCancel: $options.handleAuthCancel
    }),
    c: $data.cartItems.length > 0
  }, $data.cartItems.length > 0 ? {
    d: common_vendor.t($data.cartItems.length),
    e: common_vendor.f($data.cartItems, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.category),
        d: common_vendor.t(item.price),
        e: common_vendor.o(($event) => $options.decreaseQuantity(index), index),
        f: common_vendor.t(item.quantity),
        g: common_vendor.o(($event) => $options.increaseQuantity(index), index),
        h: common_vendor.o(($event) => $options.removeItem(index), index),
        i: index
      };
    }),
    f: common_vendor.t($options.productTotal),
    g: common_vendor.t($data.expressPrice === 0 ? "免费" : "¥" + $data.expressPrice),
    h: $data.expressPrice === 0 ? 1 : "",
    i: common_vendor.t($data.discount),
    j: common_vendor.t($options.totalPrice),
    k: common_vendor.o((...args) => $options.continueShopping && $options.continueShopping(...args)),
    l: common_vendor.o((...args) => $options.handleCheckout && $options.handleCheckout(...args))
  } : {
    m: common_vendor.o((...args) => $options.continueShopping && $options.continueShopping(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
