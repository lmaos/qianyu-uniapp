<template>
	<MallScene
		ref="sceneRef"
		:active="active"
	/>
</template>

<script setup>
// ════════════════════════════════════════════════════════════
// HomeMallSceneHost.vue — 商城场景壳层
// ════════════════════════════════════════════════════════════
//
// 渲染自包含的 MallScene 组件（tabList + zoneList + spuList 一站式）。
// 对外暴露 handleParentRefresh / handleParentReachLower，由 IndexContentShell 调度。

import { ref } from 'vue'
import MallScene from '@/components/home/shop/MallScene.vue'

defineProps({
	active: {
		type: Boolean,
		default: false
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
