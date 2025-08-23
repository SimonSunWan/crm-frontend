<template>
  <div class="product-page art-full-height">
    <!-- 搜索区域 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="产品名称">
          <ElInput v-model="searchForm.name" placeholder="请输入产品名称" clearable />
        </ElFormItem>
        <ElFormItem label="产品分类">
          <ElSelect
            v-model="searchForm.category"
            placeholder="请选择分类"
            clearable
            style="width: 200px"
          >
            <ElOption label="服务器" value="server" />
            <ElOption label="网络设备" value="network" />
            <ElOption label="软件产品" value="software" />
            <ElOption label="配件" value="accessory" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="产品状态">
          <ElSelect
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 200px"
          >
            <ElOption label="在售" value="active" />
            <ElOption label="停售" value="inactive" />
            <ElOption label="缺货" value="outofstock" />
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
          <ElButton @click="showDialog('add')" v-ripple>新增产品</ElButton>
          <ElButton @click="handleImport" v-ripple>批量导入</ElButton>
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

      <ProductDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :product-data="currentProductData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  // 组件导入
  import { Search, Refresh } from '@element-plus/icons-vue'
  import ProductDialog from './modules/product-dialog.vue'

  // Element Plus 组件
  import { ElMessage, ElMessageBox } from 'element-plus'

  // 工具和组合式函数
  import { useTable } from '@/composables/useTable'

  // Vue 工具函数
  import { ref, onMounted, h } from 'vue'

  defineOptions({ name: 'Product' })

  // 类型定义
  interface ProductItem {
    id: number
    name: string
    code: string
    category: string
    price: number
    cost: number
    stock: number
    status: string
    description: string
    createTime: string
    updateTime: string
  }

  // 响应式数据
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentProductData = ref<Partial<ProductItem>>({})
  const selectedRows = ref<ProductItem[]>([])

  // 搜索表单
  const searchForm = ref({
    name: '',
    category: '',
    status: ''
  })

  // 模拟数据
  const mockData: ProductItem[] = [
    {
      id: 1,
      name: '高性能服务器',
      code: 'SRV001',
      category: 'server',
      price: 15000,
      cost: 12000,
      stock: 50,
      status: 'active',
      description: '适用于企业级应用的高性能服务器',
      createTime: '2024-01-15',
      updateTime: '2024-01-20'
    },
    {
      id: 2,
      name: '千兆交换机',
      code: 'SW001',
      category: 'network',
      price: 2000,
      cost: 1500,
      stock: 100,
      status: 'active',
      description: '24口千兆以太网交换机',
      createTime: '2024-01-10',
      updateTime: '2024-01-18'
    },
    {
      id: 3,
      name: '企业管理系统',
      code: 'SW001',
      category: 'software',
      price: 5000,
      cost: 1000,
      stock: 999,
      status: 'active',
      description: '企业级管理软件，支持多用户',
      createTime: '2024-01-05',
      updateTime: '2024-01-25'
    }
  ]

  // 表格列配置
  const columns = ref([
    { type: 'selection' as const, width: 55 },
    { prop: 'name', label: '产品名称', width: 200 },
    { prop: 'code', label: '产品编码', width: 120 },
    {
      prop: 'category',
      label: '产品分类',
      width: 120,
      render: (row: ProductItem) => {
        const categoryMap: Record<string, string> = {
          server: '服务器',
          network: '网络设备',
          software: '软件产品',
          accessory: '配件'
        }
        return categoryMap[row.category] || '未知'
      }
    },
    { prop: 'price', label: '售价', width: 100, render: (row: ProductItem) => `¥${row.price}` },
    { prop: 'cost', label: '成本', width: 100, render: (row: ProductItem) => `¥${row.cost}` },
    { prop: 'stock', label: '库存', width: 80 },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      render: (row: ProductItem) => {
        const statusMap: Record<string, { type: string; text: string }> = {
          active: { type: 'success', text: '在售' },
          inactive: { type: 'info', text: '停售' },
          outofstock: { type: 'danger', text: '缺货' }
        }
        const status = statusMap[row.status] || { type: 'info', text: '未知' }
        return h('span', { class: `el-tag el-tag--${status.type}` }, status.text)
      }
    },
    { prop: 'description', label: '产品描述', width: 250 },
    { prop: 'createTime', label: '创建时间', width: 120 },
    { prop: 'updateTime', label: '更新时间', width: 120 },
    {
      label: '操作',
      width: 200,
      fixed: 'right' as const,
      render: (row: ProductItem) => {
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
              type: 'warning',
              link: true,
              size: 'small',
              onClick: () => handleStock(row)
            },
            () => '库存'
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
  } = useTable<ProductItem>({
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
    searchForm.value = { name: '', category: '', status: '' }
    getData()
  }

  // 弹窗处理
  const showDialog = (type: 'add' | 'edit', row?: ProductItem) => {
    dialogType.value = type
    currentProductData.value = type === 'edit' ? { ...row } : {}
    dialogVisible.value = true
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    refreshData()
    ElMessage.success(`${dialogType.value === 'add' ? '新增' : '编辑'}产品成功`)
  }

  // 其他操作
  const handleSelectionChange = (rows: ProductItem[]) => {
    selectedRows.value = rows
  }

  const handleStock = (row: ProductItem) => {
    ElMessage.info(`调整库存：${row.name}`)
  }

  const handleDelete = async (row: ProductItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除产品 ${row.name} 吗？`, '提示', {
        type: 'warning'
      })
      ElMessage.success('删除成功')
      refreshData()
    } catch {
      // 用户取消删除
    }
  }

  const handleImport = () => {
    ElMessage.info('批量导入功能开发中...')
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
