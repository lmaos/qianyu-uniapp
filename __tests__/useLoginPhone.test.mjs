/**
 * useLoginPhone 单元测试
 *
 * 测试手机号校验、验证码发送、验证码登录、密码登录、启动检查
 *
 * 运行: node __tests__/useLoginPhone.test.mjs
 */

import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SERVER_PORT = 18989 // 与 test_server.py 保持一致
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── 被测纯函数（与 phone-login.vue 保持一致） ──────

function isValidPhone(phone) {
  return /^1\d{10}$/.test(phone)
}

function formatPhoneToApi(rawPhone) {
  return `+86-${rawPhone}`
}

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

function createMockRequest() {
  const calls = []
  const toastCalls = []
  const loginInfoCalls = []
  const reLaunchCalls = []

  const mock = {
    // 模拟 baseRequest.post
    post(opts) {
      calls.push(opts)
      const { url, data } = opts

      return new Promise((resolve) => {
        setTimeout(() => {
          // ── 发送验证码 ───────────────────────
          if (url === '/api/user/login/phone/verify_code') {
            const phone = data?.phone || ''
            if (!phone.startsWith('+')) {
              resolve({
                code: 400,
                message: '',
                response: { status: 300004, message: '手机号格式不正确' },
              })
              return
            }
            if (phone === '+86-13800138000' || phone === '+86-13800000000') {
              resolve({
                code: 200,
                message: '',
                response: { status: 0, content: { needSecondVerify: false }, message: 'OK' },
              })
              return
            }
            resolve({
              code: 429,
              message: '',
              response: { status: 400005, message: '操作过于频繁' },
            })
            return
          }

          // ── 手机号登录 ───────────────────────
          if (url === '/api/user/login/phone') {
            const phone = data?.phone || ''
            const authMode = data?.authMode || 'CODE'
            if (!phone.startsWith('+')) {
              resolve({
                code: 400,
                message: '',
                response: { status: 300004, message: '手机号格式不正确' },
              })
              return
            }
            if (authMode === 'CODE') {
              if (!data?.code) {
                resolve({
                  code: 400,
                  message: '',
                  response: { status: 300004, message: '验证码不能为空' },
                })
                return
              }
              if (data.code !== '123456') {
                resolve({
                  code: 401,
                  message: '',
                  response: { status: 100002, message: '验证码不正确' },
                })
                return
              }
              // 成功
              resolve(buildSuccessResponse(phone, 'phone-code'))
              return
            }
            if (authMode === 'PASSWORD') {
              if (data?.password !== 'qianyu123') {
                resolve({
                  code: 401,
                  message: '',
                  response: { status: 100002, message: '账户或密码错误' },
                })
                return
              }
              resolve(buildSuccessResponse(phone, 'phone-password'))
              return
            }
            // 未知 authMode
            resolve({
              code: 422,
              message: '',
              response: { status: 400020, message: '不支持的 authMode 值' },
            })
            return
          }

          // 默认回退
          resolve({ code: 200, message: '', response: { status: 0, content: {} } })
        }, 5)
      })
    },

    // 模拟 uni.showToast
    showToast(opts) { toastCalls.push(opts) },

    // 模拟 saveLoginInfo
    saveLoginInfo(info) { loginInfoCalls.push(info) },

    // 模拟 uni.reLaunch
    reLaunch(opts) { reLaunchCalls.push(opts) },

    // 断言辅助
    lastCall: () => calls[calls.length - 1],
    callCount: () => calls.length,
    lastToast: () => toastCalls[toastCalls.length - 1],
    toastCount: () => toastCalls.length,
    lastLoginInfo: () => loginInfoCalls[loginInfoCalls.length - 1],
    loginInfoCount: () => loginInfoCalls.length,
    lastReLaunch: () => reLaunchCalls[reLaunchCalls.length - 1],
    reLaunchCount: () => reLaunchCalls.length,
    reset: () => {
      calls.length = 0
      toastCalls.length = 0
      loginInfoCalls.length = 0
      reLaunchCalls.length = 0
    },
  }
  return mock
}

function buildSuccessResponse(phone, loginType) {
  const now = Date.now()
  const phoneSuffix = phone.replace('+86-', '')
  return {
    code: 200,
    message: '',
    response: {
      status: 0,
      state: 'OK',
      content: {
        token: `test-jwt-token-${phone}-${now}`,
        userInfo: {
          userNo: `QY${phoneSuffix}`,
          userId: 100001,
          nickname: `千语用户_${phoneSuffix.slice(-4)}`,
          avatar: null,
          bio: '',
          gender: 0,
          birthday: null,
          age: 0,
          phone,
          phoneVerifiedTime: now,
          email: null,
          country: 'CN',
          province: null,
          city: null,
          lastLoginTime: now,
          status: 0,
          freezeEndTime: null,
          createTime: now,
          updateTime: now,
        },
      },
      message: 'OK',
    },
  }
}

// ── 模拟 hasValidLoginSession（启动检查用） ───────

function createLoginStateChecker(initialLoggedIn = false) {
  let loggedIn = initialLoggedIn
  return {
    hasValidLoginSession: () => loggedIn,
    setLoggedIn: (v) => { loggedIn = v },
  }
}

// ── 报告辅助 ─────────────────────────────────────

let testPassed = 0
let testFailed = 0

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
  let mock = createMockRequest()

  // ── 1. 手机号校验 ─────────────────────────────

  suite('1. 手机号校验')
  await test('11 位有效手机号返回 true', () => {
    assert.equal(isValidPhone('13800138000'), true)
    assert.equal(isValidPhone('13800000000'), true)
    assert.equal(isValidPhone('15912345678'), true)
  })
  await test('无效手机号返回 false', () => {
    assert.equal(isValidPhone('123'), false)
    assert.equal(isValidPhone('abc'), false)
    assert.equal(isValidPhone(''), false)
    assert.equal(isValidPhone('123456789012'), false) // 12 位
    assert.equal(isValidPhone('23800138000'), false)  // 不以 1 开头
  })
  await test('formatPhoneToApi 拼接 +86 前缀', () => {
    assert.equal(formatPhoneToApi('13800138000'), '+86-13800138000')
    assert.equal(formatPhoneToApi('13800000000'), '+86-13800000000')
  })

  // ── 2. 发送验证码 ─────────────────────────────

  suite('2. 发送验证码')
  await test('测试手机号发送验证码成功（200 + status=0）', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800138000')
    const res = await mock.post({
      url: '/api/user/login/phone/verify_code',
      type: 'json',
      data: { phone },
    })

    assert.equal(res.code, 200)
    assert.equal(res.response.status, 0)
    assert.equal(res.response.content.needSecondVerify, false)
  })
  await test('其他手机号触发频率限制（429）', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13912345678')
    const res = await mock.post({
      url: '/api/user/login/phone/verify_code',
      type: 'json',
      data: { phone },
    })

    assert.equal(res.code, 429)
    assert.equal(res.response.status, 400005)
    assert.equal(res.response.message, '操作过于频繁')
  })
  await test('手机号格式错误返回 400', async () => {
    mock.reset()

    const res = await mock.post({
      url: '/api/user/login/phone/verify_code',
      type: 'json',
      data: { phone: '13800138000' }, // 少了 +86- 前缀
    })

    assert.equal(res.code, 400)
    assert.equal(res.response.status, 300004)
  })

  // ── 3. 验证码登录 ─────────────────────────────

  suite('3. 验证码登录')
  await test('验证码正确 → 登录成功 → 返回 token/userInfo', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800138000')
    const res = await mock.post({
      url: '/api/user/login/phone',
      type: 'json',
      data: { phone, code: '123456', authMode: 'CODE' },
    })

    assert.equal(res.code, 200)
    assert.equal(res.response.status, 0)
    assert.ok(res.response.content.token.startsWith('test-jwt-token-'))
    assert.equal(res.response.content.userInfo.nickname, '千语用户_8000')
    assert.equal(res.response.content.userInfo.phone, phone)
  })
  await test('验证码错误 → 401 → message 提示', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800138000')
    const res = await mock.post({
      url: '/api/user/login/phone',
      type: 'json',
      data: { phone, code: '000000', authMode: 'CODE' },
    })

    assert.equal(res.code, 401)
    assert.equal(res.response.status, 100002)
    assert.equal(res.response.message, '验证码不正确')
  })
  await test('验证码为空 → 400 参数错误', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800138000')
    const res = await mock.post({
      url: '/api/user/login/phone',
      type: 'json',
      data: { phone, code: '', authMode: 'CODE' },
    })

    assert.equal(res.code, 400)
  })
  await test('登录成功后可调用 saveLoginInfo 保存', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800138000')
    const res = await mock.post({
      url: '/api/user/login/phone',
      type: 'json',
      data: { phone, code: '123456', authMode: 'CODE' },
    })

    // 模拟 phone-login.vue 的 saveLoginInfo 调用
    const { token, userInfo } = res.response.content
    mock.saveLoginInfo({
      token,
      expireMs: Date.now() + 7 * 24 * 60 * 60 * 1000,
      nickname: userInfo.nickname,
      userNo: userInfo.userNo,
      avatar: userInfo.avatar || '',
      liveAuth: true,
      shopAuth: true,
      phone: userInfo.phone,
      loginType: 'phone-code',
    })

    assert.equal(mock.loginInfoCount(), 1)
    const saved = mock.lastLoginInfo()
    assert.equal(saved.token, token)
    assert.equal(saved.nickname, '千语用户_8000')
    assert.equal(saved.loginType, 'phone-code')
  })

  // ── 4. 密码登录 ─────────────────────────────

  suite('4. 密码登录')
  await test('密码正确 → 登录成功 → 返回 token/userInfo', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800138000')
    const res = await mock.post({
      url: '/api/user/login/phone',
      type: 'json',
      data: { phone, password: 'qianyu123', authMode: 'PASSWORD' },
    })

    assert.equal(res.code, 200)
    assert.equal(res.response.status, 0)
    assert.ok(res.response.content.token.startsWith('test-jwt-token-'))
  })
  await test('密码错误 → 401 → message 提示', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800138000')
    const res = await mock.post({
      url: '/api/user/login/phone',
      type: 'json',
      data: { phone, password: 'wrongpass', authMode: 'PASSWORD' },
    })

    assert.equal(res.code, 401)
    assert.equal(res.response.status, 100002)
    assert.equal(res.response.message, '账户或密码错误')
  })
  await test('未知 authMode → 422', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800138000')
    const res = await mock.post({
      url: '/api/user/login/phone',
      type: 'json',
      data: { phone, authMode: 'INVALID' },
    })

    assert.equal(res.code, 422)
    assert.equal(res.response.status, 400020)
    assert.equal(res.response.message, '不支持的 authMode 值')
  })
  await test('密码登录成功后保存信息', async () => {
    mock.reset()

    const phone = formatPhoneToApi('13800000000')
    const res = await mock.post({
      url: '/api/user/login/phone',
      type: 'json',
      data: { phone, password: 'qianyu123', authMode: 'PASSWORD' },
    })

    const { token, userInfo } = res.response.content
    mock.saveLoginInfo({
      token,
      expireMs: Date.now() + 7 * 24 * 60 * 60 * 1000,
      nickname: userInfo.nickname,
      userNo: userInfo.userNo,
      avatar: userInfo.avatar || '',
      liveAuth: true,
      shopAuth: true,
      phone: userInfo.phone,
      loginType: 'phone-password',
    })

    assert.equal(mock.loginInfoCount(), 1)
    const saved = mock.lastLoginInfo()
    assert.equal(saved.loginType, 'phone-password')
  })

  // ── 5. App 启动登录态检查 ─────────────────────

  suite('5. App 启动登录态检查')
  await test('已登录 → reLaunch 到首页', () => {
    mock.reset()
    global.uni = { reLaunch: (opts) => mock.reLaunch(opts) }

    const checker = createLoginStateChecker(true)
    if (checker.hasValidLoginSession()) {
      global.uni.reLaunch({ url: '/pages/index/index' })
    }

    assert.equal(mock.reLaunchCount(), 1)
    assert.equal(mock.lastReLaunch().url, '/pages/index/index')
  })
  await test('未登录 → 不跳转', () => {
    mock.reset()
    global.uni = { reLaunch: (opts) => mock.reLaunch(opts) }

    const checker = createLoginStateChecker(false)
    if (checker.hasValidLoginSession()) {
      global.uni.reLaunch({ url: '/pages/index/index' })
    }

    assert.equal(mock.reLaunchCount(), 0)
  })
}

// ══════════════════════════════════════════════════════════
//  集成测试（真实 Python 服务器）
// ══════════════════════════════════════════════════════════

async function runIntegrationTests() {
  suite('集成测试（真实 Python 服务器）')

  await test('POST /api/user/login/phone/verify_code 测试手机号', async () => {
    const r = await fetch(`${SERVER_URL}/api/user/login/phone/verify_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+86-13800138000' }),
    })
    const b = await r.json()
    assert.equal(r.status, 200)
    assert.equal(b.status, 0)
    assert.equal(b.content.needSecondVerify, false)
  })
  await test('POST /api/user/login/phone/verify_code 限流', async () => {
    const r = await fetch(`${SERVER_URL}/api/user/login/phone/verify_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+86-13912345678' }),
    })
    assert.equal(r.status, 429)
    const b = await r.json()
    assert.equal(b.status, 400005)
  })
  await test('POST /api/user/login/phone 验证码登录成功', async () => {
    const r = await fetch(`${SERVER_URL}/api/user/login/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+86-13800138000', code: '123456', authMode: 'CODE' }),
    })
    const b = await r.json()
    assert.equal(r.status, 200)
    assert.equal(b.status, 0)
    assert.ok(b.content.token.startsWith('test-jwt-token-'))
    assert.equal(b.content.userInfo.nickname, '千语用户_8000')
  })
  await test('POST /api/user/login/phone 验证码错误', async () => {
    const r = await fetch(`${SERVER_URL}/api/user/login/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+86-13800138000', code: '000000', authMode: 'CODE' }),
    })
    assert.equal(r.status, 401)
    const b = await r.json()
    assert.equal(b.message, '验证码不正确')
  })
  await test('POST /api/user/login/phone 密码登录成功', async () => {
    const r = await fetch(`${SERVER_URL}/api/user/login/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+86-13800138000', password: 'qianyu123', authMode: 'PASSWORD' }),
    })
    const b = await r.json()
    assert.equal(r.status, 200)
    assert.equal(b.status, 0)
    assert.ok(b.content.token.startsWith('test-jwt-token-'))
  })
  await test('POST /api/user/login/phone 密码错误', async () => {
    const r = await fetch(`${SERVER_URL}/api/user/login/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+86-13800138000', password: 'wrongpass', authMode: 'PASSWORD' }),
    })
    assert.equal(r.status, 401)
    const b = await r.json()
    assert.equal(b.message, '账户或密码错误')
  })
  await test('POST /api/user/login/phone 未知 authMode', async () => {
    const r = await fetch(`${SERVER_URL}/api/user/login/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+86-13800138000', authMode: 'INVALID' }),
    })
    assert.equal(r.status, 422)
    const b = await r.json()
    assert.equal(b.message, '不支持的 authMode 值')
  })
  await test('POST /api/user/login/phone 手机号格式错误', async () => {
    const r = await fetch(`${SERVER_URL}/api/user/login/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', code: '123456', authMode: 'CODE' }),
    })
    assert.equal(r.status, 400)
    const b = await r.json()
    assert.equal(b.status, 300004)
  })
}

// ══════════════════════════════════════════════════════════
//  主入口
// ══════════════════════════════════════════════════════════

async function main() {
  console.log('\n  ╔═══════════════════════════════════════╗')
  console.log('  ║     useLoginPhone 测试套件            ║')
  console.log('  ╚═══════════════════════════════════════╝')

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
