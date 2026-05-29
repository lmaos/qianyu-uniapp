import { buildPageUrl } from '@/components/user-center/userCenterMock.js'

const COVER_BACKGROUND_LIST = [
	'linear-gradient(180deg, #ffd8dc 0%, #f7a8b8 100%)',
	'linear-gradient(180deg, #d7e8ff 0%, #95bfff 100%)',
	'linear-gradient(180deg, #ffe5bf 0%, #ffb16a 100%)',
	'linear-gradient(180deg, #d8f4e8 0%, #88d7bb 100%)',
	'linear-gradient(180deg, #ece2ff 0%, #b39dff 100%)',
	'linear-gradient(180deg, #ffe2f1 0%, #ff9ac8 100%)'
]

const AVATAR_BACKGROUND_LIST = [
	'linear-gradient(180deg, #ff8fb1 0%, #ffb98a 100%)',
	'linear-gradient(180deg, #77c4ff 0%, #7f93ff 100%)',
	'linear-gradient(180deg, #7de0bf 0%, #53c5da 100%)',
	'linear-gradient(180deg, #ffc874 0%, #ff9a5e 100%)'
]

const TITLE_TEMPLATE_LIST = [
	'把今天路过的好店和氛围感一次记下来',
	'直播间里顺手挖到的新款单品',
	'周末 city walk 的轻松穿搭灵感',
	'把卧室角落布置成舒服又耐看的样子',
	'最近反复回看的护肤和居家清单',
	'下班后随手记录的一条图文笔记'
]

const AUTHOR_NAME_LIST = ['亿家日用百货', '逗咖萌主', '白金今天穿什么', '阿青轻生活', '周末散步计划', '奶油房间日记']
const TOPIC_LIST = ['氛围感穿搭', '直播好物', '同城打卡', '约会灵感', '轻生活', '今日分享']
const CITY_LIST = ['深圳', '广州', '杭州', '成都', '苏州', '上海']
const CONTENT_TYPE_LIST = ['note', 'note', 'video', 'note', 'video', 'note']
const RECOMMEND_COVER_HEIGHT_RPX = 468

function formatCount(value) {
	if (value >= 10000) {
		return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}w`
	}

	return `${value}`
}

function createRecommendItem(index) {
	const contentType = CONTENT_TYPE_LIST[index % CONTENT_TYPE_LIST.length]
	const topic = TOPIC_LIST[index % TOPIC_LIST.length]
	const city = CITY_LIST[index % CITY_LIST.length]
	const authorIndex = (index % 14) + 1
	const itemId = `recommend-feed-${index}`
	const coverLabel = contentType === 'video' ? '视频推荐' : '图文推荐'

	return {
		id: itemId,
		contentType,
		title: TITLE_TEMPLATE_LIST[index % TITLE_TEMPLATE_LIST.length],
		coverHeightRpx: RECOMMEND_COVER_HEIGHT_RPX,
		coverBackground: COVER_BACKGROUND_LIST[index % COVER_BACKGROUND_LIST.length],
		coverLabel,
		coverText: topic,
		topicText: `#${topic}`,
		cityText: `${city}精选`,
		likeCountText: formatCount(680 + index * 41),
		commentCountText: formatCount(92 + index * 7),
		authorName: AUTHOR_NAME_LIST[index % AUTHOR_NAME_LIST.length],
		authorAvatarText: `${authorIndex}`,
		authorAvatarBackground: AVATAR_BACKGROUND_LIST[index % AVATAR_BACKGROUND_LIST.length],
		profileUrl: buildPageUrl('/pages/user-profile/user-profile', {
			userId: `recommend-author-${authorIndex}`,
			nickname: `推荐作者${authorIndex}`,
			avatar: AVATAR_BACKGROUND_LIST[index % AVATAR_BACKGROUND_LIST.length]
		}),
		detailUrl:
			contentType === 'video'
				? buildPageUrl('/pages/user/video-detail', {
					workId: `work-item-${(index % 12) + 1}`,
					userId: `recommend-author-${authorIndex}`
				})
				: buildPageUrl('/pages/user/note-detail', {
					noteId: `dynamic-item-${(index % 12) + 1}`,
					userId: `recommend-author-${authorIndex}`
				})
	}
}

export const recommendFeedMock = {
	pageSize: 8,
	loadDelayMs: 520,
	refreshDelayMs: 620,
	refreshRotateStep: 3
}

export function buildRecommendFeedSource(count = 40) {
	return Array.from({ length: count }, (_, index) => createRecommendItem(index + 1))
}
