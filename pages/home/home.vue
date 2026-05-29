<template>
	<view :class="['page-shell', isLightScene ? 'page-shell-light' : '']" :style="pageShellStyle">
		<view v-if="isLightScene" class="page-light-background" :style="lightBackgroundStyle"></view>

		<HomeSubNavShell
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
			@tab-change="handleSubNavClick"
		/>

		<view :class="['content-shell', isLightScene ? 'content-shell-light' : '']" :style="contentShellStyle">
			<PullPagingShell
				:light-theme="isLightScene"
				refresher-background="transparent"
				:lower-threshold="homeMock.lowerThresholdPx"
				:refresher-triggered="refreshing"
				:scroll-top="parentScrollTopValue"
				:inner-style="contentInnerStyle"
				:bottom-pull-state="bottomPullState"
				:bottom-pull-visible="bottomPullVisible"
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
						v-if="shouldMountScene(scene.key)"
						:is="scene.contentComponent"
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
import { useAppTheme } from '@/composables/useAppTheme.js'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import HomeSubNavShell from '@/components/home/HomeSubNavShell.vue'
import ShopTab from '@/components/home/shop/ShopTab.vue'
import ShopSubNavExtra from '@/components/home/shop/ShopSubNavExtra.vue'
import LiveTab from '@/components/home/live/LiveTab.vue'
import RecommendTab from '@/components/home/recommend/RecommendTab.vue'
import { buildMallHomeNavCategoryList } from '@/components/shop/category/shopCategoryMock.js'
import { buildShopSearchUrl } from '@/components/shop/common/shopFlowMock.js'

const props = defineProps({
	active: {
		type: Boolean,
		default: true
	},
	initialScene: {
		type: String,
		default: ''
	}
})

const systemInfo = uni.getSystemInfoSync()
const screenWidth = systemInfo.screenWidth || 375
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0

/**
 * 将设备像素转换成 rpx，统一给顶部安全区和布局配置复用。
 */
function pxToRpx(value) {
	return Math.round((value * 750) / screenWidth)
}

/**
 * 将 rpx 转回设备像素，便于和 scroll-view 事件里的 px 单位联动。
 */
function rpxToPx(value) {
	return Math.round((value * screenWidth) / 750)
}

const homeMock = {
	navHeightRpx: 80,
	navSidePaddingRpx: 32,
	navItemGapRpx: 56,
	navSafeGapRpx: 24,
	contentSidePaddingRpx: 32,
	mallContentSidePaddingRpx: 16,
	contentBottomPaddingRpx: 24,
	lowerThresholdPx: 220,
	rootTabBarHeightRpx: 130,
	bottomPullSlotHeightRpx: 72,
	bottomPullLoadedHoldMs: 420,
	bottomPullNoMoreHoldMs: 480,
	bottomPullReleaseDelayMs: 20,
	bottomPullCollapseDurationMs: 380
}

/**
 * 首页频道配置中心：
 * 1. `contentComponent` 控制每个二级频道对应的内容组件。
 * 2. `defaultContentKey` 用于存在三级导航的频道，决定默认展示哪个内容标签。
 * 3. `extraNav` 用于声明可选的三级导航区域，未来新增其他频道时只需要按这个结构补配置。
 */
const homeSceneConfigMap = {
	mall: {
		key: 'mall',
		label: '商城',
		theme: 'light',
		contentComponent: ShopTab,
		contentGapRpx: 6,
		defaultContentKey: 'recommend',
		resolveContentProps: () => ({
			activeCategoryId: activeContentKeyMap.mall
		}),
		extraNav: {
			component: ShopSubNavExtra,
			heightRpx: 176,
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
		key: 'live',
		label: '直播',
		theme: 'dark',
		contentComponent: LiveTab,
		contentGapRpx: 36,
		defaultContentKey: '',
		resolveContentProps: () => ({
			parentScrollTop: activeChildScrollTopPx.value
		})
	},
	recommend: {
		key: 'recommend',
		label: '推荐',
		theme: 'light',
		contentComponent: RecommendTab,
		contentGapRpx: 36,
		defaultContentKey: '',
		resolveContentProps: () => ({
			parentScrollTop: activeChildScrollTopPx.value,
			containerWidthRpx: 750 - homeMock.mallContentSidePaddingRpx * 2
		})
	}
}

const shopNavMock = {
	searchPlaceholder: '搜索商品 / 店铺 / 品牌',
	categoryList: buildMallHomeNavCategoryList()
	// TODO：替换商城三级导航与搜索配置接口
}

const homeSceneList = Object.values(homeSceneConfigMap)
const subNavList = homeSceneList.map((item) => ({
	key: item.key,
	label: item.label
}))

const activeSubNav = ref('recommend')
const activeContentKeyMap = reactive(
	homeSceneList.reduce((result, item) => {
		result[item.key] = item.defaultContentKey || ''
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

const { setLightTheme, setDarkTheme } = useAppTheme()

const safeTopRpx = pxToRpx(safeTopPx)
const navTopOffsetRpx = safeTopRpx + homeMock.navSafeGapRpx
const navRowHeightPx = rpxToPx(homeMock.navHeightRpx)
const availableContentHeightPx = Math.max(0, (systemInfo.windowHeight || 0) - rpxToPx(homeMock.rootTabBarHeightRpx))

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
	return ['mall', 'recommend'].includes(activeSubNav.value)
		? homeMock.mallContentSidePaddingRpx
		: homeMock.contentSidePaddingRpx
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

const pageShellStyle = {
	height: `${availableContentHeightPx}px`
}

const lightBackgroundStyle = computed(() => {
	if (activeSubNav.value === 'mall') {
		return {
			height: `${availableContentHeightPx}px`,
			background:
				'radial-gradient(circle at top left, rgba(255, 199, 214, 0.34) 0%, rgba(255, 199, 214, 0) 30%), radial-gradient(circle at top right, rgba(255, 220, 196, 0.28) 0%, rgba(255, 220, 196, 0) 26%), linear-gradient(180deg, #fff9fb 0%, #fff4f7 18%, #f8fafc 48%, #f3f6fb 100%)'
		}
	}

	return {
		height: `${availableContentHeightPx}px`,
		background:
			'radial-gradient(circle at top left, rgba(214, 228, 255, 0.3) 0%, rgba(214, 228, 255, 0) 28%), radial-gradient(circle at top right, rgba(255, 205, 223, 0.24) 0%, rgba(255, 205, 223, 0) 24%), linear-gradient(180deg, #fcfdff 0%, #f8fbff 34%, #f4f7fc 100%)'
	}
})

const shellPanelHeightRpx = computed(() => {
	return navTopOffsetRpx + homeMock.navHeightRpx + activeExtraNavHeightRpx.value + activePanelBottomInsetRpx.value
})

const contentShellStyle = {
	height: `${availableContentHeightPx}px`
}

const contentInnerStyle = computed(() => {
	const bottomPaddingRpx =
		homeMock.contentBottomPaddingRpx + (bottomPullVisible.value ? homeMock.bottomPullSlotHeightRpx : 0)

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
		height: bottomPullVisible.value ? `${homeMock.bottomPullSlotHeightRpx}rpx` : '0rpx',
		paddingLeft: `${activeContentSidePaddingRpx.value}rpx`,
		paddingRight: `${activeContentSidePaddingRpx.value}rpx`,
		background: 'transparent'
	}
})

watch(
	() => props.initialScene,
	(value) => {
		const nextSceneKey = normalizeSceneKey(value)
		if (!nextSceneKey || activeSubNav.value === nextSceneKey) {
			return
		}

		resetBottomPullState(true)
		resetRefreshHint()
		activeSubNav.value = nextSceneKey
		scrollActiveContentToTop()
		onSubNavChange({
			key: nextSceneKey,
			label: homeSceneConfigMap[nextSceneKey]?.label || nextSceneKey,
			source: 'action-url'
		})
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

watch(
	[() => props.active, activeSceneConfig],
	([active, sceneConfig]) => {
		if (active && sceneConfig.theme === 'dark') {
			setDarkTheme()
			return
		}

		setLightTheme()
	},
	{
		immediate: true,
		flush: 'sync'
	}
)

/**
 * 统一从频道配置里提取内容组件 props。
 * 以后新增推荐、商城之外的新子模块时，只需要在 `homeSceneConfigMap`
 * 里补 `resolveContentProps`，不需要再改这里的分支判断。
 */
function resolveSceneProps(sceneKey) {
	return homeSceneConfigMap[sceneKey]?.resolveContentProps?.() || {}
}

/**
 * 频道首次进入时才真正挂载内容组件，避免隐藏频道在首页初次进入时就提前初始化资源。
 */
function shouldMountScene(sceneKey) {
	return !!sceneMountedMap[sceneKey]
}

/**
 * 当前频道是否处于真正激活状态，用来通知子组件启动或关闭轮播、定时任务等资源。
 */
function isSceneActive(sceneKey) {
	return props.active && activeSubNav.value === sceneKey
}

function normalizeSceneKey(sceneKey) {
	return homeSceneConfigMap[sceneKey] ? sceneKey : ''
}

/**
 * 保存当前已渲染的频道组件实例，后续统一从这里调用子组件暴露的方法。
 */
function setSceneRef(sceneKey, instance) {
	if (instance) {
		sceneRefMap[sceneKey] = instance
		return
	}

	delete sceneRefMap[sceneKey]
}

/**
 * 统一规范子模块触底返回值，方便推荐、商城和未来新增模块共用一套协议：
 * 1. 未返回值时默认视为 `loaded`
 * 2. 支持直接返回字符串状态
 * 3. 支持返回对象 `{ status }`
 */
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

/**
 * 二级导航切换统一从这里进入，保证：
 * 1. 主题色同步切换
 * 2. 内容区回到顶部
 * 3. 后续新增频道时不需要到处找逻辑入口
 */
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

/**
 * 商城三级导航内容切换入口。
 * 后续如果别的二级频道也有三级导航，只需要复用这个模式：
 * - 更新 `activeContentKeyMap[频道key]`
 * - 回到顶部
 * - 让对应内容组件按新的 key 重新渲染
 */
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
	parentScrollTopPx.value = event.detail.scrollTop || 0
}

function handleRefresherPulling(event) {
	if (!props.active || refreshing.value) {
		return
	}

	const pullingDistance =
		Number(event?.detail?.dy || event?.detail?.deltaY || event?.detail?.pullDistance || 0) || 0

	if (pullingDistance <= 0) {
		return
	}

	clearRefreshHintResetTimer()
	refreshHintState.value = 'pulling'
	refreshPullDistancePx.value = Math.min(navRowHeightPx, Math.max(0, pullingDistance * 0.55))
}

function handleRefresherRestore() {
	if (!refreshing.value) {
		resetRefreshHint()
	}
}

function handleParentTouchStart() {
	parentTouching.value = true
}

function handleParentTouchEnd() {
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

/**
 * 清理触底重新武装用的定时器，避免切频道或销毁时还有延迟任务残留。
 */
function clearReachLowerRearmTimer() {
	if (reachLowerRearmTimer) {
		clearTimeout(reachLowerRearmTimer)
		reachLowerRearmTimer = null
	}
}

/**
 * 清理顶部导航刷新提示的复位定时器。
 */
function clearRefreshHintResetTimer() {
	if (refreshHintResetTimer) {
		clearTimeout(refreshHintResetTimer)
		refreshHintResetTimer = null
	}
}

/**
 * 清理 scrollTop 强制归零的异步任务，避免重复切频道时互相打架。
 */
function clearScrollTopResetTimer() {
	if (scrollTopResetTimer) {
		clearTimeout(scrollTopResetTimer)
		scrollTopResetTimer = null
	}
}

/**
 * 控制顶部下拉提示恢复到默认导航文案。
 */
function resetRefreshHint(delayMs = 0) {
	clearRefreshHintResetTimer()
	refreshHintResetTimer = setTimeout(() => {
		refreshHintState.value = 'idle'
		refreshPullDistancePx.value = 0
		refreshHintResetTimer = null
	}, delayMs)
}

/**
 * 轻微回退一点滚动位置，重新进入 `scrolltolower` 的触发区，
 * 让“无更多内容”提示消失后，用户继续下滑时可以再次触发加载。
 */
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

/**
 * 统一重置底部加载提示条状态。
 * `immediate = true` 时直接清空；否则保留一个收起动画过程。
 */
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

/**
 * 切换底部提示条文案状态，例如“正在加载新数据 / 无更多内容”。
 */
function showBottomPullState(state) {
	clearBottomPullTimers()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	bottomPullState.value = state
	bottomPullVisible.value = true
}

/**
 * 控制底部提示条的回弹收起，并在需要时重新武装触底触发区。
 */
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

/**
 * 当用户已经松手时，直接收起底部提示；
 * 如果手指仍停留在屏幕上，则先记成待处理，等 touchend 再执行。
 */
function requestBottomPullRebound(delayMs) {
	if (parentTouching.value) {
		bottomPullPendingRelease.value = true
		bottomPullRearmPending.value = true
		bottomPullFallbackTimer = setTimeout(() => {
			parentTouching.value = false
			// 这里的 pending 标记只会在“加载结果已经返回、等待用户松手”后设置，
			// 所以不能再用 loading 状态拦住收起逻辑，否则快速上下滑时提示条会卡住。
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

/**
 * 首页统一的下拉刷新入口：
 * 1. 切换顶部导航提示状态
 * 2. 调用当前频道暴露的刷新方法
 * 3. 刷新完成后还原顶部导航提示
 */
async function handleParentRefresh() {
	if (!props.active || refreshing.value) {
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

/**
 * 首页统一的触底加载入口：
 * 1. 先展示“正在加载新数据”
 * 2. 调用当前频道暴露的触底加载方法
 * 3. 统一把返回值规范化成 `loaded / no-more / busy`
 * 4. 再决定底部提示条展示哪种状态
 */
async function handleParentReachLower() {
	if (!props.active || refreshing.value || bottomPullState.value === 'loading') {
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

/**
 * 首页失活时统一清理滚动和刷新中的瞬时状态，避免切到别的 tab 后残留动画。
 */
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

/**
 * 强制回到顶部时，先写入一个当前值再归零，避免同值 0 无法触发 UniApp scroll-view 更新。
 */
function scrollActiveContentToTop() {
	clearScrollTopResetTimer()
	const currentScrollTop = Math.max(1, Math.round(parentScrollTopPx.value || 0))
	parentScrollTopValue.value = currentScrollTop
	scrollTopResetTimer = setTimeout(() => {
		parentScrollTopValue.value = 0
		scrollTopResetTimer = null
	}, 0)
	parentScrollTopPx.value = 0
}

/**
 * 首页二级导航切换后的占位回调，后续对接埋点或业务状态时从这里接。
 */
function onSubNavChange(navItem) {
	// TODO：替换首页二级导航切换回调
	console.log('home-sub-nav-change', navItem.key)
}

/**
 * 首页二级导航重复点击后的占位回调，后续可接“回到顶部”等增强交互。
 */
function onSubNavRepeat(navItem) {
	// TODO：替换首页二级导航重复点击回调
	console.log('home-sub-nav-repeat', navItem.key)
}

/**
 * 商城搜索按钮占位回调。
 */
function onShopSearchClick(categoryId) {
	// TODO：替换商城搜索页跳转逻辑
	console.log('shop-search-click', categoryId)
	uni.navigateTo({
		url: buildShopSearchUrl({
			categoryId
		})
	})
}

/**
 * 商城购物车按钮占位回调。
 */
function onShopCartClick(categoryId) {
	// TODO：替换购物车快捷入口逻辑
	console.log('shop-cart-click', categoryId)
}

/**
 * 商城三级分类切换占位回调。
 */
function onMallCategoryChange(category) {
	// TODO：替换商城三级分类切换逻辑
	console.log('shop-category-change', category.id)
}

/**
 * 商城三级分类重复点击占位回调。
 */
function onMallCategoryRepeat(category) {
	// TODO：替换商城三级分类重复点击逻辑
	console.log('shop-category-repeat', category.id)
}

/**
 * 商城分类总入口按钮占位回调。
 */
function onMallCategoryPageClick(payload) {
	// TODO：替换商城分类详情页跳转前置逻辑
	console.log('shop-category-page-click', payload.categoryId)
}

onBeforeUnmount(() => {
	clearBottomPullTimers()
	clearReachLowerRearmTimer()
	clearRefreshHintResetTimer()
	clearScrollTopResetTimer()
	setLightTheme()
})
</script>

<style scoped>
/* 页面最外层：负责承接深浅主题切换和整页高度。 */
.page-shell {
	position: relative;
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 100%;
	overflow: hidden;
	isolation: isolate;
}

/* 浅色场景下的整页背景。 */
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

/* 内容区容器：scroll-view 的直接父层。 */
.content-shell {
	position: relative;
	flex: 1;
	min-height: 0;
	overflow: hidden;
	z-index: 1;
}

/* 浅色场景下的内容区背景。 */
.content-shell-light {
	background: transparent;
}

/* 主滚动区域：承接首页所有频道内容。 */
.content-scroll {
	height: 100%;
}

/* 浅色场景下滚动区背景。 */
.content-scroll-light {
	background: linear-gradient(180deg, #fcfdff 0%, #f7f9fc 38%, #f2f5fa 100%);
}

/* 内容实际承载层：顶部 padding 会为二级/三级导航预留空间。 */
.content-scroll-inner {
	min-height: 100%;
	box-sizing: border-box;
}

/* 底部加载提示槽：固定在滚动区底部，承接“加载中 / 无更多内容”。 */
.bottom-pull-slot {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 8;
	box-sizing: border-box;
	overflow: hidden;
	pointer-events: none;
	transition: height 380ms cubic-bezier(0.22, 0.76, 0.2, 1);
}

/* 底部加载提示主体。 */
.bottom-pull-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 72rpx;
	opacity: 0;
	transform: translateY(18rpx);
	transition: opacity 220ms ease, transform 380ms cubic-bezier(0.22, 0.76, 0.2, 1);
}

/* 底部加载提示显示态。 */
.bottom-pull-indicator-active {
	opacity: 1;
	transform: translateY(0);
}

/* 底部加载小圆圈。 */
.bottom-pull-spinner {
	width: 24rpx;
	height: 24rpx;
	margin-right: 12rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.16);
	border-top-color: rgba(255, 255, 255, 0.72);
	border-radius: 50%;
	animation: bottom-pull-spin 0.9s linear infinite;
}

/* 浅色场景下的加载小圆圈。 */
.bottom-pull-spinner-light {
	border-color: rgba(17, 24, 39, 0.08);
	border-top-color: rgba(254, 44, 85, 0.72);
}

/* 底部加载提示文案。 */
.bottom-pull-text {
	font-size: 24rpx;
	line-height: 34rpx;
	color: rgba(255, 255, 255, 0.58);
}

/* 浅色场景下的底部加载文案。 */
.bottom-pull-text-light {
	color: #667085;
}

@keyframes bottom-pull-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
