<template>
  <div class="order-page art-full-height">
    <!-- 搜索区域 -->
    <OrderSearch
      v-model="searchForm"
      :car-model-options="carModelOptions"
      @search="handleSearch"
      @reset="resetSearch"
    />

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
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <OrderDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :order-data="currentOrderData"
        :car-model-options="carModelOptions"
        :project-type-options="projectTypeOptions"
        :project-phase-options="projectPhaseOptions"
        :fault-classification-options="faultClassificationOptions"
        :fault-location-options="faultLocationOptions"
        :part-category-options="partCategoryOptions"
        @submit="handleDialogSubmit"
      />

      <OrderViewDialog
        v-model:visible="viewDialogVisible"
        :order-data="currentOrderData"
        :car-model-options="carModelOptions"
        :project-type-options="projectTypeOptions"
        :project-phase-options="projectPhaseOptions"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  // 组件导入
  import OrderSearch from './modules/order-search.vue'
  import OrderDialog from './modules/order-dialog.vue'
  import OrderViewDialog from './modules/order-view-dialog.vue'
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'

  // Element Plus 组件
  import { ElMessage, ElMessageBox } from 'element-plus'

  // 工具和组合式函数
  import { useTable } from '@/composables/useTable'
  import type { ColumnOption } from '@/types/component'
  import type { OrderItem } from '@/types/api'
  import { InternalOrderService } from '@/api/orderApi'
  import { DictionaryService } from '@/api/dictionaryApi'

  defineOptions({ name: 'Order' })

  // 响应式数据
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const currentOrderData = ref<OrderItem | undefined>(undefined)

  // 字典相关
  const carModelOptions = ref<any[]>([])
  const projectTypeOptions = ref<any[]>([])
  const projectPhaseOptions = ref<any[]>([])
  const faultClassificationOptions = ref<any[]>([])
  const faultLocationOptions = ref<any[]>([])
  const partCategoryOptions = ref<any[]>([])

  // 搜索表单
  const searchForm = ref({
    orderNo: '',
    carSelection: [] as string[],
    repairShop: ''
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
        orderNo: '',
        repairShop: '',
        customer: '',
        vehicleModel: ''
      },
      immediate: false
    }
  })

  // 表格列配置
  const columns = ref<ColumnOption<OrderItem>[]>([
    {
      prop: 'id',
      label: '工单编号',
      width: 150,
      formatter: row => row.id || '-'
    },
    {
      prop: 'customer',
      label: '整车厂',
      width: 120,
      showOverflowTooltip: true,
      formatter: (row: OrderItem) => {
        return getCarModelLabel(row.customer) || '-'
      }
    },
    {
      prop: 'vehicleModel',
      label: '车型',
      width: 120,
      showOverflowTooltip: true,
      formatter: (row: OrderItem) => {
        return getCarModelLabel(row.vehicleModel) || '-'
      }
    },
    {
      prop: 'repairShop',
      label: '维修店(4S)',
      width: 150,
      showOverflowTooltip: true,
      formatter: row => row.repairShop || '-'
    },
    {
      prop: 'reporterName',
      label: '报修人',
      width: 100,
      formatter: row => row.reporterName || '-'
    },
    {
      prop: 'contactInfo',
      label: '联系方式',
      width: 130,
      formatter: row => row.contactInfo || '-'
    },
    {
      prop: 'reportDate',
      label: '报修日期',
      width: 120,
      formatter: row => row.reportDate || '-'
    },
    {
      prop: 'projectType',
      label: '项目类型',
      width: 100,
      formatter: (row: OrderItem) => {
        return getProjectTypeLabel(row.projectType) || '-'
      }
    },
    {
      prop: 'projectStage',
      label: '项目阶段',
      width: 100,
      formatter: (row: OrderItem) => {
        return getProjectPhaseLabel(row.projectStage) || '-'
      }
    },
    {
      prop: 'licensePlate',
      label: '车牌号',
      width: 100,
      formatter: row => row.licensePlate || '-'
    },
    {
      prop: 'vinNumber',
      label: '车架号',
      width: 180,
      formatter: row => row.vinNumber || '-'
    },
    {
      prop: 'mileage',
      label: '里程(KM)',
      width: 100,
      formatter: (row: OrderItem) => (row.mileage ? `${row.mileage}` : '-')
    },
    {
      prop: 'vehicleLocation',
      label: '车辆位置',
      width: 150,
      showOverflowTooltip: true,
      formatter: row => row.vehicleLocation || '-'
    },
    {
      prop: 'packCode',
      label: 'PACK码',
      width: 230,
      formatter: row => row.packCode || '-'
    },
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
    {
      prop: 'faultDescription',
      label: '故障描述',
      width: 200,
      showOverflowTooltip: true,
      formatter: row => row.faultDescription || '-'
    },
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
    const params: any = {
      orderNo: searchForm.value.orderNo,
      repairShop: searchForm.value.repairShop
    }

    // 处理级联选择器的值
    if (searchForm.value.carSelection && searchForm.value.carSelection.length > 0) {
      params.customer = searchForm.value.carSelection[0] || ''
      params.vehicleModel = searchForm.value.carSelection[1] || ''
    }

    getData(params)
  }

  const resetSearch = () => {
    searchForm.value = {
      orderNo: '',
      carSelection: [],
      repairShop: ''
    }
    getData()
  }

  // 获取车型标签
  const getCarModelLabel = (keyValue: string) => {
    if (!keyValue || !carModelOptions.value.length) return keyValue

    // 递归查找所有层级的标签
    const findLabelByKey = (options: any[], targetKey: string): string => {
      for (const option of options) {
        if (option.keyValue === targetKey) {
          return option.dictValue
        }
        if (option.children && option.children.length > 0) {
          const result = findLabelByKey(option.children, targetKey)
          if (result) return result
        }
      }
      return ''
    }

    const result = findLabelByKey(carModelOptions.value, keyValue)
    return result || keyValue
  }

  // 获取项目类型标签
  const getProjectTypeLabel = (keyValue: string) => {
    if (!keyValue || !projectTypeOptions.value.length) return keyValue

    const option = projectTypeOptions.value.find(item => item.keyValue === keyValue)
    return option ? option.dictValue : keyValue
  }

  // 获取项目阶段标签
  const getProjectPhaseLabel = (keyValue: string) => {
    if (!keyValue || !projectPhaseOptions.value.length) return keyValue

    const option = projectPhaseOptions.value.find(item => item.keyValue === keyValue)
    return option ? option.dictValue : keyValue
  }

  // 弹窗处理
  const showDialog = (type: 'add' | 'edit', row?: OrderItem) => {
    dialogType.value = type
    currentOrderData.value = type === 'edit' && row ? row : undefined
    dialogVisible.value = true
  }

  const showViewDialog = (row: OrderItem) => {
    currentOrderData.value = row
    viewDialogVisible.value = true
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    refreshData()
    ElMessage.success(`${dialogType.value === 'add' ? '新增' : '编辑'}成功`)
  }

  // 其他操作
  const handleDelete = async (row: OrderItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除保内工单 ${row.id} 吗？`, '提示', {
        type: 'warning'
      })
      await InternalOrderService.deleteOrder(row.id || '')
      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
      }
    }
  }

  // 初始化
  onMounted(async () => {
    await Promise.all([
      loadProjectTypeData(),
      loadCarModelData(),
      loadProjectPhaseData(),
      loadFaultClassificationData(),
      loadFaultLocationData(),
      loadPartCategoryData()
    ])
    getData()
  })

  // 加载项目类型字典数据
  const loadProjectTypeData = async () => {
    try {
      const response = await DictionaryService.getDictionaryByCode('order_project_type')
      if (response?.enums) {
        projectTypeOptions.value = response.enums
      }
    } catch (error) {
      console.error(error)
      projectTypeOptions.value = []
    }
  }

  // 加载车型字典数据
  const loadCarModelData = async () => {
    try {
      const response = await DictionaryService.getDictionaryByCode('order_car_model')
      if (response?.enums) {
        carModelOptions.value = response.enums
      }
    } catch (error) {
      console.error(error)
      carModelOptions.value = []
    }
  }

  // 加载项目阶段字典数据
  const loadProjectPhaseData = async () => {
    try {
      const response = await DictionaryService.getDictionaryByCode('order_project_phase')
      if (response?.enums) {
        projectPhaseOptions.value = response.enums
      }
    } catch (error) {
      console.error(error)
      projectPhaseOptions.value = []
    }
  }

  // 加载故障分类字典数据
  const loadFaultClassificationData = async () => {
    try {
      const response = await DictionaryService.getDictionaryByCode('order_fault_classification')
      if (response?.enums) {
        faultClassificationOptions.value = response.enums
      }
    } catch (error) {
      console.error(error)
      faultClassificationOptions.value = []
    }
  }

  // 加载故障位置字典数据
  const loadFaultLocationData = async () => {
    try {
      const response = await DictionaryService.getDictionaryByCode('order_fault_location')
      if (response?.enums) {
        faultLocationOptions.value = response.enums
      }
    } catch (error) {
      console.error(error)
      faultLocationOptions.value = []
    }
  }

  // 加载零件类别字典数据
  const loadPartCategoryData = async () => {
    try {
      const response = await DictionaryService.getDictionaryByCode('order_part_category')
      if (response?.enums) {
        partCategoryOptions.value = response.enums
      }
    } catch (error) {
      console.error(error)
      partCategoryOptions.value = []
    }
  }
</script>

<style lang="scss" scoped>
  @use './style';
</style>
