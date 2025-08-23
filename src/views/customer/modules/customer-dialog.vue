<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="700px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="85px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="客户姓名" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入客户姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="联系电话" prop="phone">
            <ElInput v-model="formData.phone" placeholder="请输入联系电话" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="邮箱地址" prop="email">
            <ElInput v-model="formData.email" placeholder="请输入邮箱地址" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="公司名称" prop="company">
            <ElInput v-model="formData.company" placeholder="请输入公司名称" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="客户状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <ElOption label="潜在客户" value="potential" />
              <ElOption label="意向客户" value="intention" />
              <ElOption label="成交客户" value="deal" />
              <ElOption label="流失客户" value="lost" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="客户来源" prop="source">
            <ElSelect v-model="formData.source" placeholder="请选择来源" style="width: 100%">
              <ElOption label="网络推广" value="network" />
              <ElOption label="老客户推荐" value="referral" />
              <ElOption label="展会获取" value="exhibition" />
              <ElOption label="电话营销" value="telemarketing" />
              <ElOption label="其他" value="other" />
            </ElSelect>
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

  defineOptions({ name: 'CustomerDialog' })

  // Props 和 Emits
  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    customerData?: any
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
    name: '',
    phone: '',
    email: '',
    company: '',
    status: '',
    source: '',
    remark: ''
  })

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    return props.type === 'edit' ? '编辑客户' : '新增客户'
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [
      { required: true, message: '请输入客户姓名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱地址', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
    status: [{ required: true, message: '请选择客户状态', trigger: 'change' }],
    source: [{ required: true, message: '请选择客户来源', trigger: 'change' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    if (props.type === 'edit' && props.customerData) {
      Object.assign(formData, props.customerData)
    } else {
      resetForm()
    }
  }

  // 重置表单
  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(formData, {
      id: 0,
      name: '',
      phone: '',
      email: '',
      company: '',
      status: '',
      source: '',
      remark: ''
    })
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.type, props.customerData],
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
