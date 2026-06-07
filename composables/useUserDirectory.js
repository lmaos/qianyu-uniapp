/**
 * 用户信息目录 Composable
 * 进程级响应式 userInfo 缓存，供 message / chat 等页面共享对方用户信息
 *
 * 三层缓存：
 *   L1 内存: reactive Map（模块级，跨页面进入保留）
 *   L2 storage: uni.setStorageSync 持久化（30 天 TTL）
 *   L3 网络: UserService.batchGetUserInfo 兜底
 *
 * Promise 去重：同批 userIds 多次进入页面只发一次网络请求
 *
 * @module composables/useUserDirectory
 */

import { reactive } from 'vue'
import { batchGetUserInfo } from '@/core/user/UserService.js'

const STORAGE_KEY = 'msg_user_dir'
const STORAGE_KEY_EXPIRE = 'msg_user_dir_expire'
const STORAGE_TTL = 30 * 24 * 3600 * 1000 // 30 天

// ===== 模块级状态（进程级单例） =====

/** 响应式用户目录：targetId(string) → UserInfo */
const userDirectory = reactive(new Map())

/** 当前 in-flight 的批量请求 Promise（跨调用去重） */
let _inflightPromise = null

/** 失败重试队列：L3 网络失败时入队，5s 后批量重试 */
const _retryQueue = new Set()
let _retryTimer = null
const RETRY_DELAY_MS = 5000

/** L2 storage 缓存（启动时一次性加载） */
const _storageCache = _loadStorageCache()
const _storageExpire = _loadStorageExpire()

// ===== 私有工具（模块级，不依赖 ensureUsers 闭包） =====

function _loadStorageCache() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (!raw) return {}
    if (typeof raw === 'object') return raw
    return JSON.parse(raw) || {}
  } catch (e) {
    console.warn('[useUserDirectory] 加载 storage 缓存失败:', e)
    return {}
  }
}

function _loadStorageExpire() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY_EXPIRE)
    if (!raw) return {}
    if (typeof raw === 'object') return raw
    return JSON.parse(raw) || {}
  } catch (e) {
    return {}
  }
}

function _readStorage(uid) {
  const exp = _storageExpire[uid]
  if (!exp || Date.now() > exp) return null
  return _storageCache[uid] || null
}

function _writeStorage(info) {
  if (!info || info.userId === undefined || info.userId === null) return
  const uid = String(info.userId)
  _storageCache[uid] = info
  _storageExpire[uid] = Date.now() + STORAGE_TTL
  try {
    uni.setStorageSync(STORAGE_KEY, _storageCache)
    uni.setStorageSync(STORAGE_KEY_EXPIRE, _storageExpire)
  } catch (e) {
    console.warn('[useUserDirectory] storage 写入失败:', e)
  }
}

// ===== 公开 API =====

/**
 * 注入 userDirectory（每次 setup 调用都返回同一份引用）
 */
export function useUserDirectory() {
  /**
   * 将失败的 userId 加入重试队列，5s 后统一重拉。
   * 用于 L3 网络失败 / 401 / 后端 5xx 等瞬时错误场景，避免 userInfo 永久空。
   *
   * 注意：此函数必须定义在 useUserDirectory() 闭包内，因为 setTimeout 回调中
   * 要 await ensureUsers(...)（ensureUsers 是闭包内的局部变量）。
   */
  function _scheduleRetry(userIds) {
    if (!userIds || !userIds.length) return
    for (const uid of userIds) {
      if (uid) _retryQueue.add(String(uid))
    }
    if (_retryTimer) return
    _retryTimer = setTimeout(async () => {
      _retryTimer = null
      if (_retryQueue.size === 0) return
      const ids = [..._retryQueue]
      _retryQueue.clear()
      console.log('[useUserDirectory] 重试队列触发: count=', ids.length, 'ids=', ids)
      // 清掉这些 id 的 L2 缓存，避免误命中过期数据
      for (const id of ids) {
        delete _storageCache[id]
        delete _storageExpire[id]
      }
      try {
        uni.setStorageSync(STORAGE_KEY, _storageCache)
        uni.setStorageSync(STORAGE_KEY_EXPIRE, _storageExpire)
      } catch (e) {
        // ignore
      }
      // 走 ensureUsers 的 L3 网络路径（此时 L1/L2 已 miss，强制走网络）
      await ensureUsers(ids)
    }, RETRY_DELAY_MS)
  }

  /**
   * 确保指定 userId 列表已在 directory 中。
   * L1 内存命中 → 立即返回；未命中查 L2 storage；再缺走 L3 网络。
   * 同批 userIds 多次调用复用同一 inflight Promise。
   *
   * @param {Array<string|number>} userIds 用户 ID 列表
   */
  async function ensureUsers(userIds) {
    if (!userIds || !userIds.length) return

    // 统一转 string key
    const wanted = []
    for (const uid of userIds) {
      if (uid === undefined || uid === null || uid === '') continue
      wanted.push(String(uid))
    }
    if (!wanted.length) return

    console.log('[useUserDirectory] ensureUsers 入参:', wanted)

    // L1 内存层
    const l1Miss = []
    for (const uid of wanted) {
      if (!userDirectory.has(uid)) l1Miss.push(uid)
    }
    if (l1Miss.length === 0) {
      console.log('[useUserDirectory] L1 全部命中: count=', wanted.length)
      return
    }
    console.log('[useUserDirectory] L1 miss:', l1Miss)

    // L2 storage 层
    const l2Miss = []
    for (const uid of l1Miss) {
      const cached = _readStorage(uid)
      if (cached) {
        userDirectory.set(uid, cached)
      } else {
        l2Miss.push(uid)
      }
    }
    if (l2Miss.length === 0) {
      console.log('[useUserDirectory] L2 全部命中: count=', l1Miss.length)
      return
    }
    console.log('[useUserDirectory] L2 miss (需走 L3):', l2Miss)

    // L3 网络层（Promise 去重）
    if (!_inflightPromise) {
      console.log('[useUserDirectory] L3 网络拉取: ids=', l2Miss)
      _inflightPromise = batchGetUserInfo(l2Miss)
        .catch((e) => {
          // 失败入重试队列（5s 后重试）
          console.warn('[useUserDirectory] L3 失败，入重试队列: ids=', l2Miss, 'err=', e?.message)
          _scheduleRetry(l2Miss)
          return new Map()
        })
        .finally(() => {
          _inflightPromise = null
        })
    }
    const resultMap = await _inflightPromise
    console.log('[useUserDirectory] L3 返回: resultMap.size=', resultMap?.size, '| 写入前 userDirectory.size=', userDirectory.size)
    if (resultMap && resultMap.size) {
      for (const [uid, info] of resultMap) {
        userDirectory.set(uid, info)
        _writeStorage(info)
        console.log('[useUserDirectory]   + uid=' + uid + ' nickname=' + info?.nickname + ' avatar=' + (info?.avatar || '(无)'))
      }
    } else {
      // 拿到空 map 但不是来自 catch 分支（可能是接口返回了空），也入重试
      if (!_inflightPromise) {
        _scheduleRetry(l2Miss)
      }
    }
  }

  /**
   * 同步获取单个 userInfo（L1 命中）
   * @param {string|number} userId
   * @returns {Object|null}
   */
  function getUser(userId) {
    if (userId === undefined || userId === null || userId === '') return null
    return userDirectory.get(String(userId)) || null
  }

  /**
   * 主动失效指定 userId（清除 L1 + L2 缓存）
   * 下次 ensureUsers 时会重新拉取
   */
  function invalidate(userId) {
    if (userId === undefined || userId === null) return
    const uid = String(userId)
    userDirectory.delete(uid)
    delete _storageCache[uid]
    delete _storageExpire[uid]
    try {
      uni.setStorageSync(STORAGE_KEY, _storageCache)
      uni.setStorageSync(STORAGE_KEY_EXPIRE, _storageExpire)
    } catch (e) {
      console.warn('[useUserDirectory] invalidate storage 写入失败:', e)
    }
  }

  /**
   * 清空所有 userInfo 缓存
   */
  function clear() {
    userDirectory.clear()
    for (const k of Object.keys(_storageCache)) delete _storageCache[k]
    for (const k of Object.keys(_storageExpire)) delete _storageExpire[k]
    try {
      uni.removeStorageSync(STORAGE_KEY)
      uni.removeStorageSync(STORAGE_KEY_EXPIRE)
    } catch (e) {
      // ignore
    }
  }

  return {
    userDirectory,
    ensureUsers,
    getUser,
    invalidate,
    clear,
  }
}
