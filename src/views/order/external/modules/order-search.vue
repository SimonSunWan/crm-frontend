<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import ArtSearchBar from '@/components/forms/art-search-bar/index.vue'
  import type { SearchFormItem } from '@/components/forms/art-search-bar/index.vue'
  import { cascaderProps } from '../utils/dictionaryUtils'

  interface Props {
    modelValue: Record<string, any>
    dictionaryOptions?: {
      carModel: any[]
      projectType: any[]
      projectPhase: any[]
      faultClassification: any[]
      faultLocation: any[]
      partCategory: any[]
      spareLocation: any[]
      partNumber: any[]
      feeType: any[]
      repairItems: any[]
    }
  }

  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  })

  const rules = {}

  const formItems = computed((): SearchFormItem[] => [
    {
      label: '工单编号',
      key: 'orderNo',
      type: 'input',
      props: {
        placeholder: '请输入工单编号',
        clearable: true
      }
    },
    {
      label: '整车厂/车型',
      key: 'carSelection',
      type: 'cascader',
      labelWidth: '90px',
      props: {
        options: props.dictionaryOptions?.carModel || [],
        props: cascaderProps,
        placeholder: '请选择整车厂/车型',
        clearable: true,
        style: { width: '100%' }
      }
    },
    {
      label: '维修店(4S)',
      key: 'repairShop',
      type: 'input',
      labelWidth: '85px',
      props: {
        placeholder: '请输入维修店名称',
        clearable: true
      }
    },
    {
      label: '备件所属库位',
      key: 'sparePartLocation',
      type: 'select',
      labelWidth: '110px',
      props: {
        options: (props.dictionaryOptions?.spareLocation || []).map(item => ({
          label: item.dictValue,
          value: item.keyValue
        })),
        placeholder: '请选择备件所属库位',
        clearable: true,
        style: { width: '100%' }
      }
    }
  ])

  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
