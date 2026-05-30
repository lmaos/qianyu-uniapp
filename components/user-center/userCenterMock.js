import {
	resolveUserCenterActionIcon,
	resolveUserCenterMinimalIcon
} from '@/components/user-center/main/userCenterIcons.js'

const DEFAULT_USER_ID = 'mine-self'
const MAIN_PAGE_SIZE = 8
const COMMENT_PAGE_SIZE = 10
const NOTE_DETAIL_COMMENT_PAGE_SIZE = 8
const NOTE_DETAIL_COMMENT_LOAD_DELAY_MS = 320

const COVER_BACKGROUND_LIST = [
	'linear-gradient(135deg, #fdf2f8 0%, #e0f2fe 100%)',
	'linear-gradient(135deg, #fff7ed 0%, #ede9fe 100%)',
	'linear-gradient(135deg, #ecfeff 0%, #fef3c7 100%)',
	'linear-gradient(135deg, #eff6ff 0%, #fce7f3 100%)'
]

const THUMB_BACKGROUND_LIST = [
	'linear-gradient(135deg, rgba(254, 44, 85, 0.18) 0%, rgba(255, 122, 69, 0.18) 100%)',
	'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(14, 165, 233, 0.18) 100%)',
	'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)',
	'linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)'
]

const SHARED_VIDEO_MOCK_URL = 'https://wwwclmcat.oss-cn-beijing.aliyuncs.com/static/video/kaojingchongwu.mp4'
const MOMENT_BASE_ID = 980000
const MOMENT_VIDEO_TITLE_LIST = [
	'把内容封面做干净一点，用户第一眼先看到作品主题。',
	'短视频频道先对齐整屏浏览，再慢慢补评论和互动抽屉。',
	'推荐流、个人中心、视频详情保持同一套作品数据协议。',
	'先让列表首屏稳，再补真实接口和复杂互动逻辑。',
	'把横版、方版和竖版视频都提前纳入适配范围。',
	'播放器先保证 App 稳定，再继续补齐业务层交互。'
]
const MOMENT_VIDEO_DESC_LIST = [
	'当前先用统一适配层补齐作者、互动与展示字段，未来替换真实接口时只改数据映射。',
	'列表先显示封面，再在当前卡片真正开始播放时挂载视频，避免 App 首屏黑屏感。',
	'横版视频优先完整展示主体，竖版视频继续保持沉浸式整屏浏览。',
	'先把弱网 loading、错误占位和切换播放状态理顺，再接评论、点赞与分享业务。',
	'当前 mock 用于验证 Android / iOS 的布局层级、滚动切换和动作栏触达面积。',
	'详情页继续沿用统一 workId，保证推荐流和详情页的数据接力简单可替换。'
]
const MOMENT_VIDEO_MUSIC_LIST = ['原声 · 千隅推荐流', '原声 · 今日灵感', '原声 · 直播切片', '原声 · 内容精选']
const MOMENT_VIDEO_DIMENSION_LIST = [
	{ width: 1080, height: 1920 },
	{ width: 720, height: 1280 },
	{ width: 1920, height: 1080 },
	{ width: 1080, height: 1080 }
]
const MOMENT_COUNTRY_LIST = ['中国', '中国', '日本', '新加坡']

const LOCATION_TEXT = '广东省-深圳市-南山区'

const PROFILE_INFO = {
	userId: DEFAULT_USER_ID,
	nickname: '千隅同学',
	displayId: 'qianyu_1024',
	avatarText: '千',
	avatarBackground: 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)',
	coverBackground: 'linear-gradient(135deg, rgba(255, 241, 242, 0.98) 0%, rgba(239, 246, 255, 0.98) 100%)',
	nestTitle: '我的小窝正在慢慢长大',
	nestStatusList: ['连续记录 18 天', '今晚宜轻吐槽', '适合被发现'],
	moodPromptText: '今天更适合发一句轻吐槽或者一张生活碎片，让同频的人慢慢路过你。',
	signalSummaryList: [
		{ key: 'echo', label: '今日回响', value: '18' },
		{ key: 'collection', label: '小窝收藏', value: '42' },
		{ key: 'playmate', label: '玩伴线索', value: '9' }
	],
	signature:
		'认真记录生活里的每一点灵感，也在直播、电商和内容创作里持续尝试新的表达。这里的所有数据均为 MOCK，占位方便后续替换接口。',
	locationText: LOCATION_TEXT,
	visitorCount: 28,
	statsList: [
		{ key: 'likes', label: '获赞', value: '12.8w' },
		{ key: 'follow', label: '关注', value: '326' },
		{ key: 'fans', label: '粉丝', value: '8.6w' }
	]
}

const MOMENT_AUTHOR_SOURCE_LIST = Array.from({ length: 8 }, (_, index) => createMomentAuthorProfile(index + 1))

const QUICK_ACTION_LIST = [
	{ key: 'anchor-center', label: '主播中心', iconText: '播', path: '/pages/user/anchor-center' },
	{ key: 'orders', label: '我的订单', iconText: '单', path: '/pages/user/order-list' },
	{ key: 'merchant', label: '商家管理', iconText: '商', path: '/pages/user/merchant-center' },
	{ key: 'wallet', label: '我的钱包', iconText: '钱', path: '/pages/user/wallet' },
	{ key: 'all-functions', label: '全部功能', iconText: '全', path: '/pages/user/all-functions' }
]

const MAIN_TAB_LIST = [
	{ key: 'dynamic', label: '动态' },
	{ key: 'works', label: '作品' },
	{ key: 'likes', label: '喜欢' },
	{ key: 'history', label: '历史' }
]

const ORDER_STATUS_TAB_LIST = [
	{ key: 'all', label: '全部' },
	{ key: 'pending-pay', label: '待付款' },
	{ key: 'pending-send', label: '待发货' },
	{ key: 'pending-receive', label: '待收货' },
	{ key: 'completed', label: '已完成' },
	{ key: 'refund', label: '退款/售后' }
]

const ANCHOR_PERIOD_LIST = [
	{ key: 'today', label: '今日' },
	{ key: 'seven-days', label: '7天' },
	{ key: 'thirty-days', label: '30天' }
]

const DYNAMIC_SOURCE_LIST = Array.from({ length: 22 }, (_, index) => createDynamicItem(index + 1))
const WORK_SOURCE_LIST = Array.from({ length: 24 }, (_, index) => createWorkItem(index + 1))
const SHORT_VIDEO_MOMENT_SOURCE_LIST = Array.from({ length: 30 }, (_, index) => createMomentVoMock(index + 1))
const LIKE_SOURCE_LIST = DYNAMIC_SOURCE_LIST.slice(2, 12)
const HISTORY_SOURCE_LIST = Array.from({ length: 12 }, (_, index) => createHistoryItem(index + 1))
const VISITOR_SOURCE_LIST = Array.from({ length: 16 }, (_, index) => createVisitorItem(index + 1))
const FOLLOW_SOURCE_LIST = Array.from({ length: 20 }, (_, index) => createRelationItem(index + 1, 'follow'))
const FAN_SOURCE_LIST = Array.from({ length: 18 }, (_, index) => createRelationItem(index + 1, 'fans'))
const ADD_FRIEND_SOURCE_LIST = Array.from({ length: 12 }, (_, index) => createAddFriendItem(index + 1))
const ORDER_SOURCE_LIST = Array.from({ length: 15 }, (_, index) => createOrderItem(index + 1))
const NOTE_COMMENT_SOURCE_LIST = Array.from({ length: 18 }, (_, index) => createCommentThread(index + 1))

export function getUserCenterMainMock(userId = DEFAULT_USER_ID) {
	return {
		userId,
		profileInfo: { ...PROFILE_INFO },
		quickActionList: QUICK_ACTION_LIST.map((item) => ({
			...item,
			iconSvg: resolveUserCenterMinimalIcon(item.key),
			url: buildPageUrl(item.path, { userId })
		})),
		tabList: MAIN_TAB_LIST.map((item) => ({ ...item })),
		pageSize: MAIN_PAGE_SIZE,
		dynamicSourceList: DYNAMIC_SOURCE_LIST.map((item) => ({ ...item })),
		workSourceList: WORK_SOURCE_LIST.map((item) => ({ ...item })),
		likeSourceList: LIKE_SOURCE_LIST.map((item) => ({ ...item })),
		historySourceList: HISTORY_SOURCE_LIST.map((item) => ({ ...item })),
		addFriendUrl: buildPageUrl('/pages/user/add-friend', { userId }),
		visitorUrl: buildPageUrl('/pages/user/visitor-list', { userId }),
		settingsUrl: buildPageUrl('/pages/user/more-settings', { userId }),
		qrcodeUrl: buildPageUrl('/pages/user/qrcode', { userId }),
		editProfileUrl: buildPageUrl('/pages/user/edit-profile', { userId }),
		followUrl: buildPageUrl('/pages/user/relation-list', { userId, type: 'follow' }),
		fansUrl: buildPageUrl('/pages/user/relation-list', { userId, type: 'fans' })
	}
}

export function getAddFriendPageMock(userId = DEFAULT_USER_ID) {
	return {
		userId,
		searchPlaceholder: '搜索用户昵称 / 专属ID',
		suggestionList: ADD_FRIEND_SOURCE_LIST.map((item) => ({ ...item }))
	}
}

export function getVisitorListPageMock(userId = DEFAULT_USER_ID) {
	return {
		userId,
		totalText: '近30天访问',
		visitorList: VISITOR_SOURCE_LIST.map((item) => ({ ...item }))
	}
}

export function getRelationListPageMock(type = 'follow', userId = DEFAULT_USER_ID) {
	return {
		userId,
		type,
		title: type === 'fans' ? '粉丝列表' : '关注列表',
		relationList: (type === 'fans' ? FAN_SOURCE_LIST : FOLLOW_SOURCE_LIST).map((item) => ({ ...item }))
	}
}

export function getEditProfilePageMock(userId = DEFAULT_USER_ID) {
	return {
		userId,
		formState: {
			avatarText: PROFILE_INFO.avatarText,
			avatarBackground: PROFILE_INFO.avatarBackground,
			nickname: PROFILE_INFO.nickname,
			signature: PROFILE_INFO.signature,
			gender: '女',
			birthday: '1998-08-16',
			locationText: PROFILE_INFO.locationText,
			displayId: PROFILE_INFO.displayId,
			coverBackground: PROFILE_INFO.coverBackground
		}
	}
}

export function getMoreSettingsPageMock(userId = DEFAULT_USER_ID) {
	return {
		userId,
		menuList: [
			{ key: 'privacy-security', label: '隐私与安全设置', desc: '账号保护、黑名单、权限管理' },
			{ key: 'wallet', label: '我的钱包', desc: '查看金币、钻石与商通宝' },
			{ key: 'orders', label: '我的订单', desc: '商城订单与售后状态' },
			{ key: 'merchant', label: '商家管理', desc: '店铺、商品、结算管理' },
			{ key: 'service', label: '客服投诉', desc: '问题反馈与申诉入口' },
			{ key: 'verify', label: '账户认证', desc: '实名认证与资料审核' },
			{ key: 'clear-cache', label: '清理缓存', desc: '清理当前 MOCK 缓存数据' },
			{ key: 'logout', label: '退出登录账户', desc: '退出当前账号占位' },
			{ key: 'destroy', label: '注销账号', desc: '账号注销流程占位' }
		],
		actionUrlMap: {
			wallet: buildPageUrl('/pages/user/wallet', { userId }),
			orders: buildPageUrl('/pages/user/order-list', { userId }),
			merchant: buildPageUrl('/pages/user/merchant-center', { userId })
		}
	}
}

export function getWalletPageMock(userId = DEFAULT_USER_ID) {
	return {
		userId,
		assetList: [
			{ key: 'gold', label: '金币', value: '12,600', desc: '用户线上充值通用币' },
			{ key: 'diamond', label: '钻石', value: '3,260', desc: '直播业务可提现币种' },
			{ key: 'merchant-coin', label: '商通宝', value: '8,520', desc: '电商商家专属可提现币种' }
		],
		recordList: [
			{ id: 'wallet-record-1', title: '直播收益结算', amount: '+260', type: '钻石', timeText: '今天 10:24' },
			{ id: 'wallet-record-2', title: '商城订单分润', amount: '+820', type: '商通宝', timeText: '昨天 20:18' },
			{ id: 'wallet-record-3', title: '金币充值', amount: '+2,000', type: '金币', timeText: '05-18 12:16' }
		]
	}
}

export function getOrderListPageMock(userId = DEFAULT_USER_ID) {
	const orderList = ORDER_SOURCE_LIST.map((item) => ({
		...item,
		coverBackground: item.thumbnailBackground,
		coverText: item.thumbnailText,
		price: item.priceText,
		specText: '默认规格 / 标准版'
	}))
	return {
		userId,
		statusTabList: ORDER_STATUS_TAB_LIST.map((item) => ({ ...item })),
		orderSourceList: orderList.map((item) => ({ ...item })),
		orderList
	}
}

export function getMerchantCenterPageMock(userId = DEFAULT_USER_ID) {
	const overviewList = [
		{ key: 'shop-score', label: '店铺评分', value: '4.9' },
		{ key: 'online-goods', label: '在售商品', value: '86' },
		{ key: 'today-order', label: '今日订单', value: '42' },
		{ key: 'await-settle', label: '待结算', value: '¥8,260' }
	]
	const actionList = [
		{ key: 'goods', label: '商品管理', desc: '商品上下架、价格库存调整' },
		{ key: 'delivery', label: '发货管理', desc: '待发货订单与物流跟踪' },
		{ key: 'promotion', label: '营销活动', desc: '优惠券、满减、活动报名' }
	]
	return {
		userId,
		overviewList,
		actionList,
		statList: overviewList.map((item) => ({ ...item })),
		menuList: actionList.map((item) => ({ ...item }))
	}
}

export function getAnchorCenterPageMock(userId = DEFAULT_USER_ID) {
	const periodList = ANCHOR_PERIOD_LIST.map((item) => ({ ...item }))
	const statMap = {
		today: [
			{ key: 'duration', label: '开播时长', value: '3.8h' },
			{ key: 'income', label: '直播收益', value: '¥826' },
			{ key: 'new-fans', label: '新增粉丝', value: '126' }
		],
		'seven-days': [
			{ key: 'duration', label: '开播时长', value: '28.6h' },
			{ key: 'income', label: '直播收益', value: '¥6,218' },
			{ key: 'new-fans', label: '新增粉丝', value: '806' }
		],
		'thirty-days': [
			{ key: 'duration', label: '开播时长', value: '106h' },
			{ key: 'income', label: '直播收益', value: '¥21,860' },
			{ key: 'new-fans', label: '新增粉丝', value: '2,986' }
		]
	}
	return {
		userId,
		periodList,
		statMap,
		periodTabList: periodList.map((item) => ({ ...item })),
		periodStatsMap: {
			today: statMap.today.map((item) => ({ ...item })),
			'seven-days': statMap['seven-days'].map((item) => ({ ...item })),
			'thirty-days': statMap['thirty-days'].map((item) => ({ ...item }))
		},
		liveTips: [
			'直播前请检查封面、标题与商品挂载是否完整。',
			'支持后续替换真实直播状态接口与数据统计接口。'
		]
	}
}

export function getAllFunctionsPageMock(userId = DEFAULT_USER_ID) {
	const functionList = [
		{ key: 'wallet', label: '我的钱包', iconText: '钱', url: buildPageUrl('/pages/user/wallet', { userId }) },
		{ key: 'orders', label: '订单中心', iconText: '单', url: buildPageUrl('/pages/user/order-list', { userId }) },
		{ key: 'merchant', label: '商家管理', iconText: '商', url: buildPageUrl('/pages/user/merchant-center', { userId }) },
		{ key: 'anchor', label: '主播中心', iconText: '播', url: buildPageUrl('/pages/user/anchor-center', { userId }) },
		{ key: 'friends', label: '添加朋友', iconText: '友', url: buildPageUrl('/pages/user/add-friend', { userId }) },
		{ key: 'visitors', label: '新访客', iconText: '访', url: buildPageUrl('/pages/user/visitor-list', { userId }) },
		{ key: 'settings', label: '更多设置', iconText: '设', url: buildPageUrl('/pages/user/more-settings', { userId }) },
		{ key: 'edit', label: '编辑主页', iconText: '编', url: buildPageUrl('/pages/user/edit-profile', { userId }) }
	]
	return {
		userId,
		functionList: functionList.map((item) => ({
			...item,
			iconSvg: resolveUserCenterMinimalIcon(item.key)
		})),
		actionList: functionList.map((item) => ({
			...item,
			iconSvg: resolveUserCenterMinimalIcon(item.key)
		}))
	}
}

export function getQrCodePageMock(userId = DEFAULT_USER_ID) {
	return {
		userId,
		nickname: PROFILE_INFO.nickname,
		displayId: PROFILE_INFO.displayId,
		avatarText: PROFILE_INFO.avatarText,
		avatarBackground: PROFILE_INFO.avatarBackground,
		codeText: `USER:${userId}:QR`,
		qrcodeText: `USER:${userId}:QR`
	}
}

export function getNoteDetailPageMock(noteId = '') {
	const targetItem = DYNAMIC_SOURCE_LIST.find((item) => item.id === noteId) || DYNAMIC_SOURCE_LIST[0]
	const noteInfo = {
		...targetItem,
		authorName: PROFILE_INFO.nickname,
		authorAvatarText: PROFILE_INFO.avatarText,
		authorAvatarBackground: PROFILE_INFO.avatarBackground,
		publishTimeText: '昨天 21:18',
		contentParagraphList: [
			'这是用于阶段 8 验收的图文动态详情 MOCK 数据，整体布局偏向小红书正文阅读样式。',
			'当前页面的评论列表、点赞按钮、分享按钮都只做事件派发与 mock 展示，方便后续替换真实接口。'
		],
		tagList: ['#用户中心', '#图文动态', '#MOCK数据'],
		mediaList: targetItem.hasMedia
			? [
					{ id: `${targetItem.id}-media-1`, background: targetItem.coverBackground, text: targetItem.coverText },
					{ id: `${targetItem.id}-media-2`, background: THUMB_BACKGROUND_LIST[2], text: '细节图' }
			  ]
			: []
	}
	const fullCommentSourceList = getNoteDetailCommentSourceList(noteInfo.id)
	const hasPagedComments = shouldUsePagedNoteDetailComments(noteInfo.id)
	const commentPageSize = hasPagedComments ? NOTE_DETAIL_COMMENT_PAGE_SIZE : Math.max(1, fullCommentSourceList.length)
	const initialCommentList = hasPagedComments
		? fullCommentSourceList.slice(0, commentPageSize).map((item) => cloneCommentThread(item))
		: fullCommentSourceList.map((item) => cloneCommentThread(item))
	const commentCountValue = getCommentSourceTotalCount(fullCommentSourceList)
	const likeCountValue = parseCountText(noteInfo.likeCountText)
	const watchCountValue = parseCountText(noteInfo.viewCountText)
	return {
		noteInfo,
		noteId: noteInfo.id,
		authorInfo: {
			userId: DEFAULT_USER_ID,
			nickname: noteInfo.authorName,
			avatarText: noteInfo.authorAvatarText,
			avatarBackground: noteInfo.authorAvatarBackground
		},
		publishTimeText: noteInfo.publishTimeText,
		coverBackground: noteInfo.coverBackground,
		coverText: noteInfo.coverText,
		title: noteInfo.title,
		content: noteInfo.contentParagraphList.join('\n\n'),
		watchCountValue,
		watchCount: formatCount(watchCountValue),
		likeCountValue,
		likeCount: formatCount(likeCountValue),
		commentCountValue,
		commentCount: formatCount(commentCountValue),
		liked: false,
		commentSourceList: initialCommentList,
		commentPageSize,
		commentPage: 1,
		hasNextCommentPage: hasPagedComments && initialCommentList.length < fullCommentSourceList.length,
		commentLoadDelayMs: hasPagedComments ? NOTE_DETAIL_COMMENT_LOAD_DELAY_MS : 0,
		pageSize: commentPageSize
	}
}

export function loadNoteDetailCommentPageMock(noteId = '', page = 1, pageSize = NOTE_DETAIL_COMMENT_PAGE_SIZE) {
	const fullCommentSourceList = getNoteDetailCommentSourceList(noteId)
	const safePageSize = Math.max(1, Number(pageSize) || NOTE_DETAIL_COMMENT_PAGE_SIZE)
	const safePage = Math.max(1, Number(page) || 1)
	const startIndex = (safePage - 1) * safePageSize
	const nextSourceList = fullCommentSourceList
		.slice(startIndex, startIndex + safePageSize)
		.map((item) => cloneCommentThread(item))

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				page: safePage,
				pageSize: safePageSize,
				list: nextSourceList,
				hasMore: startIndex + safePageSize < fullCommentSourceList.length,
				totalCount: getCommentSourceTotalCount(fullCommentSourceList)
			})
		}, shouldUsePagedNoteDetailComments(noteId) ? NOTE_DETAIL_COMMENT_LOAD_DELAY_MS : 0)
	})
}

export function getShortVideoMomentResponseMock() {
	return {
		status: 0,
		state: 'OK',
		content: {
			datas: SHORT_VIDEO_MOMENT_SOURCE_LIST.map((item) => cloneMomentVo(item))
		}
	}
}

// 短视频接口先对齐后端 MomentVo 结构，再在这里补齐前端展示字段，后续接真接口时只替换这层映射。
export function adaptMomentVoToVideoCard(momentVo = {}) {
	const resolvedMomentId = Number(momentVo?.momentId) || MOMENT_BASE_ID + 1
	const workIndex = resolveMomentWorkIndex(resolvedMomentId)
	const targetWork = WORK_SOURCE_LIST[workIndex] || WORK_SOURCE_LIST[0]
	const videoContent = momentVo?.content?.video || {}
	const authorInfo = resolveMomentAuthorProfile(momentVo?.authorId)
	const likeCountValue = Number(momentVo?.likes) || parseCountText(targetWork?.likeCountText)
	const commentCountValue = Number(momentVo?.comments) || parseCountText(targetWork?.commentCountText)
	const collectCountValue = 460 + workIndex * 31
	const shareCountValue = 280 + workIndex * 24
	const createTimeValue = Number(momentVo?.createTime) || Date.now()
	const workId = targetWork?.id || `work-item-${workIndex + 1}`

	return {
		id: `moment-video-${resolvedMomentId}`,
		momentId: resolvedMomentId,
		workId,
		authorId: Number(momentVo?.authorId) || 0,
		status: Number(momentVo?.status) || 0,
		contentType: momentVo?.content?.type || 'video',
		createTime: createTimeValue,
		latitude: Number(momentVo?.latitude) || 0,
		longitude: Number(momentVo?.longitude) || 0,
		country: momentVo?.country || MOMENT_COUNTRY_LIST[workIndex % MOMENT_COUNTRY_LIST.length],
		pageBackground: '#020617',
		workInfo: {
			...targetWork,
			authorName: authorInfo.nickname,
			authorAvatarText: authorInfo.avatarText,
			authorAvatarBackground: authorInfo.avatarBackground,
			shareCount: formatCount(shareCountValue),
			collectCount: formatCount(collectCountValue)
		},
		authorInfo,
		authorUrl: buildPageUrl('/pages/user-profile/user-profile', {
			userId: authorInfo.userId
		}),
		detailUrl: buildPageUrl('/pages/user/video-detail', {
			workId,
			momentId: resolvedMomentId,
			from: 'short-video'
		}),
		coverBackground: targetWork?.coverBackground || THUMB_BACKGROUND_LIST[workIndex % THUMB_BACKGROUND_LIST.length],
		videoId: videoContent?.videoId || `mock-video-${resolvedMomentId}`,
		videoUrl: videoContent?.videoUrl || SHARED_VIDEO_MOCK_URL,
		coverUrl: videoContent?.coverUrl || '',
		posterUrl: videoContent?.coverUrl || '',
		videoWidth: Number(videoContent?.width) || 0,
		videoHeight: Number(videoContent?.height) || 0,
		duration: Number(videoContent?.duration) || 0,
		durationText: formatDuration(Number(videoContent?.duration) || 0),
		title: MOMENT_VIDEO_TITLE_LIST[workIndex % MOMENT_VIDEO_TITLE_LIST.length],
		desc: MOMENT_VIDEO_DESC_LIST[workIndex % MOMENT_VIDEO_DESC_LIST.length],
		publishTimeText: formatRecentTimeText(createTimeValue),
		playCountText: targetWork?.viewCountText || formatCount(1200 + workIndex * 160),
		shareCount: formatCount(shareCountValue),
		collectCount: formatCount(collectCountValue),
		musicText: MOMENT_VIDEO_MUSIC_LIST[workIndex % MOMENT_VIDEO_MUSIC_LIST.length],
		likeCount: formatCount(likeCountValue),
		commentCount: formatCount(commentCountValue),
		liked: Boolean(momentVo?.hasLike),
		collected: workIndex % 4 === 0,
		rawMoment: cloneMomentVo(momentVo),
		videoMeta: {
			videoId: videoContent?.videoId || `mock-video-${resolvedMomentId}`,
			width: Number(videoContent?.width) || 0,
			height: Number(videoContent?.height) || 0,
			duration: Number(videoContent?.duration) || 0
		}
	}
}

export function getVideoDetailPageMock(workToken = '') {
	const targetMoment = resolveMomentVoByVideoToken(workToken)
	return adaptMomentVoToVideoCard(targetMoment)
}

export function createMainTabPageState(sourceList = [], pageSize = MAIN_PAGE_SIZE, page = 1) {
	return sourceList.slice(0, pageSize * page)
}

export function filterOrderListByStatus(orderList = [], status = 'all') {
	if (!status || status === 'all') {
		return [...orderList]
	}

	return orderList.filter((item) => item.status === status)
}

export function buildPageUrl(path, query = {}) {
	const queryString = Object.entries(query)
		.filter(([, value]) => value !== undefined && value !== null && `${value}` !== '')
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&')

	return queryString ? `${path}?${queryString}` : path
}

function createDynamicItem(index) {
	const isVideo = index % 3 === 0
	const hasMedia = index % 5 !== 0
	const coverBackground = THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length]
	const title = isVideo
		? `视频动态第${index}条：记录今天直播间和电商联动的片段`
		: `图文动态第${index}条：关于个人中心模块拆分与交互设计的日常记录`
	const itemId = `dynamic-item-${index}`

	return {
		id: itemId,
		contentType: isVideo ? 'video' : 'note',
		title,
		coverBackground,
		coverText: isVideo ? '视频封面' : '图文封面',
		viewCountText: formatCount(1200 + index * 268),
		likeCountText: formatCount(180 + index * 38),
		commentCountText: formatCount(26 + index * 8),
		hasMedia,
		detailUrl: isVideo
			? buildPageUrl('/pages/user/video-detail', { workId: `work-item-${(index % 12) + 1}`, userId: DEFAULT_USER_ID })
			: buildPageUrl('/pages/user/note-detail', { noteId: itemId, userId: DEFAULT_USER_ID })
	}
}

function createWorkItem(index) {
	return {
		id: `work-item-${index}`,
		title: `作品${index}`,
		coverBackground: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length],
		coverText: `作品${index}`,
		playCountText: formatCount(8600 + index * 286),
		likeCountText: formatCount(920 + index * 36),
		commentCountText: formatCount(72 + index * 6),
		detailUrl: buildPageUrl('/pages/user/video-detail', { workId: `work-item-${index}`, userId: DEFAULT_USER_ID })
	}
}

function createHistoryItem(index) {
	const isVideo = index % 2 === 0
	return {
		id: `history-item-${index}`,
		title: isVideo ? `最近看过的视频作品 ${index}` : `最近浏览的图文动态 ${index}`,
		typeLabel: isVideo ? '视频' : '图文',
		timeText: `最近访问 · ${index}小时前`,
		detailUrl: isVideo
			? buildPageUrl('/pages/user/video-detail', { workId: `work-item-${index}`, userId: DEFAULT_USER_ID })
			: buildPageUrl('/pages/user/note-detail', { noteId: `dynamic-item-${index}`, userId: DEFAULT_USER_ID })
	}
}

function createVisitorItem(index) {
	return {
		id: `visitor-item-${index}`,
		nickname: `访客用户${index}`,
		avatarText: `${index}`,
		avatarBackground: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length],
		desc: index % 2 === 0 ? '看了你的最新动态' : '浏览了你的作品列表',
		timeText: `今天 ${8 + (index % 10)}:${index % 2 === 0 ? '16' : '42'}`,
		profileUrl: buildPageUrl('/pages/user-profile/user-profile', {
			userId: `visitor-user-${index}`,
			nickname: `访客用户${index}`,
			avatar: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length]
		})
	}
}

function createRelationItem(index, type) {
	return {
		id: `${type}-item-${index}`,
		nickname: type === 'fans' ? `粉丝用户${index}` : `关注用户${index}`,
		avatarText: `${type === 'fans' ? '粉' : '关'}${index}`.slice(0, 1),
		avatarBackground: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length],
		desc: type === 'fans' ? '最近互动活跃' : '内容创作者 / 电商用户',
		actionText: type === 'fans' ? '回关' : '已关注',
		profileUrl: buildPageUrl('/pages/user-profile/user-profile', {
			userId: `${type}-user-${index}`,
			nickname: type === 'fans' ? `粉丝用户${index}` : `关注用户${index}`,
			avatar: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length]
		})
	}
}

function createAddFriendItem(index) {
	return {
		id: `add-friend-item-${index}`,
		nickname: `推荐好友${index}`,
		displayId: `friend_${1200 + index}`,
		avatarText: `${index}`,
		avatarBackground: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length],
		desc: index % 2 === 0 ? '共同关注了 12 位好友' : '最近发布了优质作品'
	}
}

function createOrderItem(index) {
	const statusList = ['pending-pay', 'pending-send', 'pending-receive', 'completed', 'refund']
	const statusTextMap = {
		'pending-pay': '待付款',
		'pending-send': '待发货',
		'pending-receive': '待收货',
		completed: '已完成',
		refund: '退款中'
	}
	const status = statusList[(index - 1) % statusList.length]
	return {
		id: `user-order-${index}`,
		status,
		statusText: statusTextMap[status],
		title: `商城订单商品 ${index}`,
		thumbnailText: `货${index}`,
		thumbnailBackground: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length],
		priceText: `${199 + index * 18}`,
		quantity: (index % 3) + 1,
		timeText: `2026-05-${(index % 9) + 10} 1${index % 10}:2${index % 6}`
	}
}

function createCommentThread(index) {
	const replyCount = (index % 5) + (index % 2 === 0 ? 1 : 0)
	const replySourceList = Array.from({ length: replyCount }, (_, replyIndex) =>
		createCommentReplyItem(index, replyIndex + 1)
	)

	return {
		id: `comment-item-${index}`,
		nickname: `评论用户${index}`,
		avatarText: `${index}`,
		avatarBackground: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length],
		content: `这是评论占位内容 ${index}，后续可直接替换成真实评论接口返回字段。`,
		timeText: `今天 ${9 + (index % 10)}:${index % 2 === 0 ? '12' : '48'}`,
		likeCountValue: 18 + index * 4,
		likeCountText: formatCount(18 + index * 4),
		liked: index % 4 === 0,
		replySourceList,
		visibleReplyCount: 0,
		repliesExpanded: false
	}
}

function getNoteDetailCommentSourceList(noteId = '') {
	if (shouldUsePagedNoteDetailComments(noteId)) {
		return NOTE_COMMENT_SOURCE_LIST.map((item) => cloneCommentThread(item))
	}

	return NOTE_COMMENT_SOURCE_LIST.slice(0, 5).map((item) => cloneCommentThread(item))
}

function shouldUsePagedNoteDetailComments(noteId = '') {
	const normalizedNoteId = noteId || DYNAMIC_SOURCE_LIST[0]?.id || ''
	return /^dynamic-item-\d+$/.test(normalizedNoteId)
}

function createCommentReplyItem(parentIndex, replyIndex) {
	const replySeed = parentIndex * 10 + replyIndex
	return {
		id: `comment-item-${parentIndex}-reply-${replyIndex}`,
		nickname: `回复用户${replySeed}`,
		avatarText: `${replySeed}`.slice(-1),
		avatarBackground: THUMB_BACKGROUND_LIST[(parentIndex + replyIndex) % THUMB_BACKGROUND_LIST.length],
		content: `这是回复占位内容 ${replySeed}，后续可直接接真实二级评论接口。`,
		timeText: replyIndex % 2 === 0 ? '刚刚' : `今天 ${10 + (replyIndex % 6)}:${replyIndex % 2 === 0 ? '08' : '36'}`,
		replyToNickname: replyIndex % 2 === 0 ? `评论用户${parentIndex}` : `回复用户${parentIndex * 10 + replyIndex - 1}`,
		likeCountValue: 3 + replySeed,
		likeCountText: formatCount(3 + replySeed),
		liked: replyIndex % 3 === 0
	}
}

function cloneCommentThread(item) {
	return {
		...item,
		replySourceList: Array.isArray(item.replySourceList) ? item.replySourceList.map((reply) => ({ ...reply })) : []
	}
}

function getCommentSourceTotalCount(commentSourceList = []) {
	return commentSourceList.reduce((total, item) => {
		const replyCount = Array.isArray(item.replySourceList) ? item.replySourceList.length : 0
		return total + 1 + replyCount
	}, 0)
}

export function parseCountText(value) {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return Math.max(0, Math.round(value))
	}

	const rawText = `${value || ''}`.trim().toLowerCase()
	if (!rawText) {
		return 0
	}

	const match = rawText.match(/^(\d+(?:\.\d+)?)(w)?$/)
	if (!match) {
		return Number(rawText) || 0
	}

	const baseValue = Number(match[1]) || 0
	if (match[2] === 'w') {
		return Math.round(baseValue * 10000)
	}

	return Math.round(baseValue)
}

export function formatCount(value) {
	const count = Number(value) || 0
	if (count >= 10000) {
		return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}w`
	}

	return `${count}`
}

function createMomentAuthorProfile(index) {
	return {
		userId: `moment-author-${index}`,
		nickname: ['阿宁', '西柚', '阿泽', '元七', '小北', '安可', '阿禾', '晚风'][index - 1] || `作者${index}`,
		avatarText: ['宁', '柚', '泽', '七', '北', '可', '禾', '晚'][index - 1] || `${index}`.slice(-1),
		avatarBackground: THUMB_BACKGROUND_LIST[(index - 1) % THUMB_BACKGROUND_LIST.length]
	}
}

function createMomentVoMock(index) {
	const dimension = MOMENT_VIDEO_DIMENSION_LIST[(index - 1) % MOMENT_VIDEO_DIMENSION_LIST.length]
	return {
		momentId: MOMENT_BASE_ID + index,
		authorId: ((index - 1) % MOMENT_AUTHOR_SOURCE_LIST.length) + 1,
		content: {
			type: 'video',
			text: null,
			image: null,
			video: {
				videoId: `moment-video-${index}`,
				videoUrl: SHARED_VIDEO_MOCK_URL,
				coverUrl: '',
				width: dimension.width,
				height: dimension.height,
				duration: 18 + (index % 6) * 7
			}
		},
		latitude: 22.53 + index * 0.0013,
		longitude: 113.94 + index * 0.0017,
		country: MOMENT_COUNTRY_LIST[(index - 1) % MOMENT_COUNTRY_LIST.length],
		likes: 860 + index * 73,
		comments: 68 + index * 9,
		hasLike: index % 3 === 0,
		status: 1,
		createTime: Date.now() - index * 6 * 60 * 1000
	}
}

function cloneMomentVo(momentVo = {}) {
	return {
		...momentVo,
		content: momentVo.content
			? {
					...momentVo.content,
					text: momentVo.content.text ? { ...momentVo.content.text } : null,
					image: momentVo.content.image ? { ...momentVo.content.image } : null,
					video: momentVo.content.video ? { ...momentVo.content.video } : null
				}
			: null
	}
}

function resolveMomentAuthorProfile(authorId) {
	const normalizedAuthorId = Number(authorId) || 1
	return {
		...MOMENT_AUTHOR_SOURCE_LIST[(normalizedAuthorId - 1) % MOMENT_AUTHOR_SOURCE_LIST.length]
	}
}

function resolveMomentWorkIndex(momentId) {
	if (!WORK_SOURCE_LIST.length) {
		return 0
	}

	const normalizedMomentId = Number(momentId) || MOMENT_BASE_ID + 1
	return Math.max(0, (normalizedMomentId - MOMENT_BASE_ID - 1) % WORK_SOURCE_LIST.length)
}

function resolveMomentVoByVideoToken(workToken = '') {
	const rawToken = `${workToken || ''}`.trim()
	if (!SHORT_VIDEO_MOMENT_SOURCE_LIST.length) {
		return {}
	}

	if (/^\d+$/.test(rawToken)) {
		return (
			SHORT_VIDEO_MOMENT_SOURCE_LIST.find((item) => `${item.momentId}` === rawToken) ||
			SHORT_VIDEO_MOMENT_SOURCE_LIST[0]
		)
	}

	const workIndex = Math.max(
		0,
		WORK_SOURCE_LIST.findIndex((item) => item.id === rawToken)
	)
	return SHORT_VIDEO_MOMENT_SOURCE_LIST[workIndex] || SHORT_VIDEO_MOMENT_SOURCE_LIST[0]
}

function formatDuration(durationSeconds = 0) {
	const safeDuration = Math.max(0, Number(durationSeconds) || 0)
	const minutes = Math.floor(safeDuration / 60)
	const seconds = safeDuration % 60
	return `${minutes}:${`${seconds}`.padStart(2, '0')}`
}

function formatRecentTimeText(timestamp) {
	const deltaMs = Math.max(0, Date.now() - (Number(timestamp) || Date.now()))
	const deltaMinutes = Math.max(0, Math.floor(deltaMs / (60 * 1000)))
	if (deltaMinutes < 1) {
		return '刚刚'
	}
	if (deltaMinutes < 60) {
		return `${deltaMinutes} 分钟前`
	}
	const deltaHours = Math.floor(deltaMinutes / 60)
	if (deltaHours < 24) {
		return `${deltaHours} 小时前`
	}
	return `${Math.floor(deltaHours / 24)} 天前`
}
