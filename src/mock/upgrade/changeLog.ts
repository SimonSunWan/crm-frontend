import { ref } from 'vue'

interface UpgradeLog {
  version: string
  title: string
  date: string
  detail?: string[]
  requireReLogin?: boolean
  remark?: string
}

export const upgradeLogList = ref<UpgradeLog[]>([])
