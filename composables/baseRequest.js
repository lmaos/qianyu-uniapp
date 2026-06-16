import { useRequest } from './useRequest'
import { getCurrentLoginInfo, logoutToLogin } from './useLoginSession'
import { env } from '@/config/env'

/**
 * 全局默认请求实例
 *
 * baseURL 由 config/env.js 统一管理，切环境只改那里
 *
 * ── 请求前 ────────────────────
 * 自动从 useLoginSession 读取 token 追加到 token header
 *
 * ── 响应后 ────────────────────
 * 4xx → 统一 Toast 提示
 *   403 → 登录失效，调用 logoutToLogin() 跳登录页
 *   404 → "No resource access"
 *   其他 4xx → 服务端 message 存在才 toast（silent4xx: true 可跳过）
 * 5xx →  Toast 提示 + Promise 模式抛出异常
 *   502/504 → 固定提示 "Network error"
 *   其他 5xx → 服务端 message 或 "Server error (code)"
 *
 * ── 使用方式 ──────────────────
 * import request from '@/composables/baseRequest'
 *
 * // Promise（await）— 5xx 自动抛出异常
 * try {
 *   const { code, response } = await request.post({
 *     url: '/user/info', type: 'json', data: { id: 1 },
 *     header: { 'X-Custom': 'abc' },
 *   })
 *   // code 为 200 / 4xx，5xx 已被抛出
 *   if (code === 200) console.log(response.data)
 * } catch (err) {
 *   console.error('[System Error]', err.code, err.message)
 *   // err.code — 5xx 状态码
 *   // err.message — 服务端 message 或 "Server error (503)"
 *   // err.response — 服务端原始应答体
 * }
 *
 * // Callback — 不走抛异常逻辑
 * request.get({ url: '/user/list' }, ({ code, response }) => {
 *   if (code === 200) console.log(response.data)
 * })
 *
 * ── 单次请求选项 ────────────────
 * 以下选项可在每次请求的 opts 中传入：
 * @param {boolean} [opts.silent4xx=false]
 *   跳过 baseRequest 对"其他 4xx"的自动 toast，由业务自行处理。
 *   403（跳登录）/ 404（No resource access）不受影响。
 *   例：request.get({ url: '/check', silent4xx: true })
 */

function wrapRequestMethod(fn) {
  return function (opts, callback) {
    // Callback 模式 → 透传，不干预
    if (typeof callback === 'function') {
      return fn(opts, callback)
    }
    // Promise 模式 → 5xx 时 reject
    const promise = fn(opts)
    return promise.then((res) => {
      if (res.code >= 500 && res.code < 600) {
        const msg =
          (res.response && typeof res.response === 'object' && res.response.message) ||
          `Server error (${res.code})`
        const err = new Error(msg)
        err.code = res.code
        err.response = res.response
        return Promise.reject(err)
      }
      return res
    })
  }
}

const instance = useRequest({
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
          token: loginInfo.token,
        }
      }
      return config
    },
  ],

  // ── 响应后拦截：统一处理 4xx / 5xx ──────────────
  responseInterceptors: [
    /**
     * @param {{ code: number, message: string, response: any }} res
     * @returns {{ code: number, message: string, response: any }}
     */
    (res, config) => {
      // ── 4xx：客户端错误 ───────────────────────
      if (res.code >= 400 && res.code < 500) {
        // 403 → 登录已失效，清本地态并跳登录页
        if (res.code === 403) {
          logoutToLogin()
          return res
        }
        // 404 → 无资源访问
        if (res.code === 404) {
          uni.showToast({ title: 'No resource access', icon: 'none', duration: 3000 })
          return res
        }
        // 其他 4xx（400, 401, 405, 408…）→ 仅 message 存在时 toast
        // silent4xx: true 时跳过自动 toast，由业务自行处理
        if (!config?.silent4xx) {
          const msg = res.response && typeof res.response === 'object' && res.response.message
          if (msg) {
            uni.showToast({ title: String(msg), icon: 'none', duration: 3000 })
          }
        }
        return res
      }

      // ── 5xx：服务端错误 ───────────────────────
      if (res.code >= 500 && res.code < 600) {
        // 502/504 → 网关/代理超时，服务端 message 不可靠，固定提示
        if (res.code === 502 || res.code === 504) {
          uni.showToast({ title: 'Network error', icon: 'none', duration: 3000 })
          return res
        }
        // 503（下游服务异常）→ 服务端会返回具体 message，走正常逻辑
        // 500 及其他 5xx → 优先显示服务端 message
        const msg =
          (res.response && typeof res.response === 'object' && res.response.message) ||
          `Server error (${res.code})`
        uni.showToast({ title: String(msg), icon: 'none', duration: 3000 })
        return res
      }

      return res
    },
  ],
})

/** Promise 模式自动对 5xx 抛出异常，callback 模式不受影响 */
const request = {
  get: wrapRequestMethod(instance.get),
  post: wrapRequestMethod(instance.post),
  put: wrapRequestMethod(instance.put),
  delete: wrapRequestMethod(instance.delete),
  fileUpload: wrapRequestMethod(instance.fileUpload),
}

export default request
