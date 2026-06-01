<template>
	<view :class="['page-shell', isLightScene ? 'page-shell-light' : '']" :style="pageShellStyle">
		<view v-if="isLightScene" class="page-light-background" :style="lightBackgroundStyle"></view>

		<HomeSubNavShell
			v-if="showSubNav"
			:tab-list="subNavList"
			:active-tab="activeSubNav"
			:light-theme="isLightScene"
			:safe-top-offset-rpx="navTopOffsetRpx"
			:nav-height-rpx="homeMock.navHeightRpx"
			:nav-side-padding-rpx="homeMock.navSidePaddingRpx"
			:nav-item-gap-rpx="homeMock.navItemGapRpx"
			:panel-height-rpx="shellPanelHeightRpx"
			:panel-bottom-inset-rpx="activePanelBottomInsetRpx"
			:refresh-state="refreshHintState"
			:refresh-pull-text="refreshPullText"
			:refresh-pull-distance-px="refreshPullDistancePx"
			:refresh-reveal-distance-px="navRowHeightPx"
			:extra-component="activeExtraNavComponent"
			:extra-props="activeExtraNavProps"
			:extra-listeners="activeExtraNavListeners"
			:show-publish-action="activeSubNav === 'recommend'"
			@tab-change="handleSubNavClick"
			@publish-click="handlePublishClick"
		/>

		<view :class="['content-shell', isLightScene ? 'content-shell-light' : '']" :style="contentShellStyle">
			<PullPagingShell
				:light-theme="isLightScene"
				:scroll-y="parentScrollEnabled"
				:refresher-enabled="parentRefresherEnabled"
				refresher-background="transparent"
				:lower-threshold="homeMock.lowerThresholdPx"
				:refresher-triggered="refreshing"
				:scroll-top="parentScrollTopValue"
				:inner-style="contentInnerStyle"
				:bottom-pull-state="bottomPullState"
				:bottom-pull-visible="bottomPullEnabled && bottomPullVisible"
				:bottom-pull-slot-style="bottomPullSlotStyle"
				@scroll="handleParentScroll"
				@refresher-pulling="handleRefresherPulling"
				@refresher-restore="handleRefresherRestore"
				@touch-start="handleParentTouchStart"
				@touch-end="handleParentTouchEnd"
				@refresher-refresh="handleParentRefresh"
				@scroll-lower="handleParentReachLower"
			>
				<template v-for="scene in homeSceneList" :key="scene.key">
					<component
						:is="scene.contentComponent"
						v-if="shouldMountScene(scene.key)"
						v-show="activeSubNav === scene.key"
						:ref="(instance) => setSceneRef(scene.key, instance)"
						:active="isSceneActive(scene.key)"
						v-bind="resolveSceneProps(scene.key)"
					/>
				</template>
			</PullPagingShell>
		</view>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import HomeSubNavShell from '@/components/home/HomeSubNavShell.vue'
import { buildMallHomeNavCategoryList } from '@/components/shop/category/shopCategoryMock.js'
import { buildShopSearchUrl } from '@/components/shop/common/shopFlowMock.js'
import { buildContentPublishUrl } from '@/components/user-center/contentPublishMock.js'
import { indexNavigationConfig, homeLevel2ConfigMap } from '@/components/home/indexNavigationConfig.js'

const props = defineProps({
	active: {
		type: Boolean,
		default: true
	},
	initialScene: {
		type: String,
		default: ''
	},
	initialContentKey: {
		type: String,
		default: ''
	},
	viewportHeightPx: {
		type: Number,
		default: 0
	},
	showSubNav: {
		type: Boolean,
		default: true
	}
})
const emit = defineEmits(['shell-state-change'])

const systemInfo = uni.getSystemInfoSync()
const screenWidth = systemInfo.screenWidth || 375
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0

function pxToRpx(value) {
	return Math.round((value * 750) / screenWidth)
}

function rpxToPx(value) {
	return Math.round((value * screenWidth) / 750)
}

const homeMock = indexNavigationConfig.home

const shopNavMock = {
	searchPlaceholder: '搜索商品 / 店铺 / 品牌',
	categoryList: buildMallHomeNavCategoryList()
}

const homeSceneConfigMap = {
	mall: {
		...homeLevel2ConfigMap.mall,
		contentComponent: homeLevel2ConfigMap.mall.hostComponent,
		contentGapRpx: homeLevel2ConfigMap.mall.contentGapRpx,
		defaultContentKey: homeLevel2ConfigMap.mall.defaultLevel3,
		resolveContentProps: () => ({
			activeCategoryId: activeContentKeyMap.mall
		}),
		extraNav: {
			component: homeLevel2ConfigMap.mall.extraNavComponent,
			heightRpx: homeLevel2ConfigMap.mall.extraNavHeightRpx,
			resolveProps: () => ({
				searchPlaceholder: shopNavMock.searchPlaceholder,
				categoryList: shopNavMock.categoryList,
				activeId: activeContentKeyMap.mall
			}),
			resolveListeners: () => ({
				'search-click': handleShopSearchClick,
				'cart-click': handleShopCartClick,
				'category-change': handleMallContentChange,
				'category-page-click': handleMallCategoryPageClick
			})
		}
	},
	live: {
		...homeLevel2ConfigMap.live,
		contentComponent: homeLevel2ConfigMap.live.hostComponent,
		contentGapRpx: homeLevel2ConfigMap.live.contentGapRpx,
		defaultContentKey: homeLevel2ConfigMap.live.defaultLevel3,
		resolveContentProps: () => ({
			parentScrollTop: activeChildScrollTopPx.value
		})
	},
	recommend: {
		...homeLevel2ConfigMap.recommend,
		contentComponent: homeLevel2ConfigMap.recommend.hostComponent,
		contentGapRpx: homeLevel2ConfigMap.recommend.contentGapRpx,
		defaultContentKey: homeLevel2ConfigMap.recommend.defaultLevel3,
		resolveContentProps: () => ({
			parentScrollTop: activeChildScrollTopPx.value,
			containerWidthRpx: 750 - homeMock.mallContentSidePaddingRpx * 2
		})
	}
}

const homeSceneList = Object.values(homeSceneConfigMap)
const subNavList = homeSceneList.map((item) => ({
	key: item.key,
	label: item.label
}))

const activeSubNav = ref(normalizeSceneKey(props.initialScene) || 'recommend')
const initialMallContentKey = normalizeContentKey(activeSubNav.value, props.initialContentKey)
const activeContentKeyMap = reactive(
	homeSceneList.reduce((result, item) => {
		result[item.key] =
			item.key === 'mall' ? initialMallContentKey || item.defaultContentKey || '' : item.defaultContentKey || ''
		return result
	}, {})
)
const sceneMountedMap = reactive(
	homeSceneList.reduce((result, item) => {
		result[item.key] = item.key === activeSubNav.value
		return result
	}, {})
)
const sceneRefMap = reactive({})
const parentScrollTopPx = ref(0)
const parentScrollTopValue = ref(0)
const refreshing = ref(false)
const bottomPullState = ref('idle')
const bottomPullVisible = ref(false)
const bottomPullPendingRelease = ref(false)
const bottomPullRearmPending = ref(false)
const parentTouching = ref(false)
const refreshHintState = ref('idle')
const refreshPullDistancePx = ref(0)

let bottomPullCollapseTimer = null
let bottomPullResetTimer = null
let refreshHintResetTimer = null
let scrollTopResetTimer = null
let reachLowerRearmTimer = null
let bottomPullFallbackTimer = null
let refreshRequestId = 0
let reachLowerRequestId = 0

const safeTopRpx = pxToRpx(safeTopPx)
const navTopOffsetRpx = safeTopRpx + homeMock.navSafeGapRpx
const navRowHeightPx = rpxToPx(homeMock.navHeightRpx)

const availableContentHeightPx = computed(() => {
	return Math.max(0, props.viewportHeightPx || systemInfo.windowHeight || 0)
})

const activeSceneConfig = computed(() => {
	return homeSceneConfigMap[activeSubNav.value] || homeSceneConfigMap.recommend
})

const isLightScene = computed(() => {
	return activeSceneConfig.value.theme === 'light'
})

const activeExtraNavConfig = computed(() => {
	return activeSceneConfig.value.extraNav || null
})

const activeExtraNavComponent = computed(() => {
	return activeExtraNavConfig.value?.component || null
})

const activeExtraNavHeightRpx = computed(() => {
	return activeExtraNavConfig.value?.heightRpx || 0
})

const activePanelBottomInsetRpx = computed(() => {
	return activeExtraNavHeightRpx.value > 0 ? 0 : isLightScene.value ? 20 : 0
})

const contentTopPaddingRpx = computed(() => {
	return (
		navTopOffsetRpx +
		homeMock.navHeightRpx +
		activeExtraNavHeightRpx.value +
		activePanelBottomInsetRpx.value +
		activeSceneConfig.value.contentGapRpx
	)
})

const contentTopPaddingPx = computed(() => {
	return rpxToPx(contentTopPaddingRpx.value)
})

const activeContentSidePaddingRpx = computed(() => {
	if (typeof activeSceneConfig.value.contentSidePaddingRpx === 'number') {
		return activeSceneConfig.value.contentSidePaddingRpx
	}

	return ['mall', 'recommend'].includes(activeSubNav.value)
		? homeMock.mallContentSidePaddingRpx
		: homeMock.contentSidePaddingRpx
})

const activeContentBottomPaddingRpx = computed(() => {
	if (typeof activeSceneConfig.value.contentBottomPaddingRpx === 'number') {
		return activeSceneConfig.value.contentBottomPaddingRpx
	}

	return homeMock.contentBottomPaddingRpx
})

const parentScrollEnabled = computed(() => {
	return activeSceneConfig.value.useParentScrollShell !== false
})

const parentRefresherEnabled = computed(() => {
	return activeSceneConfig.value.useParentRefresher !== false
})

const bottomPullEnabled = computed(() => {
	return activeSceneConfig.value.useParentBottomPull !== false
})

const activeChildScrollTopPx = computed(() => {
	return Math.max(0, parentScrollTopPx.value - contentTopPaddingPx.value)
})

const activeSceneRef = computed(() => {
	return sceneRefMap[activeSubNav.value] || null
})

const refreshPullText = computed(() => {
	return `下拉刷新${activeSceneConfig.value.label}频道`
})

const activeExtraNavProps = computed(() => {
	return activeExtraNavConfig.value?.resolveProps?.() || {}
})

const activeExtraNavListeners = computed(() => {
	return activeExtraNavConfig.value?.resolveListeners?.() || {}
})

const pageShellStyle = computed(() => {
	return {
		height: `${availableContentHeightPx.value}px`
	}
})

const lightBackgroundStyle = computed(() => {
	if (activeSubNav.value === 'mall') {
		return {
			height: `${availableContentHeightPx.value}px`,
			background:
				'radial-gradient(circle at top left, rgba(255, 199, 214, 0.34) 0%, rgba(255, 199, 214, 0) 30%), radial-gradient(circle at top right, rgba(255, 220, 196, 0.28) 0%, rgba(255, 220, 196, 0) 26%), linear-gradient(180deg, #fff9fb 0%, #fff4f7 18%, #f8fafc 48%, #f3f6fb 100%)'
		}
	}

	return {
		height: `${availableContentHeightPx.value}px`,
		background:
			'radial-gradient(circle at top left, rgba(214, 228, 255, 0.3) 0%, rgba(214, 228, 255, 0) 28%), radial-gradient(circle at top right, rgba(255, 205, 223, 0.24) 0%, rgba(255, 205, 223, 0) 24%), linear-gradient(180deg, #fcfdff 0%, #f8fbff 34%, #f4f7fc 100%)'
	}
})

const shellPanelHeightRpx = computed(() => {
	return (
		navTopOffsetRpx +
		homeMock.navHeightRpx +
		activeExtraNavHeightRpx.value +
		activePanelBottomInsetRpx.value
	)
})

const contentShellStyle = computed(() => {
	return {
		height: `${availableContentHeightPx.value}px`
	}
})

const contentInnerStyle = computed(() => {
	const bottomPaddingRpx =
		activeContentBottomPaddingRpx.value +
		(bottomPullEnabled.value && bottomPullVisible.value ? homeMock.bottomPullSlotHeightRpx : 0)

	return {
		paddingTop: `${contentTopPaddingRpx.value}rpx`,
		paddingRight: `${activeContentSidePaddingRpx.value}rpx`,
		paddingBottom: `${bottomPaddingRpx}rpx`,
		paddingLeft: `${activeContentSidePaddingRpx.value}rpx`,
		background: 'transparent'
	}
})

const bottomPullSlotStyle = computed(() => {
	return {
		height: bottomPullEnabled.value && bottomPullVisible.value ? `${homeMock.bottomPullSlotHeightRpx}rpx` : '0rpx',
		paddingLeft: `${activeContentSidePaddingRpx.value}rpx`,
		paddingRight: `${activeContentSidePaddingRpx.value}rpx`,
		background: 'transparent'
	}
})

const navBindings = computed(() => ({
	tabList: subNavList,
	activeTab: activeSubNav.value,
	lightTheme: isLightScene.value,
	safeTopOffsetRpx: navTopOffsetRpx,
	navHeightRpx: homeMock.navHeightRpx,
	navSidePaddingRpx: homeMock.navSidePaddingRpx,
	navItemGapRpx: homeMock.navItemGapRpx,
	panelHeightRpx: shellPanelHeightRpx.value,
	panelBottomInsetRpx: activePanelBottomInsetRpx.value,
	refreshState: refreshHintState.value,
	refreshPullText: refreshPullText.value,
	refreshPullDistancePx: refreshPullDistancePx.value,
	refreshRevealDistancePx: navRowHeightPx,
	extraComponent: activeExtraNavComponent.value,
	extraProps: activeExtraNavProps.value,
	extraListeners: activeExtraNavListeners.value,
	showPublishAction: activeSubNav.value === 'recommend'
}))

watch(
	() => ({
		navBindings: navBindings.value,
		activeScene: activeSubNav.value,
		activeContentKey: activeContentKeyMap[activeSubNav.value] || ''
	}),
	(value) => {
		emit('shell-state-change', value)
	},
	{
		immediate: true
	}
)

watch(
	() => [props.initialScene, props.initialContentKey],
	([sceneValue, contentValue]) => {
		const nextSceneKey = normalizeSceneKey(sceneValue)
		if (!nextSceneKey) {
			return
		}

		const sceneChanged = activeSubNav.value !== nextSceneKey
		if (sceneChanged) {
			resetBottomPullState(true)
			resetRefreshHint()
			activeSubNav.value = nextSceneKey
		}

		const nextContentKey = normalizeContentKey(nextSceneKey, contentValue)
		const contentChanged =
			nextSceneKey === 'mall' &&
			nextContentKey &&
			activeContentKeyMap.mall !== nextContentKey

		if (contentChanged) {
			activeContentKeyMap.mall = nextContentKey
		}

		if (!sceneChanged && !contentChanged) {
			return
		}

		scrollActiveContentToTop()

		if (sceneChanged) {
			onSubNavChange({
				key: nextSceneKey,
				label: homeSceneConfigMap[nextSceneKey]?.label || nextSceneKey,
				source: 'action-url'
			})
		}
	},
	{
		immediate: true
	}
)

watch(
	() => activeSubNav.value,
	(value) => {
		sceneMountedMap[value] = true
	},
	{
		immediate: true
	}
)

watch(
	() => props.active,
	(value) => {
		if (!value) {
			resetTransientState()
		}
	},
	{
		immediate: true
	}
)

function resolveSceneProps(sceneKey) {
	return homeSceneConfigMap[sceneKey]?.resolveContentProps?.() || {}
}

function shouldMountScene(sceneKey) {
	return !!sceneMountedMap[sceneKey]
}

function isSceneActive(sceneKey) {
	return props.active && activeSubNav.value === sceneKey
}

function normalizeSceneKey(sceneKey) {
	return homeSceneConfigMap[sceneKey] ? sceneKey : ''
}

function normalizeContentKey(sceneKey, contentKey) {
	if (sceneKey !== 'mall') {
		return ''
	}

	const normalizedContentKey = `${contentKey || ''}`.trim()
	return normalizedContentKey || homeSceneConfigMap.mall.defaultContentKey
}

function setSceneRef(sceneKey, instance) {
	if (instance) {
		sceneRefMap[sceneKey] = instance
		return
	}

	delete sceneRefMap[sceneKey]
}

function normalizeReachLowerResult(result) {
	if (!result) {
		return {
			status: 'loaded'
		}
	}

	if (typeof result === 'string') {
		return {
			status: result
		}
	}

	return {
		status: result.status || 'loaded'
	}
}

function handleSubNavClick(navItem) {
	if (activeSubNav.value === navItem.key) {
		onSubNavRepeat(navItem)
		scrollActiveContentToTop()
		return
	}

	resetBottomPullState(true)
	resetRefreshHint()
	activeSubNav.value = navItem.key
	scrollActiveContentToTop()
	onSubNavChange(navItem)
}

function handleShopSearchClick() {
	onShopSearchClick(activeContentKeyMap.mall)
}

function handleShopCartClick() {
	onShopCartClick(activeContentKeyMap.mall)
	uni.navigateTo({
		url: '/pages/shop/cart'
	})
}

async function handlePublishClick() {
	if (activeSubNav.value !== 'recommend') {
		return
	}

	onHomePublishClick('recommend')
	uni.navigateTo({
		url: buildContentPublishUrl({
			scene: 'recommend'
		})
	})
}

function handleMallContentChange(category) {
	if (!category?.id) {
		return
	}

	if (activeContentKeyMap.mall === category.id) {
		onMallCategoryRepeat(category)
		scrollActiveContentToTop()
		return
	}

	activeContentKeyMap.mall = category.id
	scrollActiveContentToTop()
	onMallCategoryChange(category)
}

function handleMallCategoryPageClick() {
	onMallCategoryPageClick({
		categoryId: activeContentKeyMap.mall
	})
	uni.navigateTo({
		url: `/pages/shop/category-list?categoryId=${encodeURIComponent(activeContentKeyMap.mall)}`
	})
}

function handleParentScroll(event) {
	if (!parentScrollEnabled.value) {
		parentScrollTopPx.value = 0
		return
	}

	parentScrollTopPx.value = event.detail.scrollTop || 0
}

function handleRefresherPulling(event) {
	if (!props.active || refreshing.value || !parentRefresherEnabled.value) {
		return
	}

	const pullingDistance = Number(event?.detail?.dy || event?.detail?.deltaY || event?.detail?.pullDistance || 0) || 0
	if (pullingDistance <= 0) {
		return
	}

	clearRefreshHintResetTimer()
	refreshHintState.value = 'pulling'
	refreshPullDistancePx.value = Math.min(navRowHeightPx, Math.max(0, pullingDistance * 0.55))
}

function handleRefresherRestore() {
	if (!parentRefresherEnabled.value) {
		return
	}

	if (!refreshing.value) {
		resetRefreshHint()
	}
}

function handleParentTouchStart() {
	if (!bottomPullEnabled.value) {
		return
	}

	parentTouching.value = true
}

function handleParentTouchEnd() {
	if (!bottomPullEnabled.value) {
		return
	}

	parentTouching.value = false
	if (bottomPullPendingRelease.value) {
		scheduleBottomPullCollapse(homeMock.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
	}
}

function clearBottomPullTimers() {
	if (bottomPullCollapseTimer) {
		clearTimeout(bottomPullCollapseTimer)
		bottomPullCollapseTimer = null
	}

	if (bottomPullResetTimer) {
		clearTimeout(bottomPullResetTimer)
		bottomPullResetTimer = null
	}

	if (bottomPullFallbackTimer) {
		clearTimeout(bottomPullFallbackTimer)
		bottomPullFallbackTimer = null
	}
}

function clearReachLowerRearmTimer() {
	if (reachLowerRearmTimer) {
		clearTimeout(reachLowerRearmTimer)
		reachLowerRearmTimer = null
	}
}

function clearRefreshHintResetTimer() {
	if (refreshHintResetTimer) {
		clearTimeout(refreshHintResetTimer)
		refreshHintResetTimer = null
	}
}

function clearScrollTopResetTimer() {
	if (scrollTopResetTimer) {
		clearTimeout(scrollTopResetTimer)
		scrollTopResetTimer = null
	}
}

function resetRefreshHint(delayMs = 0) {
	clearRefreshHintResetTimer()
	refreshHintResetTimer = setTimeout(() => {
		refreshHintState.value = 'idle'
		refreshPullDistancePx.value = 0
		refreshHintResetTimer = null
	}, delayMs)
}

function rearmReachLowerTrigger() {
	if (!props.active) {
		return
	}

	const currentScrollTop = Math.max(0, Math.round(parentScrollTopPx.value || 0))
	const rearmOffsetPx = 14
	if (currentScrollTop <= rearmOffsetPx) {
		return
	}

	const rearmScrollTop = Math.max(0, currentScrollTop - rearmOffsetPx)
	parentScrollTopValue.value = rearmScrollTop
	parentScrollTopPx.value = rearmScrollTop
}

function resetBottomPullState(immediate = false) {
	clearBottomPullTimers()
	clearReachLowerRearmTimer()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	if (immediate) {
		bottomPullState.value = 'idle'
		bottomPullVisible.value = false
		return
	}

	bottomPullVisible.value = false
	bottomPullResetTimer = setTimeout(() => {
		bottomPullState.value = 'idle'
		bottomPullResetTimer = null
	}, homeMock.bottomPullCollapseDurationMs)
}

function showBottomPullState(state) {
	clearBottomPullTimers()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	bottomPullState.value = state
	bottomPullVisible.value = true
}

function scheduleBottomPullCollapse(delayMs, shouldRearm = false) {
	clearBottomPullTimers()
	clearReachLowerRearmTimer()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	bottomPullCollapseTimer = setTimeout(() => {
		bottomPullVisible.value = false
		bottomPullCollapseTimer = null
		if (shouldRearm) {
			reachLowerRearmTimer = setTimeout(() => {
				rearmReachLowerTrigger()
				reachLowerRearmTimer = null
			}, 36)
		}

		bottomPullResetTimer = setTimeout(() => {
			bottomPullState.value = 'idle'
			bottomPullResetTimer = null
		}, homeMock.bottomPullCollapseDurationMs)
	}, delayMs)
}

function requestBottomPullRebound(delayMs) {
	if (parentTouching.value) {
		bottomPullPendingRelease.value = true
		bottomPullRearmPending.value = true
		bottomPullFallbackTimer = setTimeout(() => {
			parentTouching.value = false
			if (bottomPullPendingRelease.value) {
				scheduleBottomPullCollapse(homeMock.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
			}
		}, resolveBottomPullFallbackDelay(delayMs))
		return
	}

	scheduleBottomPullCollapse(delayMs, true)
}

function resolveBottomPullFallbackDelay(delayMs) {
	return Math.max(Number(delayMs) || 0, homeMock.bottomPullNoMoreHoldMs) + 120
}

async function handleParentRefresh() {
	if (!props.active || refreshing.value || !parentRefresherEnabled.value) {
		return
	}

	const requestId = ++refreshRequestId
	refreshing.value = true
	clearRefreshHintResetTimer()
	refreshHintState.value = 'refreshing'
	refreshPullDistancePx.value = navRowHeightPx
	resetBottomPullState(true)

	const handler = activeSceneRef.value?.handleParentRefresh
	if (typeof handler === 'function') {
		await handler()
	}

	if (requestId !== refreshRequestId || !props.active) {
		refreshing.value = false
		resetRefreshHint()
		return
	}

	refreshing.value = false
	resetRefreshHint(120)
}

async function handleParentReachLower() {
	if (!props.active || refreshing.value || bottomPullState.value === 'loading' || !bottomPullEnabled.value) {
		return
	}

	const handler = activeSceneRef.value?.handleParentReachLower
	if (typeof handler !== 'function') {
		return
	}

	const requestId = ++reachLowerRequestId
	showBottomPullState('loading')
	const result = normalizeReachLowerResult(await handler())

	if (requestId !== reachLowerRequestId || !props.active) {
		resetBottomPullState(true)
		return
	}

	if (result?.status === 'no-more') {
		bottomPullState.value = 'no-more'
		requestBottomPullRebound(homeMock.bottomPullNoMoreHoldMs)
		return
	}

	bottomPullState.value = 'loaded'
	requestBottomPullRebound(homeMock.bottomPullLoadedHoldMs)
}

function resetTransientState() {
	clearReachLowerRearmTimer()
	parentTouching.value = false
	bottomPullRearmPending.value = false
	refreshing.value = false
	refreshRequestId += 1
	reachLowerRequestId += 1
	resetBottomPullState(true)
	resetRefreshHint()
}

function scrollActiveContentToTop() {
	if (!parentScrollEnabled.value) {
		activeSceneRef.value?.scrollToTop?.()
		parentScrollTopPx.value = 0
		parentScrollTopValue.value = 0
		return
	}

	clearScrollTopResetTimer()
	const currentScrollTop = Math.max(1, Math.round(parentScrollTopPx.value || 0))
	parentScrollTopValue.value = currentScrollTop
	scrollTopResetTimer = setTimeout(() => {
		parentScrollTopValue.value = 0
		scrollTopResetTimer = null
	}, 0)
	parentScrollTopPx.value = 0
}

function onSubNavChange(navItem) {
	console.log('home-sub-nav-change', navItem.key)
}

function onSubNavRepeat(navItem) {
	console.log('home-sub-nav-repeat', navItem.key)
}

function onShopSearchClick(categoryId) {
	console.log('shop-search-click', categoryId)
	uni.navigateTo({
		url: buildShopSearchUrl({
			categoryId
		})
	})
}

function onShopCartClick(categoryId) {
	console.log('shop-cart-click', categoryId)
}

function onMallCategoryChange(category) {
	console.log('shop-category-change', category.id)
}

function onMallCategoryRepeat(category) {
	console.log('shop-category-repeat', category.id)
}

function onMallCategoryPageClick(payload) {
	console.log('shop-category-page-click', payload.categoryId)
}

function onHomePublishClick(sceneKey) {
	console.log('home-publish-click', sceneKey)
}

defineExpose({
	handleSubNavClick,
	handlePublishClick
})

onBeforeUnmount(() => {
	clearBottomPullTimers()
	clearReachLowerRearmTimer()
	clearRefreshHintResetTimer()
	clearScrollTopResetTimer()
})
</script>

<style scoped>
.page-shell {
	position: relative;
	display: flex;
	flex-direction: column;
	min-height: 100%;
	overflow: hidden;
	isolation: isolate;
}

.page-shell-light {
	background: #f6f8fc;
}

.page-light-background {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 0;
	pointer-events: none;
	overflow: hidden;
}

.content-shell {
	position: relative;
	flex: 1;
	min-height: 0;
	overflow: hidden;
	z-index: 1;
}

.content-shell-light {
	background: transparent;
}
</style>
