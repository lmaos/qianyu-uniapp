import { ref } from 'vue'

const AGREEMENT_STORAGE_KEY = 'qianyu.login.agreement.accepted'

const AGREEMENT_PAGE_CONFIG = {
	user: {
		title: '用户协议'
	},
	privacy: {
		title: '隐私政策'
	}
}

function readAgreementAccepted() {
	try {
		return uni.getStorageSync(AGREEMENT_STORAGE_KEY) === true
	} catch (error) {
		return false
	}
}

function persistAgreementAccepted(value) {
	try {
		if (value) {
			uni.setStorageSync(AGREEMENT_STORAGE_KEY, true)
			return
		}

		uni.removeStorageSync(AGREEMENT_STORAGE_KEY)
	} catch (error) {
		console.warn('login-agreement-persist-failed', error)
	}
}

function showAgreementToast(title) {
	uni.showToast({
		title,
		icon: 'none'
	})
}

function quitAppAfterDecline() {
	// #ifdef APP-PLUS
	setTimeout(() => {
		plus.runtime.quit()
	}, 120)
	// #endif
}

function promptAgreementAuthorization() {
	return new Promise((resolve) => {
		const handleAccept = () => {
			resolve(true)
		}

		const handleReject = () => {
			showAgreementToast('需同意隐私政策后继续使用')
			quitAppAfterDecline()
			resolve(false)
		}

		// #ifdef APP-PLUS
		if (typeof uni.showPrivacyDialog === 'function') {
			uni.showPrivacyDialog({
				success: handleAccept,
				fail: handleReject
			})
			return
		}
		// #endif

		uni.showModal({
			title: '隐私保护提示',
			content: '请先阅读并同意《用户协议》与《隐私政策》，同意后才可继续登录使用。',
			confirmText: '确定',
			cancelText: '取消',
			success: ({ confirm }) => {
				if (confirm) {
					handleAccept()
					return
				}

				handleReject()
			},
			fail: handleReject
		})
	})
}

export function buildAgreementPageUrl(type = 'user') {
	const normalizedType = type === 'privacy' ? 'privacy' : 'user'
	return `/pages/login/agreement?type=${normalizedType}`
}

export function getAgreementPageTitle(type = 'user') {
	const normalizedType = type === 'privacy' ? 'privacy' : 'user'
	return AGREEMENT_PAGE_CONFIG[normalizedType].title
}

export function useLoginAgreement() {
	const agreed = ref(readAgreementAccepted())

	function syncAgreementState() {
		agreed.value = readAgreementAccepted()
	}

	function updateAgreementState(value, options = {}) {
		const { silent = false } = options
		agreed.value = value
		persistAgreementAccepted(value)

		if (!silent) {
			showAgreementToast(value ? '已同意协议' : '已取消勾选')
		}
	}

	async function toggleAgreement() {
		if (agreed.value) {
			updateAgreementState(false)
			return false
		}

		const accepted = await promptAgreementAuthorization()
		if (!accepted) {
			return false
		}

		updateAgreementState(true)
		return true
	}

	async function ensureAgreementAccepted() {
		if (agreed.value) {
			return true
		}

		const accepted = await promptAgreementAuthorization()
		if (!accepted) {
			return false
		}

		updateAgreementState(true)
		return true
	}

	function openAgreementPage(type) {
		uni.navigateTo({
			url: buildAgreementPageUrl(type)
		})
	}

	return {
		agreed,
		syncAgreementState,
		toggleAgreement,
		ensureAgreementAccepted,
		openAgreementPage
	}
}
