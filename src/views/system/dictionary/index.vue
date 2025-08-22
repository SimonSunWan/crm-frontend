<template>
  <div class="dictionary-page art-full-height">
    <div class="dictionary-layout">
      <div class="left-panel">
        <ElCard class="type-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>字典分类</span>
              <ElButton type="primary" @click="showTypeDialog('add')" v-ripple> + 新增 </ElButton>
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

      <div class="right-panel">
        <ElCard class="enum-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>字典枚举</span>
              <ElButton v-if="selectedType" type="primary" @click="showEnumDialog('add')" v-ripple>
                + 新增
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

    <ElDialog :title="typeDialogTitle" v-model="typeDialogVisible" width="500px" align-center>
      <ElForm ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
        <ElFormItem label="字典名称" prop="name">
          <ElInput v-model="typeForm.name" placeholder="请输入字典名称" />
        </ElFormItem>
        <ElFormItem label="字典编码" prop="code">
          <ElInput v-model="typeForm.code" placeholder="请输入字典编码" />
        </ElFormItem>
        <ElFormItem label="字典描述" prop="description">
          <ElInput
            v-model="typeForm.description"
            type="textarea"
            placeholder="请输入字典描述"
            :rows="3"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="typeDialogVisible = false">取 消</ElButton>
          <ElButton type="primary" @click="submitTypeForm">确 定</ElButton>
        </span>
      </template>
    </ElDialog>

    <ElDialog :title="enumDialogTitle" v-model="enumDialogVisible" width="500px" align-center>
      <ElForm ref="enumFormRef" :model="enumForm" :rules="enumRules" label-width="100px">
        <ElFormItem label="key值" prop="keyValue">
          <ElInput v-model="enumForm.keyValue" placeholder="请输入key值" />
        </ElFormItem>
        <ElFormItem label="字典值" prop="dictValue">
          <ElInput v-model="enumForm.dictValue" placeholder="请输入字典值" />
        </ElFormItem>
        <ElFormItem label="排序" prop="sortOrder">
          <ElInputNumber
            v-model="enumForm.sortOrder"
            :min="1"
            controls-position="right"
            style="width: 100%"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="enumDialogVisible = false">取 消</ElButton>
          <ElButton type="primary" @click="submitEnumForm">确 定</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { DictionaryService } from '@/api/dictionaryApi'
  import type { FormInstance, FormRules } from 'element-plus'
  import ArtButtonTable from '@/components/forms/art-button-table/index.vue'

  defineOptions({ name: 'Dictionary' })

  type DictionaryTypeItem = Api.Dictionary.DictionaryTypeItem
  type DictionaryEnumItem = Api.Dictionary.DictionaryEnumItem

  const {
    getDictionaryTypes,
    createDictionaryType,
    updateDictionaryType,
    deleteDictionaryType,
    getDictionaryEnums,
    createDictionaryEnum,
    updateDictionaryEnum,
    deleteDictionaryEnum
  } = DictionaryService

  const typeData = ref<DictionaryTypeItem[]>([])
  const filteredTypes = ref<DictionaryTypeItem[]>([])
  const selectedType = ref<DictionaryTypeItem | null>(null)
  const typeSearchKeyword = ref('')
  const typeDialogVisible = ref(false)
  const typeDialogType = ref<'add' | 'edit'>('add')
  const typeFormRef = ref<FormInstance>()
  const currentEditTypeId = ref<number | null>(null)
  const typeForm = reactive({
    name: '',
    code: '',
    description: ''
  })

  const typeRules: FormRules = {
    name: [
      { required: true, message: '请输入字典名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    code: [
      { required: true, message: '请输入字典编码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  }

  const typeDialogTitle = computed(() => {
    return typeDialogType.value === 'add' ? '新增字典分类' : '编辑字典分类'
  })

  const enumLoading = ref(false)
  const enumData = ref<DictionaryEnumItem[]>([])
  const enumPagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  const enumColumns = [
    { prop: 'keyValue', label: 'key值' },
    { prop: 'dictValue', label: '字典值' },
    { prop: 'sortOrder', width: 60, label: '排序' },
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
  const enumFormRef = ref<FormInstance>()
  const currentEditEnumId = ref<number | null>(null)
  const enumForm = reactive({
    keyValue: '',
    dictValue: '',
    sortOrder: 0
  })

  const enumRules: FormRules = {
    keyValue: [{ required: true, message: '请输入key值', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
  }

  const enumDialogTitle = computed(() => {
    return enumDialogType.value === 'add' ? '新增字典枚举' : '编辑字典枚举'
  })

  const getTypeData = async () => {
    try {
      const response = await getDictionaryTypes({
        current: 1,
        size: 1000
      })
      typeData.value = response.records || []
      filteredTypes.value = [...typeData.value]
    } catch {
      ElMessage.error('获取字典类型列表失败')
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
    } catch {
      ElMessage.error('获取字典枚举列表失败')
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
      Object.assign(typeForm, {
        name: typeData.name,
        code: typeData.code,
        description: typeData.description || ''
      })
      currentEditTypeId.value = typeData.id
    } else {
      Object.assign(typeForm, {
        name: '',
        code: '',
        description: ''
      })
      currentEditTypeId.value = null
    }
  }

  const submitTypeForm = async () => {
    if (!typeFormRef.value) return

    await typeFormRef.value.validate(async valid => {
      if (valid) {
        try {
          if (typeDialogType.value === 'add') {
            await createDictionaryType(typeForm)
            ElMessage.success('创建成功')
          } else if (currentEditTypeId.value) {
            await updateDictionaryType(currentEditTypeId.value, typeForm)
            ElMessage.success('更新成功')
          }
          typeDialogVisible.value = false
          getTypeData()
        } catch (error: any) {
          ElMessage.error(error?.message || '操作失败')
        }
      }
    })
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
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error?.message || '删除失败')
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
      Object.assign(enumForm, {
        keyValue: enumData.keyValue,
        dictValue: enumData.dictValue,
        sortOrder: enumData.sortOrder
      })
      currentEditEnumId.value = enumData.id
    } else {
      Object.assign(enumForm, {
        keyValue: '',
        dictValue: '',
        sortOrder: 0
      })
      currentEditEnumId.value = null
    }
  }

  const submitEnumForm = async () => {
    if (!enumFormRef.value || !selectedType.value) return

    await enumFormRef.value.validate(async valid => {
      if (valid) {
        try {
          if (enumDialogType.value === 'add') {
            await createDictionaryEnum({
              typeId: selectedType.value!.id,
              ...enumForm
            })
            ElMessage.success('创建成功')
          } else if (currentEditEnumId.value) {
            await updateDictionaryEnum(currentEditEnumId.value, enumForm)
            ElMessage.success('更新成功')
          }
          enumDialogVisible.value = false
          getEnumData()
        } catch (error: any) {
          ElMessage.error(error?.message || '操作失败')
        }
      }
    })
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
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error?.message || '删除失败')
      }
    }
  }

  onMounted(() => {
    getTypeData()
  })
</script>

<style lang="scss" scoped>
  .dictionary-page {
    .dictionary-layout {
      display: flex;
      gap: 16px;
      height: 100%;

      .left-panel {
        flex-shrink: 0;
        width: 300px;

        .type-card {
          height: 100%;

          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .search-type-section {
            margin-bottom: 16px;
          }

          .type-list {
            .type-items {
              .type-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                margin-bottom: 4px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;

                &:hover {
                  background-color: var(--art-gray-100);
                }

                &.active {
                  color: white;
                  background-color: var(--main-color);

                  .el-button {
                    color: white;
                  }
                }

                .type-name {
                  flex: 1;
                  margin-right: 8px;
                }

                .type-actions {
                  display: flex;

                  :deep(.btn-text) {
                    min-width: 0;
                  }
                }
              }
            }
          }
        }
      }

      .right-panel {
        flex: 1;
        min-width: 0;

        .enum-card {
          height: 100%;

          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .no-selection {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: var(--art-text-gray-500);
          }
        }
      }
    }
  }
</style>
