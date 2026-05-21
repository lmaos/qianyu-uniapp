<template>
	<UserSubPageLayout title="新访客" @back="handleBack">
		<UserSectionCard>
			<text class="visitor-total-text">{{ pageMock.totalText }}</text>
		</UserSectionCard>

		<UserSectionCard class="visitor-section-gap" title="最近访问">
			<view
				v-for="item in pageMock.visitorList"
				:key="item.id"
				class="visitor-item"
				@tap="handleVisitorProfile(item)"
			>
				<view class="visitor-avatar" :style="{ background: item.avatarBackground }">
					<text class="visitor-avatar-text">{{ item.avatarText }}</text>
				</view>

				<view class="visitor-meta">
					<text class="visitor-name">{{ item.nickname }}</text>
					<text class="visitor-desc">{{ item.desc }}</text>
				</view>

				<text class="visitor-time">{{ item.timeText }}</text>
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getVisitorListPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getVisitorListPageMock())

onLoad((options) => {
	pageMock.value = getVisitorListPageMock(options?.userId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleVisitorProfile(item) {
	onVisitorProfileClick(item)
	uni.navigateTo({
		url: item.profileUrl
	})
}

function onVisitorProfileClick(item) {
	// TODO：替换访客资料跳转逻辑
	console.log('user-visitor-profile-click', item.id)
}
</script>

<style scoped>
.visitor-total-text {
	display: block;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #475467;
}

.visitor-section-gap {
	margin-top: 20rpx;
}

.visitor-item {
	display: flex;
	align-items: center;
}

.visitor-item + .visitor-item {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #eef2f7;
}

.visitor-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 86rpx;
	height: 86rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.visitor-avatar-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.visitor-meta {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.visitor-name {
	display: block;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.visitor-desc {
	display: block;
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.visitor-time {
	margin-left: 16rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}
</style>
