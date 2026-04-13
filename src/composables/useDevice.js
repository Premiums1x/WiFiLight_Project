/**
 * useDevice 组合式函数
 *
 * 封装所有与设备相关的状态和操作逻辑。
 * 扩展支持：连接切换、信号强度、运行时长计时、响应延迟等。
 */

import { ref, computed, onUnmounted } from 'vue'
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

  // 连接相关扩展状态
  const isConnected = ref(false)       // 前端连接状态（控制连接/断开）
  const signalStrength = ref('—')     // 信号强度
  const localIP = ref('—')            // 本地地址
  const pingLatency = ref('—')        // 响应延迟
  const uptimeSeconds = ref(0)        // 运行秒数
  let uptimeTimer = null              // 运行时长计时器

  // ============================================================
  // 计算属性
  // ============================================================

  /** 格式化运行时长 */
  const uptimeFormatted = computed(() => {
    const s = uptimeSeconds.value
    if (s <= 0) return '—'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return (h ? h + 'h ' : '') + (m ? m + 'm ' : '') + sec + 's'
  })

  /** 控制按钮是否应该被禁用 */
  const buttonDisabled = computed(() => {
    return loading.value || !isConnected.value
  })

  /** 按钮文案 */
  const buttonText = computed(() => {
    if (loading.value) return '执行中...'
    if (!isConnected.value) return '设备离线'
    return lightOn.value ? '关闭灯光' : '开启灯光'
  })

  // ============================================================
  // 方法
  // ============================================================

  /**
   * 启动运行时长计时器
   */
  function startUptimeTimer() {
    stopUptimeTimer()
    uptimeSeconds.value = 0
    uptimeTimer = setInterval(() => {
      uptimeSeconds.value++
    }, 1000)
  }

  /**
   * 停止运行时长计时器
   */
  function stopUptimeTimer() {
    if (uptimeTimer) {
      clearInterval(uptimeTimer)
      uptimeTimer = null
    }
    uptimeSeconds.value = 0
  }

  /**
   * 切换连接状态（前端模拟）
   */
  async function toggleConnection() {
    isConnected.value = !isConnected.value

    if (isConnected.value) {
      // 模拟连接成功 — 填入设备数据
      signalStrength.value = '-42 dBm（强）'
      localIP.value = '192.168.1.108'
      pingLatency.value = '18 ms'
      startUptimeTimer()

      // 尝试获取真实设备状态
      loading.value = true
      try {
        const res = await getDeviceStatus()
        deviceOnline.value = res.data.deviceOnline
        lightOn.value = res.data.lightOn
        updatedAt.value = res.data.updatedAt
      } catch {
        // 即使API失败也保持连接状态（模拟模式）
        deviceOnline.value = true
        lightOn.value = false
      } finally {
        loading.value = false
      }

      return { success: true, message: '控制器已连接' }
    } else {
      // 断开连接 — 清空数据
      signalStrength.value = '—'
      localIP.value = '—'
      pingLatency.value = '—'
      stopUptimeTimer()
      deviceOnline.value = false

      // 如果灯还开着，关掉
      if (lightOn.value) {
        lightOn.value = false
      }

      return { success: true, message: '控制器已断开' }
    }
  }

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
    if (buttonDisabled.value) return { success: false, message: '设备未连接' }

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

  // 组件卸载时清理计时器
  onUnmounted(() => {
    stopUptimeTimer()
  })

  return {
    // 状态
    deviceOnline,
    lightOn,
    updatedAt,
    loading,
    initialLoading,
    lastAction,
    error,
    // 连接扩展
    isConnected,
    signalStrength,
    localIP,
    pingLatency,
    uptimeSeconds,
    uptimeFormatted,
    // 计算属性
    buttonDisabled,
    buttonText,
    // 方法
    fetchStatus,
    toggleLight,
    toggleConnection,
    refreshStatus
  }
}
