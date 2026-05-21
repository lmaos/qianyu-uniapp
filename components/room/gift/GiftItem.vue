<template>
	<view :class="['gift-item', isSelected ? 'gift-item-selected' : '']" @tap="emit('item-click')">
		<view class="gift-icon" :style="{ background: giftInfo.icon }">
			<text class="gift-icon-text">{{ giftIconText }}</text>
		</view>
		<text class="gift-name">{{ giftInfo.name }}</text>
		<text class="gift-price">{{ giftInfo.price }}金币</text>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	giftInfo: {
		type: Object,
		default: () => ({
			id: '',
			name: '',
			icon: 'linear-gradient(135deg, rgba(254, 44, 85, 0.88) 0%, rgba(255, 179, 71, 0.88) 100%)',
			price: 0,
			desc: ''
		})
	},
	isSelected: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['item-click'])

// 取礼物名称首字作为图标里的占位字符。
const giftIconText = computed(() => {
	return (props.giftInfo.name || '礼').slice(0, 1)
})
</script>

<style scoped>
.gift-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	width: 100%;
	height: 200rpx;
	padding: 0 0 8rpx;
	border: 2rpx solid transparent;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.05);
	overflow: hidden;
	box-sizing: border-box;
}

.gift-item-selected {
	border-color: rgba(254, 44, 85, 0.94);
	background: rgba(254, 44, 85, 0.12);
	box-shadow: 0 0 0 2rpx rgba(254, 44, 85, 0.18);
}

.gift-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 118rpx;
	border-radius: 28rpx 28rpx 0rpx 0rpx;
}

.gift-icon-text {
	font-size: 36rpx;
	font-weight: 700;
	color: #ffffff;
}

.gift-name {
	width: 100%;
	margin-top: 8rpx;
	padding: 0 12rpx;
	font-size: 20rpx;
	line-height: 34rpx;
	color: #ffffff;
	text-align: center;
	box-sizing: border-box;
}

.gift-price {
	margin-top: 4rpx;
	padding: 0 12rpx;
	font-size: 20rpx;
	line-height: 30rpx;
	color: rgba(255, 255, 255, 0.6);
	text-align: center;
	box-sizing: border-box;
}
</style>
