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
          <ElFormItem label="菜单类型">
            <ElRadioGroup v-model="labelPosition" :disabled="disableMenuType">
              <ElRadioButton value="menu" label="menu">菜单</ElRadioButton>
              <ElRadioButton value="button" label="button">权限</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>

          <template v-if="labelPosition === 'menu'">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="菜单名称" prop="name">
                  <ElInput v-model="form.name" placeholder="菜单名称"></ElInput>
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
                <ElFormItem label="权限标识" prop="label">
                  <ElInput v-model="form.label" placeholder="权限标识"></ElInput>
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="图标" prop="icon">
                  <ArtIconSelector v-model="form.icon" :iconType="iconType" width="100%" />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="菜单排序" prop="sort" style="width: 100%">
                  <ElInputNumber
                    v-model="form.sort"
                    style="width: 100%"
                    @change="handleChange"
                    :min="1"
                    controls-position="right"
                  />
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
              <ElCol :span="5">
                <ElFormItem label="是否启用" prop="isEnable">
                  <ElSwitch v-model="form.isEnable"></ElSwitch>
                </ElFormItem>
              </ElCol>
              <ElCol :span="5">
                <ElFormItem label="页面缓存" prop="keepAlive">
                  <ElSwitch v-model="form.keepAlive"></ElSwitch>
                </ElFormItem>
              </ElCol>
              <ElCol :span="5">
                <ElFormItem label="是否显示" prop="isHide">
                  <ElSwitch v-model="form.isHide"></ElSwitch>
                </ElFormItem>
              </ElCol>
              <ElCol :span="5">
                <ElFormItem label="是否内嵌" prop="isMenu">
                  <ElSwitch v-model="form.isIframe"></ElSwitch>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </template>

          <template v-if="labelPosition === 'button'">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="权限名称" prop="authName">
                  <ElInput v-model="form.authName" placeholder="权限名称"></ElInput>
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
                <ElFormItem label="权限排序" prop="authSort" style="width: 100%">
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
      label: '菜单名称',
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

  // 构建菜单类型标签
  const buildMenuTypeTag = (row: AppRouteRecord) => {
    if (row.children && row.children.length > 0) {
      return 'info'
    } else if (row.meta?.link && row.meta?.isIframe) {
      return 'success'
    } else if (row.path) {
      return 'primary'
    } else if (row.meta?.link) {
      return 'warning'
    }
  }

  // 构建菜单类型文本
  const buildMenuTypeText = (row: AppRouteRecord) => {
    if (row.children && row.children.length > 0) {
      return '目录'
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
      label: '菜单名称',
      minWidth: 120,
      formatter: (row: AppRouteRecord) => {
        return formatMenuTitle(row.meta?.title)
      }
    },
    {
      prop: 'type',
      label: '菜单类型',
      formatter: (row: AppRouteRecord) => {
        return h(ElTag, { type: buildMenuTypeTag(row) }, () => buildMenuTypeText(row))
      }
    },
    {
      prop: 'path',
      label: '路由',
      formatter: (row: AppRouteRecord) => {
        return row.meta?.link || row.path || ''
      }
    },
    {
      prop: 'meta.icon',
      label: '图标',
      width: 80,
      formatter: (row: AppRouteRecord) => {
        return row.meta?.icon ? h('i', { class: row.meta.icon }) : '-'
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
      prop: 'date',
      label: '编辑时间',
      formatter: () => '2022-3-12 12:00:00'
    },
    {
      prop: 'status',
      label: '隐藏菜单',
      formatter: row => {
        return h(ElTag, { type: row.meta.isHide ? 'danger' : 'info' }, () =>
          row.meta.isHide ? '是' : '否'
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
    label: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    isHide: true,
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
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    label: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    // 修改这部分
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authLabel: [{ required: true, message: '请输入权限权限标识', trigger: 'blur' }]
  })

  const tableData = ref<AppRouteRecord[]>([])

  onMounted(() => {
    getTableData()
  })

  const getTableData = async () => {
    loading.value = true
    try {
      const response = await getMenus()
      if (response.records) {
        // 转换后端数据为前端格式（保持树形结构）
        tableData.value = response.records.map(convertMenuToRoute)
      } else {
        tableData.value = []
      }
    } catch (error) {
      console.error(error)
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
    showModel('menu', row, true)
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
              is_hide: form.isHide,
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
            // 新增菜单
            const createData = {
              name: form.name,
              path: form.path,
              title: form.name,
              icon: form.icon,
              sort: form.sort,
              is_hide: form.isHide,
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
            ElMessage.success('新增成功')
          }

          dialogVisible.value = false
          getTableData() // 刷新数据
        } catch (error) {
          console.error(error)
          ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败`)
        } finally {
          loading.value = false
        }
      }
    })
  }

  const showModel = (type: string, row?: any, isSubMenu: boolean = false) => {
    dialogVisible.value = true
    labelPosition.value = type
    isEdit.value = false
    lockMenuType.value = false
    resetForm()

    if (isSubMenu && row) {
      // 创建子菜单，设置父菜单ID
      form.parentId = row.id
      dialogTitle.value = `新建子菜单 - ${row.meta?.title || row.title || '菜单'}`
    } else if (row) {
      // 编辑现有菜单
      isEdit.value = true
      nextTick(() => {
        // 回显数据
        if (type === 'menu') {
          // 菜单数据回显
          form.id = row.id || 0
          form.parentId = row.parent_id || 0
          form.name = row.meta?.title || row.title || ''
          form.path = row.path || ''
          form.label = row.name || ''
          form.icon = row.meta?.icon || ''
          form.sort = row.meta?.sort || 1
          form.isMenu = true
          form.keepAlive = row.meta?.keepAlive || true
          form.isHide = row.meta?.isHide || false
          form.isEnable = row.meta?.isEnable || true
          form.link = row.meta?.link || ''
          form.isIframe = row.meta?.isIframe || false
        } else {
          // 权限按钮数据回显
          form.id = row.id || 0
          form.authName = row.auth_name || row.title || ''
          form.authLabel = row.auth_mark || ''
          form.authIcon = row.icon || ''
          form.authSort = row.auth_sort || row.sort || 1
        }
      })
    } else {
      // 新建顶级菜单
      dialogTitle.value = '新建菜单'
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
      label: '',
      icon: '',
      sort: 1,
      isMenu: true,
      keepAlive: true,
      isHide: true,
      link: '',
      isIframe: false,
      // 权限
      authName: '',
      authLabel: '',
      authIcon: '',
      authSort: 1
    })
  }

  const handleDeleteMenu = async (row?: AppRouteRecord) => {
    try {
      await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      if (row && row.id) {
        loading.value = true
        await deleteMenu(row.id)
        ElMessage.success('删除成功')
        getTableData() // 刷新数据
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 修改计算属性，增加锁定控制参数
  const disableMenuType = computed(() => {
    // 编辑权限时锁定为权限类型
    if (isEdit.value && labelPosition.value === 'button') return true
    // 编辑菜单时锁定为菜单类型
    if (isEdit.value && labelPosition.value === 'menu') return true
    // 顶部添加菜单按钮时锁定为菜单类型
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
