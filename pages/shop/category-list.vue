<template>
	<view class="shop-category-page" :style="pageStyle">
		<view class="shop-category-topbar" :style="topbarStyle">
			<ShopSubPageHeader title="分类" :right-min-width-rpx="84" @back="handleBack">
				<template #right>
					<ShopHeaderIconButton :icon="SHOP_TOP_SEARCH_ICON" @tap="handleSearchClick" />
				</template>
			</ShopSubPageHeader>
		</view>

		<view class="shop-category-layout" :style="layoutStyle">
			<scroll-view class="shop-category-left" scroll-y enable-flex show-scrollbar="false">
				<view
					v-for="item in firstCategoryList"
					:key="item.id"
					class="shop-category-left-item"
					:class="{ 'shop-category-left-item--active': item.id === activeFirstCategoryId }"
					@tap="handleFirstCategoryClick(item)"
				>
					<text class="shop-category-left-text">{{ item.name }}</text>
				</view>
			</scroll-view>

			<view class="shop-category-right">
				<shop-category-second-bar
					:second-category-list="secondCategoryList"
					:active-id="activeSecondCategoryId"
					:expanded="secondCategoryExpanded"
					@tag-click="handleSecondCategoryClick"
					@toggle-expand="handleSecondCategoryExpandToggle"
					@expand-item-click="handleSecondCategoryExpandItemClick"
				/>

				<scroll-view
					id="shop-category-third-scroll"
					class="shop-category-third-scroll"
					scroll-y
					enable-flex
					scroll-with-animation
					show-scrollbar="false"
					:scroll-top="thirdSectionScrollTop"
					@scroll="handleThirdSectionScroll"
				>
					<view
						v-for="item in secondCategoryList"
						:id="item.anchorId"
						:key="item.id"
						class="shop-third-section"
					>
						<view class="shop-third-section-head" @tap="handleSecondCategoryTitleClick(item)">
							<text class="shop-third-section-title">{{ item.name }}</text>
							<text class="shop-third-section-entry">查看全部</text>
						</view>

						<view class="shop-third-grid">
							<view
								v-for="thirdItem in item.thirdCategoryList"
								:key="thirdItem.id"
								class="shop-third-item"
								@tap="handleThirdCategoryItemClick(item, thirdItem)"
							>
								<image class="shop-third-item-image" :src="thirdItem.imageUrl" mode="aspectFill" />
								<text class="shop-third-item-text">{{ thirdItem.name }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ShopHeaderIconButton from '@/components/shop/common/ShopHeaderIconButton.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import ShopCategorySecondBar from '@/components/shop/category/ShopCategorySecondBar.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_HEADER_BORDER,
	SHOP_PAGE_BACKGROUND,
	SHOP_TOP_SEARCH_ICON
} from '@/components/shop/common/shopSurface.js'
import {
	buildCategorySearchUrl,
	buildShopSearchPlaceholderUrl
} from '@/components/shop/category/shopCategoryMock'
import request from '@/composables/baseRequest'
import API from '@/utils/api'

const instance = getCurrentInstance()
const systemInfo = uni.getSystemInfoSync()
const safeTopPx = Number(systemInfo.safeAreaInsets?.top || 0)
const windowHeight = Number(systemInfo.windowHeight || 0)
const navRowHeightPx = rpxToPx(88)

const firstCategoryList = ref([])
const activeFirstCategoryId = ref('')
const activeSecondCategoryId = ref('')
const secondCategoryExpanded = ref(false)
const thirdSectionScrollTop = ref(0)
const thirdSectionOffsetList = ref([])
const anchorLockSecondCategoryId = ref('')

let anchorLockTimer = null
let thirdScrollResetTimer = null

const activeFirstCategory = computed(
	() => firstCategoryList.value.find((item) => item.id === activeFirstCategoryId.value) || firstCategoryList.value[0] || {}
)
const secondCategoryList = computed(() => activeFirstCategory.value.secondCategoryList || [])
const topbarHeightPx = computed(() => safeTopPx + navRowHeightPx)
const pageStyle = computed(() => ({
	height: `${windowHeight || 0}px`,
	background: SHOP_PAGE_BACKGROUND,
	overflow: 'hidden'
}))
const topbarStyle = computed(() => ({
	paddingTop: `${safeTopPx}px`,
	height: `${topbarHeightPx.value}px`,
	background: SHOP_HEADER_BACKGROUND,
	borderBottom: SHOP_HEADER_BORDER,
	...SHOP_HEADER_AREA_STYLE
}))
const layoutStyle = computed(() => ({
	height: `${Math.max(windowHeight - topbarHeightPx.value, 0)}px`,
	marginTop: `${topbarHeightPx.value}px`,
	overflow: 'hidden'
}))

onLoad(async (query) => {
	await loadCategoryPage(query.categoryId || query.firstCategoryId || '')
})

// 加载分类页数据（pms/categoryPage v2）
async function loadCategoryPage(entryCategoryId) {
	const { code, response } = await request.post({
		url: API.PMS_CATEGORY_PAGE,
		data: { categoryId: entryCategoryId || null }
	})
	if (code !== 200) return
		if (response?.state !== 'OK') return
	const content = response.content || {}
	firstCategoryList.value = (content.firstCategoryList || []).map((first) => ({
		...first,
		secondCategoryList: (first.secondCategoryList || []).map((second) => ({
			...second,
			anchorId: `anchor-${second.id}`,
			thirdCategoryList: second.thirdCategoryList || []
		}))
	}))
	activeFirstCategoryId.value = content.initialFirstCategoryId || (firstCategoryList.value[0] || {}).id || ''
	syncActiveSecondFromFirstCategory()
}

onBeforeUnmount(() => {
	clearAnchorLockTimer()
	clearThirdScrollResetTimer()
})

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleSearchClick() {
	// TODO: 后续替换真实搜索页请求与埋点。
	console.log('shop-category-search-entry-click')
	uni.navigateTo({
		url: buildShopSearchPlaceholderUrl()
	})
}

function handleFirstCategoryClick(item) {
	if (!item || item.id === activeFirstCategoryId.value) {
		return
	}

	// TODO: 后续接入一级分类切换接口。
	console.log('shop-first-category-click', item.id)
	activeFirstCategoryId.value = item.id
	syncActiveSecondFromFirstCategory()
}

function handleSecondCategoryClick(item) {
	scrollToSecondCategory(item)
}

function handleSecondCategoryExpandToggle() {
	secondCategoryExpanded.value = !secondCategoryExpanded.value
}

function handleSecondCategoryExpandItemClick(item) {
	scrollToSecondCategory(item)
}

function handleSecondCategoryTitleClick(item) {
	if (!item) {
		return
	}

	// TODO: 后续可在这里补充分类标题点击埋点。
	console.log('shop-second-category-title-click', item.id)
	uni.navigateTo({
		url: buildCategorySearchUrl({
			firstCategoryId: activeFirstCategoryId.value,
			secondCategoryId: item.id
		})
	})
}

function handleThirdCategoryItemClick(secondCategory, thirdCategory) {
	if (!secondCategory || !thirdCategory) {
		return
	}

	// TODO: 后续接入三级分类搜索结果请求。
	console.log('shop-third-category-click', thirdCategory.id)
	uni.navigateTo({
		url: buildCategorySearchUrl({
			firstCategoryId: activeFirstCategoryId.value,
			secondCategoryId: secondCategory.id,
			thirdCategoryId: thirdCategory.id
		})
	})
}

function handleThirdSectionScroll(event) {
	if (anchorLockSecondCategoryId.value) {
		return
	}

	const currentScrollTop = Number(event.detail.scrollTop || 0)
	const currentSection = [...thirdSectionOffsetList.value]
		.reverse()
		.find((item) => currentScrollTop + 24 >= item.top)

	if (currentSection?.id && currentSection.id !== activeSecondCategoryId.value) {
		activeSecondCategoryId.value = currentSection.id
	}
}

function syncActiveSecondFromFirstCategory() {
	const firstSecondCategory = secondCategoryList.value[0]
	activeSecondCategoryId.value = firstSecondCategory?.id || ''
	secondCategoryExpanded.value = false
	lockSecondCategorySelection(firstSecondCategory?.id || '')
	thirdSectionScrollTop.value = 0

	nextTick(() => {
		setTimeout(() => {
			measureThirdSectionOffset()
		}, 30)
	})
}

function scrollToSecondCategory(item) {
	if (!item?.id) {
		return
	}

	// TODO: 后续接入二级分类切换接口。
	console.log('shop-second-category-click', item.id)
	activeSecondCategoryId.value = item.id
	secondCategoryExpanded.value = false
	lockSecondCategorySelection(item.id)

	const targetOffset = thirdSectionOffsetList.value.find((offset) => offset.id === item.id)?.top
	if (typeof targetOffset === 'number') {
		triggerThirdSectionScrollTop(targetOffset)
		return
	}

	nextTick(() => {
		setTimeout(() => {
			measureThirdSectionOffset(item.id)
		}, 24)
	})
}

function triggerThirdSectionScrollTop(targetTop) {
	const normalizedTop = Math.max(0, Math.round(Number(targetTop) || 0))
	clearThirdScrollResetTimer()

	if (thirdSectionScrollTop.value === normalizedTop) {
		thirdSectionScrollTop.value = Math.max(0, normalizedTop - 1)
		thirdScrollResetTimer = setTimeout(() => {
			thirdSectionScrollTop.value = normalizedTop
			thirdScrollResetTimer = null
		}, 0)
		return
	}

	thirdSectionScrollTop.value = normalizedTop
}

function measureThirdSectionOffset(targetSecondCategoryId = '') {
	if (!instance?.proxy) {
		return
	}

	const query = uni.createSelectorQuery().in(instance.proxy)
	query.select('#shop-category-third-scroll').boundingClientRect()
	query.select('#shop-category-third-scroll').scrollOffset()
	query.selectAll('.shop-third-section').boundingClientRect()
	query.exec((result) => {
		const containerRect = result?.[0]
		const scrollState = result?.[1]
		const sectionRectList = result?.[2] || []

		if (!containerRect || !sectionRectList.length) {
			thirdSectionOffsetList.value = []
			return
		}

		thirdSectionOffsetList.value = sectionRectList.map((rect, index) => ({
			id: secondCategoryList.value[index]?.id,
			top: rect.top - containerRect.top + Number(scrollState?.scrollTop || 0)
		}))

		if (!targetSecondCategoryId) {
			return
		}

		const targetOffset = thirdSectionOffsetList.value.find((item) => item.id === targetSecondCategoryId)?.top
		if (typeof targetOffset === 'number') {
			triggerThirdSectionScrollTop(targetOffset)
		}
	})
}

function lockSecondCategorySelection(secondCategoryId) {
	if (!secondCategoryId) {
		return
	}

	clearAnchorLockTimer()
	anchorLockSecondCategoryId.value = secondCategoryId
	anchorLockTimer = setTimeout(() => {
		anchorLockSecondCategoryId.value = ''
		anchorLockTimer = null
	}, 320)
}

function clearAnchorLockTimer() {
	if (anchorLockTimer) {
		clearTimeout(anchorLockTimer)
		anchorLockTimer = null
	}
}

function clearThirdScrollResetTimer() {
	if (thirdScrollResetTimer) {
		clearTimeout(thirdScrollResetTimer)
		thirdScrollResetTimer = null
	}
}

function rpxToPx(rpxValue) {
	return (Number(systemInfo.windowWidth || 0) * Number(rpxValue || 0)) / 750
}
</script>

<style scoped>
.shop-category-page {
	position: relative;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-category-topbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 20;
	display: flex;
	align-items: center;
	padding-left: 24rpx;
	padding-right: 24rpx;
	box-sizing: border-box;
}

.shop-category-layout {
	display: flex;
	box-sizing: border-box;
}

.shop-category-left {
	flex-shrink: 0;
	width: 176rpx;
	height: 100%;
	background: #f5f7fb;
}

.shop-category-left-item {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 92rpx;
	padding: 0 20rpx;
	box-sizing: border-box;
}

.shop-category-left-item--active {
	background: #ffffff;
}

.shop-category-left-text {
	font-size: 24rpx;
	color: #475569;
}

.shop-category-left-item--active .shop-category-left-text {
	color: #ef4444;
	font-weight: 700;
}

.shop-category-right {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: #ffffff;
}

.shop-category-third-scroll {
	flex: 1;
	height: 100%;
	min-height: 0;
	padding: 24rpx;
	box-sizing: border-box;
}

.shop-third-section {
	padding-bottom: 28rpx;
}

.shop-third-section:last-child {
	padding-bottom: 64rpx;
}

.shop-third-section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 20rpx;
}

.shop-third-section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #0f172a;
}

.shop-third-section-entry {
	font-size: 22rpx;
	color: #64748b;
}

.shop-third-grid {
	display: flex;
	flex-wrap: wrap;
	margin-right: -16rpx;
	margin-bottom: -16rpx;
}

.shop-third-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: calc(33.333% - 16rpx);
	min-height: 188rpx;
	margin-right: 16rpx;
	margin-bottom: 16rpx;
	padding: 20rpx 16rpx;
	border-radius: 24rpx;
	background: #f8fafc;
	box-sizing: border-box;
}

.shop-third-item-image {
	width: 84rpx;
	height: 84rpx;
	border-radius: 22rpx;
	flex-shrink: 0;
}

.shop-third-item-text {
	margin-top: 16rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #334155;
	text-align: center;
}
</style>
