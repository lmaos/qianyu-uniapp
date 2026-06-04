/**
 * useRequest 单元测试 + 集成测试
 *
 * 运行: node __tests__/useRequest.test.mjs
 */

import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SERVER_PORT = 18989
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const useRequestPath = path.resolve(__dirname, '../composables/useRequest.js')

// ── 测试服务器管理 ───────────────────────────────

let serverProcess = null

async function startServer() {
  serverProcess = spawn('python', ['test_server.py'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  for (let i = 0; i < 30; i++) {
    try {
      const r = await fetch(`${SERVER_URL}/api/echo`)
      if (r.ok) return
    } catch {}
    await sleep(200)
  }
  throw new Error('Server failed to start')
}

function stopServer() {
  if (serverProcess) { serverProcess.kill('SIGTERM'); serverProcess = null }
}

// ── Mock 工厂 ────────────────────────────────────

function createMockUni() {
  const calls = []
  const mock = {
    request(opts) {
      calls.push(opts)
      setTimeout(() => {
        const url = opts.url || ''
        if (url.includes('fail')) {
          opts.fail({ errMsg: 'mock network error' })
        } else {
          opts.success({
            statusCode: url.includes('403') ? 403 : url.includes('500') ? 500 : 200,
            data: url.includes('empty') ? '' : JSON.stringify({ ok: true, value: 42 }),
            errMsg: 'request:ok',
          })
        }
      }, 5)
    },
    uploadFile(opts) {
      calls.push(opts)
      setTimeout(() => {
        opts.success({
          statusCode: 200,
          data: JSON.stringify({ ok: true, url: 'https://cdn.test/file.jpg' }),
          errMsg: 'upload:ok',
        })
      }, 5)
    },
    lastCall: () => calls[calls.length - 1],
    callCount: () => calls.length,
    reset: () => { calls.length = 0 },
  }
  return mock
}

// ── 加载测试目标 ───────────────────────────────

async function loadUseRequest() {
  const mod = await import(/* webpackIgnore: true */ 'file:///' + useRequestPath.replace(/\\/g, '/'))
  return mod.useRequest
}

// ── 报告辅助 ─────────────────────────────────────

let testPassed = 0
let testFailed = 0
let useRequest = null

function suite(name) { console.log(`\n  ═══ ${name} ═══`) }

async function test(name, fn) {
  try {
    await fn()
    testPassed++
    console.log(`  ✓ ${name}`)
  } catch (err) {
    testFailed++
    console.log(`  ✗ ${name}`)
    console.log(`    ${err.message}`)
  }
}

// ══════════════════════════════════════════════════════════
//  单元测试
// ══════════════════════════════════════════════════════════

async function runUnitTests() {
  let mock = createMockUni()
  global.uni = mock

  suite('1. 基础方法')
  await test('返回 get/post/put/delete/fileUpload', () => {
    const api = useRequest({ baseURL: SERVER_URL })
    assert.equal(typeof api.get, 'function')
    assert.equal(typeof api.post, 'function')
    assert.equal(typeof api.put, 'function')
    assert.equal(typeof api.delete, 'function')
    assert.equal(typeof api.fileUpload, 'function')
  })

  suite('2. GET → data 拼 query string')
  await test('data 拼接为 ?key=val', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.get({ url: '/api/echo', data: { page: 1, size: 20 } })
    const c = mock.lastCall()
    assert.ok(c.url.includes('page=1'), `期望 page=1, 实际: ${c.url}`)
    assert.ok(c.url.includes('size=20'), `期望 size=20, 实际: ${c.url}`)
    assert.equal(c.method, 'GET')
    assert.equal(c.data, null)
  })
  await test('空 data 仅 path', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.get({ url: '/api/echo' })
    assert.equal(mock.lastCall().url, `${SERVER_URL}/api/echo`)
  })
  await test('已有 query 参数时用 & 追加', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.get({ url: '/api/echo?type=hot', data: { page: 2 } })
    const c = mock.lastCall()
    assert.ok(c.url.includes('type=hot&page=2'), `URL: ${c.url}`)
  })

  suite('3. POST → body')
  await test('type=json 自动序列化', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.post({ url: '/api/echo', type: 'json', data: { name: 'test' } })
    const c = mock.lastCall()
    assert.equal(c.method, 'POST')
    assert.equal(c.header['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(c.data), { name: 'test' })
  })
  await test('type=form URL 编码', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.post({ url: '/api/echo', type: 'form', data: { key: 'val', a: 'b' } })
    const c = mock.lastCall()
    assert.equal(c.header['Content-Type'], 'application/x-www-form-urlencoded')
    assert.ok(c.data.includes('key=val'))
    assert.ok(c.data.includes('a=b'))
  })

  suite('4. DELETE → JSON body')
  await test('DELETE 走 body 不是 query', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.delete({ url: '/api/echo', type: 'json', data: { ids: [1, 2, 3] } })
    const c = mock.lastCall()
    assert.equal(c.method, 'DELETE')
    assert.equal(c.header['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(c.data), { ids: [1, 2, 3] })
  })

  suite('5. 响应格式')
  await test('成功返回 {code:200, message:"", response}', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    const res = await api.get({ url: '/test' })
    assert.equal(res.code, 200)
    assert.equal(res.message, '')
    assert.equal(res.response.ok, true)
    assert.equal(res.response.value, 42)
  })
  await test('网络错误 code=0', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    const res = await api.get({ url: '/fail' })
    assert.equal(res.code, 0)
    assert.ok(res.message.includes('error') || res.message.includes('fail'))
    assert.equal(res.response, null)
  })
  await test('空响应串不报错', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    const res = await api.get({ url: '/empty' })
    assert.equal(typeof res.response, 'string')
  })
  await test('空 url 返回 code=-1', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    const res = await api.get({ url: '' })
    assert.equal(res.code, -1)
    assert.equal(mock.callCount(), 0) // 没发出请求
  })

  suite('6. 自定义 header')
  await test('opts.header 透传到请求', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.get({ url: '/test', header: { 'X-Device': 'ios', 'X-Version': '2' } })
    const c = mock.lastCall()
    assert.equal(c.header['X-Device'], 'ios')
    assert.equal(c.header['X-Version'], '2')
  })

  suite('7. 请求前拦截器')
  await test('追加 header', async () => {
    mock.reset()
    const api = useRequest({
      baseURL: SERVER_URL,
      requestInterceptors: [
        (cfg) => { cfg.header['X-Custom'] = 'intercepted'; return cfg },
      ],
    })
    await api.get({ url: '/test' })
    assert.equal(mock.lastCall().header['X-Custom'], 'intercepted')
  })
  await test('多个拦截器顺序执行', async () => {
    mock.reset()
    const api = useRequest({
      baseURL: SERVER_URL,
      requestInterceptors: [
        (c) => { c.header['A'] = '1'; return c },
        (c) => { c.header['B'] = '2'; return c },
      ],
    })
    await api.get({ url: '/test' })
    const h = mock.lastCall().header
    assert.equal(h['A'], '1')
    assert.equal(h['B'], '2')
  })

  suite('8. 响应后拦截器')
  await test('修改结果对象', async () => {
    mock.reset()
    const api = useRequest({
      baseURL: SERVER_URL,
      responseInterceptors: [(res) => ({ ...res, extra: true })],
    })
    const res = await api.get({ url: '/test' })
    assert.equal(res.extra, true)
  })

  suite('9. 序列化器扩展')
  await test('自定义序列化器', async () => {
    mock.reset()
    const api = useRequest({
      baseURL: SERVER_URL,
      serializers: {
        custom: (data) => `<<${JSON.stringify(data)}>>`,
      },
    })
    await api.post({ url: '/test', type: 'custom', data: { x: 1 } })
    assert.equal(mock.lastCall().data, '<<{"x":1}>>')
  })

  suite('10. Callback 模式')
  await test('提供 callback 时触发', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    const res = await new Promise((resolve) => {
      api.get({ url: '/test' }, (r) => resolve(r))
    })
    assert.equal(res.code, 200)
    assert.equal(res.response.ok, true)
  })

  suite('11. timeout 配置')
  await test('opts.timeout 透传', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.get({ url: '/test', timeout: 5000 })
    assert.equal(mock.lastCall().timeout, 5000)
  })
  await test('defaultTimeout 默认 30000', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.get({ url: '/test' })
    assert.equal(mock.lastCall().timeout, 30000)
  })

  suite('12. JSONP（非浏览器降级）')
  await test('Node 环境降级为普通 GET', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.get({ url: '/test', jsonp: true })
    const c = mock.lastCall()
    assert.equal(c.method, 'GET')
    assert.ok(c.url, '降级后发出请求')
  })

  suite('13. 模拟 baseRequest 拦截')
  await test('403 触发 logout', async () => {
    let loggedOut = false
    mock.reset()
    const api = useRequest({
      baseURL: SERVER_URL,
      responseInterceptors: [
        (res) => { if (res.code === 403) loggedOut = true; return res },
      ],
    })
    await api.get({ url: '/403-test' })
    assert.equal(loggedOut, true)
  })

  suite('14. fileUpload')
  await test('调用 uploadFile', async () => {
    mock.reset()
    const api = useRequest({ baseURL: SERVER_URL })
    await api.fileUpload({
      url: '/api/upload', filePath: '/tmp/test.jpg',
      name: 'file', formData: { desc: 'test' },
    })
    const c = mock.lastCall()
    assert.equal(c.filePath, '/tmp/test.jpg')
    assert.equal(c.name, 'file')
    assert.equal(c.formData.desc, 'test')
  })
}

// ══════════════════════════════════════════════════════════
//  集成测试（真实 HTTP）
// ══════════════════════════════════════════════════════════

async function runIntegrationTests() {
  suite('集成测试（真实 Python 服务器）')
  await test('GET /api/echo?name=test', async () => {
    const r = await fetch(`${SERVER_URL}/api/echo?name=test&page=1`)
    const b = await r.json()
    assert.equal(r.status, 200)
    assert.equal(b.code, 200)
    assert.equal(b.data.name, 'test')
  })
  await test('POST JSON 回声', async () => {
    const r = await fetch(`${SERVER_URL}/api/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'alice' }),
    })
    const b = await r.json()
    assert.equal(b.data.user, 'alice')
  })
  await test('POST form 回声', async () => {
    const r = await fetch(`${SERVER_URL}/api/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'key=val&hello=world',
    })
    const b = await r.json()
    assert.equal(b.code, 200)
  })
  await test('PUT JSON 回声', async () => {
    const r = await fetch(`${SERVER_URL}/api/echo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updated: true }),
    })
    const b = await r.json()
    assert.equal(b.data.updated, true)
  })
  await test('DELETE JSON 回声', async () => {
    const r = await fetch(`${SERVER_URL}/api/echo`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [1, 2, 3] }),
    })
    const b = await r.json()
    assert.deepEqual(b.data.ids, [1, 2, 3])
  })
  await test('403 响应', async () => {
    const r = await fetch(`${SERVER_URL}/api/error`)
    const b = await r.json()
    assert.equal(r.status, 403)
    assert.equal(b.message, '登录失败')
  })
  await test('500 响应带 message', async () => {
    const r = await fetch(`${SERVER_URL}/api/server-error`)
    assert.equal(r.status, 500)
    const b = await r.json()
    assert.equal(b.message, '数据库异常')
  })
  await test('JSONP 格式', async () => {
    const r = await fetch(`${SERVER_URL}/api/jsonp?callback=cb_test`)
    const text = await r.text()
    assert.ok(text.startsWith('cb_test('), `开头: ${text.slice(0, 30)}`)
    assert.ok(text.endsWith(')'), '缺少 )')
    const parsed = JSON.parse(text.slice('cb_test('.length, -1))
    assert.equal(parsed.code, 200)
  })
  await test('404 未定义路由', async () => {
    const r = await fetch(`${SERVER_URL}/api/not-exist`)
    assert.equal(r.status, 404)
  })
}

// ══════════════════════════════════════════════════════════
//  主入口
// ══════════════════════════════════════════════════════════

async function main() {
  console.log('\n  ╔═══════════════════════════════════════╗')
  console.log('  ║     useRequest 测试套件              ║')
  console.log('  ╚═══════════════════════════════════════╝')

  // 加载模块
  useRequest = await loadUseRequest()

  // 启动服务器
  console.log('[test] 启动 Python 测试服务器...')
  await startServer()
  console.log('[test] 服务器就绪')

  try {
    await runUnitTests()
    await runIntegrationTests()
  } finally {
    stopServer()
  }

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
  stopServer()
  process.exit(1)
})
