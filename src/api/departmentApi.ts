import request from '@/utils/http'
import type {
  DepartmentInfo,
  DepartmentListData,
  CreateDepartmentParams,
  UpdateDepartmentParams,
  DepartmentTreeNode
} from '@/types/api'

export class DepartmentService {
  static getDepartments(params?: { deptName?: string; status?: boolean }) {
    return request.get<DepartmentListData>({
      url: '/departments/',
      params
    })
  }

  static getDepartmentTree() {
    return request.get<DepartmentTreeNode[]>({
      url: '/departments/tree'
    })
  }

  static getDepartment(id: number) {
    return request.get<DepartmentInfo>({
      url: `/departments/${id}`
    })
  }

  static createDepartment(data: CreateDepartmentParams) {
    return request.post<DepartmentInfo>({
      url: '/departments/',
      data
    })
  }

  static updateDepartment(id: number, data: UpdateDepartmentParams) {
    return request.put<DepartmentInfo>({
      url: `/departments/${id}`,
      data
    })
  }

  static deleteDepartment(id: number) {
    return request.del({
      url: `/departments/${id}`
    })
  }

  static getDepartmentUsers(id: number) {
    return request.get({
      url: `/departments/${id}/users`
    })
  }
}
