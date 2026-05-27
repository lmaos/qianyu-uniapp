<template>
	<view class="shop-order-detail-page">
		<FullScreenPageLayout
			:page-background="SHOP_PAGE_BACKGROUND"
			content-tag="scroll-view"
			:content-props="contentProps"
			:content-style="contentStyle"
			:content-top-offset-px="12"
			:header-height-rpx="88"
			:header-side-padding-rpx="24"
			:header-background="SHOP_HEADER_BACKGROUND"
			:header-area-style="SHOP_HEADER_AREA_STYLE"
			:header-z-index="20"
			:footer-reserve-rpx="120"
			:footer-gap-rpx="18"
			:footer-top-padding-rpx="18"
			:footer-side-padding-rpx="24"
			:footer-inner-min-height-rpx="88"
			footer-background="#ffffff"
			footer-border-top="1rpx solid rgba(226, 232, 240, 0.88)"
		>
			<template #header>
				<ShopSubPageHeader title="订单详情" @back="handleBack" />
			</template>

			<view class="shop-order-detail-summary-card">
				<text class="shop-order-detail-summary-status">{{ pageMock.summaryCard.statusText }}</text>
				<text class="shop-order-detail-summary-desc">{{ pageMock.summaryCard.statusDesc }}</text>
				<text class="shop-order-detail-summary-helper">{{ pageMock.summaryCard.helperText }}</text>
			</view>

			<view class="shop-order-detail-card">
				<text class="shop-order-detail-card-title">物流进度</text>
				<view
					v-for="item in pageMock.timelineList"
					:key="item.key"
					class="shop-order-detail-timeline-item"
				>
					<view :class="['shop-order-detail-timeline-dot', item.active ? 'shop-order-detail-timeline-dot-active' : '']"></view>
					<view class="shop-order-detail-timeline-main">
						<text class="shop-order-detail-timeline-title">{{ item.title }}</text>
						<text class="shop-order-detail-timeline-desc">{{ item.desc }}</text>
					</view>
				</view>
			</view>

			<view class="shop-order-detail-card">
				<text class="shop-order-detail-card-title">收货地址</text>
				<text class="shop-order-detail-address-line">{{ pageMock.addressCard.name }} {{ pageMock.addressCard.phone }}</text>
				<text class="shop-order-detail-address-line">{{ pageMock.addressCard.address }}</text>
			</view>

			<view class="shop-order-detail-card shop-order-detail-goods-card" @tap="handleProductOpen">
				<view class="shop-order-detail-goods-cover" :style="{ background: pageMock.goodsCard.coverBackground }">
					{{ pageMock.goodsCard.coverText }}
				</view>
				<view class="shop-order-detail-goods-main">
					<text class="shop-order-detail-goods-title">{{ pageMock.goodsCard.title }}</text>
					<text class="shop-order-detail-goods-spec">{{ pageMock.goodsCard.specText }}</text>
					<text class="shop-order-detail-goods-price">¥{{ pageMock.goodsCard.price }} x {{ pageMock.goodsCard.quantity }}</text>
				</view>
			</view>

			<view class="shop-order-detail-card">
				<text class="shop-order-detail-card-title">金额明细</text>
				<view
					v-for="item in pageMock.amountList"
					:key="item.key"
					class="shop-order-detail-row"
				>
					<text class="shop-order-detail-row-label">{{ item.label }}</text>
					<text :class="['shop-order-detail-row-value', item.highlight ? 'shop-order-detail-row-value-highlight' : '']">
						{{ item.value }}
					</text>
				</view>
			</view>

			<view class="shop-order-detail-card">
				<text class="shop-order-detail-card-title">订单信息</text>
				<view
					v-for="item in pageMock.infoList"
					:key="item.key"
					class="shop-order-detail-row"
				>
					<text class="shop-order-detail-row-label">{{ item.label }}</text>
					<text class="shop-order-detail-row-value">{{ item.value }}</text>
				</view>
			</view>

			<template #footer>
				<view class="shop-order-detail-footer">
					<view
						v-for="item in pageMock.actionList"
						:key="item.key"
						:class="['shop-order-detail-footer-button', item.light ? 'shop-order-detail-footer-button-light' : '']"
						@tap="handleFooterAction(item)"
					>
						{{ item.label }}
					</view>
				</view>
			</template>
		</FullScreenPageLayout>

		<ShopCustomerServiceSheet
			:visible="serviceSheetVisible"
			:sheet-data="serviceSheetData"
			@close="handleCloseServiceSheet"
			@question-click="handleServiceQuestionClick"
			@menu-click="handleServiceMenuClick"
			@primary="handleServicePrimary"
			@secondary="handleServiceSecondary"
		/>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopCustomerServiceSheet from '@/components/shop/common/ShopCustomerServiceSheet.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import {
	getShopCustomerServiceSheetMock,
	getShopOrderDetailMock
} from '@/components/shop/common/shopFlowMock.js'

const pageMock = ref(getShopOrderDetailMock())
const serviceSheetVisible = ref(false)
const serviceSheetData = ref(getShopCustomerServiceSheetMock({ contextType: 'order' }))

const contentProps = {
	'scroll-y': true
}

const contentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	paddingBottom: '36rpx'
}

onLoad((options) => {
	pageMock.value = getShopOrderDetailMock({
		orderId: options?.orderId,
		userId: options?.userId,
		productId: options?.productId
	})
	serviceSheetData.value = getShopCustomerServiceSheetMock({
		contextType: 'order',
		orderId: pageMock.value.orderId,
		userId: options?.userId,
		productId: pageMock.value.productId
	})
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleProductOpen() {
	onProductOpen(pageMock.value.goodsCard)
	if (!pageMock.value.goodsCard.detailUrl) {
		return
	}

	uni.navigateTo({
		url: pageMock.value.goodsCard.detailUrl
	})
}

function handleFooterAction(actionItem) {
	onFooterAction(actionItem)
	if (actionItem.key === 'service') {
		serviceSheetVisible.value = true
		return
	}

	if (actionItem.key === 'rebuy') {
		handleProductOpen()
		return
	}

	uni.showToast({
		title: `${actionItem.label}占位`,
		icon: 'none'
	})
}

function handleCloseServiceSheet() {
	serviceSheetVisible.value = false
}

function handleServiceQuestionClick(question) {
	onServiceQuestionClick(question)
	uni.showToast({
		title: '问题已带入咨询',
		icon: 'none'
	})
}

function handleServiceMenuClick(menuItem) {
	onServiceMenuClick(menuItem)
	uni.showToast({
		title: `${menuItem.label}占位`,
		icon: 'none'
	})
}

function handleServicePrimary() {
	onServicePrimary(pageMock.value.orderId)
	uni.showToast({
		title: '开始咨询占位',
		icon: 'none'
	})
}

function handleServiceSecondary() {
	onServiceSecondary(pageMock.value.orderId)
	uni.showToast({
		title: '投诉反馈占位',
		icon: 'none'
	})
}

function onProductOpen(goodsCard) {
	// TODO：替换订单详情商品点击前置逻辑
	console.log('shop-order-detail-product-open', goodsCard.title)
}

function onFooterAction(actionItem) {
	// TODO：替换订单详情底部操作逻辑
	console.log('shop-order-detail-footer-action', pageMock.value.orderId, actionItem.key)
}

function onServiceQuestionClick(question) {
	// TODO：替换订单客服快捷问题逻辑
	console.log('shop-order-detail-service-question', pageMock.value.orderId, question)
}

function onServiceMenuClick(menuItem) {
	// TODO：替换订单客服菜单逻辑
	console.log('shop-order-detail-service-menu', pageMock.value.orderId, menuItem.key)
}

function onServicePrimary(orderId) {
	// TODO：替换订单客服主 CTA 逻辑
	console.log('shop-order-detail-service-primary', orderId)
}

function onServiceSecondary(orderId) {
	// TODO：替换订单客服次 CTA 逻辑
	console.log('shop-order-detail-service-secondary', orderId)
}
</script>

<style scoped>
.shop-order-detail-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-order-detail-summary-card,
.shop-order-detail-card {
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-order-detail-summary-card {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.16) 0%, rgba(214, 228, 255, 0.18) 100%);
}

.shop-order-detail-card {
	margin-top: 22rpx;
}

.shop-order-detail-summary-status,
.shop-order-detail-summary-desc,
.shop-order-detail-summary-helper,
.shop-order-detail-card-title,
.shop-order-detail-timeline-title,
.shop-order-detail-timeline-desc,
.shop-order-detail-address-line,
.shop-order-detail-goods-title,
.shop-order-detail-goods-spec,
.shop-order-detail-goods-price,
.shop-order-detail-row-label,
.shop-order-detail-row-value {
	display: block;
}

.shop-order-detail-summary-status {
	font-size: 34rpx;
	font-weight: 700;
	line-height: 44rpx;
	color: #be123c;
}

.shop-order-detail-summary-desc,
.shop-order-detail-summary-helper,
.shop-order-detail-timeline-desc,
.shop-order-detail-address-line,
.shop-order-detail-goods-spec,
.shop-order-detail-row-label,
.shop-order-detail-row-value {
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #64748b;
}

.shop-order-detail-card-title,
.shop-order-detail-timeline-title,
.shop-order-detail-goods-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #111827;
}

.shop-order-detail-timeline-item {
	display: flex;
	align-items: flex-start;
	gap: 18rpx;
	margin-top: 20rpx;
}

.shop-order-detail-timeline-dot {
	width: 18rpx;
	height: 18rpx;
	margin-top: 8rpx;
	border-radius: 50%;
	background: #d0d5dd;
	flex-shrink: 0;
}

.shop-order-detail-timeline-dot-active {
	background: #fb7185;
	box-shadow: 0 0 0 8rpx rgba(251, 113, 133, 0.14);
}

.shop-order-detail-timeline-main {
	flex: 1;
	min-width: 0;
}

.shop-order-detail-goods-card {
	display: flex;
	align-items: center;
}

.shop-order-detail-goods-cover {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 152rpx;
	height: 152rpx;
	border-radius: 28rpx;
	flex-shrink: 0;
	font-size: 28rpx;
	font-weight: 700;
	color: rgba(17, 24, 39, 0.72);
}

.shop-order-detail-goods-main {
	flex: 1;
	min-width: 0;
	margin-left: 20rpx;
}

.shop-order-detail-goods-price,
.shop-order-detail-row-value-highlight {
	color: #ef4444;
	font-weight: 700;
}

.shop-order-detail-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20rpx;
	margin-top: 18rpx;
}

.shop-order-detail-row-label {
	margin-top: 0;
}

.shop-order-detail-row-value {
	margin-top: 0;
	text-align: right;
}

.shop-order-detail-footer {
	display: flex;
	justify-content: flex-end;
	gap: 16rpx;
}

.shop-order-detail-footer-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 188rpx;
	height: 76rpx;
	padding: 0 28rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}

.shop-order-detail-footer-button-light {
	background: #f8fafc;
	color: #0f172a;
}
</style>
