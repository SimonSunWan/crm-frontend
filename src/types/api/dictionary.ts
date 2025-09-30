// 字典类型相关接口
export interface DictionaryTypeItem {
  id: number
  name: string
  code: string
  description?: string
  status: boolean
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
}

export interface DictionaryTypeListData {
  records: DictionaryTypeItem[]
  total: number
  current: number
  size: number
}

export interface CreateDictionaryTypeParams {
  name: string
  code: string
  description?: string
}

export interface UpdateDictionaryTypeParams {
  name?: string
  code?: string
  description?: string
  status?: boolean
}

// 字典枚举相关接口
export interface DictionaryEnumItem {
  id: number
  typeId: number
  parentId?: number
  keyValue: string
  dictValue: string
  sortOrder: number
  level: number
  path?: string
  status: boolean
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  children?: DictionaryEnumItem[]
  hasChildren?: boolean
}

export interface DictionaryEnumListData {
  records: DictionaryEnumItem[]
  total: number
  current: number
  size: number
}

// 根据字典编码获取的数据结构
export interface DictionaryData {
  type: DictionaryTypeItem
  enums: DictionaryEnumItem[]
}

export interface CreateDictionaryEnumParams {
  typeId: number
  parentId?: number
  keyValue: string
  dictValue: string
  sortOrder?: number
}

export interface UpdateDictionaryEnumParams {
  parentId?: number
  keyValue?: string
  dictValue?: string
  sortOrder?: number
  level?: number
  path?: string
  status?: boolean
}

// 批量导入相关接口
export interface BatchImportDictionaryEnumParams {
  typeId: number
  data: BatchImportEnumItem[]
}

export interface BatchImportEnumItem {
  keyValue: string
  dictValue: string
  sortOrder?: number
  parentKeyValue?: string
  level?: number
}

export interface BatchImportResult {
  success: boolean
  message: string
  successCount: number
  failCount: number
  errors?: Array<{
    row: number
    message: string
  }>
}
