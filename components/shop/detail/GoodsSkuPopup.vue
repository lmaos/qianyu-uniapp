<template>
	<view v-if="visible" class="goods-sku-popup">
		<view class="goods-sku-popup-mask" @tap="emit('close')"></view>
		<view class="goods-sku-popup-sheet" :style="sheetStyle">
			<view class="goods-sku-popup-summary">
				<view class="goods-sku-popup-thumb" :style="{ background: activeSku.thumbnailBackground }">
					{{ activeSku.thumbnailText }}
				</view>
				<view class="goods-sku-popup-meta">
					<text class="goods-sku-popup-price">¥{{ formattedPrice }}</text>
					<text class="goods-sku-popup-promo">{{ activeSku.promotionText }}</text>
					<text class="goods-sku-popup-stock">{{ activeSku.stockText }}</text>
				</view>
				<view class="goods-sku-popup-stepper">
					<view class="goods-sku-popup-stepper-button" @tap="handleMinus">-</view>
					<text class="goods-sku-popup-stepper-value">{{ quantity }}</text>
					<view class="goods-sku-popup-stepper-button" @tap="handlePlus">+</view>
				</view>
			</view>

			<view class="goods-sku-popup-section">
				<text class="goods-sku-popup-section-title">全部 SKU</text>
				<scroll-view class="goods-sku-popup-scroll" scroll-y>
					<view class="goods-sku-popup-list">
						<view
							v-for="item in skuList"
							:key="item.id"
							:class="['goods-sku-popup-item', activeSkuId === item.id ? 'goods-sku-popup-item-active' : '']"
							@tap="emit('sku-change', item)"
						>
							<view class="goods-sku-popup-item-thumb" :style="{ background: item.thumbnailBackground }">
								{{ item.thumbnailText }}
							</view>
							<view class="goods-sku-popup-item-meta">
								<text class="goods-sku-popup-item-name">{{ item.name }}</text>
								<text class="goods-sku-popup-item-price">¥{{ formatPrice(item.price) }}</text>
							</view>
							<text class="goods-sku-popup-item-stock">{{ item.stockText }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<SafeBottomArea
				:fixed="false"
				:gap-rpx="bottomGapRpx"
				:top-padding-rpx="18"
				background="#ffffff"
				class="goods-sku-popup-footer"
			>
				<view
					:class="[
						'goods-sku-popup-confirm',
						activeSku.stock <= 0 ? 'goods-sku-popup-confirm-disabled' : ''
					]"
					@tap="handleConfirm"
				>
					{{ confirmText }}
				</view>
			</SafeBottomArea>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import SafeBottomArea from '@/components/common/SafeBottomArea.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	skuList: {
		type: Array,
		default: () => []
	},
	activeSkuId: {
		type: String,
		default: ''
	},
	quantity: {
		type: Number,
		default: 1
	},
	mode: {
		type: String,
		default: 'select'
	},
	popupHeightPx: {
		type: Number,
		default: 0
	},
	bottomGapRpx: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['close', 'sku-change', 'quantity-change', 'confirm'])
const { safeBottomPx, rpxToPx } = useSafeAreaMetrics()

// 当前弹窗中选中的 SKU。
const activeSku = computed(() => {
	return props.skuList.find((item) => item.id === props.activeSkuId) || props.skuList[0] || {}
})

// 弹窗高度固定为屏幕 3/4。
const sheetStyle = computed(() => {
	return {
		height: `${props.popupHeightPx + safeBottomPx.value + rpxToPx(props.bottomGapRpx)}px`
	}
})

// 顶部价格展示文案。
const formattedPrice = computed(() => {
	return formatPrice(activeSku.value.price)
})

// 根据当前模式切换确认按钮文案。
const confirmText = computed(() => {
	return props.mode === 'buy' ? '确认下单' : '确认选择'
})

// 数量减一。
function handleMinus() {
	if (props.quantity <= 1) {
		return
	}

	emit('quantity-change', props.quantity - 1)
}

// 数量加一。
function handlePlus() {
	if (!activeSku.value.stock || props.quantity >= activeSku.value.stock) {
		return
	}

	emit('quantity-change', props.quantity + 1)
}

// 确认时把当前 SKU 和数量交给父层统一处理。
function handleConfirm() {
	if (!activeSku.value.stock) {
		return
	}

	emit('confirm', {
		skuInfo: activeSku.value,
		quantity: props.quantity,
		mode: props.mode
	})
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
.goods-sku-popup {
	position: fixed;
	inset: 0;
	z-index: 60;
}

.goods-sku-popup-mask {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.42);
}

.goods-sku-popup-sheet {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	padding: 28rpx 24rpx 0;
	border-radius: 36rpx 36rpx 0 0;
	background: #ffffff;
	box-sizing: border-box;
}

.goods-sku-popup-summary {
	display: flex;
	align-items: flex-start;
}

.goods-sku-popup-thumb {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 136rpx;
	height: 136rpx;
	border-radius: 28rpx;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: rgba(17, 24, 39, 0.72);
	flex-shrink: 0;
}

.goods-sku-popup-meta {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.goods-sku-popup-price {
	font-size: 40rpx;
	font-weight: 700;
	line-height: 48rpx;
	color: #fe2c55;
}

.goods-sku-popup-promo,
.goods-sku-popup-stock {
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.goods-sku-popup-stepper {
	display: flex;
	align-items: center;
	margin-left: 16rpx;
}

.goods-sku-popup-stepper-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 52rpx;
	height: 52rpx;
	border-radius: 18rpx;
	background: #f4f6fb;
	font-size: 30rpx;
	line-height: 38rpx;
	color: #344054;
}

.goods-sku-popup-stepper-value {
	min-width: 52rpx;
	margin: 0 12rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	text-align: center;
	color: #111827;
}

.goods-sku-popup-section {
	display: flex;
	flex: 1;
	flex-direction: column;
	min-height: 0;
	margin-top: 28rpx;
}

.goods-sku-popup-section-title {
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #111827;
}

.goods-sku-popup-scroll {
	flex: 1;
	min-height: 0;
	margin-top: 18rpx;
}

.goods-sku-popup-list {
	padding-bottom: 24rpx;
}

.goods-sku-popup-item {
	display: flex;
	align-items: center;
	padding: 18rpx;
	margin-bottom: 16rpx;
	border-radius: 24rpx;
	background: #f8fafc;
	border: 1rpx solid transparent;
}

.goods-sku-popup-item-active {
	border-color: rgba(254, 44, 85, 0.2);
	background: rgba(254, 44, 85, 0.06);
}

.goods-sku-popup-item-thumb {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 88rpx;
	height: 88rpx;
	border-radius: 22rpx;
	font-size: 24rpx;
	font-weight: 700;
	line-height: 32rpx;
	color: rgba(17, 24, 39, 0.72);
	flex-shrink: 0;
}

.goods-sku-popup-item-meta {
	display: flex;
	flex: 1;
	flex-direction: column;
	margin-left: 16rpx;
	min-width: 0;
}

.goods-sku-popup-item-name {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #111827;
}

.goods-sku-popup-item-price {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #fe2c55;
}

.goods-sku-popup-item-stock {
	margin-left: 12rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
	flex-shrink: 0;
}

.goods-sku-popup-confirm {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	border-radius: 999rpx;
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #ffffff;
	background: linear-gradient(135deg, #fe2c55 0%, #ff7a45 100%);
}

.goods-sku-popup-confirm-disabled {
	background: #d0d5dd;
}
</style>
