/**
 * 工单相关类型定义
 */

// 工单基础信息
export interface OrderItem {
  id: string
  customer: string
  reporterName: string
  contactInfo: string
  reportDate: string
  projectType: string
  projectStage: string
  licensePlate?: string
  vinNumber: string
  mileage?: number
  vehicleLocation?: string
  vehicleDate?: string
  packCode?: string
  packDate?: string
  underWarranty: boolean
  faultDescription?: string
  createTime: string
  updateTime?: string
}

// 工单列表数据
export interface OrderListData {
  records: OrderItem[]
  total: number
  current: number
  size: number
}

// 创建工单参数
export interface OrderCreateParams {
  customer: string
  reporterName: string
  contactInfo: string
  reportDate: string
  projectType: string
  projectStage: string
  licensePlate?: string
  vinNumber: string
  mileage?: number
  vehicleLocation?: string
  vehicleDate?: string
  packCode?: string
  packDate?: string
  underWarranty: boolean
  faultDescription?: string
}

// 更新工单参数
export interface OrderUpdateParams {
  customer?: string
  reporterName?: string
  contactInfo?: string
  reportDate?: string
  projectType?: string
  projectStage?: string
  licensePlate?: string
  vinNumber?: string
  mileage?: number
  vehicleLocation?: string
  vehicleDate?: string
  packCode?: string
  packDate?: string
  underWarranty?: boolean
  faultDescription?: string
}
