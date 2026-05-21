<template>
	<view class="contribution-rank">
		<scroll-view class="contribution-scroll" scroll-y show-scrollbar="false">
			<view
				v-for="item in displayList"
				:key="item.userId"
				:class="['contribution-row', getRankClass(item.rank), item.userId === userId ? 'contribution-row-self' : '']"
				@tap="emit('user-item-click', item)"
			>
				<view class="contribution-rank-badge">
					{{ formatRank(item.rank) }}
				</view>
				<view class="contribution-avatar" :style="{ background: item.avatar }"></view>
				<view class="contribution-user-info">
					<text class="contribution-user-name">{{ item.nickname }}</text>
					<text v-if="item.vipLevel > 0" class="contribution-vip">VIP{{ item.vipLevel }}</text>
				</view>
				<text class="contribution-score">{{ item.score }}</text>
			</view>
		</scroll-view>

		<view class="contribution-my-rank">
			<view class="contribution-rank-badge contribution-rank-badge-self">
				{{ myRankText }}
			</view>
			<view class="contribution-avatar" :style="{ background: myRankUser.avatar }"></view>
			<view class="contribution-user-info">
				<text class="contribution-user-name">{{ myRankUser.nickname }}</text>
				<text v-if="myRankUser.vipLevel > 0" class="contribution-vip">VIP{{ myRankUser.vipLevel }}</text>
			</view>
			<text class="contribution-score">{{ myRankUser.score }}</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	list: {
		type: Array,
		default: () => []
	},
	myRank: {
		type: [String, Number],
		default: '99+'
	},
	userId: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['user-item-click'])

// 限制榜单显示数量，避免一次性渲染过多节点。
const displayList = computed(() => {
	return props.list.slice(0, 99)
})

// 提取当前用户自己的榜单信息，没有时用默认占位对象兜底。
const myRankUser = computed(() => {
	return (
		props.list.find((item) => item.userId === props.userId) || {
			userId: props.userId || 'self-user',
			nickname: '我',
			avatar: 'linear-gradient(135deg, rgba(255, 196, 86, 0.92) 0%, rgba(255, 151, 45, 0.92) 100%)',
			vipLevel: 0,
			score: '--'
		}
	)
})

// 统一处理“我的排名”显示文案。
const myRankText = computed(() => {
	return `${props.myRank || '99+'}`
})

// 根据前三名排名返回不同的行样式 class。
function getRankClass(rank) {
	if (rank === 1) {
		return 'contribution-row-rank-1'
	}

	if (rank === 2) {
		return 'contribution-row-rank-2'
	}

	if (rank === 3) {
		return 'contribution-row-rank-3'
	}

	return ''
}

// 对排名数字做上限格式化，超出 99 统一显示 99+。
function formatRank(rank) {
	return rank <= 99 ? rank : '99+'
}
</script>

<style scoped>
.contribution-rank {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
}

.contribution-scroll {
	flex: 1;
	min-height: 0;
}

.contribution-row,
.contribution-my-rank {
	display: flex;
	align-items: center;
	height: 88rpx;
	padding: 0 8rpx 0 4rpx;
	border-radius: 24rpx;
	box-sizing: border-box;
}

.contribution-row + .contribution-row {
	margin-top: 8rpx;
}

.contribution-row-rank-1 {
	background: linear-gradient(135deg, rgba(255, 241, 208, 0.96) 0%, rgba(255, 222, 162, 0.9) 100%);
}

.contribution-row-rank-2 {
	background: linear-gradient(135deg, rgba(241, 247, 255, 0.96) 0%, rgba(221, 232, 248, 0.9) 100%);
}

.contribution-row-rank-3 {
	background: linear-gradient(135deg, rgba(255, 235, 224, 0.96) 0%, rgba(246, 205, 175, 0.9) 100%);
}

.contribution-row-self,
.contribution-my-rank {
	background: rgba(249, 250, 252, 0.96);
	border: 1rpx solid rgba(30, 41, 59, 0.06);
	box-shadow: 0 10rpx 28rpx rgba(148, 163, 184, 0.12);
}

.contribution-my-rank {
	flex-shrink: 0;
	margin-top: 12rpx;
}

.contribution-rank-badge {
	width: 66rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	text-align: center;
	color: #1e293b;
	flex-shrink: 0;
}

.contribution-rank-badge-self {
	color: #2563eb;
}

.contribution-avatar {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.contribution-user-info {
	display: flex;
	align-items: center;
	min-width: 0;
	margin-left: 16rpx;
	flex: 1;
}

.contribution-user-name {
	max-width: 220rpx;
	font-size: 26rpx;
	line-height: 34rpx;
	color: #0f172a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.contribution-vip {
	margin-left: 10rpx;
	padding: 2rpx 10rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fda4af 0%, #c084fc 100%);
	font-size: 18rpx;
	font-weight: 600;
	line-height: 26rpx;
	color: #ffffff;
	flex-shrink: 0;
}

.contribution-score {
	margin-left: 16rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #475569;
	flex-shrink: 0;
}

/* #ifdef H5 */
.contribution-scroll::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}
/* #endif */
</style>
