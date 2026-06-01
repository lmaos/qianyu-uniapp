// ── 单一导航配置树 ────────────────────────────────────────
// 本文件仅包含静态数据结构，0 个 import，不含任何逻辑。
// 所有导航事实（Tabs、子导航、组件映射、尺寸 Token）集中于此。
// componentKey → 组件切换型节点（由 navigationResolver 的 registry 解析）
// pagePath    → 页面跳转型节点

export const NAV_CONFIG = {
	// ── 默认值 ──────────────────────────────────────────
	defaultLevel1: 'home',
	tabBarHeightRpx: 140,

	// ── 首页专属 Token ──────────────────────────────────
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
		bottomPullCollapseDurationMs: 380
	},

	// ── 导航树 ──────────────────────────────────────────
	tabs: [
		{
			key: 'home',
			label: '首页',
			defaultItem: true,
			// 首页比较特殊：内嵌二级导航 + 场景内容
			subNavs: [
				{
					key: 'mall',
					label: '商城',
					componentKey: 'HomeMallSceneHost',
					theme: 'light',
					contentGapRpx: 6,
					defaultLevel3: 'recommend',
					extraNav: {
						componentKey: 'ShopSubNavExtra',
						heightRpx: 176
					}
				},
				{
					key: 'live',
					label: '直播',
					componentKey: 'HomeLiveSceneHost',
					theme: 'dark',
					contentGapRpx: 36
				},
				{
					key: 'recommend',
					label: '推荐',
					componentKey: 'HomeRecommendSceneHost',
					theme: 'light',
					contentGapRpx: 36,
					showPublishAction: true
				},
				{
					key: 'video',
					label: '短视频',
					pagePath: '/pages/video/feed'
				}
			]
		},
		{
			key: 'friend',
			label: '玩伴',
			componentKey: 'FriendPage'
		},
		{
			key: 'message',
			label: '消息',
			componentKey: 'MessagePage'
		},
		{
			key: 'mine',
			label: '我的',
			componentKey: 'MinePage'
		}
	]
} // END NAV_CONFIG

// 视频导航常量
export const VIDEO_FEED_HOME_NAV_KEY = 'video'
export const VIDEO_FEED_HOME_NAV_LABEL = '短视频'
