<template>
	<view :class="['live-card-item', placeholder ? 'live-card-item-placeholder' : '']" @tap="handleClick">
		<template v-if="!placeholder">
			<view class="cover-block" :style="{ background: item.coverBackground }">
				<view class="cover-block-glow"></view>
				<view class="cover-block-mask"></view>
				<view class="live-badge">{{ item.liveTag }}</view>
				<text class="viewer-count">{{ item.viewerText }}</text>
				<view class="live-bottom-bar">
					<view class="anchor-avatar" :style="{ background: item.avatarBackground }"></view>
					<text class="live-room-name">{{ item.roomName }}</text>
				</view>
			</view>
		</template>
	</view>
</template>

<script setup>
const props = defineProps({
	item: {
		type: Object,
		default: () => ({})
	},
	placeholder: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['click'])

// 点击非占位卡片时，向父层抛出当前直播卡片数据。
function handleClick() {
	if (props.placeholder) {
		return
	}

	emit('click', props.item)
}
</script>

<style scoped>
.live-card-item {
	border-radius: 28rpx;
	background: linear-gradient(180deg, rgba(19, 19, 26, 0.72) 0%, rgba(10, 10, 15, 0.84) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 18rpx 34rpx rgba(0, 0, 0, 0.18);
	overflow: hidden;
}

.live-card-item-placeholder {
	background: transparent;
}

.cover-block {
	position: relative;
	height: 316rpx;
	padding: 20rpx;
	overflow: hidden;
}

.cover-block-glow {
	position: absolute;
	top: -40rpx;
	right: -12rpx;
	width: 180rpx;
	height: 180rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 72%);
}

.cover-block-mask {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	height: 138rpx;
	background: linear-gradient(180deg, rgba(10, 10, 15, 0) 0%, rgba(10, 10, 15, 0.78) 100%);
}

.live-badge {
	position: relative;
	z-index: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 40rpx;
	padding: 0 16rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 110, 161, 0.96) 0%, rgba(255, 191, 118, 0.92) 100%);
	font-size: 20rpx;
	color: #ffffff;
}

.viewer-count {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	z-index: 1;
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(0, 0, 0, 0.28);
	font-size: 22rpx;
	line-height: 32rpx;
	color: #ffffff;
}

.live-bottom-bar {
	position: absolute;
	right: 20rpx;
	bottom: 20rpx;
	left: 20rpx;
	z-index: 1;
	display: flex;
	align-items: center;
	min-width: 0;
}

.anchor-avatar {
	width: 44rpx;
	height: 44rpx;
	border-radius: 50%;
	box-shadow: 0 8rpx 18rpx rgba(255, 126, 164, 0.18);
}

.live-room-name {
	margin-left: 14rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #ffffff;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
