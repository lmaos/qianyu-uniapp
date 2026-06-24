<template>
	<view class="user-profile-page">
		<view
			v-if="refreshHintState !== 'idle'"
			class="user-profile-refresh-cover"
			:style="refreshCoverStyle"
		>
			<view class="user-profile-refresh-indicator">
				<view v-if="refreshHintState === 'refreshing'" class="user-profile-refresh-spinner"></view>
				<text class="user-profile-refresh-text">{{ refreshIndicatorText }}</text>
			</view>
		</view>

		<PullPagingShell
			light-theme
			:refresher-enabled="false"
			refresher-background="transparent"
			refresher-default-style="none"
			:lower-threshold="pageConfig.lowerThresholdPx"
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
			<view class="user-profile-content">
				<view id="user-profile-top-anchor" class="user-profile-hero">
					<view class="user-profile-hero-main">
						<view class="user-profile-back-button" @tap="handleBack">
							<image class="user-profile-back-icon" :src="backIconSvg" mode="aspectFit"></image>
						</view>

						<view class="user-profile-avatar-shell">
							<view class="user-profile-avatar" :style="avatarStyle">
								<text v-if="avatarText" class="user-profile-avatar-text">{{ avatarText }}</text>
							</view>
						</view>

						<view class="user-profile-head">
							<view class="user-profile-name-row">
								<text class="user-profile-name">{{ profile.nickname }}</text>
								<text v-if="profile.vipLevel > 0" class="user-profile-vip">VIP{{ profile.vipLevel }}</text>
							</view>

							<view class="user-profile-meta-row">
								<text class="user-profile-display-id">ID：{{ profile.displayId }}</text>
								<view class="user-profile-relation-chip">{{ relationBadgeText }}</view>
								<view
									v-if="presenceText"
									:class="[
										'user-profile-presence-chip',
										profile.onlineState === 'online'
											? 'user-profile-presence-chip-online'
											: 'user-profile-presence-chip-offline'
									]"
								>
									{{ presenceText }}
								</view>
							</view>

							<text class="user-profile-signature">{{ profile.signature }}</text>
							<text class="user-profile-location">IP属地 · {{ profile.locationText }}</text>
							<view class="user-profile-vibe-row">
								<view v-for="item in vibeChipList" :key="item" class="user-profile-vibe-chip">
									{{ item }}
								</view>
							</view>
						</view>
					</view>

					<view class="user-profile-stats">
						<view v-for="item in statsList" :key="item.label" class="user-profile-stat-item">
							<text class="user-profile-stat-value">{{ item.value }}</text>
							<text class="user-profile-stat-label">{{ item.label }}</text>
						</view>
					</view>

					<view class="user-profile-actions">
						<view class="user-profile-primary-button" @tap="handleFollow">{{ followButtonText }}</view>
						<view v-if="showMessageButton" class="user-profile-secondary-button" @tap="handleMessage">
							私聊
						</view>
					</view>

					<view class="user-profile-resonance-strip">
						<view
							v-for="item in resonanceActionList"
							:key="item.key"
							class="user-profile-resonance-chip"
							@tap="handleResonance(item)"
						>
							{{ item.label }}
						</view>
					</view>
				</view>

				<view class="user-profile-tab-section">
					<UserContentTabBar
						:tab-list="displayTabList"
						:active-tab="activeTab"
						@change="handleTabChange"
					/>
				</view>

				<view id="user-profile-list-anchor" class="user-profile-list-section">
					<UserDynamicList
						v-if="activeTab === 'dynamic'"
						:row-list="dynamicRowList"
						:parent-scroll-top-px="parentScrollTopPx"
						:list-start-offset-px="listStartOffsetPx"
						active
						@item-click="handleDynamicItemClick"
					/>

					<UserWorkGrid
						v-else
						:row-list="workRowList"
						:parent-scroll-top-px="parentScrollTopPx"
						:list-start-offset-px="listStartOffsetPx"
						active
						@item-click="handleWorkItemClick"
					/>
				</view>
			</view>
		</PullPagingShell>
	</view>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import { buildMessageChatUrl } from '@/components/message/messageMock.js'
import UserContentTabBar from '@/components/user-center/main/UserContentTabBar.vue'
import UserDynamicList from '@/components/user-center/main/UserDynamicList.vue'
import UserWorkGrid from '@/components/user-center/main/UserWorkGrid.vue'
import { createMainTabPageState } from '@/components/user-center/userCenterMock.js'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { getUserInfo } from '@/core/user/UserService.js'
import { followUser, unfollowUser, fetchFollowRelation, fetchFollowCount } from '@/composables/useSocialApi.js'
import { fetchAuthorMomentList, adaptMomentToProfileItem } from '@/composables/useMomentApi.js'

const { safeTopPx, rpxToPx } = useSafeAreaMetrics()

const backIconSvg =
	"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M14.5 5 8 12l6.5 7' stroke='%230f172a' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"

const pageConfig = {
	lowerThresholdPx: 220,
	pageSize: 8,
	contentBottomPaddingRpx: 36,
	bottomPullSlotHeightRpx: 72,
	refreshRevealHeightRpx: 88,
	refreshSettleDurationMs: 180,
	bottomPullLoadedHoldMs: 420,
	bottomPullNoMoreHoldMs: 480,
	bottomPullReleaseDelayMs: 20,
	bottomPullCollapseDurationMs: 380
}

const profile = ref({
	userId: 'user-unknown',
	nickname: '好友',
	displayId: 'friend_1024',
	avatar: '',
	avatarText: '友',
	vipLevel: 0,
	signature: '',
	locationText: '',
	conversationId: '',
	onlineState: 'hidden',
	isFollowed: false,
	isMutualFollow: false,
	isFriend: false
})

const tabList = ref([
	{ key: 'dynamic', label: '动态' },
	{ key: 'works', label: '作品' }
])
const dynamicSourceList = ref([])
const workSourceList = ref([])
const userStats = ref({ likeCount: 0, followCount: 0, followerCount: 0 })

// ── API 加载函数 ──

async function loadUserProfile(userId) {
	if (!userId || userId === 'user-unknown') return
	const info = await getUserInfo(Number(userId))
	if (!info) return
	profile.value = {
		...profile.value,
		nickname: info.nickname || profile.value.nickname,
		avatar: info.avatar || '',
		avatarText: (info.nickname || '?')[0],
		signature: info.bio || '',
		locationText: [info.country, info.province, info.city].filter(Boolean).join(' · ') || ''
	}
}

async function loadFollowRelation(userId) {
	if (!userId || userId === 'user-unknown') return
	const numId = Number(userId)
	const [relation, counts] = await Promise.all([
		fetchFollowRelation(numId),
		fetchFollowCount(numId)
	])
	if (relation) {
		profile.value = {
			...profile.value,
			isFollowed: relation.follow,
			isMutualFollow: relation.follower,
			isFriend: relation.friend
		}
	}
	if (counts) {
		userStats.value = {
			...userStats.value,
			followCount: counts.followCount || 0,
			followerCount: counts.followerCount || 0
		}
	}
}

async function loadAuthorMoments(userId) {
	if (!userId || userId === 'user-unknown') return
	const res = await fetchAuthorMomentList(Number(userId))
	const items = res.datas.map(adaptMomentToProfileItem)
	dynamicSourceList.value = items
	workSourceList.value = items.filter(i => i.hasMedia)
	dynamicPage.value = 1
	workPage.value = 1
	dynamicNoMore.value = !res.hasMore
	workNoMore.value = !res.hasMore
}

function formatNum(num) {
	if (num == null || num === 0) return '0'
	const n = Number(num)
	if (n >= 10000) {
		return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
	}
	return String(n)
}
const activeTab = ref('dynamic')
const dynamicPage = ref(1)
const workPage = ref(1)
const dynamicNoMore = ref(dynamicSourceList.value.length <= pageConfig.pageSize)
const workNoMore = ref(workSourceList.value.length <= pageConfig.pageSize)
const tabLoadingKey = ref('')

const refreshing = ref(false)
const refreshHintState = ref('idle')
const refreshPullDistancePx = ref(0)
const refreshCoverTransitionMs = ref(0)
const loadingMore = ref(false)
const bottomPullState = ref('idle')
const bottomPullVisible = ref(false)
const bottomPullPendingRelease = ref(false)
const bottomPullRearmPending = ref(false)
const parentTouching = ref(false)
const parentScrollTopPx = ref(0)
const parentScrollTopValue = ref(0)
const listStartOffsetPx = ref(0)

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

const displayTabList = computed(() => {
	return tabList.value.map((item) => ({
		...item,
		loading: item.key === tabLoadingKey.value
	}))
})

const activeTabLabel = computed(() => {
	return tabList.value.find((item) => item.key === activeTab.value)?.label || '内容'
})

const displayDynamicList = computed(() => {
	return createMainTabPageState(dynamicSourceList.value, pageConfig.pageSize, dynamicPage.value)
})

const displayWorkList = computed(() => {
	return createMainTabPageState(workSourceList.value, pageConfig.pageSize, workPage.value)
})

const dynamicRowList = computed(() => buildRows(displayDynamicList.value, 2))
const workRowList = computed(() => buildRows(displayWorkList.value, 3))

const contentInnerStyle = computed(() => ({
	paddingBottom: `${pageConfig.contentBottomPaddingRpx + (bottomPullVisible.value ? pageConfig.bottomPullSlotHeightRpx : 0)}rpx`,
	background: 'transparent'
}))

const bottomPullSlotStyle = computed(() => ({
	height: bottomPullVisible.value ? `${pageConfig.bottomPullSlotHeightRpx}rpx` : '0rpx',
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	background: 'linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, #f8fafc 42%, #f8fafc 100%)'
}))

const refreshRevealDistancePx = rpxToPx(pageConfig.refreshRevealHeightRpx)

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

const avatarStyle = computed(() => {
	const avatarValue = `${profile.value.avatar || ''}`.trim()

	if (!avatarValue) {
		return {
			background: 'linear-gradient(135deg, rgba(255, 151, 174, 0.92) 0%, rgba(255, 196, 160, 0.92) 100%)'
		}
	}

	if (avatarValue.includes('gradient(')) {
		return {
			background: avatarValue
		}
	}

	return {
		backgroundImage: `url(${avatarValue})`,
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover'
	}
})

const avatarText = computed(() => {
	if (`${profile.value.avatar || ''}`.trim() && !`${profile.value.avatar || ''}`.includes('gradient(')) {
		return ''
	}

	return `${profile.value.avatarText || profile.value.nickname || '友'}`.slice(0, 2)
})

const relationBadgeText = computed(() => {
	if (profile.value.isFriend || profile.value.isMutualFollow) {
		return '互相关注'
	}

	if (profile.value.isFollowed) {
		return '已关注'
	}

	return '未关注'
})

const followButtonText = computed(() => {
	return profile.value.isFollowed ? relationBadgeText.value : '关注'
})

const showMessageButton = computed(() => {
	return profile.value.isFollowed
})

const presenceText = computed(() => {
	if (profile.value.onlineState === 'online') {
		return '在线'
	}

	if (profile.value.onlineState === 'offline') {
		return '离线'
	}

	return ''
})

const vibeChipList = computed(() => buildProfileVibeList(profile.value))

const resonanceActionList = computed(() => [
	{ key: 'same', label: '我也这样' },
	{ key: 'meet', label: profile.value.isFollowed ? '想继续认识' : '先触发共鸣' },
	{ key: 'join', label: '带我一个' }
])

const statsList = computed(() => {
	return [
		{ label: '获赞', value: formatNum(userStats.value.likeCount) },
		{ label: '关注', value: formatNum(userStats.value.followCount) },
		{ label: '粉丝', value: formatNum(userStats.value.followerCount) }
	]
})

onLoad(async (options) => {
	const userId = `${options.userId || ''}`.trim() || 'user-unknown'

	// 先设置基础信息（可能从路由参数传来）
	profile.value = {
		userId,
		nickname: decodeValue(options.nickname) || '',
		displayId: decodeValue(options.displayId) || buildDisplayId(userId),
		avatar: decodeValue(options.avatar) || '',
		avatarText: decodeValue(options.avatarText) || (decodeValue(options.nickname) || '?').slice(0, 2),
		vipLevel: normalizeVipLevel(options.vipLevel),
		signature: decodeValue(options.signature) || '',
		locationText: decodeValue(options.locationText) || '',
		conversationId: `${options.conversationId || ''}`.trim(),
		onlineState: normalizeOnlineState(options.onlineState),
		isFollowed: false,
		isMutualFollow: false,
		isFriend: false
	}

	// 并行加载用户信息、关注关系、动态列表
	await Promise.all([
		loadUserProfile(userId),
		loadFollowRelation(userId),
		loadAuthorMoments(userId)
	])

	scheduleMeasureListAnchor()
}))

onMounted(() => {
	scheduleMeasureListAnchor()
})

onBeforeUnmount(() => {
	resetTransientState()
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

async function handleFollow() {
	if (!profile.value.isFollowed) {
		try {
			await followUser(Number(profile.value.userId))
			profile.value = {
				...profile.value,
				isFollowed: true
			}
		} catch (e) {
			uni.showToast({ title: '关注失败', icon: 'none' })
		}
		return
	}

	uni.showModal({
		title: '取消关注',
		content: `确定不再关注 ${profile.value.nickname} 吗？`,
		success: async (result) => {
			if (!result.confirm) return
			try {
				await unfollowUser(Number(profile.value.userId))
				profile.value = {
					...profile.value,
					isFollowed: false,
					isMutualFollow: false,
					isFriend: false
				}
			} catch (e) {
				uni.showToast({ title: '取消失败', icon: 'none' })
			}
	}
	})
}

function handleMessage() {
	onMessage()
	if (!profile.value.conversationId) {
		uni.showToast({
			title: '私聊入口占位',
			icon: 'none'
		})
		return
	}

	uni.navigateTo({
		url: buildMessageChatUrl({
			conversationId: profile.value.conversationId
		})
	})
}

function handleResonance(actionItem) {
	onResonanceAction(actionItem)
	uni.showToast({
		title: `${actionItem.label}占位`,
		icon: 'none'
	})
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
}

function handleDynamicItemClick(item) {
	onDynamicItemClick(item)
	navigateByUrl(item.detailUrl)
}

function handleWorkItemClick(item) {
	onWorkItemClick(item)
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
	if (refreshing.value) {
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
			void handleParentRefresh()
		} else {
			settleRefreshCover(0, true)
		}
	}
	if (bottomPullPendingRelease.value) {
		scheduleBottomPullCollapse(pageConfig.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
	}
	refreshTouchStartY = 0
	refreshTouchStartScrollTop = 0
}

async function handleParentRefresh() {
	if (refreshing.value) {
		return
	}

	const requestId = ++refreshRequestId
	const tabKey = activeTab.value
	const refreshTask = createProfileTabRequestTask('refresh', tabKey)
	refreshing.value = true
	setTabLoadingState(tabKey)
	clearRefreshHintResetTimer()
	refreshHintState.value = 'refreshing'
	settleRefreshCover(refreshRevealDistancePx, false)
	resetBottomPullState(true)

	try {
		await Promise.resolve(onProfileRefresh(refreshTask.payload))
	} catch (error) {
		console.error('user-profile-refresh-error', error)
		refreshing.value = false
		clearTabLoadingState()
		settleRefreshCover(0, true)
		return
	}

	if (requestId !== refreshRequestId) {
		refreshing.value = false
		clearTabLoadingState()
		settleRefreshCover(0, true)
		return
	}

	if (!refreshTask.wasHandled()) {
	}

	refreshing.value = false
	clearTabLoadingState()
	settleRefreshCover(0, true)
}

async function handleParentReachLower() {
	if (refreshing.value || loadingMore.value || !canLoadMoreCurrentTab()) {
		return
	}

	const requestId = ++reachLowerRequestId
	const tabKey = activeTab.value
	const loadMoreTask = createProfileTabRequestTask('load-more', tabKey)
	setTabLoadingState(tabKey)
	loadingMore.value = true
	showBottomPullState('loading')

	try {
		await Promise.resolve(onProfileLoadMore(loadMoreTask.payload))
	} catch (error) {
		console.error('user-profile-load-more-error', error)
		loadingMore.value = false
		clearTabLoadingState()
		resetBottomPullState(true)
		return
	}

	if (requestId !== reachLowerRequestId) {
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
		requestBottomPullRebound(pageConfig.bottomPullNoMoreHoldMs)
		return
	}

	bottomPullState.value = 'loaded'
	requestBottomPullRebound(pageConfig.bottomPullLoadedHoldMs)
}

function canLoadMoreCurrentTab(tabKey = activeTab.value) {
	if (tabKey === 'dynamic') {
		return !dynamicNoMore.value
	}

	return !workNoMore.value
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

	const loadedCount = displayWorkList.value.length
	if (loadedCount >= workSourceList.value.length) {
		workNoMore.value = true
		return 'no-more'
	}

	workPage.value += 1
	workNoMore.value = displayWorkList.value.length >= workSourceList.value.length
	return 'loaded'
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
	}, pageConfig.bottomPullCollapseDurationMs)
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
		}, pageConfig.bottomPullCollapseDurationMs)
	}, delayMs)
}

function requestBottomPullRebound(delayMs) {
	if (parentTouching.value) {
		bottomPullPendingRelease.value = true
		bottomPullRearmPending.value = true
		bottomPullFallbackTimer = setTimeout(() => {
			parentTouching.value = false
			if (bottomPullPendingRelease.value) {
				scheduleBottomPullCollapse(pageConfig.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
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

function createProfileTabRequestTask(action, tabKey) {
	const state = {
		handled: false,
		status: action === 'load-more' ? 'loaded' : 'refreshed'
	}

	const payload = {
		userId: profile.value.userId,
		tabKey,
		tabLabel: resolveTabLabel(tabKey),
		requestType: action,
		updateMode: action === 'refresh' ? 'replace' : 'append',
		pageSize: pageConfig.pageSize,
		currentPage: resolveTabPage(tabKey),
		requestPage: action === 'refresh' ? 1 : resolveTabPage(tabKey) + 1,
		renderedList: cloneTabList(resolveRenderedTabList(tabKey)),
		sourceList: cloneTabList(resolveTabSourceList(tabKey)),
		applyReplace: (nextList = [], options = {}) => {
			state.handled = true
			state.status = 'refreshed'
			replaceProfileTabData(tabKey, nextList, options)
		},
		applyAppend: (nextList = [], options = {}) => {
			state.handled = true
			state.status = 'loaded'
			appendProfileTabData(tabKey, nextList, options)
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
	return tabKey === 'dynamic' ? dynamicPage.value : workPage.value
}

function resolveTabSourceList(tabKey) {
	return tabKey === 'dynamic' ? dynamicSourceList.value : workSourceList.value
}

function resolveRenderedTabList(tabKey) {
	return tabKey === 'dynamic' ? displayDynamicList.value : displayWorkList.value
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

	return nextList.length < pageConfig.pageSize
}

function setTabSourceList(tabKey, nextList = []) {
	const clonedList = cloneTabList(Array.isArray(nextList) ? nextList : [])
	if (tabKey === 'dynamic') {
		dynamicSourceList.value = clonedList
		return
	}

	workSourceList.value = clonedList
}

function setTabNoMore(tabKey, nextValue) {
	if (tabKey === 'dynamic') {
		dynamicNoMore.value = Boolean(nextValue)
		return
	}

	workNoMore.value = Boolean(nextValue)
}

function replaceProfileTabData(tabKey, nextList = [], options = {}) {
	setTabSourceList(tabKey, nextList)
	if (tabKey === 'dynamic') {
		dynamicPage.value = 1
		setTabNoMore(tabKey, inferTabNoMore(nextList, options))
		return
	}

	workPage.value = 1
	setTabNoMore(tabKey, inferTabNoMore(nextList, options))
}

function appendProfileTabData(tabKey, nextList = [], options = {}) {
	const appendList = cloneTabList(Array.isArray(nextList) ? nextList : [])
	if (tabKey === 'dynamic') {
		dynamicSourceList.value = [...dynamicSourceList.value, ...appendList]
		dynamicPage.value += 1
		setTabNoMore(tabKey, inferTabNoMore(appendList, options))
		return
	}

	workSourceList.value = [...workSourceList.value, ...appendList]
	workPage.value += 1
	setTabNoMore(tabKey, inferTabNoMore(appendList, options))
}

mPullCollapseTimer = null
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

function resolveBottomPullFallbackDelay(delayMs) {
	return Math.max(Number(delayMs) || 0, pageConfig.bottomPullNoMoreHoldMs) + 120
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
	refreshCoverTransitionMs.value = pageConfig.refreshSettleDurationMs
	refreshPullDistancePx.value = distancePx
	if (resetState) {
		resetRefreshHint(pageConfig.refreshSettleDurationMs)
	}
}

function shouldTriggerCustomRefresh() {
	return refreshPullDistancePx.value >= refreshRevealDistancePx * 0.96
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
		.select('#user-profile-list-anchor')
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

function getTouchClientY(event) {
	return (
		Number(event?.touches?.[0]?.clientY ?? event?.changedTouches?.[0]?.clientY ?? event?.detail?.y ?? 0) || 0
	)
}

w-change', profile.value.userId, nextState)
}

function onMessage() {
	// TODO：替换好友资料私聊入口逻辑
	console.log('user-profile-message', profile.value.userId, profile.value.conversationId)
}

function onResonanceAction(actionItem) {
	// TODO：替换好友资料页触发共鸣逻辑
	console.log('user-profile-resonance-action', profile.value.userId, actionItem.key)
}

function onTabChange(tabItem) {
	// TODO：替换好友资料内容 Tab 切换逻辑
	console.log('user-profile-tab-change', tabItem.key)
}

function onTabRepeat(tabItem) {
	// TODO：替换好友资料内容 Tab 重复点击逻辑
	console.log('user-profile-tab-repeat', tabItem.key)
}

function onDynamicItemClick(item) {
	// TODO：替换好友资料动态点击逻辑
	console.log('user-profile-dynamic-click', item.id, item.contentType)
}

function onWorkItemClick(item) {
	// TODO：替换好友资料作品点击逻辑
	console.log('user-profile-work-click', item.id)
}

async function onProfileRefresh(payload) {
	const numId = Number(payload.userId)
	if (!numId) { payload.markNoMore(); return }
	const res = await fetchAuthorMomentList(numId)
	const items = res.datas.map(adaptMomentToProfileItem)
	if (items.length) {
		payload.applyReplace(items, { hasMore: res.hasMore })
		// 同步作品列表
		workSourceList.value = items.filter(i => i.hasMedia)
		workPage.value = 1
		workNoMore.value = !res.hasMore
	} else {
		payload.markNoMore()
	}
}

async function onProfileLoadMore(payload) {
	const currentList = payload.renderedList
	const lastItem = currentList[currentList.length - 1]
	// 用上一条的 momentId 作为游标
	const reqMomentId = lastItem ? Number(lastItem.id) : undefined
	const res = await fetchAuthorMomentList(Number(payload.userId), reqMomentId)
	const items = res.datas.map(adaptMomentToProfileItem)
	if (items.length) {
		payload.applyAppend(items, { hasMore: res.hasMore })
		// 同步作品列表
		const newWorks = items.filter(i => i.hasMedia)
		workSourceList.value = [...workSourceList.value, ...newWorks]
		workPage.value += 1
		if (!res.hasMore) workNoMore.value = true
	} else {
		payload.markNoMore()
	}
}

function buildProfileVibeList(profileInfo = {}) {
	return [
		profileInfo.isFriend || profileInfo.isMutualFollow ? '互相看见' : '慢慢靠近',
		profileInfo.onlineState === 'online' ? '今晚在线' : profileInfo.onlineState === 'offline' ? '最近来过' : '先被发现',
		profileInfo.isFollowed ? '可继续认识' : '适合先共鸣'
	]
}

function normalizeVipLevel(value) {
	const vipLevel = Number(value) || 0
	return vipLevel > 0 ? Math.min(Math.floor(vipLevel), 10) : 0
}

function normalizeOnlineState(value) {
	const onlineState = `${value || ''}`.trim()
	if (onlineState === 'online' || onlineState === 'offline') {
		return onlineState
	}

	return 'hidden'
}

function decodeValue(value) {
	return decodeURIComponent(`${value || ''}`.trim())
}

function buildDisplayId(userId) {
	return `${userId || 'friend'}`
		.replace(/[^a-zA-Z0-9_]/g, '')
		.slice(0, 12)
		.toLowerCase() || 'friend_1024'
}

 0;
	left: 0;
	z-index: 12;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	box-sizing: border-box;
	pointer-events: none;
}

.user-profile-refresh-indicator {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 240rpx;
	height: 64rpx;
	padding: 0 24rpx;
	margin-bottom: 12rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.88);
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.12);
	backdrop-filter: blur(24rpx);
	-webkit-backdrop-filter: blur(24rpx);
}

.user-profile-refresh-spinner {
	width: 24rpx;
	height: 24rpx;
	margin-right: 12rpx;
	border: 4rpx solid rgba(17, 24, 39, 0.08);
	border-top-color: rgba(255, 151, 174, 0.82);
	border-radius: 50%;
	animation: user-profile-refresh-spin 0.8s linear infinite;
}

.user-profile-refresh-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.user-profile-content {
	min-height: 100%;
	padding: 128rpx 24rpx 24rpx;
	box-sizing: border-box;
}

.user-profile-hero {
	position: relative;
}

.user-profile-hero-main {
	display: flex;
	align-items: flex-start;
}

.user-profile-avatar-shell {
	position: relative;
	width: 176rpx;
	height: 176rpx;
	margin-left: 20rpx;
	flex-shrink: 0;
}

.user-profile-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 176rpx;
	height: 176rpx;
	border-radius: 54rpx;
	box-shadow: 0 20rpx 38rpx rgba(255, 171, 191, 0.18);
}

.user-profile-avatar-text {
	font-size: 60rpx;
	font-weight: 700;
	line-height: 1;
	color: #ffffff;
}

.user-profile-back-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 62rpx;
	height: 62rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.76);
	box-shadow: 0 12rpx 24rpx rgba(255, 171, 191, 0.12);
	backdrop-filter: blur(18rpx);
	-webkit-backdrop-filter: blur(18rpx);
	flex-shrink: 0;
}

.user-profile-back-icon {
	width: 28rpx;
	height: 28rpx;
}

.user-profile-head {
	flex: 1;
	min-width: 0;
	margin-left: 24rpx;
	padding-top: 10rpx;
}

.user-profile-name-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12rpx;
}

.user-profile-name {
	max-width: 100%;
	font-size: 42rpx;
	font-weight: 700;
	line-height: 54rpx;
	color: #0f172a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-profile-vip {
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #ffffff;
}

.user-profile-meta-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 14rpx;
}

.user-profile-display-id,
.user-profile-signature,
.user-profile-location {
	color: #667085;
}

.user-profile-display-id {
	font-size: 22rpx;
	line-height: 32rpx;
}

.user-profile-relation-chip,
.user-profile-presence-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 38rpx;
	padding: 0 14rpx;
	border-radius: 999rpx;
	font-size: 18rpx;
	font-weight: 600;
	line-height: 24rpx;
}

.user-profile-relation-chip {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.14) 0%, rgba(255, 196, 160, 0.2) 100%);
	color: #d94f7b;
}

.user-profile-presence-chip-online {
	background: rgba(34, 197, 94, 0.12);
	color: #16a34a;
}

.user-profile-presence-chip-offline {
	background: rgba(148, 163, 184, 0.12);
	color: #64748b;
}

.user-profile-signature {
	display: block;
	margin-top: 18rpx;
	font-size: 24rpx;
	line-height: 38rpx;
}

.user-profile-location {
	display: block;
	margin-top: 12rpx;
	font-size: 22rpx;
	line-height: 32rpx;
}

.user-profile-vibe-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 16rpx;
}

.user-profile-vibe-chip,
.user-profile-resonance-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 999rpx;
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
}

.user-profile-vibe-chip {
	height: 42rpx;
	padding: 0 14rpx;
	background: rgba(255, 255, 255, 0.76);
	color: #475467;
}

.user-profile-stats {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 30rpx;
	padding: 22rpx 0 0;
}

.user-profile-stat-item {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: flex-start;
}

.user-profile-stat-value {
	font-size: 36rpx;
	font-weight: 700;
	line-height: 46rpx;
	color: #0f172a;
}

.user-profile-stat-label {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.user-profile-actions {
	display: flex;
	align-items: center;
	gap: 18rpx;
	margin-top: 24rpx;
}

.user-profile-primary-button,
.user-profile-secondary-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 84rpx;
	border-radius: 999rpx;
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
}

.user-profile-primary-button {
	flex: 1;
	background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
	color: #ffffff;
}

.user-profile-secondary-button {
	min-width: 180rpx;
	padding: 0 28rpx;
	background: rgba(255, 255, 255, 0.72);
	box-shadow: 0 12rpx 24rpx rgba(255, 171, 191, 0.12);
	backdrop-filter: blur(18rpx);
	-webkit-backdrop-filter: blur(18rpx);
	color: #0f172a;
}

.user-profile-resonance-strip {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
}

.user-profile-resonance-chip {
	height: 54rpx;
	padding: 0 20rpx;
	background: rgba(248, 250, 252, 0.96);
	color: #475467;
}

.user-profile-tab-section {
	margin-top: 28rpx;
}

.user-profile-list-section {
	margin-top: 22rpx;
}

@keyframes user-profile-refresh-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
