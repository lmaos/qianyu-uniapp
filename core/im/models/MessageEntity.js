/**
 * 千语 IM 消息实体 + ID 生成工具
 * @module core/im/models/MessageEntity
 */

import { ChatType, MessageType } from './enums'

// ============================================================================
// ID 生成工具
// ============================================================================

/** 自增计数器（同一秒内递增） */
let _seqCounter = 0
let _msgCounter = 0
let _lastSeqSecond = 0
let _lastMsgSecond = 0

/**
 * 生成 seqId（客户端排序 ID）
 * 格式: {10位秒级时间戳}{4位自增数}
 * 例: "17481600000001"
 */
export function generateSeqId() {
  const now = Math.floor(Date.now() / 1000)
  if (now !== _lastSeqSecond) {
    _lastSeqSecond = now
    _seqCounter = 1
  } else {
    _seqCounter++
  }
  return `${now}${String(_seqCounter).padStart(4, '0')}`
}

/**
 * 生成 msgId（客户端消息 ID）
 * 格式: {sender}-{receiver}-{时间戳后8位}{4位自增数}
 * 例: "x451254-x4521245-800000010001"
 *
 * @param {string} sender   发送者用户 ID
 * @param {string} receiver 接收者用户 ID
 */
export function generateMsgId(sender, receiver) {
  const now = Math.floor(Date.now() / 1000)
  const ts8 = String(now).slice(-8)
  if (now !== _lastMsgSecond) {
    _lastMsgSecond = now
    _msgCounter = 1
  } else {
    _msgCounter++
  }
  return `${sender}-${receiver}-${ts8}${String(_msgCounter).padStart(4, '0')}`
}

// ============================================================================
// 消息体创建
// ============================================================================

/**
 * 创建消息体（SDK 收到消息后由 Adapter 调用）
 *
 * @param {Object} fields
 * @param {string} fields.sender      发送者用户 ID
 * @param {string} fields.receiver    接收者用户 ID
 * @param {string} fields.content     消息内容
 * @param {number} [fields.chatType]  会话类型
 * @param {string} [fields.messageType] 消息类型
 * @param {number} [fields.clientTime] SDK 提供的时间戳（毫秒）
 */
export function createMessageBody(fields) {
  const { sender, receiver, clientTime } = fields

  return {
    seqId: generateSeqId(),
    msgId: generateMsgId(sender, receiver),
    clientTime: clientTime || Date.now(),
    messageType: fields.messageType || MessageType.TEXT,
    content: fields.content,
    sender,
    receiver,
    chatType: fields.chatType || ChatType.SINGLE,
  }
}

// ============================================================================
// 页面渲染辅助
// ============================================================================

/**
 * 判断消息方向：self / other / system
 *
 * @param {Object} msg           消息体
 * @param {string} currentUserId 当前登录用户 ID
 * @returns {'self' | 'other' | 'system'}
 */
export function getMessageDirection(msg, currentUserId) {
  if (msg.chatType === ChatType.SYSTEM) return 'system'
  return msg.sender === currentUserId ? 'self' : 'other'
}

/**
 * 从消息体生成会话 ID
 *
 * @param {Object} body          消息体
 * @param {string} currentUserId 当前登录用户 ID
 * @returns {string} 会话 ID，如 "private_x4521245"
 */
export function getConvIdFromBody(body, currentUserId) {
  if (body.chatType === ChatType.SINGLE) {
    const peerId = body.sender === currentUserId ? body.receiver : body.sender
    return `private_${peerId}`
  }
  return `group_${body.receiver}`
}
