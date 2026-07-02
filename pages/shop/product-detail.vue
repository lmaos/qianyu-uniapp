<template>
	<view class="shop-detail-page">
		<FullScreenPageLayout
			:page-background="SHOP_PAGE_BACKGROUND"
			:content-top-offset-px="0"
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

			<view class="detail-media-bleed" :style="{ marginTop: `-${mediaBleedOffsetPx}px` }">
				<GoodsMediaSwiper
					ref="goodsMediaSwiperRef"
					:media-list="currentMediaList"
					@media-change="handleMediaChange"
					@media-click="handleMediaClick"
				/>
			</view>

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

			<GoodsIntroContent
				:html-content="goodsDetail.description"
				:block-list="goodsDetail.introBlocks"
			/>

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
import { computed, nextTick, ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
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
import {
	buildShopCustomerServiceSheetPreview,
	buildShopStoreHomeUrl,
	getShopCustomerServiceSheetMock
} from '@/components/shop/common/shopFlowMock.js'
import {
	buildShopProductDetailPreview,
	resolveShopProductDetailPreview
} from '@/components/home/shop/shopProductMock.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import {
	adaptSpuDetail,
	adaptReviewItem,
	adaptReviewStat,
	adaptShopSimpleVo
} from '@/utils/shopAdapter'

const { windowHeightPx, safeTopPx, rpxToPx } = useSafeAreaMetrics()
const skuPopupHeightPx = computed(() => Math.floor(windowHeightPx.value * 0.75))
const mediaBleedOffsetPx = computed(() => safeTopPx.value + rpxToPx(88))

const goodsDetail = ref(buildShopProductDetailPreview())
const goodsMediaSwiperRef = ref(null)
const selectedSkuId = ref(goodsDetail.value.skuList[0]?.id || '')
const skuQuantity = ref(1)
const skuPopupVisible = ref(false)
const skuPopupMode = ref('select')
const collected = ref(false)
const shopFollowed = ref(false)
const cartCount = ref(goodsDetail.value.cartCount || 0)
const serviceSheetVisible = ref(false)
const serviceSheetData = ref(buildShopCustomerServiceSheetPreview(goodsDetail.value.baseProduct))
let fullDetailTimer = null
let detailLoadRequestId = 0

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
// 优先级：SKU 自带图片 > SPU 图片列表 (images) > SPU 主图 (mainImage/coverImage)
const currentMediaList = computed(() => {
	if (Array.isArray(currentSku.value.mediaList) && currentSku.value.mediaList.length) {
		return currentSku.value.mediaList
	}

	// SPU 级 images（多图）
	const spuImages = Array.isArray(goodsDetail.value.images) ? goodsDetail.value.images : []
	if (spuImages.length) {
		return spuImages
			.filter((url) => !!url)
			.map((url, index) => ({ id: `spu-image-${index}`, type: 'image', url }))
	}

	// SPU 主图兜底
	const spuMainImage = goodsDetail.value.coverImage
	if (spuMainImage) {
		return [{ id: 'spu-main-image', type: 'image', url: spuMainImage }]
	}

	return []
})

onLoad((options) => {
	initializeGoodsDetail(options)
})

onUnload(() => {
	cancelScheduledFullDetailLoad()
})

// 先用列表传入的轻量首屏数据完成页面布局，再异步替换为完整详情数据。
function initializeGoodsDetail(options = {}) {
	const previewDetail = resolveShopProductDetailPreview(options)
	// 路由传入的真实 productId（snowflake 长整型）优先于 mock 预览生成的 ID，
	// 否则收藏 / 加购 / 详情 / 评价 / 收藏状态等接口会拿到 recommend-product-1-1 这类 mock ID，
	// 后端 Long 字段反序列化会报 parseLong error。
	const realProductId = `${options?.productId || ''}`.trim()
	if (realProductId) {
		previewDetail.productId = realProductId
		previewDetail.id = realProductId
		if (previewDetail.baseProduct) {
			previewDetail.baseProduct.id = realProductId
		}
	}
	applyGoodsDetail(previewDetail, {
		resetActionState: true,
		resetQuantity: true
	})
	serviceSheetData.value = buildShopCustomerServiceSheetPreview(previewDetail.baseProduct)
	scheduleFullDetailLoad(previewDetail.productId)
}

function scheduleFullDetailLoad(productId) {
	const targetId = `${productId || 'recommend-product-1-1'}`.trim() || 'recommend-product-1-1'
	detailLoadRequestId += 1
	const requestId = detailLoadRequestId
	cancelScheduledFullDetailLoad()

	nextTick(() => {
		fullDetailTimer = setTimeout(() => {
			if (requestId !== detailLoadRequestId) {
				return
			}

			loadGoodsDetail(targetId)
		}, 32)
	})
}

function cancelScheduledFullDetailLoad() {
	if (fullDetailTimer) {
		clearTimeout(fullDetailTimer)
		fullDetailTimer = null
	}
}

function applyGoodsDetail(nextDetail, { resetActionState = false, resetQuantity = false } = {}) {
	const nextSkuList = nextDetail?.skuList || []
	const currentSelectedSkuId = selectedSkuId.value
	goodsDetail.value = nextDetail
	selectedSkuId.value = nextSkuList.some((item) => item.id === currentSelectedSkuId)
		? currentSelectedSkuId
		: nextSkuList[0]?.id || ''
	if (resetQuantity) {
		skuQuantity.value = 1
	}
	cartCount.value = nextDetail.cartCount || 0
	if (resetActionState) {
		shopFollowed.value = false
		collected.value = false
	}
}

// 根据商品 ID 加载详情页完整数据（4 路并行）
async function loadGoodsDetail(productId) {
	// 保留字符串，避免 Number() 对 snowflake ID 精度丢失（后端 Long 可直接解析数字字符串）
	const spuId = `${productId || ''}`.trim()
	if (!spuId) return

	// 4 路并行：详情 / 评价 / 收藏状态 / 购物车数量
	const [spuRes, reviewRes, favRes, cartRes] = await Promise.all([
		request.post({ url: API.PMS_SPU_DETAIL, data: { spuId } }),
		request.post({ url: API.REV_REVIEW_LIST, data: { spuId, pageNum: 1, pageSize: 3 } }),
		request.post({ url: API.FAV_STATUS, data: { targetType: 1, targetId: spuId } }),
		request.post({ url: API.OMS_CART_LIST }),
	])

	// 主数据
	if (spuRes.code === 200) {
		if (spuRes.response?.state !== 'OK') return
		const spu = spuRes.response.content || {}
		const nextDetail = adaptSpuDetail(spu)
		// SPU 级销量补到 SKU.soldCount
		nextDetail.skuList = (nextDetail.skuList || []).map((sku) => ({
			...sku,
			soldCount: spu.sales || 0,
		}))
		applyGoodsDetail(nextDetail, { resetQuantity: true })
	}

	// 收藏状态
	if (favRes.code === 200) {
		if (favRes.response?.state !== 'OK') return
		collected.value = !!favRes.response.content?.isFav
	}

	// 评价列表（首屏 3 条）
	if (reviewRes.code === 200) {
		if (reviewRes.response?.state !== 'OK') return
		const records = reviewRes.response.content?.records || []
		const nextDetail = { ...goodsDetail.value }
		nextDetail.reviewList = records.map(adaptReviewItem)
		goodsDetail.value = nextDetail
	}

	// 购物车角标
	if (cartRes.code === 200) {
		if (cartRes.response?.state !== 'OK') return
		cartCount.value = Number(cartRes.response.content?.totalCount) || 0
	}

	// 浏览历史（静默）
	request.post({ url: API.HIS_BROWSE_RECORD, data: { spuId } })

	shopFollowed.value = false
	serviceSheetData.value = getShopCustomerServiceSheetMock({
		contextType: 'product',
		productId: spuId
	})
	onProductDetailLoad({ productId: spuId })
}

// 返回上一页。
function handleBack() {
	stopMediaPlayback()
	uni.navigateBack({
		delta: 1
	})
}

// 点击收藏按钮后的基础交互。
async function handleFavoriteClick() {
	const spuId = `${goodsDetail.value.id || ''}`.trim()
	if (!spuId) return
	const nextCollected = !collected.value
	const { code } = await request.post({
		url: nextCollected ? API.FAV_ADD : API.FAV_CANCEL,
		data: { targetType: 1, targetId: spuId },
	})
	if (code === 200) {
		collected.value = nextCollected
		uni.showToast({ title: nextCollected ? '已收藏' : '已取消', icon: 'none' })
	}
	onFavoriteClick({
		productId: spuId,
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
async function handleSkuPopupConfirm(payload) {
	if (!currentSku.value.stock) {
		showNoStockToast()
		return
	}

	if (payload.mode === 'buy') {
		const addSuccess = await addCurrentSkuToCart('popup-buy')
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
			merchantId: goodsDetail.value.merchantId,
			storeId: goodsDetail.value.storeId,
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
			merchantId: goodsDetail.value.merchantId,
			storeId: goodsDetail.value.storeId,
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
async function handleBottomAddCartClick() {
	await addCurrentSkuToCart('bottom-add-cart')
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

async function addCurrentSkuToCart(source) {
	if (!currentSku.value.stock) {
		showNoStockToast()
		return false
	}

	const { code, response } = await request.post({
		url: API.OMS_CART_ADD,
		data: {
			spuId: goodsDetail.value.productId,
			skuId: currentSku.value.id,
			quantity: skuQuantity.value
		}
	})
	if (code !== 200 || response?.state !== 'OK') {
		uni.showToast({
			title: response?.message || '加入购物车失败',
			icon: 'none'
		})
		return false
	}

	cartCount.value = Number(cartCount.value) + skuQuantity.value
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
	// TODO：替换商品详情页完整数据接口；首屏轻量数据已由列表侧提前透传
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
