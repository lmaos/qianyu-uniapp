<template>
	<view class="user-menu-list">
		<view
			v-for="item in itemList"
			:key="item.key"
			class="user-menu-item"
			@tap="emit('select', item)"
		>
			<view class="user-menu-item-main">
				<text class="user-menu-item-label">{{ item.label }}</text>
				<text v-if="item.desc" class="user-menu-item-desc">{{ item.desc }}</text>
			</view>
			<view class="user-menu-item-side">
				<text v-if="item.value" class="user-menu-item-value">{{ item.value }}</text>
				<text class="user-menu-item-arrow">›</text>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	itemList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['select'])
</script>

<style scoped>
.user-menu-item + .user-menu-item {
	margin-top: 18rpx;
	padding-top: 18rpx;
	border-top: 1rpx solid #eef2f7;
}

.user-menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.user-menu-item-main {
	flex: 1;
	min-width: 0;
}

.user-menu-item-label {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #0f172a;
}

.user-menu-item-desc {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #64748b;
}

.user-menu-item-side {
	display: flex;
	align-items: center;
	margin-left: 20rpx;
}

.user-menu-item-value {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.user-menu-item-arrow {
	margin-left: 10rpx;
	font-size: 28rpx;
	line-height: 32rpx;
	color: #98a2b3;
}
</style>
