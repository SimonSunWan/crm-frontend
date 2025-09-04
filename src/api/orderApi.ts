import request from '@/utils/http'
import type { OrderItem, OrderListData, OrderCreateParams, OrderUpdateParams } from '@/types/api'

export class InternalOrderService {
  static getOrderList(params: any) {
    return request.get<OrderListData>({
      url: '/orders/internal/',
      params
    })
  }

  static createOrder(data: OrderCreateParams) {
    return request.post<{ data: OrderItem; message: string }>({
      url: '/orders/internal/',
      data
    })
  }

  static getOrderById(id: string) {
    return request.get<{ data: OrderItem }>({
      url: `/orders/internal/${id}`
    })
  }

  static updateOrder(id: string, data: OrderUpdateParams) {
    return request.put<{ data: OrderItem; message: string }>({
      url: `/orders/internal/${id}`,
      data
    })
  }

  static deleteOrder(id: string) {
    return request.del<{ message: string }>({
      url: `/orders/internal/${id}`
    })
  }
}

export class ExternalOrderService {
  static getOrderList(params: any) {
    return request.get<OrderListData>({
      url: '/orders/external/',
      params
    })
  }

  static createOrder(data: OrderCreateParams) {
    return request.post<{ data: OrderItem; message: string }>({
      url: '/orders/external/',
      data
    })
  }

  static getOrderById(id: string) {
    return request.get<{ data: OrderItem }>({
      url: `/orders/external/${id}`
    })
  }

  static updateOrder(id: string, data: OrderUpdateParams) {
    return request.put<{ data: OrderItem; message: string }>({
      url: `/orders/external/${id}`,
      data
    })
  }

  static deleteOrder(id: string) {
    return request.del<{ message: string }>({
      url: `/orders/external/${id}`
    })
  }
}
