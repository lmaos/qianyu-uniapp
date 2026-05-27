<template>
	<view class="shop-recommend-banner">
		<swiper
			class="shop-recommend-banner-swiper"
			circular
			:autoplay="shouldAutoplay"
			interval="3600"
			duration="420"
			@change="handleChange"
		>
			<swiper-item v-for="item in bannerList" :key="item.id">
				<view class="shop-recommend-banner-item" @tap="handleBannerTap(item)">
					<image class="shop-recommend-banner-image" :src="item.image" mode="aspectFill" />
					<view class="shop-recommend-banner-overlay">
						<view class="shop-recommend-banner-content">
							<view v-if="item.tagText" class="shop-recommend-banner-tag">{{ item.tagText }}</view>
							<text class="shop-recommend-banner-title">{{ item.title }}</text>
							<text class="shop-recommend-banner-desc">{{ item.desc }}</text>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>

		<view class="shop-recommend-banner-indicator">
			<view
				v-for="(item, index) in bannerList"
				:key="item.id"
				:class="['shop-recommend-banner-dot', currentIndex === index ? 'shop-recommend-banner-dot-active' : '']"
			></view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
	active: {
		type: Boolean,
		default: false
	},
	bannerList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['banner-click', 'banner-change'])
const currentIndex = ref(0)

// 只有当前商城推荐页激活时才启动自动轮播，离开页面后立即停止占用资源。
const shouldAutoplay = computed(() => {
	return props.active && props.bannerList.length > 1
})

// 记录当前轮播位置，供指示器同步。
function handleChange(event) {
	currentIndex.value = Number(event?.detail?.current || 0)
	emit('banner-change', props.bannerList[currentIndex.value] || null)
}

// Banner 点击继续透传给推荐页。
function handleBannerTap(item) {
	emit('banner-click', item)
}
</script>

<style scoped>
.shop-recommend-banner {
	position: relative;
	margin-bottom: 8rpx;
}

.shop-recommend-banner-swiper {
	height: 220rpx;
}

.shop-recommend-banner-item {
	position: relative;
	height: 220rpx;
	border-radius: 32rpx;
	overflow: hidden;
	box-shadow: 0 18rpx 42rpx rgba(255, 163, 184, 0.16);
}

.shop-recommend-banner-image {
	display: block;
	width: 100%;
	height: 100%;
}

.shop-recommend-banner-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(90deg, rgba(15, 23, 42, 0.22) 0%, rgba(15, 23, 42, 0.08) 52%, rgba(15, 23, 42, 0.04) 100%);
}

.shop-recommend-banner-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
	padding: 0 26rpx;
	box-sizing: border-box;
}

.shop-recommend-banner-tag {
	display: inline-flex;
	align-items: center;
	align-self: flex-start;
	height: 38rpx;
	padding: 0 16rpx;
	margin-bottom: 10rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.34);
	font-size: 18rpx;
	font-weight: 600;
	line-height: 24rpx;
	color: rgba(255, 255, 255, 0.96);
}

.shop-recommend-banner-title {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #ffffff;
}

.shop-recommend-banner-desc {
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: rgba(255, 255, 255, 0.88);
}

.shop-recommend-banner-indicator {
	position: absolute;
	right: 18rpx;
	bottom: 18rpx;
	z-index: 3;
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 10rpx;
	border-radius: 999rpx;
	background: rgba(17, 24, 39, 0.2);
}

.shop-recommend-banner-dot {
	width: 10rpx;
	height: 10rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.36);
}

.shop-recommend-banner-dot-active {
	width: 22rpx;
	background: linear-gradient(135deg, #ff8aa5 0%, #ffb287 100%);
}
</style>
