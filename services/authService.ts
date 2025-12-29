/**
 * 认证服务
 * 处理用户登录、注册、登出等操作
 */

import { supabase, isSupabaseAvailable } from './supabaseClient';
import { syncLocalToSupabase } from './syncService';

/**
 * 匿名登录初始化（生产级实现）
 * 
 * 这个函数实现了生产级的匿名登录逻辑，确保：
 * 
 * 1. 防止重复创建
 *    - 页面刷新不会反复创建匿名用户
 *    - 已有会话就直接复用，不会重复创建
 * 
 * 2. 防并发保护
 *    - 使用 localStorage 锁机制
 *    - 防止双 Tab 同时打开时重复创建匿名账号
 *    - 如果检测到其他 Tab 正在创建，会等待并复用结果
 * 
 * 3. 严格检查逻辑
 *    - 只在完全没有 session 时才创建匿名账号
 *    - 创建前会二次检查，确保不会重复创建
 * 
 * 使用场景：
 * - 应用首次打开时调用
 * - 只在 App 初始化时调用一次
 * - 不要在每个页面都调用
 * 
 * @returns 用户对象，如果失败返回 null
 */
export const initAnonymousAuth = async (): Promise<any> => {
  if (!isSupabaseAvailable()) {
    console.warn('[Auth] Supabase 未配置，跳过匿名登录');
    return null;
  }

  try {
    // 1. 先检查本地是否有 session（从 localStorage 读取，快速响应）
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 2. 如果已经有登录态（匿名 or 正式），直接返回
    if (session?.user) {
      console.log('[Auth] 已有登录 session，用户 ID:', session.user.id);
      return session.user;
    }

    // 3. 防并发锁：检查是否有其他 Tab 正在创建匿名账号
    const LOCK_KEY = 'anon_auth_in_progress';
    if (localStorage.getItem(LOCK_KEY)) {
      console.log('[Auth] 检测到其他 Tab 正在创建匿名账号，等待...');
      // 等待最多 3 秒，然后再次检查 session
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession?.user) {
          console.log('[Auth] 其他 Tab 已完成匿名登录，复用 session');
          return newSession.user;
        }
      }
      // 超时后清除锁，继续创建
      localStorage.removeItem(LOCK_KEY);
    }

    // 4. 设置锁，防止并发创建
    localStorage.setItem(LOCK_KEY, '1');

    try {
      // 5. 再次检查 session（防止在设置锁的过程中其他 Tab 已创建）
      const { data: { session: doubleCheckSession } } = await supabase.auth.getSession();
      if (doubleCheckSession?.user) {
        console.log('[Auth] 二次检查发现已有 session，复用');
        localStorage.removeItem(LOCK_KEY);
        return doubleCheckSession.user;
      }

      // 6. 没有 session，创建匿名账号
      console.log('[Auth] 未检测到 session，创建匿名账号...');
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('[Auth] 匿名登录失败:', error);
        throw error;
      }

      if (data.user) {
        console.log('[Auth] 匿名登录成功，用户 ID:', data.user.id);
        
        // 匿名登录成功后，同步本地数据到 Supabase
        try {
          const syncResult = await syncLocalToSupabase();
          console.log('[Auth] 数据同步完成:', syncResult);
        } catch (error) {
          console.warn('[Auth] 数据同步失败:', error);
          // 不阻止登录，只是警告
        }
      }

      return data.user;
    } finally {
      // 7. 无论成功失败，都要清除锁
      localStorage.removeItem(LOCK_KEY);
    }
  } catch (error) {
    console.error('[Auth] 匿名登录初始化出错:', error);
    // 即使失败也不阻止应用运行，降级到本地存储模式
    return null;
  }
};

/**
 * 用户登录
 */
export const signIn = async (email: string, password: string) => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // 登录成功后，同步本地数据到 Supabase
  if (data.user) {
    try {
      const syncResult = await syncLocalToSupabase();
      console.log('[Auth] 数据同步完成:', syncResult);
    } catch (error) {
      console.warn('[Auth] 数据同步失败:', error);
      // 不阻止登录，只是警告
    }
  }

  return data;
};

/**
 * 用户注册
 */
export const signUp = async (email: string, password: string) => {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * 用户登出
 */
export const signOut = async () => {
  if (!isSupabaseAvailable()) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

/**
 * 获取当前用户
 */
export const getCurrentUser = async () => {
  if (!isSupabaseAvailable()) {
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('[Auth] 获取用户失败:', error);
    return null;
  }

  return user;
};

/**
 * 获取当前 session
 */
export const getSession = async () => {
  if (!isSupabaseAvailable()) {
    return null;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[Auth] 获取 session 失败:', error);
    return null;
  }

  return session;
};

/**
 * 初始化认证（应用启动时调用，只调用一次）
 * 
 * 使用生产级的匿名登录逻辑：
 * - 防止重复创建
 * - 会话复用
 * - 防并发
 */
export const initializeAuth = async (): Promise<void> => {
  if (!isSupabaseAvailable()) {
    console.log('[Auth] Supabase 未配置，使用本地存储模式');
    return;
  }

  try {
    await initAnonymousAuth();
  } catch (error) {
    console.error('[Auth] 初始化认证失败:', error);
    // 即使失败也不阻止应用运行，降级到本地存储模式
  }
};

/**
 * 监听认证状态变化
 */
export const onAuthStateChange = (callback: (user: any) => void) => {
  if (!isSupabaseAvailable()) {
    return () => {}; // 返回空清理函数
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });

  return () => {
    subscription.unsubscribe();
  };
};

