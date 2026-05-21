<template>
	<UserSubPageLayout title="添加朋友" @back="handleBack">
		<view class="add-friend-search">
			<input
				class="add-friend-input"
				:value="searchKeyword"
				:placeholder="pageMock.searchPlaceholder"
				@input="handleSearchInput"
			/>
		</view>

		<UserSectionCard class="add-friend-section" title="推荐添加">
			<view
				v-for="item in displaySuggestionList"
				:key="item.id"
				class="add-friend-item"
			>
				<view class="add-friend-avatar" :style="{ background: item.avatarBackground }">
					<text class="add-friend-avatar-text">{{ item.avatarText }}</text>
				</view>

				<view class="add-friend-meta">
					<text class="add-friend-name">{{ item.nickname }}</text>
					<text class="add-friend-id">ID：{{ item.displayId }}</text>
					<text class="add-friend-desc">{{ item.desc }}</text>
				</view>

				<view class="add-friend-button" @tap="handleAddFriend(item)">添加</view>
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getAddFriendPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getAddFriendPageMock())
const searchKeyword = ref('')

const displaySuggestionList = computed(() => {
	const keyword = searchKeyword.value.trim().toLowerCase()
	if (!keyword) {
		return pageMock.value.suggestionList || []
	}

	return (pageMock.value.suggestionList || []).filter(
		(item) =>
			item.nickname.toLowerCase().includes(keyword) ||
			item.displayId.toLowerCase().includes(keyword)
	)
})

onLoad((options) => {
	pageMock.value = getAddFriendPageMock(options?.userId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleSearchInput(event) {
	searchKeyword.value = event.detail.value
	onSearchChange(searchKeyword.value)
}

function handleAddFriend(item) {
	onAddFriend(item)
	uni.showToast({
		title: '好友申请占位',
		icon: 'none'
	})
}

function onSearchChange(keyword) {
	// TODO：替换添加朋友搜索接口
	console.log('user-add-friend-search', keyword)
}

function onAddFriend(item) {
	// TODO：替换添加朋友提交逻辑
	console.log('user-add-friend-submit', item.id)
}
</script>

<style scoped>
.add-friend-search {
	margin-top: 12rpx;
}

.add-friend-input {
	height: 84rpx;
	padding: 0 24rpx;
	border-radius: 26rpx;
	background: #ffffff;
	font-size: 24rpx;
	color: #0f172a;
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.1);
}

.add-friend-section {
	margin-top: 20rpx;
}

.add-friend-item {
	display: flex;
	align-items: center;
}

.add-friend-item + .add-friend-item {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #eef2f7;
}

.add-friend-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 86rpx;
	height: 86rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.add-friend-avatar-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.add-friend-meta {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.add-friend-name,
.add-friend-id,
.add-friend-desc {
	display: block;
}

.add-friend-name {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.add-friend-id,
.add-friend-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.add-friend-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 68rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
