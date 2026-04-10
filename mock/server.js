/**
 * Mock 服务器 —— 模拟 NodeMCU (ESP8266) 设备接口
 *
 * 【什么是 Mock？】
 * Mock 就是"模拟"的意思。在你还没有真实硬件（NodeMCU + 继电器 + 灯）的时候，
 * 我们用一个小型 Node.js 服务来"假装"自己是那个硬件设备，
 * 对前端发来的请求返回和真实设备一样格式的数据。
 *
 * 【为什么需要 Mock？】
 * 1. 你现在没有 NodeMCU，但前端代码需要调接口才能开发和调试
 * 2. Mock 让你可以在没有硬件的情况下完成前端所有功能的开发和测试
 * 3. 等你拿到真实硬件后，只需要把请求地址从 Mock 切换到 NodeMCU 的 IP 即可
 *
 * 【这个文件做了什么？】
 * 启动一个 Express HTTP 服务器，监听 3001 端口，提供三个接口：
 * - GET /status  → 返回设备在线状态和灯的开关状态
 * - GET /on      → 模拟打开灯
 * - GET /off     → 模拟关闭灯
 *
 * 【如何启动？】
 * 在项目根目录运行：node mock/server.js
 * 或者使用：npm run mock
 * 或者同时启动前端和 Mock：npm run start
 */

import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

// 允许跨域请求（开发阶段需要，未来部署时可能不需要）
app.use(cors())

// ============================================================
// 模拟设备状态（相当于 NodeMCU 的内存中的状态）
// ============================================================
const deviceState = {
  deviceOnline: true,  // 设备是否在线
  lightOn: false,      // 灯是否打开
  updatedAt: getNow()  // 最后一次状态更新时间
}

// ============================================================
// 失败模拟开关 —— 用于测试前端的错误处理能力
// ============================================================
// 你可以通过请求 GET /mock/set-offline 和 GET /mock/set-online 来切换设备在线状态
// 你可以通过请求 GET /mock/set-fail 和 GET /mock/set-normal 来切换是否模拟请求失败
let simulateFailure = false

/**
 * 获取当前时间的格式化字符串
 */
function getNow() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

/**
 * 模拟网络延迟（让前端能看到 loading 效果）
 * @param {number} ms 延迟毫秒数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================
// 接口定义
// ============================================================

/**
 * GET /status
 * 获取设备当前状态
 * 对应未来真实 NodeMCU 的 http://<NodeMCU-IP>/status
 */
app.get('/status', async (req, res) => {
  // 模拟网络延迟 300~800ms
  await delay(300 + Math.random() * 500)

  // 如果开启了失败模拟
  if (simulateFailure) {
    return res.status(500).json({
      success: false,
      message: '设备通信异常，无法获取状态',
      data: null
    })
  }

  // 如果设备离线
  if (!deviceState.deviceOnline) {
    return res.json({
      success: true,
      data: {
        deviceOnline: false,
        lightOn: false,
        updatedAt: deviceState.updatedAt
      }
    })
  }

  // 正常返回
  res.json({
    success: true,
    data: {
      deviceOnline: deviceState.deviceOnline,
      lightOn: deviceState.lightOn,
      updatedAt: deviceState.updatedAt
    }
  })
})

/**
 * GET /on
 * 打开灯
 * 对应未来真实 NodeMCU 的 http://<NodeMCU-IP>/on
 */
app.get('/on', async (req, res) => {
  await delay(300 + Math.random() * 500)

  if (simulateFailure) {
    return res.status(500).json({
      success: false,
      message: '操作失败：设备未响应',
      data: null
    })
  }

  if (!deviceState.deviceOnline) {
    return res.json({
      success: false,
      message: '操作失败：设备当前离线',
      data: null
    })
  }

  // 执行开灯
  deviceState.lightOn = true
  deviceState.updatedAt = getNow()

  res.json({
    success: true,
    message: '灯已打开',
    data: {
      lightOn: true,
      updatedAt: deviceState.updatedAt
    }
  })
})

/**
 * GET /off
 * 关闭灯
 * 对应未来真实 NodeMCU 的 http://<NodeMCU-IP>/off
 */
app.get('/off', async (req, res) => {
  await delay(300 + Math.random() * 500)

  if (simulateFailure) {
    return res.status(500).json({
      success: false,
      message: '操作失败：设备未响应',
      data: null
    })
  }

  if (!deviceState.deviceOnline) {
    return res.json({
      success: false,
      message: '操作失败：设备当前离线',
      data: null
    })
  }

  // 执行关灯
  deviceState.lightOn = false
  deviceState.updatedAt = getNow()

  res.json({
    success: true,
    message: '灯已关闭',
    data: {
      lightOn: false,
      updatedAt: deviceState.updatedAt
    }
  })
})

// ============================================================
// Mock 控制接口 —— 仅用于开发调试，未来删除
// ============================================================

/** 模拟设备离线 */
app.get('/mock/set-offline', (req, res) => {
  deviceState.deviceOnline = false
  deviceState.updatedAt = getNow()
  console.log('🔴 设备已设置为【离线】')
  res.json({ success: true, message: '设备已设置为离线' })
})

/** 模拟设备上线 */
app.get('/mock/set-online', (req, res) => {
  deviceState.deviceOnline = true
  deviceState.updatedAt = getNow()
  console.log('🟢 设备已设置为【在线】')
  res.json({ success: true, message: '设备已设置为在线' })
})

/** 开启失败模拟 */
app.get('/mock/set-fail', (req, res) => {
  simulateFailure = true
  console.log('⚠️ 已开启【失败模拟】模式')
  res.json({ success: true, message: '失败模拟已开启' })
})

/** 关闭失败模拟 */
app.get('/mock/set-normal', (req, res) => {
  simulateFailure = false
  console.log('✅ 已关闭失败模拟，恢复【正常】模式')
  res.json({ success: true, message: '失败模拟已关闭，恢复正常' })
})

// ============================================================
// 启动服务
// ============================================================
app.listen(PORT, () => {
  console.log('')
  console.log('='.repeat(50))
  console.log('  🌐 Mock 设备服务已启动')
  console.log(`  📡 地址: http://localhost:${PORT}`)
  console.log('='.repeat(50))
  console.log('')
  console.log('  可用接口:')
  console.log('  ├─ GET /status          获取设备状态')
  console.log('  ├─ GET /on              打开灯')
  console.log('  ├─ GET /off             关闭灯')
  console.log('  ├─ GET /mock/set-offline 模拟设备离线')
  console.log('  ├─ GET /mock/set-online  模拟设备上线')
  console.log('  ├─ GET /mock/set-fail    开启失败模拟')
  console.log('  └─ GET /mock/set-normal  关闭失败模拟')
  console.log('')
})
