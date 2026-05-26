import { buildPageUrl } from '@/components/user-center/userCenterMock.js'
import {
	ACTIVITY_ACTION_ROUTE_TYPES,
	buildActivityIndexRoute,
	buildActivityWebViewUrl,
	parseActivityActionUrl
} from './activityActionProtocol.js'

export function dispatchActivityAction(actionUrl, actionPayload = null) {
	const resolvedAction = parseActivityActionUrl(actionUrl)
	const normalizedPayload = normalizeActionPayload(actionPayload)

	if (resolvedAction.kind === 'external-web') {
		uni.navigateTo({
			url: buildActivityWebViewUrl({
				url: resolvedAction.url,
				title: normalizedPayload.title
			})
		})
		return {
			handled: true,
			type: 'external-web',
			actionUrl
		}
	}

	if (resolvedAction.kind !== 'pages') {
		return {
			handled: false,
			type: resolvedAction.kind,
			actionUrl
		}
	}

	const mergedQuery = {
		...resolvedAction.query,
		...normalizedPayload.query
	}

	if (resolvedAction.routeType === ACTIVITY_ACTION_ROUTE_TYPES.OPEN) {
		const pagePath = mergedQuery.page
		if (!pagePath) {
			return {
				handled: false,
				type: 'open',
				actionUrl
			}
		}

		const { page, ...pageQuery } = mergedQuery
		uni.navigateTo({
			url: buildPageUrl(pagePath, pageQuery)
		})
		return {
			handled: true,
			type: 'open',
			actionUrl
		}
	}

	if (resolvedAction.routeType === ACTIVITY_ACTION_ROUTE_TYPES.TAB) {
		uni.reLaunch({
			url: buildActivityIndexRoute({
				tab: mergedQuery.tab || 'home',
				scene: mergedQuery.scene || ''
			})
		})
		return {
			handled: true,
			type: 'tab',
			actionUrl
		}
	}

	if (resolvedAction.routeType === ACTIVITY_ACTION_ROUTE_TYPES.LIVE_ROOM) {
		uni.navigateTo({
			url: buildPageUrl('/pages/live-room/live-room', mergedQuery)
		})
		return {
			handled: true,
			type: 'live-room',
			actionUrl
		}
	}

	return {
		handled: false,
		type: resolvedAction.routeType,
		actionUrl
	}
}

function normalizeActionPayload(actionPayload) {
	if (!actionPayload || typeof actionPayload !== 'object') {
		return {
			title: '',
			query: {}
		}
	}

	return {
		title: actionPayload.title || '',
		query: actionPayload.query && typeof actionPayload.query === 'object' ? actionPayload.query : {}
	}
}
