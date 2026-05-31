import { buildPageUrl } from '@/components/user-center/userCenterMock.js'
import {
	NAVIGATION_ACTION_ROUTE_TYPES,
	buildNavigationActionUrl
} from '@/components/common/navigation/navigationActionProtocol.js'

const CONTACT_LIST = [
	{
		id: 'contact-luna',
		userId: 'message-user-luna',
		name: 'Luna',
		displayId: 'luna_2048',
		avatarText: 'L',
		avatarBackground: 'linear-gradient(135deg, #ff9db2 0%, #ffc8a9 100%)',
		conversationId: 'conversation-luna',
		onlineState: 'online',
		hasNewMessage: false,
		hasMomentUpdate: true,
		relationState: 'friend',
		vipLevel: 5,
		signature: '在做人物视觉和内容页面，喜欢把界面打磨到细节稳定。',
		locationText: '上海 · 徐汇'
	},
	{
		id: 'contact-aria',
		userId: 'message-user-aria',
		name: 'Aria',
		displayId: 'aria_1630',
		avatarText: 'A',
		avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
		conversationId: 'conversation-aria',
		onlineState: 'hidden',
		hasNewMessage: false,
		hasMomentUpdate: true,
		relationState: 'followed',
		vipLevel: 3,
		signature: '最近在研究商城轻量玻璃层和信息密度的平衡感。',
		locationText: '杭州 · 滨江'
	},
	{
		id: 'contact-momo',
		userId: 'message-user-momo',
		name: 'Momo',
		displayId: 'momo_927',
		avatarText: 'M',
		avatarBackground: 'linear-gradient(135deg, #7dddb8 0%, #9be7df 100%)',
		conversationId: 'conversation-momo',
		onlineState: 'online',
		hasNewMessage: true,
		hasMomentUpdate: false,
		relationState: 'followed',
		vipLevel: 0,
		signature: '偏爱把真实业务流和视觉表达一起做好，方便后续直接替换 API。',
		locationText: '深圳 · 南山'
	},
	{
		id: 'contact-suri',
		userId: 'message-user-suri',
		name: 'Suri',
		displayId: 'suri_552',
		avatarText: 'S',
		avatarBackground: 'linear-gradient(135deg, #ffc27f 0%, #ffe4b8 100%)',
		conversationId: 'conversation-suri',
		onlineState: 'offline',
		hasNewMessage: false,
		hasMomentUpdate: true,
		relationState: 'none',
		vipLevel: 2,
		signature: '更在意页面情绪和节奏，直播和个人主页都喜欢做得更有层次。',
		locationText: '广州 · 天河'
	},
	{
		id: 'contact-mila',
		userId: 'message-user-mila',
		name: 'Mila',
		displayId: 'mila_781',
		avatarText: 'Mi',
		avatarBackground: 'linear-gradient(135deg, #b199ff 0%, #c7b6ff 100%)',
		conversationId: 'conversation-mila',
		onlineState: 'online',
		hasNewMessage: true,
		hasMomentUpdate: false,
		relationState: 'friend',
		vipLevel: 4,
		signature: '长期记录 UI 打磨细节，也在持续整理个人中心和消息链路的体验。',
		locationText: '北京 · 朝阳'
	},
	{
		id: 'contact-zoe',
		userId: 'message-user-zoe',
		name: 'Zoe',
		displayId: 'zoe_305',
		avatarText: 'Z',
		avatarBackground: 'linear-gradient(135deg, #73d8c0 0%, #a1f0dd 100%)',
		conversationId: 'conversation-zoe',
		onlineState: 'hidden',
		hasNewMessage: false,
		hasMomentUpdate: false,
		relationState: 'followed',
		vipLevel: 0,
		signature: '偏好把消息、联系人和私聊作为一套完整实时系统来设计。',
		locationText: '成都 · 高新'
	},
	{
		id: 'contact-iris',
		userId: 'message-user-iris',
		name: 'Iris',
		displayId: 'iris_610',
		avatarText: 'I',
		avatarBackground: 'linear-gradient(135deg, #ffb68c 0%, #ffd8b8 100%)',
		conversationId: 'conversation-iris',
		onlineState: 'online',
		hasNewMessage: true,
		hasMomentUpdate: true,
		relationState: 'friend',
		vipLevel: 6,
		signature: '常常会把直播房间、消息流和商城入口一起联动着看。',
		locationText: '苏州 · 工业园'
	},
	{
		id: 'contact-nana',
		userId: 'message-user-nana',
		name: 'Nana',
		displayId: 'nana_426',
		avatarText: 'N',
		avatarBackground: 'linear-gradient(135deg, #7cb7ff 0%, #9fdbff 100%)',
		conversationId: 'conversation-nana',
		onlineState: 'offline',
		hasNewMessage: false,
		hasMomentUpdate: false,
		relationState: 'none',
		vipLevel: 1,
		signature: '喜欢高密度内容页，也会关注卡片高度和切换时的视觉稳定性。',
		locationText: '武汉 · 洪山'
	}
]

const CONVERSATION_LIST = [
	{
		id: 'conversation-luna',
		userId: 'message-user-luna',
		name: 'Luna',
		avatarText: 'L',
		avatarBackground: 'linear-gradient(135deg, #ff9db2 0%, #ffc8a9 100%)',
		onlineState: 'online',
		relationState: 'friend',
		timeText: '刚刚',
		preview: '今晚的图已经整理好了，等会发你。',
		unreadCount: 2,
		pinned: true,
		muted: false,
		tagText: '置顶'
	},
	{
		id: 'conversation-aria',
		userId: 'message-user-aria',
		name: 'Aria',
		avatarText: 'A',
		avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
		onlineState: 'hidden',
		relationState: 'followed',
		timeText: '12:18',
		preview: '你上次说的商城视觉我看到了，颜色很舒服。',
		unreadCount: 0,
		pinned: false,
		muted: true,
		tagText: ''
	},
	{
		id: 'conversation-momo',
		userId: 'message-user-momo',
		name: 'Momo',
		avatarText: 'M',
		avatarBackground: 'linear-gradient(135deg, #7dddb8 0%, #9be7df 100%)',
		onlineState: 'online',
		relationState: 'followed',
		timeText: '昨天',
		preview: '[图片] 今天这组人物背景可以直接替换欢迎页。',
		unreadCount: 5,
		pinned: false,
		muted: false,
		tagText: '新消息'
	},
	{
		id: 'conversation-suri',
		userId: 'message-user-suri',
		name: 'Suri',
		avatarText: 'S',
		avatarBackground: 'linear-gradient(135deg, #ffc27f 0%, #ffe4b8 100%)',
		onlineState: 'offline',
		relationState: 'none',
		timeText: '周一',
		preview: '下次直播房间的礼物区可以再亮一点。',
		unreadCount: 0,
		pinned: false,
		muted: false,
		tagText: ''
	},
	{
		id: 'conversation-mila',
		userId: 'message-user-mila',
		name: 'Mila',
		avatarText: 'Mi',
		avatarBackground: 'linear-gradient(135deg, #b199ff 0%, #c7b6ff 100%)',
		onlineState: 'online',
		relationState: 'friend',
		timeText: '周一',
		preview: '个人中心顶部那层光感可以再柔一点。',
		unreadCount: 1,
		pinned: false,
		muted: false,
		tagText: ''
	},
	{
		id: 'conversation-zoe',
		userId: 'message-user-zoe',
		name: 'Zoe',
		avatarText: 'Z',
		avatarBackground: 'linear-gradient(135deg, #73d8c0 0%, #a1f0dd 100%)',
		onlineState: 'hidden',
		relationState: 'followed',
		timeText: '周日',
		preview: '消息页联系人列表单独做一个页面会更完整。',
		unreadCount: 0,
		pinned: false,
		muted: false,
		tagText: ''
	},
	{
		id: 'conversation-iris',
		userId: 'message-user-iris',
		name: 'Iris',
		avatarText: 'I',
		avatarBackground: 'linear-gradient(135deg, #ffb68c 0%, #ffd8b8 100%)',
		onlineState: 'online',
		relationState: 'friend',
		timeText: '周日',
		preview: '直播房间底部输入栏现在像一个完整浮层了。',
		unreadCount: 3,
		pinned: false,
		muted: false,
		tagText: '未读'
	},
	{
		id: 'conversation-nana',
		userId: 'message-user-nana',
		name: 'Nana',
		avatarText: 'N',
		avatarBackground: 'linear-gradient(135deg, #7cb7ff 0%, #9fdbff 100%)',
		onlineState: 'offline',
		relationState: 'none',
		timeText: '上周',
		preview: '晚点一起看下消息列表左滑删除的手感。',
		unreadCount: 0,
		pinned: false,
		muted: false,
		tagText: ''
	},
	{
		id: 'conversation-ella',
		userId: 'message-user-ella',
		name: 'Ella',
		avatarText: 'E',
		avatarBackground: 'linear-gradient(135deg, #ff9bcf 0%, #ffd6ea 100%)',
		onlineState: 'offline',
		relationState: 'followed',
		timeText: '上周',
		preview: '商城那套浅色层级可以继续复用到更多页面。',
		unreadCount: 0,
		pinned: false,
		muted: true,
		tagText: ''
	},
	{
		id: 'conversation-cici',
		userId: 'message-user-cici',
		name: 'Cici',
		avatarText: 'C',
		avatarBackground: 'linear-gradient(135deg, #86d7ff 0%, #bbe8ff 100%)',
		onlineState: 'online',
		relationState: 'friend',
		timeText: '上周',
		preview: '联系人页记得保留点击进入私聊的回调。',
		unreadCount: 4,
		pinned: false,
		muted: false,
		tagText: '新消息'
	},
	{
		id: 'conversation-yuki',
		userId: 'message-user-yuki',
		name: 'Yuki',
		avatarText: 'Y',
		avatarBackground: 'linear-gradient(135deg, #95e1c0 0%, #c7f4e1 100%)',
		onlineState: 'online',
		relationState: 'followed',
		timeText: '上周',
		preview: '上拉分页的时候，记得别让整页抖动。',
		unreadCount: 0,
		pinned: false,
		muted: false,
		tagText: ''
	},
	{
		id: 'conversation-kiki',
		userId: 'message-user-kiki',
		name: 'Kiki',
		avatarText: 'K',
		avatarBackground: 'linear-gradient(135deg, #ffc88c 0%, #ffe8c8 100%)',
		onlineState: 'hidden',
		relationState: 'none',
		timeText: '更早',
		preview: '如果删除事件失败，当前会话不要直接移除。',
		unreadCount: 0,
		pinned: false,
		muted: false,
		tagText: ''
	}
]

const NOTIFICATION_LIST = [
	{
		id: 'notification-like-luna',
		category: '互动提醒',
		avatarText: 'L',
		avatarBackground: 'linear-gradient(135deg, #ff9db2 0%, #ffc8a9 100%)',
		title: 'Luna 赞了你的动态',
		summary: '《推荐瀑布流首屏稳定了》',
		timeText: '刚刚',
		unread: true,
		actionUrl: buildNavigationActionUrl(NAVIGATION_ACTION_ROUTE_TYPES.OPEN, {
			page: '/pages/user/note-detail',
			noteId: 'dynamic-item-6',
			title: '推荐瀑布流首屏稳定了'
		}),
		actionPayload: {
			title: '动态详情'
		}
	},
	{
		id: 'notification-comment-iris',
		category: '互动提醒',
		avatarText: 'I',
		avatarBackground: 'linear-gradient(135deg, #ffb68c 0%, #ffd8b8 100%)',
		title: 'Iris 评论了你的一条动态',
		summary: '“这个排版节奏处理得很舒服。”',
		timeText: '10分钟前',
		unread: true,
		actionUrl: buildNavigationActionUrl(NAVIGATION_ACTION_ROUTE_TYPES.OPEN, {
			page: '/pages/user/note-detail',
			noteId: 'dynamic-item-6',
			title: '动态详情'
		}),
		actionPayload: {
			title: '动态详情'
		}
	},
	{
		id: 'notification-live-home',
		category: '系统通知',
		avatarText: '直',
		avatarBackground: 'linear-gradient(135deg, #7cb7ff 0%, #9fdbff 100%)',
		title: '直播频道有新的活动入口',
		summary: '点击可直接回到首页直播频道。',
		timeText: '今天 19:20',
		unread: true,
		actionUrl: buildNavigationActionUrl(NAVIGATION_ACTION_ROUTE_TYPES.TAB, {
			tab: 'home',
			scene: 'live'
		}),
		actionPayload: {
			title: '直播频道'
		}
	},
	{
		id: 'notification-room-open',
		category: '开播提醒',
		avatarText: '播',
		avatarBackground: 'linear-gradient(135deg, #9b8cff 0%, #d2c3ff 100%)',
		title: '夜语音乐现场正在开播',
		summary: '点击直达对应直播间。',
		timeText: '今天 18:06',
		unread: false,
		actionUrl: buildNavigationActionUrl(NAVIGATION_ACTION_ROUTE_TYPES.LIVE_ROOM, {
			roomId: 'hot-room-2002',
			anchorId: 'anchor-2002',
			roomName: '夜语音乐现场'
		}),
		actionPayload: {
			title: '直播间'
		}
	},
	{
		id: 'notification-product-sale',
		category: '商城通知',
		avatarText: '购',
		avatarBackground: 'linear-gradient(135deg, #6bd3b1 0%, #9be7df 100%)',
		title: '你关注的商品降价了',
		summary: '轻商务氛围穿搭套餐今日有新的优惠。',
		timeText: '昨天',
		unread: false,
		actionUrl: buildNavigationActionUrl(NAVIGATION_ACTION_ROUTE_TYPES.OPEN, {
			page: '/pages/shop/product-detail',
			productId: 'shop-product-1001',
			skuId: 'shop-sku-default'
		}),
		actionPayload: {
			title: '商品详情'
		}
	},
	{
		id: 'notification-service-update',
		category: '系统通知',
		avatarText: '系',
		avatarBackground: 'linear-gradient(135deg, #f7c56d 0%, #ffe1a8 100%)',
		title: '平台服务说明已更新',
		summary: '通过内建 webview 查看最新的服务说明。',
		timeText: '昨天',
		unread: false,
		actionUrl: 'https://example.com/',
		actionPayload: {
			title: '服务说明'
		}
	}
]

const CHAT_MAP = {
	'conversation-luna': {
		actionList: [
			{ key: 'album', label: '相册' },
			{ key: 'call', label: '语音' },
			{ key: 'more', label: '更多' }
		],
		messageList: [
			{ id: 'luna-1', type: 'system', text: '今天 14:20' },
			{ id: 'luna-2', type: 'other', text: '欢迎页这组人物图现在统一很多了。' },
			{ id: 'luna-3', type: 'self', text: '是，我刚把磨砂边缘也一起收了。' },
			{ id: 'luna-4', type: 'other', text: '那登录页的玻璃层也一起改了吗？' },
			{ id: 'luna-5', type: 'self', text: '也处理了，现在切换时不会露白边。' },
			{ id: 'luna-6', type: 'other', text: '今晚的图已经整理好了，等会发你。' }
		]
	},
	'conversation-aria': {
		actionList: [
			{ key: 'product', label: '商品' },
			{ key: 'voice', label: '语音' },
			{ key: 'more', label: '更多' }
		],
		messageList: [
			{ id: 'aria-1', type: 'system', text: '今天 12:18' },
			{ id: 'aria-2', type: 'other', text: '你上次说的商城视觉我看到了，颜色很舒服。' },
			{ id: 'aria-3', type: 'self', text: '我准备把这套浅色层级同步到消息和个人中心。' },
			{ id: 'aria-4', type: 'other', text: '可以，消息页可以再高级一点。' }
		]
	},
	'conversation-momo': {
		actionList: [
			{ key: 'image', label: '图片' },
			{ key: 'shoot', label: '拍摄' },
			{ key: 'more', label: '更多' }
		],
		messageList: [
			{ id: 'momo-1', type: 'system', text: '昨天' },
			{ id: 'momo-2', type: 'other', text: '今天这组人物背景可以直接替换欢迎页。' },
			{ id: 'momo-3', type: 'self', text: '可以，我再把引导标题区补上。' },
			{ id: 'momo-4', type: 'other', text: '顺便把消息页也做完整吧。' }
		]
	},
	'conversation-suri': {
		actionList: [
			{ key: 'visit', label: '主页' },
			{ key: 'voice', label: '语音' },
			{ key: 'more', label: '更多' }
		],
		messageList: [
			{ id: 'suri-1', type: 'system', text: '周一' },
			{ id: 'suri-2', type: 'other', text: '下次直播房间的礼物区可以再亮一点。' },
			{ id: 'suri-3', type: 'self', text: '收到，我会顺手把个人中心也再提一版。' }
		]
	}
}

export function buildMessagePageMock() {
	return {
		title: '消息',
		notificationBadge: {
			label: '通知',
			unreadCount: getMessageNotificationUnreadCount()
		},
		searchPlaceholder: '搜索联系人或聊天',
		contactList: CONTACT_LIST.slice(0, 6).map((item) => ({ ...item })),
		contactSourceList: CONTACT_LIST.map((item) => ({ ...item })),
		conversationSourceList: CONVERSATION_LIST.map((item) => ({ ...item })),
		mockNotice: 'TODO：替换联系人状态、消息列表、好友资料、关注关系与私聊路由接口。'
	}
}

export function buildMessageContactListPageMock() {
	return {
		title: '联系人',
		searchPlaceholder: '搜索联系人',
		contactList: CONTACT_LIST.map((item) => ({ ...item }))
	}
}

export function buildMessageNotificationPageMock() {
	return {
		title: '通知',
		helperText: '系统通知和互动提醒都会携带统一协议，点击后会走公共跳转分发。',
		unreadCount: getMessageNotificationUnreadCount(),
		notificationList: NOTIFICATION_LIST.map((item) => ({
			...item
		}))
	}
}

export function buildMessageSearchPageMock() {
	return {
		title: '搜索',
		searchPlaceholder: '搜索联系人或聊天',
		recentKeywordList: ['人物视觉', '商城', '直播间', '资料页'],
		contactList: CONTACT_LIST.map((item) => ({ ...item })),
		conversationList: CONVERSATION_LIST.map((item) => ({ ...item }))
	}
}

export function buildMessageChatUrl(conversationInfo = {}) {
	return buildPageUrl('/pages/message/chat', {
		conversationId: conversationInfo.id || conversationInfo.conversationId || ''
	})
}

export function buildMessageContactListUrl() {
	return '/pages/message/contact-list'
}

export function buildMessageNotificationUrl() {
	return '/pages/message/notification'
}

export function buildMessageSearchUrl(query = '') {
	return buildPageUrl('/pages/message/search', {
		keyword: query
	})
}

export function buildMessageUserProfileUrl(userInfo = {}) {
	const relationState = normalizeRelationState(userInfo)
	const relationFlags = getRelationFlags(relationState)

	return buildPageUrl('/pages/user-profile/user-profile', {
		userId: userInfo.userId || userInfo.id || 'message-user-unknown',
		nickname: userInfo.name || userInfo.nickname || '好友',
		displayId: userInfo.displayId || '',
		avatar: userInfo.avatar || userInfo.avatarBackground || '',
		avatarText: userInfo.avatarText || '',
		vipLevel: userInfo.vipLevel || 0,
		isFollowed: relationFlags.isFollowed ? '1' : '0',
		isMutualFollow: relationFlags.isMutualFollow ? '1' : '0',
		isFriend: relationFlags.isFriend ? '1' : '0',
		relationState,
		conversationId: userInfo.conversationId || userInfo.id || '',
		signature: userInfo.signature || '',
		locationText: userInfo.locationText || '',
		onlineState: userInfo.onlineState || 'hidden'
	})
}

export function buildChatPageMock(conversationId = '') {
	const conversationInfo =
		CONVERSATION_LIST.find((item) => item.id === conversationId) ||
		CONVERSATION_LIST.find((item) => item.id === 'conversation-luna') ||
		CONVERSATION_LIST[0]
	const contactInfo =
		CONTACT_LIST.find((item) => item.conversationId === conversationInfo.id) ||
		CONTACT_LIST.find((item) => item.userId === conversationInfo.userId) ||
		null
	const chatInfo = CHAT_MAP[conversationInfo.id]

	return {
		id: conversationInfo.id,
		name: conversationInfo.name,
		statusText: resolveChatStatusText(conversationInfo.onlineState),
		avatarText: contactInfo?.avatarText || conversationInfo.avatarText,
		avatarBackground: contactInfo?.avatarBackground || conversationInfo.avatarBackground,
		actionList: (chatInfo?.actionList || DEFAULT_CHAT_ACTION_LIST).map((item) => ({ ...item })),
		messageList: (chatInfo?.messageList || buildFallbackChatList(conversationInfo)).map((item) => ({ ...item }))
	}
}

const DEFAULT_CHAT_ACTION_LIST = [
	{ key: 'album', label: '相册' },
	{ key: 'voice', label: '语音' },
	{ key: 'more', label: '更多' }
]

function buildFallbackChatList(conversationInfo) {
	return [
		{ id: `${conversationInfo.id}-system-1`, type: 'system', text: '今天' },
		{ id: `${conversationInfo.id}-other-1`, type: 'other', text: conversationInfo.preview },
		{ id: `${conversationInfo.id}-self-1`, type: 'self', text: '收到，我这边继续处理。' }
	]
}

function getMessageNotificationUnreadCount() {
	return NOTIFICATION_LIST.filter((item) => item.unread).length
}

function normalizeRelationState(userInfo = {}) {
	const relationState = `${userInfo.relationState || ''}`.trim()
	if (relationState) {
		return relationState
	}

	if (`${userInfo.isFriend || ''}` === '1' || userInfo.isFriend === true) {
		return 'friend'
	}

	if (`${userInfo.isMutualFollow || ''}` === '1' || userInfo.isMutualFollow === true) {
		return 'friend'
	}

	if (`${userInfo.isFollowed || ''}` === '1' || userInfo.isFollowed === true) {
		return 'followed'
	}

	return 'none'
}

function getRelationFlags(relationState = 'none') {
	if (relationState === 'friend') {
		return {
			isFollowed: true,
			isMutualFollow: true,
			isFriend: true
		}
	}

	if (relationState === 'followed') {
		return {
			isFollowed: true,
			isMutualFollow: false,
			isFriend: false
		}
	}

	return {
		isFollowed: false,
		isMutualFollow: false,
		isFriend: false
	}
}

function resolveChatStatusText(onlineState = 'hidden') {
	if (onlineState === 'online') {
		return '在线'
	}

	if (onlineState === 'offline') {
		return '离线'
	}

	return '对方隐藏了在线状态'
}
