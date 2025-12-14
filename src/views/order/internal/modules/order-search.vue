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
  import { ref, computed, watch } from 'vue'
  import ArtSearchBar from '@/components/forms/art-search-bar/index.vue'
  import type { SearchFormItem } from '@/components/forms/art-search-bar/index.vue'
  import { cascaderProps } from '../utils/dictionaryUtils'
  import { useUserStore } from '@/store/modules/user'

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

  const userStore = useUserStore()

// 根据角色获取项目类型配置
const getProjectTypeConfigByRole = () => {
  const roles = userStore.getUserInfo.roles || []
  
  // 只有一个角色时进行特殊处理
  if (roles.length === 1) {
    const roleCode = roles[0]
    let projectTypeValue = ''
    let isDisabled = false
    
    switch (roleCode) {
      case 'cycwf':
        projectTypeValue = 'cy'
        isDisabled = true
        break
      case 'sycwf':
        projectTypeValue = 'sy'
        isDisabled = true
        break
      case 'cnwf':
        projectTypeValue = 'cn'
        isDisabled = true
        break
    }
    
    return { projectTypeValue, isDisabled }
  }
  
  return { projectTypeValue: '', isDisabled: false }
}

// 根据角色设置项目类型值
const setProjectTypeByRole = () => {
  const { projectTypeValue, isDisabled } = getProjectTypeConfigByRole()
  
  if (projectTypeValue) {
    emit('update:modelValue', {
      ...props.modelValue,
      projectType: projectTypeValue
    })
  }
}

// 监听角色变化，自动设置项目类型
watch(() => userStore.getUserInfo.roles, () => {
  setProjectTypeByRole()
}, { immediate: true })

const formItems = computed((): SearchFormItem[] => {
  const { isDisabled } = getProjectTypeConfigByRole()
  
  return [
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
      label: '项目类型',
      key: 'projectType',
      type: 'select',
      labelWidth: '70px',
      props: {
        options: (props.dictionaryOptions?.projectType || []).map(item => ({
          label: item.dictValue,
          value: item.keyValue
        })),
        placeholder: '请选择项目类型',
        clearable: !isDisabled,
        disabled: isDisabled,
        style: { width: '100%' }
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
  ]
})

  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
