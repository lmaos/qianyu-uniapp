<template>
	<view class="live-banner">
		<swiper
			class="banner-swiper"
			circular
			:autoplay="shouldAutoplay"
			:interval="interval"
			:duration="duration"
			:current="bannerCurrent"
			@change="handleChange"
		>
			<swiper-item v-for="(item, index) in banners" :key="item.id || index">
				<view class="banner-card" :style="{ background: item.background }" @tap="handleItemClick(item, index)">
					<view class="banner-glow"></view>
					<view class="banner-content">
						<view class="banner-badge">{{ item.badge }}</view>
						<text class="banner-title">{{ item.title }}</text>
						<text class="banner-desc">{{ item.desc }}</text>
					</view>
				</view>
			</swiper-item>
		</swiper>

		<view class="banner-indicators">
			<view
				v-for="(item, index) in banners"
				:key="item.id || index"
				:class="['banner-dot', bannerCurrent === index ? 'banner-dot-active' : '']"
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
	banners: {
		type: Array,
		default: () => []
	},
	interval: {
		type: Number,
		default: 3000
	},
	duration: {
		type: Number,
		default: 500
	}
})

const emit = defineEmits(['change', 'item-click'])
const bannerCurrent = ref(0)

// 仅在直播页真正激活时自动轮播，避免隐藏页面继续占用系统资源。
const shouldAutoplay = computed(() => {
	return props.active && props.banners.length > 1
})

// 记录当前轮播索引，并把切换后的 Banner 信息抛给父组件。
function handleChange(event) {
	bannerCurrent.value = event.detail.current || 0
	emit('change', {
		index: bannerCurrent.value,
		item: props.banners[bannerCurrent.value] || null
	})
}

// 透传当前 Banner 项点击事件。
function handleItemClick(item, index) {
	emit('item-click', {
		item,
		index
	})
}
</script>

<style scoped>
.live-banner {
	position: relative;
}

.banner-swiper {
	height: 256rpx;
	border-radius: 32rpx;
	overflow: hidden;
}

.banner-card {
	position: relative;
	height: 256rpx;
	padding: 24rpx 26rpx;
	border-radius: 32rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.12);
	box-shadow: 0 24rpx 48rpx rgba(0, 0, 0, 0.22);
	overflow: hidden;
}

.banner-glow {
	position: absolute;
	top: -40rpx;
	right: -30rpx;
	width: 220rpx;
	height: 220rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 72%);
}

.banner-content {
	position: relative;
	z-index: 1;
}

.banner-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 42rpx;
	padding: 0 16rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.16);
	border: 1rpx solid rgba(255, 255, 255, 0.18);
	font-size: 20rpx;
	color: #ffffff;
}

.banner-title {
	display: block;
	margin-top: 54rpx;
	font-size: 34rpx;
	font-weight: 600;
	line-height: 44rpx;
	color: #ffffff;
}

.banner-desc {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: rgba(255, 255, 255, 0.82);
}

.banner-indicators {
	position: absolute;
	right: 18rpx;
	bottom: 18rpx;
	z-index: 3;
	display: flex;
	align-items: center;
	padding: 8rpx 10rpx;
	border-radius: 999rpx;
	background: rgba(9, 11, 18, 0.26);
	backdrop-filter: blur(14rpx);
	-webkit-backdrop-filter: blur(14rpx);
}

.banner-dot {
	width: 10rpx;
	height: 10rpx;
	margin: 0 5rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.28);
}

.banner-dot-active {
	width: 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff84ad 0%, #ffc77b 100%);
}
</style>
