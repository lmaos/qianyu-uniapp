<template>
	<ActivityPopupShell
		:visible="visible"
		popup-type="action"
		:show-close="showClose"
		:close-on-mask="closeOnMask"
		@close="handleClose"
	>
		<view class="activity-action-popup">
			<text v-if="title" class="activity-action-title">{{ title }}</text>
			<text v-if="desc" class="activity-action-desc">{{ desc }}</text>

			<view class="activity-action-button-row">
				<button v-if="cancelText" class="activity-action-button activity-action-button-ghost" @tap="handleCancel">
					{{ cancelText }}
				</button>
				<button class="activity-action-button" @tap="handleConfirm">{{ confirmText }}</button>
			</view>
		</view>
	</ActivityPopupShell>
</template>

<script setup>
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

function handleClose(payload) {
	emit('close', payload)
}

function handleCancel() {
	emit('close', {
		reason: 'cancel-button'
	})
}

function handleConfirm() {
	const actionPayload = {
		actionUrl: props.actionUrl,
		actionPayload: props.actionPayload,
		trigger: 'confirm-button'
	}
	emit('confirm', actionPayload)
	emit('action', actionPayload)
}
</script>

<style scoped>
.activity-action-popup {
	display: flex;
	flex-direction: column;
	align-items: stretch;
}

.activity-action-title {
	display: block;
	font-size: 36rpx;
	line-height: 48rpx;
	font-weight: 700;
	color: #101828;
	text-align: center;
}

.activity-action-desc {
	display: block;
	margin-top: 18rpx;
	font-size: 26rpx;
	line-height: 40rpx;
	color: #475467;
	text-align: center;
}

.activity-action-button-row {
	display: flex;
	gap: 16rpx;
	margin-top: 36rpx;
}

.activity-action-button {
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

.activity-action-button::after {
	border: none;
}

.activity-action-button-ghost {
	background: rgba(15, 23, 42, 0.06);
	color: #475467;
}
</style>
