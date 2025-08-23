<template>
  <div class="menu-page art-full-height">
    <!-- 搜索区域 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :showZebra="false" v-model:columns="columnChecks" @refresh="handleRefresh">
        <template #left>
          <ElButton v-auth="'add'" @click="showModel('menu', null, true)" v-ripple>
            添加菜单
          </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      />

      <!-- 菜单弹窗 -->
      <MenuDialog
        v-model:visible="dialogVisible"
        :type="isEdit ? 'edit' : 'add'"
        :menu-data="currentEditMenu || undefined"
        :parent-id="currentParentId"
        :is-sub-menu="isSubMenu"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  // 组件导入
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'
  import MenuDialog from './modules/menu-dialog.vue'

  // Element Plus 组件和类型
  import { ElMessage, ElMessageBox, ElTag, ElButton } from 'element-plus'

  // Store
  import { useMenuStore } from '@/store/modules/menu'

  // 工具和组合式函数
  import { useTableColumns } from '@/composables/useTableColumns'
  import { formatMenuTitle } from '@/router/utils/utils'

  // 枚举和类型
  import { AppRouteRecord } from '@/types/router'

  // API 服务
  import { getMenus, deleteMenu, convertMenuToRoute } from '@/api/menuApi'

  defineOptions({ name: 'Menus' })

  const { menuList } = storeToRefs(useMenuStore())

  const loading = ref(false)

  const initialSearchState = {
    name: '',
    route: ''
  }

  const formFilters = reactive({ ...initialSearchState })

  const appliedFilters = reactive({ ...initialSearchState })

  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getTableData()
  }

  const handleSearch = () => {
    Object.assign(appliedFilters, { ...formFilters })
    getTableData()
  }

  const formItems = computed(() => [
    {
      label: '名称',
      key: 'name',
      type: 'input',
      props: {
        clearable: true
      }
    },
    {
      label: '路由地址',
      key: 'route',
      type: 'input',
      props: {
        clearable: true
      }
    }
  ])

  const buildMenuTypeTag = (row: AppRouteRecord) => {
    if (row.meta?.originalMenuType === 'button') {
      return 'danger'
    }

    if (row.children && row.children.length > 0) {
      const hasRealMenu = row.children.some(
        (child: AppRouteRecord) => child.meta?.originalMenuType !== 'button'
      )
      return hasRealMenu ? 'info' : 'primary'
    }

    if (row.meta?.link && row.meta?.isIframe) {
      return 'success'
    } else if (row.path) {
      return 'primary'
    } else if (row.meta?.link) {
      return 'warning'
    }

    return 'primary'
  }

  const buildMenuTypeText = (row: AppRouteRecord) => {
    if (row.meta?.originalMenuType === 'button') {
      return '权限'
    }

    if (row.children && row.children.length > 0) {
      const hasRealMenu = row.children.some(
        (child: AppRouteRecord) => child.meta?.originalMenuType !== 'button'
      )
      return hasRealMenu ? '目录' : '菜单'
    } else if (row.meta?.link && row.meta?.isIframe) {
      return '内嵌'
    } else if (row.path) {
      return '菜单'
    } else if (row.meta?.link) {
      return '外链'
    }
  }

  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'meta.title',
      label: '名称',
      minWidth: 120,
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.originalMenuType === 'button') {
          return row.meta?.originalAuthName || row.meta?.title || ''
        }
        return formatMenuTitle(row.meta?.title)
      }
    },
    {
      prop: 'type',
      label: '类型',
      formatter: (row: AppRouteRecord) => {
        return h(ElTag, { type: buildMenuTypeTag(row) }, () => buildMenuTypeText(row))
      }
    },
    {
      prop: 'path',
      label: '路由地址',
      formatter: (row: AppRouteRecord) => {
        return row.path || ''
      }
    },
    {
      prop: 'authMark',
      label: '权限标识',
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.originalMenuType === 'button') {
          return row.meta?.originalAuthMark || ''
        }
        return row.meta?.originalAuthMark || row.meta?.authMark || ''
      }
    },
    {
      prop: 'meta.icon',
      label: '图标',
      width: 80,
      formatter: (row: AppRouteRecord) => {
        if (!row.meta?.icon) return '-'
        const iconText = row.meta.icon.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        return h('i', { class: 'iconfont-sys' }, iconText)
      }
    },
    {
      prop: 'meta.sort',
      label: '排序',
      width: 80,
      formatter: (row: AppRouteRecord) => {
        return row.meta?.sort || 1
      }
    },
    {
      prop: 'meta.isEnable',
      label: '状态',
      width: 80,
      formatter: (row: AppRouteRecord) => {
        return h(ElTag, { type: row.meta?.isEnable ? 'success' : 'danger' }, () =>
          row.meta?.isEnable ? '启用' : '禁用'
        )
      }
    },

    {
      prop: 'operation',
      label: '操作',
      width: 180,
      formatter: (row: AppRouteRecord) => {
        return h('div', [
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => showModel('menu', row, true)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showDialog('edit', row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteMenu(row)
          })
        ])
      }
    }
  ])

  const handleRefresh = () => {
    getTableData()
  }

  const dialogVisible = ref(false)
  const currentEditMenu = ref<AppRouteRecord | null>(null)
  const currentParentId = ref<number>(0)
  const isSubMenu = ref(false)

  const tableData = ref<AppRouteRecord[]>([])

  onMounted(() => {
    getTableData()
  })

  const getTableData = async () => {
    loading.value = true
    try {
      const params: any = {
        current: 1,
        size: 100
      }

      if (appliedFilters.name && appliedFilters.name.trim()) {
        params.name = appliedFilters.name.trim()
      }

      if (appliedFilters.route && appliedFilters.route.trim()) {
        params.path = appliedFilters.route.trim()
      }

      const response = await getMenus(params)
      if (response.records) {
        tableData.value = response.records.map(convertMenuToRoute)
      } else {
        tableData.value = []
      }
    } catch {
      ElMessage.error('获取菜单数据失败')
      tableData.value = menuList.value
    } finally {
      loading.value = false
    }
  }

  const isEdit = ref(false)

  const showDialog = (type: string, row: AppRouteRecord) => {
    showModel(type, row, false)
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentEditMenu.value = null
    currentParentId.value = 0
    isSubMenu.value = false
    getTableData()
  }

  const showModel = (type: string, row?: any, isSubMenuFlag: boolean = false) => {
    dialogVisible.value = true
    isEdit.value = false
    isSubMenu.value = isSubMenuFlag

    if (isSubMenuFlag && row) {
      currentParentId.value = row.id || 0
      currentEditMenu.value = null
    } else if (row && type === 'edit') {
      isEdit.value = true
      currentEditMenu.value = row
      currentParentId.value = 0
      isSubMenu.value = false
    } else {
      currentEditMenu.value = null
      currentParentId.value = 0
      isSubMenu.value = false
    }
  }

  const handleDeleteMenu = async (row?: AppRouteRecord) => {
    try {
      const isButton = row?.meta?.originalMenuType === 'button'
      const itemType = isButton ? '权限' : '菜单'

      await ElMessageBox.confirm(`确定要删除该${itemType}吗？删除后无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      if (row && row.id) {
        loading.value = true
        await deleteMenu(row.id)
        const isButton = row?.meta?.originalMenuType === 'button'
        const itemType = isButton ? '权限' : '菜单'
        ElMessage.success(`删除${itemType}成功`)
        getTableData()
      }
    } catch (error) {
      if (error !== 'cancel') {
        const isButton = row?.meta?.originalMenuType === 'button'
        const itemType = isButton ? '权限' : '菜单'
        ElMessage.error(`删除${itemType}失败`)
      }
    } finally {
      loading.value = false
    }
  }

  const isExpanded = ref(false)
  const tableRef = ref()

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value && tableData.value) {
        const processRows = (rows: AppRouteRecord[]) => {
          rows.forEach(row => {
            if (row.children && row.children.length > 0) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(tableData.value)
      }
    })
  }
</script>

<style lang="scss" scoped>
  .menu-page {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }

    :deep(.small-btn) {
      height: 30px !important;
      padding: 0 10px !important;
      font-size: 12px !important;
    }
  }
</style>
