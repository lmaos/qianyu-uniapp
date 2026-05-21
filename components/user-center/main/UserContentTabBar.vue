<template>
	<view class="user-content-tab-bar">
		<view
			v-for="item in props.tabList"
			:key="item.key"
			class="user-content-tab-item"
			:class="{
				'user-content-tab-item--active': item.key === props.activeTab,
				'user-content-tab-item--loading': Boolean(item.loading)
			}"
			@tap="emit('change', item)"
		>
			<view v-if="item.loading" class="user-content-tab-loading">
				<view class="user-content-tab-spinner"></view>
			</view>
			<text v-else class="user-content-tab-text">{{ item.label }}</text>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	tabList: {
		type: Array,
		default: () => []
	},
	activeTab: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['change'])
</script>

<style scoped>
.user-content-tab-bar {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding-bottom: 8rpx;
}

.user-content-tab-item {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 62rpx;
	padding: 0 28rpx;
	border-radius: 999rpx;
	background: linear-gradient(180deg, #ffffff 0%, #fff8fb 100%);
}

.user-content-tab-item--active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.14) 0%, rgba(255, 196, 160, 0.2) 100%);
}

.user-content-tab-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #475467;
}

.user-content-tab-loading {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 52rpx;
	height: 36rpx;
}

.user-content-tab-spinner {
	width: 28rpx;
	height: 28rpx;
	border: 4rpx solid rgba(152, 162, 179, 0.22);
	border-top-color: #fe2c55;
	border-radius: 50%;
	animation: user-content-tab-spin 0.72s linear infinite;
}

.user-content-tab-item--loading .user-content-tab-spinner {
	border-top-color: #0f172a;
}

.user-content-tab-item--active .user-content-tab-text {
	font-weight: 700;
	color: #d94f7b;
}

@keyframes user-content-tab-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
