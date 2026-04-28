// src/utils/loading.js
import { ElLoading } from 'element-plus'

let loadingInstance = null

export const useGlobalLoading = () => {
  const open = (options = {}) => {
    if (loadingInstance) {
      return
    }
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.2)',
      ...options
    })
  }

  const close = () => {
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
  }

  return {
    open,
    close
  }
}

// 默认导出全局实例
const globalLoading = useGlobalLoading()
export default globalLoading