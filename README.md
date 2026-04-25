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

## 部署到 Cloudflare

### 方式一：Cloudflare Pages（推荐）

```bash
# 部署到 Cloudflare Pages
npm run deploy:pages
```

### 方式二：Cloudflare Workers

```bash
# 部署到 Cloudflare Workers
npm run deploy:worker
```

### 首次部署配置

1. 登录 Cloudflare: `npx wrangler login`
2. 创建 Pages 项目或 Worker
3. 运行部署命令

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
├── worker.js         # Cloudflare Worker 入口
├── wrangler.toml     # Wrangler 配置
└── package.json      # 项目配置
```

## 环境变量

在 `frontend/.env.production` 中配置：

```env
VITE_API_BASE=https://your-api-domain.com
```

## License

MIT
