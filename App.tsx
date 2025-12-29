import React, { useState, useEffect } from 'react';
import { Journal } from './components/Journal';
import { Meditation } from './components/Meditation';
import { History } from './components/History';
import { Home } from './components/Home';
import { ViewState } from './types';
import { Book, Brain, Plus, PenLine } from 'lucide-react';
import { getTodayEntry, getYesterdayEntry, generateMockData } from './services/storage';
import { InstallPrompt } from './components/ui/InstallPrompt';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { TestDataGenerator } from './components/ui/TestDataGenerator';
import { setupInstallPrompt } from './services/pwaService';
import { getOrCreateUserId } from './services/userId';
// 导入测试数据生成工具（会在浏览器控制台暴露 window.generateTestData）
import './services/testDataGenerator';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [hasTodayEntry, setHasTodayEntry] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 初始化应用
    const initApp = () => {
      try {
        // 1. 获取或创建用户 ID（这是初始化完成的唯一条件）
        const userId = getOrCreateUserId();
        console.log('[App] 初始化完成，用户 ID:', userId);
        
        // 2. 生成模拟数据（如果本地没有数据）
        generateMockData();
        
        // 3. 检查今天的记录
        checkEntry();
        
        // 4. 初始化 PWA 安装提示
        setupInstallPrompt(() => {
          // 当应用可安装时，可以在这里做一些处理
          // InstallPrompt 组件会自动显示
        });
        
        // 5. 标记初始化完成
        setIsInitializing(false);
      } catch (error) {
        console.error('[App] 初始化失败:', error);
        // 即使出错也继续运行，避免卡在加载状态
        setIsInitializing(false);
      }
    };

    initApp();
  }, []);

  const checkEntry = () => {
    const entry = getTodayEntry();
    setHasTodayEntry(!!entry);
  };

  useEffect(() => {
    checkEntry();
  }, [view]);

  const renderContent = () => {
    switch (view) {
      case ViewState.JOURNAL:
        return (
          <Journal 
            onComplete={() => { setView(ViewState.HOME); checkEntry(); }} 
            existingEntry={getTodayEntry()} 
            yesterdayEntry={getYesterdayEntry()}
            onBack={() => setView(ViewState.HOME)}
          />
        );
      case ViewState.MEDITATION:
        return <Meditation />;
      case ViewState.HISTORY:
        return <History onBack={() => setView(ViewState.HOME)} />;
      case ViewState.HOME:
      default:
        return <Home onNavigate={setView} />;
    }
  };

  // 初始化中显示加载状态
  if (isInitializing) {
    return (
      <div className="h-screen w-full bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center animate-pulse">
            <Book size={32} className="text-primary-600" />
          </div>
          <p className="text-ink-500 text-sm font-medium">正在初始化...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-cream flex flex-col font-sans text-ink-900 selection:bg-primary-200 overflow-hidden">
      {/* PWA 功能组件 */}
      <OfflineIndicator />
      <InstallPrompt />
      
      {/* 测试数据生成工具（仅开发环境） */}
      <TestDataGenerator />
      
      <main className="flex-1 overflow-hidden relative z-0">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-0 w-full px-8 z-50 pointer-events-none">
        <nav className="h-20 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-soft flex items-center justify-between px-10 pointer-events-auto border border-white/50 relative">
          <NavItem 
            icon={view === ViewState.HOME ? <Book size={24} fill="currentColor" /> : <Book size={24} />} 
            label="记录" 
            isActive={view === ViewState.HOME} 
            onClick={() => setView(ViewState.HOME)} 
          />
          
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2">
            <button 
              onClick={() => setView(ViewState.JOURNAL)}
              className={`w-18 h-18 p-5 rounded-full flex items-center justify-center shadow-glow transition-all active:scale-95 border-[6px] border-cream group ${
                view === ViewState.JOURNAL 
                ? 'bg-ink-900 text-white' 
                : 'bg-gradient-to-tr from-primary-500 to-primary-400 text-white hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {hasTodayEntry ? <PenLine size={28} /> : <Plus size={32} />}
            </button>
          </div>

          <NavItem 
            icon={view === ViewState.MEDITATION ? <Brain size={24} fill="currentColor" /> : <Brain size={24} />} 
            label="冥想" 
            isActive={view === ViewState.MEDITATION} 
            onClick={() => setView(ViewState.MEDITATION)} 
          />
        </nav>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 w-16 transition-all duration-300 ${
      isActive ? 'text-primary-600 scale-105' : 'text-ink-400 hover:text-ink-600'
    }`}
  >
    <div className="relative">
      {icon}
      {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />}
    </div>
    <span className="text-[11px] font-bold tracking-wide">{label}</span>
  </button>
);

