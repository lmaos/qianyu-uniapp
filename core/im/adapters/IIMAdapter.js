/**
 * IM Adapter 抽象基类
 * 各厂商 Adapter 继承此类，实现具体的 SDK 交互逻辑
 * @module core/im/adapters/IIMAdapter
 */

export class IIMAdapter {
  constructor(config) {
    this.config = config
    this._callbacks = {}  // { eventName: [handler, ...] }
  }

  // ===== 生命周期 =====

  /** 初始化 SDK 实例（不登录） */
  async init() { throw new Error('未实现: init') }

  /** 登录（userId + 服务端下发的 token） */
  async login(userId, token) { throw new Error('未实现: login') }

  /** 登出 */
  async logout() { throw new Error('未实现: logout') }

  /** 销毁 SDK 实例 */
  async destroy() { throw new Error('未实现: destroy') }

  // ===== 事件 =====

  /**
   * 注册事件监听
   * @param {string} event   事件名（ImEvent 枚举）
   * @param {Function} handler 回调函数
   * @returns {Function} 取消监听函数
   */
  on(event, handler) {
    if (!this._callbacks[event]) this._callbacks[event] = []
    this._callbacks[event].push(handler)
    return () => {
      this._callbacks[event] = this._callbacks[event].filter(fn => fn !== handler)
    }
  }

  /**
   * 触发事件
   * @param {string} event 事件名
   * @param {*} data  事件数据
   */
  _emit(event, data) {
    ;(this._callbacks[event] || []).forEach(fn => fn(data))
  }

  // ===== 会话 =====

  /** 获取会话列表 */
  async getConversationList() { throw new Error('未实现: getConversationList') }

  /** 删除会话 */
  async deleteConversation(convId, chatType) { throw new Error('未实现: deleteConversation') }

  /** 置顶/取消置顶会话 */
  async pinConversation(convId, chatType, isPinned) { throw new Error('未实现: pinConversation') }

  /** 标记会话已读 */
  async markConversationRead(convId, chatType) { throw new Error('未实现: markConversationRead') }

  // ===== 消息 =====

  /** 获取历史消息 */
  async getMessages(convId, chatType, count, cursor) { throw new Error('未实现: getMessages') }

  // ===== 只读属性 =====

  /** 返回厂商标识字符串 */
  get providerId() { throw new Error('未实现: providerId') }
}
