// ── 导航解析器（纯函数模块）────────────────────────────────
//
// 职责：接收「当前路由层级状态」→ 输出「完整导航状态对象」。
//     - 不依赖 Vue 组件实例，只读，无副作用。
//     - 所有导航决策逻辑（Tab / 子导航 / 场景、路由动作）统一在此。
//     - 首页场景的 Vue 组件引用在下方注册表中集中映射。
//
// 扩展说明：
//     - 新增场景组件 → 在本文件顶部 import，并在 componentRegistry 注册。
//       注册后 config 中用 componentKey 字符串引用即可。
//     - 新增导航逻辑 → 在各导出函数中追加 case / 分支。
//       注意保持纯函数（不引用外部可变状态）。
//
// 数据流：
//     index.vue（维护 level1/level2/level3 ref）
//         → resolveNavigationState({level1,level2,level3})
//         → index.vue 将结果解构为 navState、subNavConfig、sceneConfigList 等
//         → 模板分发到 IndexSubNavBar / IndexContentShell / 其他 Tab 组件

import { NAV_CONFIG, VIDEO_FEED_HOME_NAV_KEY } from './indexNavigationConfig'
import { buildNavigationIndexRoute, buildNavigationTargetUrl } from '@/components/common/navigation/navigationActionProtocol.js'

// ── 组件注册表 ────────────────────────────────────────────
// 所有导航相关的 Vue 组件仅在此处统一导入。
// 使用方式：config 中的 componentKey（字符串）→ 此处映射为 Vue 组件对象引用。
//
// 【未来改什么】
//   - 新增组件：在下方 import + 追加到 registry 对象。
//   - 替换组件：改 registry 中的映射即可，config 无需动。
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

// ── 内部工具 ──────────────────────────────────────────────
// 以下 findTab / findSubNav / resolveComponent 为纯查找函数，
// 不做 defaults fallback — 调用方（normalizeXXX / 导出函数）负责兜底。

/** 按 key 查找配置树中的一级 Tab，找不到返回 null */
function findTab(key) {
	return NAV_CONFIG.tabs.find(tab => tab.key === key) || null
}

/** 在指定 Tab 的 subNavs 中按 key 查找子导航项，找不到返回 null */
function findSubNav(tab, key) {
	if (!tab || !Array.isArray(tab.subNavs)) { return null }
	return tab.subNavs.find(s => s.key === key) || null
}

/** 从注册表中按 componentKey 字符串查找实际 Vue 组件，找不到返回 null */
function resolveComponent(componentKey) {
	return componentRegistry[componentKey] || null
}

/** 规范化一级导航 key：找不到则 fallback 到 defaultLevel1 */
function normalizeLevel1(raw) {
	const key = `${raw || ''}`.trim()
	return findTab(key) ? key : NAV_CONFIG.defaultLevel1
}

/** 规范化二级导航 key：
 *  - 空值或无匹配 → defaultLevel2
 *  - 仅匹配 componentKey 型（有实际场景组件），不匹配 pagePath 型 */
function normalizeLevel2(raw) {
	const key = `${raw || ''}`.trim()
	if (!key) { return NAV_CONFIG.home.defaultLevel2 }
	const homeTab = findTab('home')
	if (!homeTab || !Array.isArray(homeTab.subNavs)) { return NAV_CONFIG.home.defaultLevel2 }
	const match = homeTab.subNavs.find(s => s.key === key && s.componentKey)
	return match ? key : NAV_CONFIG.home.defaultLevel2
}

/** 规范化三级导航 key（仅 mall 场景有）：提取 URL 参数或走 defaultLevel3 */
function normalizeLevel3(level2, raw) {
	if (level2 !== 'mall') { return '' }
	const key = `${raw || ''}`.trim()
	if (key) { return key }
	const mallEntry = findSubNav(findTab('home'), 'mall')
	return (mallEntry && mallEntry.defaultLevel3) || ''
}

// ── 导出：解析导航状态 ────────────────────────────────────
//
// 入参：{ level1, level2, level3 } — 当前路由层级（由 index.vue 维护）
// 返回值：完整导航状态对象，包含：
//   bottomNavList      — 底部 Tab 列表（含 active 标记）
//   isHome             — 当前是否为首页（有 subNavs 的 Tab）
//   subNavConfig       — 首页子导航栏配置（传给 IndexSubNavBar）
//   homeSceneConfigList — 首页所有场景组件的懒挂载列表（传给 IndexContentShell）
//   otherTabs          — 非首页 Tab 的组件列表（直接渲染在 index.vue）
//   activeLevel1/2/3   — 规范化后的当前层级 key
//
// 【未来改什么】
//   - 若需增加 subNavConfig 传给 IndexSubNavBar 的 props，在此追加。
//   - 若需按场景动态改变底部 Tab 栏样式，可在 bottomNavList 追加字段，
//     然后 index.vue 消费时读取。

export function resolveNavigationState({ level1, level2, level3 } = {}) {
	const activeLevel1 = normalizeLevel1(level1)
	const activeLevel2 = normalizeLevel2(level2)
	const activeLevel3 = normalizeLevel3(activeLevel2, level3)

	const tabConfig = findTab(activeLevel1)

	// ── 底部 Tab 列表 ─────────────────────────────────
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
		// ═══════════════════════════════════════════════════
		// 首页模式：含子导航 + 场景内容
		// ═══════════════════════════════════════════════════
		isHome = true
		const currentSubNav = findSubNav(tabConfig, activeLevel2)

		// 子导航列表（含非 component 型的 page 节点，如 video）
		const subNavTabList = tabConfig.subNavs.map(s => ({
			key: s.key,
			label: s.label,
			active: s.key === activeLevel2
		}))

		// 所有 component 型场景（供 IndexContentShell 懒挂载用）
		// 使用 filter 排除 pagePath 型节点（如 video），它们走 reLaunch 跳转
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

		// ── 子导航栏配置（传给 IndexSubNavBar.vue）──────
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
		// ═══════════════════════════════════════════════════
		// 非首页模式：直接渲染页面组件
		// ═══════════════════════════════════════════════════
		otherTabs = NAV_CONFIG.tabs
			.filter(t => t.componentKey)  // 排除无组件的（理论上不应出现）
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

// ── 导出：解析路由动作（点击导航项时调用）────────────────
//
// 入参：
//   targetKey   — 被点击的 Tab / 子导航项 key
//   currentState — resolveNavigationState 的返回值
// 返回值：
//   { type: 'switch-level1' | 'switch-scene' | 'reLaunch' | 'noop', ... }
//
// 四种动作类型：
//   switch-level1 — 切换一级底部 Tab，可选附带切换二级场景
//   switch-scene  — 在首页内部切换二级场景（组件切换）
//   reLaunch     — 页面跳转（如短视频 feed 页），使用 uni.reLaunch
//   noop         — 无操作（重复点击），仅控制台 log
//
// 【未来改什么】
//   - 若要支持点击重复 Tab 时滚动到顶部，可将 noop 改为 emit scroll-to-top。
//   - 若要支持子导航项点击时附加参数（如追踪埋点），在返回值增加字段。
//   - 若要拦截某个导航项（如未登录跳登录），在此函数中 return { type: 'intercept', ... }，
//     然后在 index.vue 的 executeNavigationAction 中处理新 type。

export function resolveRouteAction(targetKey, currentState = {}) {
	const activeLevel1 = currentState.activeLevel1 || NAV_CONFIG.defaultLevel1
	const activeLevel2 = currentState.activeLevel2 || NAV_CONFIG.home.defaultLevel2
	const activeLevel3 = currentState.activeLevel3 || ''

	// ── 尝试匹配一级 Tab ──────────────────────────────
	const tabTarget = findTab(targetKey)
	if (tabTarget) {
		// 重复点击 Tab → noop（可改为滚动到顶部）
		if (targetKey === activeLevel1) {
			return { type: 'noop', log: `ignore repeat tab: ${targetKey}` }
		}

		// 切换到首页 → 保持当前二级场景，若不存在则走 defaultLevel2
		if (Array.isArray(tabTarget.subNavs)) {
			const targetLevel2 = findSubNav(tabTarget, activeLevel2)
				? activeLevel2
				: NAV_CONFIG.home.defaultLevel2
			return { type: 'switch-level1', level1: targetKey, level2: targetLevel2 }
		}

		// 切换到非首页 Tab
		return { type: 'switch-level1', level1: targetKey }
	}

	// ── 尝试匹配二级导航（首页子导航）────────────────
	const homeTab = findTab('home')
	const subNavEntry = findSubNav(homeTab, targetKey)
	if (!subNavEntry) {
		return { type: 'noop', log: `unknown target: ${targetKey}` }
	}

	// pagePath 型 → reLaunch 跳转（如短视频）
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

// ── 导出：导航快照（feed.nvue 使用）───────────────────────
//
// 给 nvue 页面（短视频 feed）使用的导航数据快照。
// nvue 不能运行 Vue <template> 渲染，所以返回纯 JSON 结构。
// feed.nvue 用此数据自行渲染顶部的子导航栏和底部的 Tab 栏。
//
// 【未来改什么】
//   - 若 feed 导航栏样式需要新的 Token，在 navTokens 追加即可。
//   - 若 feed 需要感知当前场景（如区分来自哪个子导航），可扩展返回值。

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

// ── 导出：返回 URL（works.nvue / detail.vue 使用）─────────
//
// 从视频相关页面「返回」时导航到哪个页面。
// 普通模式 → 回到首页的当前二级场景
// my-works 模式 → 回到"我的"Tab
//
// 【未来改什么】
//   - 若需支持更多进入来源（如从搜索结果页进入视频），在此追加 mode 分支。
//   - 若需记忆用户上次在首页的滚动位置，可在 URL 附带额外参数。

export function resolveReturnUrl({ level1, level2, mode } = {}) {
	if (mode === 'my-works') {
		return buildNavigationIndexRoute({ level1: 'mine' })
	}
	const l1 = level1 || 'home'
	const l2 = l1 === 'home' ? (level2 || NAV_CONFIG.home.defaultLevel2) : ''
	return buildNavigationIndexRoute({ level1: l1, level2: l2 })
}

// ── 导出：视频相关常量 ────────────────────────────────────

export { VIDEO_FEED_HOME_NAV_KEY } from './indexNavigationConfig'
