export const indexNavigationSharedConfig = {
	defaultLevel1: 'home',
	tabBarHeightRpx: 140,
	level1List: [
		{ key: 'home', label: '首页' },
		{ key: 'friend', label: '玩伴' },
		{ key: 'message', label: '消息' },
		{ key: 'mine', label: '我的' }
	],
	home: {
		defaultLevel2: 'recommend',
		navHeightRpx: 74,
		navSidePaddingRpx: 28,
		navItemGapRpx: 36,
		navSafeGapRpx: 24,
		contentSidePaddingRpx: 32,
		mallContentSidePaddingRpx: 16,
		contentBottomPaddingRpx: 24,
		lowerThresholdPx: 220,
		bottomPullSlotHeightRpx: 72,
		bottomPullLoadedHoldMs: 420,
		bottomPullNoMoreHoldMs: 480,
		bottomPullReleaseDelayMs: 20,
		bottomPullCollapseDurationMs: 380,
		level2Map: {
			mall: {
				key: 'mall',
				label: '商城',
				theme: 'light',
				contentGapRpx: 6,
				defaultLevel3: 'recommend'
			},
			live: {
				key: 'live',
				label: '直播',
				theme: 'dark',
				contentGapRpx: 36,
				defaultLevel3: ''
			},
			recommend: {
				key: 'recommend',
				label: '推荐',
				theme: 'light',
				contentGapRpx: 36,
				defaultLevel3: ''
			}
		}
	}
}

export const indexLevel1UiList = indexNavigationSharedConfig.level1List
export const indexLevel1UiMap = indexLevel1UiList.reduce((result, item) => {
	result[item.key] = item
	return result
}, {})

export const homeLevel2UiMap = indexNavigationSharedConfig.home.level2Map
export const homeLevel2UiList = Object.values(homeLevel2UiMap)
