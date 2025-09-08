<template>
  <ElDialog title="查看保内工单" v-model="dialogVisible" width="900px" align-center>
    <div class="order-view-content">
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

  defineOptions({ name: 'OrderViewDialog' })

  // Props 和 Emits
  interface Props {
    visible: boolean
    orderData?: any
    carModelOptions?: any[]
    projectTypeOptions?: any[]
    projectPhaseOptions?: any[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
  }>()

  // 字典相关

  // 获取车型标签
  const getCarModelLabel = (keyValue: string) => {
    if (!keyValue || !props.carModelOptions?.length) return keyValue

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

    const result = findLabelByKey(props.carModelOptions, keyValue)
    return result || keyValue
  }

  // 获取项目类型标签
  const getProjectTypeLabel = (keyValue: string) => {
    if (!keyValue || !props.projectTypeOptions?.length) return keyValue

    const option = props.projectTypeOptions.find(item => item.keyValue === keyValue)
    return option ? option.dictValue : keyValue
  }

  // 获取项目阶段标签
  const getProjectPhaseLabel = (keyValue: string) => {
    if (!keyValue || !props.projectPhaseOptions?.length) return keyValue

    const option = props.projectPhaseOptions.find(item => item.keyValue === keyValue)
    return option ? option.dictValue : keyValue
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
  }
</style>
