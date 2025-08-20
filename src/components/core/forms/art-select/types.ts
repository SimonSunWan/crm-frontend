import type { DictionaryEnumItem } from '@/types/api/dictionary'

export interface ArtSelectProps {
  /** 字典编码 */
  dictCode: string
  /** 占位符 */
  placeholder?: string
  /** 是否可清空 */
  clearable?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可搜索 */
  filterable?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 是否显示加载状态 */
  loading?: boolean
}

export interface ArtSelectEmits {
  change: [value: string | string[] | undefined]
  clear: []
}

export interface ArtSelectExpose {
  fetchDictionaryData: () => Promise<void>
  options: Readonly<DictionaryEnumItem[]>
}
