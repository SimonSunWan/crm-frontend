import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true'
})

axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', accessToken)
    return request
  },
  error => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<Api.Http.BaseResponse>) => {
    const { code, message } = response.data
    if (code === 200) return response
    throw new Error(message || '请求失败')
  },
  error => {
    if (error.response?.status === 401) {
      setTimeout(() => {
        useUserStore().logOut()
      }, LOGOUT_DELAY)
    }
    return Promise.reject(error)
  }
)

async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  try {
    const res = await axiosInstance.request<Api.Http.BaseResponse<T>>(config)
    return res.data.data as T
  } catch (error) {
    if (config.showErrorMessage !== false) {
      let errorMessage = '请求失败'

      if (error instanceof Error) {
        const responseData = (error as any).response?.data

        if (responseData) {
          // 兼容标准API错误格式 {message: "错误信息"}
          if (responseData.message) {
            errorMessage = responseData.message
          }
          // 兼容REST API错误格式 {detail: "错误信息"}
          else if (responseData.detail) {
            errorMessage = responseData.detail
          }
        }
      }

      ElMessage.error(errorMessage)
    }
    return Promise.reject(error)
  }
}

const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>(config)
  }
}

export default api
