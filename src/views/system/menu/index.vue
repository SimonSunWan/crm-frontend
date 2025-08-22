<template>
  <div class="menu-page art-full-height">
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    ></ArtSearchBar>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :showZebra="false" v-model:columns="columnChecks" @refresh="handleRefresh">
        <template #left>
          <ElButton v-auth="'add'" @click="showModel('menu', null, true)" v-ripple>
            添加菜单
          </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
          <ElButton v-if="hasAuth('add')" @click="showModel('menu', null, true)" v-ripple>
            添加菜单
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      />

      <ElDialog :title="dialogTitle" v-model="dialogVisible" width="700px" align-center>
        <ElForm ref="formRef" :model="form" :rules="rules" label-width="85px">
          <ElFormItem label="类型">
            <ElRadioGroup v-model="labelPosition" :disabled="disableMenuType">
              <ElRadioButton value="menu" label="menu">菜单</ElRadioButton>
              <ElRadioButton value="button" label="button">权限</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>

          <template v-if="labelPosition === 'menu'">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="名称" prop="name">
                  <ElInput v-model="form.name" placeholder="名称"></ElInput>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="路由地址" prop="path">
                  <ElInput v-model="form.path" placeholder="路由地址"></ElInput>
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="图标" prop="icon">
                  <ArtIconSelector v-model="form.icon" :iconType="iconType" width="100%" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="外部链接" prop="link">
                  <ElInput
                    v-model="form.link"
                    placeholder="外部链接/内嵌地址(https://www.baidu.com)"
                  ></ElInput>
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="排序" prop="sort" style="width: 100%">
                  <ElInputNumber
                    v-model="form.sort"
                    style="width: 100%"
                    @change="handleChange"
                    :min="1"
                    controls-position="right"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="6">
                <ElFormItem label="是否启用" prop="isEnable">
                  <ElSwitch v-model="form.isEnable"></ElSwitch>
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="页面缓存" prop="keepAlive">
                  <ElSwitch v-model="form.keepAlive"></ElSwitch>
                </ElFormItem>
              </ElCol>
              <ElCol :span="6">
                <ElFormItem label="是否内嵌" prop="isMenu">
                  <ElSwitch v-model="form.isIframe"></ElSwitch>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </template>

          <template v-if="labelPosition === 'button'">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="名称" prop="authName">
                  <ElInput v-model="form.authName" placeholder="名称"></ElInput>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="权限标识" prop="authLabel">
                  <ElInput v-model="form.authLabel" placeholder="权限标识"></ElInput>
                </ElFormItem>
              </ElCol>
            </ElRow>
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="排序" prop="authSort" style="width: 100%">
                  <ElInputNumber
                    v-model="form.authSort"
                    style="width: 100%"
                    @change="handleChange"
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
            <ElButton type="primary" @click="submitForm()">确 定</ElButton>
          </span>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useMenuStore } from '@/store/modules/menu'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { formatMenuTitle } from '@/router/utils/utils'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/composables/useTableColumns'
  import { ElButton } from 'element-plus'
  import { AppRouteRecord } from '@/types/router'
  import { useAuth } from '@/composables/useAuth'
  import { getMenus, createMenu, updateMenu, deleteMenu, convertMenuToRoute } from '@/api/menuApi'

  defineOptions({ name: 'Menus' })

  const { hasAuth } = useAuth()

  const { menuList } = storeToRefs(useMenuStore())

  const loading = ref(false)

  const initialSearchState = {
    name: '',
    route: ''
  }

  const formFilters = reactive({ ...initialSearchState })

  const appliedFilters = reactive({ ...initialSearchState })

  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getTableData()
  }

  const handleSearch = () => {
    Object.assign(appliedFilters, { ...formFilters })
    getTableData()
  }

  const formItems = computed(() => [
    {
      label: '名称',
      key: 'name',
      type: 'input',
      props: {
        clearable: true
      }
    },
    {
      label: '路由地址',
      key: 'route',
      type: 'input',
      props: {
        clearable: true
      }
    }
  ])

  const buildMenuTypeTag = (row: AppRouteRecord) => {
    if (row.meta?.originalMenuType === 'button') {
      return 'danger'
    }

    if (row.children && row.children.length > 0) {
      const hasRealMenu = row.children.some(
        (child: AppRouteRecord) => child.meta?.originalMenuType !== 'button'
      )
      return hasRealMenu ? 'info' : 'primary'
    }

    if (row.meta?.link && row.meta?.isIframe) {
      return 'success'
    } else if (row.path) {
      return 'primary'
    } else if (row.meta?.link) {
      return 'warning'
    }

    return 'primary'
  }

  const buildMenuTypeText = (row: AppRouteRecord) => {
    if (row.meta?.originalMenuType === 'button') {
      return '权限'
    }

    if (row.children && row.children.length > 0) {
      const hasRealMenu = row.children.some(
        (child: AppRouteRecord) => child.meta?.originalMenuType !== 'button'
      )
      return hasRealMenu ? '目录' : '菜单'
    } else if (row.meta?.link && row.meta?.isIframe) {
      return '内嵌'
    } else if (row.path) {
      return '菜单'
    } else if (row.meta?.link) {
      return '外链'
    }
  }

  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'meta.title',
      label: '名称',
      minWidth: 120,
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.originalMenuType === 'button') {
          return row.meta?.originalAuthName || row.meta?.title || ''
        }
        return formatMenuTitle(row.meta?.title)
      }
    },
    {
      prop: 'type',
      label: '类型',
      formatter: (row: AppRouteRecord) => {
        return h(ElTag, { type: buildMenuTypeTag(row) }, () => buildMenuTypeText(row))
      }
    },
    {
      prop: 'path',
      label: '路由地址',
      formatter: (row: AppRouteRecord) => {
        return row.path || ''
      }
    },
    {
      prop: 'authMark',
      label: '权限标识',
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.originalMenuType === 'button') {
          return row.meta?.originalAuthMark || ''
        }
        return row.meta?.originalAuthMark || row.meta?.authMark || ''
      }
    },
    {
      prop: 'meta.icon',
      label: '图标',
      width: 80,
      formatter: (row: AppRouteRecord) => {
        if (!row.meta?.icon) return '-'
        const iconText = row.meta.icon.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        return h('i', { class: 'iconfont-sys' }, iconText)
      }
    },
    {
      prop: 'meta.sort',
      label: '排序',
      width: 80,
      formatter: (row: AppRouteRecord) => {
        return row.meta?.sort || 1
      }
    },
    {
      prop: 'meta.isEnable',
      label: '状态',
      width: 80,
      formatter: (row: AppRouteRecord) => {
        return h(ElTag, { type: row.meta?.isEnable ? 'success' : 'danger' }, () =>
          row.meta?.isEnable ? '启用' : '禁用'
        )
      }
    },

    {
      prop: 'operation',
      label: '操作',
      width: 180,
      formatter: (row: AppRouteRecord) => {
        return h('div', [
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => showModel('menu', row, true)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showDialog('edit', row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteMenu(row)
          })
        ])
      }
    }
  ])

  const handleRefresh = () => {
    getTableData()
  }

  const dialogVisible = ref(false)
  const form = reactive({
    id: 0,
    parentId: 0,
    name: '',
    path: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    link: '',
    isIframe: false,
    authName: '',
    authLabel: '',
    authIcon: '',
    authSort: 1
  })
  const iconType = ref(IconTypeEnum.UNICODE)

  const labelPosition = ref('menu')
  const rules = computed<FormRules>(() => {
    const baseRules: FormRules = {}

    if (labelPosition.value === 'menu') {
      baseRules.name = [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ]
      baseRules.path = [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
    } else {
      baseRules.authName = [{ required: true, message: '请输入名称', trigger: 'blur' }]
      baseRules.authLabel = [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
    }

    return baseRules
  })

  const tableData = ref<AppRouteRecord[]>([])

  onMounted(() => {
    getTableData()
  })

  const getTableData = async () => {
    loading.value = true
    try {
      const params: any = {
        current: 1,
        size: 100
      }

      if (appliedFilters.name && appliedFilters.name.trim()) {
        params.name = appliedFilters.name.trim()
      }

      if (appliedFilters.route && appliedFilters.route.trim()) {
        params.path = appliedFilters.route.trim()
      }

      const response = await getMenus(params)
      if (response.records) {
        tableData.value = response.records.map(convertMenuToRoute)
      } else {
        tableData.value = []
      }
    } catch {
      ElMessage.error('获取菜单数据失败')
      tableData.value = menuList.value
    } finally {
      loading.value = false
    }
  }

  const isEdit = ref(false)
  const formRef = ref<FormInstance>()
  const dialogTitle = ref('新建菜单')

  const showDialog = (type: string, row: AppRouteRecord) => {
    showModel(type, row, false)
  }

  const handleChange = () => {}

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async valid => {
      if (valid) {
        try {
          loading.value = true

          if (isEdit.value) {
            const menuId = form.id || 0
            const updateData = {
              name: form.name,
              path: form.path,
              title: form.name,
              icon: form.icon,
              sort: form.sort,
              is_keep_alive: form.keepAlive,
              is_iframe: form.isIframe,
              link: form.link,
              is_enable: form.isEnable,
              menu_type: labelPosition.value,
              auth_name: form.authName,
              auth_mark: form.authLabel,
              auth_sort: form.authSort
            }

            await updateMenu(menuId, updateData)
            ElMessage.success('编辑成功')
          } else {
            const createData = {
              name: labelPosition.value === 'button' ? form.authName : form.name,
              path: labelPosition.value === 'button' ? '' : form.path,
              title: labelPosition.value === 'button' ? form.authName : form.name,
              component: labelPosition.value === 'button' ? '' : form.path,
              icon: form.icon,
              sort: labelPosition.value === 'button' ? form.authSort : form.sort,
              is_keep_alive: form.keepAlive,
              is_iframe: form.isIframe,
              link: form.link,
              is_enable: form.isEnable,
              menu_type: labelPosition.value,
              parent_id: form.parentId > 0 ? form.parentId : undefined,
              auth_name: form.authName,
              auth_mark: form.authLabel,
              auth_sort: form.authSort
            }

            await createMenu(createData)
            const itemType = labelPosition.value === 'button' ? '权限' : '菜单'
            ElMessage.success(`新增${itemType}成功`)
          }

          dialogVisible.value = false
          getTableData()
        } catch {
          const itemType = labelPosition.value === 'button' ? '权限' : '菜单'
          ElMessage.error(`${isEdit.value ? '编辑' : '新增'}${itemType}失败`)
        } finally {
          loading.value = false
        }
      }
    })
  }

  const showModel = (type: string, row?: any, isSubMenu: boolean = false) => {
    dialogVisible.value = true
    isEdit.value = false
    lockMenuType.value = false
    resetForm()

    if (isSubMenu && row) {
      form.parentId = row.id
      dialogTitle.value = `新建子菜单 - ${row.meta?.title || row.title || '菜单'}`
      labelPosition.value = 'menu'
    } else if (row && type === 'edit') {
      isEdit.value = true

      const menuType = row.meta?.originalMenuType || 'menu'
      labelPosition.value = menuType

      dialogTitle.value = `编辑${menuType === 'menu' ? '菜单' : '权限'}`

      if (menuType === 'menu') {
        form.id = row.id || 0
        form.parentId = row.meta?.originalParentId || 0
        form.name = row.meta?.originalTitle || row.meta?.title || ''
        form.path = row.path || ''
        form.icon = row.meta?.originalIcon || row.meta?.icon || ''
        form.sort = row.meta?.originalSort || row.meta?.sort || 1
        form.isMenu = true
        form.keepAlive =
          row.meta?.originalIsKeepAlive !== undefined
            ? row.meta.originalIsKeepAlive
            : row.meta?.keepAlive !== undefined
              ? row.meta.keepAlive
              : true
        form.isEnable =
          row.meta?.originalIsEnable !== undefined
            ? row.meta.originalIsEnable
            : row.meta?.isEnable !== undefined
              ? row.meta.isEnable
              : true
        form.link = row.meta?.originalLink || row.meta?.link || ''
        form.isIframe =
          row.meta?.originalIsIframe !== undefined
            ? row.meta.originalIsIframe
            : row.meta?.isIframe !== undefined
              ? row.meta.isIframe
              : false
      } else {
        form.id = row.id || 0
        form.authName = row.meta?.originalAuthName || row.meta?.title || ''
        form.authLabel = row.meta?.originalAuthMark || ''
        form.authIcon = row.meta?.originalIcon || row.meta?.icon || ''
        form.authSort = row.meta?.originalAuthSort || row.meta?.sort || 1
      }
    } else {
      dialogTitle.value = '新建菜单'
      labelPosition.value = 'menu'
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
      id: 0,
      parentId: 0,
      name: '',
      path: '',
      icon: '',
      sort: 1,
      isMenu: true,
      keepAlive: true,
      link: '',
      isIframe: false,
      authName: '',
      authLabel: '',
      authIcon: '',
      authSort: 1
    })
  }

  const handleDeleteMenu = async (row?: AppRouteRecord) => {
    try {
      const isButton = row?.meta?.originalMenuType === 'button'
      const itemType = isButton ? '权限' : '菜单'

      await ElMessageBox.confirm(`确定要删除该${itemType}吗？删除后无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      if (row && row.id) {
        loading.value = true
        await deleteMenu(row.id)
        const isButton = row?.meta?.originalMenuType === 'button'
        const itemType = isButton ? '权限' : '菜单'
        ElMessage.success(`删除${itemType}成功`)
        getTableData()
      }
    } catch (error) {
      if (error !== 'cancel') {
        const isButton = row?.meta?.originalMenuType === 'button'
        const itemType = isButton ? '权限' : '菜单'
        ElMessage.error(`删除${itemType}失败`)
      }
    } finally {
      loading.value = false
    }
  }

  const disableMenuType = computed(() => {
    if (isEdit.value && labelPosition.value === 'button') return true
    if (isEdit.value && labelPosition.value === 'menu') return true
    if (!isEdit.value && labelPosition.value === 'menu' && lockMenuType.value) return true
    return false
  })

  const lockMenuType = ref(false)

  const isExpanded = ref(false)
  const tableRef = ref()

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value && tableData.value) {
        const processRows = (rows: AppRouteRecord[]) => {
          rows.forEach(row => {
            if (row.children && row.children.length > 0) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(tableData.value)
      }
    })
  }
</script>

<style lang="scss" scoped>
  .menu-page {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }

    :deep(.small-btn) {
      height: 30px !important;
      padding: 0 10px !important;
      font-size: 12px !important;
    }
  }
</style>
