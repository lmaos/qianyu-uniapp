<template>
	<view class="video-detail-page" :style="pageStyle">
		<view class="video-detail-header" :style="{ paddingTop: `${safeTopInsetRpx}rpx` }">
			<view class="video-detail-header-side">
				<view class="video-detail-back-button" @tap="handleBack">
					<image class="video-detail-back-icon" :src="userSubPageBackIconSvg" mode="aspectFit" />
				</view>
			</view>
			<text class="video-detail-header-title">作品详情</text>
			<view class="video-detail-header-side"></view>
		</view>

		<scroll-view scroll-y enable-flex show-scrollbar="false" class="video-detail-scroll" :style="scrollContentStyle">
			<view class="video-detail-stage-card" :style="surfaceCardStyle">
				<view class="video-detail-stage" :style="{ background: pageMock.coverBackground }">
					<view class="video-detail-play-badge">视频作品</view>
					<view class="video-detail-play-icon">▶</view>
				</view>
			</view>

			<view class="video-detail-meta-card" :style="surfaceCardStyle">
				<view class="video-detail-author-row" @tap="handleAuthorClick">
					<view class="video-detail-avatar" :style="{ background: pageMock.authorInfo.avatarBackground }">
						<text class="video-detail-avatar-text">{{ pageMock.authorInfo.avatarText }}</text>
					</view>

					<view class="video-detail-author-meta">
						<text class="video-detail-author-name">{{ pageMock.authorInfo.nickname }}</text>
						<text class="video-detail-author-desc">个人作品详情页占位，后续可替换真实视频资源与互动面板。</text>
					</view>
				</view>

				<text class="video-detail-title">{{ pageMock.title }}</text>
				<text class="video-detail-desc">{{ pageMock.desc }}</text>

				<view class="video-detail-action-row">
					<view class="video-detail-action" @tap="handleAction('like')">
						<view class="video-detail-action-icon-wrap">
							<image class="video-detail-action-icon" :src="userLikeStatDarkIconSvg" mode="aspectFit" />
						</view>
						<text class="video-detail-action-text">{{ pageMock.likeCount }}</text>
					</view>

					<view class="video-detail-action" @tap="handleAction('comment')">
						<view class="video-detail-action-icon-wrap">
							<image class="video-detail-action-icon" :src="userCommentStatDarkIconSvg" mode="aspectFit" />
						</view>
						<text class="video-detail-action-text">{{ pageMock.commentCount }}</text>
					</view>

					<view class="video-detail-action" @tap="handleAction('share')">
						<view class="video-detail-action-icon-wrap">
							<image class="video-detail-action-icon" :src="userShareStatDarkIconSvg" mode="aspectFit" />
						</view>
						<text class="video-detail-action-text">{{ pageMock.workInfo.shareCount }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import {
	userCommentStatDarkIconSvg,
	userLikeStatDarkIconSvg,
	userShareStatDarkIconSvg
} from '@/components/user-center/main/userContentIcons.js'
import {
	USER_SUB_PAGE_BACKGROUND,
	USER_SUB_PAGE_CARD_BACKGROUND,
	userSubPageBackIconSvg
} from '@/components/user-center/common/userSubPageSurface.js'
import { getVideoDetailPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getVideoDetailPageMock())
const { safeTopPx, safeBottomPx, pxToRpx } = useSafeAreaMetrics()

const safeTopInsetRpx = computed(() => Math.max(0, pxToRpx(safeTopPx.value)))
const safeBottomInsetRpx = computed(() => Math.max(20, pxToRpx(safeBottomPx.value)))
const pageStyle = computed(() => ({
	background: USER_SUB_PAGE_BACKGROUND
}))
const scrollContentStyle = computed(() => ({
	paddingTop: `${safeTopInsetRpx.value + 112}rpx`,
	paddingRight: '24rpx',
	paddingBottom: `${safeBottomInsetRpx.value + 32}rpx`,
	paddingLeft: '24rpx',
	boxSizing: 'border-box'
}))
const surfaceCardStyle = computed(() => ({
	background: USER_SUB_PAGE_CARD_BACKGROUND
}))

onLoad((options) => {
	pageMock.value = getVideoDetailPageMock(options?.workId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleAuthorClick() {
	onAuthorClick(pageMock.value.authorInfo)
	uni.showToast({
		title: '作者资料占位',
		icon: 'none'
	})
}

function handleAction(actionKey) {
	onVideoAction(actionKey)
	uni.showToast({
		title: '视频交互占位',
		icon: 'none'
	})
}

function onAuthorClick(authorInfo) {
	// TODO：替换视频作者资料逻辑
	console.log('user-video-author-click', authorInfo.userId)
}

function onVideoAction(actionKey) {
	// TODO：替换视频点赞评论分享逻辑
	console.log('user-video-action', actionKey)
}
</script>

<style scoped>
.video-detail-page {
	position: relative;
	height: 100vh;
	overflow: hidden;
}

.video-detail-header {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 3;
	display: flex;
	align-items: center;
	padding-right: 24rpx;
	padding-left: 24rpx;
	height: 88rpx;
	background: rgba(248, 250, 252, 0.92);
	border-bottom: 1rpx solid rgba(226, 232, 240, 0.72);
	box-shadow: 0 10rpx 28rpx rgba(148, 163, 184, 0.06);
}

.video-detail-header-side {
	display: flex;
	align-items: center;
	min-width: 96rpx;
	min-height: 64rpx;
}

.video-detail-back-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.88);
	border: 1rpx solid rgba(255, 255, 255, 0.94);
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.1);
}

.video-detail-back-icon {
	width: 30rpx;
	height: 30rpx;
}

.video-detail-header-title {
	flex: 1;
	text-align: center;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.video-detail-scroll {
	height: 100%;
}

.video-detail-stage-card,
.video-detail-meta-card {
	border-radius: 32rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 40rpx rgba(148, 163, 184, 0.1);
}

.video-detail-meta-card {
	margin-top: 20rpx;
	padding: 28rpx 24rpx 30rpx;
}

.video-detail-stage {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 820rpx;
	border-radius: 32rpx;
	overflow: hidden;
}

.video-detail-play-badge {
	position: absolute;
	top: 24rpx;
	left: 24rpx;
	padding: 10rpx 20rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.24);
	font-size: 22rpx;
	line-height: 30rpx;
	color: #ffffff;
}

.video-detail-play-icon {
	margin-top: 28rpx;
	font-size: 120rpx;
	line-height: 120rpx;
	color: rgba(255, 255, 255, 0.92);
}

.video-detail-author-row {
	display: flex;
	align-items: center;
}

.video-detail-author-meta {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.video-detail-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 86rpx;
	height: 86rpx;
	border-radius: 50%;
	box-shadow: 0 12rpx 24rpx rgba(148, 163, 184, 0.16);
	flex-shrink: 0;
}

.video-detail-avatar-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.video-detail-author-name,
.video-detail-author-desc,
.video-detail-title,
.video-detail-desc {
	display: block;
}

.video-detail-author-name {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #0f172a;
}

.video-detail-author-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #64748b;
}

.video-detail-title {
	margin-top: 24rpx;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.video-detail-desc {
	margin-top: 14rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #475467;
}

.video-detail-action-row {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12rpx;
	margin-top: 24rpx;
}

.video-detail-action {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 12rpx 18rpx;
	border-radius: 24rpx;
	background: rgba(248, 250, 252, 0.92);
}

.video-detail-action-icon-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: inset 0 0 0 1rpx rgba(226, 232, 240, 0.88);
}

.video-detail-action-icon {
	width: 34rpx;
	height: 34rpx;
}

.video-detail-action-text {
	margin-top: 12rpx;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #475467;
}
</style>
