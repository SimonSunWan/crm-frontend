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
  repairProgress?: string
  spareParts?: Array<{
    partNumber: string
    name: string
    quantity: string
    oldPartCode?: string
    newPartCode?: string
  }>
  costs?: Array<{
    category: string
    amount: string
    remark?: string
  }>
  labors?: Array<{
    repairSelection: string | string[]
    faultLocation?: string
    repairItem?: string
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
  projectType?: string
  projectStage?: string
  insurer?: string
  assessor?: string
  licensePlate?: string
  vinNumber: string
  mileage?: number
  vehicleLocation?: string
  vehicleDate?: string
  packCode?: string
  packDate?: string
  sealCode?: string
  underWarranty: boolean
  faultDescription?: string
  isEnd?: boolean
  orderProgress?: string
  sparePartLocation?: string
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
  customer: string | null
  vehicleModel: string | null
  repairShop: string | null
  reporterName: string | null
  contactInfo: string | null
  reportDate: string | null
  insurer: string | null
  assessor: string | null
  licensePlate?: string | null
  vinNumber: string | null
  mileage?: number
  vehicleLocation?: string | null
  vehicleDate?: string | null
  packCode?: string | null
  packDate?: string | null
  sealCode?: string | null
  underWarranty: boolean
  faultDescription?: string | null
  isEnd?: boolean
}

// 更新工单参数
export interface OrderUpdateParams {
  customer?: string | null
  vehicleModel?: string | null
  repairShop?: string | null
  reporterName?: string | null
  contactInfo?: string | null
  reportDate?: string | null
  insurer?: string | null
  assessor?: string | null
  licensePlate?: string | null
  vinNumber?: string | null
  mileage?: number
  vehicleLocation?: string | null
  vehicleDate?: string | null
  packCode?: string | null
  packDate?: string | null
  sealCode?: string | null
  underWarranty?: boolean
  faultDescription?: string | null
  isEnd?: boolean
  orderProgress?: string | null
  // 维修记录字段
  repairPerson?: string | null
  repairDate?: string | null
  avicResponsibility?: boolean
  faultLocation?: string | null
  repairDescription?: string | null
  repairProgress?: string | null
  // 详情记录字段
  sparePartLocation?: string | null
  spareParts?: Array<{
    partNumber: string
    name: string
    quantity: string
  }>
  costs?: Array<{
    category: string
    amount: string
    remark?: string
  }>
  labors?: Array<{
    repairSelection: string | string[]
    faultLocation?: string
    quantity: string
    coefficient: string
  }>
}
