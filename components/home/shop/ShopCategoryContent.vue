<template>
	<view class="shop-category-content">
		<view class="shop-category-grid">
			<view
				v-for="item in leafDisplayList"
				:key="item.id"
				class="shop-category-grid-item"
				@tap="handleLeafClick(item)"
			>
				<view class="shop-category-grid-cover" :style="{ background: item.coverBackground }">
					<text class="shop-category-grid-cover-text">{{ item.iconText }}</text>
				</view>
				<text class="shop-category-grid-text">{{ item.name }}</text>
			</view>

			<view class="shop-category-grid-item shop-category-grid-item-more" @tap="handleLeafMoreClick">
				<view class="shop-category-grid-cover shop-category-grid-cover-more">
					<text class="shop-category-grid-cover-text shop-category-grid-cover-text-more">更多</text>
				</view>
				<text class="shop-category-grid-text">更多</text>
			</view>
		</view>

		<view class="shop-category-panel shop-category-panel-card">
			<view class="shop-category-section-header">
				<text class="shop-category-section-title">新品</text>
				<text class="shop-category-section-more" @tap="handleNewMoreClick">更多</text>
			</view>
			<view class="shop-category-panel-body">
				<ShopCompactProductList :product-list="newProductList" @product-click="handleProductClick" />
			</view>
		</view>

		<view class="shop-category-feed">
			<view class="shop-category-feed-header">
				<text class="shop-category-feed-title">{{ categoryLabel }}推荐</text>
				<text class="shop-category-feed-desc">持续更新</text>
			</view>
			<view class="shop-category-feed-body">
				<ShopProductList :product-list="feedProductList" @product-click="handleProductClick" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import ShopCompactProductList from '@/components/home/shop/ShopCompactProductList.vue'
import ShopProductList from '@/components/home/shop/ShopProductList.vue'
import { buildShopProductDetailUrl } from '@/components/home/shop/shopProductMock.js'
import {
	buildCategorySearchUrl,
	buildCategoryListUrl,
	getMallCategoryHomeMock
} from '@/components/shop/category/shopCategoryMock.js'

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

// 【MOCK-DISABLED】临时观察真实数据：原数据完全来自 getMallCategoryHomeMock，先置空观察
const categoryHomeMock = computed(() => {
	return {
		firstCategoryName: '',
		thirdCategoryList: [],
		newProductList: [],
		feedProductList: []
	}
})

// 分类内容标题改为当前映射后的一级分类名称。
const categoryLabel = computed(() => {
	return categoryHomeMock.value.firstCategoryName || '分类'
})

// 商品分类宫格最多展示两行，第二行最后一个固定留给“更多”入口。
const leafDisplayList = computed(() => {
	return categoryHomeMock.value.thirdCategoryList || []
})

// 分类内容里的新品区复用当前一级分类下首个二级分类的商品 mock。
const newProductList = computed(() => {
	return categoryHomeMock.value.newProductList || []
})

// 分类推荐流同样复用 stage7 分类 mock，分页数量由父层 sectionCount 控制。
const feedProductList = computed(() => {
	return categoryHomeMock.value.feedProductList || []
})

// 分类区商品点击后进入详情页。
function handleProductClick(productInfo) {
	onProductClick(productInfo)
	uni.navigateTo({
		url: buildShopProductDetailUrl(productInfo)
	})
}

// 最终子分类点击占位回调。
function handleLeafClick(leafInfo) {
	onLeafClick(leafInfo)
	uni.navigateTo({
		url: buildCategorySearchUrl({
			firstCategoryId: leafInfo.firstCategoryId,
			secondCategoryId: leafInfo.secondCategoryId,
			thirdCategoryId: leafInfo.id
		})
	})
}

// 商品分类宫格里的更多入口。
function handleLeafMoreClick() {
	const payload = {
		categoryId: props.categoryId,
		firstCategoryId: categoryHomeMock.value.firstCategoryId
	}
	onLeafMoreClick(payload)
	uni.navigateTo({
		url: buildCategoryListUrl({
			firstCategoryId: payload.firstCategoryId
		})
	})
}

// 新品区域“更多”占位回调。
function handleNewMoreClick() {
	const payload = {
		categoryId: props.categoryId,
		firstCategoryId: categoryHomeMock.value.firstCategoryId
	}
	onNewMoreClick(payload)
	uni.navigateTo({
		url: buildCategoryListUrl({
			firstCategoryId: payload.firstCategoryId
		})
	})
}

// 分类商品点击占位回调，后续可在这里挂筛选埋点或曝光上报。
function onProductClick(productInfo) {
	// TODO：替换商城分类区商品点击前置逻辑
	console.log('shop-category-product-click', productInfo.id)
}

// 最终子分类点击占位回调，后续可切换筛选或跳转分类列表。
function onLeafClick(leafInfo) {
	// TODO：替换商城最终子分类点击逻辑
	console.log('shop-category-leaf-click', leafInfo.id, leafInfo.secondCategoryId)
}

// 商品分类宫格更多占位回调。
function onLeafMoreClick(payload) {
	// TODO：替换商城最终子分类更多逻辑
	console.log('shop-category-leaf-more', payload.categoryId, payload.firstCategoryId)
}

// 新品区域更多占位回调。
function onNewMoreClick(payload) {
	// TODO：替换商城分类新品区域更多逻辑
	console.log('shop-category-new-more', payload.categoryId, payload.firstCategoryId)
}
</script>

<style scoped>
.shop-category-content {
	padding-bottom: 16rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.shop-category-panel {
	padding: 12rpx 0 10rpx;
	border-radius: 32rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 249, 251, 0.94) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 38rpx rgba(255, 171, 191, 0.08);
}

.shop-category-panel-card {
	padding-bottom: 12rpx;
}

.shop-category-grid {
	display: grid;
	grid-template-columns: repeat(5, minmax(0, 1fr));
	gap: 20rpx 12rpx;
	padding: 26rpx 18rpx 18rpx;
	border-radius: 32rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 249, 251, 0.94) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 38rpx rgba(255, 164, 184, 0.08);
}

.shop-category-grid-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 0;
}

.shop-category-grid-cover {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 92rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.8);
	box-shadow: 0 10rpx 24rpx rgba(255, 164, 184, 0.06), inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
}

.shop-category-grid-cover-text {
	font-size: 22rpx;
	font-weight: 700;
	line-height: 28rpx;
	color: rgba(17, 24, 39, 0.68);
	letter-spacing: 2rpx;
}

.shop-category-grid-cover-more {
	background: linear-gradient(135deg, #f4f6fb 0%, #eef2f7 100%);
	border: 1rpx dashed #d0d5dd;
	box-sizing: border-box;
}

.shop-category-grid-cover-text-more {
	color: #667085;
}

.shop-category-grid-text {
	margin-top: 10rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #475467;
	text-align: center;
	word-break: break-all;
}

.shop-category-grid-item-more .shop-category-grid-text {
	color: #667085;
}

.shop-category-section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16rpx;
	margin-bottom: 6rpx;
}

.shop-category-feed-header {
	padding: 0 16rpx;
	margin-bottom: 10rpx;
}

.shop-category-section-title,
.shop-category-feed-title {
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #111827;
}

.shop-category-section-more {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.shop-category-feed {
	display: flex;
	flex-direction: column;
	padding: 12rpx 0 10rpx;
	border-radius: 32rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 249, 251, 0.94) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 38rpx rgba(255, 171, 191, 0.08);
}

.shop-category-feed-desc {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.shop-category-panel-body {
	padding: 0 12rpx;
}

.shop-category-feed-body {
	padding: 0;
}
</style>
