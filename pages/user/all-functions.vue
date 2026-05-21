<template>
	<UserSubPageLayout title="全部功能" @back="handleBack">
		<UserSectionCard title="常用功能">
			<UserQuickActionRow :action-list="pageMock.actionList" @action-click="handleActionClick" />
		</UserSectionCard>

		<UserSectionCard class="all-functions-section-gap" title="功能说明">
			<view
				v-for="item in pageMock.functionList"
				:key="item.key"
				class="all-functions-item"
				@tap="handleMenuSelect(item)"
			>
				<view class="all-functions-item-icon-wrap">
					<image class="all-functions-item-icon" :src="item.iconSvg" mode="aspectFit" />
				</view>
				<view class="all-functions-item-main">
					<text class="all-functions-item-label">{{ item.label }}</text>
					<text class="all-functions-item-desc">点击进入 {{ item.label }} 页面占位</text>
				</view>
				<image class="all-functions-item-arrow" :src="userCenterArrowIconSvg" mode="aspectFit" />
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { userCenterArrowIconSvg } from '@/components/user-center/main/userCenterIcons.js'
import UserQuickActionRow from '@/components/user-center/main/UserQuickActionRow.vue'
import { getAllFunctionsPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getAllFunctionsPageMock())

onLoad((options) => {
	pageMock.value = getAllFunctionsPageMock(options?.userId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleActionClick(item) {
	onActionClick(item)
	if (item.url) {
		uni.navigateTo({
			url: item.url
		})
		return
	}

	uni.showToast({
		title: `${item.label}占位`,
		icon: 'none'
	})
}

function handleMenuSelect(item) {
	onMenuSelect(item)
	if (item.url) {
		uni.navigateTo({
			url: item.url
		})
		return
	}

	uni.showToast({
		title: `${item.label}占位`,
		icon: 'none'
	})
}

function onActionClick(item) {
	// TODO：替换全部功能快捷入口逻辑
	console.log('user-all-functions-action', item.key)
}

function onMenuSelect(item) {
	// TODO：替换全部功能菜单点击逻辑
	console.log('user-all-functions-menu', item.key || item.label)
}
</script>

<style scoped>
.all-functions-section-gap {
	margin-top: 20rpx;
}

:deep(.user-quick-action-row) {
	gap: 4rpx;
}

:deep(.user-quick-action-item) {
	padding-top: 6rpx;
	padding-bottom: 6rpx;
}

:deep(.user-quick-action-icon) {
	width: 42rpx;
	height: 42rpx;
}

:deep(.user-quick-action-label) {
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #475467;
}

.all-functions-item + .all-functions-item {
	margin-top: 18rpx;
	padding-top: 18rpx;
	border-top: 1rpx solid #eef2f7;
}

.all-functions-item {
	display: flex;
	align-items: center;
}

.all-functions-item-icon-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	flex-shrink: 0;
}

.all-functions-item-icon {
	width: 38rpx;
	height: 38rpx;
}

.all-functions-item-main {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.all-functions-item-label,
.all-functions-item-desc {
	display: block;
}

.all-functions-item-label {
	font-size: 26rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #0f172a;
}

.all-functions-item-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.all-functions-item-arrow {
	width: 20rpx;
	height: 20rpx;
	margin-left: 18rpx;
	flex-shrink: 0;
}
</style>
