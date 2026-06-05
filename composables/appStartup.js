/**
 * appStartup — 全局启动器
 *
 * 连接 GLOBAL_TASKS 配置与 appTask 引擎
 * 暴露统一的 startAll / stopAll 给业务层
 *
 * ── 使用 ──────────────────────────────────────────
 * import { startAll, stopAll } from '@/composables/appStartup.js'
 *
 * index.vue onShow:
 *   onShow(() => { startAll() })
 *
 * 登录页 onShow:
 *   onShow(() => { stopAll() })
 *
 * logoutToLogin():
 *   stopAll()
 */

import './GLOBAL_TASKS.js'
export { startAll, stopAll, createScope, once, schedule } from './appTask.js'
