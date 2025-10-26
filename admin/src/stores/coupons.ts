import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCouponStore = defineStore('coupons', () => {
  // 状态
  const coupons = ref([])
  const currentCoupon = ref(null)
  const total = ref(0)
  const loading = ref(false)

  // 筛选条件
  const filters = ref({
    status: 'active',
    searchText: '',
    page: 1,
    limit: 20
  })

  // 优惠券类型映射
  const typeMap = {
    fixed: { label: '固定金额', icon: 'fixed' },
    percentage: { label: '百分比', icon: 'percentage' },
    free_shipping: { label: '免运费', icon: 'shipping' }
  }

  // 行为
  async function fetchCoupons() {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (filters.value.status) params.append('status', filters.value.status)
      if (filters.value.searchText) params.append('search', filters.value.searchText)
      params.append('page', filters.value.page)
      params.append('limit', filters.value.limit)

      const response = await fetch(`/api/v1/coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      coupons.value = data.data
      total.value = data.total
    } catch (error) {
      console.error('获取优惠券列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function createCoupon(coupon: any) {
    loading.value = true
    try {
      const response = await fetch('/api/v1/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(coupon)
      })
      const data = await response.json()
      await fetchCoupons()
      return data.data
    } catch (error) {
      console.error('创建优惠券失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateCoupon(id: number, coupon: any) {
    loading.value = true
    try {
      const response = await fetch(`/api/v1/coupons/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(coupon)
      })
      const data = await response.json()
      await fetchCoupons()
      return data.data
    } catch (error) {
      console.error('更新优惠券失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteCoupon(id: number) {
    loading.value = true
    try {
      await fetch(`/api/v1/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      await fetchCoupons()
    } catch (error) {
      console.error('删除优惠券失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 重置筛选
  function resetFilters() {
    filters.value = {
      status: 'active',
      searchText: '',
      page: 1,
      limit: 20
    }
  }

  return {
    coupons,
    currentCoupon,
    total,
    loading,
    filters,
    typeMap,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    resetFilters
  }
})
