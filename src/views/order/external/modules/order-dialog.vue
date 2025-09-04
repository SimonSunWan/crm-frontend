<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="900px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <!-- 客户信息 -->
      <ElDivider content-position="left">客户信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="整车厂" prop="customer">
            <ElInput v-model="formData.customer" placeholder="请输入整车厂名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="车型" prop="vehicleModel">
            <ElInput v-model="formData.vehicleModel" placeholder="请输入车型" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="维修店(4S)" prop="repairShop">
            <ElInput v-model="formData.repairShop" placeholder="请输入维修店名称" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 报修人信息 -->
      <ElDivider content-position="left">报修人信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="报修人" prop="reporterName">
            <ElInput v-model="formData.reporterName" placeholder="请输入报修人姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="联系方式" prop="contactInfo">
            <ElInput v-model="formData.contactInfo" placeholder="请输入联系方式" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="报修日期" prop="reportDate">
            <ElDatePicker
              v-model="formData.reportDate"
              type="date"
              placeholder="请选择报修日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 产品信息 -->
      <ElDivider content-position="left">产品信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="项目类型" prop="projectType">
            <ArtSelect
              v-model="formData.projectType"
              dict-code="ORDER_PROJECT_TYPE"
              placeholder="请选择项目类型"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="项目阶段" prop="projectStage">
            <ElRadioGroup v-model="formData.projectStage">
              <ElRadio value="0公里">0公里</ElRadio>
              <ElRadio value="样车阶段">样车阶段</ElRadio>
              <ElRadio value="市场流通">市场流通</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 车辆信息 -->
      <ElDivider content-position="left">车辆信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="车牌号" prop="licensePlate">
            <ElInput v-model="formData.licensePlate" placeholder="请输入车牌号" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="车架号" prop="vinNumber">
            <ElInput v-model="formData.vinNumber" placeholder="请输入正确的车架号" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="里程(KM)" prop="mileage">
            <ElInputNumber v-model="formData.mileage" :min="0" :precision="2" style="width: 100%" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="车辆位置" prop="vehicleLocation">
            <ElInput v-model="formData.vehicleLocation" placeholder="请输入详细地址" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="车辆日期" prop="vehicleDate">
            <ElDatePicker
              v-model="formData.vehicleDate"
              type="date"
              placeholder="请选择车辆日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="PACK码" prop="packCode">
            <ElInput v-model="formData.packCode" placeholder="请输入PACK码" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="PACK日期" prop="packDate">
            <ElDatePicker
              v-model="formData.packDate"
              type="date"
              placeholder="请选择PACK日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <!-- 故障信息 -->
      <ElDivider content-position="left">故障信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="是否在保" prop="underWarranty">
            <ElRadioGroup v-model="formData.underWarranty">
              <ElRadio :value="true">是</ElRadio>
              <ElRadio :value="false">否</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="故障描述" prop="faultDescription">
            <ElInput
              v-model="formData.faultDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入故障描述"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="loading">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  // Element Plus 组件和类型
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  // Vue 工具函数
  import { ref, reactive, computed, watch } from 'vue'

  // API服务
  import { ExternalOrderService } from '@/api/orderApi'

  // 组件
  import ArtSelect from '@/components/forms/art-select/index.vue'

  defineOptions({ name: 'ExternalOrderDialog' })

  // Props 和 Emits
  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    orderData?: any
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: []
  }>()

  // 响应式数据
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const formData = reactive({
    id: '',
    customer: '',
    vehicleModel: '',
    repairShop: '',
    reporterName: '',
    contactInfo: '',
    reportDate: '',
    projectType: '',
    projectStage: '',
    licensePlate: '',
    vinNumber: '',
    mileage: 0,
    vehicleLocation: '',
    vehicleDate: '',
    packCode: '',
    packDate: '',
    underWarranty: false,
    faultDescription: ''
  })

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    return props.type === 'edit' ? '编辑保外工单' : '新增保外工单'
  })

  // 表单验证规则
  const rules: FormRules = {
    customer: [{ required: true, message: '请输入整车厂名称', trigger: 'blur' }],
    vehicleModel: [{ required: true, message: '请输入车型', trigger: 'blur' }],
    repairShop: [{ required: true, message: '请输入维修店名称', trigger: 'blur' }],
    reporterName: [{ required: true, message: '请输入报修人姓名', trigger: 'blur' }],
    contactInfo: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
    reportDate: [{ required: true, message: '请选择报修日期', trigger: 'change' }],
    projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
    projectStage: [{ required: true, message: '请选择项目阶段', trigger: 'change' }],
    vinNumber: [{ required: true, message: '请输入车架号', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    if (props.type === 'edit' && props.orderData) {
      Object.assign(formData, props.orderData)
    } else {
      resetForm()
    }
  }

  // 重置表单
  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(formData, {
      id: '',
      customer: '',
      vehicleModel: '',
      repairShop: '',
      reporterName: '',
      contactInfo: '',
      reportDate: '',
      projectType: '',
      projectStage: '',
      licensePlate: '',
      vinNumber: '',
      mileage: 0,
      vehicleLocation: '',
      vehicleDate: '',
      packCode: '',
      packDate: '',
      underWarranty: false,
      faultDescription: ''
    })
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.type, props.orderData],
    () => {
      if (props.visible) {
        initFormData()
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async valid => {
      if (valid) {
        loading.value = true
        try {
          const submitData = {
            customer: formData.customer,
            vehicleModel: formData.vehicleModel,
            repairShop: formData.repairShop,
            reporterName: formData.reporterName,
            contactInfo: formData.contactInfo,
            reportDate: formData.reportDate,
            projectType: formData.projectType,
            projectStage: formData.projectStage,
            licensePlate: formData.licensePlate,
            vinNumber: formData.vinNumber,
            mileage: formData.mileage,
            vehicleLocation: formData.vehicleLocation,
            vehicleDate: formData.vehicleDate,
            packCode: formData.packCode,
            packDate: formData.packDate,
            underWarranty: formData.underWarranty,
            faultDescription: formData.faultDescription
          }

          if (props.type === 'add') {
            await ExternalOrderService.createOrder(submitData)
          } else {
            await ExternalOrderService.updateOrder(formData.id, submitData)
          }

          emit('submit')
        } catch {
          ElMessage.error('操作失败')
        } finally {
          loading.value = false
        }
      }
    })
  }
</script>
