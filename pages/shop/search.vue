<template>
	<view class="shop-search-page" :style="pageStyle">
		<view class="shop-search-topbar" :style="topbarStyle">
			<ShopSubPageHeader title="搜索" @back="handleBack" />
		</view>

		<view class="shop-search-content" :style="contentStyle">
			<view class="shop-search-card">
				<text class="shop-search-card-title">搜索页占位</text>
				<text class="shop-search-card-desc">TODO：后续在这里接入搜索联想、历史记录与真实搜索接口。</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_HEADER_BORDER,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'

const systemInfo = uni.getSystemInfoSync()
const safeTopPx = Number(systemInfo.safeAreaInsets?.top || 0)
const windowHeight = Number(systemInfo.windowHeight || 0)
const windowWidthPx = Number(systemInfo.windowWidth || 375)

const topbarHeightPx = computed(() => safeTopPx + rpxToPx(88))
const pageStyle = computed(() => ({
	minHeight: `${windowHeight}px`,
	background: SHOP_PAGE_BACKGROUND
}))
const topbarStyle = computed(() => ({
	paddingTop: `${safeTopPx}px`,
	height: `${topbarHeightPx.value}px`,
	background: SHOP_HEADER_BACKGROUND,
	borderBottom: SHOP_HEADER_BORDER,
	backdropFilter: SHOP_HEADER_AREA_STYLE.backdropFilter,
	WebkitBackdropFilter: SHOP_HEADER_AREA_STYLE.WebkitBackdropFilter
}))
const contentStyle = computed(() => ({
	paddingTop: `${topbarHeightPx.value + 24}px`
}))

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function rpxToPx(value) {
	return Math.round((windowWidthPx * Number(value || 0)) / 750)
}
</script>

<style scoped>
.shop-search-page {
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-search-topbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 20;
	display: flex;
	align-items: center;
	padding: 0 24rpx;
	box-sizing: border-box;
}

.shop-search-content {
	padding-left: 24rpx;
	padding-right: 24rpx;
	box-sizing: border-box;
}

.shop-search-card {
	padding: 32rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(255, 171, 191, 0.08);
}

.shop-search-card-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #0f172a;
}

.shop-search-card-desc {
	display: block;
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #64748b;
}
</style>
