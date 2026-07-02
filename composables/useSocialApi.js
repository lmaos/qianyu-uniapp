/**
 * useSocialApi — 社交互动 API（评论、点赞、关注）
 *
 * ── 使用 ──
 * import { fetchCommentList, publishComment, likeMoment, likeComment, followUser, fetchFollowRelation } from '@/composables/useSocialApi.js'
 */

import request from '@/composables/baseRequest.js'

// ========== 点赞 ==========

/**
 * 点赞动态
 * @param {number} momentId
 * @returns {Promise<boolean>}
 */
export async function likeMoment(momentId) {
	return await _likeOperation('/api/social/like/moment', { momentId })
}

/**
 * 取消点赞动态
 * @param {number} momentId
 * @returns {Promise<boolean>}
 */
export async function unlikeMoment(momentId) {
	return await _likeOperation('/api/social/like/moment/cancel', { momentId })
}

/**
 * 点赞评论
 * @param {number} commentId
 * @returns {Promise<boolean>}
 */
export async function likeComment(commentId) {
	return await _likeOperation('/api/social/like/comment', { commentId })
}

/**
 * 取消点赞评论
 * @param {number} commentId
 * @returns {Promise<boolean>}
 */
export async function unlikeComment(commentId) {
	return await _likeOperation('/api/social/like/comment/cancel', { commentId })
}

async function _likeOperation(url, data) {
	const res = await request.post({ url, data })
	if (res.code !== 200) throw new Error('操作失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '操作失败')
	return body.content === true
}

// ========== 评论 ==========

/**
 * 查询一级评论列表（游标分页）
 * @param {number} momentId
 * @param {number} [nextCommentId=0]
 * @param {number} [limit=20]
 * @returns {Promise<{commentList: Array, nextCommentId: number, hasMore: boolean}>}
 */
export async function fetchCommentList(momentId, nextCommentId = 0, limit = 20) {
	const res = await request.get({
		url: '/api/social/comment/moment/list',
		data: { momentId, nextCommentId, limit }
	})
	if (res.code !== 200) throw new Error('请求失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '获取评论失败')
	const { commentList = [], nextCommentId: nc = 0, hasMore = false } = body.content || {}
	return { commentList: commentList.map(adaptComment), nextCommentId: nc, hasMore }
}

/**
 * 查询回复列表
 * @param {number} parentCommentId
 * @param {number} [nextCommentId=0]
 * @param {number} [limit=20]
 * @returns {Promise<{replyList: Array, nextCommentId: number, hasMore: boolean}>}
 */
export async function fetchReplyList(parentCommentId, nextCommentId = 0, limit = 20) {
	const res = await request.get({
		url: '/api/social/comment/reply/list',
		data: { parentCommentId, nextCommentId, limit }
	})
	if (res.code !== 200) throw new Error('请求失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '获取回复失败')
	const { commentList = [], nextCommentId: nc = 0, hasMore = false } = body.content || {}
	return { replyList: commentList.map(adaptComment), nextCommentId: nc, hasMore }
}

/**
 * 发布评论
 * @param {number} momentId
 * @param {string} text
 * @param {Object} [opts] - { parentCommentId, replyCommentId, atIds }
 * @returns {Promise<Object>} CommentVo
 */
export async function publishComment(momentId, text, opts = {}) {
	const data = {
		momentId,
		parentCommentId: opts.parentCommentId || 0,
		replyCommentId: opts.replyCommentId || 0,
		content: {
			text: { text, atIds: opts.atIds || [] }
		}
	}
	const res = await request.post({ url: '/api/social/comment/publish', type: 'json', data })
	if (res.code !== 200) throw new Error('发布失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '发布失败')
	return adaptComment(body.content)
}

/**
 * 删除评论
 * @param {number} commentId
 * @returns {Promise<boolean>}
 */
export async function deleteComment(commentId) {
	const res = await request.post({ url: '/api/social/comment/delete', data: { commentId } })
	if (res.code !== 200) throw new Error('删除失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '删除失败')
	return body.content === true
}

// ========== 关注 ==========

/**
 * 关注用户
 * @param {number} targetId
 * @returns {Promise<boolean>}
 */
export async function followUser(targetId) {
	return await _followOp('/api/social/follow/follow', targetId)
}

/**
 * 取消关注
 * @param {number} targetId
 * @returns {Promise<boolean>}
 */
export async function unfollowUser(targetId) {
	return await _followOp('/api/social/follow/cancel', targetId)
}

async function _followOp(url, targetId) {
	const res = await request.post({ url, data: { targetId } })
	if (res.code !== 200) throw new Error('操作失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '操作失败')
	return body.content === true
}

/**
 * 查询当前用户与目标用户的关注关系
 * @param {number} targetId
 * @returns {Promise<{follow: boolean, follower: boolean, friend: boolean}|null>}
 */
export async function fetchFollowRelation(targetId) {
	const res = await request.get({
		url: '/api/social/follow/relation',
		data: { targetId }
	})
	if (res.code !== 200) return null
	const body = res.response
	if (Number(body.status) !== 0) return null
	return adaptFollowRelation(body.content)
}

/**
 * 常用联系人（好友）列表
 * @returns {Promise<Array<{userId:number,nickname:string,avatar:string,userNo:string}>>}
 */
export async function fetchFriendContacts() {
	const res = await request.get({ url: '/api/social/follow/friends' })
	if (res.code !== 200) return []
	const body = res.response
	if (Number(body.status) !== 0) return []
	return Array.isArray(body.content) ? body.content : []
}

/**
 * 查询指定用户的关注和粉丝数
 * @param {number} userId
 * @returns {Promise<{followCount: number, followerCount: number}|null>}
 */
export async function fetchFollowCount(userId) {
	const res = await request.get({
		url: '/api/social/follow/count',
		data: { userId }
	})
	if (res.code !== 200) return null
	const body = res.response
	if (Number(body.status) !== 0) return null
	return body.content || null
}

/**
 * 查询自己的关注和粉丝数
 * @returns {Promise<{followCount: number, followerCount: number}|null>}
 */
export async function fetchFollowCountSelf() {
	const res = await request.get({ url: '/api/social/follow/count/self' })
	if (res.code !== 200) return null
	const body = res.response
	if (Number(body.status) !== 0) return null
	return body.content || null
}

/**
 * 查询指定用户的关注列表
 * @param {number} userId
 * @param {number} [nextId]
 * @param {number} [limit=20]
 * @returns {Promise<{list: Array, nextId: number, hasMore: boolean}>}
 */
export async function fetchFolloweeList(userId, nextId, limit = 20) {
	const res = await request.get({
		url: '/api/social/follow/followee/list',
		data: { userId, nextId, limit }
	})
	if (res.code !== 200) throw new Error('请求失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '获取关注列表失败')
	const { followList = [], nextId: nid = 0, hasMore = false } = body.content || {}
	return { list: followList, nextId: nid, hasMore }
}

/**
 * 查询自己的关注列表
 * @param {number} [nextId]
 * @param {number} [limit=20]
 * @returns {Promise<{list: Array, nextId: number, hasMore: boolean}>}
 */
export async function fetchFolloweeSelfList(nextId, limit = 20) {
	const res = await request.get({
		url: '/api/social/follow/followee/self/list',
		data: { nextId, limit }
	})
	if (res.code !== 200) throw new Error('请求失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '获取关注列表失败')
	const { followList = [], nextId: nid = 0, hasMore = false } = body.content || {}
	return { list: followList, nextId: nid, hasMore }
}

/**
 * 查询指定用户的粉丝列表
 * @param {number} userId
 * @param {number} [nextId]
 * @param {number} [limit=20]
 * @returns {Promise<{list: Array, nextId: number, hasMore: boolean}>}
 */
export async function fetchFollowerList(userId, nextId, limit = 20) {
	const res = await request.get({
		url: '/api/social/follow/follower/list',
		data: { userId, nextId, limit }
	})
	if (res.code !== 200) throw new Error('请求失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '获取粉丝列表失败')
	const { followList = [], nextId: nid = 0, hasMore = false } = body.content || {}
	return { list: followList, nextId: nid, hasMore }
}

/**
 * 查询自己的粉丝列表
 * @param {number} [nextId]
 * @param {number} [limit=20]
 * @returns {Promise<{list: Array, nextId: number, hasMore: boolean}>}
 */
export async function fetchFollowerSelfList(nextId, limit = 20) {
	const res = await request.get({
		url: '/api/social/follow/follower/self/list',
		data: { nextId, limit }
	})
	if (res.code !== 200) throw new Error('请求失败')
	const body = res.response
	if (Number(body.status) !== 0) throw new Error(body.message || '获取粉丝列表失败')
	const { followList = [], nextId: nid = 0, hasMore = false } = body.content || {}
	return { list: followList, nextId: nid, hasMore }
}

// ========== 适配器 ==========

/**
 * FollowRelationVo → user-profile 可消费的 relationFlags
 */
function adaptFollowRelation(vo) {
	if (!vo) return null
	return {
		follow: Boolean(vo.follow),
		follower: Boolean(vo.follower),
		friend: Boolean(vo.friend)
	}
}

/**
 * CommentVo → UserCommentList 组件格式
 * 保持与现有 userCenterMock 中 createCommentThread 返回格式一致
 */
function adaptComment(vo) {
	return {
		id: String(vo.commentId),
		commentId: vo.commentId,
		nickname: vo.nickname || '',
		avatar: vo.avatar || '',
		avatarText: (vo.nickname || '?')[0],
		avatarBackground: 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)',
		content: vo.content?.text?.text || '',
		timeText: formatClientTime(vo.clientTime),
		likeCountValue: vo.likes || 0,
		likeCountText: formatCount(vo.likes),
		liked: vo.hasLike || false,
		replyCount: vo.replies || 0,
		replySourceList: [],
		visibleReplyCount: 0,
		repliesExpanded: false
	}
}

/**
 * MomentVo → note-detail.vue 模板格式
 */
export function adaptMomentDetail(vo) {
	const content = vo.content || {}
	const type = content.type || 'text'
	const textObj = content.text || {}
	const title = textObj.text || ''
	const images = content.image || []
	const video = content.video

	let coverUrl = ''
	if (type === 'video') {
		coverUrl = normalizeCoverUrl(video?.coverUrl)
	} else if (type === 'image' && images.length > 0) {
		coverUrl = normalizeCoverUrl(images[0].imageUrl)
	}

	return {
		momentId: vo.momentId,
		authorInfo: {
			userId: vo.authorId,
			nickname: vo.nickname || '',
			avatar: vo.avatar || '',
			avatarText: (vo.nickname || '?')[0],
			avatarBackground: 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)'
		},
		publishTimeText: formatClientTime(vo.createTime),
		coverUrl,
		coverBackground: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
		coverText: type === 'video' ? '🎬' : '📷',
		isVideo: type === 'video',
		title,
		content: title,
		watchCountValue: 0,
		watchCount: '',
		likeCountValue: vo.likes || 0,
		likeCount: formatCount(vo.likes),
		commentCountValue: vo.comments || 0,
		commentCount: formatCount(vo.comments),
		liked: vo.hasLike || false,
		// 视频播放信息
		videoUrl: video?.videoUrl || '',
		videoId: video?.videoId || ''
	}
}

// ========== 工具函数 ==========

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

function formatClientTime(timestamp) {
	if (!timestamp) return ''
	const date = new Date(Number(timestamp))
	const now = new Date()
	const diffMs = now - date
	const diffMin = Math.floor(diffMs / 60000)
	const diffHour = Math.floor(diffMs / 3600000)
	const diffDay = Math.floor(diffMs / 86400000)

	if (diffMin < 1) return '刚刚'
	if (diffMin < 60) return `${diffMin}分钟前`
	if (diffHour < 24) return `${diffHour}小时前`
	if (diffDay < 7) return `${diffDay}天前`

	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const mins = String(date.getMinutes()).padStart(2, '0')
	return `${month}-${day} ${hours}:${mins}`
}
