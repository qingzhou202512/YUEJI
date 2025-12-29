# 测试数据生成工具使用说明

## 📋 概述

为了方便测试应用功能，我们提供了一个测试数据生成工具，可以快速生成：
- **日记记录**：模拟多天的日记内容
- **冥想记录**：模拟冥想会话数据
- **AI 洞察**：模拟 AI 分析结果

## 🚀 使用方法

### 方法 1：使用 UI 按钮（推荐）

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **打开应用**，在右上角会看到一个 **"生成测试数据"** 按钮（仅在开发环境显示）

3. **点击按钮**，等待生成完成

4. **查看结果**：会显示生成的数据统计信息

### 方法 2：使用浏览器控制台

1. **打开应用**，按 `F12` 打开开发者工具

2. **切换到 Console（控制台）标签**

3. **输入以下命令**：

   ```javascript
   // 生成默认测试数据（30天日记，15天冥想，包含AI洞察）
   window.generateTestData()
   ```

4. **或者自定义生成选项**：

   ```javascript
   window.generateTestData({
     journalDays: 30,      // 生成30天的日记记录
     meditationDays: 15,    // 生成15天的冥想记录
     aiInsights: true,      // 是否生成AI洞察
     clearExisting: false   // 是否清除现有数据
   })
   ```

5. **清除现有数据并重新生成**：

   ```javascript
   window.generateTestData({ clearExisting: true })
   ```

## 📊 生成的数据说明

### 日记记录（Journal Entries）

- **数量**：默认生成 30 天的记录（70% 概率生成，模拟真实使用）
- **内容**：包括成就、幸福感、能量消耗、MIT（最重要的事）等
- **存储位置**：
  - `localStorage`（离线备份）
  - Supabase（如果已配置）

### 冥想记录（Meditation Sessions）

- **数量**：默认生成 15 天的记录（60% 概率生成）
- **内容**：包括时长（5-30分钟）、音频类型、完成状态
- **存储位置**：Supabase（需要 Supabase 配置）

### AI 洞察（AI Insights）

- **数量**：8 条（4 个类别 × 2 个周期）
- **类别**：情绪（mood）、兴趣（interest）、能力（ability）、习惯（habit）
- **周期**：每周（weekly）、每月（monthly）
- **存储位置**：Supabase（需要 Supabase 配置）

## ⚙️ 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `journalDays` | number | 30 | 生成多少天的日记记录 |
| `meditationDays` | number | 15 | 生成多少天的冥想记录 |
| `aiInsights` | boolean | true | 是否生成 AI 洞察 |
| `clearExisting` | boolean | false | 是否清除现有数据 |

## 🔍 验证生成的数据

### 1. 检查 localStorage

打开浏览器控制台，输入：

```javascript
// 查看日记记录
JSON.parse(localStorage.getItem('innerflow_entries'))
```

### 2. 检查 Supabase（如果已配置）

1. 登录 Supabase Dashboard
2. 进入 **Table Editor**
3. 查看以下表：
   - `journal_entries` - 日记记录
   - `journal_items` - 日记条目（成就、幸福感）
   - `meditation_sessions` - 冥想记录
   - `ai_insights` - AI 洞察

### 3. 在应用中查看

- **首页**：应该能看到最近几天的记录卡片
- **历史页面**：应该能看到日历视图，标记了有记录的日期
- **日记页面**：可以查看和编辑今天的记录

## ⚠️ 注意事项

1. **数据安全**：
   - 测试数据生成工具**不会**在生产环境显示
   - 建议只在开发环境中使用

2. **数据覆盖**：
   - 默认情况下，**不会清除现有数据**
   - 如果设置 `clearExisting: true`，会删除所有现有数据

3. **Supabase 要求**：
   - 冥想记录和 AI 洞察需要 Supabase 配置
   - 如果 Supabase 未配置，只会生成 localStorage 的日记记录

4. **用户认证**：
   - 如果 Supabase 已配置，需要先完成匿名登录
   - 数据会关联到当前登录的用户

## 🐛 常见问题

### Q: 点击按钮没有反应？

**A**: 检查：
1. 是否在开发环境（`npm run dev`）
2. 浏览器控制台是否有错误信息
3. 是否已配置 Supabase（某些数据需要 Supabase）

### Q: 生成的数据没有显示在应用中？

**A**: 尝试：
1. 刷新页面
2. 检查浏览器控制台的错误信息
3. 确认 Supabase 连接正常（如果使用了 Supabase）

### Q: 如何清除所有测试数据？

**A**: 在浏览器控制台输入：

```javascript
// 清除 localStorage
localStorage.removeItem('innerflow_entries')

// 如果使用 Supabase，需要在 Supabase Dashboard 中手动删除
// 或者使用 clearExisting: true 选项
window.generateTestData({ clearExisting: true })
```

## 📝 示例

### 生成 7 天的测试数据

```javascript
window.generateTestData({
  journalDays: 7,
  meditationDays: 5,
  aiInsights: false,
  clearExisting: false
})
```

### 清除并重新生成完整数据

```javascript
window.generateTestData({
  journalDays: 60,
  meditationDays: 30,
  aiInsights: true,
  clearExisting: true  // 注意：这会删除所有现有数据！
})
```

## 🎯 下一步

生成测试数据后，你可以：

1. **测试首页**：查看记录卡片显示
2. **测试历史页面**：查看日历视图和记录列表
3. **测试日记功能**：创建、编辑、保存记录
4. **测试数据同步**：检查 localStorage 和 Supabase 的数据一致性
5. **测试离线功能**：断开网络，验证离线访问

---

**提示**：如果遇到任何问题，请查看浏览器控制台的错误信息，或检查 Supabase Dashboard 中的数据。

