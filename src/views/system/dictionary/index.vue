<template>
  <div class="dictionary-page art-full-height">
    <!-- 左侧字典分类面板 -->
    <div class="left-panel">
      <ElCard class="art-table-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>字典分类</span>
            <ElButton @click="showTypeDialog('add')" v-ripple> 新增字典分类 </ElButton>
          </div>
        </template>

        <div class="search-type-section">
          <ElInput
            v-model="typeSearchKeyword"
            placeholder="请输入字典名称"
            clearable
            @input="filterTypes"
            class="search-input"
          />
        </div>

        <ArtTable
          :data="typeData"
          :columns="typeColumns"
          :loading="typeLoading"
          :pagination="typePagination"
          :pagination-options="{
            layout: 'prev, pager, next',
            pageSizes: [],
            hideOnSinglePage: false
          }"
          :row-class-name="getRowClassName"
          @row-click="selectType"
          @pagination:current-change="handleTypeCurrentChange"
        />
      </ElCard>
    </div>

    <!-- 右侧字典枚举面板 -->
    <div class="right-panel">
      <ElCard class="art-table-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>字典枚举</span>
            <div class="header-actions">
              <ElButton v-if="selectedType" @click="toggleExpand" v-ripple>
                {{ isExpanded ? '收起' : '展开' }}
              </ElButton>
              <DictionaryImport
                v-if="selectedType"
                :type-id="selectedType.id"
                :type-name="selectedType.name"
                @success="handleImportSuccess"
              />
              <ElButton v-if="selectedType" @click="showEnumDialog('add')" v-ripple>
                新增字典枚举
              </ElButton>
            </div>
          </div>
        </template>

        <ArtTable
          v-if="selectedType"
          ref="enumTableRef"
          :loading="enumLoading"
          :data="enumData"
          :columns="enumColumns"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          row-key="id"
          :pagination="{ current: 1, size: 1000, total: enumData.length }"
          :pagination-options="{
            layout: '',
            hideOnSinglePage: true
          }"
        />
        <div v-else class="no-selection">
          <p>请选择左侧字典分类</p>
        </div>
      </ElCard>
    </div>

    <!-- 字典分类弹窗 -->
    <TypeDialog
      v-model:visible="typeDialogVisible"
      :type="typeDialogType"
      :type-data="currentEditType || undefined"
      @submit="handleTypeDialogSubmit"
    />

    <!-- 字典枚举弹窗 -->
    <EnumDialog
      v-model:visible="enumDialogVisible"
      :type="enumDialogType"
      :type-data="selectedType || undefined"
      :enum-data="currentEditEnum || undefined"
      @submit="handleEnumDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick, onMounted, h } from 'vue'
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'
  import ArtTable from '@/components/tables/art-table/index.vue'
  import TypeDialog from './modules/type-dialog.vue'
  import EnumDialog from './modules/enum-dialog.vue'
  import DictionaryImport from './modules/dictionary-import.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { DictionaryService } from '@/api/dictionaryApi'
  import type { DictionaryTypeItem, DictionaryEnumItem } from '@/types/api'

  defineOptions({ name: 'Dictionary' })

  const { getDictionaryTypes, deleteDictionaryType, getDictionaryEnums, deleteDictionaryEnum } =
    DictionaryService

  const typeData = ref<DictionaryTypeItem[]>([])
  const typeLoading = ref(false)
  const typePagination = ref({
    current: 1,
    size: 10,
    total: 0
  })
  const selectedType = ref<DictionaryTypeItem | null>(null)
  const typeSearchKeyword = ref('')
  const typeDialogVisible = ref(false)
  const typeDialogType = ref<'add' | 'edit'>('add')
  const currentEditType = ref<DictionaryTypeItem | null>(null)

  const enumLoading = ref(false)
  const enumData = ref<DictionaryEnumItem[]>([])

  const typeColumns = [
    {
      prop: 'name',
      label: '字典名称',
      formatter: (row: DictionaryTypeItem) => row.name || '-'
    },
    {
      prop: 'code',
      label: '字典编码',
      formatter: (row: DictionaryTypeItem) => row.code || '-'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right' as const,
      formatter: (row: DictionaryTypeItem) => {
        return h('div', [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showTypeDialog('edit', row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => deleteType(row)
          })
        ])
      }
    }
  ]

  const enumColumns = [
    {
      prop: 'dictValue',
      label: '枚举名称',
      formatter: (row: DictionaryEnumItem) => row.dictValue || '-'
    },
    {
      prop: 'keyValue',
      label: '枚举编码',
      formatter: (row: DictionaryEnumItem) => row.keyValue || '-'
    },
    {
      prop: 'sortOrder',
      label: '排序',
      formatter: (row: DictionaryEnumItem) => row.sortOrder || '-'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 165,
      fixed: 'right' as const,
      formatter: (row: DictionaryEnumItem) => {
        return h('div', [
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => showEnumDialog('add', row)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showEnumDialog('edit', row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => deleteEnum(row)
          })
        ])
      }
    }
  ]

  const enumDialogVisible = ref(false)
  const enumDialogType = ref<'add' | 'edit'>('add')
  const currentEditEnum = ref<DictionaryEnumItem | null>(null)

  const isExpanded = ref(false)
  const enumTableRef = ref()

  const getTypeData = async () => {
    typeLoading.value = true
    try {
      const response = await getDictionaryTypes({
        current: typePagination.value.current,
        size: typePagination.value.size,
        name: typeSearchKeyword.value || undefined
      })
      typeData.value = response.records || []
      typePagination.value.total = response.total || 0
    } catch (error) {
      console.error(error)
    } finally {
      typeLoading.value = false
    }
  }

  const filterTypes = () => {
    typePagination.value.current = 1
    getTypeData()
  }

  const handleTypeCurrentChange = (current: number) => {
    typePagination.value.current = current
    getTypeData()
  }

  const selectType = (type: DictionaryTypeItem) => {
    selectedType.value = type
    getEnumData()
  }

  const getRowClassName = ({ row }: { row: Record<string, any>; rowIndex: number }) => {
    return row.id === selectedType.value?.id ? 'selected-row' : ''
  }

  const getEnumData = async () => {
    if (!selectedType.value) return

    enumLoading.value = true
    try {
      const response = await getDictionaryEnums(selectedType.value.id)
      enumData.value = response.records || []
    } catch (error) {
      console.error(error)
    } finally {
      enumLoading.value = false
    }
  }

  const showTypeDialog = (type: 'add' | 'edit', typeData?: DictionaryTypeItem) => {
    typeDialogType.value = type
    typeDialogVisible.value = true
    if (type === 'edit' && typeData) {
      currentEditType.value = typeData
    } else {
      currentEditType.value = null
    }
  }

  const handleTypeDialogSubmit = () => {
    typeDialogVisible.value = false
    currentEditType.value = null
    getTypeData()
  }

  const deleteType = async (type: DictionaryTypeItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除字典分类 "${type.name}" 吗？`, '删除字典分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteDictionaryType(type.id)
      ElMessage.success('删除成功')
      getTypeData()
      if (selectedType.value?.id === type.id) {
        selectedType.value = null
        enumData.value = []
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
      }
    }
  }

  const showEnumDialog = (type: 'add' | 'edit', enumData?: DictionaryEnumItem) => {
    if (!selectedType.value) {
      ElMessage.warning('请先选择字典分类')
      return
    }
    enumDialogType.value = type
    enumDialogVisible.value = true
    if (type === 'edit' && enumData) {
      currentEditEnum.value = enumData
    } else if (type === 'add' && enumData) {
      // 添加子级枚举, 设置父级ID
      currentEditEnum.value = { parentId: enumData.id } as DictionaryEnumItem
    } else {
      currentEditEnum.value = null
    }
  }

  const handleEnumDialogSubmit = () => {
    enumDialogVisible.value = false
    currentEditEnum.value = null
    getEnumData()
  }

  const deleteEnum = async (enumItem: DictionaryEnumItem) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除字典枚举 "${enumItem.dictValue}" 吗？`,
        '删除字典枚举',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await deleteDictionaryEnum(enumItem.id)
      ElMessage.success('删除成功')
      getEnumData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
      }
    }
  }

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (enumTableRef.value && enumData.value) {
        const processRows = (rows: DictionaryEnumItem[]) => {
          rows.forEach(row => {
            if (row.children && row.children.length > 0) {
              enumTableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(enumData.value)
      }
    })
  }

  const handleImportSuccess = () => {
    getEnumData()
  }

  onMounted(() => {
    getTypeData()
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
