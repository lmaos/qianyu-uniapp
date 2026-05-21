<template>
	<UserSubPageLayout title="动态详情" :scrollable="false" :content-side-padding-rpx="0" :content-bottom-padding-rpx="0" @back="handleBack">
		<PullPagingShell
			light-theme
			:refresher-enabled="false"
			:lower-threshold="220"
			:scroll-top="scrollTopValue"
			:inner-style="contentInnerStyle"
			:bottom-pull-state="bottomPullState"
			:bottom-pull-visible="bottomPullVisible"
			:bottom-pull-slot-style="bottomPullSlotStyle"
			@scroll="handleScroll"
			@touch-start="handleTouchStart"
			@touch-end="handleTouchEnd"
			@scroll-lower="handleReachLower"
		>
			<view class="note-detail-page">
				<UserSectionCard class="note-detail-card">
					<view class="note-detail-author">
						<view class="note-detail-avatar" :style="{ background: pageMock.authorInfo.avatarBackground }">
							<text class="note-detail-avatar-text">{{ pageMock.authorInfo.avatarText }}</text>
						</view>
						<view class="note-detail-author-meta">
							<text class="note-detail-author-name">{{ pageMock.authorInfo.nickname }}</text>
							<text class="note-detail-author-desc">发布于 {{ pageMock.publishTimeText }}</text>
						</view>
					</view>

					<view class="note-detail-cover" :style="{ background: pageMock.coverBackground }">
						<text class="note-detail-cover-text">{{ pageMock.coverText }}</text>
					</view>

					<text class="note-detail-title">{{ pageMock.title }}</text>
					<text class="note-detail-content">{{ pageMock.content }}</text>

					<view class="note-detail-stat-row">
						<text class="note-detail-stat">观看 {{ pageMock.watchCount }}</text>
						<text class="note-detail-stat">点赞 {{ pageMock.likeCount }}</text>
						<text class="note-detail-stat">评论 {{ pageMock.commentCount }}</text>
					</view>
				</UserSectionCard>

				<view class="note-detail-comment-title">评论区</view>
				<UserCommentList :comment-list="displayCommentList" />
			</view>
		</PullPagingShell>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import UserCommentList from '@/components/user-center/detail/UserCommentList.vue'
import { getNoteDetailPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getNoteDetailPageMock())
const commentPage = ref(1)
const pageSize = ref(pageMock.value.pageSize || 10)
const bottomPullState = ref('idle')
const bottomPullVisible = ref(false)
const bottomPullPendingRelease = ref(false)
const bottomPullRearmPending = ref(false)
const parentTouching = ref(false)
const scrollTopPx = ref(0)
const scrollTopValue = ref(0)
const loadingMore = ref(false)

let collapseTimer = null
let resetTimer = null
let fallbackTimer = null
let rearmTimer = null
let requestId = 0

const displayCommentList = computed(() => pageMock.value.commentList.slice(0, commentPage.value * pageSize.value))
const contentInnerStyle = computed(() => ({
	paddingBottom: `${36 + (bottomPullVisible.value ? 72 : 0)}rpx`,
	background: 'transparent'
}))
const bottomPullSlotStyle = computed(() => ({
	height: bottomPullVisible.value ? '72rpx' : '0rpx',
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	background: 'linear-gradient(180deg, rgba(244, 247, 252, 0) 0%, rgba(244, 247, 252, 0.94) 46%, rgba(244, 247, 252, 1) 100%)'
}))

onLoad((options) => {
	pageMock.value = getNoteDetailPageMock(options?.noteId)
	commentPage.value = 1
	pageSize.value = pageMock.value.pageSize || 10
})

onBeforeUnmount(() => {
	clearTimers()
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleScroll(event) {
	scrollTopPx.value = Number(event?.detail?.scrollTop || 0)
}

function handleTouchStart() {
	parentTouching.value = true
}

function handleTouchEnd() {
	parentTouching.value = false
	if (bottomPullPendingRelease.value) {
		scheduleCollapse(20, bottomPullRearmPending.value)
	}
}

async function handleReachLower() {
	if (loadingMore.value) {
		return
	}

	const loadedCount = displayCommentList.value.length
	if (loadedCount >= pageMock.value.commentList.length) {
		showBottomPullState('no-more')
		requestRebound(320)
		return
	}

	const currentRequestId = ++requestId
	loadingMore.value = true
	showBottomPullState('loading')

	await waitTask(360)
	if (currentRequestId !== requestId) {
		loadingMore.value = false
		resetBottomPull(true)
		return
	}

	commentPage.value += 1
	loadingMore.value = false
	onCommentLoadMore({
		noteId: pageMock.value.noteId,
		page: commentPage.value
	})
	requestRebound(120)
}

function showBottomPullState(state) {
	clearTimers()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	bottomPullState.value = state
	bottomPullVisible.value = true
}

function requestRebound(delayMs) {
	if (parentTouching.value) {
		bottomPullPendingRelease.value = true
		bottomPullRearmPending.value = true
		fallbackTimer = setTimeout(() => {
			parentTouching.value = false
			if (bottomPullPendingRelease.value) {
				scheduleCollapse(20, bottomPullRearmPending.value)
			}
		}, Math.max(delayMs, 320) + 120)
		return
	}

	scheduleCollapse(delayMs, true)
}

function scheduleCollapse(delayMs, shouldRearm = false) {
	clearTimers()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	collapseTimer = setTimeout(() => {
		bottomPullVisible.value = false
		collapseTimer = null
		if (shouldRearm) {
			rearmTimer = setTimeout(() => {
				rearmReachLower()
				rearmTimer = null
			}, 36)
		}
		resetTimer = setTimeout(() => {
			bottomPullState.value = 'idle'
			resetTimer = null
		}, 380)
	}, delayMs)
}

function rearmReachLower() {
	const currentScrollTop = Math.max(0, Math.round(scrollTopPx.value || 0))
	if (currentScrollTop <= 14) {
		return
	}

	const nextTop = Math.max(0, currentScrollTop - 14)
	scrollTopValue.value = nextTop
	scrollTopPx.value = nextTop
}

function resetBottomPull(immediate = false) {
	clearTimers()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	if (immediate) {
		bottomPullState.value = 'idle'
		bottomPullVisible.value = false
		return
	}

	bottomPullVisible.value = false
	resetTimer = setTimeout(() => {
		bottomPullState.value = 'idle'
		resetTimer = null
	}, 380)
}

function clearTimers() {
	if (collapseTimer) {
		clearTimeout(collapseTimer)
		collapseTimer = null
	}
	if (resetTimer) {
		clearTimeout(resetTimer)
		resetTimer = null
	}
	if (fallbackTimer) {
		clearTimeout(fallbackTimer)
		fallbackTimer = null
	}
	if (rearmTimer) {
		clearTimeout(rearmTimer)
		rearmTimer = null
	}
}

function waitTask(delay = 0) {
	return new Promise((resolve) => {
		setTimeout(resolve, delay)
	})
}

function onCommentLoadMore(payload) {
	// TODO：替换评论分页接口
	console.log('user-note-comment-load-more', payload.noteId, payload.page)
}
</script>

<style scoped>
.note-detail-page {
	padding: 24rpx;
}

.note-detail-card {
	padding-top: 28rpx;
}

.note-detail-author {
	display: flex;
	align-items: center;
}

.note-detail-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 84rpx;
	height: 84rpx;
	border-radius: 50%;
}

.note-detail-avatar-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.note-detail-author-meta {
	margin-left: 16rpx;
}

.note-detail-author-name,
.note-detail-author-desc,
.note-detail-title,
.note-detail-content,
.note-detail-stat {
	display: block;
}

.note-detail-author-name {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.note-detail-author-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.note-detail-cover {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 420rpx;
	margin-top: 22rpx;
	border-radius: 28rpx;
}

.note-detail-cover-text {
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
}

.note-detail-title {
	margin-top: 24rpx;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.note-detail-content {
	margin-top: 18rpx;
	font-size: 24rpx;
	line-height: 40rpx;
	color: #334155;
	white-space: pre-wrap;
}

.note-detail-stat-row {
	display: flex;
	flex-wrap: wrap;
	gap: 18rpx;
	margin-top: 22rpx;
}

.note-detail-stat {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.note-detail-comment-title {
	margin: 28rpx 0 18rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}
</style>
