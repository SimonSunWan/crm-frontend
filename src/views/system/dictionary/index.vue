<template>
  <div class="dictionary-page art-full-height">
    <div class="dictionary-layout">
      <!-- 左侧字典分类面板 -->
      <div class="left-panel">
        <ElCard class="type-card" shadow="never">
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

          <div class="type-list">
            <div class="type-items">
              <div
                v-for="type in filteredTypes"
                :key="type.id"
                :class="['type-item', { active: selectedType?.id === type.id }]"
                @click="selectType(type)"
              >
                <span class="type-name">{{ type.name }}</span>
                <div class="type-actions">
                  <ArtButtonTable type="edit" @click="showTypeDialog('edit', type)" />
                  <ArtButtonTable type="delete" @click="deleteType(type)" />
                </div>
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 右侧字典枚举面板 -->
      <div class="right-panel">
        <ElCard class="enum-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>字典枚举</span>
              <ElButton v-if="selectedType" @click="showEnumDialog('add')" v-ripple>
                新增字典枚举
              </ElButton>
            </div>
          </template>

          <div v-if="selectedType" class="enum-table">
            <ArtTable
              :loading="enumLoading"
              :data="enumData"
              :columns="enumColumns"
              :pagination="enumPagination"
              @pagination:size-change="handleEnumSizeChange"
              @pagination:current-change="handleEnumCurrentChange"
            />
          </div>
          <div v-else class="no-selection">
            <p>请选择左侧字典分类</p>
          </div>
        </ElCard>
      </div>
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
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'
  import TypeDialog from './modules/type-dialog.vue'
  import EnumDialog from './modules/enum-dialog.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { DictionaryService } from '@/api/dictionaryApi'
  import type { DictionaryTypeItem, DictionaryEnumItem } from '@/types/api'

  defineOptions({ name: 'Dictionary' })

  const { getDictionaryTypes, deleteDictionaryType, getDictionaryEnums, deleteDictionaryEnum } =
    DictionaryService

  const typeData = ref<DictionaryTypeItem[]>([])
  const filteredTypes = ref<DictionaryTypeItem[]>([])
  const selectedType = ref<DictionaryTypeItem | null>(null)
  const typeSearchKeyword = ref('')
  const typeDialogVisible = ref(false)
  const typeDialogType = ref<'add' | 'edit'>('add')
  const currentEditType = ref<DictionaryTypeItem | null>(null)

  const enumLoading = ref(false)
  const enumData = ref<DictionaryEnumItem[]>([])
  const enumPagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  const enumColumns = [
    {
      prop: 'keyValue',
      label: 'key值',
      formatter: (row: DictionaryEnumItem) => row.keyValue || '-'
    },
    {
      prop: 'dictValue',
      label: '字典值',
      formatter: (row: DictionaryEnumItem) => row.dictValue || '-'
    },
    {
      prop: 'sortOrder',
      label: '排序',
      formatter: (row: DictionaryEnumItem) => row.sortOrder || '-'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right' as const,
      formatter: (row: DictionaryEnumItem) => {
        return h('div', [
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

  const getTypeData = async () => {
    try {
      const response = await getDictionaryTypes({
        current: 1,
        size: 1000
      })
      typeData.value = response.records || []
      filteredTypes.value = [...typeData.value]
    } catch (error) {
      console.error(error)
    }
  }

  const filterTypes = () => {
    if (!typeSearchKeyword.value) {
      filteredTypes.value = [...typeData.value]
    } else {
      filteredTypes.value = typeData.value.filter(type =>
        type.name.toLowerCase().includes(typeSearchKeyword.value.toLowerCase())
      )
    }
  }

  const selectType = (type: DictionaryTypeItem) => {
    selectedType.value = type
    getEnumData()
  }

  const getEnumData = async () => {
    if (!selectedType.value) return

    enumLoading.value = true
    try {
      const response = await getDictionaryEnums(selectedType.value.id, {
        current: enumPagination.current,
        size: enumPagination.size
      })
      enumData.value = response.records || []
      enumPagination.total = response.total || 0
    } catch (error) {
      console.error(error)
    } finally {
      enumLoading.value = false
    }
  }

  const handleEnumSizeChange = (size: number) => {
    enumPagination.size = size
    enumPagination.current = 1
    getEnumData()
  }

  const handleEnumCurrentChange = (current: number) => {
    enumPagination.current = current
    getEnumData()
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

  onMounted(() => {
    getTypeData()
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
