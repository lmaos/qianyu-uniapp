<template>
	<UserSubPageLayout
		title="编辑个人信息"
		:footer-reserve-rpx="124"
		:footer-inner-min-height-rpx="88"
		@back="handleBack"
	>
		<UserSectionCard title="基础资料">
			<view class="edit-profile-cover" :style="{ background: formState.coverBackground }">
				<text class="edit-profile-cover-text">封面图</text>
				<view class="edit-profile-cover-button" @tap="handleCoverChange">更换封面</view>
			</view>

			<view class="edit-profile-avatar-row">
				<view class="edit-profile-avatar" :style="{ background: formState.avatarBackground }">
					<text class="edit-profile-avatar-text">{{ formState.avatarText }}</text>
				</view>
				<view class="edit-profile-avatar-button" @tap="handleAvatarChange">更换头像</view>
			</view>
		</UserSectionCard>

		<UserSectionCard class="edit-profile-section-gap" title="编辑资料">
			<view class="edit-profile-field">
				<text class="edit-profile-label">昵称</text>
				<input class="edit-profile-input" :value="formState.nickname" @input="handleInput('nickname', $event)" />
			</view>

			<view class="edit-profile-field">
				<text class="edit-profile-label">个性签名</text>
				<textarea
					class="edit-profile-textarea"
					:value="formState.signature"
					maxlength="120"
					@input="handleInput('signature', $event)"
				/>
			</view>

			<view class="edit-profile-field">
				<text class="edit-profile-label">对外展示ID</text>
				<input class="edit-profile-input" :value="formState.displayId" @input="handleInput('displayId', $event)" />
			</view>

			<view class="edit-profile-field edit-profile-field--clickable" @tap="handleGenderSelect">
				<text class="edit-profile-label">性别</text>
				<text class="edit-profile-value">{{ formState.gender }}</text>
			</view>

			<view class="edit-profile-field edit-profile-field--clickable" @tap="handleBirthdaySelect">
				<text class="edit-profile-label">生日</text>
				<text class="edit-profile-value">{{ formState.birthday }}</text>
			</view>

			<view class="edit-profile-field edit-profile-field--clickable" @tap="handleLocationSelect">
				<text class="edit-profile-label">所在地</text>
				<text class="edit-profile-value">{{ formState.locationText }}</text>
			</view>
		</UserSectionCard>

		<template #footer>
			<view class="edit-profile-footer-button" @tap="handleSave">保存资料</view>
		</template>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getEditProfilePageMock } from '@/components/user-center/userCenterMock.js'

const coverBackgroundList = [
	'linear-gradient(135deg, #fdf2f8 0%, #e0f2fe 100%)',
	'linear-gradient(135deg, #ecfeff 0%, #fef3c7 100%)',
	'linear-gradient(135deg, #eff6ff 0%, #fce7f3 100%)'
]
const avatarBackgroundList = [
	'linear-gradient(135deg, #fe2c55 0%, #fb7185 100%)',
	'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
	'linear-gradient(135deg, #10b981 0%, #22c55e 100%)'
]

const pageMock = ref(getEditProfilePageMock())
const formState = ref({ ...pageMock.value.formState })
const coverIndex = ref(0)
const avatarIndex = ref(0)

onLoad((options) => {
	pageMock.value = getEditProfilePageMock(options?.userId)
	formState.value = { ...pageMock.value.formState }
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleInput(field, event) {
	formState.value = {
		...formState.value,
		[field]: event.detail.value
	}
	onFieldChange(field, formState.value[field])
}

function handleAvatarChange() {
	avatarIndex.value = (avatarIndex.value + 1) % avatarBackgroundList.length
	formState.value = {
		...formState.value,
		avatarBackground: avatarBackgroundList[avatarIndex.value]
	}
	onFieldChange('avatarBackground', formState.value.avatarBackground)
}

function handleCoverChange() {
	coverIndex.value = (coverIndex.value + 1) % coverBackgroundList.length
	formState.value = {
		...formState.value,
		coverBackground: coverBackgroundList[coverIndex.value]
	}
	onFieldChange('coverBackground', formState.value.coverBackground)
}

function handleGenderSelect() {
	const nextGender = formState.value.gender === '女' ? '男' : '女'
	formState.value = {
		...formState.value,
		gender: nextGender
	}
	onFieldChange('gender', nextGender)
}

function handleBirthdaySelect() {
	formState.value = {
		...formState.value,
		birthday: formState.value.birthday === '1998-08-16' ? '1999-12-06' : '1998-08-16'
	}
	onFieldChange('birthday', formState.value.birthday)
}

function handleLocationSelect() {
	formState.value = {
		...formState.value,
		locationText: formState.value.locationText === '广东省-深圳市-南山区' ? '广东省-广州市-天河区' : '广东省-深圳市-南山区'
	}
	onFieldChange('locationText', formState.value.locationText)
}

function handleSave() {
	onSaveProfile(formState.value)
	uni.showToast({
		title: '保存资料占位',
		icon: 'none'
	})
}

function onFieldChange(field, value) {
	// TODO：替换编辑资料字段变更逻辑
	console.log('user-edit-profile-field-change', field, value)
}

function onSaveProfile(payload) {
	// TODO：替换保存个人资料接口
	console.log('user-edit-profile-save', payload.nickname, payload.displayId)
}
</script>

<style scoped>
.edit-profile-section-gap {
	margin-top: 20rpx;
}

.edit-profile-cover {
	position: relative;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	height: 220rpx;
	padding: 24rpx;
	border-radius: 28rpx;
}

.edit-profile-cover-text {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.edit-profile-cover-button,
.edit-profile-avatar-button,
.edit-profile-footer-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 999rpx;
	font-size: 24rpx;
	font-weight: 600;
}

.edit-profile-cover-button,
.edit-profile-avatar-button {
	height: 62rpx;
	padding: 0 20rpx;
	background: rgba(255, 255, 255, 0.88);
	color: #0f172a;
}

.edit-profile-avatar-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 24rpx;
}

.edit-profile-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
}

.edit-profile-avatar-text {
	font-size: 42rpx;
	font-weight: 700;
	color: #ffffff;
}

.edit-profile-field + .edit-profile-field {
	margin-top: 22rpx;
	padding-top: 22rpx;
	border-top: 1rpx solid #eef2f7;
}

.edit-profile-label {
	display: block;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.edit-profile-input,
.edit-profile-textarea,
.edit-profile-value {
	display: block;
	width: 100%;
	margin-top: 12rpx;
	font-size: 26rpx;
	line-height: 36rpx;
	color: #0f172a;
}

.edit-profile-textarea {
	min-height: 160rpx;
}

.edit-profile-field--clickable {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.edit-profile-field--clickable .edit-profile-value {
	width: auto;
	margin-top: 0;
	text-align: right;
}

.edit-profile-footer-button {
	height: 88rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	color: #ffffff;
}
</style>
