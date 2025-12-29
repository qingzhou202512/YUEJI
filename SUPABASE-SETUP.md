# Supabase 设置指南

## 第一步：创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账号
3. 创建新项目
4. 等待项目初始化完成（约 2 分钟）

## 第二步：获取 API 密钥

1. 进入项目 Dashboard
2. 点击左侧菜单 **Settings** > **API**
3. 找到以下信息：
   - **Project URL**（项目 URL）
   - **anon public** key（匿名公钥）

## 第三步：配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**重要**：
- 不要将 `.env.local` 提交到 Git（已在 .gitignore 中）
- `anon key` 是安全的，因为我们已经设置了 RLS（行级安全策略）

## 第四步：执行数据库脚本

1. 在 Supabase Dashboard 中，点击左侧菜单 **SQL Editor**
2. 点击 **New query**
3. 复制 `database/schema.sql` 文件的全部内容
4. 粘贴到 SQL Editor
5. 点击 **Run** 执行

执行成功后，你会看到：
- ✅ 4 张表已创建（journal_entries, journal_items, meditation_sessions, ai_insights）
- ✅ 索引已创建
- ✅ RLS 策略已启用
- ✅ 视图和函数已创建

## 第五步：测试连接

1. 启动开发服务器：`npm run dev`
2. 打开浏览器控制台
3. 检查是否有 Supabase 连接错误

## 数据同步说明

### 离线优先策略

应用采用**离线优先**策略：

1. **保存时**：
   - 先保存到 localStorage（确保离线可用）
   - 如果在线且已登录，同步到 Supabase

2. **读取时**：
   - 如果在线且已登录，优先从 Supabase 读取
   - 否则从 localStorage 读取

3. **数据安全**：
   - 数据永远不会丢失（已保存到 localStorage）
   - 同步失败时会给用户提示，但不影响使用

### 首次登录

用户首次登录时，会自动将 localStorage 中的数据同步到 Supabase。

## 故障排查

### 问题 1：Supabase 未连接

**症状**：控制台显示 "缺少 Supabase 配置"

**解决**：
1. 检查 `.env.local` 文件是否存在
2. 检查环境变量名称是否正确（`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`）
3. 重启开发服务器

### 问题 2：RLS 策略错误

**症状**：保存数据时提示权限错误

**解决**：
1. 检查是否已执行 `database/schema.sql`
2. 检查 RLS 策略是否正确创建
3. 在 Supabase Dashboard > Authentication > Policies 中检查策略

### 问题 3：数据同步失败

**症状**：数据保存到本地但未同步到 Supabase

**解决**：
1. 检查网络连接
2. 检查用户是否已登录
3. 查看浏览器控制台的错误信息
4. 数据已保存在 localStorage，不会丢失

## 下一步

配置完成后，你可以：

1. **实现用户认证**：添加登录/注册界面
2. **数据迁移**：将现有 localStorage 数据迁移到 Supabase
3. **实现 AI 洞察**：在 Edge Function 中实现 AI 分析功能

## 安全说明

- ✅ 使用 `anon key` 是安全的（RLS 已启用）
- ✅ 用户只能访问自己的数据
- ✅ 所有敏感操作都经过 RLS 验证
- ✅ AI 写入使用 service role（在 Edge Function 中）




