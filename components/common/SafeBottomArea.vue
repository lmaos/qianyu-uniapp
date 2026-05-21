<template>
	<view class="safe-bottom-area" :style="resolvedAreaStyle">
		<view class="safe-bottom-area-inner" :style="resolvedInnerStyle">
			<slot :safe-bottom-px="safeBottomPx" :safe-gap-px="gapPx" />
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
	gapRpx: {
		type: Number,
		default: 0
	},
	topPaddingRpx: {
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
	borderTop: {
		type: String,
		default: ''
	},
	boxShadow: {
		type: String,
		default: ''
	},
	zIndex: {
		type: [Number, String],
		default: 40
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

const { safeBottomPx, rpxToPx } = useSafeAreaMetrics()

const gapPx = computed(() => rpxToPx(props.gapRpx))

const resolvedAreaStyle = computed(() => [
	props.fixed
		? {
				position: 'fixed',
				left: '0px',
				right: '0px',
				bottom: '0px'
		  }
		: null,
	{
		paddingTop: `${props.topPaddingRpx}rpx`,
		paddingRight: `${props.sidePaddingRpx}rpx`,
		paddingBottom: `${safeBottomPx.value + gapPx.value}px`,
		paddingLeft: `${props.sidePaddingRpx}rpx`,
		background: props.background,
		borderTop: props.borderTop || 'none',
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
.safe-bottom-area {
	box-sizing: border-box;
}

.safe-bottom-area-inner {
	box-sizing: border-box;
}
</style>
