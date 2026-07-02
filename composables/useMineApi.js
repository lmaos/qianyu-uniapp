/**
 * useMineApi — 个人中心 API
 *
 * 职责：
 *   1. GET /api/app/personal/center → 用户信息 + 统计 + 快捷入口
 *   2. GET /api/app/personal/center/contents → 内容列表（游标分页）
 *   3. 适配 API 响应 → 组件可消费的 mock 格式（渐进替换，不动组件接口）
 *
 * ── 使用 ──
 * import { fetchPersonalCenter, fetchContentList, adaptContentItem } from '@/composables/useMineApi.js'
 */

import request from '@/composables/baseRequest.js'
import { resolveUserCenterMinimalIcon } from '@/components/user-center/main/userCenterIcons.js'
import {
	buildVideoDetailPageUrl,
	buildVideoWorksPageUrl
} from '@/components/video/videoFeedConfig.js'

/** 客户端 tab key → API tab 值 */
const TAB_API_MAP = {
	dynamic: 'moment',
	works: 'work',
	likes: 'like',
	history: 'history'
}

/** API tab 值 → 客户端 key（反向） */
const TAB_CLIENT_MAP = {
	moment: 'dynamic',
	work: 'works',
	like: 'likes',
	history: 'history'
}

/**
 * 获取个人中心汇总数据
 * @returns {Promise<{profileInfo: Object, quickActionList: Array}>}
 */
export async function fetchPersonalCenter() {
	const res = await request.get({ url: '/api/app/personal/center' })

	if (res.code !== 200) {
		throw new Error('请求失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '获取个人中心数据失败')
	}

	return adaptPersonalCenter(body.content)
}

/**
 * 分页查询内容列表
 * @param {string} clientTabKey — 'dynamic' | 'works' | 'likes' | 'history'
 * @param {number} cursor — 游标，首次传 0
 * @param {number} limit — 分页大小，默认 20
 * @returns {Promise<{items: Array, nextCursor: number, hasMore: boolean}>}
 */
export async function fetchContentList(clientTabKey, cursor = 0, limit = 20) {
	const apiTab = TAB_API_MAP[clientTabKey] || clientTabKey

	const res = await request.get({
		url: '/api/app/personal/center/contents',
		data: { tab: apiTab, cursor, limit }
	})

	if (res.code !== 200) {
		throw new Error('请求失败')
	}

	const body = res.response
	if (Number(body.status) !== 0) {
		throw new Error(body.message || '获取内容列表失败')
	}

	const { items = [], nextCursor = 0, hasMore = false } = body.content || {}

	return {
		items: items.map(item => adaptContentItem(item, clientTabKey)),
		nextCursor,
		hasMore
	}
}

/**
 * 客户端 tab key 转 API tab 值
 */
export function toApiTabKey(clientKey) {
	return TAB_API_MAP[clientKey] || clientKey
}

/**
 * API tab 值转客户端 key
 */
export function toClientTabKey(apiKey) {
	return TAB_CLIENT_MAP[apiKey] || apiKey
}

// ── 适配器（API → mock 格式，组件无感） ──────────────────

/**
 * PersonalCenterDto → 组件消费的 profileInfo + quickActionList
 */
function adaptPersonalCenter(content) {
	const { userProfile = {}, userStats = {}, shortcuts = [] } = content

	const profileInfo = {
		nickname: userProfile.nickname || '',
		displayId: userProfile.userNo || '',
		avatarText: extractAvatarText(userProfile.nickname),
		avatarBackground: 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)',
		signature: userProfile.signature || '',
		locationText: userProfile.location || '',
		visitorCount: userStats.visitorCount || 0,
		statsList: [
			{ key: 'likes', label: '获赞', value: formatCount(userStats.likeCount) },
			{ key: 'follow', label: '关注', value: formatCount(userStats.followCount) },
			{ key: 'fans', label: '粉丝', value: formatCount(userStats.fansCount) }
		],
		// 未上线的保留 mock 默认值
		nestTitle: '',
		nestStatusList: [],
		moodPromptText: '',
		signalSummaryList: []
	}

	const quickActionList = adaptShortcuts(shortcuts)

	return { profileInfo, quickActionList }
}

/**
 * ShortcutDto[] → quickActionList
 * 服务端返回可见的快捷入口，客户端过滤 all_features，末尾固定追加"全部功能"
 */
function adaptShortcuts(shortcuts) {
	// key → 客户端兜底信息（服务端 linkUrl 为空时使用）
	const CLIENT_SHORTCUT_META = {
		wallet:           { label: '我的钱包', iconKey: 'wallet',        path: '/pages/user/wallet' },
		orders:           { label: '订单中心', iconKey: 'orders',        path: '/pages/user/order-list' },
		merchant:         { label: '商家管理', iconKey: 'merchant',      path: '/pages/user/merchant-center' },
		anchor:           { label: '主播中心', iconKey: 'anchor-center', path: '/pages/user/anchor-center' },
		friends:          { label: '添加朋友', iconKey: 'friends',       path: '/pages/user/add-friend' },
		visitors:         { label: '新访客',   iconKey: 'visitors',      path: '/pages/user/visitor-list' },
		settings:         { label: '更多设置', iconKey: 'settings',      path: '/pages/user/more-settings' },
		edit:             { label: '编辑主页', iconKey: 'edit',          path: '/pages/user/edit-profile' }
	}

	// 过滤掉 all_features（客户端固定追加）和不可见项
	const serverList = (shortcuts || [])
		.filter((s) => s.visible && s.key !== 'all_features')
		.map((s) => {
			const meta = CLIENT_SHORTCUT_META[s.key] || {}
			const iconKey = meta.iconKey || s.key
			// 服务端可能下发未替换的 sprintf 占位符（如 `/pages/user/merchant-center?userId=%s`），
			// 视为脏数据，回退到客户端兜底路径（这些子页面都走 @LoginVerify，userId 从 token 取，URL 里不需要带）
			const linkUrl = s.linkUrl && !/%s/.test(s.linkUrl) ? s.linkUrl : ''
			const path = linkUrl || meta.path || ''
			return {
				key: s.key,
				label: s.name || meta.label || s.key,
				iconText: (meta.label || s.name || '')[0] || '?',
				iconSvg: resolveUserCenterMinimalIcon(iconKey),
				path,
				url: path,
				badgeCount: s.badgeCount || 0
			}
		})

	// 过渡期：服务端没返回任何数据时，不追加空列表末尾的"全部功能"显得突兀
	// 返回空数组 + 全部功能兜底

	// 末尾固定追加"全部功能"
	const allFunctionsEntry = {
		key: 'all-functions',
		label: '全部功能',
		iconText: '全',
		iconSvg: resolveUserCenterMinimalIcon('all-functions'),
		path: '/pages/user/all-functions',
		url: '/pages/user/all-functions',
		badgeCount: 0
	}

	return [...serverList, allFunctionsEntry]
}

/**
 * ContentTabDto → 列表组件可消费的 item 格式
 */
function adaptContentItem(apiItem, clientTabKey = 'dynamic') {
	const type = apiItem.type || 'image'
	const isVideo = type === 'video'
	const hasMedia = isVideo || type === 'image'
	const itemId = String(apiItem.momentId)

	let detailUrl
	if (clientTabKey === 'works') {
		detailUrl = buildVideoWorksPageUrl({
			level1: 'mine',
			videoId: `api-work-${itemId}`
		})
	} else if (isVideo) {
		detailUrl = buildVideoDetailPageUrl({
			level1: 'mine',
			level2: 'recommend',
			source: 'user-dynamic-detail',
			videoId: `api-video-${itemId}`
		})
	} else {
		detailUrl = `/pages/user/note-detail?noteId=${itemId}`
	}

	return {
		id: itemId,
		contentType: isVideo ? 'video' : 'note',
		hasMedia,
		title: apiItem.title || '',
		coverUrl: apiItem.coverUrl || '',
		coverBackground: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
		viewCountText: formatCount(apiItem.viewCount),
		likeCountText: formatCount(apiItem.likeCount),
		commentCountText: formatCount(apiItem.commentCount),
		playCountText: formatCount(apiItem.viewCount),
		detailUrl
	}
}

// ── 工具函数 ──────────────────────────────────────

function extractAvatarText(nickname) {
	if (!nickname) return ''
	return nickname.charAt(0)
}

function formatCount(num) {
	if (num == null || num === 0) return ''
	const n = Number(num)
	if (n >= 10000) {
		return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
	}
	return String(n)
}
