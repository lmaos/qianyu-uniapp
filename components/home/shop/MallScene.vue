<template>
	<view class="mall-scene">
		<!-- 1. Banner 轮播：cms-homePage 返回的 bannerList -->
		<view v-if="bannerList.length > 0" class="mall-banner-wrap">
			<ShopRecommendBanner
				:active="active"
				:banner-list="bannerList"
				@banner-click="handleBannerClick"
				@banner-change="handleBannerChange"
			/>
		</view>

		<!-- 2. 分类标签条：根据 cms-homePage 的 defaultTabKey 高亮选中项 -->
		<view class="mall-tabs-wrap">
			<ShopCategoryBar
				compact
				:category-list="tabList"
				:active-id="selectedTabId"
				@category-change="handleCategoryChange"
				@category-page-click="handleCategoryPageClick"
			/>
		</view>

		<!-- 3. 楼层专区：切 tab 时由 cms-tabZoneList 刷新，初次加载沿用 homePage 的数据 -->
		<view v-if="zoneListLoading" class="mall-skeleton-wrap">
			<view v-for="n in 3" :key="n" class="mall-skeleton-zone">
				<view class="mall-skeleton-header"></view>
				<view class="mall-skeleton-grid">
					<view v-for="i in 4" :key="i" class="mall-skeleton-cell"></view>
				</view>
			</view>
		</view>
		<view v-else class="mall-zones-wrap">
			<ShopRecommendZone
				v-for="zone in zoneList"
				:key="zone.id"
				:zone-info="zone"
				@product-click="handleProductClick"
				@more-click="handleZoneMore"
			/>
		</view>

		<!-- 4. 商品列表：根据当前选中 tab 的 id 请求 pms/spuList -->
		<view class="mall-products-wrap">
			<ShopProductList :product-list="productList" @product-click="handleProductClick" />
			<view v-if="loading" class="mall-loading">加载中…</view>
			<view v-else-if="!hasMore && productList.length > 0" class="mall-no-more">— 没有更多了 —</view>
		</view>
	</view>
</template>

<script setup>
// ════════════════════════════════════════════════════════════
// MallScene.vue — 商城场景（新设计：自包含 tabList + zoneList + spuList）
// ════════════════════════════════════════════════════════════
//
// 职责：
//   1. 拉 cms-homePage → 拿到 tabList + zoneList + defaultTabKey
//   2. 渲染分类标签条，defaultTabKey 对应项默认选中并高亮（红色）
//   3. 直接渲染楼层专区（zoneList）
//   4. 根据当前选中的 tab 的 id（来自 tabList[i].id），拉取对应的商品列表
//
// 数据流：
//   onMounted / scene 变可见 → loadHomePage()
//     → 设置 tabList / zoneList / selectedTabId（取 defaultTabKey 或首个）
//     → 触发 loadProductList(reset=true)
//   用户切换 tab → handleCategoryChange → 更新 selectedTabId → loadProductList(reset=true)
//
// 与 HomeMallSceneHost 的关系：
//   本组件由 HomeMallSceneHost 包裹，对外暴露 handleParentRefresh（下拉刷新）
//   和 handleParentReachLower（触底分页），由 IndexContentShell 统一调度。

import { onMounted, ref, watch } from 'vue'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { adaptProductItem, extractPage } from '@/utils/shopAdapter'
import ShopCategoryBar from '@/components/home/shop/ShopCategoryBar.vue'
import ShopRecommendBanner from '@/components/home/shop/ShopRecommendBanner.vue'
import ShopRecommendZone from '@/components/home/shop/ShopRecommendZone.vue'
import ShopProductList from '@/components/home/shop/ShopProductList.vue'
import { buildShopProductDetailUrl } from '@/pages/shop/_productUrl.js'

const props = defineProps({
	active: { type: Boolean, default: false }
})

// ── 数据状态 ──────────────────────────────────────────
const bannerList = ref([])           // cms-homePage 返回的 bannerList（整个会话不变）
const tabList = ref([])             // cms-homePage 返回的 tabList（整个会话不变）
const zoneList = ref([])            // 当前 tab 的 zoneList（homePage 初始 / tabZoneList 刷新）
const selectedTabId = ref('')       // 当前选中的 tab.id
const productList = ref([])         // spuList 返回的商品列表（猜你喜欢，每个 tab 重拉）
const loading = ref(false)
const zoneListLoading = ref(false)  // 切 tab 时显示 skeleton
const pageNum = ref(1)
const hasMore = ref(true)

// ── 加载首页聚合数据 ──────────────────────────────────
async function loadHomePage() {
	try {
		const { code, response } = await request.post({ url: API.CMS_HOME_PAGE })
		if (code !== 200) return
		if (response?.state !== 'OK') return
		const content = response.content || {}
		bannerList.value = content.bannerList || []
		tabList.value = content.tabList || []
		zoneList.value = (content.zoneList || []).map((zone) => ({
			...zone,
			productList: (zone.productList || []).map(adaptProductItem)
		}))

		// 根据后端返回的 defaultTabKey 决定哪个 tab 默认选中
		const matchedDefaultTab = content.defaultTabKey
			? tabList.value.find((t) => t.tabKey === content.defaultTabKey)
			: null
		const nextSelectedId = (matchedDefaultTab || tabList.value[0])?.id || ''
		// 仅在"当前没有选中"或"选中的 tab 已不在列表中"时才覆盖，避免覆盖用户已切换的结果
		if (!selectedTabId.value || !tabList.value.some((t) => t.id === selectedTabId.value)) {
			selectedTabId.value = nextSelectedId
		}

		if (selectedTabId.value) {
			await loadProductList(true)
		}
	} catch (e) {
		console.error('[MallScene] loadHomePage error:', e)
	}
}

// ── 加载当前 tab 的楼层专区（cms-tabZoneList）──────────────
// 切 tab 时调用，刷新 zoneList（同时 banner / tabList 不动）。
//   - categoryId 取自 tabList[i].categoryId（与 spuList 用的同一个值）
//   - 后端规则：categoryId == 0 / null → 返回 recommend 默认 zoneList（与 homePage 一致）
async function loadTabZoneList(tabCategoryId) {
	zoneListLoading.value = true
	try {
		const categoryId = tabCategoryId || 0
		const { code, response } = await request.post({
			url: `${API.CMS_TAB_ZONE_LIST}?categoryId=${encodeURIComponent(categoryId)}`,
		})
		if (code !== 200) return
		if (response?.state !== 'OK') return
		const rawZones = response.content?.zoneList || []
		zoneList.value = rawZones.map((zone) => ({
			...zone,
			productList: (zone.productList || []).map(adaptProductItem)
		}))
	} catch (e) {
		console.error('[MallScene] loadTabZoneList error:', e)
	} finally {
		zoneListLoading.value = false
	}
}

// ── 加载当前 tab 的商品列表（spuList） ───────────────────
// 关键：spuList 接口的 categoryId 参数要取 tabList[i].categoryId，不是 tabList[i].id。
//   - tabList[i].id     = "1390500000000001" 这种 Tab 主键（前端做高亮/点击用）
//   - tabList[i].categoryId = "1389965986633728" 这种商品分类 id（后端 spuList 过滤用）
//   - "推荐" tab 后端没回 categoryId 字段 → 传 null
async function loadProductList(reset = false) {
	if (loading.value) return
	if (!selectedTabId.value) return
	// 从 tabList 里查当前选中项的 categoryId
	const activeTab = tabList.value.find((t) => t.id === selectedTabId.value)
	const apiCategoryId = activeTab ? (activeTab.categoryId || null) : null
	loading.value = true
	try {
		const currentPage = reset ? 1 : pageNum.value
		const { code, response } = await request.post({
			url: API.PMS_SPU_LIST,
			data: { pageNum: currentPage, pageSize: 20, categoryId: apiCategoryId }
		})
		if (code !== 200) return
		if (response?.state !== 'OK') return
		const page = extractPage(response.content)
		const list = (page.records || []).map(adaptProductItem)
		if (reset) {
			productList.value = list
			pageNum.value = 2
		} else {
			productList.value = productList.value.concat(list)
			pageNum.value = currentPage + 1
		}
		hasMore.value = list.length > 0 && currentPage < page.totalPage
	} catch (e) {
		console.error('[MallScene] loadProductList error:', e)
	} finally {
		loading.value = false
	}
}

// ── 事件处理 ──────────────────────────────────────────
function handleCategoryChange(category) {
	if (!category?.id) return
	if (category.id === selectedTabId.value) return
	selectedTabId.value = category.id
	pageNum.value = 1
	hasMore.value = true
	// 切 tab 时同时刷新两段：tab 专属的 zoneList + tab 专属的 spuList（猜你喜欢）
	loadTabZoneList(category.categoryId || 0)
	loadProductList(true)
}

function handleCategoryPageClick() {
	uni.navigateTo({ url: '/pages/shop/category-list' })
}

function handleProductClick(product) {
	uni.navigateTo({ url: buildShopProductDetailUrl(product) })
}

function handleZoneMore(zone) {
	// TODO：替换楼层专区"更多"跳转逻辑
}

function handleBannerClick(banner) {
	// TODO：替换 Banner 点击跳转逻辑
}

function handleBannerChange(banner) {
	// TODO：替换 Banner 切换埋点逻辑
}

// ── 对外暴露：下拉刷新 / 触底分页 ─────────────────────
async function handleParentRefresh() {
	await loadHomePage()
}

async function handleParentReachLower() {
	if (!hasMore.value) return { status: 'no-more' }
	if (loading.value) return { status: 'busy' }
	await loadProductList(false)
	return hasMore.value ? { status: 'loaded' } : { status: 'no-more' }
}

// ── 生命周期：scene 变可见时初始化 ─────────────────────
// 同时挂 onMounted + watch，保证不管 props 何时就绪都能触发首次加载。
onMounted(() => {
	if (tabList.value.length === 0) {
		loadHomePage()
	}
})

watch(
	() => props.active,
	(isActive) => {
		if (isActive && tabList.value.length === 0) {
			loadHomePage()
		}
	}
)

defineExpose({
	handleParentRefresh,
	handleParentReachLower
})
</script>

<style scoped>
.mall-scene {
	min-height: 100%;
	background: transparent;
}

.mall-banner-wrap {
	padding: 0 16rpx;
	margin-bottom: 16rpx;
}

.mall-tabs-wrap {
	padding: 0 16rpx;
	margin-bottom: 20rpx;
}

.mall-zones-wrap {
	margin-bottom: 20rpx;
}

.mall-products-wrap {
	padding: 0 16rpx 32rpx;
}

.mall-loading,
.mall-no-more {
	text-align: center;
	padding: 20rpx 0;
	color: #98a2b3;
	font-size: 24rpx;
}

/* ── 切 tab 时的 skeleton 屏（占位楼层专区） ─────────── */
.mall-skeleton-wrap {
	padding: 0 16rpx;
}

.mall-skeleton-zone {
	margin-top: 24rpx;
	padding: 16rpx;
	border-radius: 32rpx;
	background:
		linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 249, 251, 0.92) 100%);
	box-shadow: 0 16rpx 36rpx rgba(15, 23, 42, 0.06);
	overflow: hidden;
}

.mall-skeleton-header {
	height: 36rpx;
	width: 50%;
	margin-bottom: 20rpx;
	border-radius: 8rpx;
	background: linear-gradient(90deg, #f1f3f7 0%, #e6e9ef 50%, #f1f3f7 100%);
	background-size: 200% 100%;
	animation: mall-skeleton-shimmer 1.4s ease-in-out infinite;
}

.mall-skeleton-grid {
	display: flex;
	gap: 16rpx;
}

.mall-skeleton-cell {
	flex: 1;
	height: 220rpx;
	border-radius: 24rpx;
	background: linear-gradient(90deg, #f1f3f7 0%, #e6e9ef 50%, #f1f3f7 100%);
	background-size: 200% 100%;
	animation: mall-skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes mall-skeleton-shimmer {
	0% { background-position: 200% 0; }
	100% { background-position: -200% 0; }
}
</style>
