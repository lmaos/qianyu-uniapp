/**
 * 腾讯云 IM SDK 适配器
 * 封装 @tencentcloud/chat SDK，桥接 SDK 事件到统一 ImEvent
 * @module core/im/adapters/TencentAdapter
 */

import { IIMAdapter } from './IIMAdapter'
import { ImEvent, ChatType, MessageType } from '../models/enums'
import { createMessageBody } from '../models/MessageEntity'
import { createConversation } from '../models/ConversationEntity'
import * as TencentCloudChatModule from '@tencentcloud/chat'
import * as TIMUploadPluginModule from 'tim-upload-plugin'

// 腾讯 SDK 消息类型 → QY MessageType 映射
const SDK_MSG_TYPE_MAP = {
  TIMTextElem: MessageType.TEXT,
  TIMImageElem: MessageType.IMAGE,
  TIMSoundElem: MessageType.VOICE,
  TIMVideoFileElem: 'video',
  TIMFileElem: 'file',
  TIMCustomElem: 'custom',
  TIMGroupTipElem: 'tips',
  TIMRelayElem: 'merge',
  TIMGroupSystemNoticeElem: 'system',
}

export class TencentAdapter extends IIMAdapter {

  constructor(config) {
    super(config)
    this._sdk = null
    this._TencentCloudChat = null
    this._TIMUploadPlugin = null
    this._eventsBridged = false
  }

  get providerId() {
    return 'tencent'
  }

  // ===== 生命周期 =====

  async init() {
    this._TencentCloudChat = TencentCloudChatModule.default || TencentCloudChatModule
    this._TIMUploadPlugin = TIMUploadPluginModule.default || TIMUploadPluginModule

    if (!this._TencentCloudChat) {
      console.warn('[TencentAdapter] SDK 未加载，跳过初始化')
      return
    }

    console.log('[TencentAdapter] 初始化 SDK: sdkAppId=', this.config.sdkAppId)
    this._sdk = this._TencentCloudChat.create({
      SDKAppID: this.config.sdkAppId,
    })
    this._sdk.setLogLevel(this.config.logLevel ?? 1)
    this._sdk.registerPlugin({ 'tim-upload-plugin': this._TIMUploadPlugin })
    console.log('[TencentAdapter] SDK 初始化完成')
  }

  async login(userId, userSig) {
    if (!this._sdk) {
      console.warn('[TencentAdapter] SDK 未初始化，跳过登录')
      return
    }

    // 事件必须在 login 之前注册
    this._bridgeEvents()
    console.log('[TencentAdapter] 登录: userId=', userId)
    await this._sdk.login({ userID: userId, userSig })
    console.log('[TencentAdapter] 登录成功: userId=', userId)
  }

  async logout() {
    if (this._sdk) {
      console.log('[TencentAdapter] 登出')
      await this._sdk.logout()
    }
  }

  async destroy() {
    if (this._sdk) {
      console.log('[TencentAdapter] 销毁 SDK 实例')
      this._sdk.destroy()
      this._sdk = null
    }
    this._eventsBridged = false
  }

  // ===== 事件桥接 =====

  _bridgeEvents() {
    if (this._eventsBridged) return
    this._eventsBridged = true
    console.log('[TencentAdapter] 桥接 SDK 事件')

    const E = this._TencentCloudChat.EVENT

    this._sdk.on(E.SDK_READY, () => {
      this._emit(ImEvent.SDK_READY)
    })

    this._sdk.on(E.SDK_NOT_READY, () => {
      this._emit(ImEvent.SDK_NOT_READY)
    })

    this._sdk.on(E.MESSAGE_RECEIVED, (event) => {
      const messages = event.data.map(msg => this._convertSdkMessage(msg))
      console.log('[TencentAdapter] 收到消息: count=', messages.length)
      messages.forEach(msg => {
        this._emit(ImEvent.MESSAGE_RECEIVED, msg)
      })
    })

    this._sdk.on(E.CONVERSATION_LIST_UPDATED, () => {
      this._emit(ImEvent.CONVERSATION_UPDATED)
    })

    this._sdk.on(E.KICKED_OUT, (event) => {
      this._emit(ImEvent.KICKED_OUT, event.data)
    })
  }

  // ===== 会话操作 =====

  async getConversationList() {
    if (!this._sdk) return []
    const res = await this._sdk.getConversationList()
    const list = res.data.conversationList.map(c => this._convertSdkConversation(c))
    console.log('[TencentAdapter] 拉取会话列表: count=', list.length)
    return list
  }

  async deleteConversation(convId, chatType) {
    if (!this._sdk) return
    const sdkConvId = this._toSdkConvId(convId, chatType)
    console.log('[TencentAdapter] 删除会话: convId=', convId)
    await this._sdk.deleteConversation(sdkConvId)
  }

  async pinConversation(convId, chatType, isPinned) {
    if (!this._sdk) return
    const sdkConvId = this._toSdkConvId(convId, chatType)
    console.log('[TencentAdapter] 置顶会话: convId=', convId, ', isPinned=', isPinned)
    await this._sdk.pinConversation({ conversationID: sdkConvId, isPinned })
  }

  async markConversationRead(convId, chatType) {
    if (!this._sdk) return
    const sdkConvId = this._toSdkConvId(convId, chatType)
    console.log('[TencentAdapter] 标记已读: convId=', convId)
    await this._sdk.setMessageRead({ conversationID: sdkConvId })
  }

  // ===== 消息拉取 =====

  async getMessages(convId, chatType, count = 15, cursor = null) {
    if (!this._sdk) return { list: [], hasMore: false }

    const sdkConvId = this._toSdkConvId(convId, chatType)
    const params = { conversationID: sdkConvId, count }
    if (cursor) params.nextReqMessageID = cursor

    console.log('[TencentAdapter] 拉取消息: convId=', convId, ', count=', count, ', cursor=', cursor)
    const res = await this._sdk.getMessageList(params)
    const list = res.data.messageList.map(m => this._convertSdkMessage(m))
    console.log('[TencentAdapter] 拉取消息完成: count=', list.length, ', hasMore=', !res.data.isCompleted)
    return {
      list,
      hasMore: !res.data.isCompleted,
      cursor: res.data.nextReqMessageID || null,
    }
  }

  // ===== SDK 消息转换 =====

  /**
   * 将腾讯 SDK 消息转换为 QYMessageBody
   */
  _convertSdkMessage(sdkMsg) {
    const messageType = SDK_MSG_TYPE_MAP[sdkMsg.type] || 'unknown'
    let content = ''

    // 根据 SDK 消息类型提取 content
    if (sdkMsg.type === 'TIMTextElem') {
      content = sdkMsg.payload?.text || ''
    } else if (sdkMsg.type === 'TIMImageElem') {
      // 取第一张图的最大尺寸 URL
      const imageItem = sdkMsg.payload?.imageInfoArray?.[0]
      content = imageItem?.url || ''
    } else if (sdkMsg.type === 'TIMCustomElem') {
      content = JSON.stringify(sdkMsg.payload?.data || {})
    } else {
      content = sdkMsg.payload?.text || ''
    }

    // 从 conversationID 解析 targetId 和 chatType
    // SDK 格式: C2CuserId 或 GROUPgroupId
    const sdkConvId = sdkMsg.conversationID || ''
    let chatType = ChatType.SINGLE
    let receiver = sdkMsg.to || ''

    if (sdkConvId.startsWith('GROUP')) {
      chatType = ChatType.GROUP
      receiver = sdkConvId.slice(5) // 去掉 "GROUP" 前缀
    } else if (sdkConvId.startsWith('C2C')) {
      chatType = ChatType.SINGLE
      receiver = sdkConvId.slice(3) // 去掉 "C2C" 前缀
    }

    // 腾讯 time 是秒，需要 × 1000 转毫秒
    const clientTime = (sdkMsg.time || 0) * 1000

    return createMessageBody({
      sender: sdkMsg.from || '',
      receiver,
      content,
      messageType,
      chatType,
      clientTime,
    })
  }

  /**
   * 将腾讯 SDK 会话转换为 QYConversation
   */
  _convertSdkConversation(sdkConv) {
    const sdkConvId = sdkConv.conversationID || ''
    let targetId = ''
    let chatType = ChatType.SINGLE

    if (sdkConvId.startsWith('C2C')) {
      targetId = sdkConvId.slice(3)
      chatType = ChatType.SINGLE
    } else if (sdkConvId.startsWith('GROUP')) {
      targetId = sdkConvId.slice(5)
      chatType = ChatType.GROUP
    }

    // 提取最后一条消息摘要
    const lastMsg = sdkConv.lastMessage
    let lastMessagePreview = ''
    let lastMessageTime = 0
    if (lastMsg) {
      if (lastMsg.type === 'TIMTextElem') {
        lastMessagePreview = lastMsg.payload?.text || ''
      } else {
        lastMessagePreview = `[${lastMsg.type || '消息'}]`
      }
      lastMessageTime = (lastMsg.lastTime || 0) * 1000
    }

    return createConversation({
      conversationId: chatType === ChatType.SINGLE
        ? `private_${targetId}`
        : `group_${targetId}`,
      targetId,
      name: sdkConv.userProfile?.nick || sdkConv.groupProfile?.name || targetId,
      avatarText: sdkConv.userProfile?.nick?.charAt(0) || targetId.charAt(0),
      avatarBackground: sdkConv.userProfile?.avatar || '',
      lastMessagePreview,
      lastMessageTime,
      unreadCount: sdkConv.unreadCount || 0,
      isPinned: sdkConv.isPinned || false,
      isMuted: sdkConv.groupProfile?.muteAllMembers || false,
      onlineState: 'hidden', // 腾讯 SDK 会话列表不含在线状态
    })
  }

  // ===== 辅助方法 =====

  /**
   * QY convId → SDK convId
   * private_user123 → C2Cuser123
   * group_group123 → GROUPgroup123
   */
  _toSdkConvId(convId, chatType) {
    if (chatType === ChatType.GROUP) {
      // convId 格式: group_{targetId}
      const targetId = convId.startsWith('group_') ? convId.slice(6) : convId
      return `GROUP${targetId}`
    }
    // chatType === SINGLE: convId 格式: private_{targetId}
    const targetId = convId.startsWith('private_') ? convId.slice(8) : convId
    return `C2C${targetId}`
  }
}
