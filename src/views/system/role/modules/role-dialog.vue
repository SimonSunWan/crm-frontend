<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="500px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model="formData.roleName" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="角色编码" prop="roleCode">
        <ElInput v-model="formData.roleCode" placeholder="请输入角色编码" />
      </ElFormItem>
      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          placeholder="请输入角色描述"
          :rows="3"
        />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSwitch v-model="formData.status" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  // API 服务
  import { RoleService } from '@/api/rolesApi'

  // Element Plus 组件和类型
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { Role, CreateRoleParams } from '@/types/api'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    roleData?: Partial<Role>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 响应式数据
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  // 表单数据
  const formData = reactive<CreateRoleParams>({
    roleName: '',
    roleCode: '',
    description: '',
    status: true
  })

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单验证规则
  const rules: FormRules = {
    roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
    description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.roleData
    const row = props.roleData

    Object.assign(formData, {
      roleName: isEdit && row ? row.roleName || '' : '',
      roleCode: isEdit && row ? row.roleCode || '' : '',
      description: isEdit && row ? row.description || '' : '',
      status: isEdit && row ? (row.status ?? true) : true
    })
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.type, props.roleData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      if (dialogType.value === 'add') {
        await RoleService.createRole(formData)
        ElMessage.success('新增成功')
      } else {
        if (props.roleData?.id) {
          await RoleService.updateRole(props.roleData.id, formData)
          ElMessage.success('编辑成功')
        }
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    text-align: right;
  }
</style>
