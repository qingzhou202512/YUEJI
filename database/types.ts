/**
 * Supabase 数据库类型定义
 * 与前端 types.ts 对应，但适配数据库结构
 */

// ============================================
// Supabase 数据库类型（用于类型安全）
// ============================================

export interface Database {
  public: {
    Tables: {
      journal_entries: {
        Row: JournalEntryRow;
        Insert: JournalEntryInsert;
        Update: Partial<JournalEntryInsert>;
      };
      journal_items: {
        Row: JournalItemRow;
        Insert: JournalItemInsert;
        Update: Partial<JournalItemInsert>;
      };
      meditation_sessions: {
        Row: MeditationSessionRow;
        Insert: MeditationSessionInsert;
        Update: Partial<MeditationSessionInsert>;
      };
      ai_insights: {
        Row: AIInsightRow;
        Insert: AIInsightInsert;
        Update: Partial<AIInsightInsert>;
      };
    };
  };
}

// ============================================
// 一、核心表：journal_entries
// ============================================

/**
 * 数据库中的日记记录类型（核心表）
 * 只存"一天级别"的状态，不存碎片
 */
export interface JournalEntryRow {
  // 基础字段
  id: string;
  user_id: string;
  date: string; // DATE 类型，格式：'YYYY-MM-DD'
  created_at: string; // TIMESTAMPTZ，ISO 格式
  updated_at: string; // TIMESTAMPTZ，ISO 格式
  
  // 能量消耗
  drainer_level: 'none' | 'low' | 'high' | null;
  drainer_note: string | null;
  
  // 今日要事
  today_mit_description: string | null;
  mit_completed: boolean;
  mit_reason: string | null;
  
  // 明日计划
  tomorrow_mit: string | null;
}

/**
 * 插入/更新 journal_entries 时的类型
 */
export interface JournalEntryInsert {
  user_id: string;
  date: string;
  drainer_level?: 'none' | 'low' | 'high' | null;
  drainer_note?: string | null;
  today_mit_description?: string | null;
  mit_completed?: boolean;
  mit_reason?: string | null;
  tomorrow_mit?: string | null;
}

// ============================================
// 二、子表：journal_items
// ============================================

/**
 * 日记条目类型（高光时刻 & 小确幸）
 */
export interface JournalItemRow {
  id: string;
  journal_entry_id: string;
  type: 'achievement' | 'happiness';
  content: string;
  created_at: string;
}

/**
 * 插入 journal_items 时的类型
 */
export interface JournalItemInsert {
  journal_entry_id: string;
  type: 'achievement' | 'happiness';
  content: string;
}

// ============================================
// 三、冥想记录表
// ============================================

/**
 * 冥想会话类型
 */
export interface MeditationSessionRow {
  id: string;
  user_id: string;
  duration: number; // 秒
  audio: string | null;
  completed: boolean;
  created_at: string;
}

/**
 * 插入冥想会话时的类型
 */
export interface MeditationSessionInsert {
  user_id: string;
  duration: number;
  audio?: string | null;
  completed?: boolean;
}

// ============================================
// 四、AI 洞察结果表
// ============================================

/**
 * AI 洞察类型
 */
export interface AIInsightRow {
  id: string;
  user_id: string;
  category: 'mood' | 'interest' | 'ability' | 'habit';
  period: 'weekly' | 'monthly';
  content: string;
  created_at: string;
}

/**
 * 插入 AI 洞察时的类型（通常由 Edge Function 使用）
 */
export interface AIInsightInsert {
  user_id: string;
  category: 'mood' | 'interest' | 'ability' | 'habit';
  period: 'weekly' | 'monthly';
  content: string;
}

// ============================================
// 视图类型
// ============================================

/**
 * 包含 items 的完整日记记录（视图）
 */
export interface JournalEntryWithItems extends JournalEntryRow {
  items: JournalItemRow[];
}

// ============================================
// 查询响应类型
// ============================================

export interface JournalEntryResponse {
  data: JournalEntryRow | null;
  error: Error | null;
}

export interface JournalEntriesResponse {
  data: JournalEntryRow[] | null;
  error: Error | null;
}

export interface JournalItemsResponse {
  data: JournalItemRow[] | null;
  error: Error | null;
}

export interface MeditationSessionsResponse {
  data: MeditationSessionRow[] | null;
  error: Error | null;
}

export interface AIInsightsResponse {
  data: AIInsightRow[] | null;
  error: Error | null;
}

// ============================================
// 统计数据类型
// ============================================

export interface UserStats {
  total_days: number; // 总记录天数
  streak_days: number; // 连续记录天数
  last_record_date: string | null; // 最后记录日期
}
