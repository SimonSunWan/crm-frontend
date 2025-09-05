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
          <h3 class="title">{{ $t('register.title') }}</h3>
          <p class="sub-title">{{ $t('register.subTitle') }}</p>
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
                :placeholder="$t('register.placeholder[0]')"
                autocomplete="username"
              />
            </ElFormItem>

            <ElFormItem prop="nickName">
              <ElInput v-model.trim="formData.nickName" placeholder="请输入姓名" />
            </ElFormItem>

            <ElFormItem prop="phone">
              <ElInput v-model.trim="formData.phone" placeholder="请输入手机号" />
            </ElFormItem>

            <ElFormItem prop="email">
              <ElInput v-model.trim="formData.email" placeholder="请输入邮箱" />
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                v-model.trim="formData.password"
                :placeholder="$t('register.placeholder[1]')"
                type="password"
                autocomplete="password"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                v-model.trim="formData.confirmPassword"
                :placeholder="$t('register.placeholder[2]')"
                type="password"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="captcha">
              <ElInput
                v-model.trim="formData.captcha"
                placeholder="请输入系统码（找系统管理员获取）"
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
                {{ $t('register.submitBtnText') }}
              </ElButton>
            </div>

            <div class="footer">
              <p>
                {{ $t('register.hasAccount') }}
                <router-link :to="RoutesAlias.Login">{{ $t('register.toLogin') }}</router-link>
              </p>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { RoutesAlias } from '@/router/routesAlias'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import { UserService } from '@/api/usersApi'

  defineOptions({ name: 'Register' })

  const { t } = useI18n()

  const router = useRouter()
  const formRef = ref<FormInstance>()

  const systemName = AppConfig.systemInfo.name
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

  const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.placeholder[1]')))
    } else {
      if (formData.confirmPassword !== '') {
        formRef.value?.validateField('confirmPassword')
      }
      callback()
    }
  }

  const validatePass2 = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.rule[0]')))
    } else if (value !== formData.password) {
      callback(new Error(t('register.rule[1]')))
    } else {
      callback()
    }
  }

  const validatePhone = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }

  const validateEmail = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback()
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules>({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    nickName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    password: [{ required: true, validator: validatePass, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    captcha: [{ required: true, message: '请输入系统码', trigger: 'blur' }]
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

      ElMessage.success('注册成功，请等待系统管理员审核')
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
