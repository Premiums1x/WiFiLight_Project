# WiFi 智能灯控制面板

> 基于 Vue 3 + Vite + Axios + Express Mock 的智能灯光 WiFi 控制系统前端项目

## 📖 项目简介

本项目是一个 **WiFi 智能灯光控制面板**，采用 iOS 风格的现代化 UI 设计，通过 WiFi 局域网与 NodeMCU (ESP8266) 硬件通信，实现灯光的远程开关控制与设备状态监控。

项目内置 Express Mock 服务器模拟硬件行为，可在没有真实硬件的情况下完成前端开发与调试，未来只需修改 API 地址即可无缝对接真实设备。

## ✨ 功能特性

- 🔌 **设备连接管理** — 一键连接/断开控制器，实时显示连接状态
- 💡 **灯光开关控制** — iOS 风格 Toggle 开关，搭配灯泡 SVG 动画反馈
- 📊 **设备信息监控** — 四宫格实时展示信号强度、运行时长、IP 地址、响应延迟
- 🔔 **操作反馈提示** — Toast 通知系统，连接/开灯为绿色，断开/关灯为红色
- ⏱ **运行时长计时** — 连接后自动计时，断开后归零
- 🎨 **iOS 风格 UI** — 圆角卡片、毛玻璃效果、流畅动画过渡
- 🖥 **Mock 服务器** — 内置 Express 模拟服务，支持在线/离线/故障模拟

## 🛠 技术栈

| 技术 | 说明 |
|------|------|
| **Vue 3** | 前端框架 (Composition API + `<script setup>`) |
| **Vite** | 构建工具，提供快速的 HMR 开发体验 |
| **Axios** | HTTP 请求库，封装统一的请求/响应拦截器 |
| **Express** | Mock 服务器框架，模拟 NodeMCU 硬件接口 |
| **Vanilla CSS** | 纯 CSS 样式，iOS 设计系统变量 |

## 📁 项目结构

```
WiFiLight/
├── index.html                # 入口 HTML
├── vite.config.js            # Vite 配置（含 API 代理）
├── package.json              # 项目依赖与脚本
├── mock/
│   └── server.js             # Express Mock 设备服务器
└── src/
    ├── main.js               # Vue 应用入口
    ├── App.vue               # 根组件（页面布局组装）
    ├── api/
    │   └── device.js         # 设备 API 接口封装
    ├── utils/
    │   └── request.js        # Axios 实例与拦截器配置
    ├── composables/
    │   ├── useDevice.js      # 设备状态管理（连接/灯光/信息）
    │   └── useToast.js       # Toast 消息提示管理
    ├── components/
    │   ├── ConnectionCard.vue # 连接状态卡片
    │   ├── LightControl.vue  # 灯泡插图 + Toggle 开关
    │   ├── QuickStats.vue    # 四宫格设备信息面板
    │   ├── StatusBar.vue     # 状态栏组件
    │   ├── LoadingOverlay.vue# 全屏加载遮罩
    │   └── ToastMessage.vue  # Toast 通知组件
    └── styles/
        └── global.css        # 全局样式与 CSS 变量
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 7

### 安装依赖

```bash
npm install
```

### 启动开发

**方式一：同时启动前端 + Mock 服务器（推荐）**

```bash
npm run start
```

**方式二：分别启动**

```bash
# 终端 1 — 启动 Mock 设备服务器（端口 3001）
npm run mock

# 终端 2 — 启动前端开发服务器（端口 5173）
npm run dev
```

启动后访问：http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 📡 Mock 服务器接口

Mock 服务器运行在 `http://localhost:3001`，提供以下接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/status` | GET | 获取设备状态（在线、灯光、更新时间） |
| `/on` | GET | 打开灯 |
| `/off` | GET | 关闭灯 |
| `/mock/set-offline` | GET | 模拟设备离线 |
| `/mock/set-online` | GET | 模拟设备上线 |
| `/mock/set-fail` | GET | 开启请求失败模拟 |
| `/mock/set-normal` | GET | 关闭失败模拟 |

> 前端通过 Vite 代理将 `/api/*` 请求转发至 Mock 服务器，无需处理跨域。

## 🔧 对接真实硬件

当拿到 NodeMCU (ESP8266) 硬件后，只需修改一处配置：

```js
// src/utils/request.js
const request = axios.create({
  // 将 '/api' 改为 NodeMCU 的局域网 IP
  baseURL: 'http://192.168.x.x',
  timeout: 5000,
})
```

NodeMCU 需实现以下 HTTP 接口（与 Mock 格式一致）：
- `GET /status` → 返回 `{ success, data: { deviceOnline, lightOn, updatedAt } }`
- `GET /on` → 返回 `{ success, message, data: { lightOn, updatedAt } }`
- `GET /off` → 返回 `{ success, message, data: { lightOn, updatedAt } }`

## 📄 License

MIT
