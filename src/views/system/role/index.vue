<template>
  <div class="role-page art-full-height">
    <!-- 搜索区域 -->
    <RoleSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton @click="showDialog('add')" v-ripple> 新增角色 </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <!-- 角色弹窗 -->
    <RoleDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :role-data="currentEditRole || undefined"
      @submit="handleDialogSubmit"
    />

    <!-- 权限弹窗 -->
    <PermissionDialog v-model:visible="permissionDialog" :role-data="currentEditRole" />
  </div>
</template>

<script setup lang="ts">
  import RoleSearch from './modules/role-search.vue'
  import RoleDialog from './modules/role-dialog.vue'
  import PermissionDialog from './modules/permission-dialog.vue'
  import ArtButtonMore, { ButtonMoreItem } from '@/components/forms/art-button-more/index.vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { RoleService } from '@/api/rolesApi'
  import type { Role } from '@/types/api'

  defineOptions({ name: 'Role' })

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const currentEditRole = ref<Role | null>(null)

  const searchForm = reactive({
    roleName: ''
  })

  const columnChecks = ref([])

  const {
    columns,
    data,
    loading,
    pagination,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable<Role>({
    core: {
      apiFn: RoleService.getRoles,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm
      },
      excludeParams: ['daterange'],
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'roleName',
          label: '角色名称',
          formatter: row => row.roleName || '-'
        },
        {
          prop: 'roleCode',
          label: '角色编码',
          formatter: row => row.roleCode || '-'
        },
        {
          prop: 'description',
          label: '描述',
          formatter: row => row.description || '-'
        },
        {
          prop: 'status',
          label: '启用',
          formatter: row => {
            return h(ElTag, { type: row.status ? 'primary' : 'info' }, () =>
              row.status ? '启用' : '禁用'
            )
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          formatter: row => formatDate(row.createTime || '')
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: row => {
            const buttons = []
            buttons.push(
              h(ArtButtonMore, {
                list: [
                  { key: 'permission', label: '菜单权限' },
                  { key: 'edit', label: '编辑角色' },
                  { key: 'delete', label: '删除角色' }
                ],
                onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row)
              })
            )
            return h('div', buttons)
          }
        }
      ]
    },
    transform: {
      responseAdapter: (response: any) => {
        if (response) {
          const { records, total, current, size } = response
          return {
            records: records || [],
            total: total || 0,
            current: current || 1,
            size: size || 20
          }
        }
        return { records: [], total: 0, current: 1, size: 20 }
      }
    }
  })

  onMounted(() => {
    getData()
  })

  const dialogType = ref<'add' | 'edit'>('add')

  const showDialog = (type: 'add' | 'edit', row?: Role) => {
    dialogVisible.value = true
    dialogType.value = type
    if (type === 'edit' && row) {
      currentEditRole.value = row
    } else {
      currentEditRole.value = null
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
    }
    permissionDialog.value = true
  }

  const deleteRole = async (row: Role) => {
    try {
      await ElMessageBox.confirm('确定删除该角色吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      await RoleService.deleteRole(row.id)
      ElMessage.success('删除成功')
      getData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
      }
    }
  }

  const handleSearch = () => {
    getData()
  }

  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentEditRole.value = null
      getData()
    } catch (error) {
      console.error(error)
    }
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
  @use './style';
</style>
