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
      width="520px"
      align-center
      class="el-dialog-border"
    >
      <ElScrollbar height="70vh">
        <ElTree
          ref="treeRef"
          :data="processedMenuList"
          show-checkbox
          node-key="id"
          :default-expand-all="isExpandAll"
          :props="defaultProps"
          @check="handleTreeCheck"
        >
          <template #default="{ data }">
            <div style="display: flex; align-items: center">
              <span v-if="data.isAuth">
                {{ data.label }}
              </span>
              <span v-else>{{ defaultProps.label(data) }}</span>
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
  import { formatMenuTitle } from '@/router/utils/utils'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import {
    getRoles,
    createRole,
    updateRole,
    deleteRole as deleteRoleApi,
    getRoleMenus,
    updateRoleMenus,
    type Role,
    type RoleCreate
  } from '@/api/rolesApi'

  defineOptions({ name: 'Role' })

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const { menuList } = storeToRefs(useMenuStore())
  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const currentEditRole = ref<Role | null>(null)

  /* 处理菜单数据,将 authList 转换为子节点 */
  const processedMenuList = computed(() => {
    const processNode = (node: any) => {
      const processed = { ...node }

      /* 如果有 authList,将其转换为子节点 */
      if (node.meta && node.meta.authList && node.meta.authList.length) {
        const authNodes = node.meta.authList.map((auth: any) => ({
          id: `${node.id}_${auth.authMark}`,
          name: `${node.name}_${auth.authMark}`,
          label: auth.title,
          authMark: auth.authMark,
          isAuth: true,
          checked: auth.checked || false
        }))

        processed.children = processed.children ? [...processed.children, ...authNodes] : authNodes
      }

      // 递归处理子节点
      if (processed.children) {
        processed.children = processed.children.map(processNode)
      }

      return processed
    }

    return menuList.value.map(processNode)
  })

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
        if (response && response.menuIds) {
          // 设置树组件的选中状态
          nextTick(() => {
            const tree = treeRef.value
            if (tree) {
              tree.setCheckedKeys(response.menuIds)
            }
          })
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('获取角色菜单权限失败')
      }
    }
    permissionDialog.value = true
  }

  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || ''
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

      // 保存角色菜单权限
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
      const allKeys = getAllNodeKeys(processedMenuList.value)
      tree.setCheckedKeys(allKeys)
    } else {
      /* 取消全选:清空所有选中 */
      tree.setCheckedKeys([])
    }

    isSelectAll.value = !isSelectAll.value
  }

  const getAllNodeKeys = (nodes: any[]): number[] => {
    const keys: number[] = []
    const traverse = (nodeList: any[]) => {
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

    // 使用树组件的getCheckedKeys方法获取选中的节点
    const checkedKeys = tree.getCheckedKeys()
    const allKeys = getAllNodeKeys(processedMenuList.value)

    /* 判断是否全选:选中的节点数量等于总节点数量 */
    isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
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
</style>
