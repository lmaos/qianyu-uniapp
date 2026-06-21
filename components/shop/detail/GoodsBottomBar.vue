<template>
	<view class="goods-bottom-bar">
		<view class="goods-bottom-tools">
			<view class="goods-bottom-tool" @tap="emit('shop-click')">
				<view class="goods-bottom-tool-icon">
					<image class="goods-bottom-tool-svg" :src="SHOP_TOOL_SHOP_ICON" mode="aspectFit" />
				</view>
				<text class="goods-bottom-tool-text">店铺</text>
			</view>
			<view class="goods-bottom-tool" @tap="emit('service-click')">
				<view class="goods-bottom-tool-icon">
					<image class="goods-bottom-tool-svg" :src="SHOP_TOOL_SERVICE_ICON" mode="aspectFit" />
				</view>
				<text class="goods-bottom-tool-text">客服</text>
			</view>
			<view class="goods-bottom-tool" @tap="emit('cart-click')">
				<view class="goods-bottom-tool-icon">
					<image class="goods-bottom-tool-svg" :src="SHOP_TOP_CART_ICON" mode="aspectFit" />
					<text v-if="cartCount > 0" class="goods-bottom-tool-badge">{{ cartCount }}</text>
				</view>
				<text class="goods-bottom-tool-text">购物车</text>
			</view>
		</view>

		<view class="goods-bottom-actions">
			<view class="goods-bottom-action goods-bottom-action-light" @tap="emit('add-cart-click')">加入购物车</view>
			<view class="goods-bottom-action goods-bottom-action-primary" @tap="emit('buy-click')">
				下单 ¥{{ formattedPrice }}
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import {
	SHOP_TOOL_SERVICE_ICON,
	SHOP_TOOL_SHOP_ICON,
	SHOP_TOP_CART_ICON
} from '@/components/shop/common/shopSurface.js'

const props = defineProps({
	orderPrice: {
		type: [Number, String],
		default: 0
	},
	cartCount: {
		type: [Number, String],
		default: 0
	}
})

const emit = defineEmits(['shop-click', 'service-click', 'cart-click', 'add-cart-click', 'buy-click'])

const formattedPrice = computed(() => formatPrice(props.orderPrice))

function formatPrice(value) {
	const price = Number(value)
	if (!Number.isFinite(price)) {
		return '0.00'
	}

	return `${price.toFixed(2)}`.replace(/\.00$/, '')
}
</script>

<style scoped>
.goods-bottom-bar {
	display: flex;
	align-items: center;
	min-height: 120rpx;
	box-sizing: border-box;
}

.goods-bottom-tools {
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

.goods-bottom-tool {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 88rpx;
}

.goods-bottom-tool-icon {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 52rpx;
	height: 52rpx;
	border-radius: 999rpx;
	background: #f4f6fb;
	box-shadow: inset 0 0 0 1rpx rgba(226, 232, 240, 0.9);
}

.goods-bottom-tool-svg {
	width: 30rpx;
	height: 30rpx;
}

.goods-bottom-tool-badge {
	position: absolute;
	top: -8rpx;
	right: -10rpx;
	min-width: 28rpx;
	padding: 0 8rpx;
	border-radius: 999rpx;
	font-size: 18rpx;
	line-height: 28rpx;
	color: #ffffff;
	background: #fe2c55;
	box-sizing: border-box;
	text-align: center;
}

.goods-bottom-tool-text {
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #667085;
}

.goods-bottom-actions {
	display: flex;
	flex: 1;
	gap: 14rpx;
	margin-left: 20rpx;
}

.goods-bottom-action {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	border-radius: 999rpx;
	font-size: 26rpx;
	font-weight: 600;
	line-height: 34rpx;
}

.goods-bottom-action-light {
	flex: 1;
	color: #344054;
	background: #f4f6fb;
}

.goods-bottom-action-primary {
	flex: 1.25;
	color: #ffffff;
	background: linear-gradient(135deg, #fe2c55 0%, #ff7a45 100%);
}
</style>
