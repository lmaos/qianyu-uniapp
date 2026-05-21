<template>
	<view class="refresh-top-stack-layout" :style="resolvedPageStyle">
		<view class="refresh-top-stack-header" :style="resolvedHeaderStyle">
			<view
				v-if="refreshState === 'pulling'"
				class="refresh-top-stack-cover"
				:style="refreshCoverStyle"
			>
				<slot name="refresh-cover" />
			</view>

			<view
				class="refresh-top-stack-header-inner"
				:class="{ 'refresh-top-stack-header-inner--hidden': refreshState === 'pulling' }"
			>
				<slot name="header" />
			</view>
		</view>

		<view v-if="$slots.secondary" class="refresh-top-stack-secondary" :style="resolvedSecondaryStyle">
			<slot name="secondary" />
		</view>

		<view v-if="$slots.tertiary" class="refresh-top-stack-tertiary" :style="resolvedTertiaryStyle">
			<slot name="tertiary" />
		</view>

		<component
			:is="contentTag"
			class="refresh-top-stack-content"
			v-bind="contentProps"
			:style="resolvedContentStyle"
		>
			<slot />
		</component>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'

const props = defineProps({
	pageHeightPx: {
		type: Number,
		default: 0
	},
	pageBackground: {
		type: String,
		default: 'transparent'
	},
	pageStyle: {
		type: [Object, Array, String],
		default: ''
	},
	headerRowHeightRpx: {
		type: Number,
		default: 88
	},
	secondaryHeightRpx: {
		type: Number,
		default: 0
	},
	tertiaryHeightRpx: {
		type: Number,
		default: 0
	},
	headerAreaStyle: {
		type: [Object, Array, String],
		default: ''
	},
	secondaryAreaStyle: {
		type: [Object, Array, String],
		default: ''
	},
	tertiaryAreaStyle: {
		type: [Object, Array, String],
		default: ''
	},
	contentTag: {
		type: [String, Object],
		default: 'view'
	},
	contentProps: {
		type: Object,
		default: () => ({})
	},
	contentStyle: {
		type: [Object, Array, String],
		default: ''
	},
	refreshState: {
		type: String,
		default: 'idle'
	},
	refreshPullDistancePx: {
		type: Number,
		default: 0
	},
	refreshRevealDistancePx: {
		type: Number,
		default: 1
	}
})

const { safeTopPx, windowHeightPx, rpxToPx } = useSafeAreaMetrics()

const headerRowHeightPx = computed(() => rpxToPx(props.headerRowHeightRpx))
const secondaryHeightPx = computed(() => rpxToPx(props.secondaryHeightRpx))
const tertiaryHeightPx = computed(() => rpxToPx(props.tertiaryHeightRpx))
const fixedStackHeightPx = computed(
	() => safeTopPx.value + headerRowHeightPx.value + secondaryHeightPx.value + tertiaryHeightPx.value
)

const resolvedPageStyle = computed(() => [
	{
		height: `${props.pageHeightPx || windowHeightPx.value}px`,
		background: props.pageBackground,
		overflow: 'hidden'
	},
	props.pageStyle
])

const resolvedHeaderStyle = computed(() => [
	{
		top: '0px',
		paddingTop: `${safeTopPx.value}px`,
		height: `${safeTopPx.value + headerRowHeightPx.value}px`
	},
	props.headerAreaStyle
])

const resolvedSecondaryStyle = computed(() => [
	{
		top: `${safeTopPx.value + headerRowHeightPx.value}px`,
		height: `${secondaryHeightPx.value}px`
	},
	props.secondaryAreaStyle
])

const resolvedTertiaryStyle = computed(() => [
	{
		top: `${safeTopPx.value + headerRowHeightPx.value + secondaryHeightPx.value}px`,
		height: `${tertiaryHeightPx.value}px`
	},
	props.tertiaryAreaStyle
])

const resolvedContentStyle = computed(() => [
	props.contentStyle,
	{
		top: `${fixedStackHeightPx.value}px`
	}
])

const refreshCoverStyle = computed(() => {
	const revealDistance = Math.max(1, Number(props.refreshRevealDistancePx || 1))
	const offsetPx = Math.min(0, Number(props.refreshPullDistancePx || 0) - revealDistance)
	return {
		top: `${safeTopPx.value}px`,
		height: `${headerRowHeightPx.value}px`,
		transform: `translateY(${offsetPx}px)`,
		opacity: Math.min(1, Number(props.refreshPullDistancePx || 0) / revealDistance)
	}
})
</script>

<style scoped>
.refresh-top-stack-layout {
	position: relative;
}

.refresh-top-stack-header,
.refresh-top-stack-secondary,
.refresh-top-stack-tertiary {
	position: fixed;
	left: 0;
	right: 0;
	box-sizing: border-box;
}

.refresh-top-stack-header {
	z-index: 20;
	overflow: hidden;
}

.refresh-top-stack-secondary,
.refresh-top-stack-tertiary {
	z-index: 20;
}

.refresh-top-stack-header-inner {
	height: 100%;
	transition: opacity 120ms ease;
}

.refresh-top-stack-header-inner--hidden {
	opacity: 0;
}

.refresh-top-stack-cover {
	position: absolute;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.refresh-top-stack-content {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	box-sizing: border-box;
}
</style>
