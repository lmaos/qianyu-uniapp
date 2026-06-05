<template>
	<view class="page-shell">
		<image class="page-background-image" src="/static/images/auth/login-bg-gs.jpg" mode="aspectFill" />

		<view class="page-content">
			<view class="top-bar">
				<view class="back-button" @tap="handleBackClick">返回</view>
			</view>

			<view class="hero-copy">
				<text class="hero-caption">手机号登录</text>
				<text class="hero-title">欢迎回来</text>
			</view>

			<view class="form-sheet">
				<view class="nav-bar">
					<view
						v-for="item in TABS"
						:key="item.key"
						:class="['nav-item', activeTab === item.key ? 'nav-item-active' : '']"
						@tap="handleTabClick(item.key)"
					>
						<text :class="['nav-text', activeTab === item.key ? 'nav-text-active' : '']">
							{{ item.label }}
						</text>
					</view>
				</view>

				<template v-if="activeTab === 'code'">
					<view class="field-group">
						<text class="field-label">手机号</text>
						<input
							v-model="codeForm.phone"
							class="form-input"
							type="number"
							maxlength="11"
							placeholder="请输入手机号"
							placeholder-class="input-placeholder"
						/>
					</view>

					<view class="field-group">
						<text class="field-label">验证码</text>
						<view class="code-row">
							<input
								v-model="codeForm.code"
								class="form-input code-input"
								type="number"
								maxlength="6"
								placeholder="请输入验证码"
								placeholder-class="input-placeholder"
							/>
							<view class="code-button" @tap="handleCodeButtonClick">
								{{ codeButtonText }}
							</view>
						</view>
					</view>
				</template>

				<template v-else>
					<view class="field-group">
						<text class="field-label">手机号</text>
						<input
							v-model="passwordForm.phone"
							class="form-input"
							type="number"
							maxlength="11"
							placeholder="请输入手机号"
							placeholder-class="input-placeholder"
						/>
					</view>

					<view class="field-group">
						<text class="field-label">密码</text>
						<input
							v-model="passwordForm.password"
							class="form-input"
							password
							maxlength="20"
							placeholder="请输入密码"
							placeholder-class="input-placeholder"
						/>
					</view>
				</template>

				<view class="agreement-row" @tap="toggleAgreement">
					<view :class="['agreement-checkbox', agreed ? 'agreement-checkbox-active' : '']">
						<text class="agreement-checkbox-text">{{ agreed ? '√' : '' }}</text>
					</view>
					<text class="agreement-text">我已阅读并同意</text>
					<text class="agreement-link" @tap.stop="handleAgreementLinkClick('user')">《用户协议》</text>
					<text class="agreement-text">和</text>
					<text class="agreement-link" @tap.stop="handleAgreementLinkClick('privacy')">《隐私政策》</text>
				</view>

				<view
					:class="['submit-button', submitting ? 'submit-button-disabled' : '']"
					@tap="handleSubmit"
				>
					{{ submitting ? '登录中...' : '登录' }}
				</view>

				<view class="mock-tip-card">
					<text class="mock-tip-title">测试账号</text>
					<text class="mock-tip-text">手机号 13800138000，验证码 123456，密码 qianyu123</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useLoginAgreement } from '@/composables/useLoginAgreement.js'
import { redirectAfterLogin, resolveLoginRedirect, saveLoginInfo } from '@/composables/useLoginSession.js'
import { stopAll } from '@/composables/appStartup.js'
import request from '@/composables/baseRequest.js'

const TABS = [
	{ key: 'code', label: '验证码登录' },
	{ key: 'password', label: '密码登录' }
]

const activeTab = ref('code')
const countdown = ref(0)
const codeForm = ref({
	phone: '',
	code: ''
})
const passwordForm = ref({
	phone: '',
	password: ''
})
const redirectUrl = ref('')
const submitting = ref(false)

let countdownTimer = null

const {
	agreed,
	syncAgreementState,
	toggleAgreement,
	ensureAgreementAccepted,
	openAgreementPage
} = useLoginAgreement()

const codeButtonText = computed(() => {
	return countdown.value > 0 ? `${countdown.value}s后重试` : '获取验证码'
})

onShow(() => {
	stopAll()
	syncAgreementState()
})

onLoad((options) => {
	redirectUrl.value = resolveLoginRedirect(options?.redirect)
})

// ── 工具函数 ─────────────────────────────────────

/**
 * 校验 11 位纯手机号
 */
function isValidPhone(phone) {
	return /^1\d{10}$/.test(phone)
}

/**
 * 将 11 位纯手机号转为 API 要求的 +86-xxxxxxxxxxx 格式
 */
function formatPhoneToApi(rawPhone) {
	return `+86-${rawPhone}`
}

function clearCountdown() {
	if (!countdownTimer) {
		return
	}

	clearInterval(countdownTimer)
	countdownTimer = null
}

function startCountdown() {
	countdown.value = 60
	clearCountdown()
	countdownTimer = setInterval(() => {
		if (countdown.value <= 1) {
			clearCountdown()
			countdown.value = 0
			return
		}

		countdown.value -= 1
	}, 1000)
}

/**
 * 登录成功后优先回到触发登录的业务页；如果没有 redirect，再回首页。
 */
function redirectAfterAuth() {
	submitting.value = false
	console.log('[phone-login] 登录成功，开始跳转, redirectUrl:', redirectUrl.value)
	setTimeout(() => {
		const target = redirectAfterLogin({
			redirect: redirectUrl.value
		})
		console.log('[phone-login] redirectAfterLogin 返回:', target)
	}, 100)
}

// ── 发送验证码 ──────────────────────────────────

async function handleCodeButtonClick() {
	if (countdown.value > 0) {
		uni.showToast({ title: '验证码已发送', icon: 'none' })
		return
	}

	if (!isValidPhone(codeForm.value.phone)) {
		uni.showToast({ title: '请输入正确手机号', icon: 'none' })
		return
	}

	const phone = formatPhoneToApi(codeForm.value.phone)

	try {
		console.log('[phone-login] 发送验证码请求:', { phone })
		const res = await request.post({
			url: '/api/user/login/phone/verify_code',
			type: 'json',
			data: { phone }
		})
		console.log('[phone-login] 发送验证码响应:', { code: res.code, status: res.response?.status, message: res.response?.message })

		// HTTP 层面失败（4xx/5xx）— baseRequest 已 toast，这里不再重复提示
		if (res.code !== 200) {
			return
		}

		// 业务层面失败（status !== 0）
		if (res.response && Number(res.response.status) !== 0) {
			uni.showToast({
				title: res.response.message || '发送失败，请稍后重试',
				icon: 'none'
			})
			return
		}

		// 成功 → 开始倒计时
		startCountdown()
		onCodeRequest({ phone })
	} catch (err) {
		// 5xx / 网络异常 — baseRequest 已 toast
		console.error('[send-verify-code]', err)
	}
}

// ── 页面处理 ────────────────────────────────────

function handleBackClick() {
	onBackClick()
	uni.navigateBack()
}

function handleTabClick(tabKey) {
	activeTab.value = tabKey
	onTabChange(tabKey)
}

function handleAgreementLinkClick(type) {
	openAgreementPage(type)
}

async function handleSubmit() {
	if (submitting.value) {
		return
	}

	if (!(await ensureAgreementAccepted())) {
		return
	}

	if (activeTab.value === 'code') {
		await submitCodeLogin()
		return
	}

	await submitPasswordLogin()
}

// ── 验证码登录 ──────────────────────────────────

async function submitCodeLogin() {
	if (!isValidPhone(codeForm.value.phone)) {
		uni.showToast({ title: '请输入正确手机号', icon: 'none' })
		return
	}

	if (!codeForm.value.code) {
		uni.showToast({ title: '请输入验证码', icon: 'none' })
		return
	}

	submitting.value = true

	try {
		const loginData = {
			phone: formatPhoneToApi(codeForm.value.phone),
			code: codeForm.value.code,
			authMode: 'CODE'
		}
		console.log('[phone-login] 验证码登录请求:', { phone: loginData.phone, code: '***' })
		const res = await request.post({
			url: '/api/user/login/phone',
			type: 'json',
			data: loginData
		})
		console.log('[phone-login] 验证码登录响应:', { code: res.code, status: res.response?.status, message: res.response?.message })

		if (res.code !== 200) {
			submitting.value = false
			return
		}

		// 登录成功
		const { token, userInfo } = res.response.content
		saveLoginInfo({
			token,
			expireMs: Date.now() + 7 * 24 * 60 * 60 * 1000,
			nickname: userInfo.nickname,
			userNo: userInfo.userNo,
			userId: userInfo.userId,
			avatar: userInfo.avatar || '',
			liveAuth: true,
			shopAuth: true,
			phone: userInfo.phone,
			loginType: 'phone-code'
		})

		onCodeLogin({ phone: codeForm.value.phone, code: codeForm.value.code })
		uni.showToast({ title: '登录成功', icon: 'none' })
		redirectAfterAuth()
	} catch (err) {
		submitting.value = false
		console.error('[code-login]', err)
	}
}

// ── 密码登录 ────────────────────────────────────

async function submitPasswordLogin() {
	if (!isValidPhone(passwordForm.value.phone)) {
		uni.showToast({ title: '请输入正确手机号', icon: 'none' })
		return
	}

	if (!passwordForm.value.password) {
		uni.showToast({ title: '请输入密码', icon: 'none' })
		return
	}

	submitting.value = true

	try {
		const loginData = {
			phone: formatPhoneToApi(passwordForm.value.phone),
			password: passwordForm.value.password,
			authMode: 'PASSWORD'
		}
		console.log('[phone-login] 密码登录请求:', { phone: loginData.phone, password: '***' })
		const res = await request.post({
			url: '/api/user/login/phone',
			type: 'json',
			data: loginData
		})
		console.log('[phone-login] 密码登录响应:', { code: res.code, status: res.response?.status, message: res.response?.message })

		if (res.code !== 200) {
			submitting.value = false
			return
		}

		// 登录成功
		const { token, userInfo } = res.response.content
		saveLoginInfo({
			token,
			expireMs: Date.now() + 7 * 24 * 60 * 60 * 1000,
			nickname: userInfo.nickname,
			userNo: userInfo.userNo,
			userId: userInfo.userId,
			avatar: userInfo.avatar || '',
			liveAuth: true,
			shopAuth: true,
			phone: userInfo.phone,
			loginType: 'phone-password'
		})

		onPasswordLogin({ phone: passwordForm.value.phone, password: passwordForm.value.password })
		uni.showToast({ title: '登录成功', icon: 'none' })
		redirectAfterAuth()
	} catch (err) {
		submitting.value = false
		console.error('[password-login]', err)
	}
}

// ── 生命周期 / 埋点 ─────────────────────────────

function onBackClick() {
	console.log('phone-login-back')
}

function onTabChange(tabKey) {
	console.log('phone-login-tab-change', tabKey)
}

function onCodeRequest(payload) {
	console.log('phone-login-code-request', payload.phone)
}

function onCodeLogin(payload) {
	console.log('phone-login-code-submit', payload.phone, payload.code)
}

function onPasswordLogin(payload) {
	console.log('phone-login-password-submit', payload.phone)
}

onUnmounted(() => {
	clearCountdown()
})
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
	min-height: 100vh;
	padding: 92rpx 40rpx 48rpx;
	box-sizing: border-box;
}

.top-bar {
	display: flex;
	align-items: center;
}

.back-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 64rpx;
	padding: 0 28rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.5);
	border-radius: 999rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		rgba(255, 255, 255, 0.38);
	font-size: 24rpx;
	color: #334155;
}

.hero-copy {
	margin-top: 60rpx;
}

.hero-caption {
	display: block;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.hero-title {
	display: block;
	margin-top: 12rpx;
	font-size: 58rpx;
	font-weight: 600;
	line-height: 78rpx;
	color: #0f172a;
}

.form-sheet {
	margin-top: 56rpx;
	padding: 40rpx 32rpx 34rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.58);
	border-radius: 40rpx;
	background:
		url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat,
		rgba(255, 255, 255, 0.52);
	box-shadow: 0 24rpx 56rpx rgba(148, 163, 184, 0.14);
}

.nav-bar {
	display: flex;
	padding: 10rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.72);
}

.nav-item {
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	height: 70rpx;
	border-radius: 999rpx;
}

.nav-item-active {
	background: linear-gradient(135deg, rgba(254, 44, 85, 0.12) 0%, rgba(251, 113, 133, 0.18) 100%);
}

.nav-text {
	font-size: 28rpx;
	line-height: 38rpx;
	color: #98a2b3;
}

.nav-text-active {
	font-weight: 600;
	color: #0f172a;
}

.field-group {
	margin-top: 24rpx;
}

.field-label {
	display: block;
	margin-bottom: 14rpx;
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #334155;
}

.form-input {
	width: 100%;
	height: 102rpx;
	padding: 0 30rpx;
	border-radius: 26rpx;
	background: rgba(255, 255, 255, 0.86);
	box-sizing: border-box;
	font-size: 28rpx;
	color: #0f172a;
}

.input-placeholder {
	color: #98a2b3;
}

.code-row {
	display: flex;
	align-items: center;
}

.code-input {
	flex: 1;
	margin-right: 20rpx;
}

.code-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 224rpx;
	height: 102rpx;
	border-radius: 26rpx;
	background: rgba(255, 255, 255, 0.88);
	font-size: 24rpx;
	font-weight: 600;
	color: #334155;
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

.submit-button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 102rpx;
	margin-top: 38rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	box-shadow: 0 18rpx 38rpx rgba(254, 44, 85, 0.22);
	font-size: 30rpx;
	font-weight: 600;
	color: #ffffff;
}

.submit-button-disabled {
	opacity: 0.5;
	pointer-events: none;
}

.mock-tip-card {
	margin-top: 28rpx;
	padding: 28rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.62);
}

.mock-tip-title {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	line-height: 38rpx;
	color: #0f172a;
}

.mock-tip-text {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 34rpx;
	color: #667085;
}
</style>
