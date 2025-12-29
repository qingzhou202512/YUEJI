import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { setupOnlineStatusListener, isOnline } from '../../services/pwaService';

/**
 * 离线状态指示器
 * 显示当前网络连接状态
 */
export const OfflineIndicator: React.FC = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // 初始化状态
    setOnline(isOnline());

    // 监听网络状态变化
    const cleanup = setupOnlineStatusListener(
      () => setOnline(true),
      () => setOnline(false)
    );

    return cleanup;
  }, []);

  // 只在离线时显示
  if (online) {
    return null;
  }

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
      <div className="bg-ink-900/90 text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
        <WifiOff size={16} />
        <span>离线模式 - 数据已保存到本地</span>
      </div>
    </div>
  );
};




