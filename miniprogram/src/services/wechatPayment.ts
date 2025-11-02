import { api } from './api'

/**
 * 创建支付订单请求
 */
export interface CreatePaymentOrderRequest {
  outTradeNo: string        // 商户订单号
  totalFee: number          // 支付金额（分）
  body: string              // 商品描述
  detail?: string           // 商品详情
  metadata?: Record<string, any>  // 业务数据
  remark?: string           // 备注
}

/**
 * 支付参数响应
 */
export interface PaymentOrder {
  outTradeNo: string        // 商户订单号
  prepayId: string          // 预付交易会话标识
  timeStamp: string         // 支付时间戳
  nonceStr: string          // 随机字符串
  signType: string          // 签名方式
  paySign: string           // 支付签名
  totalFee: number          // 支付金额（分）
  body: string              // 商品描述
}

/**
 * API响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 微信支付服务
 */
const wechatPaymentService = {
  /**
   * 创建支付订单
   * API: POST /wechat/payment/create-order
   */
  createPaymentOrder: async (
    request: CreatePaymentOrderRequest
  ): Promise<PaymentOrder | null> => {
    try {
      console.log('📡 [WechatPayment] 创建支付订单请求:', request)

      const response = await api.post<ApiResponse<PaymentOrder>>(
        '/wechat/payment/create-order',
        request
      )

      console.log('📡 [WechatPayment] 创建支付订单响应:', response)

      if (response?.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('❌ [WechatPayment] 创建支付订单失败:', error)
      throw error
    }
  },

  /**
   * 查询支付状态
   * API: GET /wechat/payment/query-status?tradeNo=XXX
   */
  queryPaymentStatus: async (
    outTradeNo: string
  ): Promise<'pending' | 'success' | 'failed' | 'cancelled' | null> => {
    try {
      console.log('📡 [WechatPayment] 查询支付状态:', outTradeNo)

      const response = await api.get<ApiResponse<{ status: string }>>(
        `/wechat/payment/query-status?tradeNo=${outTradeNo}`
      )

      console.log('📡 [WechatPayment] 支付状态查询响应:', response)

      if (response?.data?.status) {
        return response.data.status as 'pending' | 'success' | 'failed' | 'cancelled'
      }
      return null
    } catch (error) {
      console.error('❌ [WechatPayment] 查询支付状态失败:', error)
      throw error
    }
  },

  /**
   * 发起退款
   * API: POST /wechat/payment/refund
   */
  refundPayment: async (
    outTradeNo: string,
    reason: string,
    refundFee?: number
  ): Promise<{ status: string; refundId?: string } | null> => {
    try {
      console.log('📡 [WechatPayment] 发起退款:', outTradeNo)

      const response = await api.post<ApiResponse>(
        '/wechat/payment/refund',
        {
          outTradeNo,
          reason,
          refundFee
        }
      )

      console.log('📡 [WechatPayment] 退款响应:', response)

      if (response?.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('❌ [WechatPayment] 退款失败:', error)
      throw error
    }
  }
}

export default wechatPaymentService
