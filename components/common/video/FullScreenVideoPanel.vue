<template>
	<view class="video-panel" :style="panelStyle">
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
				@loadedmetadata="handleVideoReady"
				@waiting="handleVideoWaiting"
				@play="handleVideoPlay"
				@pause="handleVideoPause"
				@ended="handleVideoEnded"
				@error="handleVideoError"
			/>
			<!-- #ifdef APP-PLUS || MP-WEIXIN -->
			<cover-view class="video-panel-stage-mask" @tap="handlePanelTap"></cover-view>
			<cover-view v-if="showPlayOverlay" class="video-panel-play-indicator" @tap="handlePanelTap">
				<cover-view class="video-panel-play-hint">▶</cover-view>
			</cover-view>
			<!-- #endif -->
			<!-- #ifndef APP-PLUS || MP-WEIXIN -->
			<view class="video-panel-stage-mask" @tap="handlePanelTap"></view>
			<view v-if="showPlayOverlay" class="video-panel-play-indicator" @tap="handlePanelTap">
				<text class="video-panel-play-hint">▶</text>
			</view>
			<!-- #endif -->
		</view>

		<!-- #ifdef APP-PLUS || MP-WEIXIN -->
		<cover-view
			v-if="showBack"
			class="video-panel-back-button"
			:style="backButtonStyle"
			@tap.stop="handleBackTap"
		>
			<cover-image class="video-panel-back-icon" :src="userSubPageLightBackIconSvg"></cover-image>
		</cover-view>

		<cover-view class="video-panel-action-rail" :style="actionRailStyle">
			<cover-view class="video-panel-avatar-action" @tap.stop="handleAuthorTap">
				<cover-view class="video-panel-avatar" :style="{ background: authorInfo.avatarBackground || defaultAvatarBackground }">
					<cover-view class="video-panel-avatar-text">{{ authorInfo.avatarText || defaultAvatarText }}</cover-view>
					<cover-view v-if="showFollowButton" class="video-panel-avatar-follow-badge">
						<cover-view class="video-panel-avatar-follow-text">+</cover-view>
					</cover-view>
				</cover-view>
			</cover-view>

			<cover-view
				v-for="action in actionList"
				:key="action.key"
				class="video-panel-action-button"
				@tap.stop="handleActionTap(action)"
			>
				<cover-image class="video-panel-action-icon" :src="action.icon"></cover-image>
				<cover-view class="video-panel-action-text">{{ action.count }}</cover-view>
			</cover-view>
		</cover-view>

		<cover-view class="video-panel-info" :style="infoStyle">
			<cover-view class="video-panel-author-row">
				<cover-view class="video-panel-author-name">@{{ authorInfo.nickname || '千隅同学' }}</cover-view>
			</cover-view>

			<cover-view class="video-panel-title">{{ videoValue.title || defaultTitle }}</cover-view>
			<cover-view class="video-panel-desc">{{ videoValue.desc || defaultDesc }}</cover-view>

			<cover-view class="video-panel-meta-row">
				<cover-view class="video-panel-meta-text">{{ videoValue.publishTimeText || '刚刚' }}</cover-view>
				<cover-view v-if="videoValue.playCountText" class="video-panel-meta-text">
					{{ videoValue.playCountText }} 次播放
				</cover-view>
			</cover-view>

			<cover-view class="video-panel-music-pill">
				<cover-view class="video-panel-music-text">♪ {{ videoValue.musicText || '原声 · 千隅内容推荐' }}</cover-view>
			</cover-view>
		</cover-view>
		<!-- #endif -->

		<!-- #ifndef APP-PLUS || MP-WEIXIN -->
		<view
			v-if="showBack"
			class="video-panel-back-button"
			:style="backButtonStyle"
			@tap.stop="handleBackTap"
		>
			<image class="video-panel-back-icon" :src="userSubPageLightBackIconSvg" mode="aspectFit" />
		</view>

		<view class="video-panel-action-rail" :style="actionRailStyle">
			<view class="video-panel-avatar-action" @tap.stop="handleAuthorTap">
				<view class="video-panel-avatar" :style="{ background: authorInfo.avatarBackground || defaultAvatarBackground }">
					<text class="video-panel-avatar-text">{{ authorInfo.avatarText || defaultAvatarText }}</text>
					<view v-if="showFollowButton" class="video-panel-avatar-follow-badge">
						<text class="video-panel-avatar-follow-text">+</text>
					</view>
				</view>
			</view>

			<view
				v-for="action in actionList"
				:key="action.key"
				class="video-panel-action-button"
				@tap.stop="handleActionTap(action)"
			>
				<image class="video-panel-action-icon" :src="action.icon" mode="aspectFit" />
				<text class="video-panel-action-text">{{ action.count }}</text>
			</view>
		</view>

		<view class="video-panel-info" :style="infoStyle">
			<view class="video-panel-author-row">
				<text class="video-panel-author-name">@{{ authorInfo.nickname || '千隅同学' }}</text>
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
		<!-- #endif -->
	</view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
	userCollectActionActiveIconSvg,
	userCollectActionOutlineIconSvg,
	userCommentActionOutlineIconSvg,
	userLikeActionOutlineIconSvg,
	userLikeStatActiveIconSvg,
	userShareActionIconSvg
} from '@/components/user-center/main/userContentIcons.js'
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

const emit = defineEmits([
	'back',
	'author-click',
	'action',
	'open-detail',
	'toggle-playback',
	'playback-change',
	'ready',
	'play',
	'pause',
	'ended',
	'error',
	'state-change'
])

const defaultAvatarBackground = 'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)'
const defaultAvatarText = '千'
const defaultTitle = '全屏视频内容标题占位'
const defaultDesc = '后续替换真实视频资源、作者信息与互动数据。'

const componentInstance = getCurrentInstance()
const internalPlaying = ref(false)
const desiredPlaying = ref(Boolean(props.activePlayback))
const playbackState = ref('idle')
const pendingCommand = ref('')
const readySourceKey = ref('')

let playbackContext = null
let playbackContextId = ''

const videoValue = computed(() => props.video || {})
const authorInfo = computed(() => videoValue.value.authorInfo || {})

const panelStyle = computed(() => ({
	height: props.heightPx > 0 ? `${props.heightPx}px` : '100%',
	background: videoValue.value.pageBackground || '#050505'
}))

const stageStyle = computed(() => ({
	background: videoValue.value.coverBackground || 'linear-gradient(135deg, #111827 0%, #030712 100%)'
}))

const resolvedVideoUrl = computed(() => videoValue.value.videoUrl || '')
const resolvedPosterUrl = computed(() => videoValue.value.posterUrl || videoValue.value.coverUrl || '')
const videoElementId = computed(() => {
	const targetId = videoValue.value.workId || videoValue.value.id || 'default'
	return `full-screen-video-${targetId}`
})

const backButtonStyle = computed(() => ({
	top: `${props.safeTopInsetRpx + 16}rpx`
}))

const actionRailStyle = computed(() => ({
	bottom: `${props.safeBottomInsetRpx + 150}rpx`
}))

const infoStyle = computed(() => ({
	paddingBottom: `${props.safeBottomInsetRpx + 34}rpx`
}))

const actionList = computed(() => {
	const customActionList = Array.isArray(videoValue.value.actionList) ? videoValue.value.actionList : []
	if (customActionList.length) {
		return customActionList.map((action, index) => ({
			key: action.key || `custom-${index}`,
			count: action.count || '',
			icon: action.icon || userShareActionIconSvg
		}))
	}

	return [
		{
			key: 'like',
			count: videoValue.value.likeCount || '1.2w',
			icon: videoValue.value.liked ? userLikeStatActiveIconSvg : userLikeActionOutlineIconSvg
		},
		{
			key: 'comment',
			count: videoValue.value.commentCount || '324',
			icon: userCommentActionOutlineIconSvg
		},
		{
			key: 'collect',
			count: videoValue.value.collectCount || videoValue.value.favoriteCount || '963',
			icon: videoValue.value.collected ? userCollectActionActiveIconSvg : userCollectActionOutlineIconSvg
		},
		{
			key: 'share',
			count: videoValue.value.shareCount || '分享',
			icon: userShareActionIconSvg
		}
	]
})

const showPlayOverlay = computed(() => props.showPlayHint && !internalPlaying.value)

watch(
	() => props.activePlayback,
	(value) => {
		desiredPlaying.value = Boolean(value)
		if (value) {
			void play()
			return
		}
		void pause()
	}
)

watch(
	() => `${videoElementId.value}|${resolvedVideoUrl.value}`,
	() => {
		resetPlaybackState(Boolean(props.activePlayback))
		if (desiredPlaying.value) {
			nextTick(() => {
				void play()
			})
		}
	},
	{
		immediate: true
	}
)

function resetPlaybackState(nextDesiredPlaying = false) {
	internalPlaying.value = false
	desiredPlaying.value = nextDesiredPlaying
	pendingCommand.value = ''
	readySourceKey.value = ''
	setPlaybackState(nextDesiredPlaying ? 'ready' : 'idle')
	if (playbackContextId !== videoElementId.value) {
		playbackContext = null
		playbackContextId = ''
	}
}

function getVideoContext() {
	if (!resolvedVideoUrl.value || !videoElementId.value) {
		return null
	}

	if (!playbackContext || playbackContextId !== videoElementId.value) {
		playbackContext = uni.createVideoContext(videoElementId.value, componentInstance?.proxy)
		playbackContextId = videoElementId.value
	}

	return playbackContext
}

function setPlaybackState(nextState) {
	if (playbackState.value === nextState) {
		return
	}

	playbackState.value = nextState
	emit('state-change', {
		video: videoValue.value,
		state: nextState,
		playing: internalPlaying.value
	})
}

function issuePlaybackCommand(action) {
	if (!resolvedVideoUrl.value) {
		return false
	}

	const videoContext = getVideoContext()
	if (!videoContext) {
		return false
	}

	if (pendingCommand.value === action) {
		return true
	}

	if (action === 'play' && internalPlaying.value) {
		return true
	}

	if (action === 'pause' && !internalPlaying.value && playbackState.value !== 'loading') {
		return true
	}

	pendingCommand.value = action
	setPlaybackState(action === 'play' ? 'loading' : 'paused')
	if (action === 'play') {
		videoContext.play?.()
		return true
	}

	videoContext.pause?.()
	return true
}

function play() {
	desiredPlaying.value = true
	return nextTick(() => issuePlaybackCommand('play'))
}

function pause() {
	desiredPlaying.value = false
	return nextTick(() => issuePlaybackCommand('pause'))
}

function togglePlayback() {
	emit('toggle-playback', videoValue.value)
	if (internalPlaying.value) {
		return pause()
	}

	return play()
}

function seekToStart() {
	const videoContext = getVideoContext()
	videoContext?.seek?.(0)
}

function replay() {
	seekToStart()
	return play()
}

function handlePanelTap() {
	if (props.playable) {
		void togglePlayback()
		return
	}

	if (props.allowOpenDetail) {
		emit('open-detail', videoValue.value)
	}
}

function handleBackTap() {
	emit('back')
}

function handleAuthorTap() {
	emit('author-click', videoValue.value)
}

function handleActionTap(action) {
	emit('action', {
		key: action.key,
		video: videoValue.value
	})
}

function handleVideoReady() {
	if (readySourceKey.value !== videoElementId.value) {
		readySourceKey.value = videoElementId.value
		setPlaybackState(internalPlaying.value ? 'playing' : 'ready')
		emit('ready', videoValue.value)
	}

	if (desiredPlaying.value && !internalPlaying.value) {
		void play()
	}
}

function handleVideoWaiting() {
	if (desiredPlaying.value) {
		setPlaybackState('loading')
	}
}

function handleVideoPlay() {
	pendingCommand.value = ''
	const wasPlaying = internalPlaying.value
	internalPlaying.value = true
	setPlaybackState('playing')
	if (!wasPlaying) {
		emit('play', videoValue.value)
		emit('playback-change', true)
	}
}

function handleVideoPause() {
	pendingCommand.value = ''
	const wasPlaying = internalPlaying.value
	internalPlaying.value = false
	setPlaybackState(desiredPlaying.value ? 'ready' : 'paused')
	if (wasPlaying) {
		emit('pause', videoValue.value)
		emit('playback-change', false)
	}
}

function handleVideoEnded() {
	pendingCommand.value = ''
	internalPlaying.value = false
	desiredPlaying.value = false
	setPlaybackState('ended')
	emit('ended', videoValue.value)
	emit('playback-change', false)
}

function handleVideoError(event) {
	pendingCommand.value = ''
	internalPlaying.value = false
	desiredPlaying.value = false
	setPlaybackState('error')
	emit('error', {
		video: videoValue.value,
		event
	})
	emit('playback-change', false)
}

defineExpose({
	play,
	pause,
	togglePlayback,
	seekToStart,
	replay,
	getPlaybackState() {
		return {
			playing: internalPlaying.value,
			desiredPlaying: desiredPlaying.value,
			state: playbackState.value
		}
	}
})

onBeforeUnmount(() => {
	playbackContext = null
	playbackContextId = ''
})
</script>

<style scoped>
.video-panel {
	position: relative;
	width: 100%;
	overflow: hidden;
}

.video-panel-stage {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
}

.video-panel-player {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.video-panel-stage-mask {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background:
		linear-gradient(180deg, rgba(3, 7, 18, 0.14) 0%, rgba(3, 7, 18, 0.04) 18%, rgba(3, 7, 18, 0) 36%),
		linear-gradient(180deg, rgba(3, 7, 18, 0) 48%, rgba(3, 7, 18, 0.18) 70%, rgba(3, 7, 18, 0.78) 100%);
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
	background: rgba(15, 23, 42, 0.26);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.video-panel-play-hint {
	font-size: 70rpx;
	line-height: 1;
	color: rgba(255, 255, 255, 0.82);
}

.video-panel-back-button {
	position: absolute;
	left: 24rpx;
	z-index: 4;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 76rpx;
	height: 76rpx;
	border-radius: 50%;
	background: rgba(15, 23, 42, 0.2);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.video-panel-back-icon {
	width: 36rpx;
	height: 36rpx;
}

.video-panel-action-rail {
	position: absolute;
	right: 18rpx;
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
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	border: 3rpx solid rgba(255, 255, 255, 0.94);
}

.video-panel-avatar-text {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #ffffff;
}

.video-panel-avatar-follow-badge {
	position: absolute;
	right: 50%;
	bottom: -14rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40rpx;
	height: 40rpx;
	margin-right: -20rpx;
	border-radius: 50%;
	background: #fe2c55;
	border: 3rpx solid #ffffff;
}

.video-panel-avatar-follow-text {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 28rpx;
	color: #ffffff;
}

.video-panel-action-button + .video-panel-action-button {
	margin-top: 24rpx;
}

.video-panel-action-icon {
	width: 72rpx;
	height: 72rpx;
}

.video-panel-action-text {
	margin-top: 10rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: rgba(255, 255, 255, 0.96);
}

.video-panel-info {
	position: absolute;
	right: 146rpx;
	bottom: 0;
	left: 28rpx;
	z-index: 3;
}

.video-panel-author-row {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.video-panel-author-name {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #ffffff;
}

.video-panel-title {
	display: block;
	font-size: 34rpx;
	font-weight: 700;
	line-height: 48rpx;
	color: #ffffff;
	white-space: pre-wrap;
}

.video-panel-desc {
	display: block;
	margin-top: 12rpx;
	font-size: 25rpx;
	line-height: 38rpx;
	color: rgba(255, 255, 255, 0.9);
	white-space: pre-wrap;
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
	color: rgba(255, 255, 255, 0.68);
}

.video-panel-meta-text + .video-panel-meta-text {
	margin-left: 18rpx;
}

.video-panel-music-pill {
	display: inline-flex;
	align-items: center;
	max-width: 100%;
	height: 48rpx;
	padding: 0 18rpx;
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
