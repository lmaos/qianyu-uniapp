/**
 * 用户信息本地缓存
 * 使用 uni.storage 存储，支持 TTL 过期（默认 30 天）
 * @module core/user/UserCache
 */

/** 缓存前缀 */
const CACHE_PREFIX = 'user_info_'
/** 缓存 TTL（毫秒），默认 30 天 */
const DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000

/**
 * 从缓存获取用户信息
 * @param {string|number} userId
 * @returns {Object|null} 用户信息或 null（未命中/已过期）
 */
export function getCachedUserInfo(userId) {
  try {
    const key = CACHE_PREFIX + userId
    const raw = uni.getStorageSync(key)
    if (!raw) return null

    const entry = JSON.parse(raw)
    if (!entry || !entry.data) return null

    // 检查过期
    if (entry.expireAt && Date.now() > entry.expireAt) {
      uni.removeStorageSync(key)
      return null
    }

    return entry.data
  } catch (e) {
    console.error('[UserCache] 读取失败:', e)
    return null
  }
}

/**
 * 写入用户信息到缓存
 * @param {string|number} userId
 * @param {Object} userInfo
 * @param {number} [ttl] 缓存时长（毫秒），默认 30 天
 */
export function setCachedUserInfo(userId, userInfo, ttl) {
  try {
    const key = CACHE_PREFIX + userId
    const entry = {
      data: userInfo,
      expireAt: Date.now() + (ttl || DEFAULT_TTL),
    }
    uni.setStorageSync(key, JSON.stringify(entry))
  } catch (e) {
    console.error('[UserCache] 写入失败:', e)
  }
}

/**
 * 批量写入用户信息到缓存
 * @param {Array<Object>} userInfoList 用户信息列表（需含 userId 字段）
 * @param {number} [ttl] 缓存时长（毫秒）
 */
export function batchSetCachedUserInfo(userInfoList, ttl) {
  if (!userInfoList || !userInfoList.length) return
  for (const info of userInfoList) {
    if (info && info.userId) {
      setCachedUserInfo(info.userId, info, ttl)
    }
  }
}

/**
 * 批量从缓存获取用户信息，返回 { hit: Map, miss: Array }
 * @param {Array<string|number>} userIds
 * @returns {{ hit: Map<string|number, Object>, miss: Array<string|number> }}
 */
export function batchGetCachedUserInfo(userIds) {
  const hit = new Map()
  const miss = []

  if (!userIds || !userIds.length) return { hit, miss }

  for (const uid of userIds) {
    const cached = getCachedUserInfo(uid)
    if (cached) {
      hit.set(uid, cached)
    } else {
      miss.push(uid)
    }
  }

  return { hit, miss }
}

/**
 * 清除指定用户的缓存
 * @param {string|number} userId
 */
export function removeCachedUserInfo(userId) {
  try {
    uni.removeStorageSync(CACHE_PREFIX + userId)
  } catch (e) {
    console.error('[UserCache] 删除失败:', e)
  }
}

/**
 * 清除所有用户信息缓存
 */
export function clearAllUserCache() {
  try {
    const info = uni.getStorageInfoSync()
    const keys = info.keys || []
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        uni.removeStorageSync(key)
      }
    }
  } catch (e) {
    console.error('[UserCache] 清空失败:', e)
  }
}
