<template>
	<FullScreenPageLayout
		:page-background="USER_SUB_PAGE_BACKGROUND"
		:content-tag="scrollable ? 'scroll-view' : 'view'"
		:content-props="contentProps"
		:content-style="resolvedContentStyle"
		:content-top-offset-px="12"
		:header-height-rpx="88"
		:header-side-padding-rpx="24"
		:header-background="USER_SUB_PAGE_HEADER_BACKGROUND"
		header-border-bottom="1rpx solid rgba(226, 232, 240, 0.72)"
		header-box-shadow="0 10rpx 28rpx rgba(148, 163, 184, 0.06)"
		:footer-reserve-rpx="footerReserveRpx"
		:footer-gap-rpx="footerGapRpx"
		:footer-top-padding-rpx="footerTopPaddingRpx"
		:footer-side-padding-rpx="footerSidePaddingRpx"
		:footer-inner-min-height-rpx="footerInnerMinHeightRpx"
		:footer-background="USER_SUB_PAGE_FOOTER_BACKGROUND"
		footer-border-top="1rpx solid rgba(226, 232, 240, 0.78)"
		footer-box-shadow="0 -10rpx 28rpx rgba(148, 163, 184, 0.05)"
	>
		<template #header>
			<view class="user-sub-page-header">
				<view class="user-sub-page-back" @tap="emit('back')">
					<view class="user-sub-page-back-button">
						<image class="user-sub-page-back-icon" :src="userSubPageBackIconSvg" mode="aspectFit" />
					</view>
				</view>
				<text class="user-sub-page-title">{{ title }}</text>
				<view class="user-sub-page-right">
					<slot name="header-right" />
				</view>
			</view>
		</template>

		<slot />

		<template v-if="$slots.footer" #footer>
			<slot name="footer" />
		</template>
	</FullScreenPageLayout>
</template>

<script setup>
import { computed } from 'vue'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import {
	USER_SUB_PAGE_BACKGROUND,
	USER_SUB_PAGE_FOOTER_BACKGROUND,
	USER_SUB_PAGE_HEADER_BACKGROUND,
	userSubPageBackIconSvg
} from '@/components/user-center/common/userSubPageSurface.js'

const props = defineProps({
	title: {
		type: String,
		default: '页面'
	},
	scrollable: {
		type: Boolean,
		default: true
	},
	contentStyle: {
		type: [Object, Array, String],
		default: ''
	},
	contentSidePaddingRpx: {
		type: Number,
		default: 24
	},
	contentBottomPaddingRpx: {
		type: Number,
		default: 36
	},
	footerReserveRpx: {
		type: Number,
		default: 0
	},
	footerGapRpx: {
		type: Number,
		default: 18
	},
	footerTopPaddingRpx: {
		type: Number,
		default: 18
	},
	footerSidePaddingRpx: {
		type: Number,
		default: 24
	},
	footerInnerMinHeightRpx: {
		type: Number,
		default: 88
	}
})

const emit = defineEmits(['back'])

const contentProps = computed(() => {
	if (!props.scrollable) {
		return {}
	}

	return {
		'scroll-y': true,
		'enable-flex': true,
		'show-scrollbar': false
	}
})

const resolvedContentStyle = computed(() => [
	{
		paddingRight: `${props.contentSidePaddingRpx}rpx`,
		paddingBottom: `${props.contentBottomPaddingRpx}rpx`,
		paddingLeft: `${props.contentSidePaddingRpx}rpx`,
		boxSizing: 'border-box',
		height: '100%',
		minHeight: '100%'
	},
	props.contentStyle
])
</script>

<style scoped>
.user-sub-page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
}

.user-sub-page-back,
.user-sub-page-right {
	display: flex;
	align-items: center;
	min-width: 96rpx;
	min-height: 64rpx;
}

.user-sub-page-back-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.88);
	border: 1rpx solid rgba(255, 255, 255, 0.94);
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.1);
}

.user-sub-page-back-icon {
	width: 30rpx;
	height: 30rpx;
}

.user-sub-page-title {
	flex: 1;
	text-align: center;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.user-sub-page-right {
	justify-content: flex-end;
}
</style>
