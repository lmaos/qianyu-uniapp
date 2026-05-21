<template>
	<view class="message-page">
		<view v-if="refreshHintState !== 'idle'" class="message-refresh-cover" :style="refreshCoverStyle">
			<view class="message-refresh-indicator">
				<view v-if="refreshHintState === 'refreshing'" class="message-refresh-spinner"></view>
				<text class="message-refresh-text">{{ refreshIndicatorText }}</text>
			</view>
		</view>

		<PullPagingShell
			light-theme
			:refresher-enabled="false"
			refresher-background="transparent"
			refresher-default-style="none"
			:lower-threshold="messagePageConfig.lowerThresholdPx"
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
			<view class="message-content" @tap="handleContentTap">
				<view class="message-hero">
					<view class="message-hero-top">
						<view>
							<text class="message-page-title">{{ pageMock.title }}</text>
							<text class="message-page-subtitle">联系人与聊天</text>
						</view>

						<view class="message-notice-chip" @tap.stop="handleMessageBadgeClick">
							<text class="message-notice-chip-label">{{ pageMock.messageBadge.label }}</text>
							<view class="message-notice-chip-count">{{ pageMock.messageBadge.value }}</view>
						</view>
					</view>

					<view class="message-search" @tap.stop="handleSearchClick">
						<text class="message-search-icon">搜</text>
						<text class="message-search-text">{{ pageMock.searchPlaceholder }}</text>
					</view>
				</view>

				<view class="message-contact-section">
					<view class="message-section-head">
						<text class="message-section-title">常用联系人</text>
						<view class="message-section-more" @tap.stop="handleContactMoreClick">全部</view>
					</view>

					<scroll-view class="message-contact-scroll" scroll-x show-scrollbar="false">
						<view class="message-contact-row">
							<view
								v-for="item in pageMock.contactList"
								:key="item.id"
								class="message-contact-card"
								@tap.stop="handleContactClick(item)"
							>
								<view class="message-contact-avatar-shell">
									<view class="message-contact-avatar" :style="{ background: item.avatarBackground }">
										{{ item.avatarText }}
									</view>
									<view
										v-if="item.hasNewMessage && !item.hasMomentUpdate"
										class="message-contact-badge-unread"
									></view>
									<view v-if="item.onlineState === 'online'" class="message-contact-badge-online"></view>
									<view
										v-if="item.hasMomentUpdate"
										class="message-contact-moment-bubble"
										@tap.stop="handleContactMomentClick(item)"
									>
										动态
									</view>
								</view>
								<text class="message-contact-name">{{ item.name }}</text>
							</view>
						</view>
					</scroll-view>
				</view>

				<view class="message-list-section">
					<view class="message-section-head">
						<text class="message-section-title">聊天列表</text>
						<text class="message-section-count">{{ conversationList.length }} 条</text>
					</view>

					<view
						v-for="item in conversationList"
						:key="item.id"
						class="message-conversation-shell"
						@touchstart="handleConversationTouchStart(item, $event)"
						@touchmove="handleConversationTouchMove(item, $event)"
						@touchend="handleConversationTouchEnd(item)"
						@touchcancel="handleConversationTouchEnd(item)"
					>
						<view class="message-conversation-actions">
							<view class="message-conversation-delete" @tap.stop="handleConversationDelete(item)">删除</view>
						</view>

						<view
							:class="['message-conversation-card', item.pinned ? 'message-conversation-card-pinned' : '']"
							:style="getConversationTrackStyle(item.id)"
							@tap.stop="handleConversationCardClick(item)"
						>
							<view class="message-conversation-avatar-shell">
								<view class="message-conversation-avatar" :style="{ background: item.avatarBackground }">
									{{ item.avatarText }}
								</view>
								<view
									v-if="item.onlineState !== 'hidden'"
									:class="[
										'message-presence-dot',
										item.onlineState === 'online' ? 'message-presence-dot-online' : 'message-presence-dot-offline'
									]"
								></view>
							</view>

							<view class="message-conversation-main">
								<view class="message-conversation-top">
									<view class="message-conversation-title-row">
										<text class="message-conversation-name">{{ item.name }}</text>
										<text v-if="item.tagText" class="message-conversation-tag">{{ item.tagText }}</text>
									</view>
									<text class="message-conversation-time">{{ item.timeText }}</text>
								</view>

								<view class="message-conversation-bottom">
									<text class="message-conversation-preview">{{ item.preview }}</text>
									<view class="message-conversation-meta">
										<image
											v-if="item.muted"
											class="message-conversation-muted-icon"
											:src="muteIconSvg"
											mode="aspectFit"
										></image>
										<view v-if="item.unreadCount" class="message-conversation-unread">{{ item.unreadCount }}</view>
									</view>
								</view>
							</view>
						</view>
					</view>

					<view v-if="!conversationList.length" class="message-empty-card">
						<text class="message-empty-text">暂无聊天内容</text>
					</view>

					<view class="message-mock-card">
						<text class="message-mock-title">Mock 说明</text>
						<text class="message-mock-text">{{ pageMock.mockNotice }}</text>
					</view>
				</view>
			</view>
		</PullPagingShell>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import {
	buildMessageChatUrl,
	buildMessageContactListUrl,
	buildMessagePageMock,
	buildMessageSearchUrl,
	buildMessageUserProfileUrl
} from '@/components/message/messageMock.js'

const pageMock = buildMessagePageMock()
const { safeTopPx, rpxToPx } = useSafeAreaMetrics()
const muteIconSvg =
	"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M10.5 8.5 14.2 5.6a.8.8 0 0 1 1.3.64v11.52a.8.8 0 0 1-1.3.64l-3.7-2.88H7.8A1.8 1.8 0 0 1 6 13.72v-3.44A1.8 1.8 0 0 1 7.8 8.5h2.7Z' fill='%2398A2B3'/%3E%3Cpath d='m18 9 3 6M21 9l-3 6' stroke='%2398A2B3' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E"

const messagePageConfig = {
	pageSize: 6,
	lowerThresholdPx: 220,
	contentBottomPaddingRpx: 36,
	bottomPullSlotHeightRpx: 72,
	refreshRevealHeightRpx: 88,
	refreshSettleDurationMs: 180,
	minRefreshLoadingMs: 420,
	refreshSuccessHoldMs: 320,
	minLoadMoreLoadingMs: 420,
	bottomPullLoadedHoldMs: 420,
	bottomPullNoMoreHoldMs: 480,
	bottomPullReleaseDelayMs: 20,
	bottomPullCollapseDurationMs: 380,
	deleteActionWidthRpx: 148
}

const conversationMockPool = ref([...pageMock.conversationSourceList])
const conversationPage = ref(1)
const conversationList = ref(conversationMockPool.value.slice(0, messagePageConfig.pageSize))
const conversationNoMore = ref(conversationList.value.length >= conversationMockPool.value.length)

const refreshing = ref(false)
const loadingMore = ref(false)
const refreshHintState = ref('idle')
const refreshPullDistancePx = ref(0)
const refreshCoverTransitionMs = ref(0)
const bottomPullState = ref('idle')
const bottomPullVisible = ref(false)
const parentScrollTopPx = ref(0)

const swipedConversationId = ref('')
const swipingConversationId = ref('')
const swipeTranslateX = ref(0)
const deletingConversationId = ref('')

let refreshTouchStartY = 0
let refreshTouchStartScrollTop = 0
let refreshPullTracking = false
let refreshHintResetTimer = null
let bottomPullResetTimer = null
let bottomPullCollapseTimer = null
let bottomPullFallbackTimer = null
let refreshRequestId = 0
let reachLowerRequestId = 0
let swipeStartX = 0
let swipeStartY = 0
let swipeBaseOffsetX = 0
let swipeLockedAxis = ''

const deleteActionWidthPx = computed(() => rpxToPx(messagePageConfig.deleteActionWidthRpx))
const refreshRevealDistancePx = computed(() => rpxToPx(messagePageConfig.refreshRevealHeightRpx))
const refreshIndicatorText = computed(() => {
	if (refreshHintState.value === 'ready') {
		return '松手刷新消息'
	}

	if (refreshHintState.value === 'refreshing') {
		return '正在刷新消息...'
	}

	if (refreshHintState.value === 'refreshed') {
		return '消息已更新'
	}

	return '下拉刷新消息'
})
const contentInnerStyle = computed(() => ({
	paddingBottom: `${messagePageConfig.contentBottomPaddingRpx + (bottomPullVisible.value ? messagePageConfig.bottomPullSlotHeightRpx : 0)}rpx`
}))
const bottomPullSlotStyle = computed(() => ({
	height: bottomPullVisible.value ? `${messagePageConfig.bottomPullSlotHeightRpx}rpx` : '0rpx',
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	background: 'linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, #f8fafc 42%, #f8fafc 100%)'
}))
const refreshCoverStyle = computed(() => {
	const revealDistance = Math.max(1, Number(refreshRevealDistancePx.value || 0))
	const keepVisible = ['refreshing', 'refreshed'].includes(refreshHintState.value)
	const offsetPx =
		keepVisible
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
		opacity: keepVisible ? 1 : Math.min(1, Number(refreshPullDistancePx.value || 0) / revealDistance)
	}
})

function handleParentScroll(event) {
	parentScrollTopPx.value = Number(event?.detail?.scrollTop || 0)
	if (swipedConversationId.value) {
		closeSwipe()
	}
}

function handleParentTouchStart(event) {
	if (refreshing.value || loadingMore.value) {
		return
	}

	clearRefreshHintResetTimer()
	refreshTouchStartY = Number(event?.changedTouches?.[0]?.clientY || 0)
	refreshTouchStartScrollTop = parentScrollTopPx.value
	refreshPullTracking = refreshTouchStartScrollTop <= 2
	refreshCoverTransitionMs.value = 0
}

function handleParentTouchMove(event) {
	if (!refreshPullTracking || refreshing.value || refreshTouchStartScrollTop > 2) {
		return
	}

	const currentY = Number(event?.changedTouches?.[0]?.clientY || 0)
	const pullDistance = Math.max(0, currentY - refreshTouchStartY)
	if (!pullDistance) {
		refreshPullDistancePx.value = 0
		refreshHintState.value = 'idle'
		return
	}

	clearRefreshHintResetTimer()
	refreshPullDistancePx.value = Math.min(pullDistance, Number(refreshRevealDistancePx.value || 0) * 1.6)
	refreshHintState.value = shouldTriggerCustomRefresh() ? 'ready' : 'pulling'
}

function handleParentTouchEnd() {
	if (!refreshPullTracking) {
		return
	}

	refreshPullTracking = false
	const shouldRefresh = refreshPullDistancePx.value >= Number(refreshRevealDistancePx.value || 0)
	if (!shouldRefresh) {
		resetRefreshHint()
		return
	}

	void triggerRefresh()
}

async function triggerRefresh() {
	if (refreshing.value) {
		return
	}

	closeSwipe()
	const requestId = ++refreshRequestId
	const requestStartAt = Date.now()
	refreshing.value = true
	clearRefreshHintResetTimer()
	resetBottomPullState(true)
	refreshHintState.value = 'refreshing'
	refreshCoverTransitionMs.value = messagePageConfig.refreshSettleDurationMs
	refreshPullDistancePx.value = Number(refreshRevealDistancePx.value || 0)

	const payload = createMessageRefreshPayload()
	let refreshSucceeded = false

	try {
		const result = await Promise.resolve(onMessageRefresh(payload))
		await ensureMinimumLoadingTime(requestStartAt, messagePageConfig.minRefreshLoadingMs)
		if (requestId !== refreshRequestId) {
			return
		}

		if (!payload.applied && result !== false) {
			payload.applyReplace(conversationMockPool.value.slice(0, messagePageConfig.pageSize), {
				hasMore: conversationMockPool.value.length > messagePageConfig.pageSize
			})
		}
		refreshSucceeded = true
	} catch (error) {
		console.log('message-refresh-error', error)
		await ensureMinimumLoadingTime(requestStartAt, messagePageConfig.minRefreshLoadingMs)
	} finally {
		if (requestId !== refreshRequestId) {
			return
		}

		refreshing.value = false
		refreshCoverTransitionMs.value = messagePageConfig.refreshSettleDurationMs
		refreshPullDistancePx.value = 0
		if (refreshSucceeded) {
			refreshHintState.value = 'refreshed'
			resetRefreshHint(messagePageConfig.refreshSuccessHoldMs)
			return
		}

		refreshHintState.value = 'pulling'
		resetRefreshHint()
	}
}

async function handleParentReachLower() {
	if (refreshing.value || loadingMore.value) {
		return { status: 'busy' }
	}

	if (conversationNoMore.value) {
		showBottomPullState('no-more')
		requestBottomPullRebound(messagePageConfig.bottomPullNoMoreHoldMs)
		return { status: 'no-more' }
	}

	closeSwipe()
	const requestId = ++reachLowerRequestId
	const requestStartAt = Date.now()
	loadingMore.value = true
	showBottomPullState('loading')

	const payload = createMessageLoadMorePayload()

	try {
		const result = await Promise.resolve(onMessageLoadMore(payload))
		await ensureMinimumLoadingTime(requestStartAt, messagePageConfig.minLoadMoreLoadingMs)
		if (requestId !== reachLowerRequestId) {
			return { status: 'busy' }
		}

		if (!payload.applied && !payload.noMoreMarked && result !== false) {
			const nextList = conversationMockPool.value.slice(
				conversationList.value.length,
				conversationList.value.length + messagePageConfig.pageSize
			)
			if (!nextList.length) {
				payload.markNoMore()
			} else {
				payload.applyAppend(nextList, {
					hasMore: conversationList.value.length + nextList.length < conversationMockPool.value.length
				})
			}
		}

		if (payload.noMoreMarked) {
			showBottomPullState('no-more')
			requestBottomPullRebound(messagePageConfig.bottomPullNoMoreHoldMs)
			return { status: 'no-more' }
		}

		if (payload.applied) {
			showBottomPullState('loaded')
			requestBottomPullRebound(messagePageConfig.bottomPullLoadedHoldMs)
			return { status: 'loaded' }
		}

		if (conversationNoMore.value) {
			showBottomPullState('no-more')
			requestBottomPullRebound(messagePageConfig.bottomPullNoMoreHoldMs)
			return { status: 'no-more' }
		}

		showBottomPullState('loaded')
		requestBottomPullRebound(messagePageConfig.bottomPullLoadedHoldMs)
		return { status: 'loaded' }
	} catch (error) {
		console.log('message-load-more-error', error)
		await ensureMinimumLoadingTime(requestStartAt, messagePageConfig.minLoadMoreLoadingMs)
		if (requestId === reachLowerRequestId) {
			resetBottomPullState()
		}
		return { status: 'busy' }
	} finally {
		if (requestId === reachLowerRequestId) {
			loadingMore.value = false
		}
	}
}

function createMessageRefreshPayload() {
	const payload = {
		applied: false,
		pageSize: messagePageConfig.pageSize,
		currentList: conversationList.value.map((item) => ({ ...item })),
		sourceList: conversationMockPool.value.map((item) => ({ ...item })),
		applyReplace(nextList = [], options = {}) {
			payload.applied = true
			conversationPage.value = 1
			conversationList.value = [...nextList]
			conversationNoMore.value =
				typeof options.hasMore === 'boolean' ? !options.hasMore : nextList.length < messagePageConfig.pageSize
		}
	}
	return payload
}

function createMessageLoadMorePayload() {
	const payload = {
		applied: false,
		noMoreMarked: false,
		pageSize: messagePageConfig.pageSize,
		page: conversationPage.value + 1,
		currentList: conversationList.value.map((item) => ({ ...item })),
		applyAppend(nextList = [], options = {}) {
			payload.applied = true
			conversationPage.value += 1
			conversationList.value = [...conversationList.value, ...nextList]
			conversationNoMore.value =
				typeof options.hasMore === 'boolean'
					? !options.hasMore
					: nextList.length < messagePageConfig.pageSize
		},
		markNoMore() {
			payload.noMoreMarked = true
			conversationNoMore.value = true
		}
	}
	return payload
}

function handleContentTap() {
	if (swipedConversationId.value) {
		closeSwipe()
	}
}

function handleMessageBadgeClick() {
	onMessageBadgeClick(pageMock.messageBadge)
}

function handleSearchClick() {
	onSearchClick()
	uni.navigateTo({
		url: buildMessageSearchUrl()
	})
}

function handleContactClick(item) {
	onContactClick(item)
	uni.navigateTo({
		url: buildMessageChatUrl(item)
	})
}

function handleContactMomentClick(item) {
	onContactMomentClick(item)
	uni.navigateTo({
		url: buildMessageUserProfileUrl(item)
	})
}

function handleContactMoreClick() {
	onContactMoreClick()
	uni.navigateTo({
		url: buildMessageContactListUrl()
	})
}

function handleConversationCardClick(item) {
	if (swipedConversationId.value) {
		closeSwipe()
		return
	}

	onConversationClick(item)
	uni.navigateTo({
		url: buildMessageChatUrl(item)
	})
}

function handleConversationTouchStart(item, event) {
	if (deletingConversationId.value) {
		return
	}

	if (swipedConversationId.value && swipedConversationId.value !== item.id) {
		closeSwipe()
	}

	swipeStartX = Number(event?.changedTouches?.[0]?.clientX || 0)
	swipeStartY = Number(event?.changedTouches?.[0]?.clientY || 0)
	swipeBaseOffsetX = swipedConversationId.value === item.id ? -deleteActionWidthPx.value : 0
	swipeLockedAxis = ''
	swipingConversationId.value = item.id
	swipeTranslateX.value = swipeBaseOffsetX
}

function handleConversationTouchMove(item, event) {
	if (swipingConversationId.value !== item.id || deletingConversationId.value) {
		return
	}

	const currentX = Number(event?.changedTouches?.[0]?.clientX || 0)
	const currentY = Number(event?.changedTouches?.[0]?.clientY || 0)
	const deltaX = currentX - swipeStartX
	const deltaY = currentY - swipeStartY

	if (!swipeLockedAxis) {
		swipeLockedAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y'
	}

	if (swipeLockedAxis !== 'x') {
		return
	}

	const nextOffsetX = Math.min(0, Math.max(-deleteActionWidthPx.value, swipeBaseOffsetX + deltaX))
	swipeTranslateX.value = nextOffsetX
}

function handleConversationTouchEnd(item) {
	if (swipingConversationId.value !== item.id) {
		return
	}

	if (swipeLockedAxis !== 'x') {
		swipingConversationId.value = ''
		swipeTranslateX.value = 0
		return
	}

	const shouldOpen = Math.abs(swipeTranslateX.value) > deleteActionWidthPx.value / 2
	swipedConversationId.value = shouldOpen ? item.id : ''
	swipingConversationId.value = ''
	swipeTranslateX.value = 0
}

function getConversationTrackStyle(conversationId) {
	const offsetPx =
		swipingConversationId.value === conversationId
			? swipeTranslateX.value
			: swipedConversationId.value === conversationId
				? -deleteActionWidthPx.value
				: 0

	return {
		transform: `translateX(${offsetPx}px)`,
		transition: swipingConversationId.value === conversationId ? 'none' : 'transform 220ms ease'
	}
}

async function handleConversationDelete(item) {
	if (deletingConversationId.value) {
		return
	}

	deletingConversationId.value = item.id
	const payload = {
		item: { ...item },
		currentList: conversationList.value.map((currentItem) => ({ ...currentItem }))
	}

	try {
		const result = await Promise.resolve(onConversationDelete(payload))
		if (result === false) {
			closeSwipe()
			return
		}

		removeConversation(item.id)
		closeSwipe()
	} catch (error) {
		console.log('message-conversation-delete-error', error)
		uni.showToast({
			title: '删除失败',
			icon: 'none'
		})
		closeSwipe()
	} finally {
		deletingConversationId.value = ''
	}
}

function removeConversation(conversationId) {
	conversationMockPool.value = conversationMockPool.value.filter((item) => item.id !== conversationId)
	const desiredCount = Math.min(conversationPage.value * messagePageConfig.pageSize, conversationMockPool.value.length)
	conversationList.value = conversationMockPool.value.slice(0, desiredCount)
	conversationPage.value = Math.max(1, Math.ceil(conversationList.value.length / messagePageConfig.pageSize) || 1)
	conversationNoMore.value = conversationList.value.length >= conversationMockPool.value.length
}

function closeSwipe() {
	swipedConversationId.value = ''
	swipingConversationId.value = ''
	swipeTranslateX.value = 0
}

function showBottomPullState(state) {
	clearBottomPullTimers()
	bottomPullVisible.value = true
	bottomPullState.value = state
}

function requestBottomPullRebound(delayMs) {
	clearBottomPullTimers()
	bottomPullResetTimer = setTimeout(() => {
		bottomPullResetTimer = null
		resetBottomPullState()
	}, delayMs)
}

function resetBottomPullState(immediate = false) {
	clearBottomPullTimers()
	if (immediate) {
		bottomPullVisible.value = false
		bottomPullState.value = 'idle'
		return
	}

	bottomPullVisible.value = false
	bottomPullCollapseTimer = setTimeout(() => {
		bottomPullState.value = 'idle'
		bottomPullCollapseTimer = null
	}, messagePageConfig.bottomPullCollapseDurationMs)
}

function clearBottomPullTimers() {
	if (bottomPullResetTimer) {
		clearTimeout(bottomPullResetTimer)
		bottomPullResetTimer = null
	}

	if (bottomPullCollapseTimer) {
		clearTimeout(bottomPullCollapseTimer)
		bottomPullCollapseTimer = null
	}

	if (bottomPullFallbackTimer) {
		clearTimeout(bottomPullFallbackTimer)
		bottomPullFallbackTimer = null
	}
}

function clearRefreshHintResetTimer() {
	if (refreshHintResetTimer) {
		clearTimeout(refreshHintResetTimer)
		refreshHintResetTimer = null
	}
}

function resetRefreshHint(delayMs = messagePageConfig.refreshSettleDurationMs) {
	clearRefreshHintResetTimer()
	refreshCoverTransitionMs.value = messagePageConfig.refreshSettleDurationMs
	refreshPullDistancePx.value = 0
	refreshHintResetTimer = setTimeout(() => {
		refreshHintState.value = 'idle'
		refreshHintResetTimer = null
	}, delayMs)
}

function shouldTriggerCustomRefresh() {
	return refreshPullDistancePx.value >= Number(refreshRevealDistancePx.value || 0) * 0.96
}

function ensureMinimumLoadingTime(startAt, minimumDurationMs) {
	const elapsedMs = Date.now() - startAt
	const waitMs = Math.max(0, Number(minimumDurationMs || 0) - elapsedMs)
	if (!waitMs) {
		return Promise.resolve()
	}

	return new Promise((resolve) => {
		setTimeout(resolve, waitMs)
	})
}

function onMessageBadgeClick(messageBadge) {
	// TODO：替换消息提醒入口逻辑
	console.log('message-badge-click', messageBadge.label, messageBadge.value)
}

function onSearchClick() {
	// TODO：替换消息页搜索入口逻辑
	console.log('message-search-click')
}

function onContactClick(item) {
	// TODO：替换联系人点击逻辑
	console.log('message-contact-click', item.id)
}

function onContactMomentClick(item) {
	// TODO：替换联系人动态角标点击逻辑
	console.log('message-contact-moment-click', item.id)
}

function onContactMoreClick() {
	// TODO：替换消息页联系人列表跳转逻辑
	console.log('message-contact-more-click')
}

function onConversationClick(item) {
	// TODO：替换会话点击逻辑
	console.log('message-conversation-click', item.id)
}

function onConversationDelete(payload) {
	// TODO：替换会话删除接口，返回 false 或抛错时不删除
	console.log('message-conversation-delete', payload.item.id)
	return true
}

function onMessageRefresh(payload) {
	// TODO：替换消息页刷新接口，使用 payload.applyReplace(...)
	console.log('message-refresh', payload.currentList.length)
}

function onMessageLoadMore(payload) {
	// TODO：替换消息页分页接口，使用 payload.applyAppend(...) / payload.markNoMore()
	console.log('message-load-more', payload.page)
}

onBeforeUnmount(() => {
	clearRefreshHintResetTimer()
	clearBottomPullTimers()
	refreshing.value = false
	loadingMore.value = false
	refreshRequestId += 1
	reachLowerRequestId += 1
})
</script>

<style scoped>
.message-page {
	position: relative;
	height: 100%;
	background:
		radial-gradient(circle at top right, rgba(255, 195, 208, 0.42) 0%, rgba(255, 195, 208, 0) 32%),
		linear-gradient(180deg, #fff7fa 0%, #f8fafc 42%, #f8fafc 100%);
	overflow: hidden;
}

.message-refresh-cover {
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

.message-refresh-indicator {
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

.message-refresh-spinner {
	width: 24rpx;
	height: 24rpx;
	margin-right: 12rpx;
	border: 4rpx solid rgba(17, 24, 39, 0.08);
	border-top-color: rgba(255, 151, 174, 0.82);
	border-radius: 50%;
	animation: message-refresh-spin 0.8s linear infinite;
}

.message-refresh-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.message-content {
	min-height: 100%;
	padding-bottom: 24rpx;
	box-sizing: border-box;
}

.message-hero {
	padding: 128rpx 24rpx 0;
	box-sizing: border-box;
}

.message-hero-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
}

.message-page-title {
	display: block;
	font-size: 52rpx;
	font-weight: 700;
	line-height: 68rpx;
	color: #0f172a;
}

.message-page-subtitle {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #667085;
}

.message-notice-chip,
.message-section-more {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 56rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.84);
	box-shadow: 0 12rpx 26rpx rgba(255, 171, 191, 0.08);
	box-sizing: border-box;
}

.message-notice-chip {
	gap: 12rpx;
}

.message-notice-chip-label {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.message-notice-chip-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 34rpx;
	height: 34rpx;
	padding: 0 10rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff97ae 0%, #ffc4a0 100%);
	font-size: 18rpx;
	font-weight: 700;
	color: #ffffff;
	box-sizing: border-box;
}

.message-search {
	display: flex;
	align-items: center;
	height: 88rpx;
	padding: 0 28rpx;
	margin-top: 28rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 36rpx rgba(255, 171, 191, 0.1);
}

.message-search-icon {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #98a2b3;
}

.message-search-text {
	margin-left: 14rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #98a2b3;
}

.message-contact-section,
.message-list-section {
	padding: 36rpx 24rpx 0;
	box-sizing: border-box;
}

.message-section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.message-section-title {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.message-section-more,
.message-section-count {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.message-contact-scroll {
	white-space: nowrap;
}

.message-contact-row {
	display: inline-flex;
	gap: 16rpx;
	padding-right: 24rpx;
}

.message-contact-card {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 148rpx;
	padding: 20rpx 12rpx 16rpx;
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: 0 16rpx 34rpx rgba(255, 171, 191, 0.08);
	box-sizing: border-box;
}

.message-contact-avatar-shell {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 88rpx;
	height: 88rpx;
	margin-top: 20rpx;
}

.message-contact-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 88rpx;
	height: 88rpx;
	border-radius: 30rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
	box-shadow: 0 16rpx 32rpx rgba(255, 171, 191, 0.18);
}

.message-contact-badge-unread,
.message-contact-badge-online {
	position: absolute;
	width: 18rpx;
	height: 18rpx;
	border: 4rpx solid #ffffff;
	border-radius: 50%;
	box-sizing: content-box;
}

.message-contact-badge-unread {
	top: -2rpx;
	right: -4rpx;
	background: #ff5b7e;
	box-shadow: 0 10rpx 20rpx rgba(255, 91, 126, 0.28);
}

.message-contact-badge-online {
	right: -2rpx;
	bottom: -2rpx;
	background: #22c55e;
	box-shadow: 0 10rpx 20rpx rgba(34, 197, 94, 0.2);
}

.message-contact-moment-bubble {
	position: absolute;
	top: -16rpx;
	right: -18rpx;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 38rpx;
	padding: 0 16rpx;
	border-radius: 999rpx 999rpx 999rpx 10rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 241, 245, 0.96) 100%);
	border: 1rpx solid rgba(255, 151, 174, 0.2);
	box-shadow: 0 14rpx 28rpx rgba(255, 171, 191, 0.16);
	font-size: 18rpx;
	font-weight: 600;
	line-height: 24rpx;
	color: #d94f7b;
	white-space: nowrap;
	animation: message-contact-moment-float 2.8s ease-in-out infinite;
}

.message-contact-name {
	display: block;
	width: 100%;
	margin-top: 16rpx;
	font-size: 24rpx;
	font-weight: 700;
	line-height: 32rpx;
	color: #0f172a;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.message-conversation-shell {
	position: relative;
	margin-bottom: 18rpx;
	overflow: hidden;
	border-radius: 32rpx;
	background: linear-gradient(135deg, #ff7b93 0%, #ffb18a 100%);
	box-shadow: 0 16rpx 36rpx rgba(255, 171, 191, 0.16);
}

.message-conversation-actions {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	justify-content: flex-end;
}

.message-conversation-delete {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 148rpx;
	height: 100%;
	padding-left: 12rpx;
	border-radius: 0 32rpx 32rpx 0;
	box-shadow: inset 1rpx 0 rgba(255, 255, 255, 0.24);
	font-size: 26rpx;
	font-weight: 700;
	color: #ffffff;
}

.message-conversation-card {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	padding: 20rpx 22rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 16rpx 36rpx rgba(15, 23, 42, 0.05);
}

.message-conversation-card-pinned {
	background: linear-gradient(180deg, #fff8fb 0%, #ffffff 100%);
	box-shadow: 0 18rpx 36rpx rgba(255, 171, 191, 0.09);
}

.message-conversation-avatar-shell {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 84rpx;
	height: 84rpx;
	flex-shrink: 0;
}

.message-conversation-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 84rpx;
	height: 84rpx;
	border-radius: 28rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
}

.message-presence-dot {
	position: absolute;
	right: -2rpx;
	bottom: -2rpx;
	width: 16rpx;
	height: 16rpx;
	border: 4rpx solid #ffffff;
	border-radius: 50%;
	box-sizing: content-box;
}

.message-presence-dot-online {
	background: #22c55e;
	box-shadow: 0 10rpx 18rpx rgba(34, 197, 94, 0.18);
}

.message-presence-dot-offline {
	background: #cbd5e1;
	box-shadow: 0 10rpx 18rpx rgba(148, 163, 184, 0.16);
}

.message-conversation-main {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.message-conversation-top,
.message-conversation-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.message-conversation-title-row {
	display: flex;
	align-items: center;
	min-width: 0;
}

.message-conversation-name {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.message-conversation-tag {
	display: inline-flex;
	align-items: center;
	height: 34rpx;
	padding: 0 12rpx;
	margin-left: 12rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.12) 0%, rgba(255, 196, 160, 0.18) 100%);
	font-size: 18rpx;
	color: #d94f7b;
}

.message-conversation-time,
.message-conversation-muted {
	font-size: 20rpx;
	line-height: 28rpx;
	color: #98a2b3;
	flex-shrink: 0;
}

.message-conversation-muted-icon {
	width: 28rpx;
	height: 28rpx;
	flex-shrink: 0;
	opacity: 0.88;
}

.message-conversation-preview {
	flex: 1;
	min-width: 0;
	margin-top: 8rpx;
	font-size: 23rpx;
	line-height: 32rpx;
	color: #475467;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.message-conversation-meta {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-top: 8rpx;
}

.message-conversation-unread {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 36rpx;
	height: 36rpx;
	padding: 0 10rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff97ae 0%, #ffc4a0 100%);
	font-size: 18rpx;
	font-weight: 700;
	color: #ffffff;
	box-sizing: border-box;
}

.message-empty-card,
.message-mock-card {
	padding: 24rpx;
	border-radius: 30rpx;
	background: rgba(255, 255, 255, 0.86);
}

.message-empty-card {
	margin-bottom: 18rpx;
}

.message-empty-text {
	font-size: 24rpx;
	line-height: 34rpx;
	color: #98a2b3;
	text-align: center;
}

.message-mock-title {
	display: block;
	font-size: 24rpx;
	font-weight: 700;
	line-height: 32rpx;
	color: #0f172a;
}

.message-mock-text {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 34rpx;
	color: #667085;
}

@keyframes message-refresh-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

@keyframes message-contact-moment-float {
	0%,
	100% {
		transform: translate3d(0, 0, 0) rotate(-4deg);
	}

	50% {
		transform: translate3d(0, -6rpx, 0) rotate(0deg);
	}
}
</style>
