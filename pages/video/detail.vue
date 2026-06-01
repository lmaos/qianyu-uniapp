<template>
	<view class="video-detail-page">
		<view class="video-detail-back-shell" :style="backShellStyle">
			<view class="video-detail-back-button" @tap="handleBackTap">
				<text class="video-detail-back-icon">&#60;</text>
				<text class="video-detail-back-text">返回</text>
			</view>
		</view>

		<view class="video-detail-content">
			<view class="video-detail-player-shell">
				<video
					v-if="detailItem"
					class="video-detail-player"
					:src="detailItem.url"
					:poster="detailItem.poster || ''"
					object-fit="cover"
					controls
					:page-gesture="false"
				></video>
			</view>

			<view v-if="detailItem" class="video-detail-copy">
				<text class="video-detail-title">{{ detailItem.title }}</text>
				<text class="video-detail-desc">{{ detailItem.desc || '这里先只保留视频详情基础布局。' }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { resolveReturnUrl } from '@/components/home/navigationResolver'
import {
	normalizeVideoFeedRoute,
	resolveVideoDetailItem
} from '@/components/video/videoFeedConfig.js'

const systemInfo = uni.getSystemInfoSync()
const safeTopPx = Number(systemInfo?.safeAreaInsets?.top || systemInfo?.statusBarHeight || 0)

const routeState = reactive(normalizeVideoFeedRoute({ mode: 'detail-only' }))
const detailItem = ref(null)

const backShellStyle = computed(() => ({
	top: `${safeTopPx + 10}px`
}))

onLoad((options = {}) => {
	const nextRoute = normalizeVideoFeedRoute({
		...options,
		mode: 'detail-only'
	})
	Object.assign(routeState, nextRoute)
	detailItem.value = resolveVideoDetailItem(routeState)
})

function handleBackTap() {
	const pageStack = typeof getCurrentPages === 'function' ? getCurrentPages() : []
	if (Array.isArray(pageStack) && pageStack.length > 1) {
		uni.navigateBack({
			delta: 1
		})
		return
	}

	uni.reLaunch({
		url: resolveReturnUrl(routeState)
	})
}
</script>

<style scoped>
.video-detail-page {
	min-height: 100vh;
	background: #000000;
}

.video-detail-back-shell {
	position: fixed;
	top: 0;
	left: 24rpx;
	z-index: 20;
}

.video-detail-back-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 64rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.52);
}

.video-detail-back-icon,
.video-detail-back-text {
	font-size: 26rpx;
	line-height: 1;
	color: #ffffff;
}

.video-detail-back-text {
	margin-left: 8rpx;
}

.video-detail-content {
	padding: 140rpx 24rpx 48rpx;
}

.video-detail-player-shell {
	overflow: hidden;
	border-radius: 28rpx;
	background: #111827;
}

.video-detail-player {
	width: 100%;
	height: 960rpx;
	background: #000000;
}

.video-detail-copy {
	display: flex;
	flex-direction: column;
	padding: 32rpx 8rpx 0;
}

.video-detail-title {
	font-size: 36rpx;
	font-weight: 600;
	line-height: 1.45;
	color: #ffffff;
}

.video-detail-desc {
	margin-top: 16rpx;
	font-size: 26rpx;
	line-height: 1.7;
	color: rgba(255, 255, 255, 0.72);
}
</style>
