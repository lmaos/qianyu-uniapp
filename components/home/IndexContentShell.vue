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
// ════════════════════════════════════════════════════════════
// IndexContentShell.vue — 首页内容壳组件
// ════════════════════════════════════════════════════════════
//
// 职责：
//   包裹所有首页场景组件（推荐 / 直播 / 商城），提供统一的：
//   - 父级滚动容器（PullPagingShell）
//   - 场景懒挂载（首次激活时才创建组件实例）
//   - 下拉刷新 ↔ 导航栏状态同步
//   - 触底分页（上拉加载更多）
//   - 场景切换时的内容复位（回到顶部、重置分页）
//
// 数据流：
//   props.sceneConfigList（来自 index.vue ← resolver）→ v-for 渲染场景
//   props.sceneKey 变化 → v-show 切换可见性 + watch 触发复位
//   emit('scroll-state') → index.vue → props → IndexSubNavBar
//
// 与 IndexSubNavBar 的关系：
//   本组件负责所有滚动状态计算（下拉距离、刷新状态），
//   IndexSubNavBar 只负责渲染视觉反馈。
//
// 【未来改什么】
//   - 新增场景 prop 定制 → 在 resolveSceneProps 追加 case。
//   - 修改下拉刷新灵敏度 → 改 props.lowerThresholdPx 或 navRowHeightPx。
//   - 修改底部加载样式 → 改 bottomPullSlotStyle computed 或模板中的插槽。
//   - 场景切换添加动画 → 在 watch props.sceneKey 中添加 transition 逻辑。

import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import { NAV_CONFIG } from '@/components/home/indexNavigationConfig'

const props = defineProps({
	// ── 当前激活的场景 key ──
	sceneKey: { type: String, default: '' },
	// ── 当前三级导航 key（仅 mall 场景使用） ──
	contentKey: { type: String, default: '' },
	// ── 所有场景的配置列表 ──
	// 每一项：{ key, label, component, theme, contentGapRpx, showPublishAction,
	//           defaultContentKey, extraNavComponent, extraNavHeightRpx }
	sceneConfigList: { type: Array, default: () => [] },
	// ── 内容区域可用高度（screen - tabBar - safeBottom） ──
	viewportHeightPx: { type: Number, default: 0 },
	// ── 内容区顶部内边距（避让固定的导航栏高度） ──
	contentTopPaddingRpx: { type: Number, default: 0 },
	// ── 安全区顶部 px（供内部计算偏移用） ──
	safeTopRpx: { type: Number, default: 0 }
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
	// ── 场景配置 ──────────────────────────────────────────────

	/** 当前激活场景的完整配置（从 sceneConfigList 中匹配 key） */
	const activeSceneConfig = computed(() => {
		return props.sceneConfigList.find(s => s.key === props.sceneKey) || null
	})

	/** 当前场景是否为浅色主题（影响背景渐变和内容区阴影） */
	const isLightScene = computed(() => {
		return activeSceneConfig.value ? activeSceneConfig.value.theme === 'light' : false
	})

	/** 当前场景的扩展导航高度（如商城的三级分类栏 ShopSubNavExtra 的高度） */
	const activeExtraNavHeightRpx = computed(() => {
		return activeSceneConfig.value?.extraNavHeightRpx || 0
	})

	/**
	 * 导航面板底部内边距。
	 * 有 extraNav 时面板底部平接（border-radius=0）。
	 * 无 extraNav 时 light 主题需要额外 20rpx 底部留白。
	 */
	const activePanelBottomInsetRpx = computed(() => {
		return activeExtraNavHeightRpx.value > 0 ? 0 : isLightScene.value ? 20 : 0
	})


// ── 场景懒挂载 ────────────────────────────────────────

	// sceneMountedMap + sceneRefMap：场景懒挂载机制
	// sceneMountedMap 记录哪些场景已被首次激活（v-if 可见），激活后一直保留。
	// sceneRefMap 保存每个场景的组件引用，供调用 handleParentRefresh 等方法。
	// 切换场景用 v-show 而非 v-if，防止组件销毁重建丢失状态。
	// 【未来改什么】
	//   - 限制并发挂载数 → 缓存最近 N 个场景的 mounted key。
	//   - 场景切换过渡动画 → 在 watch props.sceneKey 中实现。
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

	/** 场景组件实例引用表 { sceneKey: VueInstance }，注册于 setSceneRef */
const sceneRefMap = reactive({})

	/** 注册场景组件引用（模板 :ref 回调），instance 为 null 时移除旧引用 */
function setSceneRef(sceneKey, instance) {
	if (instance) {
		sceneRefMap[sceneKey] = instance
		return
	}
	delete sceneRefMap[sceneKey]
}

	/** 判断场景组件是否应挂载：首次激活后一直 true */
function shouldMountScene(sceneKey) {
	return !!sceneMountedMap[sceneKey]
}

	/** 判断场景组件是否当前可见（与模板 v-show 联动） */
function isSceneActive(sceneKey) {
	return props.sceneKey === sceneKey
}

// ── 场景 prop 解析 ────────────────────────────────────
	// 每个场景需要的 props 不同（商城传 categoryId，直播/推荐传 scrollTop）。
	// 【未来改什么】新增场景需额外 props → 在此追加 case。
	/** 按场景 key 分发的组件 props */
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


	/** 内容区可用高度（viewportHeight - 导航栏 - 底部安全区） */
const availableContentHeightPx = computed(() => {
	return Math.max(0, props.viewportHeightPx || systemInfo.windowHeight || 0)
})

	/** 顶部内边距的 px 值（由 rpx 换算而来） */
const contentTopPaddingPx = computed(() => {
	return rpxToPx(props.contentTopPaddingRpx)
})

	/** 子场景组件的实际 scrollTop = 父容器 scrollTop - 导航栏高度 */
const activeChildScrollTopPx = computed(() => {
	return Math.max(0, parentScrollTopPx.value - contentTopPaddingPx.value)
})

	/** 内容区左右内边距：商城/推荐场景更紧凑 */
const activeContentSidePaddingRpx = computed(() => {
	if (props.sceneKey === 'mall' || props.sceneKey === 'recommend') {
		return homeMock.mallContentSidePaddingRpx
	}
	return homeMock.contentSidePaddingRpx
})

	/** 内容区底部内边距 */
const activeContentBottomPaddingRpx = computed(() => {
	return homeMock.contentBottomPaddingRpx
})

	/** 父容器是否可滚动（有场景配置即为 true） */
const parentScrollEnabled = computed(() => {
	return activeSceneConfig.value ? true : false
})

	/** 父容器是否启用下拉刷新 */
const parentRefresherEnabled = computed(() => {
	return activeSceneConfig.value ? true : false
})

	/** 底部上拉加载是否启用 */
const bottomPullEnabled = computed(() => {
	return true
})

// ── 内容区域样式 ──────────────────────────────────────
	// 以下计算属性输出 PullPagingShell 和背景层的样式绑定。

	/** 页面外壳高度 */
const pageShellStyle = computed(() => {
	return {
		height: `${availableContentHeightPx.value}px`
	}
})

	/** 浅色主题背景渐变：商城专用暖粉渐变，其他用蓝灰渐变 */
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

	/** 内容壳高度 */
const contentShellStyle = computed(() => {
	return {
		height: `${availableContentHeightPx.value}px`
	}
})

	/** 内容区内边距（padding），避让导航栏 + 底部加载插槽 */
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

	/** 底部加载提示插槽样式 */
const bottomPullSlotStyle = computed(() => {
	return {
		height: bottomPullEnabled.value && bottomPullVisible.value ? `${homeMock.bottomPullSlotHeightRpx}rpx` : '0rpx',
		paddingLeft: `${activeContentSidePaddingRpx.value}rpx`,
		paddingRight: `${activeContentSidePaddingRpx.value}rpx`,
		background: 'transparent'
	}
})

// ── 场景内容切换 ──────────────────────────────────────
	// 当 sceneKey 或 contentKey 变化时，复位所有分页/刷新状态并滚到顶部。

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
	// 以下 ref + timer 构成了完整的下拉刷新 ↔ 触底分页状态机。
	// 【理解要点】
	//   PullPagingShell 是第三方滚动容器，触发 pull/refresh/scroll-lower 事件。
	//   IndexContentShell 根据事件更新内部状态，然后 emit scroll-state 给 index.vue。
	//   index.vue 将状态传给 IndexSubNavBar 渲染视觉反馈。
	//
	// 【未来改什么】
	//   - 修改下拉触发力度 → 改 navRowHeightPx 或 pullDistance 系数（0.55）。
	//   - 修改底部加载文案 → 改 bottomPullState 各状态的显示逻辑。
	//   - 增加下拉刷新超时保护 → 在 handleParentRefresh 加 setTimeout 兜底。

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

	/** 向父组件发射当前滚动/刷新状态，IndexSubNavBar 据此显示视觉反馈 */
function emitScrollState() {
	emit('scroll-state', {
		refreshState: refreshHintState.value,
		refreshPullText: refreshPullText.value,
		refreshPullDistancePx: refreshPullDistancePx.value,
		refreshRevealDistancePx: navRowHeightPx
	})
}

// ── 事件处理 ──────────────────────────────────────────

	/** 父容器滚动事件：记录 scrollTop，供子场景计算可见区域 */
function handleParentScroll(event) {
	if (!parentScrollEnabled.value) {
		parentScrollTopPx.value = 0
		return
	}

	parentScrollTopPx.value = event.detail.scrollTop || 0
}

	/** 下拉刷新拉动中：计算拉动距离，通知导航栏显示刷新提示 */
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

	/** 下拉刷新复位：未触发刷新时隐藏提示 */
function handleRefresherRestore() {
	if (!parentRefresherEnabled.value) {
		return
	}

	if (!refreshing.value) {
		resetRefreshHint()
	}
}

	/** 触底场景：标记用户正在触摸，阻止底部插槽动画触发重排 */
function handleParentTouchStart() {
	if (!bottomPullEnabled.value) {
		return
	}

	parentTouching.value = true
}

	/** 触底场景：用户松手后调度底部插槽收起 */
function handleParentTouchEnd() {
	if (!bottomPullEnabled.value) {
		return
	}

	parentTouching.value = false
	if (bottomPullPendingRelease.value) {
		scheduleBottomPullCollapse(homeMock.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
	}
}

	/** 清除所有底部加载相关定时器 */
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

	/** 清除触底重装定时器 */
function clearReachLowerRearmTimer() {
	if (reachLowerRearmTimer) {
		clearTimeout(reachLowerRearmTimer)
		reachLowerRearmTimer = null
	}
}

	/** 清除刷新提示复位定时器 */
function clearRefreshHintResetTimer() {
	if (refreshHintResetTimer) {
		clearTimeout(refreshHintResetTimer)
		refreshHintResetTimer = null
	}
}

	/** 清除滚动复位定时器 */
function clearScrollTopResetTimer() {
	if (scrollTopResetTimer) {
		clearTimeout(scrollTopResetTimer)
		scrollTopResetTimer = null
	}
}

	/** 复位下拉刷新提示（可选延迟，让 loading 状态多停留一会） */
function resetRefreshHint(delayMs = 0) {
	clearRefreshHintResetTimer()
	refreshHintResetTimer = setTimeout(() => {
		refreshHintState.value = 'idle'
		refreshPullDistancePx.value = 0
		refreshHintResetTimer = null
		emitScrollState()
	}, delayMs)
}

	/** 触底后重新布防：将 scrollTop 回调 14px 使 scroll-lower 可再次触发 */
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

	/** 复位底部加载状态：immediate=true 立即隐藏，false 等待收起动画结束 */
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

	/** 显示底部加载状态（loading / no-more / loaded） */
function showBottomPullState(state) {
	clearBottomPullTimers()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	bottomPullState.value = state
	bottomPullVisible.value = true
}

	/** 调度底部插槽收起：delayMs 后隐藏，可附带重新布防触底 */
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

	/** 请求底部回弹：用户仍在触摸时延迟执行，松手后收起 */
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

	/** 计算底部回弹 fallback 延迟：保证不少于 noMoreHoldMs + 120ms */
function resolveBottomPullFallbackDelay(delayMs) {
	return Math.max(Number(delayMs) || 0, homeMock.bottomPullNoMoreHoldMs) + 120
}

	/** 处理下拉刷新：调用当前场景的 handleParentRefresh，完成后复位 */
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

	/** 处理触底加载：调用当前场景的 handleParentReachLower，处理 no-more/loaded 状态 */
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

	/** 标准化触底结果：支持返回字符串或 { status } 对象 */
function normalizeReachLowerResult(result) {
	if (!result) {
		return { status: 'loaded' }
	}

	if (typeof result === 'string') {
		return { status: result }
	}

	return { status: result.status || 'loaded' }
}

	/** 复位所有瞬态（切换场景时调用） */
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

	/** 将当前场景滚动到顶部（切换场景时触发） */
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
