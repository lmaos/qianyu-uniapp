/**
 * IM Adapter 工厂
 * 根据 channel 字符串创建对应的 Adapter 实例
 * @module core/im/adapters/AdapterFactory
 */

import { Channel } from '../models/enums'
import { TencentAdapter } from './TencentAdapter'

// 厂商注册表：channel → Adapter 类
const ADAPTER_REGISTRY = {
  [Channel.TENCENT]: TencentAdapter,
  // 后续迭代时注册：
  // [Channel.EASEMOB]: EasemobAdapter,
  // [Channel.RONGCLOUD]: RongCloudAdapter,
  // [Channel.NIM]: NimAdapter,
}

/**
 * 创建 Adapter 实例
 *
 * @param {string} channel 厂商标识（tencent / easemob / rongcloud / nim）
 * @param {Object} config  SDK 配置参数
 * @returns {IIMAdapter} Adapter 实例
 * @throws {Error} 不支持的 channel
 */
export function createAdapter(channel, config) {
  const AdapterClass = ADAPTER_REGISTRY[channel]
  if (!AdapterClass) {
    console.error(`[AdapterFactory] 不支持的 IM channel: ${channel}`)
    throw new Error(`[AdapterFactory] 不支持的 IM channel: ${channel}`)
  }
  console.log(`[AdapterFactory] 创建 Adapter: channel=${channel}`)
  return new AdapterClass(config)
}
