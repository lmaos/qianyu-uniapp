<template>
	<view class="shop-detail-page">
		<FullScreenPageLayout
			:page-background="SHOP_PAGE_BACKGROUND"
			:content-style="detailContentStyle"
			:content-top-offset-px="12"
			:header-height-rpx="88"
			:header-side-padding-rpx="24"
			:header-background="SHOP_HEADER_BACKGROUND"
			:header-z-index="30"
			:header-area-style="SHOP_HEADER_AREA_STYLE"
			:footer-reserve-rpx="152"
			:footer-gap-rpx="18"
			:footer-top-padding-rpx="16"
			:footer-side-padding-rpx="24"
			:footer-inner-min-height-rpx="120"
			:footer-z-index="40"
			footer-background="#ffffff"
			footer-border-top="1rpx solid #eef2f7"
		>
			<template #header>
				<ShopSubPageHeader
					:back-icon-size-rpx="40"
					:right-min-width-rpx="168"
					@back="handleBack"
				>
					<template #right>
						<ShopHeaderIconButton
							:icon="collected ? SHOP_TOP_FAVORITE_ACTIVE_ICON : SHOP_TOP_FAVORITE_ICON"
							:size-rpx="72"
							:icon-size-rpx="40"
							:active="collected"
							@tap="handleFavoriteClick"
						/>
						<ShopHeaderIconButton
							:icon="SHOP_TOP_CART_ICON"
							:size-rpx="72"
							:icon-size-rpx="40"
							@tap="handleHeaderCartClick"
						/>
					</template>
				</ShopSubPageHeader>
			</template>

			<GoodsMediaSwiper
				ref="goodsMediaSwiperRef"
				:media-list="currentMediaList"
				@media-change="handleMediaChange"
				@media-click="handleMediaClick"
			/>

			<GoodsSkuHotBar
				v-if="skuList.length > 1"
				:sku-list="skuList"
				:active-sku-id="selectedSkuId"
				@sku-change="handleSkuHotChange"
				@more-click="handleOpenSkuPopup"
			/>

			<view class="shop-detail-section goods-price-area">
				<view class="goods-price-row">
					<view class="goods-price-main">
						<text class="goods-price-symbol">¥</text>
						<text class="goods-price-value">{{ formattedPrice }}</text>
					</view>
					<text class="goods-price-sale-count">已售 {{ currentSku.soldCount }}</text>
				</view>
				<view class="goods-price-tag-row">
					<text v-for="item in priceTagList" :key="item" class="goods-price-tag">{{ item }}</text>
				</view>
			</view>

			<view class="shop-detail-section goods-title-area">
				<text class="goods-title-text">{{ currentSku.title }}</text>
				<view class="goods-title-tag-row">
					<text v-for="item in currentSku.authTagList" :key="item" class="goods-title-tag">{{ item }}</text>
				</view>
			</view>

			<GoodsLogisticsCard
				:logistics-info="currentSku.logisticsInfo"
				:after-sale-tag-list="currentSku.afterSaleTagList"
			/>

			<GoodsEvaluateCard
				:summary="goodsDetail.evaluateSummary"
				:review-list="goodsDetail.reviewList"
				@open="handleEvaluateOpen"
			/>

			<GoodsShopInfoCard
				:shop-info="goodsDetail.shopInfo"
				:followed="shopFollowed"
				@follow-click="handleShopFollowClick"
				@enter-click="handleEnterShopClick"
			/>

			<GoodsSpecParamArea :param-list="currentSku.paramList" />

			<GoodsIntroContent :block-list="goodsDetail.introBlocks" />

			<GoodsServiceTextArea :markdown-text="goodsDetail.serviceMarkdown" />

			<template #footer>
				<GoodsBottomBar
					:order-price="currentSku.price"
					:cart-count="cartCount"
					@shop-click="handleBottomShopClick"
					@service-click="handleBottomServiceClick"
					@cart-click="handleBottomCartClick"
					@add-cart-click="handleBottomAddCartClick"
					@buy-click="handleBottomBuyClick"
				/>
			</template>
		</FullScreenPageLayout>

		<GoodsSkuPopup
			:visible="skuPopupVisible"
			:sku-list="skuList"
			:active-sku-id="selectedSkuId"
			:quantity="skuQuantity"
			:mode="skuPopupMode"
			:popup-height-px="skuPopupHeightPx"
			:bottom-gap-rpx="21"
			@close="handleCloseSkuPopup"
			@sku-change="handlePopupSkuChange"
			@quantity-change="handlePopupQuantityChange"
			@confirm="handleSkuPopupConfirm"
		/>

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
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopCustomerServiceSheet from '@/components/shop/common/ShopCustomerServiceSheet.vue'
import ShopHeaderIconButton from '@/components/shop/common/ShopHeaderIconButton.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import GoodsBottomBar from '@/components/shop/detail/GoodsBottomBar.vue'
import GoodsEvaluateCard from '@/components/shop/detail/GoodsEvaluateCard.vue'
import GoodsIntroContent from '@/components/shop/detail/GoodsIntroContent.vue'
import GoodsLogisticsCard from '@/components/shop/detail/GoodsLogisticsCard.vue'
import GoodsMediaSwiper from '@/components/shop/detail/GoodsMediaSwiper.vue'
import GoodsServiceTextArea from '@/components/shop/detail/GoodsServiceTextArea.vue'
import GoodsShopInfoCard from '@/components/shop/detail/GoodsShopInfoCard.vue'
import GoodsSkuHotBar from '@/components/shop/detail/GoodsSkuHotBar.vue'
import GoodsSkuPopup from '@/components/shop/detail/GoodsSkuPopup.vue'
import GoodsSpecParamArea from '@/components/shop/detail/GoodsSpecParamArea.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND,
	SHOP_TOP_CART_ICON,
	SHOP_TOP_FAVORITE_ACTIVE_ICON,
	SHOP_TOP_FAVORITE_ICON
} from '@/components/shop/common/shopSurface.js'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { getGoodsDetailMock } from '@/components/shop/detail/shopDetailMock.js'
import {
	buildShopStoreHomeUrl,
	getShopCustomerServiceSheetMock
} from '@/components/shop/common/shopFlowMock.js'

const { windowHeightPx } = useSafeAreaMetrics()
const skuPopupHeightPx = computed(() => Math.floor(windowHeightPx.value * 0.75))

const goodsDetail = ref(getGoodsDetailMock('recommend-product-1-1'))
const goodsMediaSwiperRef = ref(null)
const selectedSkuId = ref(goodsDetail.value.skuList[0]?.id || '')
const skuQuantity = ref(1)
const skuPopupVisible = ref(false)
const skuPopupMode = ref('select')
const collected = ref(false)
const shopFollowed = ref(false)
const cartCount = ref(goodsDetail.value.cartCount || 0)
const serviceSheetVisible = ref(false)
const serviceSheetData = ref(getShopCustomerServiceSheetMock({ contextType: 'product' }))
const detailContentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx'
}

// 当前详情页的全部 SKU 列表。
const skuList = computed(() => {
	return goodsDetail.value.skuList || []
})

// 当前选中的 SKU。
const currentSku = computed(() => {
	return skuList.value.find((item) => item.id === selectedSkuId.value) || skuList.value[0] || {}
})

// 价格活动区域需要展示的活动标签。
const priceTagList = computed(() => {
	return [currentSku.value.subsidyText, currentSku.value.discountText, currentSku.value.fullReductionText].filter(Boolean)
})

// 当前选中 SKU 的价格展示文案。
const formattedPrice = computed(() => {
	return formatPrice(currentSku.value.price)
})

// 当前选中 SKU 的轮播素材。
const currentMediaList = computed(() => {
	return currentSku.value.mediaList || []
})

onLoad((options) => {
	loadGoodsDetail(options?.productId)
})

// 根据商品 ID 加载详情页 mock 数据。
function loadGoodsDetail(productId) {
	const targetId = `${productId || 'recommend-product-1-1'}`.trim() || 'recommend-product-1-1'
	const nextDetail = getGoodsDetailMock(targetId)
	goodsDetail.value = nextDetail
	selectedSkuId.value = nextDetail.skuList[0]?.id || ''
	skuQuantity.value = 1
	cartCount.value = nextDetail.cartCount || 0
	shopFollowed.value = false
	collected.value = false
	serviceSheetData.value = getShopCustomerServiceSheetMock({
		contextType: 'product',
		productId: targetId
	})
	onProductDetailLoad({
		productId: targetId
	})
}

// 返回上一页。
function handleBack() {
	stopMediaPlayback()
	uni.navigateBack({
		delta: 1
	})
}

// 点击收藏按钮后的基础交互。
function handleFavoriteClick() {
	collected.value = !collected.value
	onFavoriteClick({
		productId: goodsDetail.value.productId,
		collected: collected.value
	})
}

// 顶部购物车入口，保留独立来源字段，方便后续埋点或替换真实接口。
function handleHeaderCartClick() {
	openCartPage('header')
}

// 轮播素材切换占位回调。
function handleMediaChange(mediaItem) {
	onMediaChange(mediaItem)
}

// 点击轮播素材占位回调。
function handleMediaClick(mediaItem) {
	onMediaClick(mediaItem)
}

// 点击 SKU 快捷栏单项后直接联动详情信息。
function handleSkuHotChange(skuItem) {
	selectSku(skuItem)
}

// 打开 SKU 弹窗，默认用于常规 SKU 选择。
function handleOpenSkuPopup() {
	stopMediaPlayback()
	skuPopupMode.value = 'select'
	skuPopupVisible.value = true
	onSkuPopupOpen({
		mode: skuPopupMode.value
	})
}

// 关闭 SKU 弹窗。
function handleCloseSkuPopup() {
	skuPopupVisible.value = false
}

// SKU 弹窗内切换 SKU。
function handlePopupSkuChange(skuItem) {
	selectSku(skuItem)
}

// SKU 弹窗内调整数量。
function handlePopupQuantityChange(nextQuantity) {
	const nextValue = Math.max(1, Number(nextQuantity) || 1)
	if (!currentSku.value.stock) {
		skuQuantity.value = 1
		return
	}

	skuQuantity.value = Math.min(nextValue, currentSku.value.stock)
}

// SKU 弹窗确认后的统一处理入口。
function handleSkuPopupConfirm(payload) {
	if (!currentSku.value.stock) {
		showNoStockToast()
		return
	}

	if (payload.mode === 'buy') {
		const addSuccess = addCurrentSkuToCart('popup-buy')
		if (!addSuccess) {
			return
		}

		skuPopupVisible.value = false
		onBuyConfirm(payload)
		uni.navigateTo({
			url: `/pages/shop/order-submit?productId=${encodeURIComponent(goodsDetail.value.productId)}&skuId=${encodeURIComponent(currentSku.value.id)}&quantity=${encodeURIComponent(skuQuantity.value)}`
		})
		return
	}

	uni.showToast({
		title: '已切换当前SKU',
		icon: 'none'
	})
	skuPopupVisible.value = false
	onSkuConfirm(payload)
}

// 打开评价详情页。
function handleEvaluateOpen() {
	stopMediaPlayback()
	onEvaluateOpen({
		productId: goodsDetail.value.productId
	})
	uni.navigateTo({
		url: `/pages/shop/evaluate-list?productId=${encodeURIComponent(goodsDetail.value.productId)}`
	})
}

// 店铺关注基础交互。
function handleShopFollowClick() {
	shopFollowed.value = !shopFollowed.value
	onShopFollowClick({
		productId: goodsDetail.value.productId,
		followed: shopFollowed.value
	})
}

// 进店逛逛入口占位交互。
function handleEnterShopClick() {
	onEnterShopClick({
		productId: goodsDetail.value.productId
	})
	uni.navigateTo({
		url: buildShopStoreHomeUrl({
			storeId: `${goodsDetail.value.productId}-store`,
			storeName: goodsDetail.value.shopInfo?.name,
			productId: goodsDetail.value.productId
		})
	})
}

// 底部店铺入口。
function handleBottomShopClick() {
	onBottomShopClick({
		productId: goodsDetail.value.productId
	})
	uni.navigateTo({
		url: buildShopStoreHomeUrl({
			storeId: `${goodsDetail.value.productId}-store`,
			storeName: goodsDetail.value.shopInfo?.name,
			productId: goodsDetail.value.productId
		})
	})
}

// 底部客服入口。
function handleBottomServiceClick() {
	onBottomServiceClick({
		productId: goodsDetail.value.productId
	})
	serviceSheetVisible.value = true
}

// 底部购物车入口。
function handleBottomCartClick() {
	openCartPage('bottom')
}

// 底部加入购物车：直接使用当前 SKU，不再额外弹窗。
function handleBottomAddCartClick() {
	addCurrentSkuToCart('bottom-add-cart')
}

// 底部下单：拉起 SKU 弹窗，默认选中当前 SKU。
function handleBottomBuyClick() {
	stopMediaPlayback()
	skuPopupMode.value = 'buy'
	skuPopupVisible.value = true
	onSkuPopupOpen({
		mode: skuPopupMode.value
	})
}

function selectSku(skuItem) {
	if (!skuItem?.id) {
		return
	}

	selectedSkuId.value = skuItem.id
	if (!skuItem.stock) {
		skuQuantity.value = 1
	} else if (skuQuantity.value > skuItem.stock) {
		skuQuantity.value = skuItem.stock
	}
	onSkuChange(skuItem)
}

function addCurrentSkuToCart(source) {
	if (!currentSku.value.stock) {
		showNoStockToast()
		return false
	}

	cartCount.value += skuQuantity.value
	onAddCartClick({
		productId: goodsDetail.value.productId,
		skuId: currentSku.value.id,
		quantity: skuQuantity.value,
		source
	})
	uni.showToast({
		title: '已加入购物车',
		icon: 'none'
	})
	return true
}

function showNoStockToast() {
	uni.showToast({
		title: '当前SKU暂无货',
		icon: 'none'
	})
}

function openCartPage(source) {
	onCartEntryClick({
		productId: goodsDetail.value.productId,
		source
	})
	uni.navigateTo({
		url: '/pages/shop/cart'
	})
}

function stopMediaPlayback() {
	goodsMediaSwiperRef.value?.stopPlayback?.()
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
	onServicePrimary(goodsDetail.value.productId)
	uni.showToast({
		title: '开始咨询占位',
		icon: 'none'
	})
}

function handleServiceSecondary() {
	onServiceSecondary(goodsDetail.value.productId)
	uni.showToast({
		title: '问题反馈占位',
		icon: 'none'
	})
}

// 以下为详情页预留回调，后续可直接接真实业务逻辑。
function onProductDetailLoad(payload) {
	// TODO：替换商品详情页初始化接口
	console.log('shop-detail-load', payload.productId)
}

function onFavoriteClick(payload) {
	// TODO：替换商品收藏逻辑
	console.log('shop-detail-favorite-click', payload.productId, payload.collected)
}

function onMediaChange(mediaItem) {
	// TODO：替换商品素材切换回调
	console.log('shop-detail-media-change', mediaItem?.id)
}

function onMediaClick(mediaItem) {
	// TODO：替换商品素材点击逻辑
	console.log('shop-detail-media-click', mediaItem?.id)
}

function onSkuChange(skuItem) {
	// TODO：替换 SKU 切换联动逻辑
	console.log('shop-detail-sku-change', skuItem.id)
}

function onSkuPopupOpen(payload) {
	// TODO：替换 SKU 弹窗打开逻辑
	console.log('shop-detail-sku-popup-open', payload.mode)
}

function onSkuConfirm(payload) {
	// TODO：替换 SKU 弹窗确认逻辑
	console.log('shop-detail-sku-confirm', payload.skuInfo.id, payload.quantity)
}

function onBuyConfirm(payload) {
	// TODO：替换下单确认前置逻辑
	console.log('shop-detail-buy-confirm', payload.skuInfo.id, payload.quantity)
}

function onEvaluateOpen(payload) {
	// TODO：替换评价详情跳转前置逻辑
	console.log('shop-detail-evaluate-open', payload.productId)
}

function onShopFollowClick(payload) {
	// TODO：替换店铺关注逻辑
	console.log('shop-detail-shop-follow', payload.productId, payload.followed)
}

function onEnterShopClick(payload) {
	// TODO：替换进店逛逛逻辑
	console.log('shop-detail-enter-shop', payload.productId)
}

function onBottomShopClick(payload) {
	// TODO：替换底部店铺入口逻辑
	console.log('shop-detail-bottom-shop', payload.productId)
}

function onBottomServiceClick(payload) {
	// TODO：替换底部客服入口逻辑
	console.log('shop-detail-bottom-service', payload.productId)
}

function onCartEntryClick(payload) {
	// TODO：替换详情页购物车入口逻辑
	console.log('shop-detail-cart-entry', payload.productId, payload.source)
}

function onAddCartClick(payload) {
	// TODO：替换加入购物车逻辑
	console.log('shop-detail-add-cart', payload.productId, payload.skuId, payload.quantity, payload.source)
}

function onServiceQuestionClick(question) {
	// TODO：替换商品客服快捷问题逻辑
	console.log('shop-detail-service-question', goodsDetail.value.productId, question)
}

function onServiceMenuClick(menuItem) {
	// TODO：替换商品客服菜单逻辑
	console.log('shop-detail-service-menu', goodsDetail.value.productId, menuItem.key)
}

function onServicePrimary(productId) {
	// TODO：替换商品客服主 CTA 逻辑
	console.log('shop-detail-service-primary', productId)
}

function onServiceSecondary(productId) {
	// TODO：替换商品客服次 CTA 逻辑
	console.log('shop-detail-service-secondary', productId)
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
.shop-detail-section {
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.goods-price-row {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 20rpx;
}

.goods-price-main {
	display: flex;
	align-items: baseline;
}

.goods-price-symbol {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #fe2c55;
}

.goods-price-value {
	margin-left: 4rpx;
	font-size: 56rpx;
	font-weight: 700;
	line-height: 64rpx;
	color: #fe2c55;
}

.goods-price-sale-count {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.goods-price-tag-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
}

.goods-price-tag {
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #fe2c55;
	background: rgba(254, 44, 85, 0.08);
}

.goods-title-text {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	line-height: 46rpx;
	color: #111827;
}

.goods-title-tag-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
}

.goods-title-tag {
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #475467;
	background: #f4f6fb;
}
</style>
