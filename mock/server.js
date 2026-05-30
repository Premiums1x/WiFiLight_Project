/**
 * Mock 服务器 —— 模拟 NodeMCU (ESP8266) 设备接口
 *
 * 启动一个 Express HTTP 服务器，监听 3001 端口，提供以下能力：
 * - GET /status            返回完整设备状态快照
 * - GET /on                模拟打开灯
 * - GET /off               模拟关闭灯
 * - GET /mock/set-offline  模拟设备离线
 * - GET /mock/set-online   模拟设备上线
 * - GET /mock/set-fail     开启失败模拟
 * - GET /mock/set-normal   关闭失败模拟
 */

import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001
const DEFAULT_IP = '192.168.4.1'

app.use(cors())

const deviceState = {
  systemOnline: true,
  lightOn: false,
  updatedAt: getNow(),
  onlineStartedAt: Date.now(),
  accumulatedUptimeSeconds: 0,
  telemetry: {
    signalDbm: -45,
    latencyMs: 12,
    ipAddress: DEFAULT_IP
  }
}

let simulateFailure = false

function getNow() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getUptimeSeconds() {
  if (!deviceState.systemOnline) {
    return 0
  }

  const elapsed = Math.floor((Date.now() - deviceState.onlineStartedAt) / 1000)
  return deviceState.accumulatedUptimeSeconds + Math.max(0, elapsed)
}

function jitterTelemetry() {
  if (!deviceState.systemOnline) {
    return
  }

  const nextSignal = deviceState.telemetry.signalDbm + Math.floor(Math.random() * 5) - 2
  const nextLatency = deviceState.telemetry.latencyMs + Math.floor(Math.random() * 5) - 2

  deviceState.telemetry.signalDbm = Math.max(-68, Math.min(-38, nextSignal))
  deviceState.telemetry.latencyMs = Math.max(8, Math.min(28, nextLatency))
}

function syncUpdatedAt() {
  deviceState.updatedAt = getNow()
}

function setLightOn(nextOn) {
  deviceState.lightOn = nextOn
  syncUpdatedAt()
}

function setSystemOnline(nextOnline) {
  if (nextOnline === deviceState.systemOnline) {
    syncUpdatedAt()
    return
  }

  if (nextOnline) {
    deviceState.systemOnline = true
    deviceState.onlineStartedAt = Date.now()
  } else {
    deviceState.accumulatedUptimeSeconds = getUptimeSeconds()
    deviceState.systemOnline = false
    deviceState.lightOn = false
    deviceState.accumulatedUptimeSeconds = 0
  }

  syncUpdatedAt()
}

function buildDevicePayload() {
  jitterTelemetry()

  return {
    systemOnline: deviceState.systemOnline,
    lightOn: deviceState.systemOnline ? deviceState.lightOn : false,
    updatedAt: deviceState.updatedAt,
    telemetry: {
      signalDbm: deviceState.telemetry.signalDbm,
      latencyMs: deviceState.telemetry.latencyMs,
      uptimeSeconds: getUptimeSeconds(),
      ipAddress: deviceState.telemetry.ipAddress
    }
  }
}

app.get('/status', async (req, res) => {
  await delay(300 + Math.random() * 500)

  if (simulateFailure) {
    return res.status(500).json({
      success: false,
      message: '设备通信异常，无法获取状态',
      data: null
    })
  }

  res.json({
    success: true,
    data: buildDevicePayload()
  })
})

app.get('/on', async (req, res) => {
  await delay(300 + Math.random() * 500)

  if (simulateFailure) {
    return res.status(500).json({
      success: false,
      message: '操作失败：设备未响应',
      data: null
    })
  }

  if (!deviceState.systemOnline) {
    return res.json({
      success: false,
      message: '操作失败：设备当前离线',
      data: null
    })
  }

  setLightOn(true)

  res.json({
    success: true,
    message: '灯已打开',
    data: buildDevicePayload()
  })
})

app.get('/off', async (req, res) => {
  await delay(300 + Math.random() * 500)

  if (simulateFailure) {
    return res.status(500).json({
      success: false,
      message: '操作失败：设备未响应',
      data: null
    })
  }

  if (!deviceState.systemOnline) {
    return res.json({
      success: false,
      message: '操作失败：设备当前离线',
      data: null
    })
  }

  setLightOn(false)

  res.json({
    success: true,
    message: '灯已关闭',
    data: buildDevicePayload()
  })
})

app.get('/mock/set-offline', (req, res) => {
  setSystemOnline(false)
  console.log('🔴 设备已设置为【离线】')
  res.json({
    success: true,
    message: '设备已设置为离线',
    data: buildDevicePayload()
  })
})

app.get('/mock/set-online', (req, res) => {
  setSystemOnline(true)
  console.log('🟢 设备已设置为【在线】')
  res.json({
    success: true,
    message: '设备已设置为在线',
    data: buildDevicePayload()
  })
})

app.get('/mock/set-fail', (req, res) => {
  simulateFailure = true
  console.log('⚠️ 已开启【失败模拟】模式')
  res.json({ success: true, message: '失败模拟已开启' })
})

app.get('/mock/set-normal', (req, res) => {
  simulateFailure = false
  console.log('✅ 已关闭失败模拟，恢复【正常】模式')
  res.json({ success: true, message: '失败模拟已关闭，恢复正常' })
})

app.listen(PORT, () => {
  console.log('')
  console.log('='.repeat(50))
  console.log('  Mock 设备服务已启动')
  console.log(`  地址: http://localhost:${PORT}`)
  console.log('='.repeat(50))
  console.log('')
  console.log('  可用接口:')
  console.log('  ├─ GET /status            获取设备状态')
  console.log('  ├─ GET /on                打开灯')
  console.log('  ├─ GET /off               关闭灯')
  console.log('  ├─ GET /mock/set-offline  模拟设备离线')
  console.log('  ├─ GET /mock/set-online   模拟设备上线')
  console.log('  ├─ GET /mock/set-fail     开启失败模拟')
  console.log('  └─ GET /mock/set-normal   关闭失败模拟')
  console.log('')
})
