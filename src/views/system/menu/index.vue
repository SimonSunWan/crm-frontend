<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    ></ArtSearchBar>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader :showZebra="false" v-model:columns="columnChecks" @refresh="handleRefresh">
        <template #left>
          <!-- 按钮权限：后端控制模式，使用自定义指令 -->
          <ElButton v-auth="'add'" @click="showModel('menu', null, true)" v-ripple>
            添加菜单
          </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
          <!-- 按钮权限：前端控制模式，使用 hasAuth 方法 -->
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

  // 定义表单搜索初始值
  const initialSearchState = {
    name: '',
    route: ''
  }

  // 响应式表单数据
  const formFilters = reactive({ ...initialSearchState })

  // 增加实际应用的搜索条件状态
  const appliedFilters = reactive({ ...initialSearchState })

  // 重置表单
  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getTableData()
  }

  // 搜索处理
  const handleSearch = () => {
    // 将当前输入的筛选条件应用到实际搜索
    Object.assign(appliedFilters, { ...formFilters })
    getTableData()
  }

  // 表单配置项
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

  // 构建类型标签
  const buildMenuTypeTag = (row: AppRouteRecord) => {
    // 检查是否为权限按钮
    if (row.meta?.originalMenuType === 'button') {
      return 'danger' // 权限按钮使用红色
    }

    // 检查是否有子菜单
    if (row.children && row.children.length > 0) {
      const hasRealMenu = row.children.some(
        (child: AppRouteRecord) => child.meta?.originalMenuType !== 'button'
      )
      return hasRealMenu ? 'info' : 'primary' // 目录用蓝色，只有权限的子菜单用主色
    }

    // 其他类型
    if (row.meta?.link && row.meta?.isIframe) {
      return 'success' // 内嵌链接用绿色
    } else if (row.path) {
      return 'primary' // 普通菜单用主色
    } else if (row.meta?.link) {
      return 'warning' // 外链用橙色
    }

    return 'primary' // 默认用主色
  }

  // 构建类型文本
  const buildMenuTypeText = (row: AppRouteRecord) => {
    // 检查是否为权限按钮
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

  // 动态列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'meta.title',
      label: '名称',
      minWidth: 120,
      formatter: (row: AppRouteRecord) => {
        // 如果是权限按钮，显示名称
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
        // 如果是权限按钮，显示权限标识
        if (row.meta?.originalMenuType === 'button') {
          return row.meta?.originalAuthMark || ''
        }
        // 如果是菜单，显示菜单的权限标识
        return row.meta?.originalAuthMark || row.meta?.authMark || ''
      }
    },
    {
      prop: 'meta.icon',
      label: '图标',
      width: 80,
      formatter: (row: AppRouteRecord) => {
        if (!row.meta?.icon) return '-'
        // 将HTML实体编码转换为实际的Unicode字符
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
            onClick: () => showModel('menu', row, true) // 添加子菜单
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
    parentId: 0, // 父菜单ID
    // 菜单
    name: '',
    path: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    link: '',
    isIframe: false,
    // 权限 (修改这部分)
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
      // 构建筛选参数
      const params: any = {
        current: 1,
        size: 100
      }

      // 添加名称筛选
      if (appliedFilters.name && appliedFilters.name.trim()) {
        params.name = appliedFilters.name.trim()
      }

      // 添加路由地址筛选
      if (appliedFilters.route && appliedFilters.route.trim()) {
        params.path = appliedFilters.route.trim()
      }

      const response = await getMenus(params)
      if (response.records) {
        // 转换后端数据为前端格式（保持树形结构）
        tableData.value = response.records.map(convertMenuToRoute)
      } else {
        tableData.value = []
      }
    } catch {
      ElMessage.error('获取菜单数据失败')
      // 回退到store中的数据
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
            // 编辑菜单
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
            // 新增菜单或权限按钮
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
              parent_id: form.parentId > 0 ? form.parentId : undefined, // 添加父菜单ID
              auth_name: form.authName,
              auth_mark: form.authLabel,
              auth_sort: form.authSort
            }

            await createMenu(createData)
            const itemType = labelPosition.value === 'button' ? '权限' : '菜单'
            ElMessage.success(`新增${itemType}成功`)
          }

          dialogVisible.value = false
          getTableData() // 刷新数据
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
      // 创建子菜单，设置父菜单ID
      form.parentId = row.id
      dialogTitle.value = `新建子菜单 - ${row.meta?.title || row.title || '菜单'}`
      labelPosition.value = 'menu'
    } else if (row && type === 'edit') {
      // 编辑现有菜单
      isEdit.value = true

      // 根据类型设置标签位置
      const menuType = row.meta?.originalMenuType || 'menu'
      labelPosition.value = menuType

      // 设置对话框标题
      dialogTitle.value = `编辑${menuType === 'menu' ? '菜单' : '权限'}`

      // 回显数据
      if (menuType === 'menu') {
        // 菜单数据回显
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
        // 权限按钮数据回显
        form.id = row.id || 0
        form.authName = row.meta?.originalAuthName || row.meta?.title || ''
        form.authLabel = row.meta?.originalAuthMark || ''
        form.authIcon = row.meta?.originalIcon || row.meta?.icon || ''
        form.authSort = row.meta?.originalAuthSort || row.meta?.sort || 1
      }
    } else {
      // 新建顶级菜单
      dialogTitle.value = '新建菜单'
      labelPosition.value = 'menu'
    }
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
      id: 0,
      parentId: 0, // 重置父菜单ID
      // 菜单
      name: '',
      path: '',
      icon: '',
      sort: 1,
      isMenu: true,
      keepAlive: true,
      link: '',
      isIframe: false,
      // 权限按钮
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
        getTableData() // 刷新数据
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

  // 修改计算属性，增加锁定控制参数
  const disableMenuType = computed(() => {
    // 编辑权限时锁定为权限类型
    if (isEdit.value && labelPosition.value === 'button') return true
    // 编辑菜单时锁定为类型
    if (isEdit.value && labelPosition.value === 'menu') return true
    // 顶部添加菜单按钮时锁定为类型
    if (!isEdit.value && labelPosition.value === 'menu' && lockMenuType.value) return true
    return false
  })

  // 添加一个控制变量
  const lockMenuType = ref(false)

  const isExpanded = ref(false)
  const tableRef = ref()

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value && tableData.value) {
        // 递归处理所有行的展开/收起状态
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
