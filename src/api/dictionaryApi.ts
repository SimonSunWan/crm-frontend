import request from '@/utils/http'
import type {
  DictionaryTypeItem,
  DictionaryTypeListData,
  CreateDictionaryTypeParams,
  UpdateDictionaryTypeParams,
  DictionaryEnumItem,
  DictionaryEnumListData,
  CreateDictionaryEnumParams,
  UpdateDictionaryEnumParams,
  DictionaryData
} from '@/types/api'

export class DictionaryService {
  static getDictionaryTypes(params: Api.Common.PaginatingSearchParams) {
    return request.get<DictionaryTypeListData>({
      url: '/dictionary/types',
      params
    })
  }

  static getDictionaryByCode(code: string) {
    return request.get<DictionaryData>({
      url: `/dictionary/public/by-code/${code}`
    })
  }

  static createDictionaryType(data: CreateDictionaryTypeParams) {
    return request.post<DictionaryTypeItem>({
      url: '/dictionary/types',
      data
    })
  }

  static getDictionaryTypeById(id: number) {
    return request.get<DictionaryTypeItem>({
      url: `/dictionary/types/${id}`
    })
  }

  static updateDictionaryType(id: number, data: UpdateDictionaryTypeParams) {
    return request.put<DictionaryTypeItem>({
      url: `/dictionary/types/${id}`,
      data
    })
  }

  static deleteDictionaryType(id: number) {
    return request.del({
      url: `/dictionary/types/${id}`
    })
  }

  static getDictionaryEnums(typeId: number, params: Api.Common.PaginatingSearchParams) {
    return request.get<DictionaryEnumListData>({
      url: '/dictionary/enums',
      params: { type_id: typeId, ...params }
    })
  }

  static createDictionaryEnum(data: CreateDictionaryEnumParams) {
    return request.post<DictionaryEnumItem>({
      url: '/dictionary/enums',
      data
    })
  }

  static getDictionaryEnumById(id: number) {
    return request.get<DictionaryEnumItem>({
      url: `/dictionary/enums/${id}`
    })
  }

  static updateDictionaryEnum(id: number, data: UpdateDictionaryEnumParams) {
    return request.put<DictionaryEnumItem>({
      url: `/dictionary/enums/${id}`,
      data
    })
  }

  static deleteDictionaryEnum(id: number) {
    return request.del({
      url: `/dictionary/enums/${id}`
    })
  }
}
