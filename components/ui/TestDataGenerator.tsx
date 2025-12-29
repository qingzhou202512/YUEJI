/**
 * 测试数据生成组件
 * 仅在开发环境中显示，用于快速生成测试数据
 */

import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { generateTestData } from '../../services/testDataGenerator';

export const TestDataGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 只在开发环境显示
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  if (!isDev) {
    return null;
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage(null);

    try {
      const result = await generateTestData({
        journalDays: 30,
        meditationDays: 15,
        aiInsights: true,
        clearExisting: false, // 不清除现有数据，可以多次生成
      });

      setMessage(result.message);
      
      // 3秒后自动清除消息
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage(`❌ 生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col items-end gap-2">
      {/* 消息提示 */}
      {message && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-3 max-w-xs text-sm text-ink-700 border border-primary-200">
          <pre className="whitespace-pre-wrap font-sans">{message}</pre>
        </div>
      )}

      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full
          bg-primary-500 text-white text-sm font-medium
          shadow-lg hover:shadow-xl transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95
        `}
        title="生成测试数据（开发模式）"
      >
        <FlaskConical size={16} className={isGenerating ? 'animate-spin' : ''} />
        <span>{isGenerating ? '生成中...' : '生成测试数据'}</span>
      </button>
    </div>
  );
};

