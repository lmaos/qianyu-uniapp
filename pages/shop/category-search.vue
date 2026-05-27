<template>
	<view class="shop-category-search-page">
		<RefreshTopStackLayout
			:page-height-px="windowHeightPx"
			:page-background="SHOP_PAGE_BACKGROUND"
			:header-row-height-rpx="88"
			:secondary-height-rpx="104"
			:tertiary-height-rpx="96"
			:header-area-style="searchTopbarAreaStyle"
			:secondary-area-style="searchTabbarAreaStyle"
			:tertiary-area-style="searchFilterbarAreaStyle"
			:refresh-state="refreshHintState"
			:refresh-pull-distance-px="refreshPullDistancePx"
			:refresh-reveal-distance-px="navRowHeightPx"
		>
			<template #refresh-cover>
				<text class="shop-category-search-refresh-cover-text">{{ refreshPullText }}</text>
			</template>

			<template #header>
				<ShopSubPageHeader :title="pageTitle" :right-min-width-rpx="136" @back="handleBack">
					<template #right>
						<view class="shop-category-search-status">
							<view v-if="refreshHintState === 'refreshing'" class="shop-category-search-refresh-status">
								<view class="shop-category-search-refresh-spinner"></view>
								<text class="shop-category-search-refresh-status-text">刷新中</text>
							</view>
						</view>
					</template>
				</ShopSubPageHeader>
			</template>

			<template #secondary>
				<view class="shop-category-search-tabbar">
					<scroll-view class="shop-category-search-tab-scroll" scroll-x enable-flex show-scrollbar="false">
						<view class="shop-category-search-tab-list">
							<view
								v-for="item in thirdCategoryTabList"
								:key="item.id || 'all'"
								class="shop-category-search-tab"
								:class="{ 'shop-category-search-tab--active': item.id === activeThirdCategoryId }"
								@tap="handleThirdTabClick(item)"
							>
								<text class="shop-category-search-tab-text">{{ item.name }}</text>
							</view>
						</view>
					</scroll-view>
				</view>
			</template>

			<template #tertiary>
				<view class="shop-category-search-filterbar">
					<view class="shop-category-search-filter-row">
						<view
							class="shop-category-search-filter-item"
							:class="{ 'shop-category-search-filter-item--active': sortMode === 'recommend' }"
							@tap="handleRecommendFilterToggle"
						>
							<text class="shop-category-search-filter-text">{{ recommendLabel }}</text>
						</view>

						<view
							class="shop-category-search-filter-item"
							:class="{ 'shop-category-search-filter-item--active': sortMode === 'sales' }"
							@tap="handleSalesSortClick"
						>
							<text class="shop-category-search-filter-text">销量</text>
						</view>

						<view
							class="shop-category-search-filter-item"
							:class="{ 'shop-category-search-filter-item--active': sortMode === 'price' }"
							@tap="handlePriceSortClick"
						>
							<text class="shop-category-search-filter-text">价格{{ priceSortDirectionLabel }}</text>
						</view>

						<view class="shop-category-search-filter-item" @tap="handleFilterSidebarOpen">
							<text class="shop-category-search-filter-text">筛选</text>
						</view>
					</view>

					<view v-if="recommendDropdownVisible" class="shop-category-search-dropdown">
						<view
							v-for="item in recommendOptionList"
							:key="item.id"
							class="shop-category-search-dropdown-item"
							:class="{ 'shop-category-search-dropdown-item--active': recommendOptionId === item.id }"
							@tap="handleRecommendOptionSelect(item)"
						>
							<text class="shop-category-search-dropdown-text">{{ item.label }}</text>
						</view>
					</view>
				</view>
			</template>

			<PullPagingShell
				light-theme
				refresher-background="#f8fafc"
				:lower-threshold="searchMock.lowerThresholdPx"
				:refresher-triggered="refreshing"
				:scroll-top="parentScrollTopValue"
				:inner-style="contentInnerStyle"
				:bottom-pull-state="bottomPullState"
				:bottom-pull-visible="bottomPullVisible"
				:bottom-pull-slot-style="bottomPullSlotStyle"
				@scroll="handleParentScroll"
				@refresher-pulling="handleRefresherPulling"
				@refresher-restore="handleRefresherRestore"
				@touch-start="handleParentTouchStart"
				@touch-end="handleParentTouchEnd"
				@refresher-refresh="handleParentRefresh"
				@scroll-lower="handleParentReachLower"
			>
				<shop-product-list
					:product-list="displayProductList"
					empty-text="当前筛选下暂无商品"
					@product-click="handleProductClick"
				/>
			</PullPagingShell>
		</RefreshTopStackLayout>

		<shop-filter-sidebar
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
import ShopProductList from '@/components/home/shop/ShopProductList.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import ShopFilterSidebar from '@/components/shop/category/ShopFilterSidebar.vue'
import { buildStaticFrostBackground } from '@/components/common/frostSurface.js'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_HEADER_BORDER,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { getCategorySearchPageMock } from '@/components/shop/category/shopCategoryMock'

const { safeBottomPx, windowHeightPx, rpxToPx } = useSafeAreaMetrics()

const recommendOptionList = [
	{
		id: 'comprehensive',
		label: '综合推荐'
	},
	{
		id: 'comment',
		label: '评论数从高到低'
	}
]

const searchMock = {
	pageSize: 8,
	lowerThresholdPx: 220,
	contentSidePaddingPx: rpxToPx(24),
	contentBottomPaddingPx: rpxToPx(24),
	bottomPullSlotHeightPx: rpxToPx(72),
	bottomPullLoadedHoldMs: 420,
	bottomPullNoMoreHoldMs: 480,
	bottomPullReleaseDelayMs: 20,
	bottomPullCollapseDurationMs: 380
}

const secondCategoryInfo = ref({})
const thirdCategoryTabList = ref([])
const productSourceList = ref([])
const activeThirdCategoryId = ref('')
const recommendOptionId = ref('comprehensive')
const sortMode = ref('recommend')
const priceSortDirection = ref('')
const recommendDropdownVisible = ref(false)
const filterSidebarVisible = ref(false)
const appliedFilterState = ref({
	minPrice: '',
	maxPrice: '',
	selectedBrandIdList: [],
	selectedSpecMap: {}
})
const resultPage = ref(1)
const loadingMore = ref(false)
const refreshing = ref(false)
const refreshHintState = ref('idle')
const refreshPullDistancePx = ref(0)
const bottomPullState = ref('idle')
const bottomPullVisible = ref(false)
const bottomPullPendingRelease = ref(false)
const bottomPullRearmPending = ref(false)
const parentTouching = ref(false)
const parentScrollTopPx = ref(0)
const parentScrollTopValue = ref(0)

const pendingTaskList = new Set()

let bottomPullCollapseTimer = null
let bottomPullResetTimer = null
let reachLowerRearmTimer = null
let scrollTopResetTimer = null
let bottomPullFallbackTimer = null
let refreshHintResetTimer = null
let refreshRequestId = 0
let reachLowerRequestId = 0

const navRowHeightPx = rpxToPx(88)
const searchTopbarAreaStyle = {
	paddingLeft: '24rpx',
	paddingRight: '24rpx',
	boxSizing: 'border-box',
	background: SHOP_HEADER_BACKGROUND,
	borderBottom: SHOP_HEADER_BORDER,
	...SHOP_HEADER_AREA_STYLE
}
const searchTabbarAreaStyle = {
	background: buildStaticFrostBackground(
		'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 251, 0.84) 100%)'
	),
	borderBottom: '1rpx solid rgba(255, 255, 255, 0.72)'
}
const searchFilterbarAreaStyle = {
	background: buildStaticFrostBackground(
		'linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 249, 251, 0.82) 100%)'
	),
	borderBottom: '1rpx solid rgba(255, 255, 255, 0.68)'
}
const contentInnerStyle = computed(() => {
	const bottomPaddingPx =
		searchMock.contentBottomPaddingPx +
		safeBottomPx.value +
		(bottomPullVisible.value ? searchMock.bottomPullSlotHeightPx : 0)

	return {
		paddingTop: '0px',
		paddingRight: `${searchMock.contentSidePaddingPx}px`,
		paddingBottom: `${bottomPaddingPx}px`,
		paddingLeft: `${searchMock.contentSidePaddingPx}px`,
		background: 'transparent'
	}
})
const bottomPullSlotStyle = computed(() => ({
	height: bottomPullVisible.value ? `${searchMock.bottomPullSlotHeightPx + safeBottomPx.value}px` : '0px',
	paddingLeft: `${searchMock.contentSidePaddingPx}px`,
	paddingRight: `${searchMock.contentSidePaddingPx}px`,
	paddingBottom: `${safeBottomPx.value}px`,
	background: 'linear-gradient(180deg, rgba(255, 249, 251, 0) 0%, rgba(255, 246, 249, 0.92) 48%, rgba(248, 250, 252, 0.96) 100%)'
}))
const brandList = computed(() => secondCategoryInfo.value.brandList || [])
const specGroupList = computed(() => secondCategoryInfo.value.specGroupList || [])
const pageTitle = computed(() => {
	if (!activeThirdCategoryId.value) {
		return secondCategoryInfo.value.name || '分类结果'
	}

	const activeThirdCategory = (secondCategoryInfo.value.thirdCategoryList || []).find(
		(item) => item.id === activeThirdCategoryId.value
	)

	return activeThirdCategory?.name || secondCategoryInfo.value.name || '分类结果'
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
const refreshPullText = computed(() => {
	return '下拉刷新当前筛选结果'
})
const filteredProductList = computed(() => {
	let nextProductList = [...productSourceList.value]

	if (activeThirdCategoryId.value) {
		nextProductList = nextProductList.filter((item) => item.thirdCategoryId === activeThirdCategoryId.value)
	}

	const minPrice = Number(appliedFilterState.value.minPrice || 0)
	const maxPrice = Number(appliedFilterState.value.maxPrice || 0)

	if (minPrice > 0) {
		nextProductList = nextProductList.filter((item) => Number(item.price) >= minPrice)
	}

	if (maxPrice > 0) {
		nextProductList = nextProductList.filter((item) => Number(item.price) <= maxPrice)
	}

	if (appliedFilterState.value.selectedBrandIdList.length) {
		nextProductList = nextProductList.filter((item) =>
			appliedFilterState.value.selectedBrandIdList.includes(item.brandId)
		)
	}

	const selectedSpecMap = appliedFilterState.value.selectedSpecMap || {}
	const activeSpecGroupIdList = Object.keys(selectedSpecMap).filter((key) => selectedSpecMap[key])

	if (activeSpecGroupIdList.length) {
		nextProductList = nextProductList.filter((item) =>
			activeSpecGroupIdList.every((groupId) => item.specValues?.[groupId] === selectedSpecMap[groupId])
		)
	}

	if (sortMode.value === 'sales') {
		return nextProductList.sort((beforeItem, afterItem) => afterItem.salesCount - beforeItem.salesCount)
	}

	if (sortMode.value === 'price') {
		const direction = priceSortDirection.value === 'asc' ? 1 : -1
		return nextProductList.sort(
			(beforeItem, afterItem) => (Number(beforeItem.price) - Number(afterItem.price)) * direction
		)
	}

	if (recommendOptionId.value === 'comment') {
		return nextProductList.sort((beforeItem, afterItem) => afterItem.commentCount - beforeItem.commentCount)
	}

	return nextProductList.sort((beforeItem, afterItem) => afterItem.recommendScore - beforeItem.recommendScore)
})
const displayProductList = computed(() => {
	return filteredProductList.value.slice(0, resultPage.value * searchMock.pageSize)
})

onLoad((query) => {
	const pageMock = getCategorySearchPageMock(query)
	secondCategoryInfo.value = pageMock.secondCategory
	thirdCategoryTabList.value = pageMock.thirdCategoryTabList
	productSourceList.value = pageMock.productSourceList
	activeThirdCategoryId.value = pageMock.activeThirdCategoryId
})

onBeforeUnmount(() => {
	loadingMore.value = false
	refreshing.value = false
	clearPendingTasks()
	clearBottomPullTimers()
	clearReachLowerRearmTimer()
	clearScrollTopResetTimer()
	clearRefreshHintResetTimer()
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleThirdTabClick(item) {
	// TODO: 后续接入分类结果接口刷新逻辑。
	console.log('shop-category-result-tab-click', item.id || 'all')
	activeThirdCategoryId.value = item.id || ''
	resetSearchResultState()
}

function handleRecommendFilterToggle() {
	recommendDropdownVisible.value = !recommendDropdownVisible.value
	filterSidebarVisible.value = false
}

function handleRecommendOptionSelect(item) {
	// TODO: 后续可在这里挂接排序埋点。
	console.log('shop-category-result-recommend-sort', item.id)
	recommendOptionId.value = item.id
	sortMode.value = 'recommend'
	priceSortDirection.value = ''
	recommendDropdownVisible.value = false
	resetSearchResultState()
}

function handleSalesSortClick() {
	// TODO: 后续接入销量排序请求参数。
	console.log('shop-category-result-sales-sort')
	sortMode.value = 'sales'
	priceSortDirection.value = ''
	recommendDropdownVisible.value = false
	resetSearchResultState()
}

function handlePriceSortClick() {
	// TODO: 后续接入价格排序请求参数。
	console.log('shop-category-result-price-sort', priceSortDirection.value)
	recommendDropdownVisible.value = false
	sortMode.value = 'price'
	priceSortDirection.value = priceSortDirection.value === 'desc' ? 'asc' : 'desc'
	resetSearchResultState()
}

function handleFilterSidebarOpen() {
	recommendDropdownVisible.value = false
	filterSidebarVisible.value = true
}

function handleFilterSidebarClose() {
	filterSidebarVisible.value = false
}

function handleFilterSidebarConfirm(filterState) {
	// TODO: 后续替换高级筛选真实请求。
	console.log('shop-category-result-filter-confirm', filterState)
	appliedFilterState.value = {
		minPrice: filterState.minPrice || '',
		maxPrice: filterState.maxPrice || '',
		selectedBrandIdList: [...(filterState.selectedBrandIdList || [])],
		selectedSpecMap: { ...(filterState.selectedSpecMap || {}) }
	}
	filterSidebarVisible.value = false
	resetSearchResultState()
}

function handleProductClick(productItem) {
	if (!productItem?.detailUrl) {
		return
	}

	// TODO: 后续可在这里补充分类结果商品点击埋点。
	console.log('shop-category-result-product-click', productItem.id)
	uni.navigateTo({
		url: productItem.detailUrl
	})
}

function handleParentScroll(event) {
	parentScrollTopPx.value = Number(event.detail.scrollTop || 0)
}

function handleParentTouchStart() {
	parentTouching.value = true
}

function handleParentTouchEnd() {
	parentTouching.value = false
	if (bottomPullPendingRelease.value) {
		scheduleBottomPullCollapse(searchMock.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
	}
}

function handleRefresherPulling(event) {
	if (refreshing.value) {
		return
	}

	const pullingDistance =
		Number(event?.detail?.dy || event?.detail?.deltaY || event?.detail?.pullDistance || 0) || 0

	if (pullingDistance <= 0) {
		return
	}

	clearRefreshHintResetTimer()
	refreshHintState.value = 'pulling'
	refreshPullDistancePx.value = Math.min(navRowHeightPx, Math.max(0, pullingDistance * 0.55))
}

function handleRefresherRestore() {
	if (!refreshing.value) {
		resetRefreshHint()
	}
}

async function handleParentRefresh() {
	if (refreshing.value) {
		return
	}

	const requestId = ++refreshRequestId
	refreshing.value = true
	clearRefreshHintResetTimer()
	refreshHintState.value = 'refreshing'
	refreshPullDistancePx.value = navRowHeightPx
	resetBottomPullState(true)

	await scheduleTask({
		delay: 520,
		cancelValue: undefined,
		run: (resolve) => {
			// TODO: 后续替换分类结果页下拉刷新接口。
			console.log('shop-category-result-refresh', getCurrentSearchPayload())
			resultPage.value = 1
			resolve()
		}
	})

	if (requestId !== refreshRequestId) {
		refreshing.value = false
		resetRefreshHint()
		return
	}

	refreshing.value = false
	resetRefreshHint(120)
}

async function handleParentReachLower() {
	if (refreshing.value || bottomPullState.value === 'loading') {
		return
	}

	const requestId = ++reachLowerRequestId
	showBottomPullState('loading')
	const result = normalizeReachLowerResult(await requestSearchPage())

	if (requestId !== reachLowerRequestId) {
		resetBottomPullState(true)
		return
	}

	if (result?.status === 'no-more') {
		bottomPullState.value = 'no-more'
		requestBottomPullRebound(searchMock.bottomPullNoMoreHoldMs)
		return
	}

	bottomPullState.value = 'loaded'
	requestBottomPullRebound(searchMock.bottomPullLoadedHoldMs)
}

function requestSearchPage() {
	if (loadingMore.value) {
		return Promise.resolve({ status: 'busy' })
	}

	loadingMore.value = true
	const currentLoadedCount = resultPage.value * searchMock.pageSize
	const totalCount = filteredProductList.value.length

	// TODO: 后续替换分类结果页分页接口。
	console.log('shop-category-result-load-more', getCurrentSearchPayload())

	return scheduleTask({
		delay: 460,
		cancelValue: { status: 'busy' },
		run: (resolve) => {
			if (currentLoadedCount >= totalCount) {
				loadingMore.value = false
				resolve({ status: 'no-more' })
				return
			}

			resultPage.value += 1
			loadingMore.value = false
			resolve({ status: 'loaded' })
		}
	})
}

function resetSearchResultState() {
	loadingMore.value = false
	refreshing.value = false
	refreshRequestId += 1
	reachLowerRequestId += 1
	clearPendingTasks()
	resetBottomPullState(true)
	resetRefreshHint()
	resultPage.value = 1
	scrollResultListToTop()
}

function normalizeReachLowerResult(result) {
	if (!result) {
		return {
			status: 'loaded'
		}
	}

	if (typeof result === 'string') {
		return {
			status: result
		}
	}

	return {
		status: result.status || 'loaded'
	}
}

function clearBottomPullTimers() {
	if (bottomPullCollapseTimer) {
		clearTimeout(bottomPullCollapseTimer)
		bottomPullCollapseTimer = null
	}

	if (bottomPullResetTimer) {
		clearTimeout(bottomPullResetTimer)
		bottomPullResetTimer = null
	}

	if (bottomPullFallbackTimer) {
		clearTimeout(bottomPullFallbackTimer)
		bottomPullFallbackTimer = null
	}
}

function clearReachLowerRearmTimer() {
	if (reachLowerRearmTimer) {
		clearTimeout(reachLowerRearmTimer)
		reachLowerRearmTimer = null
	}
}

function clearScrollTopResetTimer() {
	if (scrollTopResetTimer) {
		clearTimeout(scrollTopResetTimer)
		scrollTopResetTimer = null
	}
}

function clearRefreshHintResetTimer() {
	if (refreshHintResetTimer) {
		clearTimeout(refreshHintResetTimer)
		refreshHintResetTimer = null
	}
}

function rearmReachLowerTrigger() {
	const currentScrollTop = Math.max(0, Math.round(parentScrollTopPx.value || 0))
	const rearmOffsetPx = 14
	if (currentScrollTop <= rearmOffsetPx) {
		return
	}

	const rearmScrollTop = Math.max(0, currentScrollTop - rearmOffsetPx)
	parentScrollTopValue.value = rearmScrollTop
	parentScrollTopPx.value = rearmScrollTop
}

function resetBottomPullState(immediate = false) {
	clearBottomPullTimers()
	clearReachLowerRearmTimer()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false

	if (immediate) {
		bottomPullState.value = 'idle'
		bottomPullVisible.value = false
		return
	}

	bottomPullVisible.value = false
	bottomPullResetTimer = setTimeout(() => {
		bottomPullState.value = 'idle'
		bottomPullResetTimer = null
	}, searchMock.bottomPullCollapseDurationMs)
}

function showBottomPullState(state) {
	clearBottomPullTimers()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	bottomPullState.value = state
	bottomPullVisible.value = true
}

function scheduleBottomPullCollapse(delayMs, shouldRearm = false) {
	clearBottomPullTimers()
	clearReachLowerRearmTimer()
	bottomPullPendingRelease.value = false
	bottomPullRearmPending.value = false
	bottomPullCollapseTimer = setTimeout(() => {
		bottomPullVisible.value = false
		bottomPullCollapseTimer = null
		if (shouldRearm) {
			reachLowerRearmTimer = setTimeout(() => {
				rearmReachLowerTrigger()
				reachLowerRearmTimer = null
			}, 36)
		}
		bottomPullResetTimer = setTimeout(() => {
			bottomPullState.value = 'idle'
			bottomPullResetTimer = null
		}, searchMock.bottomPullCollapseDurationMs)
	}, delayMs)
}

function requestBottomPullRebound(delayMs) {
	if (parentTouching.value) {
		bottomPullPendingRelease.value = true
		bottomPullRearmPending.value = true
		bottomPullFallbackTimer = setTimeout(() => {
			parentTouching.value = false
			// pending 标记代表本次分页结果已经返回，此时即使文案还是 loading，
			// 也必须允许在 touchend / fallback 后收起提示条。
			if (bottomPullPendingRelease.value) {
				scheduleBottomPullCollapse(searchMock.bottomPullReleaseDelayMs, bottomPullRearmPending.value)
			}
		}, resolveBottomPullFallbackDelay(delayMs))
		return
	}

	scheduleBottomPullCollapse(delayMs, true)
}

function resetRefreshHint(delayMs = 0) {
	clearRefreshHintResetTimer()
	refreshHintResetTimer = setTimeout(() => {
		refreshHintState.value = 'idle'
		refreshPullDistancePx.value = 0
		refreshHintResetTimer = null
	}, delayMs)
}

function resolveBottomPullFallbackDelay(delayMs) {
	return Math.max(Number(delayMs) || 0, searchMock.bottomPullNoMoreHoldMs) + 120
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

function scheduleTask({ delay = 0, cancelValue, run }) {
	return new Promise((resolve) => {
		const task = {
			timer: null,
			resolve,
			cancelValue
		}

		task.timer = setTimeout(() => {
			pendingTaskList.delete(task)
			run(resolve)
		}, delay)

		pendingTaskList.add(task)
	})
}

function clearPendingTasks() {
	pendingTaskList.forEach((task) => {
		clearTimeout(task.timer)
		task.resolve(task.cancelValue)
	})
	pendingTaskList.clear()
}

function getCurrentSearchPayload() {
	return {
		secondCategoryId: secondCategoryInfo.value.id,
		thirdCategoryId: activeThirdCategoryId.value,
		recommendOptionId: recommendOptionId.value,
		sortMode: sortMode.value,
		priceSortDirection: priceSortDirection.value,
		filterState: appliedFilterState.value
	}
}

</script>

<style scoped>
.shop-category-search-status {
	flex-shrink: 0;
	min-width: 128rpx;
}

.shop-category-search-status {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	min-width: 120rpx;
}

.shop-category-search-refresh-status {
	display: inline-flex;
	align-items: center;
	justify-content: flex-end;
}

.shop-category-search-refresh-spinner {
	width: 24rpx;
	height: 24rpx;
	margin-right: 8rpx;
	border: 4rpx solid rgba(17, 24, 39, 0.08);
	border-top-color: #ef4444;
	border-radius: 50%;
	animation: shop-category-search-refresh-spin 0.8s linear infinite;
}

.shop-category-search-refresh-status-text {
	font-size: 22rpx;
	line-height: 32rpx;
	color: #64748b;
}

.shop-category-search-refresh-cover {
	position: absolute;
	left: 24rpx;
	right: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	z-index: 1;
}

.shop-category-search-refresh-cover-text {
	font-size: 24rpx;
	line-height: 34rpx;
	color: #64748b;
}

.shop-category-search-tabbar {
	height: 104rpx;
	padding: 0 24rpx;
	box-sizing: border-box;
}

.shop-category-search-tab-scroll {
	height: 100%;
}

.shop-category-search-tab-list {
	display: flex;
	align-items: center;
	height: 100%;
}

.shop-category-search-tab {
	flex-shrink: 0;
	margin-right: 28rpx;
	padding: 0 8rpx;
}

.shop-category-search-tab-text {
	font-size: 26rpx;
	color: #64748b;
}

.shop-category-search-tab--active .shop-category-search-tab-text {
	color: #ef4444;
	font-weight: 700;
}

.shop-category-search-filterbar {
	position: relative;
	padding: 0 24rpx;
	box-sizing: border-box;
	background: #ffffff;
	border-bottom: 1rpx solid #f1f5f9;
}

.shop-category-search-filter-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 96rpx;
}

.shop-category-search-filter-item {
	display: flex;
	align-items: center;
}

.shop-category-search-filter-item--active .shop-category-search-filter-text {
	color: #ef4444;
	font-weight: 600;
}

.shop-category-search-filter-text {
	font-size: 24rpx;
	color: #334155;
}

.shop-category-search-dropdown {
	position: absolute;
	top: 96rpx;
	left: 24rpx;
	width: 260rpx;
	padding: 12rpx 0;
	border-radius: 24rpx;
	background: #ffffff;
	box-shadow: 0 16rpx 36rpx rgba(15, 23, 42, 0.12);
}

.shop-category-search-dropdown-item {
	display: flex;
	align-items: center;
	height: 72rpx;
	padding: 0 24rpx;
}

.shop-category-search-dropdown-item--active {
	background: rgba(239, 68, 68, 0.08);
}

.shop-category-search-dropdown-text {
	font-size: 24rpx;
	color: #334155;
}

.shop-category-search-dropdown-item--active .shop-category-search-dropdown-text {
	color: #ef4444;
	font-weight: 600;
}

@keyframes shop-category-search-refresh-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
