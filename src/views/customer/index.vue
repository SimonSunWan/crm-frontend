<template>
  <div class="customer-page art-full-height">
    <!-- 搜索区域 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="客户名称">
          <ElInput v-model="searchForm.name" placeholder="请输入客户名称" clearable />
        </ElFormItem>
        <ElFormItem label="联系电话">
          <ElInput v-model="searchForm.phone" placeholder="请输入联系电话" clearable />
        </ElFormItem>
        <ElFormItem label="客户状态">
          <ElSelect
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 200px"
          >
            <ElOption label="潜在客户" value="potential" />
            <ElOption label="意向客户" value="intention" />
            <ElOption label="成交客户" value="deal" />
            <ElOption label="流失客户" value="lost" />
          </ElSelect>
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
          <ElButton @click="showDialog('add')" v-ripple>新增客户</ElButton>
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

      <CustomerDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :customer-data="currentCustomerData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  // 组件导入
  import { Search, Refresh } from '@element-plus/icons-vue'
  import CustomerDialog from './modules/customer-dialog.vue'

  // Element Plus 组件
  import { ElMessage, ElMessageBox } from 'element-plus'

  // 工具和组合式函数
  import { useTable } from '@/composables/useTable'

  defineOptions({ name: 'Customer' })

  // 类型定义
  interface CustomerItem {
    id: number
    name: string
    phone: string
    email: string
    company: string
    status: string
    source: string
    createTime: string
    lastContactTime: string
    remark: string
  }

  // 响应式数据
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentCustomerData = ref<Partial<CustomerItem>>({})
  const selectedRows = ref<CustomerItem[]>([])

  // 搜索表单
  const searchForm = ref({
    name: '',
    phone: '',
    status: ''
  })

  // 模拟数据
  const mockData: CustomerItem[] = [
    {
      id: 1,
      name: '张三',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      company: '科技有限公司',
      status: 'potential',
      source: '网络推广',
      createTime: '2024-01-15',
      lastContactTime: '2024-01-20',
      remark: '对产品很感兴趣，需要进一步跟进'
    },
    {
      id: 2,
      name: '李四',
      phone: '13800138002',
      email: 'lisi@example.com',
      company: '贸易公司',
      status: 'intention',
      source: '老客户推荐',
      createTime: '2024-01-10',
      lastContactTime: '2024-01-18',
      remark: '已发送产品资料，等待回复'
    },
    {
      id: 3,
      name: '王五',
      phone: '13800138003',
      email: 'wangwu@example.com',
      company: '制造企业',
      status: 'deal',
      source: '展会获取',
      createTime: '2024-01-05',
      lastContactTime: '2024-01-25',
      remark: '已成交，合同金额50万'
    }
  ]

  // 表格列配置
  const columns = ref([
    { type: 'selection', width: 55 },
    { prop: 'name', label: '客户姓名', width: 120 },
    { prop: 'phone', label: '联系电话', width: 130 },
    { prop: 'email', label: '邮箱', width: 180 },
    { prop: 'company', label: '公司名称', width: 200 },
    {
      prop: 'status',
      label: '客户状态',
      width: 120,
      render: (row: CustomerItem) => {
        const statusMap: Record<string, { type: string; text: string }> = {
          potential: { type: 'info', text: '潜在客户' },
          intention: { type: 'warning', text: '意向客户' },
          deal: { type: 'success', text: '成交客户' },
          lost: { type: 'danger', text: '流失客户' }
        }
        const status = statusMap[row.status] || { type: 'info', text: '未知' }
        return h(ElTag, { type: status.type as any }, () => status.text)
      }
    },
    { prop: 'source', label: '客户来源', width: 120 },
    { prop: 'createTime', label: '创建时间', width: 120 },
    { prop: 'lastContactTime', label: '最后联系', width: 120 },
    { prop: 'remark', label: '备注', width: 200 },
    {
      label: '操作',
      width: 200,
      fixed: 'right',
      render: (row: CustomerItem) => {
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
              onClick: () => handleContact(row)
            },
            () => '联系'
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
  } = useTable<CustomerItem>({
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
    searchForm.value = { name: '', phone: '', status: '' }
    getData()
  }

  // 弹窗处理
  const showDialog = (type: 'add' | 'edit', row?: CustomerItem) => {
    dialogType.value = type
    currentCustomerData.value = type === 'edit' ? { ...row } : {}
    dialogVisible.value = true
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    refreshData()
    ElMessage.success(`${dialogType.value === 'add' ? '新增' : '编辑'}客户成功`)
  }

  // 其他操作
  const handleSelectionChange = (rows: CustomerItem[]) => {
    selectedRows.value = rows
  }

  const handleContact = (row: CustomerItem) => {
    ElMessage.info(`联系客户：${row.name}`)
  }

  const handleDelete = async (row: CustomerItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除客户 ${row.name} 吗？`, '提示', {
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
