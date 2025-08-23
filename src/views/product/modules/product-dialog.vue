<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="700px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="产品名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入产品名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="产品编码" prop="code">
            <ElInput v-model="formData.code" placeholder="请输入产品编码" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="产品分类" prop="category">
            <ElSelect v-model="formData.category" placeholder="请选择分类" style="width: 100%">
              <ElOption label="服务器" value="server" />
              <ElOption label="网络设备" value="network" />
              <ElOption label="软件产品" value="software" />
              <ElOption label="配件" value="accessory" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="产品状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态" style="width: 100%">
              <ElOption label="在售" value="active" />
              <ElOption label="停售" value="inactive" />
              <ElOption label="缺货" value="outofstock" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="售价" prop="price">
            <ElInputNumber v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="成本" prop="cost">
            <ElInputNumber v-model="formData.cost" :min="0" :precision="2" style="width: 100%" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="库存数量" prop="stock">
            <ElInputNumber v-model="formData.stock" :min="0" style="width: 100%" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="产品描述" prop="description">
            <ElInput
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入产品描述"
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

  defineOptions({ name: 'ProductDialog' })

  // Props 和 Emits
  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    productData?: any
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
    code: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    status: '',
    description: ''
  })

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    return props.type === 'edit' ? '编辑产品' : '新增产品'
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入产品编码', trigger: 'blur' }],
    category: [{ required: true, message: '请选择产品分类', trigger: 'change' }],
    price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
    cost: [{ required: true, message: '请输入成本', trigger: 'blur' }],
    stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
    status: [{ required: true, message: '请选择产品状态', trigger: 'change' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    if (props.type === 'edit' && props.productData) {
      Object.assign(formData, props.productData)
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
      code: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      status: '',
      description: ''
    })
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.type, props.productData],
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
