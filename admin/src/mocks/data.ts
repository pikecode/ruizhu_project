/**
 * 临时模拟数据 - 在后端 API 正常之前使用
 */

export const mockProducts = {
  data: [
    {
      id: 1,
      name: '奢华女士手包',
      category: '包包',
      price: 2999.99,
      stock: 15,
      status: 'active',
      createdAt: '2025-10-26T10:00:00Z',
    },
    {
      id: 2,
      name: '限定款真丝围巾',
      category: '配饰',
      price: 1299.99,
      stock: 32,
      status: 'active',
      createdAt: '2025-10-25T14:30:00Z',
    },
    {
      id: 3,
      name: '进口手表',
      category: '腕表',
      price: 5999.99,
      stock: 8,
      status: 'active',
      createdAt: '2025-10-24T09:15:00Z',
    },
  ],
  total: 3,
  page: 1,
  limit: 10,
  totalPages: 1,
}

export const mockOrders = {
  data: [
    {
      id: 1,
      userId: 101,
      user: '王女士',
      totalPrice: 4299.98,
      status: 'delivered',
      createdAt: '2025-10-20T16:45:00Z',
    },
    {
      id: 2,
      userId: 102,
      user: '李先生',
      totalPrice: 7999.98,
      status: 'shipped',
      createdAt: '2025-10-22T11:20:00Z',
    },
    {
      id: 3,
      userId: 103,
      user: '张女士',
      totalPrice: 1299.99,
      status: 'pending',
      createdAt: '2025-10-26T08:00:00Z',
    },
  ],
  total: 3,
  page: 1,
  limit: 10,
  totalPages: 1,
}

export const mockCoupons = {
  data: [
    {
      id: 1,
      code: 'LUXE2025',
      type: 'fixed',
      discount: 500,
      status: 'active',
      validFrom: '2025-10-01T00:00:00Z',
      validTo: '2025-12-31T23:59:59Z',
      usageCount: 45,
      maxUsage: 100,
    },
    {
      id: 2,
      code: 'AUTUMN20',
      type: 'percentage',
      discount: 20,
      status: 'active',
      validFrom: '2025-09-01T00:00:00Z',
      validTo: '2025-11-30T23:59:59Z',
      usageCount: 128,
      maxUsage: 500,
    },
    {
      id: 3,
      code: 'FREESHIP',
      type: 'free_shipping',
      discount: 0,
      status: 'active',
      validFrom: '2025-10-15T00:00:00Z',
      validTo: '2025-10-31T23:59:59Z',
      usageCount: 67,
      maxUsage: 999,
    },
  ],
  total: 3,
  page: 1,
  limit: 10,
  totalPages: 1,
}
