/**
 * IM 服务核心实现（单例）
 * 协调 Adapter + Storage，提供统一的 IM 操作接口
 * @module core/im/ImServiceImpl
 */

import { createAdapter } from './adapters/AdapterFactory'
import { UniStorageStore } from './storage/UniStorageStore'
import { ImEvent, ChatType } from './models/enums'
import { getConvIdFromBody } from './models/MessageEntity'

class ImServiceImpl {
  constructor() {
    this._adapter = null       // 当前 Adapter 实例
    this._storage = null       // Storage 实例
    this._channel = ''         // 当前厂商标识
    this._userId = '10001'     // 当前登录用户 ID（开发阶段默认）
    this._isReady = false      // SDK 就绪状态
    this._eventHandlers = {}   // 上层事件回调 { event: [fn, ...] }
    this._baseUrl = ''         // 服务端 API 基础地址
    this._messageListener = null // 当前活跃的页面消息监听器（全局唯一）
  }

  // ===== 生命周期 =====

  /**
   * 初始化 IM 服务
   * @param {Object} options
   * @param {string} options.channel  厂商标识
   * @param {Object} options.config   SDK 配置
   * @param {string} [options.baseUrl] 服务端 API 地址
   */
  async init(options) {
    this._channel = options.channel
    this._baseUrl = options.baseUrl || ''

    console.log('[ImService] 初始化: channel=', options.channel, ', baseUrl=', this._baseUrl || '(空)')

    // 1. 创建 Adapter
    this._adapter = createAdapter(options.channel, options.config)

    // 2. 创建 Storage
    this._storage = new UniStorageStore()

    // 3. 桥接 Adapter 事件 → ImServiceImpl 事件
    this._adapter.on(ImEvent.SDK_READY, () => {
      this._isReady = true
      this._storage.init(this._userId)
      console.log('[ImService] SDK_READY: userId=', this._userId)
      this._fetchAndSaveConversations()
      this._emit(ImEvent.SDK_READY)
    })

    this._adapter.on(ImEvent.SDK_NOT_READY, () => {
      this._isReady = false
      console.warn('[ImService] SDK_NOT_READY')
      this._emit(ImEvent.SDK_NOT_READY)
    })

    this._adapter.on(ImEvent.MESSAGE_RECEIVED, (body) => {
      const convId = this._convIdFromBody(body)

      console.log('[ImService] 收到消息: convId=', convId, ', sender=', body.sender, ', type=', body.messageType, ', body=', JSON.stringify(body))

      // ① 写入聊天记录
      this._storage.appendMessage(convId, body)

      // ② 更新会话列表数据库（含 saveConversations 写回）
      this._updateConversationPreview(convId, body)

      // ③ 非自己发的消息 → unreadCount +1
      if (body.sender !== this._userId) {
        this._incrementUnreadCount(convId, body)
      }

      // ④ 通知会话列表刷新
      this._emit(ImEvent.CONVERSATION_UPDATED)

      // ⑤ 通知上层事件监听
      this._emit(ImEvent.MESSAGE_RECEIVED, body)

      // ⑥ 通知当前活跃的页面 listener
      if (this._messageListener && typeof this._messageListener.onMessage === 'function') {
        this._messageListener.onMessage(body)
      }
    })

    this._adapter.on(ImEvent.CONVERSATION_UPDATED, () => {
      console.log('[ImService] 会话列表变更 (SDK)')
      this._emit(ImEvent.CONVERSATION_UPDATED)
    })

    this._adapter.on(ImEvent.KICKED_OUT, (data) => {
      console.warn('[ImService] 被踢下线:', data)
      this._emit(ImEvent.KICKED_OUT, data)
    })

    // 4. 初始化 SDK（不登录）
    await this._adapter.init()
    console.log('[ImService] 初始化完成')
  }

  /**
   * 登录
   * @param {string} userId 用户 ID
   * @param {string} token  服务端生成的 IM 凭证
   */
  async login(userId, token) {
    this._userId = String(userId)
    console.log('[ImService] 登录: userId=', this._userId)
    await this._adapter.login(this._userId, token)
    // SDK_READY 事件在 Adapter 事件中触发
  }

  /**
   * 登出
   */
  async logout() {
    console.log('[ImService] 登出: userId=', this._userId)
    if (this._adapter) {
      await this._adapter.logout()
    }
    if (this._storage) {
      await this._storage.destroy()
    }
    this._isReady = false
    this._userId = ''
    this._emit(ImEvent.SDK_NOT_READY)
  }

  /**
   * 销毁
   */
  async destroy() {
    console.log('[ImService] 销毁')
    if (this._adapter) {
      await this._adapter.destroy()
      this._adapter = null
    }
    if (this._storage) {
      await this._storage.destroy()
      this._storage = null
    }
    this._isReady = false
    this._userId = ''
    this._channel = ''
    this._eventHandlers = {}
  }

  // ===== 消息 =====

  /**
   * 发送消息
   * 1. 乐观写入 Storage
   * 2. POST Server 转发
   *
   * @param {Object} body QYMessageBody
   * @returns {Object} 原始 body（Server 不修改）
   */
  async sendMessage(body) {
    // 乐观写入本地存储
    const convId = this._convIdFromBody(body)
    this._storage.appendMessage(convId, body)

    // POST 到服务端转发
    console.log('[ImService] 发送消息: convId=', convId, ', receiver=', body.receiver, ', type=', body.messageType)
    const packet = { channel: this._channel, body }
    await this._postToSendApi(packet)
    console.log('[ImService] 消息发送成功: msgId=', body.msgId)

    return body
  }

  /**
   * 拉取历史消息
   * 优先从 Storage 读取，无数据则从 SDK 拉取
   *
   * @param {string} convId   会话 ID（private_xxx / group_xxx）
   * @param {number} chatType 会话类型
   * @param {number} [count=15] 拉取数量
   * @param {string} [cursor=null] 分页游标
   * @returns {Promise<{list: Array, hasMore: boolean, cursor: string|null}>}
   */
  async getMessages(convId, chatType, count = 15, cursor = null) {
    // 优先从 Storage 读取
    if (!cursor) {
      const cached = await this._storage.getMessages(convId, count, 0)
      if (cached.length > 0) {
        console.log('[ImService] 消息命中缓存: convId=', convId, ', count=', cached.length)
        return { list: cached, hasMore: true, cursor: null }
      }
    }

    // Storage 无数据或翻页，从 SDK 拉取
    console.log('[ImService] 从 SDK 拉取消息: convId=', convId, ', cursor=', cursor)
    const result = await this._adapter.getMessages(convId, chatType, count, cursor)

    // 写入 Storage
    if (result.list.length > 0) {
      await this._storage.saveMessages(convId, result.list)
    }

    return result
  }

  // ===== 会话 =====

  /**
   * 获取会话列表
   * 优先从 Storage 读取，无数据则从 SDK 拉取
   *
   * @returns {Promise<{list: Array}>}
   */
  async getConversationList() {
    // 优先从 Storage 读取
    const cached = await this._storage.getConversations()
    if (cached.length > 0) {
      console.log('[ImService] 会话列表命中缓存: count=', cached.length)
      return { list: cached }
    }

    // Storage 无数据，从 SDK 拉取
    console.log('[ImService] 从 SDK 拉取会话列表')
    const list = await this._adapter.getConversationList()
    if (list.length > 0) {
      await this._storage.saveConversations(list)
    }
    return { list }
  }

  /**
   * 删除会话（Adapter + Storage 双删）
   */
  async deleteConversation(convId, chatType) {
    console.log('[ImService] 删除会话: convId=', convId)
    await this._adapter.deleteConversation(convId, chatType)
    await this._storage.deleteConversation(convId)
  }

  /**
   * 置顶/取消置顶会话
   */
  async pinConversation(convId, chatType, isPinned) {
    console.log('[ImService] 置顶会话: convId=', convId, ', isPinned=', isPinned)
    await this._adapter.pinConversation(convId, chatType, isPinned)
  }

  /**
   * 标记会话已读
   * 本地立即清零 + 通知 UI，再异步同步 SDK
   */
  async markConversationRead(convId, chatType) {
    console.log('[ImService] 标记已读: convId=', convId)
    // 先立即清零本地未读 + 通知 UI 刷新
    this._resetUnreadCount(convId)
    this._emit(ImEvent.CONVERSATION_UPDATED)
    // 再异步同步 SDK（不阻塞本地 UI）
    try {
      await this._adapter.markConversationRead(convId, chatType)
    } catch (e) {
      console.error('[ImService] SDK 标记已读失败（本地已清零，不影响 UI）:', e)
    }
  }

  // ===== 事件 =====

  /**
   * 注册事件监听
   * @param {string} event   ImEvent 枚举值
   * @param {Function} handler 回调函数
   * @returns {Function} 取消监听函数
   */
  on(event, handler) {
    if (!this._eventHandlers[event]) this._eventHandlers[event] = []
    this._eventHandlers[event].push(handler)
    return () => {
      this._eventHandlers[event] = this._eventHandlers[event].filter(fn => fn !== handler)
    }
  }

  _emit(event, data) {
    ;(this._eventHandlers[event] || []).forEach(fn => {
      try {
        fn(data)
      } catch (e) {
        console.error(`[ImService] 事件处理器异常: ${event}`, e)
      }
    })
  }

  // ===== 只读属性 =====

  get isReady() { return this._isReady }
  get currentChannel() { return this._channel }
  get currentUserId() { return this._userId }

  // ===== 内部方法 =====

  /**
   * 从消息体计算会话 ID
   */
  _convIdFromBody(body) {
    return getConvIdFromBody(body, this._userId)
  }

  /**
   * SDK_READY 后首次拉取会话并写入 Storage
   */
  async _fetchAndSaveConversations() {
    try {
      console.log('[ImService] 首次拉取会话列表')
      const list = await this._adapter.getConversationList()
      if (list.length > 0) {
        await this._storage.saveConversations(list)
        console.log('[ImService] 首次拉取会话完成: count=', list.length)
        this._emit(ImEvent.CONVERSATION_UPDATED)
      } else {
        console.log('[ImService] 首次拉取会话完成: 无会话')
      }
    } catch (e) {
      console.error('[ImService] 首次拉取会话失败:', e)
    }
  }

  /**
   * 收到消息时更新对应会话的 preview 并写回 Storage
   */
  _updateConversationPreview(convId, body) {
    try {
      const conversations = this._storage.getConversations()
      // UniStorageStore 内部是同步的，getConversations 返回 thenable
      // 但直接操作 _storage 的同步方法更可靠
      const key = this._storage._key('conversations')
      const raw = uni.getStorageSync(key)
      const conversationsList = raw ? JSON.parse(raw) : []

      const idx = conversationsList.findIndex(c => c.conversationId === convId)
      const preview = body.messageType === 'text'
        ? body.content
        : `[${body.messageType}]`

      if (idx >= 0) {
        conversationsList[idx].lastMessagePreview = preview
        conversationsList[idx].lastMessageTime = body.clientTime
        uni.setStorageSync(key, JSON.stringify(conversationsList))
        console.log('[ImService] 更新会话 preview: convId=', convId)
      }
    } catch (e) {
      console.error('[ImService] 更新会话 preview 失败:', e)
    }
  }

  /**
   * 收到非自己的消息时 unreadCount +1 并写回 Storage
   * 如果会话不存在（新会话首条消息），自动插入一条占位记录
   *
   * @param {string} convId
   * @param {Object} [body]  消息体（新会话时用于填充 preview）
   */
  _incrementUnreadCount(convId, body) {
    if (!this._storage) return
    try {
      const key = this._storage._key('conversations')
      const raw = uni.getStorageSync(key)
      const conversationsList = raw ? JSON.parse(raw) : []

      const idx = conversationsList.findIndex(c => c.conversationId === convId)
      if (idx >= 0) {
        const newCount = (conversationsList[idx].unreadCount || 0) + 1
        conversationsList[idx].unreadCount = newCount
        uni.setStorageSync(key, JSON.stringify(conversationsList))
        console.log('[ImService] 未读数+1: convId=', convId, ', unreadCount=', newCount)
      } else {
        // 新会话，插入占位记录
        const preview = body
          ? (body.messageType === 'text' ? body.content : `[${body.messageType}]`)
          : ''
        conversationsList.unshift({
          conversationId: convId,
          unreadCount: 1,
          lastMessagePreview: preview,
          lastMessageTime: body ? body.clientTime : Date.now()
        })
        uni.setStorageSync(key, JSON.stringify(conversationsList))
        console.log('[ImService] 新会话插入未读数: convId=', convId, ', unreadCount=1')
      }
    } catch (e) {
      console.error('[ImService] 更新未读数失败:', e)
    }
  }

  /**
   * 将指定会话的 unreadCount 重置为 0
   */
  _resetUnreadCount(convId) {
    if (!this._storage) return
    try {
      const key = this._storage._key('conversations')
      const raw = uni.getStorageSync(key)
      const conversationsList = raw ? JSON.parse(raw) : []

      const idx = conversationsList.findIndex(c => c.conversationId === convId)
      if (idx >= 0 && conversationsList[idx].unreadCount !== 0) {
        conversationsList[idx].unreadCount = 0
        uni.setStorageSync(key, JSON.stringify(conversationsList))
        console.log('[ImService] 未读数清零: convId=', convId)
      }
    } catch (e) {
      console.error('[ImService] 重置未读数失败:', e)
    }
  }

  /**
   * 获取所有会话的总未读数
   * @returns {number}
   */
  getTotalUnreadCount() {
    if (!this._storage) return 0
    try {
      const key = this._storage._key('conversations')
      const raw = uni.getStorageSync(key)
      const conversationsList = raw ? JSON.parse(raw) : []
      return conversationsList.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    } catch (e) {
      console.error('[ImService] 计算总未读数失败:', e)
      return 0
    }
  }

  // ===== 页面 Listener 管理 =====

  /**
   * 绑定消息监听器（同时只会有一个活跃 listener）
   * 自动让前一个 listener leave，然后设置新 listener 并调用 register
   *
   * @param {ImMessageListener} listener
   */
  bindListener(listener) {
    // 自动让前一个离开
    if (this._messageListener && typeof this._messageListener.leave === 'function') {
      console.log('[ImService] 前一个 listener leave')
      this._messageListener.leave()
    }
    this._messageListener = listener
    console.log('[ImService] 绑定页面 listener')
    if (listener && typeof listener.register === 'function') {
      listener.register()
    }
  }

  /**
   * 解绑消息监听器
   * 只有当传入的 listener 是当前活跃 listener 时才执行 leave
   *
   * @param {ImMessageListener} listener
   */
  unbindListener(listener) {
    if (this._messageListener === listener) {
      if (typeof listener.leave === 'function') {
        listener.leave()
      }
      this._messageListener = null
      console.log('[ImService] 解绑页面 listener')
    }
  }

  /**
   * POST 到服务端 /api/im/send
   */
  _postToSendApi(packet) {
    return new Promise((resolve, reject) => {
      console.log('[ImService] POST /api/im/send: channel=', packet.channel, ', sender=', packet.body?.sender)
      uni.request({
        url: `${this._baseUrl}/api/im/send`,
        method: 'POST',
        data: packet,
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('[ImService] 发送接口响应成功: status=', res.statusCode)
            resolve(res.data)
          } else {
            console.error('[ImService] 发送接口响应异常: status=', res.statusCode, ', data=', res.data)
            reject(new Error(`[ImService] 发送失败: HTTP ${res.statusCode}`))
          }
        },
        fail: (err) => {
          console.error('[ImService] 发送接口网络失败:', err.errMsg || err)
          reject(new Error(`[ImService] 网络请求失败: ${err.errMsg || err}`))
        },
      })
    })
  }
}

// ===== 单例导出 =====

let _instance = null

/**
 * 获取 IM 服务单例
 * @returns {ImServiceImpl}
 */
export function getImService() {
  if (!_instance) _instance = new ImServiceImpl()
  return _instance
}
