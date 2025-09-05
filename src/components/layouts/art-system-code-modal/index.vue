<!-- 系统码弹窗组件 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    title="系统码"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="closeModal"
  >
    <ElRow :gutter="20">
      <ElCol :span="24">
        <ElRow :gutter="10" align="middle">
          <ElCol :span="22">
            <div class="code-value">
              {{ systemCode }}
            </div>
          </ElCol>
          <ElCol :span="2">
            <i class="iconfont-sys copy-icon" :class="{ disabled: !systemCode }" @click="copyCode"
              >&#xe624;</i
            >
          </ElCol>
        </ElRow>
      </ElCol>

      <ElCol :span="24">
        <div class="tips">
          <el-icon><Warning /></el-icon>
          <span>系统码每10分钟自动更新，请及时使用</span>
        </div>
      </ElCol>
    </ElRow>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { ElMessage, ElDialog, ElRow, ElCol } from 'element-plus'
  import { Warning } from '@element-plus/icons-vue'
  import { SystemService } from '@/api/systemApi'

  interface Props {
    visible: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const systemCode = ref('')

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit('update:visible', value)
    }
  })

  watch(
    () => props.visible,
    newVal => {
      if (newVal) {
        loadSystemCode()
      }
    }
  )

  const loadSystemCode = async () => {
    try {
      const response = await SystemService.getSystemSetting('REGISTER_SYSTEM_CODE')
      if (response) {
        systemCode.value = response.settingValue
      }
    } catch (error) {
      console.error(error)
    }
  }

  const copyCode = async () => {
    if (!systemCode.value) return
    await navigator.clipboard.writeText(systemCode.value)
    ElMessage.success('系统码已复制到剪贴板')
  }

  const closeModal = () => {
    emit('update:visible', false)
  }
</script>

<style lang="scss" scoped>
  @use '@styles/variables.scss' as *;

  .label {
    font-size: 14px;
    line-height: 40px;
    color: var(--el-text-color-regular);
  }

  .code-value {
    padding: 8px 12px;
    font-family: 'Courier New', monospace;
    font-size: 16px;
    font-weight: 600;
    color: var(--art-primary-color);
    text-align: center;
    letter-spacing: 2px;
    background: var(--art-card-bg-color);
    border: 1px solid var(--art-border-color);
    border-radius: var(--custom-radius);
  }

  .tips {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: var(--art-info-color);
    background: var(--art-info-bg-color);
    border: 1px solid var(--art-info-border-color);
    border-radius: var(--custom-radius);
  }

  .copy-icon {
    font-size: 18px;
    color: #409eff;
    cursor: pointer;
    transition: color 0.3s;
  }

  .copy-icon:hover {
    color: #66b1ff;
  }

  .copy-icon.disabled {
    color: #c0c4cc;
    cursor: not-allowed;
  }
</style>
