<template>
	<view class="user-dynamic-masonry">
		<view class="user-dynamic-space" :style="{ height: `${totalHeightRpx}rpx` }">
			<view
				v-for="layoutItem in visibleLayoutList"
				:key="layoutItem.item.id"
				class="user-dynamic-node"
				:style="resolveLayoutStyle(layoutItem)"
				@tap="emit('item-click', layoutItem.item)"
			>
				<view class="user-dynamic-item">
					<view
						v-if="layoutItem.item.hasMedia"
						class="user-dynamic-thumb"
						:style="{ background: layoutItem.item.coverBackground, height: `${layoutItem.thumbHeightRpx}rpx` }"
					>
						<image
							v-if="layoutItem.item.coverUrl"
							class="user-dynamic-thumb-img"
							:src="layoutItem.item.coverUrl"
							mode="aspectFill"
						/>
					</view>

					<view v-else class="user-dynamic-plain" :style="{ background: layoutItem.item.coverBackground }">
						<text class="user-dynamic-title user-dynamic-title--plain">{{ layoutItem.item.title }}</text>
						<view class="user-dynamic-stats user-dynamic-stats--plain">
							<view class="user-dynamic-stat user-dynamic-stat--plain">
								<image class="user-dynamic-stat-icon" :src="userViewStatDarkIconSvg" mode="aspectFit" />
								<text class="user-dynamic-stat-text">{{ layoutItem.item.viewCountText }}</text>
							</view>
							<view class="user-dynamic-stat user-dynamic-stat--plain">
								<image class="user-dynamic-stat-icon" :src="userLikeStatDarkIconSvg" mode="aspectFit" />
								<text class="user-dynamic-stat-text">{{ layoutItem.item.likeCountText }}</text>
							</view>
							<view class="user-dynamic-stat user-dynamic-stat--plain">
								<image class="user-dynamic-stat-icon" :src="userCommentStatDarkIconSvg" mode="aspectFit" />
								<text class="user-dynamic-stat-text">{{ layoutItem.item.commentCountText }}</text>
							</view>
						</view>
					</view>

					<view v-if="layoutItem.item.hasMedia" class="user-dynamic-meta">
						<text v-if="layoutItem.item.title" class="user-dynamic-title">
							{{ layoutItem.item.title }}
						</text>
						<view class="user-dynamic-stats user-dynamic-stats--meta">
							<view class="user-dynamic-stat user-dynamic-stat--meta">
								<image class="user-dynamic-stat-icon" :src="userViewStatDarkIconSvg" mode="aspectFit" />
								<text class="user-dynamic-stat-text">{{ layoutItem.item.viewCountText }}</text>
							</view>
							<view class="user-dynamic-stat user-dynamic-stat--meta">
								<image class="user-dynamic-stat-icon" :src="userLikeStatDarkIconSvg" mode="aspectFit" />
								<text class="user-dynamic-stat-text">{{ layoutItem.item.likeCountText }}</text>
							</view>
							<view class="user-dynamic-stat user-dynamic-stat--meta">
								<image class="user-dynamic-stat-icon" :src="userCommentStatDarkIconSvg" mode="aspectFit" />
								<text class="user-dynamic-stat-text">{{ layoutItem.item.commentCountText }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import {
	userCommentStatDarkIconSvg,
	userLikeStatDarkIconSvg,
	userViewStatDarkIconSvg,
} from '@/components/user-center/main/userContentIcons.js'

const props = defineProps({
	rowList: {
		type: Array,
		default: () => []
	},
	parentScrollTopPx: {
		type: Number,
		default: 0
	},
	listStartOffsetPx: {
		type: Number,
		default: 0
	},
	active: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['item-click'])

const systemInfo = uni.getSystemInfoSync()
const screenWidth = systemInfo.screenWidth || 375
const viewportHeightPx = systemInfo.windowHeight || systemInfo.screenHeight || 667

const masonryConfig = {
	columnCount: 2,
	columnGapRpx: 20,
	containerPaddingRpx: 24,
	bufferPx: 560,
	mediaBaseHeightRpx: 436,
	mediaTitleLineHeightRpx: 34,
	plainTitleLineHeightRpx: 38,
	plainMinHeightRpx: 184,
	cardBottomPaddingRpx: 18
}

const itemList = computed(() => {
	return props.rowList.flatMap((row) => row.items || [])
})

function rpxToPx(value) {
	return (Number(value || 0) * screenWidth) / 750
}

function estimateTitleLineCount(title = '', charsPerLine = 11, maxLines = 2) {
	if (!title) {
		return 0
	}

	return Math.max(1, Math.min(maxLines, Math.ceil(String(title).length / charsPerLine)))
}

function estimatePlainTitleLineCount(title = '', charsPerLine = 10) {
	if (!title) {
		return 1
	}

	return Math.max(1, Math.ceil(String(title).length / charsPerLine))
}

const layoutList = computed(() => {
	const containerWidthRpx = 750 - masonryConfig.containerPaddingRpx * 2
	const columnWidthRpx = (containerWidthRpx - masonryConfig.columnGapRpx) / masonryConfig.columnCount
	const columnLeftListRpx = [0, columnWidthRpx + masonryConfig.columnGapRpx]
	const columnHeightListRpx = Array.from({ length: masonryConfig.columnCount }, () => 0)

	return itemList.value.map((item, index) => {
		const titleLineCount = item.hasMedia ? estimateTitleLineCount(item.title) : estimatePlainTitleLineCount(item.title)
		const thumbHeightRpx = item.hasMedia ? masonryConfig.mediaBaseHeightRpx : 0
		const metaHeightRpx = item.hasMedia
			? (item.title ? titleLineCount * masonryConfig.mediaTitleLineHeightRpx + 54 : 0) + masonryConfig.cardBottomPaddingRpx
			: 0
		const plainHeightRpx = item.hasMedia
			? 0
			: Math.max(
				masonryConfig.plainMinHeightRpx,
				82 + titleLineCount * masonryConfig.plainTitleLineHeightRpx + 76
			)
		const itemHeightRpx = item.hasMedia ? thumbHeightRpx + metaHeightRpx : plainHeightRpx

		const targetColumnIndex =
			columnHeightListRpx[0] <= columnHeightListRpx[1] ? 0 : 1
		const topRpx = columnHeightListRpx[targetColumnIndex]
		columnHeightListRpx[targetColumnIndex] += itemHeightRpx + masonryConfig.columnGapRpx

		return {
			item,
			index,
			columnIndex: targetColumnIndex,
			leftRpx: columnLeftListRpx[targetColumnIndex],
			topRpx,
			heightRpx: itemHeightRpx,
			thumbHeightRpx,
			titleLineCount
		}
	})
})

const totalHeightRpx = computed(() => {
	if (!layoutList.value.length) {
		return 0
	}

	const lastBottomRpx = layoutList.value.reduce((maxValue, item) => {
		return Math.max(maxValue, item.topRpx + item.heightRpx)
	}, 0)
	return lastBottomRpx
})

const visibleLayoutList = computed(() => {
	if (!props.active) {
		return layoutList.value.slice(0, 10)
	}

	const relativeScrollTopPx = Math.max(0, props.parentScrollTopPx - props.listStartOffsetPx)
	const windowTopPx = Math.max(0, relativeScrollTopPx - masonryConfig.bufferPx)
	const windowBottomPx = relativeScrollTopPx + viewportHeightPx + masonryConfig.bufferPx

	return layoutList.value.filter((layoutItem) => {
		const itemTopPx = rpxToPx(layoutItem.topRpx)
		const itemBottomPx = rpxToPx(layoutItem.topRpx + layoutItem.heightRpx)
		return itemBottomPx >= windowTopPx && itemTopPx <= windowBottomPx
	})
})

function resolveLayoutStyle(layoutItem) {
	return {
		left: `${layoutItem.leftRpx}rpx`,
		top: `${layoutItem.topRpx}rpx`,
		width: 'calc((100% - 20rpx) / 2)'
	}
}
</script>

<style scoped>
.user-dynamic-space {
	position: relative;
	width: 100%;
}

.user-dynamic-node {
	position: absolute;
}

.user-dynamic-item {
	overflow: hidden;
	border-radius: 16rpx;
	background: #ffffff;
}

.user-dynamic-thumb {
	position: relative;
	border-radius: 16rpx;
}

.user-dynamic-thumb-img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
}

.user-dynamic-meta {
	padding: 14rpx 14rpx 18rpx;
}

.user-dynamic-title {
	display: -webkit-box;
	overflow: hidden;
	font-size: 28rpx;
	font-weight: 500;
	line-height: 38rpx;
	color: #0f172a;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.user-dynamic-title--plain {
	display: block;
	overflow: visible;
	font-size: 26rpx;
	line-height: 38rpx;
	-webkit-line-clamp: unset;
}

.user-dynamic-plain {
	display: flex;
	flex-direction: column;
	padding: 18rpx 16rpx 16rpx;
	box-sizing: border-box;
}

.user-dynamic-stats {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx 18rpx;
}

.user-dynamic-stats--plain {
	margin-top: 18rpx;
}

.user-dynamic-stats--meta {
	margin-top: 14rpx;
}

.user-dynamic-stat {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #667085;
}

.user-dynamic-stat-icon {
	flex-shrink: 0;
	width: 22rpx;
	height: 22rpx;
}

.user-dynamic-stat-text {
	font-size: 20rpx;
	line-height: 28rpx;
	color: inherit;
}

.user-dynamic-stat--plain {
	color: #475467;
}

.user-dynamic-stat--meta {
	color: #98a2b3;
}
</style>
