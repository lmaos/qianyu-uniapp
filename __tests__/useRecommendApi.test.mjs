/**
 * useRecommendApi 集成测试
 *
 * 测试推荐 Feed 卡片 API 端点和适配逻辑
 *
 * 运行: node __tests__/useRecommendApi.test.mjs
 */

import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SERVER_PORT = 18989
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`
const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

// ── 内联适配函数（与 useRecommendApi.js 保持一致） ──

function formatCount(num) {
  if (num == null || num === 0) return ''
  const n = Number(num)
  if (n >= 10000) {
    return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
  }
  return String(n)
}

function adaptRecommendItem(item) {
  const isVideo = item.type === 'video'
  const momentId = String(item.momentId)

  let detailUrl
  if (isVideo) {
    detailUrl = `page://open?page=/pages/video/detail&level1=home&level2=recommend&videoId=feed-video-${momentId}`
  } else {
    const queryParts = [`noteId=${momentId}`]
    if (item.authorId) {
      queryParts.push(`authorId=${item.authorId}`)
    }
    detailUrl = `/pages/user/note-detail?${queryParts.join('&')}`
  }

  return {
    id: `feed-${momentId}`,
    contentType: isVideo ? 'video' : 'note',
    title: item.title || '',
    coverUrl: item.coverUrl || '',
    coverLabel: isVideo ? '短视频' : '图文推荐',
    playCountText: formatCount(item.viewCount),
    likeCountText: formatCount(item.likeCount),
    commentCountText: formatCount(item.commentCount),
    authorName: item.nickname || '',
    authorAvatar: item.avatar || '',
    hasLike: item.hasLike || false,
    detailUrl,
    profileUrl: item.authorId
      ? `/pages/user-profile/user-profile?userId=${item.authorId}`
      : ''
  }
}

// ── 测试运行器（懒执行：只在 main() 中调用 runAll 时才执行） ──

let total = 0
let passed = 0
const suites = []

function suite(name, fns) {
  suites.push({ name, fns })
}

function test(name, fn) {
  return async () => {
    total++
    try { await fn(); passed++; console.log(`  ✅ ${name}`) }
    catch (e) { console.log(`  ❌ ${name}\n     ${e.message}`) }
  }
}

function testAsync(name, fn) {
  return test(name, fn)
}

async function runAll() {
  for (const s of suites) {
    console.log(`\n📦 ${s.name}`)
    for (const fn of s.fns) {
      await fn()
    }
  }
}

// ── 注册测试套件 ─────────────────────────────

suite('Suite 1: 服务端端点', [
  testAsync('GET /api/social/feed/recommend/cards 返回 200', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=3`)
    assert.equal(r.status, 200)
  }),

  testAsync('响应包含标准包装结构', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=1`)
    const body = await r.json()
    assert.equal(typeof body.requestId, 'string')
    assert.equal(body.status, 0)
    assert.equal(body.state, 'OK')
    assert.ok(body.content !== null && typeof body.content === 'object')
    assert.equal(body.message, 'OK')
  }),

  testAsync('content 包含 datas/nextCursor/hasMore', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=1`)
    const body = await r.json()
    const c = body.content
    assert.ok(Array.isArray(c.datas))
    assert.equal(typeof c.nextCursor, 'number')
    assert.equal(typeof c.hasMore, 'boolean')
  }),
])

suite('Suite 2: FeedCardVo 字段完整性', [
  testAsync('卡片包含所有必需字段', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=1`)
    const body = await r.json()
    const card = body.content.datas[0]
    const requiredFields = ['momentId', 'authorId', 'nickname', 'avatar', 'coverUrl', 'title', 'type', 'likeCount', 'commentCount', 'viewCount', 'hasLike']
    for (const field of requiredFields) {
      assert.ok(field in card, `缺少字段: ${field}`)
    }
  }),

  testAsync('type 字段值合法 (video/image)', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=10`)
    const body = await r.json()
    for (const card of body.content.datas) {
      assert.ok(['video', 'image'].includes(card.type), `非法 type: ${card.type}`)
    }
  }),

  testAsync('momentId 唯一且为正整数', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=10`)
    const body = await r.json()
    const ids = body.content.datas.map(c => c.momentId)
    assert.equal(new Set(ids).size, ids.length, 'momentId 不唯一')
    for (const id of ids) {
      assert.ok(Number.isInteger(id) && id > 0, `momentId 非法: ${id}`)
    }
  }),

  testAsync('nickname 和 coverUrl 不为 null', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=10`)
    const body = await r.json()
    for (const card of body.content.datas) {
      assert.ok(card.nickname !== null, `nickname 为 null: ${card.momentId}`)
      assert.ok(card.coverUrl !== null, `coverUrl 为 null: ${card.momentId}`)
    }
  }),
])

suite('Suite 3: 游标分页', [
  testAsync('cursor=0 返回第一页', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=2`)
    const body = await r.json()
    assert.equal(body.content.datas.length, 2)
    assert.ok(body.content.hasMore)
    assert.ok(body.content.nextCursor > 0)
  }),

  testAsync('第二页不重复第一页的数据', async () => {
    const r1 = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=2`)
    const p1 = await r1.json()
    const page1Ids = p1.content.datas.map(c => c.momentId)

    const r2 = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=${p1.content.nextCursor}&limit=2`)
    const p2 = await r2.json()
    const page2Ids = p2.content.datas.map(c => c.momentId)

    for (const id of page1Ids) {
      assert.ok(!page2Ids.includes(id), `第二页重复了第一页的 momentId: ${id}`)
    }
    assert.ok(Math.max(...page2Ids) < Math.min(...page1Ids), '第二页数据不是更旧的')
  }),

  testAsync('limit 控制返回条数', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards?cursor=0&limit=5`)
    const body = await r.json()
    assert.equal(body.content.datas.length, 5)
  }),
])

suite('Suite 4: 适配器转换（纯函数）', [
  test('video 类型适配正确', () => {
    const raw = {
      momentId: 6257117397155800, authorId: 100001,
      nickname: '测试用户', avatar: 'https://example.com/avatar.jpg',
      coverUrl: 'https://example.com/cover.jpg', title: '测试视频',
      type: 'video', likeCount: 42, commentCount: 7, viewCount: 2300, hasLike: false,
    }
    const adapted = adaptRecommendItem(raw)
    assert.equal(adapted.id, 'feed-6257117397155800')
    assert.equal(adapted.contentType, 'video')
    assert.equal(adapted.title, '测试视频')
    assert.equal(adapted.coverUrl, 'https://example.com/cover.jpg')
    assert.equal(adapted.coverLabel, '短视频')
    assert.equal(adapted.likeCountText, '42')
    assert.equal(adapted.commentCountText, '7')
    assert.equal(adapted.playCountText, '2300')
    assert.equal(adapted.authorName, '测试用户')
    assert.equal(adapted.authorAvatar, 'https://example.com/avatar.jpg')
    assert.equal(adapted.profileUrl, '/pages/user-profile/user-profile?userId=100001')
    assert.ok(adapted.detailUrl.startsWith('page://'))
    assert.ok(adapted.detailUrl.includes('feed-video-6257117397155800'))
  }),

  test('image 类型适配正确', () => {
    const raw = {
      momentId: 6257117397155799, authorId: 100002,
      nickname: '图文用户', avatar: '',
      coverUrl: 'https://example.com/img.jpg', title: '测试图文',
      type: 'image', likeCount: 99, commentCount: 15, viewCount: 0, hasLike: true,
    }
    const adapted = adaptRecommendItem(raw)
    assert.equal(adapted.contentType, 'note')
    assert.equal(adapted.coverLabel, '图文推荐')
    assert.equal(adapted.playCountText, '')
    assert.equal(adapted.authorAvatar, '')
    assert.ok(adapted.detailUrl.includes('/pages/user/note-detail'))
    assert.ok(adapted.detailUrl.includes('noteId=6257117397155799'))
  }),

  test('formatCount 格式化大数字', () => {
    assert.equal(formatCount(0), '')
    assert.equal(formatCount(null), '')
    assert.equal(formatCount(42), '42')
    assert.equal(formatCount(9999), '9999')
    assert.equal(formatCount(10000), '1w')
    assert.equal(formatCount(12800), '1.3w')
    assert.equal(formatCount(123456), '12.3w')
  }),

  test('nickname 为空时 authorName 为空字符串', () => {
    const raw = {
      momentId: 6257117397155798, authorId: 100003,
      nickname: null, avatar: null, coverUrl: '',
      title: '', type: 'image', likeCount: 0,
      commentCount: 0, viewCount: 0, hasLike: false,
    }
    const adapted = adaptRecommendItem(raw)
    assert.equal(adapted.authorName, '')
    assert.equal(adapted.authorAvatar, '')
    assert.equal(adapted.title, '')
    assert.equal(adapted.coverUrl, '')
  }),
])

suite('Suite 5: 关注 Feed 端点', [
  testAsync('GET /api/social/feed/following/cards 返回相同结构', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/following/cards?cursor=0&limit=2`)
    assert.equal(r.status, 200)
    const body = await r.json()
    assert.equal(body.status, 0)
    assert.ok(Array.isArray(body.content.datas))
    assert.equal(typeof body.content.nextCursor, 'number')
    assert.equal(typeof body.content.hasMore, 'boolean')
  }),
])

suite('Suite 6: 错误处理', [
  testAsync('不传参数使用默认值 (cursor=0, limit=20)', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards`)
    assert.equal(r.status, 200)
    const body = await r.json()
    assert.ok(body.content.datas.length > 0)
  }),

  testAsync('非法路径返回 404', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/feed/recommend/cards/invalid`)
    assert.equal(r.status, 404)
  }),
])

// ── 主入口 ───────────────────────────────────

async function main() {
  console.log('\n  ╔═══════════════════════════════════════╗')
  console.log('  ║     useRecommendApi 测试套件          ║')
  console.log('  ╚═══════════════════════════════════════╝')

  console.log('[test] 启动 Python 测试服务器...')
  await startServer()
  console.log('[test] 服务器就绪')

  try {
    await runAll()
  } finally {
    stopServer()
  }

  console.log(`\n${'='.repeat(40)}`)
  console.log(`总计: ${total}  通过: ${passed}  失败: ${total - passed}`)
  if (passed === total) {
    console.log('🎉 全部通过')
  } else {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('\n[test] 致命错误:', err)
  stopServer()
  process.exit(1)
})
