<template>
  <div class="login">
    <LoginLeftView></LoginLeftView>
    <div class="right-wrap">
      <div class="header">
        <ArtLogo class="icon" />
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ t('forgetPassword.title') }}</h3>
          <p class="sub-title">{{ t('forgetPassword.subTitle') }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="top"
            style="margin-top: 25px"
          >
            <ElFormItem prop="username">
              <ElInput
                v-model.trim="formData.username"
                :placeholder="t('forgetPassword.placeholder.username')"
              />
            </ElFormItem>

            <ElFormItem prop="newPassword">
              <ElInput
                v-model.trim="formData.newPassword"
                :placeholder="t('forgetPassword.placeholder.newPassword')"
                type="password"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                v-model.trim="formData.confirmPassword"
                :placeholder="t('forgetPassword.placeholder.confirmPassword')"
                type="password"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="systemCode">
              <ElInput
                v-model.trim="formData.systemCode"
                :placeholder="t('forgetPassword.placeholder.systemCode')"
              />
            </ElFormItem>

            <div style="margin-top: 15px">
              <ElButton
                class="login-btn"
                type="primary"
                @click="resetPassword"
                :loading="loading"
                v-ripple
              >
                {{ t('forgetPassword.submitBtnText') }}
              </ElButton>
            </div>

            <div style="margin-top: 15px">
              <ElButton class="back-btn" plain @click="toLogin">
                {{ t('forgetPassword.backBtnText') }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { getSystemName } from '@/config'
  import { RoutesAlias } from '@/router/routesAlias'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { UserService } from '@/api/usersApi'
  import { useI18n } from 'vue-i18n'
  import { validatePassword } from '@/utils/validation'

  defineOptions({ name: 'ForgetPassword' })

  const { t, locale } = useI18n()

  const router = useRouter()
  const formRef = ref<FormInstance>()

  const systemName = computed(() => getSystemName(locale.value))
  const loading = ref(false)

  const formData = reactive({
    username: '',
    newPassword: '',
    confirmPassword: '',
    systemCode: ''
  })

  const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('forgetPassword.validation.newPassword')))
    } else if (!validatePassword(value)) {
      callback(new Error(t('forgetPassword.validation.passwordFormat')))
    } else {
      if (formData.confirmPassword !== '') {
        formRef.value?.validateField('confirmPassword')
      }
      callback()
    }
  }

  const validatePass2 = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('forgetPassword.validation.confirmPassword')))
    } else if (value !== formData.newPassword) {
      callback(new Error(t('forgetPassword.validation.passwordMismatch')))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules>({
    username: [
      { required: true, message: t('forgetPassword.validation.username'), trigger: 'blur' }
    ],
    newPassword: [{ required: true, validator: validatePass, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    systemCode: [
      { required: true, message: t('forgetPassword.validation.systemCode'), trigger: 'blur' }
    ]
  })

  const resetPassword = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      await UserService.forgetPassword({
        username: formData.username,
        newPassword: formData.newPassword,
        systemCode: formData.systemCode
      })

      ElMessage.success(t('forgetPassword.success.message'))
      toLogin()
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const toLogin = () => {
    router.push(RoutesAlias.Login)
  }
</script>

<style lang="scss" scoped>
  @use '../index';
</style>
