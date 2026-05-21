<template>
	<view class="live-rank-page">
		<view class="live-rank-top-bar" :style="{ paddingTop: `${safeTopPx + 18}px` }">
			<view class="live-rank-back" @tap="handleBack">‹</view>
			<view class="live-rank-copy">
				<text class="live-rank-title">{{ pageMock.title }}</text>
				<text class="live-rank-subtitle">{{ pageMock.subtitle }}</text>
			</view>
			<view class="live-rank-top-placeholder"></view>
		</view>

		<view class="live-rank-list">
			<view
				v-for="item in pageMock.rankList"
				:key="item.id"
				:class="['live-rank-item', item.rank === 1 ? 'live-rank-item-top' : '']"
				@tap="handleRankItemClick(item)"
			>
				<text class="live-rank-order">{{ item.rank }}</text>
				<view class="live-rank-avatar" :style="{ background: item.avatarBackground }">
					{{ item.avatarText }}
				</view>
				<view class="live-rank-main">
					<text class="live-rank-name">{{ item.name }}</text>
					<text class="live-rank-room">{{ item.roomName }}</text>
				</view>
				<text class="live-rank-score">{{ item.scoreText }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { buildLiveRankPageMock } from '@/components/home/live/liveRankMock.js'

const systemInfo = uni.getSystemInfoSync()
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0
const pageMock = ref(buildLiveRankPageMock())

onLoad((options) => {
	pageMock.value = buildLiveRankPageMock(options?.categoryKey || 'hot')
})

function handleBack() {
	onBack(pageMock.value.categoryKey)
	uni.navigateBack({
		delta: 1
	})
}

function handleRankItemClick(item) {
	onRankItemClick(item)
}

function onBack(categoryKey) {
	// TODO：替换直播榜单页返回前置逻辑
	console.log('live-rank-back', categoryKey)
}

function onRankItemClick(item) {
	// TODO：替换直播榜单用户点击逻辑
	console.log('live-rank-item-click', item.id)
}
</script>

<style scoped>
.live-rank-page {
	min-height: 100vh;
	padding: 0 24rpx 32rpx;
	background:
		radial-gradient(circle at top right, rgba(255, 140, 178, 0.18) 0%, rgba(255, 140, 178, 0) 34%),
		linear-gradient(180deg, #0e1018 0%, #090b12 100%);
	box-sizing: border-box;
}

.live-rank-top-bar {
	display: flex;
	align-items: center;
}

.live-rank-back,
.live-rank-top-placeholder {
	width: 72rpx;
	height: 72rpx;
	flex-shrink: 0;
}

.live-rank-back {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.08);
	font-size: 34rpx;
	color: #ffffff;
}

.live-rank-copy {
	flex: 1;
	min-width: 0;
	padding: 0 16rpx;
	text-align: center;
}

.live-rank-title {
	display: block;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #ffffff;
}

.live-rank-subtitle {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: rgba(255, 255, 255, 0.58);
}

.live-rank-list {
	margin-top: 28rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.live-rank-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.06);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.live-rank-item-top {
	background: linear-gradient(135deg, rgba(255, 122, 163, 0.2) 0%, rgba(94, 91, 255, 0.14) 100%);
}

.live-rank-order {
	width: 48rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #ffffff;
	text-align: center;
}

.live-rank-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 68rpx;
	height: 68rpx;
	margin-left: 18rpx;
	border-radius: 22rpx;
	font-size: 26rpx;
	font-weight: 700;
	color: #ffffff;
	flex-shrink: 0;
}

.live-rank-main {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.live-rank-name {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	line-height: 38rpx;
	color: #ffffff;
}

.live-rank-room {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: rgba(255, 255, 255, 0.58);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.live-rank-score {
	margin-left: 18rpx;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #ffb7c9;
	flex-shrink: 0;
}
</style>
