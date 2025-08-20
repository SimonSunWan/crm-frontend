<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
    <!-- 自定义状态字典下拉框 -->
    <template #status="{ modelValue }">
      <art-select
        :model-value="modelValue.status"
        @update:model-value="
          (value: string | string[] | undefined) =>
            $emit('update:modelValue', { ...modelValue, status: value })
        "
        dict-code="USER_STATUS"
        placeholder="请选择状态"
        :clearable="true"
        :filterable="true"
      />
    </template>
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import ArtSelect from '@/components/core/forms/art-select/index.vue'

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

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {}

  // 表单配置
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
      span: 6
    }
  ])

  // 事件
  function handleReset() {
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
  }
</script>
