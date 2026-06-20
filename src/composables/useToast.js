import { ref } from 'vue'

// ============================================
// Toast 状态管理
// ============================================
// 全局唯一的 toast 状态
const toast = ref({
  visible: false,
  message: '',
  type: 'default',  // success | error | warning | default
  icon: ''          // connect | disconnect | light-on | light-off | warning
})

// 自动关闭定时器
let toastTimer = null

// ============================================
// 显示 Toast 消息
// @param {string} message - 显示的文本
// @param {string} type - 消息类型
// @param {string} icon - 图标类型
// ============================================
function showToast(message, type = 'default', icon = '') {
  toast.value = {
    visible: true,
    message,
    type,
    icon
  }

  // 重置定时器，避免重复关闭
  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  // 2.5 秒后自动隐藏
  toastTimer = setTimeout(() => {
    toast.value = {
      ...toast.value,
      visible: false
    }
  }, 2500)
}

// ============================================
// Toast 组合式函数
// 提供 success / error / warning / info 快捷方法
// ============================================
export function useToast() {
  return {
    toast,
    showToast,
    success(message, icon = 'connect') {
      showToast(message, 'success', icon)
    },
    error(message, icon = 'disconnect') {
      showToast(message, 'error', icon)
    },
    warning(message, icon = 'warning') {
      showToast(message, 'warning', icon)
    },
    info(message, icon = '') {
      showToast(message, 'default', icon)
    }
  }
}
