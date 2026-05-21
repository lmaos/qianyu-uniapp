import { buildPageUrl } from '@/components/user-center/userCenterMock.js'
import {
	playmateBuddyIconSvg,
	playmateCompanionNeedIconSvg,
	playmateEmotionNeedIconSvg,
	playmateExpandIconSvg,
	playmateRecordNeedIconSvg,
	playmateResponseNeedIconSvg,
	playmateTreeHoleIconSvg
} from '@/components/friend/playmateIcons.js'

const PLAYMATE_AUTHOR_LIST = [
	{
		id: 'playmate-luna',
		nickname: 'Luna',
		displayId: 'luna_2048',
		avatarText: 'L',
		avatarBackground: 'linear-gradient(135deg, #ff9db2 0%, #ffc8a9 100%)',
		signature: '慢热、偏夜聊，最近在给自己找一个能互相接住情绪的人。',
		locationText: '上海 · 徐汇',
		relationState: 'friend',
		onlineState: 'online',
		vipLevel: 5
	},
	{
		id: 'playmate-aria',
		nickname: 'Aria',
		displayId: 'aria_1630',
		avatarText: 'A',
		avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
		signature: '想扩列一点温柔的人，不擅长主动，但愿意认真回应。',
		locationText: '杭州 · 滨江',
		relationState: 'followed',
		onlineState: 'hidden',
		vipLevel: 3
	},
	{
		id: 'playmate-mila',
		nickname: 'Mila',
		displayId: 'mila_781',
		avatarText: 'Mi',
		avatarBackground: 'linear-gradient(135deg, #b199ff 0%, #c7b6ff 100%)',
		signature: '记录欲很强，想找能一起碎碎念和约咖啡的人。',
		locationText: '北京 · 朝阳',
		relationState: 'friend',
		onlineState: 'online',
		vipLevel: 4
	},
	{
		id: 'playmate-suri',
		nickname: 'Suri',
		displayId: 'suri_552',
		avatarText: 'S',
		avatarBackground: 'linear-gradient(135deg, #ffc27f 0%, #ffe4b8 100%)',
		signature: '最近在收集能够让自己情绪稳定一点的小事，也想认识同频的人。',
		locationText: '广州 · 天河',
		relationState: 'none',
		onlineState: 'offline',
		vipLevel: 1
	}
]

function buildProfileUrl(author) {
	return buildPageUrl('/pages/user-profile/user-profile', {
		userId: author.id,
		nickname: author.nickname,
		displayId: author.displayId,
		avatar: author.avatarBackground,
		avatarText: author.avatarText,
		vipLevel: author.vipLevel,
		relationState: author.relationState,
		signature: author.signature,
		locationText: author.locationText,
		onlineState: author.onlineState
	})
}

const PLAYMATE_LAUNCH_SHEET_MAP = {
	'tree-hole': {
		title: '心情树洞',
		desc: '先放一句，也算有个出口。',
		optionList: [
			{ key: 'mood-line', label: '一句话', desc: '适合现在就发' },
			{ key: 'night-note', label: '深夜版', desc: '适合 emo 时刻' },
			{ key: 'private-mode', label: '轻匿名', desc: '先低压发出' }
		]
	},
	playmate: {
		title: '找搭子',
		desc: '先把想做的事说出来。',
		optionList: [
			{ key: 'night-chat', label: '夜聊局', desc: '适合陪聊' },
			{ key: 'weekend-plan', label: '周末局', desc: '适合约见面' },
			{ key: 'game-open', label: '游戏局', desc: '适合直接开玩' }
		]
	},
	expand: {
		title: '扩列',
		desc: '放上你的节奏，等同频的人来。',
		optionList: [
			{ key: 'slow-type', label: '慢热型', desc: '适合先互看' },
			{ key: 'night-owl', label: '夜猫子', desc: '适合晚间活跃' },
			{ key: 'same-city', label: '同城向', desc: '适合线下延展' }
		]
	}
}

function buildReplyPreviewList() {
	return [
		{ key: 'same', label: '我也这样', value: '4' },
		{ key: 'meet', label: '想认识你', value: '3' },
		{ key: 'join', label: '带我一个', value: '2' }
	]
}

function createReplyItem(author, index, actionKey) {
	const actionMap = {
		same: {
			actionText: '我也这样',
			desc: '对你的状态很有感，想先轻轻回应一下。'
		},
		meet: {
			actionText: '想认识你',
			desc: '看完你的卡片，觉得你们可能聊得来。'
		},
		join: {
			actionText: '带我一个',
			desc: '对你发的搭子局有兴趣，想一起加入。'
		}
	}

	const actionInfo = actionMap[actionKey] || actionMap.same

	return {
		id: `reply-${actionKey}-${index + 1}`,
		actionKey,
		actionText: actionInfo.actionText,
		desc: actionInfo.desc,
		timeText: index === 0 ? '刚刚' : index === 1 ? '3 分钟前' : '12 分钟前',
		sourceTitle:
			actionKey === 'join'
				? '周末想找个同频的人一起逛展，安静一点也没关系。'
				: '今天有点想逃跑，但又不知道该去哪。',
		profileUrl: buildProfileUrl(author)
	}
}

const PLAYMATE_REPLY_LIST = [
	createReplyItem(PLAYMATE_AUTHOR_LIST[0], 0, 'same'),
	createReplyItem(PLAYMATE_AUTHOR_LIST[1], 1, 'meet'),
	createReplyItem(PLAYMATE_AUTHOR_LIST[2], 2, 'join'),
	createReplyItem(PLAYMATE_AUTHOR_LIST[3], 3, 'same')
]

function createSignalCard(author, index) {
	const signalConfigList = [
		{
			typeLabel: '树洞吐槽',
			title: '今天有点想逃跑，但又不知道该去哪。',
			content: '只想先把情绪放出来，不需要很热闹，只想等一个真的懂这种感觉的人路过。',
			tagList: ['轻吐槽', '慢热', '等共鸣'],
			waitingText: '先等回响',
			resonanceCount: 18,
			replyCount: 6,
			highlightText: '深夜同频正在刷到'
		},
		{
			typeLabel: '找玩伴',
			title: '周末想找个同频的人一起逛展，安静一点也没关系。',
			content: '不想硬社交，更希望先从一起做一件小事开始，能慢慢熟起来就很好。',
			tagList: ['周末搭子', '慢节奏', '线下'],
			waitingText: '先看有没有同频',
			resonanceCount: 12,
			replyCount: 4,
			highlightText: '同类搭子正在看'
		},
		{
			typeLabel: '扩列卡',
			title: '想扩列一点夜猫子朋友，能聊情绪、设计、游戏都可以。',
			content: '社交阈值不高的时候，就想先认识一些不会催促我、但愿意回看我内容的人。',
			tagList: ['扩列', '夜猫子', '设计感'],
			waitingText: '正在被刷到',
			resonanceCount: 26,
			replyCount: 9,
			highlightText: '慢热同频更容易有感'
		},
		{
			typeLabel: '生活碎片',
			title: '今天把耳机音量调小了，突然觉得晚风有点像被抱住。',
			content: '不一定要发生什么，只是想把这个瞬间存在这里，也许有人会懂。',
			tagList: ['记录一下', '情绪小窝', '通勤'],
			waitingText: '适合进窝',
			resonanceCount: 31,
			replyCount: 8,
			highlightText: '这类碎片更容易被收藏'
		}
	]

	const config = signalConfigList[index % signalConfigList.length]

	return {
		id: `playmate-signal-${index + 1}`,
		author,
		profileUrl: buildProfileUrl(author),
		typeLabel: config.typeLabel,
		title: config.title,
		content: config.content,
		tagList: config.tagList,
		waitingText: config.waitingText,
		resonanceCount: config.resonanceCount,
		replyCount: config.replyCount,
		highlightText: config.highlightText,
		actionText: '触发共鸣'
	}
}

export function getPlaymatePageMock() {
	const signalCardList = PLAYMATE_AUTHOR_LIST.map((item, index) => createSignalCard(item, index))

	return {
		heroInfo: {
			eyebrow: '玩伴',
			title: '来这儿找同频',
			desc: '发状态、留树洞、找搭子'
		},
		floatingBar: {
			title: '心情树洞',
			desc: '点一下，留个状态',
			actionText: '去发',
			targetLaunchKey: 'tree-hole'
		},
		overviewStatList: [
			{ key: 'signals', label: '在线信号', value: '126' },
			{ key: 'resonance', label: '今日回响', value: '348' },
			{ key: 'nest', label: '被收藏', value: '92' }
		],
		launchCardList: [
			{
				key: 'tree-hole',
				iconSvg: playmateTreeHoleIconSvg,
				label: '心情树洞',
				badgeText: '随手发',
				desc: '烦了、累了、想说点啥，都能先丢这。',
				actionText: '去发',
				background: 'linear-gradient(135deg, rgba(255, 154, 178, 0.18) 0%, rgba(255, 205, 180, 0.26) 100%)'
			},
			{
				key: 'playmate',
				iconSvg: playmateBuddyIconSvg,
				label: '找搭子',
				badgeText: '一起玩',
				desc: '夜聊、逛展、游戏、散步，先约一个同频搭子。',
				actionText: '去约',
				background: 'linear-gradient(135deg, rgba(133, 206, 255, 0.18) 0%, rgba(179, 220, 255, 0.28) 100%)'
			},
			{
				key: 'expand',
				iconSvg: playmateExpandIconSvg,
				label: '扩个列',
				badgeText: '求同频',
				desc: '放上你的节奏和喜好，等会聊天的人来捞你。',
				actionText: '开卡',
				background: 'linear-gradient(135deg, rgba(196, 166, 255, 0.18) 0%, rgba(226, 198, 255, 0.28) 100%)'
			}
		],
		guideList: [
			{
				key: 'mood',
				label: '有点 emo',
				needKey: 'emotion',
				targetLaunchKey: 'tree-hole',
				feedbackText: '先发树洞，最轻松。'
			},
			{
				key: 'night',
				label: '想扩列',
				needKey: 'response',
				targetLaunchKey: 'expand',
				feedbackText: '先开扩列卡，更容易被同频的人刷到。'
			},
			{
				key: 'weekend',
				label: '周末求搭子',
				needKey: 'companion',
				targetLaunchKey: 'playmate',
				feedbackText: '先发找搭子，把时间和想做的事写清楚。'
			},
			{
				key: 'record',
				label: '想记一下',
				needKey: 'record',
				targetLaunchKey: 'tree-hole',
				feedbackText: '先留个碎片，回看感更强。'
			},
			{
				key: 'comfort',
				label: '求安慰',
				needKey: 'emotion',
				targetLaunchKey: 'tree-hole',
				feedbackText: '先发一句，等个回响。'
			}
		],
		coreNeedList: [
			{
				key: 'emotion',
				iconSvg: playmateEmotionNeedIconSvg,
				title: '情绪出口',
				desc: 'emo、失眠、碎碎念，都能先放这。',
				mustText: '先发出来',
				background: 'linear-gradient(135deg, rgba(255, 151, 174, 0.12) 0%, rgba(255, 205, 180, 0.18) 100%)'
			},
			{
				key: 'response',
				iconSvg: playmateResponseNeedIconSvg,
				title: '有人回应',
				desc: '发出去不是沉底，得先有点回响。',
				mustText: '发了就有回应',
				background: 'linear-gradient(135deg, rgba(188, 211, 255, 0.16) 0%, rgba(225, 234, 255, 0.22) 100%)'
			},
			{
				key: 'companion',
				iconSvg: playmateCompanionNeedIconSvg,
				title: '搭子局',
				desc: '聊天、逛展、游戏，先从一件小事开始。',
				mustText: '同频更好约',
				background: 'linear-gradient(135deg, rgba(164, 228, 212, 0.16) 0%, rgba(212, 244, 235, 0.22) 100%)'
			},
			{
				key: 'record',
				iconSvg: playmateRecordNeedIconSvg,
				title: '留个瞬间',
				desc: '把今天记下来，以后还能翻回来。',
				mustText: '越记越有窝感',
				background: 'linear-gradient(135deg, rgba(201, 189, 255, 0.16) 0%, rgba(236, 225, 255, 0.24) 100%)'
			}
		],
		waveCardList: [
			{
				key: 'warmup',
				title: '频率共鸣',
				desc: '有回响的内容，会先被推到更容易被刷到的位置。',
				valueText: '冷帖回温中'
			},
			{
				key: 'reply',
				title: '回应加速',
				desc: '“我也这样 / 想认识你”这种轻反馈，会先把气氛带起来。',
				valueText: '轻互动已开启'
			}
		],
		resonanceActionList: [
			{ key: 'same', label: '我也这样' },
			{ key: 'hug', label: '抱抱你' },
			{ key: 'meet', label: '想认识你' },
			{ key: 'join', label: '带我一个' }
		],
		launchSheetMap: PLAYMATE_LAUNCH_SHEET_MAP,
		signalCardList,
		replyEntry: {
			id: 'reply-entry',
			title: '回应消息',
			desc: '新的回响都先收在这。',
			countText: '12 条新回应',
			actionText: '查看全部',
			previewList: buildReplyPreviewList(),
			url: buildPlaymateReplyListUrl()
		}
	}
}

export function buildPlaymatePublishUrl(mode = 'tree-hole', query = {}) {
	return buildPageUrl('/pages/playmate/publish', {
		mode,
		...query
	})
}

export function buildPlaymateReplyListUrl() {
	return buildPageUrl('/pages/playmate/reply-list')
}

function getPublishModeConfig(mode = 'tree-hole') {
	if (mode === 'playmate') {
		return {
			title: '找搭子',
			desc: '先把局组起来，再等同频的人来。',
			placeholder: '想找什么搭子、什么时候、偏什么风格，写一点就够了。',
			templateList: [
				{ key: 'night-chat', label: '夜聊局', desc: '适合陪聊' },
				{ key: 'weekend-plan', label: '周末局', desc: '适合约见面' },
				{ key: 'game-open', label: '游戏局', desc: '适合直接开玩' }
			],
			optionGroupList: [
				{
					key: 'scene',
					title: '玩法',
					optionList: ['夜聊', '逛展', '游戏', '散步', '喝咖啡']
				},
				{
					key: 'time',
					title: '时间',
					optionList: ['今晚', '周末', '这周', '随时']
				}
			],
			previewTitle: '周末想找个慢一点的搭子',
			previewDesc: '一起逛展或喝咖啡都行，先有话题就好。',
			buttonText: '发布搭子局'
		}
	}

	if (mode === 'expand') {
		return {
			title: '扩个列',
			desc: '放上节奏和喜好，等同频来捞。',
			placeholder: '简单写写你平时的节奏、兴趣、想认识什么样的人。',
			templateList: [
				{ key: 'slow-type', label: '慢热型', desc: '适合先互看' },
				{ key: 'night-owl', label: '夜猫子', desc: '适合晚间活跃' },
				{ key: 'same-city', label: '同城向', desc: '适合线下延展' }
			],
			optionGroupList: [
				{
					key: 'rhythm',
					title: '节奏',
					optionList: ['慢热', '高频聊天', '随缘回', '夜间活跃']
				},
				{
					key: 'interest',
					title: '兴趣',
					optionList: ['设计', '游戏', '追剧', '拍照', 'livehouse']
				}
			],
			previewTitle: '想扩点慢热同频',
			previewDesc: '偏夜间活跃，能聊设计、情绪和一些日常碎碎念。',
			buttonText: '发布扩列卡'
		}
	}

	return {
		title: '心情树洞',
		desc: '先把这一刻放出来。',
		placeholder: '写下现在的心情、吐槽或一个瞬间，越轻越容易发。',
		templateList: [
			{ key: 'mood-line', label: '一句话', desc: '适合马上发' },
			{ key: 'night-note', label: '深夜版', desc: '适合 emo 时刻' },
			{ key: 'private-mode', label: '轻匿名', desc: '适合低压发出' }
		],
		optionGroupList: [
			{
				key: 'mood',
				title: '心情',
				optionList: ['开心', '烦躁', '委屈', '失眠', '想聊聊']
			},
			{
				key: 'visible',
				title: '可见范围',
				optionList: ['同频可见', '仅自己', '公开']
			}
		],
		previewTitle: '今天有点想逃跑',
		previewDesc: '不一定要被谁解决，只是想先放出来。',
		buttonText: '发布树洞'
	}
}

export function getPlaymatePublishPageMock(mode = 'tree-hole', templateKey = '') {
	const config = getPublishModeConfig(mode)
	return {
		mode,
		templateKey,
		...config
	}
}

export function getPlaymateReplyListPageMock() {
	return {
		title: '回应消息',
		desc: '看看谁对你有感。',
		tabList: [
			{ key: 'all', label: '全部' },
			{ key: 'same', label: '我也这样' },
			{ key: 'meet', label: '想认识你' },
			{ key: 'join', label: '带我一个' }
		],
		replyList: PLAYMATE_REPLY_LIST.map((item) => ({ ...item }))
	}
}
