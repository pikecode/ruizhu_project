import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrderStore = defineStore('orders', () => {
  // 状态
  const orders = ref([])
  const currentOrder = ref(null)
  const total = ref(0)
  const loading = ref(false)

  // 筛选条件
  const filters = ref({
    status: '',
    searchText: '',
    dateRange: [],
    page: 1,
    limit: 20
  })

  // 订单状态映射
  const statusMap = {
    pending: { label: '待确认', color: 'warning' },
    confirmed: { label: '已确认', color: 'info' },
    shipped: { label: '已发货', color: 'primary' },
    delivered: { label: '已收货', color: 'success' },
    cancelled: { label: '已取消', color: 'danger' },
    refunded: { label: '已退款', color: 'danger' }
  }

  // 行为
  async function fetchOrders() {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (filters.value.status) params.append('status', filters.value.status)
      if (filters.value.searchText) params.append('search', filters.value.searchText)
      params.append('page', filters.value.page)
      params.append('limit', filters.value.limit)

      const response = await fetch(`/api/v1/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      orders.value = data.data
      total.value = data.total
    } catch (error) {
      console.error('获取订单列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderDetail(id: number) {
    loading.value = true
    try {
      const response = await fetch(`/api/v1/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      currentOrder.value = data.data
      return data.data
    } catch (error) {
      console.error('获取订单详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(id: number, status: string) {
    loading.value = true
    try {
      const response = await fetch(`/api/v1/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      currentOrder.value = data.data
      await fetchOrders()
      return data.data
    } catch (error) {
      console.error('更新订单状态失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function cancelOrder(id: number) {
    loading.value = true
    try {
      const response = await fetch(`/api/v1/orders/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      currentOrder.value = data.data
      await fetchOrders()
      return data.data
    } catch (error) {
      console.error('取消订单失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 重置筛选
  function resetFilters() {
    filters.value = {
      status: '',
      searchText: '',
      dateRange: [],
      page: 1,
      limit: 20
    }
  }

  return {
    orders,
    currentOrder,
    total,
    loading,
    filters,
    statusMap,
    fetchOrders,
    fetchOrderDetail,
    updateOrderStatus,
    cancelOrder,
    resetFilters
  }
})
