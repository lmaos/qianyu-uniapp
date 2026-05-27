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
			:footer-reserve-rpx="108"
			:footer-gap-rpx="18"
			:footer-top-padding-rpx="18"
			:footer-side-padding-rpx="24"
			:footer-inner-min-height-rpx="72"
			footer-background="#ffffff"
			footer-border-top="1rpx solid rgba(226, 232, 240, 0.88)"
		>
			<template #header>
				<ShopSubPageHeader title="营销活动" @back="handleBack" />
			</template>

			<view class="shop-merchant-summary-grid">
				<view v-for="item in pageMock.summaryList" :key="item.key" class="shop-merchant-summary-card">
					<text class="shop-merchant-summary-value">{{ item.value }}</text>
					<text class="shop-merchant-summary-label">{{ item.label }}</text>
				</view>
			</view>

			<view
				v-for="item in pageMock.promotionList"
				:key="item.key"
				class="shop-promotion-card"
			>
				<view class="shop-promotion-head">
					<text class="shop-promotion-title">{{ item.title }}</text>
					<text class="shop-promotion-status">{{ item.statusText }}</text>
				</view>
				<text class="shop-promotion-desc">{{ item.desc }}</text>
				<text class="shop-promotion-stat">{{ item.statText }}</text>
				<view class="shop-promotion-actions">
					<view class="shop-promotion-button shop-promotion-button-light" @tap="handlePromotionAction(item, 'detail')">查看活动</view>
					<view class="shop-promotion-button" @tap="handlePromotionAction(item, 'rule')">报名规则</view>
				</view>
			</view>

			<template #footer>
				<view class="shop-promotion-footer">
					<view class="shop-promotion-create-button" @tap="handleCreatePromotion">创建活动</view>
				</view>
			</template>
		</FullScreenPageLayout>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import { getShopMerchantPromotionPageMock } from '@/components/shop/common/shopFlowMock.js'

const pageMock = ref(getShopMerchantPromotionPageMock())

const contentProps = {
	'scroll-y': true
}

const contentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	paddingBottom: '36rpx'
}

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handlePromotionAction(item, actionKey) {
	onPromotionAction(item, actionKey)
	uni.showToast({
		title: actionKey === 'detail' ? '活动详情占位' : '报名规则占位',
		icon: 'none'
	})
}

function handleCreatePromotion() {
	onCreatePromotion()
	uni.showToast({
		title: '创建活动占位',
		icon: 'none'
	})
}

function onPromotionAction(item, actionKey) {
	// TODO：替换营销活动卡片操作逻辑
	console.log('shop-merchant-promotion-action', item.key, actionKey)
}

function onCreatePromotion() {
	// TODO：替换营销活动创建逻辑
	console.log('shop-merchant-promotion-create')
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
.shop-promotion-card {
	padding: 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-merchant-summary-value,
.shop-merchant-summary-label,
.shop-promotion-title,
.shop-promotion-status,
.shop-promotion-desc,
.shop-promotion-stat {
	display: block;
}

.shop-merchant-summary-value {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #111827;
}

.shop-merchant-summary-label,
.shop-promotion-desc,
.shop-promotion-stat {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.shop-promotion-card {
	margin-top: 22rpx;
}

.shop-promotion-head,
.shop-promotion-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.shop-promotion-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #111827;
}

.shop-promotion-status {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #fe2c55;
}

.shop-promotion-actions {
	margin-top: 20rpx;
	justify-content: flex-end;
}

.shop-promotion-button,
.shop-promotion-create-button {
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

.shop-promotion-button-light {
	background: #f8fafc;
	color: #0f172a;
}

.shop-promotion-footer {
	display: flex;
	justify-content: flex-end;
}

.shop-promotion-create-button {
	min-width: 220rpx;
}
</style>
