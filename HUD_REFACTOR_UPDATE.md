# WiFi Light HUD 重构版本更新说明

## 更新概览

本次版本围绕 `2nd.html` 原型完成了一轮前端高保真重构，目标是将原先的 iOS 卡片式控制页升级为更统一、更具仪表盘感的 HUD 单屏控制台。

这次更新不改变项目的基础技术栈，仍然使用 Vue 3 + Vite + Axios + Express Mock，但前端主界面、状态模型和 Mock 返回结构已经同步升级。

## 本次主要变化

### 1. 前端界面重构为 HUD 风格

- 主页面重构为全屏单页仪表盘布局
- 页面结构调整为顶部系统控制区、中央灯光主控区、底部遥测数据区
- 新增更贴近原型的氛围光效、内凹主控按钮和在线/离线视觉反馈
- 支持深色与浅色双主题切换
- 主题选择会持久化保存到本地存储

### 2. 状态模型简化

旧版本存在“前端连接态”和“设备在线态”两层概念。
本次已统一为单一状态模型，核心围绕以下字段组织：

```js
{
  systemOnline,
  lightOn,
  telemetry,
  theme,
  loading,
  initialLoading,
  lastSyncAt
}
```

这样做之后：

- 顶部 `SYS ONLINE / SYS OFFLINE` 直接代表设备系统在线状态
- 中央灯光控制只依赖真实设备在线状态
- 页面状态来源更清晰，前端不再额外维护一套“伪连接态”

### 3. 灯光控制交互更新

- 中央主控区替代旧版 Toggle 开关作为主交互入口
- 当系统在线时，可直接点击中央按钮控制灯光开关
- 当系统离线时，主控区保持禁用态，点击只提示 warning toast，不发送控制请求
- 灯开启时中央主控区会进入高亮激活状态，并同步更新状态文案

### 4. Toast 与 Loading 反馈升级

- Toast 改为单条悬浮 HUD 风格消息，不再堆叠队列卡片
- 首屏加载态改为更贴近 HUD 风格的系统同步面板
- 普通控制请求不再使用整屏 loading，而是通过按钮禁用和消息反馈处理

### 5. 底部遥测数据接入真实 Mock 数据

底部显示项固定为：

- `SIG`：信号强度
- `LAT`：响应延迟
- `UPT`：运行时长
- `IP`：设备地址

这些数据不再只是前端拼装展示，而是改为从 Mock 返回的 `telemetry` 结构中读取。
其中 `UPT` 由服务端返回基准值，前端在设备在线时本地递增显示。

## Mock 接口升级

### 状态返回结构更新

`GET /status` 返回结构已升级为：

```json
{
  "success": true,
  "data": {
    "systemOnline": true,
    "lightOn": false,
    "updatedAt": "2026-04-14 15:30:00",
    "telemetry": {
      "signalDbm": -45,
      "latencyMs": 12,
      "uptimeSeconds": 502,
      "ipAddress": "192.168.4.1"
    }
  }
}
```

### 其他接口同步升级

以下接口现在也会返回完整状态快照：

- `GET /on`
- `GET /off`
- `GET /mock/set-online`
- `GET /mock/set-offline`

这样前端在请求成功后可以直接整体同步状态，而不必额外再请求一次 `/status`。

## 涉及的主要文件

本次重构主要影响以下文件：

- `src/App.vue`
- `src/composables/useDevice.js`
- `src/composables/useToast.js`
- `src/components/ToastMessage.vue`
- `src/components/LoadingOverlay.vue`
- `src/api/device.js`
- `src/styles/global.css`
- `mock/server.js`

## 兼容性与注意事项

- 如果你本地已经运行着旧版 mock 进程，需要重启 mock 服务，新的接口结构才会真正生效
- 旧版组件文件仍然保留在项目中，但已经不再作为当前主界面核心结构使用
- 如果后续需要进一步精简项目，可以再做一轮“旧组件与旧样式清理”

## 已完成验证

- 前端重构后已成功通过 `npm run build`
- 界面结构、主题切换、HUD toast 和状态模型已完成接线
- Mock 源码已同步升级为新数据结构

## 后续建议

后面如果继续迭代，比较值得做的有三件事：

1. 清理不再使用的旧组件和旧说明文档
2. 增加一个开发调试面板，直接控制 mock 的在线 / 离线 / 故障模拟
3. 为新的状态模型补充更明确的接口类型约束和单元测试
