<template>
	<view class="pull-paging-shell" :style="shellStyle">
		<scroll-view
			:class="['pull-paging-scroll', lightTheme ? 'pull-paging-scroll-light' : '']"
			:scroll-y="scrollY"
			enable-flex
			show-scrollbar="false"
			:refresher-enabled="refresherEnabled"
			:refresher-background="refresherBackground"
			:refresher-default-style="refresherDefaultStyle"
			:lower-threshold="lowerThreshold"
			:refresher-triggered="refresherTriggered"
			:scroll-top="scrollTop"
			:scroll-into-view="scrollIntoView"
			:scroll-with-animation="scrollWithAnimation"
			:style="scrollStyle"
			@scroll="emit('scroll', $event)"
			@refresherpulling="emit('refresher-pulling', $event)"
			@refresherrestore="emit('refresher-restore', $event)"
			@refresherabort="emit('refresher-restore', $event)"
			@touchstart="emit('touch-start', $event)"
			@touchmove="emit('touch-move', $event)"
			@touchend="emit('touch-end', $event)"
			@touchcancel="emit('touch-end', $event)"
			@refresherrefresh="emit('refresher-refresh', $event)"
			@scrolltolower="emit('scroll-lower', $event)"
		>
			<view class="pull-paging-inner" :style="innerStyle">
				<slot />
			</view>
		</scroll-view>

		<view class="pull-paging-bottom-slot" :style="bottomPullSlotStyle">
			<view
				v-if="bottomPullText"
				:class="[
					'pull-paging-bottom-indicator',
					bottomPullVisible ? 'pull-paging-bottom-indicator-active' : ''
				]"
			>
				<view
					v-if="bottomPullState === 'loading'"
					:class="['pull-paging-bottom-spinner', lightTheme ? 'pull-paging-bottom-spinner-light' : '']"
				></view>
				<view
					v-else-if="bottomPullState === 'loaded'"
					:class="['pull-paging-bottom-status', lightTheme ? 'pull-paging-bottom-status-light' : '']"
				>
					<view class="pull-paging-bottom-status-dot"></view>
				</view>
				<text :class="['pull-paging-bottom-text', lightTheme ? 'pull-paging-bottom-text-light' : '']">
					{{ bottomPullText }}
				</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	lightTheme: {
		type: Boolean,
		default: false
	},
	refresherEnabled: {
		type: Boolean,
		default: true
	},
	scrollY: {
		type: Boolean,
		default: true
	},
	refresherBackground: {
		type: String,
		default: 'transparent'
	},
	refresherDefaultStyle: {
		type: String,
		default: 'none'
	},
	lowerThreshold: {
		type: Number,
		default: 200
	},
	refresherTriggered: {
		type: Boolean,
		default: false
	},
	scrollTop: {
		type: Number,
		default: 0
	},
	scrollIntoView: {
		type: String,
		default: ''
	},
	scrollWithAnimation: {
		type: Boolean,
		default: false
	},
	shellStyle: {
		type: [Object, Array, String],
		default: ''
	},
	scrollStyle: {
		type: [Object, Array, String],
		default: ''
	},
	innerStyle: {
		type: [Object, Array, String],
		default: ''
	},
	bottomPullState: {
		type: String,
		default: 'idle'
	},
	bottomPullVisible: {
		type: Boolean,
		default: false
	},
	bottomPullSlotStyle: {
		type: [Object, Array, String],
		default: ''
	}
})

const emit = defineEmits([
	'scroll',
	'refresher-pulling',
	'refresher-restore',
	'refresher-refresh',
	'touch-start',
	'touch-move',
	'touch-end',
	'scroll-lower'
])

const bottomPullText = computed(() => {
	if (props.bottomPullState === 'loading') {
		return '正在加载新数据'
	}

	if (props.bottomPullState === 'loaded') {
		return '新内容已加载'
	}

	if (props.bottomPullState === 'no-more') {
		return '无更多内容'
	}

	return ''
})
</script>

<style scoped>
.pull-paging-shell {
	position: relative;
	height: 100%;
	overflow: hidden;
}

.pull-paging-scroll {
	height: 100%;
}

.pull-paging-inner {
	min-height: 100%;
	box-sizing: border-box;
}

.pull-paging-bottom-slot {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 8;
	box-sizing: border-box;
	overflow: hidden;
	pointer-events: none;
	transition: height 380ms cubic-bezier(0.22, 0.76, 0.2, 1);
}

.pull-paging-bottom-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 72rpx;
	opacity: 0;
	transform: translateY(18rpx);
	transition: opacity 220ms ease, transform 380ms cubic-bezier(0.22, 0.76, 0.2, 1);
}

.pull-paging-bottom-indicator-active {
	opacity: 1;
	transform: translateY(0);
}

.pull-paging-bottom-spinner {
	width: 24rpx;
	height: 24rpx;
	margin-right: 12rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.16);
	border-top-color: rgba(255, 255, 255, 0.72);
	border-radius: 50%;
	animation: pull-paging-bottom-spin 0.9s linear infinite;
}

.pull-paging-bottom-spinner-light {
	border-color: rgba(17, 24, 39, 0.08);
	border-top-color: rgba(254, 44, 85, 0.72);
}

.pull-paging-bottom-status {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24rpx;
	height: 24rpx;
	margin-right: 12rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.16);
}

.pull-paging-bottom-status-light {
	background: rgba(254, 44, 85, 0.12);
}

.pull-paging-bottom-status-dot {
	width: 10rpx;
	height: 10rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.82);
}

.pull-paging-bottom-status-light .pull-paging-bottom-status-dot {
	background: #fe2c55;
}

.pull-paging-bottom-text {
	font-size: 24rpx;
	line-height: 34rpx;
	color: rgba(255, 255, 255, 0.58);
}

.pull-paging-bottom-text-light {
	color: #667085;
}

@keyframes pull-paging-bottom-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
