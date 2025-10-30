"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isPlaying: false
    };
  },
  onLoad() {
    console.log("视频播放器页面加载");
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    onPlay() {
      this.isPlaying = true;
      console.log("视频开始播放");
    },
    onPause() {
      this.isPlaying = false;
      console.log("视频暂停");
    },
    onError(e) {
      console.error("视频加载错误:", e);
      common_vendor.index.showToast({
        title: "视频加载失败",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_assets._imports_0,
    c: common_vendor.o((...args) => $options.onPlay && $options.onPlay(...args)),
    d: common_vendor.o((...args) => $options.onPause && $options.onPause(...args)),
    e: common_vendor.o((...args) => $options.onError && $options.onError(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-effe3a85"]]);
wx.createPage(MiniProgramPage);
