import { dispatchNavigationAction } from '@/components/common/navigation/navigationActionRouter.js'

export function dispatchActivityAction(actionUrl, actionPayload = null) {
	return dispatchNavigationAction(actionUrl, actionPayload)
}
