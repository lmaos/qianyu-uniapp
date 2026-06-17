<template>
	<view class="shop-search-page">
		<RefreshTopStackLayout
			:page-height-px="windowHeightPx"
			:page-background="SHOP_PAGE_BACKGROUND"
			:header-row-height-rpx="88"
			:secondary-height-rpx="searchState === 'result' ? 68 : 0"
			:header-area-style="searchTopbarAreaStyle"
			:secondary-area-style="searchFilterbarAreaStyle"
		>
			<template #header>
				<view class="shop-search-header">
					<ShopHeaderIconButton
						:icon="SHOP_TOP_BACK_ICON"
						:size-rpx="64"
						:icon-size-rpx="34"
						@tap="handleBack"
					/>

					<view class="shop-search-input-wrap">
						<image class="shop-search-input-icon" :src="SHOP_TOP_SEARCH_ICON" mode="aspectFit" />
						<input
							class="shop-search-input"
							type="text"
							:value="inputKeyword"
							:placeholder="searchPlaceholder"
							confirm-type="search"
							@input="handleKeywordInput"
							@confirm="handleSearchSubmit"
						/>
						<text v-if="inputKeyword" class="shop-search-clear" @tap="handleKeywordClear">×</text>
						<view class="shop-search-input-submit" @tap="handleSearchSubmit">搜索</view>
					</view>
				</view>
			</template>

			<template v-if="searchState === 'result'" #secondary>
				<view class="shop-search-filterbar">
					<view class="shop-search-filter-row">
						<view
							class="shop-search-filter-item"
							:class="{ 'shop-search-filter-item--active': sortMode === 'recommend' }"
							@tap="handleRecommendFilterToggle"
						>
							<text class="shop-search-filter-text">{{ recommendLabel }}</text>
							<view class="shop-search-filter-line"></view>
						</view>

						<view
							class="shop-search-filter-item"
							:class="{ 'shop-search-filter-item--active': sortMode === 'sales' }"
							@tap="handleSalesSortClick"
						>
							<text class="shop-search-filter-text">销量</text>
							<view class="shop-search-filter-line"></view>
						</view>

						<view
							class="shop-search-filter-item"
							:class="{ 'shop-search-filter-item--active': sortMode === 'price' }"
							@tap="handlePriceSortClick"
						>
							<text class="shop-search-filter-text">价格{{ priceSortDirectionLabel }}</text>
							<view class="shop-search-filter-line"></view>
						</view>

						<view class="shop-search-filter-item" @tap="handleFilterSidebarOpen">
							<text class="shop-search-filter-text">筛选</text>
							<view class="shop-search-filter-line"></view>
						</view>
					</view>

					<view v-if="recommendDropdownVisible" class="shop-search-filter-dropdown">
						<view
							v-for="item in recommendOptionList"
							:key="item.id"
							class="shop-search-filter-dropdown-item"
							:class="{ 'shop-search-filter-dropdown-item--active': recommendOptionId === item.id }"
							@tap="handleRecommendOptionSelect(item)"
						>
							<text class="shop-search-filter-dropdown-text">{{ item.label }}</text>
						</view>
					</view>
				</view>
			</template>

			<PullPagingShell
				light-theme
				:refresher-enabled="false"
				refresher-background="#f8fafc"
				:lower-threshold="searchPageMock.lowerThresholdPx"
				:scroll-top="parentScrollTopValue"
				:inner-style="contentInnerStyle"
				:bottom-pull-state="bottomPullState"
				:bottom-pull-visible="bottomPullVisible"
				:bottom-pull-slot-style="bottomPullSlotStyle"
				@scroll="handleParentScroll"
				@scroll-lower="handleParentReachLower"
			>
				<view v-if="searchState === 'default'" class="shop-search-discovery-stack">
					<view class="shop-search-section-card">
						<view class="shop-search-section-head">
							<text class="shop-search-section-title">最近搜索</text>
							<text class="shop-search-section-action" @tap="handleHistoryClear">清空</text>
						</view>
						<view class="shop-search-chip-list">
							<view
								v-for="item in historyList"
								:key="item"
								class="shop-search-chip"
								@tap="handleKeywordShortcut(item)"
							>
								{{ item }}
							</view>
						</view>
					</view>

					<view class="shop-search-section-card">
						<text class="shop-search-section-title">热门搜索</text>
						<view class="shop-search-chip-list">
							<view
								v-for="item in hotKeywordList"
								:key="item"
								class="shop-search-chip shop-search-chip-hot"
								@tap="handleKeywordShortcut(item)"
							>
								{{ item }}
							</view>
						</view>
					</view>

					<view class="shop-search-section-card">
						<text class="shop-search-section-title">推荐捷径</text>
						<view
							v-for="item in shortcutList"
							:key="item.key"
							class="shop-search-shortcut-item"
							@tap="handleShortcutClick(item)"
						>
							<view class="shop-search-shortcut-main">
								<text class="shop-search-shortcut-title">{{ item.label }}</text>
								<text class="shop-search-shortcut-desc">{{ item.desc }}</text>
							</view>
							<text class="shop-search-shortcut-arrow">›</text>
						</view>
					</view>
				</view>

				<view v-else-if="searchState === 'suggest'" class="shop-search-section-card">
					<text class="shop-search-section-title">搜索建议</text>
					<view
						v-for="item in suggestionList"
						:key="item.id"
						class="shop-search-suggestion-item"
						@tap="handleSuggestionClick(item)"
					>
						<image class="shop-search-suggestion-icon" :src="SHOP_TOP_SEARCH_ICON" mode="aspectFit" />
						<text class="shop-search-suggestion-text">{{ item.text }}</text>
					</view>
				</view>

				<view v-else class="shop-search-result-content">
					<ShopProductList
						:product-list="displayProductList"
						empty-text="当前搜索条件下暂无商品"
						@product-click="handleGoodsOpen"
					/>
				</view>
			</PullPagingShell>
		</RefreshTopStackLayout>

		<ShopFilterSidebar
			:visible="filterSidebarVisible"
			:bottom-gap-rpx="18"
			:filter-state="appliedFilterState"
			:brand-list="brandList"
			:spec-group-list="specGroupList"
			@close="handleFilterSidebarClose"
			@confirm="handleFilterSidebarConfirm"
		/>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PullPagingShell from '@/components/common/PullPagingShell.vue'
import RefreshTopStackLayout from '@/components/common/RefreshTopStackLayout.vue'
import { buildStaticFrostBackground, STATIC_FROST_AREA_STYLE } from '@/components/common/frostSurface.js'
import ShopProductList from '@/components/home/shop/ShopProductList.vue'
import ShopHeaderIconButton from '@/components/shop/common/ShopHeaderIconButton.vue'
import ShopFilterSidebar from '@/components/shop/category/ShopFilterSidebar.vue'
import {
	SHOP_PAGE_BACKGROUND,
	SHOP_TOP_BACK_ICON,
	SHOP_TOP_SEARCH_ICON
} from '@/components/shop/common/shopSurface.js'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { adaptProductItem, extractPage } from '@/utils/shopAdapter'

const { safeBottomPx, windowHeightPx, rpxToPx } = useSafeAreaMetrics()

const recommendOptionList = [
	{ id: 'comprehensive', label: '综合推荐' },
	{ id: 'comment', label: '评论数从高到低' }
]

// 布局常量（与 API 无关，保留）
const searchPageMock = {
	pageSize: 20,                  // 服务端分页大小
	lowerThresholdPx: 220,
	contentSidePaddingPx: rpxToPx(24),
	contentBottomPaddingPx: rpxToPx(24),
	bottomPullSlotHeightPx: rpxToPx(72)
}

// ── 用户输入 ──────────────────────────────────────────────
const inputKeyword = ref('')
const submittedKeyword = ref('')
const entryCategoryId = ref('recommend')

// ── Discovery 数据（来自 HIS 接口）──────────────────────
const searchPlaceholder = ref('搜索商品 / 店铺 / 品牌')
const historyList = ref([])
const hotKeywordList = ref([])
const shortcutList = ref([
	{ key: 'subsidy', label: '补贴会场', desc: '官方补贴与品牌直降' },
	{ key: 'coupon', label: '优惠券专区', desc: '店铺券、跨店满减' },
	{ key: 'live', label: '直播热卖', desc: '直播间同款商品集合' }
])
const suggestionList = ref([])   // 暂不接（P2 缺失）

// ── 搜索结果数据（来自 PMS_SPU_SEARCH）──────────────────
const searchResultList = ref([])
const brandList = ref([])
const specGroupList = ref([])
const resultPage = ref(1)
const resultTotalPage = ref(1)
const resultHasMore = ref(true)
const searchLoading = ref(false)
const loadingMore = ref(false)

// ── 排序 & 筛选 ──────────────────────────────────────────
const recommendOptionId = ref('comprehensive')
const sortMode = ref('recommend')   // 'recommend' | 'sales' | 'price'
const priceSortDirection = ref('')  // '' | 'asc' | 'desc'
const recommendDropdownVisible = ref(false)
const filterSidebarVisible = ref(false)
const appliedFilterState = ref({
	minPrice: '',
	maxPrice: '',
	selectedBrandIdList: [],
	selectedSpecMap: {}
})

// ── PullPagingShell 滚动状态 ────────────────────────────
const bottomPullState = ref('idle')
const bottomPullVisible = ref(false)
const parentScrollTopPx = ref(0)
const parentScrollTopValue = ref(0)

let bottomPullTimer = null
let scrollTopResetTimer = null
let reachLowerRequestId = 0

const searchTopPanelBackground = buildStaticFrostBackground(
	'linear-gradient(180deg, rgba(255, 251, 252, 0.34) 0%, rgba(250, 251, 253, 0.48) 42%, rgba(248, 250, 252, 0.58) 100%)'
)

const searchTopbarAreaStyle = {
	paddingLeft: '24rpx',
	paddingRight: '24rpx',
	boxSizing: 'border-box',
	background: searchTopPanelBackground,
	...STATIC_FROST_AREA_STYLE
}
const searchFilterbarAreaStyle = {
	paddingLeft: '24rpx',
	paddingRight: '24rpx',
	boxSizing: 'border-box',
	background: searchTopPanelBackground,
	borderBottom: '1rpx solid rgba(255, 255, 255, 0.44)',
	boxShadow: '0 16rpx 34rpx rgba(255, 171, 191, 0.06)',
	...STATIC_FROST_AREA_STYLE
}

const searchState = computed(() => {
	const normalizedInputKeyword = inputKeyword.value.trim()
	if (submittedKeyword.value.trim() && normalizedInputKeyword === submittedKeyword.value.trim()) {
		return 'result'
	}

	if (normalizedInputKeyword) {
		return 'suggest'
	}

	return 'default'
})
const recommendLabel = computed(() =>
	recommendOptionId.value === 'comment' ? '评论数从高到低' : '综合推荐'
)
const priceSortDirectionLabel = computed(() => {
	if (sortMode.value !== 'price') {
		return ''
	}

	return priceSortDirection.value === 'asc' ? '↑' : '↓'
})
// 显示用列表 = 服务端分页累加结果，客户端不再做筛选/排序
const displayProductList = computed(() => searchResultList.value)
const contentInnerStyle = computed(() => {
	const bottomPaddingPx =
		searchPageMock.contentBottomPaddingPx +
		safeBottomPx.value +
		(bottomPullVisible.value ? searchPageMock.bottomPullSlotHeightPx : 0)

	return {
		paddingTop: searchState.value === 'result' ? '8rpx' : '20rpx',
		paddingRight: `${searchPageMock.contentSidePaddingPx}px`,
		paddingBottom: `${bottomPaddingPx}px`,
		paddingLeft: `${searchPageMock.contentSidePaddingPx}px`,
		background: 'transparent'
	}
})
const bottomPullSlotStyle = computed(() => ({
	height: bottomPullVisible.value ? `${searchPageMock.bottomPullSlotHeightPx + safeBottomPx.value}px` : '0px',
	paddingLeft: `${searchPageMock.contentSidePaddingPx}px`,
	paddingRight: `${searchPageMock.contentSidePaddingPx}px`,
	paddingBottom: `${safeBottomPx.value}px`,
	background: 'linear-gradient(180deg, rgba(255, 249, 251, 0) 0%, rgba(255, 246, 249, 0.92) 48%, rgba(248, 250, 252, 0.96) 100%)'
}))

onLoad(async (options) => {
	entryCategoryId.value = `${options?.categoryId || 'recommend'}`.trim() || 'recommend'
	const routeKeyword = decodeURIComponent(`${options?.keyword || ''}`.trim())
	if (routeKeyword) {
		inputKeyword.value = routeKeyword
		submittedKeyword.value = routeKeyword
	}
	await loadDiscovery()
	if (routeKeyword) {
		await loadSearchResults({ reset: true })
	}
})

onBeforeUnmount(() => {
	clearBottomPullTimer()
	clearScrollTopResetTimer()
})

// ════════════════════════════════════════════════════════════
// Discovery 数据加载（history + hot keywords）
// ════════════════════════════════════════════════════════════
async function loadDiscovery() {
	await Promise.all([loadHistoryList(), loadHotKeywords()])
}

async function loadHistoryList() {
	const { code, response } = await request.post({ url: API.HIS_BROWSE_LIST })
	if (code !== 200 || response?.state !== 'OK') return
	// 兼容后端返回两种形态：list<{keyword}> 或 list<string>
	const rawList = response.content?.list || response.content || []
	historyList.value = rawList
		.map((item) => (typeof item === 'string' ? item : (item?.keyword || '')))
		.filter(Boolean)
}

async function loadHotKeywords() {
	const { code, response } = await request.post({ url: API.HIS_SEARCH_HOT })
	if (code !== 200 || response?.state !== 'OK') return
	const rawList = response.content?.list || response.content || []
	hotKeywordList.value = rawList
		.map((item) => (typeof item === 'string' ? item : (item?.keyword || item?.name || '')))
		.filter(Boolean)
}

async function recordSearchKeyword(keyword) {
	if (!keyword) return
	await request.post({ url: API.HIS_SEARCH_RECORD, data: { keyword } })
	await loadHistoryList()
}

async function handleClearHistory() {
	const { code } = await request.post({ url: API.HIS_BROWSE_DELETE })
	if (code === 200) {
		historyList.value = []
	}
}

// ════════════════════════════════════════════════════════════
// 搜索结果加载（pms/spuSearch）
// ════════════════════════════════════════════════════════════
function buildSearchParams(pageNum) {
	const params = {
		keyword: submittedKeyword.value,
		pageNum,
		pageSize: searchPageMock.pageSize,
		categoryId: entryCategoryId.value
	}
	// 排序
	if (sortMode.value === 'sales') {
		params.sortField = 'sales'
		params.sortOrder = 'desc'
	} else if (sortMode.value === 'price') {
		params.sortField = 'price'
		params.sortOrder = priceSortDirection.value === 'asc' ? 'asc' : 'desc'
	} else if (recommendOptionId.value === 'comment') {
		params.sortField = 'commentCount'
		params.sortOrder = 'desc'
	}
	// 价格区间
	if (appliedFilterState.value.minPrice !== '') {
		params.minPrice = Number(appliedFilterState.value.minPrice)
	}
	if (appliedFilterState.value.maxPrice !== '') {
		params.maxPrice = Number(appliedFilterState.value.maxPrice)
	}
	// 品牌
	if (appliedFilterState.value.selectedBrandIdList.length) {
		params.brandIds = [...appliedFilterState.value.selectedBrandIdList]
	}
	// 规格
	const specMap = appliedFilterState.value.selectedSpecMap || {}
	const specPairList = Object.keys(specMap)
		.filter((key) => specMap[key])
		.map((groupId) => ({ groupId, value: specMap[groupId] }))
	if (specPairList.length) {
		params.specValues = specPairList
	}
	return params
}

async function loadSearchResults({ reset = true } = {}) {
	if (reset) {
		if (searchLoading.value) return
		searchLoading.value = true
	} else {
		if (loadingMore.value) return
		if (!resultHasMore.value) return
		loadingMore.value = true
	}
	try {
		const targetPage = reset ? 1 : resultPage.value + 1
		const { code, response } = await request.post({
			url: API.PMS_SPU_SEARCH,
			data: buildSearchParams(targetPage)
		})
		if (code !== 200 || response?.state !== 'OK') return
		const content = response.content || {}
		const page = extractPage(content)
		const newRecords = (page.records || []).map(adaptProductItem)
		if (reset) {
			searchResultList.value = newRecords
			resultPage.value = 1
		} else {
			searchResultList.value = searchResultList.value.concat(newRecords)
			resultPage.value = targetPage
		}
		resultTotalPage.value = page.totalPage || 0
		resultHasMore.value = targetPage < page.totalPage
		if (reset) {
			brandList.value = content.brandList || []
			specGroupList.value = content.specGroupList || []
		}
	} catch (e) {
		console.error('[search] loadSearchResults error:', e)
	} finally {
		searchLoading.value = false
		loadingMore.value = false
	}
}

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleKeywordInput(event) {
	inputKeyword.value = `${event?.detail?.value || ''}`.trimStart()
	recommendDropdownVisible.value = false
	if (!inputKeyword.value.trim()) {
		filterSidebarVisible.value = false
		resetBottomPullState(true)
	}
}

function handleKeywordClear() {
	inputKeyword.value = ''
	submittedKeyword.value = ''
	filterSidebarVisible.value = false
	recommendDropdownVisible.value = false
	resetSearchResultState({ resetSort: true, resetFilter: true })
}

function handleSearchSubmit() {
	if (!inputKeyword.value.trim()) {
		return
	}
	submittedKeyword.value = inputKeyword.value.trim()
	recommendDropdownVisible.value = false
	filterSidebarVisible.value = false
	resetSearchResultState({ resetSort: true, resetFilter: false })
	recordSearchKeyword(submittedKeyword.value)
}

function handleKeywordShortcut(keyword) {
	inputKeyword.value = keyword
	handleSearchSubmit()
}

function handleSuggestionClick(item) {
	inputKeyword.value = item.text
	handleSearchSubmit()
}

function handleShortcutClick(item) {
	inputKeyword.value = item.label
	handleSearchSubmit()
}

function handleHistoryClear() {
	uni.showModal({
		title: '清空搜索历史',
		content: '确定要清空所有搜索历史吗？',
		success: (result) => {
			if (result.confirm) {
				handleClearHistory()
			}
		}
	})
}

function handleRecommendFilterToggle() {
	recommendDropdownVisible.value = !recommendDropdownVisible.value
	filterSidebarVisible.value = false
}

function handleRecommendOptionSelect(item) {
	recommendOptionId.value = item.id
	sortMode.value = 'recommend'
	priceSortDirection.value = ''
	recommendDropdownVisible.value = false
	resetSearchResultState()
	loadSearchResults({ reset: true })
}

function handleSalesSortClick() {
	sortMode.value = 'sales'
	priceSortDirection.value = ''
	recommendDropdownVisible.value = false
	resetSearchResultState()
	loadSearchResults({ reset: true })
}

function handlePriceSortClick() {
	sortMode.value = 'price'
	priceSortDirection.value = priceSortDirection.value === 'desc' ? 'asc' : 'desc'
	recommendDropdownVisible.value = false
	resetSearchResultState()
	loadSearchResults({ reset: true })
}

function handleFilterSidebarOpen() {
	recommendDropdownVisible.value = false
	filterSidebarVisible.value = true
}

function handleFilterSidebarClose() {
	filterSidebarVisible.value = false
}

function handleFilterSidebarConfirm(filterState) {
	appliedFilterState.value = {
		minPrice: filterState.minPrice || '',
		maxPrice: filterState.maxPrice || '',
		selectedBrandIdList: [...(filterState.selectedBrandIdList || [])],
		selectedSpecMap: { ...(filterState.selectedSpecMap || {}) }
	}
	filterSidebarVisible.value = false
	resetSearchResultState()
	loadSearchResults({ reset: true })
}

function handleGoodsOpen(item) {
	if (!item?.id) return
	uni.navigateTo({
		url: `/pages/shop/product-detail?productId=${item.id}`
	})
}

function handleParentScroll(event) {
	parentScrollTopPx.value = Number(event.detail.scrollTop || 0)
}

async function handleParentReachLower() {
	if (searchState.value !== 'result' || loadingMore.value) {
		return
	}
	const requestId = ++reachLowerRequestId
	showBottomPullState('loading')
	await loadSearchResults({ reset: false })
	if (requestId !== reachLowerRequestId) {
		return
	}
	if (resultHasMore.value) {
		bottomPullState.value = 'loaded'
		scheduleBottomPullCollapse(420)
	} else {
		bottomPullState.value = 'no-more'
		scheduleBottomPullCollapse(520)
	}
}

function resetSearchResultState({ resetSort = false, resetFilter = false } = {}) {
	reachLowerRequestId += 1
	loadingMore.value = false
	recommendDropdownVisible.value = false
	resetBottomPullState(true)
	resultPage.value = 1
	resultHasMore.value = true
	searchResultList.value = []

	if (resetSort) {
		recommendOptionId.value = 'comprehensive'
		sortMode.value = 'recommend'
		priceSortDirection.value = ''
	}

	if (resetFilter) {
		appliedFilterState.value = {
			minPrice: '',
			maxPrice: '',
			selectedBrandIdList: [],
			selectedSpecMap: {}
		}
	}

	scrollResultListToTop()
}

function showBottomPullState(state) {
	clearBottomPullTimer()
	bottomPullState.value = state
	bottomPullVisible.value = true
}

function resetBottomPullState(immediate = false) {
	clearBottomPullTimer()
	bottomPullState.value = 'idle'
	if (immediate) {
		bottomPullVisible.value = false
		return
	}

	bottomPullVisible.value = false
}

function scheduleBottomPullCollapse(delayMs) {
	clearBottomPullTimer()
	bottomPullTimer = setTimeout(() => {
		bottomPullState.value = 'idle'
		bottomPullVisible.value = false
		bottomPullTimer = null
	}, delayMs)
}

function clearBottomPullTimer() {
	if (bottomPullTimer) {
		clearTimeout(bottomPullTimer)
		bottomPullTimer = null
	}
}

function clearScrollTopResetTimer() {
	if (scrollTopResetTimer) {
		clearTimeout(scrollTopResetTimer)
		scrollTopResetTimer = null
	}
}

function scrollResultListToTop() {
	clearScrollTopResetTimer()
	const currentScrollTop = Math.max(1, Math.round(parentScrollTopPx.value || 0))
	parentScrollTopValue.value = currentScrollTop
	scrollTopResetTimer = setTimeout(() => {
		parentScrollTopValue.value = 0
		scrollTopResetTimer = null
	}, 0)
	parentScrollTopPx.value = 0
}
</script>

<style scoped>
.shop-search-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-search-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	height: 88rpx;
	box-sizing: border-box;
}

.shop-search-header :deep(.shop-header-icon-button) {
	background: transparent;
	border: none;
	box-shadow: none;
}

.shop-search-input-wrap {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	height: 64rpx;
	padding: 0 4rpx 0 8rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.62);
	border: none;
	box-shadow: none;
}

.shop-search-input-icon,
.shop-search-suggestion-icon {
	width: 30rpx;
	height: 30rpx;
	flex-shrink: 0;
}

.shop-search-input {
	flex: 1;
	min-width: 0;
	height: 64rpx;
	margin-left: 14rpx;
	font-size: 26rpx;
	color: #111827;
}

.shop-search-clear,
.shop-search-input-submit,
.shop-search-section-title,
.shop-search-section-action,
.shop-search-shortcut-title,
.shop-search-shortcut-desc,
.shop-search-suggestion-text,
.shop-search-filter-text,
.shop-search-filter-dropdown-text {
	display: block;
}

.shop-search-clear {
	padding: 8rpx 12rpx;
	font-size: 30rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.shop-search-input-submit {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 16rpx;
	font-size: 22rpx;
	font-weight: 700;
	color: #d94f7b;
	flex-shrink: 0;
}

.shop-search-filterbar {
	position: relative;
	display: flex;
	align-items: center;
	height: 100%;
	padding: 0;
	box-sizing: border-box;
}

.shop-search-filter-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 100%;
	gap: 12rpx;
}

.shop-search-filter-item {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	height: 100%;
	background: transparent;
}

.shop-search-filter-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #667085;
}

.shop-search-filter-item--active .shop-search-filter-text {
	font-weight: 700;
	color: #d94f7b;
}

.shop-search-filter-line {
	width: 24rpx;
	height: 4rpx;
	margin-top: 6rpx;
	border-radius: 999rpx;
	background: transparent;
}

.shop-search-filter-item--active .shop-search-filter-line {
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
}

.shop-search-filter-dropdown {
	position: absolute;
	top: 66rpx;
	left: 0;
	width: 248rpx;
	padding: 10rpx;
	border-radius: 24rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 248, 251, 0.92) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 18rpx 36rpx rgba(15, 23, 42, 0.08);
}

.shop-search-filter-dropdown-item + .shop-search-filter-dropdown-item {
	margin-top: 8rpx;
}

.shop-search-filter-dropdown-item {
	display: flex;
	align-items: center;
	min-height: 68rpx;
	padding: 0 18rpx;
	border-radius: 18rpx;
}

.shop-search-filter-dropdown-item--active {
	background: rgba(254, 44, 85, 0.08);
}

.shop-search-filter-dropdown-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #344054;
}

.shop-search-filter-dropdown-item--active .shop-search-filter-dropdown-text {
	font-weight: 700;
	color: #d94f7b;
}

.shop-search-discovery-stack,
.shop-search-result-content {
	display: flex;
	flex-direction: column;
}

.shop-search-section-card {
	padding: 24rpx;
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-search-section-card + .shop-search-section-card {
	margin-top: 20rpx;
}

.shop-search-section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.shop-search-section-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #111827;
}

.shop-search-section-action {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.shop-search-chip-list {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	margin-top: 18rpx;
}

.shop-search-chip {
	padding: 14rpx 20rpx;
	border-radius: 999rpx;
	background: #f8fafc;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #475467;
}

.shop-search-chip-hot {
	color: #d94f7b;
}

.shop-search-shortcut-item + .shop-search-shortcut-item,
.shop-search-suggestion-item + .shop-search-suggestion-item {
	margin-top: 18rpx;
	padding-top: 18rpx;
	border-top: 1rpx solid #eef2f7;
}

.shop-search-shortcut-item,
.shop-search-suggestion-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 18rpx;
}

.shop-search-shortcut-main {
	flex: 1;
	min-width: 0;
}

.shop-search-shortcut-title {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #111827;
}

.shop-search-shortcut-desc,
.shop-search-suggestion-text {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #64748b;
}

.shop-search-shortcut-arrow {
	margin-left: 18rpx;
	font-size: 30rpx;
	line-height: 32rpx;
	color: #98a2b3;
}

.shop-search-suggestion-text {
	flex: 1;
	min-width: 0;
	margin-top: 0;
	margin-left: 16rpx;
}

</style>
