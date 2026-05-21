<template>
	<UserVirtualRows
		:row-list="rowList"
		:row-stride-rpx="186"
		:parent-scroll-top-px="parentScrollTopPx"
		:list-start-offset-px="listStartOffsetPx"
		:visible-buffer-rows="14"
		:active="active"
	>
		<template #row="{ row }">
			<view
				v-if="row.items[0]"
				:key="row.rowIndex"
				class="user-history-item"
				@tap="emit('item-click', row.items[0])"
			>
				<view class="user-history-item-main">
					<text class="user-history-item-title">{{ row.items[0].title }}</text>
					<text class="user-history-item-time">{{ row.items[0].timeText }}</text>
				</view>
				<view class="user-history-item-side">
					<text class="user-history-item-type">{{ row.items[0].typeLabel }}</text>
					<text class="user-history-item-arrow">›</text>
				</view>
			</view>
		</template>
	</UserVirtualRows>
</template>

<script setup>
import UserVirtualRows from '@/components/user-center/main/UserVirtualRows.vue'

defineProps({
	rowList: {
		type: Array,
		default: () => []
	},
	parentScrollTopPx: {
		type: Number,
		default: 0
	},
	listStartOffsetPx: {
		type: Number,
		default: 0
	},
	active: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['item-click'])
</script>

<style scoped>
.user-history-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 22rpx;
	margin-bottom: 18rpx;
	border-radius: 26rpx;
	background: #ffffff;
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.1);
}

.user-history-item-main {
	flex: 1;
	min-width: 0;
}

.user-history-item-title {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #0f172a;
}

.user-history-item-time {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.user-history-item-side {
	display: flex;
	align-items: center;
	margin-left: 18rpx;
}

.user-history-item-type {
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: #f8fafc;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #475467;
}

.user-history-item-arrow {
	margin-left: 12rpx;
	font-size: 28rpx;
	line-height: 32rpx;
	color: #98a2b3;
}
</style>
