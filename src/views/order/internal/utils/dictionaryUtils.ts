// 字典工具函数

// 字典项类型定义
interface DictionaryItem {
  keyValue: string
  dictValue: string
  children?: DictionaryItem[]
}

// 获取字典标签的通用函数
export const getDictionaryLabel = (keyValue: string, options: DictionaryItem[]): string => {
  if (!keyValue || !options?.length) return keyValue || '-'

  const option = options.find(item => item.keyValue === keyValue)
  return option?.dictValue || keyValue
}

// 递归查找层级字典标签的通用函数
export const getHierarchicalDictionaryLabel = (
  keyValue: string,
  options: DictionaryItem[]
): string => {
  if (!keyValue || !options?.length) return keyValue || '-'

  const findLabelByKey = (options: DictionaryItem[], targetKey: string): string => {
    for (const option of options) {
      if (option.keyValue === targetKey) {
        return option.dictValue
      }
      if (option.children?.length) {
        const result = findLabelByKey(option.children, targetKey)
        if (result) return result
      }
    }
    return ''
  }

  const result = findLabelByKey(options, keyValue)
  return result || keyValue
}

// 数据清理函数 - 确保字段不是数组格式
export const cleanFieldValue = (value: any): any => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

// 级联选择器配置
export const cascaderProps = {
  value: 'keyValue',
  label: 'dictValue',
  children: 'children',
  emitPath: true,
  checkStrictly: false
}
