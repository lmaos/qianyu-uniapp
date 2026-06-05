/**
 * appTask — 全局定时任务引擎
 *
 * ── 设计 ──────────────────────────────────────────
 * 1. 每个任务由 schedule(fn, delay, init) 注册
 * 2. 底层递归 setTimeout，不用 setInterval
 * 3. 每次 run() 结束后才安排下一次，不堆积
 * 4. 状态标志（active）防止 stop 后 run() 还在执行却又重新注册
 * 5. 组件级 scope 隔离，模块卸载时自动清理
 *
 * ── 使用 ──────────────────────────────────────────
 * 配置层（GLOBAL_TASKS.js）：
 *   import { schedule } from './appTask.js'
 *   schedule(() => sendHeartbeat(), 30000, 0)
 *
 * 启动层（appStartup.js）：
 *   import './GLOBAL_TASKS.js'
 *   export { startAll, stopAll, createScope } from './appTask.js'
 *
 * 页面：
 *   import { startAll } from '@/composables/appStartup.js'
 *   onShow(() => startAll(getCurrentLoginInfo().userId))
 */

// ── 内部状态 ──────────────────────────────────────
const MAX_TASKS = 100
const _tasks = {}
let _nextId = 0
let _running = false
/** 启动时的上下文（如 userId），context 变化时自动重启 */
let _currentContext = undefined

// ── 注册 ──────────────────────────────────────────

/**
 * 注册一个定时任务（直接有副作用的注册，不是纯工厂）
 *
 * @param {Function} run    - 执行函数，如果返回 false 则不再继续执行
 * @param {number}   delay  - 执行间隔（ms）
 * @param {number}   [init] - 首次执行的延迟（ms），默认等于 delay
 * @returns {string} taskId - 任务 ID，可用于手动 stop(id)
 */
export function schedule(run, delay, init) {
	if (typeof run !== 'function') {
		console.error('[appTask] schedule 需要一个函数作为第一个参数')
		return ''
	}

	const id = `task_${_nextId++}`
	const taskDelay = Number(delay) || 0
	const taskInit = init !== undefined ? Number(init) : taskDelay

	_tasks[id] = {
		id,
		active: false,
		timerId: null,
		run,
		delay: taskDelay,
		init: taskInit,
	}

	if (Object.keys(_tasks).length > MAX_TASKS) {
		console.warn(`[appTask] 任务数超过 ${MAX_TASKS}，请检查是否泄漏`)
	}

	return id
}

/**
 * 注册一个只执行一次的任务
 * 自动包装 return false，即使 run() 抛出异常也确保不重复执行
 *
 * @param {Function} run   - 执行函数，返回 Promise 也等待完成
 * @param {number}   delay - 延迟（ms），多久后执行
 * @returns {string} taskId
 *
 * ── 使用 ──────────────────────────────────────────
 * once(() => showGuide(), 5000)
 * once(async () => await fetchNotice(), 3000)
 */
export function once(run, delay) {
	if (typeof run !== 'function') {
		console.error('[appTask] once 需要一个函数作为第一个参数')
		return ''
	}

	const wrapped = async () => {
		try {
			await run()
		} catch (e) {
			console.error('[appTask] once 执行异常', e)
		}
		return false // 确保只执行一次
	}

	return schedule(wrapped, delay, delay)
}

/**
 * 移除一个已注册的任务（从源头上移除，后续 startAll 不会再启动）
 * @param {string} id
 */
export function remove(id) {
	if (!_tasks[id]) return
	stop(id)
	delete _tasks[id]
}

// ── 启停 ──────────────────────────────────────────

/**
 * 启动所有已注册的任务。
 *
 * @param {*} [context] - 启动上下文（如 userId）。
 *   传 undefined 表示不关心身份一致性。
 *   幂等：同一 context 反复调用不重复启动；
 *   context 变化时自动 stop + restart。
 */
export function startAll(context) {
	// context 变化 → 身份变了，重启
	if (_running && context !== undefined && context !== _currentContext) {
		console.log('[appTask] context 变化，重启所有任务, old:', _currentContext, 'new:', context)
		stopAll()
	}

	if (_running) {
		console.log('[appTask] 已在运行，跳过重复启动')
		return
	}

	_currentContext = context
	_running = true
	console.log('[appTask] startAll')

	for (const id in _tasks) {
		startTask(id)
	}
}

/**
 * 停止所有任务
 * 标志位置 false，防止 run() 完成后重新注册
 */
export function stopAll() {
	if (!_running) return
	_running = false
	_currentContext = undefined
	console.log('[appTask] stopAll')

	for (const id in _tasks) {
		stop(id)
	}
}

/**
 * 停止单个任务
 * @param {string} id
 */
export function stop(id) {
	const task = _tasks[id]
	if (!task) return
	if (task.timerId !== null) {
		clearTimeout(task.timerId)
		task.timerId = null
	}
	task.active = false
}

// ── 内部 ──────────────────────────────────────────

function startTask(id) {
	const task = _tasks[id]
	if (!task) {
		console.warn(`[appTask] 任务 ${id} 不存在`)
		return
	}
	if (task.active) return

	task.active = true
	const delay = task.init !== undefined ? task.init : task.delay
	task.timerId = setTimeout(() => tick(id), delay)
}

async function tick(id) {
	// ★ 外层 try-catch：防止任何意外异常搞崩调度循环
	try {
		const task = _tasks[id]
		// 核心检查：stop 后直接放弃后续执行
		if (!task || !task.active || !_running) {
			if (task) task.active = false
			return
		}

		const result = await task.run()
		// run 返回 false → 只执行一次，不再继续
		if (result === false) {
			task.active = false
			if (task.timerId !== null) {
				clearTimeout(task.timerId)
				task.timerId = null
			}
			return
		}

		// ★ 再次检查 — 在 run() 执行期间可能已被 stop
		if (!task.active || !_running) {
			task.active = false
			return
		}

		task.timerId = setTimeout(() => tick(id), task.delay)
	} catch (e) {
		// 兜底：任何未捕获的异常（含 run 内部）都不中断调度
		console.error(`[appTask] tick ${id} 异常`, e)
		// 尝试继续调度
		const task = _tasks[id]
		if (task && _running) {
			task.active = true
			task.timerId = setTimeout(() => tick(id), task.delay || 30000)
		}
	}
}

// ── 作用域（组件级别）────────────────────────────

let _scopeId = 0

/**
 * 创建一个组件级作用域，用于管理该组件的定时任务
 *
 * 使用方式：
 *   // 方式一：传 onUnmounted，自动绑定清理（推荐）
 *   const scope = createScope(onUnmounted)
 *   onMounted(() => { scope.schedule(fn, 3000) })
 *
 *   // 方式二：不传，自己手动管理
 *   const scope = createScope()
 *   onUnmounted(() => { scope.destroy() })
 *
 * scope 提供的方法（全部自动在 destroy() 时清理）：
 *   - schedule(fn, delay, init)  — 循环执行
 *   - once(fn, delay)            — 只执行一次，即使异常也不重复
 *   - setTimeout(fn, delay)      — 同 once
 *   - setInterval(fn, delay)     — 同 schedule(fn, delay, delay)
 *
 * @param {Function} [onUnmounted] - Vue 的 onUnmounted，传入后自动绑定 destroy
 * @returns {{ schedule: Function, once: Function, setTimeout: Function, setInterval: Function, destroy: Function, id: string }}
 */
export function createScope(onUnmounted) {
	const scopeId = `scope_${_scopeId++}`
	const taskIds = []

	function destroy() {
		for (const id of taskIds) {
			stop(id)
			delete _tasks[id]
		}
		taskIds.length = 0
	}

	// 如果传了 onUnmounted，自动绑定清理
	if (typeof onUnmounted === 'function') {
		onUnmounted(destroy)
	}

	function schedule(run, delay, init) {
		const id = `_${scopeId}_${taskIds.length}`
		const taskDelay = Number(delay) || 0
		const taskInit = init !== undefined ? Number(init) : taskDelay

		_tasks[id] = {
			id,
			active: false,
			timerId: null,
			run,
			delay: taskDelay,
			init: taskInit,
		}
		taskIds.push(id)

		// 如果 _running，立即启动
		if (_running) {
			startTask(id)
		}

		return id
	}

	function once(run, delay) {
		if (typeof run !== 'function') {
			console.error('[appTask] scope.once 需要一个函数作为第一个参数')
			return ''
		}
		const wrapped = async () => {
			try { await run() }
			catch (e) { console.error('[appTask] scope.once 执行异常', e) }
			return false
		}
		return schedule(wrapped, delay, delay)
	}

	function setTimeout(run, delay) {
		return once(run, delay)
	}

	function setInterval(run, delay) {
		return schedule(run, delay, delay)
	}

	return { schedule, once, setTimeout, setInterval, destroy, id: scopeId }
}
