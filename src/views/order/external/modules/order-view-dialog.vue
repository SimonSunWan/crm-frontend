<template>
  <ElDialog title="查看保外工单" v-model="dialogVisible" width="900px" align-center>
    <div class="order-view-content">
      <!-- 客户信息 -->
      <ElDivider content-position="left">客户信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">整车厂：</span>
            <span class="value">{{ orderData.customer || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">车型：</span>
            <span class="value">{{ orderData.vehicleModel || '-' }}</span>
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
            <span class="value">{{
              getDictionaryLabel('ORDER_PROJECT_TYPE', orderData.projectType) || '-'
            }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">项目阶段：</span>
            <span class="value">{{ orderData.projectStage || '-' }}</span>
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

      <!-- 系统信息 -->
      <ElDivider content-position="left">系统信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(orderData.createTime) || '-' }}</span>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div class="info-item">
            <span class="label">更新时间：</span>
            <span class="value">{{ formatDate(orderData.updateTime) || '-' }}</span>
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

  // 工具和组合式函数
  import { useDictionary } from '@/composables/useDictionary'

  defineOptions({ name: 'ExternalOrderViewDialog' })

  // Props 和 Emits
  interface Props {
    visible: boolean
    orderData?: any
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
  }>()

  // 字典相关
  const { getDictionaryLabel } = useDictionary()

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  // 时间格式化函数
  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date)
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      .replace(/\//g, '-')
  }
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
