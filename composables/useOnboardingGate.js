const ONBOARDING_WELCOME_HIDDEN_KEY = 'qianyu-onboarding-welcome-hidden'

export function shouldShowOnboardingWelcome() {
	return uni.getStorageSync(ONBOARDING_WELCOME_HIDDEN_KEY) !== 1
}

export function resolveOnboardingInitialScene() {
	return shouldShowOnboardingWelcome() ? 'welcome' : 'login'
}

export function setOnboardingWelcomeHidden(hidden = true) {
	if (hidden) {
		uni.setStorageSync(ONBOARDING_WELCOME_HIDDEN_KEY, 1)
		return
	}

	uni.removeStorageSync(ONBOARDING_WELCOME_HIDDEN_KEY)
}

export function markOnboardingWelcomeSeen() {
	setOnboardingWelcomeHidden(true)
}

export function resetOnboardingWelcomeSeen() {
	setOnboardingWelcomeHidden(false)
}
