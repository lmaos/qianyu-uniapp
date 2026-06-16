<template>
	<view class="mine-page">
		<view class="mine-top-cover" :style="topCoverStyle"></view>

		<view
			v-if="refreshHintState !== 'idle'"
			class="mine-refresh-cover"
			:style="refreshCoverStyle"
		>
			<view class="mine-refresh-indicator">
				<view v-if="refreshHintState === 'refreshing'" class="mine-refresh-spinner"></view>
				<text class="mine-refresh-text">{{ refreshIndicatorText }}</text>
			</view>
		</view>

		<PullPagingShell
			light-theme
			:refresher-enabled="false"
			refresher-background="transparent"
			refresher-default-style="none"
			:lower-threshold="minePageConfig.lowerThresholdPx"
			:scroll-top="parentScrollTopValue"
			:inner-style="contentInnerStyle"
			:bottom-pull-state="bottomPullState"
			:bottom-pull-visible="bottomPullVisible"
			:bottom-pull-slot-style="bottomPullSlotStyle"
			@scroll="handleParentScroll"
			@touch-start="handleParentTouchStart"
			@touch-move="handleParentTouchMove"
			@touch-end="handleParentTouchEnd"
			@scroll-lower="handleParentReachLower"
		>
			<view id="mine-top-card-anchor" class="mine-top-card-anchor">
				<UserTopCard
					:profile-info="profileInfo"
					:show-background="false"
					@add-friend="handleAddFriendClick"
					@visitor-click="handleVisitorClick"
					@settings-click="handleSettingsClick"
					@qrcode-click="handleQrCodeClick"
				/>
			</view>

			<view class="mine-main-content">
				<view class="mine-profile-sheet">
					<view class="mine-sheet-section mine-sheet-section--stats">
						<UserStatsRow
							:stats-list="profileInfo.statsList"
							@stat-click="handleStatsClick"
							@edit-click="handleEditProfileClick"
						/>
					</view>

					<view class="mine-sheet-section mine-sheet-section--identity">
						<view v-if="showNestCard" class="mine-nest-card">
							<text class="mine-nest-title">{{ profileInfo.nestTitle }}</text>
							<text class="mine-signature-text">{{ profileInfo.signature }}</text>
							<text class="mine-mood-text">{{ profileInfo.moodPromptText }}</text>

							<view class="mine-signal-grid">
								<view
									v-for="item in profileInfo.signalSummaryList || []"
									:key="item.key"
									:class="['mine-signal-item', item.key === 'location' ? 'mine-signal-item--location' : '']"
								>
									<template v-if="item.key === 'location'">
										<image class="mine-signal-location-icon" :src="locationPinSvg" mode="aspectFit" />
										<text class="mine-signal-location-value">{{ item.value }}</text>
									</template>
									<template v-else>
										<text class="mine-signal-value">{{ item.value }}</text>
										<text class="mine-signal-label">{{ item.label }}</text>
									</template>
								</view>
							</view>
						</view>
						<view v-else class="mine-bio-strip">
							<view class="mine-bio-row">
								<image class="mine-bio-icon" :src="signatureIconSvg" mode="aspectFit" />
								<text class="mine-bio-text">{{ profileInfo.signature }}</text>
							</view>
							<view class="mine-bio-row mine-bio-row--location">
								<image class="mine-bio-icon" :src="locationPinSvg" mode="aspectFit" />
								<text class="mine-bio-text">{{ profileInfo.locationText }}</text>
							</view>
						</view>
					</view>

					<view class="mine-sheet-section mine-sheet-section--actions">
						<UserQuickActionRow :action-list="quickActionList" @action-click="handleQuickActionClick" />
					</view>

					<view class="mine-sheet-section mine-sheet-section--tabs">
						<UserContentTabBar
							:tab-list="displayTabList"
							:active-tab="activeTab"
							@change="handleTabChange"
						/>
					</view>
				</view>

				<view id="mine-list-anchor" class="mine-list-section">
					<UserDynamicList
						v-if="activeTab === 'dynamic'"
						:row-list="dynamicRowList"
						:parent-scroll-top-px="parentScrollTopPx"
						:list-start-offset-px="listStartOffsetPx"
						:active="props.active && activeTab === 'dynamic'"
						@item-click="handleDynamicItemClick"
					/>

					<UserWorkGrid
						v-else-if="activeTab === 'works'"
						:row-list="workRowList"
						:parent-scroll-top-px="parentScrollTopPx"
						:list-start-offset-px="listStartOffsetPx"
						:active="props.active && activeTab === 'works'"
						@item-click="handleWorkItemClick"
					/>

					<UserDynamicList
						v-else-if="activeTab === 'likes'"
						:row-list="likeRowList"
						:parent-scroll-top-px="parentScrollTopPx"
						:list-start-offset-px="listStartOffsetPx"
						:active="props.active && activeTab === 'likes'"
						@item-click="handleLikeItemClick"
					/>

					<UserDynamicList
						v-else
						:row-list="historyRowList"
						:parent-scroll-top-px="parentScrollTopPx"
						:list-start-offset-px="listStartOffsetPx"
						:active="props.active && activeTab === 'history'"
						@item-click="handleHistoryItemClick"
					/>
				</view>
			</view>
		</PullPagingShell>
	</view>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import UserContentTabBar from '@/components/user-center/main/UserContentTabBar.vue'
import UserDynamicList from '@/components/user-center/main/UserDynamicList.vue'
import UserQuickActionRow from '@/components/user-center/main/UserQuickActionRow.vue'
import UserStatsRow from '@/components/user-center/main/UserStatsRow.vue'
import UserTopCard from '@/components/user-center/main/UserTopCard.vue'
import UserWorkGrid from '@/components/user-center/main/UserWorkGrid.vue'
import { createSvgDataUri } from '@/composables/useSvgIcon.js'
import { createMainTabPageState, getUserCenterMainMock } from '@/components/user-center/userCenterMock.js'
import { fetchPersonalCenter, fetchContentList } from '@/composables/useMineApi.js'
import { dispatchNavigationAction } from '@/components/common/navigation/navigationActionRouter.js'

const props = defineProps({
	active: {
		type: Boolean,
		default: false
	}
})

const minePageMock = getUserCenterMainMock()
const { safeTopPx, rpxToPx } = useSafeAreaMetrics()
const minePageConfig = {
	lowerThresholdPx: 220,
	pageSize: minePageMock.pageSize,
	contentBottomPaddingRpx: 36,
	bottomPullSlotHeightRpx: 72,
	refreshRevealHeightRpx: 88,
	refreshSettleDurationMs: 180,
	bottomPullLoadedHoldMs: 420,
	bottomPullNoMoreHoldMs: 480,
	bottomPullReleaseDelayMs: 20,
	bottomPullCollapseDurationMs: 380
}

const locationPinSvg = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z" stroke="#667085" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
		<circle cx="12" cy="10" r="3" stroke="#667085" stroke-width="1.6"/>
	</svg>
`)

// 小窝功能未上线，暂用轻量 bio strip；上线后改为 true
const showNestCard = ref(false)

// 游标分页状态（tabKey → cursor / hasMore）
const tabCursorMap = { dynamic: 0, works: 0, likes: 0, history: 0 }
const tabHasMoreMap = { dynamic: true, works: true, likes: true, history: true }
const tabLoadedMap = { dynamic: false, works: false, likes: false, history: false }

const signatureIconSvg = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="m7 17.3 7.7-7.7 2.3 2.3-7.7 7.7L6 19l1-1.7z" stroke="#94a3b8" stroke-width="1.6" stroke-linejoin="round"/>
		<path d="m13.8 7.8 1.5-1.5a1.8 1.8 0 0 1 2.5 0l.9.9a1.8 1.8 0 0 1 0 2.5L17.2 11" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"/>
	</svg>
`)


const profileInfo = ref({ ...minePageMock.profileInfo })
const quickActionList = ref([...minePageMock.quickActionList])
const tabList = ref([...minePageMock.tabList])
const dynamicSourceList = ref([])
const workSourceList = ref([])
const likeSourceList = ref([])
const historySourceList = ref([])

const activeTab = ref('dynamic')
const dynamicPage = ref(1)
const workPage = ref(1)
const refreshing = ref(false)
const refreshHintState = ref('idle')
const refreshPullDistancePx = ref(0)
const refreshCoverTransitionMs = ref(0)
const topCoverBaseHeightPx = ref(0)
const listStartOffsetPx = ref(0)
const loadingMore = ref(false)
const tabLoadingKey = ref('')
const dynamicNoMore = ref(false)
const workNoMore = ref(false)
const bottomPullState = ref('idle')
const bottomPullVisible = ref(false)
const bottomPullPendingRelease = ref(false)
const bottomPullRearmPending = ref(false)
const parentTouching = ref(false)
const parentScrollTopPx = ref(0)
const parentScrollTopValue = ref(0)

let bottomPullCollapseTimer = null
let bottomPullResetTimer = null
let reachLowerRearmTimer = null
let refreshHintResetTimer = null
let bottomPullFallbackTimer = null
let refreshRequestId = 0
let reachLowerRequestId = 0
let refreshTouchStartY = 0
let refreshTouchStartScrollTop = 0
let refreshPullTracking = false

const activeTabLabel = computed(() => {
	return tabList.value.find((item) => item.key === activeTab.value)?.label || '内容'
})
const displayTabList = computed(() => {
	return tabList.value.map((item) => ({
		...item,
		loading: item.key === tabLoadingKey.value
	}))
})
const displayDynamicList = computed(() =>
	createMainTabPageState(dynamicSourceList.value, minePageConfig.pageSize, dynamicPage.value)
)
const displayWorkList = computed(() =>
	createMainTabPageState(workSourceList.value, minePageConfig.pageSize, workPage.value)
)
const dynamicRowList = computed(() => buildRows(displayDynamicList.value, 2))
const workRowList = computed(() => buildRows(displayWorkList.value, 3))
const likeRowList = computed(() => buildRows(likeSourceList.value, 2))
const historyRowList = computed(() => buildRows(historySourceList.value, 2))

const contentInnerStyle = computed(() => ({
	paddingBottom: `${minePageConfig.contentBottomPaddingRpx + (bottomPullVisible.value ? minePageConfig.bottomPullSlotHeightRpx : 0)}rpx`,
	background: 'transparent'
}))

const bottomPullSlotStyle = computed(() => ({
	height: bottomPullVisible.value ? `${minePageConfig.bottomPullSlotHeightRpx}rpx` : '0rpx',
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	background: 'linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, #f8fafc 42%, #f8fafc 100%)'
}))
const refreshRevealDistancePx = rpxToPx(minePageConfig.refreshRevealHeightRpx)
const topCoverFallbackHeightPx = computed(() => {
	const safeTopGapPx = 18
	const rowAHeightPx = rpxToPx(64)
	const rowGapPx = rpxToPx(28)
	const rowBHeightPx = rpxToPx(148)
	const bottomPaddingPx = rpxToPx(28)

	return safeTopPx.value + safeTopGapPx + rowAHeightPx + rowGapPx + rowBHeightPx + bottomPaddingPx
})
const refreshIndicatorText = computed(() => {
	if (refreshHintState.value === 'refreshing') {
		return `刷新${activeTabLabel.value}中...`
	}

	return `下拉刷新${activeTabLabel.value}`
})
const refreshCoverStyle = computed(() => {
	const revealDistance = Math.max(1, refreshRevealDistancePx)
	const offsetPx =
		refreshHintState.value === 'refreshing'
			? 0
			: Math.min(0, Number(refreshPullDistancePx.value || 0) - revealDistance)

	return {
		height: `${safeTopPx.value + revealDistance}px`,
		paddingTop: `${safeTopPx.value}px`,
		transform: `translateY(${offsetPx}px)`,
		transition:
			refreshCoverTransitionMs.value > 0
				? `transform ${refreshCoverTransitionMs.value}ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 120ms ease`
				: 'none',
		opacity:
			refreshHintState.value === 'refreshing'
				? 1
				: Math.min(1, Number(refreshPullDistancePx.value || 0) / revealDistance)
	}
})
const topCoverStyle = computed(() => {
	const nextHeightPx = Math.max(topCoverBaseHeightPx.value, topCoverFallbackHeightPx.value)

	return {
		height: `${nextHeightPx}px`,
		background: profileInfo.value.coverBackground,
		backgroundPosition: 'center center',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover'
	}
})

watch(
	() => props.active,
	(value) => {
		if (value) {
			if (!topCoverBaseHeightPx.value) {
				scheduleMeasureTopCardBottom()
			}
			return
		}

		resetTransientState()
	},
	{
		immediate: true
	}
)

onMounted(async () => {
	scheduleMeasureTopCardBottom()
	scheduleMeasureListAnchor()
	await initPageData()
})

onBeforeUnmount(() => {
	resetTransientState()
})

async function initPageData() {
	try {
		const { profileInfo: apiProfile, quickActionList: apiActions } = await fetchPersonalCenter()
		profileInfo.value = { ...profileInfo.value, ...apiProfile }
		quickActionList.value = apiActions
		// 预加载当前 tab 第一页
		const tabKey = activeTab.value
		const { items, nextCursor, hasMore } = await fetchContentList(tabKey, 0)
		setTabSourceList(tabKey, items)
		tabCursorMap[tabKey] = nextCursor
		tabHasMoreMap[tabKey] = hasMore
		setTabNoMore(tabKey, !hasMore)
		tabLoadedMap[tabKey] = true
	} catch (err) {
		console.error('mine-init-error', err)
	}
}

async function loadTabContent(tabKey) {
	if (tabLoadedMap[tabKey]) return
	if (tabKey === 'history' && !tabHasMoreMap[tabKey]) return
	try {
		setTabLoadingState(tabKey)
		const { items, nextCursor, hasMore } = await fetchContentList(tabKey, 0)
		setTabSourceList(tabKey, items)
		tabCursorMap[tabKey] = nextCursor
		tabHasMoreMap[tabKey] = hasMore
		setTabNoMore(tabKey, !hasMore)
		tabLoadedMap[tabKey] = true
	} catch (err) {
		console.error('mine-tab-load-error', tabKey, err)
	} finally {
		clearTabLoadingState()
	}
}

function handleAddFriendClick() {
	onAddFriendClick({ userId: profileInfo.value.userId })
	uni.navigateTo({
		url: minePageMock.addFriendUrl
	})
}

function handleVisitorClick() {
	onVisitorClick({ userId: profileInfo.value.userId })
	uni.navigateTo({
		url: minePageMock.visitorUrl
	})
}

function handleSettingsClick() {
	onSettingsClick({ userId: profileInfo.value.userId })
	uni.navigateTo({
		url: minePageMock.settingsUrl
	})
}

function handleQrCodeClick() {
	onQrCodeClick({ userId: profileInfo.value.userId })
	uni.navigateTo({
		url: minePageMock.qrcodeUrl
	})
}

function handleStatsClick(statItem) {
	onStatsClick(statItem)

	if (statItem.key === 'follow') {
		uni.navigateTo({
			url: minePageMock.followUrl
		})
		return
	}

	if (statItem.key === 'fans') {
		uni.navigateTo({
			url: minePageMock.fansUrl
		})
	}
}

function handleEditProfileClick() {
	onEditProfileClick({ userId: profileInfo.value.userId })
	uni.navigateTo({
		url: minePageMock.editProfileUrl
	})
}

function handleQuickActionClick(actionItem) {
	onQuickActionClick(actionItem)
	navigateByUrl(actionItem?.url)
}

function handleTabChange(tabItem) {
	if (activeTab.value === tabItem.key) {
		resetRefreshHint()
		onTabRepeat(tabItem)
		scheduleMeasureListAnchor()
		return
	}

	clearTabLoadingState()
	activeTab.value = tabItem.key
	resetBottomPullState(true)
	resetRefreshHint()
	scheduleMeasureListAnchor()
	onTabChange(tabItem)
	loadTabContent(tabItem.key)
}

function handleDynamicItemClick(item) {
	onDynamicItemClick(item)
	navigateByUrl(item.detailUrl)
}

function handleWorkItemClick(item) {
	onWorkItemClick(item)
	navigateByUrl(item.detailUrl)
}

function handleLikeItemClick(item) {
	onLikeItemClick(item)
	navigateByUrl(item.detailUrl)
}

function handleHistoryItemClick(item) {
	onHistoryItemClick(item)
	navigateByUrl(item.detailUrl)
}

function handleParentScroll(event) {
	parentScrollTopPx.value = Number(event?.detail?.scrollTop || 0)
}

function handleParentTouchStart(event) {
	parentTouching.value = true
	refreshTouchStartY = getTouchClientY(event)
	refreshTouchStartScrollTop = parentScrollTopPx.value
	refreshPullTracking = false
	if (!refreshing.value) {
		refreshCoverTransitionMs.value = 0
	}
}

function handleParentTouchMove(event) {
	if (!props.active || refreshing.value) {
		return
	}

	const touchY = getTouchClientY(event)
	if (!touchY) {
		return
	}

	if (!refreshTouchStartY) {
		refreshTouchStartY = touchY
		refreshTouchStartScrollTop = parentScrollTopPx.value
		return
	}

	const deltaY = touchY - refreshTouchStartY
	if (refreshTouchStartScrollTop > 0 || parentScrollTopPx.value > 0 || deltaY <= 0) {
		return
	}

	refreshPullTracking = true
	refreshCoverTransitionMs.value = 0
	clearRefreshHintResetTimer()
	refreshHintState.value = 'pulling'
	refreshPullDistancePx.value = Math.min(refreshRevealDistancePx, Math.max(0, deltaY * 0.55))
}

function handleParentTouchEnd() {
	parentTouching.value = false
	if (refreshPullTracking && !refreshing.value) {
		refreshPullTracking = false
		if (shouldTriggerCustomRefresh()) {
			handleParentRefresh()
		} else {
			settleRefreshCover(0, true)
		}
	}
	if (bottomPullPendingRelease.value) {
		scheduleBottomPullCollapse(minePageConfig.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
	}
	refreshTouchStartY = 0
	refreshTouchStartScrollTop = 0
}

async function handleParentRefresh() {
	if (!props.active || refreshing.value) {
		return
	}

	const requestId = ++refreshRequestId
	const tabKey = activeTab.value
	const refreshTask = createMineTabRequestTask('refresh', tabKey)
	refreshing.value = true
	setTabLoadingState(tabKey)
	clearRefreshHintResetTimer()
	refreshHintState.value = 'refreshing'
	settleRefreshCover(refreshRevealDistancePx, false)
	resetBottomPullState(true)

	try {
		await Promise.resolve(onMineRefresh(refreshTask.payload))
	} catch (error) {
		console.error('mine-refresh-error', error)
		refreshing.value = false
		clearTabLoadingState()
		settleRefreshCover(0, true)
		return
	}

	if (requestId !== refreshRequestId || !props.active) {
		refreshing.value = false
		clearTabLoadingState()
		settleRefreshCover(0, true)
		return
	}

	if (!refreshTask.wasHandled()) {
		applyMockRefreshFallback(tabKey)
	}

	refreshing.value = false
	clearTabLoadingState()
	settleRefreshCover(0, true)
}

async function handleParentReachLower() {
	if (!props.active || refreshing.value || loadingMore.value || !canLoadMoreCurrentTab()) {
		return
	}

	const requestId = ++reachLowerRequestId
	const tabKey = activeTab.value
	const loadMoreTask = createMineTabRequestTask('load-more', tabKey)
	setTabLoadingState(tabKey)
	loadingMore.value = true
	showBottomPullState('loading')

	try {
		await Promise.resolve(onMineLoadMore(loadMoreTask.payload))
	} catch (error) {
		console.error('mine-load-more-error', error)
		loadingMore.value = false
		clearTabLoadingState()
		resetBottomPullState(true)
		return
	}

	if (requestId !== reachLowerRequestId || !props.active) {
		loadingMore.value = false
		clearTabLoadingState()
		resetBottomPullState(true)
		return
	}

	const result = loadMoreTask.wasHandled() ? loadMoreTask.getStatus() : loadCurrentTabNextPage(tabKey)
	loadingMore.value = false
	clearTabLoadingState()

	if (result === 'no-more') {
		bottomPullState.value = 'no-more'
		requestBottomPullRebound(minePageConfig.bottomPullNoMoreHoldMs)
		return
	}

	bottomPullState.value = 'loaded'
	requestBottomPullRebound(minePageConfig.bottomPullLoadedHoldMs)
}

function canLoadMoreCurrentTab(tabKey = activeTab.value) {
	if (tabKey === 'dynamic') {
		return !dynamicNoMore.value
	}

	if (tabKey === 'works') {
		return !workNoMore.value
	}

	return false
}

function loadCurrentTabNextPage(tabKey = activeTab.value) {
	if (tabKey === 'dynamic') {
		const loadedCount = displayDynamicList.value.length
		if (loadedCount >= dynamicSourceList.value.length) {
			dynamicNoMore.value = true
			return 'no-more'
		}

		dynamicPage.value += 1
		dynamicNoMore.value = displayDynamicList.value.length >= dynamicSourceList.value.length
		return 'loaded'
	}

	if (tabKey === 'works') {
		const loadedCount = displayWorkList.value.length
		if (loadedCount >= workSourceList.value.length) {
			workNoMore.value = true
			return 'no-more'
		}

		workPage.value += 1
		workNoMore.value = displayWorkList.value.length >= workSourceList.value.length
		return 'loaded'
	}

	return 'busy'
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
	}, minePageConfig.bottomPullCollapseDurationMs)
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
		}, minePageConfig.bottomPullCollapseDurationMs)
	}, delayMs)
}

function requestBottomPullRebound(delayMs) {
	if (parentTouching.value) {
		bottomPullPendingRelease.value = true
		bottomPullRearmPending.value = true
		bottomPullFallbackTimer = setTimeout(() => {
			parentTouching.value = false
			if (bottomPullPendingRelease.value) {
				scheduleBottomPullCollapse(minePageConfig.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
			}
		}, resolveBottomPullFallbackDelay(delayMs))
		return
	}

	scheduleBottomPullCollapse(delayMs, true)
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

function createMineTabRequestTask(action, tabKey) {
	const state = {
		handled: false,
		status: action === 'load-more' ? 'loaded' : 'refreshed'
	}

	const payload = {
		userId: profileInfo.value.userId,
		tabKey,
		tabLabel: resolveTabLabel(tabKey),
		requestType: action,
		updateMode: action === 'refresh' ? 'replace' : 'append',
		pageSize: minePageConfig.pageSize,
		currentPage: resolveTabPage(tabKey),
		requestPage: action === 'refresh' ? 1 : resolveTabPage(tabKey) + 1,
		renderedList: cloneTabList(resolveRenderedTabList(tabKey)),
		sourceList: cloneTabList(resolveTabSourceList(tabKey)),
		applyReplace: (nextList = [], options = {}) => {
			state.handled = true
			state.status = 'refreshed'
			replaceMineTabData(tabKey, nextList, options)
		},
		applyAppend: (nextList = [], options = {}) => {
			state.handled = true
			state.status = 'loaded'
			appendMineTabData(tabKey, nextList, options)
		},
		markNoMore: () => {
			state.handled = true
			state.status = 'no-more'
			setTabNoMore(tabKey, true)
		}
	}

	return {
		payload,
		wasHandled: () => state.handled,
		getStatus: () => state.status
	}
}

function setTabLoadingState(tabKey = '') {
	tabLoadingKey.value = tabKey || ''
}

function clearTabLoadingState() {
	tabLoadingKey.value = ''
}

function resolveTabLabel(tabKey) {
	return tabList.value.find((item) => item.key === tabKey)?.label || '内容'
}

function resolveTabPage(tabKey) {
	if (tabKey === 'dynamic') {
		return dynamicPage.value
	}

	if (tabKey === 'works') {
		return workPage.value
	}

	return 1
}

function resolveTabSourceList(tabKey) {
	if (tabKey === 'dynamic') {
		return dynamicSourceList.value
	}

	if (tabKey === 'works') {
		return workSourceList.value
	}

	if (tabKey === 'likes') {
		return likeSourceList.value
	}

	if (tabKey === 'history') {
		return historySourceList.value
	}

	return []
}

function resolveRenderedTabList(tabKey) {
	if (tabKey === 'dynamic') {
		return displayDynamicList.value
	}

	if (tabKey === 'works') {
		return displayWorkList.value
	}

	if (tabKey === 'likes') {
		return likeSourceList.value
	}

	if (tabKey === 'history') {
		return historySourceList.value
	}

	return []
}

function cloneTabList(sourceList = []) {
	return sourceList.map((item) => ({ ...item }))
}

function inferTabNoMore(nextList = [], options = {}) {
	if (typeof options.noMore === 'boolean') {
		return options.noMore
	}

	if (typeof options.hasMore === 'boolean') {
		return !options.hasMore
	}

	return nextList.length < minePageConfig.pageSize
}

function setTabSourceList(tabKey, nextList = []) {
	const clonedList = cloneTabList(Array.isArray(nextList) ? nextList : [])
	if (tabKey === 'dynamic') {
		dynamicSourceList.value = clonedList
		return
	}

	if (tabKey === 'works') {
		workSourceList.value = clonedList
		return
	}

	if (tabKey === 'likes') {
		likeSourceList.value = clonedList
		return
	}

	if (tabKey === 'history') {
		historySourceList.value = clonedList
	}
}

function setTabNoMore(tabKey, nextValue) {
	if (tabKey === 'dynamic') {
		dynamicNoMore.value = Boolean(nextValue)
		return
	}

	if (tabKey === 'works') {
		workNoMore.value = Boolean(nextValue)
	}
}

function replaceMineTabData(tabKey, nextList = [], options = {}) {
	setTabSourceList(tabKey, nextList)
	if (tabKey === 'dynamic') {
		dynamicPage.value = 1
		setTabNoMore(tabKey, inferTabNoMore(nextList, options))
		return
	}

	if (tabKey === 'works') {
		workPage.value = 1
		setTabNoMore(tabKey, inferTabNoMore(nextList, options))
	}
}

function appendMineTabData(tabKey, nextList = [], options = {}) {
	const appendList = cloneTabList(Array.isArray(nextList) ? nextList : [])
	if (tabKey === 'dynamic') {
		dynamicSourceList.value = [...dynamicSourceList.value, ...appendList]
		dynamicPage.value += 1
		setTabNoMore(tabKey, inferTabNoMore(appendList, options))
		return
	}

	if (tabKey === 'works') {
		workSourceList.value = [...workSourceList.value, ...appendList]
		workPage.value += 1
		setTabNoMore(tabKey, inferTabNoMore(appendList, options))
	}
}

function applyMockRefreshFallback(tabKey) {
	if (tabKey === 'dynamic') {
		replaceMineTabData(tabKey, minePageMock.dynamicSourceList, {
			hasMore: minePageMock.dynamicSourceList.length > minePageConfig.pageSize
		})
		return
	}

	if (tabKey === 'works') {
		replaceMineTabData(tabKey, minePageMock.workSourceList, {
			hasMore: minePageMock.workSourceList.length > minePageConfig.pageSize
		})
		return
	}

	if (tabKey === 'likes') {
		setTabSourceList(tabKey, minePageMock.likeSourceList)
		return
	}

	if (tabKey === 'history') {
		setTabSourceList(tabKey, minePageMock.historySourceList)
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

function resolveBottomPullFallbackDelay(delayMs) {
	return Math.max(Number(delayMs) || 0, minePageConfig.bottomPullNoMoreHoldMs) + 120
}

function resetRefreshHint(delayMs = 0) {
	clearRefreshHintResetTimer()
	refreshHintResetTimer = setTimeout(() => {
		refreshHintState.value = 'idle'
		refreshPullDistancePx.value = 0
		refreshCoverTransitionMs.value = 0
		refreshHintResetTimer = null
	}, delayMs)
}

function resetTransientState() {
	loadingMore.value = false
	clearTabLoadingState()
	refreshing.value = false
	refreshCoverTransitionMs.value = 0
	refreshTouchStartY = 0
	refreshTouchStartScrollTop = 0
	refreshPullTracking = false
	parentTouching.value = false
	refreshRequestId += 1
	reachLowerRequestId += 1
	clearRefreshHintResetTimer()
	resetBottomPullState(true)
	resetRefreshHint()
}

function settleRefreshCover(distancePx, resetState = false) {
	refreshCoverTransitionMs.value = minePageConfig.refreshSettleDurationMs
	refreshPullDistancePx.value = distancePx
	if (resetState) {
		resetRefreshHint(minePageConfig.refreshSettleDurationMs)
	}
}

function shouldTriggerCustomRefresh() {
	return refreshPullDistancePx.value >= refreshRevealDistancePx * 0.96
}

function scheduleMeasureTopCardBottom() {
	nextTick(() => {
		measureTopCardBottom()
		setTimeout(() => {
			measureTopCardBottom()
		}, 32)
	})
}

function scheduleMeasureListAnchor() {
	nextTick(() => {
		measureListAnchor()
		setTimeout(() => {
			measureListAnchor()
		}, 32)
	})
}

function measureListAnchor() {
	uni.createSelectorQuery()
		.select('#mine-list-anchor')
		.boundingClientRect((rect) => {
			if (!rect?.top) {
				return
			}

			listStartOffsetPx.value = Math.max(0, Math.round(rect.top))
		})
		.exec()
}

function buildRows(sourceList = [], columnCount = 1) {
	const rowList = []
	for (let index = 0; index < sourceList.length; index += columnCount) {
		rowList.push({
			rowIndex: Math.floor(index / columnCount),
			items: sourceList.slice(index, index + columnCount)
		})
	}
	return rowList
}

function measureTopCardBottom() {
	uni.createSelectorQuery()
		.select('#mine-top-card-anchor')
		.boundingClientRect((rect) => {
			if (!rect?.bottom) {
				return
			}

			topCoverBaseHeightPx.value = Math.max(0, Math.round(rect.bottom))
		})
		.exec()
}

function getTouchClientY(event) {
	return (
		Number(event?.touches?.[0]?.clientY ?? event?.changedTouches?.[0]?.clientY ?? event?.detail?.y ?? 0) || 0
	)
}

function waitTask(delay = 0) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, delay)
	})
}

function navigateByUrl(url) {
	if (!url) {
		return
	}

	const result = dispatchNavigationAction(url)
	// 普通路径（非 page:// 协议）兜底
	if (!result.handled && url.startsWith("/")) {
		uni.navigateTo({ url })
	}
}

function onAddFriendClick(payload) {
	// TODO：替换添加朋友入口逻辑
	console.log('mine-add-friend-click', payload.userId)
}

function onVisitorClick(payload) {
	// TODO：替换新访客入口逻辑
	console.log('mine-visitor-click', payload.userId)
}

function onSettingsClick(payload) {
	// TODO：替换更多设置入口逻辑
	console.log('mine-settings-click', payload.userId)
}

function onQrCodeClick(payload) {
	// TODO：替换二维码入口逻辑
	console.log('mine-qrcode-click', payload.userId)
}

function onStatsClick(statItem) {
	// TODO：替换统计点击逻辑
	console.log('mine-stats-click', statItem.key)
}

function onEditProfileClick(payload) {
	// TODO：替换编辑主页入口逻辑
	console.log('mine-edit-profile-click', payload.userId)
}

function onQuickActionClick(actionItem) {
	// TODO：替换快捷入口点击逻辑
	console.log('mine-quick-action-click', actionItem.key)
}

function onTabChange(tabItem) {
	// TODO：替换内容 Tab 切换逻辑
	console.log('mine-tab-change', tabItem.key)
}

function onTabRepeat(tabItem) {
	// TODO：替换内容 Tab 重复点击逻辑
	console.log('mine-tab-repeat', tabItem.key)
}

function onDynamicItemClick(item) {
	// TODO：替换动态点击逻辑
	console.log('mine-dynamic-click', item.id, item.contentType)
}

function onWorkItemClick(item) {
	// TODO：替换作品点击逻辑
	console.log('mine-work-click', item.id)
}

function onLikeItemClick(item) {
	// TODO：替换喜欢内容点击逻辑
	console.log('mine-like-click', item.id)
}

function onHistoryItemClick(item) {
	// TODO：替换历史记录点击逻辑
	console.log('mine-history-click', item.id)
}

async function onMineRefresh(payload) {
	const { tabKey } = payload
	try {
		const { items, nextCursor, hasMore } = await fetchContentList(tabKey, 0)
		tabCursorMap[tabKey] = nextCursor
		tabHasMoreMap[tabKey] = hasMore
		tabLoadedMap[tabKey] = true
		payload.applyReplace(items, { hasMore })
	} catch (err) {
		console.error('mine-refresh-error', tabKey, err)
		throw err
	}
}

async function onMineLoadMore(payload) {
	const { tabKey } = payload
	if (!tabHasMoreMap[tabKey]) {
		payload.markNoMore()
		return
	}
	try {
		const cursor = tabCursorMap[tabKey] || 0
		const { items, nextCursor, hasMore } = await fetchContentList(tabKey, cursor)
		tabCursorMap[tabKey] = nextCursor
		tabHasMoreMap[tabKey] = hasMore
		if (items.length === 0) {
			payload.markNoMore()
		} else {
			payload.applyAppend(items, { hasMore })
		}
	} catch (err) {
		console.error('mine-load-more-error', tabKey, err)
		throw err
	}
}
</script>

<style scoped>
.mine-page {
	position: relative;
	height: 100%;
	background: #f8fafc;
	overflow: hidden;
}

.mine-top-cover {
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	z-index: 0;
	border-radius: 0 0 36rpx 36rpx;
	pointer-events: none;
	box-shadow: 0 18rpx 42rpx rgba(255, 171, 191, 0.12);
}

.mine-refresh-cover {
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	z-index: 12;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	box-sizing: border-box;
	pointer-events: none;
}

.mine-top-card-anchor {
	position: relative;
	z-index: 1;
}

.mine-refresh-indicator {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 240rpx;
	height: 64rpx;
	padding: 0 24rpx;
	margin-bottom: 12rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.86);
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.12);
}

.mine-refresh-spinner {
	width: 24rpx;
	height: 24rpx;
	margin-right: 12rpx;
	border: 4rpx solid rgba(17, 24, 39, 0.08);
	border-top-color: rgba(254, 44, 85, 0.78);
	border-radius: 50%;
	animation: mine-refresh-spin 0.8s linear infinite;
}

.mine-refresh-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.mine-main-content {
	padding-top: 20rpx;
	box-sizing: border-box;
	background: #f8fafc;
	position: relative;
	z-index: 1;
}

:deep(.pull-paging-shell) {
	position: relative;
	z-index: 1;
}

.mine-profile-sheet {
	width: 100%;
	background: linear-gradient(180deg, #ffffff 0%, #fffafb 100%);
	border-radius: 36rpx 36rpx 0 0;
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 -8rpx 0 rgba(255, 255, 255, 0.24), 0 16rpx 42rpx rgba(255, 171, 191, 0.08);
	overflow: hidden;
}

.mine-sheet-section {
	padding: 28rpx 24rpx;
}

.mine-sheet-section + .mine-sheet-section {
	border-top: 1rpx solid rgba(238, 242, 246, 0.92);
}

.mine-sheet-section--stats {
	padding-top: 28rpx;
	padding-bottom: 24rpx;
}

.mine-sheet-section--identity {
	padding-top: 20rpx;
	padding-bottom: 20rpx;
}

.mine-sheet-section--actions {
	padding-top: 24rpx;
	padding-bottom: 24rpx;
}

.mine-sheet-section--tabs {
	padding-top: 12rpx;
	padding-bottom: 0;
}

.mine-list-section {
	padding: 20rpx 24rpx 0;
	box-sizing: border-box;
}

.mine-nest-card {
	padding: 24rpx 22rpx;
	border-radius: 30rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.08) 0%, rgba(199, 214, 255, 0.14) 100%);
}

.mine-nest-title,
.mine-mood-text,
.mine-signal-value,
.mine-signal-label {
	display: block;
}

.mine-nest-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #0f172a;
}

.mine-signature-text {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 38rpx;
	color: #334155;
	white-space: pre-wrap;
}

.mine-mood-text {
	margin-top: 14rpx;
	font-size: 22rpx;
	line-height: 34rpx;
	color: #d94f7b;
}

.mine-signal-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 14rpx;
	margin-top: 22rpx;
}

.mine-signal-item {
	padding: 18rpx 14rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.74);
	text-align: center;
}

.mine-signal-value {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #0f172a;
}

.mine-signal-label {
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #667085;
}

.mine-signal-item--location {
	grid-column: 1 / -1;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	gap: 10rpx;
	padding: 14rpx 22rpx;
}

.mine-signal-location-icon {
	width: 32rpx;
	height: 32rpx;
	flex-shrink: 0;
}

.mine-signal-location-value {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #334155;
}

.mine-bio-strip {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
	padding: 24rpx 22rpx;
	border-radius: 30rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.06) 0%, rgba(199, 214, 255, 0.1) 100%);
}

.mine-bio-row {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	gap: 14rpx;
}

.mine-bio-icon {
	width: 28rpx;
	height: 28rpx;
	flex-shrink: 0;
	margin-top: 4rpx;
}

.mine-bio-text {
	flex: 1;
	font-size: 22rpx;
	line-height: 34rpx;
	color: #475569;
}

.mine-sheet-section--tabs :deep(.user-content-tab-bar) {
	gap: 0;
	padding-bottom: 0;
}

.mine-sheet-section--tabs :deep(.user-content-tab-item) {
	position: relative;
	flex: 1;
	height: auto;
	padding: 0 0 18rpx;
	border-radius: 0;
	background: transparent;
}

.mine-sheet-section--tabs :deep(.user-content-tab-text) {
	font-size: 28rpx;
	line-height: 36rpx;
	color: #98a2b3;
}

.mine-sheet-section--tabs :deep(.user-content-tab-item--active .user-content-tab-text) {
	color: #0f172a;
}

.mine-sheet-section--tabs :deep(.user-content-tab-item--active::after) {
	content: '';
	position: absolute;
	right: 50%;
	bottom: 0;
	width: 34rpx;
	height: 6rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff97ae 0%, #ffc4a0 100%);
	transform: translateX(50%);
}

@keyframes mine-refresh-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
