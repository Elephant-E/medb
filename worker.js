/**
 * Cloudflare Worker - MEDB 静态文件服务器
 * 托管 Vue 3 前端应用
 */

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // SPA 路由支持：如果不是静态资源，返回 index.html
    const isStaticAsset = pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/);
    
    if (!isStaticAsset && pathname !== '/') {
      pathname = '/';
    }

    // 默认路径
    if (pathname === '/') {
      pathname = '/index.html';
    }

    try {
      // 尝试从 KV 或 R2 获取文件（如果配置了）
      // 这里简化处理，实际部署时需要配置资产存储
      
      // 对于生产环境，建议使用 Cloudflare Pages 或 R2
      // 当前实现返回一个简单的 HTML
      if (pathname === '/index.html') {
        const html = `
<!doctype html>
<html lang="zh-CN" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="https://file.emosstore.sbs/files/2026/04/25/03/57c609dd-bf6e-4bd7-b434-6e6794356a6e.jpeg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MEDB</title>
    <script type="module" crossorigin src="/assets/index-BOmcnSBz.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-B7A4rzmL.css">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
        `.trim();
        
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
