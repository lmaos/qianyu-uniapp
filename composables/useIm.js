/**
 * 千语 IM Vue 3 Composable
 * 页面层唯一入口，所有 IM 操作通过此 Hook 获取
 * @module composables/useIm
 */

import { ref, readonly } from 'vue'
import { getImService } from '@/core/im/ImServiceImpl'
import { ImEvent } from '@/core/im/models/enums'
import { generateSeqId, generateMsgId } from '@/core/im/models/MessageEntity'
import { onLoginSessionCleared, onLoginSessionSaved } from '@/composables/useLoginSession.js'

// ===== 模块级单例状态 =====

const isReady = ref(false)
const isInitialized = ref(false)
const totalUnread = ref(0)

let _sdkReadyOff = null
let _sdkNotReadyOff = null
let _convUpdatedOff = null
let _coreListenersBound = false
let _initPromise = null
let _startPromise = null

// 登录态事件订阅句柄
let _loginClearedOff = null
let _loginSavedOff = null
let _lifecycleBound = false

// stop() 幂等保护：账号切换时新 start() 必须等旧 stop() 完成
let _stopPromise = null

export function useIm() {
  // 首次调用时自动绑定 IM 生命周期到登录态事件总线
  bindImLifecycle()

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
    // 账号切换时，旧 stop() 可能还没跑完；等待它完成再启动新会话
    if (_stopPromise) {
      await _stopPromise
    }

    if (isReady.value) {
      return
    }

    if (_startPromise) {
      return _startPromise
    }

    _startPromise = _start(userId, options).catch((error) => {
      _startPromise = null
      throw error
    })
    return _startPromise
  }

  async function _start(userId, options = {}) {
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
    if (isInitialized.value) {
      return
    }

    if (_initPromise) {
      return _initPromise
    }

    const service = getService()
    bindCoreListeners(service)

    _initPromise = service.init(options)
      .then(() => {
        isInitialized.value = true
        console.log('[useIm] 初始化完成: channel=', options.channel)
      })
      .catch((error) => {
        _initPromise = null
        throw error
      })
    return _initPromise
  }

  function bindCoreListeners(service) {
    if (_coreListenersBound) {
      return
    }

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
    _coreListenersBound = true
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
    _startPromise = null
  }

  /**
   * 彻底销毁 IM 服务
   *
   * 与 logout() 的区别：
   *   - logout()：仅断开 SDK 连接、登出当前账号
   *                保留 _adapter / _storage，**不可重新 start()**
   *   - stop()  ：logout + destroy，释放所有资源
   *                调用后**可以重新 start()** 启动新一轮会话
   *
   * 使用场景：
   *   1. 用户登出（含 token 过期、403 挤下线）→ 必须 stop
   *   2. 切换账号 → 必须 stop 旧账号 + start 新账号
   *   3. App 销毁 / 长时间挂起 → 清理资源
   *
   * 调用者保证：stop() 调用前应已确认无 in-flight start() 等待；
   *              重复调用安全（内部有 isReady/isInitialized 守卫）。
   */
  async function stop() {
    // 幂等：并发 stop() 复用同一个 Promise，避免重复释放
    if (_stopPromise) {
      return _stopPromise
    }

    _stopPromise = _doStop()
    try {
      return await _stopPromise
    } finally {
      _stopPromise = null
    }
  }

  async function _doStop() {
    console.log('[useIm] stop 开始')

    // 1. SDK logout（如果已 ready）：断开连接、登出账号
    if (isReady.value) {
      try {
        await getService().logout()
      } catch (e) {
        console.warn('[useIm] stop 阶段 logout 失败（已忽略）:', e?.message || e)
      }
    }

    // 2. SDK destroy（如果已初始化）：释放 adapter + storage
    if (isInitialized.value) {
      try {
        await getService().destroy()
      } catch (e) {
        console.warn('[useIm] stop 阶段 destroy 失败（已忽略）:', e?.message || e)
      }
    }

    // 3. 重置 useIm 内部响应式状态
    isReady.value = false
    isInitialized.value = false
    totalUnread.value = 0

    // 4. 重置 module-level 单例状态（关键：否则下次 start() 会因
    //    _initPromise / _startPromise 已存在而提前 return）
    _initPromise = null
    _startPromise = null

    // 5. 清理 ImService 内部事件订阅（_sdkReadyOff 等）
    if (_sdkReadyOff) {
      _sdkReadyOff()
      _sdkReadyOff = null
    }
    if (_sdkNotReadyOff) {
      _sdkNotReadyOff()
      _sdkNotReadyOff = null
    }
    if (_convUpdatedOff) {
      _convUpdatedOff()
      _convUpdatedOff = null
    }
    _coreListenersBound = false

    console.log('[useIm] stop 完成')
  }

  /**
   * 把 IM 的 start/stop 绑到登录态事件总线上：
   *   - onLoginSessionCleared（登出 / token 过期 / 403 挤下线 / 账号切换清旧）→ stop()
   *   - onLoginSessionSaved（账号切换登新账号）→ 仅做日志埋点；新 IM 由 App.vue onShow 拉起
   *
   * 幂等：多次 useIm() 只会绑定一次；stop() 不解绑（事件总线是模块级）。
   * App.vue onUnload 中调 disposeImLifecycle() 彻底解绑。
   */
  function bindImLifecycle() {
    if (_lifecycleBound) return

    _loginClearedOff = onLoginSessionCleared(() => {
      console.log('[useIm] 登录态已清空 → 自动 stop IM')
      stop().catch((e) => console.warn('[useIm] 登录态清空后 stop 失败:', e?.message || e))
    })

    _loginSavedOff = onLoginSessionSaved(() => {
      console.log('[useIm] 登录态已保存（账号切换） → 等待 App.vue onShow 启动新 IM')
    })

    _lifecycleBound = true
  }

  /**
   * 解除 IM 生命周期订阅。仅供 App.vue onUnload 进程退出时使用。
   */
  function disposeImLifecycle() {
    if (_loginClearedOff) {
      _loginClearedOff()
      _loginClearedOff = null
    }
    if (_loginSavedOff) {
      _loginSavedOff()
      _loginSavedOff = null
    }
    _lifecycleBound = false
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
    stop,
    disposeImLifecycle,

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
