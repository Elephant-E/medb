/**
 * MEDB Worker - 前后端一体化部署
 * 
 * 功能：
 * 1. 提供前端静态资源
 * 2. 代理 API 请求到 medb.lat
 * 3. 支持 SPA 路由回退
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ========================================
    // 1. API 请求代理
    // ========================================
    
    // 1.1 MEDB API 代理（转发到 medb.lat）
    // 注意：/sign 本身不代理（登录跳转），只代理 /sign/* 子路径
    if (pathname.startsWith('/sign/') || 
        pathname.startsWith('/media/') || 
        pathname.startsWith('/file/')) {
      return await handleMedbApiProxy(request, url, env);
    }
    
    // ========================================
    // 2. 静态文件服务
    // ========================================
    try {
      let assetPath = pathname;
      const isAssetRequest = pathname.includes('.');
      
      // SPA 路由回退：非静态资源路径返回 index.html
      if (pathname === '/' || (!pathname.includes('.') && !pathname.startsWith('/assets/'))) {
        assetPath = '/index.html';
      }
      
      // 获取资源内容
      const content = getAssetContent(assetPath);
      
      if (content !== null) {
        const contentType = getContentType(assetPath);
        
        return new Response(content, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      }
      
      if (isAssetRequest) {
        return new Response('Not Found: ' + pathname, { status: 404 });
      }

      // fallback 到 index.html
      const indexContent = getAssetContent('/index.html');
      if (indexContent !== null) {
        return new Response(indexContent, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
          },
        });
      }
      
      return new Response('Not Found: ' + pathname, { status: 404 });
    } catch (error) {
      console.error('Asset fetch error:', error);
      return new Response('Internal Server Error: ' + error.message, { status: 500 });
    }
  }
};

/**
 * 代理 MEDB API 请求到 medb.lat
 */
async function handleMedbApiProxy(request, url, env) {
  try {
    // 构建目标 URL
    const apiBase = env.API_BASE || 'https://medb.lat';
    const targetUrl = `${apiBase}${url.pathname}${url.search}`;
    
    // 复制请求头
    const headers = new Headers(request.headers);
    headers.set('Host', new URL(apiBase).hostname);
    
    // 转发请求
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });
    
    // 复制响应头并添加 CORS 头
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('cf-ray');
    responseHeaders.delete('cf-cache-status');
    
    // 添加 CORS 头
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: responseHeaders,
      });
    }
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('MEDB API proxy error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'API 代理失败: ' + error.message
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

