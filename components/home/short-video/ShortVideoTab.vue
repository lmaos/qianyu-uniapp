<template>
	<view
		class="short-video-tab"
		:style="tabStyle"
		@touchstart="handleTouchStart"
		@touchmove="handleTouchMove"
		@touchend="handleTouchEnd"
		@touchcancel="handleTouchEnd"
	>
		<view class="short-video-pull-hint" :style="pullHintStyle">
			<text class="short-video-pull-text">{{ pullStatusText }}</text>
		</view>

		<swiper
			v-if="renderVideoList.length"
			class="short-video-swiper"
			:current="swiperCurrent"
			vertical
			:circular="false"
			:duration="260"
			@change="handleSwiperChange"
		>
			<swiper-item v-for="item in renderVideoList" :key="item.id">
				<FullScreenVideoPanel
					:video="item"
					:height-px="viewportHeightValue"
					:safe-bottom-inset-rpx="24"
					:show-play-hint="true"
					:active-playback="playingVideoId === item.id && active"
					:playable="true"
					:muted-playback="false"
					:loop-playback="true"
					@toggle-playback="handleTogglePlayback(item)"
					@playback-change="handlePlaybackChange(item, $event)"
					@author-click="handleAuthorClick"
					@action="handleAction"
				/>
			</swiper-item>
		</swiper>

		<view v-if="loadingMore" class="short-video-loading-bar">
			<text class="short-video-loading-text">正在加载更多短视频</text>
		</view>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import FullScreenVideoPanel from '@/components/common/video/FullScreenVideoPanel.vue'
import {
	cloneShortVideoItem,
	getShortVideoChannelMock
} from '@/components/home/short-video/shortVideoMock.js'

const props = defineProps({
	active: {
		type: Boolean,
		default: false
	},
	viewportHeightPx: {
		type: Number,
		default: 0
	}
})

const channelMock = getShortVideoChannelMock()
const baseSourceList = channelMock.sourceList.map((item) => cloneShortVideoItem(item))
const pullThresholdPx = 64

const refreshCursor = ref(0)
const currentPage = ref(1)
const currentIndex = ref(0)
const swiperCurrent = ref(0)
const loadedList = ref([])
const playingVideoId = ref('')
const refreshing = ref(false)
const loadingMore = ref(false)
const pullDistancePx = ref(0)

let refreshTimer = null
let loadMoreTimer = null
let touchStartY = 0
let touchingFromTop = false

const viewportHeightValue = computed(() => {
	return Math.max(0, Number(props.viewportHeightPx) || 0)
})

const tabStyle = computed(() => {
	return {
		height: viewportHeightValue.value > 0 ? `${viewportHeightValue.value}px` : '100%'
	}
})

const rotatedSourceList = computed(() => {
	const total = baseSourceList.length
	if (!total) {
		return []
	}

	const startIndex = refreshCursor.value % total
	return [...baseSourceList.slice(startIndex), ...baseSourceList.slice(0, startIndex)]
})

const renderVideoList = computed(() => {
	return loadedList.value
})

const pullStatusText = computed(() => {
	if (refreshing.value) {
		return '正在刷新短视频'
	}

	return pullDistancePx.value >= pullThresholdPx ? '松手刷新短视频' : '下拉刷新短视频'
})

const pullHintStyle = computed(() => {
	const visibleDistance = refreshing.value ? pullThresholdPx : pullDistancePx.value
	const opacity = visibleDistance <= 0 ? 0 : Math.min(1, visibleDistance / 40)
	const translateY = refreshing.value ? 0 : 36 - Math.min(36, visibleDistance * 0.4)
	return {
		opacity,
		transform: `translate(-50%, ${translateY}px)`
	}
})

watch(
	() => props.active,
	(value) => {
		if (!value) {
			resetPullState()
			playingVideoId.value = ''
			return
		}

		if (!loadedList.value.length) {
			resetChannelState()
		}
	},
	{
		immediate: true
	}
)

watch(
	() => currentIndex.value,
	() => {
		if (!props.active || refreshing.value || loadingMore.value) {
			return
		}

		if (currentIndex.value < Math.max(0, loadedList.value.length - 2)) {
			return
		}

		void loadMorePage()
	}
)

function createPageSlice(page) {
	return rotatedSourceList.value
		.slice(0, page * channelMock.pageSize)
		.map((item) => cloneShortVideoItem(item))
}

function resetChannelState() {
	currentPage.value = 1
	currentIndex.value = 0
	swiperCurrent.value = 0
	loadedList.value = createPageSlice(1)
	playingVideoId.value = ''
}

function resetPullState() {
	pullDistancePx.value = 0
	touchingFromTop = false
}

function clearRefreshTimer() {
	if (refreshTimer) {
		clearTimeout(refreshTimer)
		refreshTimer = null
	}
}

function clearLoadMoreTimer() {
	if (loadMoreTimer) {
		clearTimeout(loadMoreTimer)
		loadMoreTimer = null
	}
}

function getTouchY(event) {
	return Number(event?.touches?.[0]?.clientY || event?.changedTouches?.[0]?.clientY || 0) || 0
}

function handleTouchStart(event) {
	if (!props.active || currentIndex.value !== 0 || refreshing.value) {
		touchingFromTop = false
		return
	}

	touchStartY = getTouchY(event)
	touchingFromTop = true
}

function handleTouchMove(event) {
	if (!touchingFromTop || currentIndex.value !== 0 || refreshing.value) {
		return
	}

	const moveY = getTouchY(event)
	const deltaY = moveY - touchStartY
	if (deltaY <= 0) {
		pullDistancePx.value = 0
		return
	}

	pullDistancePx.value = Math.min(92, deltaY * 0.38)
}

function handleTouchEnd() {
	if (touchingFromTop && pullDistancePx.value >= pullThresholdPx && !refreshing.value) {
		void triggerRefresh()
	} else {
		resetPullState()
	}
}

function handleSwiperChange(event) {
	const nextIndex = Math.min(loadedList.value.length - 1, Math.max(0, Number(event?.detail?.current || 0)))
	if (nextIndex === currentIndex.value && nextIndex === swiperCurrent.value) {
		return
	}

	const shouldKeepPlayback = Boolean(playingVideoId.value)
	currentIndex.value = nextIndex
	swiperCurrent.value = nextIndex
	playingVideoId.value = shouldKeepPlayback ? loadedList.value[nextIndex]?.id || '' : ''
	resetPullState()
}

function loadMorePage() {
	if (loadingMore.value) {
		return Promise.resolve({ status: 'busy' })
	}

	if (loadedList.value.length >= rotatedSourceList.value.length) {
		return Promise.resolve({ status: 'no-more' })
	}

	loadingMore.value = true
	clearLoadMoreTimer()

	return new Promise((resolve) => {
		loadMoreTimer = setTimeout(() => {
			currentPage.value += 1
			loadedList.value = createPageSlice(currentPage.value)
			loadingMore.value = false
			loadMoreTimer = null
			resolve({
				status: loadedList.value.length >= rotatedSourceList.value.length ? 'no-more' : 'loaded'
			})
		}, channelMock.loadDelayMs)
	})
}

function triggerRefresh() {
	if (refreshing.value) {
		return Promise.resolve()
	}

	refreshing.value = true
	pullDistancePx.value = pullThresholdPx
	clearRefreshTimer()

	return new Promise((resolve) => {
		refreshTimer = setTimeout(() => {
			const total = Math.max(1, baseSourceList.length)
			refreshCursor.value = (refreshCursor.value + 4) % total
			resetChannelState()
			refreshing.value = false
			resetPullState()
			refreshTimer = null
			resolve()
		}, channelMock.refreshDelayMs)
	})
}

function handleAuthorClick(video) {
	onShortVideoAuthorClick(video)
	if (video?.authorUrl) {
		uni.navigateTo({
			url: video.authorUrl
		})
		return
	}

	uni.showToast({
		title: '作者资料占位',
		icon: 'none'
	})
}

function handleAction(payload) {
	onShortVideoAction(payload)
	uni.showToast({
		title: '短视频互动占位',
		icon: 'none'
	})
}

function handleTogglePlayback(video) {
	if (!props.active || !video?.id) {
		return
	}

	playingVideoId.value = playingVideoId.value === video.id ? '' : video.id
}

function handlePlaybackChange(video, playing) {
	if (!video?.id) {
		return
	}

	if (playing) {
		playingVideoId.value = video.id
		return
	}

	if (playingVideoId.value === video.id) {
		playingVideoId.value = ''
	}
}

function onShortVideoAuthorClick(video) {
	// TODO：替换短视频作者资料跳转逻辑
	console.log('home-short-video-author-click', video?.authorInfo?.userId)
}

function onShortVideoAction(payload) {
	// TODO：替换短视频互动逻辑
	console.log('home-short-video-action', payload?.key, payload?.video?.workId || payload?.video?.id)
}

defineExpose({
	handleParentRefresh: triggerRefresh,
	handleParentReachLower: loadMorePage,
	stopPlayback() {
		playingVideoId.value = ''
	}
})

onBeforeUnmount(() => {
	clearRefreshTimer()
	clearLoadMoreTimer()
})
</script>

<style scoped>
.short-video-tab {
	position: relative;
	width: 100%;
	overflow: hidden;
	background: #020617;
	border-radius: 0;
}

.short-video-swiper {
	width: 100%;
	height: 100%;
}

.short-video-pull-hint {
	position: absolute;
	top: 16rpx;
	left: 50%;
	z-index: 4;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.48);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	pointer-events: none;
}

.short-video-pull-text,
.short-video-loading-text {
	font-size: 22rpx;
	font-weight: 500;
	line-height: 30rpx;
	color: rgba(255, 255, 255, 0.9);
}

.short-video-loading-bar {
	position: absolute;
	left: 50%;
	bottom: 28rpx;
	z-index: 4;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 22rpx;
	transform: translateX(-50%);
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.48);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
}
</style>
