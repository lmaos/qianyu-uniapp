<template>
	<view class="shop-sub-page-header">
		<view class="shop-sub-page-header__left">
			<ShopHeaderIconButton
				:icon="backIcon"
				:size-rpx="backButtonSizeRpx"
				:icon-size-rpx="backIconSizeRpx"
				@tap="emit('back')"
			/>
		</view>

		<text class="shop-sub-page-header__title">{{ title }}</text>

		<view class="shop-sub-page-header__right" :style="{ minWidth: `${rightMinWidthRpx}rpx` }">
			<slot name="right">
				<view class="shop-sub-page-header__placeholder" :style="{ width: `${rightMinWidthRpx}rpx` }"></view>
			</slot>
		</view>
	</view>
</template>

<script setup>
import ShopHeaderIconButton from '@/components/shop/common/ShopHeaderIconButton.vue'
import { SHOP_TOP_BACK_ICON } from '@/components/shop/common/shopSurface.js'

defineProps({
	title: {
		type: String,
		default: ''
	},
	backIcon: {
		type: String,
		default: SHOP_TOP_BACK_ICON
	},
	backButtonSizeRpx: {
		type: Number,
		default: 64
	},
	backIconSizeRpx: {
		type: Number,
		default: 34
	},
	rightMinWidthRpx: {
		type: Number,
		default: 104
	}
})

const emit = defineEmits(['back'])
</script>

<style scoped>
.shop-sub-page-header {
	display: flex;
	align-items: center;
	height: 100%;
}

.shop-sub-page-header__left {
	flex-shrink: 0;
	width: 104rpx;
}

.shop-sub-page-header__title {
	flex: 1;
	min-width: 0;
	padding: 0 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	line-height: 42rpx;
	color: #162033;
	text-align: center;
}

.shop-sub-page-header__right {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 14rpx;
	flex-shrink: 0;
}

.shop-sub-page-header__placeholder {
	height: 64rpx;
}
</style>
