<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  ></ArtSearchBar>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const statusOptions = [
    { label: '启用', value: true },
    { label: '禁用', value: false }
  ]

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  })

  const rules = {}

  const formItems = computed(() => [
    { label: '用户名', key: 'name', type: 'input', placeholder: '请输入用户名', clearable: true },
    {
      label: '手机号',
      key: 'phone',
      type: 'input',
      props: { placeholder: '请输入手机号', maxlength: '11' }
    },
    {
      label: '邮箱',
      key: 'email',
      type: 'input',
      props: { placeholder: '请输入邮箱' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        options: statusOptions
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
