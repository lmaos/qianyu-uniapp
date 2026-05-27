<template>
	<view :class="['shop-top-bar', compact ? 'shop-top-bar-compact' : '']">
		<view class="shop-top-title-wrap">
			<view class="shop-top-title-badge">Mall</view>
			<text v-if="!compact" class="shop-top-title">{{ title }}</text>
		</view>

		<view class="shop-top-search" @tap="emit('search-click')">
			<image class="shop-top-search-icon" :src="SHOP_TOP_SEARCH_ICON" mode="aspectFit" />
			<text class="shop-top-search-text">{{ searchPlaceholder }}</text>
		</view>

		<view class="shop-top-cart" @tap="emit('cart-click')">
			<image class="shop-top-cart-icon" :src="SHOP_TOP_CART_ICON" mode="aspectFit" />
		</view>
	</view>
</template>

<script setup>
import { SHOP_TOP_CART_ICON, SHOP_TOP_SEARCH_ICON } from '@/components/shop/common/shopSurface.js'

defineProps({
	compact: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: '商城'
	},
	searchPlaceholder: {
		type: String,
		default: '搜索商品'
	}
})

// 抛出搜索点击和购物车点击事件，实际跳转由父组件接管。
const emit = defineEmits(['search-click', 'cart-click'])
</script>

<style scoped>
.shop-top-bar {
	display: flex;
	align-items: center;
	height: 112rpx;
	padding: 0 24rpx;
	border-radius: 32rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 249, 251, 0.92) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.9);
	box-shadow: 0 18rpx 40rpx rgba(255, 171, 191, 0.1);
	box-sizing: border-box;
}

.shop-top-bar-compact {
	width: 100%;
	height: auto;
	padding: 0;
	background: transparent;
	border: none;
	box-shadow: none;
}

.shop-top-title-wrap {
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

.shop-top-bar-compact .shop-top-title-wrap {
	margin-right: 10rpx;
}

.shop-top-title-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 40rpx;
	padding: 0 16rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff91aa 0%, #ffc39c 100%);
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #ffffff;
}

.shop-top-bar-compact .shop-top-title-badge {
	height: 36rpx;
	padding: 0 14rpx;
	font-size: 18rpx;
	line-height: 24rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 247, 250, 0.9) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 10rpx 22rpx rgba(255, 171, 191, 0.08);
	color: #d94f7b;
}

.shop-top-title {
	margin-left: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	line-height: 42rpx;
	color: #111827;
}

.shop-top-bar-compact .shop-top-title {
	font-size: 28rpx;
	line-height: 38rpx;
}

.shop-top-search {
	display: flex;
	align-items: center;
	flex: 1;
	height: 72rpx;
	margin: 0 20rpx;
	padding: 0 22rpx;
	border-radius: 999rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		rgba(255, 255, 255, 0.92);
	border: 1rpx solid rgba(255, 255, 255, 0.9);
	box-shadow: 0 12rpx 26rpx rgba(255, 171, 191, 0.08);
	box-sizing: border-box;
}

.shop-top-bar-compact .shop-top-search {
	height: 64rpx;
	margin: 0 10rpx 0 0;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		rgba(255, 255, 255, 0.9);
	border: 1rpx solid rgba(255, 255, 255, 0.9);
	box-shadow: 0 10rpx 22rpx rgba(255, 171, 191, 0.08);
}

.shop-top-search-icon {
	width: 26rpx;
	height: 26rpx;
	flex-shrink: 0;
}

.shop-top-search-text {
	margin-left: 12rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #98a2b3;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.shop-top-cart {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		rgba(255, 255, 255, 0.9);
	box-shadow: 0 12rpx 26rpx rgba(255, 171, 191, 0.1);
	flex-shrink: 0;
}

.shop-top-bar-compact .shop-top-cart {
	width: 64rpx;
	height: 64rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		rgba(255, 255, 255, 0.9);
	box-shadow: 0 10rpx 22rpx rgba(255, 171, 191, 0.08);
}

.shop-top-cart-icon {
	width: 32rpx;
	height: 32rpx;
}
</style>
