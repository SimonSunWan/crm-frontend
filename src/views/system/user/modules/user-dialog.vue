<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="500px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="userName">
        <ElInput v-model="formData.userName" placeholder="请输入用户名" />
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
      <ElFormItem v-if="dialogType === 'add'" label="密码" prop="password">
        <ElInput v-model="formData.password" type="password" placeholder="请输入密码" />
      </ElFormItem>
      <ElFormItem label="角色" prop="roles">
        <ElSelect v-model="formData.roles" multiple placeholder="请选择角色">
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
      if (response && Array.isArray(response)) {
        roleList.value = response.map(role => ({
          label: role.roleName,
          value: role.roleCode
        }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const rules: FormRules = {
    userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    nickName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    roles: [{ required: true, message: '请选择角色', trigger: 'blur' }]
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

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      if (dialogType.value === 'add') {
        await UserService.createUser(formData)
        ElMessage.success('添加成功')
      } else {
        await UserService.updateUser(props.userData.id, formData)
        ElMessage.success('更新成功')
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
