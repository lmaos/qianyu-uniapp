<template>
	<LoginScene :active="true" />
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { stopAll } from '@/composables/appStartup.js'
import LoginScene from '@/components/onboarding/LoginScene.vue'

onShow(() => {
	stopAll()
})
</script>
