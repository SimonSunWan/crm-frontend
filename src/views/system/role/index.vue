<template>
  <div class="page-content">
    <ElForm>
      <ElRow :gutter="12">
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem>
            <ElInput placeholder="请输入角色名称" v-model="searchForm.roleName"></ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :lg="6">
          <ElFormItem>
            <ElButton v-ripple @click="getTableData">搜索</ElButton>
            <ElButton @click="showDialog('add')" v-ripple>新增角色</ElButton>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
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
              <!-- 可以在 list 中添加 auth 属性来控制按钮的权限, auth 属性值为权限标识 -->
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

  onMounted(() => {
    getTableData()
  })

  const getTableData = async () => {
    try {
      loading.value = true
      console.log('getTableData')
      const response = await getRoles({
        current: 1,
        size: 100,
        roleName: searchForm.roleName || undefined
      })
      if (response && response.records) {
        roleList.value = response.records
      }
    } finally {
      loading.value = false
    }
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
        // 获取角色的菜单权限
        const response = await getRoleMenus(role.id)

        if (response && response.menuTree && response.selectedIds) {
          menuTreeData.value = response.menuTree
          selectedMenuIds.value = response.selectedIds

          // 设置树组件的选中状态
          nextTick(() => {
            const tree = treeRef.value
            if (tree) {
              tree.setCheckedKeys(response.selectedIds)
            }
          })
        } else {
          menuTreeData.value = []
          selectedMenuIds.value = []

          // 清空树组件的选中状态
          nextTick(() => {
            const tree = treeRef.value
            if (tree) {
              tree.setCheckedKeys([])
            }
          })
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('获取角色菜单权限失败')
        menuTreeData.value = []
        selectedMenuIds.value = []

        // 清空树组件的选中状态
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

  // 监听权限弹窗的关闭，清理相关状态
  watch(permissionDialog, newValue => {
    if (!newValue) {
      // 弹窗关闭时，清理相关状态
      currentEditRole.value = null
      selectedMenuIds.value = []
      menuTreeData.value = []
      isSelectAll.value = false

      // 重置树组件的选中状态
      nextTick(() => {
        const tree = treeRef.value
        if (tree) {
          tree.setCheckedKeys([])
        }
      })
    }
  })

  // 监听弹窗显示状态、选中菜单ID和菜单数据的变化，设置树组件的选中状态
  watch(
    [permissionDialog, selectedMenuIds, menuTreeData],
    ([dialogVisible, menuIds, menuList]) => {
      if (dialogVisible && menuList.length > 0) {
        nextTick(() => {
          const tree = treeRef.value
          if (tree) {
            // 如果有选中的菜单ID，则设置选中状态；否则清空选中状态
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

  // 监听菜单数据变化，当菜单数据变化时，如果权限弹窗是打开的，需要重新获取角色权限
  watch(
    menuList,
    async (newMenuList, oldMenuList) => {
      // 检查菜单数据是否真的发生了变化（长度或内容变化）
      if (permissionDialog.value && currentEditRole.value) {
        const hasMenuChange =
          !oldMenuList ||
          newMenuList.length !== oldMenuList.length ||
          JSON.stringify(newMenuList.map(m => m.id).sort()) !==
            JSON.stringify(oldMenuList.map(m => m.id).sort())

        if (hasMenuChange) {
          try {
            // 重新获取角色的菜单权限
            const response = await getRoleMenus(currentEditRole.value.id)
            if (response && response.menuTree && response.selectedIds) {
              menuTreeData.value = response.menuTree
              // 过滤掉已删除的菜单ID
              const validSelectedIds = response.selectedIds.filter((id: number) => {
                return newMenuList.some(menu => menu.id === id)
              })
              selectedMenuIds.value = validSelectedIds
            } else {
              menuTreeData.value = []
              selectedMenuIds.value = []
            }

            // 更新树组件的选中状态
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
          } catch (error) {
            console.error('重新获取角色菜单权限失败:', error)
            // 如果获取失败，清空选中状态
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
      getTableData() // 刷新列表
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
          getTableData() // 刷新列表
        }
      })
    } catch (error) {
      ElMessage.error(error as string)
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

      // 获取选中的菜单ID
      const checkedKeys = tree.getCheckedKeys()
      const halfCheckedKeys = tree.getHalfCheckedKeys()

      // 合并完全选中和半选中的节点
      const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

      // 如果没有选中任何菜单，提示用户确认
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

      // 直接使用选中的ID，包括菜单ID和权限ID
      await updateRoleMenus(currentEditRole.value.id, allCheckedKeys)

      ElMessage.success('权限保存成功')
      permissionDialog.value = false
    } catch (error) {
      console.error(error)
      ElMessage.error('权限保存失败')
    }
  }

  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    // 使用store.nodesMap直接控制所有节点的展开状态
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
      /* 全选:获取所有节点的key并设置为选中 */
      const allKeys = getAllNodeKeys(menuTreeData.value)
      if (allKeys.length > 0) {
        tree.setCheckedKeys(allKeys)
        isSelectAll.value = true
      }
    } else {
      /* 取消全选:清空所有选中 */
      tree.setCheckedKeys([])
      isSelectAll.value = false
    }
  }

  const getAllNodeKeys = (nodes: MenuNode[]): number[] => {
    const keys: number[] = []
    const traverse = (nodeList: MenuNode[]) => {
      nodeList.forEach(node => {
        if (node.id) {
          // 直接使用节点的实际ID，无论是菜单还是权限按钮
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

    // 使用树组件的getCheckedKeys方法获取选中的节点
    const checkedKeys = tree.getCheckedKeys()

    // 更新选中的菜单ID
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
