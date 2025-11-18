import { api } from './api'

/**
 * 地区服务
 * 从后端API获取省市区数据
 */
export const regionsService = {
  /**
   * 获取所有省份列表
   */
  async getProvinces(): Promise<string[]> {
    try {
      const response = await api.get<any[]>('/regions/provinces')
      return response.map((p) => p.name)
    } catch (error) {
      console.error('Failed to get provinces:', error)
      return []
    }
  },

  /**
   * 获取省份ID
   */
  async getProvinceById(provinceName: string): Promise<number | null> {
    try {
      const response = await api.get<any[]>('/regions/provinces')
      const province = response.find((p) => p.name === provinceName)
      return province ? province.id : null
    } catch (error) {
      console.error('Failed to get province ID:', error)
      return null
    }
  },

  /**
   * 根据省份ID获取城市列表
   */
  async getCitiesByProvinceId(provinceId: number): Promise<string[]> {
    try {
      const response = await api.get<any[]>(`/regions/cities?provinceId=${provinceId}`)
      return response.map((c) => c.name)
    } catch (error) {
      console.error('Failed to get cities:', error)
      return []
    }
  },

  /**
   * 根据城市名称获取城市ID
   */
  async getCityIdByName(cityName: string): Promise<number | null> {
    try {
      // 需要先从provinces获取所有城市信息
      // 由于API需要provinceId，所以这个方法需要在知道provinceId的情况下调用
      // 目前的设计是需要通过 Province -> City 的层级结构
      console.warn('getCityIdByName需要通过getCitiesByProvinceId间接调用')
      return null
    } catch (error) {
      console.error('Failed to get city ID:', error)
      return null
    }
  },

  /**
   * 根据城市ID获取地区列表
   */
  async getDistrictsByCityId(cityId: number): Promise<string[]> {
    try {
      const response = await api.get<any[]>(`/regions/districts?cityId=${cityId}`)
      return response.map((d) => d.name)
    } catch (error) {
      console.error('Failed to get districts:', error)
      return []
    }
  },
}
