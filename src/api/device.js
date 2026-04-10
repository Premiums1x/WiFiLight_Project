/**
 * 设备 API 模块
 *
 * 【这个文件做了什么？】
 * 把所有与设备通信的接口封装成函数，页面组件只需要调用这些函数，
 * 不需要关心具体的请求路径和参数。
 *
 * 【为什么要单独封装？】
 * 1. 页面组件不应该直接写 axios.get('/status')，这样到处散落不好维护
 * 2. 如果将来接口路径或参数变了，只需要改这个文件
 * 3. 切换到真实 NodeMCU 时，接口路径格式一致，基本不需要改这个文件
 */

import request from '@/utils/request'

/**
 * 获取设备状态
 * 请求 GET /status
 * 返回 { success: true, data: { deviceOnline, lightOn, updatedAt } }
 */
export function getDeviceStatus() {
  return request.get('/status')
}

/**
 * 打开灯
 * 请求 GET /on
 * 返回 { success: true, message: '灯已打开', data: { lightOn, updatedAt } }
 */
export function turnLightOn() {
  return request.get('/on')
}

/**
 * 关闭灯
 * 请求 GET /off
 * 返回 { success: true, message: '灯已关闭', data: { lightOn, updatedAt } }
 */
export function turnLightOff() {
  return request.get('/off')
}
