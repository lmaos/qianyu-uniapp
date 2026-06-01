import HomeMallSceneHost from '@/components/home/scenes/HomeMallSceneHost.vue'
import HomeLiveSceneHost from '@/components/home/scenes/HomeLiveSceneHost.vue'
import HomeRecommendSceneHost from '@/components/home/scenes/HomeRecommendSceneHost.vue'
import {
	homeLevel2UiMap,
	indexLevel1UiList,
	indexNavigationSharedConfig
} from '@/components/home/indexNavigationShared.js'
import ShopSubNavExtra from '@/components/home/shop/ShopSubNavExtra.vue'
import FriendPage from '@/pages/friend/friend.vue'
import MessagePage from '@/pages/message/message.vue'
import MinePage from '@/pages/mine/mine.vue'

export const indexNavigationConfig = {
	...indexNavigationSharedConfig,
	level1List: [
		{ ...indexLevel1UiList[0], hostType: 'home-shell' },
		{ ...indexLevel1UiList[1], hostComponent: FriendPage, hostProps: { active: true } },
		{ ...indexLevel1UiList[2], hostComponent: MessagePage, hostProps: { active: true } },
		{ ...indexLevel1UiList[3], hostComponent: MinePage, hostProps: { active: true } }
	],
	home: {
		...indexNavigationSharedConfig.home,
		level2Map: {
			mall: {
				...homeLevel2UiMap.mall,
				hostComponent: HomeMallSceneHost,
				extraNavComponent: ShopSubNavExtra,
				extraNavHeightRpx: 176
			},
			live: {
				...homeLevel2UiMap.live,
				hostComponent: HomeLiveSceneHost
			},
			recommend: {
				...homeLevel2UiMap.recommend,
				hostComponent: HomeRecommendSceneHost
			}
		}
	}
}

export const indexLevel1List = indexNavigationConfig.level1List
export const indexLevel1ConfigMap = indexNavigationConfig.level1List.reduce((result, item) => {
	result[item.key] = item
	return result
}, {})
export const homeLevel2ConfigMap = indexNavigationConfig.home.level2Map
export const homeLevel2List = Object.values(homeLevel2ConfigMap)
