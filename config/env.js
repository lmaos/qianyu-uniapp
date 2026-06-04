/**
 * 环境配置
 *
 * 切换环境：只改 APP_ENV 的值
 *
 * ── 使用 ──
 * import { env,APP_ENV } from '@/config/env'
 */

// ══════════════════════════════════════════════════════════
//  环境选择（切这里）； -> import { env, APP_ENV } from '@/config/env'
// ══════════════════════════════════════════════════════════
export const APP_ENV = 'dev'   // 'dev' | 'prod'

const GLOBAL = {
	timeout: 30000,
	uploadTimeout: 120000,
	debug: false,
}

const ENV_MAP = {
	// 开发环境, ifdef APP 代表在APP中使用这个环境， ifndef 代表不是APP时候使用的环境
	dev: {
		...GLOBAL,
		debug: true,
		// #ifdef APP
		baseURL: 'http://192.168.0.103:8080',
		// #endif
		// #ifndef APP
		baseURL: 'http://127.0.0.1:8080',
		// #endif
	},
	// 生产环境
	prod: {
		...GLOBAL,
		baseURL: 'https://qianyu-api.clmcat.com',
	}
}

/** 当前环境完整配置对象 */
export const env = ENV_MAP[APP_ENV]
