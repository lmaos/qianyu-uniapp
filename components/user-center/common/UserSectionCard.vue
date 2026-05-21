<template>
	<view class="user-section-card" :style="{ background: USER_SUB_PAGE_CARD_BACKGROUND }">
		<view v-if="title || $slots.header" class="user-section-card-header">
			<slot name="header">
				<text class="user-section-card-title">{{ title }}</text>
			</slot>
		</view>
		<slot />
	</view>
</template>

<script setup>
import { USER_SUB_PAGE_CARD_BACKGROUND } from '@/components/user-center/common/userSubPageSurface.js'

defineProps({
	title: {
		type: String,
		default: ''
	}
})
</script>

<style scoped>
.user-section-card {
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 40rpx rgba(148, 163, 184, 0.1);
}

.user-section-card-header {
	margin-bottom: 20rpx;
}

.user-section-card-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}
</style>
