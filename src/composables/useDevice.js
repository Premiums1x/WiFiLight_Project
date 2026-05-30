import { computed, onUnmounted, ref } from 'vue'
import { getDeviceStatus, turnLightOff, turnLightOn } from '@/api/device'

const THEME_STORAGE_KEY = 'wifi-light-theme'

function createDefaultTelemetry() {
  return {
    signalDbm: -45,
    latencyMs: 12,
    uptimeSeconds: 0,
    ipAddress: '192.168.12.1'
  }
}

function getStoredTheme() {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return storedTheme === 'light' ? 'light' : 'dark'
}

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

export function useDevice() {
  const systemOnline = ref(false)
  const lightOn = ref(false)
  const telemetry = ref(createDefaultTelemetry())
  const theme = ref(getStoredTheme())
  const loading = ref(false)
  const initialLoading = ref(true)
  const lastSyncAt = ref('')
  const error = ref('')

  let uptimeTimer = null

  const signalDisplay = computed(() => `${telemetry.value.signalDbm}dBm`)
  const latencyDisplay = computed(() => `${telemetry.value.latencyMs}ms`)
  const uptimeDisplay = computed(() => formatUptimeClock(telemetry.value.uptimeSeconds))
  const ipDisplay = computed(() => telemetry.value.ipAddress)
  const lightActive = computed(() => lightOn.value)

  function persistTheme(nextTheme) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }
  }

  function stopUptimeTimer() {
    if (uptimeTimer) {
      clearInterval(uptimeTimer)
      uptimeTimer = null
    }
  }

  function startUptimeTimer() {
    stopUptimeTimer()

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

  function setTheme(nextTheme) {
    theme.value = nextTheme === 'light' ? 'light' : 'dark'
    persistTheme(theme.value)
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

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
