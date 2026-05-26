<template>
	<ActivityPopupShell
		:visible="visible"
		popup-type="image"
		:show-close="showClose"
		:close-on-mask="closeOnMask"
		@close="handleClose"
	>
		<view class="activity-image-popup">
			<view class="activity-image-surface" :style="imageSurfaceStyle" @tap="handleAction">
				<view class="activity-image-glow"></view>
				<view class="activity-image-copy">
					<text v-if="title" class="activity-image-title">{{ title }}</text>
					<text v-if="desc" class="activity-image-desc">{{ desc }}</text>
				</view>
			</view>

			<view class="activity-image-footer">
				<button class="activity-image-button" @tap="handleConfirm">{{ confirmText }}</button>
				<button v-if="cancelText" class="activity-image-button activity-image-button-ghost" @tap="handleCancel">
					{{ cancelText }}
				</button>
			</view>
		</view>
	</ActivityPopupShell>
</template>

<script setup>
import { computed } from 'vue'
import ActivityPopupShell from './ActivityPopupShell.vue'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: ''
	},
	desc: {
		type: String,
		default: ''
	},
	imageUrl: {
		type: String,
		default: ''
	},
	confirmText: {
		type: String,
		default: '立即前往'
	},
	cancelText: {
		type: String,
		default: ''
	},
	showClose: {
		type: Boolean,
		default: true
	},
	closeOnMask: {
		type: Boolean,
		default: true
	},
	actionUrl: {
		type: String,
		default: ''
	},
	actionPayload: {
		type: Object,
		default: null
	}
})

const emit = defineEmits(['close', 'confirm', 'action'])

const imageSurfaceStyle = computed(() => {
	const mockGradient =
		props.imageUrl ||
		'linear-gradient(135deg, rgba(254, 44, 85, 0.96) 0%, rgba(251, 146, 60, 0.92) 52%, rgba(96, 165, 250, 0.9) 100%)'

	return {
		background: mockGradient
	}
})

function handleClose(payload) {
	emit('close', payload)
}

function handleCancel() {
	emit('close', {
		reason: 'cancel-button'
	})
}

function handleConfirm() {
	const actionPayload = buildActionPayload('confirm-button')
	emit('confirm', actionPayload)
	emit('action', actionPayload)
}

function handleAction() {
	const actionPayload = buildActionPayload('image-surface')
	emit('confirm', actionPayload)
	emit('action', actionPayload)
}

function buildActionPayload(trigger) {
	return {
		actionUrl: props.actionUrl,
		actionPayload: props.actionPayload,
		trigger
	}
}
</script>

<style scoped>
.activity-image-popup {
	padding: 28rpx;
}

.activity-image-surface {
	position: relative;
	display: flex;
	align-items: flex-end;
	min-height: 520rpx;
	padding: 40rpx 32rpx;
	border-radius: 30rpx;
	overflow: hidden;
	box-sizing: border-box;
}

.activity-image-glow {
	position: absolute;
	inset: auto -10% -18% auto;
	width: 360rpx;
	height: 360rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.24);
	filter: blur(12rpx);
}

.activity-image-copy {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 14rpx;
}

.activity-image-title {
	font-size: 40rpx;
	line-height: 52rpx;
	font-weight: 700;
	color: #ffffff;
}

.activity-image-desc {
	font-size: 24rpx;
	line-height: 38rpx;
	color: rgba(255, 255, 255, 0.9);
}

.activity-image-footer {
	display: flex;
	gap: 16rpx;
	margin-top: 24rpx;
}

.activity-image-button {
	flex: 1;
	height: 84rpx;
	margin: 0;
	border: none;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 28rpx;
	line-height: 84rpx;
	font-weight: 600;
	color: #ffffff;
}

.activity-image-button::after {
	border: none;
}

.activity-image-button-ghost {
	background: rgba(15, 23, 42, 0.06);
	color: #475467;
}
</style>
