<template>
  <div class="department-page art-full-height">
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
          <ElButton @click="showModel('department', null, true)" v-ripple> 添加部门 </ElButton>
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

      <!-- 部门弹窗 -->
      <DepartmentDialog
        v-model:visible="dialogVisible"
        :type="isEdit ? 'edit' : 'add'"
        :department-data="currentEditDepartment || undefined"
        :parent-id="currentParentId"
        :is-sub-department="isSubDepartment"
        :department-list="tableData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import DepartmentDialog from './modules/department-dialog.vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/composables/useTableColumns'
  import { DepartmentService } from '@/api/departmentApi'
  import type { DepartmentListItem } from '@/types/api'

  defineOptions({ name: 'Department' })

  const loading = ref(false)

  const initialSearchState = {
    deptName: ''
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
      label: '部门名称',
      key: 'deptName',
      type: 'input',
      props: {
        clearable: true,
        placeholder: '请输入部门名称'
      }
    }
  ])

  const tableData = ref<DepartmentListItem[]>([])
  const isExpanded = ref(false)
  const tableRef = ref()

  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const currentEditDepartment = ref<DepartmentListItem | null>(null)
  const currentParentId = ref<number | null>(null)
  const isSubDepartment = ref(false)

  const { columns, columnChecks } = useTableColumns(() => [
    {
      prop: 'deptName',
      label: '部门名称',
      show: true
    },
    {
      prop: 'leaderNames',
      label: '负责人',
      show: true,
      formatter: (row: any) => {
        if (row.leaderNames && row.leaderNames.length > 0) {
          return row.leaderNames.join(', ')
        }
        return '-'
      }
    },
    {
      prop: 'memberNames',
      label: '部门成员',
      show: true,
      formatter: (row: any) => {
        if (row.memberNames && row.memberNames.length > 0) {
          return row.memberNames.join(', ')
        }
        return '-'
      }
    },
    {
      prop: 'status',
      label: '状态',
      show: true,
      formatter: (row: any) => {
        const statusConfig = getStatusConfig(row.status)
        return h(ElTag, { type: statusConfig.type as any, size: 'small' }, () => statusConfig.text)
      }
    },
    {
      prop: 'sortOrder',
      label: '排序',
      show: true
    },
    {
      prop: 'action',
      label: '操作',
      width: 165,
      show: true,
      formatter: (row: any) => {
        return h('div', [
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => handleAddChild(row)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEdit(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDelete(row)
          })
        ])
      },
      fixed: 'right'
    }
  ])

  const getTableData = async () => {
    try {
      loading.value = true
      const response = await DepartmentService.getDepartments(appliedFilters)
      tableData.value = response.records || []
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const handleRefresh = () => {
    getTableData()
  }

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

  const showModel = (
    type: string,
    data: DepartmentListItem | null,
    isAdd: boolean,
    parentId?: number
  ) => {
    isEdit.value = !isAdd
    currentEditDepartment.value = data
    currentParentId.value = parentId || null
    isSubDepartment.value = !!parentId
    dialogVisible.value = true
  }

  const handleDialogSubmit = async (formData: any) => {
    try {
      if (isEdit.value && currentEditDepartment.value) {
        await DepartmentService.updateDepartment(currentEditDepartment.value.id, formData)
        ElMessage.success('编辑成功')
      } else {
        await DepartmentService.createDepartment(formData)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getTableData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (row: DepartmentListItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除部门 "${row.deptName}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await DepartmentService.deleteDepartment(row.id)
      ElMessage.success('删除成功')
      getTableData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
      }
    }
  }

  const handleEdit = (row: DepartmentListItem) => {
    showModel('department', row, false)
  }

  const handleAddChild = (row: DepartmentListItem) => {
    showModel('department', null, true, row.id)
  }

  const getStatusConfig = (status: boolean) => {
    return status ? { type: 'primary', text: '启用' } : { type: 'info', text: '禁用' }
  }

  onMounted(() => {
    getTableData()
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
