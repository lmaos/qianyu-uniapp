/**
 * useWechatLogin — 微信登录
 *
 * 职责：
 *   1. 调用 uni.login() 获取微信授权 code
 *   2. 将 code 传给服务端 /api/user/login/social 换取 token + userInfo
 *
 * ── 使用 ──────────────────────────────────────────
 * import { getWechatCode, wechatLogin } from '@/composables/useWechatLogin.js'
 *
 * async function onLogin() {
 *   const code = await getWechatCode()
 *   const { token, userInfo } = await wechatLogin(code)
 *   saveLoginInfo({ token, ...userInfo })
 *   redirectAfterLogin()
 * }
 *
 * ── 对应服务端 API ────────────────────────────────
 * POST /api/user/login/social
 *   { platform: "WECHAT", code: "xxx" }
 * → { token, userInfo: { userNo, userId, nickname, avatar, ... } }
 *
 * ── 边界处理 ──────────────────────────────────────
 * - 未安装微信 / 非 APP 环境 → 抛出可读错误
 * - 用户取消授权 → 静默返回 null
 * - API 超时/服务端异常 → 抛出，由调用方决定是否 toast
 */

import request from '@/composables/baseRequest.js'
import { env } from '@/config/env.js'

/**
 * 调用 uni.login 获取微信授权 code
 *
 * @returns {Promise<string|null>} code — null 表示用户主动取消
 * @throws {Error} 平台不支持 / 微信未安装
 */
export async function getWechatCode() {
	const wechatConfig = env?.wechat
	if (!wechatConfig?.appId) {
		console.warn('[useWechatLogin] config/env.js 未配置 wechat.appId，微信登录不可用')
		throw new Error('微信登录暂未配置，请联系管理员')
	}

	// #ifdef APP
	try {
		const result = await uni.login({
			provider: 'wechat'
		})
		if (result.code) {
			return result.code
		}
		// errMsg 可能包含 "cancel" 表示用户取消
		if (result.errMsg && result.errMsg.includes('cancel')) {
			return null
		}
		throw new Error(result.errMsg || '微信授权失败')
	} catch (err) {
		// uni.login 内部可能抛异常，这里统一转成可读错误
		const message = typeof err === 'string' ? err : (err.errMsg || err.message || '')
		if (message.includes('cancel') || message.includes('取消')) {
			return null
		}
		if (message.includes('uninstalled') || message.includes('未安装') || message.includes('not install')) {
			throw new Error('请先安装微信客户端')
		}
		throw new Error(message || '微信授权失败')
	}
	// #endif

	// #ifndef APP
	// H5 / 小程序等非 APP 环境，微信登录走不同路径
	console.warn('[useWechatLogin] 非 APP 环境，uni.login(provider: wechat) 不可用')
	throw new Error('请在 APP 中使用微信登录')
	// #endif
}

/**
 * 携带微信 code 请求服务端登录/注册
 *
 * @param {string} code — 微信授权 code（一次有效）
 * @returns {Promise<{token: string, userInfo: Object}>}
 *   token  — RSA 签名的登录令牌
 *   userInfo — UserInfoVo（含 userNo, userId, nickname, avatar 等）
 * @throws {Error} API 错误
 */
export async function wechatLogin(code) {
	if (!code) {
		throw new Error('微信授权 code 为空')
	}

	const res = await request.post({
		url: '/api/user/login/social',
		type: 'json',
		data: {
			platform: 'WECHAT',
			code
		}
	})

	// HTTP 层面失败 — baseRequest 已 toast
	if (res.code !== 200) {
		throw new Error('登录失败')
	}

	// 业务层面失败
	if (res.response && Number(res.response.status) !== 0) {
		throw new Error(res.response.message || '登录失败')
	}

	const { token, userInfo } = res.response.content

	if (!token || !userInfo) {
		throw new Error('登录响应数据异常')
	}

	return { token, userInfo }
}

/**
 * 微信登录完整流程（一键调用）
 *
 * 适合不需要中途干涉的场景，一步到位。
 * 如需自定义错误处理（如用户取消不弹 toast），请分别调用 getWechatCode / wechatLogin。
 *
 * @returns {Promise<{token: string, userInfo: Object}|null>}
 *   null — 用户取消授权
 * @throws {Error} 流程中的任何异常
 */
export async function wechatLoginFull() {
	const code = await getWechatCode()
	if (!code) {
		return null // 用户取消
	}
	return await wechatLogin(code)
}
