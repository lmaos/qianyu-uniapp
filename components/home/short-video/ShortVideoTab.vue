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
			v-if="currentVideoItem"
			class="short-video-swiper"
			:current="swiperCurrent"
			vertical
			:circular="false"
			:duration="260"
			@change="handleSwiperChange"
		>
			<swiper-item v-for="slot in trackSlotList" :key="slot.slot">
				<FullScreenVideoPanel
					v-if="slot.video"
					:key="slot.video.id"
					:ref="(instance) => setPanelRef(slot.slot, instance)"
					:video="slot.video"
					:height-px="viewportHeightValue"
					:safe-bottom-inset-rpx="24"
					:show-follow-button="true"
					:show-play-hint="true"
					:playable="slot.slot === 'current'"
					:muted-playback="false"
					:loop-playback="true"
					@author-click="handleAuthorClick"
					@action="handleAction"
					@play="handlePanelPlay(slot, $event)"
					@pause="handlePanelPause(slot, $event)"
					@ended="handlePanelEnded(slot, $event)"
					@error="handlePanelError(slot, $event)"
				/>
				<view v-else class="short-video-empty-slot"></view>
			</swiper-item>
		</swiper>

		<view v-if="loadingMore" class="short-video-loading-bar">
			<text class="short-video-loading-text">正在加载更多短视频</text>
		</view>
	</view>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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

const emit = defineEmits(['refresh', 'load-more', 'video-change', 'video-action', 'author-click', 'play', 'pause', 'ended', 'error'])

const channelMock = getShortVideoChannelMock()
const baseSourceList = channelMock.sourceList.map((item) => cloneShortVideoItem(item))
const pullThresholdPx = 64
const SWIPER_CENTER_INDEX = 1

const panelRefMap = {
	previous: ref(null),
	current: ref(null),
	next: ref(null)
}

const refreshCursor = ref(0)
const currentPage = ref(1)
const currentIndex = ref(0)
const swiperCurrent = ref(SWIPER_CENTER_INDEX)
const loadedList = ref([])
const playingVideoId = ref('')
const refreshing = ref(false)
const loadingMore = ref(false)
const pullDistancePx = ref(0)
const shouldResumePlayback = ref(true)
const transitioningPlayback = ref(false)

let refreshTimer = null
let loadMoreTimer = null
let transitionTimer = null
let touchStartY = 0
let touchingFromTop = false

const viewportHeightValue = computed(() => Math.max(0, Number(props.viewportHeightPx) || 0))

const tabStyle = computed(() => ({
	height: viewportHeightValue.value > 0 ? `${viewportHeightValue.value}px` : '100%'
}))

const rotatedSourceList = computed(() => {
	const total = baseSourceList.length
	if (!total) {
		return []
	}

	const startIndex = refreshCursor.value % total
	return [...baseSourceList.slice(startIndex), ...baseSourceList.slice(0, startIndex)]
})

const currentVideoItem = computed(() => loadedList.value[currentIndex.value] || null)

const trackSlotList = computed(() => [
	{
		slot: 'previous',
		video: currentIndex.value > 0 ? loadedList.value[currentIndex.value - 1] || null : null
	},
	{
		slot: 'current',
		video: currentVideoItem.value
	},
	{
		slot: 'next',
		video: currentIndex.value < loadedList.value.length - 1 ? loadedList.value[currentIndex.value + 1] || null : null
	}
])

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
			clearTransitionLock()
			pauseAllPanels()
			playingVideoId.value = ''
			resetPullState()
			return
		}

		if (!loadedList.value.length) {
			resetChannelState()
		}

		void settleCurrentPanelPlayback(shouldResumePlayback.value)
	},
	{
		immediate: true
	}
)

watch(
	() => currentIndex.value,
	(value) => {
		emit('video-change', loadedList.value[value] || null)
		if (!props.active || refreshing.value || loadingMore.value) {
			return
		}

		if (value < Math.max(0, loadedList.value.length - 2)) {
			return
		}

		void loadMorePage()
	}
)

function setPanelRef(slot, instance) {
	panelRefMap[slot].value = instance || null
}

function createPageSlice(page) {
	return rotatedSourceList.value.slice(0, page * channelMock.pageSize).map((item) => cloneShortVideoItem(item))
}

function resetChannelState() {
	currentPage.value = 1
	currentIndex.value = 0
	swiperCurrent.value = SWIPER_CENTER_INDEX
	loadedList.value = createPageSlice(1)
	playingVideoId.value = ''
	shouldResumePlayback.value = true
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

function clearTransitionLock() {
	if (transitionTimer) {
		clearTimeout(transitionTimer)
		transitionTimer = null
	}
	transitioningPlayback.value = false
}

function startTransitionLock(delay = 320) {
	clearTransitionLock()
	transitioningPlayback.value = true
	transitionTimer = setTimeout(() => {
		transitioningPlayback.value = false
		transitionTimer = null
	}, delay)
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
	const nextSlotIndex = Math.max(0, Math.min(2, Number(event?.detail?.current || 0)))
	if (nextSlotIndex === SWIPER_CENTER_INDEX) {
		return
	}

	const nextIndex = nextSlotIndex > SWIPER_CENTER_INDEX ? currentIndex.value + 1 : currentIndex.value - 1
	if (nextIndex < 0 || nextIndex >= loadedList.value.length) {
		void resetSwiperToCenter()
		return
	}

	const shouldKeepPlayback = props.active
	shouldResumePlayback.value = shouldKeepPlayback
	startTransitionLock()
	pauseAllPanels()
	currentIndex.value = nextIndex
	resetPullState()
	void resetSwiperToCenter()
	void settleCurrentPanelPlayback(shouldKeepPlayback)
}

function pauseAllPanels() {
	panelRefMap.previous.value?.pause?.()
	panelRefMap.current.value?.pause?.()
	panelRefMap.next.value?.pause?.()
}

function pauseSidePanels() {
	panelRefMap.previous.value?.pause?.()
	panelRefMap.next.value?.pause?.()
}

async function settleCurrentPanelPlayback(shouldPlay = true) {
	startTransitionLock()
	await nextTick()
	pauseSidePanels()

	if (!props.active || !panelRefMap.current.value) {
		clearTransitionLock()
		return
	}

	if (shouldPlay) {
		await panelRefMap.current.value.play?.()
		return
	}

	await panelRefMap.current.value.pause?.()
	clearTransitionLock()
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
			const status = loadedList.value.length >= rotatedSourceList.value.length ? 'no-more' : 'loaded'
			emit('load-more', {
				page: currentPage.value,
				status,
				total: loadedList.value.length
			})
			resolve({ status })
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
	clearTransitionLock()
	pauseAllPanels()

	return new Promise((resolve) => {
		refreshTimer = setTimeout(() => {
			const total = Math.max(1, baseSourceList.length)
			refreshCursor.value = (refreshCursor.value + 4) % total
			resetChannelState()
			refreshing.value = false
			resetPullState()
			refreshTimer = null
			emit('refresh', {
				page: 1,
				total: loadedList.value.length
			})
			void settleCurrentPanelPlayback(true)
			resolve()
		}, channelMock.refreshDelayMs)
	})
}

function handleAuthorClick(video) {
	emit('author-click', video)
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
	emit('video-action', payload)
	onShortVideoAction(payload)
	uni.showToast({
		title: '短视频互动占位',
		icon: 'none'
	})
}

function handlePanelPlay(slot, video) {
	if (slot.slot !== 'current' || video?.id !== currentVideoItem.value?.id) {
		return
	}

	playingVideoId.value = video.id
	shouldResumePlayback.value = true
	clearTransitionLock()
	emit('play', video)
}

function handlePanelPause(slot, video) {
	if (slot.slot !== 'current' || video?.id !== currentVideoItem.value?.id) {
		return
	}

	if (!transitioningPlayback.value && props.active) {
		shouldResumePlayback.value = false
	}
	if (playingVideoId.value === video.id) {
		playingVideoId.value = ''
	}
	clearTransitionLock()
	emit('pause', video)
}

function handlePanelEnded(slot, video) {
	if (slot.slot !== 'current' || video?.id !== currentVideoItem.value?.id) {
		return
	}

	if (playingVideoId.value === video.id) {
		playingVideoId.value = ''
	}
	shouldResumePlayback.value = false
	clearTransitionLock()
	emit('ended', video)
}

function handlePanelError(slot, payload) {
	const targetVideo = payload?.video || null
	if (slot.slot !== 'current' || targetVideo?.id !== currentVideoItem.value?.id) {
		return
	}

	shouldResumePlayback.value = false
	if (playingVideoId.value === targetVideo.id) {
		playingVideoId.value = ''
	}
	clearTransitionLock()
	emit('error', payload)
}

function resetSwiperToCenter() {
	return nextTick(() => {
		swiperCurrent.value = SWIPER_CENTER_INDEX
	})
}

function onShortVideoAuthorClick(video) {
	console.log('home-short-video-author-click', video?.authorInfo?.userId)
}

function onShortVideoAction(payload) {
	console.log('home-short-video-action', payload?.key, payload?.video?.workId || payload?.video?.id)
}

defineExpose({
	handleParentRefresh: triggerRefresh,
	handleParentReachLower: loadMorePage,
	playCurrent() {
		shouldResumePlayback.value = true
		return settleCurrentPanelPlayback(true)
	},
	pauseCurrent() {
		shouldResumePlayback.value = false
		clearTransitionLock()
		pauseAllPanels()
	},
	stopPlayback() {
		shouldResumePlayback.value = false
		clearTransitionLock()
		pauseAllPanels()
	}
})

onBeforeUnmount(() => {
	clearRefreshTimer()
	clearLoadMoreTimer()
	clearTransitionLock()
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

.short-video-empty-slot {
	width: 100%;
	height: 100%;
	background: #020617;
}
</style>
