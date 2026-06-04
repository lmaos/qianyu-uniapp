import { useRequest } from './useRequest'
import { getCurrentLoginInfo, logoutToLogin } from './useLoginSession'
import { env } from '@/config/env'

/**
 * 全局默认请求实例
 *
 * baseURL 由 config/env.js 统一管理，切环境只改那里
 *
 * ── 请求前 ────────────────────
 * 自动从 useLoginSession 读取 token 追加到 Authorization header
 *
 * ── 响应后 ────────────────────
 * 403 → 登录失效，调用 logoutToLogin() 跳登录页
 * 500 → 提取服务端返回的 message 字段 toast 提示
 *
 * ── 服务端应答格式 ────────────
 * { code, message, data }
 * response.data 为业务数据
 *
 * ── 使用方式 ──────────────────
 * import request from '@/composables/baseRequest'
 *
 * // Promise（await）
 * const { code, response } = await request.post({
 *   url: '/user/info', type: 'json', data: { id: 1 },
 *   header: { 'X-Custom': 'abc' },
 * })
 * if (code === 200) console.log(response.data)
 *
 * // Callback
 * request.get({ url: '/user/list' }, ({ code, response }) => {
 *   if (code === 200) console.log(response.data)
 * })
 */

const request = useRequest({
  baseURL: env.baseURL,
  defaultTimeout: env.timeout,
  defaultUploadTimeout: env.uploadTimeout,

  // ── 请求前拦截：自动携带 token ─────────────────
  requestInterceptors: [
    /**
     * @param {{ url, type, data, header, timeout, method }} config
     * @returns {Object}
     */
    (config) => {
      const loginInfo = getCurrentLoginInfo()
      if (loginInfo && loginInfo.token) {
        config.header = {
          ...config.header,
          Authorization: 'Bearer ' + loginInfo.token,
        }
      }
      return config
    },
  ],

  // ── 响应后拦截：统一处理 403 / 500 ──────────────
  responseInterceptors: [
    /**
     * @param {{ code: number, message: string, response: any }} res
     * @returns {{ code: number, message: string, response: any }}
     */
    (res) => {
      // 403 → 登录已失效，清本地态并跳登录页
      if (res.code === 403) {
        logoutToLogin()
        return res
      }

      // 500 → 解析服务端 message 并 toast
      if (res.code === 500 && res.response && typeof res.response === 'object') {
        const msg = res.response.message
        if (msg) {
          uni.showToast({ title: String(msg), icon: 'none', duration: 3000 })
        }
      }

      return res
    },
  ],
})

export default request
