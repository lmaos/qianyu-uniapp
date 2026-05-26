/**
 * IM 消息监听器约定接口
 *
 * 页面实现此接口的三个方法，在 onShow 时通过 useIm().bindListener(listener) 注册，
 * onHide 时通过 useIm().unbindListener(listener) 注销。
 *
 * 全局同时只会有一个活跃 listener，bindListener 会自动让前一个 listener leave。
 *
 * 使用示例:
 *   const listener = {
 *     onMessage(body) { messageList.value.push(body) },
 *   }
 *   onShow(() => useIm().bindListener(listener))
 *   onHide(() => useIm().unbindListener(listener))
 *
 * @module core/im/models/ImMessageListener
 */

/**
 * @typedef {Object} ImMessageListener
 * @property {function(): void} [register]  注册时回调（可选，用于初始化）
 * @property {function(): void} [leave]     离开时回调（可选，用于清理）
 * @property {function(Object): void} onMessage  收到消息时回调
 */
