import { GoogleGenerativeAI } from "@google/generative-ai";
import { JournalEntry } from "../types";

// Initialize Gemini
const getApiKey = (): string => {
  // Try both env variable names
  return (import.meta.env.VITE_GEMINI_API_KEY || 
          import.meta.env.GEMINI_API_KEY || 
          (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
          '') as string;
};

const genAI = getApiKey() ? new GoogleGenerativeAI(getApiKey()) : null;

export const generateDailyInsight = async (entry: JournalEntry): Promise<{ text: string, mood: 'positive' | 'neutral' | 'needs-care' }> => {
  const apiKey = getApiKey();
  if (!apiKey || !genAI) {
    return { 
      text: "坚持记录是变好的第一步。（需要 API Key 才能获取 AI 洞察）", 
      mood: 'neutral' 
    };
  }

  const prompt = `
    作为一位温暖、有同理心的个人成长教练，请分析用户的这篇日记。
    
    用户今天的成就：${entry.achievements.join(', ')}
    用户今天的幸福时刻：${entry.happiness.join(', ')}
    能量消耗情况：${entry.drainerLevel} (${entry.drainerNote || '无详细说明'})
    今天最重要的事情：${entry.todayMitDescription}
    是否完成：${entry.mitCompleted ? "是" : "否"}
    ${!entry.mitCompleted ? `未完成原因：${entry.mitReason}` : ''}
    明天最重要的事：${entry.tomorrowMit}

    任务：
    1. 提供一段简短、温暖的中文反馈（不超过 50 字）。如果用户完成了重要事项或有成就感，给予肯定；如果有能量消耗或未完成事项，给予温柔的鼓励或建议。
    2. 判断这篇日记的整体情绪基调 (positive, neutral, needs-care)。
    
    请以 JSON 格式返回，包含 insight 和 mood 两个字段。
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    let parsed: { insight?: string; mood?: string };
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        parsed = JSON.parse(text);
      }
    } catch {
      // If parsing fails, use the text as insight
      parsed = { insight: text.trim(), mood: 'neutral' };
    }

    return {
      text: parsed.insight || "每天进步一点点，加油！",
      mood: (parsed.mood === 'positive' || parsed.mood === 'needs-care' ? parsed.mood : 'neutral') as 'positive' | 'neutral' | 'needs-care'
    };

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {
      text: "很高兴看到你今天的记录，继续保持。",
      mood: 'neutral'
    };
  }
};



