# 基于Hi3861的Wi-Fi智能灯控制系统

## 1. 目的

本课程设计旨在基于海思Hi3861 Wi-Fi IoT开发板，设计并实现一套"普通灯改造为Wi-Fi智能灯"控制系统。具体目标如下：

1. 掌握OpenHarmony轻量系统下Wi-Fi AP模式的开发方法，理解无线热点创建与TCP/IP通信原理。
2. 掌握Hi3861 GPIO引脚配置与继电器驱动方法，实现软件对220V灯具的开关控制。
3. 在开发板上搭建HTTP服务器，设计RESTful风格API接口，实现前后端通信。
4. 基于Vue 3框架开发Web控制面板，支持远程开关灯与实时状态监测。
5. 通过端到端开发，理解物联网系统分层架构与各层协作关系。

## 2. 环境

### 2.1 硬件环境

| 设备 | 型号/规格 | 用途 |
|------|-----------|------|
| Wi-Fi IoT开发板 | 海思Hi3861V100（润和HiSpark套件） | 主控芯片，运行OpenHarmony LiteOS-M |
| 继电器模块 | 5V单路继电器 | GPIO小信号转220V灯具开关控制 |
| 家用灯具 | 普通台灯（220V交流） | 被控对象 |
| USB数据线 | Type-C | 供电及固件烧录 |
| 杜邦线 | 若干 | 连接开发板与继电器 |

> **【插图占位】** 此处请插入**实物接线图**——展示Hi3861开发板GPIO10引脚与继电器模块、灯具之间的实际接线照片。

### 2.2 软件环境

| 软件/工具 | 版本 | 用途 |
|-----------|------|------|
| DevEco Device Tool | 3.0+ | 嵌入式IDE（编译、烧录） |
| OpenHarmony SDK | LiteOS-M | 嵌入式操作系统与硬件抽象层 |
| Node.js | 18+ | 前端运行环境 |
| Vue 3 + Vite | 3.5 / 6.3 | 前端框架与构建工具 |
| Axios | 1.8.4 | HTTP客户端 |

### 2.3 网络方案

系统采用Wi-Fi AP模式：开发板自身作为热点（SSID: Hi3861，WPA2-PSK加密），手机/电脑连接后与开发板组成局域网。开发板固定IP为192.168.12.1，HTTP服务监听80端口。该方案无需外部路由器，在任何环境下都能独立工作。

## 3. 基本原理

### 3.1 系统总体架构

本系统采用物联网三层架构：**感知控制层**（GPIO→继电器→灯具）、**网络传输层**（Wi-Fi AP + HTTP服务器）、**应用展示层**（Vue 3 Web控制面板）。

```
┌──────────────────────────────────────┐
│   应用展示层：Vue 3 Web控制面板        │
│   灯光开关 · 状态监测 · 遥测数据       │
└─────────────────┬────────────────────┘
                  │ HTTP GET /on, /off, /status
┌─────────────────┴────────────────────┐
│   网络传输层：Hi3861 Wi-Fi AP + HTTP  │
│   热点创建 · DHCP · TCP Socket · JSON │
└─────────────────┬────────────────────┘
                  │ GPIO10 电平控制
┌─────────────────┴────────────────────┐
│   感知控制层：继电器 → 220V灯具       │
│   高电平=灯亮  ·  低电平=灯灭          │
└──────────────────────────────────────┘
```

> **【插图占位】** 此处请插入**系统架构图**——以框图形式展示三层架构及通信协议。

### 3.2 Wi-Fi AP模式

AP模式即让开发板充当无线接入点。通过OpenHarmony的`wifi_hotspot.h` API实现，流程为：配置热点参数（SSID、密码、加密方式）→ 注册事件回调（设备连入/断开）→ 使能热点 → 为"ap0"网卡配置静态IP 192.168.12.1 → 启动DHCP服务自动为连入设备分配192.168.12.x网段IP。

### 3.3 GPIO控制与继电器驱动

Hi3861的GPIO引脚可软件控制输出高电平（3.3V）或低电平（0V）。本项目选用GPIO10，通过`hi_io_set_func()`配置为普通GPIO功能，`IoTGpioSetDir()`设为输出模式，`IoTGpioSetOutputVal()`控制电平高低。

由于GPIO的3.3V信号无法直接驱动220V灯具，需要继电器模块作为中间桥梁。继电器本质是电磁开关：控制端通电时电磁铁吸合，触点闭合接通220V电路。这实现了弱电控制强电的电气隔离。

> **【插图占位】** 此处请插入**GPIO控制继电器原理示意图**——展示GPIO10→继电器线圈→触点→灯具的控制链路。

### 3.4 HTTP服务器与API设计

HTTP服务器基于lwIP协议栈的BSD Socket API，遵循"socket→bind→listen→accept→recv→send"经典模型。用`sscanf()`解析HTTP请求行提取方法和路径，按路径分发处理逻辑，构造JSON响应返回。

API接口设计如下：

| 接口 | 功能 | 响应示例 |
|------|------|----------|
| `GET /status` | 查询状态 | `{"success":true,"data":{"lightOn":false,"uptimeSeconds":120,"ipAddress":"192.168.12.1"}}` |
| `GET /on` | 开灯 | `{"success":true,"message":"灯已打开","data":{"lightOn":true,...}}` |
| `GET /off` | 关灯 | `{"success":true,"message":"灯已关闭","data":{"lightOn":false,...}}` |

响应头包含CORS字段（`Access-Control-Allow-Origin: *`），允许浏览器跨域访问；对OPTIONS预检请求返回204空响应。

### 3.5 多线程与互斥锁

系统运行在LiteOS-M实时操作系统上，包含两个关键线程："redlightMain"主线程（初始化与IP刷新）和"httpServer"服务器线程（处理HTTP请求）。由于两线程共享设备状态数据，引入互斥锁（Mutex）保护：所有对全局状态变量`g_state`的读写均遵循"加锁→操作→解锁"范式，确保数据一致性。

### 3.6 前端技术架构

前端基于Vue 3 Composition API开发，分为：网络请求层（Axios封装）、API接口层（语义化函数）、状态管理层（useDevice组合式函数）和UI组件层（灯光控制、连接状态、数据统计等组件）。UI采用HUD科技风格，支持深色/浅色双主题和响应式布局。

## 4. 步骤与结果

### 4.1 硬件接线

1. Hi3861的GPIO10通过杜邦线连接继电器信号输入端（IN）。
2. 开发板GND与继电器GND共地，VCC供电。
3. 灯具火线断开，分别接入继电器COM（公共端）和NO（常开端）；零线直连市电。
4. 继电器吸合时COM-NO导通，灯具通电。

> **【插图占位】** 此处请插入**实物接线照片**——能清晰看到开发板、继电器与灯具的接线关系。

### 4.2 嵌入式固件开发

项目代码结构如下：

```
wifi-iot/app/
├── easy_wifi/src/
│   ├── wifi_starter.c     # AP模式热点启动封装
│   └── wifi_starter.h
└── http_mqtt_redlight/
    ├── demo_entry.c       # 程序入口
    ├── device_state.c/h   # 设备状态管理（线程安全）
    ├── http_server.c/h    # HTTP服务器
    └── traffic_light.c/h  # GPIO灯控制
```

#### 4.2.1 系统启动流程

程序入口通过`SYS_RUN`宏注册，上电后自动执行。主线程完成初始化后进入无限循环刷新IP：

```c
static void HttpMqttRedLightTask(void *arg)
{
    TrafficLightInit();      // 配置GPIO10为输出模式，初始低电平（灯灭）
    DeviceStateInit();       // 初始化状态（灯关、运行时间归零）

    // 配置并启动Wi-Fi热点
    HotspotConfig config = {0};
    strcpy(config.ssid, "Hi3861");
    strcpy(config.preSharedKey, "12345678LeO");
    config.securityType = WIFI_SEC_TYPE_PSK;
    config.band = HOTSPOT_BAND_TYPE_2G;
    StartHotspot(&config);

    // 注册回调：有人连上记录IP，全部断开自动关灯
    SetOnStationJoinCallback(OnStationJoin);
    SetOnAllStationsLeftCallback(OnAllStationsLeft);

    DeviceStateRefreshIpAddress();
    HttpServerStart();       // 启动HTTP服务器，监听80端口

    while (1) {
        DeviceStateRefreshIpAddress();
        osDelay(500);        // 每5秒刷新一次IP
    }
}
```

> **【插图占位】** 此处请插入**串口启动日志截图**——展示上电后热点启动成功、DHCP和HTTP服务器就绪的串口输出。

#### 4.2.2 Wi-Fi热点启动

`wifi_starter.c`封装了AP模式启动的完整流程。关键步骤：注册事件回调→设置配置→使能热点→等待驱动异步通知→为"ap0"网卡配置静态IP→重启DHCP服务。

```c
int StartHotspot(const HotspotConfig *config)
{
    RegisterWifiEvent(&g_defaultWifiEventListener);  // 注册连入/断开回调
    SetHotspotConfig(config);
    EnableHotspot();
    while (!g_hotspotStarted) { osDelay(10); }       // 等待热点激活

    g_iface = netifapi_netif_find("ap0");
    if (g_iface) {
        IP4_ADDR(&ipaddr, 192, 168, 12, 1);          // 开发板固定IP
        IP4_ADDR(&netmask, 255, 255, 255, 0);
        netifapi_netif_set_addr(g_iface, &ipaddr, &netmask, &gateway);
        netifapi_dhcps_stop(g_iface);
        netifapi_dhcps_start(g_iface, 0, 0);          // 启动DHCP分配IP
    }
    return errCode;
}
```

#### 4.2.3 HTTP请求处理

服务器在无限循环中`accept()`等待连接，用`sscanf()`解析请求，按路径分发：

```c
static void HandleGetRequest(int socketFd, const char *path)
{
    if (strcmp(path, "/status") == 0) {    // 查询状态
        BuildSuccessBody(body, sizeof(body), NULL);
        SendJsonResponse(socketFd, 200, "OK", body);
    } else if (strcmp(path, "/on") == 0) { // 开灯
        TrafficLightSetOn(1);
        DeviceStateSetLightOn(1);
        BuildSuccessBody(body, sizeof(body), "灯已打开");
        SendJsonResponse(socketFd, 200, "OK", body);
    } else if (strcmp(path, "/off") == 0) { // 关灯
        TrafficLightSetOn(0);
        DeviceStateSetLightOn(0);
        BuildSuccessBody(body, sizeof(body), "灯已关闭");
        SendJsonResponse(socketFd, 200, "OK", body);
    } else {
        SendErrorBody(socketFd, 404, "Not Found", "接口不存在");
    }
}
```

#### 4.2.4 GPIO灯控制

```c
#define RELAY_GPIO 10

void TrafficLightInit(void) {
    IoTGpioInit(RELAY_GPIO);
    hi_io_set_func(RELAY_GPIO, HI_IO_FUNC_GPIO_10_GPIO);
    IoTGpioSetDir(RELAY_GPIO, IOT_GPIO_DIR_OUT);
    IoTGpioSetOutputVal(RELAY_GPIO, IOT_GPIO_VALUE0);  // 初始灯灭
}

void TrafficLightSetOn(int on) {
    IoTGpioSetOutputVal(RELAY_GPIO, on ? IOT_GPIO_VALUE1 : IOT_GPIO_VALUE0);
}
```

#### 4.2.5 互斥锁保护设备状态

所有状态访问通过互斥锁保护，防止多线程竞争：

```c
void DeviceStateSetLightOn(int isOn) {
    osMutexAcquire(g_stateMutex, osWaitForever);   // 加锁
    g_state.lightOn = isOn;
    SyncUpdatedAtUnlocked();                        // 更新时间戳
    osMutexRelease(g_stateMutex);                   // 解锁
}
```

### 4.3 前端控制面板开发

#### 4.3.1 项目配置

前端使用Vite + Vue 3，开发阶段通过Vite代理将`/api`请求转发到开发板：

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: deviceTarget,   // http://192.168.12.1
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

#### 4.3.2 网络请求与状态管理

Axios实例配置了5秒超时和响应拦截器，统一处理错误信息。API层封装三个语义化接口函数：

```javascript
// src/api/device.js
export function getDeviceStatus() { return request.get('/status') }
export function turnLightOn()     { return request.get('/on') }
export function turnLightOff()    { return request.get('/off') }
```

核心状态管理`useDevice`组合式函数使用Vue 3的`ref`和`computed`管理设备在线状态、灯光状态、遥测数据、主题偏好等。通过`syncState()`将API返回数据映射到响应式状态，并启动秒级定时器同步运行时长。

#### 4.3.3 UI组件

| 组件 | 功能 |
|------|------|
| App.vue | 根组件，HUD风格布局，中央大按钮控制灯光 |
| LightControl.vue | SVG灯泡插图 + iOS风格Toggle开关 |
| ConnectionCard.vue | 设备在线/离线状态显示 |
| QuickStats.vue | 四宫格：信号强度、运行时长、IP地址、响应延迟 |
| ToastMessage.vue | 顶部滑入式操作反馈通知 |

底部数据流面板实时显示SIG（信号）、LAT（延迟）、UPT（运行时长）、IP四项遥测数据。支持深色/浅色主题切换，响应式适配桌面、平板和手机。

> **【插图占位】** 此处请插入**前端深色主题运行截图**——展示灯光关闭时的完整控制面板界面。

> **【插图占位】** 此处请插入**前端灯光开启状态截图**——展示开灯后按钮发光、Toast提示等视觉变化。

### 4.4 系统联调与测试

#### 4.4.1 编译烧录

在DevEco Device Tool中编译项目生成固件，通过HiBurn工具烧录到Hi3861 Flash，重启后运行。

> **【插图占位】** 此处请插入**编译成功截图**——展示IDE中编译通过的信息。

#### 4.4.2 功能测试

1. **Wi-Fi连接**：手机搜索"Hi3861"热点并连接，自动获取192.168.12.x IP。
2. **接口测试**：浏览器访问`http://192.168.12.1/on`、`/off`、`/status`，验证JSON返回和灯具响应。
3. **前端测试**：启动`npm run dev`，在浏览器中操作灯光开关，验证UI动画和Toast提示。

> **【插图占位】** 此处请插入**手机连接热点截图**——展示搜索到并连接"Hi3861"热点。

> **【插图占位】** 此处请插入**浏览器API测试截图**——访问`/on`和`/status`返回的JSON数据。

> **【插图占位】** 此处请插入**手机端控制面板截图**——验证响应式布局。

#### 4.4.3 测试结果

| 测试项目 | 预期结果 | 结果 |
|----------|----------|------|
| 热点启动 | 串口日志显示启动成功 | 通过 |
| 设备连接 | 自动获取192.168.12.x IP | 通过 |
| GET /on | 继电器吸合，灯亮 | 通过 |
| GET /off | 继电器断开，灯灭 | 通过 |
| GET /status | 返回JSON状态数据 | 通过 |
| 全断开自动关灯 | 灯自动熄灭 | 通过 |
| 前端开/关灯 | 动画和Toast正常 | 通过 |
| 主题切换 | 深色/浅色切换正常 | 通过 |
| 离线检测 | 显示SYS OFFLINE | 通过 |
| 手机适配 | 响应式布局正确 | 通过 |

## 5. 总结分析

### 5.1 结果评价

本设计成功实现了从硬件到前端的完整Wi-Fi智能灯控制系统。系统架构清晰（三层分离）、通信标准化（HTTP/JSON）、用户体验良好（HUD风格、动画反馈、响应式），安全性方面通过继电器实现了强弱电隔离，通过互斥锁保证了多线程数据安全。

### 5.2 遇到的问题与解决

**问题一：DHCP分配IP延迟。** 手机连上热点后立即查询IP经常返回0。**解决**：在设备连入回调中引入重试机制（最多20次，每次100ms），等待DHCP握手完成。

**问题二：调试重启端口占用。** 频繁重启导致80端口处于TIME_WAIT状态。**解决**：创建Socket时设置`SO_REUSEADDR`选项，允许端口快速复用。

**问题三：浏览器跨域限制。** 前端`localhost:5173`与开发板`192.168.12.1`属于不同源。**解决**：开发阶段用Vite代理转发；生产环境在HTTP响应头添加CORS字段，OPTIONS预检返回204。

**问题四：多线程状态竞争。** HTTP线程和主线程同时读写状态导致数据不一致。**解决**：引入CMSIS-RTOS互斥锁，所有状态操作加锁保护。

### 5.3 改进方向

1. 集成MQTT协议，通过云服务器实现远程跨互联网控制。
2. 利用PWM输出实现灯光亮度无级调节。
3. 增加定时开关灯和倒计时功能。
4. 实现OTA远程固件升级。

## 参考文献

[1] 华为技术有限公司. OpenHarmony LiteOS-M内核开发指南[EB/OL]. https://docs.openharmony.cn, 2024.

[2] 海思半导体. Hi3861V100 Wi-Fi IoT芯片技术参考手册[M]. 深圳: 海思半导体有限公司, 2020.

[3] 华为技术有限公司. OpenHarmony Wi-Fi设备开发指南[EB/OL]. https://docs.openharmony.cn, 2024.

[4] lwIP Contributors. lwIP - A Lightweight TCP/IP Stack[EB/OL]. https://savannah.nongnu.org/projects/lwip/, 2024.

[5] Vue.js Team. Vue.js 3官方文档[EB/OL]. https://vuejs.org/guide/, 2025.

[6] Vite Team. Vite官方文档[EB/OL]. https://vite.dev/guide/, 2025.

[7] ARM Limited. CMSIS-RTOS2 API Reference[EB/OL]. https://arm-software.github.io/CMSIS_6/, 2024.

[8] 润和软件. HiSpark Wi-Fi IoT智能家居套件开发指南[EB/OL]. https://www.hihope.org/, 2021.

[9] 谢希仁. 计算机网络（第8版）[M]. 北京: 电子工业出版社, 2021.
