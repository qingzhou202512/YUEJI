import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { isInstallable, showInstallPrompt, isInstalled } from '../../services/pwaService';

interface InstallPromptProps {
  onDismiss?: () => void;
}

/**
 * PWA 安装提示组件
 * 当应用可以安装时显示提示
 */
export const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss }) => {
  const [show, setShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 如果已经安装，不显示提示
    if (isInstalled()) {
      return;
    }

    // 检查是否可以安装
    const checkInstallable = () => {
      if (isInstallable()) {
        setShow(true);
      }
    };

    // 立即检查一次
    checkInstallable();

    // 监听安装提示事件
    const handleBeforeInstallPrompt = () => {
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const accepted = await showInstallPrompt();
      if (accepted) {
        setShow(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error('[InstallPrompt] 安装失败:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
    // 可以在这里保存用户的选择，避免重复提示
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-0 right-0 px-6 z-[60] animate-fade-in">
      <div className="bg-white rounded-[2rem] p-5 shadow-glow border border-primary-100 max-w-md mx-auto">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl shrink-0">
            <Download size={24} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-ink-900 mb-1">安装悦己手账</h3>
            <p className="text-sm text-ink-600 leading-relaxed mb-4">
              添加到主屏幕，随时记录你的每一天
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-ink-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-ink-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {isInstalling ? '安装中...' : '立即安装'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-3 text-ink-400 hover:text-ink-600 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




