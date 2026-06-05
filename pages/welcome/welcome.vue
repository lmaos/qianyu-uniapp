<template>
	<OnboardingContainer />
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { hasValidLoginSession } from '@/composables/useLoginSession.js'
import OnboardingContainer from '@/components/onboarding/OnboardingContainer.vue'

/**
 * 启动时检查登录态：已登录直接跳首页，未登录正常走欢迎/登录流程。
 * 在 onLoad 中执行，此时页面尚未渲染，不会出现闪屏。
 */
onLoad(() => {
  if (hasValidLoginSession()) {
    uni.reLaunch({ url: '/pages/index/index' })
  }
})
</script>
