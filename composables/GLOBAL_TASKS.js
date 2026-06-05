/**
 * GLOBAL_TASKS — 全局定时任务配置
 *
 * 在这里写：schedule(fn, delay, init)
 * 不去关心引擎内部实现。
 *
 * ── 规则 ──────────────────────────────────────────
 * - 在 startAll() 时注册启动
 * - run() 返回 false 时只执行一次并移除
 * - 进入登录页 / 退出登录时 stopAll() 全部停止
 * - 不允许业务层动态注册全局任务
 */

import { schedule,once } from './appTask.js'

// 1s 定时器 — 测试用
schedule(() => {
  console.log('[appTask] 30s 定时器执行', Date.now())
}, 30000, 0)
