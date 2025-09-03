import request from '@/utils/http'

export class DictionaryService {
  static getDictionaryTypes(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.Dictionary.DictionaryTypeListData>({
      url: '/dictionary/types',
      params
    })
  }

  static getDictionaryByCode(code: string) {
    return request.get<import('@/types/api/dictionary').DictionaryData>({
      url: `/dictionary/public/by-code/${code}`
    })
  }

  static createDictionaryType(data: Api.Dictionary.CreateDictionaryTypeParams) {
    return request.post<Api.Dictionary.DictionaryTypeItem>({
      url: '/dictionary/types',
      data
    })
  }

  static getDictionaryTypeById(id: number) {
    return request.get<Api.Dictionary.DictionaryTypeItem>({
      url: `/dictionary/types/${id}`
    })
  }

  static updateDictionaryType(id: number, data: Api.Dictionary.UpdateDictionaryTypeParams) {
    return request.put<Api.Dictionary.DictionaryTypeItem>({
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
    return request.get<Api.Dictionary.DictionaryEnumListData>({
      url: '/dictionary/enums',
      params: { type_id: typeId, ...params }
    })
  }

  static createDictionaryEnum(data: Api.Dictionary.CreateDictionaryEnumParams) {
    return request.post<Api.Dictionary.DictionaryEnumItem>({
      url: '/dictionary/enums',
      data
    })
  }

  static getDictionaryEnumById(id: number) {
    return request.get<Api.Dictionary.DictionaryEnumItem>({
      url: `/dictionary/enums/${id}`
    })
  }

  static updateDictionaryEnum(id: number, data: Api.Dictionary.UpdateDictionaryEnumParams) {
    return request.put<Api.Dictionary.DictionaryEnumItem>({
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
