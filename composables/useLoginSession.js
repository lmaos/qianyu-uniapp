import { computed, reactive, readonly } from 'vue'

/**
 * 全局登录态使用说明
 *
 * 一、在 setup 中使用
 * ```js
 * import { useLoginSession } from '@/composables/useLoginSession.js'
 *
 * const {
 *   loginInfo,
 *   isLoggedIn,
 *   saveLoginInfo,
 *   updateLoginInfo,
 *   clearLoginInfo,
 *   logoutToLogin,
 *   getCurrentLoginInfo,
 *   requireLogin,
 *   redirectAfterLogin
 * } = useLoginSession()
 * ```
 *
 * 二、在普通页面 / Options API / this 上使用
 * ```js
 * this.$saveLoginInfo({
 *   token: 'token-value',
 *   expireMs: Date.now() + 7 * 24 * 60 * 60 * 1000,
 *   nickname: '千语用户',
 *   userNo: 'QY10001',
 *   avatar: 'https://...',
 *   liveAuth: true,
 *   shopAuth: false
 * })
 *
 * const loginInfo = this.$getCurrentLoginInfo()
 * this.$requireLogin()
 * this.$logoutToLogin()
 * ```
 *
 * 三、常用场景
 * 1. 保存登录：调用 saveLoginInfo(payload) 或 this.$saveLoginInfo(payload)
 * 2. 注销登录：调用 logoutToLogin() 或 this.$logoutToLogin()
 * 3. 获取登录信息：调用 getCurrentLoginInfo() / getLoginInfo()，或读取响应式 loginInfo / this.$loginInfo
 * 4. 进入需要登录的页面前校验：调用 requireLogin() 或 this.$requireLogin()
 * 5. 登录成功后回原页：调用 redirectAfterLogin({ redirect })
 *
 * 四、说明
 * 1. 登录信息会自动持久化到本地 storage
 * 2. token 过期时间使用 expireMs，单位毫秒时间戳
 * 3. 除标准字段外，其它扩展字段也会一并保留，方便后续接微信登录或服务端真实返回
 * 4. 更接近社交 APP 的用法是：登录成功保存整包对象；后续刷新 token / 更新昵称头像时使用 updateLoginInfo 做局部更新
 * 5. 未登录或 token 过期时，建议统一走 requireLogin()，这样可以自动带上 redirect 参数，登录后再回到触发页
 */
export const LOGIN_SESSION_STORAGE_KEY = 'qianyu_login_session'
export const LOGIN_SESSION_CHANGED_EVENT = 'qianyu:login-session-changed'
export const LOGIN_SESSION_SAVED_EVENT = 'qianyu:login-session-saved'
export const LOGIN_SESSION_CLEARED_EVENT = 'qianyu:login-session-cleared'
export const LOGIN_PAGE_URL = '/pages/login/login'
export const LOGIN_HOME_URL = '/pages/index/index'
export const LOGIN_REDIRECT_QUERY_KEY = 'redirect'

const DEFAULT_LOGIN_SESSION = Object.freeze({
	token: '',
	expireMs: 0,
	nickname: '',
	userNo: '',
	avatar: '',
	liveAuth: false,
	shopAuth: false
})

const loginSessionState = reactive(createDefaultLoginSession())
const readonlyLoginSession = readonly(loginSessionState)
let loginSessionHydrated = false

/**
 * 创建默认登录对象，用于首次初始化、清空登录态和重置本地缓存。
 */
function createDefaultLoginSession() {
	return {
		...DEFAULT_LOGIN_SESSION
	}
}

/**
 * 统一标准化登录对象：
 * 1. 固定保留 token / expireMs / nickname / userNo / avatar / liveAuth / shopAuth；
 * 2. 额外字段不丢弃，方便后续接真实微信登录、手机号登录或服务端更多扩展字段。
 */
function normalizeLoginSession(payload = {}) {
	const source = payload && typeof payload === 'object' ? payload : {}
	const normalized = {
		...createDefaultLoginSession(),
		token: normalizeString(source.token),
		expireMs: normalizeExpireMs(source.expireMs),
		nickname: normalizeString(source.nickname),
		userNo: normalizeString(source.userNo),
		avatar: normalizeString(source.avatar),
		liveAuth: normalizeBoolean(source.liveAuth),
		shopAuth: normalizeBoolean(source.shopAuth)
	}

	Object.entries(source).forEach(([key, value]) => {
		if (value === undefined || key in normalized) {
			return
		}

		normalized[key] = value
	})

	return normalized
}

/**
 * 将任意输入转成字符串，避免接口字段为 null / undefined 时污染登录对象。
 */
function normalizeString(value) {
	if (value === undefined || value === null) {
		return ''
	}

	return String(value)
}

/**
 * 统一标准化过期时间，只接收大于 0 的毫秒时间戳。
 */
function normalizeExpireMs(value) {
	const normalizedValue = Number(value || 0)
	return Number.isFinite(normalizedValue) && normalizedValue > 0 ? normalizedValue : 0
}

/**
 * 标准化权限布尔值，兼容 true/false、1/0、yes/no 等常见接口返回。
 */
function normalizeBoolean(value) {
	if (typeof value === 'string') {
		return ['1', 'true', 'yes', 'y'].includes(value.toLowerCase())
	}

	return Boolean(value)
}

/**
 * 用新的登录对象整体替换响应式状态，同时清理上一次残留的扩展字段。
 */
function replaceLoginSessionState(nextState) {
	const nextKeys = new Set(Object.keys(nextState))

	Object.keys(loginSessionState).forEach((key) => {
		if (!nextKeys.has(key)) {
			delete loginSessionState[key]
		}
	})

	Object.assign(loginSessionState, nextState)
}

/**
 * 首次使用时从本地 storage 恢复登录态；若已过期则自动清除本地缓存。
 */
function ensureLoginSessionHydrated() {
	if (loginSessionHydrated) {
		return
	}

	loginSessionHydrated = true
	const storedSession = readLoginSessionFromStorage()
	if (!storedSession) {
		return
	}

	if (isLoginSessionExpired(storedSession)) {
		removeLoginSessionFromStorage()
		return
	}

	replaceLoginSessionState(storedSession)
}

/**
 * 从本地 storage 读取登录对象。
 * 使用场景：应用冷启动、刷新后恢复登录态。
 */
function readLoginSessionFromStorage() {
	if (typeof uni === 'undefined' || typeof uni.getStorageSync !== 'function') {
		return null
	}

	try {
		const raw = uni.getStorageSync(LOGIN_SESSION_STORAGE_KEY)
		if (!raw) {
			return null
		}

		const parsed = JSON.parse(raw)
		if (!parsed || typeof parsed !== 'object') {
			return null
		}

		return normalizeLoginSession(parsed)
	} catch (error) {
		console.error('[LoginSession] 读取失败:', error)
		return null
	}
}

/**
 * 将当前登录对象持久化到本地 storage。
 * 使用场景：登录成功、刷新 token、更新昵称头像后同步缓存。
 */
function writeLoginSessionToStorage(loginInfo) {
	if (typeof uni === 'undefined' || typeof uni.setStorageSync !== 'function') {
		return
	}

	try {
		uni.setStorageSync(LOGIN_SESSION_STORAGE_KEY, JSON.stringify(loginInfo))
	} catch (error) {
		console.error('[LoginSession] 写入失败:', error)
	}
}

/**
 * 删除本地登录缓存。
 * 使用场景：主动退出登录、登录信息失效、切换账号。
 */
function removeLoginSessionFromStorage() {
	if (typeof uni === 'undefined' || typeof uni.removeStorageSync !== 'function') {
		return
	}

	try {
		uni.removeStorageSync(LOGIN_SESSION_STORAGE_KEY)
	} catch (error) {
		console.error('[LoginSession] 删除失败:', error)
	}
}

/**
 * 统一抛出登录态事件，便于页面监听“登录成功 / 注销 / 登录对象变更”。
 */
function emitLoginSessionEvent(type, eventName) {
	if (typeof uni === 'undefined' || typeof uni.$emit !== 'function') {
		return
	}

	uni.$emit(eventName, {
		type,
		loginInfo: getCurrentLoginInfo()
	})
}

/**
 * 构建一个安全的页面地址，确保以 / 开头，方便后续拼接 query 和跳转。
 */
function normalizePageUrl(url = '') {
	const value = normalizeString(url).trim()
	if (!value) {
		return ''
	}

	return value.startsWith('/') ? value : `/${value}`
}

/**
 * 将 query 对象拼接到 url 上，统一给登录跳转和登录后回跳使用。
 */
function appendQueryToUrl(url, query = {}) {
	const normalizedUrl = normalizePageUrl(url)
	if (!normalizedUrl) {
		return ''
	}

	const queryEntries = Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '')
	if (!queryEntries.length) {
		return normalizedUrl
	}

	const queryString = queryEntries
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
		.join('&')

	return `${normalizedUrl}${normalizedUrl.includes('?') ? '&' : '?'}${queryString}`
}

/**
 * 从当前页面栈拼出完整页面地址，用作“登录后回原页”的 redirect 参数。
 */
function getCurrentPageUrl() {
	if (typeof getCurrentPages !== 'function') {
		return ''
	}

	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	if (!currentPage?.route) {
		return ''
	}

	return appendQueryToUrl(currentPage.route, currentPage.options || {})
}

/**
 * 解析登录页上的 redirect 参数。
 */
export function resolveLoginRedirect(redirect) {
	const rawValue = normalizeString(redirect)
	if (!rawValue) {
		return ''
	}

	try {
		return normalizePageUrl(decodeURIComponent(rawValue))
	} catch (error) {
		return normalizePageUrl(rawValue)
	}
}

/**
 * 构建登录页地址，并把当前目标页编码为 redirect 参数。
 */
export function buildLoginPageUrl(options = {}) {
	const { redirect = '', url = LOGIN_PAGE_URL, autoCurrentRedirect = true } = options
	const resolvedRedirect = resolveLoginRedirect(redirect) || (autoCurrentRedirect ? getCurrentPageUrl() : '')
	if (!resolvedRedirect || resolvedRedirect === normalizePageUrl(url)) {
		return normalizePageUrl(url)
	}

	return appendQueryToUrl(url, {
		[LOGIN_REDIRECT_QUERY_KEY]: resolvedRedirect
	})
}

/**
 * 读取当前登录页携带的 redirect 参数。
 * 使用场景：登录成功后回原页、登录页继续跳手机号登录页时透传 redirect。
 */
export function getLoginRedirectFromCurrentPage() {
	if (typeof getCurrentPages !== 'function') {
		return ''
	}

	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	return resolveLoginRedirect(currentPage?.options?.[LOGIN_REDIRECT_QUERY_KEY])
}

/**
 * 统一执行 UniApp 页面跳转。
 */
function navigateByMethod({ method = 'navigateTo', url = '' }) {
	const normalizedUrl = normalizePageUrl(url)
	if (!normalizedUrl || typeof uni === 'undefined') {
		return
	}

	const navigateMethod = uni[method]
	if (typeof navigateMethod !== 'function') {
		return
	}

	navigateMethod({
		url: normalizedUrl
	})
}

/**
 * 保存登录信息。
 *
 * 使用方式：
 * ```js
 * saveLoginInfo({
 *   token,
 *   expireMs,
 *   nickname,
 *   userNo,
 *   avatar,
 *   liveAuth,
 *   shopAuth
 * })
 * ```
 */
export function saveLoginInfo(payload = {}) {
	ensureLoginSessionHydrated()
	const nextLoginInfo = normalizeLoginSession(payload)
	replaceLoginSessionState(nextLoginInfo)
	writeLoginSessionToStorage(nextLoginInfo)
	emitLoginSessionEvent('save', LOGIN_SESSION_CHANGED_EVENT)
	emitLoginSessionEvent('save', LOGIN_SESSION_SAVED_EVENT)
	return getCurrentLoginInfo()
}

/**
 * 局部更新登录信息。
 *
 * 使用方式：
 * ```js
 * updateLoginInfo({
 *   token: 'new-token',
 *   expireMs: Date.now() + 3600 * 1000
 * })
 * ```
 *
 * 适用场景：刷新 token、补充 userNo、更新昵称头像、修正权限字段。
 */
export function updateLoginInfo(payload = {}) {
	ensureLoginSessionHydrated()
	const nextLoginInfo = normalizeLoginSession({
		...loginSessionState,
		...(payload && typeof payload === 'object' ? payload : {})
	})
	replaceLoginSessionState(nextLoginInfo)
	writeLoginSessionToStorage(nextLoginInfo)
	emitLoginSessionEvent('save', LOGIN_SESSION_CHANGED_EVENT)
	emitLoginSessionEvent('save', LOGIN_SESSION_SAVED_EVENT)
	return getCurrentLoginInfo()
}

/**
 * 清空登录信息，但不做页面跳转。
 *
 * 使用方式：
 * ```js
 * clearLoginInfo()
 * ```
 */
export function clearLoginInfo() {
	ensureLoginSessionHydrated()
	replaceLoginSessionState(createDefaultLoginSession())
	removeLoginSessionFromStorage()
	emitLoginSessionEvent('clear', LOGIN_SESSION_CHANGED_EVENT)
	emitLoginSessionEvent('clear', LOGIN_SESSION_CLEARED_EVENT)
	return getCurrentLoginInfo()
}

/**
 * 获取当前登录信息快照。
 *
 * 使用方式：
 * ```js
 * const loginInfo = getCurrentLoginInfo()
 * ```
 */
export function getCurrentLoginInfo() {
	ensureLoginSessionHydrated()
	if (loginSessionState.token && isLoginSessionExpired(loginSessionState)) {
		clearLoginInfo()
	}
	return JSON.parse(JSON.stringify(loginSessionState))
}

/**
 * 获取当前登录信息。
 * 这是 getCurrentLoginInfo 的语义化别名，便于业务按“查询登录态”理解使用。
 */
export function getLoginInfo() {
	return getCurrentLoginInfo()
}

/**
 * 判断登录是否过期。
 *
 * 使用方式：
 * ```js
 * const expired = isLoginSessionExpired(loginInfo)
 * ```
 */
export function isLoginSessionExpired(loginInfo = loginSessionState) {
	const expireMs = Number(loginInfo?.expireMs || 0)
	if (!expireMs) {
		return false
	}

	return expireMs <= Date.now()
}

/**
 * 判断当前是否持有一个有效登录态。
 * 与只判断 token 不同，这里会同时校验过期时间。
 */
export function hasValidLoginSession() {
	const loginInfo = getCurrentLoginInfo()
	return Boolean(loginInfo.token) && !isLoginSessionExpired(loginInfo)
}

/**
 * 监听页面级“任意登录态变化”事件。
 *
 * 使用方式：
 * ```js
 * const off = onLoginSessionChanged(({ type, loginInfo }) => {})
 * onUnmounted(off)
 * ```
 */
export function onLoginSessionChanged(handler) {
	return bindLoginSessionEvent(LOGIN_SESSION_CHANGED_EVENT, handler)
}

/**
 * 监听“登录信息已保存”事件。
 */
export function onLoginSessionSaved(handler) {
	return bindLoginSessionEvent(LOGIN_SESSION_SAVED_EVENT, handler)
}

/**
 * 监听“登录信息已清空”事件。
 */
export function onLoginSessionCleared(handler) {
	return bindLoginSessionEvent(LOGIN_SESSION_CLEARED_EVENT, handler)
}

/**
 * 统一绑定 / 解绑 uni 全局事件，返回 off 函数给页面在卸载时清理。
 */
function bindLoginSessionEvent(eventName, handler) {
	if (typeof handler !== 'function' || typeof uni === 'undefined' || typeof uni.$on !== 'function') {
		return () => {}
	}

	uni.$on(eventName, handler)
	return () => {
		if (typeof uni.$off === 'function') {
			uni.$off(eventName, handler)
		}
	}
}

/**
 * 未登录时跳转到登录页，并带上当前页 redirect 参数。
 *
 * 使用方式：
 * ```js
 * navigateToLogin()
 * navigateToLogin({ redirect: '/pages/user/note-detail?id=1' })
 * ```
 */
export function navigateToLogin(options = {}) {
	const { method = 'navigateTo', redirect = '', url = LOGIN_PAGE_URL, autoCurrentRedirect = true } = options
	const loginUrl = buildLoginPageUrl({
		redirect,
		url,
		autoCurrentRedirect
	})
	navigateByMethod({
		method,
		url: loginUrl
	})
	return loginUrl
}

/**
 * 登录成功后回跳到原始业务页面；如果没有 redirect，就回首页。
 *
 * 使用方式：
 * ```js
 * redirectAfterLogin({ redirect })
 * ```
 */
export function redirectAfterLogin(options = {}) {
	const { redirect = '', fallbackUrl = LOGIN_HOME_URL, method = 'reLaunch' } = options
	const targetUrl = resolveLoginRedirect(redirect) || normalizePageUrl(fallbackUrl)
	navigateByMethod({
		method,
		url: targetUrl
	})
	return targetUrl
}

/**
 * 进入需要登录的页面前做统一校验。
 * 社交 APP 常见做法是：未登录或登录过期时立即跳转登录页，并在登录成功后回原页。
 *
 * 使用方式：
 * ```js
 * const loginInfo = requireLogin()
 * if (!loginInfo) {
 *   return
 * }
 * ```
 */
export function requireLogin(options = {}) {
	const { redirect = '', loginUrl = LOGIN_PAGE_URL, method = 'navigateTo' } = options
	const loginInfo = getCurrentLoginInfo()
	if (loginInfo.token && !isLoginSessionExpired(loginInfo)) {
		return loginInfo
	}

	navigateToLogin({
		method,
		redirect,
		url: loginUrl
	})
	return null
}

/**
 * 注销并跳转到登录页。
 *
 * 使用方式：
 * ```js
 * logoutToLogin()
 * ```
 *
 * @param {Object} options
 * @param {string} options.url 登录页地址，默认 /pages/login/login
 */
export function logoutToLogin(options = {}) {
	const { url = LOGIN_PAGE_URL, method = 'reLaunch' } = options
	clearLoginInfo()
	navigateToLogin({
		method,
		url,
		autoCurrentRedirect: false
	})
	return getCurrentLoginInfo()
}

/**
 * setup 场景的统一登录态入口。
 * 返回响应式登录对象、是否已登录、保存/清空/注销/查询方法和事件订阅方法。
 */
export function useLoginSession() {
	ensureLoginSessionHydrated()

	return {
		loginInfo: readonlyLoginSession,
		isLoggedIn: computed(() => hasValidLoginSession()),
		saveLoginInfo,
		updateLoginInfo,
		clearLoginInfo,
		logoutToLogin,
		getLoginInfo,
		getCurrentLoginInfo,
		hasValidLoginSession,
		navigateToLogin,
		redirectAfterLogin,
		requireLogin,
		buildLoginPageUrl,
		resolveLoginRedirect,
		getLoginRedirectFromCurrentPage,
		onLoginSessionChanged,
		onLoginSessionSaved,
		onLoginSessionCleared
	}
}

/**
 * 挂到全局属性后可直接通过 this.$loginInfo / this.$saveLoginInfo 使用。
 * setup 场景建议继续通过 useLoginSession() 获取响应式状态和方法。
 */
export function installGlobalLoginSession(app) {
	ensureLoginSessionHydrated()

	if (!app?.config?.globalProperties) {
		return
	}

	app.config.globalProperties.$loginInfo = readonlyLoginSession
	app.config.globalProperties.$getLoginInfo = getLoginInfo
	app.config.globalProperties.$getCurrentLoginInfo = getCurrentLoginInfo
	app.config.globalProperties.$hasValidLoginSession = hasValidLoginSession
	app.config.globalProperties.$saveLoginInfo = saveLoginInfo
	app.config.globalProperties.$updateLoginInfo = updateLoginInfo
	app.config.globalProperties.$clearLoginInfo = clearLoginInfo
	app.config.globalProperties.$logoutToLogin = logoutToLogin
	app.config.globalProperties.$navigateToLogin = navigateToLogin
	app.config.globalProperties.$redirectAfterLogin = redirectAfterLogin
	app.config.globalProperties.$requireLogin = requireLogin
	app.config.globalProperties.$getLoginRedirectFromCurrentPage = getLoginRedirectFromCurrentPage
}
