<template>
  <div class="order-page art-full-height">
    <!-- 搜索区域 -->
    <OrderSearch
      v-model="searchForm"
      :dictionary-options="dictionaryOptions"
      @search="handleSearch"
      @reset="resetSearch"
    />

    <!-- 表格区域 -->
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton @click="showDialog('add')" v-ripple>新增保外工单</ElButton>
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
        :dictionary-options="dictionaryOptions"
        @submit="handleDialogSubmit"
        @updateList="refreshData"
      />

      <OrderViewDialog
        v-model:visible="viewDialogVisible"
        :order-data="currentOrderData"
        :dictionary-options="dictionaryOptions"
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
  import { ExternalOrderService } from '@/api/orderApi'
  import { DictionaryService } from '@/api/dictionaryApi'
  import { getDictionaryLabel, getHierarchicalDictionaryLabel } from './utils/dictionaryUtils'
  import { PermissionManager } from '@/utils/permissionManager'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'ExternalOrder' })

  // 响应式数据
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const currentOrderData = ref<OrderItem | undefined>(undefined)

  // 字典相关
  const dictionaryOptions = ref({
    carModel: [] as any[],
    insurer: [] as any[],
    outRepairItems: [] as any[],
    repairProgress: [] as any[],
    faultLocation: [] as any[],
    spareLocation: [] as any[],
    partNumber: [] as any[],
    feeType: [] as any[]
  })

  // 搜索表单
  const searchForm = ref({
    orderNo: '',
    carSelection: [] as string[],
    repairShop: '',
    sparePartLocation: ''
  })

  // 用户store
  const userStore = useUserStore()
  const getOrderListWithPermission = async (params: any) => {
    if (!PermissionManager.hasPagePermission('/order/external', 'view_all')) {
      params.createdBy = userStore.getUserInfo.id
    }
    return ExternalOrderService.getOrderList(params)
  }

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
      apiFn: getOrderListWithPermission,
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
        return getHierarchicalDictionaryLabel(row.customer, dictionaryOptions.value.carModel) || '-'
      }
    },
    {
      prop: 'vehicleModel',
      label: '车型',
      width: 120,
      showOverflowTooltip: true,
      formatter: (row: OrderItem) => {
        return (
          getHierarchicalDictionaryLabel(row.vehicleModel, dictionaryOptions.value.carModel) || '-'
        )
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
      prop: 'sparePartLocation',
      label: '备件所属库位',
      width: 140,
      showOverflowTooltip: true,
      formatter: (row: OrderItem) => {
        return (
          getDictionaryLabel(
            row.details?.[0]?.sparePartLocation || '',
            dictionaryOptions.value.spareLocation
          ) || '-'
        )
      }
    },
    {
      prop: 'insurer',
      label: '出险公司',
      width: 100,
      formatter: (row: OrderItem) => {
        return getDictionaryLabel(row.insurer || '', dictionaryOptions.value.insurer) || '-'
      }
    },
    {
      prop: 'assessor',
      label: '定损员',
      width: 100,
      formatter: (row: OrderItem) => {
        return row.assessor || '-'
      }
    },
    {
      prop: 'licensePlate',
      label: '车牌号',
      width: 110,
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
      prop: 'vehicleDate',
      label: '车辆日期',
      width: 150,
      formatter: row => row.vehicleDate || '-'
    },
    {
      prop: 'packCode',
      label: 'PACK码',
      width: 230,
      formatter: row => row.packCode || '-'
    },
    {
      prop: 'packDate',
      label: 'PACK日期',
      width: 150,
      formatter: row => row.packDate || '-'
    },
    {
      prop: 'underWarranty',
      label: '是否在保',
      width: 100,
      formatter: (row: OrderItem) => {
        return h(ElTag, { type: row.underWarranty ? 'success' : 'danger' }, () =>
          row.underWarranty ? '是' : '否'
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
        const children: any[] = [
          h(ArtButtonTable, {
            type: 'view',
            onClick: () => showViewDialog(row)
          })
        ]
        // 当没有view_all权限并且isEnd为true时，不展示编辑和删除按钮
        const hasViewAllPermission = PermissionManager.hasPagePermission(
          '/order/external',
          'view_all'
        )
        const shouldShowEditDelete = hasViewAllPermission || !row.isEnd

        if (shouldShowEditDelete) {
          children.push(
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => showDialog('edit', row)
            })
          )
        }
        if (shouldShowEditDelete) {
          children.push(
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDelete(row)
            })
          )
        }
        return h('div', { class: 'action-buttons' }, children)
      }
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    const params: any = {
      orderNo: searchForm.value.orderNo,
      repairShop: searchForm.value.repairShop,
      sparePartLocation: searchForm.value.sparePartLocation
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
      repairShop: '',
      sparePartLocation: ''
    }
    getData()
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
      await ElMessageBox.confirm(`确定要删除保外工单 ${row.id} 吗？`, '提示', {
        type: 'warning'
      })
      await ExternalOrderService.deleteOrder(row.id || '')
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
    await loadDictionaryData()
    getData()
  })

  // 通用字典数据加载函数
  const loadDictionaryData = async () => {
    const dictionaryCodes = {
      carModel: 'order_car_model',
      insurer: 'order_insurer',
      outRepairItems: 'order_out_repair_items',
      repairProgress: 'order_repair_progress',
      faultLocation: 'order_fault_location',
      spareLocation: 'order_spare_location',
      partNumber: 'order_part_number',
      feeType: 'order_fee_type'
    }

    const loadPromises = Object.entries(dictionaryCodes).map(async ([key, code]) => {
      try {
        const response = await DictionaryService.getDictionaryByCode(code)
        dictionaryOptions.value[key as keyof typeof dictionaryOptions.value] = response?.enums || []
      } catch (error) {
        console.error(error)
        dictionaryOptions.value[key as keyof typeof dictionaryOptions.value] = []
      }
    })

    await Promise.all(loadPromises)
  }
</script>

<style lang="scss" scoped>
  @use './style';
</style>
