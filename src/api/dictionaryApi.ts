import request from '@/utils/http'

export class DictionaryService {
  // 获取字典类型列表
  static getDictionaryTypes(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.Dictionary.DictionaryTypeListData>({
      url: '/dictionary/types',
      params
    })
  }

  // 创建字典类型
  static createDictionaryType(data: Api.Dictionary.CreateDictionaryTypeParams) {
    return request.post<Api.Dictionary.DictionaryTypeItem>({
      url: '/dictionary/types',
      data
    })
  }

  // 获取单个字典类型
  static getDictionaryTypeById(id: number) {
    return request.get<Api.Dictionary.DictionaryTypeItem>({
      url: `/dictionary/types/${id}`
    })
  }

  // 更新字典类型
  static updateDictionaryType(id: number, data: Api.Dictionary.UpdateDictionaryTypeParams) {
    return request.put<Api.Dictionary.DictionaryTypeItem>({
      url: `/dictionary/types/${id}`,
      data
    })
  }

  // 删除字典类型
  static deleteDictionaryType(id: number) {
    return request.del({
      url: `/dictionary/types/${id}`
    })
  }

  // 获取字典枚举列表
  static getDictionaryEnums(typeId: number, params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.Dictionary.DictionaryEnumListData>({
      url: '/dictionary/enums',
      params: { type_id: typeId, ...params }
    })
  }

  // 创建字典枚举
  static createDictionaryEnum(data: Api.Dictionary.CreateDictionaryEnumParams) {
    return request.post<Api.Dictionary.DictionaryEnumItem>({
      url: '/dictionary/enums',
      data
    })
  }

  // 获取单个字典枚举
  static getDictionaryEnumById(id: number) {
    return request.get<Api.Dictionary.DictionaryEnumItem>({
      url: `/dictionary/enums/${id}`
    })
  }

  // 更新字典枚举
  static updateDictionaryEnum(id: number, data: Api.Dictionary.UpdateDictionaryEnumParams) {
    return request.put<Api.Dictionary.DictionaryEnumItem>({
      url: `/dictionary/enums/${id}`,
      data
    })
  }

  // 删除字典枚举
  static deleteDictionaryEnum(id: number) {
    return request.del({
      url: `/dictionary/enums/${id}`
    })
  }
}
