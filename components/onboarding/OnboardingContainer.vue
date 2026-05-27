<template>
	<view class="onboarding-container">
		<view
			v-if="welcomeSceneMounted"
			v-show="activeScene === 'welcome' || loginEntering"
			:class="['onboarding-scene-layer', loginEntering ? 'onboarding-scene-layer-welcome-leave' : '']"
		>
			<WelcomeScene @complete="handleWelcomeComplete" @skip="handleWelcomeSkip" />
		</view>

		<view
			v-if="loginSceneMounted"
			v-show="activeScene === 'login' || loginEntering"
			:class="['onboarding-scene-layer', loginEntering ? 'onboarding-scene-layer-login-enter' : '']"
		>
			<LoginScene :active="activeScene === 'login'" />
		</view>
	</view>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LoginScene from '@/components/onboarding/LoginScene.vue'
import WelcomeScene from '@/components/onboarding/WelcomeScene.vue'
import {
	markOnboardingWelcomeSeen,
	resolveOnboardingInitialScene
} from '@/composables/useOnboardingGate.js'

const LOGIN_SCENE_PREMOUNT_DELAY = 160
const LOGIN_SCENE_ENTER_DURATION = 520

const activeScene = ref(resolveOnboardingInitialScene())
const welcomeSceneMounted = ref(activeScene.value === 'welcome')
const loginSceneMounted = ref(activeScene.value === 'login')
const loginEntering = ref(false)

let loginPremountTimer = null
let loginEnterTimer = null

onMounted(() => {
	if (activeScene.value !== 'welcome') {
		loginSceneMounted.value = true
		return
	}

	scheduleLoginScenePremount()
})

onBeforeUnmount(() => {
	clearLoginScenePremountTimer()
	clearLoginEnterTimer()
})

function handleWelcomeComplete(payload) {
	onWelcomeComplete(payload)
	openLoginScene()
}

function handleWelcomeSkip(payload) {
	onWelcomeSkip(payload)
	openLoginScene()
}

function openLoginScene() {
	clearLoginScenePremountTimer()
	clearLoginEnterTimer()
	loginSceneMounted.value = true
	loginEntering.value = true
	activeScene.value = 'login'
	loginEnterTimer = setTimeout(() => {
		loginEnterTimer = null
		loginEntering.value = false
		welcomeSceneMounted.value = false
		markOnboardingWelcomeSeen()
	}, LOGIN_SCENE_ENTER_DURATION)
}

function scheduleLoginScenePremount() {
	clearLoginScenePremountTimer()
	loginPremountTimer = setTimeout(() => {
		loginPremountTimer = null
		loginSceneMounted.value = true
	}, LOGIN_SCENE_PREMOUNT_DELAY)
}

function clearLoginScenePremountTimer() {
	if (!loginPremountTimer) {
		return
	}

	clearTimeout(loginPremountTimer)
	loginPremountTimer = null
}

function clearLoginEnterTimer() {
	if (!loginEnterTimer) {
		return
	}

	clearTimeout(loginEnterTimer)
	loginEnterTimer = null
}

function onWelcomeComplete(payload) {
	// TODO：替换 onboarding 完成埋点
	console.log('onboarding-welcome-complete', payload?.source, payload?.slideId)
}

function onWelcomeSkip(payload) {
	// TODO：替换 onboarding 跳过埋点
	console.log('onboarding-welcome-skip', payload?.source, payload?.slideId)
}
</script>

<style scoped>
.onboarding-container {
	position: relative;
	min-height: 100vh;
	background: #f8fafc;
	overflow: hidden;
}

.onboarding-scene-layer {
	position: absolute;
	inset: 0;
}

.onboarding-scene-layer-login-enter {
	animation: onboarding-login-enter 520ms cubic-bezier(0.2, 0.82, 0.2, 1) both;
}

.onboarding-scene-layer-welcome-leave {
	animation: onboarding-welcome-leave 520ms cubic-bezier(0.2, 0.82, 0.2, 1) both;
}

@keyframes onboarding-login-enter {
	0% {
		transform: translate3d(100%, 0, 0);
	}

	100% {
		transform: translate3d(0, 0, 0);
	}
}

@keyframes onboarding-welcome-leave {
	0% {
		opacity: 1;
		transform: translate3d(0, 0, 0) scale(1);
	}

	100% {
		opacity: 0.82;
		transform: translate3d(0, 0, 0) scale(1.015);
	}
}
</style>
