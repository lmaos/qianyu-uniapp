/**
 * 千语 IM 联系人实体工厂
 * @module core/im/models/ContactEntity
 */

/**
 * 创建联系人
 *
 * @param {Object} fields
 * @param {string} fields.userId           用户唯一 ID
 * @param {string} fields.name             显示名称
 * @param {string} [fields.displayId]      公开 ID
 * @param {string} [fields.avatarText]     头像文字
 * @param {string} [fields.avatarBackground] 头像背景
 * @param {string} [fields.onlineState]    在线状态
 * @param {string} [fields.relationState]  关系状态
 * @param {number} [fields.vipLevel]       VIP 等级
 * @param {string} [fields.signature]      个性签名
 * @param {string} [fields.locationText]   所在地
 * @param {boolean} [fields.hasNewMessage]  是否有新消息
 * @param {boolean} [fields.hasMomentUpdate] 是否有动态更新
 */
export function createContact(fields = {}) {
  return {
    userId: fields.userId || '',
    name: fields.name || '',
    displayId: fields.displayId || '',
    avatarText: fields.avatarText || '',
    avatarBackground: fields.avatarBackground || '',
    onlineState: fields.onlineState || 'hidden',
    relationState: fields.relationState || 'none',
    vipLevel: fields.vipLevel || 0,
    signature: fields.signature || '',
    locationText: fields.locationText || '',
    hasNewMessage: fields.hasNewMessage || false,
    hasMomentUpdate: fields.hasMomentUpdate || false,
  }
}
