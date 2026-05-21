<template>
	<UserSubPageLayout title="回应消息" @back="handleBack">
		<UserSectionCard>
			<text class="playmate-reply-desc">{{ pageMock.desc }}</text>
			<view class="playmate-reply-tab-row">
				<view
					v-for="item in pageMock.tabList"
					:key="item.key"
					:class="['playmate-reply-tab', activeTab === item.key ? 'playmate-reply-tab-active' : '']"
					@tap="handleTabChange(item)"
				>
					{{ item.label }}
				</view>
			</view>
		</UserSectionCard>

		<UserSectionCard class="playmate-reply-gap">
			<view v-for="item in displayReplyList" :key="item.id" class="playmate-reply-item">
				<view class="playmate-reply-main" @tap="handleProfileOpen(item)">
					<view class="playmate-reply-avatar" :style="{ background: item.author.avatarBackground }">
						<text class="playmate-reply-avatar-text">{{ item.author.avatarText }}</text>
					</view>
					<view class="playmate-reply-meta">
						<view class="playmate-reply-name-row">
							<text class="playmate-reply-name">{{ item.author.nickname }}</text>
							<text class="playmate-reply-action">{{ item.actionText }}</text>
						</view>
						<text class="playmate-reply-text">{{ item.desc }}</text>
						<text class="playmate-reply-source">来自：{{ item.sourceTitle }}</text>
					</view>
				</view>

				<view class="playmate-reply-side">
					<text class="playmate-reply-time">{{ item.timeText }}</text>
					<view class="playmate-reply-button" @tap="handleQuickReply(item)">回一下</view>
				</view>
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getPlaymateReplyListPageMock } from '@/components/friend/playmateMock.js'

const pageMock = ref(getPlaymateReplyListPageMock())
const activeTab = ref('all')

const displayReplyList = computed(() => {
	if (activeTab.value === 'all') {
		return pageMock.value.replyList || []
	}

	return (pageMock.value.replyList || []).filter((item) => item.actionKey === activeTab.value)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleTabChange(item) {
	activeTab.value = item.key
	onReplyTabChange(item)
}

function handleProfileOpen(item) {
	onReplyProfileOpen(item)
	if (!item.profileUrl) {
		return
	}

	uni.navigateTo({
		url: item.profileUrl
	})
}

function handleQuickReply(item) {
	onQuickReply(item)
	uni.showToast({
		title: '快速回应占位',
		icon: 'none'
	})
}

function onReplyTabChange(item) {
	// TODO：替换回应消息筛选逻辑
	console.log('playmate-reply-tab-change', item.key)
}

function onReplyProfileOpen(item) {
	// TODO：替换回应消息资料跳转逻辑
	console.log('playmate-reply-profile-open', item.id)
}

function onQuickReply(item) {
	// TODO：替换回应消息快速回应逻辑
	console.log('playmate-quick-reply', item.id)
}
</script>

<style scoped>
.playmate-reply-gap {
	margin-top: 20rpx;
}

.playmate-reply-desc,
.playmate-reply-name,
.playmate-reply-action,
.playmate-reply-text,
.playmate-reply-source,
.playmate-reply-time {
	display: block;
}

.playmate-reply-desc {
	font-size: 24rpx;
	line-height: 36rpx;
	color: #475467;
}

.playmate-reply-tab-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
}

.playmate-reply-tab {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 56rpx;
	padding: 0 20rpx;
	border-radius: 999rpx;
	background: rgba(248, 250, 252, 0.94);
	font-size: 22rpx;
	color: #475467;
}

.playmate-reply-tab-active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.14) 0%, rgba(255, 196, 160, 0.22) 100%);
	color: #d94f7b;
}

.playmate-reply-item {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
}

.playmate-reply-item + .playmate-reply-item {
	margin-top: 22rpx;
	padding-top: 22rpx;
	border-top: 1rpx solid rgba(226, 232, 240, 0.72);
}

.playmate-reply-main {
	display: flex;
	flex: 1;
	min-width: 0;
}

.playmate-reply-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 82rpx;
	height: 82rpx;
	border-radius: 26rpx;
	flex-shrink: 0;
}

.playmate-reply-avatar-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.playmate-reply-meta {
	flex: 1;
	min-width: 0;
	margin-left: 16rpx;
}

.playmate-reply-name-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10rpx;
}

.playmate-reply-name {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.playmate-reply-action {
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #d94f7b;
}

.playmate-reply-text {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #475467;
}

.playmate-reply-source {
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #98a2b3;
}

.playmate-reply-side {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12rpx;
	flex-shrink: 0;
}

.playmate-reply-time {
	font-size: 20rpx;
	line-height: 28rpx;
	color: #98a2b3;
}

.playmate-reply-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 50rpx;
	padding: 0 16rpx;
	border-radius: 999rpx;
	background: rgba(248, 250, 252, 0.94);
	font-size: 20rpx;
	font-weight: 600;
	color: #475467;
}
</style>
