import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('products', () => {
  // 状态
  const products = ref([])
  const categories = ref([])
  const total = ref(0)
  const loading = ref(false)

  // 筛选条件
  const filters = ref({
    categoryId: null,
    status: 'active',
    searchText: '',
    page: 1,
    limit: 20,
    sortBy: 'created',
    sortOrder: 'desc'
  })

  // 计算属性
  const hasFilters = computed(() => {
    return filters.value.searchText || filters.value.categoryId || filters.value.status !== 'active'
  })

  // 行为
  async function fetchProducts() {
    loading.value = true
    try {
      const response = await fetch('/api/v1/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      products.value = data.data
      total.value = data.total
    } catch (error) {
      console.error('获取产品列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/v1/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      categories.value = data.data
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  async function createProduct(product: any) {
    loading.value = true
    try {
      const response = await fetch('/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(product)
      })
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('创建产品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id: number, product: any) {
    loading.value = true
    try {
      const response = await fetch(`/api/v1/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(product)
      })
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('更新产品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id: number) {
    loading.value = true
    try {
      await fetch(`/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      await fetchProducts()
    } catch (error) {
      console.error('删除产品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 重置筛选
  function resetFilters() {
    filters.value = {
      categoryId: null,
      status: 'active',
      searchText: '',
      page: 1,
      limit: 20,
      sortBy: 'created',
      sortOrder: 'desc'
    }
  }

  return {
    products,
    categories,
    total,
    loading,
    filters,
    hasFilters,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    resetFilters
  }
})
