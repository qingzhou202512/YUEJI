# Supabase 集成说明

## 概述

项目已集成 Supabase 数据同步功能，采用**离线优先**策略，确保数据安全和不丢失。

### 🎯 匿名登录（自动启用）

应用支持**匿名登录**，用户首次打开应用时会自动创建匿名账号：
- ✅ 无需注册，立即可用
- ✅ 每个用户都有唯一的 `user_id`
- ✅ 数据自动隔离（RLS 保护）
- ✅ 后续可以绑定手机号/邮箱升级账号

详细配置请参考 [SUPABASE-ANONYMOUS-AUTH.md](./SUPABASE-ANONYMOUS-AUTH.md)

## 核心特性

### 1. 离线优先策略

- ✅ **保存时**：先保存到 localStorage，后台异步同步到 Supabase
- ✅ **读取时**：优先从 localStorage 读取（快速响应），后台同步 Supabase 数据
- ✅ **数据安全**：数据永远不会丢失（已保存到 localStorage）
- ✅ **用户体验**：UI 响应快速，不等待网络请求

### 2. 自动降级

- 如果 Supabase 未配置 → 自动使用 localStorage
- 如果用户未登录 → 自动使用 localStorage
- 如果网络失败 → 自动使用 localStorage

### 3. 数据同步

- 首次登录时自动同步 localStorage 数据到 Supabase
- 每次保存时自动同步到 Supabase
- 同步失败不影响使用（数据已保存在本地）

## 文件结构

```
services/
├── supabaseClient.ts    # Supabase 客户端配置
├── syncService.ts       # 数据同步服务（localStorage ↔ Supabase）
├── storage.ts           # 统一存储接口（自动选择数据源）
└── authService.ts       # 用户认证服务
```

## 使用方式

### 基本使用（无需修改现有代码）

现有的组件代码**不需要修改**，因为 `storage.ts` 保持了同步接口：

```typescript
import { saveEntry, getEntries, getTodayEntry } from './services/storage';

// 保存记录（自动同步到 Supabase）
saveEntry(entry);

// 获取记录（优先从 localStorage，后台同步 Supabase）
const entries = getEntries();
const today = getTodayEntry();
```

### 配置 Supabase

1. **安装依赖**（已完成）：
   ```bash
   npm install
   ```

2. **配置环境变量**（`.env.local`）：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **执行数据库脚本**：
   - 在 Supabase Dashboard > SQL Editor 中执行 `database/schema.sql`

3. **启用匿名登录**（重要）：
   - 在 Supabase Dashboard > Authentication > Providers 中启用 **Anonymous** 登录
   - 这是应用自动登录功能的关键

详细步骤请参考：
- `SUPABASE-SETUP.md` - 基础设置
- `SUPABASE-ANONYMOUS-AUTH.md` - 匿名登录配置

## 数据流程

### 保存记录流程

```
用户保存记录
    ↓
1. 立即保存到 localStorage ✅（快速响应）
    ↓
2. 后台检查 Supabase 是否可用
    ↓
3. 如果可用且用户已登录 → 同步到 Supabase
    ↓
4. 同步失败？不影响使用（数据已在 localStorage）
```

### 读取记录流程

```
用户读取记录
    ↓
1. 立即从 localStorage 返回 ✅（快速响应）
    ↓
2. 后台检查 Supabase 是否可用
    ↓
3. 如果可用且用户已登录 → 从 Supabase 获取最新数据
    ↓
4. 更新 localStorage 缓存
```

## 数据转换

### 前端格式 → 数据库格式

```typescript
// 前端：数组格式
{
  achievements: ['成就1', '成就2', '成就3'],
  happiness: ['幸福1', '幸福2', '幸福3']
}

// 数据库：拆分为两张表
journal_entries (核心表)
  + journal_items (子表，多条记录)
    - type: 'achievement', content: '成就1'
    - type: 'achievement', content: '成就2'
    - type: 'happiness', content: '幸福1'
    ...
```

转换函数在 `syncService.ts` 中：
- `convertToDatabaseFormat()` - 前端 → 数据库
- `convertFromDatabaseFormat()` - 数据库 → 前端

## 用户认证

### 登录/注册

```typescript
import { signIn, signUp, signOut } from './services/authService';

// 登录
await signIn('user@example.com', 'password');

// 注册
await signUp('user@example.com', 'password');

// 登出
await signOut();
```

### 监听认证状态

```typescript
import { onAuthStateChange } from './services/authService';

const cleanup = onAuthStateChange((user) => {
  if (user) {
    console.log('用户已登录:', user.id);
    // 自动同步本地数据到 Supabase
  } else {
    console.log('用户已登出');
  }
});

// 清理监听
cleanup();
```

## 数据迁移

首次登录时，会自动将 localStorage 中的数据迁移到 Supabase：

```typescript
import { syncLocalToSupabase } from './services/syncService';

const result = await syncLocalToSupabase();
console.log(`成功: ${result.success}, 失败: ${result.failed}`);
```

## 错误处理

### 同步失败处理

- ✅ 数据已保存在 localStorage，不会丢失
- ✅ 控制台会输出警告信息
- ✅ 用户无感知（后台异步处理）

### 网络错误处理

- ✅ 自动降级到 localStorage
- ✅ 不阻塞用户操作
- ✅ 网络恢复后自动重试

## 安全说明

1. **RLS 策略**：所有表都启用了行级安全，用户只能访问自己的数据
2. **Anon Key**：使用匿名密钥是安全的（RLS 已启用）
3. **数据隔离**：通过 `user_id` 自动隔离用户数据
4. **前端验证**：前端做基础校验，后端做最终校验

## 性能优化

1. **快速响应**：优先从 localStorage 读取，不等待网络
2. **后台同步**：Supabase 同步在后台异步进行
3. **缓存策略**：从 Supabase 获取的数据会更新 localStorage 缓存
4. **批量操作**：支持批量同步，减少网络请求

## 故障排查

### 问题：数据未同步到 Supabase

**检查清单**：
1. ✅ Supabase 配置是否正确（`.env.local`）
2. ✅ 用户是否已登录
3. ✅ 网络连接是否正常
4. ✅ 浏览器控制台是否有错误

**解决**：
- 数据已保存在 localStorage，不会丢失
- 检查配置后，数据会在下次保存时自动同步

### 问题：RLS 策略错误

**症状**：保存时提示权限错误

**解决**：
1. 检查是否已执行 `database/schema.sql`
2. 检查 RLS 策略是否正确创建
3. 确认用户已登录

## 下一步

1. **实现登录界面**：添加用户登录/注册 UI
2. **实现数据迁移提示**：首次登录时提示用户迁移数据
3. **实现同步状态显示**：显示数据同步状态
4. **实现 AI 洞察**：在 Edge Function 中实现 AI 分析

## 注意事项

1. **环境变量**：不要将 `.env.local` 提交到 Git
2. **数据备份**：定期备份 Supabase 数据
3. **测试环境**：建议在测试环境先验证功能
4. **用户提示**：同步失败时给用户明确提示（可选）

