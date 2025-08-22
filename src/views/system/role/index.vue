<template>
  <div class="role-page art-full-height">
    <RoleSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></RoleSearch>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton v-auth="'add'" @click="showDialog('add')" v-ripple>新增角色</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable :data="roleList" v-loading="loading">
        <template #default>
          <ElTableColumn label="角色名称" prop="roleName" />
          <ElTableColumn label="角色编码" prop="roleCode" />
          <ElTableColumn label="描述" prop="description" />
          <ElTableColumn label="启用" prop="status">
            <template #default="scope">
              <ElTag :type="scope.row.status ? 'primary' : 'info'">
                {{ scope.row.status ? '启用' : '禁用' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="创建时间" prop="createTime">
            <template #default="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </ElTableColumn>
          <ElTableColumn fixed="right" label="操作" width="100px">
            <template #default="scope">
              <ElRow>
                <ArtButtonMore
                  :list="[
                    { key: 'permission', label: '菜单权限' },
                    { key: 'edit', label: '编辑角色' },
                    { key: 'delete', label: '删除角色' }
                  ]"
                  @click="buttonMoreClick($event, scope.row)"
                />
              </ElRow>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="30%"
      align-center
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
        <ElFormItem label="角色名称" prop="roleName">
          <ElInput v-model="form.roleName" />
        </ElFormItem>
        <ElFormItem label="角色编码" prop="roleCode">
          <ElInput v-model="form.roleCode" />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput v-model="form.description" type="textarea" :rows="3" />
        </ElFormItem>
        <ElFormItem label="启用">
          <ElSwitch v-model="form.status" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit(formRef)">提交</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="permissionDialog"
      title="菜单权限"
      width="500px"
      align-center
      class="el-dialog-border"
    >
      <ElScrollbar height="70vh">
        <ElTree
          ref="treeRef"
          :key="`tree-${currentEditRole?.id || 'new'}`"
          :data="menuTreeData"
          show-checkbox
          node-key="id"
          check-strictly
          :default-expand-all="isExpandAll"
          :props="defaultProps"
          @check="handleTreeCheck"
        >
          <template #default="{ data }">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
              "
            >
              <div style="display: flex; align-items: center">
                <span v-if="data.menuType === 'button'">{{ data.authName || data.title }}</span>
                <span v-else>{{ data.title }}</span>
              </div>
              <ElTag
                :type="data.menuType === 'button' ? 'danger' : 'primary'"
                size="small"
                style="margin-right: 10px"
              >
                {{ data.menuType === 'button' ? '权限' : '菜单' }}
              </ElTag>
            </div>
          </template>
        </ElTree>
      </ElScrollbar>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
          <ElButton @click="toggleSelectAll" style="margin-left: 8px">{{
            isSelectAll ? '取消全选' : '全部选择'
          }}</ElButton>
          <ElButton type="primary" @click="savePermission">保存</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { useMenuStore } from '@/store/modules/menu'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import {
    getRoles,
    createRole,
    updateRole,
    deleteRole as deleteRoleApi,
    getRoleMenus,
    updateRoleMenus,
    type Role,
    type RoleCreate,
    type MenuNode
  } from '@/api/rolesApi'
  import RoleSearch from './modules/role-search.vue'

  defineOptions({ name: 'Role' })

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const { menuList } = storeToRefs(useMenuStore())
  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const currentEditRole = ref<Role | null>(null)
  const menuTreeData = ref<MenuNode[]>([])
  const selectedMenuIds = ref<number[]>([])

  const formRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleCode: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  })

  const form = reactive<RoleCreate>({
    roleName: '',
    roleCode: '',
    description: '',
    status: true
  })

  const roleList = ref<Role[]>([])
  const loading = ref(false)
  const searchForm = reactive({
    roleName: ''
  })

  const columnChecks = ref([])

  onMounted(() => {
    getTableData()
  })

  const getTableData = async () => {
    try {
      loading.value = true
      const params: any = {
        current: 1,
        size: 100
      }

      if (searchForm.roleName) {
        params.roleName = searchForm.roleName
      }

      const response = await getRoles(params)
      if (response && response.records) {
        roleList.value = response.records
      }
    } finally {
      loading.value = false
    }
  }

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchForm, params)
    getTableData()
  }

  const resetSearchParams = () => {
    Object.assign(searchForm, {
      roleName: ''
    })
    getTableData()
  }

  const refreshData = () => {
    getTableData()
  }

  const dialogType = ref('add')

  const showDialog = (type: string, row?: any) => {
    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      currentEditRole.value = row
      form.roleName = row.roleName
      form.roleCode = row.roleCode
      form.description = row.description
      form.status = row.status
    } else {
      currentEditRole.value = null
      form.roleName = ''
      form.roleCode = ''
      form.description = ''
      form.status = true
    }
  }

  const buttonMoreClick = (item: ButtonMoreItem, row: any) => {
    if (item.key === 'permission') {
      showPermissionDialog(row)
    } else if (item.key === 'edit') {
      showDialog('edit', row)
    } else if (item.key === 'delete') {
      deleteRole(row)
    }
  }

  const showPermissionDialog = async (role?: Role) => {
    if (role) {
      currentEditRole.value = role
      try {
        const response = await getRoleMenus(role.id)

        if (response && response.menuTree && response.selectedIds) {
          menuTreeData.value = response.menuTree
          selectedMenuIds.value = response.selectedIds

          nextTick(() => {
            const tree = treeRef.value
            if (tree) {
              tree.setCheckedKeys(response.selectedIds)
            }
          })
        } else {
          menuTreeData.value = []
          selectedMenuIds.value = []

          nextTick(() => {
            const tree = treeRef.value
            if (tree) {
              tree.setCheckedKeys([])
            }
          })
        }
      } catch {
        ElMessage.error('获取角色菜单权限失败')
        menuTreeData.value = []
        selectedMenuIds.value = []

        nextTick(() => {
          const tree = treeRef.value
          if (tree) {
            tree.setCheckedKeys([])
          }
        })
      }
    }
    permissionDialog.value = true
  }

  watch(permissionDialog, newValue => {
    if (!newValue) {
      currentEditRole.value = null
      selectedMenuIds.value = []
      menuTreeData.value = []
      isSelectAll.value = false

      nextTick(() => {
        const tree = treeRef.value
        if (tree) {
          tree.setCheckedKeys([])
        }
      })
    }
  })

  watch(
    [permissionDialog, selectedMenuIds, menuTreeData],
    ([dialogVisible, menuIds, menuList]) => {
      if (dialogVisible && menuList.length > 0) {
        nextTick(() => {
          const tree = treeRef.value
          if (tree) {
            if (menuIds.length > 0) {
              tree.setCheckedKeys(menuIds)
            } else {
              tree.setCheckedKeys([])
            }
          }
        })
      }
    },
    { immediate: true }
  )

  watch(
    menuList,
    async (newMenuList, oldMenuList) => {
      if (permissionDialog.value && currentEditRole.value) {
        const hasMenuChange =
          !oldMenuList ||
          newMenuList.length !== oldMenuList.length ||
          JSON.stringify(newMenuList.map(m => m.id).sort()) !==
            JSON.stringify(oldMenuList.map(m => m.id).sort())

        if (hasMenuChange) {
          try {
            const response = await getRoleMenus(currentEditRole.value.id)
            if (response && response.menuTree && response.selectedIds) {
              menuTreeData.value = response.menuTree
              const validSelectedIds = response.selectedIds.filter((id: number) => {
                return newMenuList.some(menu => menu.id === id)
              })
              selectedMenuIds.value = validSelectedIds
            } else {
              menuTreeData.value = []
              selectedMenuIds.value = []
            }

            nextTick(() => {
              const tree = treeRef.value
              if (tree) {
                if (selectedMenuIds.value.length > 0) {
                  tree.setCheckedKeys(selectedMenuIds.value)
                } else {
                  tree.setCheckedKeys([])
                }
              }
            })
          } catch {
            menuTreeData.value = []
            selectedMenuIds.value = []
            nextTick(() => {
              const tree = treeRef.value
              if (tree) {
                tree.setCheckedKeys([])
              }
            })
          }
        }
      }
    },
    { deep: true }
  )

  const defaultProps = {
    children: 'children',
    label: (data: any) => {
      if (data.menuType === 'button') {
        return data.authName || data.title || ''
      }
      return data.title || ''
    }
  }

  const deleteRole = async (row: Role) => {
    try {
      await ElMessageBox.confirm('确定删除该角色吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })

      await deleteRoleApi(row.id)
      ElMessage.success('删除成功')
      getTableData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    try {
      await formEl.validate(async valid => {
        if (valid) {
          if (dialogType.value === 'add') {
            await createRole(form)
            ElMessage.success('新增成功')
          } else {
            if (currentEditRole.value) {
              await updateRole(currentEditRole.value.id, form)
              ElMessage.success('修改成功')
            }
          }
          dialogVisible.value = false
          formEl.resetFields()
          getTableData()
        }
      })
    } catch {
      ElMessage.error('保存失败')
    }
  }

  const savePermission = async () => {
    if (!currentEditRole.value) {
      ElMessage.error('请先选择角色')
      return
    }

    try {
      const tree = treeRef.value
      if (!tree) {
        ElMessage.error('树组件未初始化')
        return
      }

      const checkedKeys = tree.getCheckedKeys()
      const halfCheckedKeys = tree.getHalfCheckedKeys()

      const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

      if (allCheckedKeys.length === 0) {
        try {
          await ElMessageBox.confirm(
            '当前没有选中任何菜单权限，这将清空该角色的所有权限。确定要继续吗？',
            '确认清空权限',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
        } catch (confirmError) {
          if (confirmError === 'cancel') {
            return
          }
        }
      }

      await updateRoleMenus(currentEditRole.value.id, allCheckedKeys)

      ElMessage.success('权限保存成功')
      permissionDialog.value = false
    } catch {
      ElMessage.error('权限保存失败')
    }
  }

  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    const nodes = tree.store.nodesMap
    for (const node in nodes) {
      nodes[node].expanded = !isExpandAll.value
    }

    isExpandAll.value = !isExpandAll.value
  }

  const toggleSelectAll = () => {
    const tree = treeRef.value
    if (!tree) return

    if (!isSelectAll.value) {
      const allKeys = getAllNodeKeys(menuTreeData.value)
      if (allKeys.length > 0) {
        tree.setCheckedKeys(allKeys)
        isSelectAll.value = true
      }
    } else {
      tree.setCheckedKeys([])
      isSelectAll.value = false
    }
  }

  const getAllNodeKeys = (nodes: MenuNode[]): number[] => {
    const keys: number[] = []
    const traverse = (nodeList: MenuNode[]) => {
      nodeList.forEach(node => {
        if (node.id) {
          keys.push(node.id)
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    traverse(nodes)
    return keys
  }

  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys()

    selectedMenuIds.value = checkedKeys
  }

  const formatDate = (date: string) => {
    return new Date(date)
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      .replace(/\//g, '-')
  }
</script>

<style lang="scss" scoped>
  .page-content {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }
  }

  :deep(.el-dialog-border) {
    .el-tree {
      .el-tree-node__content {
        height: 30px;
        line-height: 30px;
      }
    }
  }
</style>
