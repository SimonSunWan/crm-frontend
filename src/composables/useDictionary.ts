import { ref, computed } from 'vue'
import { DictionaryService } from '@/api/dictionaryApi'
import type { DictionaryEnumItem } from '@/types/api/dictionary'

const dictionaryCache = new Map<string, DictionaryEnumItem[]>()

export function useDictionary() {
  const loading = ref(false)

  const getDictionaryData = async (dictCode: string): Promise<DictionaryEnumItem[]> => {
    if (dictionaryCache.has(dictCode)) {
      return dictionaryCache.get(dictCode)!
    }

    loading.value = true
    try {
      const response = await DictionaryService.getDictionaryByCode(dictCode)
      const enums = response?.enums || []
      dictionaryCache.set(dictCode, enums)
      return enums
    } catch (error) {
      console.error(`获取字典数据失败: ${dictCode}`, error)
      return []
    } finally {
      loading.value = false
    }
  }

  const getDictionaryLabel = (dictCode: string, keyValue: string): string => {
    const enums = dictionaryCache.get(dictCode)
    if (!enums) return keyValue

    const item = enums.find(enumItem => enumItem.keyValue === keyValue)
    return item?.dictValue || keyValue
  }

  const clearCache = (dictCode?: string) => {
    if (dictCode) {
      dictionaryCache.delete(dictCode)
    } else {
      dictionaryCache.clear()
    }
  }

  return {
    loading: computed(() => loading.value),
    getDictionaryData,
    getDictionaryLabel,
    clearCache
  }
}
