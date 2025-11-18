import api from './api'
import { Province, City, District, PaginationParams, PaginationResult } from '@/types'

/**
 * 省份管理服务
 */
export const provincesService = {
  /**
   * 获取省份列表（分页）
   */
  getProvinces: (params: PaginationParams): Promise<PaginationResult<Province>> => {
    return api
      .get('/admin/provinces', { params })
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch provinces:', error)
        throw error
      })
  },

  /**
   * 获取单个省份
   */
  getProvinceById: (id: number): Promise<Province> => {
    return api
      .get(`/admin/provinces/${id}`)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch province:', error)
        throw error
      })
  },

  /**
   * 创建省份
   */
  createProvince: (payload: Partial<Province>): Promise<Province> => {
    return api
      .post('/admin/provinces', payload)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to create province:', error)
        throw error
      })
  },

  /**
   * 更新省份
   */
  updateProvince: (id: number, payload: Partial<Province>): Promise<Province> => {
    return api
      .patch(`/admin/provinces/${id}`, payload)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to update province:', error)
        throw error
      })
  },

  /**
   * 删除省份
   */
  deleteProvince: (id: number): Promise<void> => {
    return api
      .delete(`/admin/provinces/${id}`)
      .then(() => undefined)
      .catch((error) => {
        console.error('Failed to delete province:', error)
        throw error
      })
  },
}

/**
 * 城市管理服务
 */
export const citiesService = {
  /**
   * 获取城市列表（分页）
   */
  getCities: (params: PaginationParams & { provinceId?: number }): Promise<PaginationResult<City>> => {
    return api
      .get('/admin/cities', { params })
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch cities:', error)
        throw error
      })
  },

  /**
   * 获取单个城市
   */
  getCityById: (id: number): Promise<City> => {
    return api
      .get(`/admin/cities/${id}`)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch city:', error)
        throw error
      })
  },

  /**
   * 创建城市
   */
  createCity: (payload: Partial<City>): Promise<City> => {
    return api
      .post('/admin/cities', payload)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to create city:', error)
        throw error
      })
  },

  /**
   * 更新城市
   */
  updateCity: (id: number, payload: Partial<City>): Promise<City> => {
    return api
      .patch(`/admin/cities/${id}`, payload)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to update city:', error)
        throw error
      })
  },

  /**
   * 删除城市
   */
  deleteCity: (id: number): Promise<void> => {
    return api
      .delete(`/admin/cities/${id}`)
      .then(() => undefined)
      .catch((error) => {
        console.error('Failed to delete city:', error)
        throw error
      })
  },
}

/**
 * 地区管理服务
 */
export const districtsService = {
  /**
   * 获取地区列表（分页）
   */
  getDistricts: (params: PaginationParams & { cityId?: number }): Promise<PaginationResult<District>> => {
    return api
      .get('/admin/districts', { params })
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch districts:', error)
        throw error
      })
  },

  /**
   * 获取单个地区
   */
  getDistrictById: (id: number): Promise<District> => {
    return api
      .get(`/admin/districts/${id}`)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to fetch district:', error)
        throw error
      })
  },

  /**
   * 创建地区
   */
  createDistrict: (payload: Partial<District>): Promise<District> => {
    return api
      .post('/admin/districts', payload)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to create district:', error)
        throw error
      })
  },

  /**
   * 更新地区
   */
  updateDistrict: (id: number, payload: Partial<District>): Promise<District> => {
    return api
      .patch(`/admin/districts/${id}`, payload)
      .then((res) => res.data.data)
      .catch((error) => {
        console.error('Failed to update district:', error)
        throw error
      })
  },

  /**
   * 删除地区
   */
  deleteDistrict: (id: number): Promise<void> => {
    return api
      .delete(`/admin/districts/${id}`)
      .then(() => undefined)
      .catch((error) => {
        console.error('Failed to delete district:', error)
        throw error
      })
  },
}
