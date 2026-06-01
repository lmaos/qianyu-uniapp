<template>
	<LiveTab
		ref="sceneRef"
		:active="active"
		:parent-scroll-top="parentScrollTop"
	/>
</template>

<script setup>
import { ref } from 'vue'
import LiveTab from '@/components/home/live/LiveTab.vue'

defineProps({
	active: {
		type: Boolean,
		default: false
	},
	parentScrollTop: {
		type: Number,
		default: 0
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
