<!-- 字典管理 -->
<template>
  <div class="dictionary-page art-full-height">
    <div class="dictionary-layout">
      <!-- 左侧字典类型管理 -->
      <div class="left-panel">
        <ElCard class="type-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>字典分类管理</span>
            </div>
          </template>

          <!-- 添加字典类型 -->
          <div class="add-type-section">
            <ElButton type="primary" @click="showTypeDialog('add')" v-ripple>
              + 添加字典分类
            </ElButton>
            <ElInput
              v-model="typeSearchKeyword"
              placeholder="请输入字典名称"
              clearable
              @input="filterTypes"
              class="search-input"
            />
          </div>

          <!-- 字典类型列表 -->
          <div class="type-list">
            <div class="list-header">
              <span>全部字典</span>
              <i class="iconfont-sys">&#xe6b9;</i>
            </div>
            <div class="type-items">
              <div
                v-for="type in filteredTypes"
                :key="type.id"
                :class="['type-item', { active: selectedType?.id === type.id }]"
                @click="selectType(type)"
              >
                <span class="type-name">{{ type.name }}</span>
                <div class="type-actions">
                  <ElButton
                    type="primary"
                    link
                    size="small"
                    @click.stop="showTypeDialog('edit', type)"
                  >
                    编辑
                  </ElButton>
                  <ElButton type="danger" link size="small" @click.stop="deleteType(type)">
                    删除
                  </ElButton>
                </div>
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 右侧字典枚举管理 -->
      <div class="right-panel">
        <ElCard class="enum-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>字典枚举管理</span>
              <ElButton
                v-if="selectedType"
                type="primary"
                size="small"
                @click="showEnumDialog('add')"
                v-ripple
              >
                + 添加
              </ElButton>
            </div>
          </template>

          <!-- 字典枚举表格 -->
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

    <!-- 字典类型弹窗 -->
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

    <!-- 字典枚举弹窗 -->
    <ElDialog :title="enumDialogTitle" v-model="enumDialogVisible" width="500px" align-center>
      <ElForm ref="enumFormRef" :model="enumForm" :rules="enumRules" label-width="100px">
        <ElFormItem label="键值" prop="keyValue">
          <ElInput v-model="enumForm.keyValue" placeholder="请输入键值" />
        </ElFormItem>
        <ElFormItem label="字典值" prop="dictValue">
          <ElInput v-model="enumForm.dictValue" placeholder="请输入字典值" />
        </ElFormItem>
        <ElFormItem label="排序" prop="sortOrder">
          <ElInputNumber
            v-model="enumForm.sortOrder"
            :min="0"
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

  // 字典类型相关
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

  // 字典枚举相关
  const enumLoading = ref(false)
  const enumData = ref<DictionaryEnumItem[]>([])
  const enumPagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  const enumColumns = [
    { type: 'index' as const, width: 60, label: '序号' },
    { prop: 'id', label: 'id', width: 80 },
    { prop: 'keyValue', label: 'key值' },
    { prop: 'dictValue', label: '字典值' },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right' as const,
      formatter: (row: DictionaryEnumItem) => {
        return h('div', [
          h(
            ElButton,
            {
              type: 'primary',
              link: true,
              size: 'small',
              onClick: () => showEnumDialog('edit', row)
            },
            () => '编辑'
          ),
          h(
            ElButton,
            {
              type: 'danger',
              link: true,
              size: 'small',
              onClick: () => deleteEnum(row)
            },
            () => '删除'
          )
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
    keyValue: [{ required: true, message: '请输入键值', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
  }

  const enumDialogTitle = computed(() => {
    return enumDialogType.value === 'add' ? '新增字典枚举' : '编辑字典枚举'
  })

  // 获取字典类型列表
  const getTypeData = async () => {
    try {
      const response = await getDictionaryTypes({
        current: 1,
        size: 1000
      })
      typeData.value = response.records || []
      filteredTypes.value = [...typeData.value]
    } catch (error) {
      console.error('获取字典类型列表失败:', error)
      ElMessage.error('获取字典类型列表失败')
    }
  }

  // 过滤字典类型
  const filterTypes = () => {
    if (!typeSearchKeyword.value) {
      filteredTypes.value = [...typeData.value]
    } else {
      filteredTypes.value = typeData.value.filter(type =>
        type.name.toLowerCase().includes(typeSearchKeyword.value.toLowerCase())
      )
    }
  }

  // 选择字典类型
  const selectType = (type: DictionaryTypeItem) => {
    selectedType.value = type
    getEnumData()
  }

  // 获取字典枚举列表
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
      console.error('获取字典枚举列表失败:', error)
      ElMessage.error('获取字典枚举列表失败')
    } finally {
      enumLoading.value = false
    }
  }

  // 字典类型分页处理
  const handleEnumSizeChange = (size: number) => {
    enumPagination.size = size
    enumPagination.current = 1
    getEnumData()
  }

  const handleEnumCurrentChange = (current: number) => {
    enumPagination.current = current
    getEnumData()
  }

  // 显示字典类型弹窗
  const showTypeDialog = (type: 'add' | 'edit', typeData?: DictionaryTypeItem) => {
    typeDialogType.value = type
    typeDialogVisible.value = true

    if (type === 'edit' && typeData) {
      Object.assign(typeForm, {
        name: typeData.name,
        code: typeData.code,
        description: typeData.description || ''
      })
      // 保存当前编辑的类型ID
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

  // 提交字典类型表单
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

  // 删除字典类型
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

  // 显示字典枚举弹窗
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

  // 提交字典枚举表单
  const submitEnumForm = async () => {
    if (!enumFormRef.value || !selectedType.value) return

    await enumFormRef.value.validate(async valid => {
      if (valid) {
        try {
          if (enumDialogType.value === 'add') {
            await createDictionaryEnum({
              typeId: selectedType.value.id,
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

  // 删除字典枚举
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

  // 初始化
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

          .add-type-section {
            margin-bottom: 16px;

            .search-input {
              margin-top: 12px;
            }
          }

          .type-list {
            .list-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 12px;
              font-weight: 500;
              color: var(--art-text-gray-800);

              i {
                font-size: 12px;
                color: var(--art-text-gray-500);
              }
            }

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
                  gap: 4px;
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
