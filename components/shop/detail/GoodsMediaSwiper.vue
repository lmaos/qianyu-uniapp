<template>
	<view class="goods-media-swiper">
		<swiper class="goods-media-swiper-host" circular :current="currentIndex" @change="handleChange">
			<swiper-item v-for="(item, index) in mediaList" :key="item.id">
				<view class="goods-media-slide" @tap="handleTap(item)">
					<template v-if="item.type === 'video'">
						<video
							v-if="activeVideoId === item.id && currentIndex === index"
							:id="resolveVideoId(item)"
							class="goods-media-video"
							:src="item.url"
							:poster="item.poster || ''"
							object-fit="cover"
							:controls="false"
							autoplay
							:show-center-play-btn="false"
							:enable-progress-gesture="false"
							@pause="handleVideoExit"
							@ended="handleVideoExit"
						></video>
						<view v-else class="goods-media-video-poster" @tap.stop="handleVideoPlay(item)">
							<image v-if="item.poster" class="goods-media-image" :src="item.poster" mode="aspectFill"></image>
							<view
								v-else
								class="goods-media-image goods-media-image-placeholder"
								:style="{ background: item.background }"
							>
								<text class="goods-media-image-text">{{ item.label || '视频封面' }}</text>
							</view>
							<view class="goods-media-video-play">
								<view class="goods-media-video-play-icon"></view>
							</view>
						</view>
					</template>
					<image v-else-if="item.url" class="goods-media-image" :src="item.url" mode="aspectFill"></image>
					<view v-else class="goods-media-image goods-media-image-placeholder" :style="{ background: item.background }">
						<text class="goods-media-image-text">{{ item.label || '商品图' }}</text>
					</view>
				</view>
			</swiper-item>
		</swiper>

		<view class="goods-media-indicator">
			{{ currentIndex + 1 }}/{{ mediaList.length || 1 }}
		</view>
	</view>
</template>

<script setup>
import { getCurrentInstance, nextTick, ref, watch } from 'vue'

const props = defineProps({
	mediaList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['media-change', 'media-click'])
const currentIndex = ref(0)
const activeVideoId = ref('')
const componentInstance = getCurrentInstance()

watch(
	() => props.mediaList,
	() => {
		currentIndex.value = 0
		activeVideoId.value = ''
	},
	{
		deep: true
	}
)

// 轮播切换时，同步当前素材信息给父层。
function handleChange(event) {
	stopPlayback()
	currentIndex.value = Number(event?.detail?.current || 0)
	emit('media-change', props.mediaList[currentIndex.value] || null)
}

// 点击当前素材时透传给父层，后续可接全屏预览或埋点。
function handleTap(mediaItem) {
	emit('media-click', mediaItem)
}

// 点击视频封面后，再真正进入视频播放态，避免 video 组件直接抢占横向滑动手势。
function handleVideoPlay(mediaItem) {
	activeVideoId.value = mediaItem?.id || ''
	emit('media-click', mediaItem)
	nextTick(() => {
		const videoId = resolveVideoId(mediaItem)
		if (!videoId) {
			return
		}

		const videoContext = uni.createVideoContext(videoId, componentInstance?.proxy)
		videoContext?.play?.()
	})
}

// 离开播放态后回到封面图展示。
function handleVideoExit() {
	stopPlayback()
}

// 统一停止当前视频播放，并把播放态恢复为封面图。
function stopPlayback() {
	activeVideoId.value = ''
}

function resolveVideoId(mediaItem) {
	return mediaItem?.id ? `goods-media-video-${mediaItem.id}` : ''
}

defineExpose({
	stopPlayback
})
</script>

<style scoped>
.goods-media-swiper {
	position: relative;
}

.goods-media-swiper-host {
	height: 620rpx;
	border-radius: 36rpx;
	overflow: hidden;
}

.goods-media-slide {
	position: relative;
	height: 100%;
}

.goods-media-video,
.goods-media-image {
	width: 100%;
	height: 100%;
}

.goods-media-image-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
}

.goods-media-video-poster {
	position: relative;
	height: 100%;
}

.goods-media-image-text {
	font-size: 56rpx;
	font-weight: 700;
	line-height: 64rpx;
	letter-spacing: 8rpx;
	color: rgba(17, 24, 39, 0.72);
}

.goods-media-indicator {
	position: absolute;
	right: 20rpx;
	bottom: 20rpx;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #ffffff;
	background: rgba(17, 24, 39, 0.58);
}

.goods-media-video-play {
	position: absolute;
	left: 50%;
	top: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 132rpx;
	height: 132rpx;
	margin-top: -66rpx;
	margin-left: -66rpx;
	border-radius: 999rpx;
	background: rgba(17, 24, 39, 0.28);
	backdrop-filter: blur(8rpx);
	-webkit-backdrop-filter: blur(8rpx);
}

.goods-media-video-play-icon {
	margin-left: 10rpx;
	width: 0;
	height: 0;
	border-top: 22rpx solid transparent;
	border-bottom: 22rpx solid transparent;
	border-left: 36rpx solid #ffffff;
}

</style>
