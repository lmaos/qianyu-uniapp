/**
 * useRequest — 通用异步请求工具（纯工具，零业务依赖）
 *
 * ── 设计要点 ──────────────────────────────────────────
 * 1. 纯工具层，不依赖任何业务模块
 * 2. 多环境 URL 管理（baseURL / env + envMap）
 * 3. 统一返回 {code, message, response}，状态码全透传，业务层自行处理
 * 4. 请求前拦截器：修改请求配置（追加 header、调整 URL 等），按注册顺序执行
 * 5. 响应后拦截器：处理业务逻辑（403 跳登录、500 toast 等），按注册顺序执行
 * 6. 可扩展序列化器：默认内置 json / form，可注入自定义序列化器（如 protobuf）
 * 7. Content-Type 简写：'json' → application/json + JSON.stringify，'form' → URL 编码
 * 8. JSONP 跨域：opts.jsonp = true 时 GET 走 <script> 标签加载（H5 环境）
 * 9. Promise 模式（可 await）与 Callback 模式二选一
 *
 * ── 创建实例 ──────────────────────────────────────────
 * const api = useRequest({
 *   baseURL: 'https://api.example.com',
 *   requestInterceptors: [
 *     (config) => {
 *       config.header['X-App-Version'] = '1.0'
 *       return config
 *     }
 *   ],
 *   responseInterceptors: [
 *     (res) => {
 *       if (res.code === 401) handleUnauthorized()
 *       return res
 *     }
 *   ]
 * })
 *
 * ── Promise 模式 ──────────────────────────────────────
 * const { code, message, response } = await api.post({
 *   url: '/user/info',
 *   type: 'json',
 *   data: { userId: 1 },
 *   header: { 'X-Custom': 'abc' },
 * })
 * if (code === 200) console.log(response)
 *
 * ── Callback 模式 ─────────────────────────────────────
 * api.post({ url: '/user/info', data: { id: 1 } }, ({ code, message, response }) => {
 *   if (code === 200) console.log(response)
 * })
 *
 * ── API ───────────────────────────────────────────────
 * api.get(opts, callback?)
 * api.post(opts, callback?)
 * api.put(opts, callback?)
 * api.delete(opts, callback?)
 * api.fileUpload(opts, callback?)
 *
 * ── opts 字段 ─────────────────────────────────────────
 * @param {string}  opts.url       - 请求地址
 * @param {string}  [opts.type]    - Content-Type 简写，默认由 options.defaultType 决定（默认 'json'）
 * @param {*}       [opts.data]    - 请求数据
 * @param {Object}  [opts.header]  - 自定义请求头
 * @param {number}  [opts.timeout] - 超时毫秒
 * @param {boolean|string} [opts.jsonp] - true 走 JSONP（H5 跨域），传字符串则作为 callback 参数名
 *
 * fileUpload 额外:
 * @param {string}  [opts.name]     - 文件字段名（默认 'file'）
 * @param {string}  [opts.filePath] - 本地文件路径
 * @param {Object}  [opts.formData] - 额外表单字段
 *
 * ── 请求拦截器 config 对象 ────────────────────────────
 * 每个请求拦截器接收一个 config 对象，可直接修改后返回：
 * { url, type, data, header, timeout, method, body, name, filePath, formData }
 *
 * ── 序列化器扩展 ──────────────────────────────────────
 * const api = useRequest({
 *   serializers: {
 *     pb: (data) => ProtobufEncoder.encode(data),
 *   }
 * })
 * // 使用：api.post({ url: '/rpc', type: 'pb', data: msg })
 */
export function useRequest(options = {}) {
  const {
    baseURL = '',
    env = '',
    envMap = {},
    requestInterceptors = [],
    responseInterceptors = [],
    defaultTimeout = 30000,
    defaultUploadTimeout = 120000,
    /** 序列化器注册表：{ typeName: (data) => serialized } */
    serializers: customSerializers = {},
    /** 默认 type，可覆盖 opts.type */
    defaultType = 'json',
    /** JSONP 回调参数名（默认 'callback'），opts.jsonp = 'cb' 可单次覆盖 */
    jsonpKey = 'callback',
    /** JSONP 超时 */
    jsonpTimeout = 10000,
  } = options || {}

  /** 解析后的 baseURL */
  const resolvedBaseURL = baseURL || (env && envMap[env]) || ''

  // ── 内部工具 ───────────────────────────────────────

  function serializeQuery(data) {
    if (!data || typeof data !== 'object') return ''
    return Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
  }

  function tryParseJSON(raw) {
    if (raw === undefined || raw === null) return raw
    if (typeof raw !== 'string') return raw
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }

  function createResult(code = 0, message = '', response = null) {
    return { code, message, response }
  }

  /** 运行请求拦截器 */
  function runRequestInterceptors(config) {
    return requestInterceptors.reduce((acc, fn) => {
      if (typeof fn !== 'function') return acc
      const next = fn(acc)
      return next !== undefined ? next : acc
    }, config)
  }

  /** 运行响应拦截器 */
  function runResponseInterceptors(res) {
    return responseInterceptors.reduce((acc, fn) => {
      if (typeof fn !== 'function') return acc
      const next = fn(acc)
      return next !== undefined ? next : acc
    }, res)
  }

  /** 拼接完整 URL */
  function resolveURL(url) {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return url
    }
    const base = resolvedBaseURL.replace(/\/+$/, '')
    const path = url.replace(/^\/+/, '')
    return base ? `${base}/${path}` : url
  }

  const CONTENT_TYPE_MAP = {
    json: 'application/json',
    form: 'application/x-www-form-urlencoded',
    multipart: 'multipart/form-data',
  }

  /** 序列化器注册表：默认 json + form，可扩展 */
  const serializers = {
    json: (data) => JSON.stringify(data),
    form: (data) => serializeQuery(data),
    ...customSerializers,
  }

  // ── 核心执行器 ─────────────────────────────────────

  /**
   * @param {string}  method
   * @param {Object}  opts
   * @param {Function} [callback]
   * @returns {Promise<{code,message,response}>|void}
   */
  function execute(method, opts, callback) {
    const hasCallback = typeof callback === 'function'

    // 1. 构建请求配置
    let config = {
      url: (opts && opts.url) || '',
      type: (opts && opts.type) || defaultType,
      data: (opts && opts.data) || null,
      header: (opts && opts.header) ? { ...opts.header } : {},
      timeout: (opts && opts.timeout != null) ? opts.timeout : defaultTimeout,
      method,
      body: (opts && opts.body) || false,
      jsonp: (opts && opts.jsonp) || false,
      jsonpKey: typeof (opts && opts.jsonp) === 'string' ? opts.jsonp : jsonpKey,
      // upload 专用
      uploadTimeout: (opts && opts.uploadTimeout != null) ? opts.uploadTimeout : defaultUploadTimeout,
      name: (opts && opts.name) || 'file',
      filePath: (opts && opts.filePath) || '',
      formData: (opts && opts.formData) || {},
    }

    // 2. 请求前拦截
    config = runRequestInterceptors(config) || config

    // 3. 参数校验
    if (!config.url) {
      const result = createResult(-1, 'Request url is required', null)
      const interRes = runResponseInterceptors(result)
      if (hasCallback) {
        callback(interRes)
        return
      }
      return Promise.resolve(interRes)
    }

    // 4. 上传 → uni.uploadFile
    if (config.method === 'UPLOAD') {
      return doUpload(config, hasCallback, callback)
    }

    // 5. JSONP（仅 GET + jsonp 标记）→ <script> 标签加载
    if (config.jsonp) {
      return doJSONP(config, hasCallback, callback)
    }

    // 6. 标准请求 → uni.request
    return doRequest(config, hasCallback, callback)
  }

  // ── 标准请求 ─────────────────────────────────────

  function doRequest(config, hasCallback, callback) {
    const { url, type, header, timeout, data, method, body } = config
    const fullURL = resolveURL(url)

    // Content-Type：有 body 的方法都需要
    if (method === 'POST' || method === 'PUT' || method === 'DELETE' || body) {
      const ct = CONTENT_TYPE_MAP[type]
      if (ct && !header['Content-Type']) {
        header['Content-Type'] = ct
      }
    }

    let requestURL = fullURL
    let requestData = data

    // GET（默认）→ data 转 query string
    if (method === 'GET' && !body) {
      if (data && typeof data === 'object') {
        const qs = serializeQuery(data)
        if (qs) {
          requestURL += (requestURL.includes('?') ? '&' : '?') + qs
        }
      }
      requestData = null
    } else {
      // 有 body 的方法 → 用序列化器处理 data
      const serializer = serializers[type]
      if (serializer && data && typeof data === 'object') {
        requestData = serializer(data)
      }
    }

    function wrapRes(res) {
      const response = tryParseJSON(res.data)
      return runResponseInterceptors(createResult(res.statusCode, '', response))
    }
    function wrapFail(err) {
      return runResponseInterceptors(createResult(0, err.errMsg || 'Network error', null))
    }

    if (hasCallback) {
      uni.request({
        url: requestURL, method, data: requestData, header, timeout,
        success: (res) => callback(wrapRes(res)),
        fail: (err) => callback(wrapFail(err)),
      })
      return
    }

    return new Promise((resolve) => {
      uni.request({
        url: requestURL, method, data: requestData, header, timeout,
        success: (res) => resolve(wrapRes(res)),
        fail: (err) => resolve(wrapFail(err)),
      })
    })
  }

  // ── 文件上传 ─────────────────────────────────────

  function doUpload(config, hasCallback, callback) {
    const { url, header, name, filePath, formData, uploadTimeout } = config
    const fullURL = resolveURL(url)

    function wrapRes(res) {
      const response = tryParseJSON(res.data)
      return runResponseInterceptors(createResult(res.statusCode, '', response))
    }
    function wrapFail(err) {
      return runResponseInterceptors(createResult(0, err.errMsg || 'Upload failed', null))
    }

    const uploadOpts = {
      url: fullURL, filePath, name, formData, header,
    }
    if (uploadTimeout) uploadOpts.timeout = uploadTimeout

    if (hasCallback) {
      uni.uploadFile({
        ...uploadOpts,
        success: (res) => callback(wrapRes(res)),
        fail: (err) => callback(wrapFail(err)),
      })
      return
    }

    return new Promise((resolve) => {
      uni.uploadFile({
        ...uploadOpts,
        success: (res) => resolve(wrapRes(res)),
        fail: (err) => resolve(wrapFail(err)),
      })
    })
  }

  // ── JSONP（跨域）─────────────────────────────────

  /**
   * JSONP GET：创建 <script> 标签加载，解析 callback({...}) 形式应答。
   * 仅 H5 环境生效，App/小程序端降级为普通 GET。
   */
  function doJSONP(config, hasCallback, callback) {
    // 非浏览器环境 → 降级
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      console.warn('[useRequest] JSONP 仅支持 H5 环境，降级为普通 GET')
      config.jsonp = false
      return doRequest(config, hasCallback, callback)
    }

    const { url, data, timeout, jsonpKey } = config
    const fullURL = resolveURL(url)

    // 生成唯一回调名
    const cbName = '__jsonp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)

    // 构造 URL：data + callback 参数
    const params = { ...(data || {}), [jsonpKey]: cbName }
    let requestURL = fullURL
    const qs = serializeQuery(params)
    if (qs) {
      requestURL += (fullURL.includes('?') ? '&' : '?') + qs
    }

    function dispatchResult(code, msg, response) {
      const result = runResponseInterceptors(createResult(code, msg, response))
      if (hasCallback) callback(result)
      return result
    }

    return new Promise((resolve) => {
      let timer = null
      let cleaned = false

      function cleanup() {
        if (cleaned) return
        cleaned = true
        if (timer) clearTimeout(timer)
        try { delete window[cbName] } catch (e) {}
        const el = document.querySelector('script[data-jsonp="' + cbName + '"]')
        if (el) el.remove()
      }

      // 注册全局回调
      window[cbName] = (payload) => {
        resolve(dispatchResult(200, '', payload))
        cleanup()
      }

      // 超时
      timer = setTimeout(() => {
        resolve(dispatchResult(0, 'JSONP timeout', null))
        cleanup()
      }, timeout || jsonpTimeout)

      // 创建 <script> 标签加载
      const script = document.createElement('script')
      script.src = requestURL
      script.setAttribute('data-jsonp', cbName)
      script.onerror = () => {
        resolve(dispatchResult(0, 'JSONP load error', null))
        cleanup()
      }
      document.head.appendChild(script)
    })
  }

  // ── 公开 API ─────────────────────────────────────

  return {
    get(opts, callback) { return execute('GET', opts, callback) },
    post(opts, callback) { return execute('POST', opts, callback) },
    put(opts, callback) { return execute('PUT', opts, callback) },
    delete(opts, callback) { return execute('DELETE', opts, callback) },
    fileUpload(opts, callback) { return execute('UPLOAD', opts, callback) },
  }
}
