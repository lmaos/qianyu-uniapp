/**
 * IM 服务全局配置
 * sdkAppId 从服务端 /api/im/login 接口动态获取，无需在客户端配置
 * @module core/im/im.config
 */

export default {
  /** 厂商标识: tencent / easemob / rongcloud / nim */
  channel: 'tencent',

  /** 服务端 API 基础地址 */
  baseUrl: 'http://localhost:8080',
}
