<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="900px" align-center>
    <!-- 步骤指示器 -->
    <div class="step-indicator">
      <ElSteps :active="currentStep" finish-status="success" align-center>
        <ElStep title="报修信息" />
        <ElStep title="维修记录" />
        <ElStep title="详情记录" />
      </ElSteps>
    </div>

    <!-- 第一步：工单信息 -->
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      v-show="currentStep === 0"
    >
      <!-- 客户信息 -->
      <ElDivider content-position="left">客户信息</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="整车厂/车型" prop="carSelection">
            <ElCascader
              v-model="formData.carSelection"
              :options="carModelOptions"
              :props="cascaderProps"
              placeholder="请选择整车厂/车型"
              clearable
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
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
            <ElSelect
              v-model="formData.projectType"
              placeholder="请选择项目类型"
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="item in projectTypeOptions"
                :key="item.keyValue"
                :label="item.dictValue"
                :value="item.keyValue"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="项目阶段" prop="projectStage">
            <ElSelect
              v-model="formData.projectStage"
              placeholder="请选择项目阶段"
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="item in projectPhaseOptions"
                :key="item.keyValue"
                :label="item.dictValue"
                :value="item.keyValue"
              />
            </ElSelect>
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
            <ElInput v-model="formData.vinNumber" placeholder="请输入车架号" />
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
            <ElInput v-model="formData.vehicleLocation" placeholder="请输入车辆位置" />
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

    <!-- 第二步：维修记录 -->
    <ElForm
      ref="repairFormRef"
      :model="repairData"
      :rules="repairRules"
      label-width="120px"
      v-show="currentStep === 1"
    >
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="维修人" prop="repairPerson">
            <ElInput v-model="repairData.repairPerson" placeholder="请输入维修人姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="维修日期" prop="repairDate">
            <ElDatePicker
              v-model="repairData.repairDate"
              type="date"
              placeholder="请选择维修日期"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="中航责任" prop="avicResponsibility">
            <ElRadioGroup v-model="repairData.avicResponsibility">
              <ElRadio :value="true">是</ElRadio>
              <ElRadio :value="false">否</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="故障分类" prop="faultClassification">
            <ElSelect
              v-model="repairData.faultClassification"
              placeholder="请选择故障分类"
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="item in faultClassificationOptions"
                :key="item.keyValue"
                :label="item.dictValue"
                :value="item.keyValue"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="故障位置" prop="faultLocation">
            <ElSelect
              v-model="repairData.faultLocation"
              placeholder="请选择故障位置"
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="item in faultLocationOptions"
                :key="item.keyValue"
                :label="item.dictValue"
                :value="item.keyValue"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="零件类别/定位" prop="partSelection">
            <ElCascader
              v-model="repairData.partSelection"
              :options="partCategoryOptions"
              :props="cascaderProps"
              placeholder="请选择零件类别/定位"
              clearable
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="维修描述" prop="repairDescription">
            <ElInput
              v-model="repairData.repairDescription"
              type="textarea"
              :rows="4"
              placeholder="请填写维修过程"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <!-- 第三步：详情记录 -->
    <div v-show="currentStep === 2">
      <!-- 备件使用详情 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>备件使用详情</h3>
          <ElFormItem label="备件所属库位" class="header-form-item">
            <ArtSelect
              ref="spareLocationSelectRef"
              v-model="sparePartLocation"
              dict-code="order_spare_location"
              placeholder="请选择备件所属库位"
              style="width: 300px"
            />
          </ElFormItem>
        </div>

        <ElTable :data="spareParts" border style="width: 100%">
          <ElTableColumn prop="partNumber" label="备件料号" width="122">
            <template #default="{ row }">
              <ElInput v-model="row.partNumber" placeholder="备件料号" readonly />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="name" label="备件名称" width="120">
            <template #default="{ row }">
              <ArtSelect
                v-model="row.name"
                dict-code="order_part_number"
                placeholder="请选择备件名称"
                @change="value => handlePartNameChange(row, value)"
                style="width: 100%"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="quantity" label="使用数量" width="120">
            <template #default="{ row }">
              <ElInput v-model="row.quantity" placeholder="请输入使用数量" />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="oldPartCode" label="旧件编码">
            <template #default="{ row }">
              <ElInput v-model="row.oldPartCode" placeholder="请输入旧件编码" />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="newPartCode" label="新件编码">
            <template #default="{ row }">
              <ElInput v-model="row.newPartCode" placeholder="请输入新件编码" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="100" fixed="right">
            <template #default="{ $index }">
              <div class="operation-buttons">
                <div class="btn-text bg-primary" @click="addSparePart">
                  <i class="iconfont-sys">&#xe602;</i>
                </div>
                <div
                  class="btn-text bg-error"
                  @click="removeSparePart($index)"
                  :class="{ disabled: spareParts.length <= 1 }"
                >
                  <i class="iconfont-sys">&#xe783;</i>
                </div>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- 费用使用详情 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>费用使用详情</h3>
        </div>

        <ElTable :data="costs" border style="width: 100%">
          <ElTableColumn prop="category" label="费用类别">
            <template #default="{ row }">
              <ArtSelect
                v-model="row.category"
                dict-code="order_fee_type"
                placeholder="请选择费用类别"
                style="width: 100%"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="amount" label="费用金额(元)">
            <template #default="{ row }">
              <ElInput v-model="row.amount" placeholder="请输入费用金额(元)" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="100" fixed="right">
            <template #default="{ $index }">
              <div class="operation-buttons">
                <div class="btn-text bg-primary" @click="addCost">
                  <i class="iconfont-sys">&#xe602;</i>
                </div>
                <div
                  class="btn-text bg-error"
                  @click="removeCost($index)"
                  :class="{ disabled: costs.length <= 1 }"
                >
                  <i class="iconfont-sys">&#xe783;</i>
                </div>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- 工时详情 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>工时详情</h3>
        </div>

        <ElTable :data="labors" border style="width: 100%">
          <ElTableColumn prop="repairSelection" label="故障位置/维修项目">
            <template #default="{ row }">
              <ArtCascader
                v-model="row.repairSelection"
                dict-code="order_repair_items"
                placeholder="请选择故障位置/维修项目"
                :multiple-fields="true"
                @change="value => handleRepairSelectionChange(row, value)"
                style="width: 100%"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="quantity" label="维修数量" width="182">
            <template #default="{ row }">
              <ElInput v-model="row.quantity" placeholder="请输入维修数量" />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="coefficient" label="系数" width="182">
            <template #default="{ row }">
              <ElInput v-model="row.coefficient" placeholder="请输入系数" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="100" fixed="right">
            <template #default="{ $index }">
              <div class="operation-buttons">
                <div class="btn-text bg-primary" @click="addLabor">
                  <i class="iconfont-sys">&#xe602;</i>
                </div>
                <div
                  class="btn-text bg-error"
                  @click="removeLabor($index)"
                  :class="{ disabled: labors.length <= 1 }"
                >
                  <i class="iconfont-sys">&#xe783;</i>
                </div>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">取 消</ElButton>
        <ElButton v-if="currentStep > 0" @click="prevStep">上一步</ElButton>
        <ElButton v-if="currentStep < 2" type="primary" @click="saveCurrentStep" :loading="loading">
          保存并下一步
        </ElButton>
        <ElButton
          v-if="currentStep === 2"
          type="primary"
          @click="saveCurrentStep"
          :loading="loading"
        >
          保存并完成
        </ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'

  // Vue 工具函数
  import { ref, reactive, computed, watch } from 'vue'

  // API服务
  import { InternalOrderService } from '@/api/orderApi'
  import type { OrderItem } from '@/types/api'

  // 组件

  defineOptions({ name: 'OrderDialog' })

  // Props 和 Emits
  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    orderData?: OrderItem
    carModelOptions?: any[]
    projectTypeOptions?: any[]
    projectPhaseOptions?: any[]
    faultClassificationOptions?: any[]
    faultLocationOptions?: any[]
    partCategoryOptions?: any[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: []
  }>()

  // 级联选择器配置
  const cascaderProps = {
    value: 'keyValue',
    label: 'dictValue',
    children: 'children',
    emitPath: true,
    checkStrictly: false
  }

  // 响应式数据
  const formRef = ref<FormInstance>()
  const repairFormRef = ref<FormInstance>()
  const spareLocationSelectRef = ref()
  const loading = ref(false)
  const currentStep = ref(0)
  const currentOrderId = ref('')

  const formData = reactive({
    id: '',
    customer: '',
    vehicleModel: '',
    carSelection: [] as string[],
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
    underWarranty: true,
    faultDescription: ''
  })

  const repairData = reactive({
    repairPerson: '',
    repairDate: '',
    avicResponsibility: true,
    faultClassification: '',
    faultLocation: '',
    partSelection: [] as string[],
    repairDescription: ''
  })

  // 第三步数据
  const sparePartLocation = ref('')
  const spareParts = ref([
    {
      partNumber: '',
      name: '',
      quantity: '',
      oldPartCode: '',
      newPartCode: ''
    }
  ])

  const costs = ref([
    {
      category: '',
      amount: ''
    }
  ])

  const labors = ref([
    {
      repairSelection: [] as string[],
      faultLocation: '',
      repairItem: '',
      quantity: '',
      coefficient: ''
    }
  ])

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    return props.type === 'edit' ? '编辑保内工单' : '新增保内工单'
  })

  // 表单验证规则
  const rules: FormRules = {
    carSelection: [{ required: true, message: '请选择整车厂/车型', trigger: 'change' }],
    repairShop: [{ required: true, message: '请输入维修店名称', trigger: 'blur' }],
    reporterName: [{ required: true, message: '请输入报修人姓名', trigger: 'blur' }],
    contactInfo: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
    reportDate: [{ required: true, message: '请选择报修日期', trigger: 'change' }],
    projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
    projectStage: [{ required: true, message: '请选择项目阶段', trigger: 'change' }],
    vinNumber: [{ required: true, message: '请输入车架号', trigger: 'blur' }],
    vehicleLocation: [{ required: true, message: '请输入车辆位置', trigger: 'blur' }],
    vehicleDate: [{ required: true, message: '请选择车辆日期', trigger: 'change' }],
    underWarranty: [{ required: true, message: '请选择是否在保', trigger: 'change' }],
    faultDescription: [{ required: true, message: '请输入故障描述', trigger: 'blur' }]
  }

  // 维修记录验证规则
  const repairRules: FormRules = {
    repairPerson: [{ required: true, message: '请输入维修人姓名', trigger: 'blur' }],
    repairDate: [{ required: true, message: '请选择维修日期', trigger: 'change' }],
    avicResponsibility: [{ required: true, message: '请选择中航责任', trigger: 'change' }],
    faultClassification: [{ required: true, message: '请选择故障分类', trigger: 'change' }],
    faultLocation: [{ required: true, message: '请选择故障位置', trigger: 'change' }],
    partSelection: [{ required: true, message: '请选择零件类别/定位', trigger: 'change' }],
    repairDescription: [{ required: true, message: '请输入维修描述', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = async () => {
    if (props.type === 'edit' && props.orderData) {
      // 如果是编辑模式，从后端获取完整的工单数据
      try {
        const response = await InternalOrderService.getOrderById(props.orderData.id)
        const orderData = response.data

        // 设置基本信息
        Object.assign(formData, orderData)
        currentOrderId.value = orderData.id

        // 设置级联选择器的值
        if (orderData.customer && orderData.vehicleModel) {
          formData.carSelection = [orderData.customer, orderData.vehicleModel]
        }

        // 设置维修记录数据
        if (orderData.details && orderData.details.length > 0) {
          const detail = orderData.details[0]
          Object.assign(repairData, {
            repairPerson: detail.repairPerson || '',
            repairDate: detail.repairDate || '',
            avicResponsibility: detail.avicResponsibility ?? true,
            faultClassification: detail.faultClassification || '',
            faultLocation: detail.faultLocation || '',
            partSelection:
              detail.partCategory && detail.partLocation
                ? [detail.partCategory, detail.partLocation]
                : [],
            repairDescription: detail.repairDescription || ''
          })

          // 设置详情记录数据
          sparePartLocation.value = detail.sparePartLocation || ''
          spareParts.value = detail.spareParts || [
            {
              partNumber: '',
              name: '',
              quantity: '',
              oldPartCode: '',
              newPartCode: ''
            }
          ]
          costs.value = detail.costs || [
            {
              category: '',
              amount: ''
            }
          ]
          labors.value = (detail.labors || []).map((labor: any) => ({
            repairSelection: [] as string[],
            faultLocation: labor.faultLocation || '',
            repairItem: labor.repairItem || '',
            quantity: labor.quantity || '',
            coefficient: labor.coefficient || ''
          }))
        }
      } catch (error) {
        console.error('获取工单详情失败:', error)
        // 如果获取失败，使用传入的基础数据
        Object.assign(formData, props.orderData)
        if (props.orderData.customer && props.orderData.vehicleModel) {
          formData.carSelection = [props.orderData.customer, props.orderData.vehicleModel]
        }
        currentOrderId.value = props.orderData.id
      }
    } else {
      resetForm()
    }
  }

  // 重置表单
  const resetForm = () => {
    formRef.value?.resetFields()
    repairFormRef.value?.resetFields()
    currentStep.value = 0
    currentOrderId.value = ''
    Object.assign(formData, {
      id: '',
      customer: '',
      vehicleModel: '',
      carSelection: [],
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
      underWarranty: true,
      faultDescription: ''
    })
    Object.assign(repairData, {
      repairPerson: '',
      repairDate: '',
      avicResponsibility: true,
      faultClassification: '',
      faultLocation: '',
      partSelection: [],
      repairDescription: ''
    })

    // 重置第三步数据
    sparePartLocation.value = ''
    spareParts.value = [
      {
        partNumber: '',
        name: '',
        quantity: '',
        oldPartCode: '',
        newPartCode: ''
      }
    ]
    costs.value = [
      {
        category: '',
        amount: ''
      }
    ]
    labors.value = [
      {
        repairSelection: [] as string[],
        faultLocation: '',
        repairItem: '',
        quantity: '',
        coefficient: ''
      }
    ]
  }

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  // 动态行管理函数
  const addSparePart = () => {
    spareParts.value.push({
      partNumber: '',
      name: '',
      quantity: '',
      oldPartCode: '',
      newPartCode: ''
    })
  }

  const removeSparePart = (index: number) => {
    if (spareParts.value.length > 1) {
      spareParts.value.splice(index, 1)
    }
  }

  const addCost = () => {
    costs.value.push({
      category: '',
      amount: ''
    })
  }

  const removeCost = (index: number) => {
    if (costs.value.length > 1) {
      costs.value.splice(index, 1)
    }
  }

  const addLabor = () => {
    labors.value.push({
      repairSelection: [] as string[],
      faultLocation: '',
      repairItem: '',
      quantity: '',
      coefficient: ''
    })
  }

  const removeLabor = (index: number) => {
    if (labors.value.length > 1) {
      labors.value.splice(index, 1)
    }
  }

  // 处理备件名称选择变化
  const handlePartNameChange = (row: any, value: string | string[] | undefined) => {
    // ArtSelect组件会直接提供keyValue，所以直接赋值
    if (typeof value === 'string') {
      row.partNumber = value
    }
  }

  // 处理维修项目级联选择变化
  const handleRepairSelectionChange = (row: any, value: string[] | undefined) => {
    // ArtCascader组件会提供路径数组，第一个是故障位置，第二个是维修项目
    if (Array.isArray(value) && value.length >= 2) {
      row.faultLocation = value[0]
      row.repairItem = value[1]
    }
  }

  // 分步保存函数
  const saveCurrentStep = async () => {
    loading.value = true
    try {
      if (currentStep.value === 0) {
        // 第一步：保存报修信息
        await saveStep1()
      } else if (currentStep.value === 1) {
        // 第二步：保存维修记录
        await saveStep2()
      } else if (currentStep.value === 2) {
        // 第三步：保存详情记录
        await saveStep3()
      }

      // 如果不是最后一步，进入下一步
      if (currentStep.value < 2) {
        currentStep.value++
      } else {
        // 最后一步，关闭对话框
        dialogVisible.value = false
        emit('submit')
      }
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 保存第一步：报修信息
  const saveStep1 = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async valid => {
      if (!valid) return

      const step1Data = {
        customer: Array.isArray(formData.carSelection) ? formData.carSelection[0] || '' : '',
        vehicleModel: Array.isArray(formData.carSelection) ? formData.carSelection[1] || '' : '',
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
        const result = await InternalOrderService.createOrder(step1Data)
        currentOrderId.value = result.data.id
        formData.id = result.data.id
      } else {
        await InternalOrderService.updateOrder(formData.id, step1Data)
        currentOrderId.value = formData.id
      }
    })
  }

  // 保存第二步：维修记录
  const saveStep2 = async () => {
    if (!repairFormRef.value) return

    await repairFormRef.value.validate(async valid => {
      if (!valid) return

      const step2Data = {
        repairPerson: repairData.repairPerson,
        repairDate: repairData.repairDate,
        avicResponsibility: repairData.avicResponsibility,
        faultClassification: repairData.faultClassification,
        faultLocation: repairData.faultLocation,
        partCategory: Array.isArray(repairData.partSelection)
          ? repairData.partSelection[0] || ''
          : '',
        partLocation: Array.isArray(repairData.partSelection)
          ? repairData.partSelection[1] || ''
          : '',
        repairDescription: repairData.repairDescription
      }

      await InternalOrderService.updateOrder(currentOrderId.value, step2Data)
    })
  }

  // 保存第三步：详情记录
  const saveStep3 = async () => {
    // 处理工时数据，确保包含faultLocation和repairItem字段
    const processedLabors = labors.value.map(labor => ({
      ...labor,
      faultLocation: labor.faultLocation || '',
      repairItem: labor.repairItem || ''
    }))

    const step3Data = {
      sparePartLocation: sparePartLocation.value,
      spareParts: spareParts.value,
      costs: costs.value,
      labors: processedLabors
    }

    await InternalOrderService.updateOrder(currentOrderId.value, step3Data)
  }

  // 设置备件库位默认值
  const setDefaultSpareLocation = async () => {
    if (spareLocationSelectRef.value && !sparePartLocation.value) {
      try {
        await spareLocationSelectRef.value.fetchDictionaryData()
        const options = spareLocationSelectRef.value.options
        if (options && options.length > 0) {
          sparePartLocation.value = options[0].keyValue
        }
      } catch (error) {
        console.error('设置默认备件库位失败:', error)
      }
    }
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.type, props.orderData],
    async () => {
      if (props.visible) {
        await initFormData()
      }
    },
    { immediate: true }
  )

  // 监听步骤变化，设置默认值
  watch(
    () => currentStep.value,
    async newStep => {
      if (newStep === 2) {
        // 进入第三步时，设置备件库位默认值
        await setDefaultSpareLocation()
      }
    }
  )
</script>

<style lang="scss" scoped>
  .step-indicator {
    margin-bottom: 20px;
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

      .header-form-item {
        margin: 0;

        :deep(.el-form-item__label) {
          margin-right: 8px;
          font-size: 14px;
          color: #606266;
        }

        :deep(.el-form-item__content) {
          margin-left: 0;
        }
      }
    }
  }

  .operation-buttons {
    display: flex;
    gap: 8px;
    align-items: center;

    .btn-text {
      display: inline-block;
      min-width: 34px;
      height: 34px;
      padding: 0 10px;
      font-size: 13px;
      line-height: 34px;
      text-align: center;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s ease-in-out;

      &:hover:not(.disabled) {
        opacity: 0.8;
        transform: scale(1.05);
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      i {
        font-size: 14px;
      }
    }
  }
</style>
