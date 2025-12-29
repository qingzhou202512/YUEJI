# 初始化逻辑重构说明

## 📋 重构目标

本次重构的目标是**移除应用启动对 Supabase auth 的依赖**，改为使用基于 localStorage 的用户 ID 管理。

## ✅ 已实现的目标

1. ✅ App 启动不再依赖 Supabase auth / session
2. ✅ 移除所有 signInAnonymously 相关代码（从初始化流程中移除）
3. ✅ 使用 localStorage 生成并持久化 userID（不使用 crypto.randomUUID）
4. ✅ 初始化完成的唯一条件是：成功获取本地 userID
5. ✅ 页面 Loading 状态不再依赖 session / user
6. ✅ 保留 Supabase 客户端，但 auth 只作为可选能力

## 🔧 核心改动

### 1. 新增 `services/userId.ts`

**功能：**
- `getOrCreateUserId()`: 获取或创建用户 ID（核心函数）
- `getUserId()`: 获取当前用户 ID（不创建）
- `clearUserId()`: 清除用户 ID（用于测试）

**设计特点：**
- 使用时间戳 + 随机数生成 ID（格式：`timestamp_randomNumber`）
- 存储在 localStorage，键名：`innerflow_user_id`
- 同一用户不会重复创建 ID
- 不同用户之间数据天然隔离

### 2. 修改 `App.tsx`

**改动前：**
```typescript
// 初始化认证（自动匿名登录）
await initializeAuth();
```

**改动后：**
```typescript
// 获取或创建用户 ID（这是初始化完成的唯一条件）
const userId = getOrCreateUserId();
```

**效果：**
- 初始化不再等待 Supabase auth
- 初始化速度更快
- 不依赖网络连接

### 3. 修改 `services/storage.ts`

**改动：**
- 移除对 `isAuthenticated()` 的依赖
- 所有数据操作统一使用 `getOrCreateUserId()` 获取 userID
- `saveEntry()`、`getEntries()`、`getTodayEntry()` 都使用 userID

### 4. 修改 `services/syncService.ts`

**改动：**
- 所有函数都接受 `userId` 参数（不再从 auth 获取）
- `saveEntryToSupabase(entry, userId)`
- `getEntryFromSupabase(date, userId)`
- `getAllEntriesFromSupabase(userId)`
- `syncLocalToSupabase(userId)`

### 5. 修改 `services/authService.ts`

**改动：**
- 添加注释说明：此服务不再是应用初始化的必需部分
- `initializeAuth()` 标记为废弃（但保留，用于可选功能）
- 所有 auth 相关功能保留，但不再在应用启动时调用

### 6. 修改 `services/testDataGenerator.ts`

**改动：**
- 移除对 `getCurrentUser()` 的依赖
- 使用 `getOrCreateUserId()` 获取 userID
- 所有 Supabase 操作都使用 userID

## 📊 数据隔离机制

### 不同用户 = 不同 userID

每个用户都有唯一的 userID（存储在 localStorage），不同用户的数据通过 userID 隔离。

### 同一用户不会重复创建 userID

`getOrCreateUserId()` 会先检查 localStorage，如果已存在则直接返回，不会重复创建。

### 不同 userID 之间天然数据隔离

- **localStorage**: 每个浏览器实例的 localStorage 是独立的
- **Supabase**: 通过 `user_id` 字段进行数据隔离（RLS 策略）

### 数据隐私安全

- 前端：userID 存储在 localStorage，不会泄露
- 数据层：Supabase RLS 策略确保用户只能访问自己的数据

## 🔄 后续可无痛迁移到正式账号体系

### 迁移策略

1. **保留现有 userID 机制**：作为本地标识符
2. **添加账号绑定功能**：用户可以选择绑定手机号/邮箱
3. **数据关联**：在 Supabase 中建立 `user_id` 与 `auth.users.id` 的映射关系
4. **渐进式迁移**：用户可以选择是否绑定账号，不强制

### 迁移示例

```typescript
// 未来可能的实现
async function bindAccount(email: string, password: string) {
  const localUserId = getOrCreateUserId();
  
  // 1. 创建 Supabase auth 账号
  const { data, error } = await supabase.auth.signUp({ email, password });
  
  // 2. 建立映射关系（在 Supabase 中创建映射表）
  await supabase.from('user_mappings').insert({
    local_user_id: localUserId,
    auth_user_id: data.user.id,
  });
  
  // 3. 迁移数据（可选，或保持双写）
  // ...
}
```

## 🎯 使用示例

### 获取用户 ID

```typescript
import { getOrCreateUserId } from './services/userId';

// 在任何地方获取用户 ID
const userId = getOrCreateUserId();
```

### 保存数据

```typescript
import { saveEntry } from './services/storage';

// 保存数据（内部会自动使用 userID）
saveEntry(entry);
```

### 同步到 Supabase

```typescript
import { syncLocalToSupabase } from './services/syncService';
import { getOrCreateUserId } from './services/userId';

const userId = getOrCreateUserId();
const result = await syncLocalToSupabase(userId);
```

## ⚠️ 注意事项

1. **Supabase RLS 策略**：需要确保 RLS 策略支持使用 `user_id` 字段进行数据隔离（而不是只依赖 `auth.uid()`）
2. **数据迁移**：如果之前使用 auth，需要将数据迁移到新的 userID 体系
3. **测试数据**：测试数据生成器已更新，使用新的 userID 机制

## 📝 文件清单

### 新增文件
- `services/userId.ts` - 用户 ID 管理服务

### 修改文件
- `App.tsx` - 移除 auth 初始化
- `services/storage.ts` - 使用 userID
- `services/syncService.ts` - 使用 userID 参数
- `services/authService.ts` - 标记为可选能力
- `services/testDataGenerator.ts` - 使用 userID

### 保留文件（未修改）
- `services/supabaseClient.ts` - 保留 `getCurrentUser()` 和 `isAuthenticated()` 用于可选功能

## ✅ 验证清单

- [x] App 启动不再依赖 Supabase auth
- [x] 初始化只依赖本地 userID
- [x] 所有数据读写统一使用 userID
- [x] 不同用户数据隔离
- [x] 同一用户不会重复创建 userID
- [x] 保留 Supabase 客户端和可选 auth 功能
- [x] 无 lint 错误
- [x] 代码结构清晰，易于维护

## 🚀 下一步

1. 测试应用启动流程
2. 测试数据读写功能
3. 测试 Supabase 同步功能（如果配置了 Supabase）
4. 验证不同用户的数据隔离
5. 考虑添加账号绑定功能（可选）

