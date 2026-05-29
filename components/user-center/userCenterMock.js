import {
	resolveUserCenterActionIcon,
	resolveUserCenterMinimalIcon
} from '@/components/user-center/main/userCenterIcons.js'

const DEFAULT_USER_ID = 'mine-self'
const MAIN_PAGE_SIZE = 8
const COMMENT_PAGE_SIZE = 10

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
const LIKE_SOURCE_LIST = DYNAMIC_SOURCE_LIST.slice(2, 12)
const HISTORY_SOURCE_LIST = Array.from({ length: 12 }, (_, index) => createHistoryItem(index + 1))
const VISITOR_SOURCE_LIST = Array.from({ length: 16 }, (_, index) => createVisitorItem(index + 1))
const FOLLOW_SOURCE_LIST = Array.from({ length: 20 }, (_, index) => createRelationItem(index + 1, 'follow'))
const FAN_SOURCE_LIST = Array.from({ length: 18 }, (_, index) => createRelationItem(index + 1, 'fans'))
const ADD_FRIEND_SOURCE_LIST = Array.from({ length: 12 }, (_, index) => createAddFriendItem(index + 1))
const ORDER_SOURCE_LIST = Array.from({ length: 15 }, (_, index) => createOrderItem(index + 1))
const NOTE_COMMENT_SOURCE_LIST = Array.from({ length: 36 }, (_, index) => createCommentItem(index + 1))

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
	const commentList = NOTE_COMMENT_SOURCE_LIST.map((item) => ({ ...item }))
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
		watchCount: noteInfo.viewCountText,
		likeCount: noteInfo.likeCountText,
		commentCount: noteInfo.commentCountText,
		commentSourceList: commentList.map((item) => ({ ...item })),
		commentList,
		pageSize: COMMENT_PAGE_SIZE
	}
}

export function getVideoDetailPageMock(workId = '') {
	const targetWork = WORK_SOURCE_LIST.find((item) => item.id === workId) || WORK_SOURCE_LIST[0]
	const workIndex = Math.max(
		0,
		WORK_SOURCE_LIST.findIndex((item) => item.id === targetWork.id)
	)
	const videoUrlList = [
		'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
		'https://www.w3schools.com/html/mov_bbb.mp4'
	]
	const descList = [
		'沉浸式视频详情页占位，后续替换真实视频资源、点赞评论与分享接口。',
		'短视频详情先对齐全屏内容布局，后续可继续接真实播放内核与互动抽屉。',
		'当前页面沿用统一 workId，方便首页推荐、个人中心和短视频频道共用详情路由。'
	]
	const musicList = ['原声 · 千隅内容推荐', '原声 · 今日记录', '原声 · 直播切片']
	const workInfo = {
		...targetWork,
		authorName: PROFILE_INFO.nickname,
		authorAvatarText: PROFILE_INFO.avatarText,
		authorAvatarBackground: PROFILE_INFO.avatarBackground,
		title:
			targetWork.title || '全屏视频作品标题占位，支持后续替换真实视频地址、互动数据与评论面板。',
		shareCount: formatCount(860 + workIndex * 104)
	}
	return {
		workInfo,
		pageBackground: '#020617',
		workId: workInfo.id,
		authorInfo: {
			userId: DEFAULT_USER_ID,
			nickname: workInfo.authorName,
			avatarText: workInfo.authorAvatarText,
			avatarBackground: workInfo.authorAvatarBackground
		},
		authorUrl: buildPageUrl('/pages/user-profile/user-profile', {
			userId: DEFAULT_USER_ID
		}),
		coverBackground: workInfo.coverBackground,
		videoUrl: videoUrlList[workIndex % videoUrlList.length],
		title: workInfo.title,
		desc: descList[workIndex % descList.length],
		publishTimeText: workIndex < 4 ? '刚刚' : `${workIndex + 6} 分钟前`,
		playCountText: workInfo.viewCountText,
		shareCount: workInfo.shareCount,
		musicText: musicList[workIndex % musicList.length],
		likeCount: workInfo.likeCountText,
		commentCount: workInfo.commentCountText
	}
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

function createCommentItem(index) {
	return {
		id: `comment-item-${index}`,
		nickname: `评论用户${index}`,
		avatarText: `${index}`,
		avatarBackground: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length],
		content: `这是评论占位内容 ${index}，后续可直接替换成真实评论接口返回字段。`,
		timeText: `今天 ${9 + (index % 10)}:${index % 2 === 0 ? '12' : '48'}`,
		likeCountText: formatCount(18 + index * 4)
	}
}

function formatCount(value) {
	const count = Number(value) || 0
	if (count >= 10000) {
		return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}w`
	}

	return `${count}`
}
