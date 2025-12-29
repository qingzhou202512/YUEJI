/**
 * 数据存储服务
 * 支持 localStorage 和 Supabase 双写
 * 策略：离线优先，在线时同步到 Supabase
 */

import { JournalEntry } from '../types';
import { saveEntryToSupabase, getEntryFromSupabase, getAllEntriesFromSupabase } from './syncService';
import { isSupabaseAvailable } from './supabaseClient';
import { getOrCreateUserId } from './userId';

const STORAGE_KEY = 'innerflow_entries';

// ============================================
// localStorage 操作（备份和离线支持）
// ============================================

/**
 * 保存到 localStorage
 */
const saveToLocalStorage = (entry: JournalEntry): void => {
  const existing = getFromLocalStorage();
  const filtered = existing.filter(e => e.id !== entry.id);
  const updated = [entry, ...filtered];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

/**
 * 从 localStorage 读取
 */
const getFromLocalStorage = (): JournalEntry[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // Sort by date descending
    return parsed.sort((a: JournalEntry, b: JournalEntry) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (e) {
    console.error("Failed to parse entries", e);
    return [];
  }
};

// ============================================
// 统一接口（自动选择数据源）
// ============================================

/**
 * 保存记录（同步版本）
 * 策略：
 * 1. 先保存到 localStorage（确保离线可用）
 * 2. 后台异步同步到 Supabase（如果可用）
 */
export const saveEntry = (entry: JournalEntry): void => {
  // 1. 先保存到 localStorage（离线备份，立即生效）
  saveToLocalStorage(entry);

  // 2. 后台异步同步到 Supabase（不阻塞 UI）
  if (isSupabaseAvailable()) {
    // 获取用户 ID（不依赖 auth）
    const userId = getOrCreateUserId();
    saveEntryToSupabase(entry, userId).then(result => {
      if (!result.success) {
        console.warn('[Storage] 同步到 Supabase 失败，但已保存到本地:', result.error);
      }
    }).catch(error => {
      console.warn('[Storage] 同步到 Supabase 出错:', error);
    });
  }
};

/**
 * 获取所有记录（同步版本，优先从 localStorage）
 * 后台异步同步 Supabase 数据
 */
export const getEntries = (): JournalEntry[] => {
  // 立即返回 localStorage 数据（快速响应）
  const localEntries = getFromLocalStorage();
  
  // 后台异步同步 Supabase（如果可用）
  if (isSupabaseAvailable()) {
    const userId = getOrCreateUserId();
    getAllEntriesFromSupabase(userId).then(entries => {
      // 更新 localStorage 缓存
      if (entries.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      }
    }).catch(error => {
      console.warn('[Storage] 后台同步失败:', error);
    });
  }
  
  return localEntries;
};

/**
 * 检查记录是否有效（用于显示）
 */
export const isValidEntry = (entry: JournalEntry): boolean => {
  if (!entry) return false;
  
  const hasAchievements = entry.achievements && entry.achievements.some(a => a && a.trim().length > 0);
  const hasHappiness = entry.happiness && entry.happiness.some(h => h && h.trim().length > 0);
  const hasDrainer = entry.drainerLevel !== 'none';
  const isMitCompleted = entry.mitCompleted === true;

  return hasAchievements || hasHappiness || hasDrainer || isMitCompleted;
};

/**
 * 获取今天的记录（同步版本）
 */
export const getTodayEntry = (): JournalEntry | undefined => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // 立即从 localStorage 返回
  const entries = getFromLocalStorage();
  const entry = entries.find(e => e.date.startsWith(todayStr));
  
  // 后台异步同步 Supabase（如果可用）
  if (isSupabaseAvailable() && !entry) {
    const userId = getOrCreateUserId();
    getEntryFromSupabase(today, userId).then(supabaseEntry => {
      if (supabaseEntry) {
        saveToLocalStorage(supabaseEntry);
      }
    }).catch(error => {
      console.warn('[Storage] 后台同步今天记录失败:', error);
    });
  }
  
  return entry;
};

/**
 * 获取昨天的记录（同步版本）
 */
export const getYesterdayEntry = (): JournalEntry | undefined => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // 立即从 localStorage 返回
  const entries = getFromLocalStorage();
  return entries.find(e => e.date.startsWith(yesterdayStr));
};

/**
 * 获取记录天数统计（同步版本）
 */
export const getRecordedDaysCount = (): number => {
  const entries = getEntries();
  const validEntries = entries.filter(isValidEntry);
  const uniqueDays = new Set(validEntries.map(e => e.date.split('T')[0]));
  return uniqueDays.size;
};

// ============================================
// Mock 数据生成（仅用于开发测试）
// ============================================

export const generateMockData = (): void => {
  if (getFromLocalStorage().length > 0) return; // Only generate if empty

  const entries: JournalEntry[] = [];
  const today = new Date();
  
  for (let i = 0; i < 25; i++) {
    if (Math.random() > 0.7 && i !== 0) continue; 

    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString();

    const isDone = Math.random() > 0.3;
    const hasDrainer = Math.random() > 0.6;
    const drainerLevel = hasDrainer ? (Math.random() > 0.5 ? 'high' : 'low') : 'none';

    const longTextAchievement = `完成了第 ${i+1} 个小目标，虽然过程很曲折，中间还因为技术问题卡了很久，但最终还是坚持下来搞定了，这种突破自我的感觉真好。`;
    const longTextHappiness = '喝了一杯好喝的咖啡，这不仅仅是咖啡，更是在忙碌一下午后难得的喘息时间，看着窗外的落日觉得生活其实充满了这些微小而美好的瞬间。';
    const longTextMit = i === 0 
      ? '完成悦己手账的开发，包括前端UI的细节打磨、交互体验的优化以及后端数据存储的逻辑完善，确保每一个像素都完美呈现。' 
      : `完成第 ${i} 天的核心任务，并对整个项目进度进行了复盘和调整`;

    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: dateStr,
      timestamp: date.getTime(),
      achievements: [
        longTextAchievement,
        Math.random() > 0.5 ? '读了30分钟书，特别是关于认知心理学的那一章，让我对情绪管理有了全新的理解，感觉受益匪浅。' : '',
        Math.random() > 0.5 ? '早睡早起，保持了良好的作息习惯' : ''
      ].filter(Boolean),
      happiness: [
        longTextHappiness,
        Math.random() > 0.5 ? '看见了晚霞，粉紫色的天空超级治愈' : '',
        '和朋友聊得很开心'
      ].filter(Boolean),
      drainerLevel: drainerLevel as any,
      drainerNote: hasDrainer && Math.random() > 0.5 ? '开了一个很长的会，感觉被掏空。会议内容虽然重要，但持续的高强度讨论确实让人感到精力耗尽。' : '',
      todayMitDescription: longTextMit,
      mitCompleted: isDone,
      mitReason: !isDone ? '突发事情太多，时间不够用，导致计划被打乱' : '',
      tomorrowMit: '继续优化产品体验，关注用户反馈',
      aiMood: isDone ? 'positive' : 'neutral',
      aiInsight: '生活就是起起伏伏，保持节奏最重要。'
    };
    entries.push(entry);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};
