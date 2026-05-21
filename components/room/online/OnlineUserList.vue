<template>
	<scroll-view class="online-user-list" scroll-y show-scrollbar="false">
		<view
			v-for="item in sortedList"
			:key="item.userId"
			class="online-user-row"
			@tap="emit('user-item-click', item)"
		>
			<view class="online-user-rank">{{ formatRank(item.rank) }}</view>
			<view class="online-user-avatar" :style="{ background: item.avatar }"></view>
			<view class="online-user-info">
				<text class="online-user-name">{{ item.nickname }}</text>
				<text v-if="item.vipLevel > 0" class="online-user-vip">VIP{{ item.vipLevel }}</text>
			</view>
			<text class="online-user-score">{{ item.score }}</text>
		</view>
	</scroll-view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	list: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['user-item-click'])

// 对在线用户按积分做降序排列，保证展示结果稳定。
const sortedList = computed(() => {
	return [...props.list].sort((left, right) => {
		return Number(right.score) - Number(left.score)
	})
})

// 对排名数字做上限格式化，超出 99 统一显示 99+。
function formatRank(rank) {
	return rank <= 99 ? rank : '99+'
}
</script>

<style scoped>
.online-user-list {
	height: 100%;
}

.online-user-row {
	display: flex;
	align-items: center;
	height: 88rpx;
	padding: 0 8rpx 0 4rpx;
	border-radius: 24rpx;
	background: rgba(248, 250, 252, 0.96);
	box-sizing: border-box;
}

.online-user-row + .online-user-row {
	margin-top: 8rpx;
}

.online-user-rank {
	width: 66rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	text-align: center;
	color: #334155;
	flex-shrink: 0;
}

.online-user-avatar {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.online-user-info {
	display: flex;
	align-items: center;
	min-width: 0;
	margin-left: 16rpx;
	flex: 1;
}

.online-user-name {
	max-width: 220rpx;
	font-size: 26rpx;
	line-height: 34rpx;
	color: #0f172a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.online-user-vip {
	margin-left: 10rpx;
	padding: 2rpx 10rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
	font-size: 18rpx;
	font-weight: 600;
	line-height: 26rpx;
	color: #ffffff;
	flex-shrink: 0;
}

.online-user-score {
	margin-left: 16rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #475569;
	flex-shrink: 0;
}

/* #ifdef H5 */
.online-user-list::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}
/* #endif */
</style>
