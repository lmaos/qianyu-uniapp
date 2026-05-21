<template>
	<view
		:class="[
			'room-chat-item',
			message.isTemp ? 'room-chat-item-temp' : '',
			isPersistentSystemMessage ? 'room-chat-item-system' : '',
			message.isTemp && message.tempVisible === false ? 'room-chat-item-temp-hidden' : ''
		]"
	>
		<text v-if="message.vipLevel > 0 && !isPersistentSystemMessage" class="room-chat-vip" :style="vipTagStyle">
			VIP{{ message.vipLevel }}
		</text>
		<text :class="['room-chat-nickname', isPersistentSystemMessage ? 'room-chat-nickname-system' : '']">
			{{ message.nickname }}
		</text>
		<text :class="['room-chat-divider', isPersistentSystemMessage ? 'room-chat-divider-system' : '']">：</text>

		<text
			v-if="message.msgType === 'text'"
			:class="['room-chat-text', isPersistentSystemMessage ? 'room-chat-content-system' : '']"
		>
			{{ message.content.text }}
		</text>

		<view v-else-if="message.msgType === 'gift'" class="room-chat-gift">
			<view class="room-chat-gift-icon" :style="giftIconStyle">
				<text class="room-chat-gift-icon-text">{{ giftIconText }}</text>
			</view>
			<text :class="['room-chat-gift-text', isPersistentSystemMessage ? 'room-chat-content-system' : '']">
				送出了 {{ message.content.giftName }} x{{ message.content.giftNum }}
			</text>
		</view>

		<view v-else class="room-chat-image-wrap">
			<image class="room-chat-image" :src="imageSrc" mode="aspectFill"></image>
			<text :class="['room-chat-image-text', isPersistentSystemMessage ? 'room-chat-content-system' : '']">
				{{ imageAltText }}
			</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	message: {
		type: Object,
		default: () => ({
			id: '',
			nickname: '用户',
			vipLevel: 0,
			msgType: 'text',
			isTemp: false,
			tempVisible: true,
			content: {
				text: ''
			}
		})
	}
})

// 常驻系统消息使用独立的视觉风格。
const isPersistentSystemMessage = computed(() => {
	return Boolean(props.message.isSystemMessage) && !props.message.isTemp
})

// 根据 VIP 等级切换不同颜色的 VIP 标识背景。
const vipTagStyle = computed(() => {
	const level = Number(props.message.vipLevel) || 0

	if (level >= 8) {
		return {
			background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.96) 0%, rgba(249, 115, 22, 0.96) 100%)'
		}
	}

	if (level >= 5) {
		return {
			background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.96) 0%, rgba(168, 85, 247, 0.96) 100%)'
		}
	}

	return {
		background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.96) 0%, rgba(59, 130, 246, 0.96) 100%)'
	}
})

// 礼物消息里的图标支持渐变色和图片两种来源。
const giftIconStyle = computed(() => {
	const icon = props.message.content?.giftIcon || ''

	if (!icon) {
		return {
			background: 'linear-gradient(135deg, rgba(254, 44, 85, 0.92) 0%, rgba(255, 179, 71, 0.92) 100%)'
		}
	}

	if (icon.includes('gradient(')) {
		return {
			background: icon
		}
	}

	return {
		backgroundImage: `url(${icon})`,
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover'
	}
})

// 礼物消息没有自定义图标时，退化成礼物名首字。
const giftIconText = computed(() => {
	return `${props.message.content?.giftName || '礼'}`.slice(0, 1)
})

// 图片消息的主图地址。
const imageSrc = computed(() => {
	return props.message.content?.imgUrl || ''
})

// 图片消息的替代文案。
const imageAltText = computed(() => {
	return props.message.content?.imgText || '图片消息'
})
</script>

<style scoped>
.room-chat-item {
	display: inline-flex;
	align-items: flex-start;
	flex-wrap: wrap;
	width: fit-content;
	max-width: 100%;
	min-height: 60rpx;
	padding: 10rpx 16rpx;
	border-radius: 18rpx;
	background: rgba(11, 12, 19, 0.26);
	border: 1rpx solid rgba(255, 255, 255, 0.06);
	box-sizing: border-box;
	opacity: 1;
	transform: translate3d(0, 0, 0);
	transition: opacity 220ms ease, transform 220ms ease, background-color 220ms ease;
}

.room-chat-item-temp {
	background: rgba(255, 118, 165, 0.18);
	border: 1rpx solid rgba(255, 118, 165, 0.28);
}

.room-chat-item-system {
	background: rgba(45, 53, 101, 0.34);
	border: 1rpx solid rgba(124, 146, 255, 0.24);
}

.room-chat-item-temp-hidden {
	opacity: 0;
	transform: translate3d(0, 12rpx, 0);
}

.room-chat-vip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 34rpx;
	padding: 0 10rpx;
	margin-right: 10rpx;
	border-radius: 999rpx;
	font-size: 20rpx;
	font-weight: 600;
	line-height: 20rpx;
	color: #ffffff;
	flex-shrink: 0;
}

.room-chat-nickname,
.room-chat-divider,
.room-chat-text,
.room-chat-gift-text,
.room-chat-image-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #ffffff;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.32);
}

.room-chat-nickname {
	color: rgba(255, 222, 157, 0.98);
	flex-shrink: 0;
}

.room-chat-nickname-system {
	color: #7ec8ff;
}

.room-chat-divider {
	margin-right: 4rpx;
	flex-shrink: 0;
}

.room-chat-divider-system {
	color: rgba(126, 200, 255, 0.88);
}

.room-chat-text,
.room-chat-gift-text,
.room-chat-image-text {
	min-width: 0;
	white-space: normal;
	word-break: break-all;
	overflow-wrap: anywhere;
}

.room-chat-content-system {
	color: #dff3ff;
}

.room-chat-gift {
	display: inline-flex;
	align-items: flex-start;
	min-width: 0;
	max-width: 100%;
}

.room-chat-gift-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36rpx;
	height: 36rpx;
	margin-right: 10rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
}

.room-chat-gift-icon-text {
	font-size: 20rpx;
	font-weight: 700;
	line-height: 20rpx;
	color: #ffffff;
}

.room-chat-image-wrap {
	display: inline-flex;
	align-items: flex-start;
	min-width: 0;
	max-width: 100%;
}

.room-chat-image {
	width: 52rpx;
	height: 52rpx;
	margin-right: 10rpx;
	border-radius: 14rpx;
	background: rgba(255, 255, 255, 0.08);
	flex-shrink: 0;
}
</style>
