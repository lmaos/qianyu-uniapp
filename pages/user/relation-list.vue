<template>
	<UserSubPageLayout :title="pageMock.title" @back="handleBack">
		<UserSectionCard>
			<view
				v-for="item in pageMock.relationList"
				:key="item.id"
				class="relation-item"
			>
				<view class="relation-item-main" @tap="handleOpenProfile(item)">
					<view class="relation-avatar" :style="{ background: item.avatarBackground }">
						<text class="relation-avatar-text">{{ item.avatarText }}</text>
					</view>

					<view class="relation-meta">
						<text class="relation-name">{{ item.nickname }}</text>
						<text class="relation-desc">{{ item.desc }}</text>
					</view>
				</view>

				<view class="relation-action" @tap="handleRelationAction(item)">{{ item.actionText }}</view>
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getRelationListPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getRelationListPageMock())

onLoad((options) => {
	pageMock.value = getRelationListPageMock(options?.type, options?.userId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleOpenProfile(item) {
	onRelationProfileClick(item)
	uni.navigateTo({
		url: item.profileUrl
	})
}

function handleRelationAction(item) {
	onRelationAction(item)
	uni.showToast({
		title: `${item.actionText}回调占位`,
		icon: 'none'
	})
}

function onRelationProfileClick(item) {
	// TODO：替换关系链资料跳转逻辑
	console.log('user-relation-profile-click', item.id)
}

function onRelationAction(item) {
	// TODO：替换关注/回关逻辑
	console.log('user-relation-action', item.id)
}
</script>

<style scoped>
.relation-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.relation-item + .relation-item {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #eef2f7;
}

.relation-item-main {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.relation-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 86rpx;
	height: 86rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.relation-avatar-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.relation-meta {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.relation-name {
	display: block;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.relation-desc {
	display: block;
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.relation-action {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 66rpx;
	padding: 0 24rpx;
	margin-left: 18rpx;
	border-radius: 999rpx;
	background: #f8fafc;
	font-size: 24rpx;
	font-weight: 600;
	color: #0f172a;
}
</style>
