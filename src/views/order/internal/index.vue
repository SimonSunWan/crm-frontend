<template>
  <div class="order-page art-full-height">
    <!-- 搜索区域 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="工单编号">
          <ElInput v-model="searchForm.orderNo" placeholder="请输入工单编号" clearable />
        </ElFormItem>
        <ElFormItem label="整车厂">
          <ElInput v-model="searchForm.customer" placeholder="请输入整车厂名称" clearable />
        </ElFormItem>
        <ElFormItem label="报修人">
          <ElInput v-model="searchForm.reporterName" placeholder="请输入报修人姓名" clearable />
        </ElFormItem>
        <ElFormItem label="报修时间">
          <ElDatePicker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch" :icon="Search">搜索</ElButton>
          <ElButton @click="resetSearch" :icon="Refresh">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton @click="showDialog('add')" v-ripple>新增保内工单</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <OrderDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :order-data="currentOrderData"
        @submit="handleDialogSubmit"
      />

      <OrderViewDialog v-model:visible="viewDialogVisible" :order-data="currentOrderData" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  // 组件导入
  import { Search, Refresh } from '@element-plus/icons-vue'
  import OrderDialog from './modules/order-dialog.vue'
  import OrderViewDialog from './modules/order-view-dialog.vue'
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'

  // Element Plus 组件
  import { ElMessage, ElMessageBox } from 'element-plus'

  // 工具和组合式函数
  import { useTable } from '@/composables/useTable'
  import { useDictionary } from '@/composables/useDictionary'
  import type { ColumnOption } from '@/types/component'
  import type { OrderItem } from '@/types/api'
  import { InternalOrderService } from '@/api/orderApi'

  defineOptions({ name: 'Order' })

  // 响应式数据
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const currentOrderData = ref<Partial<OrderItem>>({})
  const selectedRows = ref<OrderItem[]>([])

  // 字典相关
  const { getDictionaryData, getDictionaryLabel } = useDictionary()

  // 搜索表单
  const searchForm = ref({
    orderNo: '',
    customer: '',
    reporterName: '',
    dateRange: []
  })

  const {
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable<OrderItem>({
    core: {
      apiFn: InternalOrderService.getOrderList,
      apiParams: {
        ...searchForm.value
      },
      immediate: false
    }
  })

  // 表格列配置
  const columns = ref<ColumnOption<OrderItem>[]>([
    { type: 'selection' as const, width: 55 },
    { prop: 'id', label: '工单编号', width: 150 },
    { prop: 'customer', label: '整车厂', width: 120 },
    { prop: 'reporterName', label: '报修人', width: 100 },
    { prop: 'contactInfo', label: '联系方式', width: 130 },
    { prop: 'reportDate', label: '报修日期', width: 120 },
    {
      prop: 'projectType',
      label: '项目类型',
      width: 100,
      formatter: (row: OrderItem) => {
        return getDictionaryLabel('ORDER_PROJECT_TYPE', row.projectType)
      }
    },
    { prop: 'projectStage', label: '项目阶段', width: 100 },
    { prop: 'licensePlate', label: '车牌号', width: 100 },
    { prop: 'vinNumber', label: '车架号', width: 180 },
    {
      prop: 'mileage',
      label: '里程(KM)',
      width: 100,
      formatter: (row: OrderItem) => (row.mileage ? `${row.mileage}` : '-')
    },
    { prop: 'vehicleLocation', label: '车辆位置', width: 150 },
    { prop: 'packCode', label: 'PACK码', width: 100 },
    {
      prop: 'underWarranty',
      label: '保修状态',
      width: 100,
      formatter: (row: OrderItem) => {
        return h(ElTag, { type: row.underWarranty ? 'success' : 'danger' }, () =>
          row.underWarranty ? '保内' : '保外'
        )
      }
    },
    { prop: 'faultDescription', label: '故障描述', width: 200 },
    { prop: 'createTime', label: '创建时间', width: 160 },
    {
      label: '操作',
      width: 180,
      fixed: 'right' as const,
      formatter: (row: OrderItem) => {
        return h('div', { class: 'action-buttons' }, [
          h(ArtButtonTable, {
            type: 'view',
            onClick: () => showViewDialog(row)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showDialog('edit', row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDelete(row)
          })
        ])
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    getData()
  }

  const resetSearch = () => {
    searchForm.value = { orderNo: '', customer: '', reporterName: '', dateRange: [] }
    getData()
  }

  // 弹窗处理
  const showDialog = (type: 'add' | 'edit', row?: OrderItem) => {
    dialogType.value = type
    currentOrderData.value = type === 'edit' ? { ...row } : {}
    dialogVisible.value = true
  }

  const showViewDialog = (row: OrderItem) => {
    currentOrderData.value = { ...row }
    viewDialogVisible.value = true
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    refreshData()
    ElMessage.success(`${dialogType.value === 'add' ? '新增' : '编辑'}保内工单成功`)
  }

  // 其他操作
  const handleSelectionChange = (rows: OrderItem[]) => {
    selectedRows.value = rows
  }

  const handleDelete = async (row: OrderItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除保内工单 ${row.id} 吗？`, '提示', {
        type: 'warning'
      })
      await InternalOrderService.deleteOrder(row.id)
      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 初始化
  onMounted(async () => {
    await getDictionaryData('ORDER_PROJECT_TYPE')
    getData()
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
