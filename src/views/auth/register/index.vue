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
          <h3 class="title">{{ t('register.title') }}</h3>
          <p class="sub-title">{{ t('register.subTitle') }}</p>
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
                :placeholder="t('register.placeholder.username')"
                autocomplete="username"
              />
            </ElFormItem>

            <ElFormItem prop="nickName">
              <ElInput
                v-model.trim="formData.nickName"
                :placeholder="t('register.placeholder.nickName')"
              />
            </ElFormItem>

            <ElFormItem prop="phone">
              <ElInput
                v-model.trim="formData.phone"
                :placeholder="t('register.placeholder.phone')"
              />
            </ElFormItem>

            <ElFormItem prop="email">
              <ElInput
                v-model.trim="formData.email"
                :placeholder="t('register.placeholder.email')"
              />
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                v-model.trim="formData.password"
                :placeholder="t('register.placeholder.password')"
                type="password"
                autocomplete="password"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                v-model.trim="formData.confirmPassword"
                :placeholder="t('register.placeholder.confirmPassword')"
                type="password"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="captcha">
              <ElInput
                v-model.trim="formData.captcha"
                :placeholder="t('register.placeholder.captcha')"
              />
            </ElFormItem>

            <div style="margin-top: 15px">
              <ElButton
                class="login-btn"
                type="primary"
                @click="register"
                :loading="loading"
                v-ripple
              >
                {{ t('register.submitBtnText') }}
              </ElButton>
            </div>

            <div class="footer">
              <p>
                {{ t('register.hasAccount') }}
                <router-link :to="RoutesAlias.Login">{{ t('register.toLogin') }}</router-link>
              </p>
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
  import {
    validatePhone,
    validateEmail,
    validatePassword,
    validateAccount,
    validateName
  } from '@/utils/validation'

  defineOptions({ name: 'Register' })

  const { t, locale } = useI18n()

  const router = useRouter()
  const formRef = ref<FormInstance>()

  const systemName = computed(() => getSystemName(locale.value))
  const loading = ref(false)

  const formData = reactive({
    username: '',
    nickName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  })

  const validatePhoneField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.validation.phone')))
    } else if (!validatePhone(value)) {
      callback(new Error(t('register.validation.phoneFormat')))
    } else {
      callback()
    }
  }

  const validateEmailField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback()
    } else if (!validateEmail(value)) {
      callback(new Error(t('register.validation.emailFormat')))
    } else {
      callback()
    }
  }

  const validateUsernameField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.validation.username')))
    } else if (!validateAccount(value)) {
      callback(new Error(t('register.validation.usernameFormat')))
    } else {
      callback()
    }
  }

  const validateNickNameField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.validation.nickName')))
    } else if (!validateName(value)) {
      callback(new Error(t('register.validation.nickNameFormat')))
    } else {
      callback()
    }
  }

  const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.validation.password')))
    } else if (!validatePassword(value)) {
      callback(new Error(t('register.validation.passwordFormat')))
    } else {
      if (formData.confirmPassword !== '') {
        formRef.value?.validateField('confirmPassword')
      }
      callback()
    }
  }

  const validatePass2 = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.validation.confirmPassword')))
    } else if (value !== formData.password) {
      callback(new Error(t('register.validation.passwordMismatch')))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules>({
    username: [{ required: true, validator: validateUsernameField, trigger: 'blur' }],
    nickName: [{ required: true, validator: validateNickNameField, trigger: 'blur' }],
    phone: [{ required: true, validator: validatePhoneField, trigger: 'blur' }],
    email: [{ validator: validateEmailField, trigger: 'blur' }],
    password: [{ required: true, validator: validatePass, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    captcha: [{ required: true, message: t('register.validation.captcha'), trigger: 'blur' }]
  })

  const register = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      // 调用注册API
      await UserService.register({
        userName: formData.username,
        nickName: formData.nickName,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        systemCode: formData.captcha
      })

      ElMessage.success(t('register.success.message'))
      toLogin()
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const toLogin = () => {
    setTimeout(() => {
      router.push(RoutesAlias.Login)
    }, 1000)
  }
</script>

<style lang="scss" scoped>
  @use '../index';
</style>
