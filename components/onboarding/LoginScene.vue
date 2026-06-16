<template>
	<view class="page-shell">
		<image class="page-background-image" src="/static/images/auth/login-bg-gs.jpg" mode="aspectFill" />

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
			</view>
		</view>
	</view>
</template>

<script setup>
import { watch } from 'vue'
import { useLoginAgreement } from '@/composables/useLoginAgreement.js'
import {
	LOGIN_REDIRECT_QUERY_KEY,
	getLoginRedirectFromCurrentPage,
	redirectAfterLogin,
	saveLoginInfo
} from '@/composables/useLoginSession.js'
import { wechatLoginFull } from '@/composables/useWechatLogin.js'

const props = defineProps({
	active: {
		type: Boolean,
		default: true
	}
})

const loginMock = {
	title: '登录',
	subtitle: '继续使用千隅',
	phoneButtonText: '手机号登录',
	wechatButtonText: '微信快捷登录',
	socialList: [
		{ key: 'google', label: 'Google', icon: '/static/images/auth/icons/google.svg' },
		{ key: 'qq', label: 'QQ', icon: '/static/images/auth/icons/qq.svg' },
		{ key: 'wechat-lite', label: '微信', icon: '/static/images/auth/icons/wechat.svg' }
	]
}

const {
	agreed,
	syncAgreementState,
	toggleAgreement,
	ensureAgreementAccepted,
	openAgreementPage
} = useLoginAgreement()

watch(
	() => props.active,
	(value) => {
		if (value) {
			syncAgreementState()
		}
	},
	{
		immediate: true
	}
)

async function handlePhoneLoginClick() {
	if (!(await ensureAgreementAccepted())) {
		return
	}

	onPhoneLogin()
	const redirect = getLoginRedirectFromCurrentPage()
	uni.navigateTo({
		url: redirect
			? `/pages/login/phone-login?${LOGIN_REDIRECT_QUERY_KEY}=${encodeURIComponent(redirect)}`
			: '/pages/login/phone-login'
	})
}

async function handleWechatLoginClick() {
	if (!(await ensureAgreementAccepted())) {
		return
	}

	onWechatLogin()
	await doWechatLogin('wechat')
}

async function handleSocialLoginClick(item) {
	if (!(await ensureAgreementAccepted())) {
		return
	}

	if (item.key === 'google') {
		onGoogleLogin()
		mockSocialLoginSuccess('Google 登录成功', 'google')
		return
	}

	if (item.key === 'qq') {
		onQqLogin()
		mockSocialLoginSuccess('QQ 登录成功', 'qq')
		return
	}

	onWechatLogin()
	await doWechatLogin('wechat-lite')
}

function handleAgreementLinkClick(type) {
	openAgreementPage(type)
}

/**
 * mock 社交登录也走统一登录态和统一回跳逻辑，
 * 这样后续替换微信 SDK / 第三方登录接口时，不需要再改页面流转协议。
 */
function mockSocialLoginSuccess(title, provider) {
	const now = Date.now()
	const redirect = getLoginRedirectFromCurrentPage()
	saveLoginInfo({
		token: `mock-${provider}-token-${now}`,
		expireMs: now + 7 * 24 * 60 * 60 * 1000,
		nickname: `${provider}用户`,
		userNo: `QY${String(now).slice(-6)}`,
		avatar: '',
		liveAuth: true,
		shopAuth: true,
		loginType: provider
	})

	uni.showToast({
		title,
		icon: 'none'
	})

	setTimeout(() => {
		redirectAfterLogin({
			redirect
		})
	}, 800)
}

/**
 * 微信登录真实流程
 * 提取成公共方法，供 big button 和 social grid 共用
 */
async function doWechatLogin(loginType) {
	try {
		const result = await wechatLoginFull()
		if (!result) {
			// 用户取消授权，不做任何事
			return
		}
		const { token, userInfo } = result
		const redirect = getLoginRedirectFromCurrentPage()
		saveLoginInfo({
			token,
			expireMs: Date.now() + 7 * 24 * 60 * 60 * 1000,
			nickname: userInfo.nickname,
			userNo: userInfo.userNo,
			userId: userInfo.userId,
			avatar: userInfo.avatar || '',
			liveAuth: true,
			shopAuth: true,
			loginType
		})
		uni.showToast({ title: '登录成功', icon: 'none' })
		setTimeout(() => {
			redirectAfterLogin({ redirect })
		}, 800)
	} catch (err) {
		console.error('[wechat-login]', err)
		uni.showToast({ title: err.message || '微信登录失败', icon: 'none' })
	}
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
	inset: 0;
	width: 100%;
	height: 100%;
}

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
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		rgba(255, 255, 255, 0.34);
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
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		rgba(255, 255, 255, 0.5);
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
</style>
