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
	height: `${props.sizeRpx}rpx`
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
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 247, 250, 0.9) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 14rpx 28rpx rgba(255, 171, 191, 0.14);
	box-sizing: border-box;
}

.shop-header-icon-button--active {
	background: linear-gradient(180deg, rgba(255, 244, 248, 0.98) 0%, rgba(255, 233, 241, 0.94) 100%);
	box-shadow: 0 16rpx 30rpx rgba(255, 116, 163, 0.18);
}

.shop-header-icon-button__image {
	display: block;
}
</style>
