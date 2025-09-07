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
          <ElButton @click="showModel('menu', null, true)" v-ripple> 添加菜单 </ElButton>
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
        :menu-list="tableData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'
  import MenuDialog from './modules/menu-dialog.vue'
  import { ElMessage, ElMessageBox, ElTag, ElButton } from 'element-plus'
  import { useMenuStore } from '@/store/modules/menu'
  import { useTableColumns } from '@/composables/useTableColumns'
  import { formatMenuTitle } from '@/router/utils/utils'
  import { AppRouteRecord } from '@/types/router'
  import { MenuService } from '@/api/menuApi'

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
      label: '菜单名称',
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
  }

  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'meta.title',
      label: '菜单名称',
      formatter: (row: any) => {
        if (row.menuType === 'button') {
          return row.name || ''
        }
        return formatMenuTitle(row.name)
      }
    },
    {
      prop: 'type',
      label: '菜单类型',
      formatter: (row: any) => {
        return h(ElTag, { type: buildMenuTypeTag(row) }, () => buildMenuTypeText(row))
      }
    },
    {
      prop: 'path',
      label: '路由地址',
      formatter: (row: any) => {
        if (row.isLink) {
          return row.link || '-'
        } else {
          return row.path || '-'
        }
      }
    },
    {
      prop: 'authMark',
      label: '权限标识',
      formatter: (row: any) => {
        if (row.menuType === 'button') {
          return row.authMark || '-'
        }
        return row.authMark || '-'
      }
    },
    {
      prop: 'meta.icon',
      label: '图标',
      formatter: (row: any) => {
        if (!row.icon) return '-'
        const iconText = row.icon.replace(/&#x([0-9a-fA-F]+);/g, (match: string, hex: string) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        return h('i', { class: 'iconfont-sys' }, iconText)
      }
    },
    {
      prop: 'meta.isEnable',
      label: '状态',
      formatter: (row: any) => {
        return h(ElTag, { type: row.isEnable ? 'success' : 'danger' }, () =>
          row.isEnable ? '启用' : '禁用'
        )
      }
    },
    {
      prop: 'meta.sort',
      label: '排序',
      formatter: (row: any) => {
        return row.sort || 1
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 165,
      formatter: (row: any) => {
        return h('div', [
          row.menuType !== 'button'
            ? h(ArtButtonTable, {
                type: 'add',
                onClick: () => showModel('menu', row, true)
              })
            : h('span', { style: 'width: 46px; display: inline-block;' }),
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

  const tableData = ref<any[]>([])

  onMounted(() => {
    getTableData()
  })

  const getTableData = async () => {
    loading.value = true
    try {
      const params: any = {}
      if (appliedFilters.name && appliedFilters.name.trim()) {
        params.name = appliedFilters.name.trim()
      }
      if (appliedFilters.route && appliedFilters.route.trim()) {
        params.path = appliedFilters.route.trim()
      }
      const response = await MenuService.getMenus(params)
      if (response) {
        tableData.value = response
      } else {
        tableData.value = []
      }
    } catch (error) {
      console.error(error)
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

  const handleDeleteMenu = async (row?: any) => {
    try {
      await ElMessageBox.confirm(`确定要删除${row.name}吗？删除后无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      if (row && row.id) {
        loading.value = true
        await MenuService.deleteMenu(row.id)
        ElMessage.success('删除成功')

        const menuStore = useMenuStore()
        await menuStore.fetchMenuList()

        getTableData()
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
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
        const processRows = (rows: any[]) => {
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
  @use './style';
</style>
