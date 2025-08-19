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
  keyValue: string
  dictValue: string
  sortOrder: number
  status: boolean
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
}

export interface DictionaryEnumListData {
  records: DictionaryEnumItem[]
  total: number
  current: number
  size: number
}

export interface CreateDictionaryEnumParams {
  typeId: number
  keyValue: string
  dictValue: string
  sortOrder?: number
}

export interface UpdateDictionaryEnumParams {
  keyValue?: string
  dictValue?: string
  sortOrder?: number
  status?: boolean
}
