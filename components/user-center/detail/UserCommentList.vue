<template>
	<view class="user-comment-list">
		<view v-for="item in commentList" :key="item.id" class="user-comment-item">
			<view class="user-comment-avatar" :style="{ background: item.avatarBackground }">
				<text class="user-comment-avatar-text">{{ item.avatarText }}</text>
			</view>
			<view class="user-comment-body">
				<view class="user-comment-head">
					<text class="user-comment-name">{{ item.nickname }}</text>
					<view class="user-comment-like-action" @tap="emitLike(item.id)">
						<image
							class="user-comment-like-icon"
							:src="item.liked ? userLikeStatActiveIconSvg : userLikeStatOutlineDarkIconSvg"
							mode="aspectFit"
						/>
						<text :class="['user-comment-like-text', item.liked ? 'user-comment-like-text-active' : '']">
							{{ item.likeCountText }}
						</text>
					</view>
				</view>
				<text class="user-comment-content">{{ item.content }}</text>
				<view class="user-comment-meta-row">
					<text class="user-comment-time">{{ item.timeText }}</text>
					<text class="user-comment-action" @tap="emitReply(item)">回复</text>
				</view>

				<view v-if="item.replyCount" class="user-comment-reply-block">
					<view v-if="item.repliesExpanded" class="user-comment-reply-list">
						<view v-for="reply in item.visibleReplyList" :key="reply.id" class="user-comment-reply-item">
							<view class="user-comment-reply-avatar" :style="{ background: reply.avatarBackground }">
								<text class="user-comment-reply-avatar-text">{{ reply.avatarText }}</text>
							</view>
							<view class="user-comment-reply-body">
								<view class="user-comment-reply-head">
									<view class="user-comment-reply-name-block">
										<text class="user-comment-reply-name">{{ reply.nickname }}</text>
										<text v-if="reply.replyToNickname" class="user-comment-reply-target">
											回复 {{ reply.replyToNickname }}
										</text>
									</view>
									<view class="user-comment-like-action" @tap="emitLike(reply.id, item.id)">
										<image
											class="user-comment-like-icon"
											:src="reply.liked ? userLikeStatActiveIconSvg : userLikeStatOutlineDarkIconSvg"
											mode="aspectFit"
										/>
										<text :class="['user-comment-like-text', reply.liked ? 'user-comment-like-text-active' : '']">
											{{ reply.likeCountText }}
										</text>
									</view>
								</view>
								<text class="user-comment-content user-comment-reply-content">{{ reply.content }}</text>
								<view class="user-comment-meta-row user-comment-reply-meta-row">
									<text class="user-comment-time">{{ reply.timeText }}</text>
									<text class="user-comment-action" @tap="emitReply(reply, item.id)">回复</text>
								</view>
							</view>
						</view>
					</view>

					<view class="user-comment-reply-actions">
						<text
							v-if="!item.repliesExpanded"
							class="user-comment-reply-action"
							@tap="emitToggleReplies(item.id, true)"
						>
							展开 {{ item.replyCount }} 条回复
						</text>
						<text
							v-if="item.repliesExpanded && item.hasMoreReplies"
							class="user-comment-reply-action"
							@tap="emitLoadMoreReplies(item.id)"
						>
							继续展开回复
						</text>
						<text
							v-if="item.repliesExpanded"
							class="user-comment-reply-action"
							@tap="emitToggleReplies(item.id, false)"
						>
							收起回复
						</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import {
	userLikeStatActiveIconSvg,
	userLikeStatOutlineDarkIconSvg
} from '@/components/user-center/main/userContentIcons.js'

defineProps({
	commentList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['like-comment', 'reply-comment', 'toggle-replies', 'load-more-replies'])

function emitLike(commentId, parentId = '') {
	emit('like-comment', {
		commentId,
		parentId
	})
}

function emitReply(item, parentId = '') {
	emit('reply-comment', {
		commentId: item.id,
		parentId: parentId || item.id,
		nickname: item.nickname
	})
}

function emitToggleReplies(commentId, expand) {
	emit('toggle-replies', {
		commentId,
		expand
	})
}

function emitLoadMoreReplies(commentId) {
	emit('load-more-replies', {
		commentId
	})
}
</script>

<style scoped>
.user-comment-item {
	display: flex;
	align-items: flex-start;
}

.user-comment-item + .user-comment-item {
	margin-top: 28rpx;
	padding-top: 28rpx;
	border-top: 1rpx solid #eef2f7;
}

.user-comment-avatar,
.user-comment-reply-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	flex-shrink: 0;
}

.user-comment-avatar {
	width: 72rpx;
	height: 72rpx;
}

.user-comment-reply-avatar {
	width: 56rpx;
	height: 56rpx;
}

.user-comment-avatar-text,
.user-comment-reply-avatar-text {
	font-weight: 700;
	line-height: 1;
	color: #ffffff;
}

.user-comment-avatar-text {
	font-size: 24rpx;
}

.user-comment-reply-avatar-text {
	font-size: 20rpx;
}

.user-comment-body,
.user-comment-reply-body {
	flex: 1;
	min-width: 0;
}

.user-comment-body {
	margin-left: 18rpx;
}

.user-comment-reply-body {
	margin-left: 16rpx;
}

.user-comment-head,
.user-comment-reply-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
}

.user-comment-name,
.user-comment-reply-name {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #0f172a;
}

.user-comment-reply-name-block {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10rpx;
}

.user-comment-reply-target {
	font-size: 20rpx;
	line-height: 30rpx;
	color: #94a3b8;
}

.user-comment-like-action {
	display: inline-flex;
	align-items: center;
	gap: 6rpx;
	padding: 4rpx 0;
	flex-shrink: 0;
}

.user-comment-like-icon {
	width: 28rpx;
	height: 28rpx;
}

.user-comment-like-text,
.user-comment-time,
.user-comment-action,
.user-comment-reply-action {
	font-size: 20rpx;
	line-height: 28rpx;
	color: #64748b;
}

.user-comment-like-text-active {
	color: #fe2c55;
}

.user-comment-content {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #334155;
}

.user-comment-reply-content {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 34rpx;
}

.user-comment-meta-row,
.user-comment-reply-actions {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 20rpx;
}

.user-comment-meta-row {
	margin-top: 12rpx;
}

.user-comment-action,
.user-comment-reply-action {
	font-weight: 600;
}

.user-comment-reply-block {
	margin-top: 18rpx;
	padding: 20rpx;
	border-radius: 24rpx;
	background: #f8fafc;
}

.user-comment-reply-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.user-comment-reply-item {
	display: flex;
	align-items: flex-start;
}

.user-comment-reply-actions {
	margin-top: 18rpx;
}
</style>
