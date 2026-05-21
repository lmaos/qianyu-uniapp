<template>
	<view class="user-comment-list">
		<view v-for="item in commentList" :key="item.id" class="user-comment-item">
			<view class="user-comment-avatar" :style="{ background: item.avatarBackground }">
				<text class="user-comment-avatar-text">{{ item.avatarText }}</text>
			</view>
			<view class="user-comment-body">
				<view class="user-comment-head">
					<text class="user-comment-name">{{ item.nickname }}</text>
					<text class="user-comment-like">赞 {{ item.likeCountText }}</text>
				</view>
				<text class="user-comment-content">{{ item.content }}</text>
				<text class="user-comment-time">{{ item.timeText }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	commentList: {
		type: Array,
		default: () => []
	}
})
</script>

<style scoped>
.user-comment-item {
	display: flex;
	align-items: flex-start;
}

.user-comment-item + .user-comment-item {
	margin-top: 24rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid #eef2f7;
}

.user-comment-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.user-comment-avatar-text {
	font-size: 24rpx;
	font-weight: 700;
	line-height: 1;
	color: #ffffff;
}

.user-comment-body {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.user-comment-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.user-comment-name {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #0f172a;
}

.user-comment-like,
.user-comment-time {
	font-size: 20rpx;
	line-height: 28rpx;
	color: #64748b;
}

.user-comment-content {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #334155;
}

.user-comment-time {
	display: block;
	margin-top: 10rpx;
}
</style>
