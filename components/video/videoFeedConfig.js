import { buildNavigationIndexRoute, buildNavigationTargetUrl } from '@/components/common/navigation/navigationActionProtocol.js'
import { NAV_CONFIG, VIDEO_FEED_HOME_NAV_KEY, VIDEO_FEED_HOME_NAV_LABEL } from '@/components/home/indexNavigationConfig'

export const VIDEO_FEED_PAGE_PATH = '/pages/video/feed'
export const VIDEO_WORKS_PAGE_PATH = '/pages/video/works'
export const VIDEO_DETAIL_PAGE_PATH = '/pages/video/detail'
export const VIDEO_FEED_SOURCE_URL = 'https://www.clmcat.com/static/video/kaojingchongwu.mp4'
export const VIDEO_FEED_WORKS_OWNER = 'mine'
export { VIDEO_FEED_HOME_NAV_KEY, VIDEO_FEED_HOME_NAV_LABEL }

const VIDEO_FEED_POSTER_POOL = [
	'/static/images/home/live-banner-1.jpg',
	'/static/images/home/live-banner-2.jpg',
	'/static/images/home/live-banner-3.jpg'
]

export const VIDEO_FEED_MODE = Object.freeze({
	HOME_FEED: 'home-feed',
	DETAIL_ONLY: 'detail-only',
	MY_WORKS: 'my-works'
})

export const VIDEO_FEED_SOURCE = Object.freeze({
	RECOMMEND_FEED: 'recommend-feed',
	RECOMMEND_DETAIL: 'recommend-detail',
	USER_DYNAMIC_DETAIL: 'user-dynamic-detail',
	NOTIFICATION_DETAIL: 'notification-detail',
	HISTORY_DETAIL: 'history-detail',
	USER_WORKS: 'user-works'
})

const VIDEO_FEED_MODE_MAP = Object.freeze({
	'': VIDEO_FEED_MODE.HOME_FEED,
	[VIDEO_FEED_MODE.HOME_FEED]: VIDEO_FEED_MODE.HOME_FEED,
	feed: VIDEO_FEED_MODE.HOME_FEED,
	nav: VIDEO_FEED_MODE.HOME_FEED,
	[VIDEO_FEED_MODE.DETAIL_ONLY]: VIDEO_FEED_MODE.DETAIL_ONLY,
	detail: VIDEO_FEED_MODE.DETAIL_ONLY,
	'video-detail': VIDEO_FEED_MODE.DETAIL_ONLY,
	[VIDEO_FEED_MODE.MY_WORKS]: VIDEO_FEED_MODE.MY_WORKS,
	works: VIDEO_FEED_MODE.MY_WORKS,
	'mine-works': VIDEO_FEED_MODE.MY_WORKS
})

const LEGACY_FROM_MODE_MAP = Object.freeze({
	'recommend-feed-nav': VIDEO_FEED_MODE.HOME_FEED,
	'recommend-feed': VIDEO_FEED_MODE.DETAIL_ONLY,
	'user-dynamic-video': VIDEO_FEED_MODE.DETAIL_ONLY,
	'notification-video': VIDEO_FEED_MODE.DETAIL_ONLY,
	'history-video': VIDEO_FEED_MODE.DETAIL_ONLY,
	'user-work': VIDEO_FEED_MODE.MY_WORKS
})

const DETAIL_SOURCE_LIST_MAP = Object.freeze({
	[VIDEO_FEED_SOURCE.RECOMMEND_DETAIL]: Array.from({ length: 3 }, (_, index) =>
		createVideoItem({
			id: `recommend-detail-video-${index + 1}`,
			title: `推荐视频详情 ${index + 1}`,
			desc: '独立视频详情入口，当前只保留返回按钮和 video 布局。',
			source: VIDEO_FEED_SOURCE.RECOMMEND_DETAIL,
			authorName: `推荐作者${index + 1}`,
			sceneLabel: '视频详情'
		})
	),
	[VIDEO_FEED_SOURCE.USER_DYNAMIC_DETAIL]: Array.from({ length: 3 }, (_, index) =>
		createVideoItem({
			id: `user-dynamic-video-${index + 1}`,
			title: `个人中心动态视频 ${index + 1}`,
			desc: '个人中心动态进入的视频详情入口。',
			source: VIDEO_FEED_SOURCE.USER_DYNAMIC_DETAIL,
			authorName: '我的动态',
			sceneLabel: '视频详情'
		})
	),
	[VIDEO_FEED_SOURCE.NOTIFICATION_DETAIL]: Array.from({ length: 3 }, (_, index) =>
		createVideoItem({
			id: `notification-video-${index + 1}`,
			title: `通知视频详情 ${index + 1}`,
			desc: '通知进入的视频详情入口。',
			source: VIDEO_FEED_SOURCE.NOTIFICATION_DETAIL,
			authorName: '通知动态',
			sceneLabel: '视频详情'
		})
	),
	[VIDEO_FEED_SOURCE.HISTORY_DETAIL]: Array.from({ length: 3 }, (_, index) =>
		createVideoItem({
			id: `history-video-${index + 1}`,
			title: `历史视频详情 ${index + 1}`,
			desc: '浏览历史进入的视频详情入口。',
			source: VIDEO_FEED_SOURCE.HISTORY_DETAIL,
			authorName: '浏览历史',
			sceneLabel: '视频详情'
		})
	)
})

const FEED_SHELL_VIDEO_LIST = Array.from({ length: 3 }, (_, index) =>
	createVideoItem({
		id: `feed-shell-video-${index + 1}`,
		title: `短视频轨道 ${index + 1}`,
		desc: '当前页只保留顶部导航、底部导航和视频切换区域容器。',
		source: VIDEO_FEED_SOURCE.RECOMMEND_FEED,
		authorName: `短视频作者${index + 1}`,
		sceneLabel: '短视频推荐'
	})
)

const worksVideoSourceCache = Object.create(null)

export function buildVideoFeedPageUrl({
	level1 = 'home',
	level2 = 'recommend',
	level3 = '',
	mode = VIDEO_FEED_MODE.HOME_FEED,
	source = '',
	videoId = '',
	ownerId = '',
	from = ''
} = {}) {
	const normalizedMode = normalizeMode(mode, from)
	return buildNavigationTargetUrl(resolvePagePathByMode(normalizedMode), {
		level1,
		level2,
		level3,
		mode: normalizedMode,
		source: normalizeSource(source, normalizedMode),
		videoId,
		ownerId,
		from
	})
}

export function buildVideoDetailPageUrl({
	level1 = 'home',
	level2 = 'recommend',
	level3 = '',
	source = VIDEO_FEED_SOURCE.RECOMMEND_DETAIL,
	videoId = ''
} = {}) {
	return buildNavigationTargetUrl(VIDEO_DETAIL_PAGE_PATH, {
		level1,
		level2,
		level3,
		source: normalizeSource(source, VIDEO_FEED_MODE.DETAIL_ONLY),
		videoId
	})
}

export function buildVideoWorksPageUrl({
	level1 = 'mine',
	level2 = '',
	level3 = '',
	ownerId = VIDEO_FEED_WORKS_OWNER,
	videoId = ''
} = {}) {
	return buildNavigationTargetUrl(VIDEO_WORKS_PAGE_PATH, {
		level1,
		level2,
		level3,
		ownerId: `${ownerId || VIDEO_FEED_WORKS_OWNER}`.trim() || VIDEO_FEED_WORKS_OWNER,
		videoId
	})
}

export function buildVideoFeedDetailUrl(options = {}) {
	return buildVideoDetailPageUrl(options)
}

export function buildUserWorkVideoFeedUrl(options = {}) {
	return buildVideoWorksPageUrl(options)
}

export function normalizeVideoFeedRoute(options = {}) {
	const mode = normalizeMode(options.mode, options.from)
	const level1 = normalizeLevel1(options.level1)
	const level2 = normalizeLevel2(options.level2)
	const ownerId = `${options.ownerId || VIDEO_FEED_WORKS_OWNER}`.trim() || VIDEO_FEED_WORKS_OWNER
	const source = normalizeSource(options.source, mode)
	const videoId = `${options.videoId || ''}`.trim()

	return {
		level1,
		level2,
		level3: `${options.level3 || ''}`.trim(),
		mode,
		source,
		ownerId,
		videoId: resolveVideoId({ mode, source, ownerId, videoId }),
		from: `${options.from || ''}`.trim()
	}
}

export function getVideoFeedSceneCapabilities(routeState = {}) {
	switch (routeState.mode) {
		case VIDEO_FEED_MODE.DETAIL_ONLY:
			return {
				showTopNav: false,
				showBottomNav: false,
				showBackButton: true,
				enableSwipe: false,
				enableRefresh: false,
				enableLoadNext: false,
				enableLoadPrev: false
			}
		case VIDEO_FEED_MODE.MY_WORKS:
			return {
				showTopNav: false,
				showBottomNav: false,
				showBackButton: true,
				enableSwipe: true,
				enableRefresh: false,
				enableLoadNext: false,
				enableLoadPrev: false
			}
		case VIDEO_FEED_MODE.HOME_FEED:
		default:
			return {
				showTopNav: true,
				showBottomNav: true,
				showBackButton: false,
				enableSwipe: true,
				enableRefresh: false,
				enableLoadNext: false,
				enableLoadPrev: false
			}
	}
}

export function buildVideoFeedSceneLabel(routeState = {}) {
	switch (routeState.mode) {
		case VIDEO_FEED_MODE.MY_WORKS:
			return '视频作品'
		case VIDEO_FEED_MODE.DETAIL_ONLY:
			return '视频详情'
		default:
			return '短视频'
	}
}

export async function loadVideoFeedBootstrap(routeState = {}) {
	const normalizedRoute = normalizeVideoFeedRoute(routeState)
	const items = resolveRouteItems(normalizedRoute)

	return createAsyncPayload({
		items,
		activeIndex: 0,
		loadedStart: 0,
		loadedEnd: items.length,
		hasMorePrev: false,
		hasMoreNext: false
	})
}

export async function loadVideoFeedEdgePage({
	loadedStart = 0,
	loadedEnd = 0
} = {}) {
	return createAsyncPayload({
		items: [],
		loadedStart,
		loadedEnd,
		hasMorePrev: false,
		hasMoreNext: false
	})
}

export async function refreshVideoFeedWindow(routeState = {}, activeVideoId = '') {
	const normalizedRoute = normalizeVideoFeedRoute({
		...routeState,
		videoId: activeVideoId || routeState.videoId || ''
	})
	const items = resolveRouteItems(normalizedRoute)

	return createAsyncPayload({
		items,
		activeIndex: 0,
		loadedStart: 0,
		loadedEnd: items.length,
		hasMorePrev: false,
		hasMoreNext: false
	})
}

export function resolveVideoDetailItem(options = {}) {
	const normalizedRoute = normalizeVideoFeedRoute({
		...options,
		mode: VIDEO_FEED_MODE.DETAIL_ONLY
	})
	return cloneVideoItem(resolveRouteItems(normalizedRoute)[0] || null)
}

export function getVideoWorksList(ownerId = VIDEO_FEED_WORKS_OWNER) {
	return cloneVideoItemList(resolveWorksList(ownerId))
}

function resolvePagePathByMode(mode = VIDEO_FEED_MODE.HOME_FEED) {
	switch (mode) {
		case VIDEO_FEED_MODE.DETAIL_ONLY:
			return VIDEO_DETAIL_PAGE_PATH
		case VIDEO_FEED_MODE.MY_WORKS:
			return VIDEO_WORKS_PAGE_PATH
		case VIDEO_FEED_MODE.HOME_FEED:
		default:
			return VIDEO_FEED_PAGE_PATH
	}
}

function normalizeMode(mode = '', from = '') {
	const rawMode = `${mode || ''}`.trim()
	const rawFrom = `${from || ''}`.trim()
	return VIDEO_FEED_MODE_MAP[rawMode] || LEGACY_FROM_MODE_MAP[rawFrom] || VIDEO_FEED_MODE.HOME_FEED
}

function normalizeSource(source = '', mode = VIDEO_FEED_MODE.HOME_FEED) {
	const rawSource = `${source || ''}`.trim()
	if (rawSource && Object.values(VIDEO_FEED_SOURCE).includes(rawSource)) {
		return rawSource
	}

	if (mode === VIDEO_FEED_MODE.MY_WORKS) {
		return VIDEO_FEED_SOURCE.USER_WORKS
	}

	if (mode === VIDEO_FEED_MODE.DETAIL_ONLY) {
		return VIDEO_FEED_SOURCE.RECOMMEND_DETAIL
	}

	return VIDEO_FEED_SOURCE.RECOMMEND_FEED
}

function normalizeLevel1(level1 = '') {
	const normalizedLevel1 = `${level1 || ''}`.trim()
	return NAV_CONFIG.tabs.some(t => t.key === normalizedLevel1) ? normalizedLevel1 : NAV_CONFIG.defaultLevel1
}

function normalizeLevel2(level2 = '') {
	const normalizedLevel2 = `${level2 || ''}`.trim()
	if (!normalizedLevel2) { return NAV_CONFIG.home.defaultLevel2 }
	const homeTab = NAV_CONFIG.tabs.find(t => t.key === 'home')
	if (!homeTab || !Array.isArray(homeTab.subNavs)) { return NAV_CONFIG.home.defaultLevel2 }
	const match = homeTab.subNavs.find(s => s.key === normalizedLevel2 && s.componentKey)
	return match ? normalizedLevel2 : NAV_CONFIG.home.defaultLevel2
}

function resolveRouteItems(routeState = {}) {
	switch (routeState.mode) {
		case VIDEO_FEED_MODE.DETAIL_ONLY:
			return [resolveDetailItem(routeState)].filter(Boolean)
		case VIDEO_FEED_MODE.MY_WORKS:
			return cloneVideoItemList(resolveWorksList(routeState.ownerId))
		case VIDEO_FEED_MODE.HOME_FEED:
		default:
			return cloneVideoItemList(FEED_SHELL_VIDEO_LIST)
	}
}

function resolveVideoId({ mode = VIDEO_FEED_MODE.HOME_FEED, source = '', ownerId = '', videoId = '' } = {}) {
	const normalizedVideoId = `${videoId || ''}`.trim()
	if (normalizedVideoId) {
		return normalizedVideoId
	}

	if (mode === VIDEO_FEED_MODE.DETAIL_ONLY) {
		return resolveDetailList(source)[0]?.id || ''
	}

	if (mode === VIDEO_FEED_MODE.MY_WORKS) {
		return resolveWorksList(ownerId)[0]?.id || ''
	}

	return FEED_SHELL_VIDEO_LIST[0]?.id || ''
}

function resolveDetailList(source = VIDEO_FEED_SOURCE.RECOMMEND_DETAIL) {
	return DETAIL_SOURCE_LIST_MAP[source] || DETAIL_SOURCE_LIST_MAP[VIDEO_FEED_SOURCE.RECOMMEND_DETAIL]
}

function resolveDetailItem(routeState = {}) {
	const detailList = resolveDetailList(routeState.source)
	const matchedItem = detailList.find((item) => item.id === routeState.videoId)
	return cloneVideoItem(matchedItem || detailList[0] || null)
}

function resolveWorksList(ownerId = VIDEO_FEED_WORKS_OWNER) {
	const normalizedOwnerId = `${ownerId || VIDEO_FEED_WORKS_OWNER}`.trim() || VIDEO_FEED_WORKS_OWNER
	if (!worksVideoSourceCache[normalizedOwnerId]) {
		worksVideoSourceCache[normalizedOwnerId] = Array.from({ length: 6 }, (_, index) =>
			createVideoItem({
				id: `work-video-${index + 1}`,
				title: `视频作品 ${index + 1}`,
				desc: '独立作品 nvue 页入口，当前只保留基础视频切换区域容器。',
				source: VIDEO_FEED_SOURCE.USER_WORKS,
				ownerId: normalizedOwnerId,
				authorName: normalizedOwnerId === VIDEO_FEED_WORKS_OWNER ? '我的作品' : `作品用户${index + 1}`,
				sceneLabel: '视频作品'
			})
		)
	}

	return worksVideoSourceCache[normalizedOwnerId]
}

function createVideoItem({
	id,
	title,
	desc,
	source,
	authorName,
	sceneLabel,
	ownerId = '',
	poster = '',
	url = VIDEO_FEED_SOURCE_URL
} = {}) {
	const normalizedId = `${id || ''}`.trim()
	return {
		id: normalizedId,
		title: `${title || ''}`.trim(),
		desc: `${desc || ''}`.trim(),
		source: `${source || VIDEO_FEED_SOURCE.RECOMMEND_FEED}`.trim(),
		authorName: `${authorName || '千语'}`.trim(),
		sceneLabel: `${sceneLabel || '短视频'}`.trim(),
		statText: '',
		ownerId: `${ownerId || ''}`.trim(),
		poster: `${poster || resolveVideoPoster(normalizedId)}`.trim(),
		url
	}
}

function resolveVideoPoster(id = '') {
	const normalizedId = `${id || ''}`.trim()
	if (!normalizedId) {
		return VIDEO_FEED_POSTER_POOL[0]
	}

	let hash = 0
	for (let index = 0; index < normalizedId.length; index += 1) {
		hash = (hash * 31 + normalizedId.charCodeAt(index)) >>> 0
	}

	return VIDEO_FEED_POSTER_POOL[hash % VIDEO_FEED_POSTER_POOL.length]
}

function createAsyncPayload(payload, delayMs = 30) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(payload)
		}, delayMs)
	})
}

function cloneVideoItemList(list = []) {
	return list.map((item) => cloneVideoItem(item))
}

function cloneVideoItem(item) {
	return item ? { ...item } : null
}
