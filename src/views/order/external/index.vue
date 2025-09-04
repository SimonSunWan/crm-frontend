<template>
  <div class="order-page art-full-height">
    <!-- 搜索区域 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="订单编号">
          <ElInput v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </ElFormItem>
        <ElFormItem label="客户名称">
          <ElInput v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
        </ElFormItem>
        <ElFormItem label="订单状态">
          <ElSelect
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 200px"
          >
            <ElOption label="待确认" value="pending" />
            <ElOption label="已确认" value="confirmed" />
            <ElOption label="生产中" value="producing" />
            <ElOption label="已完成" value="completed" />
            <ElOption label="已取消" value="cancelled" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="下单时间">
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
          <ElButton @click="showDialog('add')" v-ripple>新增订单</ElButton>
          <ElButton @click="handleExport" v-ripple>导出数据</ElButton>
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
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  // 组件导入
  import { Search, Refresh } from '@element-plus/icons-vue'
  import OrderDialog from './modules/order-dialog.vue'

  // Element Plus 组件
  import { ElMessage, ElMessageBox } from 'element-plus'

  // 工具和组合式函数
  import { useTable } from '@/composables/useTable'
  import type { ColumnOption } from '@/types/component'

  defineOptions({ name: 'Order' })

  // 类型定义
  interface OrderItem {
    id: number
    orderNo: string
    customerName: string
    customerPhone: string
    productName: string
    quantity: number
    unitPrice: number
    totalAmount: number
    status: string
    orderDate: string
    deliveryDate: string
    remark: string
  }

  // 响应式数据
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentOrderData = ref<Partial<OrderItem>>({})
  const selectedRows = ref<OrderItem[]>([])

  // 搜索表单
  const searchForm = ref({
    orderNo: '',
    customerName: '',
    status: '',
    dateRange: []
  })

  // 模拟数据
  const mockData: OrderItem[] = [
    {
      id: 1,
      orderNo: 'ORD202401001',
      customerName: '张三',
      customerPhone: '13800138001',
      productName: '高端服务器',
      quantity: 2,
      unitPrice: 15000,
      totalAmount: 30000,
      status: 'confirmed',
      orderDate: '2024-01-15',
      deliveryDate: '2024-02-15',
      remark: '客户要求高质量配置'
    },
    {
      id: 2,
      orderNo: 'ORD202401002',
      customerName: '李四',
      customerPhone: '13800138002',
      productName: '网络设备',
      quantity: 5,
      unitPrice: 2000,
      totalAmount: 10000,
      status: 'producing',
      orderDate: '2024-01-18',
      deliveryDate: '2024-02-18',
      remark: '标准配置即可'
    },
    {
      id: 3,
      orderNo: 'ORD202401003',
      customerName: '王五',
      customerPhone: '13800138003',
      productName: '软件授权',
      quantity: 10,
      unitPrice: 500,
      totalAmount: 5000,
      status: 'completed',
      orderDate: '2024-01-20',
      deliveryDate: '2024-01-25',
      remark: '已交付客户'
    }
  ]

  // 表格列配置
  const columns = ref<ColumnOption<OrderItem>[]>([
    { type: 'selection' as const, width: 55 },
    { prop: 'orderNo', label: '订单编号', width: 150 },
    { prop: 'customerName', label: '客户姓名', width: 120 },
    { prop: 'customerPhone', label: '联系电话', width: 130 },
    { prop: 'productName', label: '产品名称', width: 150 },
    { prop: 'quantity', label: '数量', width: 80 },
    {
      prop: 'unitPrice',
      label: '单价',
      width: 100,
      formatter: (row: OrderItem) => `¥${row.unitPrice}`
    },
    {
      prop: 'totalAmount',
      label: '总金额',
      width: 120,
      formatter: (row: OrderItem) => `¥${row.totalAmount}`
    },
    {
      prop: 'status',
      label: '订单状态',
      width: 120,
      formatter: (row: OrderItem) => {
        const statusMap: Record<string, { type: string; text: string }> = {
          pending: { type: 'info', text: '待确认' },
          confirmed: { type: 'warning', text: '已确认' },
          producing: { type: 'primary', text: '生产中' },
          completed: { type: 'success', text: '已完成' },
          cancelled: { type: 'danger', text: '已取消' }
        }
        const status = statusMap[row.status] || { type: 'info', text: '未知' }
        return h(ElTag, { type: status.type as any }, () => status.text)
      }
    },
    { prop: 'orderDate', label: '下单时间', width: 120 },
    { prop: 'deliveryDate', label: '交付时间', width: 120 },
    { prop: 'remark', label: '备注', width: 200 },
    {
      label: '操作',
      width: 200,
      fixed: 'right' as const,
      formatter: (row: OrderItem) => {
        return h('div', { class: 'action-buttons' }, [
          h(
            ElButton,
            {
              type: 'primary',
              link: true,
              size: 'small',
              onClick: () => showDialog('edit', row)
            },
            () => '编辑'
          ),
          h(
            ElButton,
            {
              type: 'success',
              link: true,
              size: 'small',
              onClick: () => handleStatusChange(row)
            },
            () => '状态变更'
          ),
          h(
            ElButton,
            {
              type: 'danger',
              link: true,
              size: 'small',
              onClick: () => handleDelete(row)
            },
            () => '删除'
          )
        ])
      }
    }
  ])

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
      apiFn: () => Promise.resolve({ data: mockData, total: mockData.length }),
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      }
    }
  })

  // 搜索处理
  const handleSearch = () => {
    getData()
  }

  const resetSearch = () => {
    searchForm.value = { orderNo: '', customerName: '', status: '', dateRange: [] }
    getData()
  }

  // 弹窗处理
  const showDialog = (type: 'add' | 'edit', row?: OrderItem) => {
    dialogType.value = type
    currentOrderData.value = type === 'edit' ? { ...row } : {}
    dialogVisible.value = true
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    refreshData()
    ElMessage.success(`${dialogType.value === 'add' ? '新增' : '编辑'}订单成功`)
  }

  // 其他操作
  const handleSelectionChange = (rows: OrderItem[]) => {
    selectedRows.value = rows
  }

  const handleStatusChange = (row: OrderItem) => {
    ElMessage.info(`变更订单状态：${row.orderNo}`)
  }

  const handleDelete = async (row: OrderItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除订单 ${row.orderNo} 吗？`, '提示', {
        type: 'warning'
      })
      ElMessage.success('删除成功')
      refreshData()
    } catch {
      // 用户取消删除
    }
  }

  const handleExport = () => {
    ElMessage.info('导出功能开发中...')
  }

  // 初始化
  onMounted(() => {
    getData()
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
