<template>
	<view class="hot-rank-card" @tap="handleClick">
		<view class="hot-rank-chip">{{ card.label || '实时热榜' }}</view>
		<view class="hot-rank-user">
			<view class="hot-rank-avatar" :style="{ background: card.avatarBackground }">
				{{ card.avatarText }}
			</view>
			<text class="hot-rank-name">TOP1 {{ card.name }}</text>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	card: {
		type: Object,
		default: () => ({
			label: '',
			name: '',
			avatarText: '',
			avatarBackground: '',
			actionText: ''
		})
	}
})

const emit = defineEmits(['click'])

// 热门榜卡片点击后，将整张卡片数据回传给父组件。
function handleClick() {
	emit('click', props.card)
}
</script>

<style scoped>
.hot-rank-card {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 14rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 126, 164, 0.22) 0%, rgba(75, 80, 152, 0.14) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.16);
}

.hot-rank-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 32rpx;
	padding: 0 10rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.12);
	font-size: 16rpx;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.86);
	flex-shrink: 0;
}

.hot-rank-user {
	display: flex;
	align-items: center;
	min-width: 0;
	margin-left: 10rpx;
}

.hot-rank-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36rpx;
	height: 36rpx;
	border-radius: 12rpx;
	font-size: 16rpx;
	font-weight: 700;
	color: #ffffff;
	flex-shrink: 0;
}

.hot-rank-name {
	margin-left: 10rpx;
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #ffffff;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
