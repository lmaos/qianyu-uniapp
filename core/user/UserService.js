/**
 * 用户信息服务
 * 提供单个/批量查询用户信息能力，自动处理本地缓存
 * @module core/user/UserService
 */

import { createUserInfo } from './UserInfo'
import {
  getCachedUserInfo,
  setCachedUserInfo,
  batchGetCachedUserInfo,
  batchSetCachedUserInfo,
} from './UserCache'

/** @type {string} 服务端 API 基础地址 */
let _baseUrl = ''

/**
 * 初始化用户服务
 * @param {Object} options
 * @param {string} options.baseUrl 服务端 API 地址
 */
export function initUserService(options) {
  _baseUrl = options.baseUrl || ''
  console.log('[UserService] 初始化: baseUrl=', _baseUrl || '(空)')
}

// ===== 单个查询 =====

/**
 * 查询单个用户信息（优先命中缓存）
 * @param {string|number} targetId 目标用户 ID
 * @returns {Promise<Object|null>} UserInfo 或 null
 */
export async function getUserInfo(targetId) {
  if (!targetId) return null

  // 1. 查缓存
  const cached = getCachedUserInfo(targetId)
  if (cached) {
    console.log('[UserService] 命中缓存: userId=', targetId)
    return cached
  }

  // 2. 请求接口
  try {
    const result = await _requestGet('/api/user/user_info/get', { targetId })
    if (!result) return null

    const userInfo = createUserInfo(result)
    setCachedUserInfo(targetId, userInfo)
    console.log('[UserService] 查询成功: userId=', targetId)
    return userInfo
  } catch (e) {
    console.error('[UserService] 查询用户信息失败: targetId=', targetId, e)
    return null
  }
}

// ===== 批量查询 =====

/**
 * 批量查询用户信息（缓存 + 网络分层）
 * @param {Array<string|number>} userIds 用户 ID 列表
 * @returns {Promise<Map<string|number, Object>>} userId → UserInfo 的 Map
 */
export async function batchGetUserInfo(userIds) {
  const resultMap = new Map()

  if (!userIds || !userIds.length) return resultMap

  // 1. 批量查缓存
  const { hit, miss } = batchGetCachedUserInfo(userIds)
  for (const [uid, info] of hit) {
    resultMap.set(uid, info)
  }

  if (miss.length === 0) {
    console.log('[UserService] 批量查询全部命中缓存: count=', userIds.length)
    return resultMap
  }

  // 2. 批量请求未命中的
  try {
    const idsText = miss.join(',')
    const list = await _requestGet('/api/user/user_info/list', { targetIdsText: idsText })

    if (list && list.length) {
      for (const item of list) {
        const userInfo = createUserInfo(item)
        resultMap.set(String(userInfo.userId), userInfo)
        setCachedUserInfo(userInfo.userId, userInfo)
      }
      console.log('[UserService] 批量查询完成: cached=', hit.size, ', fetched=', list.length)
    }
  } catch (e) {
    console.error('[UserService] 批量查询用户信息失败:', e)
  }

  return resultMap
}

// ===== 内部方法 =====

/**
 * 发送 GET 请求（框架自动包装响应）
 * @param {string} path API 路径
 * @param {Object} params 查询参数
 * @returns {Promise<Object>} content 字段内容
 */
function _requestGet(path, params) {
  return new Promise((resolve, reject) => {
    if (!_baseUrl) {
      reject(new Error('[UserService] baseUrl 未配置'))
      return
    }

    // 拼接查询参数
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${_baseUrl}${path}?${query}`

    uni.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = res.data || {}
          if (data.state === 'OK') {
            resolve(data.content)
          } else {
            reject(new Error(`[UserService] 接口返回失败: state=${data.state}, message=${data.message}`))
          }
        } else {
          reject(new Error(`[UserService] HTTP ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(`[UserService] 网络请求失败: ${err.errMsg || err}`))
      },
    })
  })
}
