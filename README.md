# MEDB - Emby 媒体统计工具

一个基于 Vue 3 和 Cloudflare 的 Emby 媒体服务器统计管理工具。

## 技术栈

- **前端**: Vue 3 + Vite + Tailwind CSS + shadcn/ui
- **部署**: Cloudflare Pages / Workers
- **状态管理**: Pinia
- **路由**: Vue Router

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署到 Cloudflare Workers

本项目使用 **Cloudflare Workers** 进行前后端一体化部署。

### 部署步骤

```bash
# 1. 登录 Cloudflare
npx wrangler login

# 2. 构建并部署
npm run deploy
```

### 工作原理

1. **构建流程**：
   - `npm run build` 构建前端 Vue 应用
   - `node build-worker.cjs` 将静态资源嵌入到 Worker 代码中
   - 生成 `worker-with-assets.js`（包含所有静态文件）

2. **Worker 功能**：
   - 提供前端静态资源服务
   - 代理 API 请求到后端服务器（`https://medb.lat`）
   - 自动处理 CORS 和 SPA 路由回退

3. **API 代理路径**：
   - `/sign/*` - 登录认证相关
   - `/media/*` - 媒体管理相关
   - `/file/*` - 文件上传相关

## 项目结构

```
MEDB/
├── frontend/          # Vue 3 前端应用
│   ├── src/
│   │   ├── api/      # API 请求
│   │   ├── assets/   # 静态资源
│   │   ├── components/ # Vue 组件
│   │   ├── router/   # 路由配置
│   │   ├── stores/   # Pinia 状态管理
│   │   ├── views/    # 页面视图
│   │   └── ...
│   ├── public/       # 公共资源
│   └── dist/         # 构建输出
├── build-worker.cjs  # 构建脚本（生成 worker-with-assets.js）
├── worker.js         # Worker 模板
├── worker-with-assets.js # 生成的 Worker（含嵌入的静态资源）
├── wrangler.toml     # Wrangler 配置
└── package.json      # 项目配置
```

## 环境变量

### 前端配置

在 `frontend/.env.production` 中配置：

```env
VITE_API_BASE=
```

> **注意**：由于 Worker 会代理 API 请求，所以这里留空即可。

### Worker 配置

在 `wrangler.toml` 中配置：

```toml
[vars]
API_BASE = "https://medb.lat"
```

## License

MIT
