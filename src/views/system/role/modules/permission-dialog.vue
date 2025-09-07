<template>
  <ElDialog
    v-model="dialogVisible"
    title="菜单权限"
    width="500px"
    align-center
    class="el-dialog-border"
  >
    <ElScrollbar height="70vh">
      <ElTree
        ref="treeRef"
        :key="`tree-${currentRole?.id || 'new'}`"
        :data="menuTreeData"
        show-checkbox
        node-key="id"
        check-strictly
        :default-expand-all="isExpandAll"
        :props="defaultProps"
        @check="handleTreeCheck"
        @check-change="handleCheckChange"
      >
        <template #default="{ data }">
          <div class="tree-node-content">
            <div class="node-info">
              <span>{{ data.name }}</span>
            </div>
            <ElTag :type="getMenuTypeTag(data)" size="small" class="node-tag">
              {{ getMenuTypeText(data) }}
            </ElTag>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="toggleExpandAll">
          {{ isExpandAll ? '全部收起' : '全部展开' }}
        </ElButton>
        <ElButton @click="toggleSelectAll" style="margin-left: 8px">
          {{ isSelectAll ? '取消全选' : '全部选择' }}
        </ElButton>
        <ElButton type="primary" @click="savePermission">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useMenuStore } from '@/store/modules/menu'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { RoleService } from '@/api/rolesApi'
  import type { Role, MenuNode } from '@/types/api'

  interface Props {
    visible: boolean
    roleData?: Role | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const { menuList } = storeToRefs(useMenuStore())

  // 响应式数据
  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const menuTreeData = ref<MenuNode[]>([])
  const selectedMenuIds = ref<number[]>([])
  const isInitializing = ref(false)
  const isUpdatingParent = ref(false)

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const currentRole = computed(() => props.roleData)

  // 树组件配置
  const defaultProps = {
    children: 'children',
    label: (data: any) => data.name || ''
  }

  // 获取菜单类型标签颜色
  const getMenuTypeTag = (row: any) => {
    if (row.menuType === 'button') return 'danger'
    if (row.children?.length) {
      const hasRealMenu = row.children.some((child: any) => child.menuType !== 'button')
      return hasRealMenu ? 'info' : 'primary'
    }
    return row.isLink ? 'warning' : 'primary'
  }

  // 获取菜单类型文本
  const getMenuTypeText = (row: any) => {
    if (row.menuType === 'button') return '权限'
    if (row.children?.length) {
      const hasRealMenu = row.children.some((child: any) => child.menuType !== 'button')
      return hasRealMenu ? '目录' : '菜单'
    }
    return row.isLink ? '外链' : '菜单'
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.roleData],
    async ([visible, role]) => {
      if (visible && role && typeof role !== 'boolean') {
        await loadRoleMenus(role)
      }
    },
    { immediate: true }
  )

  // 监听菜单列表变化
  watch(
    menuList,
    async (newMenuList, oldMenuList) => {
      if (dialogVisible.value && currentRole.value) {
        const hasMenuChange =
          !oldMenuList ||
          newMenuList.length !== oldMenuList.length ||
          JSON.stringify(newMenuList.map(m => m.id).sort()) !==
            JSON.stringify(oldMenuList.map(m => m.id).sort())

        if (hasMenuChange) {
          await loadRoleMenus(currentRole.value)
        }
      }
    },
    { deep: true }
  )

  // 加载角色菜单权限
  const loadRoleMenus = async (role: Role) => {
    try {
      const response = await RoleService.getRoleMenus(role.id)

      if (response?.menuTree && response.selectedIds) {
        menuTreeData.value = response.menuTree
        const allValidIds = getAllNodeKeys(response.menuTree)
        selectedMenuIds.value = response.selectedIds.filter((id: number) =>
          allValidIds.includes(id)
        )
      } else {
        menuTreeData.value = []
        selectedMenuIds.value = []
      }

      nextTick(() => {
        setTreeCheckedKeys(selectedMenuIds.value)
      })
    } catch (error) {
      console.error(error)
      menuTreeData.value = []
      selectedMenuIds.value = []
      nextTick(() => {
        setTreeCheckedKeys([])
      })
    }
  }

  // 处理树节点选择
  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return
    selectedMenuIds.value = tree.getCheckedKeys()
  }

  // 处理节点勾选变化
  const handleCheckChange = (data: any, checked: boolean) => {
    const tree = treeRef.value
    if (!tree || data.menuType === 'button' || isInitializing.value || isUpdatingParent.value)
      return

    const currentKeys = tree.getCheckedKeys()
    const childIds = getNonPermissionChildIds(data.children || [])

    // 向下联动: 勾选/取消勾选子节点
    tree.setCheckedKeys(
      checked
        ? [...new Set([...currentKeys, ...childIds])]
        : currentKeys.filter((id: number) => !childIds.includes(id))
    )

    // 向上联动: 检查并更新父节点状态
    nextTick(() => {
      updateParentNodeStatus(data.id)
    })
  }

  // 获取非权限类型的子节点ID
  const getNonPermissionChildIds = (children: any[]): number[] => {
    const ids: number[] = []
    const traverse = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.menuType !== 'button') {
          ids.push(node.id)
          if (node.children?.length) traverse(node.children)
        }
      })
    }
    traverse(children)
    return ids
  }

  // 更新父节点状态
  const updateParentNodeStatus = (nodeId: number) => {
    const tree = treeRef.value
    if (!tree) return

    const currentKeys = tree.getCheckedKeys()
    const directParentId = getDirectParentId(menuTreeData.value, nodeId)
    if (!directParentId) return

    const parentNode = findNodeById(menuTreeData.value, directParentId)
    if (parentNode && parentNode.menuType !== 'button') {
      const childIds = getNonPermissionChildIds(parentNode.children || [])
      const hasCheckedChildren = childIds.some(id => currentKeys.includes(id))
      const isParentChecked = currentKeys.includes(directParentId)

      if (hasCheckedChildren && !isParentChecked) {
        isUpdatingParent.value = true
        tree.setCheckedKeys([...currentKeys, directParentId])
        nextTick(() => {
          isUpdatingParent.value = false
        })
      } else if (!hasCheckedChildren && isParentChecked) {
        isUpdatingParent.value = true
        tree.setCheckedKeys(currentKeys.filter((id: number) => id !== directParentId))
        nextTick(() => {
          isUpdatingParent.value = false
        })
      }
    }
  }

  // 获取直接父节点ID
  const getDirectParentId = (nodes: any[], targetId: number): number | null => {
    for (const node of nodes) {
      if (node.children?.length) {
        if (node.children.some((child: any) => child.id === targetId)) {
          return node.id
        }
        const found = getDirectParentId(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  // 根据ID查找节点
  const findNodeById = (nodes: any[], id: number): any => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children?.length) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 安全设置树节点选中状态(不触发联动)
  const setTreeCheckedKeys = (keys: number[]) => {
    const tree = treeRef.value
    if (!tree) return

    isInitializing.value = true
    tree.setCheckedKeys(keys)
    nextTick(() => {
      isInitializing.value = false
    })
  }

  // 切换展开状态
  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    const nodes = tree.store.nodesMap
    for (const node in nodes) {
      nodes[node].expanded = !isExpandAll.value
    }
    isExpandAll.value = !isExpandAll.value
  }

  // 切换全选状态
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

  // 获取所有节点键值
  const getAllNodeKeys = (nodes: MenuNode[]): number[] => {
    const keys: number[] = []
    const traverse = (nodeList: MenuNode[]) => {
      nodeList.forEach(node => {
        if (node.id) keys.push(node.id)
        if (node.children?.length) traverse(node.children)
      })
    }
    traverse(nodes)
    return keys
  }

  // 保存权限
  const savePermission = async () => {
    if (!currentRole.value) {
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
        } catch (error) {
          if (error === 'cancel') return
        }
      }

      await RoleService.updateRoleMenus(currentRole.value.id, allCheckedKeys)
      ElMessage.success('保存成功')
      dialogVisible.value = false
    } catch (error) {
      console.error(error)
    }
  }

  // 弹窗关闭时重置状态
  watch(dialogVisible, newValue => {
    if (!newValue) {
      selectedMenuIds.value = []
      menuTreeData.value = []
      isSelectAll.value = false
      nextTick(() => {
        setTreeCheckedKeys([])
      })
    }
  })
</script>

<style lang="scss" scoped>
  .tree-node-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .node-info {
      display: flex;
      align-items: center;
    }

    .node-tag {
      margin-right: 10px;
    }
  }

  .dialog-footer {
    text-align: right;
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
