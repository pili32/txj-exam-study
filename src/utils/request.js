
import axios from "axios";
import { getToken, removeToken } from '@/utils/auth'
import storage from '@/utils/storage'
import router from "@/router"; // 导入路由实例
const baseURL =  import.meta.env.VITE_API_BASE_URL || '/api';  //vue3的使用pinia方法  import.meta.env.VITE_API_BASE_URL
const service = axios.create({
  baseURL: baseURL,
  timeout: 10000 // request timeout
})
//请求拦截器
service.interceptors.request.use(
  config => {

    if (getToken() && getToken() !== 'undefined') config.headers['Authorization'] = getToken()
    else config.headers['Authorization'] = ''
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
//相应拦截器
service.interceptors.response.use(
  async response => {
    const res = response.data
    // res.code = 101
    if (res.code !== 200) {
      console.error(res)
      if (res.code === 401) {

        ElMessage({
          message: '登录过期，请重新登录',
          type: 'error',
          duration: 2 * 1000
        })
        router.push(`/login`);

        setTimeout(() => {
          removeToken()
          storage.clearAllLocalStorage()
        }, 2000);

      } else if (res.code === 500) {
        ElMessage({
          message: '系统错误',
          type: 'error',
          duration:2 * 1000
        })


      } else if (res.code === 101) {
        ElMessage({
          message: '操作失败',
          type: 'error',
          duration: 2 * 1000
        })

      } else if (res.code === 102) {
        ElMessage({
          message: res.msg,
          type: 'error',
          duration: 2 * 1000
        })

      }
      return Promise.reject(res )

    } else {
      return res
    }

  },
  error => {
    ElMessage({
      message: '请求超时，请稍后再试!',
      type: 'error',
      duration: 2* 1000
    })
    return Promise.reject(error)

  }
)

export default service
