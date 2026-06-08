// ── 单一导航配置树（纯数据，0 import）────────────────────────
//
// 本文件是首页导航系统的「唯一事实来源」（Single Source of Truth）。
// 所有导航事实（Tab / 子导航 / 场景组件引用 / 尺寸 Token）均集中在此。
// 修改导航结构只需改此文件 + navigationResolver.js 的注册表（新增组件时）。
//
// 节点类型说明：
//   componentKey → 组件切换型。点击后切换当前页面内渲染的组件（不跳页）。
//   pagePath    → 页面跳转型。点击后 uni.reLaunch 到指定页面（如短视频 feed）。
//
// 扩展提示：
//   - 新增 Tab：在 tabs[] 中追加一项，设定 key + label + componentKey，
//     若需含子导航则加 subNavs[]，并在 navigationResolver.js 注册表导入组件。
//   - 新增子导航场景：在 home.subNavs[] 追加，指定 componentKey 或 pagePath。
//   - 修改尺寸 Token（如导航栏高度）：直接改 home.navHeightRpx 即可，
//     所有消费方（IndexContentShell / IndexSubNavBar）自动响应。

export const NAV_CONFIG = {
	// ── 默认值 ──────────────────────────────────────────────
	defaultLevel1: 'home',       // 应用启动时默认激活的一级 Tab key
	tabBarHeightRpx: 140,        // 底部 Tab 栏高度，影响内容区可用高度计算

	// ── 首页专属 Token ──────────────────────────────────────
	// 这些 Token 被 IndexContentShell / IndexSubNavBar 消费，
	// 修改后会影响页面内所有场景的布局尺寸。
	home: {
		defaultLevel2: 'recommend',  // 首页默认激活的二级导航 key

		// ── 导航栏尺寸 ──
		navHeightRpx: 74,            // 二级导航行高度（不含 safeTop 和 extraNav）
		navSidePaddingRpx: 28,       // 导航项水平内边距
		navItemGapRpx: 36,           // 导航项之间的间距
		navSafeGapRpx: 24,           // 安全区顶部额外间距（状态栏下的留白）

		// ── 内容区尺寸 ──
		contentSidePaddingRpx: 32,   // 内容区左右内边距（非商城场景）
		mallContentSidePaddingRpx: 16, // 商城场景的内容区内边距（更紧凑）
		contentBottomPaddingRpx: 24, // 内容区底部内边距

		// ── 滚动 / 刷新 / 底部分页 Token ──
		// 若需调低下拉刷新触发灵敏度，可增大 lowerThresholdPx。
		lowerThresholdPx: 220,                        // PullPagingShell 触底事件阈值
		bottomPullSlotHeightRpx: 72,                  // 底部加载提示插槽高度
		bottomPullLoadedHoldMs: 420,                  // “加载完成”文案保持时长（ms）
		bottomPullNoMoreHoldMs: 480,                  // “没有更多”文案保持时长（ms）
		bottomPullReleaseDelayMs: 20,                 // 松手后收缩延迟（ms）
		bottomPullCollapseDurationMs: 380             // 底部插槽收起动画时长（ms）
	},

	// ── 导航树 ──────────────────────────────────────────────
	// tabs[] 的每项对应底部 Tab 栏的一个按钮。
	// 有 subNavs 的 Tab（如 home）是「首页」，会在顶部额外渲染二级导航行。
	// 无 subNavs 的 Tab（如 friend / message / mine）是「普通页」，
	//   直接渲染 componentKey 对应的整页组件。
	tabs: [
		{
			key: 'home',
			label: '首页',
			defaultItem: true,
			// 首页比较特殊：内嵌二级导航 + 场景内容
			subNavs: [
				// 【商城】场景 — componentKey 组件型，含三级分类 extraNav
				{
					key: 'mall',
					label: '商城',
					componentKey: 'HomeMallSceneHost',
					theme: 'light',
					contentGapRpx: 6,
					defaultLevel3: 'recommend',  // 默认激活的三级分类 key（运行时会被 cms-homePage 的 defaultTabKey 覆盖）
					extraNav: {
						componentKey: 'ShopSubNavExtra',
						heightRpx: 80        // 【调整】原 176 包含了分类条的高度；分类条已迁到 MallScene 内，此处只剩搜索框
					}
				},
				// 【直播】场景 — componentKey 组件型，深色主题
				{
					key: 'live',
					label: '直播',
					componentKey: 'HomeLiveSceneHost',
					theme: 'dark',
					contentGapRpx: 36
				},
				// 【推荐】场景 — componentKey 组件型，含发布按钮
				{
					key: 'recommend',
					label: '推荐',
					componentKey: 'HomeRecommendSceneHost',
					theme: 'light',
					contentGapRpx: 36,
					showPublishAction: true   // 是否在导航栏右侧显示发布按钮
				},
				// 【短视频】— pagePath 页面跳转型，点击会 uni.reLaunch 到 feed 页
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

// ── 视频导航常量 ──────────────────────────────────────────
// 供 feeds 页面等外部模块引用，避免硬编码 magic string。
export const VIDEO_FEED_HOME_NAV_KEY = 'video'
export const VIDEO_FEED_HOME_NAV_LABEL = '短视频'
