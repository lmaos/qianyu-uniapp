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

			<view class="shop-store-cover" :style="{ background: storeInfo.coverBackground }">
				<view class="shop-store-cover-main">
					<view class="shop-store-avatar" :style="{ background: storeInfo.avatarBackground }">
						{{ storeInfo.avatarText }}
					</view>

					<view class="shop-store-meta">
						<text class="shop-store-name">{{ storeInfo.name }}</text>
						<text class="shop-store-desc">{{ storeInfo.desc }}</text>
						<text class="shop-store-follow">{{ storeInfo.followerText }} · 店铺评分 {{ storeInfo.scoreText }}</text>
					</view>
				</view>

				<view class="shop-store-follow-button" @tap="handleFollowToggle">
					{{ followed ? '已关注' : '关注店铺' }}
				</view>
			</view>

			<view class="shop-store-summary-grid">
				<view class="shop-store-summary-card">
					<text class="shop-store-summary-value">{{ storeInfo.scoreText }}</text>
					<text class="shop-store-summary-label">综合评分</text>
				</view>
				<view class="shop-store-summary-card">
					<text class="shop-store-summary-value">{{ storeInfo.replyRateText || '暂无' }}</text>
					<text class="shop-store-summary-label">客服回复率</text>
				</view>
				<view class="shop-store-summary-card">
					<text class="shop-store-summary-value">{{ storeInfo.goodsCountText }}</text>
					<text class="shop-store-summary-label">在售商品</text>
				</view>
			</view>

			<scroll-view v-if="couponList.length" class="shop-store-coupon-scroll" scroll-x show-scrollbar="false">
				<view class="shop-store-coupon-row">
					<view v-for="item in couponList" :key="item" class="shop-store-coupon">
						{{ item }}
					</view>
				</view>
			</scroll-view>

			<view v-if="guaranteeList.length" class="shop-store-guarantee-card">
				<text class="shop-store-section-title">服务保障</text>
				<view class="shop-store-guarantee-row">
					<view v-for="item in guaranteeList" :key="item" class="shop-store-guarantee-tag">
						{{ item }}
					</view>
				</view>
			</view>

			<view class="shop-store-tab-row">
				<view
					v-for="item in tabList"
					:key="item.key"
					:class="['shop-store-tab', activeTab === item.key ? 'shop-store-tab-active' : '']"
					@tap="handleTabChange(item)"
				>
					{{ item.label }}
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
import { computed, ref, watch } from 'vue'
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
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { adaptProductItem, adaptStoreHome, extractPage } from '@/utils/shopAdapter'
import { buildShopProductDetailUrl } from '@/pages/shop/_productUrl'

// 当前店铺数据
const storeInfo = ref({})
const hotProducts = ref([])
const newProducts = ref([])
const activeTab = ref('home')
// 优惠券 / 服务保障：后端暂无数据源（P2 缺失），前端占位为空数组
const couponList = ref([])
const guaranteeList = ref([])
const followed = ref(false)
const merchantId = ref('')
const storeId = ref('')
const goodsList = ref([])   // 当前 Tab 商品列表
const goodsLoading = ref(false)

const contentProps = {
	'scroll-y': true
}

const contentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	paddingBottom: '36rpx'
}

const tabList = [
  { key: 'home', label: '推荐' },
  { key: 'hot', label: '热销' },
  { key: 'new', label: '新品' }
]

const displayGoodsList = computed(() => {
	if (activeTab.value === 'hot') return hotProducts.value
	if (activeTab.value === 'new') return newProducts.value
	return goodsList.value
})

const activeTabLabel = computed(() => {
	return tabList.find((item) => item.key === activeTab.value)?.label || '店铺商品'
})

// 加载店铺首页聚合数据（mch/storeHome）
async function loadStoreHome() {
	try {
		const { code, response } = await request.post({
			url: API.MCH_STORE_HOME,
			data: { merchantId: merchantId.value, hotLimit: 6, newLimit: 6 }
		})
		if (code !== 200) return
		if (response?.state !== 'OK') return
		const adapted = adaptStoreHome(response.content || {}) || {}
		storeInfo.value = adapted
		hotProducts.value = adapted.hotProducts || []
		newProducts.value = adapted.newProducts || []
		if (adapted.storeId) storeId.value = adapted.storeId
	} catch (e) {
		console.error('[store-home] loadStoreHome error:', e)
	}
}

// 加载店铺商品列表（mch/shopProductList）
async function loadShopProductList() {
	goodsLoading.value = true
	try {
		const sortField = activeTab.value === 'hot' ? 'sales' : 'createTime'
		const { code, response } = await request.post({
			url: API.MCH_SHOP_PRODUCT_LIST,
			data: { merchantId: merchantId.value, sortField, pageNum: 1, pageSize: 20 }
		})
		if (code !== 200) return
		if (response?.state !== 'OK') return
		const page = extractPage(response.content)
		goodsList.value = page.records.map(adaptProductItem)
	} catch (e) {
		console.error('[store-home] loadShopProductList error:', e)
	} finally {
		goodsLoading.value = false
	}
}

// 加载关注状态（fav/favStatus）
async function loadFavStatus() {
	try {
		if (!storeId.value) return
		const { code, response } = await request.post({
			url: API.FAV_STATUS,
			data: { targetType: 2, targetId: storeId.value }
		})
		if (code === 200) {
			followed.value = !!response.content?.isFav
		}
	} catch (e) {
		console.error('[store-home] loadFavStatus error:', e)
	}
}

onLoad((options) => {
	merchantId.value = options?.merchantId || ''
	storeId.value = options?.storeId || ''
	// loadShopProductList 只依赖 merchantId，独立跑，不被 loadStoreHome 阻塞
	// loadFavStatus 需要 loadStoreHome 更新后的真实 storeId，必须串行
	loadStoreHome().then(() => loadFavStatus())
	loadShopProductList()
})

watch(activeTab, () => loadShopProductList())

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleCartOpen() {
	uni.navigateTo({
		url: '/pages/shop/cart'
	})
}

async function handleFollowToggle() {
	if (!storeId.value) return
	const nextFollowed = !followed.value
	const { code } = await request.post({
		url: nextFollowed ? API.FAV_ADD : API.FAV_CANCEL,
		data: { targetType: 2, targetId: storeId.value },
	})
	if (code === 200) {
		followed.value = nextFollowed
		uni.showToast({ title: nextFollowed ? '已关注' : '已取消', icon: 'none' })
	}
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
	uni.navigateTo({
		url: buildShopProductDetailUrl(productInfo)
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
.shop-store-section-desc {
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

</style>
