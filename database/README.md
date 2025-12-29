# 数据库设计文档

## 表结构概览

### 核心设计理念

1. **核心表（journal_entries）**：一天一行，只存"一天级别"的状态
2. **子表（journal_items）**：所有"多条内容"独立存储，不限制数量
3. **AI 洞察独立表**：支持反复分析和查看历史
4. **冥想记录独立表**：行为数据单独存储

## 表结构说明

### 一、核心表：`journal_entries`

存储用户每天的日记记录，遵循"一天一行记录"的原则。

#### 字段说明

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | UUID | 主键，自动生成 | PRIMARY KEY |
| `user_id` | UUID | 用户ID（关联 Supabase Auth） | NOT NULL, FOREIGN KEY |
| `date` | DATE | 业务日期（记录是哪一天的） | NOT NULL |
| `drainer_level` | TEXT | 能量消耗等级 | CHECK ('none'/'low'/'high') |
| `drainer_note` | TEXT | 能量消耗说明 | 可为空 |
| `today_mit_description` | TEXT | 今日要事描述 | 可为空 |
| `mit_completed` | BOOLEAN | 今日要事是否完成 | DEFAULT false |
| `mit_reason` | TEXT | 未完成原因 | 可为空 |
| `tomorrow_mit` | TEXT | 明日计划 | 可为空 |
| `created_at` | TIMESTAMPTZ | 记录创建时间 | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | 记录更新时间 | NOT NULL, DEFAULT now() |

#### 唯一约束

- `(user_id, date)` - 确保每个用户每天只有一条记录

#### 为什么这样设计？

✅ **严格遵守一天一行原则**：核心表只存"一天级别"的状态，不存碎片

✅ **字段稳定**：UI 怎么改都不用动它

✅ **非常利于 AI 做「按天统计」**：所有一天级别的数据都在一张表里

---

### 二、子表：`journal_items`

存储所有"多条内容"（高光时刻、小确幸）。

#### 字段说明

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | UUID | 主键，自动生成 | PRIMARY KEY |
| `journal_entry_id` | UUID | 关联的日记记录ID | NOT NULL, FOREIGN KEY |
| `type` | TEXT | 类型：'achievement' 或 'happiness' | NOT NULL, CHECK |
| `content` | TEXT | 内容 | NOT NULL |
| `created_at` | TIMESTAMPTZ | 创建时间 | NOT NULL, DEFAULT now() |

#### 为什么一定要拆？

✅ **不限制 3 条**：以后 UI 想改完全没压力

✅ **AI 可以自由统计 / 分类 / 打标签**：所有内容都在一张表里，便于分析

✅ **前端逻辑更自然**：直接 map 列表，不需要处理数组字段

---

### 三、冥想记录表：`meditation_sessions`

存储用户的冥想会话记录。

#### 字段说明

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | UUID | 主键，自动生成 | PRIMARY KEY |
| `user_id` | UUID | 用户ID | NOT NULL, FOREIGN KEY |
| `duration` | INTEGER | 冥想时长（秒） | NOT NULL |
| `audio` | TEXT | 音频类型 | 可为空 |
| `completed` | BOOLEAN | 是否完成 | DEFAULT true |
| `created_at` | TIMESTAMPTZ | 创建时间 | NOT NULL, DEFAULT now() |

#### 为什么独立？

✅ **冥想是「行为数据」，不是「日记内容」**

✅ **后期可以单独做统计 / 成就系统**

---

### 四、AI 洞察结果表：`ai_insights`

存储 AI 分析结果，这是 AI 产品化的核心。

#### 字段说明

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | UUID | 主键，自动生成 | PRIMARY KEY |
| `user_id` | UUID | 用户ID | NOT NULL, FOREIGN KEY |
| `category` | TEXT | 洞察类别 | NOT NULL, CHECK ('mood'/'interest'/'ability'/'habit') |
| `period` | TEXT | 分析周期 | NOT NULL, CHECK ('weekly'/'monthly') |
| `content` | TEXT | 洞察内容 | NOT NULL |
| `created_at` | TIMESTAMPTZ | 创建时间 | NOT NULL, DEFAULT now() |

#### 为什么 AI 一定要独立？

✅ **AI 可以反复重跑**：不污染原始记录

✅ **不污染原始记录**：分析结果和原始数据分离

✅ **前端只读，极好维护**：前端不需要处理复杂的 AI 逻辑

✅ **审核时非常加分**：清晰的架构设计

#### 安全策略

- **前端只读**：用户只能查看自己的 AI 洞察
- **写入走 Edge Function**：使用 service role 写入，确保安全

---

## 索引设计

### journal_entries
- `idx_journal_entries_user_date` - 用户+日期查询（最常用）
- `idx_journal_entries_user_id` - 用户所有记录查询
- `idx_journal_entries_date` - 日期范围查询（统计用）
- `idx_journal_entries_created_at` - 创建时间查询（同步用）

### journal_items
- `idx_journal_items_entry_id` - 关联查询
- `idx_journal_items_type` - 类型查询
- `idx_journal_items_entry_type` - 组合查询

### meditation_sessions
- `idx_meditation_sessions_user_id` - 用户查询
- `idx_meditation_sessions_created_at` - 时间排序

### ai_insights
- `idx_ai_insights_user_id` - 用户查询
- `idx_ai_insights_category` - 类别查询
- `idx_ai_insights_period` - 周期查询
- `idx_ai_insights_user_category_period` - 组合查询（最常用）

## 安全策略（RLS）

所有表都启用了行级安全（Row Level Security），确保：
- 用户只能访问自己的数据
- 自动通过 `auth.uid()` 验证

### 策略说明

1. **journal_entries**：用户可管理自己的记录
2. **journal_items**：通过关联的 journal_entry 验证用户权限
3. **meditation_sessions**：用户可管理自己的冥想记录
4. **ai_insights**：用户只能读取自己的 AI 洞察（写入由 Edge Function 处理）

## 视图

### `journal_entries_with_items`

完整的日记记录视图，包含所有关联的 items。

**使用场景**：前端一次性获取所有数据

### `valid_journal_entries`

有效记录视图，过滤掉只有未完成MIT的记录。

**判断标准**：
- 至少有一项成就或幸福时刻（journal_items）
- 或有能量消耗记录（drainer_level != 'none'）
- 或今日要事已完成（mit_completed = true）

## 函数

### `get_user_streak_days(user_id)`

获取用户连续记录天数。

**逻辑**：从今天开始往前检查，直到遇到没有记录的一天。

**返回**：连续天数（整数）

### `get_user_total_days(user_id)`

获取用户总记录天数。

**返回**：总天数（整数）

## 设计原则说明

### 1. 为什么核心表不存数组？

虽然前端使用数组（achievements, happiness），但数据库拆分成独立表：
- ✅ 便于查询和统计（如"有多少天记录了成就"）
- ✅ 便于索引和优化
- ✅ 符合关系型数据库设计原则
- ✅ 未来扩展更容易（如添加"成就类型"字段）
- ✅ **不限制数量**：UI 可以灵活调整

### 2. 为什么用 DATE 而不是 TIMESTAMP？

- `date` 字段：业务日期，表示"记录是哪一天的"，不包含时间
- `created_at` 字段：记录创建时间，精确到秒

这样设计的好处：
- 日期比较更简单（`date = '2024-01-01'`）
- 统计更准确（按天统计）
- 避免时区问题

### 3. 字段命名规范

- 使用下划线命名（snake_case）
- 字段名清晰表达含义
- 布尔字段使用 `is_` 或直接描述（如 `mit_completed`）
- 时间字段统一使用 `_at` 后缀

### 4. AI 洞察独立表的好处

- **可追溯**：可以看到历史分析结果
- **可重跑**：AI 算法改进后可以重新分析
- **可对比**：可以对比不同时期的分析结果
- **前端简单**：前端只需要读取，不需要处理复杂的 AI 逻辑

## 在 Supabase 中执行

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `schema.sql` 内容
4. 执行 SQL 脚本

## 数据迁移

从 localStorage 迁移到 Supabase 时，需要：

1. 将数组字段拆分到子表：
   ```typescript
   // 前端数据
   achievements: ['成就1', '成就2', '成就3']
   
   // 数据库操作
   // 1. 插入 journal_entries
   // 2. 插入 journal_items（多条）
   ```

2. 日期格式转换：
   ```typescript
   // 前端：ISO 字符串
   date: '2024-01-01T00:00:00.000Z'
   
   // 数据库：DATE 类型
   date: '2024-01-01'
   ```

3. 时间戳转换：
   ```typescript
   // 前端：数字时间戳
   timestamp: 1704067200000
   
   // 数据库：TIMESTAMPTZ
   created_at: '2024-01-01T00:00:00Z'
   ```

## 未来扩展

如果需要添加新功能，可以考虑：

1. **标签系统**：添加 `tags` 表，多对多关系
2. **统计表**：预计算统计数据，提高查询性能
3. **备份表**：定期备份用户数据
4. **导出功能**：添加数据导出记录表
5. **AI 分析历史**：在 `ai_insights` 表中添加版本字段
