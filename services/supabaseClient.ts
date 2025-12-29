/**
 * Supabase 客户端配置
 * 用于连接 Supabase 数据库
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../database/types';

/**
 * 创建 Supabase 客户端实例
 * 
 * 说明：
 * - 使用 anon key（匿名密钥）是安全的，因为我们已经设置了 RLS（行级安全策略）
 * - 用户只能访问自己的数据
 * - 如果环境变量未配置，supabase 可能无法正常工作，应用会降级到 localStorage
 */
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true, // 持久化登录状态
      autoRefreshToken: true, // 自动刷新 token
    },
  }
);

/**
 * 检查 Supabase 是否可用
 * 通过检查环境变量来判断
 */
export const isSupabaseAvailable = (): boolean => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

/**
 * 获取当前用户
 */
export const getCurrentUser = async () => {
  if (!isSupabaseAvailable()) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[Supabase] 获取用户失败:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.warn('[Supabase] 获取用户出错:', error);
    return null;
  }
};

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = async (): Promise<boolean> => {
  if (!isSupabaseAvailable()) return false;
  
  const user = await getCurrentUser();
  return user !== null;
};

