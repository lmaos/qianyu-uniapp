<template>
	<UserSubPageLayout :title="pageMock.title" :footer-reserve-rpx="124" :footer-inner-min-height-rpx="88" @back="handleBack">
		<UserSectionCard>
			<text class="playmate-publish-desc">{{ pageMock.desc }}</text>
			<textarea
				class="playmate-publish-input"
				:value="contentText"
				:placeholder="pageMock.placeholder"
				maxlength="300"
				@input="handleInput"
			></textarea>
		</UserSectionCard>

		<UserSectionCard class="playmate-publish-gap" title="模板">
			<view class="playmate-publish-chip-row">
				<view
					v-for="item in pageMock.templateList"
					:key="item.key"
					:class="['playmate-publish-chip', activeTemplateKey === item.key ? 'playmate-publish-chip-active' : '']"
					@tap="handleTemplateSelect(item)"
				>
					<text class="playmate-publish-chip-title">{{ item.label }}</text>
					<text class="playmate-publish-chip-desc">{{ item.desc }}</text>
				</view>
			</view>
		</UserSectionCard>

		<UserSectionCard
			v-for="group in pageMock.optionGroupList"
			:key="group.key"
			class="playmate-publish-gap"
			:title="group.title"
		>
			<view class="playmate-publish-option-row">
				<view
					v-for="item in group.optionList"
					:key="item"
					:class="[
						'playmate-publish-option',
						selectionMap[group.key] === item ? 'playmate-publish-option-active' : ''
					]"
					@tap="handleOptionSelect(group.key, item)"
				>
					{{ item }}
				</view>
			</view>
		</UserSectionCard>

		<UserSectionCard class="playmate-publish-gap" title="预览">
			<view class="playmate-publish-preview">
				<text class="playmate-publish-preview-title">{{ pageMock.previewTitle }}</text>
				<text class="playmate-publish-preview-desc">{{ pageMock.previewDesc }}</text>
			</view>
		</UserSectionCard>

		<template #footer>
			<view class="playmate-publish-footer-button" @tap="handleSubmit">{{ pageMock.buttonText }}</view>
		</template>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getPlaymatePublishPageMock } from '@/components/friend/playmateMock.js'

const pageMock = ref(getPlaymatePublishPageMock())
const contentText = ref('')
const activeTemplateKey = ref('')
const selectionMap = ref({})

onLoad((options) => {
	pageMock.value = getPlaymatePublishPageMock(options?.mode, options?.templateKey)
	activeTemplateKey.value = options?.templateKey || pageMock.value.templateList?.[0]?.key || ''
	contentText.value = ''
	selectionMap.value = Object.fromEntries(
		(pageMock.value.optionGroupList || []).map((item) => [item.key, item.optionList?.[0] || ''])
	)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleInput(event) {
	contentText.value = event?.detail?.value || ''
	onContentInput(contentText.value)
}

function handleTemplateSelect(item) {
	activeTemplateKey.value = item.key
	onTemplateSelect(item)
}

function handleOptionSelect(groupKey, item) {
	selectionMap.value = {
		...selectionMap.value,
		[groupKey]: item
	}
	onOptionSelect(groupKey, item)
}

function handleSubmit() {
	onSubmit({
		mode: pageMock.value.mode,
		content: contentText.value,
		templateKey: activeTemplateKey.value,
		selectionMap: selectionMap.value
	})
	uni.showToast({
		title: `${pageMock.value.buttonText}占位`,
		icon: 'none'
	})
}

function onContentInput(value) {
	// TODO：替换玩伴发布页输入联动逻辑
	console.log('playmate-publish-input', pageMock.value.mode, value)
}

function onTemplateSelect(item) {
	// TODO：替换玩伴发布页模板选择逻辑
	console.log('playmate-publish-template', pageMock.value.mode, item.key)
}

function onOptionSelect(groupKey, item) {
	// TODO：替换玩伴发布页选项选择逻辑
	console.log('playmate-publish-option', pageMock.value.mode, groupKey, item)
}

function onSubmit(payload) {
	// TODO：替换玩伴发布页提交逻辑
	console.log('playmate-publish-submit', payload)
}
</script>

<style scoped>
.playmate-publish-gap {
	margin-top: 20rpx;
}

.playmate-publish-desc,
.playmate-publish-chip-title,
.playmate-publish-chip-desc,
.playmate-publish-preview-title,
.playmate-publish-preview-desc {
	display: block;
}

.playmate-publish-desc {
	font-size: 24rpx;
	line-height: 36rpx;
	color: #475467;
}

.playmate-publish-input {
	width: 100%;
	min-height: 220rpx;
	margin-top: 20rpx;
	padding: 22rpx 20rpx;
	border-radius: 28rpx;
	background: rgba(248, 250, 252, 0.94);
	font-size: 24rpx;
	line-height: 36rpx;
	color: #0f172a;
	box-sizing: border-box;
}

.playmate-publish-chip-row,
.playmate-publish-option-row {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
}

.playmate-publish-chip {
	min-width: 180rpx;
	padding: 20rpx 18rpx;
	border-radius: 24rpx;
	background: rgba(248, 250, 252, 0.94);
}

.playmate-publish-chip-active,
.playmate-publish-option-active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.14) 0%, rgba(255, 196, 160, 0.22) 100%);
	color: #d94f7b;
}

.playmate-publish-chip-title {
	font-size: 24rpx;
	font-weight: 700;
	line-height: 34rpx;
	color: #0f172a;
}

.playmate-publish-chip-desc {
	margin-top: 8rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	color: #64748b;
}

.playmate-publish-option {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 56rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: rgba(248, 250, 252, 0.94);
	font-size: 22rpx;
	line-height: 30rpx;
	color: #475467;
}

.playmate-publish-preview {
	padding: 22rpx 20rpx;
	border-radius: 26rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.08) 0%, rgba(199, 214, 255, 0.14) 100%);
}

.playmate-publish-preview-title {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.playmate-publish-preview-desc {
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #475467;
}

.playmate-publish-footer-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 84rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
