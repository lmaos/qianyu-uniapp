<template>
	<view class="playmate-page">
		<view class="playmate-page-background playmate-page-background-left"></view>
		<view class="playmate-page-background playmate-page-background-right"></view>
		<view
			:class="[
				'playmate-float-bar',
				floatBarActive ? 'playmate-float-bar-active' : '',
				pressedCardKey === 'float-bar' ? 'playmate-pressable-active' : ''
			]"
			:style="floatBarStyle"
			@touchstart="handlePressStart('float-bar')"
			@touchend="handlePressEnd('float-bar')"
			@touchcancel="handlePressEnd('float-bar')"
			@tap="handleFloatBarTap"
		>
			<view class="playmate-float-bar-wave">
				<view class="playmate-float-bar-line playmate-float-bar-line-a"></view>
				<view class="playmate-float-bar-line playmate-float-bar-line-b"></view>
				<view class="playmate-float-bar-line playmate-float-bar-line-c"></view>
			</view>
			<view class="playmate-float-bar-copy">
				<text class="playmate-float-bar-title">{{ pageMock.floatingBar.title }}</text>
				<text class="playmate-float-bar-desc">{{ pageMock.floatingBar.desc }}</text>
			</view>
			<view class="playmate-float-bar-action">{{ pageMock.floatingBar.actionText }}</view>
		</view>

		<scroll-view scroll-y enable-flex show-scrollbar="false" class="playmate-scroll">
			<view class="playmate-content" :style="contentStyle">
				<view class="playmate-hero">
					<view class="playmate-hero-copy">
						<text class="playmate-hero-eyebrow">{{ pageMock.heroInfo.eyebrow }}</text>
						<text class="playmate-hero-title">{{ pageMock.heroInfo.title }}</text>
						<text class="playmate-hero-desc">{{ pageMock.heroInfo.desc }}</text>
					</view>

					<view class="playmate-hero-orbit">
						<view class="playmate-orbit-bubble playmate-orbit-bubble-a">等共鸣</view>
						<view class="playmate-orbit-bubble playmate-orbit-bubble-b">慢慢熟</view>
						<view class="playmate-orbit-core">小窝</view>
					</view>
				</view>

				<view class="playmate-overview-card">
					<view v-for="item in pageMock.overviewStatList" :key="item.key" class="playmate-overview-item">
						<text class="playmate-overview-value">{{ item.value }}</text>
						<text class="playmate-overview-label">{{ item.label }}</text>
					</view>
				</view>

				<view class="playmate-section">
					<view class="playmate-section-head">
						<text class="playmate-section-kicker">高频需求</text>
						<text class="playmate-section-title">先解决当下</text>
						<text class="playmate-section-desc">情绪、回应、搭子、记录，常用都在这。</text>
					</view>

					<view class="playmate-need-grid">
						<view
							v-for="item in pageMock.coreNeedList"
							:key="item.key"
							:class="[
								'playmate-need-card',
								activeNeedKey === item.key ? 'playmate-need-card-active' : '',
								pressedCardKey === `need-${item.key}` ? 'playmate-pressable-active' : ''
							]"
							:style="{ background: item.background }"
							@touchstart="handlePressStart(`need-${item.key}`)"
							@touchend="handlePressEnd(`need-${item.key}`)"
							@touchcancel="handlePressEnd(`need-${item.key}`)"
							@tap="handleNeedClick(item)"
						>
							<view class="playmate-need-icon-shell">
								<image class="playmate-need-icon" :src="item.iconSvg" mode="aspectFit" />
							</view>
							<text class="playmate-need-title">{{ item.title }}</text>
							<text class="playmate-need-desc">{{ item.desc }}</text>
							<text class="playmate-need-must">{{ item.mustText }}</text>
						</view>
					</view>
				</view>

				<view class="playmate-section">
					<view class="playmate-section-head">
						<text class="playmate-section-kicker">快速开场</text>
						<text class="playmate-section-title">现在发点啥</text>
						<text class="playmate-section-desc">选一个状态，直接开始。</text>
					</view>

					<scroll-view scroll-x show-scrollbar="false" class="playmate-guide-strip">
						<view class="playmate-guide-inner">
							<view
								v-for="item in pageMock.guideList"
								:key="item.key"
								:class="['playmate-guide-chip', activeGuideKey === item.key ? 'playmate-guide-chip-active' : '']"
								@tap="handleGuideClick(item)"
							>
								{{ item.label }}
							</view>
						</view>
					</scroll-view>

					<view class="playmate-guide-feedback">
						<text class="playmate-guide-feedback-kicker">推荐</text>
						<text class="playmate-guide-feedback-title">{{ activeGuideItem?.label || '先选一个状态' }}</text>
						<text class="playmate-guide-feedback-desc">{{ activeGuideItem?.feedbackText || '点一个，系统会给你更合适的起手方式。' }}</text>
						<view class="playmate-guide-feedback-action" @tap="handleGuideLaunch">先试：{{ activeLaunchItem?.label || '心情树洞' }}</view>
					</view>
				</view>

				<view class="playmate-section">
					<view class="playmate-section-head">
						<text class="playmate-section-kicker">快速发布</text>
						<text class="playmate-section-title">发个信号</text>
						<text class="playmate-section-desc">先发，再看有没有同频。</text>
					</view>

					<scroll-view scroll-x show-scrollbar="false" class="playmate-launch-scroll">
						<view class="playmate-launch-track">
							<view
								v-for="item in pageMock.launchCardList"
								:key="item.key"
								:class="[
									'playmate-launch-card',
									activeLaunchKey === item.key ? 'playmate-launch-card-active' : '',
									pressedCardKey === `launch-${item.key}` ? 'playmate-pressable-active' : ''
								]"
								:style="{ background: item.background }"
								@touchstart="handlePressStart(`launch-${item.key}`)"
								@touchend="handlePressEnd(`launch-${item.key}`)"
								@touchcancel="handlePressEnd(`launch-${item.key}`)"
								@tap="handleLaunchClick(item)"
							>
								<view class="playmate-launch-icon-shell">
									<image class="playmate-launch-icon" :src="item.iconSvg" mode="aspectFit" />
								</view>
								<text class="playmate-launch-badge">{{ item.badgeText }}</text>
								<text class="playmate-launch-title">{{ item.label }}</text>
								<text class="playmate-launch-desc">{{ item.desc }}</text>
								<view class="playmate-launch-button">{{ item.actionText }}</view>
							</view>
						</view>
					</scroll-view>
				</view>

				<view class="playmate-wave-card">
					<view class="playmate-wave-visual">
						<view class="playmate-wave-ring playmate-wave-ring-a"></view>
						<view class="playmate-wave-ring playmate-wave-ring-b"></view>
						<view class="playmate-wave-core">共鸣波纹</view>
					</view>

					<view class="playmate-wave-list">
						<view v-for="item in pageMock.waveCardList" :key="item.key" class="playmate-wave-item">
							<text class="playmate-wave-title">{{ item.title }}</text>
							<text class="playmate-wave-desc">{{ item.desc }}</text>
							<text class="playmate-wave-value">{{ item.valueText }}</text>
						</view>
					</view>
				</view>

				<view class="playmate-section">
					<view class="playmate-section-head">
						<text class="playmate-section-title">频率共鸣</text>
						<text class="playmate-section-desc">先有感，再认识。</text>
					</view>

					<view class="playmate-signal-list">
						<view
							v-for="item in pageMock.signalCardList"
							:key="item.id"
							:class="[
								'playmate-signal-card',
								pressedCardKey === `signal-${item.id}` ? 'playmate-pressable-active' : ''
							]"
							@touchstart="handlePressStart(`signal-${item.id}`)"
							@touchend="handlePressEnd(`signal-${item.id}`)"
							@touchcancel="handlePressEnd(`signal-${item.id}`)"
						>
							<view class="playmate-signal-head" @tap="handleProfileClick(item)">
								<view class="playmate-signal-avatar" :style="{ background: item.author.avatarBackground }">
									<text class="playmate-signal-avatar-text">{{ item.author.avatarText }}</text>
								</view>
								<view class="playmate-signal-author">
									<text class="playmate-signal-name">{{ item.author.nickname }}</text>
									<text class="playmate-signal-id">ID：{{ item.author.displayId }}</text>
								</view>
								<view class="playmate-signal-type">{{ item.typeLabel }}</view>
							</view>

							<text class="playmate-signal-title">{{ item.title }}</text>
							<text class="playmate-signal-content">{{ item.content }}</text>

							<view class="playmate-signal-tag-row">
								<text v-for="tag in item.tagList" :key="tag" class="playmate-signal-tag">{{ tag }}</text>
							</view>

							<view class="playmate-signal-highlight">
								<text class="playmate-signal-highlight-label">系统提示</text>
								<text class="playmate-signal-highlight-text">{{ item.highlightText }}</text>
							</view>

							<view class="playmate-signal-footer">
								<view class="playmate-signal-meta">
									<text class="playmate-signal-meta-text">{{ item.waitingText }}</text>
									<text class="playmate-signal-meta-text">{{ item.resonanceCount }} 次共鸣</text>
									<text class="playmate-signal-meta-text">{{ item.replyCount }} 条回应</text>
								</view>

								<view class="playmate-signal-actions">
									<view
										v-for="action in pageMock.resonanceActionList"
										:key="`${item.id}-${action.key}`"
										:class="[
											'playmate-resonance-chip',
											selectedResonanceKey === `${item.id}-${action.key}` ? 'playmate-resonance-chip-active' : ''
										]"
										@tap="handleResonanceClick(item, action)"
									>
										{{ action.label }}
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="playmate-section">
					<view class="playmate-section-head">
						<text class="playmate-section-title">回应消息</text>
						<text class="playmate-section-desc">有人路过，也有人停下来。</text>
					</view>

					<view
						:class="[
							'playmate-response-entry',
							pressedCardKey === 'reply-entry' ? 'playmate-pressable-active' : ''
						]"
						@touchstart="handlePressStart('reply-entry')"
						@touchend="handlePressEnd('reply-entry')"
						@touchcancel="handlePressEnd('reply-entry')"
						@tap="handleResponseClick(pageMock.replyEntry)"
					>
						<view class="playmate-response-main">
							<text class="playmate-response-title">{{ pageMock.replyEntry.title }}</text>
							<text class="playmate-response-desc">{{ pageMock.replyEntry.desc }}</text>
							<view class="playmate-response-preview-row">
								<view
									v-for="item in pageMock.replyEntry.previewList"
									:key="item.key"
									class="playmate-response-preview-chip"
								>
									{{ item.label }} {{ item.value }}
								</view>
							</view>
						</view>
						<view class="playmate-response-side">
							<text class="playmate-response-count">{{ pageMock.replyEntry.countText }}</text>
							<view class="playmate-response-button">{{ pageMock.replyEntry.actionText }}</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<PlaymateLaunchSheet
			:visible="launchSheetVisible"
			:sheet-data="activeLaunchSheet"
			:active-option-key="selectedLaunchSheetOptionKey"
			@close="closeLaunchSheet"
			@option-select="handleLaunchSheetOptionSelect"
			@confirm="handleLaunchSheetConfirm"
		/>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import PlaymateLaunchSheet from '@/components/friend/PlaymateLaunchSheet.vue'
import {
	buildPlaymatePublishUrl,
	getPlaymatePageMock
} from '@/components/friend/playmateMock.js'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'

const props = defineProps({
	active: {
		type: Boolean,
		default: false
	}
})

const pageMock = getPlaymatePageMock()
const { safeTopPx, safeBottomPx } = useSafeAreaMetrics()
const activeLaunchKey = ref(pageMock.guideList[0]?.targetLaunchKey || pageMock.launchCardList[0]?.key || '')
const activeGuideKey = ref(pageMock.guideList[0]?.key || '')
const activeNeedKey = ref(pageMock.guideList[0]?.needKey || pageMock.coreNeedList[0]?.key || '')
const selectedResonanceKey = ref('')
const floatBarActive = ref(false)
const launchSheetVisible = ref(false)
const currentLaunchSheetKey = ref(pageMock.floatingBar.targetLaunchKey || activeLaunchKey.value)
const selectedLaunchSheetOptionKey = ref('')
const pressedCardKey = ref('')

let floatBarResetTimer = null
let pressResetTimer = null

const contentStyle = computed(() => ({
	paddingTop: `${safeTopPx.value + 78}px`,
	paddingBottom: `${safeBottomPx.value + 24}px`
}))
const floatBarStyle = computed(() => ({
	top: `${safeTopPx.value + 10}px`
}))
const activeGuideItem = computed(() => pageMock.guideList.find((item) => item.key === activeGuideKey.value) || null)
const activeLaunchItem = computed(() => pageMock.launchCardList.find((item) => item.key === activeLaunchKey.value) || null)
const activeLaunchSheet = computed(() => pageMock.launchSheetMap?.[currentLaunchSheetKey.value] || { optionList: [] })

watch(
	() => props.active,
	(value) => {
		if (value) {
			return
		}

		const fallbackGuide =
			pageMock.guideList.find((item) => item.key === activeGuideKey.value) || pageMock.guideList[0] || null
		activeLaunchKey.value = fallbackGuide?.targetLaunchKey || pageMock.launchCardList[0]?.key || ''
		activeNeedKey.value = fallbackGuide?.needKey || pageMock.coreNeedList[0]?.key || ''
		selectedResonanceKey.value = ''
		floatBarActive.value = false
		launchSheetVisible.value = false
		clearFloatBarResetTimer()
		clearPressResetTimer()
	}
)

onBeforeUnmount(() => {
	clearFloatBarResetTimer()
	clearPressResetTimer()
})

function handleLaunchClick(item) {
	activeLaunchKey.value = item.key
	const relatedGuide = pageMock.guideList.find((guide) => guide.targetLaunchKey === item.key) || null
	if (relatedGuide) {
		activeGuideKey.value = relatedGuide.key
		activeNeedKey.value = relatedGuide.needKey || activeNeedKey.value
	}
	onLaunchAction(item)
	openLaunchSheet(item.key)
}

function handleGuideClick(item) {
	activeGuideKey.value = item.key
	activeNeedKey.value = item.needKey || activeNeedKey.value
	activeLaunchKey.value = item.targetLaunchKey || activeLaunchKey.value
	onGuidePick(item)
}

function handleNeedClick(item) {
	activeNeedKey.value = item.key
	const relatedGuide = pageMock.guideList.find((guide) => guide.needKey === item.key) || null
	if (relatedGuide) {
		activeGuideKey.value = relatedGuide.key
		activeLaunchKey.value = relatedGuide.targetLaunchKey || activeLaunchKey.value
	}
	onNeedPick(item)
}

function handleGuideLaunch() {
	const targetLaunchKey = activeLaunchItem.value?.key || pageMock.floatingBar.targetLaunchKey || 'tree-hole'
	const targetLaunchItem = pageMock.launchCardList.find((item) => item.key === targetLaunchKey) || null
	if (targetLaunchItem) {
		onLaunchAction(targetLaunchItem)
	}
	openLaunchSheet(targetLaunchKey)
}

function handleProfileClick(item) {
	onSignalProfileClick(item)
	if (!item.profileUrl) {
		return
	}

	uni.navigateTo({
		url: item.profileUrl
	})
}

function handleResonanceClick(item, action) {
	selectedResonanceKey.value = `${item.id}-${action.key}`
	onResonanceAction(item, action)
	uni.showToast({
		title: `${action.label} 已触发`,
		icon: 'none'
	})
}

function handleResponseClick(item) {
	onResponseBoxClick(item)
	if (!item?.url) {
		return
	}

	uni.navigateTo({
		url: item.url
	})
}

function handleFloatBarTap() {
	triggerShortVibration()
	floatBarActive.value = true
	clearFloatBarResetTimer()
	floatBarResetTimer = setTimeout(() => {
		floatBarActive.value = false
		floatBarResetTimer = null
	}, 1200)
	const targetLaunchKey = pageMock.floatingBar.targetLaunchKey || 'tree-hole'
	const targetLaunchItem = pageMock.launchCardList.find((item) => item.key === targetLaunchKey) || null
	if (targetLaunchItem) {
		onLaunchAction(targetLaunchItem)
	}
	openLaunchSheet(targetLaunchKey)
}

function openLaunchSheet(launchKey) {
	activeLaunchKey.value = launchKey
	currentLaunchSheetKey.value = launchKey
	selectedLaunchSheetOptionKey.value = pageMock.launchSheetMap?.[launchKey]?.optionList?.[0]?.key || ''
	launchSheetVisible.value = true
}

function closeLaunchSheet() {
	launchSheetVisible.value = false
}

function handleLaunchSheetOptionSelect(option) {
	selectedLaunchSheetOptionKey.value = option.key
	onLaunchSheetOptionSelect(currentLaunchSheetKey.value, option)
}

function handleLaunchSheetConfirm() {
	const url = buildPlaymatePublishUrl(currentLaunchSheetKey.value, {
		templateKey: selectedLaunchSheetOptionKey.value
	})
	closeLaunchSheet()
	uni.navigateTo({
		url
	})
}

function triggerShortVibration() {
	if (typeof uni.vibrateShort !== 'function') {
		return
	}

	uni.vibrateShort({
		type: 'light'
	})
}

function clearFloatBarResetTimer() {
	if (!floatBarResetTimer) {
		return
	}

	clearTimeout(floatBarResetTimer)
	floatBarResetTimer = null
}

function handlePressStart(key) {
	clearPressResetTimer()
	pressedCardKey.value = key
}

function handlePressEnd(key) {
	if (pressedCardKey.value !== key) {
		return
	}

	pressResetTimer = setTimeout(() => {
		if (pressedCardKey.value === key) {
			pressedCardKey.value = ''
		}
		pressResetTimer = null
	}, 120)
}

function clearPressResetTimer() {
	if (!pressResetTimer) {
		return
	}

	clearTimeout(pressResetTimer)
	pressResetTimer = null
}

function onLaunchAction(item) {
	// TODO：替换玩伴页树洞 / 找玩伴 / 扩列发起逻辑
	console.log('playmate-launch-action', item.key)
}

function onGuidePick(item) {
	// TODO：替换玩伴页引导文案选择逻辑
	console.log('playmate-guide-pick', item.key)
}

function onNeedPick(item) {
	// TODO：替换玩伴页刚需卡片点击逻辑
	console.log('playmate-need-pick', item.key)
}

function onLaunchSheetOptionSelect(launchKey, option) {
	// TODO：替换玩伴弹层子功能选择逻辑
	console.log('playmate-launch-sheet-option', launchKey, option.key)
}

function onSignalProfileClick(item) {
	// TODO：替换玩伴页资料跳转前埋点
	console.log('playmate-signal-profile-click', item.id, item.author.id)
}

function onResonanceAction(item, action) {
	// TODO：替换玩伴页触发共鸣逻辑，后续可接 AI 分析推荐
	console.log('playmate-resonance-action', item.id, action.key)
}

function onResponseBoxClick(item) {
	// TODO：替换回应盒子查看逻辑
	console.log('playmate-response-box-click', item.id)
}
</script>

<style scoped>
.playmate-page {
	position: relative;
	height: 100%;
	background: linear-gradient(180deg, #fffafc 0%, #f8fbff 36%, #f4f7fc 100%);
	overflow: hidden;
}

.playmate-page-background {
	position: absolute;
	border-radius: 50%;
	filter: blur(16rpx);
	pointer-events: none;
}

.playmate-page-background-left {
	top: -120rpx;
	left: -80rpx;
	width: 360rpx;
	height: 360rpx;
	background: radial-gradient(circle, rgba(255, 201, 217, 0.54) 0%, rgba(255, 201, 217, 0) 72%);
}

.playmate-page-background-right {
	top: 140rpx;
	right: -120rpx;
	width: 420rpx;
	height: 420rpx;
	background: radial-gradient(circle, rgba(198, 220, 255, 0.5) 0%, rgba(198, 220, 255, 0) 72%);
}

.playmate-scroll {
	position: relative;
	z-index: 1;
	height: 100%;
}

.playmate-content {
	padding-right: 24rpx;
	padding-left: 24rpx;
	box-sizing: border-box;
}

.playmate-float-bar {
	position: absolute;
	right: 24rpx;
	left: 24rpx;
	z-index: 3;
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 18rpx 20rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.9);
	border: 1rpx solid rgba(255, 255, 255, 0.94);
	box-shadow: 0 18rpx 40rpx rgba(148, 163, 184, 0.14);
	backdrop-filter: blur(10rpx);
	-webkit-backdrop-filter: blur(10rpx);
	box-sizing: border-box;
	transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.playmate-float-bar-active {
	box-shadow: 0 20rpx 46rpx rgba(244, 63, 94, 0.18);
}

.playmate-float-bar-wave {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.16) 0%, rgba(255, 196, 160, 0.22) 100%);
	flex-shrink: 0;
	overflow: hidden;
}

.playmate-float-bar-line {
	position: absolute;
	left: 12rpx;
	right: 12rpx;
	height: 4rpx;
	border-radius: 999rpx;
	background: rgba(217, 79, 123, 0.72);
	animation: playmate-wave-bar 2.4s ease-in-out infinite;
}

.playmate-float-bar-line-a {
	top: 20rpx;
}

.playmate-float-bar-line-b {
	top: 32rpx;
	animation-delay: 0.3s;
}

.playmate-float-bar-line-c {
	top: 44rpx;
	animation-delay: 0.6s;
}

.playmate-float-bar-copy {
	flex: 1;
	min-width: 0;
}

.playmate-float-bar-title,
.playmate-float-bar-desc,
.playmate-hero-eyebrow,
.playmate-hero-title,
.playmate-hero-desc,
.playmate-overview-value,
.playmate-overview-label,
.playmate-section-title,
.playmate-section-desc,
.playmate-guide-feedback-kicker,
.playmate-guide-feedback-title,
.playmate-guide-feedback-desc,
.playmate-launch-badge,
.playmate-launch-title,
.playmate-launch-desc,
.playmate-wave-title,
.playmate-wave-desc,
.playmate-wave-value,
.playmate-signal-name,
.playmate-signal-id,
.playmate-signal-title,
.playmate-signal-content,
.playmate-signal-highlight-label,
.playmate-signal-highlight-text,
.playmate-signal-meta-text,
.playmate-response-title,
.playmate-response-desc,
.playmate-response-count {
	display: block;
}

.playmate-float-bar-title {
	font-size: 24rpx;
	font-weight: 700;
	line-height: 32rpx;
	color: #0f172a;
}

.playmate-float-bar-desc {
	margin-top: 4rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #64748b;
}

.playmate-float-bar-action {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
	font-size: 22rpx;
	font-weight: 600;
	color: #ffffff;
	flex-shrink: 0;
}

.playmate-hero,
.playmate-overview-card,
.playmate-need-card,
.playmate-launch-card,
.playmate-wave-card,
.playmate-signal-card,
.playmate-response-entry,
.playmate-guide-feedback {
	position: relative;
	overflow: hidden;
	transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.playmate-hero::before,
.playmate-need-card::before,
.playmate-launch-card::before,
.playmate-signal-card::before,
.playmate-response-entry::before {
	content: '';
	position: absolute;
	top: -60rpx;
	left: -120rpx;
	width: 180rpx;
	height: 260rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.34) 48%, rgba(255, 255, 255, 0) 100%);
	transform: rotate(20deg);
	animation: playmate-sheen 7.2s linear infinite;
	pointer-events: none;
}

.playmate-pressable-active {
	transform: scale(0.98) translateY(2rpx);
}

.playmate-hero {
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 28rpx 24rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 248, 251, 0.98) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.94);
	box-shadow: 0 20rpx 50rpx rgba(255, 171, 191, 0.1);
}

.playmate-hero-copy {
	flex: 1;
	min-width: 0;
}

.playmate-hero-eyebrow {
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #d94f7b;
}

.playmate-hero-title {
	margin-top: 10rpx;
	font-size: 38rpx;
	font-weight: 700;
	line-height: 48rpx;
	color: #0f172a;
}

.playmate-hero-desc {
	margin-top: 12rpx;
	font-size: 22rpx;
	line-height: 34rpx;
	color: #475467;
}

.playmate-hero-orbit {
	position: relative;
	width: 172rpx;
	height: 172rpx;
	flex-shrink: 0;
}

.playmate-orbit-core,
.playmate-orbit-bubble {
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 999rpx;
}

.playmate-orbit-core {
	inset: 28rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 22rpx;
	font-weight: 700;
	color: #ffffff;
	box-shadow: 0 18rpx 42rpx rgba(254, 44, 85, 0.24);
}

.playmate-orbit-bubble {
	padding: 0 18rpx;
	height: 48rpx;
	background: rgba(255, 255, 255, 0.88);
	border: 1rpx solid rgba(255, 255, 255, 0.94);
	font-size: 20rpx;
	font-weight: 600;
	color: #475467;
	box-shadow: 0 12rpx 24rpx rgba(148, 163, 184, 0.12);
	animation: playmate-float 3.2s ease-in-out infinite;
}

.playmate-orbit-bubble-a {
	top: 8rpx;
	right: 0;
}

.playmate-orbit-bubble-b {
	left: 0;
	bottom: 8rpx;
	animation-delay: 1.1s;
}

.playmate-overview-card {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16rpx;
	margin-top: 18rpx;
	padding: 20rpx 18rpx;
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.86);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 12rpx 34rpx rgba(148, 163, 184, 0.08);
}

.playmate-overview-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.playmate-overview-value {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.playmate-overview-label {
	margin-top: 6rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #667085;
}

.playmate-section {
	margin-top: 24rpx;
}

.playmate-section-head {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 8rpx;
	margin-bottom: 18rpx;
}

.playmate-section-kicker {
	display: block;
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #d94f7b;
}

.playmate-section-title {
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.playmate-section-desc {
	font-size: 22rpx;
	line-height: 34rpx;
	color: #98a2b3;
	text-align: left;
}

.playmate-need-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16rpx;
}

.playmate-need-card {
	display: flex;
	flex-direction: column;
	padding: 22rpx 20rpx;
	border-radius: 32rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.84);
	box-shadow: 0 16rpx 36rpx rgba(148, 163, 184, 0.08);
	box-sizing: border-box;
}

.playmate-need-card-active {
	transform: translateY(-4rpx);
	box-shadow: 0 22rpx 44rpx rgba(255, 171, 191, 0.14);
}

.playmate-need-icon-shell,
.playmate-launch-icon-shell {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64rpx;
	height: 64rpx;
	border-radius: 20rpx;
	background: rgba(255, 255, 255, 0.78);
}

.playmate-need-icon {
	width: 30rpx;
	height: 30rpx;
}

.playmate-need-title {
	margin-top: 16rpx;
	font-size: 24rpx;
	font-weight: 700;
	line-height: 34rpx;
	color: #0f172a;
}

.playmate-need-desc {
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 30rpx;
	color: #475467;
}

.playmate-need-must {
	margin-top: 12rpx;
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #d94f7b;
}

.playmate-guide-feedback {
	margin-top: 16rpx;
	padding: 18rpx 18rpx;
	border-radius: 28rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.08) 0%, rgba(199, 214, 255, 0.14) 100%);
}

.playmate-guide-feedback-kicker,
.playmate-launch-badge {
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #d94f7b;
}

.playmate-guide-feedback-title {
	margin-top: 10rpx;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.playmate-guide-feedback-desc {
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 30rpx;
	color: #475467;
}

.playmate-guide-feedback-action {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 18rpx;
	margin-top: 16rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.78);
	font-size: 20rpx;
	font-weight: 600;
	color: #0f172a;
}

.playmate-launch-scroll {
	white-space: nowrap;
}

.playmate-launch-track {
	display: inline-flex;
	gap: 16rpx;
	padding-right: 8rpx;
}

.playmate-launch-card {
	display: inline-flex;
	flex-direction: column;
	width: 284rpx;
	min-height: 268rpx;
	padding: 22rpx 20rpx;
	border-radius: 32rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.84);
	box-shadow: 0 16rpx 36rpx rgba(148, 163, 184, 0.08);
	box-sizing: border-box;
	white-space: normal;
}

.playmate-launch-card-active {
	transform: translateY(-4rpx);
	box-shadow: 0 22rpx 44rpx rgba(255, 171, 191, 0.14);
}

.playmate-launch-icon {
	width: 30rpx;
	height: 30rpx;
}

.playmate-launch-title {
	margin-top: 14rpx;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.playmate-launch-desc {
	flex: 1;
	margin-top: 10rpx;
	font-size: 20rpx;
	line-height: 30rpx;
	color: #475467;
}

.playmate-launch-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	align-self: flex-start;
	height: 56rpx;
	padding: 0 22rpx;
	margin-top: 18rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.88);
	font-size: 22rpx;
	font-weight: 600;
	color: #0f172a;
}

.playmate-guide-strip {
	white-space: nowrap;
}

.playmate-guide-inner {
	display: inline-flex;
	gap: 14rpx;
}

.playmate-guide-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 64rpx;
	padding: 0 26rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.84);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	font-size: 24rpx;
	line-height: 32rpx;
	color: #475467;
	box-shadow: 0 10rpx 24rpx rgba(148, 163, 184, 0.08);
}

.playmate-guide-chip-active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.18) 0%, rgba(255, 196, 160, 0.24) 100%);
	color: #d94f7b;
}

.playmate-wave-card {
	display: flex;
	align-items: center;
	gap: 18rpx;
	margin-top: 24rpx;
	padding: 24rpx 20rpx;
	border-radius: 36rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 252, 255, 0.98) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.94);
	box-shadow: 0 16rpx 40rpx rgba(148, 163, 184, 0.1);
}

.playmate-wave-visual {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 156rpx;
	height: 156rpx;
	flex-shrink: 0;
}

.playmate-wave-ring {
	position: absolute;
	border-radius: 50%;
	border: 2rpx solid rgba(254, 44, 85, 0.16);
	animation: playmate-pulse 2.8s ease-out infinite;
}

.playmate-wave-ring-a {
	inset: 14rpx;
}

.playmate-wave-ring-b {
	inset: 0;
	animation-delay: 1.1s;
}

.playmate-wave-core {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 138rpx;
	height: 138rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(254, 44, 85, 0.14) 0%, rgba(251, 113, 133, 0.22) 100%);
	font-size: 24rpx;
	font-weight: 700;
	color: #d94f7b;
	text-align: center;
}

.playmate-wave-list {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 14rpx;
	min-width: 0;
}

.playmate-wave-item {
	padding: 16rpx 18rpx;
	border-radius: 24rpx;
	background: rgba(248, 250, 252, 0.9);
}

.playmate-wave-title {
	font-size: 24rpx;
	font-weight: 700;
	line-height: 32rpx;
	color: #0f172a;
}

.playmate-wave-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #475467;
}

.playmate-wave-value {
	margin-top: 10rpx;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #d94f7b;
}

.playmate-signal-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.playmate-signal-card,
.playmate-response-entry {
	padding: 26rpx 24rpx;
	border-radius: 32rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 248, 251, 0.98) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 16rpx 38rpx rgba(148, 163, 184, 0.1);
}

.playmate-signal-head {
	display: flex;
	align-items: center;
}

.playmate-signal-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 86rpx;
	height: 86rpx;
	border-radius: 28rpx;
	box-shadow: 0 14rpx 28rpx rgba(255, 171, 191, 0.14);
	flex-shrink: 0;
}

.playmate-signal-avatar-text {
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
}

.playmate-signal-author {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.playmate-signal-name {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #0f172a;
}

.playmate-signal-id {
	margin-top: 6rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.playmate-signal-type {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 48rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.14) 0%, rgba(255, 196, 160, 0.22) 100%);
	font-size: 20rpx;
	font-weight: 600;
	color: #d94f7b;
}

.playmate-signal-title {
	margin-top: 20rpx;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.playmate-signal-content {
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 38rpx;
	color: #475467;
}

.playmate-signal-tag-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 16rpx;
}

.playmate-signal-tag {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 44rpx;
	padding: 0 16rpx;
	border-radius: 999rpx;
	background: rgba(248, 250, 252, 0.96);
	font-size: 20rpx;
	line-height: 28rpx;
	color: #64748b;
}

.playmate-signal-highlight {
	margin-top: 18rpx;
	padding: 18rpx 20rpx;
	border-radius: 24rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.08) 0%, rgba(199, 214, 255, 0.14) 100%);
}

.playmate-signal-highlight-label {
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #d94f7b;
}

.playmate-signal-highlight-text {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #475467;
}

.playmate-signal-footer {
	margin-top: 20rpx;
}

.playmate-signal-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx 16rpx;
}

.playmate-signal-meta-text {
	font-size: 20rpx;
	line-height: 28rpx;
	color: #98a2b3;
}

.playmate-signal-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
}

.playmate-resonance-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 58rpx;
	padding: 0 22rpx;
	border-radius: 999rpx;
	background: rgba(248, 250, 252, 0.96);
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #475467;
}

.playmate-resonance-chip-active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.18) 0%, rgba(255, 196, 160, 0.26) 100%);
	color: #d94f7b;
}

.playmate-response-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #0f172a;
}

.playmate-response-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #475467;
}

.playmate-response-entry {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18rpx;
}

.playmate-response-main {
	flex: 1;
	min-width: 0;
}

.playmate-response-preview-row {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
	margin-top: 16rpx;
}

.playmate-response-preview-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 46rpx;
	padding: 0 14rpx;
	border-radius: 999rpx;
	background: rgba(248, 250, 252, 0.96);
	font-size: 20rpx;
	line-height: 28rpx;
	color: #64748b;
}

.playmate-response-side {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 14rpx;
	flex-shrink: 0;
}

.playmate-response-count {
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #d94f7b;
}

.playmate-response-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 58rpx;
	padding: 0 24rpx;
	margin-top: 0;
	border-radius: 999rpx;
	background: rgba(248, 250, 252, 0.96);
	font-size: 22rpx;
	font-weight: 600;
	color: #0f172a;
}

@keyframes playmate-float {
	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(-8rpx);
	}
}

@keyframes playmate-pulse {
	0% {
		transform: scale(0.92);
		opacity: 0.72;
	}

	100% {
		transform: scale(1.08);
		opacity: 0;
	}
}

@keyframes playmate-wave-bar {
	0%,
	100% {
		transform: scaleX(0.72);
		opacity: 0.56;
	}

	50% {
		transform: scaleX(1);
		opacity: 1;
	}
}

@keyframes playmate-sheen {
	0% {
		transform: translateX(0) rotate(20deg);
		opacity: 0;
	}

	12% {
		opacity: 0.82;
	}

	28% {
		transform: translateX(560rpx) rotate(20deg);
		opacity: 0;
	}

	100% {
		transform: translateX(560rpx) rotate(20deg);
		opacity: 0;
	}
}
</style>
