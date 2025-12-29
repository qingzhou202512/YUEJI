// Service Worker for 悦己手账 PWA
// 版本号：用于控制缓存更新
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `yueji-${CACHE_VERSION}`;

// 需要缓存的资源列表
// 核心文件：确保离线时也能查看记录
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/index.tsx',
  '/App.tsx',
  '/manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');
  
  // 立即激活新的 Service Worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 缓存核心资源');
        // 只缓存核心 HTML 和 manifest
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]).catch((err) => {
          console.warn('[Service Worker] 部分资源缓存失败:', err);
        });
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 删除旧版本的缓存
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // 立即控制所有客户端
  return self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 策略：网络优先，失败时使用缓存
  // 这样可以确保用户总是看到最新内容，离线时也能查看记录
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 网络请求成功，更新缓存
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // 只缓存 HTML 和静态资源
            if (request.method === 'GET' && 
                (request.destination === 'document' || 
                 request.destination === 'script' || 
                 request.destination === 'style')) {
              cache.put(request, responseToCache);
            }
          });
        }
        return response;
      })
      .catch(() => {
        // 网络请求失败，尝试从缓存获取
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // 如果是导航请求（访问页面），返回 index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // 其他情况返回错误响应
          return new Response('离线状态，无法加载资源', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain; charset=utf-8'
            })
          });
        });
      })
  );
});

// 监听来自客户端的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // 允许客户端请求缓存特定 URL
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});




