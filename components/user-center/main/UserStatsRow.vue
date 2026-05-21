<template>
	<view class="user-stats-row">
		<view class="user-stats-list">
			<view
				v-for="item in statsList"
				:key="item.key"
				class="user-stats-item"
				@tap="emit('stat-click', item)"
			>
				<text class="user-stats-item-value">{{ item.value }}</text>
				<text class="user-stats-item-label">{{ item.label }}</text>
			</view>
		</view>

		<view class="user-stats-edit-button" @tap="emit('edit-click')">编辑主页</view>
	</view>
</template>

<script setup>
defineProps({
	statsList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['stat-click', 'edit-click'])
</script>

<style scoped>
.user-stats-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.user-stats-list {
	display: flex;
	align-items: center;
	flex: 1;
	gap: 34rpx;
}

.user-stats-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.user-stats-item-value {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.user-stats-item-label {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.user-stats-edit-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 68rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.12) 0%, rgba(255, 196, 160, 0.2) 100%);
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #0f172a;
}
</style>
