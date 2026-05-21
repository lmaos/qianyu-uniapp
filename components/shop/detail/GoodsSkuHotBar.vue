<template>
	<view class="goods-sku-hot-bar">
		<scroll-view class="goods-sku-hot-scroll" scroll-x show-scrollbar="false">
			<view class="goods-sku-hot-list">
				<view
					v-for="item in skuList"
					:key="item.id"
					:class="['goods-sku-hot-item', activeSkuId === item.id ? 'goods-sku-hot-item-active' : '']"
					@tap="handleSkuTap(item)"
				>
					<view class="goods-sku-hot-thumb" :style="{ background: item.thumbnailBackground }">
						<text class="goods-sku-hot-thumb-text">{{ item.thumbnailText }}</text>
					</view>
					<text class="goods-sku-hot-name">{{ item.name }}</text>
				</view>
			</view>
		</scroll-view>

		<view class="goods-sku-hot-more" @tap="handleMoreTap">共{{ skuList.length }}款></view>
	</view>
</template>

<script setup>
const props = defineProps({
	skuList: {
		type: Array,
		default: () => []
	},
	activeSkuId: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['sku-change', 'more-click'])

// 点击单个 SKU 快捷项时，直接通知父层联动详情信息。
function handleSkuTap(skuItem) {
	emit('sku-change', skuItem)
}

// 点击右侧“共 XX 款”入口时，打开 SKU 弹窗。
function handleMoreTap() {
	emit('more-click')
}
</script>

<style scoped>
.goods-sku-hot-bar {
	display: flex;
	align-items: center;
	margin-top: 24rpx;
	padding: 20rpx 24rpx;
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.goods-sku-hot-scroll {
	flex: 1;
	min-width: 0;
	white-space: nowrap;
}

.goods-sku-hot-list {
	display: inline-flex;
	align-items: center;
	padding-right: 8rpx;
}

.goods-sku-hot-item {
	display: inline-flex;
	align-items: center;
	padding: 8rpx 14rpx 8rpx 8rpx;
	margin-right: 16rpx;
	border-radius: 999rpx;
	background: #f8fafc;
	border: 1rpx solid #edf1f6;
}

.goods-sku-hot-item-active {
	border-color: rgba(254, 44, 85, 0.22);
	background: rgba(254, 44, 85, 0.06);
}

.goods-sku-hot-thumb {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	border-radius: 18rpx;
	flex-shrink: 0;
}

.goods-sku-hot-thumb-text {
	font-size: 20rpx;
	font-weight: 700;
	line-height: 28rpx;
	color: rgba(17, 24, 39, 0.72);
}

.goods-sku-hot-name {
	margin-left: 12rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #344054;
	white-space: nowrap;
}

.goods-sku-hot-more {
	margin-left: 18rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #fe2c55;
	flex-shrink: 0;
}
</style>
