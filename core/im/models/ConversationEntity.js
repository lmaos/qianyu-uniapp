/**
 * 千语 IM 会话体工厂
 * @module core/im/models/ConversationEntity
 */

/**
 * 创建会话体
 *
 * @param {Object} fields
 * @param {string} fields.conversationId    会话 ID
 * @param {string} fields.targetId          对方用户 ID
 * @param {string} fields.name              显示名称
 * @param {string} [fields.avatarText]      头像文字
 * @param {string} [fields.avatarBackground] 头像背景
 * @param {string} [fields.lastMessagePreview] 最后消息摘要
 * @param {number} [fields.lastMessageTime]  最后消息时间（毫秒）
 * @param {number} [fields.unreadCount]      未读数
 * @param {boolean} [fields.isPinned]        是否置顶
 * @param {boolean} [fields.isMuted]         是否免打扰
 * @param {string} [fields.onlineState]      在线状态
 */
export function createConversation(fields = {}) {
  return {
    conversationId: fields.conversationId || '',
    targetId: fields.targetId || '',
    name: fields.name || '',
    avatarText: fields.avatarText || '',
    avatarBackground: fields.avatarBackground || '',
    lastMessagePreview: fields.lastMessagePreview || '',
    lastMessageTime: fields.lastMessageTime || 0,
    unreadCount: fields.unreadCount || 0,
    isPinned: fields.isPinned || false,
    isMuted: fields.isMuted || false,
    onlineState: fields.onlineState || 'hidden',
  }
}
