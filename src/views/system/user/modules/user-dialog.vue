<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="500px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="账号" prop="userName">
        <ElInput v-model="formData.userName" placeholder="请输入账号" autocomplete="username" />
      </ElFormItem>
      <ElFormItem label="姓名" prop="nickName">
        <ElInput v-model="formData.nickName" placeholder="请输入姓名" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="邮箱" prop="email">
        <ElInput v-model="formData.email" placeholder="请输入邮箱" />
      </ElFormItem>
      <ElFormItem label="角色名称" prop="roles">
        <ElSelect v-model="formData.roles" multiple placeholder="请选择角色名称">
          <ElOption
            v-for="role in roleList"
            :key="role.value"
            :value="role.value"
            :label="role.label"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSwitch v-model="formData.status" />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'add'" label="密码" prop="password">
        <ElInput v-model="formData.password" readonly placeholder="自动生成" />
        <div class="password-tip">密码规则：账号 + 手机号后4位</div>
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
  import { UserService } from '@/api/usersApi'
  import { RoleService } from '@/api/rolesApi'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { validatePhone, validateEmail, validateAccount, validateName } from '@/utils/validation'

  interface Props {
    visible: boolean
    type: string
    userData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const roleList = ref<Array<{ label: string; value: string }>>([])

  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const formData = reactive({
    userName: '',
    nickName: '',
    phone: '',
    email: '',
    password: '',
    roles: [] as string[],
    status: true
  })

  const fetchRoleList = async () => {
    try {
      const response = await RoleService.getAllRoles()
      if (response && response.records && Array.isArray(response.records)) {
        roleList.value = response.records.map(role => ({
          label: role.roleName,
          value: role.roleCode
        }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const validateEmailField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback()
    } else if (!validateEmail(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }

  const validateUsernameField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请输入账号'))
    } else if (!validateAccount(value)) {
      callback(new Error('字母开头, 5-20位, 支持字母、数字、下划线'))
    } else {
      callback()
    }
  }

  const validateNickNameField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请输入姓名'))
    } else if (!validateName(value)) {
      callback(new Error('2-20位, 支持中文、英文字母、空格'))
    } else {
      callback()
    }
  }

  const validatePhoneField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请输入手机号'))
    } else if (!validatePhone(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }

  const rules: FormRules = {
    userName: [{ required: true, validator: validateUsernameField, trigger: 'blur' }],
    nickName: [{ required: true, validator: validateNickNameField, trigger: 'blur' }],
    phone: [{ required: true, validator: validatePhoneField, trigger: 'blur' }],
    email: [{ validator: validateEmailField, trigger: 'blur' }],
    roles: [{ required: true, message: '请选择角色名称', trigger: 'blur' }]
  }

  const generatePassword = () => {
    const userName = formData.userName || ''
    const phone = formData.phone || ''
    const phoneLast4 = phone.slice(-4)
    formData.password = userName + phoneLast4
  }

  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    Object.assign(formData, {
      userName: isEdit ? row.userName || '' : '',
      nickName: isEdit ? row.nickName || '' : '',
      phone: isEdit ? row.phone || '' : '',
      email: isEdit ? row.email || '' : '',
      password: '',
      roles: isEdit ? (Array.isArray(row.roles) ? row.roles : []) : [],
      status: isEdit ? row.status : true
    })
  }

  watch(
    () => [props.visible, props.type, props.userData],
    async ([visible]) => {
      if (visible) {
        await fetchRoleList()
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  watch(
    () => [formData.userName, formData.phone],
    () => {
      if (dialogType.value === 'add') {
        generatePassword()
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      if (dialogType.value === 'add') {
        await UserService.createUser(formData)
        ElMessage.success('新增成功')
      } else {
        await UserService.updateUser(props.userData.id, formData)
        ElMessage.success('编辑成功')
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
  .password-tip {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: #909399;
  }
</style>
