<template>
	<UserSubPageLayout
		title="动态详情"
		:scrollable="false"
		:content-side-padding-rpx="0"
		:content-bottom-padding-rpx="0"
		:content-top-offset-px="0"
		:footer-reserve-rpx="168"
		:footer-top-padding-rpx="14"
		:footer-gap-rpx="12"
		:footer-inner-min-height-rpx="108"
		@back="handleBack"
	>
		<PullPagingShell
			light-theme
			:refresher-enabled="false"
			:lower-threshold="220"
			:scroll-top="scrollTopValue"
			:scroll-into-view="scrollIntoViewTarget"
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
						<view class="note-detail-stat-item">
							<image class="note-detail-stat-icon" :src="userViewStatDarkIconSvg" mode="aspectFit" />
							<text class="note-detail-stat-text">{{ pageMock.watchCount }}</text>
						</view>
						<view
							:class="[
								'note-detail-stat-item',
								'note-detail-stat-item-action',
								pageMock.liked ? 'note-detail-stat-item-active' : '',
								likeAnimating ? 'note-detail-stat-item-animating' : ''
							]"
							@tap="handleToggleLike"
						>
							<image
								class="note-detail-stat-icon"
								:src="pageMock.liked ? userLikeStatActiveIconSvg : userLikeStatOutlineDarkIconSvg"
								mode="aspectFit"
							/>
							<text :class="['note-detail-stat-text', pageMock.liked ? 'note-detail-stat-text-active' : '']">
								{{ pageMock.likeCount }}
							</text>
						</view>
						<view class="note-detail-stat-item note-detail-stat-item-action" @tap="handleOpenCommentComposer">
							<image class="note-detail-stat-icon" :src="userCommentStatDarkIconSvg" mode="aspectFit" />
							<text class="note-detail-stat-text">{{ pageMock.commentCount }}</text>
						</view>
					</view>
				</UserSectionCard>

				<view id="note-comment-anchor" class="note-detail-comment-title">
					评论区
					<text class="note-detail-comment-title-count">{{ pageMock.commentCount }}</text>
				</view>
				<UserCommentList
					:comment-list="displayCommentList"
					@like-comment="handleCommentLike"
					@reply-comment="handleReplyComment"
					@toggle-replies="handleToggleReplies"
					@load-more-replies="handleLoadMoreReplies"
				/>
			</view>
		</PullPagingShell>

		<template #footer>
			<view id="note-detail-composer-anchor" class="note-detail-footer">
				<view v-if="replyTarget.nickname" class="note-detail-reply-banner">
					<text class="note-detail-reply-banner-text">正在回复 {{ replyTarget.nickname }}</text>
					<text class="note-detail-reply-banner-action" @tap="clearReplyTarget">取消</text>
				</view>
				<view class="note-detail-composer">
					<input
						v-model.trim="commentDraft"
						class="note-detail-composer-input"
						:placeholder="commentPlaceholder"
						:focus="commentInputFocused"
						cursor-spacing="36"
						placeholder-style="color: #94a3b8;"
						confirm-type="send"
						@focus="handleComposerFocus"
						@blur="handleComposerBlur"
						@confirm="handleSubmitComment"
					/>
					<view
						:class="[
							'note-detail-composer-send',
							commentDraft.trim() ? 'note-detail-composer-send-active' : ''
						]"
						@tap="handleSubmitComment"
					>
						发送
					</view>
				</view>
			</view>
		</template>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import UserCommentList from '@/components/user-center/detail/UserCommentList.vue'
import {
	createMainTabPageState,
	formatCount,
	getNoteDetailPageMock
} from '@/components/user-center/userCenterMock.js'
import {
	userCommentStatDarkIconSvg,
	userLikeStatActiveIconSvg,
	userLikeStatOutlineDarkIconSvg,
	userViewStatDarkIconSvg
} from '@/components/user-center/main/userContentIcons.js'

const REPLY_PAGE_SIZE = 3
const COMMENT_LOADED_HOLD_MS = 120
const COMMENT_NO_MORE_HOLD_MS = 320

const pageMock = ref(getNoteDetailPageMock())
const commentPage = ref(1)
const pageSize = ref(pageMock.value.pageSize || 6)
const commentNoMore = ref(pageMock.value.commentSourceList.length <= pageSize.value)
const commentDraft = ref('')
const commentInputFocused = ref(false)
const replyTarget = ref(createEmptyReplyTarget())
const likeAnimating = ref(false)
const bottomPullState = ref('idle')
const bottomPullVisible = ref(false)
const bottomPullPendingRelease = ref(false)
const bottomPullRearmPending = ref(false)
const parentTouching = ref(false)
const scrollTopPx = ref(0)
const scrollTopValue = ref(0)
const scrollIntoViewTarget = ref('')
const loadingMore = ref(false)

let collapseTimer = null
let resetTimer = null
let fallbackTimer = null
let rearmTimer = null
let likeTimer = null
let composerScrollTimer = null
let requestId = 0

const displayCommentList = computed(() =>
	createMainTabPageState(pageMock.value.commentSourceList, pageSize.value, commentPage.value).map((item) => {
		const replySourceList = Array.isArray(item.replySourceList) ? item.replySourceList : []
		const visibleReplyCount = item.repliesExpanded ? Math.max(item.visibleReplyCount || 0, 0) : 0
		return {
			...item,
			replyCount: replySourceList.length,
			hasMoreReplies: visibleReplyCount < replySourceList.length,
			visibleReplyList: replySourceList.slice(0, visibleReplyCount)
		}
	})
)

const commentPlaceholder = computed(() =>
	replyTarget.value.nickname ? `回复 ${replyTarget.value.nickname}` : '写下你的评论…'
)

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
	loadPageMock(options?.noteId)
})

onBeforeUnmount(() => {
	clearTimers()
})

function loadPageMock(noteId = '') {
	pageMock.value = getNoteDetailPageMock(noteId)
	commentPage.value = 1
	pageSize.value = pageMock.value.pageSize || 6
	commentNoMore.value = pageMock.value.commentSourceList.length <= pageSize.value
	commentDraft.value = ''
	commentInputFocused.value = false
	replyTarget.value = createEmptyReplyTarget()
	resetBottomPull(true)
}

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

function handleToggleLike() {
	const nextLiked = !pageMock.value.liked
	pageMock.value.liked = nextLiked
	pageMock.value.likeCountValue = Math.max(0, Number(pageMock.value.likeCountValue || 0) + (nextLiked ? 1 : -1))
	pageMock.value.likeCount = formatCount(pageMock.value.likeCountValue)
	playLikeAnimation()
}

function handleOpenCommentComposer() {
	clearReplyTarget()
	requestComposerFocus()
}

function handleReplyComment(payload) {
	replyTarget.value = {
		commentId: payload.commentId || '',
		parentId: payload.parentId || payload.commentId || '',
		nickname: payload.nickname || ''
	}
	requestComposerFocus()
}

function handleComposerFocus() {
	commentInputFocused.value = true
}

function handleComposerBlur() {
	commentInputFocused.value = false
}

function handleCommentLike(payload) {
	const target = findCommentTarget(payload.commentId, payload.parentId)
	if (!target) {
		return
	}

	const nextLiked = !target.liked
	target.liked = nextLiked
	target.likeCountValue = Math.max(0, Number(target.likeCountValue || 0) + (nextLiked ? 1 : -1))
	target.likeCountText = formatCount(target.likeCountValue)
}

function handleToggleReplies(payload) {
	const target = findCommentTarget(payload.commentId)
	if (!target) {
		return
	}

	if (!payload.expand) {
		target.repliesExpanded = false
		target.visibleReplyCount = 0
		return
	}

	target.repliesExpanded = true
	target.visibleReplyCount = Math.min(REPLY_PAGE_SIZE, getReplyList(target).length)
}

function handleLoadMoreReplies(payload) {
	const target = findCommentTarget(payload.commentId)
	if (!target) {
		return
	}

	target.repliesExpanded = true
	target.visibleReplyCount = Math.min(
		getReplyList(target).length,
		Math.max(target.visibleReplyCount || 0, REPLY_PAGE_SIZE) + REPLY_PAGE_SIZE
	)
}

function handleSubmitComment() {
	const content = commentDraft.value.trim()
	if (!content) {
		return
	}

	if (replyTarget.value.parentId) {
		appendReply(content)
	} else {
		appendRootComment(content)
	}

	commentDraft.value = ''
	clearReplyTarget()
}

function appendRootComment(content) {
	const wasNoMore = commentNoMore.value
	pageMock.value.commentSourceList.unshift({
		id: createLocalId('comment'),
		nickname: '我',
		avatarText: '我',
		avatarBackground: 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)',
		content,
		timeText: '刚刚',
		likeCountValue: 0,
		likeCountText: '0',
		liked: false,
		replySourceList: [],
		visibleReplyCount: 0,
		repliesExpanded: false
	})
	if (wasNoMore) {
		commentPage.value = Math.max(commentPage.value, Math.ceil(pageMock.value.commentSourceList.length / pageSize.value))
	}
	syncCommentNoMore()
	updateCommentCount(1)
}

function appendReply(content) {
	const parentComment = pageMock.value.commentSourceList.find((item) => item.id === replyTarget.value.parentId)
	if (!parentComment) {
		appendRootComment(content)
		return
	}

	const replyList = getReplyList(parentComment)
	replyList.unshift({
		id: createLocalId('reply'),
		nickname: '我',
		avatarText: '我',
		avatarBackground: 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)',
		content,
		timeText: '刚刚',
		replyToNickname: replyTarget.value.nickname,
		likeCountValue: 0,
		likeCountText: '0',
		liked: false
	})
	parentComment.repliesExpanded = true
	parentComment.visibleReplyCount = Math.min(
		replyList.length,
		Math.max(parentComment.visibleReplyCount || 0, REPLY_PAGE_SIZE)
	)
	syncCommentNoMore()
	updateCommentCount(1)
}

async function handleReachLower() {
	if (loadingMore.value) {
		return
	}

	if (!canLoadMoreComments()) {
		showBottomPullState('no-more')
		requestRebound(COMMENT_NO_MORE_HOLD_MS)
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

	const result = loadCurrentCommentNextPage()
	loadingMore.value = false
	onCommentLoadMore({
		noteId: pageMock.value.noteId,
		page: commentPage.value
	})
	if (result === 'no-more') {
		showBottomPullState('no-more')
		requestRebound(COMMENT_NO_MORE_HOLD_MS)
		return
	}

	showBottomPullState('loaded')
	requestRebound(COMMENT_LOADED_HOLD_MS)
}

function showBottomPullState(state) {
	clearPullTimers()
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
	clearPullTimers()
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
	clearPullTimers()
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

function scrollToComposer() {
	if (composerScrollTimer) {
		clearTimeout(composerScrollTimer)
	}
	scrollIntoViewTarget.value = 'note-detail-composer-anchor'
	composerScrollTimer = setTimeout(() => {
		scrollIntoViewTarget.value = ''
		composerScrollTimer = null
	}, 120)
}

function requestComposerFocus() {
	scrollToComposer()
	if (!commentInputFocused.value) {
		commentInputFocused.value = true
		return
	}

	commentInputFocused.value = false
	nextTick(() => {
		commentInputFocused.value = true
	})
}

function playLikeAnimation() {
	if (likeTimer) {
		clearTimeout(likeTimer)
	}
	likeAnimating.value = false
	likeTimer = setTimeout(() => {
		likeAnimating.value = true
		likeTimer = setTimeout(() => {
			likeAnimating.value = false
			likeTimer = null
		}, 260)
	}, 16)
}

function updateCommentCount(delta) {
	pageMock.value.commentCountValue = Math.max(0, Number(pageMock.value.commentCountValue || 0) + delta)
	pageMock.value.commentCount = formatCount(pageMock.value.commentCountValue)
}

function clearReplyTarget() {
	replyTarget.value = createEmptyReplyTarget()
}

function canLoadMoreComments() {
	return !commentNoMore.value
}

function loadCurrentCommentNextPage() {
	const loadedCount = displayCommentList.value.length
	if (loadedCount >= pageMock.value.commentSourceList.length) {
		commentNoMore.value = true
		return 'no-more'
	}

	commentPage.value += 1
	syncCommentNoMore()
	return 'loaded'
}

function syncCommentNoMore() {
	commentNoMore.value = displayCommentList.value.length >= pageMock.value.commentSourceList.length
}

function findCommentTarget(commentId, parentId = '') {
	if (!commentId) {
		return null
	}

	if (!parentId || parentId === commentId) {
		return pageMock.value.commentSourceList.find((item) => item.id === commentId) || null
	}

	const parentComment = pageMock.value.commentSourceList.find((item) => item.id === parentId)
	if (!parentComment) {
		return null
	}

	return getReplyList(parentComment).find((item) => item.id === commentId) || null
}

function getReplyList(item) {
	if (!Array.isArray(item.replySourceList)) {
		item.replySourceList = []
	}

	return item.replySourceList
}

function createLocalId(prefix) {
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function createEmptyReplyTarget() {
	return {
		commentId: '',
		parentId: '',
		nickname: ''
	}
}

function clearPullTimers() {
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

function clearTimers() {
	clearPullTimers()
	if (likeTimer) {
		clearTimeout(likeTimer)
		likeTimer = null
	}
	if (composerScrollTimer) {
		clearTimeout(composerScrollTimer)
		composerScrollTimer = null
	}
}

function waitTask(delay = 0) {
	return new Promise((resolve) => {
		setTimeout(resolve, delay)
	})
}

function onCommentLoadMore(payload) {
	console.log('user-note-comment-load-more', payload.noteId, payload.page)
}
</script>

<style scoped>
.note-detail-page {
	padding: 12rpx 24rpx 24rpx;
}

.note-detail-card {
	padding-top: 18rpx;
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
.note-detail-content {
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
	border-radius: 24rpx;
}

.note-detail-cover-text {
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
}

.note-detail-title {
	margin-top: 22rpx;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.note-detail-content {
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 40rpx;
	color: #334155;
	white-space: pre-wrap;
}

.note-detail-stat-row {
	display: flex;
	align-items: center;
	gap: 18rpx;
	margin-top: 24rpx;
}

.note-detail-stat-item {
	display: inline-flex;
	align-items: center;
	gap: 10rpx;
	padding: 14rpx 18rpx;
	border-radius: 999rpx;
	background: #f8fafc;
}

.note-detail-stat-item-action {
	transition: transform 0.2s ease, background-color 0.2s ease;
}

.note-detail-stat-item-active {
	background: rgba(254, 44, 85, 0.1);
}

.note-detail-stat-item-animating {
	animation: note-like-bounce 0.26s ease;
}

.note-detail-stat-icon {
	width: 30rpx;
	height: 30rpx;
}

.note-detail-stat-text {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #475467;
}

.note-detail-stat-text-active {
	color: #fe2c55;
}

.note-detail-comment-title {
	display: flex;
	align-items: baseline;
	gap: 10rpx;
	margin: 28rpx 0 18rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.note-detail-comment-title-count {
	font-size: 22rpx;
	font-weight: 500;
	color: #64748b;
}

.note-detail-footer {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
}

.note-detail-reply-banner,
.note-detail-composer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.note-detail-reply-banner {
	padding: 0 8rpx;
}

.note-detail-reply-banner-text {
	flex: 1;
	min-width: 0;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #64748b;
}

.note-detail-reply-banner-action {
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #fe2c55;
}

.note-detail-composer {
	padding: 12rpx;
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 12rpx 32rpx rgba(148, 163, 184, 0.12);
}

.note-detail-composer-input {
	flex: 1;
	min-width: 0;
	height: 72rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: #f8fafc;
	font-size: 24rpx;
	color: #0f172a;
}

.note-detail-composer-send {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 112rpx;
	height: 72rpx;
	border-radius: 999rpx;
	background: #e2e8f0;
	font-size: 24rpx;
	font-weight: 700;
	color: #94a3b8;
}

.note-detail-composer-send-active {
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	color: #ffffff;
}

@keyframes note-like-bounce {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.12);
	}
	100% {
		transform: scale(1);
	}
}
</style>
