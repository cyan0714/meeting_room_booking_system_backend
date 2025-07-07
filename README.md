# 会议室预订系统后端

一个基于 NestJS 的企业级会议室预订管理系统后端服务，提供完整的用户管理、会议室管理、预订管理和统计分析功能。

## 📋 项目简介

该系统为企业会议室预订提供完整的后端解决方案，支持用户注册登录、角色权限管理、会议室信息管理、预订申请审批流程以及使用统计分析等功能。

## 🚀 技术栈

- **框架**: NestJS 10.x
- **数据库**: MySQL 8.x + TypeORM
- **缓存**: Redis
- **认证**: JWT (JSON Web Token)
- **邮件服务**: Nodemailer
- **API文档**: Swagger/OpenAPI
- **验证**: class-validator + class-transformer
- **文件上传**: Multer
- **容器化**: Docker + Docker Compose

## ✨ 功能特性

### 🔐 用户管理
- 用户注册/登录 (支持普通用户和管理员)
- 邮箱验证码验证
- 用户信息管理 (头像上传、个人信息修改)
- 密码修改
- 用户冻结/解冻
- 用户列表查询与分页

### 👥 权限管理
- 基于角色的权限控制 (RBAC)
- 角色-权限关联
- 登录状态验证
- 权限守卫

### 🏢 会议室管理
- 会议室信息 CRUD 操作
- 会议室列表查询与筛选
- 支持按名称、容量、设备等条件筛选
- 会议室预订状态管理

### 📅 预订管理
- 会议室预订申请
- 预订时间冲突检测
- 预订状态管理 (申请中、审批通过、审批驳回、已解除)
- 预订审批流程 (通过/驳回/解除)
- 预订催办功能
- 预订列表查询与筛选

### 📊 统计分析
- 用户预订次数统计
- 会议室使用频率统计
- 支持时间范围筛选

### 📧 邮件服务
- 注册验证码发送
- 密码修改验证码发送
- 用户信息更新验证码发送
- 预订催办邮件通知

## 🛠️ 安装与运行

### 环境要求

- Node.js >= 18.x
- MySQL >= 8.0
- Redis >= 6.0
- Docker (可选)

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd meeting_room_booking_system_backend
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
在 `src` 目录下创建 `.env` 文件：
```env
# 数据库配置
mysql_server_host=localhost
mysql_server_port=3306
mysql_server_username=root
mysql_server_password=123456
mysql_server_database=meeting_room_booking_system

# Redis配置
redis_server_host=localhost
redis_server_port=6379

# JWT配置
jwt_secret=your_jwt_secret_key
jwt_access_token_expires_time=30m
jwt_refresh_token_expres_time=7d

# 邮件配置
nodemailer_host=smtp.qq.com
nodemailer_port=587
nodemailer_auth_user=your_email@qq.com
nodemailer_auth_pass=your_email_password

# 服务端口
nest_server_port=3005
```

4. **启动服务**
```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

### Docker 部署

1. **使用 Docker Compose 一键启动**
```bash
docker-compose up -d
```

这将启动以下服务：
- NestJS 应用 (端口: 3005)
- MySQL 数据库 (端口: 3306)
- Redis 缓存

2. **初始化数据**
访问 `http://localhost:3005/user/init-data` 初始化系统数据

## 📚 API 文档

启动服务后，访问 [http://localhost:3005/api-doc](http://localhost:3005/api-doc) 查看完整的 Swagger API 文档。

### 主要 API 端点

#### 用户管理
- `POST /user/register` - 用户注册
- `POST /user/login` - 用户登录
- `POST /user/admin/login` - 管理员登录
- `GET /user/info` - 获取用户信息
- `GET /user/list` - 用户列表

#### 会议室管理
- `GET /meeting-room/list` - 会议室列表
- `POST /meeting-room/create` - 创建会议室
- `PUT /meeting-room/update` - 更新会议室
- `DELETE /meeting-room/:id` - 删除会议室

#### 预订管理
- `GET /booking/list` - 预订列表
- `POST /booking/add` - 创建预订
- `GET /booking/apply/:id` - 审批通过
- `GET /booking/reject/:id` - 审批驳回
- `GET /booking/unbind/:id` - 解除预订

#### 统计分析
- `GET /statistic/userBookingCount` - 用户预订统计
- `GET /statistic/meetingRoomUsedCount` - 会议室使用统计

## 🗄️ 数据库设计

### 核心表结构

- **users** - 用户表
- **roles** - 角色表
- **permissions** - 权限表
- **user_roles** - 用户角色关联表
- **meeting_room** - 会议室表
- **booking** - 预订表

数据库会在首次启动时自动创建表结构（synchronize: true）。

## 📝 开发命令

```bash
# 开发
npm run start:dev

# 构建
npm run build

# 测试
npm run test
npm run test:e2e

# 代码格式化
npm run format

# 代码检查
npm run lint

# REPL 模式 (调试用)
npm run repl
```

## 🔧 配置说明

### 主要配置文件

- `package.json` - 项目依赖和脚本
- `tsconfig.json` - TypeScript 配置
- `nest-cli.json` - NestJS CLI 配置
- `docker-compose.yml` - Docker 编排配置
- `Dockerfile` - Docker 镜像构建配置

### 环境变量

系统通过环境变量进行配置，所有配置项都在 `.env` 文件中定义。主要配置包括：

- 数据库连接信息
- Redis 连接信息
- JWT 密钥和过期时间
- 邮件服务配置
- 服务端口

## 🚦 项目状态

- ✅ 用户管理模块
- ✅ 权限管理模块
- ✅ 会议室管理模块
- ✅ 预订管理模块
- ✅ 统计分析模块
- ✅ 邮件服务模块
- ✅ 文件上传功能
- ✅ API 文档
- ✅ Docker 部署

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
