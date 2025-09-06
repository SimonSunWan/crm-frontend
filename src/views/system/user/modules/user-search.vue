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
  import { ref, computed, onMounted } from 'vue'
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

  import { RoleService } from '@/api/rolesApi'

  const statusOptions = [
    { label: '启用', value: true },
    { label: '禁用', value: false }
  ]

  const searchBarRef = ref()
  const roleList = ref<Array<{ label: string; value: string }>>([])
  const formData = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  })

  const rules = {}

  const formItems = computed(() => [
    {
      label: '账号',
      key: 'userName',
      type: 'input',
      placeholder: '请输入账号',
      clearable: true
    },
    { label: '姓名', key: 'nickName', type: 'input', placeholder: '请输入姓名', clearable: true },
    {
      label: '手机号',
      key: 'phone',
      type: 'input',
      props: { placeholder: '请输入手机号', clearable: true }
    },
    {
      label: '邮箱',
      key: 'email',
      type: 'input',
      props: { placeholder: '请输入邮箱', clearable: true }
    },
    {
      label: '角色',
      key: 'roleCode',
      type: 'select',
      props: {
        options: roleList.value,
        placeholder: '请选择角色',
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        options: statusOptions,
        placeholder: '请选择状态',
        clearable: true
      }
    }
  ])

  const getRoleList = async () => {
    try {
      const response = await RoleService.getAllRoles()
      if (response) {
        roleList.value = response.map((role: any) => ({
          label: role.roleName,
          value: role.roleCode
        }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  onMounted(() => {
    getRoleList()
  })

  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
