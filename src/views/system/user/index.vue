<template>
  <div class="user-page art-full-height">
    <!-- 搜索区域 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton @click="showDialog('add')" v-ripple> 新增用户 </ElButton>
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

      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import type { ApiResponse } from '@/utils/table/tableCache'
  import type { UserListItem } from '@/types/api'

  defineOptions({ name: 'User' })

  const { getUserList, deleteUser } = UserService

  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  const searchForm = ref({
    userName: undefined,
    nickName: undefined,
    phone: undefined,
    email: undefined,
    roleCode: undefined,
    status: undefined
  })

  const getUserStatusConfig = (status: any) => {
    const statusMap: Record<string, { type: 'primary' | 'info'; text: string }> = {
      true: { type: 'primary', text: '启用' },
      false: { type: 'info', text: '禁用' }
    }
    return statusMap[status + ''] || { type: 'info', text: '未知' }
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable<UserListItem>({
    core: {
      apiFn: getUserList,
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm.value
      },
      excludeParams: ['daterange'],
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'userName',
          label: '账号',
          formatter: row => row.userName || '-'
        },
        {
          prop: 'nickName',
          label: '姓名',
          formatter: row => row.nickName || '-'
        },
        {
          prop: 'phone',
          label: '手机号',
          formatter: row => row.phone || '-'
        },
        {
          prop: 'email',
          label: '邮箱',
          formatter: row => row.email || '-'
        },
        {
          prop: 'roleNames',
          label: '角色名称',
          formatter: row => {
            if (!row.roleNames || row.roleNames.length === 0) {
              return '-'
            }
            return h(
              'div',
              {},
              row.roleNames.map(roleName =>
                h(
                  ElTag,
                  { type: 'info', size: 'small', style: 'margin-right: 4px;' },
                  () => roleName
                )
              )
            )
          }
        },
        {
          prop: 'status',
          label: '状态',
          formatter: row => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: row => {
            return h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDeleteUser(row)
              })
            ])
          }
        }
      ]
    },
    transform: {
      dataTransformer: (records: any) => {
        if (!Array.isArray(records)) {
          return []
        }
        return records.map((item: any) => ({
          ...item,
          avatar: ''
        }))
      },
      responseAdapter: (response: any): ApiResponse<UserListItem> => {
        if (response) {
          const { records, total, current, size } = response
          return {
            records: records || [],
            total: total || 0,
            current: current || 1,
            size: size || 10
          }
        }
        return { records: [], total: 0, current: 1, size: 10 }
      }
    }
  })

  const handleSearch = (params: Record<string, any>) => {
    const { daterange, ...filtersParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]
    Object.assign(searchParams, { ...filtersParams, startTime, endTime })
    getData()
  }

  const showDialog = (type: 'add' | 'edit', row?: UserListItem): void => {
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleDeleteUser = async (row: UserListItem): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除用户 "${row.userName}" 吗？`, '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      getData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
      }
    }
  }

  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      getData()
    } catch (error) {
      console.error(error)
    }
  }
</script>

<style lang="scss" scoped>
  @use './style';
</style>
