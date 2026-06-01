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

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import IndexSubNavBar from '@/components/home/IndexSubNavBar.vue'
import IndexContentShell from '@/components/home/IndexContentShell.vue'
import { NAV_CONFIG } from '@/components/home/indexNavigationConfig'
import { resolveNavigationState, resolveRouteAction } from '@/components/home/navigationResolver'
import { buildMallHomeNavCategoryList } from '@/components/shop/category/shopCategoryMock.js'
import { buildShopSearchUrl } from '@/components/shop/common/shopFlowMock.js'
import { buildContentPublishUrl } from '@/components/user-center/contentPublishMock.js'

// ── 设备信息 ──────────────────────────────────────────

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

const activeLevel1 = ref(NAV_CONFIG.defaultLevel1)
const activeLevel2 = ref(NAV_CONFIG.home.defaultLevel2)
const activeLevel3 = ref('')
const contentShellRef = ref(null)

// ── 滚动状态（来自 IndexContentShell 发射）──────────────

const subNavScrollState = ref({
	refreshState: 'idle',
	refreshPullText: '',
	refreshPullDistancePx: 0,
	refreshRevealDistancePx: 0
})

// ── 导航状态（解析器驱动）─────────────────────────────

const navState = computed(() => resolveNavigationState({
	level1: activeLevel1.value,
	level2: activeLevel2.value,
	level3: activeLevel3.value
}))

// ── 视图尺寸 ──────────────────────────────────────────

const viewportHeightPx = computed(() => {
	return Math.max(0, (systemInfo.windowHeight || 0) - rpxToPx(NAV_CONFIG.tabBarHeightRpx) - safeBottomPx)
})

// ── 主题 ──────────────────────────────────────────────

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

function getTabLabelStyle(tab) {
	return {
		color: tab.active
			? resolvedThemeConfig.value.tabBarActiveColor
			: resolvedThemeConfig.value.tabBarTextColor,
		fontWeight: tab.active ? 600 : 400
	}
}

// ── 内容区顶部内边距（避让固定导航栏）────────────────

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
	const panelBottomInset = extraHeight > 0 ? 0 : (scene.theme === 'light' ? 20 : 0)
	return navTopOffsetRpx + NAV_CONFIG.home.navHeightRpx + extraHeight + panelBottomInset + scene.contentGapRpx
})

// ── 子导航栏 props（合并解析器输出 + 布局值 + 滚动状态）─

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
		panelBottomInsetRpx: config.extraNavHeightRpx > 0 ? 0 : (config.lightTheme ? 20 : 0),
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

function resolveExtraProps(config) {
	if (!config.extraComponent) { return {} }
	if (navState.value.activeLevel2 === 'mall') {
		return {
			searchPlaceholder: '搜索商品 / 店铺 / 品牌',
			categoryList: buildMallHomeNavCategoryList(),
			activeId: activeLevel3.value
		}
	}
	return {}
}

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

onLoad(options => {
	const targetLevel1 = normalizeRouteLevel1(options)
	const targetLevel2 = normalizeRouteLevel2(targetLevel1, options)
	const targetLevel3 = normalizeRouteLevel3(targetLevel2, options)

	activeLevel1.value = targetLevel1
	activeLevel2.value = targetLevel2
	activeLevel3.value = targetLevel3
})

function normalizeRouteLevel1(options) {
	const raw = `${options?.level1 || options?.tab || ''}`.trim()
	if (raw && NAV_CONFIG.tabs.some(t => t.key === raw)) { return raw }
	return NAV_CONFIG.defaultLevel1
}

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

function normalizeRouteLevel3(level2, options) {
	if (level2 !== 'mall') { return '' }
	const raw = `${options?.level3 || options?.contentKey || ''}`.trim()
	if (raw) { return raw }
	const homeTab = NAV_CONFIG.tabs.find(t => t.key === 'home')
	const mallEntry = homeTab?.subNavs?.find(s => s.key === 'mall')
	return (mallEntry && mallEntry.defaultLevel3) || ''
}

// ── 路由动作执行 ──────────────────────────────────────

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

function onTabClick(tabKey) {
	executeNavigationAction(resolveRouteAction(tabKey, navState.value))
}

function onSubNavTab(navItem) {
	if (!navItem?.key) { return }
	executeNavigationAction(resolveRouteAction(navItem.key, navState.value))
}

// ── 内容壳事件 ────────────────────────────────────────

function onScrollState(scrollState) {
	if (scrollState) {
		subNavScrollState.value = { ...subNavScrollState.value, ...scrollState }
	}
}


function onPublishClick() {
	uni.navigateTo({
		url: buildContentPublishUrl({ scene: navState.value.activeLevel2 })
	})
}
</script>

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
