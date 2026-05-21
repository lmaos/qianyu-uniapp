<template>
	<view class="user-virtual-rows">
		<view class="user-virtual-space" :style="{ height: `${totalHeightRpx}rpx` }">
			<view class="user-virtual-content" :style="{ transform: `translateY(${translateOffsetRpx}rpx)` }">
				<slot v-for="row in visibleRows" name="row" :row="row" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	rowList: {
		type: Array,
		default: () => []
	},
	rowStrideRpx: {
		type: Number,
		default: 0
	},
	parentScrollTopPx: {
		type: Number,
		default: 0
	},
	listStartOffsetPx: {
		type: Number,
		default: 0
	},
	visibleBufferRows: {
		type: Number,
		default: 12
	},
	active: {
		type: Boolean,
		default: true
	}
})

const systemInfo = uni.getSystemInfoSync()
const screenWidth = systemInfo.screenWidth || 375
const viewportHeightPx = systemInfo.windowHeight || systemInfo.screenHeight || 667

const effectiveParentScrollTop = computed(() => {
	return props.active ? props.parentScrollTopPx : 0
})

const rowStridePx = computed(() => {
	return Math.max(1, (props.rowStrideRpx * screenWidth) / 750)
})

const overscanRows = computed(() => {
	return Math.max(1, props.visibleBufferRows)
})

const visibleWindowRows = computed(() => {
	return Math.max(1, Math.ceil(viewportHeightPx / rowStridePx.value) + 1)
})

const rawStartRowIndex = computed(() => {
	const relativeScrollTop = Math.max(0, effectiveParentScrollTop.value - props.listStartOffsetPx)
	return Math.max(0, Math.floor(relativeScrollTop / rowStridePx.value))
})

const startRowIndex = computed(() => {
	return Math.max(0, rawStartRowIndex.value - overscanRows.value)
})

const endRowIndex = computed(() => {
	return Math.min(
		props.rowList.length,
		rawStartRowIndex.value + visibleWindowRows.value + overscanRows.value
	)
})

const visibleRows = computed(() => {
	return props.rowList.slice(startRowIndex.value, endRowIndex.value)
})

const totalHeightRpx = computed(() => {
	return props.rowList.length * props.rowStrideRpx
})

const translateOffsetRpx = computed(() => {
	return startRowIndex.value * props.rowStrideRpx
})
</script>

<style scoped>
.user-virtual-space {
	position: relative;
	width: 100%;
}

.user-virtual-content {
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
}
</style>
