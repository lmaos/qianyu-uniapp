<template>
	<UserSubPageLayout
		:title="pageMock.title"
		:footer-reserve-rpx="152"
		:footer-top-padding-rpx="16"
		:footer-inner-min-height-rpx="120"
		@back="handleBack"
	>
		<UserSectionCard>
			<textarea
				v-model="draftTitle"
				class="publish-title-input"
				auto-height
				maxlength="80"
				:placeholder="pageMock.placeholder"
				placeholder-class="publish-title-placeholder"
			/>
		</UserSectionCard>

		<UserSectionCard class="publish-section-gap">
			<template #header>
				<view class="publish-section-header">
					<text class="publish-toolbar-title">添加内容</text>
					<text class="publish-toolbar-desc">当前发布入口支持多图或单视频内容</text>
				</view>
			</template>
			<view class="publish-toolbar-row">
				<view class="publish-tool-button" @tap="handlePickImages">
					<text class="publish-tool-emoji">🖼</text>
					<text class="publish-tool-label">选择图片</text>
				</view>

				<view class="publish-tool-button" @tap="handlePickVideo">
					<text class="publish-tool-emoji">▶</text>
					<text class="publish-tool-label">选择视频</text>
				</view>
			</view>
		</UserSectionCard>

		<UserSectionCard class="publish-section-gap">
			<template #header>
				<view class="publish-section-header">
					<text class="publish-toolbar-title">内容预览</text>
					<text class="publish-toolbar-desc">{{ previewHintText }}</text>
				</view>
			</template>
			<view v-if="selectedMediaList.length" class="publish-preview-body">
				<view v-if="hasVideo" class="publish-video-preview">
					<video
						class="publish-video-player"
						:src="selectedMediaList[0].url"
						:poster="selectedMediaList[0].thumbUrl || selectedMediaList[0].url"
						object-fit="cover"
						:controls="false"
						:show-center-play-btn="false"
						:enable-progress-gesture="false"
						muted
					/>
					<view class="publish-media-remove" @tap="removeMedia(0)">
						<text class="publish-media-remove-text">删除</text>
					</view>
				</view>

				<view v-else class="publish-image-grid">
					<view v-for="(item, index) in selectedMediaList" :key="item.id" class="publish-image-card">
						<image class="publish-image" :src="item.url" mode="aspectFill" />
						<view class="publish-media-remove publish-media-remove-corner" @tap="removeMedia(index)">
							<text class="publish-media-remove-text">×</text>
						</view>
					</view>
					<view
						v-if="canAppendImage"
						class="publish-image-card publish-image-add-card"
						@tap="handlePickImages"
					>
						<text class="publish-image-add-icon">+</text>
						<text class="publish-image-add-text">继续添加</text>
					</view>
				</view>
			</view>

			<view v-else class="publish-empty-state">
				<text class="publish-empty-icon">＋</text>
				<text class="publish-empty-title">还没有选择内容</text>
				<text class="publish-empty-desc">先挑选图片或视频，再补充标题即可发布。</text>
			</view>
		</UserSectionCard>

		<template #footer>
			<view class="publish-footer">
				<view
					:class="['publish-footer-button', canSubmit ? 'publish-footer-button-active' : 'publish-footer-button-disabled']"
					@tap="handleSubmit"
				>
					<text :class="['publish-footer-button-text', canSubmit ? '' : 'publish-footer-button-text-disabled']">
						{{ submitting ? '发布中...' : pageMock.submitLabel }}
					</text>
				</view>
			</view>
		</template>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import {
	getContentPublishPageMock,
	normalizePublishMedia,
	parseContentPublishMediaList
} from '@/components/user-center/contentPublishMock.js'
import { uploadFile } from '@/composables/useStorageApi.js'
import { publishMoment } from '@/composables/useMomentApi.js'

const sceneKey = ref('recommend')
const pageMock = ref(getContentPublishPageMock())
const draftTitle = ref('')
const selectedMediaList = ref([])
const submitting = ref(false)

const hasVideo = computed(() => {
	return selectedMediaList.value.some((item) => item.type === 'video')
})
const canSubmit = computed(() => {
	return selectedMediaList.value.length > 0 && !submitting.value
})
const canAppendImage = computed(() => {
	if (hasVideo.value) {
		return false
	}

	return selectedMediaList.value.length < pageMock.value.maxImageCount
})
const previewHintText = computed(() => {
	if (!selectedMediaList.value.length) {
		return '最多 9 张图片或 1 个视频'
	}

	if (hasVideo.value) {
		return '当前为单视频动态'
	}

	return `已选 ${selectedMediaList.value.length} 张图片`
})

onLoad((options) => {
	const nextSceneKey = options?.scene === 'recommend' ? 'recommend' : 'recommend'
	sceneKey.value = nextSceneKey
	pageMock.value = getContentPublishPageMock(nextSceneKey)
	selectedMediaList.value = parseContentPublishMediaList(options?.mediaPayload)
})

// ── 选择图片 ────────────────────────────────────

async function handlePickImages() {
	const remainCount = Math.max(1, pageMock.value.maxImageCount - selectedMediaList.value.length)
	const targetCount = Math.min(remainCount, pageMock.value.maxImageCount)
	const result = await chooseImageAsync({
		count: targetCount,
		sourceType: ['album', 'camera']
	})

	if (!result) {
		return
	}

	const imageList = (result.tempFilePaths || [])
		.map((item, index) =>
			normalizePublishMedia({
				id: `image-${Date.now()}-${index + 1}`,
				type: 'image',
				url: item
			})
		)
		.filter(Boolean)

	if (!imageList.length) {
		return
	}

	selectedMediaList.value = [...selectedMediaList.value.filter((item) => item.type === 'image'), ...imageList].slice(
		0,
		pageMock.value.maxImageCount
	)
}

async function handlePickVideo() {
	const result = await chooseMediaAsync({
		count: 1,
		mediaType: ['video'],
		sourceType: ['album', 'camera']
	})

	if (!result?.tempFiles?.length) {
		return
	}

	const targetVideo = normalizePublishMedia({
		...result.tempFiles[0],
		id: `video-${Date.now()}`
	})
	if (!targetVideo) {
		return
	}

	selectedMediaList.value = [targetVideo]
}

function removeMedia(index) {
	selectedMediaList.value = selectedMediaList.value.filter((_, itemIndex) => itemIndex !== index)
}

// ── 发布提交 ────────────────────────────────────

async function handleSubmit() {
	if (!canSubmit.value) {
		if (!selectedMediaList.value.length) {
			uni.showToast({ title: '先选择要发布的内容', icon: 'none' })
		}
		return
	}

	submitting.value = true

	try {
		uni.showLoading({ title: '发布中...', mask: true })

		const content = await buildPublishContent()
		if (!content) {
			uni.hideLoading()
			submitting.value = false
			return
		}

		await publishMoment({ content })
		uni.hideLoading()
		uni.showToast({ title: '发布成功', icon: 'success' })

		// 发布成功后返回上一页
		setTimeout(() => {
			uni.navigateBack({ delta: 1 })
		}, 600)
	} catch (err) {
		uni.hideLoading()
		console.error('[Publish] failed', err)
		// baseRequest 已 toast 具体错误信息
	} finally {
		submitting.value = false
	}
}

/**
 * 构造 MomentContent：
 *   1. 上传文件 → 获取 CDN URL
 *   2. 获取图片尺寸
 *   3. 组装成 API 需要的结构
 */
async function buildPublishContent() {
	const content = {
		type: hasVideo.value ? 'video' : (selectedMediaList.value.length > 0 ? 'image' : 'text'),
		text: {
			text: draftTitle.value || '',
			atIds: []
		}
	}

	if (hasVideo.value) {
		const videoItem = selectedMediaList.value[0]

		// 上传视频文件
		const videoResult = await uploadFile(videoItem.url, 'moment/video')
		if (!videoResult) return null

		content.video = {
			videoId: String(videoResult.id),
			videoUrl: videoResult.url,
			coverUrl: videoResult.url,
			width: videoItem.width || 0,
			height: videoItem.height || 0,
			duration: videoItem.duration || 0
		}

		// 如果有视频缩略图，上传作为封面
		if (videoItem.thumbUrl && videoItem.thumbUrl !== videoItem.url) {
			try {
				const coverResult = await uploadFile(videoItem.thumbUrl, 'moment/image')
				if (coverResult) {
					content.video.coverUrl = coverResult.url
				}
			} catch (err) {
				console.warn('[Publish] cover upload failed, using video URL as cover', err)
			}
		}
	} else if (selectedMediaList.value.length > 0) {
		// 上传图片，逐张上传
		const imageResults = []

		for (const item of selectedMediaList.value) {
			// 获取图片尺寸
			let width = 0
			let height = 0
			try {
				const info = await getImageInfo(item.url)
				width = info.width
				height = info.height
			} catch (err) {
				console.warn('[Publish] get image info failed', err)
			}

			// 上传图片
			const result = await uploadFile(item.url, 'moment/image')
			if (!result) return null

			imageResults.push({
				imageId: String(result.id),
				imageUrl: result.url,
				width,
				height
			})
		}

		content.image = imageResults
	}

	return content
}

// ── uni API 封装 ──────────────────────────────

function getImageInfo(src) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src,
			success: (res) => resolve(res),
			fail: (err) => reject(err)
		})
	})
}

function chooseImageAsync(options) {
	return new Promise((resolve) => {
		uni.chooseImage({
			...options,
			success: (result) => resolve(result),
			fail: (error) => {
				if (!isUserCancelError(error)) {
					uni.showToast({ title: '选择图片失败', icon: 'none' })
				}
				resolve(null)
			}
		})
	})
}

function chooseMediaAsync(options) {
	return new Promise((resolve) => {
		uni.chooseMedia({
			...options,
			success: (result) => resolve(result),
			fail: (error) => {
				if (!isUserCancelError(error)) {
					uni.showToast({ title: '选择视频失败', icon: 'none' })
				}
				resolve(null)
			}
		})
	})
}

function isUserCancelError(error) {
	const errorMessage = `${error?.errMsg || ''}`.toLowerCase()
	return errorMessage.includes('cancel')
}

function handleBack() {
	uni.navigateBack({ delta: 1 })
}
</script>

<style scoped>
.publish-section-gap {
	margin-top: 20rpx;
}

.publish-footer {
	display: flex;
	align-items: center;
	min-height: 120rpx;
}

.publish-footer-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 88rpx;
	border-radius: 999rpx;
}

.publish-footer-button-active {
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	box-shadow: 0 16rpx 36rpx rgba(254, 44, 85, 0.18);
}

.publish-footer-button-disabled {
	background: rgba(15, 23, 42, 0.08);
}

.publish-footer-button-text {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #ffffff;
}

.publish-footer-button-text-disabled {
	color: rgba(15, 23, 42, 0.42);
}

.publish-title-input {
	width: 100%;
	min-height: 180rpx;
	font-size: 30rpx;
	line-height: 44rpx;
	color: #101828;
}

.publish-title-placeholder {
	color: #98a2b3;
}

.publish-section-header {
	display: flex;
	flex-direction: column;
}

.publish-toolbar-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #101828;
}

.publish-toolbar-desc {
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #667085;
}

.publish-toolbar-row {
	display: flex;
	margin-top: 24rpx;
}

.publish-tool-button {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 168rpx;
	border-radius: 24rpx;
	background: linear-gradient(180deg, #fff7f9 0%, #ffffff 100%);
	box-shadow: inset 0 0 0 1rpx rgba(255, 205, 223, 0.72);
}

.publish-tool-button + .publish-tool-button {
	margin-left: 20rpx;
}

.publish-tool-emoji {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 24rpx;
	background: rgba(254, 44, 85, 0.1);
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #fe2c55;
}

.publish-tool-label {
	margin-top: 14rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #344054;
}

.publish-preview-body {
	margin-top: 24rpx;
}

.publish-video-preview {
	position: relative;
	overflow: hidden;
	border-radius: 28rpx;
	background: #111827;
}

.publish-video-player {
	width: 100%;
	height: 720rpx;
}

.publish-image-grid {
	display: flex;
	flex-wrap: wrap;
	margin-top: -16rpx;
	margin-right: -16rpx;
}

.publish-image-card {
	position: relative;
	width: calc((100% - 32rpx) / 3);
	height: 204rpx;
	margin-top: 16rpx;
	margin-right: 16rpx;
	border-radius: 24rpx;
	overflow: hidden;
	background: #f2f4f7;
}

.publish-image {
	width: 100%;
	height: 100%;
}

.publish-image-add-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.publish-image-add-icon {
	font-size: 54rpx;
	line-height: 1;
	color: #fe2c55;
}

.publish-image-add-text {
	margin-top: 12rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #667085;
}

.publish-media-remove {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 20rpx;
	margin-top: 18rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.72);
}

.publish-media-remove-corner {
	position: absolute;
	top: 14rpx;
	right: 14rpx;
	height: 48rpx;
	padding: 0 18rpx;
	margin-top: 0;
	background: rgba(15, 23, 42, 0.56);
}

.publish-media-remove-text {
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #ffffff;
}

.publish-empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 72rpx 0 56rpx;
}

.publish-empty-icon {
	font-size: 72rpx;
	line-height: 1;
	color: #fe2c55;
}

.publish-empty-title {
	margin-top: 22rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #101828;
}

.publish-empty-desc {
	margin-top: 12rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #667085;
	text-align: center;
}
</style>
