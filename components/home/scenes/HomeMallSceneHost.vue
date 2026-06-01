<template>
	<ShopTab
		ref="sceneRef"
		:active="active"
		:active-category-id="activeCategoryId"
	/>
</template>

<script setup>
import { ref } from 'vue'
import ShopTab from '@/components/home/shop/ShopTab.vue'

defineProps({
	active: {
		type: Boolean,
		default: false
	},
	activeCategoryId: {
		type: String,
		default: 'recommend'
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
