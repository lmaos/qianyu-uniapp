<template>
	<view class="shop-cart-item-shell">
		<view class="shop-cart-item-delete" @tap.stop="handleDeleteTap">删除</view>

		<view
			class="shop-cart-item-card"
			:style="cardStyle"
			@touchstart="handleTouchStart"
			@touchmove="handleTouchMove"
			@touchend="handleTouchEnd"
			@touchcancel="handleTouchEnd"
		>
			<view class="shop-cart-item-check" @tap.stop="emit('toggle-check', itemInfo)">
				<view :class="['shop-cart-item-check-icon', checked ? 'shop-cart-item-check-icon--active' : '']">
					<text v-if="checked" class="shop-cart-item-check-mark">✓</text>
				</view>
			</view>

			<view class="shop-cart-item-thumb" :style="{ background: itemInfo.thumbnailBackground }">
				<text class="shop-cart-item-thumb-text">{{ itemInfo.thumbnailText }}</text>
			</view>

			<view class="shop-cart-item-main">
				<text class="shop-cart-item-title">{{ itemInfo.title }}</text>
				<view class="shop-cart-item-footer">
					<text class="shop-cart-item-price">¥{{ formatPrice(itemInfo.price) }}</text>

					<view class="shop-cart-item-quantity">
						<view class="shop-cart-item-step" @tap.stop="emit('decrease-item', itemInfo)">-</view>
						<text class="shop-cart-item-count">{{ itemInfo.quantity }}</text>
						<view class="shop-cart-item-step shop-cart-item-step--plus" @tap.stop="emit('increase-item', itemInfo)">+</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
	itemInfo: {
		type: Object,
		default: () => ({})
	},
	checked: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['toggle-check', 'increase-item', 'decrease-item', 'delete-item'])

const systemInfo = uni.getSystemInfoSync()
const deleteWidthPx = Math.round((Number(systemInfo.windowWidth || 375) * 132) / 750)

const startX = ref(0)
const baseOffsetPx = ref(0)
const offsetPx = ref(0)

const cardStyle = computed(() => ({
	transform: `translateX(${offsetPx.value}px)`
}))

function handleTouchStart(event) {
	startX.value = Number(event.touches?.[0]?.clientX || 0)
	baseOffsetPx.value = offsetPx.value
}

function handleTouchMove(event) {
	const currentX = Number(event.touches?.[0]?.clientX || 0)
	const deltaX = currentX - startX.value
	const nextOffsetPx = Math.max(-deleteWidthPx, Math.min(0, baseOffsetPx.value + deltaX))
	offsetPx.value = nextOffsetPx
}

function handleTouchEnd() {
	offsetPx.value = Math.abs(offsetPx.value) > deleteWidthPx * 0.4 ? -deleteWidthPx : 0
}

function handleDeleteTap() {
	offsetPx.value = 0
	emit('delete-item', props.itemInfo)
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
.shop-cart-item-shell {
	position: relative;
	overflow: hidden;
	border-radius: 32rpx;
}

.shop-cart-item-delete {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 132rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #ef4444;
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}

.shop-cart-item-card {
	display: flex;
	align-items: center;
	padding: 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
	transition: transform 0.18s ease;
}

.shop-cart-item-check {
	flex-shrink: 0;
	padding-right: 20rpx;
}

.shop-cart-item-check-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	border: 2rpx solid #cbd5e1;
	background: #ffffff;
	box-sizing: border-box;
}

.shop-cart-item-check-icon--active {
	border-color: #ef4444;
	background: #ef4444;
}

.shop-cart-item-check-mark {
	font-size: 22rpx;
	line-height: 22rpx;
	color: #ffffff;
}

.shop-cart-item-thumb {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 132rpx;
	height: 132rpx;
	border-radius: 28rpx;
}

.shop-cart-item-thumb-text {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 34rpx;
	color: rgba(17, 24, 39, 0.72);
}

.shop-cart-item-main {
	flex: 1;
	min-width: 0;
	margin-left: 20rpx;
}

.shop-cart-item-title {
	display: -webkit-box;
	overflow: hidden;
	font-size: 26rpx;
	font-weight: 500;
	line-height: 38rpx;
	color: #111827;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.shop-cart-item-footer {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	margin-top: 18rpx;
}

.shop-cart-item-price {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #ef4444;
}

.shop-cart-item-quantity {
	display: flex;
	align-items: center;
}

.shop-cart-item-step {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48rpx;
	height: 48rpx;
	border-radius: 16rpx;
	background: #f8fafc;
	font-size: 28rpx;
	font-weight: 600;
	color: #334155;
}

.shop-cart-item-step--plus {
	color: #ef4444;
}

.shop-cart-item-count {
	min-width: 44rpx;
	margin: 0 14rpx;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #111827;
	text-align: center;
}
</style>
