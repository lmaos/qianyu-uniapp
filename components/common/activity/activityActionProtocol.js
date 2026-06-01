import {
	NAVIGATION_ACTION_PROTOCOL_REFERENCE,
	NAVIGATION_ACTION_ROUTE_TYPES,
	buildNavigationActionUrl,
	buildNavigationIndexRoute,
	buildNavigationWebViewUrl,
	parseNavigationActionUrl
} from '@/components/common/navigation/navigationActionProtocol.js'

export const ACTIVITY_POPUP_TYPES = Object.freeze({
	IMAGE: 'image',
	ACTION: 'action'
})

export const ACTIVITY_ACTION_ROUTE_TYPES = NAVIGATION_ACTION_ROUTE_TYPES

export const ACTIVITY_ACTION_PROTOCOL_REFERENCE = Object.freeze({
	fieldName: 'actionUrl',
	supportedPrefixes: NAVIGATION_ACTION_PROTOCOL_REFERENCE.supportedPrefixes,
	pagePrefix: NAVIGATION_ACTION_PROTOCOL_REFERENCE.pagePrefix,
	legacyPagePrefix: NAVIGATION_ACTION_PROTOCOL_REFERENCE.legacyPagePrefix,
	webViewPagePath: NAVIGATION_ACTION_PROTOCOL_REFERENCE.webViewPagePath,
	examples: Object.freeze([
		{
			label: '普通页面',
			actionUrl: 'page://open?page=/pages/shop/cart'
		},
		{
			label: '根Tab',
			actionUrl: 'page://tab?level1=home'
		},
		{
			label: '首页子场景',
			actionUrl: 'page://tab?level1=home&level2=live'
		},
		{
			label: '首页三级导航',
			actionUrl: 'page://tab?level1=home&level2=mall&level3=type-1'
		},
		{
			label: '直播间',
			actionUrl:
				'page://live-room?roomId=hot-room-1001&anchorId=anchor-1001&roomName=%E5%8D%83%E8%AF%AD%E7%9B%B4%E6%92%AD%E9%97%B4'
		}
	])
})

export function buildActivityActionUrl(routeType, query = {}) {
	return buildNavigationActionUrl(routeType, query)
}

export function buildActivityWebViewUrl({ url = '', title = '' } = {}) {
	return buildNavigationWebViewUrl({ url, title })
}

export function buildActivityIndexRoute({
	tab = 'home',
	scene = '',
	contentKey = '',
	level1 = '',
	level2 = '',
	level3 = ''
} = {}) {
	return buildNavigationIndexRoute({ tab, scene, contentKey, level1, level2, level3 })
}

export function parseActivityActionUrl(actionUrl = '') {
	const resolvedAction = parseNavigationActionUrl(actionUrl)
	if (resolvedAction.kind !== 'page') {
		return resolvedAction
	}

	return {
		...resolvedAction,
		kind: 'pages'
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
