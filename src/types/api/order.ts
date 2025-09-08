/**
 * 工单相关类型定义
 */

// 工单详情记录
export interface OrderDetail {
  id: number
  orderId: string
  repairPerson?: string
  repairDate?: string
  avicResponsibility?: boolean
  faultClassification?: string
  faultLocation?: string
  partCategory?: string
  partLocation?: string
  repairDescription?: string
  sparePartLocation?: string
  spareParts?: Array<{
    partNumber: string
    name: string
    quantity: string
    oldPartCode: string
    newPartCode: string
  }>
  costs?: Array<{
    category: string
    amount: string
  }>
  labors?: Array<{
    faultLocation: string
    repairItem: string
    quantity: string
    coefficient: string
  }>
  createTime: string
  updateTime?: string
}

// 工单基础信息
export interface OrderItem {
  id?: string
  customer: string
  vehicleModel: string
  repairShop: string
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
  // 详情记录
  details?: OrderDetail[]
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
  vehicleModel: string
  repairShop: string
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
  vehicleModel?: string
  repairShop?: string
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
  // 维修记录字段
  repairPerson?: string
  repairDate?: string
  avicResponsibility?: boolean
  faultClassification?: string
  faultLocation?: string
  partCategory?: string
  partLocation?: string
  repairDescription?: string
  // 详情记录字段
  sparePartLocation?: string
  spareParts?: Array<{
    partNumber: string
    name: string
    quantity: string
    oldPartCode: string
    newPartCode: string
  }>
  costs?: Array<{
    category: string
    amount: string
  }>
  labors?: Array<{
    faultLocation: string
    repairItem: string
    quantity: string
    coefficient: string
  }>
}
