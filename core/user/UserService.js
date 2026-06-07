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
import request from '@/composables/baseRequest.js'

/** @type {string} 服务端 API 基础地址（保留以兼容旧 init 入口） */
let _baseUrl = ''

/**
 * 初始化用户服务（保留入口，实际 baseURL 由 baseRequest 的 env 配置管理）
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

  // 2. 调接口（baseRequest 自动带 token header，silent4xx 跳过自动 toast）
  try {
    const { code, response } = await request.get({
      url: '/api/user/user_info/get',
      data: { targetId },
      silent4xx: true,
    })
    console.log('[UserService] get /user_info/get', targetId, '→ code=', code, 'state=', response?.state)
    if (code !== 200 || !response || response.state !== 'OK') return null

    const userInfo = createUserInfo(response.content)
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
  // 后端约定：参数名是 targetIds（@Params(name="targetIds")），
  // 不能用 targetIdsText。基类接口是 GET，用 query 串（data 会被序列化为 ?targetIds=1,2,3）
  try {
    const { code, response } = await request.get({
      url: '/api/user/user_info/list',
      data: { targetIds: miss.join(',') },
      silent4xx: true,
    })
    console.log('[UserService] list /user_info/list', miss.length, '→ code=', code, 'state=', response?.state)

    if (code !== 200 || !response || response.state !== 'OK') {
      console.warn('[UserService] 批量查询失败: code=', code, 'state=', response?.state, 'message=', response?.message)
      return resultMap
    }

    const list = response.content || []
    if (list.length) {
      for (const item of list) {
        const userInfo = createUserInfo(item)
        resultMap.set(String(userInfo.userId), userInfo)
        setCachedUserInfo(userInfo.userId, userInfo)
      }
      console.log('[UserService] 批量查询完成: cached=', hit.size, ', fetched=', list.length, '| sample=', JSON.stringify(list[0]).slice(0, 200))
    } else {
      console.warn('[UserService] 批量查询返回空: cached=', hit.size, ', miss=', miss.length, '| missIds=', miss)
    }
  } catch (e) {
    console.error('[UserService] 批量查询用户信息失败:', e)
  }

  return resultMap
}
