<!-- 水印组件 -->
<template>
  <div v-if="watermarkVisible" class="layout-watermark" :style="{ zIndex: zIndex }">
    <el-watermark
      :content="watermarkContent"
      :font="{ fontSize: fontSize, color: fontColor }"
      :rotate="rotate"
      :gap="[gapX, gapY]"
      :offset="[offsetX, offsetY]"
    >
      <div style="height: 100vh"></div>
    </el-watermark>
  </div>
</template>

<script setup lang="ts">
  import { getSystemName } from '@/config'
  import { useSettingStore } from '@/store/modules/setting'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ArtWatermark' })

  const { locale } = useI18n()
  const settingStore = useSettingStore()
  const { watermarkVisible } = storeToRefs(settingStore)

  interface WatermarkProps {
    /** 水印内容 */
    content?: string
    /** 水印是否可见 */
    visible?: boolean
    /** 水印字体大小 */
    fontSize?: number
    /** 水印字体颜色 */
    fontColor?: string
    /** 水印旋转角度 */
    rotate?: number
    /** 水印间距X */
    gapX?: number
    /** 水印间距Y */
    gapY?: number
    /** 水印偏移X */
    offsetX?: number
    /** 水印偏移Y */
    offsetY?: number
    /** 水印层级 */
    zIndex?: number
  }

  const props = withDefaults(defineProps<WatermarkProps>(), {
    content: '',
    visible: false,
    fontSize: 16,
    fontColor: 'rgba(128, 128, 128, 0.2)',
    rotate: -22,
    gapX: 100,
    gapY: 100,
    offsetX: 50,
    offsetY: 50,
    zIndex: 3100
  })

  const watermarkContent = computed(() => props.content || getSystemName(locale.value))
</script>

<style lang="scss" scoped>
  .layout-watermark {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }
</style>
