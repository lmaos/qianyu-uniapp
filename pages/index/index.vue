<script setup>
// ════════════════════════════════════════════════════════════
// index.vue — 应用主入口页面
// ════════════════════════════════════════════════════════════
//
// 职责：
//   1. 路由解析（从 onLoad options 提取 level1/level2/level3）
//   2. 导航状态管理（通过 resolver 驱动，维护 activeLevel1/2/3 ref）
//   3. 主题控制（按当前场景切换深色/浅色主题）
//   4. 布局计算（安全区、导航栏高度、内容区 padding）
//   5. 动作分发（点击 Tab / 子导航 -> resolver -> 执行动作）
//
// 数据流：
//   onLoad -> normalizeLevel1/2/3 -> 设置 ref
//   refs -> resolveNavigationState() -> navState computed
//   navState -> 模板渲染（IndexSubNavBar / IndexContentShell / 其他 Tab）
//   用户点击 -> resolveRouteAction() -> executeNavigationAction()
//
// 【未来改什么】
//   - 新增底部 Tab -> 只需改 indexNavigationConfig.js，这里自动适配
//   - 新增导航行为（如点击 Tab 时滚动到顶部）-> 在 executeNavigationAction 追加逻辑
//   - 修改主题色 -> 改 APP_THEME_MAP 中的色值
//   - 新增场景专属主题 -> 在 resolvedThemeConfig 追加条件分支
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { startAll, stopAll } from '@/composables/appStartup.js'
import { getCurrentLoginInfo } from '@/composables/useLoginSession.js'
import IndexSubNavBar from '@/components/home/IndexSubNavBar.vue'
import IndexContentShell from '@/components/home/IndexContentShell.vue'
// -- 导航配置 + 解析器 ---------------------------------
import { NAV_CONFIG } from '@/components/home/indexNavigationConfig'
import { resolveNavigationState, resolveRouteAction } from '@/components/home/navigationResolver'
// -- URL 构造器（搜索 / 发布按钮） ----------------------
import { buildShopSearchUrl } from '@/components/shop/common/shopFlowMock.js'
import { buildContentPublishUrl } from '@/components/user-center/contentPublishMock.js'

// 注：商城 tabList / zoneList / spuList 的请求已迁到 MallScene 内部自管，
//     此处不再提前加载。

// ── 设备信息 ──────────────────────────────────────────
// 获取设备信息用于响应式布局。pxToRpx/rpxToPx 转换工具。safeBottomPx 用于 Tab 栏避开系统导航条。

const systemInfo = uni.getSystemInfoSync()
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0
const screenWidth = systemInfo.screenWidth || 375
const safeBottomPx = systemInfo.safeAreaInsets?.bottom || 0

function pxToRpx(value) {
	return Math.round((Number(value || 0) * 750) / screenWidth)
}
function rpxToPx(value) {
	return Math.round((Number(value || 0) * screenWidth) / 750)
}

const safeTopRpx = pxToRpx(safeTopPx)

// ── 导航状态 ──────────────────────────────────────────
// activeLevel1/2/3：由 resolver 消费的三个路由层级 ref，驱动所有导航决策。

const activeLevel1 = ref(NAV_CONFIG.defaultLevel1)
const activeLevel2 = ref(NAV_CONFIG.home.defaultLevel2)
const activeLevel3 = ref('')
const contentShellRef = ref(null)

// ── 滚动状态（来自 IndexContentShell 发射）──────────────
// 从 IndexContentShell 同步下拉刷新状态到 IndexSubNavBar，通过 emit -> computed -> props 传递。

const subNavScrollState = ref({
	refreshState: 'idle',
	refreshPullText: '',
	refreshPullDistancePx: 0,
	refreshRevealDistancePx: 0
})

// ── 导航状态（解析器驱动）─────────────────────────────
// 核心：所有导航事实由 resolveNavigationState 纯函数产出。index.vue 只维护三个 ref。

const navState = computed(() => resolveNavigationState({
	level1: activeLevel1.value,
	level2: activeLevel2.value,
	level3: activeLevel3.value
}))

// ── 视图尺寸 ──────────────────────────────────────────
// 内容区高度 = 窗口高度 - Tab 栏高度 - 底部安全区，传给 IndexContentShell。

const viewportHeightPx = computed(() => {
	return Math.max(0, (systemInfo.windowHeight || 0) - rpxToPx(NAV_CONFIG.tabBarHeightRpx) - safeBottomPx)
})

// ── 主题 ──────────────────────────────────────────────
// APP_THEME_MAP 定义深色/浅色两套配色。首页按场景 theme 自动切换。

const APP_THEME_MAP = {
	dark: {
		pageBackground: '#000000',
		tabBarBackground: '#000000',
		tabBarBorderColor: 'rgba(255, 255, 255, 0.12)',
		tabBarTextColor: 'rgba(255, 255, 255, 0.48)',
		tabBarActiveColor: '#ffffff',
		tabBarShadow: 'none'
	},
	light: {
		pageBackground: '#f8fafc',
		tabBarBackground: '#ffffff',
		tabBarBorderColor: '#e8edf3',
		tabBarTextColor: '#667085',
		tabBarActiveColor: '#fe2c55',
		tabBarShadow: '0 -12rpx 30rpx rgba(15, 23, 42, 0.08)'
	}
}

const resolvedThemeConfig = computed(() => {
	if (navState.value.isHome && navState.value.subNavConfig?.lightTheme === false) {
		return APP_THEME_MAP.dark
	}
	return APP_THEME_MAP.light
})

const pageShellStyle = computed(() => ({
	background: resolvedThemeConfig.value.pageBackground
}))

const tabBarStyle = computed(() => ({
	background: resolvedThemeConfig.value.tabBarBackground,
	borderTopColor: resolvedThemeConfig.value.tabBarBorderColor,
	boxShadow: resolvedThemeConfig.value.tabBarShadow,
	height: `${rpxToPx(NAV_CONFIG.tabBarHeightRpx) + safeBottomPx}px`,
	paddingBottom: `${safeBottomPx}px`
}))

	/** 计算底部 Tab 文字样式（高亮色 + 字重） */
function getTabLabelStyle(tab) {
	return {
		color: tab.active
			? resolvedThemeConfig.value.tabBarActiveColor
			: resolvedThemeConfig.value.tabBarTextColor,
		fontWeight: tab.active ? 600 : 400
	}
}

// ── 内容区顶部内边距（避让固定导航栏）────────────────
// 导航栏总高 = safeTop + navSafeGap + navHeight + extraNavHeight + panelBottomInset + contentGap panelBottomInset=20 固定（无 extraNav 时），不区分主题。若调整某场景间距，改其 contentGapRpx。

	/** 当前场景配置（用于计算 contentTopPadding） */
const activeSceneConfig = computed(() => {
	if (!navState.value.isHome) { return null }
	return navState.value.homeSceneConfigList.find(
		s => s.key === navState.value.activeLevel2
	) || null
})

const contentTopPaddingRpx = computed(() => {
	if (!navState.value.isHome || !activeSceneConfig.value) { return 0 }
	const scene = activeSceneConfig.value
	const navTopOffsetRpx = safeTopRpx + NAV_CONFIG.home.navSafeGapRpx
	const extraHeight = scene.extraNavHeightRpx || 0
	const panelBottomInset = extraHeight > 0 ? 0 : 20
	return navTopOffsetRpx + NAV_CONFIG.home.navHeightRpx + extraHeight + panelBottomInset + scene.contentGapRpx
})

// ── 子导航栏 props（合并解析器输出 + 布局值 + 滚动状态）─
// 将 subNavConfig + 滚动状态 + 扩展监听器合并后一次性传入 IndexSubNavBar。

const resolvedSubNavProps = computed(() => {
	const config = navState.value.subNavConfig
	if (!config) { return {} }

	const navTopOffsetRpx = safeTopRpx + NAV_CONFIG.home.navSafeGapRpx
	const scroll = subNavScrollState.value

	return {
		tabList: config.tabList,
		activeTab: config.activeTab,
		lightTheme: config.lightTheme,
		safeTopOffsetRpx: navTopOffsetRpx,
		navHeightRpx: config.navHeightRpx,
		navSidePaddingRpx: config.navSidePaddingRpx,
		navItemGapRpx: config.navItemGapRpx,
		panelHeightRpx: navTopOffsetRpx + config.navHeightRpx + config.extraNavHeightRpx,
		panelBottomInsetRpx: config.extraNavHeightRpx > 0 ? 0 : 20,
		// 滚动刷新态
		refreshState: scroll.refreshState,
		refreshPullText: scroll.refreshPullText,
		refreshPullDistancePx: scroll.refreshPullDistancePx,
		refreshRevealDistancePx: scroll.refreshRevealDistancePx,
		// 扩展导航
		extraComponent: config.extraComponent,
		extraProps: resolveExtraProps(config),
		extraListeners: mallExtraListeners.value,
		showPublishAction: config.showPublishAction
	}
})

// ── 商城扩展导航 Props & Listeners ─────────────────────
// 商城导航事件：search-click/cart-click/category-change/category-page-click

	/** 按场景生成扩展导航（ShopSubNavExtra）需要的 props */
function resolveExtraProps(config) {
	if (!config.extraComponent) { return {} }
	if (navState.value.activeLevel2 === 'mall') {
		// 分类条已迁到 MallScene，此处只透传搜索框占位文案
		return {
			searchPlaceholder: '搜索商品 / 店铺 / 品牌'
		}
	}
	return {}
}

	/** 商城扩展导航监听器集合（仅在 mall 场景下有效） */
const mallExtraListeners = computed(() => {
	if (navState.value.activeLevel2 !== 'mall') { return {} }
	return {
		'search-click': () => {
			uni.navigateTo({
				url: buildShopSearchUrl({ categoryId: activeLevel3.value })
			})
		},
		'cart-click': () => {
			uni.navigateTo({ url: '/pages/shop/cart' })
		},
		'category-change': (category) => {
			console.log('[index.vue] category-change:', category)
			if (category?.id) {
				activeLevel3.value = category.id
			}
		},
		'category-page-click': () => {
			uni.navigateTo({
				url: `/pages/shop/category-list?categoryId=${encodeURIComponent(activeLevel3.value)}`
			})
		}
	}
})

// ── 页面加载 ──────────────────────────────────────────
// onLoad 解析 URL -> normalize -> 设置 ref。校验失败时 fallback 到默认值。

onLoad(options => {
	const targetLevel1 = normalizeRouteLevel1(options)
	const targetLevel2 = normalizeRouteLevel2(targetLevel1, options)
	const targetLevel3 = normalizeRouteLevel3(targetLevel2, options)

	activeLevel1.value = targetLevel1
	activeLevel2.value = targetLevel2
	activeLevel3.value = targetLevel3
	console.log('[index.vue] onLoad, route:', { level1: targetLevel1, level2: targetLevel2, level3: targetLevel3 })
	// 商城 tabList / zoneList / spuList 的请求已迁到 MallScene 内部自管，此处无需触发
})

onShow(() => {
	const info = getCurrentLoginInfo()
	const userId = info.userId || info.userNo || ''
	console.log('[index.vue] onShow, current route:', { level1: activeLevel1.value, level2: activeLevel2.value, level3: activeLevel3.value })
	startAll(userId)
})

	/** 规范化一级导航：校验合法性，非法则 fallback 到 home */
function normalizeRouteLevel1(options) {
	const raw = `${options?.level1 || options?.tab || ''}`.trim()
	if (raw && NAV_CONFIG.tabs.some(t => t.key === raw)) { return raw }
	return NAV_CONFIG.defaultLevel1
}

	/** 规范化二级导航：仅在首页且匹配 componentKey 子导航时生效 */
function normalizeRouteLevel2(level1, options) {
	if (level1 !== 'home') { return '' }
	const raw = `${options?.level2 || options?.scene || ''}`.trim()
	if (raw) {
		const homeTab = NAV_CONFIG.tabs.find(t => t.key === 'home')
		const match = homeTab?.subNavs?.find(s => s.key === raw && s.componentKey)
		if (match) { return raw }
	}
	return NAV_CONFIG.home.defaultLevel2
}

	/** 规范化三级导航：仅 mall 场景生效，取 URL 参数或 defaultLevel3 */
function normalizeRouteLevel3(level2, options) {
	if (level2 !== 'mall') { return '' }
	const raw = `${options?.level3 || options?.contentKey || ''}`.trim()
	if (raw) { return raw }
	const homeTab = NAV_CONFIG.tabs.find(t => t.key === 'home')
	const mallEntry = homeTab?.subNavs?.find(s => s.key === 'mall')
	return (mallEntry && mallEntry.defaultLevel3) || ''
}

// ── 路由动作执行 ──────────────────────────────────────
// 四种 action.type：switch-level1 / switch-scene / reLaunch / noop。

	/** 执行导航动作：根据 action.type 分派到对应处理逻辑 */
function executeNavigationAction(action) {
	switch (action.type) {
		case 'switch-level1':
			activeLevel1.value = action.level1
			if (action.level2 !== undefined) {
				activeLevel2.value = action.level2
			}
			break
		case 'switch-scene':
			activeLevel2.value = action.level2
			break
		case 'reLaunch':
			uni.reLaunch({ url: action.url })
			break
		case 'noop':
			if (action.log) { console.log(action.log) }
			break
	}
}

	/** 底部 Tab 点击处理：通过 resolver 判断动作类型后执行 */
function onTabClick(tabKey) {
	executeNavigationAction(resolveRouteAction(tabKey, navState.value))
}

	/** 二级导航点击处理（由 IndexSubNavBar @tab-change 触发） */
function onSubNavTab(navItem) {
	if (!navItem?.key) { return }
	executeNavigationAction(resolveRouteAction(navItem.key, navState.value))
}

// ── 内容壳事件 ────────────────────────────────────────
// onScrollState 接收 IndexContentShell 的发射，驱动 IndexSubNavBar 的刷新视觉。

	/** 接收 IndexContentShell 的滚动状态，更新 subNavScrollState */
function onScrollState(scrollState) {
	if (scrollState) {
		subNavScrollState.value = { ...subNavScrollState.value, ...scrollState }
	}
}


	/** 发布按钮点击：跳转内容发布页面 */
function onPublishClick() {
	uni.navigateTo({
		url: buildContentPublishUrl({ scene: navState.value.activeLevel2 })
	})
}
</script>
<template>
	<view class="page-shell" :style="pageShellStyle">
		<view class="page-content">
			<view v-if="navState.isHome" class="home-shell">
				<IndexSubNavBar
					v-bind="resolvedSubNavProps"
					@tab-change="onSubNavTab"
					@publish-click="onPublishClick"
				/>
				<IndexContentShell
					ref="contentShellRef"
					:scene-key="navState.activeLevel2"
					:content-key="activeLevel3"
					:scene-config-list="navState.homeSceneConfigList"
					:viewport-height-px="viewportHeightPx"
					:content-top-padding-rpx="contentTopPaddingRpx"
					:safe-top-rpx="safeTopRpx"
					@scroll-state="onScrollState"
				/>
			</view>

			<template v-for="tab in navState.otherTabs" :key="tab.key">
				<component
					:is="tab.component"
					v-show="navState.activeLevel1 === tab.key"
					v-bind="tab.props"
				/>
			</template>
		</view>

		<view class="tab-bar" :style="tabBarStyle">
			<view
				v-for="tab in navState.bottomNavList"
				:key="tab.key"
				:class="['tab-item', { active: tab.active }]"
				@tap="onTabClick(tab.key)"
			>
				<text class="tab-label" :style="getTabLabelStyle(tab)">{{ tab.label }}</text>
			</view>
		</view>
	</view>
</template>





<style scoped>
.page-shell {
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.page-content {
	flex: 1;
	min-height: 0;
	position: relative;
	overflow: hidden;
}

.home-shell {
	position: relative;
	height: 100%;
}

.tab-bar {
	display: flex;
	box-sizing: border-box;
	border-top-style: solid;
	border-top-width: 1rpx;
	flex-shrink: 0;
	position: relative;
	z-index: 20;
}

.tab-item {
	flex: 1;
	display: flex;
	box-sizing: border-box;
	padding-top: 25rpx;
	justify-content: center;
	height: 100%;
}

.tab-label {
	font-size: 26rpx;
	line-height: 36rpx;
}
</style>