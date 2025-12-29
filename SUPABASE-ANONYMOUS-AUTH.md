# Supabase 匿名登录配置指南

## 概述

应用已实现**匿名登录**功能，用户首次打开应用时会自动创建匿名账号，无需注册即可立即使用。

## 工作原理

1. **首次打开**：应用自动检查是否有登录 session
2. **无 session**：自动调用 `signInAnonymously()` 创建匿名账号
3. **有 session**：直接使用现有 session
4. **数据隔离**：每个匿名用户都有唯一的 `user_id`，数据通过 RLS 自动隔离
5. **后续升级**：匿名账号可以绑定手机号或邮箱，升级为正式账号

## Supabase 配置步骤

### 1. 启用匿名登录

在 Supabase Dashboard 中启用匿名登录：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** > **Providers**
4. 找到 **Anonymous** 选项
5. 点击 **Enable** 启用匿名登录

### 2. 验证 RLS 策略

确保所有表的 RLS 策略已正确设置（已在 `database/schema.sql` 中配置）：

- ✅ `journal_entries` - 用户只能访问自己的记录
- ✅ `journal_items` - 用户只能访问自己的条目
- ✅ `meditation_sessions` - 用户只能访问自己的冥想记录
- ✅ `ai_insights` - 用户只能读取自己的 AI 洞察

所有策略都使用 `auth.uid() = user_id` 来确保数据隔离。

### 3. 测试匿名登录

1. 清除浏览器 localStorage 和 sessionStorage
2. 刷新页面
3. 打开浏览器控制台，应该看到：
   ```
   [Auth] 未检测到 session，自动创建匿名账号...
   [Auth] 匿名登录成功，用户 ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   [Auth] 数据同步完成: { success: X, failed: 0, errors: [] }
   ```

## 代码实现

### 自动初始化

在 `App.tsx` 中，应用启动时自动调用（只调用一次）：

```typescript
useEffect(() => {
  const initApp = async () => {
    // 1. 初始化认证（自动匿名登录，生产级实现）
    await initializeAuth();
    // ...
  };
  initApp();
}, []); // 空依赖数组，确保只执行一次
```

### 匿名登录函数（生产级实现）

在 `services/authService.ts` 中：

```typescript
export const initAnonymousAuth = async () => {
  // 1. 先检查本地是否有 session
  const { data: { session } } = await supabase.auth.getSession();
  
  // 2. 如果已经有登录态，直接返回
  if (session?.user) {
    return session.user;
  }

  // 3. 防并发锁：检查是否有其他 Tab 正在创建
  if (localStorage.getItem('anon_auth_in_progress')) {
    // 等待其他 Tab 完成...
  }

  // 4. 设置锁，防止并发创建
  localStorage.setItem('anon_auth_in_progress', '1');
  
  try {
    // 5. 再次检查 session（防止在设置锁的过程中其他 Tab 已创建）
    // 6. 创建匿名账号
    const { data, error } = await supabase.auth.signInAnonymously();
    // ...
  } finally {
    // 7. 清除锁
    localStorage.removeItem('anon_auth_in_progress');
  }
};
```

### 核心特性

✅ **防止重复创建**：页面刷新不会反复创建匿名用户  
✅ **会话复用**：已有会话就直接复用  
✅ **防并发**：防止双 Tab 同时打开时重复创建  
✅ **只在完全没有 session 时才创建**：严格检查逻辑

## 匿名用户特性

### ✅ 已实现

- **唯一 user_id**：每个匿名用户都有唯一的 UUID
- **Auth session**：完整的 Supabase Auth session
- **RLS 保护**：数据自动隔离，用户只能访问自己的数据
- **数据同步**：匿名登录后自动同步本地数据到 Supabase
- **持久化**：session 会持久化，刷新页面后仍然有效

### 🔄 后续可扩展

- **绑定手机号**：匿名用户可以通过手机号升级账号
- **绑定邮箱**：匿名用户可以通过邮箱升级账号
- **设置密码**：升级为正式账号后可以设置密码
- **数据迁移**：升级账号时数据自动保留（因为 user_id 不变）

## 数据流程

```
用户首次打开应用
    ↓
检查是否有 session
    ↓
没有 session → 自动创建匿名账号
    ↓
获得 user_id 和 session
    ↓
自动同步本地数据到 Supabase
    ↓
所有数据自动关联到 user_id
    ↓
RLS 确保数据隔离
```

## 注意事项

### 1. 匿名用户限制

- 匿名用户无法通过邮箱/密码登录（因为没有邮箱）
- 匿名用户无法重置密码（因为没有邮箱）
- 匿名用户可以通过绑定手机号/邮箱升级为正式账号

### 2. 数据安全

- ✅ 所有数据都通过 RLS 自动隔离
- ✅ 每个用户只能访问自己的数据
- ✅ 匿名用户的 user_id 是永久的，不会改变

### 3. 用户体验

- ✅ 无需注册，立即可用
- ✅ 数据自动同步到云端
- ✅ 可以随时升级为正式账号
- ✅ 升级后数据自动保留

## 故障排查

### 问题：匿名登录失败

**可能原因**：
1. Supabase Dashboard 中未启用匿名登录
2. 网络连接问题
3. Supabase 配置错误

**解决**：
1. 检查 Supabase Dashboard > Authentication > Providers > Anonymous 是否已启用
2. 检查浏览器控制台错误信息
3. 检查 `.env.local` 中的 Supabase 配置

### 问题：数据未同步

**可能原因**：
1. 匿名登录失败
2. RLS 策略未正确设置
3. 数据转换错误

**解决**：
1. 检查浏览器控制台的日志
2. 确认 `database/schema.sql` 已执行
3. 检查 RLS 策略是否正确

## 升级账号（未来功能）

匿名用户可以通过以下方式升级为正式账号：

```typescript
// 绑定手机号
await supabase.auth.updateUser({
  phone: '+86xxxxxxxxxxx'
});

// 或绑定邮箱
await supabase.auth.updateUser({
  email: 'user@example.com'
});

// 设置密码
await supabase.auth.updateUser({
  password: 'newpassword'
});
```

升级后，`user_id` 保持不变，所有数据自动保留。

## 总结

匿名登录功能让用户：
- ✅ **零门槛使用**：无需注册，立即可用
- ✅ **数据安全**：每个用户数据自动隔离
- ✅ **无缝升级**：可以随时升级为正式账号
- ✅ **数据保留**：升级后数据不会丢失

这是现代应用的最佳实践，既保证了用户体验，又确保了数据安全。

