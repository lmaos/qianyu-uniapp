<template>
	<view class="video-detail-page" :style="pageStyle">
		<FullScreenVideoPanel
			ref="videoPanelRef"
			:video="pageMock"
			:height-px="windowHeightPx"
			:safe-top-inset-rpx="safeTopInsetRpx"
			:safe-bottom-inset-rpx="safeBottomInsetRpx"
			:show-back="true"
			:show-follow-button="true"
			:show-play-hint="true"
			:playable="true"
			:muted-playback="false"
			:loop-playback="true"
			@back="handleBack"
			@author-click="handleAuthorClick"
			@action="handleAction"
			@play="handlePanelPlay"
			@pause="handlePanelPause"
			@ended="handlePanelEnded"
			@error="handlePanelError"
		/>
	</view>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import FullScreenVideoPanel from '@/components/common/video/FullScreenVideoPanel.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { getVideoDetailPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getVideoDetailPageMock())
const videoPanelRef = ref(null)
const shouldResumePlayback = ref(true)
const suspendingPlayback = ref(false)
const systemInfo = uni.getSystemInfoSync()
const windowHeightPx = Math.max(1, systemInfo.windowHeight || systemInfo.screenHeight || 0)
const { safeTopPx, safeBottomPx, pxToRpx } = useSafeAreaMetrics()

const safeTopInsetRpx = computed(() => Math.max(0, pxToRpx(safeTopPx.value)))
const safeBottomInsetRpx = computed(() => Math.max(24, pxToRpx(safeBottomPx.value)))
const pageStyle = computed(() => ({
	height: `${windowHeightPx}px`,
	background: pageMock.value.pageBackground || '#020617'
}))

onLoad((options) => {
	pageMock.value = getVideoDetailPageMock(options?.workId || options?.momentId || options?.videoId)
	shouldResumePlayback.value = true
	void nextTick(() => {
		void videoPanelRef.value?.play?.()
	})
})

onShow(() => {
	suspendingPlayback.value = false
	if (!shouldResumePlayback.value) {
		return
	}

	void nextTick(() => {
		void videoPanelRef.value?.play?.()
	})
})

onHide(() => {
	suspendingPlayback.value = true
	videoPanelRef.value?.pause?.()
})

onUnload(() => {
	suspendingPlayback.value = true
	videoPanelRef.value?.pause?.()
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleAuthorClick(video) {
	onAuthorClick(video?.authorInfo)
	if (video?.authorUrl) {
		uni.navigateTo({
			url: video.authorUrl
		})
		return
	}

	uni.showToast({
		title: '作者资料占位',
		icon: 'none'
	})
}

function handleAction(payload) {
	onVideoAction(payload?.key)
	uni.showToast({
		title: '视频交互占位',
		icon: 'none'
	})
}

function handlePanelPlay() {
	shouldResumePlayback.value = true
}

function handlePanelPause() {
	if (suspendingPlayback.value) {
		return
	}
	shouldResumePlayback.value = false
}

function handlePanelEnded() {
	shouldResumePlayback.value = false
}

function handlePanelError() {
	shouldResumePlayback.value = false
}

function onAuthorClick(authorInfo) {
	// TODO：替换视频作者资料逻辑
	console.log('user-video-author-click', authorInfo?.userId)
}

function onVideoAction(actionKey) {
	// TODO：替换视频点赞评论分享逻辑
	console.log('user-video-action', actionKey)
}
</script>

<style scoped>
.video-detail-page {
	position: relative;
	width: 100%;
	overflow: hidden;
}
</style>
