<template>
	<view class="recommend-masonry">
		<view v-if="!itemList.length" class="recommend-empty">
			<text class="recommend-empty-text">暂无推荐内容</text>
		</view>

		<view v-else class="recommend-space" :style="{ height: totalHeightStyle }">
			<view
				v-for="layoutItem in visibleLayoutList"
				:key="layoutItem.item.id"
				class="recommend-node"
				:data-item-id="layoutItem.item.id"
				:style="resolveLayoutStyle(layoutItem)"
			>
				<RecommendFeedCard
					:item="layoutItem.item"
					@click="emit('item-click', layoutItem.item)"
					@author-click="emit('author-click', layoutItem.item)"
				/>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import RecommendFeedCard from '@/components/home/recommend/RecommendFeedCard.vue'

const props = defineProps({
	itemList: {
		type: Array,
		default: () => []
	},
	parentScrollTopPx: {
		type: Number,
		default: 0
	},
	active: {
		type: Boolean,
		default: true
	},
	containerWidthRpx: {
		type: Number,
		default: 686
	},
	listStartOffsetPx: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['item-click', 'author-click'])
const instance = getCurrentInstance()

const systemInfo = uni.getSystemInfoSync()
const viewportWidthPx = ref(systemInfo.windowWidth || systemInfo.screenWidth || 375)
const viewportHeightPx = ref(systemInfo.windowHeight || systemInfo.screenHeight || 667)
const measuredHeightMap = ref({})
const virtualizationReadyMinCount = 18

let measureTimer = null

// #ifdef H5
let removeResizeListener = null
// #endif

const masonryConfig = {
	columnGapRpx: 20,
	bufferPx: 560,
	titleLineHeightRpx: 34,
	cardBaseMetaHeightRpx: 128,
	uniformCoverHeightRpx: 468,
	defaultColumnCount: 2,
	wideLayoutMinWidthPx: 960,
	wideLayoutMinColumnWidthPx: 280,
	maxWideColumnCount: 5
}

function rpxToPx(value) {
	return (Number(value || 0) * viewportWidthPx.value) / 750
}

function pxToRpx(value) {
	return (Number(value || 0) * 750) / viewportWidthPx.value
}

function estimateTitleLineCount(title = '', charsPerLine = 10, maxLines = 2) {
	if (!title) {
		return 1
	}

	return Math.max(1, Math.min(maxLines, Math.ceil(String(title).length / charsPerLine)))
}

const columnGapPx = computed(() => {
	return rpxToPx(masonryConfig.columnGapRpx)
})

const isWideH5Layout = computed(() => {
	// #ifdef H5
	return viewportWidthPx.value >= masonryConfig.wideLayoutMinWidthPx
	// #endif

	// #ifndef H5
	return false
	// #endif
})

const usePxRenderMode = computed(() => {
	// #ifdef H5
	return isWideH5Layout.value
	// #endif

	// #ifndef H5
	return false
	// #endif
})

const columnCount = computed(() => {
	if (!isWideH5Layout.value) {
		return masonryConfig.defaultColumnCount
	}

	const containerWidthPx = rpxToPx(props.containerWidthRpx)
	const estimatedColumnCount = Math.floor(
		(containerWidthPx + columnGapPx.value) /
			(masonryConfig.wideLayoutMinColumnWidthPx + columnGapPx.value)
	)

	return Math.max(
		masonryConfig.defaultColumnCount,
		Math.min(masonryConfig.maxWideColumnCount, estimatedColumnCount || masonryConfig.defaultColumnCount)
	)
})

const columnWidthPx = computed(() => {
	const totalGapPx = Math.max(0, columnCount.value - 1) * columnGapPx.value
	return Math.max(0, (rpxToPx(props.containerWidthRpx) - totalGapPx) / columnCount.value)
})

const titleCharsPerLine = computed(() => {
	const safeContentWidthPx = Math.max(160, columnWidthPx.value - rpxToPx(36))
	return Math.max(8, Math.floor(safeContentWidthPx / Math.max(12, rpxToPx(24))))
})

const layoutList = computed(() => {
	const columnLeftListPx = Array.from({ length: columnCount.value }, (_, index) => {
		return index * (columnWidthPx.value + columnGapPx.value)
	})
	const columnHeightListPx = Array.from({ length: columnCount.value }, () => 0)

	return props.itemList.map((item, index) => {
		const titleLineCount = estimateTitleLineCount(item.title, titleCharsPerLine.value)
		const estimatedHeightPx =
			rpxToPx(masonryConfig.uniformCoverHeightRpx) +
			rpxToPx(masonryConfig.cardBaseMetaHeightRpx) +
			Math.max(0, titleLineCount - 1) * rpxToPx(masonryConfig.titleLineHeightRpx)
		const itemHeightPx = measuredHeightMap.value[item.id] || estimatedHeightPx
		const targetColumnIndex = columnHeightListPx.reduce((bestIndex, currentHeight, currentIndex) => {
			return currentHeight < columnHeightListPx[bestIndex] ? currentIndex : bestIndex
		}, 0)
		const topPx = columnHeightListPx[targetColumnIndex]

		columnHeightListPx[targetColumnIndex] += itemHeightPx + columnGapPx.value

		return {
			item,
			index,
			leftPx: columnLeftListPx[targetColumnIndex],
			topPx,
			heightPx: itemHeightPx,
			estimatedHeightPx
		}
	})
})

const totalHeightPx = computed(() => {
	if (!layoutList.value.length) {
		return 0
	}

	return layoutList.value.reduce((maxValue, item) => {
		return Math.max(maxValue, item.topPx + item.heightPx)
	}, 0)
})

const totalHeightStyle = computed(() => {
	if (usePxRenderMode.value) {
		return `${totalHeightPx.value}px`
	}

	return `${pxToRpx(totalHeightPx.value)}rpx`
})

const measurementReady = computed(() => {
	if (props.itemList.length <= virtualizationReadyMinCount) {
		return true
	}

	return props.itemList.every((item) => !!measuredHeightMap.value[item.id])
})

const visibleLayoutList = computed(() => {
	if (!props.active) {
		return layoutList.value.slice(0, 10)
	}

	if (!measurementReady.value) {
		return layoutList.value
	}

	const relativeScrollTopPx = Math.max(0, props.parentScrollTopPx - props.listStartOffsetPx)
	const windowTopPx = Math.max(0, relativeScrollTopPx - masonryConfig.bufferPx)
	const windowBottomPx = relativeScrollTopPx + viewportHeightPx.value + masonryConfig.bufferPx

	return layoutList.value.filter((layoutItem) => {
		const itemTopPx = layoutItem.topPx
		const itemBottomPx = layoutItem.topPx + layoutItem.heightPx
		return itemBottomPx >= windowTopPx && itemTopPx <= windowBottomPx
	})
})

function resolveLayoutStyle(layoutItem) {
	if (!usePxRenderMode.value) {
		return {
			left: `${pxToRpx(layoutItem.leftPx)}rpx`,
			top: `${pxToRpx(layoutItem.topPx)}rpx`,
			width: `${pxToRpx(columnWidthPx.value)}rpx`
		}
	}

	return {
		left: `${layoutItem.leftPx}px`,
		top: `${layoutItem.topPx}px`,
		width: `${columnWidthPx.value}px`
	}
}

function handleWindowResize() {
	// #ifdef H5
	viewportWidthPx.value = window.innerWidth || viewportWidthPx.value
	viewportHeightPx.value = window.innerHeight || viewportHeightPx.value
	measuredHeightMap.value = {}
	scheduleMeasurement()
	// #endif
}

function scheduleMeasurement() {
	if (!instance?.proxy) {
		return
	}

	if (measureTimer) {
		clearTimeout(measureTimer)
	}

	measureTimer = setTimeout(() => {
		measureTimer = null
		nextTick(() => {
			const query = uni.createSelectorQuery().in(instance.proxy)
			query.selectAll('.recommend-node').boundingClientRect((rectList) => {
				if (!Array.isArray(rectList) || !rectList.length) {
					return
				}

				const nextHeightMap = { ...measuredHeightMap.value }
				let changed = false

				rectList.forEach((rect) => {
					const itemId = rect?.dataset?.itemId
					const measuredHeightPx = Math.round(rect?.height || 0)
					if (!itemId || measuredHeightPx <= 0) {
						return
					}

					if (Math.abs((nextHeightMap[itemId] || 0) - measuredHeightPx) >= 2) {
						nextHeightMap[itemId] = measuredHeightPx
						changed = true
					}
				})

				if (changed) {
					measuredHeightMap.value = nextHeightMap
				}
			}).exec()
		})
	}, 16)
}

watch(
	() => props.itemList.map((item) => item.id),
	(itemIdList) => {
		const keepHeightMap = {}
		itemIdList.forEach((itemId) => {
			if (measuredHeightMap.value[itemId]) {
				keepHeightMap[itemId] = measuredHeightMap.value[itemId]
			}
		})
		measuredHeightMap.value = keepHeightMap
		scheduleMeasurement()
	},
	{
		immediate: true
	}
)

watch(
	() => visibleLayoutList.value.map((item) => item.item.id).join(','),
	() => {
		scheduleMeasurement()
	},
	{
		flush: 'post'
	}
)

watch(
	() => `${props.containerWidthRpx}-${columnCount.value}-${viewportWidthPx.value}`,
	() => {
		measuredHeightMap.value = {}
		scheduleMeasurement()
	}
)

onMounted(() => {
	// #ifdef H5
	window.addEventListener('resize', handleWindowResize)
	removeResizeListener = () => {
		window.removeEventListener('resize', handleWindowResize)
	}
	// #endif

	scheduleMeasurement()
})

onBeforeUnmount(() => {
	if (measureTimer) {
		clearTimeout(measureTimer)
		measureTimer = null
	}

	// #ifdef H5
	removeResizeListener?.()
	removeResizeListener = null
	// #endif
})
</script>

<style scoped>
.recommend-space {
	position: relative;
	width: 100%;
}

.recommend-node {
	position: absolute;
}

.recommend-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 320rpx;
	border-radius: 28rpx;
	background: #ffffff;
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.08);
}

.recommend-empty-text {
	font-size: 24rpx;
	line-height: 34rpx;
	color: #98a2b3;
}
</style>
