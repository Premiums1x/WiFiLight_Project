/**
 * useToast 组合式函数
 *
 * 提供统一的消息提示功能：成功、失败、信息三种类型。
 * 消息会自动在指定时间后消失。
 */

import { ref } from 'vue'

// 消息队列（全局共享）
const toasts = ref([])
let toastId = 0

/**
 * 添加一条消息
 * @param {string} message 消息内容
 * @param {'success'|'error'|'info'} type 消息类型
 * @param {number} duration 显示时长（毫秒）
 */
function addToast(message, type = 'info', duration = 3000) {
  const id = ++toastId
  toasts.value.push({ id, message, type, visible: true })

  // 自动移除
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value[index].visible = false
      // 等动画结束再真正移除
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }, duration)
}

export function useToast() {
  function success(message, duration) {
    addToast(message, 'success', duration)
  }

  function error(message, duration) {
    addToast(message, 'error', duration)
  }

  function info(message, duration) {
    addToast(message, 'info', duration)
  }

  return {
    toasts,
    success,
    error,
    info
  }
}
