<template>
	<view class="shop-recommend-zone" :style="zoneSurfaceStyle">
		<view :class="['shop-recommend-zone-header', zoneInfo.layoutMode === 'quad-card' ? 'shop-recommend-zone-header-compact' : '']">
			<view class="shop-recommend-zone-title-wrap">
				<view v-if="zoneInfo.tagText" class="shop-recommend-zone-tag">{{ zoneInfo.tagText }}</view>
				<text class="shop-recommend-zone-title">{{ zoneInfo.title }}</text>
			</view>
			<view class="shop-recommend-zone-more" @tap="handleMoreTap">{{ zoneInfo.moreText || '更多' }}</view>
		</view>

		<view :class="['shop-recommend-zone-body', zoneInfo.layoutMode === 'quad-card' ? 'shop-recommend-zone-body-compact' : 'shop-recommend-zone-body-fluid']">
			<ShopCompactProductList
				v-if="zoneInfo.layoutMode === 'quad-card'"
				:product-list="zoneInfo.productList"
				@product-click="handleProductClick"
			/>
			<ShopProductList v-else :product-list="zoneInfo.productList" @product-click="handleProductClick" />
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import ShopCompactProductList from '@/components/home/shop/ShopCompactProductList.vue'
import ShopProductList from '@/components/home/shop/ShopProductList.vue'

const props = defineProps({
	zoneInfo: {
		type: Object,
		default: () => ({
			id: '',
			title: '推荐区域',
			moreText: '更多',
			layoutMode: 'double',
			productList: []
		})
	}
})

const emit = defineEmits(['product-click', 'more-click'])

const zoneSurfaceStyle = computed(() => {
	return {
		background: props.zoneInfo.surfaceBackground || '#ffffff',
		boxShadow: props.zoneInfo.surfaceShadow || '0 14rpx 36rpx rgba(15, 23, 42, 0.06)'
	}
})

// 推荐区域内部的商品点击继续透传给外层推荐页。
function handleProductClick(productInfo) {
	emit('product-click', productInfo)
}

// 区域右上角“更多”入口透传给外层页面。
function handleMoreTap() {
	emit('more-click', props.zoneInfo)
}
</script>

<style scoped>
.shop-recommend-zone {
	margin-top: 24rpx;
	padding: 12rpx 0 10rpx;
	border-radius: 32rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 249, 251, 0.92) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.9);
	box-shadow: 0 16rpx 36rpx rgba(255, 171, 191, 0.08);
}

.shop-recommend-zone-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16rpx;
	margin-bottom: 10rpx;
}

.shop-recommend-zone-header-compact {
	margin-bottom: 6rpx;
}

.shop-recommend-zone-title-wrap {
	display: flex;
	align-items: center;
	min-width: 0;
}

.shop-recommend-zone-tag {
	display: inline-flex;
	align-items: center;
	height: 38rpx;
	padding: 0 14rpx;
	margin-right: 14rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 145, 168, 0.16) 0%, rgba(255, 205, 177, 0.26) 100%);
	font-size: 18rpx;
	font-weight: 600;
	line-height: 24rpx;
	color: #c2416c;
	flex-shrink: 0;
}

.shop-recommend-zone-title {
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #111827;
}

.shop-recommend-zone-more {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 44rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.84);
	box-shadow: 0 10rpx 22rpx rgba(255, 171, 191, 0.08);
	font-size: 22rpx;
	line-height: 30rpx;
	color: #8b90a1;
}

.shop-recommend-zone-body-fluid {
	padding: 0;
}

.shop-recommend-zone-body-compact {
	padding: 0 12rpx;
}
</style>
