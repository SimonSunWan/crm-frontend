<template>
  <el-cascader
    style="width: 100%"
    v-model="modelValue"
    :options="cascadeOptions"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :loading="loading"
    :filterable="filterable"
    :props="cascaderProps"
    v-bind="$attrs"
    @change="emit('change', $event)"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { DictionaryService } from '@/api/dictionaryApi'
  import type { DictionaryEnumItem } from '@/types/api/dictionary'

  defineOptions({ name: 'ArtCascader' })

  interface Props {
    dictCode: string
    placeholder?: string
    clearable?: boolean
    disabled?: boolean
    loading?: boolean
    filterable?: boolean
    multipleFields?: boolean
  }

  interface Emits {
    change: [value: any]
    clear: []
  }

  const props = withDefaults(defineProps<Props>(), {
    placeholder: '请选择',
    clearable: true,
    disabled: false,
    loading: false,
    filterable: false,
    multipleFields: false
  })

  const emit = defineEmits<Emits>()
  const modelValue = defineModel<string | string[] | undefined>()
  const cascadeOptions = ref<any[]>([])
  const internalLoading = ref(false)

  const cascaderProps = computed(() => ({
    value: 'keyValue',
    label: 'dictValue',
    children: 'children',
    emitPath: props.multipleFields,
    checkStrictly: false
  }))

  const loading = computed(() => props.loading || internalLoading.value)

  const convertToOption = (item: DictionaryEnumItem): any => ({
    keyValue: item.keyValue,
    dictValue: item.dictValue,
    children: item.children?.map(convertToOption) || []
  })

  const fetchDictionaryData = async () => {
    if (!props.dictCode) return

    internalLoading.value = true
    try {
      const dictResponse = await DictionaryService.getDictionaryByCode(props.dictCode)
      if (dictResponse?.type?.id) {
        const response = await DictionaryService.getDictionaryEnums(dictResponse.type.id)
        cascadeOptions.value = response?.records?.map(convertToOption) || []
      } else {
        cascadeOptions.value = []
      }
    } catch {
      cascadeOptions.value = []
    } finally {
      internalLoading.value = false
    }
  }

  watch(() => props.dictCode, fetchDictionaryData, { immediate: true })
</script>
