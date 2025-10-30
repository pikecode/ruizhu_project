"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      searchKeyword: "",
      activeCategory: 0,
      activeSortIndex: 0,
      categories: [
        { id: "all", name: "全部" },
        { id: "bags", name: "手袋" },
        { id: "backpacks", name: "背包" },
        { id: "wallets", name: "钱包" },
        { id: "accessories", name: "配件" }
      ],
      sortOptions: [
        { label: "推荐", value: "recommend" },
        { label: "新品", value: "new" },
        { label: "热销", value: "hot" },
        { label: "价格↓", value: "price_desc" },
        { label: "价格↑", value: "price_asc" }
      ],
      allProducts: [
        // 手袋系列
        {
          id: 1,
          name: "经典皮质手袋",
          category: "手袋",
          categoryId: "bags",
          price: "12800",
          image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
          isNew: false,
          isSold: false
        },
        {
          id: 2,
          name: "优雅肩挎包",
          category: "手袋",
          categoryId: "bags",
          price: "9800",
          image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
          isNew: true,
          isSold: false
        },
        {
          id: 3,
          name: "简约公文包",
          category: "手袋",
          categoryId: "bags",
          price: "15600",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
          isNew: false,
          isSold: false
        },
        // 背包系列
        {
          id: 4,
          name: "高端旅行背包",
          category: "背包",
          categoryId: "backpacks",
          price: "8600",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
          isNew: true,
          isSold: false
        },
        {
          id: 5,
          name: "商务双肩包",
          category: "背包",
          categoryId: "backpacks",
          price: "7200",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
          isNew: false,
          isSold: false
        },
        {
          id: 6,
          name: "户外探险背包",
          category: "背包",
          categoryId: "backpacks",
          price: "6800",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
          isNew: false,
          isSold: false
        },
        // 钱包系列
        {
          id: 7,
          name: "优雅钱包",
          category: "钱包",
          categoryId: "wallets",
          price: "3200",
          image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
          isNew: false,
          isSold: false
        },
        {
          id: 8,
          name: "长款皮夹",
          category: "钱包",
          categoryId: "wallets",
          price: "4200",
          image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
          isNew: true,
          isSold: false
        },
        {
          id: 9,
          name: "卡片夹",
          category: "钱包",
          categoryId: "wallets",
          price: "1800",
          image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
          isNew: false,
          isSold: false
        },
        // 配件系列
        {
          id: 10,
          name: "皮质腰带",
          category: "配件",
          categoryId: "accessories",
          price: "2800",
          image: "https://images.unsplash.com/photo-1624526267942-ab67cb38a25f?w=400&q=80",
          isNew: false,
          isSold: false
        },
        {
          id: 11,
          name: "丝巾",
          category: "配件",
          categoryId: "accessories",
          price: "1200",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
          isNew: true,
          isSold: false
        },
        {
          id: 12,
          name: "钥匙扣",
          category: "配件",
          categoryId: "accessories",
          price: "680",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
          isNew: false,
          isSold: false
        }
      ]
    };
  },
  computed: {
    filteredProducts() {
      let products = this.allProducts;
      if (this.activeCategory !== 0) {
        const categoryId = this.categories[this.activeCategory].id;
        products = products.filter((p) => p.categoryId === categoryId);
      }
      if (this.searchKeyword) {
        products = products.filter(
          (p) => p.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) || p.category.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
      }
      const sortValue = this.sortOptions[this.activeSortIndex].value;
      switch (sortValue) {
        case "new":
          products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case "hot":
          products.sort((a, b) => b.id - a.id);
          break;
        case "price_desc":
          products.sort((a, b) => parseInt(b.price) - parseInt(a.price));
          break;
        case "price_asc":
          products.sort((a, b) => parseInt(a.price) - parseInt(b.price));
          break;
      }
      return products;
    }
  },
  methods: {
    onSearchInput(e) {
      this.searchKeyword = e.detail.value;
    },
    onCategoryChange(index) {
      this.activeCategory = index;
    },
    onSortChange(index) {
      this.activeSortIndex = index;
    },
    onProductTap(product) {
      common_vendor.index.showToast({
        title: product.name,
        icon: "none",
        duration: 1500
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.onSearchInput && $options.onSearchInput(...args)),
    b: common_vendor.f($data.categories, (category, index, i0) => {
      return {
        a: common_vendor.t(category.name),
        b: index,
        c: $data.activeCategory === index ? 1 : "",
        d: common_vendor.o(($event) => $options.onCategoryChange(index), index)
      };
    }),
    c: common_vendor.f($data.sortOptions, (sort, index, i0) => {
      return {
        a: common_vendor.t(sort.label),
        b: index,
        c: $data.activeSortIndex === index ? 1 : "",
        d: common_vendor.o(($event) => $options.onSortChange(index), index)
      };
    }),
    d: common_vendor.f($options.filteredProducts, (product, index, i0) => {
      return common_vendor.e({
        a: product.image,
        b: product.isNew
      }, product.isNew ? {} : {}, {
        c: common_vendor.t(product.name),
        d: common_vendor.t(product.category),
        e: common_vendor.t(product.price),
        f: index,
        g: common_vendor.o(($event) => $options.onProductTap(product), index)
      });
    }),
    e: $options.filteredProducts.length === 0
  }, $options.filteredProducts.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
