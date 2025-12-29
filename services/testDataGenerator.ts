/**
 * 测试数据生成工具
 * 用于在开发环境中生成假数据，测试应用功能
 * 
 * 使用方法：
 * 1. 在浏览器控制台调用：window.generateTestData()
 * 2. 或者在开发环境中添加一个按钮触发
 */

import { JournalEntry } from '../types';
import { saveEntry } from './storage';
import { saveEntryToSupabase } from './syncService';
import { supabase, isSupabaseAvailable } from './supabaseClient';
import { getOrCreateUserId } from './userId';
import { MeditationSessionInsert, AIInsightInsert } from '../database/types';

// ============================================
// 测试数据模板
// ============================================

/**
 * 生成一条日记记录的假数据
 */
function generateJournalEntry(daysAgo: number): JournalEntry {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  
  const dateStr = date.toISOString();
  const isDone = Math.random() > 0.3;
  const hasDrainer = Math.random() > 0.5;
  const drainerLevel = hasDrainer ? (Math.random() > 0.5 ? 'high' : 'low') : 'none';

  // 多样化的成就内容
  const achievementTemplates = [
    `完成了第 ${daysAgo + 1} 个小目标，虽然过程很曲折，中间还因为技术问题卡了很久，但最终还是坚持下来搞定了，这种突破自我的感觉真好。`,
    `读了30分钟书，特别是关于认知心理学的那一章，让我对情绪管理有了全新的理解，感觉受益匪浅。`,
    `早睡早起，保持了良好的作息习惯，今天早上6点就自然醒了，感觉精力充沛。`,
    `完成了工作中的一个重要项目，得到了同事的认可，感觉很有成就感。`,
    `坚持运动30分钟，虽然很累但感觉很充实，身体状态也在慢慢变好。`,
    `学会了新的技能，虽然只是入门，但已经能看到未来的可能性了。`,
  ];

  // 多样化的幸福感内容
  const happinessTemplates = [
    '喝了一杯好喝的咖啡，这不仅仅是咖啡，更是在忙碌一下午后难得的喘息时间，看着窗外的落日觉得生活其实充满了这些微小而美好的瞬间。',
    '看见了晚霞，粉紫色的天空超级治愈，感觉一天的疲惫都被洗刷干净了。',
    '和朋友聊得很开心，分享彼此的生活和想法，这种连接感让人感到温暖。',
    '吃到了很久没吃的美食，简单的快乐却让人感到满足。',
    '收到了意外的关心，一个小小的问候就能让人感到被爱。',
    '在公园里散步，看到花开得很美，春天的气息让人心情愉悦。',
  ];

  // 多样化的 MIT 内容
  const mitTemplates = [
    '完成悦己手账的开发，包括前端UI的细节打磨、交互体验的优化以及后端数据存储的逻辑完善，确保每一个像素都完美呈现。',
    `完成第 ${daysAgo} 天的核心任务，并对整个项目进度进行了复盘和调整。`,
    '完成重要的会议准备，确保所有材料都准备充分，能够清晰地表达自己的想法。',
    '完成学习计划，包括阅读和练习，确保每天都有进步。',
    '完成健康管理，包括运动和饮食，保持身体的最佳状态。',
  ];

  // 随机选择内容
  const achievements = [
    achievementTemplates[Math.floor(Math.random() * achievementTemplates.length)],
    Math.random() > 0.5 ? achievementTemplates[Math.floor(Math.random() * achievementTemplates.length)] : '',
    Math.random() > 0.3 ? achievementTemplates[Math.floor(Math.random() * achievementTemplates.length)] : '',
  ].filter(Boolean);

  const happiness = [
    happinessTemplates[Math.floor(Math.random() * happinessTemplates.length)],
    Math.random() > 0.5 ? happinessTemplates[Math.floor(Math.random() * happinessTemplates.length)] : '',
    Math.random() > 0.3 ? happinessTemplates[Math.floor(Math.random() * happinessTemplates.length)] : '',
  ].filter(Boolean);

  const mitDescription = mitTemplates[Math.floor(Math.random() * mitTemplates.length)];

  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    date: dateStr,
    timestamp: date.getTime(),
    achievements,
    happiness,
    drainerLevel: drainerLevel as 'none' | 'low' | 'high',
    drainerNote: hasDrainer && Math.random() > 0.5 
      ? '开了一个很长的会，感觉被掏空。会议内容虽然重要，但持续的高强度讨论确实让人感到精力耗尽。' 
      : undefined,
    todayMitDescription: mitDescription,
    mitCompleted: isDone,
    mitReason: !isDone ? '突发事情太多，时间不够用，导致计划被打乱' : undefined,
    tomorrowMit: '继续优化产品体验，关注用户反馈',
    aiMood: isDone ? 'positive' : (hasDrainer ? 'needs-care' : 'neutral'),
    aiInsight: '生活就是起起伏伏，保持节奏最重要。',
  };

  return entry;
}

/**
 * 生成冥想记录的假数据
 */
function generateMeditationSession(userId: string, daysAgo: number): MeditationSessionInsert {
  const durations = [300, 600, 900, 1200, 1800]; // 5分钟到30分钟
  const audioTypes = ['rain', 'wind', 'white', null];
  
  return {
    user_id: userId,
    duration: durations[Math.floor(Math.random() * durations.length)],
    audio: audioTypes[Math.floor(Math.random() * audioTypes.length)] as string | null,
    completed: Math.random() > 0.1, // 90% 完成率
  };
}

/**
 * 生成 AI 洞察的假数据
 */
function generateAIInsight(userId: string, category: 'mood' | 'interest' | 'ability' | 'habit', period: 'weekly' | 'monthly'): AIInsightInsert {
  const insights: Record<string, Record<string, string[]>> = {
    mood: {
      weekly: [
        '本周你的情绪整体比较稳定，大部分时间都保持在积极的状态。建议继续保持这种良好的节奏。',
        '本周你经历了一些情绪波动，特别是在工作压力大的时候。建议多关注自己的情绪变化，及时调整。',
      ],
      monthly: [
        '本月你的情绪趋势显示，你在工作日的情绪波动较大，但周末时情绪明显好转。建议在工作日多安排一些放松活动。',
        '本月你的整体情绪状态良好，积极情绪占主导。继续保持这种状态，同时注意保持工作和生活的平衡。',
      ],
    },
    interest: {
      weekly: [
        '本周你记录的内容显示，你对技术学习和个人成长比较感兴趣，建议继续保持这种学习热情。',
        '本周你关注的重点是工作和生活平衡，建议多花时间在个人兴趣和爱好上。',
      ],
      monthly: [
        '本月你的兴趣点主要集中在自我提升和健康管理上，这是一个很好的趋势。建议继续保持并深入探索。',
        '本月你开始关注更多元化的内容，包括阅读、运动和社交，这种多样性有助于你的全面发展。',
      ],
    },
    ability: {
      weekly: [
        '本周你在时间管理和任务完成方面表现不错，能够有效地安排和完成重要任务。',
        '本周你在情绪调节方面有所提升，能够更好地处理压力和挑战。',
      ],
      monthly: [
        '本月你在多个方面都有所提升，包括学习能力、执行力和情绪管理。继续保持这种成长趋势。',
        '本月你展现出了良好的适应能力和解决问题的能力，这些能力对你的长期发展很有帮助。',
      ],
    },
    habit: {
      weekly: [
        '本周你的记录习惯保持得很好，每天都有记录，这种坚持本身就是一种很好的习惯。',
        '本周你开始关注早睡早起和规律作息，这是一个很好的开始，建议继续保持。',
      ],
      monthly: [
        '本月你养成了每天记录的习惯，这种持续性的行为对你的自我认知和成长很有帮助。',
        '本月你在多个习惯方面都有所改善，包括记录、学习和运动，这些习惯的养成对你的长期发展很有价值。',
      ],
    },
  };

  const contentList = insights[category]?.[period] || ['这是一条 AI 洞察内容。'];
  const content = contentList[Math.floor(Math.random() * contentList.length)];

  return {
    user_id: userId,
    category,
    period,
    content,
  };
}

// ============================================
// 主要生成函数
// ============================================

/**
 * 生成测试数据
 * @param options 生成选项
 */
export async function generateTestData(options: {
  journalDays?: number; // 生成多少天的日记记录（默认 30 天）
  meditationDays?: number; // 生成多少天的冥想记录（默认 15 天）
  aiInsights?: boolean; // 是否生成 AI 洞察（默认 true）
  clearExisting?: boolean; // 是否清除现有数据（默认 false）
} = {}): Promise<{
  success: boolean;
  message: string;
  details: {
    journalEntries: number;
    meditationSessions: number;
    aiInsights: number;
  };
}> {
  const {
    journalDays = 30,
    meditationDays = 15,
    aiInsights = true,
    clearExisting = false,
  } = options;

  try {
    // 1. 获取用户 ID（不依赖 auth）
    const userId = getOrCreateUserId();
    console.log('[TestData] 使用用户 ID:', userId);

    // 2. 清除现有数据（如果需要）
    if (clearExisting) {
      console.log('[TestData] 清除现有数据...');
      localStorage.removeItem('innerflow_entries');
      
      if (isSupabaseAvailable()) {
        // 删除 Supabase 中的数据（使用 userId）
        await supabase.from('journal_entries').delete().eq('user_id', userId);
        await supabase.from('meditation_sessions').delete().eq('user_id', userId);
        await supabase.from('ai_insights').delete().eq('user_id', userId);
      }
    }

    // 3. 生成日记记录
    console.log(`[TestData] 生成 ${journalDays} 天的日记记录...`);
    const journalEntries: JournalEntry[] = [];
    
    for (let i = 0; i < journalDays; i++) {
      // 70% 的概率生成记录（模拟真实使用情况）
      if (Math.random() > 0.3) {
        const entry = generateJournalEntry(i);
        journalEntries.push(entry);
        // 保存到 localStorage（会自动同步到 Supabase）
        saveEntry(entry);
      }
    }

    // 4. 如果 Supabase 可用，生成额外的数据（冥想记录和 AI 洞察）
    let meditationCount = 0;
    let aiInsightCount = 0;
    
    if (isSupabaseAvailable()) {
      console.log('[TestData] Supabase 可用，生成额外数据...');

      // 5. 生成冥想记录
      if (meditationDays > 0) {
        console.log(`[TestData] 生成 ${meditationDays} 天的冥想记录...`);
        const meditationSessions: MeditationSessionInsert[] = [];
        
        for (let i = 0; i < meditationDays; i++) {
          // 60% 的概率生成冥想记录
          if (Math.random() > 0.4) {
            const session = generateMeditationSession(userId, i);
            meditationSessions.push(session);
          }
        }

        if (meditationSessions.length > 0) {
          const { error } = await supabase
            .from('meditation_sessions')
            .insert(meditationSessions);
          
          if (error) {
            console.error('[TestData] 插入冥想记录失败:', error);
          } else {
            meditationCount = meditationSessions.length;
          }
        }
      }

      // 6. 生成 AI 洞察
      if (aiInsights) {
        console.log('[TestData] 生成 AI 洞察...');
        const insights: AIInsightInsert[] = [];
        
        // 生成每周和每月的洞察
        const categories: Array<'mood' | 'interest' | 'ability' | 'habit'> = ['mood', 'interest', 'ability', 'habit'];
        
        for (const category of categories) {
          // 每周洞察
          insights.push(generateAIInsight(userId, category, 'weekly'));
          // 每月洞察
          insights.push(generateAIInsight(userId, category, 'monthly'));
        }

        if (insights.length > 0) {
          const { error } = await supabase
            .from('ai_insights')
            .insert(insights);
          
          if (error) {
            console.error('[TestData] 插入 AI 洞察失败:', error);
          } else {
            aiInsightCount = insights.length;
          }
        }
      }
    } else {
      console.warn('[TestData] Supabase 未配置，只生成 localStorage 数据');
    }

    const message = `✅ 测试数据生成完成！
- 日记记录：${journalEntries.length} 条（已保存到 localStorage${isSupabaseAvailable() ? ' 和 Supabase' : ''}）
- 冥想记录：${meditationCount} 条（${isSupabaseAvailable() ? '已保存到 Supabase' : '需要 Supabase 配置'}）
- AI 洞察：${aiInsightCount} 条（${isSupabaseAvailable() ? '已保存到 Supabase' : '需要 Supabase 配置'}）`;

    console.log(message);

    return {
      success: true,
      message,
      details: {
        journalEntries: journalEntries.length,
        meditationSessions: meditationCount,
        aiInsights: aiInsightCount,
      },
    };
  } catch (error) {
    const errorMessage = `❌ 生成测试数据失败: ${error instanceof Error ? error.message : '未知错误'}`;
    console.error('[TestData]', errorMessage, error);
    
    return {
      success: false,
      message: errorMessage,
      details: {
        journalEntries: 0,
        meditationSessions: 0,
        aiInsights: 0,
      },
    };
  }
}

// ============================================
// 全局暴露（用于浏览器控制台）
// ============================================

/**
 * 在浏览器控制台中暴露测试数据生成函数
 * 使用方法：在控制台输入 window.generateTestData()
 */
if (typeof window !== 'undefined') {
  (window as any).generateTestData = generateTestData;
  
  // 添加帮助信息
  console.log(`
🧪 测试数据生成工具已加载！

使用方法：
1. 生成默认测试数据（30天日记，15天冥想，包含AI洞察）：
   window.generateTestData()

2. 自定义生成选项：
   window.generateTestData({
     journalDays: 30,      // 生成30天的日记记录
     meditationDays: 15,   // 生成15天的冥想记录
     aiInsights: true,     // 是否生成AI洞察
     clearExisting: false  // 是否清除现有数据
   })

3. 清除现有数据并重新生成：
   window.generateTestData({ clearExisting: true })
  `);
}


