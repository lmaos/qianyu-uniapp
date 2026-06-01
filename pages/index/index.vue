<template>
	<view class="page-shell" :style="pageShellStyle">
		<view class="page-content">
			<view v-show="activeTab === 'home'" class="home-shell">
				<HomeSubNavShell
					v-bind="homeNavBindings"
					@tab-change="handleHomeSubNavChange"
					@publish-click="handleHomePublishClick"
				/>
				<HomeShellContent
					ref="homeShellRef"
					:active="activeTab === 'home'"
					:initial-scene="activeHomeScene"
					:initial-content-key="activeHomeContentKey"
					:viewport-height-px="contentViewportHeightPx"
					:show-sub-nav="false"
					@shell-state-change="handleHomeShellStateChange"
				/>
			</view>
			<template v-for="tab in nonHomeTabs" :key="tab.key">
				<component
					:is="tab.hostComponent"
					v-show="activeTab === tab.key"
					v-bind="resolveLevel1HostProps(tab)"
				/>
			</template>
		</view>

		<view class="tab-bar" :style="tabBarStyle">
			<view
				v-for="tab in tabList"
				:key="tab.key"
				:class="['tab-item', { active: activeTab === tab.key }]"
				@tap="handleTabClick(tab.key)"
			>
				<text class="tab-label" :style="getTabLabelStyle(tab.key)">{{ tab.label }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HomeSubNavShell from '@/components/home/HomeSubNavShell.vue'
import HomeShellContent from '@/components/home/HomeShellContent.vue'
import {
	buildHomeVideoFeedUrl,
	VIDEO_FEED_HOME_NAV_KEY,
	VIDEO_FEED_HOME_NAV_LABEL
} from '@/components/video/videoFeedConfig.js'
import {
	indexLevel1ConfigMap,
	indexLevel1List,
	indexNavigationConfig,
	homeLevel2ConfigMap,
	homeLevel2List
} from '@/components/home/indexNavigationConfig'
import { buildMallHomeNavCategoryList } from '@/components/shop/category/shopCategoryMock.js'

const systemInfo = uni.getSystemInfoSync()
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0
const screenWidth = systemInfo.screenWidth || 375
const safeBottomPx = systemInfo.safeAreaInsets?.bottom || 0

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

const tabList = indexLevel1List
const nonHomeTabs = tabList.filter(item => item.key !== 'home' && item.hostComponent)
const activeTab = ref(indexNavigationConfig.defaultLevel1)
const activeHomeScene = ref(indexNavigationConfig.home.defaultLevel2)
const activeHomeContentKey = ref(homeLevel2ConfigMap.mall.defaultLevel3 || '')
const homeShellRef = ref(null)
const syncedHomeNavBindings = ref(null)
const pendingHomeSceneSync = ref('')

const contentViewportHeightPx = computed(() => {
	return Math.max(0, (systemInfo.windowHeight || 0) - rpxToPx(indexNavigationConfig.tabBarHeightRpx) - safeBottomPx)
})

const resolvedThemeConfig = computed(() => {
	if (activeTab.value === 'home' && !activeHomeShellLightTheme.value) {
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
	height: `${rpxToPx(indexNavigationConfig.tabBarHeightRpx) + safeBottomPx}px`,
	paddingBottom: `${safeBottomPx}px`
}))

const fallbackHomeNavBindings = computed(() => ({
	tabList: homeLevel2List.map(item => ({
		key: item.key,
		label: item.label
	})),
	activeTab: activeHomeScene.value,
	lightTheme: (homeLevel2ConfigMap[activeHomeScene.value] || homeLevel2ConfigMap[indexNavigationConfig.home.defaultLevel2]).theme === 'light',
	safeTopOffsetRpx: pxToRpx(safeTopPx) + indexNavigationConfig.home.navSafeGapRpx,
	navHeightRpx: indexNavigationConfig.home.navHeightRpx,
	navSidePaddingRpx: indexNavigationConfig.home.navSidePaddingRpx,
	navItemGapRpx: indexNavigationConfig.home.navItemGapRpx,
	panelHeightRpx:
		pxToRpx(safeTopPx) +
		indexNavigationConfig.home.navSafeGapRpx +
		indexNavigationConfig.home.navHeightRpx +
		resolveFallbackExtraHeightRpx(activeHomeScene.value),
	panelBottomInsetRpx: resolveFallbackExtraHeightRpx(activeHomeScene.value) > 0 ? 0 : 20,
	refreshState: 'idle',
	refreshPullText: `下拉刷新${(homeLevel2ConfigMap[activeHomeScene.value] || homeLevel2ConfigMap[indexNavigationConfig.home.defaultLevel2]).label}频道`,
	refreshPullDistancePx: 0,
	refreshRevealDistancePx: rpxToPx(indexNavigationConfig.home.navHeightRpx),
	extraComponent: resolveFallbackExtraComponent(activeHomeScene.value),
	extraProps: resolveFallbackExtraProps(activeHomeScene.value),
	extraListeners: {},
	showPublishAction: activeHomeScene.value === 'recommend'
}))

const homeNavBindings = computed(() => {
	const resolvedBindings = syncedHomeNavBindings.value || fallbackHomeNavBindings.value
	const tabList = Array.isArray(resolvedBindings?.tabList) ? resolvedBindings.tabList : []
	if (tabList.some((item) => item?.key === VIDEO_FEED_HOME_NAV_KEY)) {
		return resolvedBindings
	}

	return {
		...resolvedBindings,
		tabList: tabList.concat({
			key: VIDEO_FEED_HOME_NAV_KEY,
			label: VIDEO_FEED_HOME_NAV_LABEL
		})
	}
})

const activeHomeShellLightTheme = computed(() => {
	if (typeof syncedHomeNavBindings.value?.lightTheme === 'boolean') {
		return syncedHomeNavBindings.value.lightTheme
	}

	return (homeLevel2ConfigMap[activeHomeScene.value] || homeLevel2ConfigMap[indexNavigationConfig.home.defaultLevel2]).theme === 'light'
})

onLoad(options => {
	applyRouteTarget(options || {})
})

function handleTabClick(tabKey) {
	if (tabKey === activeTab.value) {
		if (tabKey === 'home') {
			homeShellRef.value?.handleSubNavClick?.({
				key: activeHomeScene.value,
				label: homeLevel2ConfigMap[activeHomeScene.value]?.label || ''
			})
		}
		return
	}
	if (tabKey !== 'home') {
		pendingHomeSceneSync.value = ''
	}
	activeTab.value = tabKey
}

function handleHomeSubNavChange(navItem) {
	if (!navItem?.key) {
		return
	}

	if (navItem.key === VIDEO_FEED_HOME_NAV_KEY) {
		uni.reLaunch({
			url: buildHomeVideoFeedUrl({
				level1: 'home',
				level2: activeHomeScene.value,
				layoutPayload: buildVideoFeedLayoutPayload()
			})
		})
		return
	}
	pendingHomeSceneSync.value = normalizeLevel2Key(navItem.key)
	homeShellRef.value?.handleSubNavClick?.(navItem)
	activeHomeScene.value = normalizeLevel2Key(navItem.key)
}

function handleHomePublishClick() {
	homeShellRef.value?.handlePublishClick?.()
}

function buildVideoFeedLayoutPayload() {
	const resolvedTopNavList = Array.isArray(homeNavBindings.value?.tabList) ? homeNavBindings.value.tabList : []
	const topNavList = resolvedTopNavList.some((item) => item?.key === VIDEO_FEED_HOME_NAV_KEY)
		? resolvedTopNavList
		: resolvedTopNavList.concat({
				key: VIDEO_FEED_HOME_NAV_KEY,
				label: VIDEO_FEED_HOME_NAV_LABEL
			})
	const positionedTopNavList = topNavList.reduce(
		(result, item) => {
			const widthRpx = resolveVideoFeedTopItemWidth(item)
			result.items.push({
				key: item.key,
				label: item.label,
				widthRpx,
				leftRpx: result.cursorRpx
			})
			result.cursorRpx += widthRpx + indexNavigationConfig.home.navItemGapRpx
			return result
		},
		{
			items: [],
			cursorRpx: 0
		}
	).items

	return JSON.stringify({
		navHeightRpx: indexNavigationConfig.home.navHeightRpx,
		navSidePaddingRpx: indexNavigationConfig.home.navSidePaddingRpx,
		navItemGapRpx: indexNavigationConfig.home.navItemGapRpx,
		navSafeGapRpx: indexNavigationConfig.home.navSafeGapRpx,
		tabBarHeightRpx: indexNavigationConfig.tabBarHeightRpx,
		topNavList: positionedTopNavList,
		bottomTabList: tabList.map((item) => ({
			key: item.key,
			label: item.label
		}))
	})
}

function resolveVideoFeedTopItemWidth(item) {
	const labelLength = Array.from(`${item?.label || ''}`).length || 2
	return Math.max(96, labelLength * 32 + 24)
}

function handleHomeShellStateChange(payload) {
	if (!payload || typeof payload !== 'object') {
		return
	}

	const payloadScene = normalizeLevel2Key(payload.activeScene)
	if (pendingHomeSceneSync.value && payloadScene !== pendingHomeSceneSync.value) {
		return
	}

	pendingHomeSceneSync.value = ''
	syncedHomeNavBindings.value = payload.navBindings || null
	activeHomeScene.value = payloadScene
	activeHomeContentKey.value = normalizeLevel3Key(
		payloadScene,
		payload.activeContentKey
	)
}

function applyRouteTarget(options = {}) {
	const routeTarget = resolveRouteTarget(options)
	activeTab.value = routeTarget.level1
	syncedHomeNavBindings.value = null
	pendingHomeSceneSync.value = routeTarget.level1 === 'home' ? routeTarget.level2 : ''
	if (routeTarget.level1 !== 'home') {
		return
	}

	activeHomeScene.value = routeTarget.level2
	activeHomeContentKey.value = routeTarget.level3
}

function resolveRouteTarget(options = {}) {
	const nextLevel1 = normalizeLevel1Key(options.level1 || options.tab)
	if (nextLevel1 !== 'home') {
		return {
			level1: nextLevel1,
			level2: '',
			level3: ''
		}
	}

	const nextLevel2 = normalizeLevel2Key(options.level2 || options.scene)
	return {
		level1: nextLevel1,
		level2: nextLevel2,
		level3: normalizeLevel3Key(nextLevel2, options.level3 || options.contentKey)
	}
}

function normalizeLevel1Key(rawValue) {
	if (!rawValue) {
		return indexNavigationConfig.defaultLevel1
	}

	return indexLevel1ConfigMap[rawValue] ? rawValue : indexNavigationConfig.defaultLevel1
}

function resolveLevel1HostProps(tab) {
	const baseProps = { ...(tab.hostProps || {}) }
	if ('active' in baseProps) {
		baseProps.active = activeTab.value === tab.key
	}
	return baseProps
}

function normalizeLevel2Key(rawValue) {
	if (!rawValue) {
		return indexNavigationConfig.home.defaultLevel2
	}

	return homeLevel2ConfigMap[rawValue] ? rawValue : indexNavigationConfig.home.defaultLevel2
}

function normalizeLevel3Key(level2Key, rawValue) {
	if (level2Key !== 'mall') {
		return ''
	}

	return `${rawValue || ''}`.trim() || homeLevel2ConfigMap.mall.defaultLevel3 || ''
}

function resolveFallbackExtraComponent(level2Key) {
	return homeLevel2ConfigMap[level2Key]?.extraNavComponent || null
}

function resolveFallbackExtraHeightRpx(level2Key) {
	return homeLevel2ConfigMap[level2Key]?.extraNavHeightRpx || 0
}

function resolveFallbackExtraProps(level2Key) {
	if (level2Key !== 'mall') {
		return {}
	}

	return {
		searchPlaceholder: '搜索商品 / 店铺 / 品牌',
		categoryList: buildMallHomeNavCategoryList(),
		activeId: activeHomeContentKey.value
	}
}

function getTabLabelStyle(tabKey) {
	const isActive = activeTab.value === tabKey
	return {
		color: isActive
			? resolvedThemeConfig.value.tabBarActiveColor
			: resolvedThemeConfig.value.tabBarTextColor,
		fontWeight: isActive ? 600 : 400
	}
}

function pxToRpx(value) {
	return Math.round((Number(value || 0) * 750) / screenWidth)
}

function rpxToPx(value) {
	return Math.round((Number(value || 0) * screenWidth) / 750)
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
