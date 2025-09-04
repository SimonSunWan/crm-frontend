<template>
  <div class="user-page art-full-height">
    <!-- 搜索区域 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton v-auth="'add'" @click="showDialog('add')" v-ripple> 新增用户 </ElButton>
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
  // 组件导入
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'

  // Element Plus 组件
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'

  // 工具和组合式函数
  import { useTable } from '@/composables/useTable'
  import { useAuth } from '@/composables/useAuth'
  import { UserService } from '@/api/usersApi'
  import type { ApiResponse } from '@/utils/table/tableCache'
  import type { UserListItem } from '@/types/api'

  defineOptions({ name: 'User' })

  // API 服务
  const { getUserList, deleteUser } = UserService
  const { hasAuth } = useAuth()

  // 响应式数据
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 搜索表单
  const searchForm = ref({
    name: undefined,
    phone: undefined,
    email: undefined,
    status: undefined
  })

  const getUserStatusConfig = (status: any) => {
    const statusMap: Record<string, { type: 'success' | 'danger' | 'info'; text: string }> = {
      true: { type: 'success', text: '启用' },
      false: { type: 'danger', text: '禁用' }
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
        size: 20,
        ...searchForm.value
      },
      excludeParams: ['daterange'],
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'userName', label: '用户名' },
        { prop: 'nickName', label: '姓名' },
        { prop: 'phone', label: '手机号' },
        { prop: 'email', label: '邮箱' },
        {
          prop: 'roleNames',
          label: '角色',
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
            if (row.roles && row.roles.includes('SUPER')) {
              return h('div', {}, '-')
            }

            const buttons = []

            if (hasAuth('edit')) {
              buttons.push(
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => showDialog('edit', row)
                })
              )
            }

            if (hasAuth('delete')) {
              buttons.push(
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => handleDeleteUser(row)
                })
              )
            }

            if (buttons.length === 0) {
              return h('div', {}, '-')
            }

            return h('div', buttons)
          }
        }
      ]
    },
    transform: {
      dataTransformer: (records: any) => {
        if (!Array.isArray(records)) {
          return []
        }

        return records.map((item: any) => {
          return {
            ...item,
            avatar: ''
          }
        })
      },
      responseAdapter: (response: any): ApiResponse<UserListItem> => {
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
  .user-page {
    :deep(.user) {
      .avatar {
        width: 40px;
        height: 40px;
        margin-left: 0;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
