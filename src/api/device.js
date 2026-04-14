import request from '@/utils/request'

export function getDeviceStatus() {
  return request.get('/status')
}

export function turnLightOn() {
  return request.get('/on')
}

export function turnLightOff() {
  return request.get('/off')
}

export function setSystemOnline(online) {
  return request.get(online ? '/mock/set-online' : '/mock/set-offline')
}
