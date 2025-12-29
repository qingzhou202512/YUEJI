-- ============================================
-- 悦己手账 Supabase 数据库表结构
-- ============================================
-- 
-- 设计原则：
-- 1. 核心表：一天一行记录，只存"一天级别"的状态
-- 2. 子表：所有"多条内容"（高光时刻、小确幸）独立存储
-- 3. AI 洞察独立表：支持反复分析和查看历史
-- 4. 字段命名清晰、语义明确
-- 5. 时间字段：date（业务日期）+ timestamp（记录时间）
-- ============================================

-- ============================================
-- 一、核心表：journal_entries（一天一行）
-- ============================================
-- 只存"一天级别"的状态，不存碎片
-- 严格遵守"一天一行"原则，字段稳定，UI 怎么改都不用动它
CREATE TABLE journal_entries (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户标识（使用 Supabase Auth 的 user_id）
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 业务日期（记录是哪一天的）
  date DATE NOT NULL,
  
  -- ========== 能量消耗 ==========
  drainer_level TEXT CHECK (drainer_level IN ('none', 'low', 'high')),
  drainer_note TEXT,
  
  -- ========== 今日最重要的事（MIT） ==========
  today_mit_description TEXT,
  mit_completed BOOLEAN DEFAULT false,
  mit_reason TEXT, -- 未完成时的原因
  
  -- ========== 明日最重要的事 ==========
  tomorrow_mit TEXT,
  
  -- ========== 时间戳 ==========
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- ========== 唯一约束 ==========
  -- 确保每个用户每天只有一条记录
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- ============================================
-- 二、子表：journal_items（高光时刻 & 小确幸）
-- ============================================
-- 所有"多条内容"都放这里
-- 不限制 3 条，以后 UI 想改完全没压力
-- AI 可以自由统计 / 分类 / 打标签
CREATE TABLE journal_items (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联到日记记录
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  
  -- 类型：高光时刻 或 小确幸
  type TEXT NOT NULL CHECK (type IN ('achievement', 'happiness')),
  
  -- 内容
  content TEXT NOT NULL,
  
  -- 创建时间
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 三、冥想记录表：meditation_sessions
-- ============================================
-- 冥想是「行为数据」，不是「日记内容」
-- 后期可以单独做统计 / 成就系统
CREATE TABLE meditation_sessions (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户标识
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 冥想时长（秒）
  duration INTEGER NOT NULL,
  
  -- 音频类型（可选）
  audio TEXT,
  
  -- 是否完成
  completed BOOLEAN DEFAULT true,
  
  -- 创建时间
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 四、AI 洞察结果表：ai_insights
-- ============================================
-- 这是 AI 产品化的核心
-- AI 可以反复重跑，不污染原始记录
-- 前端只读，极好维护
CREATE TABLE ai_insights (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户标识
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 洞察类别
  category TEXT NOT NULL CHECK (category IN ('mood', 'interest', 'ability', 'habit')),
  
  -- 分析周期
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly')),
  
  -- 洞察内容
  content TEXT NOT NULL,
  
  -- 创建时间
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 索引设计（优化查询性能）
-- ============================================

-- journal_entries 索引
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- journal_items 索引
CREATE INDEX idx_journal_items_entry_id ON journal_items(journal_entry_id);
CREATE INDEX idx_journal_items_type ON journal_items(type);
CREATE INDEX idx_journal_items_entry_type ON journal_items(journal_entry_id, type);

-- meditation_sessions 索引
CREATE INDEX idx_meditation_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX idx_meditation_sessions_created_at ON meditation_sessions(created_at DESC);

-- ai_insights 索引
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_category ON ai_insights(category);
CREATE INDEX idx_ai_insights_period ON ai_insights(period);
CREATE INDEX idx_ai_insights_user_category_period ON ai_insights(user_id, category, period);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at DESC);

-- ============================================
-- 行级安全策略（RLS - Row Level Security）
-- ============================================
-- 确保用户只能访问自己的数据

-- 1. journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal_entries"
  ON journal_entries
  FOR ALL
  USING (auth.uid() = user_id);

-- 2. journal_items
ALTER TABLE journal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal_items"
  ON journal_items
  FOR ALL
  USING (
    auth.uid() = (
      SELECT user_id FROM journal_entries
      WHERE id = journal_entry_id
    )
  );

-- 3. meditation_sessions
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meditation_sessions"
  ON meditation_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- 4. ai_insights（前端只读）
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ai_insights"
  ON ai_insights
  FOR SELECT
  USING (auth.uid() = user_id);

-- 注意：AI 写入通常走 Edge Function（service role），不需要前端写入策略

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 视图：便于查询和统计
-- ============================================

-- 视图：完整的日记记录（包含 items）
-- 用于前端一次性获取所有数据
CREATE OR REPLACE VIEW journal_entries_with_items AS
SELECT 
  je.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ji.id,
        'type', ji.type,
        'content', ji.content,
        'created_at', ji.created_at
      ) ORDER BY ji.created_at
    ) FILTER (WHERE ji.id IS NOT NULL),
    '[]'::json
  ) AS items
FROM journal_entries je
LEFT JOIN journal_items ji ON je.id = ji.journal_entry_id
GROUP BY je.id;

-- 视图：有效记录（包含实际内容的记录）
-- 用于统计连续记录天数等
CREATE OR REPLACE VIEW valid_journal_entries AS
SELECT je.*
FROM journal_entries je
WHERE 
  -- 至少有一项成就或幸福时刻
  EXISTS (
    SELECT 1 FROM journal_items ji
    WHERE ji.journal_entry_id = je.id
  )
  OR
  -- 有能量消耗记录
  (je.drainer_level IS NOT NULL AND je.drainer_level != 'none')
  OR
  -- 今日要事已完成
  je.mit_completed = true;

-- ============================================
-- 函数：获取用户连续记录天数
-- ============================================
CREATE OR REPLACE FUNCTION get_user_streak_days(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  current_date DATE := CURRENT_DATE;
  has_entry BOOLEAN;
BEGIN
  -- 从今天开始往前检查
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM valid_journal_entries
      WHERE user_id = p_user_id 
        AND date = current_date
    ) INTO has_entry;
    
    IF has_entry THEN
      streak_count := streak_count + 1;
      current_date := current_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
    
    -- 防止无限循环（最多检查365天）
    IF streak_count >= 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 函数：获取用户记录的总天数
-- ============================================
CREATE OR REPLACE FUNCTION get_user_total_days(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT date)
    FROM valid_journal_entries
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
