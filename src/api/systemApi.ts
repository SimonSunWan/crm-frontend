import request from '@/utils/http'

export interface SystemSetting {
  id: number
  settingKey: string
  settingValue: string
  settingName: string
  settingDesc?: string
  status: boolean
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
}

export class SystemService {
  static getSystemSetting(settingKey: string) {
    return request.get<SystemSetting>({
      url: `/system/${settingKey}`
    })
  }
}
