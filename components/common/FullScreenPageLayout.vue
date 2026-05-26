<template>
	<view class="full-screen-page-layout" :style="resolvedPageStyle">
		<SafeTopArea
			:side-padding-rpx="headerSidePaddingRpx"
			:inner-min-height-rpx="headerHeightRpx"
			:background="headerBackground"
			:border-bottom="headerBorderBottom"
			:box-shadow="headerBoxShadow"
			:z-index="headerZIndex"
			:area-style="headerAreaStyle"
			:inner-style="headerInnerStyle"
		>
			<slot name="header" />
		</SafeTopArea>

		<scroll-view
			v-if="isScrollContent"
			class="full-screen-page-layout-content"
			v-bind="contentProps"
			:style="resolvedContentStyle"
		>
			<slot />
		</scroll-view>

		<component
			:is="contentTag"
			v-else
			class="full-screen-page-layout-content"
			v-bind="contentProps"
			:style="resolvedContentStyle"
		>
			<slot />
		</component>

		<SafeBottomArea
			v-if="$slots.footer"
			:gap-rpx="footerGapRpx"
			:top-padding-rpx="footerTopPaddingRpx"
			:side-padding-rpx="footerSidePaddingRpx"
			:inner-min-height-rpx="footerInnerMinHeightRpx"
			:background="footerBackground"
			:border-top="footerBorderTop"
			:box-shadow="footerBoxShadow"
			:z-index="footerZIndex"
			:area-style="footerAreaStyle"
			:inner-style="footerInnerStyle"
		>
			<slot name="footer" />
		</SafeBottomArea>
	</view>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import SafeBottomArea from '@/components/common/SafeBottomArea.vue'
import SafeTopArea from '@/components/common/SafeTopArea.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'

const props = defineProps({
	pageBackground: {
		type: String,
		default: 'transparent'
	},
	pageStyle: {
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
	contentTopOffsetPx: {
		type: Number,
		default: 0
	},
	headerHeightRpx: {
		type: Number,
		default: 88
	},
	headerSidePaddingRpx: {
		type: Number,
		default: 0
	},
	headerBackground: {
		type: String,
		default: 'transparent'
	},
	headerBorderBottom: {
		type: String,
		default: ''
	},
	headerBoxShadow: {
		type: String,
		default: ''
	},
	headerZIndex: {
		type: [Number, String],
		default: 20
	},
	headerAreaStyle: {
		type: [Object, Array, String],
		default: ''
	},
	headerInnerStyle: {
		type: [Object, Array, String],
		default: ''
	},
	footerReserveRpx: {
		type: Number,
		default: 0
	},
	footerGapRpx: {
		type: Number,
		default: 0
	},
	footerTopPaddingRpx: {
		type: Number,
		default: 0
	},
	footerSidePaddingRpx: {
		type: Number,
		default: 0
	},
	footerInnerMinHeightRpx: {
		type: Number,
		default: 0
	},
	footerBackground: {
		type: String,
		default: 'transparent'
	},
	footerBorderTop: {
		type: String,
		default: ''
	},
	footerBoxShadow: {
		type: String,
		default: ''
	},
	footerZIndex: {
		type: [Number, String],
		default: 40
	},
	footerAreaStyle: {
		type: [Object, Array, String],
		default: ''
	},
	footerInnerStyle: {
		type: [Object, Array, String],
		default: ''
	}
})

const slots = useSlots()
const { safeTopPx, footerReservePx, rpxToPx } = useSafeAreaMetrics()
const hasFooter = computed(() => Boolean(slots.footer))
const isScrollContent = computed(() => props.contentTag === 'scroll-view')

const resolvedPageStyle = computed(() => [
	{
		height: '100vh',
		minHeight: '100vh',
		background: props.pageBackground,
		overflow: isScrollContent.value ? 'hidden' : 'visible'
	},
	props.pageStyle
])

const contentTopPaddingPx = computed(() => {
	return safeTopPx.value + rpxToPx(props.headerHeightRpx) + Number(props.contentTopOffsetPx || 0)
})

const contentBottomPaddingPx = computed(() => {
	if (!props.footerReserveRpx && !hasFooter.value) {
		return 0
	}

	return footerReservePx({
		reserveRpx: props.footerReserveRpx,
		topPaddingRpx: props.footerTopPaddingRpx,
		innerMinHeightRpx: props.footerInnerMinHeightRpx,
		gapRpx: props.footerGapRpx
	})
})

const resolvedContentStyle = computed(() => [
	props.contentStyle,
	{
		display: 'block',
		width: '100%',
		minWidth: 0,
		height: isScrollContent.value ? '100%' : undefined,
		minHeight: isScrollContent.value ? '100%' : undefined,
		paddingTop: `${contentTopPaddingPx.value}px`,
		paddingBottom: `${contentBottomPaddingPx.value}px`,
		boxSizing: 'border-box'
	}
])
</script>

<style scoped>
.full-screen-page-layout {
	position: relative;
}

.full-screen-page-layout-content {
	display: block;
	width: 100%;
	box-sizing: border-box;
}
</style>
