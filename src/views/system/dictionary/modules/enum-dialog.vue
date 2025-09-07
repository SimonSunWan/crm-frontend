<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="500px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem v-if="showParentSelect" label="父级枚举" prop="parentId">
        <ElSelect
          v-model="formData.parentId"
          placeholder="请选择父级枚举"
          clearable
          disabled
          filterable
          :loading="parentOptionsLoading"
        >
          <ElOption
            v-for="option in parentOptions"
            :key="option.id"
            :label="option.dictValue"
            :value="option.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="key值" prop="keyValue">
        <ElInput v-model="formData.keyValue" placeholder="请输入key值" />
      </ElFormItem>
      <ElFormItem label="字典值" prop="dictValue">
        <ElInput v-model="formData.dictValue" placeholder="请输入字典值" />
      </ElFormItem>
      <ElFormItem label="排序" prop="sortOrder">
        <ElInputNumber
          v-model="formData.sortOrder"
          :min="1"
          controls-position="right"
          style="width: 100%"
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
  import type { DictionaryTypeItem, DictionaryEnumItem } from '@/types/api'

  defineOptions({ name: 'EnumDialog' })

  const { createDictionaryEnum, updateDictionaryEnum, getRootDictionaryEnums } = DictionaryService

  // Props 和 Emits
  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    typeData?: DictionaryTypeItem
    enumData?: Partial<DictionaryEnumItem>
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: []
  }>()

  // 响应式数据
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const parentOptionsLoading = ref(false)
  const parentOptions = ref<DictionaryEnumItem[]>([])
  const formData = reactive({
    parentId: undefined as number | undefined,
    keyValue: '',
    dictValue: '',
    sortOrder: 0
  })

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    return props.type === 'add' ? '新增字典枚举' : '编辑字典枚举'
  })

  const showParentSelect = computed(() => {
    return !!props.enumData?.parentId
  })

  // 表单验证规则
  const rules: FormRules = {
    keyValue: [{ required: true, message: '请输入key值', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
  }

  // 获取父级选项
  const getParentOptions = async () => {
    if (!props.typeData?.id) return

    parentOptionsLoading.value = true
    try {
      const response = await getRootDictionaryEnums(props.typeData.id)
      parentOptions.value = response || []
    } catch (error) {
      console.error(error)
      parentOptions.value = []
    } finally {
      parentOptionsLoading.value = false
    }
  }

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.enumData
    const data = props.enumData

    Object.assign(formData, {
      parentId: isEdit && data ? data.parentId : data?.parentId || undefined,
      keyValue: isEdit && data ? data.keyValue || '' : '',
      dictValue: isEdit && data ? data.dictValue || '' : '',
      sortOrder: isEdit && data ? data.sortOrder || 0 : 0
    })
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.type, props.enumData],
    ([visible]) => {
      if (visible) {
        initFormData()
        getParentOptions()
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value || !props.typeData) return

    await formRef.value.validate(async valid => {
      if (valid) {
        loading.value = true
        try {
          if (props.type === 'add') {
            await createDictionaryEnum({
              typeId: props.typeData!.id,
              ...formData
            })
            ElMessage.success('新增成功')
          } else if (props.enumData?.id) {
            await updateDictionaryEnum(props.enumData.id, formData)
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
