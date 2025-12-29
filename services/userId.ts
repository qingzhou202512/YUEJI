/**
 * 用户 ID 管理服务
 * 
 * 功能：
 * - 生成并持久化用户 ID（存储在 localStorage）
 * - 确保同一用户不会重复创建 ID
 * - 不同用户之间数据天然隔离
 * 
 * 设计原则：
 * - 不依赖 Supabase auth（可选能力）
 * - 使用 localStorage 持久化
 * - 后续可无痛迁移到正式账号体系
 */

const USER_ID_KEY = 'innerflow_user_id';

/**
 * 生成用户 ID
 * 
 * 不使用 crypto.randomUUID()，而是使用时间戳 + 随机数的方式
 * 格式：timestamp_randomNumber
 * 例如：1735123456789_12345
 */
function generateUserId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `${timestamp}_${random}`;
}

/**
 * 获取或创建用户 ID
 * 
 * 逻辑：
 * 1. 先检查 localStorage 是否已有 userID
 * 2. 如果有，直接返回
 * 3. 如果没有，生成新的 userID 并保存到 localStorage
 * 4. 返回 userID
 * 
 * @returns 用户 ID（字符串）
 */
export function getOrCreateUserId(): string {
  // 1. 尝试从 localStorage 读取
  const existingUserId = localStorage.getItem(USER_ID_KEY);
  
  // 2. 如果已存在，直接返回
  if (existingUserId && existingUserId.trim().length > 0) {
    return existingUserId;
  }
  
  // 3. 不存在，生成新的 userID
  const newUserId = generateUserId();
  
  // 4. 保存到 localStorage
  localStorage.setItem(USER_ID_KEY, newUserId);
  
  console.log('[UserId] 创建新用户 ID:', newUserId);
  
  return newUserId;
}

/**
 * 获取当前用户 ID（不创建）
 * 
 * @returns 用户 ID，如果不存在则返回 null
 */
export function getUserId(): string | null {
  const userId = localStorage.getItem(USER_ID_KEY);
  return userId && userId.trim().length > 0 ? userId : null;
}

/**
 * 清除用户 ID（用于测试或重置）
 * 
 * ⚠️ 警告：这会清除所有本地数据，请谨慎使用
 */
export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
  console.log('[UserId] 已清除用户 ID');
}

