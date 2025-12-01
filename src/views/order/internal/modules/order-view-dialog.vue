<template>
  <ElDialog
    title="查看保内工单"
    v-model="dialogVisible"
    width="900px"
    align-center
    :close-on-click-modal="false"
  >
    <div class="order-view-content">
      <!-- 工单进度 -->
      <ElDivider content-position="left">工单进度</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">工单进度：</span>
            <span class="value">{{ orderData.orderProgress || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">中航派工单号：</span>
            <span class="value">{{ orderData.avicOrderNumber || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>

      <!-- 客户信息 -->
      <ElDivider content-position="left">客户信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">整车厂：</span>
            <span class="value">{{ getCarModelLabel(orderData.customer) || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">车型：</span>
            <span class="value">{{ getCarModelLabel(orderData.vehicleModel) || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">维修店(4S)：</span>
            <span class="value">{{ orderData.repairShop || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>

      <!-- 报修人信息 -->
      <ElDivider content-position="left">报修人信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">报修人：</span>
            <span class="value">{{ orderData.reporterName || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">联系方式：</span>
            <span class="value">{{ orderData.contactInfo || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">报修日期：</span>
            <span class="value">{{ orderData.reportDate || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">备件所属库位：</span>
            <span class="value">{{
              getSpareLocationLabel(getDetailValue('sparePartLocation')) || '-'
            }}</span>
          </div>
        </ElCol>
      </ElRow>

      <!-- 产品信息 -->
      <ElDivider content-position="left">产品信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">项目类型：</span>
            <span class="value">{{ getProjectTypeLabel(orderData.projectType) || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">项目阶段：</span>
            <span class="value">{{ getProjectPhaseLabel(orderData.projectStage) || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>

      <!-- 车辆信息 -->
      <ElDivider content-position="left">车辆信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">车牌号：</span>
            <span class="value">{{ orderData.licensePlate || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">车架号：</span>
            <span class="value">{{ orderData.vinNumber || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">里程(KM)：</span>
            <span class="value">{{ orderData.mileage ? `${orderData.mileage}` : '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">车辆位置：</span>
            <span class="value">{{ orderData.vehicleLocation || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">车辆日期：</span>
            <span class="value">{{ orderData.vehicleDate || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">PACK码：</span>
            <span class="value">{{ orderData.packCode || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">PACK日期：</span>
            <span class="value">{{ orderData.packDate || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>

      <!-- 故障信息 -->
      <ElDivider content-position="left">故障信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">是否在保：</span>
            <span class="value">
              <ElTag :type="orderData.underWarranty ? 'success' : 'danger'">
                {{ orderData.underWarranty ? '是' : '否' }}
              </ElTag>
            </span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="24">
          <div class="info-item">
            <span class="label">故障描述：</span>
            <span class="value">{{ orderData.faultDescription || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>

      <!-- 维修记录 -->
      <ElDivider content-position="left">维修记录</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">维修人：</span>
            <span class="value">{{ getDetailValue('repairPerson') || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">维修日期：</span>
            <span class="value">{{ getDetailValue('repairDate') || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">中航责任：</span>
            <span class="value">
              <ElTag :type="getDetailValue('avicResponsibility') ? 'success' : 'danger'">
                {{ getDetailValue('avicResponsibility') ? '是' : '否' }}
              </ElTag>
            </span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">故障分类：</span>
            <span class="value">{{
              getFaultClassificationLabel(getDetailValue('faultClassification')) || '-'
            }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">故障位置：</span>
            <span class="value">{{
              getFaultLocationLabel(getDetailValue('faultLocation')) || '-'
            }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">零件类别/定位：</span>
            <span class="value">{{
              getPartCategoryLabel(
                getDetailValue('partCategory'),
                getDetailValue('partLocation')
              ) || '-'
            }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">封签编码：</span>
            <span class="value">{{ orderData.sealCode || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="24">
          <div class="info-item">
            <span class="label">维修描述：</span>
            <span class="value">{{ getDetailValue('repairDescription') || '-' }}</span>
          </div>
        </ElCol>
      </ElRow>

      <!-- 详情记录 -->
      <ElDivider content-position="left">详情记录</ElDivider>

      <!-- 备件使用详情 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>备件使用详情</h3>
        </div>

        <ElTable
          :data="getSpareParts()"
          border
          style="width: 100%"
          v-if="getSpareParts().length > 0"
        >
          <ElTableColumn prop="name" label="备件名称">
            <template #default="{ row }">
              {{ getPartNameLabel(row.name) || row.name || '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="quantity" label="使用数量" />
          <ElTableColumn prop="oldPartCode" label="旧件编码" />
          <ElTableColumn prop="newPartCode" label="新件编码" />
        </ElTable>
        <div v-else class="no-data">暂无备件使用记录</div>
      </div>

      <!-- 费用使用详情 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>费用使用详情</h3>
        </div>

        <ElTable :data="getCosts()" border style="width: 100%" v-if="getCosts().length > 0">
          <ElTableColumn prop="category" label="费用类别">
            <template #default="{ row }">
              {{ getFeeTypeLabel(row.category) || row.category || '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="amount" label="费用金额(元)" />
          <ElTableColumn prop="remark" label="备注">
            <template #default="{ row }">
              {{ row.remark || '-' }}
            </template>
          </ElTableColumn>
        </ElTable>
        <div v-else class="no-data">暂无费用使用记录</div>
      </div>

      <!-- 工时详情 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>工时详情</h3>
        </div>

        <ElTable :data="getLabors()" border style="width: 100%" v-if="getLabors().length > 0">
          <ElTableColumn prop="faultLocation" label="故障位置">
            <template #default="{ row }">
              {{ getRepairSelectionLabel(row.repairSelection, 0) || row.faultLocation || '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="repairItem" label="维修项目">
            <template #default="{ row }">
              {{ getRepairSelectionLabel(row.repairSelection, 1) || row.repairItem || '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="quantity" label="维修数量" />
          <ElTableColumn prop="coefficient" label="工时" />
        </ElTable>
        <div v-else class="no-data">暂无工时记录</div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">关 闭</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  // Vue 工具函数
  import { computed } from 'vue'
  import { getDictionaryLabel, getHierarchicalDictionaryLabel } from '../utils/dictionaryUtils'

  defineOptions({ name: 'OrderViewDialog' })

  // Props 和 Emits
  interface Props {
    visible: boolean
    orderData?: any
    dictionaryOptions?: {
      carModel: any[]
      projectType: any[]
      projectPhase: any[]
      faultClassification: any[]
      faultLocation: any[]
      partCategory: any[]
      spareLocation: any[]
      partNumber: any[]
      feeType: any[]
      repairItems: any[]
      commercialRepairItems: any[]
      energyRepairItems: any[]
    }
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
  }>()

  // 字典标签获取函数
  const getLabel = (keyValue: string, options: any[], isHierarchical = false): string => {
    if (!keyValue) return '-'
    return isHierarchical
      ? getHierarchicalDictionaryLabel(keyValue, options)
      : getDictionaryLabel(keyValue, options)
  }

  // 获取车型标签
  const getCarModelLabel = (keyValue: string) =>
    getLabel(keyValue, props.dictionaryOptions?.carModel || [], true)

  // 获取项目类型标签
  const getProjectTypeLabel = (keyValue: string) =>
    getLabel(keyValue, props.dictionaryOptions?.projectType || [])

  // 获取项目阶段标签
  const getProjectPhaseLabel = (keyValue: string) =>
    getLabel(keyValue, props.dictionaryOptions?.projectPhase || [])

  // 获取故障分类标签
  const getFaultClassificationLabel = (keyValue: string) =>
    getLabel(keyValue, props.dictionaryOptions?.faultClassification || [])

  // 获取故障位置标签
  const getFaultLocationLabel = (keyValue: string) =>
    getLabel(keyValue, props.dictionaryOptions?.faultLocation || [])

  // 获取零件类别标签
  const getPartCategoryLabel = (categoryKey: string, locationKey: string) => {
    const category = getLabel(categoryKey, props.dictionaryOptions?.partCategory || [], true)
    const location = getLabel(locationKey, props.dictionaryOptions?.partCategory || [], true)
    if (category && location) {
      return `${category}/${location}`
    }
    return category || location || '-'
  }

  // 获取备件库位标签
  const getSpareLocationLabel = (keyValue: string) =>
    getLabel(keyValue, props.dictionaryOptions?.spareLocation || [])

  // 获取备件名称标签
  const getPartNameLabel = (keyValue: string) =>
    getLabel(keyValue, props.dictionaryOptions?.partNumber || [])

  // 获取费用类型标签
  const getFeeTypeLabel = (keyValue: string) =>
    getLabel(keyValue, props.dictionaryOptions?.feeType || [])

  // 获取维修项目标签
  const getRepairItemLabel = (keyValue: string) => {
    const projectType = props.orderData?.projectType
    const repairItems = getRepairItemsByProjectType(projectType)
    return getLabel(keyValue, repairItems || [], true)
  }

  // 获取维修选择标签
  const getRepairSelectionLabel = (repairSelection: any, index: number) => {
    if (!repairSelection || !Array.isArray(repairSelection) || !repairSelection[index]) {
      return null
    }

    return getRepairItemLabel(repairSelection[index])
  }

  // 获取详情数据
  const getDetailValue = (key: string) => {
    if (props.orderData?.details && props.orderData.details.length > 0) {
      return props.orderData.details[0][key]
    }
    return null
  }

  // 获取备件数据
  const getSpareParts = () => {
    const spareParts = getDetailValue('spareParts')
    return Array.isArray(spareParts) ? spareParts : []
  }

  // 获取费用数据
  const getCosts = () => {
    const costs = getDetailValue('costs')
    return Array.isArray(costs) ? costs : []
  }

  // 获取工时数据
  const getLabors = () => {
    const labors = getDetailValue('labors')
    return Array.isArray(labors) ? labors : []
  }

  // 根据项目类型获取对应的维修项目字典
  const getRepairItemsByProjectType = (projectType: string) => {
    if (!projectType || !props.dictionaryOptions) return []

    // 获取项目类型的标签值，使用中文进行匹配
    const projectTypeLabel = getLabel(projectType, props.dictionaryOptions.projectType)

    // 根据项目类型的中文名称返回对应的维修项目
    if (projectTypeLabel === '乘用车') {
      return props.dictionaryOptions.repairItems // 乘用车使用order_repair_items
    } else if (projectTypeLabel === '商用车') {
      return props.dictionaryOptions.commercialRepairItems // 商用车使用order_commercial_repair_items
    } else {
      // 其他所有情况（包括储能）都使用储能的字典作为通用字典
      return props.dictionaryOptions.energyRepairItems // 储能使用order_energy_repair_items
    }
  }

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })
</script>

<style lang="scss" scoped>
  .order-view-content {
    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
      line-height: 1.5;

      .label {
        min-width: 100px;
        font-weight: 500;
        color: #606266;
      }

      .value {
        flex: 1;
        color: #303133;
        word-break: break-all;
      }
    }

    .detail-section {
      padding: 20px;
      margin-bottom: 30px;
      background-color: #fafafa;
      border: 1px solid #e4e7ed;
      border-radius: 8px;

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 10px;
        margin-bottom: 20px;
        border-bottom: 1px solid #e4e7ed;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }

        .info-item {
          margin: 0;

          .label {
            margin-right: 8px;
            font-size: 14px;
            color: #606266;
          }
        }
      }

      .no-data {
        padding: 40px 0;
        font-size: 14px;
        color: #909399;
        text-align: center;
      }
    }
  }
</style>
