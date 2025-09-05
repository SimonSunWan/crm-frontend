<template>
  <div class="page-content user">
    <div class="content">
      <div class="left-wrap">
        <div class="user-wrap box-style">
          <img class="bg" src="@imgs/user/bg.webp" />
          <div class="avatar-container">
            <img v-if="userInfo.avatar" class="avatar" :src="getAvatarUrl(userInfo.avatar)" />
            <div v-else class="avatar-placeholder">
              {{ getAvatarText(userInfo.nickName || userInfo.userName || '用户') }}
            </div>

            <div v-if="loading" class="avatar-loading">
              <i class="iconfont-sys">&#xe6b8;</i>
            </div>
          </div>

          <div class="outer-info">
            <h2 class="name">{{ userInfo.userName || '用户' }}</h2>
            <p class="nick-name">{{ userInfo.nickName }}</p>
            <div v-if="userInfo.phone">
              <i class="iconfont-sys">&#xe70d;</i>
              <span>{{ userInfo.phone }}</span>
            </div>
            <div v-if="userInfo.email">
              <i class="iconfont-sys">&#xe72e;</i>
              <span>{{ userInfo.email }}</span>
            </div>
            <div v-if="userInfo.roleNames && userInfo.roleNames.length > 0">
              <i class="iconfont-sys">&#xe811;</i>
              <el-tag v-for="role in userInfo.roleNames" :key="role" size="small">{{
                role
              }}</el-tag>
            </div>
          </div>
        </div>
      </div>
      <div class="right-wrap">
        <div class="info box-style">
          <h1 class="title">基本设置</h1>

          <ElForm :model="form" class="form" ref="ruleFormRef" :rules="rules" label-width="86px">
            <ElRow>
              <ElFormItem label="用户名" prop="userName">
                <el-input v-model="form.userName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="姓名" prop="nickName" class="right-input">
                <ElInput v-model="form.nickName" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机号" prop="phone">
                <ElInput v-model="form.phone" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="email" class="right-input">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <div class="el-form-item-right">
              <ElButton type="primary" style="width: 90px" v-ripple @click="edit">
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="info box-style" style="margin-top: 20px">
          <h1 class="title">更改密码</h1>

          <ElForm
            ref="pwdFormRef"
            :model="pwdForm"
            :rules="pwdRules"
            class="form"
            label-width="100px"
          >
            <ElFormItem label="当前密码" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="el-form-item-right">
              <ElButton type="primary" style="width: 90px" v-ripple @click="editPwd">
                {{ isEditPwd ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { UserService } from '@/api/usersApi'
  import { ElForm, FormInstance, FormRules, ElMessage } from 'element-plus'
  import { getAvatarUrl } from '@/utils'
  import {
    validatePassword,
    validatePhone,
    validateEmail,
    validateAccount,
    validateName
  } from '@/utils/validation'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const loading = ref(false)

  const form = reactive({
    userName: '',
    nickName: '',
    email: '',
    phone: ''
  })

  const pwdForm = reactive({
    password: '',
    newPassword: '',
    confirmPassword: ''
  })

  const ruleFormRef = ref<FormInstance>()
  const pwdFormRef = ref<FormInstance>()

  const validateUsernameField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请输入用户名'))
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

  const validateEmailField = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback()
    } else if (!validateEmail(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }

  const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请输入新密码'))
    } else if (!validatePassword(value)) {
      callback(new Error('6-20位, 必须包含字母和数字'))
    } else {
      if (pwdForm.confirmPassword !== '') {
        pwdFormRef.value?.validateField('confirmPassword')
      }
      callback()
    }
  }

  const validatePass2 = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error('请再次输入新密码'))
    } else if (value !== pwdForm.newPassword) {
      callback(new Error('两次输入密码不一致'))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules>({
    userName: [{ required: true, validator: validateUsernameField, trigger: 'blur' }],
    nickName: [{ required: true, validator: validateNickNameField, trigger: 'blur' }],
    phone: [{ required: true, validator: validatePhoneField, trigger: 'blur' }],
    email: [{ validator: validateEmailField, trigger: 'blur' }]
  })

  const pwdRules = reactive<FormRules>({
    password: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    newPassword: [{ required: true, validator: validatePass, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }]
  })

  onMounted(() => {
    loadUserInfo()
  })

  const getAvatarText = (text: string) => {
    return text ? text.charAt(0).toUpperCase() : 'U'
  }

  const loadUserInfo = async () => {
    try {
      loading.value = true
      const data = await UserService.getUserInfo()
      if (data) {
        userStore.setUserInfo(data)
        form.userName = data.userName || ''
        form.nickName = data.nickName || ''
        form.email = data.email || ''
        form.phone = data.phone || ''
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const edit = async () => {
    if (isEdit.value) {
      try {
        await ruleFormRef.value?.validate()
        loading.value = true

        await UserService.updateCurrentUser({
          userName: form.userName,
          nickName: form.nickName,
          email: form.email,
          phone: form.phone
        })

        await loadUserInfo()

        ElMessage.success('编辑成功')
        isEdit.value = false
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    } else {
      isEdit.value = true
    }
  }

  const editPwd = async () => {
    if (isEditPwd.value) {
      try {
        await pwdFormRef.value?.validate()
        loading.value = true

        await UserService.changePassword({
          currentPassword: pwdForm.password,
          newPassword: pwdForm.newPassword
        })

        ElMessage.success('编辑成功')
        isEditPwd.value = false

        pwdForm.password = ''
        pwdForm.newPassword = ''
        pwdForm.confirmPassword = ''
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    } else {
      isEditPwd.value = true
    }
  }
</script>

<style lang="scss">
  .user {
    .icon {
      width: 1.4em;
      height: 1.4em;
      overflow: hidden;
      vertical-align: -0.15em;
      fill: currentcolor;
    }
  }
</style>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;

    $box-radius: calc(var(--custom-radius) + 4px);

    .box-style {
      border: 1px solid var(--art-border-color);
    }

    .content {
      position: relative;
      display: flex;
      justify-content: space-between;
      margin-top: 10px;

      .left-wrap {
        width: 450px;
        margin-right: 25px;

        .user-wrap {
          position: relative;
          height: 528px;
          padding: 35px 40px;
          overflow: hidden;
          text-align: center;
          background: var(--art-main-bg-color);
          border-radius: $box-radius;

          .bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 200px;
            object-fit: cover;
          }

          .avatar-container {
            position: relative;
            left: 30px;
            z-index: 10;
            width: 80px;
            height: 80px;
            margin-top: 120px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid #fff;
            border-radius: 50%;
            transition: transform 0.3s ease;

            &:hover {
              transform: scale(1.05);
            }

            .avatar {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .avatar-placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              font-size: 28px;
              font-weight: bold;
              color: #fff;
              text-shadow: 0 2px 4px rgb(0 0 0 / 30%);
              background: var(--el-color-primary);
            }

            .avatar-upload-overlay {
              position: absolute;
              top: 0;
              left: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              font-size: 12px;
              color: #fff;
              cursor: pointer;
              background-color: rgb(0 0 0 / 60%);
              border-radius: 50%;
              opacity: 0;
              transition: opacity 0.3s ease;

              i {
                margin-bottom: 4px;
                font-size: 24px;
              }

              span {
                font-size: 10px;
                line-height: 1.2;
                text-align: center;
              }

              &:hover {
                opacity: 1;
              }
            }

            .avatar-loading {
              position: absolute;
              top: 0;
              left: 0;
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background-color: rgb(0 0 0 / 60%);
              border-radius: 50%;

              i {
                font-size: 30px;
                color: #fff;
              }
            }
          }

          .name {
            font-size: 22px;
            font-weight: 400;
          }

          .nick-name {
            margin: 10px 0 30px;
            font-size: 14px;
          }

          .outer-info {
            width: 300px;
            margin: auto;
            margin-top: 20px;
            text-align: left;

            > div {
              margin-top: 10px;

              span {
                margin-left: 8px;
                font-size: 14px;
              }
            }
          }

          .lables {
            margin-top: 40px;

            h3 {
              font-size: 15px;
              font-weight: 500;
            }

            > div {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin-top: 15px;

              > div {
                padding: 3px 6px;
                margin: 0 10px 10px 0;
                font-size: 12px;
                background: var(--art-main-bg-color);
                border: 1px solid var(--art-border-color);
                border-radius: 2px;
              }
            }
          }
        }

        .gallery {
          margin-top: 25px;
          border-radius: 10px;

          .item {
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }

      .right-wrap {
        flex: 1;
        overflow: hidden;
        border-radius: $box-radius;

        .info {
          background: var(--art-main-bg-color);
          border-radius: $box-radius;

          .title {
            padding: 15px 25px;
            font-size: 20px;
            font-weight: 400;
            color: var(--art-text-gray-800);
            border-bottom: 1px solid var(--art-border-color);
          }

          .form {
            box-sizing: border-box;
            padding: 30px 25px;

            > .el-row {
              .el-form-item {
                width: calc(50% - 10px);
              }

              .el-input,
              .el-select {
                width: 100%;
              }
            }

            .right-input {
              margin-left: 20px;
            }

            .el-form-item-right {
              display: flex;
              align-items: center;
              justify-content: end;

              .el-button {
                width: 110px !important;
              }
            }
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad-vertical) {
    .page-content {
      .content {
        display: block;
        margin-top: 5px;

        .left-wrap {
          width: 100%;
        }

        .right-wrap {
          width: 100%;
          margin-top: 15px;
        }
      }
    }
  }
</style>
