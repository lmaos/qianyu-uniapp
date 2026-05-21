<template>
	<view class="page-shell">
		<swiper
			class="guide-swiper"
			:circular="true"
			:current="currentIndex"
			@change="handleSwiperChange"
		>
			<swiper-item v-for="item in pageMock.slides" :key="item.id">
				<view class="slide-item">
					<image class="slide-background-image" :src="item.backgroundUrl" mode="aspectFill" />
					<image class="slide-background-frost" :src="item.backgroundUrl" mode="aspectFill" />
					<view class="slide-background-mask"></view>
					<view class="hero-copy">
						<view class="hero-title">{{ item.title }}</view>
						<view class="hero-subtitle">{{ item.subtitle }}</view>
					</view>
				</view>
			</swiper-item>
		</swiper>

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
				></view>
			</view>

			<view class="action-button" @tap="handlePrimaryAction">
				{{ currentIndex === pageMock.slides.length - 1 ? pageMock.enterText : pageMock.nextText }}
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const pageMock = {
	brandText: 'QIAN YU',
	skipText: '跳过',
	nextText: '继续',
	enterText: '进入',
	slides: [
		{
			id: 'guide-1',
			backgroundUrl: '/static/images/auth/welcome-bg-1.jpeg',
			title: '遇见想分享的人',
			subtitle: '轻一点开始，留下今天的照片、心情和故事。'
		},
		{
			id: 'guide-2',
			backgroundUrl: '/static/images/auth/welcome-bg-2.jpeg',
			title: '把日常放进动态里',
			subtitle: '作品、动态和喜欢的内容，都能自然展开。'
		},
		{
			id: 'guide-3',
			backgroundUrl: '/static/images/auth/welcome-bg-3.jpeg',
			title: '现在就进入千语',
			subtitle: '先用 Mock 跑通交互，后面替换 API 就能直接接入。'
		}
	]
}

const currentIndex = ref(0)

function handleSwiperChange(event) {
	currentIndex.value = event.detail.current
	onSlideChange(pageMock.slides[currentIndex.value])
}

function handlePrimaryAction() {
	const activeSlide = pageMock.slides[currentIndex.value]
	onPrimaryAction(activeSlide)
	if (currentIndex.value >= pageMock.slides.length - 1) {
		goLogin()
		return
	}

	currentIndex.value += 1
}

function handleSkipClick() {
	onSkip()
	goLogin()
}

function goLogin() {
	uni.navigateTo({
		url: '/pages/login/login'
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

function onSlideChange(slideItem) {
	// TODO：替换欢迎页轮播切换回调
	console.log('welcome-slide-change', slideItem.id)
}
</script>

<style scoped>
.page-shell {
	position: relative;
	min-height: 100vh;
	background: #f8fafc;
	overflow: hidden;
}

.guide-swiper {
	height: 100vh;
}

.slide-item {
	position: relative;
	height: 100vh;
	overflow: hidden;
}

.slide-background-image {
	position: absolute;
	inset: -120rpx;
	width: calc(100% + 240rpx);
	height: calc(100% + 240rpx);
	transform: scale(1.08);
}

.slide-background-frost {
	position: absolute;
	inset: -200rpx;
	width: calc(100% + 400rpx);
	height: calc(100% + 400rpx);
	opacity: 0.5;
	transform: scale(1.18);
	filter: blur(42rpx);
}

.slide-background-mask {
	position: absolute;
	inset: -80rpx;
	background:
		linear-gradient(180deg, rgba(248, 250, 252, 0.08) 0%, rgba(248, 250, 252, 0.12) 24%, rgba(248, 250, 252, 0.38) 58%, rgba(248, 250, 252, 0.84) 100%),
		radial-gradient(circle at top right, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 34%);
}

.hero-copy {
	position: absolute;
	right: 40rpx;
	bottom: 248rpx;
	left: 40rpx;
	z-index: 2;
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
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.22) 100%);
	box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
	backdrop-filter: blur(22rpx);
	-webkit-backdrop-filter: blur(22rpx);
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
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.24) 100%);
	backdrop-filter: blur(26rpx);
	-webkit-backdrop-filter: blur(26rpx);
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
