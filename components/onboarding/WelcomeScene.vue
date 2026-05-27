<template>
	<view class="page-shell">
		<view
			id="welcome-guide-stage"
			class="guide-stage"
			@touchstart="handleTouchStart"
			@touchmove="handleTouchMove"
			@touchend="handleTouchEnd"
			@touchcancel="handleTouchEnd"
		>
			<view class="guide-track" :style="trackStyle">
				<view
					v-for="(item, index) in pageMock.slides"
					:key="item.id"
					:class="['slide-item', getSlideItemClass(index)]"
					:style="slideItemStyle"
				>
					<image class="slide-background-image" :src="item.backgroundUrl" mode="aspectFill" />
					<view class="hero-copy">
						<view class="hero-title">{{ item.title }}</view>
						<view class="hero-subtitle">{{ item.subtitle }}</view>
					</view>
				</view>

				<view v-if="showLoginSwipeHint" class="login-swipe-hint" :style="loginSwipeHintStyle">
					<text class="login-swipe-hint-text">去登录</text>
				</view>
			</view>
		</view>

		<view class="top-bar">
			<view class="brand-chip">{{ pageMock.brandText }}</view>
			<view class="skip-button" @tap="handleSkipClick">{{ pageMock.skipText }}</view>
		</view>

		<view class="bottom-panel">
			<view class="indicator-group">
				<view
					v-for="(item, index) in pageMock.slides"
					:key="item.id"
					:class="['indicator-dot', currentIndex === index ? 'indicator-dot-active' : '']"
					@tap="handleIndicatorTap(index)"
				></view>
			</view>

			<view class="action-button" @tap="handlePrimaryAction">
				{{ currentIndex === pageMock.slides.length - 1 ? pageMock.enterText : pageMock.nextText }}
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, ref } from 'vue'

const emit = defineEmits(['complete', 'skip'])
const instance = getCurrentInstance()
const systemInfo = uni.getSystemInfoSync()
const viewportWidthPx = Math.max(1, Number(systemInfo.windowWidth || systemInfo.screenWidth || 375))
const SWIPE_TRIGGER_RATIO = 0.16
const SWIPE_MAX_OFFSET_RATIO = 0.42
const LOGIN_HINT_MAX_WIDTH_PX = 152
const LOGIN_RELEASE_TRIGGER_PX = 18

const pageMock = {
	brandText: 'QIAN YU',
	skipText: '跳过',
	nextText: '继续',
	enterText: '进入',
	slides: [
		{
			id: 'guide-1',
			backgroundUrl: '/static/images/auth/welcome-bg-1-gs.jpg',
			title: '遇见想分享的人',
			subtitle: '轻一点开始，留下今天的照片、心情和故事。'
		},
		{
			id: 'guide-2',
			backgroundUrl: '/static/images/auth/welcome-bg-2-gs.jpg',
			title: '把日常放进动态里',
			subtitle: '作品、动态和喜欢的内容，都能自然展开。'
		},
		{
			id: 'guide-3',
			backgroundUrl: '/static/images/auth/welcome-bg-3-gs.jpg',
			title: '现在就进入千语',
			subtitle: '先用 Mock 跑通交互，后面替换 API 就能直接接入。'
		}
	]
}

const currentIndex = ref(0)
const dragOffsetPx = ref(0)
const trackAnimating = ref(true)
const slideWidthPx = ref(viewportWidthPx)
const loginSwipeRevealPx = ref(0)

let touchStartX = 0
let touchDragging = false

const trackStyle = computed(() => {
	return {
		width: `${slideWidthPx.value * pageMock.slides.length}px`,
		transform: `translate3d(${(-currentIndex.value * slideWidthPx.value) + dragOffsetPx.value}px, 0, 0)`,
		transition: trackAnimating.value ? 'transform 420ms cubic-bezier(0.22, 0.82, 0.2, 1)' : 'none'
	}
})

const slideItemStyle = computed(() => {
	return {
		width: `${slideWidthPx.value}px`
	}
})

const showLoginSwipeHint = computed(() => {
	return currentIndex.value === pageMock.slides.length - 1 && loginSwipeRevealPx.value > 0
})

const loginSwipeHintStyle = computed(() => {
	const width = Math.min(LOGIN_HINT_MAX_WIDTH_PX, loginSwipeRevealPx.value)
	const progress = Math.min(1, loginSwipeRevealPx.value / LOGIN_HINT_MAX_WIDTH_PX)
	return {
		width: `${width}px`,
		opacity: progress,
		transform: `translate3d(${(1 - progress) * 28}px, 0, 0)`
	}
})

onMounted(() => {
	primeSlideBackgrounds()
	nextTick(() => {
		measureStageWidth()
	})
})

function handlePrimaryAction() {
	const activeSlide = pageMock.slides[currentIndex.value]
	onPrimaryAction(activeSlide)
	if (currentIndex.value >= pageMock.slides.length - 1) {
		emit('complete', {
			source: 'primary-action',
			slideId: activeSlide.id
		})
		return
	}

	trackAnimating.value = true
	dragOffsetPx.value = 0
	changeSlide(currentIndex.value + 1, 'primary-action')
}

function handleSkipClick() {
	onSkip()
	emit('skip', {
		source: 'skip-button',
		slideId: pageMock.slides[currentIndex.value]?.id || ''
	})
}

function onSkip() {
	// TODO：替换真实跳过回调
	console.log('welcome-skip')
}

function onPrimaryAction(slideItem) {
	// TODO：替换欢迎页主按钮回调
	console.log('welcome-primary-action', slideItem.id)
}

function onSlideChange(slideItem, source = 'swipe') {
	// TODO：替换欢迎页轮播切换回调
	console.log('welcome-slide-change', slideItem.id, source)
}

function handleIndicatorTap(index) {
	trackAnimating.value = true
	dragOffsetPx.value = 0
	loginSwipeRevealPx.value = 0
	changeSlide(index, 'indicator')
}

function handleTouchStart(event) {
	if (pageMock.slides.length <= 1) {
		return
	}

	touchStartX = getTouchX(event)
	touchDragging = true
	trackAnimating.value = false
}

function handleTouchMove(event) {
	if (!touchDragging) {
		return
	}

	const deltaX = getTouchX(event) - touchStartX
	const isFirstSlidePullBack = currentIndex.value === 0 && deltaX > 0
	const isLastSlideGoLogin = currentIndex.value === pageMock.slides.length - 1 && deltaX < 0

	if (isFirstSlidePullBack) {
		dragOffsetPx.value = 0
		loginSwipeRevealPx.value = 0
		return
	}

	if (isLastSlideGoLogin) {
		dragOffsetPx.value = 0
		loginSwipeRevealPx.value = clampOffset(-deltaX, 0, LOGIN_HINT_MAX_WIDTH_PX)
		return
	}

	loginSwipeRevealPx.value = 0
	dragOffsetPx.value = clampOffset(
		deltaX,
		-slideWidthPx.value * SWIPE_MAX_OFFSET_RATIO,
		slideWidthPx.value * SWIPE_MAX_OFFSET_RATIO
	)
}

function handleTouchEnd() {
	if (!touchDragging) {
		return
	}

	touchDragging = false
	trackAnimating.value = true

	const finishedOffset = dragOffsetPx.value
	const loginReveal = loginSwipeRevealPx.value
	const threshold = slideWidthPx.value * SWIPE_TRIGGER_RATIO
	dragOffsetPx.value = 0
	loginSwipeRevealPx.value = 0

	if (currentIndex.value >= pageMock.slides.length - 1 && loginReveal >= LOGIN_RELEASE_TRIGGER_PX) {
		const activeSlide = pageMock.slides[currentIndex.value]
		emit('complete', {
			source: 'swipe-complete',
			slideId: activeSlide.id
		})
		return
	}

	if (finishedOffset <= -threshold) {
		changeSlide(currentIndex.value + 1, 'swipe-left')
		return
	}

	if (finishedOffset >= threshold) {
		changeSlide(currentIndex.value - 1, 'swipe-right')
	}
}

function changeSlide(nextIndex, source) {
	const normalizedIndex = clampOffset(nextIndex, 0, pageMock.slides.length - 1)
	if (normalizedIndex === currentIndex.value) {
		return
	}

	currentIndex.value = normalizedIndex
	onSlideChange(pageMock.slides[normalizedIndex], source)
}

function getSlideItemClass(index) {
	if (index === currentIndex.value) {
		return 'slide-item-active'
	}

	if (index < currentIndex.value) {
		return 'slide-item-prev'
	}

	return 'slide-item-next'
}

function getTouchX(event) {
	return Number(event?.changedTouches?.[0]?.clientX || event?.touches?.[0]?.clientX || 0)
}

function clampOffset(value, min, max) {
	return Math.min(max, Math.max(min, value))
}

function measureStageWidth() {
	uni.createSelectorQuery()
		.in(instance?.proxy)
		.select('#welcome-guide-stage')
		.boundingClientRect((rect) => {
			const nextWidth = Number(rect?.width || 0)
			if (nextWidth > 0) {
				slideWidthPx.value = nextWidth
			}
		})
		.exec()
}

function primeSlideBackgrounds() {
	pageMock.slides.forEach((slideItem) => {
		uni.getImageInfo({
			src: slideItem.backgroundUrl,
			fail(error) {
				console.log('welcome-slide-preload-fail', slideItem.id, error?.errMsg || '')
			}
		})
	})
}
</script>

<style scoped>
.page-shell {
	position: relative;
	min-height: 100vh;
	background: #f8fafc;
	overflow: hidden;
}

.guide-stage {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
}

.guide-track {
	display: flex;
	height: 100%;
	will-change: transform;
	position: relative;
	z-index: 1;
}

.slide-item {
	position: relative;
	flex: 0 0 auto;
	width: 100%;
	height: 100vh;
	overflow: hidden;
}

.slide-item-active {
	z-index: 2;
}

.slide-background-image {
	position: absolute;
	left: -1%;
	top: -1%;
	width: 102%;
	height: 102%;
	transform: scale(1.02);
	transition: transform 420ms cubic-bezier(0.22, 0.82, 0.2, 1);
	will-change: transform;
	transform-origin: center center;
	backface-visibility: hidden;
	display: block;
}

.login-swipe-hint {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	z-index: 3;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	background: linear-gradient(270deg, rgba(15, 23, 42, 0.34) 0%, rgba(15, 23, 42, 0.18) 52%, rgba(15, 23, 42, 0) 100%);
	pointer-events: none;
}

.login-swipe-hint-text {
	font-size: 28rpx;
	font-weight: 600;
	line-height: 38rpx;
	letter-spacing: 4rpx;
	color: #ffffff;
	white-space: nowrap;
}

.slide-item-active .slide-background-image {
	transform: scale(1);
}

.slide-item-prev .slide-background-image {
	transform: scale(1.01);
}

.slide-item-next .slide-background-image {
	transform: scale(1.01);
}

.hero-copy {
	position: absolute;
	right: 40rpx;
	bottom: 248rpx;
	left: 40rpx;
	z-index: 2;
	opacity: 0.74;
	transform: translate3d(22rpx, 0, 0);
	transition:
		transform 360ms cubic-bezier(0.22, 0.82, 0.2, 1),
		opacity 320ms ease;
	will-change: transform, opacity;
}

.slide-item-active .hero-copy {
	opacity: 1;
	transform: translate3d(0, 0, 0);
}

.slide-item-prev .hero-copy {
	transform: translate3d(-22rpx, 0, 0);
}

.hero-title {
	font-size: 58rpx;
	font-weight: 700;
	line-height: 76rpx;
	color: #0f172a;
	letter-spacing: 2rpx;
}

.hero-subtitle {
	max-width: 560rpx;
	margin-top: 18rpx;
	font-size: 26rpx;
	line-height: 40rpx;
	color: rgba(15, 23, 42, 0.72);
}

.top-bar {
	position: absolute;
	top: 96rpx;
	right: 40rpx;
	left: 40rpx;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.brand-chip,
.skip-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 62rpx;
	padding: 0 26rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.48);
	border-radius: 999rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.22) 100%);
	box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #334155;
	letter-spacing: 3rpx;
}

.bottom-panel {
	position: absolute;
	right: 32rpx;
	bottom: 60rpx;
	left: 32rpx;
	z-index: 2;
	padding: 20rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.46);
	border-radius: 34rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.24) 100%);
	box-shadow: 0 16rpx 36rpx rgba(148, 163, 184, 0.12);
}

.indicator-group {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 18rpx;
}

.indicator-dot {
	width: 14rpx;
	height: 14rpx;
	margin: 0 10rpx;
	border-radius: 50%;
	background: rgba(148, 163, 184, 0.34);
}

.indicator-dot-active {
	width: 40rpx;
	border-radius: 999rpx;
	background: #ffffff;
}

.action-button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 90rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.68) 100%);
	font-size: 28rpx;
	font-weight: 600;
	color: #0f172a;
}
</style>
