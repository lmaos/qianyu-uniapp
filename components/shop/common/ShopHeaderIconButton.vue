<template>
	<view
		:class="['shop-header-icon-button', active ? 'shop-header-icon-button--active' : '']"
		:style="buttonStyle"
		@tap="emit('tap')"
	>
		<image class="shop-header-icon-button__image" :style="imageStyle" :src="icon" mode="aspectFit" />
	</view>
</template>

<script setup>
import { computed } from 'vue'
import {
	SHOP_HEADER_BUTTON_ACTIVE_BACKGROUND,
	SHOP_HEADER_BUTTON_BACKGROUND,
	SHOP_HEADER_BUTTON_BORDER
} from '@/components/shop/common/shopSurface.js'

const props = defineProps({
	icon: {
		type: String,
		default: ''
	},
	sizeRpx: {
		type: Number,
		default: 64
	},
	iconSizeRpx: {
		type: Number,
		default: 34
	},
	active: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['tap'])

const buttonStyle = computed(() => ({
	width: `${props.sizeRpx}rpx`,
	height: `${props.sizeRpx}rpx`,
	background: props.active ? SHOP_HEADER_BUTTON_ACTIVE_BACKGROUND : SHOP_HEADER_BUTTON_BACKGROUND,
	border: SHOP_HEADER_BUTTON_BORDER,
	boxShadow: props.active
		? '0 16rpx 30rpx rgba(255, 116, 163, 0.18)'
		: '0 14rpx 28rpx rgba(255, 171, 191, 0.14)'
}))

const imageStyle = computed(() => ({
	width: `${props.iconSizeRpx}rpx`,
	height: `${props.iconSizeRpx}rpx`
}))
</script>

<style scoped>
.shop-header-icon-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 999rpx;
	box-sizing: border-box;
}

.shop-header-icon-button__image {
	display: block;
}
</style>
