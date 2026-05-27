<template>
	<view class="shop-merchant-page">
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
		>
			<template #header>
				<ShopSubPageHeader title="发货管理" @back="handleBack" />
			</template>

			<view class="shop-merchant-summary-grid">
				<view v-for="item in pageMock.summaryList" :key="item.key" class="shop-merchant-summary-card">
					<text class="shop-merchant-summary-value">{{ item.value }}</text>
					<text class="shop-merchant-summary-label">{{ item.label }}</text>
				</view>
			</view>

			<view class="shop-merchant-filter-row">
				<view
					v-for="item in pageMock.filterList"
					:key="item.key"
					:class="['shop-merchant-filter', activeFilter === item.key ? 'shop-merchant-filter-active' : '']"
					@tap="handleFilterChange(item)"
				>
					{{ item.label }}
				</view>
			</view>

			<view
				v-for="item in displayDeliveryList"
				:key="item.id"
				class="shop-merchant-delivery-card"
			>
				<view class="shop-merchant-delivery-head">
					<text class="shop-merchant-delivery-order">{{ item.orderId }}</text>
					<text class="shop-merchant-delivery-status">{{ item.statusText }}</text>
				</view>
				<text class="shop-merchant-delivery-title">{{ item.title }}</text>
				<text class="shop-merchant-delivery-desc">{{ item.specText }}</text>
				<text class="shop-merchant-delivery-desc">{{ item.addressText }}</text>
				<view class="shop-merchant-item-actions">
					<view class="shop-merchant-item-button shop-merchant-item-button-light" @tap="handleDeliveryAction(item, 'logistics')">查看物流</view>
					<view class="shop-merchant-item-button" @tap="handleDeliveryAction(item, 'ship')">去发货</view>
				</view>
			</view>
		</FullScreenPageLayout>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import { getShopMerchantDeliveryPageMock } from '@/components/shop/common/shopFlowMock.js'

const pageMock = ref(getShopMerchantDeliveryPageMock())
const activeFilter = ref('pending')

const contentProps = {
	'scroll-y': true
}

const contentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	paddingBottom: '36rpx'
}

const displayDeliveryList = computed(() => {
	return pageMock.value.deliveryList.filter((item) => item.status === activeFilter.value)
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleFilterChange(filterItem) {
	activeFilter.value = filterItem.key
	onFilterChange(filterItem)
}

function handleDeliveryAction(item, actionKey) {
	onDeliveryAction(item, actionKey)
	uni.showToast({
		title: actionKey === 'ship' ? '去发货占位' : '物流详情占位',
		icon: 'none'
	})
}

function onFilterChange(filterItem) {
	// TODO：替换发货管理筛选逻辑
	console.log('shop-merchant-delivery-filter-change', filterItem.key)
}

function onDeliveryAction(item, actionKey) {
	// TODO：替换发货管理卡片操作逻辑
	console.log('shop-merchant-delivery-action', item.id, actionKey)
}
</script>

<style scoped>
.shop-merchant-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-merchant-summary-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16rpx;
}

.shop-merchant-summary-card,
.shop-merchant-delivery-card {
	padding: 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-merchant-summary-value,
.shop-merchant-summary-label,
.shop-merchant-delivery-order,
.shop-merchant-delivery-status,
.shop-merchant-delivery-title,
.shop-merchant-delivery-desc {
	display: block;
}

.shop-merchant-summary-value {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #111827;
}

.shop-merchant-summary-label,
.shop-merchant-delivery-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.shop-merchant-filter-row {
	display: flex;
	gap: 16rpx;
	margin-top: 22rpx;
	margin-bottom: 22rpx;
}

.shop-merchant-filter {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 66rpx;
	padding: 0 28rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.9);
	font-size: 24rpx;
	line-height: 32rpx;
	color: #667085;
}

.shop-merchant-filter-active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.16) 0%, rgba(214, 228, 255, 0.16) 100%);
	font-weight: 700;
	color: #d94f7b;
}

.shop-merchant-delivery-card + .shop-merchant-delivery-card {
	margin-top: 18rpx;
}

.shop-merchant-delivery-head,
.shop-merchant-item-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.shop-merchant-delivery-order {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #111827;
}

.shop-merchant-delivery-status {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #fe2c55;
}

.shop-merchant-delivery-title {
	margin-top: 16rpx;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #111827;
}

.shop-merchant-item-actions {
	margin-top: 20rpx;
	justify-content: flex-end;
}

.shop-merchant-item-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 72rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}

.shop-merchant-item-button-light {
	background: #f8fafc;
	color: #0f172a;
}
</style>
