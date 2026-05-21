<template>
	<view class="goods-spec-card">
		<text class="goods-spec-title">当前 SKU 规格参数</text>
		<view v-for="item in paramList" :key="item.label" class="goods-spec-row">
			<text class="goods-spec-label">{{ item.label }}</text>
			<text class="goods-spec-value">{{ item.value }}</text>
		</view>
	</view>
</template>

<script setup>
defineProps({
	paramList: {
		type: Array,
		default: () => []
	}
})
</script>

<style scoped>
.goods-spec-card {
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.goods-spec-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 40rpx;
	color: #111827;
}

.goods-spec-row {
	display: flex;
	align-items: flex-start;
	padding-top: 20rpx;
	margin-top: 20rpx;
	border-top: 1rpx solid #eef2f7;
}

.goods-spec-label {
	width: 180rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
	flex-shrink: 0;
}

.goods-spec-value {
	flex: 1;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #344054;
}
</style>
