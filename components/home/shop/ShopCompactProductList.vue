<template>
	<view class="shop-compact-product-list">
		<view
			v-for="item in productList"
			:key="item.id"
			class="shop-compact-product-item"
			@tap="handleItemClick(item)"
		>
			<view class="shop-compact-cover" :style="{ background: item.coverBackground }">
				<text class="shop-compact-cover-text">{{ item.coverText || '商品' }}</text>
				<text v-if="item.compactBadge" class="shop-compact-cover-badge">{{ item.compactBadge }}</text>
			</view>
			<view class="shop-compact-price-row">
				<text class="shop-compact-price-symbol">¥</text>
				<text class="shop-compact-price-value">{{ formatPrice(item.price) }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	productList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['product-click'])

// 一行四列商品点击后，直接把当前商品对象抛给父层。
function handleItemClick(productInfo) {
	emit('product-click', productInfo)
}

function formatPrice(value) {
	const price = Number(value)
	if (!Number.isFinite(price)) {
		return '0.00'
	}

	return `${price.toFixed(2)}`.replace(/\.00$/, '')
}
</script>

<style scoped>
.shop-compact-product-list {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 10rpx;
}

.shop-compact-product-item {
	display: flex;
	flex-direction: column;
	min-width: 0;
	padding: 6rpx 8rpx 8rpx;
	border-radius: 20rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 250, 251, 0.98) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.88);
	box-shadow: 0 12rpx 28rpx rgba(255, 171, 191, 0.06);
}

.shop-compact-cover {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 126rpx;
	border-radius: 18rpx;
	overflow: hidden;
}

.shop-compact-cover-text {
	font-size: 20rpx;
	font-weight: 700;
	line-height: 24rpx;
	color: rgba(17, 24, 39, 0.68);
	letter-spacing: 2rpx;
}

.shop-compact-cover-badge {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 4rpx 6rpx;
	font-size: 16rpx;
	font-weight: 600;
	line-height: 20rpx;
	color: #ffffff;
	text-align: center;
	background: linear-gradient(180deg, rgba(254, 44, 85, 0) 0%, rgba(254, 44, 85, 0.92) 100%);
}

.shop-compact-price-row {
	display: flex;
	align-items: flex-start;
	justify-content: center;
	margin-top: 6rpx;
	color: #d94f7b;
}

.shop-compact-price-symbol {
	font-size: 16rpx;
	font-weight: 700;
	line-height: 20rpx;
}

.shop-compact-price-value {
	margin-left: 4rpx;
	font-size: 22rpx;
	font-weight: 700;
	line-height: 28rpx;
}
</style>
