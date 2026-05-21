<template>
	<view class="page-shell">
		<image class="page-background-image" src="/static/images/auth/login-bg.jpeg" mode="aspectFill" />
		<view class="page-background-mask"></view>

		<view class="page-content">
			<view class="top-copy">
				<view class="brand-chip">
					<text class="brand-chip-text">QIAN YU</text>
				</view>
				<text class="hero-title">{{ loginMock.title }}</text>
				<text class="hero-subtitle">{{ loginMock.subtitle }}</text>
			</view>

			<view class="login-sheet">
				<view class="primary-button" @tap="handlePhoneLoginClick">
					<text class="primary-button-text">{{ loginMock.phoneButtonText }}</text>
				</view>

				<view class="wechat-button" @tap="handleWechatLoginClick">
					<text class="wechat-button-text">{{ loginMock.wechatButtonText }}</text>
				</view>

				<view class="divider-row">
					<view class="divider-line"></view>
					<text class="divider-text">更多登录方式</text>
					<view class="divider-line"></view>
				</view>

				<view class="social-grid">
					<view
						v-for="item in loginMock.socialList"
						:key="item.key"
						class="social-item"
						@tap="handleSocialLoginClick(item)"
					>
						<view class="social-icon-wrap">
							<image class="social-icon" :src="item.icon" mode="aspectFit" />
						</view>
						<text class="social-label">{{ item.label }}</text>
					</view>
				</view>

				<view class="agreement-row" @tap="toggleAgreement">
					<view :class="['agreement-checkbox', agreed ? 'agreement-checkbox-active' : '']">
						<text class="agreement-checkbox-text">{{ agreed ? '√' : '' }}</text>
					</view>
					<text class="agreement-text">我已阅读并同意</text>
					<text class="agreement-link" @tap.stop="handleAgreementLinkClick('user')">《用户协议》</text>
					<text class="agreement-text">和</text>
					<text class="agreement-link" @tap.stop="handleAgreementLinkClick('privacy')">《隐私政策》</text>
				</view>

				<view class="mock-card">
					<text class="mock-card-title">{{ loginMock.mockTitle }}</text>
					<text class="mock-card-text">{{ loginMock.mockDesc }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const loginMock = {
	title: '登录',
	subtitle: '继续使用千隅',
	phoneButtonText: '手机号登录',
	wechatButtonText: '微信快捷登录',
	mockTitle: 'Mock 登录说明',
	mockDesc: 'TODO：替换真实登录 SDK、三方授权回调、用户信息换取与登录态持久化。',
	socialList: [
		{ key: 'google', label: 'Google', icon: '/static/images/auth/icons/google.svg' },
		{ key: 'qq', label: 'QQ', icon: '/static/images/auth/icons/qq.svg' },
		{ key: 'wechat-lite', label: '微信', icon: '/static/images/auth/icons/wechat.svg' }
	]
}

const agreed = ref(true)

function handlePhoneLoginClick() {
	if (!ensureAgreementAccepted()) {
		return
	}

	onPhoneLogin()
	uni.navigateTo({
		url: '/pages/login/phone-login'
	})
}

function handleWechatLoginClick() {
	if (!ensureAgreementAccepted()) {
		return
	}

	onWechatLogin()
	mockSocialLoginSuccess('微信登录成功')
}

function handleSocialLoginClick(item) {
	if (!ensureAgreementAccepted()) {
		return
	}

	if (item.key === 'google') {
		onGoogleLogin()
		mockSocialLoginSuccess('Google 登录成功')
		return
	}

	if (item.key === 'qq') {
		onQqLogin()
		mockSocialLoginSuccess('QQ 登录成功')
		return
	}

	onWechatLogin()
	mockSocialLoginSuccess('微信登录成功')
}

function toggleAgreement() {
	agreed.value = !agreed.value
	uni.showToast({
		title: agreed.value ? '已同意协议' : '已取消勾选',
		icon: 'none'
	})
}

function handleAgreementLinkClick(type) {
	uni.showToast({
		title: type === 'user' ? '用户协议占位' : '隐私政策占位',
		icon: 'none'
	})
}

function ensureAgreementAccepted() {
	if (agreed.value) {
		return true
	}

	uni.showToast({
		title: '请先勾选协议',
		icon: 'none'
	})
	return false
}

function mockSocialLoginSuccess(title) {
	uni.showToast({
		title,
		icon: 'none'
	})

	setTimeout(() => {
		uni.reLaunch({
			url: '/pages/index/index'
		})
	}, 800)
}

function onPhoneLogin() {
	// TODO：替换手机号登录入口埋点/接口
	console.log('login-phone-entry')
}

function onWechatLogin() {
	// TODO：替换微信授权 SDK 与后端登录接口
	console.log('login-wechat-entry')
}

function onGoogleLogin() {
	// TODO：替换 Google 登录 SDK 与后端登录接口
	console.log('login-google-entry')
}

function onQqLogin() {
	// TODO：替换 QQ 登录 SDK 与后端登录接口
	console.log('login-qq-entry')
}
</script>

<style scoped>
.page-shell {
	position: relative;
	min-height: 100vh;
	background: #f8fafc;
	overflow: hidden;
}

.page-background-image {
	position: absolute;
	inset: -56rpx;
	width: calc(100% + 112rpx);
	height: calc(100% + 112rpx);
	filter: blur(15rpx) saturate(1.04);
	transform: scale(1.18);
}
.page-background-mask {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(180deg, rgba(248, 250, 252, 0.08) 0%, rgba(248, 250, 252, 0.12) 24%, rgba(248, 250, 252, 0.38) 58%, rgba(248, 250, 252, 0.84) 100%),
				radial-gradient(circle at top right, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 34%);
}
/* .page-background-mask {
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at top right, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 30%),
		linear-gradient(180deg, rgba(248, 250, 252, 0.18) 0%, rgba(248, 250, 252, 0.58) 34%, rgba(248, 250, 252, 0.92) 100%);
} */

.page-content {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-height: 100vh;
	padding: 120rpx 40rpx 48rpx;
	box-sizing: border-box;
}

.top-copy {
	padding-top: 40rpx;
}

.brand-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 58rpx;
	padding: 0 24rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.5);
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.34);
	backdrop-filter: blur(18rpx);
	-webkit-backdrop-filter: blur(18rpx);
}

.brand-chip-text {
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
	letter-spacing: 4rpx;
	color: #fe2c55;
}

.hero-title {
	display: block;
	margin-top: 34rpx;
	font-size: 68rpx;
	font-weight: 600;
	line-height: 90rpx;
	color: #0f172a;
}

.hero-subtitle {
	display: block;
	width: 88%;
	margin-top: 18rpx;
	font-size: 26rpx;
	line-height: 38rpx;
	color: #667085;
}

.login-sheet {
	padding: 40rpx 32rpx 34rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.56);
	border-radius: 40rpx;
	background: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(30rpx);
	-webkit-backdrop-filter: blur(30rpx);
	box-shadow: 0 24rpx 56rpx rgba(148, 163, 184, 0.14);
}

.primary-button,
.wechat-button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 96rpx;
	border-radius: 999rpx;
}

.primary-button {
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	box-shadow: 0 18rpx 38rpx rgba(254, 44, 85, 0.22);
}

.primary-button-text,
.wechat-button-text {
	font-size: 30rpx;
	font-weight: 600;
	line-height: 40rpx;
}

.primary-button-text {
	color: #ffffff;
}

.wechat-button {
	margin-top: 22rpx;
	background: rgba(255, 255, 255, 0.78);
}

.wechat-button-text {
	color: #0f172a;
}

.divider-row {
	display: flex;
	align-items: center;
	margin-top: 34rpx;
}

.divider-line {
	flex: 1;
	height: 1rpx;
	background: rgba(152, 162, 179, 0.22);
}

.divider-text {
	padding: 0 20rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.social-grid {
	display: flex;
	justify-content: space-between;
	gap: 18rpx;
	margin-top: 28rpx;
}

.social-item {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
}

.social-icon-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 92rpx;
	height: 92rpx;
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.82);
	box-shadow: 0 12rpx 24rpx rgba(148, 163, 184, 0.1);
}

.social-icon {
	width: 40rpx;
	height: 40rpx;
}

.social-label {
	margin-top: 14rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.agreement-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	margin-top: 34rpx;
}

.agreement-checkbox {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32rpx;
	height: 32rpx;
	margin-right: 16rpx;
	border: 2rpx solid #cbd5e1;
	border-radius: 50%;
}

.agreement-checkbox-active {
	border-color: #fe2c55;
	background: #fe2c55;
}

.agreement-checkbox-text {
	font-size: 20rpx;
	line-height: 20rpx;
	color: #ffffff;
}

.agreement-text,
.agreement-link {
	font-size: 22rpx;
	line-height: 34rpx;
}

.agreement-text {
	color: #667085;
}

.agreement-link {
	color: #0f172a;
}

.mock-card {
	margin-top: 28rpx;
	padding: 26rpx 28rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.52);
}

.mock-card-title {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	line-height: 38rpx;
	color: #0f172a;
}

.mock-card-text {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 34rpx;
	color: #667085;
}
</style>
