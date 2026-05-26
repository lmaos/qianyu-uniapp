/**
 * 基于 uni.setStorage 的 IM 本地存储实现
 * 所有数据以 JSON 格式存储，key 格式: im:{userId}:{type}
 * @module core/im/storage/UniStorageStore
 */

import { IIMStorage } from './IIMStorage'

const STORAGE_KEY_PREFIX = 'im'

export class UniStorageStore extends IIMStorage {

  constructor() {
    super()
    this._userId = ''
  }

  async init(userId) {
    this._userId = userId
    console.log('[ImStorage] 初始化: userId=', userId)
  }

  async destroy() {
    // 清除该用户的所有 IM 数据
    const keys = [
      this._key('messages'),
      this._key('conversations'),
      this._key('contacts'),
    ]
    keys.forEach(k => {
      try { uni.removeStorageSync(k) } catch (e) { /* ignore */ }
    })
    console.log('[ImStorage] 销毁: userId=', this._userId)
  }

  // ===== 消息 =====

  async saveMessages(convId, messages) {
    const all = this._loadMessages()
    all[convId] = messages
    this._saveMessages(all)
    console.log('[ImStorage] 保存消息: convId=', convId, ', count=', messages.length)
  }

  async appendMessage(convId, message) {
    const all = this._loadMessages()
    if (!all[convId]) all[convId] = []
    // 用 msgId 去重
    const exists = all[convId].some(m => m.msgId === message.msgId)
    if (!exists) {
      all[convId].push(message)
    }
    this._saveMessages(all)
    console.log('[ImStorage] 追加消息: convId=', convId, ', msgId=', message.msgId, ', 去重=', exists)
  }

  async getMessages(convId, count = 15, offset = 0) {
    const all = this._loadMessages()
    const list = all[convId] || []
    // 按 seqId 降序排列（最新的在前）
    const sorted = [...list].sort((a, b) => {
      if (b.seqId > a.seqId) return 1
      if (b.seqId < a.seqId) return -1
      return 0
    })
    return sorted.slice(offset, offset + count)
  }

  // ===== 会话 =====

  async saveConversations(conversations) {
    this._save(this._key('conversations'), conversations)
    console.log('[ImStorage] 保存会话列表: count=', conversations.length)
  }

  async saveConversation(conversation) {
    const list = await this.getConversations()
    const idx = list.findIndex(c => c.conversationId === conversation.conversationId)
    if (idx >= 0) {
      list[idx] = conversation
    } else {
      list.unshift(conversation)
    }
    this._save(this._key('conversations'), list)
  }

  async getConversations() {
    return this._load(this._key('conversations'), [])
  }

  async deleteConversation(convId) {
    const list = await this.getConversations()
    this._save(this._key('conversations'), list.filter(c => c.conversationId !== convId))
    // 同时删除该会话的消息
    const all = this._loadMessages()
    delete all[convId]
    this._saveMessages(all)
    console.log('[ImStorage] 删除会话: convId=', convId)
  }

  // ===== 联系人 =====

  async saveContacts(contacts) {
    this._save(this._key('contacts'), contacts)
  }

  async getContacts() {
    return this._load(this._key('contacts'), [])
  }

  // ===== 私有方法 =====

  _key(type) {
    return `${STORAGE_KEY_PREFIX}:${this._userId}:${type}`
  }

  _load(key, defaultValue) {
    try {
      const raw = uni.getStorageSync(key)
      return raw ? JSON.parse(raw) : defaultValue
    } catch (e) {
      return defaultValue
    }
  }

  _save(key, value) {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
    } catch (e) {
      console.error('[IM Storage] save failed:', key, e)
    }
  }

  _loadMessages() {
    return this._load(this._key('messages'), {})
  }

  _saveMessages(all) {
    this._save(this._key('messages'), all)
  }
}
