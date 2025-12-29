/**
 * 数据同步服务
 * 实现 localStorage 和 Supabase 之间的数据同步
 * 
 * 策略：离线优先
 * - 离线时：使用 localStorage
 * - 在线时：同步到 Supabase
 * - 冲突解决：以 Supabase 为准
 */

import { JournalEntry } from '../types';
import { JournalEntryRow, JournalItemRow, JournalEntryInsert, JournalItemInsert } from '../database/types';
import { supabase, isSupabaseAvailable, getCurrentUser } from './supabaseClient';
import { saveEntry as saveToLocalStorage, getEntries as getFromLocalStorage } from './storage';

// ============================================
// 数据转换函数
// ============================================

/**
 * 将前端 JournalEntry 转换为数据库格式
 * 拆分为 journal_entries 和 journal_items
 */
export function convertToDatabaseFormat(
  entry: JournalEntry,
  userId: string
): { entry: JournalEntryInsert; items: JournalItemInsert[] } {
  // 提取日期部分（去掉时间）
  const dateOnly = entry.date.split('T')[0];
  
  // 核心表数据
  const entryData: JournalEntryInsert = {
    user_id: userId,
    date: dateOnly,
    drainer_level: entry.drainerLevel || null,
    drainer_note: entry.drainerNote || null,
    today_mit_description: entry.todayMitDescription || null,
    mit_completed: entry.mitCompleted,
    mit_reason: entry.mitReason || null,
    tomorrow_mit: entry.tomorrowMit || null,
  };

  // 子表数据（items）
  const items: JournalItemInsert[] = [];
  
  // 添加 achievements
  entry.achievements.forEach(content => {
    if (content && content.trim().length > 0) {
      items.push({
        journal_entry_id: '', // 会在插入后填充
        type: 'achievement',
        content: content.trim(),
      });
    }
  });

  // 添加 happiness
  entry.happiness.forEach(content => {
    if (content && content.trim().length > 0) {
      items.push({
        journal_entry_id: '', // 会在插入后填充
        type: 'happiness',
        content: content.trim(),
      });
    }
  });

  return { entry: entryData, items };
}

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
    aiInsight: undefined,
    aiMood: undefined,
  };
}

// ============================================
// 同步操作函数
// ============================================

/**
 * 保存记录到 Supabase
 * 同时保存到 localStorage（作为备份）
 */
export async function saveEntryToSupabase(entry: JournalEntry): Promise<{ success: boolean; error?: string }> {
  // 1. 先保存到 localStorage（离线备份）
  saveToLocalStorage(entry);

  // 2. 如果 Supabase 不可用，只使用 localStorage
  if (!isSupabaseAvailable()) {
    return { success: true }; // 已保存到 localStorage
  }

  // 3. 获取当前用户
  const user = await getCurrentUser();
  if (!user) {
    // 用户未登录，只保存到 localStorage
    return { success: true };
  }

  try {
    // 4. 转换数据格式
    const { entry: entryData, items } = convertToDatabaseFormat(entry, user.id);
    const dateOnly = entry.date.split('T')[0];

    // 5. 使用 upsert 插入或更新核心表
    const { data: entryResult, error: entryError } = await supabase
      .from('journal_entries')
      .upsert(entryData, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (entryError) {
      console.error('[Sync] 保存 journal_entries 失败:', entryError);
      return { success: false, error: entryError.message };
    }

    const entryId = entryResult.id;

    // 6. 删除旧的 items（如果存在）
    await supabase
      .from('journal_items')
      .delete()
      .eq('journal_entry_id', entryId);

    // 7. 插入新的 items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        ...item,
        journal_entry_id: entryId,
      }));

      const { error: itemsError } = await supabase
        .from('journal_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('[Sync] 保存 journal_items 失败:', itemsError);
        return { success: false, error: itemsError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[Sync] 保存失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}

/**
 * 从 Supabase 获取某天的记录
 */
export async function getEntryFromSupabase(date: Date): Promise<JournalEntry | null> {
  if (!isSupabaseAvailable()) {
    // 降级到 localStorage
    const localEntries = getFromLocalStorage();
    const dateStr = date.toISOString().split('T')[0];
    const entry = localEntries.find(e => e.date.startsWith(dateStr));
    return entry || null;
  }

  const user = await getCurrentUser();
  if (!user) {
    // 用户未登录，使用 localStorage
    const localEntries = getFromLocalStorage();
    const dateStr = date.toISOString().split('T')[0];
    const entry = localEntries.find(e => e.date.startsWith(dateStr));
    return entry || null;
  }

  try {
    const dateOnly = date.toISOString().split('T')[0];

    // 获取核心记录
    const { data: entryRow, error: entryError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateOnly)
      .single();

    if (entryError || !entryRow) {
      return null;
    }

    // 获取关联的 items
    const { data: items, error: itemsError } = await supabase
      .from('journal_items')
      .select('*')
      .eq('journal_entry_id', entryRow.id)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('[Sync] 获取 journal_items 失败:', itemsError);
      return null;
    }

    // 转换为前端格式
    return convertFromDatabaseFormat(entryRow, items || []);
  } catch (error) {
    console.error('[Sync] 获取记录失败:', error);
    return null;
  }
}

/**
 * 从 Supabase 获取所有记录
 */
export async function getAllEntriesFromSupabase(): Promise<JournalEntry[]> {
  if (!isSupabaseAvailable()) {
    // 降级到 localStorage
    return getFromLocalStorage();
  }

  const user = await getCurrentUser();
  if (!user) {
    // 用户未登录，使用 localStorage
    return getFromLocalStorage();
  }

  try {
    // 获取所有核心记录
    const { data: entries, error: entriesError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (entriesError) {
      console.error('[Sync] 获取所有记录失败:', entriesError);
      return getFromLocalStorage(); // 降级
    }

    if (!entries || entries.length === 0) {
      return [];
    }

    // 获取所有 items
    const entryIds = entries.map(e => e.id);
    const { data: allItems, error: itemsError } = await supabase
      .from('journal_items')
      .select('*')
      .in('journal_entry_id', entryIds)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('[Sync] 获取所有 items 失败:', itemsError);
      return getFromLocalStorage(); // 降级
    }

    // 按 entry_id 分组 items
    const itemsByEntryId = new Map<string, JournalItemRow[]>();
    (allItems || []).forEach(item => {
      if (!itemsByEntryId.has(item.journal_entry_id)) {
        itemsByEntryId.set(item.journal_entry_id, []);
      }
      itemsByEntryId.get(item.journal_entry_id)!.push(item);
    });

    // 转换为前端格式
    return entries.map(entryRow => {
      const items = itemsByEntryId.get(entryRow.id) || [];
      return convertFromDatabaseFormat(entryRow, items);
    });
  } catch (error) {
    console.error('[Sync] 获取所有记录失败:', error);
    return getFromLocalStorage(); // 降级
  }
}

/**
 * 同步本地数据到 Supabase
 * 用于首次登录或数据迁移
 */
export async function syncLocalToSupabase(): Promise<{ success: number; failed: number; errors: string[] }> {
  const localEntries = getFromLocalStorage();
  
  if (localEntries.length === 0) {
    return { success: 0, failed: 0, errors: [] };
  }

  if (!isSupabaseAvailable()) {
    return { success: 0, failed: localEntries.length, errors: ['Supabase 未配置'] };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: 0, failed: localEntries.length, errors: ['用户未登录'] };
  }

  const errors: string[] = [];
  let successCount = 0;

  for (const entry of localEntries) {
    const result = await saveEntryToSupabase(entry);
    if (result.success) {
      successCount++;
    } else {
      errors.push(`记录 ${entry.id} 同步失败: ${result.error}`);
    }
  }

  return {
    success: successCount,
    failed: localEntries.length - successCount,
    errors,
  };
}

