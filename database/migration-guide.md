# 数据迁移指南

## 从 localStorage 迁移到 Supabase

### 步骤 1：数据转换函数

将前端的数据格式转换为新的数据库格式：

```typescript
import { JournalEntry } from '../types';
import { JournalEntryInsert, JournalItemInsert } from './types';

/**
 * 将前端 JournalEntry 转换为数据库格式
 * 需要拆分为 journal_entries 和 journal_items
 */
export async function convertToDatabaseFormat(
  entry: JournalEntry,
  userId: string,
  supabaseClient: any
): Promise<{ entryId: string }> {
  // 提取日期部分（去掉时间）
  const dateOnly = entry.date.split('T')[0];
  
  // 1. 插入核心表 journal_entries
  const { data: entryData, error: entryError } = await supabaseClient
    .from('journal_entries')
    .upsert({
      user_id: userId,
      date: dateOnly,
      drainer_level: entry.drainerLevel,
      drainer_note: entry.drainerNote || null,
      today_mit_description: entry.todayMitDescription || null,
      mit_completed: entry.mitCompleted,
      mit_reason: entry.mitReason || null,
      tomorrow_mit: entry.tomorrowMit || null,
    }, {
      onConflict: 'user_id,date'
    })
    .select()
    .single();

  if (entryError) {
    throw new Error(`插入 journal_entries 失败: ${entryError.message}`);
  }

  const entryId = entryData.id;

  // 2. 删除旧的 items（如果存在）
  await supabaseClient
    .from('journal_items')
    .delete()
    .eq('journal_entry_id', entryId);

  // 3. 插入 achievements
  const achievementItems: JournalItemInsert[] = entry.achievements
    .filter(a => a && a.trim().length > 0)
    .map(content => ({
      journal_entry_id: entryId,
      type: 'achievement',
      content: content.trim(),
    }));

  if (achievementItems.length > 0) {
    const { error: achievementError } = await supabaseClient
      .from('journal_items')
      .insert(achievementItems);

    if (achievementError) {
      throw new Error(`插入 achievements 失败: ${achievementError.message}`);
    }
  }

  // 4. 插入 happiness
  const happinessItems: JournalItemInsert[] = entry.happiness
    .filter(h => h && h.trim().length > 0)
    .map(content => ({
      journal_entry_id: entryId,
      type: 'happiness',
      content: content.trim(),
    }));

  if (happinessItems.length > 0) {
    const { error: happinessError } = await supabaseClient
      .from('journal_items')
      .insert(happinessItems);

    if (happinessError) {
      throw new Error(`插入 happiness 失败: ${happinessError.message}`);
    }
  }

  return { entryId };
}
```

### 步骤 2：将数据库格式转换为前端格式

```typescript
import { JournalEntry } from '../types';
import { JournalEntryRow, JournalItemRow } from './types';

/**
 * 将数据库格式转换为前端 JournalEntry
 * 需要合并 journal_entries 和 journal_items
 */
export function convertFromDatabaseFormat(
  entryRow: JournalEntryRow,
  items: JournalItemRow[]
): JournalEntry {
  // 重新组合数组字段
  const achievements = items
    .filter(item => item.type === 'achievement')
    .map(item => item.content);

  const happiness = items
    .filter(item => item.type === 'happiness')
    .map(item => item.content);

  // 将 DATE 转换为 ISO 字符串（添加时间部分）
  const dateISO = `${entryRow.date}T00:00:00.000Z`;

  return {
    id: entryRow.id,
    date: dateISO,
    timestamp: new Date(entryRow.created_at).getTime(),
    
    achievements,
    happiness,
    
    drainerLevel: entryRow.drainer_level || 'none',
    drainerNote: entryRow.drainer_note || undefined,
    
    todayMitDescription: entryRow.today_mit_description || '',
    mitCompleted: entryRow.mit_completed,
    mitReason: entryRow.mit_reason || undefined,
    
    tomorrowMit: entryRow.tomorrow_mit || '',
    
    // AI 洞察需要单独查询
    aiInsight: undefined, // 从 ai_insights 表查询
    aiMood: undefined, // 从 ai_insights 表查询
  };
}
```

### 步骤 3：使用视图简化查询

如果使用 `journal_entries_with_items` 视图，可以一次性获取所有数据：

```typescript
/**
 * 使用视图获取完整的日记记录
 */
export async function getJournalEntryWithItems(
  userId: string,
  date: string,
  supabaseClient: any
): Promise<JournalEntry | null> {
  const dateOnly = date.split('T')[0];

  const { data, error } = await supabaseClient
    .from('journal_entries_with_items')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateOnly)
    .single();

  if (error || !data) {
    return null;
  }

  // 转换视图数据为前端格式
  const items = data.items || [];
  return convertFromDatabaseFormat(data, items);
}
```

### 步骤 4：批量迁移脚本

```typescript
import { getEntries } from '../services/storage';
import { convertToDatabaseFormat } from './migration-guide';
import { supabase } from './supabase-client';

/**
 * 一次性迁移所有 localStorage 数据到 Supabase
 */
export async function migrateLocalStorageToSupabase(userId: string) {
  const localEntries = getEntries();
  
  if (localEntries.length === 0) {
    console.log('没有需要迁移的数据');
    return;
  }

  console.log(`准备迁移 ${localEntries.length} 条记录...`);

  const errors: string[] = [];
  let successCount = 0;

  for (const entry of localEntries) {
    try {
      await convertToDatabaseFormat(entry, userId, supabase);
      successCount++;
    } catch (error) {
      errors.push(`记录 ${entry.id} 迁移失败: ${error}`);
    }
  }

  console.log(`迁移完成：成功 ${successCount} 条，失败 ${errors.length} 条`);
  
  if (errors.length > 0) {
    console.error('迁移错误：', errors);
  }

  return {
    success: successCount,
    errors: errors.length,
    errorDetails: errors,
  };
}
```

## 迁移策略

### 方案 1：一次性迁移（推荐）

适合：新用户或数据量小（< 100 条）

1. 用户首次登录时自动迁移
2. 迁移完成后，清空 localStorage
3. 后续所有操作直接使用 Supabase

### 方案 2：渐进式迁移

适合：已有用户或数据量大

1. 读取时：优先从 Supabase 读取，如果没有再从 localStorage 读取
2. 写入时：同时写入 Supabase 和 localStorage（双写）
3. 后台任务：逐步将 localStorage 数据迁移到 Supabase
4. 迁移完成后：停止使用 localStorage

### 方案 3：离线优先（PWA 场景）

1. 离线时：使用 localStorage
2. 在线时：同步到 Supabase
3. 冲突解决：以 Supabase 为准

## 注意事项

1. **数据验证**：迁移前验证数据格式
2. **错误处理**：记录所有失败的数据，便于后续重试
3. **用户提示**：迁移过程中给用户明确的进度提示
4. **备份**：迁移前备份 localStorage 数据
5. **回滚**：准备回滚方案，以防迁移失败
6. **事务处理**：确保 journal_entries 和 journal_items 的插入是原子操作

## 查询示例

### 获取某天的完整记录

```typescript
// 方法 1：使用视图（推荐）
const { data } = await supabase
  .from('journal_entries_with_items')
  .select('*')
  .eq('user_id', userId)
  .eq('date', '2024-01-01')
  .single();

// 方法 2：分别查询
const { data: entry } = await supabase
  .from('journal_entries')
  .select('*')
  .eq('user_id', userId)
  .eq('date', '2024-01-01')
  .single();

const { data: items } = await supabase
  .from('journal_items')
  .select('*')
  .eq('journal_entry_id', entry.id);
```

### 获取用户所有记录

```typescript
const { data: entries } = await supabase
  .from('journal_entries')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false });
```

### 获取用户的 AI 洞察

```typescript
const { data: insights } = await supabase
  .from('ai_insights')
  .select('*')
  .eq('user_id', userId)
  .eq('category', 'mood')
  .eq('period', 'weekly')
  .order('created_at', { ascending: false })
  .limit(1);
```
