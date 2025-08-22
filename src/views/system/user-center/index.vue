<template>
  <div class="page-content user">
    <div class="content">
      <div class="left-wrap">
        <div class="user-wrap box-style">
          <img class="bg" src="@imgs/user/bg.webp" />
          <div class="avatar-container">
            <img
              v-if="userInfo.avatar"
              class="avatar"
              :src="getAvatarUrl(userInfo.avatar)"
              @click="handleAvatarClick"
            />
            <div v-else class="avatar-placeholder" @click="handleAvatarClick">
              {{ getAvatarText(userInfo.nickName || userInfo.userName || '用户') }}
            </div>
            <div class="avatar-upload-overlay" @click="handleAvatarClick">
              <i class="iconfont-sys">&#xe734;</i>
              <span>点击更换头像</span>
            </div>
            <div v-if="loading" class="avatar-loading">
              <i class="iconfont-sys">&#xe6b8;</i>
            </div>
          </div>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
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
              <ElFormItem label="昵称" prop="nickName" class="right-input">
                <ElInput v-model="form.nickName" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机" prop="phone">
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

          <ElForm :model="pwdForm" class="form" label-width="86px">
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
  import mittBus from '@/utils/sys/mittBus'
  import { getAvatarUrl } from '@/utils'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const loading = ref(false)
  const avatarInputRef = ref<HTMLInputElement>()

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

  const rules = reactive<FormRules>({
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    nickName: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码格式', trigger: 'blur' }
    ]
  })

  onMounted(() => {
    loadUserInfo()
  })

  const getAvatarText = (text: string) => {
    return text ? text.charAt(0).toUpperCase() : 'U'
  }

  const handleAvatarClick = () => {
    avatarInputRef.value?.click()
  }

  const handleAvatarChange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          ElMessage.error('图片尺寸不能小于100x100像素')
          return
        }

        uploadAvatarFile(file)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatarFile = async (file: File) => {
    try {
      loading.value = true
      const response = await UserService.uploadAvatar(file)

      if (response.avatar_url) {
        const updatedUserInfo = { ...userInfo.value, avatar: response.avatar_url }
        userStore.setUserInfo(updatedUserInfo as Api.User.UserInfo)

        ElMessage.success('头像上传成功')
        mittBus.emit('user-avatar-updated', response.avatar_url)
      } else {
        ElMessage.error('头像上传失败：未获取到头像URL')
      }
    } catch (error: any) {
      if (error.response?.status === 413) {
        ElMessage.error('文件太大，请选择小于2MB的图片')
      } else if (error.response?.status === 415) {
        ElMessage.error('不支持的图片格式，请选择JPG、PNG或GIF格式')
      } else if (error.response?.status === 401) {
        ElMessage.error('登录已过期，请重新登录')
      } else {
        ElMessage.error(`头像上传失败：${error.message || '未知错误'}`)
      }
    } finally {
      loading.value = false
      if (avatarInputRef.value) avatarInputRef.value.value = ''
    }
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
    } catch {
      ElMessage.error('获取用户信息失败')
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

        ElMessage.success('保存成功')
        isEdit.value = false
      } catch {
        ElMessage.error('保存失败')
      } finally {
        loading.value = false
      }
    } else {
      isEdit.value = true
    }
  }

  const editPwd = async () => {
    if (isEditPwd.value) {
      if (pwdForm.newPassword !== pwdForm.confirmPassword) {
        ElMessage.error('两次输入的密码不一致')
        return
      }

      if (pwdForm.newPassword.length < 6) {
        ElMessage.error('新密码长度不能少于6位')
        return
      }

      try {
        loading.value = true

        await UserService.changePassword(pwdForm.password, pwdForm.newPassword)

        ElMessage.success('密码修改成功')
        isEditPwd.value = false

        pwdForm.password = ''
        pwdForm.newPassword = ''
        pwdForm.confirmPassword = ''
      } catch {
        ElMessage.error('修改密码失败')
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
