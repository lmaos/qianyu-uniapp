import { buildPageUrl } from '@/components/user-center/userCenterMock.js'

const CONTENT_PUBLISH_SCENE_MAP = {
	recommend: {
		title: '发布动态',
		placeholder: '写点什么，告诉大家这一刻的想法',
		submitLabel: '发布动态',
		allowMultiImage: true,
		maxImageCount: 9
	},
	'short-video': {
		title: '发布作品',
		placeholder: '给作品补一个标题，会更容易被看见',
		submitLabel: '发布作品',
		allowMultiImage: false,
		maxImageCount: 1
	}
}

export function getContentPublishPageMock(scene = 'recommend') {
	return CONTENT_PUBLISH_SCENE_MAP[scene] || CONTENT_PUBLISH_SCENE_MAP.recommend
}

export function buildContentPublishUrl({ scene = 'recommend', mediaList = [] } = {}) {
	const query = {
		scene
	}

	const mediaPayload = serializeContentPublishMediaList(mediaList)
	if (mediaPayload) {
		query.mediaPayload = mediaPayload
	}

	return buildPageUrl('/pages/user/content-publish', query)
}

export function serializeContentPublishMediaList(mediaList = []) {
	const normalizedList = mediaList
		.map((item, index) => normalizePublishMedia(item, index))
		.filter(Boolean)

	if (!normalizedList.length) {
		return ''
	}

	return encodeURIComponent(JSON.stringify(normalizedList))
}

export function parseContentPublishMediaList(mediaPayload = '') {
	if (!mediaPayload) {
		return []
	}

	try {
		const parsed = JSON.parse(decodeURIComponent(mediaPayload))
		if (!Array.isArray(parsed)) {
			return []
		}

		return parsed.map((item, index) => normalizePublishMedia(item, index)).filter(Boolean)
	} catch (error) {
		console.warn('parse-content-publish-media-failed', error)
		return []
	}
}

export function normalizePublishMedia(item = {}, index = 0) {
	const type = item.fileType === 'video' || item.type === 'video' ? 'video' : 'image'
	const url = item.url || item.tempFilePath || item.path || ''
	if (!url) {
		return null
	}

	return {
		id: item.id || `publish-media-${index + 1}`,
		type,
		url,
		thumbUrl: item.thumbUrl || item.tempFilePath || item.path || url,
		name: item.name || `media-${index + 1}`
	}
}
