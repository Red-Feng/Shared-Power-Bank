# 小谷充电宝 (Shared-Power-Bank)

<p align="center">
	<img alt="logo" src="https://oscimg.oschina.net/oscnet/up-b99b286755aef70355a7084753f89cdb7c9.png">
</p>
<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">小谷充电宝 v1.0</h1>
<h4 align="center">基于 RuoYi-Cloud 分布式微服务架构的共享充电宝管理系统</h4>

## 项目简介

小谷充电宝是一个全栈共享充电宝解决方案，包含后端微服务、管理后台（Web）以及微信小程序客户端。项目基于成熟的 [RuoYi-Cloud](https://gitee.com/y_project/RuoYi-Cloud) 架构进行二次开发，集成了物联网（IoT）设备管理、订单处理、支付结算、地理位置服务等核心业务模块。

### 核心技术栈
*   **后端**: Spring Boot, Spring Cloud & Alibaba (Nacos, Sentinel, Seata)
*   **安全**: Spring Security OAuth2, Jwt, Redis
*   **消息与通讯**: RabbitMQ, EMQX (MQTT 协议用于设备通讯)
*   **存储**: MySQL, Redis, MinIO (文件存储)
*   **前端 (Web)**: Vue.js, Element UI
*   **移动端**: 微信小程序 (Native)
*   **地理位置**: 腾讯地图 SDK, MongoDB (用于位置索引)

## 系统模块

```text
com.share     
├── share-ui              // 管理后台前端 [80]
├── mp-weixin             // 微信小程序客户端
├── share-gateway         // 网关模块 [8080]
├── share-auth            // 认证中心 [9200]
├── share-api             // 内部接口模块
│       └── share-api-system                          // 系统接口
│       └── share-api-order                           // 订单接口
│       └── share-api-rule                            // 计费规则接口
│       └── share-api-user                            // 用户接口
├── share-common          // 通用工具模块
├── share-modules         // 业务模块
│       └── share-system                              // 系统管理 [9201]
│       └── share-gen                                 // 代码生成 [9202]
│       └── share-job                                 // 定时任务 [9203]
│       └── share-file                                // 文件服务 [9300]
│       └── share-device                              // 设备管理 (机柜、充电宝、MQTT通讯) [9400]
│       └── share-order                               // 订单管理 [9500]
│       └── share-payment                             // 支付中心 [9600]
│       └── share-rule                                // 计费规则 [9700]
│       └── share-user                                // 用户中心 [9800]
│       └── share-stastics                            // 统计分析 [9900]
└── pom.xml                // 父工程依赖管理
```

## 业务功能

### 1. 设备管理 (IoT)
- **机柜管理**: 监控机柜状态、插槽状态、在线/离线情况。
- **充电宝管理**: 追踪每个充电宝的电量、循环次数、健康度。
- **MQTT 通讯**: 通过 EMQX 实现云端与硬件设备的双向通讯，支持远程弹出充电宝。

### 2. 订单与支付
- **租赁流程**: 扫码租借、自动计时、归还结算。
- **支付集成**: 支持微信支付，集成支付回调与自动扣费。
- **订单追踪**: 详尽的租赁记录与费用清单。

### 3. 计费规则
- **灵活计费**: 支持按时计费、阶梯计费、免费时长配置。
- **区域差异化**: 不同区域、不同商户可配置不同的计费策略。

### 4. 微信小程序
- **附近门店**: 基于地理位置搜索最近的充电宝机柜。
- **扫码租借**: 快速扫码弹出充电宝。
- **个人中心**: 查看钱包、租借记录、优惠券等。

### 5. 统计分析
- **营收报表**: 每日、每月营收数据统计。
- **设备分布**: 机柜利用率分析与地理位置热力图。

## 快速开始

### 预备工作
- JDK 17+ (推荐 21)
- MySQL 8.0+
- Redis 6.0+
- Nacos 2.x
- RabbitMQ
- EMQX (用于设备模拟测试)

### 启动说明
1.  **基础设施**: 启动 Nacos, Redis, RabbitMQ, MySQL。
2.  **配置中心**: 在 Nacos 中导入 `conf` 目录下的配置文件（如有）。
3.  **后端启动**: 依次启动 `Gateway`, `Auth`, `System` 以及各业务模块。
4.  **前端启动**: 
    ```bash
    cd share-ui
    npm install
    npm run dev
    ```
5.  **小程序**: 使用微信开发者工具打开 `mp-weixin` 目录。

## 许可证
[Apache License 2.0](LICENSE)
