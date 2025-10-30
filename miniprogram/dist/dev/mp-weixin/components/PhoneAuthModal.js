"use strict";
const common_vendor = require("../common/vendor.js");
const services_auth = require("../services/auth.js");
const _sfc_main = common_vendor.defineComponent({
  name: "PhoneAuthModal",
  props: {
    /**
     * 是否显示弹窗
     */
    visible: {
      type: Boolean,
      default: false
    },
    /**
     * 授权完成的回调
     */
    onSuccess: {
      type: Function,
      default: () => {
      }
    },
    /**
     * 取消授权的回调
     */
    onCancel: {
      type: Function,
      default: () => {
      }
    }
  },
  data() {
    return {
      isLoading: false,
      errorMessage: "",
      buttonText: "授权手机号并继续",
      loadingText: "正在授权..."
    };
  },
  methods: {
    /**
     * 处理手机号授权事件
     */
    async handlePhoneNumber(event) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const userInfo = await services_auth.authService.handlePhoneNumberEvent(event);
        common_vendor.index.showToast({
          title: "授权成功",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          var _a;
          (_a = this.onSuccess) == null ? void 0 : _a.call(this);
          this.$emit("close");
        }, 1500);
      } catch (error) {
        const message = (error == null ? void 0 : error.message) || "授权失败，请重试";
        this.errorMessage = message;
        common_vendor.index.showToast({
          title: message,
          icon: "error",
          duration: 2e3
        });
        console.error("手机号授权失败:", error);
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * 处理取消授权
     */
    handleCancel() {
      var _a;
      if (this.isLoading)
        return;
      (_a = this.onCancel) == null ? void 0 : _a.call(this);
      this.$emit("close");
    }
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.visible
  }, _ctx.visible ? common_vendor.e({
    b: common_vendor.o((...args) => _ctx.handleCancel && _ctx.handleCancel(...args)),
    c: common_vendor.o((...args) => _ctx.handleCancel && _ctx.handleCancel(...args)),
    d: !_ctx.isLoading
  }, !_ctx.isLoading ? {
    e: common_vendor.t(_ctx.buttonText)
  } : {
    f: common_vendor.t(_ctx.loadingText)
  }, {
    g: _ctx.isLoading ? 1 : "",
    h: common_vendor.o((...args) => _ctx.handlePhoneNumber && _ctx.handlePhoneNumber(...args)),
    i: _ctx.isLoading,
    j: common_vendor.o((...args) => _ctx.handleCancel && _ctx.handleCancel(...args)),
    k: _ctx.isLoading,
    l: _ctx.errorMessage
  }, _ctx.errorMessage ? {
    m: common_vendor.t(_ctx.errorMessage)
  } : {}) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-60ac4e3e"]]);
wx.createComponent(Component);
