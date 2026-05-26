import { buildPageUrl } from '@/components/user-center/userCenterMock.js'

export const ACTIVITY_POPUP_TYPES = Object.freeze({
	IMAGE: 'image',
	ACTION: 'action'
})

export const ACTIVITY_ACTION_ROUTE_TYPES = Object.freeze({
	OPEN: 'open',
	TAB: 'tab',
	LIVE_ROOM: 'live-room'
})

export const ACTIVITY_ACTION_PROTOCOL_REFERENCE = Object.freeze({
	fieldName: 'actionUrl',
	supportedPrefixes: ['https://', 'http://', 'pages://'],
	pagePrefix: 'pages://',
	webViewPagePath: '/pages/web/web-view',
	examples: Object.freeze([
		{
			label: '普通页面',
			actionUrl: 'pages://open?page=/pages/shop/cart'
		},
		{
			label: '根Tab',
			actionUrl: 'pages://tab?tab=home'
		},
		{
			label: '首页子场景',
			actionUrl: 'pages://tab?tab=home&scene=live'
		},
		{
			label: '直播间',
			actionUrl:
				'pages://live-room?roomId=hot-room-1001&anchorId=anchor-1001&roomName=%E5%8D%83%E8%AF%AD%E7%9B%B4%E6%92%AD%E9%97%B4'
		}
	])
})

export function buildActivityActionUrl(routeType, query = {}) {
	const queryString = stringifyActionQuery(query)
	return queryString ? `pages://${routeType}?${queryString}` : `pages://${routeType}`
}

export function buildActivityWebViewUrl({ url = '', title = '' } = {}) {
	return buildPageUrl(ACTIVITY_ACTION_PROTOCOL_REFERENCE.webViewPagePath, {
		url,
		title
	})
}

export function buildActivityIndexRoute({ tab = 'home', scene = '' } = {}) {
	return buildPageUrl('/pages/index/index', {
		tab,
		scene
	})
}

export function parseActivityActionUrl(actionUrl = '') {
	const normalizedActionUrl = `${actionUrl || ''}`.trim()
	if (!normalizedActionUrl) {
		return {
			kind: 'empty',
			actionUrl: ''
		}
	}

	if (/^https?:\/\//i.test(normalizedActionUrl)) {
		return {
			kind: 'external-web',
			actionUrl: normalizedActionUrl,
			url: normalizedActionUrl
		}
	}

	if (!normalizedActionUrl.startsWith(ACTIVITY_ACTION_PROTOCOL_REFERENCE.pagePrefix)) {
		return {
			kind: 'unsupported',
			actionUrl: normalizedActionUrl
		}
	}

	const payload = normalizedActionUrl.slice(ACTIVITY_ACTION_PROTOCOL_REFERENCE.pagePrefix.length)
	const [routeType = '', queryString = ''] = payload.split('?')

	return {
		kind: 'pages',
		actionUrl: normalizedActionUrl,
		routeType,
		query: parseActionQuery(queryString)
	}
}

export function normalizeActivityPopupConfig(config = {}) {
	return {
		visible: Boolean(config.visible),
		popupType: config.popupType || ACTIVITY_POPUP_TYPES.ACTION,
		title: config.title || '',
		desc: config.desc || '',
		imageUrl: config.imageUrl || '',
		confirmText: config.confirmText || '立即前往',
		cancelText: config.cancelText || '',
		showClose: config.showClose !== false,
		closeOnMask: config.closeOnMask !== false,
		actionUrl: config.actionUrl || '',
		actionPayload: config.actionPayload || null
	}
}

function stringifyActionQuery(query = {}) {
	return Object.entries(query)
		.filter(([, value]) => value !== undefined && value !== null && `${value}` !== '')
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&')
}

function parseActionQuery(queryString = '') {
	if (!queryString) {
		return {}
	}

	return queryString.split('&').reduce((result, pair) => {
		if (!pair) {
			return result
		}

		const [rawKey = '', rawValue = ''] = pair.split('=')
		const key = decodeURIComponent(rawKey)
		if (!key) {
			return result
		}

		result[key] = decodeURIComponent(rawValue)
		return result
	}, {})
}
