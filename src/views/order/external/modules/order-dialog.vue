<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="800px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="客户姓名" prop="customerName">
            <ElInput v-model="formData.customerName" placeholder="请输入客户姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="联系电话" prop="customerPhone">
            <ElInput v-model="formData.customerPhone" placeholder="请输入联系电话" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="产品名称" prop="productName">
            <ElInput v-model="formData.productName" placeholder="请输入产品名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="产品数量" prop="quantity">
            <ElInputNumber v-model="formData.quantity" :min="1" style="width: 100%" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="单价" prop="unitPrice">
            <ElInputNumber
              v-model="formData.unitPrice"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="总金额" prop="totalAmount">
            <ElInput v-model="formData.totalAmount" disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="订单状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <ElOption label="待确认" value="pending" />
              <ElOption label="已确认" value="confirmed" />
              <ElOption label="生产中" value="producing" />
              <ElOption label="已完成" value="completed" />
              <ElOption label="已取消" value="cancelled" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="交付时间" prop="deliveryDate">
            <ElDatePicker
              v-model="formData.deliveryDate"
              type="date"
              placeholder="请选择交付时间"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="备注信息" prop="remark">
            <ElInput
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
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

  defineOptions({ name: 'OrderDialog' })

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
    id: 0,
    customerName: '',
    customerPhone: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    status: '',
    deliveryDate: '',
    remark: ''
  })

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    return props.type === 'edit' ? '编辑订单' : '新增订单'
  })

  // 表单验证规则
  const rules: FormRules = {
    customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
    customerPhone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
    quantity: [{ required: true, message: '请输入产品数量', trigger: 'blur' }],
    unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
    status: [{ required: true, message: '请选择订单状态', trigger: 'change' }],
    deliveryDate: [{ required: true, message: '请选择交付时间', trigger: 'change' }]
  }

  // 计算总金额
  watch([() => formData.quantity, () => formData.unitPrice], () => {
    formData.totalAmount = formData.quantity * formData.unitPrice
  })

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
      id: 0,
      customerName: '',
      customerPhone: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      status: '',
      deliveryDate: '',
      remark: ''
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
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000))
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
