export interface DepartmentInfo {
  id: number
  deptName: string
  parentId?: number
  level: number
  path?: string
  sortOrder: number
  leaderIds?: number[]
  leaderNames?: string[]
  memberIds?: number[]
  memberNames?: string[]
  status: boolean
  userCount: number
  children?: DepartmentInfo[]
  createTime?: string
  updateTime?: string
  createdBy?: string
  updatedBy?: string
}

export interface DepartmentListData {
  records: DepartmentListItem[]
  total: number
  current: number
  size: number
}

export interface DepartmentListItem extends Omit<DepartmentInfo, 'children'> {
  children?: DepartmentListItem[]
}

export interface CreateDepartmentParams {
  deptName: string
  parentId?: number
  sortOrder?: number
  leaderIds?: number[]
  memberIds?: number[]
  status?: boolean
}

export interface UpdateDepartmentParams {
  deptName?: string
  parentId?: number
  sortOrder?: number
  leaderIds?: number[]
  memberIds?: number[]
  status?: boolean
}

export interface DepartmentUserRelation {
  userId: number
  deptId: number
  joinDate?: string
  isActive: boolean
}

export interface DepartmentTreeNode
  extends Omit<DepartmentInfo, 'createTime' | 'updateTime' | 'createdBy' | 'updatedBy'> {
  children?: DepartmentTreeNode[]
}
