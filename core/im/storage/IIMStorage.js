/**
 * IM Storage 抽象基类
 * 定义本地存储的 CRUD 接口
 * @module core/im/storage/IIMStorage
 */

export class IIMStorage {
  /** 初始化存储（用户登录后调用） */
  async init(userId) { throw new Error('未实现: init') }

  /** 销毁存储 */
  async destroy() { throw new Error('未实现: destroy') }

  // ===== 消息 =====

  /** 批量保存消息（覆盖） */
  async saveMessages(convId, messages) { throw new Error('未实现: saveMessages') }

  /** 追加单条消息 */
  async appendMessage(convId, message) { throw new Error('未实现: appendMessage') }

  /** 获取消息列表 */
  async getMessages(convId, count, offset) { throw new Error('未实现: getMessages') }

  // ===== 会话 =====

  /** 批量保存会话（覆盖） */
  async saveConversations(conversations) { throw new Error('未实现: saveConversations') }

  /** 保存/更新单条会话 */
  async saveConversation(conversation) { throw new Error('未实现: saveConversation') }

  /** 获取会话列表 */
  async getConversations() { throw new Error('未实现: getConversations') }

  /** 删除会话 */
  async deleteConversation(convId) { throw new Error('未实现: deleteConversation') }

  // ===== 联系人 =====

  /** 批量保存联系人 */
  async saveContacts(contacts) { throw new Error('未实现: saveContacts') }

  /** 获取联系人列表 */
  async getContacts() { throw new Error('未实现: getContacts') }
}
