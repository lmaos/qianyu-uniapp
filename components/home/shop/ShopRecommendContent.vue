<template>
	<view class="shop-recommend-content">
		<ShopRecommendBanner
			:active="active"
			:banner-list="bannerList"
			@banner-click="handleBannerClick"
			@banner-change="handleBannerChange"
		/>

		<ShopRecommendZone
			v-for="zone in zoneList"
			:key="zone.id"
			:zone-info="zone"
			@product-click="handleProductClick"
			@more-click="handleZoneMore"
		/>

		<view class="shop-recommend-feed">
			<view class="shop-recommend-feed-header">
				<view class="shop-recommend-feed-tag">猜你喜欢</view>
				<text class="shop-recommend-feed-title">精选推荐</text>
				<text class="shop-recommend-feed-desc">持续更新</text>
			</view>
			<view class="shop-recommend-feed-body">
				<ShopProductList :product-list="feedProductList" @product-click="handleProductClick" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, onActivated, ref, watch } from 'vue'
import ShopRecommendBanner from '@/components/home/shop/ShopRecommendBanner.vue'
import ShopRecommendZone from '@/components/home/shop/ShopRecommendZone.vue'
import ShopProductList from '@/components/home/shop/ShopProductList.vue'
import { buildShopProductDetailUrl } from '@/components/home/shop/shopProductMock.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { adaptProductItem, extractPage } from '@/utils/shopAdapter'

const props = defineProps({
	active: {
		type: Boolean,
		default: false
	},
	categoryId: {
		type: String,
		default: ''
	},
	sectionCount: {
		type: Number,
		default: 3
	}
})

// ── 数据状态 ──────────────────────────────────────────
const bannerList = ref([])
const zoneList = ref([])
const feedProductList = ref([])
const feedPageNum = ref(1)
const feedHasMore = ref(true)
const feedLoading = ref(false)
const initialLoading = ref(false)

// ── 加载首页聚合数据 ──────────────────────────────────
async function loadHomePage() {
	initialLoading.value = true
	try {
		const { code, data } = await request.post({ url: API.CMS_HOME_PAGE })
		if (code !== 200) return
		const content = data.content || {}
		bannerList.value = content.bannerList || []
		zoneList.value = (content.zoneList || []).map((zone) => ({
			...zone,
			productList: (zone.productList || []).map(adaptProductItem),
		}))
	} finally {
		initialLoading.value = false
	}
}

// ── 加载猜你喜欢（分页） ──────────────────────────────
async function loadFeedList(reset = false) {
	if (feedLoading.value) return
	feedLoading.value = true
	try {
		const pageNum = reset ? 1 : feedPageNum.value
		const { code, data } = await request.post({
			url: API.PMS_SPU_LIST,
			data: { pageNum, pageSize: 20, categoryId: props.categoryId || null },
		})
		if (code !== 200) return
		const page = extractPage(data.content)
		const list = page.records.map(adaptProductItem)
		if (reset) {
			feedProductList.value = list
			feedPageNum.value = 2
		} else {
			feedProductList.value = feedProductList.value.concat(list)
			feedPageNum.value = pageNum + 1
		}
		feedHasMore.value = list.length > 0 && pageNum < page.totalPage
	} finally {
		feedLoading.value = false
	}
}

watch(
	() => props.categoryId,
	() => loadFeedList(true),
	{ immediate: false }
)

onActivated(() => {
	if (bannerList.value.length === 0) loadHomePage()
	if (feedProductList.value.length === 0) loadFeedList(true)
})

// 推荐区商品点击后，先走占位回调，再跳详情页。
function handleProductClick(productInfo) {
	onProductClick(productInfo)
	uni.navigateTo({
		url: buildShopProductDetailUrl(productInfo)
	})
}

// 推荐区固定区域“更多”入口占位回调。
function handleZoneMore(zoneInfo) {
	onZoneMore(zoneInfo)
}

// 推荐 Banner 点击占位回调。
function handleBannerClick(bannerInfo) {
	onBannerClick(bannerInfo)
}

// 推荐 Banner 切换占位回调。
function handleBannerChange(bannerInfo) {
	onBannerChange(bannerInfo)
}

// 推荐区商品点击占位回调，后续可接埋点或商品详情预加载。
function onProductClick(productInfo) {
	// TODO：替换商城推荐区商品点击前置逻辑
	console.log('shop-recommend-product-click', productInfo.id)
}

// 推荐区固定区域更多占位回调。
function onZoneMore(zoneInfo) {
	// TODO：替换商城推荐区模块更多逻辑
	console.log('shop-recommend-zone-more', zoneInfo.id)
}

// 推荐 Banner 点击占位回调。
function onBannerClick(bannerInfo) {
	// TODO：替换商城推荐 Banner 点击逻辑
	console.log('shop-recommend-banner-click', bannerInfo?.id)
}

// 推荐 Banner 切换占位回调。
function onBannerChange(bannerInfo) {
	// TODO：替换商城推荐 Banner 切换回调
	console.log('shop-recommend-banner-change', bannerInfo?.id)
}
</script>

<style scoped>
.shop-recommend-content {
	padding-bottom: 16rpx;
}

.shop-recommend-feed {
	margin-top: 24rpx;
	padding: 12rpx 0 10rpx;
	border-radius: 32rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 249, 251, 0.94) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 42rpx rgba(255, 171, 191, 0.08);
}

.shop-recommend-feed-header {
	padding: 0 16rpx;
	margin-bottom: 10rpx;
}

.shop-recommend-feed-tag {
	display: inline-flex;
	align-items: center;
	height: 38rpx;
	padding: 0 14rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 145, 168, 0.16) 0%, rgba(255, 205, 177, 0.26) 100%);
	font-size: 18rpx;
	font-weight: 600;
	line-height: 24rpx;
	color: #c2416c;
}

.shop-recommend-feed-title {
	display: block;
	margin-top: 10rpx;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 40rpx;
	color: #111827;
}

.shop-recommend-feed-desc {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #98a2b3;
}

.shop-recommend-feed-body {
	padding: 0;
}
</style>
