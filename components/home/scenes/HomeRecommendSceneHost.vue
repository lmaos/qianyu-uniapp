<template>
	<RecommendTab
		ref="sceneRef"
		:active="active"
		:parent-scroll-top="parentScrollTop"
		:container-width-rpx="containerWidthRpx"
	/>
</template>

<script setup>
import { ref } from 'vue'
import RecommendTab from '@/components/home/recommend/RecommendTab.vue'

defineProps({
	active: {
		type: Boolean,
		default: false
	},
	parentScrollTop: {
		type: Number,
		default: 0
	},
	containerWidthRpx: {
		type: Number,
		default: 686
	}
})

const sceneRef = ref(null)

function handleParentRefresh() {
	return sceneRef.value?.handleParentRefresh?.() ?? Promise.resolve()
}

async function handleParentReachLower() {
	return (await sceneRef.value?.handleParentReachLower?.()) ?? { status: 'loaded' }
}

defineExpose({
	handleParentRefresh,
	handleParentReachLower
})
</script>
