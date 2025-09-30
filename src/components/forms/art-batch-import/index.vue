<template>
  <div class="art-batch-import">
    <ElButton @click="showImportDialog" v-ripple>
      <ElIcon><Upload /></ElIcon>
      批量导入
    </ElButton>

    <ElDialog
      v-model="dialogVisible"
      :title="title"
      width="800px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <div class="import-content">
        <div class="import-steps">
          <ElSteps :active="currentStep" finish-status="success">
            <ElStep title="下载模板" />
            <ElStep title="上传文件" />
            <ElStep title="数据预览" />
            <ElStep title="导入完成" />
          </ElSteps>
        </div>

        <div class="step-content">
          <!-- 步骤1: 下载模板 -->
          <div v-if="currentStep === 0" class="step-item">
            <div class="template-section">
              <ElIcon class="template-icon"><Document /></ElIcon>
              <div class="template-info">
                <h4>下载导入模板</h4>
                <p>请先下载Excel模板，按照模板格式填写数据后上传</p>
              </div>
              <ElButton type="primary" @click="downloadTemplate">
                <ElIcon><Download /></ElIcon>
                下载模板
              </ElButton>
            </div>
            <div class="template-tips">
              <ElAlert title="填写说明" type="info" :closable="false" show-icon>
                <template #default>
                  <ul>
                    <li v-for="tip in templateTips" :key="tip">{{ tip }}</li>
                  </ul>
                </template>
              </ElAlert>
            </div>
          </div>

          <!-- 步骤2: 上传文件 -->
          <div v-if="currentStep === 1" class="step-item">
            <ElUpload
              ref="uploadRef"
              :auto-upload="false"
              :before-upload="beforeUpload"
              :on-change="handleFileChange"
              :show-file-list="false"
              accept=".xlsx,.xls"
              drag
            >
              <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">只能上传 xlsx/xls 文件，且不超过 10MB</div>
              </template>
            </ElUpload>
          </div>

          <!-- 步骤3: 数据预览 -->
          <div v-if="currentStep === 2" class="step-item">
            <div class="preview-header">
              <h4>数据预览</h4>
              <div class="preview-stats">
                <ElTag type="success">成功: {{ previewData.successCount }}</ElTag>
                <ElTag type="warning">警告: {{ previewData.warningCount }}</ElTag>
                <ElTag type="danger">错误: {{ previewData.errorCount }}</ElTag>
              </div>
            </div>

            <div v-if="previewData.errors.length > 0" class="error-section">
              <ElAlert title="数据错误" type="error" :closable="false" show-icon>
                <template #default>
                  <div class="error-list">
                    <div
                      v-for="(error, index) in previewData.errors"
                      :key="index"
                      class="error-item"
                    >
                      <span class="error-row">第{{ error.row }}行:</span>
                      <span class="error-message">{{ error.message }}</span>
                    </div>
                  </div>
                </template>
              </ElAlert>
            </div>

            <div v-if="previewData.warnings.length > 0" class="warning-section">
              <ElAlert title="数据警告" type="warning" :closable="false" show-icon>
                <template #default>
                  <div class="warning-list">
                    <div
                      v-for="(warning, index) in previewData.warnings"
                      :key="index"
                      class="warning-item"
                    >
                      <span class="warning-row">第{{ warning.row }}行:</span>
                      <span class="warning-message">{{ warning.message }}</span>
                    </div>
                  </div>
                </template>
              </ElAlert>
            </div>

            <div v-if="previewData.data.length > 0" class="preview-table">
              <ElTable :data="previewData.data.slice(0, 10)" border max-height="300">
                <ElTableColumn
                  v-for="column in previewColumns"
                  :key="column.prop"
                  :prop="column.prop"
                  :label="column.label"
                  :width="column.width"
                />
              </ElTable>
              <div v-if="previewData.data.length > 10" class="preview-more">
                还有 {{ previewData.data.length - 10 }} 条数据...
              </div>
            </div>
          </div>

          <!-- 步骤4: 导入完成 -->
          <div v-if="currentStep === 3" class="step-item">
            <div class="result-section">
              <ElIcon class="result-icon" :class="importResult.success ? 'success' : 'error'">
                <component :is="importResult.success ? 'CircleCheck' : 'CircleClose'" />
              </ElIcon>
              <div class="result-info">
                <h4>{{ importResult.success ? '导入成功' : '导入失败' }}</h4>
                <p>{{ importResult.message }}</p>
                <div v-if="importResult.success" class="result-stats">
                  <ElTag type="success">成功导入: {{ importResult.successCount }} 条</ElTag>
                  <ElTag v-if="importResult.failCount > 0" type="danger">
                    失败: {{ importResult.failCount }} 条
                  </ElTag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="handleClose">取消</ElButton>
          <ElButton v-if="currentStep === 0" type="primary" @click="nextStep"> 下一步 </ElButton>
          <ElButton
            v-if="currentStep === 2 && previewData.errorCount === 0"
            type="primary"
            :loading="importing"
            @click="confirmImport"
          >
            确认导入
          </ElButton>
          <ElButton v-if="currentStep === 3" type="primary" @click="handleClose"> 完成 </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Upload, Download, Document, UploadFilled } from '@element-plus/icons-vue'
  import type { UploadInstance } from 'element-plus'

  interface ImportError {
    row: number
    message: string
  }

  interface ImportWarning {
    row: number
    message: string
  }

  interface PreviewData {
    data: any[]
    errors: ImportError[]
    warnings: ImportWarning[]
    successCount: number
    warningCount: number
    errorCount: number
  }

  interface ImportResult {
    success: boolean
    message: string
    successCount: number
    failCount: number
  }

  interface PreviewColumn {
    prop: string
    label: string
    width?: number
  }

  interface Props {
    title?: string
    templateUrl?: string
    templateTips?: string[]
    previewColumns?: PreviewColumn[]
    onPreview?: (file: File) => Promise<PreviewData>
    onImport?: (data: any[]) => Promise<ImportResult>
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '批量导入',
    templateTips: () => [],
    previewColumns: () => []
  })

  const emit = defineEmits<{
    success: []
    error: [error: any]
  }>()

  const dialogVisible = ref(false)
  const currentStep = ref(0)
  const uploading = ref(false)
  const importing = ref(false)
  const uploadRef = ref<UploadInstance>()
  const previewData = ref<PreviewData>({
    data: [],
    errors: [],
    warnings: [],
    successCount: 0,
    warningCount: 0,
    errorCount: 0
  })
  const importResult = ref<ImportResult>({
    success: false,
    message: '',
    successCount: 0,
    failCount: 0
  })

  const showImportDialog = () => {
    dialogVisible.value = true
    resetDialog()
  }

  const resetDialog = () => {
    currentStep.value = 0
    uploading.value = false
    importing.value = false
    previewData.value = {
      data: [],
      errors: [],
      warnings: [],
      successCount: 0,
      warningCount: 0,
      errorCount: 0
    }
    importResult.value = {
      success: false,
      message: '',
      successCount: 0,
      failCount: 0
    }
  }

  const handleClose = () => {
    dialogVisible.value = false
    resetDialog()
  }

  const nextStep = () => {
    if (currentStep.value < 3) {
      currentStep.value++
    }
  }

  const downloadTemplate = async () => {
    if (props.templateUrl) {
      try {
        const response = await fetch(props.templateUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) {
          throw new Error('下载失败')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        // 从响应头获取文件名
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = '导入模板.xlsx'
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/)
          if (filenameMatch) {
            filename = decodeURIComponent(filenameMatch[1])
          }
        }

        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('模板下载失败:', error)
        ElMessage.error('模板下载失败')
      }
    } else {
      ElMessage.warning('模板下载地址未配置')
    }
  }

  const beforeUpload = (file: File) => {
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    const isLt10M = file.size / 1024 / 1024 < 10

    if (!isExcel) {
      ElMessage.error('只能上传 Excel 文件!')
      return false
    }
    if (!isLt10M) {
      ElMessage.error('文件大小不能超过 10MB!')
      return false
    }
    return true
  }

  const handleFileChange = async (file: any) => {
    if (!file.raw) return

    uploading.value = true
    if (props.onPreview) {
      try {
        previewData.value = await props.onPreview(file.raw)
        currentStep.value = 2
      } catch (error) {
        ElMessage.error('文件解析失败')
        emit('error', error)
      }
    } else {
      ElMessage.error('预览功能未配置')
    }
    uploading.value = false
  }

  const confirmImport = async () => {
    if (!props.onImport) {
      ElMessage.error('导入功能未配置')
      return
    }

    importing.value = true
    try {
      importResult.value = await props.onImport(previewData.value.data)
      currentStep.value = 3
      if (importResult.value.success) {
        emit('success')
      }
    } catch (error) {
      importResult.value = {
        success: false,
        message: '导入过程中发生错误',
        successCount: 0,
        failCount: previewData.value.data.length
      }
      currentStep.value = 3
      emit('error', error)
    } finally {
      importing.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .art-batch-import {
    display: inline-block;
  }

  .import-content {
    .import-steps {
      margin-bottom: 24px;
    }

    .step-content {
      min-height: 400px;

      .step-item {
        .template-section {
          display: flex;
          align-items: center;
          padding: 24px;
          margin-bottom: 16px;
          background: #f8f9fa;
          border-radius: 8px;

          .template-icon {
            margin-right: 16px;
            font-size: 48px;
            color: #409eff;
          }

          .template-info {
            flex: 1;

            h4 {
              margin: 0 0 8px;
              font-size: 16px;
              font-weight: 600;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: #666;
            }
          }
        }

        .template-tips {
          ul {
            padding-left: 20px;
            margin: 0;

            li {
              margin-bottom: 4px;
              font-size: 14px;
            }
          }
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;

          h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }

          .preview-stats {
            display: flex;
            gap: 8px;
          }
        }

        .error-section,
        .warning-section {
          margin-bottom: 16px;

          .error-list,
          .warning-list {
            max-height: 200px;
            overflow-y: auto;

            .error-item,
            .warning-item {
              display: flex;
              margin-bottom: 4px;

              .error-row,
              .warning-row {
                min-width: 60px;
                margin-right: 8px;
                font-weight: 600;
              }
            }
          }
        }

        .preview-table {
          .preview-more {
            padding: 12px;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
        }

        .result-section {
          display: flex;
          align-items: center;
          padding: 24px;
          background: #f8f9fa;
          border-radius: 8px;

          .result-icon {
            margin-right: 16px;
            font-size: 48px;

            &.success {
              color: #67c23a;
            }

            &.error {
              color: #f56c6c;
            }
          }

          .result-info {
            flex: 1;

            h4 {
              margin: 0 0 8px;
              font-size: 16px;
              font-weight: 600;
            }

            p {
              margin: 0 0 12px;
              font-size: 14px;
              color: #666;
            }

            .result-stats {
              display: flex;
              gap: 8px;
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
