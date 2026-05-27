/**
 * IM 服务全局配置
 * sdkAppId 从服务端 /api/im/login 接口动态获取，无需在客户端配置
 * @module core/config/common.config
 */

export default {
  /** 厂商标识: tencent / easemob / rongcloud / nim */
  imChannel: 'tencent',

  /** 服务端 API 基础地址 */
  imBaseUrl: 'http://qianyu-api.clmcat.com:8080',
}
