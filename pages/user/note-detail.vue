<template>
	<view class="note-detail-layout" :style="pageShellStyle">
		<SafeTopArea
			:side-padding-rpx="24"
			:inner-min-height-rpx="88"
			:background="USER_SUB_PAGE_HEADER_BACKGROUND"
			:border-bottom="'1rpx solid rgba(226, 232, 240, 0.72)'"
			:box-shadow="'0 10rpx 28rpx rgba(148, 163, 184, 0.06)'"
			:area-style="USER_SUB_PAGE_HEADER_AREA_STYLE"
		>
			<view class="user-sub-page-header">
				<view class="user-sub-page-back" @tap="handleBack">
					<view
						class="user-sub-page-back-button"
						:style="{
							background: USER_SUB_PAGE_BACK_BUTTON_BACKGROUND,
							border: USER_SUB_PAGE_BACK_BUTTON_BORDER
						}"
					>
						<image class="user-sub-page-back-icon" :src="userSubPageBackIconSvg" mode="aspectFit" />
					</view>
				</view>
				<text class="user-sub-page-title">动态详情</text>
				<view class="user-sub-page-right"></view>
			</view>
		</SafeTopArea>

		<view class="note-detail-scroll-shell" :style="contentShellStyle">
			<PullPagingShell
				class="note-detail-paging-shell"
				light-theme
				:refresher-enabled="false"
				:lower-threshold="220"
				:scroll-top="scrollTopValue"
				:scroll-into-view="scrollIntoViewTarget"
				:shell-style="pagingShellStyle"
				:scroll-style="pagingScrollStyle"
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
							<image v-if="pageMock.authorInfo.avatar" class="note-detail-avatar-img" :src="pageMock.authorInfo.avatar" mode="aspectFill" />
							<view v-else class="note-detail-avatar" :style="{ background: pageMock.authorInfo.avatarBackground }">
								<text class="note-detail-avatar-text">{{ pageMock.authorInfo.avatarText }}</text>
							</view>
							<view class="note-detail-author-meta">
								<text class="note-detail-author-name">{{ pageMock.authorInfo.nickname }}</text>
								<text class="note-detail-author-desc">发布于 {{ pageMock.publishTimeText }}</text>
							</view>
						</view>

						<template v-if="pageMock.coverUrl || pageMock.isVideo">
							<view class="note-detail-cover" :style="{ background: pageMock.coverBackground }">
								<image class="note-detail-cover-img" :src="pageMock.coverUrl" mode="aspectFill" />
							</view>
						</template>
						<view v-else class="note-detail-cover note-detail-cover-text-only">
							<text class="note-detail-cover-text-content">{{ pageMock.title || pageMock.content }}</text>
						</view>

						<text v-if="pageMock.coverUrl || pageMock.isVideo" class="note-detail-title">{{ pageMock.title }}</text>
						<text v-if="pageMock.coverUrl || pageMock.isVideo" class="note-detail-content">{{ pageMock.content }}</text>

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
		</view>

		<SafeBottomArea
			:gap-rpx="FOOTER_GAP_RPX"
			:top-padding-rpx="FOOTER_TOP_PADDING_RPX"
			:side-padding-rpx="FOOTER_SIDE_PADDING_RPX"
			:inner-min-height-rpx="FOOTER_INNER_MIN_HEIGHT_RPX"
			:background="USER_SUB_PAGE_FOOTER_BACKGROUND"
			:border-top="'1rpx solid rgba(226, 232, 240, 0.78)'"
			:box-shadow="'0 -10rpx 28rpx rgba(148, 163, 184, 0.05)'"
			:area-style="USER_SUB_PAGE_FOOTER_AREA_STYLE"
		>
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
		</SafeBottomArea>
	</view>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import SafeBottomArea from '@/components/common/SafeBottomArea.vue'
import SafeTopArea from '@/components/common/SafeTopArea.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserCommentList from '@/components/user-center/detail/UserCommentList.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import {
	USER_SUB_PAGE_BACKGROUND,
	USER_SUB_PAGE_BACK_BUTTON_BACKGROUND,
	USER_SUB_PAGE_BACK_BUTTON_BORDER,
	USER_SUB_PAGE_FOOTER_BACKGROUND,
	USER_SUB_PAGE_FOOTER_AREA_STYLE,
	USER_SUB_PAGE_HEADER_BACKGROUND,
	USER_SUB_PAGE_HEADER_AREA_STYLE,
	userSubPageBackIconSvg
} from '@/components/user-center/common/userSubPageSurface.js'
import { formatCount, getNoteDetailPageMock } from '@/components/user-center/userCenterMock.js'
import { getMomentDetail } from '@/composables/useMomentApi.js'
import { adaptMomentDetail, fetchCommentList, fetchReplyList, publishComment, likeMoment, unlikeMoment, likeComment, unlikeComment } from '@/composables/useSocialApi.js'
import {
	userCommentStatDarkIconSvg,
	userLikeStatActiveIconSvg,
	userLikeStatOutlineDarkIconSvg,
	userViewStatDarkIconSvg
} from '@/components/user-center/main/userContentIcons.js'

const REPLY_PAGE_SIZE = 3
const COMMENT_LOADED_HOLD_MS = 120
const COMMENT_NO_MORE_HOLD_MS = 320
const HEADER_HEIGHT_RPX = 88
const FOOTER_GAP_RPX = 12
const FOOTER_TOP_PADDING_RPX = 14
const FOOTER_SIDE_PADDING_RPX = 24
const FOOTER_INNER_MIN_HEIGHT_RPX = 108
const FOOTER_REPLY_EXTRA_RESERVE_RPX = 42

const pageMock = ref(getNoteDetailPageMock())
const commentPage = ref(pageMock.value.commentPage || 1)
const pageSize = ref(pageMock.value.commentPageSize || pageMock.value.pageSize || 6)
const commentNoMore = ref(!pageMock.value.hasNextCommentPage)
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

const { windowHeightPx, headerHeightPx, footerReservePx } = useSafeAreaMetrics()

const displayCommentList = computed(() =>
	pageMock.value.commentSourceList.map((item) => {
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

const headerOffsetPx = computed(() => headerHeightPx(HEADER_HEIGHT_RPX, 0))

const footerReserveRpx = computed(() => {
	if (!replyTarget.value.nickname) {
		return 0
	}

	return (
		FOOTER_TOP_PADDING_RPX +
		FOOTER_INNER_MIN_HEIGHT_RPX +
		FOOTER_GAP_RPX +
		FOOTER_REPLY_EXTRA_RESERVE_RPX
	)
})

const footerOffsetPx = computed(() =>
	footerReservePx({
		reserveRpx: footerReserveRpx.value,
		topPaddingRpx: FOOTER_TOP_PADDING_RPX,
		innerMinHeightRpx: FOOTER_INNER_MIN_HEIGHT_RPX,
		gapRpx: FOOTER_GAP_RPX
	})
)

const pageShellStyle = computed(() => ({
	height: `${windowHeightPx.value}px`,
	minHeight: `${windowHeightPx.value}px`,
	background: USER_SUB_PAGE_BACKGROUND,
	overflow: 'hidden'
}))

const contentShellStyle = computed(() => ({
	top: `${headerOffsetPx.value}px`,
	bottom: `${footerOffsetPx.value}px`
}))

const pagingShellStyle = computed(() => ({
	height: '100%',
	minHeight: 0
}))

const pagingScrollStyle = computed(() => ({
	height: '100%',
	minHeight: '0px'
}))

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
	loadPageData(options?.noteId)
})

onBeforeUnmount(() => {
	clearTimers()
})

const momentCursor = ref(0)

async function loadPageData(momentId = '') {
	requestId += 1
	const id = Number(momentId) || 0
	console.log('[NoteDetail] loadPageData', { momentId, id })
	if (!id) {
		loadPageMockFallback(momentId)
		return
	}

	try {
		const vo = await getMomentDetail(id)
		console.log('[NoteDetail] API response', { voKeys: Object.keys(vo), hasContent: !!vo?.content })
		const currentReqId = ++requestId
		if (currentReqId !== requestId) return // superseded
		const detail = adaptMomentDetail(vo)
		console.log('[NoteDetail] adapted', { coverUrl: detail.coverUrl, type: detail.isVideo })

		pageMock.value = {
			noteInfo: detail,
			noteId: String(vo.momentId),
			authorInfo: detail.authorInfo,
			publishTimeText: detail.publishTimeText,
			coverBackground: detail.coverBackground,
			coverUrl: detail.coverUrl,
			coverText: detail.coverText,
			title: detail.title,
			content: detail.content,
			watchCountValue: detail.watchCountValue,
			watchCount: detail.watchCount,
			likeCountValue: detail.likeCountValue,
			likeCount: detail.likeCount,
			commentCountValue: detail.commentCountValue,
			commentCount: detail.commentCount,
			liked: detail.liked,
			commentSourceList: [],
			commentPage: 1,
			hasNextCommentPage: false,
			commentLoadDelayMs: 0,
			pageSize: 20,
			videoUrl: detail.videoUrl,
			isVideo: detail.isVideo,
		}
		momentCursor.value = 0
		commentNoMore.value = false
		// 加载第一页评论
		await loadNextCommentPageFromApi()
	} catch (err) {
		console.error('[NoteDetail] load failed', err)
		loadPageMockFallback(momentId)
	}
	commentDraft.value = ''
	commentInputFocused.value = false
	replyTarget.value = createEmptyReplyTarget()
	resetBottomPull(true)
}

function loadPageMockFallback(noteId = '') {
	requestId += 1
	const mock = getNoteDetailPageMock(noteId)
	pageMock.value = mock
	commentPage.value = mock.commentPage || 1
	pageSize.value = mock.commentPageSize || mock.pageSize || 6
	commentNoMore.value = !mock.hasNextCommentPage
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

async function handleToggleLike() {
	const nextLiked = !pageMock.value.liked
	const momentId = Number(pageMock.value.noteId)
	try {
		if (nextLiked) {
			await likeMoment(momentId)
		} else {
			await unlikeMoment(momentId)
		}
		pageMock.value.liked = nextLiked
		pageMock.value.likeCountValue = Math.max(0, Number(pageMock.value.likeCountValue || 0) + (nextLiked ? 1 : -1))
		pageMock.value.likeCount = formatCount(pageMock.value.likeCountValue)
		playLikeAnimation()
	} catch (err) {
		console.error('[NoteDetail] like failed', err)
	}
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

async function handleCommentLike(payload) {
	const target = findCommentTarget(payload.commentId, payload.parentId)
	if (!target) {
		return
	}

	const nextLiked = !target.liked
	try {
		if (nextLiked) {
			await likeComment(Number(target.commentId || target.id))
		} else {
			await unlikeComment(Number(target.commentId || target.id))
		}
		target.liked = nextLiked
		target.likeCountValue = Math.max(0, Number(target.likeCountValue || 0) + (nextLiked ? 1 : -1))
		target.likeCountText = formatCount(target.likeCountValue)
	} catch (err) {
		console.error('[NoteDetail] comment like failed', err)
	}
}

async function handleToggleReplies(payload) {
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
	// 尝试从 API 加载回复
	if (!target.replySourceList.length && target.replyCount > 0) {
		try {
			const result = await fetchReplyList(Number(target.commentId || target.id), 0, 20)
			target.replySourceList = result.replyList.map(r => ({
				...r,
				replyToNickname: r.replyToNickname || target.nickname,
			}))
		} catch (err) {
			console.error('[NoteDetail] load replies failed', err)
		}
	}
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

async function handleSubmitComment() {
	const text = commentDraft.value.trim()
	if (!text) {
		return
	}

	const momentId = Number(pageMock.value.noteId)
	if (!momentId) {
		// Fallback: 没有 momentId 时用旧 mock 方式
		if (replyTarget.value.parentId) {
			appendReply(text)
		} else {
			appendRootComment(text)
		}
		commentDraft.value = ''
		clearReplyTarget()
		return
	}

	try {
		await publishComment(momentId, text, {
			parentCommentId: replyTarget.value.parentId ? Number(replyTarget.value.parentCommentId || replyTarget.value.parentId) : 0,
			replyCommentId: replyTarget.value.parentId ? Number(replyTarget.value.commentId) : 0,
		})
		// 发布成功后刷新评论列表
		await refreshComments()
		pageMock.value.commentCountValue = (pageMock.value.commentCountValue || 0) + 1
		pageMock.value.commentCount = formatCount(pageMock.value.commentCountValue)
	} catch (err) {
		console.error('[NoteDetail] publish comment failed', err)
	}

	commentDraft.value = ''
	clearReplyTarget()
}

async function refreshComments() {
	momentCursor.value = 0
	try {
		const result = await fetchCommentList(Number(pageMock.value.noteId), 0, 20)
		pageMock.value.commentSourceList = result.commentList
		momentCursor.value = result.nextCommentId
		commentNoMore.value = !result.hasMore
	} catch (err) {
		console.error('[NoteDetail] refresh comments failed', err)
	}
}

function appendRootComment(content) {
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
	updateCommentCount(1)
}

async function handleReachLower() {
	console.log("触底")
	await requestNextCommentPage({
		showBottomPullFeedback: true
	})
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

async function loadNextCommentPage() {
	return await loadNextCommentPageFromApi()
}

async function loadNextCommentPageFromApi() {
	const currentRequestId = ++requestId
	loadingMore.value = true

	try {
		const momentId = Number(pageMock.value.noteId)
		if (!momentId) {
			return await loadLegacyCommentPage()
		}
		const result = await fetchCommentList(momentId, momentCursor.value, pageSize.value)
		if (currentRequestId !== requestId) {
			return 'cancelled'
		}

		if (result.commentList.length) {
			pageMock.value.commentSourceList.push(...result.commentList)
			momentCursor.value = result.nextCommentId
			commentNoMore.value = !result.hasMore
			return result.hasMore ? 'loaded' : 'no-more'
		}

		commentNoMore.value = true
		return 'no-more'
	} finally {
		loadingMore.value = false
	}
}

async function loadLegacyCommentPage() {
	const nextPage = commentPage.value + 1
	const result = await loadNoteDetailCommentPageMock(pageMock.value.noteId, nextPage, pageSize.value)

	if (Array.isArray(result.list) && result.list.length) {
		pageMock.value.commentSourceList.push(...result.list)
		commentPage.value = result.page
		commentNoMore.value = !result.hasMore
		return result.hasMore ? 'loaded' : 'no-more'
	}

	commentNoMore.value = true
	return 'no-more'
}

function loadNoteDetailCommentPageMock(...args) {
	return import('@/components/user-center/userCenterMock.js').then(m => m.loadNoteDetailCommentPageMock(...args))
}

async function requestNextCommentPage({ showBottomPullFeedback = false } = {}) {
	if (loadingMore.value) {
		return 'busy'
	}

	if (!canLoadMoreComments()) {
		if (showBottomPullFeedback) {
			showBottomPullState('no-more')
			requestRebound(COMMENT_NO_MORE_HOLD_MS)
		}
		return 'no-more'
	}

	if (showBottomPullFeedback) {
		showBottomPullState('loading')
	}

	const result = await loadNextCommentPage()
	if (!showBottomPullFeedback) {
		return result
	}

	if (result === 'cancelled') {
		resetBottomPull(true)
		return result
	}

	if (result === 'no-more') {
		showBottomPullState('no-more')
		requestRebound(COMMENT_NO_MORE_HOLD_MS)
		return result
	}

	showBottomPullState('loaded')
	requestRebound(COMMENT_LOADED_HOLD_MS)
	return result
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
</script>

<style scoped>
.user-sub-page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
}

.user-sub-page-back,
.user-sub-page-right {
	display: flex;
	align-items: center;
	min-width: 96rpx;
	min-height: 64rpx;
}

.user-sub-page-back-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.1);
}

.user-sub-page-back-icon {
	width: 30rpx;
	height: 30rpx;
}

.user-sub-page-title {
	flex: 1;
	text-align: center;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.user-sub-page-right {
	justify-content: flex-end;
}

.note-detail-layout {
	position: relative;
}

.note-detail-page {
	padding: 12rpx 24rpx 24rpx;
}

.note-detail-scroll-shell {
	position: fixed;
	left: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
}

.note-detail-paging-shell {
	flex: 1;
	min-height: 0;
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
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 420rpx;
	margin-top: 22rpx;
	border-radius: 24rpx;
	overflow: hidden;
}

.note-detail-cover-img {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.note-detail-cover-text-only {
	background: transparent !important;
}

.note-detail-cover-text-content {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	font-size: 28rpx;
	line-height: 44rpx;
	color: #475467;
	text-align: center;
	padding: 0 32rpx;
	white-space: pre-wrap;
	overflow: hidden;
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
