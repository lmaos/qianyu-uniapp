<template>
	<view class="shop-evaluate-page">
		<view class="shop-evaluate-nav" :style="navStyle">
			<ShopSubPageHeader title="评价详情" @back="handleBack" />
		</view>

		<view class="shop-evaluate-content" :style="contentStyle">
			<view class="shop-evaluate-summary-card">
				<text class="shop-evaluate-summary-title">{{ evaluateData.productTitle }}</text>
				<text class="shop-evaluate-summary-desc">
					共 {{ evaluateData.evaluateSummary.totalCount }} 条评价，近 7 天好评率 {{ evaluateData.evaluateSummary.sevenDayPositiveRate }}
				</text>
				<view class="shop-evaluate-stat-row">
					<view class="shop-evaluate-stat-item">
						<text class="shop-evaluate-stat-value">{{ evaluateData.evaluateSummary.goodRate }}</text>
						<text class="shop-evaluate-stat-label">好评占比</text>
					</view>
					<view class="shop-evaluate-stat-item">
						<text class="shop-evaluate-stat-value">{{ evaluateData.evaluateSummary.neutralCount }}</text>
						<text class="shop-evaluate-stat-label">中评数量</text>
					</view>
					<view class="shop-evaluate-stat-item">
						<text class="shop-evaluate-stat-value">{{ evaluateData.evaluateSummary.badCount }}</text>
						<text class="shop-evaluate-stat-label">差评数量</text>
					</view>
				</view>
			</view>

			<view v-for="item in evaluateData.reviewList" :key="item.id" class="shop-evaluate-item">
				<view class="shop-evaluate-user-row">
					<view class="shop-evaluate-avatar" :style="{ background: item.avatarBackground }">{{ item.avatarText }}</view>
					<view class="shop-evaluate-user-meta">
						<text class="shop-evaluate-user-name">{{ item.nickname }}</text>
						<text class="shop-evaluate-user-level">{{ item.memberLevel }}</text>
					</view>
				</view>
				<text class="shop-evaluate-item-content">{{ item.content }}</text>
				<view v-if="item.imageList.length" class="shop-evaluate-image-row">
					<view
						v-for="imageItem in item.imageList"
						:key="imageItem.id"
						class="shop-evaluate-image"
						:style="{ background: imageItem.background }"
					>
						{{ imageItem.label }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_HEADER_BORDER,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { adaptReviewItem, adaptReviewStat, extractPage } from '@/utils/shopAdapter'

const systemInfo = uni.getSystemInfoSync()
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0
const windowWidthPx = Number(systemInfo.windowWidth) || 375
const navBarHeightPx = safeTopPx + rpxToPx(88)

// 评价数据
const spuInfo = ref({ name: '', image: '' })
const evaluateData = ref({ summary: {}, reviewList: [] })
const reviewPage = ref({ records: [], totalRow: 0, pageNumber: 1, pageSize: 10, totalPage: 0 })
const loading = ref(false)
const currentSpuId = ref(0)

const navStyle = computed(() => {
	return {
		paddingTop: `${safeTopPx}px`,
		height: `${navBarHeightPx}px`,
		background: SHOP_HEADER_BACKGROUND,
		borderBottom: SHOP_HEADER_BORDER,
		...SHOP_HEADER_AREA_STYLE
	}
})

const contentStyle = computed(() => {
	return {
		paddingTop: `${navBarHeightPx + 12}px`,
		background: SHOP_PAGE_BACKGROUND
	}
})

// 加载评价聚合（pms/rev/reviewPage）
async function loadEvaluatePage() {
	const { code, response } = await request.post({
		url: API.REV_REVIEW_PAGE,
		data: { spuId: currentSpuId.value, pageNum: 1, pageSize: 10, score: 0 }
	})
	if (code !== 200) return
		if (response?.state !== 'OK') return
	const content = response.content || {}
	spuInfo.value = { name: content.spuName || '', image: content.spuImage || '' }
	evaluateData.value = {
		summary: adaptReviewStat(content.reviewStat),
		reviewList: (content.reviewList?.records || []).map(adaptReviewItem)
	}
	reviewPage.value = extractPage(content.reviewList)
}

// 加载更多
async function loadMoreReview() {
	if (loading.value) return
	if (reviewPage.value.pageNumber >= reviewPage.value.totalPage) return
	loading.value = true
	try {
		const next = reviewPage.value.pageNumber + 1
		const { code, response } = await request.post({
			url: API.REV_REVIEW_LIST,
			data: { spuId: currentSpuId.value, pageNum: next, pageSize: 10, score: 0 }
		})
		if (code !== 200) return
		if (response?.state !== 'OK') return
		if (response?.state !== 'OK') return
		const page = extractPage(response.content)
		const list = page.records.map(adaptReviewItem)
		reviewPage.value = page
		evaluateData.value.reviewList = evaluateData.value.reviewList.concat(list)
	} finally {
		loading.value = false
	}
}

onLoad((options) => {
	currentSpuId.value = Number(options?.productId || options?.spuId) || 0
	if (currentSpuId.value > 0) {
		loadEvaluatePage()
	}
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function rpxToPx(value) {
	return Math.round((windowWidthPx * Number(value)) / 750)
}
</script>

<style scoped>
.shop-evaluate-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-evaluate-nav {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 20;
}

.shop-evaluate-nav,
.shop-evaluate-content {
	padding-right: 24rpx;
	padding-left: 24rpx;
	box-sizing: border-box;
}

.shop-evaluate-nav {
	display: flex;
	align-items: center;
	height: auto;
}

.shop-evaluate-summary-card,
.shop-evaluate-item {
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-evaluate-summary-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 40rpx;
	color: #111827;
}

.shop-evaluate-summary-desc {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.shop-evaluate-stat-row {
	display: flex;
	gap: 16rpx;
	margin-top: 20rpx;
}

.shop-evaluate-stat-item {
	flex: 1;
	padding: 20rpx 12rpx;
	border-radius: 24rpx;
	background: #f8fafc;
	text-align: center;
}

.shop-evaluate-stat-value {
	display: block;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #111827;
}

.shop-evaluate-stat-label {
	display: block;
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #667085;
}

.shop-evaluate-user-row {
	display: flex;
	align-items: center;
}

.shop-evaluate-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	font-weight: 700;
	line-height: 28rpx;
	color: rgba(17, 24, 39, 0.72);
}

.shop-evaluate-user-meta {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	margin-left: 14rpx;
}

.shop-evaluate-user-name {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #111827;
}

.shop-evaluate-user-level {
	margin-left: 12rpx;
	padding: 2rpx 10rpx;
	border-radius: 999rpx;
	font-size: 18rpx;
	line-height: 24rpx;
	color: #fe2c55;
	background: rgba(254, 44, 85, 0.08);
}

.shop-evaluate-item-content {
	display: block;
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 38rpx;
	color: #344054;
}

.shop-evaluate-image-row {
	display: flex;
	gap: 12rpx;
	margin-top: 16rpx;
}

.shop-evaluate-image {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 132rpx;
	height: 132rpx;
	border-radius: 20rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: rgba(17, 24, 39, 0.68);
}
</style>
