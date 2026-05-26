<template>
	<view v-if="visible" class="activity-popup-shell" :style="shellStyle">
		<view class="activity-popup-mask" @tap="handleMaskTap"></view>

		<view class="activity-popup-panel" :class="panelClassName" @tap.stop>
			<view v-if="showClose" class="activity-popup-close" @tap="handleCloseTap">
				<text class="activity-popup-close-text">X</text>
			</view>
			<slot />
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	popupType: {
		type: String,
		default: 'action'
	},
	showClose: {
		type: Boolean,
		default: true
	},
	closeOnMask: {
		type: Boolean,
		default: true
	},
	zIndex: {
		type: Number,
		default: 90
	}
})

const emit = defineEmits(['close'])

const shellStyle = computed(() => {
	return {
		zIndex: `${props.zIndex}`
	}
})

const panelClassName = computed(() => {
	return props.popupType === 'image'
		? 'activity-popup-panel-image'
		: 'activity-popup-panel-action'
})

function handleMaskTap() {
	if (!props.closeOnMask) {
		return
	}

	emit('close', {
		reason: 'mask'
	})
}

function handleCloseTap() {
	emit('close', {
		reason: 'close-icon'
	})
}
</script>

<style scoped>
.activity-popup-shell {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32rpx;
	box-sizing: border-box;
}

.activity-popup-mask {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.56);
	backdrop-filter: blur(6px);
	-webkit-backdrop-filter: blur(6px);
}

.activity-popup-panel {
	position: relative;
	width: 100%;
	max-width: 640rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.82);
	border-radius: 36rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%);
	box-shadow: 0 28rpx 80rpx rgba(15, 23, 42, 0.2);
	overflow: hidden;
	box-sizing: border-box;
}

.activity-popup-panel-image {
	max-width: 680rpx;
}

.activity-popup-panel-action {
	padding: 108rpx 36rpx 36rpx;
}

.activity-popup-close {
	position: absolute;
	top: 24rpx;
	right: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.08);
	z-index: 2;
}

.activity-popup-close-text {
	font-size: 26rpx;
	line-height: 26rpx;
	font-weight: 700;
	color: #475467;
}
</style>
