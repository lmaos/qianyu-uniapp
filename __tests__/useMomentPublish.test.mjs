/**
 * useMomentPublish 集成测试
 *
 * 测试动态发布（上传 → publish）的完整链路
 *
 * 运行: node __tests__/useMomentPublish.test.mjs
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

// ── 模拟 baseRequest 的响应格式 ──────────────────

function mockUploadResponse(url) {
  return {
    code: 200,
    response: {
      status: 0,
      content: {
        id: 10001,
        url,
        key: `moment/image/test_10001.jpg`,
        platform: 'oss',
        fileType: 'jpg',
      },
      message: 'OK',
    },
  }
}

function mockPublishResponse(momentId) {
  return {
    code: 200,
    response: {
      status: 0,
      content: {
        momentId,
        authorId: 100001,
        likes: 0,
        comments: 0,
        hasLike: false,
        status: 0,
        createTime: Date.now(),
      },
      message: 'OK',
    },
  }
}

// ── 内联被测逻辑（与 content-publish.vue 保持一致） ──

function buildPublishContent({ hasVideo, mediaList, title }) {
  const content = {
    type: hasVideo ? 'video' : (mediaList.length > 0 ? 'image' : 'text'),
    text: { text: title || '', atIds: [] },
  }

  if (hasVideo && mediaList.length > 0) {
    const item = mediaList[0]
    content.video = {
      videoId: '10001',
      videoUrl: item.url,
      coverUrl: item.thumbUrl || item.url,
      width: item.width || 0,
      height: item.height || 0,
      duration: item.duration || 0,
    }
  } else if (mediaList.length > 0) {
    content.image = mediaList.map((item, i) => ({
      imageId: String(10001 + i),
      imageUrl: item.url,
      width: item.width || 0,
      height: item.height || 0,
    }))
  }

  return content
}

// ── 测试运行器（懒执行） ─────────────────────────

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

const testAsync = test

async function runAll() {
  for (const s of suites) {
    console.log(`\n📦 ${s.name}`)
    for (const fn of s.fns) {
      await fn()
    }
  }
}

// ── Suite 1: MomentContent 构造 ───────────────

suite('Suite 1: MomentContent 构造', [
  test('空内容 → type=text', () => {
    const result = buildPublishContent({ hasVideo: false, mediaList: [], title: '' })
    assert.equal(result.type, 'text')
    assert.equal(result.text.text, '')
    assert.deepEqual(result.text.atIds, [])
    assert.equal(result.image, undefined)
    assert.equal(result.video, undefined)
  }),

  test('纯文本 → type=text + title', () => {
    const result = buildPublishContent({ hasVideo: false, mediaList: [], title: '今天天气真好' })
    assert.equal(result.type, 'text')
    assert.equal(result.text.text, '今天天气真好')
  }),

  test('单张图片 → type=image + image[0]', () => {
    const result = buildPublishContent({
      hasVideo: false,
      mediaList: [{ url: 'https://cdn.test.com/photo.jpg', width: 1080, height: 720 }],
      title: '一张照片',
    })
    assert.equal(result.type, 'image')
    assert.equal(result.image.length, 1)
    assert.equal(result.image[0].imageUrl, 'https://cdn.test.com/photo.jpg')
    assert.equal(result.image[0].width, 1080)
    assert.equal(result.image[0].height, 720)
    assert.ok(result.image[0].imageId)
  }),

  test('多张图片 → type=image + image[N]', () => {
    const mediaList = [
      { url: 'https://cdn.test.com/p1.jpg', width: 100, height: 100 },
      { url: 'https://cdn.test.com/p2.jpg', width: 200, height: 200 },
      { url: 'https://cdn.test.com/p3.jpg', width: 300, height: 300 },
    ]
    const result = buildPublishContent({ hasVideo: false, mediaList, title: '' })
    assert.equal(result.type, 'image')
    assert.equal(result.image.length, 3)
    assert.equal(result.image[2].imageUrl, 'https://cdn.test.com/p3.jpg')
  }),

  test('视频 → type=video + video 对象', () => {
    const result = buildPublishContent({
      hasVideo: true,
      mediaList: [{
        url: 'https://cdn.test.com/video.mp4',
        thumbUrl: 'https://cdn.test.com/cover.jpg',
        width: 1920,
        height: 1080,
        duration: 30,
      }],
      title: '我的视频',
    })
    assert.equal(result.type, 'video')
    assert.ok(result.video)
    assert.equal(result.video.videoUrl, 'https://cdn.test.com/video.mp4')
    assert.equal(result.video.coverUrl, 'https://cdn.test.com/cover.jpg')
    assert.equal(result.video.width, 1920)
    assert.equal(result.video.height, 1080)
    assert.equal(result.video.duration, 30)
  }),

  test('视频无缩略图 → coverUrl 兜底为 videoUrl', () => {
    const result = buildPublishContent({
      hasVideo: true,
      mediaList: [{
        url: 'https://cdn.test.com/video.mp4',
        width: 1920,
        height: 1080,
        duration: 30,
      }],
      title: '',
    })
    assert.equal(result.video.coverUrl, result.video.videoUrl)
  }),
])

// ── Suite 2: 服务端端点 ─────────────────────────

suite('Suite 2: 服务端端点', [
  testAsync('POST /api/storage/upload 返回 200 + content.url', async () => {
    const r = await fetch(`${SERVER_URL}/api/storage/upload`, { method: 'POST' })
    assert.equal(r.status, 200)
    const body = await r.json()
    assert.equal(body.status, 0)
    assert.ok(body.content.url.startsWith('https://'))
    assert.ok(body.content.id > 0)
    assert.ok(body.content.key)
  }),

  testAsync('POST /api/social/moment/publish 返回 MomentVo', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/moment/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: {
          type: 'image',
          text: { text: '测试发布', atIds: [] },
          image: [{ imageId: '1', imageUrl: 'https://test.com/1.jpg', width: 100, height: 100 }],
        },
      }),
    })
    assert.equal(r.status, 200)
    const body = await r.json()
    assert.equal(body.status, 0)
    assert.ok(body.content.momentId > 0)
    assert.equal(body.content.authorId, 100001)
    assert.equal(body.content.content.type, 'image')
    assert.equal(body.content.likes, 0)
    assert.equal(body.content.comments, 0)
  }),

  testAsync('发布图文后 content 回显正确', async () => {
    const payload = {
      content: {
        type: 'image',
        text: { text: '今日份的快乐 ✨', atIds: [] },
        image: [
          { imageId: 'img_001', imageUrl: 'https://cdn.example.com/photo.jpg', width: 1080, height: 1080 },
        ],
      },
      latitude: 22.5431,
      longitude: 114.0579,
      country: 'CN',
    }
    const r = await fetch(`${SERVER_URL}/api/social/moment/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await r.json()
    // content 回显与请求一致
    assert.deepEqual(body.content.content, payload.content)
    assert.equal(body.content.latitude, 22.5431)
    assert.equal(body.content.country, 'CN')
  }),

  testAsync('发布纯文本动态', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/moment/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { type: 'text', text: { text: '今天天气真好！', atIds: [] } },
      }),
    })
    assert.equal(r.status, 200)
    const body = await r.json()
    assert.equal(body.content.content.type, 'text')
  }),

  testAsync('发布视频动态', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/moment/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: {
          type: 'video',
          text: { text: '我的视频', atIds: [] },
          video: {
            videoId: 'v_001',
            videoUrl: 'https://cdn.example.com/video.mp4',
            coverUrl: 'https://cdn.example.com/cover.jpg',
            width: 1920,
            height: 1080,
            duration: 30,
          },
        },
      }),
    })
    assert.equal(r.status, 200)
    const body = await r.json()
    assert.equal(body.content.content.type, 'video')
    assert.equal(body.content.content.video.videoUrl, 'https://cdn.example.com/video.mp4')
  }),
])

// ── Suite 3: publishMoment 响应结构 ─────────────

suite('Suite 3: 发布响应结构验证', [
  testAsync('响应包含完整 MomentVo 字段', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/moment/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { type: 'text', text: { text: 'hi', atIds: [] } },
      }),
    })
    const body = await r.json()
    const c = body.content
    const requiredFields = ['momentId', 'authorId', 'content', 'likes', 'comments', 'hasLike', 'status', 'createTime']
    for (const field of requiredFields) {
      assert.ok(field in c, `缺少字段: ${field}`)
    }
  }),

  testAsync('新发布动态 likes/comments = 0, hasLike = false', async () => {
    const r = await fetch(`${SERVER_URL}/api/social/moment/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { type: 'text', text: { text: 'new', atIds: [] } },
      }),
    })
    const body = await r.json()
    assert.equal(body.content.likes, 0)
    assert.equal(body.content.comments, 0)
    assert.equal(body.content.hasLike, false)
  }),
])

// ── 主入口 ───────────────────────────────────

async function main() {
  console.log('\n  ╔═══════════════════════════════════════╗')
  console.log('  ║     useMomentPublish 测试套件        ║')
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
