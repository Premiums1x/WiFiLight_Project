/**
 * Axios 实例配置
 *
 * 【这个文件做了什么？】
 * 1. 创建一个统一的 Axios 实例，所有请求都通过它发出
 * 2. 配置 baseURL —— 所有请求都以 /api 开头，Vite 会代理到真实设备地址
 * 3. 配置 timeout —— 超时自动取消请求
 * 4. 配置请求拦截器 —— 在请求发出前做统一处理
 * 5. 配置响应拦截器 —— 在响应返回后做统一处理和错误捕获
 *
 * 【当前如何连接真实设备？】
 * 1. 保持 baseURL = '/api'
 * 2. 在 vite.config.js 中通过 VITE_DEVICE_TARGET 指向 Hi3861 的局域网 IP
 * 3. 开发环境下由 Vite 代理把请求转发到真实设备
 */

import axios from 'axios'

// ============================================================
// 创建 Axios 实例
// ============================================================
const request = axios.create({
  // 基础路径：前端统一走 /api，由 Vite 代理到真实设备
  baseURL: 'http://192.168.12.1',

  // 请求超时时间（毫秒）
  // Hi3861 在局域网中，5秒足够了
  timeout: 5000,

  // 响应数据类型
  responseType: 'json'
})

// ============================================================
// 请求拦截器
// ============================================================
// 在每个请求发出之前执行，可以在这里添加 token、日志等
request.interceptors.request.use(
  (config) => {
    // 打印请求日志（开发阶段方便调试）
    console.log(`[请求] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error('[请求错误]', error)
    return Promise.reject(error)
  }
)

// ============================================================
// 响应拦截器
// ============================================================
// 在每个响应返回之后执行，统一处理成功和失败
request.interceptors.response.use(
  (response) => {
    // 请求成功（HTTP 状态码 2xx）
    const data = response.data

    // 打印响应日志
    console.log(`[响应] ${response.config.url}`, data)

    // 检查业务层面是否成功
    if (data && data.success === false) {
      // HTTP 成功但业务失败（例如设备离线导致操作失败）
      // 将业务错误包装成 rejected promise，让调用方可以 catch
      const bizError = new Error(data.message || '操作失败')
      bizError.type = 'business'
      bizError.data = data
      return Promise.reject(bizError)
    }

    // 成功则直接返回数据体
    return data
  },
  (error) => {
    // 请求失败（网络错误、超时、HTTP 状态码非 2xx）
    console.error('[响应错误]', error)

    // 构造一个友好的错误信息
    let message = '未知错误'

    if (error.code === 'ECONNABORTED') {
      message = '请求超时，请检查网络连接'
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      message = '网络异常，无法连接到设备'
    } else if (error.response) {
      // 有 HTTP 响应但状态码异常
      const status = error.response.status
      const serverMsg = error.response.data?.message

      if (status === 500) {
        message = serverMsg || '服务器内部错误'
      } else if (status === 404) {
        message = '接口不存在'
      } else {
        message = serverMsg || `请求失败 (${status})`
      }
    }

    // 创建一个带友好信息的错误对象
    const friendlyError = new Error(message)
    friendlyError.type = 'network'
    friendlyError.originalError = error
    return Promise.reject(friendlyError)
  }
)

export default request
