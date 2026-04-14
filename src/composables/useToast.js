import { ref } from 'vue'

const toast = ref({
  visible: false,
  message: '',
  type: 'default',
  icon: ''
})

let toastTimer = null

function showToast(message, type = 'default', icon = '') {
  toast.value = {
    visible: true,
    message,
    type,
    icon
  }

  if (toastTimer) {
    clearTimeout(toastTimer)
  }

  toastTimer = setTimeout(() => {
    toast.value = {
      ...toast.value,
      visible: false
    }
  }, 2500)
}

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
