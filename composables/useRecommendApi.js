/**
 * useRecommendApi — 推荐 Feed API
 *
 * 职责：
 *   1. GET /api/social/feed/recommend/cards → 推荐 Feed 卡片（游标分页）
 *   2. GET /api/social/feed/following/cards  → 关注 Feed 卡片
 *   3. 适配 FeedCardVo → 组件可消费的 item 格式
 *
 * ── 使用 ──
 * import { fetchRecommendCards } from '@/composables/useRecommendApi.js'
 *
 * const { items, nextCursor, hasMore } = await fetchRecommendCards(0, 20)
 */

import request from '@/composables/baseRequest.js'
import { buildVideoDetailPageUrl } from '@/components/video/videoFeedConfig.js'

/**
 * 获取推荐 Feed 卡片（首页"为你推荐"双列瀑布流）
 * @param {number} cursor - 游标 momentId，首次传 0
 * @param {number} limit  - 分页大小，默认 20，最大 100
 * @returns {Promise<{items: Array, nextCursor: number, hasMore: boolean}>}
 */
export async function fetchRecommendCards(cursor = 0, limit = 20) {
	const res = await request.get({
		url: '/api/social/feed/recommend/cards',
		data: { cursor, limit }
	})

	if (res.code !== 200) {
		throw new Error('请求失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '获取推荐列表失败')
	}

	const { datas = [], nextCursor = 0, hasMore = false } = body.content || {}

	return {
		items: datas.map(item => adaptRecommendItem(item)),
		nextCursor: Number(nextCursor),
		hasMore
	}
}

/**
 * 获取关注 Feed 卡片（关注的人发布的动态）
 * @param {number} cursor - 游标 momentId，首次传 0
 * @param {number} limit  - 分页大小，默认 20，最大 100
 * @returns {Promise<{items: Array, nextCursor: number, hasMore: boolean}>}
 */
export async function fetchFollowingCards(cursor = 0, limit = 20) {
	const res = await request.get({
		url: '/api/social/feed/following/cards',
		data: { cursor, limit }
	})

	if (res.code !== 200) {
		throw new Error('请求失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '获取关注列表失败')
	}

	const { datas = [], nextCursor = 0, hasMore = false } = body.content || {}

	return {
		items: datas.map(item => adaptRecommendItem(item)),
		nextCursor: Number(nextCursor),
		hasMore
	}
}

// ── 适配器 ──────────────────────────────────────────

/**
 * FeedCardVo → 组件 item 格式（与 RecommendFeedCard.vue 期望一致）
 */
function adaptRecommendItem(item) {
	const isVideo = item.type === 'video'
	const momentId = String(item.momentId)

	let detailUrl
	if (isVideo) {
		detailUrl = buildVideoDetailPageUrl({
			level1: 'home',
			level2: 'recommend',
			videoId: `feed-video-${momentId}`
		})
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
		coverUrl: normalizeCoverUrl(item.coverUrl),
		// 渐变兜底（封面 URL 为空时显示）
		coverBackground: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
		coverLabel: isVideo ? '短视频' : '图文推荐',
		playCountText: formatCount(item.viewCount),
		likeCountText: formatCount(item.likeCount),
		commentCountText: formatCount(item.commentCount),
		authorName: item.nickname || '',
		authorAvatar: item.avatar || '',
		// 头像渐变兜底
		authorAvatarFallback: 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)',
		hasLike: item.hasLike || false,
		detailUrl,
		profileUrl: item.authorId
			? `/pages/user-profile/user-profile?userId=${item.authorId}`
			: ''
	}
}

// ── 工具函数 ──────────────────────────────────────

/**
 * 规范化封面 URL：排除 null / "null" / undefined / 空字符串等异常值
 */
function normalizeCoverUrl(url) {
	if (!url || url === 'null' || url === 'undefined' || url === '') {
		return ''
	}
	return String(url).trim()
}

function formatCount(num) {
	if (num == null || num === 0) return ''
	const n = Number(num)
	if (n >= 10000) {
		return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
	}
	return String(n)
}
