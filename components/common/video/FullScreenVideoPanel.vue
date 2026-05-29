<template>
	<view class="video-panel" :style="panelStyle" @tap="handlePanelTap">
		<view class="video-panel-stage" :style="stageStyle">
			<video
				v-if="resolvedVideoUrl"
				:id="videoElementId"
				class="video-panel-player"
				:src="resolvedVideoUrl"
				:poster="resolvedPosterUrl"
				object-fit="cover"
				:controls="false"
				:show-play-btn="false"
				:show-center-play-btn="false"
				:show-fullscreen-btn="false"
				:enable-progress-gesture="false"
				:loop="loopPlayback"
				:muted="mutedPlayback"
				@play="handleVideoPlay"
				@pause="handleVideoPause"
				@ended="handleVideoEnded"
			/>
			<view class="video-panel-stage-mask"></view>
			<view v-if="showPlayOverlay" class="video-panel-play-indicator">
				<text class="video-panel-play-hint">▶</text>
			</view>
		</view>

		<view
			v-if="showBack"
			class="video-panel-back-button"
			:style="backButtonStyle"
			@tap.stop="emit('back')"
		>
			<image class="video-panel-back-icon" :src="userSubPageLightBackIconSvg" mode="aspectFit" />
		</view>

		<view class="video-panel-action-rail" :style="actionRailStyle">
			<view class="video-panel-avatar-action" @tap.stop="emit('author-click', videoValue)">
				<view class="video-panel-avatar" :style="{ background: authorInfo.avatarBackground || defaultAvatarBackground }">
					<text class="video-panel-avatar-text">{{ authorInfo.avatarText || defaultAvatarText }}</text>
				</view>
			</view>

			<view
				v-for="action in actionList"
				:key="action.key"
				class="video-panel-action-button"
				@tap.stop="emit('action', { key: action.key, video: videoValue })"
			>
				<view class="video-panel-action-icon-wrap">
					<image class="video-panel-action-icon" :src="action.icon" mode="aspectFit" />
				</view>
				<text class="video-panel-action-text">{{ action.count }}</text>
			</view>
		</view>

		<view class="video-panel-info" :style="infoStyle">
			<view class="video-panel-author-row">
				<text class="video-panel-author-name">@{{ authorInfo.nickname || '千隅同学' }}</text>
				<view v-if="showFollowButton" class="video-panel-follow-button" @tap.stop="emit('author-click', videoValue)">
					<text class="video-panel-follow-text">关注</text>
				</view>
			</view>

			<text class="video-panel-title">{{ videoValue.title || defaultTitle }}</text>
			<text class="video-panel-desc">{{ videoValue.desc || defaultDesc }}</text>

			<view class="video-panel-meta-row">
				<text class="video-panel-meta-text">{{ videoValue.publishTimeText || '刚刚' }}</text>
				<text v-if="videoValue.playCountText" class="video-panel-meta-text">{{ videoValue.playCountText }} 次播放</text>
			</view>

			<view class="video-panel-music-pill">
				<text class="video-panel-music-text">♪ {{ videoValue.musicText || '原声 · 千隅内容推荐' }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import {
	userCommentStatIconSvg,
	userLikeStatIconSvg,
	userShareStatIconSvg
} from '@/components/user-center/main/UserContentIcons.js'
import { userSubPageLightBackIconSvg } from '@/components/user-center/common/userSubPageSurface.js'

const props = defineProps({
	video: {
		type: Object,
		default: () => ({})
	},
	heightPx: {
		type: Number,
		default: 0
	},
	safeTopInsetRpx: {
		type: Number,
		default: 0
	},
	safeBottomInsetRpx: {
		type: Number,
		default: 24
	},
	showBack: {
		type: Boolean,
		default: false
	},
	showFollowButton: {
		type: Boolean,
		default: false
	},
	showPlayHint: {
		type: Boolean,
		default: true
	},
	activePlayback: {
		type: Boolean,
		default: false
	},
	playable: {
		type: Boolean,
		default: false
	},
	mutedPlayback: {
		type: Boolean,
		default: false
	},
	loopPlayback: {
		type: Boolean,
		default: true
	},
	allowOpenDetail: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['back', 'author-click', 'action', 'open-detail', 'toggle-playback', 'playback-change'])

const defaultAvatarBackground = 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)'
const defaultAvatarText = '千'
const defaultTitle = '全屏视频内容标题占位'
const defaultDesc = '后续替换真实视频资源、作者信息与互动数据。'
const componentInstance = getCurrentInstance()
const internalPlaying = ref(false)

const videoValue = computed(() => {
	return props.video || {}
})

const authorInfo = computed(() => {
	return videoValue.value.authorInfo || {}
})

const panelStyle = computed(() => {
	return {
		height: props.heightPx > 0 ? `${props.heightPx}px` : '100%',
		background: videoValue.value.pageBackground || '#050505'
	}
})

const stageStyle = computed(() => {
	return {
		background: videoValue.value.coverBackground || 'linear-gradient(135deg, #111827 0%, #030712 100%)'
	}
})

const resolvedVideoUrl = computed(() => {
	return videoValue.value.videoUrl || ''
})

const resolvedPosterUrl = computed(() => {
	return videoValue.value.posterUrl || videoValue.value.coverUrl || ''
})

const videoElementId = computed(() => {
	const targetId = videoValue.value.workId || videoValue.value.id || 'default'
	return `full-screen-video-${targetId}`
})

const backButtonStyle = computed(() => {
	return {
		top: `${props.safeTopInsetRpx + 16}rpx`
	}
})

const actionRailStyle = computed(() => {
	return {
		bottom: `${props.safeBottomInsetRpx + 132}rpx`
	}
})

const infoStyle = computed(() => {
	return {
		paddingBottom: `${props.safeBottomInsetRpx + 34}rpx`
	}
})

const actionList = computed(() => {
	return [
		{ key: 'like', count: videoValue.value.likeCount || '1.2w', icon: userLikeStatIconSvg },
		{ key: 'comment', count: videoValue.value.commentCount || '324', icon: userCommentStatIconSvg },
		{ key: 'share', count: videoValue.value.shareCount || '分享', icon: userShareStatIconSvg }
	]
})

const showPlayOverlay = computed(() => {
	return props.showPlayHint && (!props.playable || !internalPlaying.value)
})

watch(
	() => [props.activePlayback, resolvedVideoUrl.value, videoElementId.value],
	() => {
		syncPlaybackState()
	},
	{
		immediate: true
	}
)

function handlePanelTap() {
	if (props.playable) {
		emit('toggle-playback', videoValue.value)
		return
	}

	if (!props.allowOpenDetail) {
		return
	}

	emit('open-detail', videoValue.value)
}

function syncPlaybackState() {
	if (!resolvedVideoUrl.value || !videoElementId.value) {
		internalPlaying.value = false
		return
	}

	nextTick(() => {
		const videoContext = uni.createVideoContext(videoElementId.value, componentInstance?.proxy)
		if (!videoContext) {
			return
		}

		if (props.activePlayback) {
			videoContext.play?.()
			return
		}

		internalPlaying.value = false
		videoContext.pause?.()
	})
}

function handleVideoPlay() {
	internalPlaying.value = true
	if (!props.activePlayback) {
		emit('playback-change', true)
	}
}

function handleVideoPause() {
	internalPlaying.value = false
	if (props.activePlayback) {
		emit('playback-change', false)
	}
}

function handleVideoEnded() {
	internalPlaying.value = false
	emit('playback-change', false)
}
</script>

<style scoped>
.video-panel {
	position: relative;
	width: 100%;
	overflow: hidden;
}

.video-panel-stage {
	position: absolute;
	inset: 0;
}

.video-panel-player {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
}

.video-panel-stage-mask {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(180deg, rgba(3, 7, 18, 0.12) 0%, rgba(3, 7, 18, 0.04) 20%, rgba(3, 7, 18, 0) 38%),
		linear-gradient(180deg, rgba(3, 7, 18, 0) 44%, rgba(3, 7, 18, 0.22) 70%, rgba(3, 7, 18, 0.82) 100%);
}

.video-panel-play-indicator {
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 118rpx;
	height: 118rpx;
	transform: translate(-50%, -50%);
	border-radius: 50%;
	background: rgba(15, 23, 42, 0.24);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.video-panel-play-hint {
	font-size: 70rpx;
	line-height: 1;
	color: rgba(255, 255, 255, 0.82);
	text-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.26);
}

.video-panel-back-button {
	position: absolute;
	left: 24rpx;
	z-index: 4;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: rgba(15, 23, 42, 0.22);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.video-panel-back-icon {
	width: 34rpx;
	height: 34rpx;
}

.video-panel-action-rail {
	position: absolute;
	right: 20rpx;
	z-index: 3;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.video-panel-avatar-action,
.video-panel-action-button {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.video-panel-avatar-action {
	margin-bottom: 34rpx;
}

.video-panel-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	border: 3rpx solid rgba(255, 255, 255, 0.88);
	box-shadow: 0 12rpx 32rpx rgba(3, 7, 18, 0.18);
}

.video-panel-avatar-text {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #ffffff;
}

.video-panel-action-button + .video-panel-action-button {
	margin-top: 28rpx;
}

.video-panel-action-icon-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background: rgba(15, 23, 42, 0.14);
}

.video-panel-action-icon {
	width: 54rpx;
	height: 54rpx;
}

.video-panel-action-text {
	margin-top: 12rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: rgba(255, 255, 255, 0.92);
}

.video-panel-info {
	position: absolute;
	right: 142rpx;
	bottom: 0;
	left: 28rpx;
	z-index: 3;
}

.video-panel-author-row {
	display: flex;
	align-items: center;
	margin-bottom: 18rpx;
}

.video-panel-author-name {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #ffffff;
}

.video-panel-follow-button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 22rpx;
	margin-left: 18rpx;
	border-radius: 999rpx;
	background: #fe2c55;
}

.video-panel-follow-text {
	font-size: 24rpx;
	font-weight: 700;
	line-height: 32rpx;
	color: #ffffff;
}

.video-panel-title {
	display: block;
	font-size: 34rpx;
	font-weight: 700;
	line-height: 48rpx;
	color: #ffffff;
}

.video-panel-desc {
	display: block;
	margin-top: 12rpx;
	font-size: 25rpx;
	line-height: 38rpx;
	color: rgba(255, 255, 255, 0.9);
}

.video-panel-meta-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	margin-top: 14rpx;
}

.video-panel-meta-text {
	font-size: 22rpx;
	line-height: 32rpx;
	color: rgba(255, 255, 255, 0.66);
}

.video-panel-meta-text + .video-panel-meta-text {
	margin-left: 18rpx;
}

.video-panel-music-pill {
	display: inline-flex;
	align-items: center;
	max-width: 100%;
	padding: 0 18rpx;
	height: 48rpx;
	margin-top: 18rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.12);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.video-panel-music-text {
	max-width: 100%;
	font-size: 22rpx;
	line-height: 30rpx;
	color: rgba(255, 255, 255, 0.92);
}
</style>
