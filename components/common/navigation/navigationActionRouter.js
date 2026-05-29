import {
	NAVIGATION_ACTION_ROUTE_TYPES,
	buildNavigationIndexRoute,
	buildNavigationTargetUrl,
	buildNavigationWebViewUrl,
	parseNavigationActionUrl
} from './navigationActionProtocol.js'

export function dispatchNavigationAction(actionUrl, actionPayload = null) {
	const resolvedAction = parseNavigationActionUrl(actionUrl)
	const normalizedPayload = normalizeActionPayload(actionPayload)

	if (resolvedAction.kind === 'external-web') {
		uni.navigateTo({
			url: buildNavigationWebViewUrl({
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

	if (resolvedAction.kind !== 'page') {
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

	if (resolvedAction.routeType === NAVIGATION_ACTION_ROUTE_TYPES.OPEN) {
		const pagePath = `${mergedQuery.page || mergedQuery.path || ''}`.trim()
		if (!pagePath) {
			return {
				handled: false,
				type: 'open',
				actionUrl
			}
		}

		const { page, path, ...pageQuery } = mergedQuery
		uni.navigateTo({
			url: buildNavigationTargetUrl(pagePath, pageQuery)
		})
		return {
			handled: true,
			type: 'open',
			actionUrl
		}
	}

	if (resolvedAction.routeType === NAVIGATION_ACTION_ROUTE_TYPES.TAB) {
		uni.reLaunch({
			url: buildNavigationIndexRoute({
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

	if (resolvedAction.routeType === NAVIGATION_ACTION_ROUTE_TYPES.LIVE_ROOM) {
		uni.navigateTo({
			url: buildNavigationTargetUrl('/pages/live-room/live-room', mergedQuery)
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
