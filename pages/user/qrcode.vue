<template>
	<UserSubPageLayout title="我的二维码" @back="handleBack">
		<UserSectionCard class="qrcode-profile-card">
			<view class="qrcode-avatar" :style="{ background: pageMock.avatarBackground }">
				<text class="qrcode-avatar-text">{{ pageMock.avatarText }}</text>
			</view>

			<text class="qrcode-name">{{ pageMock.nickname }}</text>
			<text class="qrcode-id">ID：{{ pageMock.displayId }}</text>
			<text class="qrcode-intro">扫一扫二维码，快速查看我的主页并发起互动。</text>
		</UserSectionCard>

		<UserSectionCard class="qrcode-card">
			<view class="qrcode-box">
				<image class="qrcode-box-image" :src="userCenterQrPanelIconSvg" mode="aspectFit" />
			</view>

			<text class="qrcode-box-text">{{ pageMock.qrcodeText }}</text>
			<view class="qrcode-button" @tap="handleSave">保存二维码</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { userCenterQrPanelIconSvg } from '@/components/user-center/main/userCenterIcons.js'
import { getQrCodePageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getQrCodePageMock())

onLoad((options) => {
	pageMock.value = getQrCodePageMock(options?.userId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleSave() {
	onSaveQrCode(pageMock.value)
	uni.showToast({
		title: '保存二维码占位',
		icon: 'none'
	})
}

function onSaveQrCode(payload) {
	// TODO：替换二维码保存逻辑
	console.log('user-qrcode-save', payload.displayId)
}
</script>

<style scoped>
.qrcode-profile-card,
.qrcode-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 40rpx;
	padding-bottom: 40rpx;
}

.qrcode-card {
	margin-top: 20rpx;
}

.qrcode-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
}

.qrcode-avatar-text {
	font-size: 52rpx;
	font-weight: 700;
	color: #ffffff;
}

.qrcode-name,
.qrcode-id,
.qrcode-intro,
.qrcode-box-text {
	display: block;
}

.qrcode-name {
	margin-top: 20rpx;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.qrcode-id {
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.qrcode-intro {
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #475467;
	text-align: center;
}

.qrcode-box {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 420rpx;
	height: 420rpx;
	margin-top: 28rpx;
	padding: 24rpx;
	border-radius: 36rpx;
	background: linear-gradient(180deg, #ffffff 0%, #fff8fb 100%);
	box-shadow: inset 0 0 0 1rpx rgba(255, 209, 223, 0.72);
	box-sizing: border-box;
}

.qrcode-box-image {
	width: 100%;
	height: 100%;
}

.qrcode-box-text {
	margin-top: 20rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #475467;
}

.qrcode-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 84rpx;
	margin-top: 30rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
