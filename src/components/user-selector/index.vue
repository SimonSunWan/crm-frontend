<template>
  <ElDialog
    v-model="dialogVisible"
    title="选择用户"
    width="1000px"
    align-center
    :close-on-click-modal="false"
  >
    <div class="user-selector">
      <!-- 搜索区域 -->
      <div class="search-section">
        <ElForm :model="searchForm" inline>
          <ElFormItem label="账号">
            <ElInput
              v-model="searchForm.userName"
              placeholder="请输入账号"
              clearable
              style="width: 150px"
            />
          </ElFormItem>
          <ElFormItem label="姓名">
            <ElInput
              v-model="searchForm.nickName"
              placeholder="请输入姓名"
              clearable
              style="width: 150px"
            />
          </ElFormItem>
          <ElFormItem label="手机号">
            <ElInput
              v-model="searchForm.phone"
              placeholder="请输入手机号"
              clearable
              style="width: 150px"
            />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleSearch">搜索</ElButton>
            <ElButton @click="handleReset">重置</ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <!-- 主要内容区域 -->
      <div class="content-section">
        <!-- 左侧用户列表 -->
        <div class="user-list">
          <div class="list-header">
            <span>用户列表</span>
          </div>
          <div class="list-content">
            <ElTable
              ref="tableRef"
              :data="userList"
              :loading="loading"
              height="100%"
              @selection-change="handleSelectionChange"
            >
              <ElTableColumn type="selection" width="55" />
              <ElTableColumn prop="userName" label="账号" />
              <ElTableColumn prop="nickName" label="姓名" />
              <ElTableColumn prop="phone" label="手机号" />
              <ElTableColumn prop="status" label="状态">
                <template #default="{ row }">
                  <ElTag :type="row.status ? 'primary' : 'info'">
                    {{ row.status ? '启用' : '禁用' }}
                  </ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </div>

        <!-- 右侧已选用户 -->
        <div class="selected-users">
          <div class="selected-header">
            <span>已选用户 ({{ selectedUsers.length }})</span>
            <ElButton link @click="clearAll">清空</ElButton>
          </div>
          <div class="selected-content">
            <div v-if="selectedUsers.length === 0" class="empty-state">暂无选中用户</div>
            <div v-else class="user-tags">
              <ElTag
                v-for="user in selectedUsers"
                :key="user.id"
                closable
                @close="removeUser(user)"
                class="user-tag"
              >
                {{ user.nickName || user.userName }}
              </ElTag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirm">确认</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { UserService } from '@/api/usersApi'
  import type { UserListItem } from '@/types/api'

  interface Props {
    visible: boolean
    selectedUserIds?: number[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'confirm', users: UserListItem[]): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    selectedUserIds: () => []
  })

  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: value => emit('update:visible', value)
  })

  const tableRef = ref()
  const loading = ref(false)
  const userList = ref<UserListItem[]>([])
  const selectedUsers = ref<UserListItem[]>([])
  const allUsers = ref<UserListItem[]>([])

  const searchForm = ref({
    userName: '',
    nickName: '',
    phone: ''
  })

  const getUserList = async (searchParams?: any, updateAllUsers = false) => {
    try {
      loading.value = true
      const response = await UserService.getUserList(searchParams)
      userList.value = response.records || []

      if (updateAllUsers) {
        allUsers.value = response.records || []
        if (
          selectedUsers.value.length === 0 &&
          props.selectedUserIds &&
          props.selectedUserIds.length > 0
        ) {
          initSelectedUsers()
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    getUserList(searchForm.value)
  }

  const handleReset = async () => {
    const currentSelectedUsers = [...selectedUsers.value]

    searchForm.value = {
      userName: '',
      nickName: '',
      phone: ''
    }

    await getUserList({}, false)
    selectedUsers.value = currentSelectedUsers
    updateTableSelection()
  }

  const handleSelectionChange = (selection: UserListItem[]) => {
    const currentUserIds = userList.value.map(user => user.id)
    selectedUsers.value = selectedUsers.value.filter(user => !currentUserIds.includes(user.id))
    selectedUsers.value = [...selectedUsers.value, ...selection]
  }

  const removeUser = (user: UserListItem) => {
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id)
    updateTableSelection()
  }

  const clearAll = () => {
    selectedUsers.value = []
    if (tableRef.value && tableRef.value.clearSelection) {
      tableRef.value.clearSelection()
    }
  }

  const updateTableSelection = () => {
    nextTick(() => {
      if (tableRef.value && tableRef.value.toggleRowSelection) {
        const selectedIds = selectedUsers.value.map(user => user.id)
        userList.value.forEach(user => {
          const isSelected = selectedIds.includes(user.id)
          try {
            tableRef.value.toggleRowSelection(user, isSelected)
          } catch (error) {
            console.error(error)
          }
        })
      }
    })
  }

  const handleConfirm = () => {
    emit('confirm', selectedUsers.value)
    dialogVisible.value = false
  }

  const initSelectedUsers = () => {
    if (props.selectedUserIds && props.selectedUserIds.length > 0) {
      if (selectedUsers.value.length === 0) {
        const sourceUsers = allUsers.value.length > 0 ? allUsers.value : userList.value
        selectedUsers.value = sourceUsers.filter(user => props.selectedUserIds!.includes(user.id))
      }
    } else {
      selectedUsers.value = []
    }
  }

  watch(dialogVisible, async visible => {
    if (visible) {
      searchForm.value = {
        userName: '',
        nickName: '',
        phone: ''
      }
      const isFirstOpen = allUsers.value.length === 0
      await getUserList({}, isFirstOpen)
      initSelectedUsers()
      updateTableSelection()
    }
  })

  watch(
    userList,
    () => {
      updateTableSelection()
    },
    { deep: true }
  )

  watch(
    allUsers,
    () => {
      initSelectedUsers()
      updateTableSelection()
    },
    { deep: true }
  )
</script>

<style scoped>
  .user-selector {
    .search-section {
      padding: 16px;
      margin-bottom: 16px;
      background: #f5f7fa;
      border-radius: 4px;
    }

    .content-section {
      display: flex;
      gap: 16px;
      height: 500px;

      .user-list {
        flex: 1;
        border: 1px solid #dcdfe6;
        border-radius: 4px;

        .list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-weight: 500;
          background: #f5f7fa;
          border-bottom: 1px solid #dcdfe6;
        }

        .list-content {
          height: calc(100% - 42px);
        }
      }

      .selected-users {
        width: 300px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;

        .selected-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3.5px 16px;
          font-weight: 500;
          background: #f5f7fa;
          border-bottom: 1px solid #dcdfe6;
        }

        .selected-content {
          box-sizing: border-box;
          height: calc(100% - 42px);
          padding: 16px;
          overflow-y: auto;

          .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            font-size: 14px;
            color: #909399;
          }

          .user-tags {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .user-tag {
              width: fit-content;
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
</style>
