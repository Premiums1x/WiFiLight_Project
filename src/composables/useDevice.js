/**
 * useDevice 组合式函数
 *
 * 封装所有与设备相关的状态和操作逻辑，让页面组件保持简洁。
 * 包含：状态管理、获取状态、切换灯、loading 控制、消息反馈。
 */

import { ref, computed } from 'vue'
import { getDeviceStatus, turnLightOn, turnLightOff } from '@/api/device'

export function useDevice() {
  // ============================================================
  // 响应式状态
  // ============================================================
  const deviceOnline = ref(false)     // 设备是否在线
  const lightOn = ref(false)          // 灯是否打开
  const updatedAt = ref('')           // 最后更新时间
  const loading = ref(false)          // 是否正在请求中
  const initialLoading = ref(true)    // 首次加载中（全屏 loading）
  const lastAction = ref('')          // 最近一次操作结果
  const error = ref('')               // 当前错误信息

  // ============================================================
  // 计算属性
  // ============================================================

  /** 控制按钮是否应该被禁用 */
  const buttonDisabled = computed(() => {
    return loading.value || !deviceOnline.value
  })

  /** 按钮文案 */
  const buttonText = computed(() => {
    if (loading.value) return '执行中...'
    if (!deviceOnline.value) return '设备离线'
    return lightOn.value ? '关闭灯光' : '开启灯光'
  })

  // ============================================================
  // 方法
  // ============================================================

  /**
   * 获取设备状态
   * @param {boolean} isInit 是否为初始加载
   */
  async function fetchStatus(isInit = false) {
    if (isInit) {
      initialLoading.value = true
    }
    loading.value = true
    error.value = ''

    try {
      const res = await getDeviceStatus()
      deviceOnline.value = res.data.deviceOnline
      lightOn.value = res.data.lightOn
      updatedAt.value = res.data.updatedAt
      if (!isInit) {
        lastAction.value = '状态刷新成功'
      }
    } catch (err) {
      error.value = err.message || '获取状态失败'
      lastAction.value = '状态获取失败'
      // 获取失败时设置为离线状态
      deviceOnline.value = false
    } finally {
      loading.value = false
      initialLoading.value = false
    }
  }

  /**
   * 切换灯的状态
   */
  async function toggleLight() {
    if (buttonDisabled.value) return

    loading.value = true
    error.value = ''

    try {
      const res = lightOn.value
        ? await turnLightOff()
        : await turnLightOn()

      // 更新状态
      lightOn.value = res.data.lightOn
      updatedAt.value = res.data.updatedAt
      lastAction.value = res.message

      return { success: true, message: res.message }
    } catch (err) {
      error.value = err.message || '操作失败'
      lastAction.value = err.message || '操作失败'

      return { success: false, message: err.message || '操作失败' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新状态
   */
  async function refreshStatus() {
    await fetchStatus(false)
    return {
      success: !error.value,
      message: error.value || '状态已刷新'
    }
  }

  return {
    // 状态
    deviceOnline,
    lightOn,
    updatedAt,
    loading,
    initialLoading,
    lastAction,
    error,
    // 计算属性
    buttonDisabled,
    buttonText,
    // 方法
    fetchStatus,
    toggleLight,
    refreshStatus
  }
}
