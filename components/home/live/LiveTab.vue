<template>
	<view class="live-tab">
		<LiveBanner
			:active="active"
			:banners="bannerList"
			:interval="liveMock.bannerInterval"
			:duration="liveMock.bannerDuration"
			@change="handleBannerChange"
			@item-click="handleBannerClick"
		/>

		<view class="live-toolbar">
			<view class="category-tabs">
				<view
					v-for="item in categoryTabs"
					:key="item.key"
					:class="['category-tab', activeCategory === item.key ? 'category-tab-active' : '']"
					@tap="handleCategoryClick(item)"
				>
					<text :class="['category-tab-text', activeCategory === item.key ? 'category-tab-text-active' : '']">
						{{ item.label }}
					</text>
				</view>
			</view>
			<LiveHotRankCard class="live-rank-entry" :card="hotRankCard" @click="handleHotCardClick" />
		</view>

		<view class="list-outer">
			<view class="virtual-space" :style="{ height: `${totalListHeightRpx}rpx` }">
				<view class="virtual-content" :style="{ transform: `translateY(${translateOffsetRpx}rpx)` }">
					<view v-for="row in visibleRows" :key="row.rowIndex" class="live-row">
						<LiveCardItem
							v-for="item in row.items"
							:key="item.id"
							class="live-card-node"
							:item="item"
							@click="handleLiveItemClick"
						/>

						<LiveCardItem
							v-if="row.items.length === 1"
							class="live-card-node"
							placeholder
						/>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import LiveBanner from '@/components/home/live/elements/LiveBanner.vue'
import LiveHotRankCard from '@/components/home/live/elements/LiveHotRankCard.vue'
import LiveCardItem from '@/components/home/live/elements/LiveCardItem.vue'
import { buildLiveHotRankCard, buildLiveRankPageUrl } from '@/components/home/live/liveRankMock.js'

const props = defineProps({
	active: {
		type: Boolean,
		default: false
	},
	parentScrollTop: {
		type: Number,
		default: 0
	}
})

const screenWidth = uni.getSystemInfoSync().screenWidth || 375
const pendingTaskList = new Set()

function createLiveItems(categoryLabel, categoryKey, count, offset = 0) {
	const coverBackgrounds = [
		'linear-gradient(180deg, #5447a8 0%, #17171f 100%)',
		'linear-gradient(180deg, #b14f80 0%, #18171d 100%)',
		'linear-gradient(180deg, #2f8f86 0%, #131920 100%)',
		'linear-gradient(180deg, #bc7a46 0%, #181614 100%)'
	]

	const avatarBackgrounds = [
		'linear-gradient(180deg, #ff7da0 0%, #ffb596 100%)',
		'linear-gradient(180deg, #5dc6ff 0%, #7a8dff 100%)',
		'linear-gradient(180deg, #ffd36d 0%, #ff9e63 100%)',
		'linear-gradient(180deg, #7de2c3 0%, #5cc1ff 100%)'
	]

	return Array.from({ length: count }, (_, index) => {
		const currentIndex = index + offset + 1
		return {
			id: `${categoryKey}-card-${currentIndex}`,
			roomId: `${categoryKey}-room-${currentIndex}`,
			anchorId: `${categoryKey}-anchor-${currentIndex}`,
			roomName: `${categoryLabel}直播间${currentIndex}`,
			liveTag: '直播中',
			viewerText: `${currentIndex * 321}观看`,
			coverBackground: coverBackgrounds[currentIndex % coverBackgrounds.length],
			avatarBackground: avatarBackgrounds[currentIndex % avatarBackgrounds.length]
		}
	})
}

const liveMock = {
	bannerInterval: 3200,
	bannerDuration: 500,
	listStartOffsetRpx: 430,
	cardCoverHeightRpx: 316,
	rowGapRpx: 24,
	visibleBufferRows: 8,
	pageSize: 8,
	banners: [
		{
			id: 'banner-1',
			title: '直播盛典专场',
			desc: '精选高热直播间',
			badge: '活动'
		},
		{
			id: 'banner-2',
			title: '新人主播推荐',
			desc: '轻松发现新面孔',
			badge: '推荐'
		},
		{
			id: 'banner-3',
			title: '同城热播榜',
			desc: '附近正在升温',
			badge: '同城'
		}
	],
	categories: [
		{ key: 'hot', label: '热门' },
		{ key: 'local', label: '同城' },
		{ key: 'follow', label: '关注' }
	],
	listMap: {
		hot: createLiveItems('热门', 'hot', 18),
		local: createLiveItems('同城', 'local', 16),
		follow: createLiveItems('关注', 'follow', 14)
	}
}

liveMock.rowHeightRpx = liveMock.cardCoverHeightRpx + liveMock.rowGapRpx

const bannerList = liveMock.banners.map((item, index) => ({
	...item,
	background: [
		'linear-gradient(135deg, rgba(255, 120, 163, 0.96) 0%, rgba(103, 47, 145, 0.92) 100%)',
		'linear-gradient(135deg, rgba(85, 215, 247, 0.96) 0%, rgba(66, 84, 173, 0.92) 100%)',
		'linear-gradient(135deg, rgba(255, 190, 97, 0.96) 0%, rgba(170, 74, 124, 0.92) 100%)'
	][index]
}))

const categoryTabs = liveMock.categories
const hotRankCard = computed(() => buildLiveHotRankCard(activeCategory.value))
const categoryPageMap = ref({
	hot: 1,
	local: 1,
	follow: 1
})
const categoryNoMoreMap = ref({
	hot: false,
	local: false,
	follow: false
})
const categoryDataMap = ref({
	hot: liveMock.listMap.hot.slice(0, categoryPageMap.value.hot * liveMock.pageSize),
	local: liveMock.listMap.local.slice(0, categoryPageMap.value.local * liveMock.pageSize),
	follow: liveMock.listMap.follow.slice(0, categoryPageMap.value.follow * liveMock.pageSize)
})

const activeCategory = ref('hot')
const loadingMore = ref(false)
const activeCategoryLabel = computed(() => {
	return categoryTabs.find((item) => item.key === activeCategory.value)?.label || '热门'
})

// 只有直播频道真正激活时，才消费父层滚动值参与虚拟列表计算。
const effectiveParentScrollTop = computed(() => {
	return props.active ? props.parentScrollTop : 0
})

// 当前生效分类的卡片列表。
const currentList = computed(() => {
	return categoryDataMap.value[activeCategory.value] || []
})

// 将双列卡片整理成按行渲染的数据结构。
const rowList = computed(() => {
	const rows = []
	for (let index = 0; index < currentList.value.length; index += 2) {
		rows.push({
			rowIndex: index / 2,
			items: currentList.value.slice(index, index + 2)
		})
	}
	return rows
})

// 根据父滚动位置推导虚拟列表的起始行。
const startRowIndex = computed(() => {
	const rowScrollRpx =
		Math.max(0, effectiveParentScrollTop.value * (750 / screenWidth) - liveMock.listStartOffsetRpx)
	const rawRowIndex = Math.floor(rowScrollRpx / liveMock.rowHeightRpx) - 1
	return Math.max(0, rawRowIndex)
})

// 根据缓冲行数量推导结束行，减少无意义渲染。
const endRowIndex = computed(() => {
	return Math.min(rowList.value.length, startRowIndex.value + liveMock.visibleBufferRows)
})

// 当前真正需要渲染到页面上的可视区域行数据。
const visibleRows = computed(() => {
	return rowList.value.slice(startRowIndex.value, endRowIndex.value)
})

// 虚拟列表总高度，占住完整滚动空间。
const totalListHeightRpx = computed(() => {
	return rowList.value.length * liveMock.rowHeightRpx
})

// 可视内容需要向下平移的偏移量。
const translateOffsetRpx = computed(() => {
	return startRowIndex.value * liveMock.rowHeightRpx
})

// 透传 Banner 切换事件给父层。
function handleBannerChange(payload) {
	onBannerChange(payload)
}

// 透传 Banner 点击事件给父层。
function handleBannerClick(payload) {
	onBannerClick(payload.item)
}

// 热门榜卡片点击入口。
function handleHotCardClick(cardInfo) {
	onHotRankClick(cardInfo)
	uni.navigateTo({
		url: buildLiveRankPageUrl(cardInfo?.categoryKey || activeCategory.value)
	})
}

// 切换直播分类，并保留重复点击回调能力。
function handleCategoryClick(category) {
	if (activeCategory.value === category.key) {
		onCategoryRepeat(category)
		return
	}

	activeCategory.value = category.key
	onCategoryChange(category)
}

// 直播卡片点击入口，后续由父层决定跳房间还是埋点。
function handleLiveItemClick(item) {
	onLiveItemClick(item)
}

// 直播页触底加载实现，统一返回 loaded / no-more / busy。
function handleParentReachLower() {
	if (!props.active || loadingMore.value) {
		return Promise.resolve({ status: 'busy' })
	}

	const sourceList = liveMock.listMap[activeCategory.value] || []
	loadingMore.value = true
	categoryNoMoreMap.value = {
		...categoryNoMoreMap.value,
		[activeCategory.value]: false
	}
	onLoadMore(activeCategory.value)
	return scheduleTask({
		delay: 600,
		cancelValue: { status: 'busy' },
		run: (resolve) => {
			if (currentList.value.length >= sourceList.length) {
				categoryNoMoreMap.value = {
					...categoryNoMoreMap.value,
					[activeCategory.value]: true
				}
				loadingMore.value = false
				resolve({ status: 'no-more' })
				return
			}

			const nextPage = categoryPageMap.value[activeCategory.value] + 1
			categoryPageMap.value = {
				...categoryPageMap.value,
				[activeCategory.value]: nextPage
			}
			categoryDataMap.value = {
				...categoryDataMap.value,
				[activeCategory.value]: sourceList.slice(0, nextPage * liveMock.pageSize)
			}
			categoryNoMoreMap.value = {
				...categoryNoMoreMap.value,
				[activeCategory.value]:
					sourceList.slice(0, nextPage * liveMock.pageSize).length >= sourceList.length
			}
			loadingMore.value = false
			resolve({ status: 'loaded' })
		}
	})
}

// 直播页下拉刷新实现，统一供 home.vue 调度。
function handleParentRefresh() {
	if (!props.active) {
		return Promise.resolve()
	}

	const currentCategory = activeCategory.value
	return scheduleTask({
		delay: 700,
		cancelValue: undefined,
		run: (resolve) => {
			onRefresh(currentCategory)
			categoryPageMap.value = {
				...categoryPageMap.value,
				[currentCategory]: 1
			}
			categoryDataMap.value = {
				...categoryDataMap.value,
				[currentCategory]: liveMock.listMap[currentCategory].slice(0, liveMock.pageSize)
			}
			categoryNoMoreMap.value = {
				...categoryNoMoreMap.value,
				[currentCategory]: false
			}
			resolve()
		}
	})
}

// 首页切换频道或切走根 tab 时，停止直播频道未完成的 mock 任务。
watch(
	() => props.active,
	(value) => {
		if (value) {
			return
		}

		loadingMore.value = false
		clearPendingTasks()
	}
)

onBeforeUnmount(() => {
	loadingMore.value = false
	clearPendingTasks()
})

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

// 以下为直播页占位回调，后续接真实接口或业务逻辑。
function onBannerClick(item) {
	// TODO：替换 Banner 点击跳转回调
	console.log('live-banner-click', item.id)
}

function onBannerChange(payload) {
	// TODO：替换 Banner 切换回调
	console.log('live-banner-change', payload.index)
}

function onHotRankClick(cardInfo) {
	// TODO：替换热门榜点击回调
	console.log('live-hot-rank-click', cardInfo?.categoryKey || activeCategory.value)
}

function onCategoryChange(category) {
	// TODO：替换直播分类切换接口
	console.log('live-category-change', category.key)
}

function onCategoryRepeat(category) {
	// TODO：替换直播分类重复点击回调
	console.log('live-category-repeat', category.key)
}

function onLoadMore(categoryKey) {
	// TODO：替换直播分页加载接口
	console.log('live-load-more', categoryKey)
}

function onRefresh(categoryKey) {
	// TODO：替换直播下拉刷新接口
	console.log('live-refresh', categoryKey)
}

function onLiveItemClick(item) {
	// TODO：替换直播列表点击业务逻辑
	console.log('live-item-click', item.roomId)
	uni.navigateTo({
		url: `/pages/live-room/live-room?roomId=${item.roomId}&anchorId=${item.anchorId}&roomName=${encodeURIComponent(item.roomName)}`
	})
}

// 对外暴露统一刷新和触底加载方法。
defineExpose({
	handleParentRefresh,
	handleParentReachLower
})
</script>

<style scoped>
.live-tab {
	min-height: 100%;
	padding-bottom: 12rpx;
}

.live-toolbar {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-top: 18rpx;
	margin-bottom: 18rpx;
}

.category-tabs {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	padding: 8rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.06);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(18rpx);
	-webkit-backdrop-filter: blur(18rpx);
}

.category-tab {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 64rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	flex: 1;
}

.category-tab-active {
	background: linear-gradient(135deg, rgba(255, 122, 163, 0.22) 0%, rgba(115, 100, 255, 0.18) 100%);
	box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.16);
}

.category-tab-text {
	font-size: 24rpx;
	line-height: 34rpx;
	color: rgba(255, 255, 255, 0.58);
}

.category-tab-text-active {
	font-size: 28rpx;
	font-weight: 600;
	line-height: 38rpx;
	color: #ffffff;
}

.live-rank-entry {
	flex-shrink: 0;
	max-width: 280rpx;
}

.list-outer {
	min-height: 400rpx;
}

.virtual-space {
	position: relative;
}

.virtual-content {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
}

.live-row {
	display: flex;
	margin-bottom: 24rpx;
}

.live-card-node {
	flex: 1;
	min-width: 0;
}

.live-card-node + .live-card-node {
	margin-left: 24rpx;
}

</style>
