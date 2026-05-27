<template>
	<view class="shop-order-page">
		<FullScreenPageLayout
			:page-background="SHOP_PAGE_BACKGROUND"
			:content-style="orderContentStyle"
			:content-top-offset-px="12"
			:header-height-rpx="88"
			:header-side-padding-rpx="24"
			:header-background="SHOP_HEADER_BACKGROUND"
			:header-area-style="SHOP_HEADER_AREA_STYLE"
			:header-z-index="20"
			:footer-reserve-rpx="120"
			:footer-gap-rpx="18"
			:footer-top-padding-rpx="20"
			:footer-side-padding-rpx="24"
			footer-background="#ffffff"
			footer-border-top="1rpx solid rgba(226, 232, 240, 0.88)"
		>
			<template #header>
				<ShopSubPageHeader title="确认下单" @back="handleBack" />
			</template>

			<view class="shop-order-card">
				<text class="shop-order-card-title">收货信息</text>
				<text class="shop-order-card-desc">张三 13800000000</text>
				<text class="shop-order-card-desc">广东省深圳市南山区科技园 mock 地址 1001 室</text>
			</view>

			<view class="shop-order-card">
				<text class="shop-order-card-title">商品信息</text>

				<view
					v-for="item in orderItemList"
					:key="`${item.productId}-${item.skuId}`"
					class="shop-order-goods-row"
				>
					<view class="shop-order-goods-thumb" :style="{ background: item.thumbnailBackground }">
						{{ item.thumbnailText }}
					</view>
					<view class="shop-order-goods-meta">
						<text class="shop-order-goods-title">{{ item.title }}</text>
						<text class="shop-order-goods-desc">数量：{{ item.quantity }}</text>
						<text class="shop-order-goods-desc">发货：{{ item.shipTime }}</text>
					</view>
				</view>
			</view>

			<view class="shop-order-card">
				<text class="shop-order-card-title">金额明细</text>
				<view class="shop-order-amount-row">
					<text class="shop-order-amount-label">商品金额</text>
					<text class="shop-order-amount-value">¥{{ formattedGoodsAmount }}</text>
				</view>
				<view class="shop-order-amount-row">
					<text class="shop-order-amount-label">运费</text>
					<text class="shop-order-amount-value">¥0</text>
				</view>
				<view class="shop-order-amount-row">
					<text class="shop-order-amount-label">优惠</text>
					<text class="shop-order-amount-value">-¥{{ formattedDiscountAmount }}</text>
				</view>
				<view class="shop-order-amount-row shop-order-amount-row-total">
					<text class="shop-order-amount-label">应付金额</text>
					<text class="shop-order-amount-value shop-order-amount-value-total">¥{{ formattedPayAmount }}</text>
				</view>
			</view>
			<template #footer>
				<view class="shop-order-bottom-bar">
					<view class="shop-order-bottom-price">应付 ¥{{ formattedPayAmount }}</view>
					<view class="shop-order-bottom-button" @tap="handleSubmitOrder">提交订单</view>
				</view>
			</template>
		</FullScreenPageLayout>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import { getGoodsDetailMock } from '@/components/shop/detail/shopDetailMock.js'
import { buildShopOrderDetailUrl } from '@/components/shop/common/shopFlowMock.js'

const orderItemList = ref([])
const orderContentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx'
}

const goodsAmount = computed(() => {
	return orderItemList.value.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0)
})

const discountAmount = computed(() => {
	return orderItemList.value.length ? orderItemList.value.length * 8 : 0
})

const formattedGoodsAmount = computed(() => {
	return formatPrice(goodsAmount.value)
})

const formattedDiscountAmount = computed(() => {
	return formatPrice(discountAmount.value)
})

const formattedPayAmount = computed(() => {
	return formatPrice(Math.max(0, goodsAmount.value - discountAmount.value))
})

onLoad((options) => {
	orderItemList.value = resolveOrderItemList(options)
	onOrderSubmitLoad({
		itemList: orderItemList.value.map((item) => ({
			productId: item.productId,
			skuId: item.skuId,
			quantity: item.quantity
		}))
	})
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleSubmitOrder() {
	onSubmitOrder({
		itemList: orderItemList.value.map((item) => ({
			productId: item.productId,
			skuId: item.skuId,
			quantity: item.quantity
		}))
	})
	uni.navigateTo({
		url: buildShopOrderDetailUrl({
			orderId: 'submit-preview-order',
			productId: orderItemList.value[0]?.productId
		})
	})
}

function resolveOrderItemList(options) {
	const cartItemsQuery = `${options?.cartItems || ''}`.trim()
	if (cartItemsQuery) {
		try {
			const parsedItemList = JSON.parse(decodeURIComponent(cartItemsQuery))
			return parsedItemList.map((item) => buildOrderItem(item.productId, item.skuId, item.quantity))
		} catch (error) {
			console.log('shop-order-parse-cart-items-fail', error)
		}
	}

	const productId = `${options?.productId || 'recommend-product-1-1'}`.trim() || 'recommend-product-1-1'
	const detailMock = getGoodsDetailMock(productId)
	const nextSkuId = `${options?.skuId || detailMock.skuList[0]?.id || ''}`.trim()
	return [buildOrderItem(productId, nextSkuId, options?.quantity)]
}

function buildOrderItem(productId, skuId, quantity) {
	const detailMock = getGoodsDetailMock(productId)
	const skuInfo = detailMock.skuList.find((item) => item.id === skuId) || detailMock.skuList[0]
	return {
		productId,
		skuId: skuInfo.id,
		title: skuInfo.title,
		price: Number(skuInfo.price) || 0,
		quantity: Math.max(1, Number(quantity) || 1),
		shipTime: skuInfo.logisticsInfo?.shipTime || '24小时发货',
		thumbnailBackground: skuInfo.thumbnailBackground,
		thumbnailText: skuInfo.thumbnailText
	}
}

function onOrderSubmitLoad(payload) {
	// TODO：替换下单页初始化接口
	console.log('shop-order-submit-load', payload.itemList.map((item) => `${item.productId}:${item.skuId}:${item.quantity}`).join('|'))
}

function onSubmitOrder(payload) {
	// TODO：替换提交订单逻辑
	console.log('shop-order-submit', payload.itemList.map((item) => `${item.productId}:${item.skuId}:${item.quantity}`).join('|'))
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
.shop-order-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-order-card {
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-order-card-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #111827;
}

.shop-order-card-desc {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #475467;
}

.shop-order-goods-row {
	display: flex;
	align-items: flex-start;
	margin-top: 18rpx;
}

.shop-order-goods-row + .shop-order-goods-row {
	padding-top: 18rpx;
	border-top: 1rpx solid #f1f5f9;
}

.shop-order-goods-thumb {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 120rpx;
	height: 120rpx;
	border-radius: 24rpx;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 34rpx;
	color: rgba(17, 24, 39, 0.72);
}

.shop-order-goods-meta {
	flex: 1;
	min-width: 0;
	margin-left: 20rpx;
}

.shop-order-goods-title {
	display: block;
	font-size: 26rpx;
	font-weight: 500;
	line-height: 38rpx;
	color: #111827;
}

.shop-order-goods-desc {
	display: block;
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #64748b;
}

.shop-order-amount-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 18rpx;
}

.shop-order-amount-row-total {
	padding-top: 18rpx;
	border-top: 1rpx solid #f1f5f9;
}

.shop-order-amount-label {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #475467;
}

.shop-order-amount-value {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #111827;
}

.shop-order-amount-value-total {
	font-size: 30rpx;
	font-weight: 700;
	color: #ef4444;
}

.shop-order-bottom-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
}

.shop-order-bottom-price {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #ef4444;
}

.shop-order-bottom-button {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 220rpx;
	height: 84rpx;
	padding: 0 36rpx;
	margin-bottom: 18rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
