<template>
	<view class="shop-store-home-page">
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
				<ShopSubPageHeader title="店铺首页" :right-min-width-rpx="168" @back="handleBack">
					<template #right>
						<ShopHeaderIconButton
							:icon="SHOP_TOP_CART_ICON"
							:size-rpx="72"
							:icon-size-rpx="40"
							@tap="handleCartOpen"
						/>
					</template>
				</ShopSubPageHeader>
			</template>

			<view class="shop-store-cover" :style="{ background: pageMock.storeInfo.coverBackground }">
				<view class="shop-store-cover-main">
					<view class="shop-store-avatar" :style="{ background: pageMock.storeInfo.avatarBackground }">
						{{ pageMock.storeInfo.avatarText }}
					</view>

					<view class="shop-store-meta">
						<text class="shop-store-name">{{ pageMock.storeInfo.name }}</text>
						<text class="shop-store-desc">{{ pageMock.storeInfo.desc }}</text>
						<text class="shop-store-follow">{{ pageMock.storeInfo.followerText }} · 店铺评分 {{ pageMock.storeInfo.scoreText }}</text>
					</view>
				</view>

				<view class="shop-store-follow-button" @tap="handleFollowToggle">
					{{ followed ? '已关注' : '关注店铺' }}
				</view>
			</view>

			<view class="shop-store-summary-grid">
				<view class="shop-store-summary-card">
					<text class="shop-store-summary-value">{{ pageMock.storeInfo.scoreText }}</text>
					<text class="shop-store-summary-label">综合评分</text>
				</view>
				<view class="shop-store-summary-card">
					<text class="shop-store-summary-value">{{ pageMock.storeInfo.replyRateText }}</text>
					<text class="shop-store-summary-label">客服回复率</text>
				</view>
				<view class="shop-store-summary-card">
					<text class="shop-store-summary-value">{{ pageMock.storeInfo.goodsCountText }}</text>
					<text class="shop-store-summary-label">在售商品</text>
				</view>
			</view>

			<scroll-view class="shop-store-coupon-scroll" scroll-x show-scrollbar="false">
				<view class="shop-store-coupon-row">
					<view v-for="item in pageMock.couponList" :key="item" class="shop-store-coupon">
						{{ item }}
					</view>
				</view>
			</scroll-view>

			<view class="shop-store-guarantee-card">
				<text class="shop-store-section-title">服务保障</text>
				<view class="shop-store-guarantee-row">
					<view v-for="item in pageMock.guaranteeList" :key="item" class="shop-store-guarantee-tag">
						{{ item }}
					</view>
				</view>
			</view>

			<view class="shop-store-tab-row">
				<view
					v-for="item in pageMock.tabList"
					:key="item.key"
					:class="['shop-store-tab', activeTab === item.key ? 'shop-store-tab-active' : '']"
					@tap="handleTabChange(item)"
				>
					{{ item.label }}
				</view>
			</view>

			<view v-if="activeTab === 'home'" class="shop-store-feature-card">
				<view class="shop-store-section-head">
					<text class="shop-store-section-title">店铺主推</text>
					<text class="shop-store-section-desc">优先承接活动与直播同款</text>
				</view>

				<view class="shop-store-feature-list">
					<view
						v-for="item in pageMock.featuredProductList"
						:key="item.id"
						class="shop-store-feature-item"
						@tap="handleProductOpen(item)"
					>
						<view class="shop-store-feature-cover" :style="{ background: item.coverBackground }">
							{{ item.coverText }}
						</view>
						<text class="shop-store-feature-title">{{ item.title }}</text>
						<text class="shop-store-feature-price">¥{{ item.price }}</text>
					</view>
				</view>
			</view>

			<view class="shop-store-goods-card">
				<view class="shop-store-section-head">
					<text class="shop-store-section-title">{{ activeTabLabel }}</text>
					<text class="shop-store-section-desc">点击商品进入详情页</text>
				</view>

				<ShopProductList :product-list="displayGoodsList" @product-click="handleProductOpen" />
			</view>
		</FullScreenPageLayout>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopHeaderIconButton from '@/components/shop/common/ShopHeaderIconButton.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import ShopProductList from '@/components/home/shop/ShopProductList.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND,
	SHOP_TOP_CART_ICON
} from '@/components/shop/common/shopSurface.js'
import { getShopStoreHomeMock } from '@/components/shop/common/shopFlowMock.js'

const pageMock = ref(getShopStoreHomeMock())
const activeTab = ref('home')
const followed = ref(false)

const contentProps = {
	'scroll-y': true
}

const contentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	paddingBottom: '36rpx'
}

const displayGoodsList = computed(() => {
	return pageMock.value.goodsMap?.[activeTab.value] || []
})

const activeTabLabel = computed(() => {
	return pageMock.value.tabList?.find((item) => item.key === activeTab.value)?.label || '店铺商品'
})

onLoad((options) => {
	pageMock.value = getShopStoreHomeMock({
		storeId: options?.storeId,
		storeName: options?.storeName ? decodeURIComponent(options.storeName) : '',
		productId: options?.productId
	})
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleCartOpen() {
	onCartOpen(pageMock.value.storeId)
	uni.navigateTo({
		url: '/pages/shop/cart'
	})
}

function handleFollowToggle() {
	followed.value = !followed.value
	onFollowToggle({
		storeId: pageMock.value.storeId,
		followed: followed.value
	})
}

function handleTabChange(tabItem) {
	if (activeTab.value === tabItem.key) {
		onTabRepeat(tabItem)
		return
	}

	activeTab.value = tabItem.key
	onTabChange(tabItem)
}

function handleProductOpen(productInfo) {
	onProductOpen(productInfo)
	if (!productInfo?.detailUrl) {
		return
	}

	uni.navigateTo({
		url: productInfo.detailUrl
	})
}

function onCartOpen(storeId) {
	// TODO：替换店铺首页购物车入口逻辑
	console.log('shop-store-home-cart-open', storeId)
}

function onFollowToggle(payload) {
	// TODO：替换店铺关注逻辑
	console.log('shop-store-home-follow-toggle', payload.storeId, payload.followed)
}

function onTabChange(tabItem) {
	// TODO：替换店铺首页 tab 切换回调
	console.log('shop-store-home-tab-change', tabItem.key)
}

function onTabRepeat(tabItem) {
	// TODO：替换店铺首页 tab 重复点击回调
	console.log('shop-store-home-tab-repeat', tabItem.key)
}

function onProductOpen(productInfo) {
	// TODO：替换店铺首页商品点击前置逻辑
	console.log('shop-store-home-product-open', productInfo.id)
}
</script>

<style scoped>
.shop-store-home-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-store-cover {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 28rpx;
	border-radius: 34rpx;
	box-shadow: 0 16rpx 42rpx rgba(255, 171, 191, 0.12);
}

.shop-store-cover-main {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.shop-store-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 108rpx;
	height: 108rpx;
	border-radius: 28rpx;
	flex-shrink: 0;
	font-size: 36rpx;
	font-weight: 700;
	color: #ffffff;
}

.shop-store-meta {
	flex: 1;
	min-width: 0;
	margin-left: 20rpx;
}

.shop-store-name,
.shop-store-desc,
.shop-store-follow,
.shop-store-summary-value,
.shop-store-summary-label,
.shop-store-section-title,
.shop-store-section-desc,
.shop-store-feature-title,
.shop-store-feature-price {
	display: block;
}

.shop-store-name {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.shop-store-desc,
.shop-store-follow,
.shop-store-section-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #475467;
}

.shop-store-follow-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 72rpx;
	padding: 0 28rpx;
	margin-left: 20rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.82);
	font-size: 24rpx;
	font-weight: 600;
	color: #d94f7b;
}

.shop-store-summary-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16rpx;
	margin-top: 22rpx;
}

.shop-store-summary-card,
.shop-store-guarantee-card,
.shop-store-feature-card,
.shop-store-goods-card {
	padding: 24rpx;
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-store-summary-value {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #111827;
}

.shop-store-summary-label {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.shop-store-coupon-scroll {
	margin-top: 22rpx;
	white-space: nowrap;
}

.shop-store-coupon-row {
	display: inline-flex;
	gap: 16rpx;
	padding-right: 24rpx;
}

.shop-store-coupon {
	display: inline-flex;
	align-items: center;
	height: 64rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.92);
	font-size: 22rpx;
	font-weight: 600;
	color: #d94f7b;
}

.shop-store-guarantee-card,
.shop-store-feature-card,
.shop-store-goods-card {
	margin-top: 22rpx;
}

.shop-store-guarantee-row {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	margin-top: 16rpx;
}

.shop-store-guarantee-tag {
	padding: 14rpx 18rpx;
	border-radius: 999rpx;
	background: #f8fafc;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #475467;
}

.shop-store-tab-row {
	display: flex;
	gap: 16rpx;
	margin-top: 22rpx;
	padding: 10rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.9);
}

.shop-store-tab {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	height: 66rpx;
	border-radius: 999rpx;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #667085;
}

.shop-store-tab-active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.16) 0%, rgba(214, 228, 255, 0.16) 100%);
	font-weight: 700;
	color: #d94f7b;
}

.shop-store-section-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 18rpx;
}

.shop-store-section-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #111827;
}

.shop-store-feature-list {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 18rpx;
}

.shop-store-feature-item {
	padding: 18rpx;
	border-radius: 28rpx;
	background: #fff8fb;
}

.shop-store-feature-cover {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 180rpx;
	border-radius: 24rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: rgba(17, 24, 39, 0.72);
}

.shop-store-feature-title {
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #111827;
}

.shop-store-feature-price {
	margin-top: 10rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #ef4444;
}
</style>
