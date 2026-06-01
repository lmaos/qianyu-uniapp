// ── 导航解析器 ────────────────────────────────────────────
// 纯函数模块，不依赖 Vue 组件实例，仅依赖静态配置 + 组件注册表。
// 所有导航决策（当前 Tab / 子导航 / 场景、路由动作）统一在此输出。
// 组件注册表集中在此，修改组件映射只需改这一处 registry。

import { NAV_CONFIG, VIDEO_FEED_HOME_NAV_KEY } from './indexNavigationConfig'
import { buildNavigationIndexRoute, buildNavigationTargetUrl } from '@/components/common/navigation/navigationActionProtocol.js'

// ── 组件注册表 ──────────────────────────────────────────
// 所有导航相关的 Vue 组件，仅在此处统一导入。
// componentKey 在 config 中是字符串，此处解析为实际组件引用。
import HomeRecommendSceneHost from '@/components/home/scenes/HomeRecommendSceneHost.vue'
import HomeLiveSceneHost from '@/components/home/scenes/HomeLiveSceneHost.vue'
import HomeMallSceneHost from '@/components/home/scenes/HomeMallSceneHost.vue'
import ShopSubNavExtra from '@/components/home/shop/ShopSubNavExtra.vue'
import FriendPage from '@/pages/friend/friend.vue'
import MessagePage from '@/pages/message/message.vue'
import MinePage from '@/pages/mine/mine.vue'

const componentRegistry = {
	HomeRecommendSceneHost,
	HomeLiveSceneHost,
	HomeMallSceneHost,
	ShopSubNavExtra,
	FriendPage,
	MessagePage,
	MinePage
}

// ── 内部工具 ────────────────────────────────────────────

function findTab(key) {
	return NAV_CONFIG.tabs.find(tab => tab.key === key) || null
}

function findSubNav(tab, key) {
	if (!tab || !Array.isArray(tab.subNavs)) { return null }
	return tab.subNavs.find(s => s.key === key) || null
}

function resolveComponent(componentKey) {
	return componentRegistry[componentKey] || null
}

function normalizeLevel1(raw) {
	const key = `${raw || ''}`.trim()
	return findTab(key) ? key : NAV_CONFIG.defaultLevel1
}

function normalizeLevel2(raw) {
	const key = `${raw || ''}`.trim()
	if (!key) { return NAV_CONFIG.home.defaultLevel2 }
	const homeTab = findTab('home')
	if (!homeTab || !Array.isArray(homeTab.subNavs)) { return NAV_CONFIG.home.defaultLevel2 }
	const match = homeTab.subNavs.find(s => s.key === key && s.componentKey)
	return match ? key : NAV_CONFIG.home.defaultLevel2
}

function normalizeLevel3(level2, raw) {
	if (level2 !== 'mall') { return '' }
	const key = `${raw || ''}`.trim()
	if (key) { return key }
	const mallEntry = findSubNav(findTab('home'), 'mall')
	return (mallEntry && mallEntry.defaultLevel3) || ''
}

// ── 导出：解析导航状态 ──────────────────────────────────

export function resolveNavigationState({ level1, level2, level3 } = {}) {
	const activeLevel1 = normalizeLevel1(level1)
	const activeLevel2 = normalizeLevel2(level2)
	const activeLevel3 = normalizeLevel3(activeLevel2, level3)

	const tabConfig = findTab(activeLevel1)

	// 底部 Tab 列表
	const bottomNavList = NAV_CONFIG.tabs.map(t => ({
		key: t.key,
		label: t.label,
		active: t.key === activeLevel1
	}))

	let isHome = false
	let subNavConfig = null
	let homeSceneConfigList = []
	let otherTabs = []

	if (tabConfig && Array.isArray(tabConfig.subNavs)) {
		// ── 首页：含子导航 + 场景内容 ─────────────────
		isHome = true
		const currentSubNav = findSubNav(tabConfig, activeLevel2)

		// 子导航列表（含非 component 型的 page 节点，如 video）
		const subNavTabList = tabConfig.subNavs.map(s => ({
			key: s.key,
			label: s.label,
			active: s.key === activeLevel2
		}))

		// 所有 component 型场景（供 IndexContentShell 懒挂载用）
		homeSceneConfigList = tabConfig.subNavs
			.filter(s => s.componentKey)
			.map(s => {
				const extraNavComponent = s.extraNav
					? resolveComponent(s.extraNav.componentKey)
					: null
				return {
					key: s.key,
					label: s.label,
					component: resolveComponent(s.componentKey),
					theme: s.theme || 'dark',
					contentGapRpx: s.contentGapRpx != null ? s.contentGapRpx : 36,
					showPublishAction: s.showPublishAction || false,
					defaultContentKey: s.defaultLevel3 || '',
					extraNavComponent,
					extraNavHeightRpx: s.extraNav ? s.extraNav.heightRpx : 0
				}
			})

		// 当前激活场景的配置
		const currentSceneConfig = currentSubNav && currentSubNav.componentKey
			? homeSceneConfigList.find(s => s.key === activeLevel2) || null
			: null

		const activeExtraNavComponent = currentSceneConfig
			? currentSceneConfig.extraNavComponent
			: null
		const activeExtraNavHeightRpx = currentSceneConfig
			? currentSceneConfig.extraNavHeightRpx
			: 0

		subNavConfig = {
			tabList: subNavTabList,
			activeTab: activeLevel2,
			lightTheme: currentSceneConfig ? currentSceneConfig.theme === 'light' : false,
			navHeightRpx: NAV_CONFIG.home.navHeightRpx,
			navSidePaddingRpx: NAV_CONFIG.home.navSidePaddingRpx,
			navItemGapRpx: NAV_CONFIG.home.navItemGapRpx,
			showPublishAction: currentSceneConfig ? currentSceneConfig.showPublishAction : false,
			extraComponent: activeExtraNavComponent,
			extraNavHeightRpx: activeExtraNavHeightRpx
		}
	} else {
		// ── 非首页：直接渲染页面组件 ──────────────────
		otherTabs = NAV_CONFIG.tabs
			.filter(t => t.componentKey)
			.map(t => ({
				key: t.key,
				component: resolveComponent(t.componentKey),
				props: { active: true }
			}))
	}

	return {
		activeLevel1,
		activeLevel2,
		activeLevel3,
		bottomNavList,
		isHome,
		subNavConfig,
		homeSceneConfigList,
		otherTabs
	}
}

// ── 导出：解析路由动作 ──────────────────────────────────

export function resolveRouteAction(targetKey, currentState = {}) {
	const activeLevel1 = currentState.activeLevel1 || NAV_CONFIG.defaultLevel1
	const activeLevel2 = currentState.activeLevel2 || NAV_CONFIG.home.defaultLevel2
	const activeLevel3 = currentState.activeLevel3 || ''

	// 尝试匹配一级 Tab
	const tabTarget = findTab(targetKey)
	if (tabTarget) {
		// 重复点击 Tab
		if (targetKey === activeLevel1) {
			return { type: 'noop', log: `ignore repeat tab: ${targetKey}` }
		}

		// 切换到首页
		if (Array.isArray(tabTarget.subNavs)) {
			const targetLevel2 = findSubNav(tabTarget, activeLevel2)
				? activeLevel2
				: NAV_CONFIG.home.defaultLevel2
			return { type: 'switch-level1', level1: targetKey, level2: targetLevel2 }
		}

		// 切换到非首页 Tab
		return { type: 'switch-level1', level1: targetKey }
	}

	// 尝试匹配二级导航（首页子导航）
	const homeTab = findTab('home')
	const subNavEntry = findSubNav(homeTab, targetKey)
	if (!subNavEntry) {
		return { type: 'noop', log: `unknown target: ${targetKey}` }
	}

	// pagePath 型 → reLaunch 跳转
	if (subNavEntry.pagePath) {
		const url = buildNavigationTargetUrl(subNavEntry.pagePath, {
			level1: 'home',
			level2: activeLevel2,
			level3: activeLevel3
		})
		return { type: 'reLaunch', url }
	}

	// component 型 → 重复点击
	if (targetKey === activeLevel2) {
		return { type: 'noop', log: `ignore repeat sub-nav: ${targetKey}` }
	}

	// component 型 → 内部场景切换
	return { type: 'switch-scene', level2: targetKey }
}

// ── 导出：导航快照（feed.nvue 使用）───────────────────

export function resolveFeedNavigationSnapshot({ level2 } = {}) {
	const homeTab = findTab('home')
	const subNavs = (homeTab && Array.isArray(homeTab.subNavs)) ? homeTab.subNavs : []
	const currentLevel2 = normalizeLevel2(level2)

	const topNavList = subNavs.map(s => ({
		key: s.key,
		label: s.label,
		active: s.key === currentLevel2
	}))

	const bottomNavList = NAV_CONFIG.tabs.map(t => ({
		key: t.key,
		label: t.label,
		active: t.key === 'home'
	}))

	return {
		topNavList,
		bottomNavList,
		navTokens: {
			navHeightRpx: NAV_CONFIG.home.navHeightRpx,
			navSidePaddingRpx: NAV_CONFIG.home.navSidePaddingRpx,
			navItemGapRpx: NAV_CONFIG.home.navItemGapRpx,
			navSafeGapRpx: NAV_CONFIG.home.navSafeGapRpx,
			tabBarHeightRpx: NAV_CONFIG.tabBarHeightRpx
		}
	}
}

// ── 导出：返回 URL（works.nvue / detail.vue 使用）───────

export function resolveReturnUrl({ level1, level2, mode } = {}) {
	if (mode === 'my-works') {
		return buildNavigationIndexRoute({ level1: 'mine' })
	}
	const l1 = level1 || 'home'
	const l2 = l1 === 'home' ? (level2 || NAV_CONFIG.home.defaultLevel2) : ''
	return buildNavigationIndexRoute({ level1: l1, level2: l2 })
}

// ── 导出：视频相关常量 ──────────────────────────────────

export { VIDEO_FEED_HOME_NAV_KEY } from './indexNavigationConfig'
