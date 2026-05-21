<template>
	<view class="goods-evaluate-card" @tap="handleOpen">
		<view class="goods-evaluate-header">
			<view>
				<text class="goods-evaluate-title">买家评价</text>
				<text class="goods-evaluate-subtitle">共 {{ summary.totalCount }} 条，近 7 天好评率 {{ summary.sevenDayPositiveRate }}</text>
			</view>
			<text class="goods-evaluate-more">查看全部</text>
		</view>

		<view class="goods-evaluate-stat-row">
			<view class="goods-evaluate-stat-item">
				<text class="goods-evaluate-stat-value">{{ summary.goodRate }}</text>
				<text class="goods-evaluate-stat-label">好评占比</text>
			</view>
			<view class="goods-evaluate-stat-item">
				<text class="goods-evaluate-stat-value">{{ summary.neutralCount }}</text>
				<text class="goods-evaluate-stat-label">中评数量</text>
			</view>
			<view class="goods-evaluate-stat-item">
				<text class="goods-evaluate-stat-value">{{ summary.badCount }}</text>
				<text class="goods-evaluate-stat-label">差评数量</text>
			</view>
		</view>

		<view v-for="item in displayReviewList" :key="item.id" class="goods-evaluate-item">
			<view class="goods-evaluate-user-row">
				<view class="goods-evaluate-avatar" :style="{ background: item.avatarBackground }">
					{{ item.avatarText }}
				</view>
				<view class="goods-evaluate-user-meta">
					<text class="goods-evaluate-user-name">{{ item.nickname }}</text>
					<text class="goods-evaluate-user-level">{{ item.memberLevel }}</text>
				</view>
			</view>
			<text class="goods-evaluate-content">{{ item.content }}</text>
			<view v-if="item.imageList.length" class="goods-evaluate-image-row">
				<view
					v-for="imageItem in item.imageList"
					:key="imageItem.id"
					class="goods-evaluate-image"
					:style="{ background: imageItem.background }"
				>
					{{ imageItem.label }}
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	summary: {
		type: Object,
		default: () => ({
			totalCount: 0,
			sevenDayPositiveRate: '0%',
			goodRate: '0%',
			neutralCount: 0,
			badCount: 0
		})
	},
	reviewList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['open'])

// 详情页默认只展示 3 条评价。
const displayReviewList = computed(() => {
	return props.reviewList.slice(0, 3)
})

// 点击评价卡片后进入评价详情页。
function handleOpen() {
	emit('open')
}
</script>

<style scoped>
.goods-evaluate-card {
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.goods-evaluate-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 20rpx;
}

.goods-evaluate-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 40rpx;
	color: #111827;
}

.goods-evaluate-subtitle {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.goods-evaluate-more {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.goods-evaluate-stat-row {
	display: flex;
	gap: 16rpx;
	margin-top: 22rpx;
}

.goods-evaluate-stat-item {
	flex: 1;
	padding: 20rpx 12rpx;
	border-radius: 24rpx;
	background: #f8fafc;
	text-align: center;
}

.goods-evaluate-stat-value {
	display: block;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #111827;
}

.goods-evaluate-stat-label {
	display: block;
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #667085;
}

.goods-evaluate-item {
	padding-top: 24rpx;
	margin-top: 24rpx;
	border-top: 1rpx solid #eef2f7;
}

.goods-evaluate-user-row {
	display: flex;
	align-items: center;
}

.goods-evaluate-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	font-weight: 700;
	line-height: 28rpx;
	color: rgba(17, 24, 39, 0.72);
}

.goods-evaluate-user-meta {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	margin-left: 14rpx;
}

.goods-evaluate-user-name {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #111827;
}

.goods-evaluate-user-level {
	margin-left: 12rpx;
	padding: 2rpx 10rpx;
	border-radius: 999rpx;
	font-size: 18rpx;
	line-height: 24rpx;
	color: #fe2c55;
	background: rgba(254, 44, 85, 0.08);
}

.goods-evaluate-content {
	display: -webkit-box;
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #344054;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
}

.goods-evaluate-image-row {
	display: flex;
	gap: 12rpx;
	margin-top: 16rpx;
}

.goods-evaluate-image {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 132rpx;
	height: 132rpx;
	border-radius: 20rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: rgba(17, 24, 39, 0.68);
}
</style>
