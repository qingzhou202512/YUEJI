# 部署指南

## 快速部署到 Vercel（推荐）

Vercel 是最简单的部署方式，支持 Vite + React 项目，完全免费。

### 步骤

1. **准备代码**
   - 确保代码已提交到 Git（GitHub/GitLab/Bitbucket）

2. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

3. **导入项目**
   - 点击 "Add New Project"
   - 选择你的代码仓库
   - Vercel 会自动检测 Vite 项目

4. **配置环境变量**
   - 在项目设置中添加环境变量：
     ```
     VITE_SUPABASE_URL=你的 Supabase URL
     VITE_SUPABASE_ANON_KEY=你的 Supabase Anon Key
     GEMINI_API_KEY=你的 Gemini API Key（可选）
     ```

5. **部署**
   - 点击 "Deploy"
   - 等待几分钟，Vercel 会自动构建和部署
   - 完成后会得到一个 `https://your-project.vercel.app` 的链接

### 优势

- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（每次 push 代码自动更新）
- ✅ 支持 PWA

---

## 其他部署选项

### Netlify

1. 访问 https://netlify.com
2. 拖拽 `dist` 文件夹到 Netlify
3. 或连接 Git 仓库自动部署

### Cloudflare Pages

1. 访问 https://pages.cloudflare.com
2. 连接 Git 仓库
3. 构建命令：`npm run build`
4. 输出目录：`dist`

### GitHub Pages

1. 在 `package.json` 中添加：
   ```json
   "homepage": "https://your-username.github.io/your-repo-name"
   ```
2. 安装 `gh-pages`：`npm install -D gh-pages`
3. 添加脚本：
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```
4. 运行：`npm run deploy`

---

## 部署前检查清单

- [ ] 确保 `.env.local` 中的环境变量已配置
- [ ] 确保 Supabase 已配置（URL 和 Anon Key）
- [ ] 确保 Supabase 匿名登录已启用
- [ ] 确保数据库表结构已创建
- [ ] 测试本地运行：`npm run build && npm run preview`

---

## 注意事项

1. **环境变量**
   - Vercel/Netlify 需要在项目设置中配置环境变量
   - 不要将 `.env.local` 提交到 Git

2. **PWA 配置**
   - 确保 `manifest.json` 和 Service Worker 已配置
   - 部署后测试 PWA 安装功能

3. **Supabase CORS**
   - 如果遇到 CORS 错误，检查 Supabase Dashboard > Settings > API
   - 确保允许的域名包含你的部署域名

4. **HTTPS**
   - 所有部署平台都自动提供 HTTPS
   - 这对 PWA 和 Service Worker 是必需的

---

## 快速开始（Vercel CLI）

如果你想用命令行部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

---

## 获取外网链接

部署完成后，你会得到类似这样的链接：
- Vercel: `https://your-project.vercel.app`
- Netlify: `https://your-project.netlify.app`
- Cloudflare: `https://your-project.pages.dev`

这个链接可以在任何地方访问，包括手机、其他电脑等。




