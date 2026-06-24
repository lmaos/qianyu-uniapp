/**
 * useMomentApi — 动态 CRUD API
 *
 * 职责：
 *   1. POST /api/social/moment/publish → 发布动态
 *   2. GET  /api/social/moment/get     → 查询动态详情
 *   3. POST /api/social/moment/delete  → 删除动态
 *   4. GET  /api/social/moment/list    → 批量查询动态
 *   5. GET  /api/social/moment/author/list     → 按作者查全部动态
 *   6. GET  /api/social/moment/author/list/type → 按作者+类型查动态
 *
 * ── 使用 ──
 * import { publishMoment, fetchAuthorMomentList } from '@/composables/useMomentApi.js'
 * const moment = await publishMoment({ content: { type: 'image', ... } })
 */

import request from '@/composables/baseRequest.js'
import { buildVideoDetailPageUrl } from '@/components/video/videoFeedConfig.js'

/**
 * 发布动态
 * @param {Object} params
 * @param {Object} params.content     - MomentContent（必填）
 * @param {number} [params.latitude]  - 纬度
 * @param {number} [params.longitude] - 经度
 * @param {string} [params.country]   - 国家代码
 * @param {number} [params.status]    - 状态，默认 0
 * @returns {Promise<Object>} MomentVo
 */
export async function publishMoment(params) {
	const res = await request.post({
		url: '/api/social/moment/publish',
		type: 'json',
		data: params
	})

	if (res.code !== 200) {
		throw new Error('发布失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '发布失败')
	}

	return body.content
}

/**
 * 查询动态详情
 * @param {number} momentId
 * @returns {Promise<Object>} MomentVo
 */
export async function getMomentDetail(momentId) {
	const res = await request.get({
		url: '/api/social/moment/get',
		data: { momentId }
	})

	if (res.code !== 200) {
		throw new Error('请求失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '获取动态失败')
	}

	return body.content
}

/**
 * 批量查询动态
 * @param {number[]} momentIds
 * @returns {Promise<Array>} MomentVo 列表
 */
export async function listMoments(momentIds) {
	const res = await request.get({
		url: '/api/social/moment/list',
		data: { momentIds }
	})

	if (res.code !== 200) {
		throw new Error('请求失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '获取动态列表失败')
	}

	return body.content?.datas || []
}

/**
 * 删除动态
 * @param {number} momentId
 * @returns {Promise<boolean>}
 */
export async function deleteMoment(momentId) {
	const res = await request.post({
		url: '/api/social/moment/delete',
		data: { momentId }
	})

	if (res.code !== 200) {
		throw new Error('删除失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '删除失败')
	}

		return body.content === true
	}

// ========== 按作者查询 ==========

/**
 * 按作者查询全部动态列表（游标分页）
 * @param {number} authorId
 * @param {number} [momentId] 游标，首页不传
 * @param {number} [limit=20]
 * @returns {Promise<{datas: Array, nextMomentId: number, hasMore: boolean}>}
 */
export async function fetchAuthorMomentList(authorId, momentId, limit = 20) {
	const res = await request.get({
		url: '/api/social/moment/author/list',
		data: { authorId, momentId, limit }
	})

	if (res.code !== 200) {
		throw new Error('请求失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '获取动态列表失败')
	}

	const { datas = [], nextMomentId = 0, hasMore = false } = body.content || {}
	return { datas, nextMomentId, hasMore }
}

/**
 * 按作者+类型查询动态列表
 * @param {number} authorId
 * @param {string} momentType - text / image / video
 * @param {number} [momentId] 游标，首页不传
 * @param {number} [limit=20]
 * @returns {Promise<{datas: Array, nextMomentId: number, hasMore: boolean}>}
 */
export async function fetchAuthorMomentListByType(authorId, momentType, momentId, limit = 20) {
	const res = await request.get({
		url: '/api/social/moment/author/list/type',
		data: { authorId, momentType, momentId, limit }
	})

	if (res.code !== 200) {
		throw new Error('请求失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '获取动态列表失败')
	}

	const { datas = [], nextMomentId = 0, hasMore = false } = body.content || {}
	return { datas, nextMomentId, hasMore }
}
// ========== 适配器 ==========

/**
 * MomentVo → 用户主页列表项格式
 * 适配 UserDynamicList / UserWorkGrid 组件
 */
export function adaptMomentToProfileItem(vo) {
	const content = vo.content || {}
	const type = content.type || 'text'
	const isVideo = type === 'video'
	const hasMedia = type !== 'text'
	const images = content.image || []
	const video = content.video
	const itemId = String(vo.momentId)

	let coverUrl = ""
	if (isVideo) {
		coverUrl = normalizeCoverUrl(video?.coverUrl)
	} else if (type === 'image' && images.length > 0) {
		coverUrl = normalizeCoverUrl(images[0].imageUrl)
	}

	let detailUrl
	if (isVideo) {
		detailUrl = buildVideoDetailPageUrl({
			level1: 'profile',
			level2: 'dynamic',
			videoId: `profile-video-${itemId}`
		})
	} else {
		detailUrl = `/pages/user/note-detail?noteId=${itemId}`
	}

	return {
		id: itemId,
		contentType: isVideo ? 'video' : 'note',
		hasMedia,
		title: content.text?.text || '',
		coverUrl,
		coverBackground: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
		viewCountText: formatCount(0),
		likeCountText: formatCount(vo.likes),
		commentCountText: formatCount(vo.comments),
		playCountText: formatCount(0),
		detailUrl
	}
}

// ── 工具函数 ──

function normalizeCoverUrl(url) {
	if (!url || url === 'null' || url === 'undefined' || url === '') {
		return ''
	}
	return String(url).trim()
}

function formatCount(num) {
	if (num == null || num === 0) return ""
	const n = Number(num)
	if (n >= 10000) {
		return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
	}
	return String(n)
}
