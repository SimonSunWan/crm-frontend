<!-- 字典下拉框组件 -->
<template>
  <el-select
    v-model="modelValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :loading="props.loading || internalLoading"
    :filterable="filterable"
    :multiple="multiple"
    :collapse-tags="multiple"
    :collapse-tags-tooltip="multiple"
    v-bind="$attrs"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in options"
      :key="item.keyValue"
      :label="item.dictValue"
      :value="item.keyValue"
      :disabled="item.status === false"
    />
  </el-select>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { ElSelect, ElOption } from 'element-plus'
  import { DictionaryService } from '@/api/dictionaryApi'
  import type { DictionaryEnumItem } from '@/types/api/dictionary'
  import type { ArtSelectProps, ArtSelectEmits, ArtSelectExpose } from './types'

  defineOptions({ name: 'ArtSelect' })

  const props = withDefaults(defineProps<ArtSelectProps>(), {
    placeholder: '请选择',
    clearable: true,
    disabled: false,
    filterable: false,
    multiple: false,
    loading: false
  })

  const emit = defineEmits<ArtSelectEmits>()

  const modelValue = defineModel<string | string[] | undefined>()

  const options = ref<DictionaryEnumItem[]>([])
  const internalLoading = ref(false)

  // 获取字典数据
  const fetchDictionaryData = async () => {
    if (!props.dictCode) return

    internalLoading.value = true
    try {
      const response = await DictionaryService.getDictionaryByCode(props.dictCode)
      if (response?.enums) {
        options.value = response.enums
      } else {
        options.value = []
      }
    } catch {
      options.value = []
    } finally {
      internalLoading.value = false
    }
  }

  // 处理选择变化
  const handleChange = (value: string | string[] | undefined) => {
    emit('change', value)
  }

  // 处理清空
  const handleClear = () => {
    emit('clear')
  }

  // 监听字典编码变化
  watch(
    () => props.dictCode,
    newCode => {
      if (newCode) {
        fetchDictionaryData()
      } else {
        options.value = []
      }
    },
    { immediate: true }
  )

  // 暴露方法
  defineExpose<ArtSelectExpose>({
    fetchDictionaryData,
    get options() {
      return options.value
    }
  })
</script>

<style lang="scss" scoped>
  :deep(.el-select) {
    width: 100%;
  }
</style>
