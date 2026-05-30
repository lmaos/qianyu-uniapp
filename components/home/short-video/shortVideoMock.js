import {
	adaptMomentVoToVideoCard,
	getShortVideoMomentResponseMock
} from '@/components/user-center/userCenterMock.js'

const SHORT_VIDEO_PAGE_SIZE = 6
const SHORT_VIDEO_REFRESH_DELAY_MS = 360
const SHORT_VIDEO_LOAD_DELAY_MS = 260

const SHORT_VIDEO_MOMENT_RESPONSE = getShortVideoMomentResponseMock()
const SHORT_VIDEO_SOURCE_LIST = (SHORT_VIDEO_MOMENT_RESPONSE.content?.datas || []).map((item) => createShortVideoItem(item))

export function getShortVideoChannelMock() {
	return {
		pageSize: SHORT_VIDEO_PAGE_SIZE,
		refreshDelayMs: SHORT_VIDEO_REFRESH_DELAY_MS,
		loadDelayMs: SHORT_VIDEO_LOAD_DELAY_MS,
		sourceList: SHORT_VIDEO_SOURCE_LIST.map((item) => cloneShortVideoItem(item)),
		responseMock: getShortVideoMomentResponseMock()
	}
}

function createShortVideoItem(momentVo) {
	const detailMock = adaptMomentVoToVideoCard(momentVo)
	return {
		...detailMock,
		rawMoment: momentVo ? JSON.parse(JSON.stringify(momentVo)) : null
	}
}

export function cloneShortVideoItem(item = {}) {
	return {
		...item,
		authorInfo: item.authorInfo ? { ...item.authorInfo } : {},
		workInfo: item.workInfo ? { ...item.workInfo } : {},
		videoMeta: item.videoMeta ? { ...item.videoMeta } : {},
		rawMoment: item.rawMoment ? JSON.parse(JSON.stringify(item.rawMoment)) : null
	}
}
