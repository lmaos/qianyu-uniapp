<template>
	<view class="web-view-page">
		<SafeTopArea
			:side-padding-rpx="24"
			:inner-min-height-rpx="88"
			background="rgba(248, 250, 252, 0.96)"
			border-bottom="1rpx solid rgba(226, 232, 240, 0.76)"
			box-shadow="0 10rpx 28rpx rgba(15, 23, 42, 0.06)"
		>
			<view class="web-view-header">
				<view class="web-view-back" @tap="handleBack">
					<text class="web-view-back-text">&lt;</text>
				</view>
				<text class="web-view-title">{{ pageTitle }}</text>
				<view class="web-view-placeholder"></view>
			</view>
		</SafeTopArea>

		<web-view class="web-view-body" :src="pageUrl" :style="webViewStyle"></web-view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SafeTopArea from '@/components/common/SafeTopArea.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'

const HEADER_HEIGHT_RPX = 88
const defaultPageTitle = '活动详情'
const defaultPageUrl = 'https://example.com/'

const pageTitle = ref(defaultPageTitle)
const pageUrl = ref(defaultPageUrl)
const { headerHeightPx, windowHeightPx } = useSafeAreaMetrics()

const webViewStyle = computed(() => {
	const topOffsetPx = headerHeightPx(HEADER_HEIGHT_RPX)
	return {
		marginTop: `${topOffsetPx}px`,
		height: `${Math.max(windowHeightPx.value - topOffsetPx, 0)}px`
	}
})

onLoad((options) => {
	pageTitle.value = decodeURIComponent(options?.title || defaultPageTitle)
	pageUrl.value = decodeURIComponent(options?.url || defaultPageUrl)
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}
</script>

<style scoped>
.web-view-page {
	position: relative;
	width: 100%;
	height: 100vh;
	background: #f8fafc;
}

.web-view-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 88rpx;
}

.web-view-back,
.web-view-placeholder {
	width: 64rpx;
	height: 64rpx;
	flex-shrink: 0;
}

.web-view-back {
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.06);
}

.web-view-back-text {
	font-size: 30rpx;
	line-height: 30rpx;
	font-weight: 700;
	color: #344054;
}

.web-view-title {
	flex: 1;
	min-width: 0;
	padding: 0 20rpx;
	font-size: 30rpx;
	line-height: 42rpx;
	font-weight: 600;
	color: #101828;
	text-align: center;
}

.web-view-body {
	display: block;
	width: 100%;
}
</style>
