export const NAVIGATION_ACTION_ROUTE_TYPES = Object.freeze({
	OPEN: 'open',
	TAB: 'tab',
	LIVE_ROOM: 'live-room'
})

export const NAVIGATION_ACTION_PROTOCOL_REFERENCE = Object.freeze({
	fieldName: 'actionUrl',
	supportedPrefixes: ['https://', 'http://', 'page://', 'pages://'],
	pagePrefix: 'page://',
	legacyPagePrefix: 'pages://',
	webViewPagePath: '/pages/web/web-view',
	indexPagePath: '/pages/index/index',
	examples: Object.freeze([
		{
			label: '普通页面',
			actionUrl: 'page://open?page=/pages/shop/cart'
		},
		{
			label: '根Tab',
			actionUrl: 'page://tab?tab=home'
		},
		{
			label: '首页子场景',
			actionUrl: 'page://tab?tab=home&scene=live'
		},
		{
			label: '直播间',
			actionUrl:
				'page://live-room?roomId=hot-room-1001&anchorId=anchor-1001&roomName=%E5%8D%83%E8%AF%AD%E7%9B%B4%E6%92%AD%E9%97%B4'
		}
	])
})

export function buildNavigationActionUrl(routeType, query = {}) {
	const queryString = stringifyNavigationQuery(query)
	return queryString ? `${NAVIGATION_ACTION_PROTOCOL_REFERENCE.pagePrefix}${routeType}?${queryString}` : `${NAVIGATION_ACTION_PROTOCOL_REFERENCE.pagePrefix}${routeType}`
}

export function buildNavigationTargetUrl(path, query = {}) {
	const normalizedPath = `${path || ''}`.trim()
	if (!normalizedPath) {
		return ''
	}

	const queryString = stringifyNavigationQuery(query)
	if (!queryString) {
		return normalizedPath
	}

	return `${normalizedPath}${normalizedPath.includes('?') ? '&' : '?'}${queryString}`
}

export function buildNavigationWebViewUrl({ url = '', title = '' } = {}) {
	return buildNavigationTargetUrl(NAVIGATION_ACTION_PROTOCOL_REFERENCE.webViewPagePath, {
		url,
		title
	})
}

export function buildNavigationIndexRoute({ tab = 'home', scene = '' } = {}) {
	return buildNavigationTargetUrl(NAVIGATION_ACTION_PROTOCOL_REFERENCE.indexPagePath, {
		tab,
		scene
	})
}

export function parseNavigationActionUrl(actionUrl = '') {
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

	const matchedPrefix =
		resolvePageProtocolPrefix(normalizedActionUrl) ||
		resolveLegacyPageProtocolPrefix(normalizedActionUrl)

	if (!matchedPrefix) {
		return {
			kind: 'unsupported',
			actionUrl: normalizedActionUrl
		}
	}

	const payload = normalizedActionUrl.slice(matchedPrefix.length)
	const questionIndex = payload.indexOf('?')
	const routeType = questionIndex >= 0 ? payload.slice(0, questionIndex) : payload
	const queryString = questionIndex >= 0 ? payload.slice(questionIndex + 1) : ''

	return {
		kind: 'page',
		actionUrl: normalizedActionUrl,
		routeType,
		query: parseNavigationQuery(queryString),
		protocolPrefix: matchedPrefix
	}
}

export function stringifyNavigationQuery(query = {}) {
	return Object.entries(query)
		.filter(([, value]) => value !== undefined && value !== null && `${value}` !== '')
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&')
}

export function parseNavigationQuery(queryString = '') {
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

function resolvePageProtocolPrefix(actionUrl = '') {
	return actionUrl.startsWith(NAVIGATION_ACTION_PROTOCOL_REFERENCE.pagePrefix)
		? NAVIGATION_ACTION_PROTOCOL_REFERENCE.pagePrefix
		: ''
}

function resolveLegacyPageProtocolPrefix(actionUrl = '') {
	return actionUrl.startsWith(NAVIGATION_ACTION_PROTOCOL_REFERENCE.legacyPagePrefix)
		? NAVIGATION_ACTION_PROTOCOL_REFERENCE.legacyPagePrefix
		: ''
}
