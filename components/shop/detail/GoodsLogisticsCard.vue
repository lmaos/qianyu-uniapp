<template>
	<view class="goods-logistics-card">
		<view class="goods-logistics-row">
			<text class="goods-logistics-label">发货</text>
			<text class="goods-logistics-value">
				{{ logisticsInfo.shipTime === '暂无货' ? '暂无货' : `${logisticsInfo.shipTime} · ${logisticsInfo.logisticName}` }}
			</text>
		</view>
		<view v-if="afterSaleTagList.length" class="goods-logistics-tag-row">
			<text v-for="item in afterSaleTagList" :key="item" class="goods-logistics-tag">{{ item }}</text>
		</view>
	</view>
</template>

<script setup>
defineProps({
	logisticsInfo: {
		type: Object,
		default: () => ({
			shipTime: '暂无货',
			logisticName: '暂无货'
		})
	},
	afterSaleTagList: {
		type: Array,
		default: () => []
	}
})
</script>

<style scoped>
.goods-logistics-card {
	margin-top: 24rpx;
	padding: 24rpx;
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.goods-logistics-row {
	display: flex;
	align-items: flex-start;
}

.goods-logistics-label {
	width: 96rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
	flex-shrink: 0;
}

.goods-logistics-value {
	flex: 1;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #344054;
}

.goods-logistics-tag-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
}

.goods-logistics-tag {
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #475467;
	background: #f4f6fb;
}
</style>
