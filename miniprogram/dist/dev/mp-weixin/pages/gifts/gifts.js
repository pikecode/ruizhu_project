"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      activeTab: "women",
      currentSlide: 0,
      productSlides: [
        {
          featured: {
            name: "鞋子",
            price: "1799",
            image: "/static/images/product/鞋子1.jpg"
          },
          products: [
            {
              name: "珠宝",
              price: "5800",
              image: "/static/images/product/饰品184152.jpg"
            },
            {
              name: "珠宝",
              price: "7500",
              image: "/static/images/product/饰品184157.jpg"
            }
          ]
        },
        {
          featured: {
            name: "服装",
            price: "2800",
            image: "/static/images/product/服饰2.jpg"
          },
          products: [
            {
              name: "珠宝",
              price: "8900",
              image: "/static/images/product/饰品184201.jpg"
            },
            {
              name: "珠宝",
              price: "9800",
              image: "/static/images/product/饰品184205.jpg"
            }
          ]
        },
        {
          featured: {
            name: "服装",
            price: "3500",
            image: "/static/images/product/服饰1.jpg"
          },
          products: [
            {
              name: "珠宝",
              price: "6500",
              image: "/static/images/product/饰品184212.jpg"
            },
            {
              name: "珠宝",
              price: "10000",
              image: "/static/images/product/饰品184216.jpg"
            }
          ]
        }
      ],
      jewelryImages: [
        "/static/images/product/饰品184152.jpg",
        "/static/images/product/饰品184157.jpg",
        "/static/images/product/饰品184201.jpg",
        "/static/images/product/饰品184205.jpg",
        "/static/images/product/饰品184208.jpg",
        "/static/images/product/饰品184212.jpg",
        "/static/images/product/饰品184216.jpg",
        "/static/images/product/饰品184219.jpg"
      ],
      categories: [
        {
          name: "高级配饰",
          image: "/static/images/product/饰品184152.jpg"
        },
        {
          name: "高级配饰",
          image: "/static/images/product/饰品184157.jpg"
        },
        {
          name: "高级配饰",
          image: "/static/images/product/饰品184201.jpg"
        },
        {
          name: "高级配饰",
          image: "/static/images/product/饰品184205.jpg"
        }
      ]
    };
  },
  mounted() {
    this.generateCategories();
  },
  methods: {
    generateCategories() {
      const randomJewelry = this.jewelryImages.sort(() => Math.random() - 0.5).slice(0, 4);
      this.categories = randomJewelry.map((image) => ({
        name: "高级配饰",
        image
      }));
    },
    switchTab(tab) {
      this.activeTab = tab;
      console.log("切换到:", tab === "women" ? "女士" : "男士");
    },
    onSwiperChange(e) {
      this.currentSlide = e.detail.current;
    },
    onProductTap(product) {
      common_vendor.index.showToast({
        title: product.name,
        icon: "none"
      });
    },
    onExploreMore() {
      common_vendor.index.showToast({
        title: "探索更多产品",
        icon: "none"
      });
    },
    onCategoryTap(category) {
      common_vendor.index.showToast({
        title: category.name,
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activeTab === "women"
  }, $data.activeTab === "women" ? {} : {}, {
    b: $data.activeTab === "women" ? 1 : "",
    c: common_vendor.o(($event) => $options.switchTab("women")),
    d: $data.activeTab === "men"
  }, $data.activeTab === "men" ? {} : {}, {
    e: $data.activeTab === "men" ? 1 : "",
    f: common_vendor.o(($event) => $options.switchTab("men")),
    g: common_vendor.f($data.productSlides, (slide, slideIndex, i0) => {
      return {
        a: slide.featured.image,
        b: common_vendor.t(slide.featured.name),
        c: common_vendor.t(slide.featured.price),
        d: common_vendor.o(($event) => $options.onProductTap(slide.featured), slideIndex),
        e: common_vendor.f(slide.products, (product, index, i1) => {
          return {
            a: product.image,
            b: common_vendor.t(product.name),
            c: common_vendor.t(product.price),
            d: index,
            e: common_vendor.o(($event) => $options.onProductTap(product), index)
          };
        }),
        f: slideIndex
      };
    }),
    h: common_vendor.o((...args) => $options.onSwiperChange && $options.onSwiperChange(...args)),
    i: common_vendor.o((...args) => $options.onExploreMore && $options.onExploreMore(...args)),
    j: common_vendor.f($data.productSlides.length, (dot, slideIndex, i0) => {
      return {
        a: slideIndex,
        b: slideIndex === $data.currentSlide ? 1 : ""
      };
    }),
    k: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: category.image,
        b: common_vendor.t(category.name),
        c: index,
        d: common_vendor.o(($event) => $options.onCategoryTap(category), index)
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
