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
            <ElFormItem label="权限名称" prop="authName">
              <ElInput v-model="formData.authName" placeholder="权限名称"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="权限标识" prop="authLabel">
              <ElInput v-model="formData.authLabel" placeholder="权限标识"></ElInput>
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
    authName: '',
    authLabel: '',
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
    if (props.menuData && props.menuData.children && props.menuData.children.length > 0) {
      return true
    }
    return false
  })

  // 判断目录是否应该禁用（所有子菜单都禁用时）
  const shouldDisableDirectory = computed(() => {
    if (!isDirectory.value || !props.menuData?.children) {
      return false
    }

    // 检查是否所有子菜单都禁用
    const allChildrenDisabled = props.menuData.children.every((child: any) => {
      return child.isEnable === false
    })

    return allChildrenDisabled
  })

  // 获取菜单的启用状态
  const getMenuEnableStatus = (menu: any): boolean => {
    return menu.isEnable !== undefined ? Boolean(menu.isEnable) : true
  }

  // 更新菜单启用状态
  const updateMenuEnableStatus = async (menuId: number, isEnable: boolean) => {
    await MenuService.updateMenu(menuId, { isEnable })
  }

  // 在菜单列表中查找指定ID的菜单
  const findMenuById = (menus: any[], targetId: number): any | null => {
    for (const menu of menus) {
      if (menu.id === targetId) {
        return menu
      }
      if (menu.children && menu.children.length > 0) {
        const found = findMenuById(menu.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  // 检查直接子菜单是否都禁用（不递归检查孙菜单）
  const areAllChildrenDisabled = (
    children: any[],
    excludeChildId?: number,
    excludeChildStatus?: boolean
  ): boolean => {
    return children.every((child: any) => {
      if (excludeChildId && child.id === excludeChildId) {
        return !excludeChildStatus
      }
      return child.isEnable === false
    })
  }

  // 更新菜单状态并递归检查父级
  const updateMenuStatusAndCheckParent = async (
    menuList: any[],
    menuId: number,
    shouldDisable: boolean
  ) => {
    const menu = findMenuById(menuList, menuId)
    if (!menu) return

    const currentStatus = getMenuEnableStatus(menu)
    if (currentStatus === !shouldDisable) return

    await updateMenuEnableStatus(menuId, !shouldDisable)

    // 递归检查父级菜单
    const parentId = menu?.parentId
    if (parentId && parentId > 0) {
      await checkAndUpdateParentMenuStatus(parentId, menuList)
    }
  }

  // 检查并更新父级菜单状态（递归函数）
  const checkAndUpdateParentMenuStatus = async (parentId: number, currentMenuList: any[]) => {
    try {
      const parentMenu = findMenuById(currentMenuList, parentId)
      if (!parentMenu?.children) return

      // 检查父级菜单的所有直接子菜单是否都禁用
      const shouldDisableParent = areAllChildrenDisabled(parentMenu.children)
      const currentParentStatus = getMenuEnableStatus(parentMenu)

      if (currentParentStatus !== !shouldDisableParent) {
        await updateMenuEnableStatus(parentId, !shouldDisableParent)

        // 继续检查更上层的父级菜单
        const grandParentId = parentMenu?.parentId
        if (grandParentId && grandParentId > 0) {
          await checkAndUpdateParentMenuStatus(grandParentId, currentMenuList)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 检查并更新父级菜单变成目录后的状态（新增子菜单时调用）
  const checkAndUpdateParentBecomeDirectory = async (menuList: any[], newChildStatus: boolean) => {
    const parentId = formData.parentId
    if (!parentId || parentId === 0) return

    try {
      // 重新获取最新菜单列表，确保包含新增的子菜单
      const latestMenuResponse = await MenuService.getMenus()
      const latestMenuList = latestMenuResponse || []

      const parentMenu = findMenuById(latestMenuList, parentId)
      if (!parentMenu) return

      const hasChildren = parentMenu.children && parentMenu.children.length > 0
      const shouldDisableParent = hasChildren
        ? areAllChildrenDisabled(parentMenu.children || [])
        : !newChildStatus

      await updateMenuStatusAndCheckParent(latestMenuList, parentId, shouldDisableParent)
    } catch (error) {
      console.error(error)
    }
  }

  // 检查并更新指定菜单的状态（编辑子菜单时调用）
  const checkAndUpdateMenuStatus = async (
    menuList: any[],
    targetMenuId: number,
    changedChildId: number,
    changedChildNewStatus: boolean
  ) => {
    if (!targetMenuId || targetMenuId === 0) return

    try {
      const targetMenu = findMenuById(menuList, targetMenuId)
      if (!targetMenu?.children) return

      const shouldDisableTarget = areAllChildrenDisabled(
        targetMenu.children,
        changedChildId,
        changedChildNewStatus
      )

      await updateMenuStatusAndCheckParent(menuList, targetMenuId, shouldDisableTarget)
    } catch (error) {
      console.error(error)
    }
  }

  // 表单验证规则
  const rules = computed<FormRules>(() => {
    const baseRules: FormRules = {}

    if (menuType.value === 'menu') {
      baseRules.name = [{ required: true, message: '请输入名称', trigger: 'blur' }]
      if (formData.isLink) {
        baseRules.link = [{ required: true, message: '请输入外链地址', trigger: 'blur' }]
      } else {
        baseRules.path = [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
      }
    } else {
      baseRules.authName = [{ required: true, message: '请输入名称', trigger: 'blur' }]
      baseRules.authLabel = [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
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
        formData.icon = row.icon || ''
        formData.sort = row.sort || 1
        formData.keepAlive = row.isKeepAlive !== undefined ? row.isKeepAlive : true
        formData.isEnable = row.isEnable !== undefined ? row.isEnable : true

        // 根据是否为外链来设置字段
        const isLink = row.isLink !== undefined ? row.isLink : false

        formData.isLink = isLink
        if (isLink) {
          formData.link = row.link || ''
          formData.path = ''
        } else {
          formData.path = row.path || ''
          formData.link = ''
        }
      } else {
        formData.id = row.id || 0
        formData.authName = row.name || ''
        formData.authLabel = row.authMark || ''
        formData.authSort = row.sort || 1
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
      authName: '',
      authLabel: '',
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
              path: formData.isLink ? undefined : formData.path,
              icon: formData.icon,
              sort: formData.sort,
              isKeepAlive: isDirectory.value ? false : formData.keepAlive,
              link: formData.isLink ? formData.link : undefined,
              isLink: formData.isLink,
              isEnable: isDirectory.value ? !shouldDisableDirectory.value : formData.isEnable,
              menuType: menuType.value,
              authMark: formData.authLabel
            }

            await MenuService.updateMenu(menuId, updateData)
            ElMessage.success(`编辑成功`)

            // 如果是子菜单，检查并更新父级目录状态
            if (formData.parentId > 0 && props.menuList) {
              await checkAndUpdateMenuStatus(
                props.menuList,
                formData.parentId,
                formData.id,
                updateData.isEnable
              )
            }
          } else {
            const createData = {
              name: menuType.value === 'button' ? formData.authName : formData.name,
              path: menuType.value === 'button' ? '' : formData.isLink ? undefined : formData.path,
              icon: formData.icon,
              sort: menuType.value === 'button' ? formData.authSort : formData.sort,
              isKeepAlive: isDirectory.value ? false : formData.keepAlive,
              link:
                menuType.value === 'button'
                  ? undefined
                  : formData.isLink
                    ? formData.link
                    : undefined,
              isLink: menuType.value === 'button' ? false : formData.isLink,
              isEnable: isDirectory.value ? !shouldDisableDirectory.value : formData.isEnable,
              menuType: menuType.value,
              parentId: formData.parentId > 0 ? formData.parentId : undefined,
              authMark: formData.authLabel
            }

            await MenuService.createMenu(createData)
            ElMessage.success('新增成功')

            // 如果是子菜单，检查并更新父级菜单状态
            if (formData.parentId > 0 && props.menuList) {
              await checkAndUpdateParentBecomeDirectory(props.menuList, createData.isEnable)
            }
          }
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
