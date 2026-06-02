<template>
	<view class="shop-product-item" @tap="handleTap">
		<view class="shop-product-cover" :style="coverStyle">
			<view class="shop-product-cover-light"></view>
			<text v-if="badgeMap.topLeft" class="shop-product-badge shop-product-badge-top-left">{{ badgeMap.topLeft }}</text>
			<text v-if="badgeMap.topRight" class="shop-product-badge shop-product-badge-top-right">{{ badgeMap.topRight }}</text>
			<text class="shop-product-cover-text">{{ productInfo.coverText || '商品图' }}</text>
			<view class="shop-product-cover-tags">
				<text v-for="tag in coverActivityTags" :key="tag" class="shop-product-cover-tag">{{ tag }}</text>
			</view>
		</view>

		<view class="shop-product-info">
			<text class="shop-product-title">{{ productInfo.title }}</text>
			<text v-if="productInfo.shopName" class="shop-product-shop-name">{{ productInfo.shopName }}</text>

			<view class="shop-product-price-row">
				<view class="shop-product-price-main">
					<text class="shop-product-price-prefix">到手价</text>
					<text class="shop-product-price-symbol">¥</text>
					<text class="shop-product-price-value">{{ formattedPrice }}</text>
				</view>
				<text class="shop-product-original-price">¥{{ formattedOriginalPrice }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	productInfo: {
		type: Object,
		default: () => ({
			id: '',
			title: '商品标题占位',
			price: 199,
			originalPrice: 259,
			coverBackground: 'linear-gradient(135deg, #ffe4d6 0%, #fff1f4 100%)',
			coverText: '商品图',
			activityTags: ['活动标签'],
			badges: {}
		})
	}
})

const emit = defineEmits(['item-click'])

// 商品首图区域支持由 mock 渐变色或后续真实图片地址接管。
const coverStyle = computed(() => {
	return {
		background: props.productInfo.coverBackground
	}
})

// 四角角标位置预留，不需要显示的角标保持空字符串即可。
const badgeMap = computed(() => {
	return {
		topLeft: props.productInfo.badges?.topLeft || '',
		topRight: props.productInfo.badges?.topRight || ''
	}
})

// 活动标签区域默认至少保留一个标签占位。
const activityTags = computed(() => {
	return Array.isArray(props.productInfo.activityTags) && props.productInfo.activityTags.length
		? props.productInfo.activityTags
		: ['活动标签']
})

const coverActivityTags = computed(() => {
	return activityTags.value.slice(0, 2)
})

// 金额统一格式化成两位小数以内的展示文案。
const formattedPrice = computed(() => {
	return formatPrice(props.productInfo.price)
})

// 原价展示文案。
const formattedOriginalPrice = computed(() => {
	return formatPrice(props.productInfo.originalPrice)
})

// 商品点击统一向上透传，详情跳转由外层列表或内容组件控制。
function handleTap() {
	emit('item-click', props.productInfo)
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
.shop-product-item {
	display: flex;
	flex-direction: column;
	border-radius: 24rpx;
	background: linear-gradient(180deg, #ffffff 0%, #fffdfd 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 38rpx rgba(255, 167, 186, 0.08);
	overflow: hidden;
}

.shop-product-cover {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 320rpx;
	padding: 18rpx;
	box-sizing: border-box;
}

.shop-product-cover-light {
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	height: 128rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 100%);
}

.shop-product-cover-text {
	position: relative;
	z-index: 1;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: rgba(17, 24, 39, 0.72);
	letter-spacing: 4rpx;
}

.shop-product-cover-tags {
	position: absolute;
	right: 14rpx;
	bottom: 14rpx;
	left: 14rpx;
	z-index: 1;
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.shop-product-cover-tag {
	padding: 6rpx 12rpx;
	border-radius: 999rpx;
	font-size: 18rpx;
	line-height: 24rpx;
	color: #ffffff;
	background: rgba(17, 24, 39, 0.48);
}
.shop-product-badge {
	max-width: 52%;
	padding: 7rpx 12rpx;
	font-size: 18rpx;
	font-weight: 600;
	line-height: 24rpx;
	color: #ffffff;
	background: rgba(17, 24, 39, 0.74);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.shop-product-badge-top-left {
	top: 0;
	left: 0;
	border-radius: 24rpx 0 14rpx 0;
	background: linear-gradient(135deg, rgba(254, 44, 85, 0.96) 0%, rgba(255, 122, 69, 0.92) 100%);
}

.shop-product-badge-top-right {
	top: 0;
	right: 0;
	border-radius: 0 24rpx 0 14rpx;
	background: linear-gradient(135deg, rgba(245, 158, 11, 0.96) 0%, rgba(249, 115, 22, 0.94) 100%);
}

.shop-product-info {
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 16rpx 16rpx 18rpx;
}

.shop-product-title {
	display: flex;
	height: 68rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #111827;
	overflow: hidden;
}

.shop-product-shop-name {
	margin-top: 10rpx;
	font-size: 18rpx;
	line-height: 26rpx;
	color: #98a2b3;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.shop-product-price-row {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 16rpx;
	margin-top: 0rpx;
	padding-top: 14rpx;
}

.shop-product-price-main {
	display: flex;
	align-items: flex-start;
	flex-wrap: wrap;
}

.shop-product-price-prefix {
	margin-right: 8rpx;
	font-size: 18rpx;
	line-height: 24rpx;
	color: #d94f7b;
}

.shop-product-price-symbol {
	font-size: 20rpx;
	font-weight: 700;
	line-height: 28rpx;
	color: #d94f7b;
}

.shop-product-price-value {
	margin-left: 4rpx;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #d94f7b;
}

.shop-product-original-price {
	font-size: 20rpx;
	line-height: 28rpx;
	color: #98a2b3;
	text-decoration: line-through;
}
</style>
