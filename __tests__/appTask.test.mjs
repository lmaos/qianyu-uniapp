/**
 * appTask 单元测试
 *
 * 运行: node __tests__/appTask.test.mjs
 */

import assert from 'node:assert/strict'
import { setTimeout as sleep } from 'node:timers/promises'

// ── 动态 import appTask（.js 属于 ES module，package.json 声明了 type: module） ──

let schedule, startAll, stopAll, once, remove, createScope, scheduleMod

async function loadAppTask() {
	const mod = await import('../composables/appTask.js')
	schedule = mod.schedule
	startAll = mod.startAll
	stopAll = mod.stopAll
	once = mod.once
	remove = mod.remove
	createScope = mod.createScope
	scheduleMod = mod
}

// ── 测试工具 ───────────────────────────────────────

let testPassed = 0
let testFailed = 0
let activeTaskIds = []

async function test(name, fn) {
	try {
		await fn()
		console.log(`  ✓ ${name}`)
		testPassed++
	} catch (err) {
		console.log(`  ✗ ${name}: ${err.message}`)
		testFailed++
	} finally {
		// 清理本测试注册的任务
		for (const id of activeTaskIds) {
			remove(id)
		}
		activeTaskIds = []
	}
}

function suite(name) {
	console.log(`\n  ═══ ${name} ═══`)
}

function sid(id) {
	activeTaskIds.push(id)
	return id
}

// ── 测试套件 ───────────────────────────────────────

async function runBasicScheduleSuite() {
	suite('1. schedule + startAll — 基本启动')

	await test('schedule 注册后 startAll 会执行任务', async () => {
		stopAll()
		let called = false
		const id = sid(schedule(() => { called = true }, 100, 0))
		startAll()
		await sleep(50)
		assert.equal(called, true, '任务应被调用')
	})

	await test('startAll 幂等 — 同一 context 不重复启动', async () => {
		stopAll()
		let count = 0
		const id = sid(schedule(() => { count++ }, 80, 0))
		startAll('ctx1')
		await sleep(30)
		startAll('ctx1') // 同一 context，应跳过
		await sleep(30)
		stopAll()
		// 两次 startAll 但只启动一次，count 应 = 1（init=0 立即执行）
		// 注意：90ms 内应该只有第一次 init=0 的那一次
		assert.equal(count, 1, '同一 context 不应重复启动')
	})

	await test('context 变化时自动重启', async () => {
		stopAll()
		let count = 0
		const id = sid(schedule(() => { count++ }, 200, 0))
		startAll('user1')
		await sleep(30)
		startAll('user2') // context 变了 → stop + restart
		await sleep(30)
		stopAll()
		// 第一次 startAll 执行一次（init=0），第二次 context 变化再执行一次（init=0）
		assert.equal(count, 2, '两轮 startAll 各执行一次')
	})
}

async function runStopSuite() {
	suite('2. stopAll — 停止')

	await test('stopAll 后任务不再执行', async () => {
		stopAll()
		let count = 0
		const id = sid(schedule(() => { count++ }, 50, 0))
		startAll()
		await sleep(60)
		stopAll()
		const beforePause = count
		await sleep(120)
		assert.equal(count, beforePause, 'stop 后任务不应继续执行')
	})
}

async function runOnceSuite() {
	suite('3. once — 一次性任务')

	await test('once 只执行一次', async () => {
		stopAll()
		let count = 0
		const id = sid(once(() => { count++ }, 30))
		startAll()
		await sleep(60)
		stopAll()
		assert.equal(count, 1, '一次性任务只执行一次')
	})

	await test('once 内部异常不崩溃，也不重复执行', async () => {
		stopAll()
		let count = 0
		const id = sid(once(() => {
			count++
			throw new Error('测试异常')
		}, 30))
		startAll()
		await sleep(60)
		stopAll()
		assert.equal(count, 1, 'once 即使异常也只执行一次')
	})
}

async function runReturnFalseSuite() {
	suite('4. return false — 手动停止')

	await test('schedule 中 return false 后不再执行', async () => {
		stopAll()
		let count = 0
		const id = sid(schedule(() => {
			count++
			return false
		}, 50, 0))
		startAll()
		await sleep(100)
		stopAll()
		assert.equal(count, 1, 'return false 只执行一次')
	})

	await test('schedule 执行次数在 return false 后不再增长', async () => {
		stopAll()
		const calls = []
		const id = sid(schedule(() => {
			calls.push(Date.now())
			return false
		}, 50, 0))
		startAll()
		await sleep(30)
		// 已执行一次（init=0）
		await sleep(100) // 足够第二个周期
		stopAll()
		assert.equal(calls.length, 1, 'return false 后第二个周期不再执行')
	})
}

async function runRemoveSuite() {
	suite('5. remove — 移除任务')

	await test('remove 后 startAll 不再启动该任务', async () => {
		stopAll()
		let called = false
		const id = sid(schedule(() => { called = true }, 50, 0))
		// 注册后立即移除
		remove(id)
		startAll()
		await sleep(80)
		stopAll()
		assert.equal(called, false, '移除后的任务不应被执行')
	})
}

async function runScopeSuite() {
	suite('6. createScope — 作用域')

	await test('scope.destroy 清理所有定时任务', async () => {
		stopAll()
		const scope = createScope()
		let count = 0
		scope.schedule(() => { count++ }, 50, 0)
		startAll()
		await sleep(60)
		scope.destroy()
		const beforeDestroy = count
		await sleep(100)
		stopAll()
		assert.equal(count, beforeDestroy, 'destroy 后任务应停止')
	})

	await test('scope.once 只执行一次且受 destroy 管理', async () => {
		stopAll()
		const scope = createScope()
		let count = 0
		scope.once(() => { count++ }, 30)
		startAll()
		await sleep(60)
		scope.destroy()
		assert.equal(count, 1, 'scope.once 只执行一次')
	})

	await test('createScope(onUnmounted) 自动绑定 destroy', async () => {
		stopAll()
		let registeredFn = null
		function mockOnUnmounted(fn) {
			registeredFn = fn
		}
		const scope = createScope(mockOnUnmounted)
		assert.equal(typeof registeredFn, 'function', 'onUnmounted 应收到 destroy 函数')

		// 验证注册的 destroy 函数确实能清理
		let count = 0
		scope.schedule(() => { count++ }, 50, 0)
		startAll()
		await sleep(60)
		// 手动调用注册的清理函数（模拟组件卸载）
		registeredFn()
		const beforeDestroy = count
		await sleep(100)
		stopAll()
		assert.equal(count, beforeDestroy, 'onUnmounted 注册的 destroy 应能停止任务')
	})

	await test('多个 createScope 各自独立清理', async () => {
		stopAll()
		const scope1 = createScope()
		const scope2 = createScope()
		let count1 = 0
		let count2 = 0
		scope1.schedule(() => { count1++ }, 50, 0)
		scope2.schedule(() => { count2++ }, 50, 0)
		startAll()
		await sleep(60)
		scope1.destroy()
		const count1AfterDestroy = count1
		const count2AfterDestroy = count2
		await sleep(100)
		stopAll()
		assert.equal(count1, count1AfterDestroy, 'scope1 destroy 后 count1 应不再增长')
		assert.ok(count2 > count2AfterDestroy, 'scope2 不应受 scope1 destroy 影响')
	})
}

async function runErrorHandlingSuite() {
	suite('7. 异常处理')

	await test('run 中抛出异常不影响后续调度', async () => {
		stopAll()
		let count = 0
		const id = sid(schedule(() => {
			count++
			if (count === 1) throw new Error('首次异常')
		}, 50, 0))
		startAll()
		await sleep(30)
		// 第一次执行，抛异常，但第二轮应继续
		await sleep(100)
		stopAll()
		assert.ok(count >= 2, '异常后调度应继续（count >= 2）')
	})

	await test('once 中抛出异常不崩溃', async () => {
		stopAll()
		let called = false
		const id = sid(once(() => {
			called = true
			throw new Error('once异常')
		}, 30))
		startAll()
		await sleep(80)
		stopAll()
		assert.equal(called, true, 'once 异常不应阻止执行')
	})
}

async function runAsyncTaskSuite() {
	suite('8. 异步任务')

	await test('异步 run 正常执行', async () => {
		stopAll()
		let resolved = false
		const id = sid(schedule(async () => {
			await sleep(20)
			resolved = true
		}, 50, 0))
		startAll()
		await sleep(40)
		stopAll()
		assert.equal(resolved, true, '异步任务应正常完成')
	})

	await test('异步 once 执行完成', async () => {
		stopAll()
		let resolved = false
		const id = sid(once(async () => {
			await sleep(20)
			resolved = true
		}, 30))
		startAll()
		await sleep(80)
		stopAll()
		assert.equal(resolved, true, '异步 once 应执行完成')
	})

	await test('异步任务返回 false 不再继续', async () => {
		stopAll()
		let count = 0
		const id = sid(schedule(async () => {
			count++
			return false
		}, 50, 0))
		startAll()
		await sleep(80)
		stopAll()
		assert.equal(count, 1, '异步任务返回 false 应只执行一次')
	})
}

async function runScheduleApiSuite() {
	suite('9. schedule API — init / delay 参数')

	await test('init 控制首次执行延迟', async () => {
		stopAll()
		let called = false
		const id = sid(schedule(() => { called = true }, 200, 0))
		startAll()
		await sleep(30)
		assert.equal(called, true, 'init=0 应立即执行')
		stopAll()
	})

	await test('init 大于 0 时延迟首次执行', async () => {
		stopAll()
		let called = false
		const id = sid(schedule(() => { called = true }, 200, 100))
		startAll()
		await sleep(30)
		assert.equal(called, false, 'init=100 时 30ms 内不应执行')
		await sleep(120)
		assert.equal(called, true, '超过 init 后应执行')
		stopAll()
	})
}

// ══════════════════════════════════════════════════════════
//  主入口
// ══════════════════════════════════════════════════════════

async function main() {
	console.log('\n  ╔═══════════════════════════════════════╗')
	console.log('  ║     appTask 测试套件                   ║')
	console.log('  ╚═══════════════════════════════════════╝')

	await loadAppTask()

	// 确保初始状态干净
	stopAll()

	await runBasicScheduleSuite()
	await runStopSuite()
	await runOnceSuite()
	await runReturnFalseSuite()
	await runRemoveSuite()
	await runScopeSuite()
	await runErrorHandlingSuite()
	await runAsyncTaskSuite()
	await runScheduleApiSuite()

	const total = testPassed + testFailed
	console.log(`\n  ─────────────────────────────────────────`)
	console.log(`  总计: ${total}  |  ✓ ${testPassed}  |  ✗ ${testFailed}`)
	if (testFailed > 0) {
		console.log('\n  有测试失败！\n')
		process.exit(1)
	}
	console.log('\n  全部通过 ✅\n')
}

main().catch((err) => {
	console.error('\n[test] 致命错误:', err)
	process.exit(1)
})
