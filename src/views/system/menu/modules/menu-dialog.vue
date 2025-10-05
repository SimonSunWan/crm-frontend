<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="500px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="85px">
      <ElFormItem label="菜单类型">
        <ElRadioGroup v-model="menuType" :disabled="disableMenuType">
          <ElRadioButton value="menu" label="menu">菜单</ElRadioButton>
          <ElRadioButton value="button" label="button">权限</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>

      <template v-if="menuType === 'menu'">
        <ElFormItem label="菜单名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入菜单名称"></ElInput>
        </ElFormItem>

        <ElFormItem label="路由地址" prop="path" v-if="!formData.isLink">
          <ElInput v-model="formData.path" placeholder="请输入路由地址"></ElInput>
        </ElFormItem>
        <ElFormItem label="外链地址" prop="link" v-else>
          <ElInput v-model="formData.link" placeholder="请输入外链地址"></ElInput>
        </ElFormItem>

        <ElFormItem label="图标" prop="icon">
          <ArtIconSelector v-model="formData.icon" :iconType="iconType" width="100%" />
        </ElFormItem>

        <ElFormItem label="排序" prop="sort">
          <ElInputNumber
            v-model="formData.sort"
            style="width: 100%"
            :min="1"
            controls-position="right"
          />
        </ElFormItem>

        <ElFormItem label="是否启用" prop="isEnable" v-if="!isDirectory">
          <ElSwitch v-model="formData.isEnable"></ElSwitch>
        </ElFormItem>

        <ElFormItem label="是否外链" prop="isLink" v-if="!isDirectory">
          <ElSwitch v-model="formData.isLink"></ElSwitch>
        </ElFormItem>

        <ElFormItem label="页面缓存" prop="keepAlive" v-if="!isDirectory">
          <ElSwitch v-model="formData.keepAlive"></ElSwitch>
        </ElFormItem>
      </template>

      <template v-if="menuType === 'button'">
        <ElFormItem label="权限名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入权限名称"></ElInput>
        </ElFormItem>

        <ElFormItem label="权限标识" prop="authMark">
          <ElInput v-model="formData.authMark" placeholder="请输入权限标识"></ElInput>
        </ElFormItem>

        <ElFormItem label="排序" prop="authSort">
          <ElInputNumber
            v-model="formData.authSort"
            style="width: 100%"
            :min="1"
            controls-position="right"
          />
        </ElFormItem>

        <ElFormItem label="是否启用" prop="isEnable">
          <ElSwitch v-model="formData.isEnable"></ElSwitch>
        </ElFormItem>
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
  import ArtIconSelector from '@/components/base/art-icon-selector/index.vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { MenuService } from '@/api/menuApi'
  import { useMenuStore } from '@/store/modules/menu'
  import { ref, reactive, computed, watch } from 'vue'

  defineOptions({ name: 'MenuDialog' })

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

  const isDirectory = computed(() => {
    if (menuType.value !== 'menu' || !props.menuData?.children) return false
    return props.menuData.children.some((child: any) => child.menuType !== 'button')
  })

  const rules = computed<FormRules>(() => {
    const baseRules: FormRules = {}
    if (menuType.value === 'menu') {
      baseRules.name = [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
      if (formData.isLink) {
        baseRules.link = [{ required: true, message: '请输入外链地址', trigger: 'blur' }]
      } else {
        baseRules.path = [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
      }
    } else {
      baseRules.name = [{ required: true, message: '请输入权限名称', trigger: 'blur' }]
      baseRules.authMark = [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
    }

    return baseRules
  })

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
      resetForm()
      if (props.isSubMenu && props.menuData) {
        formData.parentId = props.menuData.id || 0
        menuType.value = 'menu'
      } else if (props.parentId) {
        formData.parentId = props.parentId
      }
    }
  }

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

  watch(
    () => [props.visible, props.type, props.menuData, props.parentId, props.isSubMenu],
    () => {
      if (props.visible) {
        initFormData()
      }
    },
    { immediate: true }
  )

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
