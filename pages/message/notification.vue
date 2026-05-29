<template>
	<UserSubPageLayout :title="pageMock.title" @back="handleBack">
		<UserSectionCard>
			<view class="notification-summary-row">
				<view>
					<text class="notification-summary-title">通知中心</text>
					<text class="notification-summary-text">{{ pageMock.helperText }}</text>
				</view>
				<view class="notification-summary-badge">
					<text class="notification-summary-badge-text">{{ unreadCount }} 条未读</text>
				</view>
			</view>
		</UserSectionCard>

		<UserSectionCard class="notification-section-gap">
			<template #header>
				<view class="notification-card-header">
					<text class="notification-card-title">最近通知</text>
					<text class="notification-card-subtitle">{{ notificationList.length }} 条</text>
				</view>
			</template>

			<view
				v-for="item in notificationList"
				:key="item.id"
				class="notification-item"
				@tap="handleNotificationItemClick(item)"
			>
				<view class="notification-avatar-shell">
					<view class="notification-avatar" :style="{ background: item.avatarBackground }">
						{{ item.avatarText }}
					</view>
					<view v-if="item.unread" class="notification-unread-dot"></view>
				</view>

				<view class="notification-item-main">
					<view class="notification-item-top">
						<text class="notification-item-title">{{ item.title }}</text>
						<text class="notification-item-time">{{ item.timeText }}</text>
					</view>
					<text class="notification-item-summary">{{ item.summary }}</text>
					<view class="notification-item-bottom">
						<text class="notification-item-category">{{ item.category }}</text>
						<text class="notification-item-action">点击查看</text>
					</view>
				</view>
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import { dispatchNavigationAction } from '@/components/common/navigation/navigationActionRouter.js'
import { buildMessageNotificationPageMock } from '@/components/message/messageMock.js'

const pageMock = buildMessageNotificationPageMock()
const notificationList = ref(pageMock.notificationList.map((item) => ({ ...item })))
const unreadCount = computed(() => notificationList.value.filter((item) => item.unread).length)

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleNotificationItemClick(item) {
	if (item.unread) {
		item.unread = false
	}

	const result = dispatchNavigationAction(item.actionUrl, item.actionPayload)
	if (!result.handled) {
		uni.showToast({
			title: '协议未识别',
			icon: 'none'
		})
	}
}
</script>

<style scoped>
.notification-summary-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
}

.notification-summary-title {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.notification-summary-text {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #64748b;
}

.notification-summary-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0 22rpx;
	height: 64rpx;
	border-radius: 999rpx;
	background: rgba(255, 241, 244, 0.96);
	flex-shrink: 0;
}

.notification-summary-badge-text {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #ff6f91;
}

.notification-section-gap {
	margin-top: 20rpx;
}

.notification-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.notification-card-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.notification-card-subtitle {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #94a3b8;
}

.notification-item {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
}

.notification-item + .notification-item {
	margin-top: 22rpx;
	padding-top: 22rpx;
	border-top: 1rpx solid rgba(226, 232, 240, 0.84);
}

.notification-avatar-shell {
	position: relative;
	width: 84rpx;
	height: 84rpx;
	flex-shrink: 0;
}

.notification-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 84rpx;
	height: 84rpx;
	border-radius: 28rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
}

.notification-unread-dot {
	position: absolute;
	top: 0;
	right: 0;
	width: 18rpx;
	height: 18rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.96);
	border-radius: 50%;
	background: #ff6f91;
	box-sizing: border-box;
}

.notification-item-main {
	flex: 1;
	min-width: 0;
}

.notification-item-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
}

.notification-item-title {
	flex: 1;
	min-width: 0;
	font-size: 28rpx;
	font-weight: 600;
	line-height: 38rpx;
	color: #0f172a;
}

.notification-item-time {
	font-size: 22rpx;
	line-height: 32rpx;
	color: #94a3b8;
	flex-shrink: 0;
}

.notification-item-summary {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #475569;
}

.notification-item-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 14rpx;
	gap: 16rpx;
}

.notification-item-category {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #ff6f91;
}

.notification-item-action {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #94a3b8;
}
</style>
