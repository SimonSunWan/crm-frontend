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
      >
        <template #default="{ data }">
          <div class="tree-node-content">
            <div class="node-info">
              <span>{{ data.name }}</span>
            </div>
            <ElTag :type="buildMenuTypeTag(data)" size="small" class="node-tag">
              {{ buildMenuTypeText(data) }}
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
  // Store
  import { useMenuStore } from '@/store/modules/menu'

  // Element Plus 组件
  import { ElMessage, ElMessageBox } from 'element-plus'

  // API 服务
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

  // Store
  const { menuList } = storeToRefs(useMenuStore())

  // 响应式数据
  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const menuTreeData = ref<MenuNode[]>([])
  const selectedMenuIds = ref<number[]>([])

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const currentRole = computed(() => props.roleData)

  // 树组件配置
  const defaultProps = {
    children: 'children',
    label: (data: any) => {
      return data.name || ''
    }
  }

  // 构建菜单类型标签颜色
  const buildMenuTypeTag = (row: any) => {
    if (row.menuType === 'button') {
      return 'danger'
    }

    if (row.children && row.children.length > 0) {
      const hasRealMenu = row.children.some((child: any) => child.menuType !== 'button')
      return hasRealMenu ? 'info' : 'primary'
    }

    if (row.isLink) {
      return 'warning'
    } else if (row.path) {
      return 'primary'
    }

    return 'primary'
  }

  // 构建菜单类型文本
  const buildMenuTypeText = (row: any) => {
    if (row.menuType === 'button') {
      return '权限'
    }

    if (row.children && row.children.length > 0) {
      const hasRealMenu = row.children.some((child: any) => child.menuType !== 'button')
      return hasRealMenu ? '目录' : '菜单'
    } else if (row.isLink) {
      return '外链'
    } else if (row.path) {
      return '菜单'
    }

    return '菜单'
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

      if (response && response.menuTree && response.selectedIds) {
        menuTreeData.value = response.menuTree
        // 获取所有菜单树中的有效ID
        const allValidIds = getAllNodeKeys(response.menuTree)
        // 过滤出在菜单树中存在的选中ID
        const validSelectedIds = response.selectedIds.filter((id: number) => {
          return allValidIds.includes(id)
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
    } catch (error) {
      console.error(error)
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

  // 处理树节点选择
  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys()
    selectedMenuIds.value = checkedKeys
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
          if (error === 'cancel') {
            return
          }
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
        const tree = treeRef.value
        if (tree) {
          tree.setCheckedKeys([])
        }
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
