/**
 * PWA 相关功能服务
 * 处理安装提示、离线状态检测等
 */

// 安装提示相关
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * 监听安装提示事件
 * 当浏览器显示"添加到主屏幕"提示时触发
 */
export const setupInstallPrompt = (onInstallable: () => void) => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止默认的安装提示
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    // 通知应用可以显示自定义安装按钮
    onInstallable();
  });
};

/**
 * 显示安装提示
 * 返回 Promise，表示用户的选择
 */
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }

  try {
    // 显示安装提示
    await deferredPrompt.prompt();
    // 等待用户选择
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] 用户同意安装');
      deferredPrompt = null;
      return true;
    } else {
      console.log('[PWA] 用户拒绝安装');
      return false;
    }
  } catch (error) {
    console.error('[PWA] 安装提示失败:', error);
    return false;
  }
};

/**
 * 检查应用是否已安装
 */
export const isInstalled = (): boolean => {
  // 检查是否在独立模式下运行（已安装）
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // iOS Safari 检查
  if ((window.navigator as any).standalone) {
    return true;
  }
  
  return false;
};

/**
 * 检查是否支持安装
 */
export const isInstallable = (): boolean => {
  return deferredPrompt !== null;
};

/**
 * 监听离线/在线状态变化
 * 返回取消监听的函数
 */
export const setupOnlineStatusListener = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  const handleOnline = () => {
    console.log('[PWA] 网络已连接');
    onOnline();
  };

  const handleOffline = () => {
    console.log('[PWA] 网络已断开');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * 检查当前网络状态
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * 检查 Service Worker 是否已注册
 */
export const checkServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration !== undefined;
  } catch (error) {
    console.error('[PWA] 检查 Service Worker 失败:', error);
    return false;
  }
};



