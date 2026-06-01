<template>
	<view :class="['page-shell', isLightScene ? 'page-shell-light' : '']" :style="pageShellStyle">
		<view v-if="isLightScene" class="page-light-background" :style="lightBackgroundStyle"></view>

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
				<template v-for="scene in props.sceneConfigList" :key="scene.key">
					<component
						:is="scene.component"
						v-if="shouldMountScene(scene.key)"
						v-show="props.sceneKey === scene.key"
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
import { NAV_CONFIG } from '@/components/home/indexNavigationConfig'

const props = defineProps({
	sceneKey: {
		type: String,
		default: ''
	},
	contentKey: {
		type: String,
		default: ''
	},
	sceneConfigList: {
		type: Array,
		default: () => []
	},
	viewportHeightPx: {
		type: Number,
		default: 0
	},
	contentTopPaddingRpx: {
		type: Number,
		default: 0
	},
	safeTopRpx: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits([
	'scroll-state'
])

const systemInfo = uni.getSystemInfoSync()
const screenWidth = systemInfo.screenWidth || 375
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0

function pxToRpx(value) {
	return Math.round((value * 750) / screenWidth)
}

function rpxToPx(value) {
	return Math.round((value * screenWidth) / 750)
}

const homeMock = NAV_CONFIG.home

// ── 场景配置 ──────────────────────────────────────────

const activeSceneConfig = computed(() => {
	return props.sceneConfigList.find(s => s.key === props.sceneKey) || null
})

const isLightScene = computed(() => {
	return activeSceneConfig.value ? activeSceneConfig.value.theme === 'light' : false
})

const activeExtraNavHeightRpx = computed(() => {
	return activeSceneConfig.value?.extraNavHeightRpx || 0
})

const activePanelBottomInsetRpx = computed(() => {
	return activeExtraNavHeightRpx.value > 0 ? 0 : isLightScene.value ? 20 : 0
})

// ── 场景懒挂载 ────────────────────────────────────────

const sceneMountedMap = reactive(
	(props.sceneConfigList || []).reduce((result, item) => {
		result[item.key] = item.key === props.sceneKey
		return result
	}, {})
)

watch(
	() => props.sceneKey,
	(value) => {
		if (value) {
			sceneMountedMap[value] = true
		}
	},
	{ immediate: true }
)

const sceneRefMap = reactive({})

function setSceneRef(sceneKey, instance) {
	if (instance) {
		sceneRefMap[sceneKey] = instance
		return
	}
	delete sceneRefMap[sceneKey]
}

function shouldMountScene(sceneKey) {
	return !!sceneMountedMap[sceneKey]
}

function isSceneActive(sceneKey) {
	return props.sceneKey === sceneKey
}

// ── 场景 prop 解析 ────────────────────────────────────


function resolveSceneProps(sceneKey) {
	if (sceneKey === 'mall') {
		return { activeCategoryId: props.contentKey }
	}
	if (sceneKey === 'live') {
		return { parentScrollTop: activeChildScrollTopPx.value }
	}
	if (sceneKey === 'recommend') {
		return {
			parentScrollTop: activeChildScrollTopPx.value,
			containerWidthRpx: 750 - homeMock.mallContentSidePaddingRpx * 2
		}
	}
	return {}
}

// ── 内容布局 ──────────────────────────────────────────

const availableContentHeightPx = computed(() => {
	return Math.max(0, props.viewportHeightPx || systemInfo.windowHeight || 0)
})

const contentTopPaddingPx = computed(() => {
	return rpxToPx(props.contentTopPaddingRpx)
})

const activeChildScrollTopPx = computed(() => {
	return Math.max(0, parentScrollTopPx.value - contentTopPaddingPx.value)
})

const activeContentSidePaddingRpx = computed(() => {
	if (props.sceneKey === 'mall' || props.sceneKey === 'recommend') {
		return homeMock.mallContentSidePaddingRpx
	}
	return homeMock.contentSidePaddingRpx
})

const activeContentBottomPaddingRpx = computed(() => {
	return homeMock.contentBottomPaddingRpx
})

const parentScrollEnabled = computed(() => {
	return activeSceneConfig.value ? true : false
})

const parentRefresherEnabled = computed(() => {
	return activeSceneConfig.value ? true : false
})

const bottomPullEnabled = computed(() => {
	return true
})

// ── 内容区域样式 ──────────────────────────────────────

const pageShellStyle = computed(() => {
	return {
		height: `${availableContentHeightPx.value}px`
	}
})

const lightBackgroundStyle = computed(() => {
	if (props.sceneKey === 'mall') {
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
		paddingTop: `${props.contentTopPaddingRpx}rpx`,
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

// ── 场景内容切换 ──────────────────────────────────────

watch(
	() => [props.sceneKey, props.contentKey],
	([nextSceneKey, nextContentKey]) => {
		resetBottomPullState(true)
		resetRefreshHint()
		scrollActiveContentToTop()
	},
	{ immediate: false }
)

// ── 滚动 / 刷新 / 分页 ────────────────────────────────

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

const navRowHeightPx = rpxToPx(homeMock.navHeightRpx)

const refreshPullText = computed(() => {
	return `下拉刷新${activeSceneConfig.value?.label || '推荐'}频道`
})

const activeSceneRef = computed(() => {
	return sceneRefMap[props.sceneKey] || null
})

// ── 发射滚动状态（供 index.vue 驱动 IndexSubNavBar）────

function emitScrollState() {
	emit('scroll-state', {
		refreshState: refreshHintState.value,
		refreshPullText: refreshPullText.value,
		refreshPullDistancePx: refreshPullDistancePx.value,
		refreshRevealDistancePx: navRowHeightPx
	})
}

// ── 事件处理 ──────────────────────────────────────────

function handleParentScroll(event) {
	if (!parentScrollEnabled.value) {
		parentScrollTopPx.value = 0
		return
	}

	parentScrollTopPx.value = event.detail.scrollTop || 0
}

function handleRefresherPulling(event) {
	if (refreshing.value || !parentRefresherEnabled.value) {
		return
	}

	const pullingDistance = Number(event?.detail?.dy || event?.detail?.deltaY || event?.detail?.pullDistance || 0) || 0
	if (pullingDistance <= 0) {
		return
	}

	clearRefreshHintResetTimer()
	refreshHintState.value = 'pulling'
	refreshPullDistancePx.value = Math.min(navRowHeightPx, Math.max(0, pullingDistance * 0.55))
	emitScrollState()
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
		emitScrollState()
	}, delayMs)
}

function rearmReachLowerTrigger() {
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
	if (refreshing.value || !parentRefresherEnabled.value) {
		return
	}

	const requestId = ++refreshRequestId
	refreshing.value = true
	clearRefreshHintResetTimer()
	refreshHintState.value = 'refreshing'
	refreshPullDistancePx.value = navRowHeightPx
	resetBottomPullState(true)
	emitScrollState()

	const handler = activeSceneRef.value?.handleParentRefresh
	if (typeof handler === 'function') {
		await handler()
	}

	if (requestId !== refreshRequestId) {
		refreshing.value = false
		resetRefreshHint()
		return
	}

	refreshing.value = false
	resetRefreshHint(120)
}

async function handleParentReachLower() {
	if (refreshing.value || bottomPullState.value === 'loading' || !bottomPullEnabled.value) {
		return
	}

	const handler = activeSceneRef.value?.handleParentReachLower
	if (typeof handler !== 'function') {
		return
	}

	const requestId = ++reachLowerRequestId
	showBottomPullState('loading')
	const result = normalizeReachLowerResult(await handler())

	if (requestId !== reachLowerRequestId) {
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

function normalizeReachLowerResult(result) {
	if (!result) {
		return { status: 'loaded' }
	}

	if (typeof result === 'string') {
		return { status: result }
	}

	return { status: result.status || 'loaded' }
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
