/**
 * 千语 IM Vue 3 Composable
 * 页面层唯一入口，所有 IM 操作通过此 Hook 获取
 * @module composables/useIm
 */

import { ref, readonly } from 'vue'
import { getImService } from '@/core/im/ImServiceImpl'
import { ImEvent } from '@/core/im/models/enums'
import { generateSeqId, generateMsgId } from '@/core/im/models/MessageEntity'

// ===== 模块级单例状态 =====

const isReady = ref(false)
const isInitialized = ref(false)
const totalUnread = ref(0)

let _sdkReadyOff = null
let _sdkNotReadyOff = null
let _convUpdatedOff = null

export function useIm() {

  function getService() {
    return getImService()
  }

  // ===== 生命周期 =====

  /**
   * 一键启动 IM 服务（App.vue onLaunch 调用一次）
   * 流程: 调用服务端 /api/im/login → 拿到 sdkAppId + imToken → init → SDK login
   *
   * @param {string|number} userId  用户 ID
   * @param {Object} [options]
   * @param {string} [options.channel='tencent']  厂商标识
   * @param {string} [options.baseUrl]             服务端 API 地址
   */
  async function start(userId, options = {}) {
    const channel = options.channel || 'tencent'
    const baseUrl = options.baseUrl || ''

    console.log('[useIm] 启动: userId=', userId, ', channel=', channel)

    // 1. 调用服务端 login 接口，获取 sdkAppId + imToken
    const loginResult = await _callServerLogin(userId, channel, baseUrl)
    console.log('[useIm] 服务端登录成功: sdkAppId=', loginResult.sdkAppId)

    // 2. 初始化 IM 服务（使用服务端返回的 sdkAppId）
    await init({
      channel: loginResult.channel || channel,
      config: { sdkAppId: loginResult.sdkAppId },
      baseUrl: baseUrl,
    })

    // 3. 使用 imToken 登录 SDK
    await login(String(userId), loginResult.imToken)

    console.log('[useIm] 启动完成')
  }

  /**
   * 初始化 IM 服务（由 start 内部调用，也可单独调用）
   * @param {Object} options
   * @param {string} options.channel  厂商标识
   * @param {Object} options.config   SDK 配置（含 sdkAppId）
   * @param {string} [options.baseUrl] 服务端 API 地址
   */
  async function init(options) {
    const service = getService()

    // 注册内部状态监听
    _sdkReadyOff = service.on(ImEvent.SDK_READY, () => {
      console.log('[useIm] SDK_READY')
      isReady.value = true
      _updateTotalUnread()
    })
    _sdkNotReadyOff = service.on(ImEvent.SDK_NOT_READY, () => {
      console.log('[useIm] SDK_NOT_READY')
      isReady.value = false
    })
    _convUpdatedOff = service.on(ImEvent.CONVERSATION_UPDATED, () => {
      _updateTotalUnread()
    })

    await service.init(options)
    isInitialized.value = true
    console.log('[useIm] 初始化完成: channel=', options.channel)
  }

  /**
   * 登录 IM
   * @param {string} userId 用户 ID
   * @param {string} token  服务端生成的 IM 凭证
   */
  async function login(userId, token) {
    console.log('[useIm] 登录: userId=', userId)
    await getService().login(userId, token)
  }

  /**
   * 登出 IM
   */
  async function logout() {
    console.log('[useIm] 登出')
    await getService().logout()
    isReady.value = false
  }

  // ===== 消息 =====

  /**
   * 发送消息
   * 自动生成 seqId / msgId / clientTime
   *
   * @param {Object} options
   * @param {string} options.messageType 消息类型 (text/image/voice)
   * @param {string} options.content     消息内容
   * @param {string} options.receiver    接收者 ID
   * @param {number} options.chatType    会话类型 (1=私聊, 2=群聊)
   * @returns {Promise<Object>} QYMessageBody
   */
  async function sendMessage(options) {
    const { messageType, content, receiver, chatType } = options
    const userId = getService().currentUserId

    const body = {
      seqId: generateSeqId(),
      msgId: generateMsgId(userId, receiver),
      clientTime: Date.now(),
      messageType,
      content,
      sender: userId,
      receiver,
      chatType,
    }

    console.log('[useIm] 发送消息: msgId=', body.msgId, ', receiver=', receiver, ', type=', messageType)
    return getService().sendMessage(body)
  }

  /**
   * 注册消息监听
   * @param {Function} handler (body: QYMessageBody) => void
   * @returns {Function} 取消监听函数
   */
  function onMessage(handler) {
    return getService().on(ImEvent.MESSAGE_RECEIVED, handler)
  }

  /**
   * 拉取历史消息
   * @param {string} convId   会话 ID
   * @param {number} chatType 会话类型
   * @param {number} [count=15] 拉取数量
   * @param {string} [cursor=null] 分页游标
   */
  async function getMessages(convId, chatType, count, cursor) {
    return getService().getMessages(convId, chatType, count, cursor)
  }

  // ===== 会话 =====

  /**
   * 获取会话列表
   * @returns {Promise<{list: Array}>}
   */
  async function getConversationList() {
    return getService().getConversationList()
  }

  /**
   * 注册会话变更监听
   * @param {Function} handler () => void
   * @returns {Function} 取消监听函数
   */
  function onConversationUpdated(handler) {
    return getService().on(ImEvent.CONVERSATION_UPDATED, handler)
  }

  /**
   * 删除会话
   * @param {string} convId   会话 ID
   * @param {number} chatType 会话类型
   */
  async function deleteConversation(convId, chatType) {
    await getService().deleteConversation(convId, chatType)
    _updateTotalUnread()
  }

  /**
   * 置顶/取消置顶会话
   */
  async function pinConversation(convId, chatType, isPinned) {
    await getService().pinConversation(convId, chatType, isPinned)
  }

  /**
   * 标记会话已读
   */
  async function markConversationRead(convId, chatType) {
    await getService().markConversationRead(convId, chatType)
    _updateTotalUnread()
  }

  // ===== 状态查询 =====

  /**
   * 获取当前用户 ID
   */
  function getCurrentUserId() {
    return getService().currentUserId
  }

  /**
   * 获取当前厂商标识
   */
  function getCurrentChannel() {
    return getService().currentChannel
  }

  // ===== 页面 Listener =====

  /**
   * 绑定页面消息监听器（onShow 时调用）
   * 同时只会有一个活跃 listener，前一个自动 leave
   *
   * @param {ImMessageListener} listener
   */
  function bindListener(listener) {
    getService().bindListener(listener)
  }

  /**
   * 解绑页面消息监听器（onHide 时调用）
   *
   * @param {ImMessageListener} listener
   */
  function unbindListener(listener) {
    getService().unbindListener(listener)
  }

  // ===== 内部方法 =====

  /**
   * 同步总未读数到 ref
   */
  function _updateTotalUnread() {
    totalUnread.value = getService().getTotalUnreadCount()
  }

  /**
   * 调用服务端 /api/im/login 获取 imToken + sdkAppId
   */
  function _callServerLogin(userId, channel, baseUrl) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `${baseUrl}/api/im/login`,
        method: 'POST',
        data: { channel, userId: Number(userId) },
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300 && res.data?.state === 'OK') {
            resolve(res.data.content)
          } else {
            reject(new Error(`[useIm] 服务端登录失败: HTTP ${res.statusCode}, ${JSON.stringify(res.data)}`))
          }
        },
        fail: (err) => {
          reject(new Error(`[useIm] 服务端登录网络失败: ${err.errMsg || err}`))
        },
      })
    })
  }

  return {
    // 状态（readonly refs）
    isReady: readonly(isReady),
    isInitialized: readonly(isInitialized),
    totalUnread: readonly(totalUnread),

    // 生命周期
    start,
    init,
    login,
    logout,

    // 消息
    sendMessage,
    onMessage,
    getMessages,

    // 会话
    getConversationList,
    onConversationUpdated,
    deleteConversation,
    pinConversation,
    markConversationRead,

    // 状态查询
    getCurrentUserId,
    getCurrentChannel,

    // 页面 Listener
    bindListener,
    unbindListener,
  }
}
