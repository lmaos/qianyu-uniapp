<template>
	<view class="recommend-card" @tap="emit('click', item)">
		<view v-if="item.coverUrl || item.contentType === 'video'" class="recommend-cover" :style="{ height: `${uniformCoverHeightRpx}rpx`, background: item.coverBackground }">
			<image v-if="item.coverUrl" class="recommend-cover-img" :src="item.coverUrl" mode="aspectFill" />
			<view v-if="item.contentType === 'video'" class="recommend-video-badge">
				<text class="recommend-video-badge-text">短视频</text>
			</view>

			<view v-if="item.contentType === 'video'" class="recommend-video-play">
				<text class="recommend-video-play-icon">▶</text>
				<text class="recommend-video-play-text">{{ item.playCountText }}</text>
			</view>
		</view>

		<view class="recommend-body">
			<text class="recommend-title">{{ item.title }}</text>

			<view class="recommend-meta">
				<view class="recommend-author" @tap.stop="emit('author-click', item)">
					<image v-if="item.authorAvatar" class="recommend-avatar-img" :src="item.authorAvatar" mode="aspectFill" />
					<view v-else class="recommend-avatar" :style="{ background: item.authorAvatarFallback }">
						{{ item.authorName ? item.authorName[0] : '?' }}
					</view>
					<text class="recommend-author-name">{{ item.authorName }}</text>
				</view>

				<view class="recommend-like">
					<text class="recommend-like-icon">♡</text>
					<text class="recommend-like-text">{{ item.likeCountText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	item: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['click', 'author-click'])
const uniformCoverHeightRpx = 468
</script>

<style scoped>
.recommend-card {
	overflow: hidden;
	border-radius: 16rpx;
	background: #ffffff;
}

.recommend-cover {
	position: relative;
	border-radius: 16rpx;
	overflow: hidden;
}

.recommend-cover-img {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.recommend-avatar-img {
	width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	flex-shrink: 0;
}

.recommend-video-badge {
	position: absolute;
	left: 16rpx;
	top: 16rpx;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 8rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.42);
}

.recommend-video-badge-text {
	font-size: 20rpx;
	line-height: 28rpx;
	color: #ffffff;
}

.recommend-video-play {
	position: absolute;
	left: 16rpx;
	bottom: 16rpx;
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 10rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.36);
}

.recommend-video-play-icon,
.recommend-video-play-text {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #ffffff;
}

.recommend-body {
	padding: 14rpx 14rpx 16rpx;
}

.recommend-title {
	display: -webkit-box;
	overflow: hidden;
	font-size: 28rpx;
	font-weight: 500;
	line-height: 38rpx;
	color: #0f172a;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.recommend-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	margin-top: 14rpx;
}

.recommend-author {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.recommend-avatar {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #ffffff;
}

.recommend-author-name {
	overflow: hidden;
	margin-left: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.recommend-like {
	display: inline-flex;
	align-items: center;
	flex-shrink: 0;
	gap: 6rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.recommend-like-icon {
	font-size: 24rpx;
	line-height: 30rpx;
}

.recommend-like-text {
	font-size: 22rpx;
	line-height: 30rpx;
}
</style>
