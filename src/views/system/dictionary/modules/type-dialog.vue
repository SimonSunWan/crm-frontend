<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="500px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="字典名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典编码" prop="code">
        <ElInput v-model="formData.code" placeholder="请输入字典编码" />
      </ElFormItem>
      <ElFormItem label="字典描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          placeholder="请输入字典描述"
          :rows="3"
        />
      </ElFormItem>
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

  // API 服务
  import { DictionaryService } from '@/api/dictionaryApi'
  import type { DictionaryTypeItem } from '@/types/api'

  defineOptions({ name: 'TypeDialog' })

  const { createDictionaryType, updateDictionaryType } = DictionaryService

  // Props 和 Emits
  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    typeData?: Partial<DictionaryTypeItem>
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
    name: '',
    code: '',
    description: ''
  })

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    return props.type === 'add' ? '新增字典分类' : '编辑字典分类'
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.typeData
    const data = props.typeData

    Object.assign(formData, {
      name: isEdit && data ? data.name || '' : '',
      code: isEdit && data ? data.code || '' : '',
      description: isEdit && data ? data.description || '' : ''
    })
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.type, props.typeData],
    ([visible]) => {
      if (visible) {
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
          if (props.type === 'add') {
            await createDictionaryType(formData)
            ElMessage.success('新增成功')
          } else if (props.typeData?.id) {
            await updateDictionaryType(props.typeData.id, formData)
            ElMessage.success('编辑成功')
          }
          emit('submit')
        } catch (error) {
          console.error(error)
        } finally {
          loading.value = false
        }
      }
    })
  }
</script>
