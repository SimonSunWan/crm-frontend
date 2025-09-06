<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="700px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="85px">
      <ElFormItem label="菜单类型">
        <ElRadioGroup v-model="menuType" :disabled="disableMenuType">
          <ElRadioButton value="menu" label="menu">菜单</ElRadioButton>
          <ElRadioButton value="button" label="button">权限</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>

      <template v-if="menuType === 'menu'">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="菜单名称" prop="name">
              <ElInput v-model="formData.name" placeholder="菜单名称"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="路由地址" prop="path" v-if="!formData.isLink">
              <ElInput v-model="formData.path" placeholder="路由地址"></ElInput>
            </ElFormItem>
            <ElFormItem label="外链地址" prop="link" v-else>
              <ElInput v-model="formData.link" placeholder="外链地址"></ElInput>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="图标" prop="icon">
              <ArtIconSelector v-model="formData.icon" :iconType="iconType" width="100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="排序" prop="sort" style="width: 100%">
              <ElInputNumber
                v-model="formData.sort"
                style="width: 100%"
                :min="1"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20" v-if="!isDirectory">
          <ElCol :span="6">
            <ElFormItem label="是否启用" prop="isEnable">
              <ElSwitch v-model="formData.isEnable"></ElSwitch>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="是否外链" prop="isLink">
              <ElSwitch v-model="formData.isLink"></ElSwitch>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="页面缓存" prop="keepAlive">
              <ElSwitch v-model="formData.keepAlive"></ElSwitch>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </template>

      <template v-if="menuType === 'button'">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="权限名称" prop="name">
              <ElInput v-model="formData.name" placeholder="权限名称"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="权限标识" prop="authMark">
              <ElInput v-model="formData.authMark" placeholder="权限标识"></ElInput>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="排序" prop="authSort" style="width: 100%">
              <ElInputNumber
                v-model="formData.authSort"
                style="width: 100%"
                :min="1"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否启用" prop="isEnable">
              <ElSwitch v-model="formData.isEnable"></ElSwitch>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </template>
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
  // 组件导入
  import ArtIconSelector from '@/components/base/art-icon-selector/index.vue'

  // Element Plus 组件和类型
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  // 枚举和类型
  import { IconTypeEnum } from '@/enums/appEnum'

  // API 服务
  import { MenuService } from '@/api/menuApi'

  // Store
  import { useMenuStore } from '@/store/modules/menu'

  // Vue 工具函数
  import { ref, reactive, computed, watch } from 'vue'

  defineOptions({ name: 'MenuDialog' })

  // Props 和 Emits
  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    menuData?: any
    parentId?: number
    isSubMenu?: boolean
    menuList?: any[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: []
  }>()

  // 响应式数据
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const menuType = ref('menu')
  const iconType = ref(IconTypeEnum.UNICODE)
  const isEdit = ref(false)

  const formData = reactive({
    id: 0,
    parentId: 0,
    name: '',
    path: '',
    link: '',
    icon: '',
    isEnable: true,
    sort: 1,
    keepAlive: false,
    isLink: false,
    authMark: '',
    authSort: 1
  })

  // 计算属性
  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    if (props.isSubMenu) {
      return '新建子菜单'
    }
    if (props.type === 'edit') {
      return `编辑${menuType.value === 'menu' ? '菜单' : '权限'}`
    }
    return '新建菜单'
  })

  const disableMenuType = computed(() => {
    if (isEdit.value && menuType.value === 'button') return true
    if (isEdit.value && menuType.value === 'menu') return true
    return false
  })

  // 判断是否为目录层级
  const isDirectory = computed(() => {
    if (menuType.value !== 'menu' || !props.menuData?.children) return false
    return props.menuData.children.some((child: any) => child.menuType !== 'button')
  })

  // 表单验证规则
  const rules = computed<FormRules>(() => {
    const baseRules: FormRules = {}
    baseRules.name = [{ required: true, message: '请输入名称', trigger: 'blur' }]
    if (menuType.value === 'menu') {
      if (formData.isLink) {
        baseRules.link = [{ required: true, message: '请输入外链地址', trigger: 'blur' }]
      } else {
        baseRules.path = [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
      }
    } else {
      baseRules.authMark = [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
    }

    return baseRules
  })

  // 初始化表单数据
  const initFormData = () => {
    if (props.type === 'edit' && props.menuData) {
      isEdit.value = true
      const row = props.menuData
      const menuTypeValue = row.menuType || 'menu'
      menuType.value = menuTypeValue

      if (menuTypeValue === 'menu') {
        formData.id = row.id || 0
        formData.parentId = row.parentId || 0
        formData.name = row.name || ''
        formData.path = row.path || ''
        formData.link = row.link || ''
        formData.icon = row.icon || ''
        formData.sort = row.sort || 1
        formData.keepAlive = row.isKeepAlive
        formData.isEnable = row.isEnable
        formData.isLink = row.isLink
      } else {
        formData.id = row.id || 0
        formData.name = row.name || ''
        formData.authMark = row.authMark || ''
        formData.authSort = row.sort || 1
        formData.isEnable = row.isEnable
      }
    } else {
      isEdit.value = false
      // 先重置表单
      resetForm()
      // 然后设置父菜单ID(如果是新增子菜单)
      if (props.isSubMenu && props.menuData) {
        formData.parentId = props.menuData.id || 0
        menuType.value = 'menu'
      } else if (props.parentId) {
        formData.parentId = props.parentId
      }
    }
  }

  // 重置表单
  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(formData, {
      id: 0,
      parentId: 0,
      name: '',
      path: '',
      link: '',
      icon: '',
      sort: 1,
      isEnable: true,
      keepAlive: false,
      isLink: false,
      authMark: '',
      authSort: 1
    })
  }

  // 监听弹窗显示状态
  watch(
    () => [props.visible, props.type, props.menuData, props.parentId, props.isSubMenu],
    () => {
      if (props.visible) {
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
          if (isEdit.value) {
            const menuId = formData.id || 0
            const updateData = {
              name: formData.name,
              path: menuType.value === 'button' ? null : formData.isLink ? null : formData.path,
              icon: menuType.value === 'button' ? null : formData.icon,
              sort: menuType.value === 'button' ? formData.authSort : formData.sort,
              isKeepAlive: formData.keepAlive,
              link: menuType.value === 'button' ? null : formData.isLink ? formData.link : null,
              isLink: menuType.value === 'button' ? false : formData.isLink,
              isEnable: formData.isEnable,
              menuType: menuType.value,
              authMark: menuType.value === 'button' ? formData.authMark : null
            }

            await MenuService.updateMenu(menuId, updateData)
            ElMessage.success(`编辑成功`)
          } else {
            const createData = {
              name: formData.name,
              path: menuType.value === 'button' ? '' : formData.isLink ? null : formData.path,
              icon: menuType.value === 'button' ? null : formData.icon,
              sort: menuType.value === 'button' ? formData.authSort : formData.sort,
              isKeepAlive: formData.keepAlive,
              link: menuType.value === 'button' ? null : formData.isLink ? formData.link : null,
              isLink: menuType.value === 'button' ? false : formData.isLink,
              isEnable: formData.isEnable,
              menuType: menuType.value,
              parentId: formData.parentId > 0 ? formData.parentId : null,
              authMark: menuType.value === 'button' ? formData.authMark : null
            }

            await MenuService.createMenu(createData)
            ElMessage.success('新增成功')
          }

          // 同步更新左侧菜单列表
          const menuStore = useMenuStore()
          await menuStore.fetchMenuList()

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
