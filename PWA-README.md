# PWA 功能说明

## ✅ 已实现的 PWA 功能

### 1. **Web App Manifest** (`public/manifest.json`)
- ✅ 应用名称和描述
- ✅ 启动 URL 和显示模式（standalone）
- ✅ 主题颜色和背景颜色
- ✅ 图标配置（需要添加实际图标文件）
- ✅ 快捷方式配置

### 2. **Service Worker** (`public/service-worker.js`)
- ✅ 离线缓存支持
- ✅ 网络优先策略（确保用户看到最新内容）
- ✅ 离线时自动使用缓存
- ✅ 不拦截外部 CDN 请求（避免性能问题）
- ✅ 自动缓存更新机制

### 3. **安装提示** (`components/ui/InstallPrompt.tsx`)
- ✅ 自动检测可安装状态
- ✅ 友好的安装引导界面
- ✅ 用户可以选择安装或稍后提醒

### 4. **离线状态指示** (`components/ui/OfflineIndicator.tsx`)
- ✅ 实时显示网络连接状态
- ✅ 离线时提示用户数据已保存到本地

### 5. **iOS Safari 支持**
- ✅ Apple 专用 meta 标签
- ✅ 支持添加到主屏幕
- ✅ 独立显示模式

## 📱 如何使用

### 安装应用

1. **Android Chrome/Edge**：
   - 访问应用后，浏览器会自动显示"添加到主屏幕"提示
   - 或点击菜单 → "添加到主屏幕"

2. **iOS Safari**：
   - 点击分享按钮 → "添加到主屏幕"

3. **桌面浏览器**：
   - Chrome/Edge 会在地址栏显示安装图标
   - 点击即可安装

### 离线使用

- ✅ 应用已安装后，即使离线也能：
  - 查看已保存的记录
  - 添加新的记录（会保存到本地）
  - 浏览历史记录

- ⚠️ 离线时无法：
  - 获取 AI 洞察（需要网络连接）
  - 同步数据到服务器

## 🔧 配置说明

### 图标文件

需要在 `public/` 目录下添加以下图标文件：
- `icon-192.png` (192x192 像素)
- `icon-512.png` (512x512 像素)

可以使用在线工具生成：
- https://www.pwabuilder.com/imageGenerator
- 或使用设计工具创建符合应用风格的图标

### Service Worker 更新

当需要更新 Service Worker 时：
1. 修改 `public/service-worker.js` 中的 `CACHE_VERSION`
2. 重新部署应用
3. 用户下次访问时会自动更新缓存

## 🚀 部署注意事项

1. **HTTPS 要求**：PWA 功能必须在 HTTPS 环境下运行（localhost 除外）
2. **图标文件**：确保图标文件存在于 `public/` 目录
3. **Service Worker 路径**：确保 `/service-worker.js` 可以正常访问
4. **Manifest 路径**：确保 `/manifest.json` 可以正常访问

## 📝 测试清单

- [ ] 应用可以正常安装到主屏幕
- [ ] 安装后可以独立运行（不显示浏览器地址栏）
- [ ] 离线时可以查看已保存的记录
- [ ] 离线时可以添加新记录
- [ ] 网络恢复后数据可以正常同步
- [ ] Service Worker 正常注册和更新

