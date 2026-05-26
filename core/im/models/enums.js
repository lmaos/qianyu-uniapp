/**
 * 千语 IM 枚举定义
 * @module core/im/models/enums
 */

/** 会话类型 */
export const ChatType = Object.freeze({
  SINGLE: 1,  // 私聊 (1v1)
  GROUP: 2,   // 群聊（暂不处理）
  SYSTEM: 3,  // 系统通知（留作未来扩展）
})

/** 消息类型 */
export const MessageType = Object.freeze({
  TEXT: 'text',    // 文本消息（当前实现）
  IMAGE: 'image',  // 图片消息（后续迭代）
  VOICE: 'voice',  // 语音消息（后续迭代）
})

/** 云厂商标识 */
export const Channel = Object.freeze({
  TENCENT: 'tencent',
  EASEMOB: 'easemob',
  RONGCLOUD: 'rongcloud',
  NIM: 'nim',
})

/** IM 事件 */
export const ImEvent = Object.freeze({
  SDK_READY: 'sdk_ready',
  SDK_NOT_READY: 'sdk_not_ready',
  MESSAGE_RECEIVED: 'message_received',
  CONVERSATION_UPDATED: 'conversation_updated',
  KICKED_OUT: 'kicked_out',
})

/** 在线状态 */
export const OnlineState = Object.freeze({
  ONLINE: 'online',
  OFFLINE: 'offline',
  HIDDEN: 'hidden',
})

/** 关系状态 */
export const RelationState = Object.freeze({
  FRIEND: 'friend',
  FOLLOWED: 'followed',
  NONE: 'none',
})
