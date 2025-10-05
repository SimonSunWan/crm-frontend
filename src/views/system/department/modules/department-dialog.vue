<template>
  <ElDialog :title="dialogTitle" v-model="dialogVisible" width="500px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <!-- 父部门信息显示 -->
      <ElFormItem label="父部门" v-if="parentDepartmentInfo">
        <ElInput :value="parentDepartmentInfo.deptName" disabled></ElInput>
      </ElFormItem>

      <ElFormItem label="部门名称" prop="deptName">
        <ElInput v-model="formData.deptName" placeholder="请输入部门名称"></ElInput>
      </ElFormItem>

      <ElFormItem label="负责人" prop="leaderIds">
        <div class="user-selector-container" @click="showLeaderSelector = true">
          <div v-if="selectedLeaders.length === 0" class="placeholder">请选择负责人</div>
          <div v-else class="user-tags">
            <ElTag
              v-for="user in selectedLeaders"
              :key="user.id"
              closable
              @close.stop="removeLeader(user)"
              class="user-tag"
            >
              {{ user.nickName || user.userName }}
            </ElTag>
          </div>
          <ElIcon class="dropdown-icon"><ArrowDown /></ElIcon>
        </div>
      </ElFormItem>

      <ElFormItem label="部门成员" prop="memberIds">
        <div class="user-selector-container" @click="showMemberSelector = true">
          <div v-if="selectedMembers.length === 0" class="placeholder">请选择部门成员</div>
          <div v-else class="user-tags">
            <ElTag
              v-for="user in selectedMembers"
              :key="user.id"
              closable
              @close.stop="removeMember(user)"
              class="user-tag"
            >
              {{ user.nickName || user.userName }}
            </ElTag>
          </div>
          <ElIcon class="dropdown-icon"><ArrowDown /></ElIcon>
        </div>
      </ElFormItem>

      <ElFormItem label="排序" prop="sortOrder">
        <ElInputNumber
          v-model="formData.sortOrder"
          style="width: 100%"
          :min="1"
          controls-position="right"
        />
      </ElFormItem>

      <ElFormItem label="启用状态" prop="status">
        <ElSwitch v-model="formData.status"></ElSwitch>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="loading">确 定</ElButton>
      </span>
    </template>
  </ElDialog>

  <!-- 负责人选择器 -->
  <UserSelector
    v-model:visible="showLeaderSelector"
    :selected-user-ids="formData.leaderIds"
    @confirm="handleLeaderConfirm"
  />

  <!-- 成员选择器 -->
  <UserSelector
    v-model:visible="showMemberSelector"
    :selected-user-ids="formData.memberIds"
    @confirm="handleMemberConfirm"
  />
</template>

<script setup lang="ts">
  import { ArrowDown } from '@element-plus/icons-vue'
  import { UserService } from '@/api/usersApi'
  import UserSelector from '@/components/user-selector/index.vue'
  import type {
    DepartmentListItem,
    CreateDepartmentParams,
    UpdateDepartmentParams,
    UserListItem
  } from '@/types/api'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    departmentData?: DepartmentListItem
    parentId?: number | null
    isSubDepartment?: boolean
    departmentList?: DepartmentListItem[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: CreateDepartmentParams | UpdateDepartmentParams): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'add',
    departmentData: undefined,
    parentId: null,
    isSubDepartment: false,
    departmentList: () => []
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const loading = ref(false)
  const userOptions = ref<any[]>([])
  const showLeaderSelector = ref(false)
  const showMemberSelector = ref(false)
  const selectedLeaders = ref<UserListItem[]>([])
  const selectedMembers = ref<UserListItem[]>([])

  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const dialogTitle = computed(() => {
    if (props.isSubDepartment) {
      return '添加子部门'
    }
    return props.type === 'add' ? '添加部门' : '编辑部门'
  })

  const parentDepartmentInfo = computed(() => {
    if (!props.parentId || !props.departmentList) return null

    const findDepartment = (list: DepartmentListItem[], id: number): DepartmentListItem | null => {
      for (const item of list) {
        if (item.id === id) return item
        if (item.children) {
          const found = findDepartment(item.children, id)
          if (found) return found
        }
      }
      return null
    }

    return findDepartment(props.departmentList, props.parentId)
  })

  const formData = reactive<CreateDepartmentParams>({
    deptName: '',
    parentId: undefined,
    sortOrder: 1,
    leaderIds: [],
    memberIds: [],
    status: true
  })

  const rules = {
    deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
    sortOrder: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
  }

  const initFormData = () => {
    if (props.type === 'edit' && props.departmentData) {
      Object.assign(formData, {
        deptName: props.departmentData.deptName,
        parentId: props.departmentData.parentId,
        sortOrder: props.departmentData.sortOrder,
        leaderIds: props.departmentData.leaderIds || [],
        memberIds: props.departmentData.memberIds || [],
        status: props.departmentData.status
      })
      initSelectedUsers()
    } else {
      Object.assign(formData, {
        deptName: '',
        parentId: props.parentId || undefined,
        sortOrder: 1,
        leaderIds: [],
        memberIds: [],
        status: true
      })
      selectedLeaders.value = []
      selectedMembers.value = []
    }
  }

  const initSelectedUsers = () => {
    if (formData.leaderIds && formData.leaderIds.length > 0) {
      selectedLeaders.value = userOptions.value.filter(user =>
        formData.leaderIds!.includes(user.id)
      )
    } else {
      selectedLeaders.value = []
    }

    if (formData.memberIds && formData.memberIds.length > 0) {
      selectedMembers.value = userOptions.value.filter(user =>
        formData.memberIds!.includes(user.id)
      )
    } else {
      selectedMembers.value = []
    }
  }

  const getUserList = async () => {
    try {
      const response = await UserService.getUserList()
      userOptions.value = response.records || []
    } catch (error) {
      console.error(error)
    }
  }

  const handleLeaderConfirm = (users: UserListItem[]) => {
    selectedLeaders.value = users
    formData.leaderIds = users.map(user => user.id)
  }

  const handleMemberConfirm = (users: UserListItem[]) => {
    selectedMembers.value = users
    formData.memberIds = users.map(user => user.id)
  }

  const removeLeader = (user: UserListItem) => {
    selectedLeaders.value = selectedLeaders.value.filter(u => u.id !== user.id)
    formData.leaderIds = selectedLeaders.value.map(u => u.id)
  }

  const removeMember = (user: UserListItem) => {
    selectedMembers.value = selectedMembers.value.filter(u => u.id !== user.id)
    formData.memberIds = selectedMembers.value.map(u => u.id)
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      const submitData = { ...formData }
      emit('submit', submitData)
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  watch(dialogVisible, visible => {
    if (visible) {
      initFormData()
      getUserList()
    } else {
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }
  })

  watch(
    userOptions,
    () => {
      if (dialogVisible.value) {
        initSelectedUsers()
      }
    },
    { deep: true }
  )

  watch([() => props.type, () => props.departmentData, () => props.parentId], () => {
    if (dialogVisible.value) {
      initFormData()
    }
  })
</script>

<style scoped>
  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .user-selector-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    width: 100%;
    min-height: 32px;
    padding: 1px 8px;
    cursor: pointer;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    transition: border-color 0.2s;
  }

  .user-selector-container:hover {
    border-color: #c0c4cc;
  }

  .user-selector-container:focus-within {
    border-color: #409eff;
  }

  .placeholder {
    font-size: 14px;
    color: #c0c4cc;
  }

  .user-tags {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 4px;
  }

  .user-tag {
    margin: 0;
  }

  .dropdown-icon {
    position: absolute;
    top: 50%;
    right: 8px;
    font-size: 14px;
    color: #c0c4cc;
    transform: translateY(-50%);
  }
</style>
