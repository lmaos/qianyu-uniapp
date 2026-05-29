import {
	buildPageUrl,
	getVideoDetailPageMock
} from '@/components/user-center/userCenterMock.js'

const SHORT_VIDEO_PAGE_SIZE = 6
const SHORT_VIDEO_REFRESH_DELAY_MS = 360
const SHORT_VIDEO_LOAD_DELAY_MS = 260

const SHORT_VIDEO_BACKGROUND_LIST = [
	'linear-gradient(135deg, #1f2937 0%, #111827 35%, #030712 100%)',
	'linear-gradient(135deg, #312e81 0%, #1e1b4b 42%, #030712 100%)',
	'linear-gradient(135deg, #7c2d12 0%, #431407 44%, #020617 100%)',
	'linear-gradient(135deg, #14532d 0%, #052e16 42%, #020617 100%)'
]

const SHORT_VIDEO_TITLE_LIST = [
	'把内容封面做干净一点，用户第一眼只看作品本身。',
	'短视频频道先用整屏沉浸式结构，把浏览路径理顺。',
	'记录今天首页推荐流和个人中心列表的一次轻量化收口。',
	'直播、电商、内容都在一套首页框架下时，交互边界要更清楚。',
	'把复杂效果都拿掉以后，内容型页面的节奏会更稳。',
	'这个频道后续可以直接切真实视频源，只保留当前交互骨架。'
]

const SHORT_VIDEO_DESC_LIST = [
	'先保证上下滑足够顺，再逐步接入真实视频流与评论面板。',
	'短视频频道内部自己处理刷新和分页，不再让父级普通滚动壳干扰手势。',
	'当前展示为 mock 占位，方便后续按真实接口映射字段与播放地址。',
	'右侧互动位、左下文案位都按内容平台常见结构收紧处理。',
	'后面如果接入播放内核，可以在不改布局协议的前提下直接替换。',
	'当前数据与详情页保持同一套 workId，方便从任何入口跳统一详情。'
]

const SHORT_VIDEO_MUSIC_LIST = [
	'原声 · 千隅推荐流',
	'原声 · 今日灵感',
	'原声 · 直播切片',
	'原声 · 内容精选'
]

const SHORT_VIDEO_SOURCE_LIST = Array.from({ length: 30 }, (_, index) => createShortVideoItem(index + 1))

export function getShortVideoChannelMock() {
	return {
		pageSize: SHORT_VIDEO_PAGE_SIZE,
		refreshDelayMs: SHORT_VIDEO_REFRESH_DELAY_MS,
		loadDelayMs: SHORT_VIDEO_LOAD_DELAY_MS,
		sourceList: SHORT_VIDEO_SOURCE_LIST.map((item) => cloneShortVideoItem(item))
	}
}

function createShortVideoItem(index) {
	const workId = `work-item-${((index - 1) % 24) + 1}`
	const detailMock = getVideoDetailPageMock(workId)
	return {
		...detailMock,
		id: `short-video-${index}`,
		workId,
		coverBackground: SHORT_VIDEO_BACKGROUND_LIST[(index - 1) % SHORT_VIDEO_BACKGROUND_LIST.length],
		title: SHORT_VIDEO_TITLE_LIST[(index - 1) % SHORT_VIDEO_TITLE_LIST.length],
		desc: SHORT_VIDEO_DESC_LIST[(index - 1) % SHORT_VIDEO_DESC_LIST.length],
		musicText: SHORT_VIDEO_MUSIC_LIST[(index - 1) % SHORT_VIDEO_MUSIC_LIST.length],
		publishTimeText: index <= 3 ? '刚刚' : `${index + 1} 分钟前`,
		detailUrl: buildPageUrl('/pages/user/video-detail', {
			workId,
			from: 'short-video'
		}),
		authorUrl: buildPageUrl('/pages/user-profile/user-profile', {
			userId: detailMock.authorInfo?.userId
		})
	}
}

export function cloneShortVideoItem(item = {}) {
	return {
		...item,
		authorInfo: item.authorInfo ? { ...item.authorInfo } : {},
		workInfo: item.workInfo ? { ...item.workInfo } : {}
	}
}
