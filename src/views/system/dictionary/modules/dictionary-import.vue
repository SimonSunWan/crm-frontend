<template>
  <ArtBatchImport
    title="字典枚举批量导入"
    :template-url="templateUrl"
    :template-tips="templateTips"
    :preview-columns="previewColumns"
    :on-preview="handlePreview"
    :on-import="handleImport"
    @success="handleSuccess"
    @error="handleError"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import ArtBatchImport from '@/components/forms/art-batch-import/index.vue'
  import { DictionaryService } from '@/api/dictionaryApi'
  import type {
    BatchImportEnumItem,
    BatchImportResult,
    BatchImportDictionaryEnumParams
  } from '@/types/api'
  import * as XLSX from 'xlsx'

  interface Props {
    typeId: number
    typeName: string
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    success: []
  }>()

  const templateUrl = computed(() => {
    return `/api/dictionary/enums/template/${props.typeId}`
  })

  const templateTips = [
    '枚举编码：必填，唯一标识，不能重复',
    '枚举名称：必填，显示名称',
    '排序：可选，数字类型，默认为0',
    '父级编码：可选，用于创建级联关系',
    '层级：可选，数字类型，默认为1',
    '请按照模板格式填写数据，支持多级级联导入'
  ]

  const previewColumns = [
    { prop: 'keyValue', label: '枚举编码' },
    { prop: 'dictValue', label: '枚举名称' },
    { prop: 'sortOrder', label: '排序' },
    { prop: 'parentKeyValue', label: '父级编码' },
    { prop: 'level', label: '层级' }
  ]

  const handlePreview = async (file: File): Promise<any> => {
    try {
      const data = await parseExcelFile(file)
      const validationResult = validateImportData(data)
      return validationResult
    } catch (error) {
      console.error('文件解析失败:', error)
      throw new Error('文件解析失败，请检查文件格式')
    }
  }

  const handleImport = async (data: BatchImportEnumItem[]): Promise<BatchImportResult> => {
    try {
      const params: BatchImportDictionaryEnumParams = {
        typeId: props.typeId,
        data
      }
      const result = await DictionaryService.batchImportDictionaryEnums(params)
      return result
    } catch (error) {
      console.error('导入失败:', error)
      throw new Error('导入失败，请稍后重试')
    }
  }

  const handleSuccess = () => {
    ElMessage.success('字典枚举导入成功')
    emit('success')
  }

  const handleError = (error: any) => {
    console.error('导入错误:', error)
    ElMessage.error('导入过程中发生错误')
  }

  const parseExcelFile = (file: File): Promise<BatchImportEnumItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          if (jsonData.length < 2) {
            reject(new Error('Excel文件至少需要包含标题行和数据行'))
            return
          }

          const dataRows = jsonData.slice(1) as any[][]

          const result: BatchImportEnumItem[] = dataRows
            .map(row => {
              if (row.every(cell => !cell)) return null

              const item: BatchImportEnumItem = {
                keyValue: row[0]?.toString().trim() || '',
                dictValue: row[1]?.toString().trim() || '',
                sortOrder: row[2] ? parseInt(row[2]) || 0 : 0,
                parentKeyValue: row[3]?.toString().trim() || undefined,
                level: row[4] ? parseInt(row[4]) || 1 : 1
              }

              return item
            })
            .filter(item => item !== null) as BatchImportEnumItem[]

          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }

  const validateImportData = (data: BatchImportEnumItem[]): any => {
    const errors: Array<{ row: number; message: string }> = []
    const warnings: Array<{ row: number; message: string }> = []
    const validData: BatchImportEnumItem[] = []

    const keyValueSet = new Set<string>()

    data.forEach((item, index) => {
      const row = index + 2
      let hasError = false

      if (!item.keyValue) {
        errors.push({ row, message: '枚举编码不能为空' })
        hasError = true
      } else if (keyValueSet.has(item.keyValue)) {
        errors.push({ row, message: '枚举编码重复' })
        hasError = true
      } else {
        keyValueSet.add(item.keyValue)
      }

      if (!item.dictValue) {
        errors.push({ row, message: '枚举名称不能为空' })
        hasError = true
      }

      if (item.sortOrder && (isNaN(item.sortOrder) || item.sortOrder < 0)) {
        warnings.push({ row, message: '排序值应为非负整数，已自动修正为0' })
        item.sortOrder = 0
      }

      if (item.level && (isNaN(item.level) || item.level < 1)) {
        warnings.push({ row, message: '层级值应大于等于1，已自动修正为1' })
        item.level = 1
      }

      // 验证层级和父级关系
      if (item.level && item.level > 1 && !item.parentKeyValue) {
        errors.push({ row, message: `层级为${item.level}的项必须指定父级编码` })
        hasError = true
      }

      if (item.level === 1 && item.parentKeyValue) {
        warnings.push({ row, message: '层级为1的项不需要指定父级编码，已忽略' })
        item.parentKeyValue = undefined
      }

      if (!hasError) {
        validData.push(item)
      }
    })

    return {
      data: validData,
      errors,
      warnings,
      successCount: validData.length,
      warningCount: warnings.length,
      errorCount: errors.length
    }
  }
</script>
