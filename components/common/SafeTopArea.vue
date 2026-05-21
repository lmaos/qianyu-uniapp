<template>
	<view class="safe-top-area" :style="resolvedAreaStyle">
		<view class="safe-top-area-inner" :style="resolvedInnerStyle">
			<slot :safe-top-px="safeTopPx" :safe-gap-px="safeGapPx" />
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'

const props = defineProps({
	fixed: {
		type: Boolean,
		default: true
	},
	safeGapRpx: {
		type: Number,
		default: 0
	},
	sidePaddingRpx: {
		type: Number,
		default: 0
	},
	innerMinHeightRpx: {
		type: Number,
		default: 0
	},
	background: {
		type: String,
		default: 'transparent'
	},
	borderBottom: {
		type: String,
		default: ''
	},
	boxShadow: {
		type: String,
		default: ''
	},
	zIndex: {
		type: [Number, String],
		default: 20
	},
	areaStyle: {
		type: [Object, Array, String],
		default: ''
	},
	innerStyle: {
		type: [Object, Array, String],
		default: ''
	}
})

const { safeTopPx, rpxToPx } = useSafeAreaMetrics()

const safeGapPx = computed(() => rpxToPx(props.safeGapRpx))

const resolvedAreaStyle = computed(() => [
	props.fixed
		? {
				position: 'fixed',
				top: '0px',
				left: '0px',
				right: '0px'
		  }
		: null,
	{
		paddingTop: `${safeTopPx.value + safeGapPx.value}px`,
		paddingRight: `${props.sidePaddingRpx}rpx`,
		paddingLeft: `${props.sidePaddingRpx}rpx`,
		background: props.background,
		borderBottom: props.borderBottom || 'none',
		boxShadow: props.boxShadow || 'none',
		boxSizing: 'border-box',
		zIndex: `${props.zIndex}`
	},
	props.areaStyle
])

const resolvedInnerStyle = computed(() => [
	{
		minHeight: `${props.innerMinHeightRpx}rpx`,
		boxSizing: 'border-box'
	},
	props.innerStyle
])
</script>

<style scoped>
.safe-top-area {
	box-sizing: border-box;
}

.safe-top-area-inner {
	box-sizing: border-box;
}
</style>
