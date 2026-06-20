import { computed, onUnmounted, ref } from 'vue'
import { getDeviceStatus, turnLightOff, turnLightOn } from '@/api/device'

// ============================================
// 本地存储键名
// ============================================
const THEME_STORAGE_KEY = 'wifi-light-theme'

// ============================================
// 创建默认遥测数据
// 用于设备离线时显示的占位数据
// ============================================
function createDefaultTelemetry() {
  return {
    signalDbm: -45,       // 信号强度 (dBm)
    latencyMs: 12,         // 延迟 (ms)
    uptimeSeconds: 0,      // 运行秒数
    ipAddress: '192.168.12.1'  // 默认 IP
  }
}

// ============================================
// 从 localStorage 读取主题设置
// ============================================
function getStoredTheme() {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return storedTheme === 'light' ? 'light' : 'dark'
}

// ============================================
// 格式化运行时长为时钟格式
// @param {number} totalSeconds - 总秒数
// @returns {string} 格式：HH:mm 或 mm:ss
// ============================================
function formatUptimeClock(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// ============================================
// 设备状态管理 Composable
// 管理设备连接、灯光状态、遥测数据、主题设置
// ============================================
export function useDevice() {
  // 系统在线状态
  const systemOnline = ref(false)
  // 灯光开启状态
  const lightOn = ref(false)
  // 遥测数据（信号、延迟、运行时长、IP）
  const telemetry = ref(createDefaultTelemetry())
  // 当前主题
  const theme = ref(getStoredTheme())
  // 操作加载状态
  const loading = ref(false)
  // 初始加载状态（页面首次加载）
  const initialLoading = ref(true)
  // 最后同步时间
  const lastSyncAt = ref('')
  // 错误信息
  const error = ref('')

  // 运行时长定时器
  let uptimeTimer = null

  // 计算属性：信号强度显示文本
  const signalDisplay = computed(() => `${telemetry.value.signalDbm}dBm`)
  // 计算属性：延迟显示文本
  const latencyDisplay = computed(() => `${telemetry.value.latencyMs}ms`)
  // 计算属性：运行时长显示文本
  const uptimeDisplay = computed(() => formatUptimeClock(telemetry.value.uptimeSeconds))
  // 计算属性：IP 地址显示文本
  const ipDisplay = computed(() => telemetry.value.ipAddress)
  // 计算属性：灯光是否激活
  const lightActive = computed(() => lightOn.value)

  // ============================================
  // 将主题设置持久化到 localStorage
  // ============================================
  function persistTheme(nextTheme) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }
  }

  // ============================================
  // 停止运行时长定时器
  // ============================================
  function stopUptimeTimer() {
    if (uptimeTimer) {
      clearInterval(uptimeTimer)
      uptimeTimer = null
    }
  }

  // ============================================
  // 启动运行时长定时器（每秒递增）
  // ============================================
  function startUptimeTimer() {
    stopUptimeTimer()

    // 仅在系统在线时启动
    if (!systemOnline.value) {
      return
    }

    uptimeTimer = setInterval(() => {
      telemetry.value = {
        ...telemetry.value,
        uptimeSeconds: telemetry.value.uptimeSeconds + 1
      }
    }, 1000)
  }

  // ============================================
  // 同步设备状态到本地状态
  // @param {object} payload - API 返回的状态数据
  // ============================================
  function syncState(payload) {
    const nextTelemetry = payload?.telemetry || createDefaultTelemetry()

    systemOnline.value = Boolean(payload?.systemOnline)
    lightOn.value = systemOnline.value && Boolean(payload?.lightOn)
    lastSyncAt.value = payload?.updatedAt || ''
    telemetry.value = {
      signalDbm: Number(nextTelemetry.signalDbm ?? -45),
      latencyMs: Number(nextTelemetry.latencyMs ?? 12),
      uptimeSeconds: Number(nextTelemetry.uptimeSeconds ?? 0),
      ipAddress: nextTelemetry.ipAddress || '192.168.12.1'
    }

    // 根据在线状态启动/停止定时器
    if (systemOnline.value) {
      startUptimeTimer()
    } else {
      stopUptimeTimer()
      telemetry.value = {
        ...telemetry.value,
        uptimeSeconds: 0
      }
      lightOn.value = false
    }
  }

  // ============================================
  // 应用离线状态
  // ============================================
  function applyOfflineState() {
    systemOnline.value = false
    lightOn.value = false
    lastSyncAt.value = ''
    stopUptimeTimer()
    telemetry.value = {
      ...createDefaultTelemetry(),
      ipAddress: telemetry.value.ipAddress || '192.168.12.1'
    }
  }

  // ============================================
  // 获取设备状态
  // @param {boolean} isInit - 是否为初始加载
  // ============================================
  async function fetchStatus(isInit = false) {
    if (isInit) {
      initialLoading.value = true
    }

    loading.value = true
    error.value = ''

    try {
      const response = await getDeviceStatus()
      syncState(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.message || '获取状态失败'
      applyOfflineState()
      return { success: false, message: error.value }
    } finally {
      loading.value = false
      initialLoading.value = false
    }
  }

  // ============================================
  // 切换灯光状态
  // ============================================
  async function toggleLight() {
    if (!systemOnline.value) {
      return {
        success: false,
        type: 'warning',
        icon: 'warning',
        message: '无法控制：请先连接远程服务器'
      }
    }

    loading.value = true
    error.value = ''

    try {
      const response = lightOn.value ? await turnLightOff() : await turnLightOn()
      syncState(response.data)

      return {
        success: true,
        message: response.message,
        icon: lightActive.value ? 'light-on' : 'light-off',
        type: lightActive.value ? 'success' : 'default'
      }
    } catch (err) {
      error.value = err.message || '操作失败'
      applyOfflineState()
      return { success: false, message: error.value, type: 'error', icon: 'disconnect' }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // 设置主题
  // ============================================
  function setTheme(nextTheme) {
    theme.value = nextTheme === 'light' ? 'light' : 'dark'
    persistTheme(theme.value)
  }

  // ============================================
  // 切换主题（深色 <-> 浅色）
  // ============================================
  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopUptimeTimer()
  })

  return {
    systemOnline,
    lightOn,
    lightActive,
    telemetry,
    theme,
    loading,
    initialLoading,
    lastSyncAt,
    error,
    signalDisplay,
    latencyDisplay,
    uptimeDisplay,
    ipDisplay,
    fetchStatus,
    toggleLight,
    toggleTheme,
    setTheme
  }
}
