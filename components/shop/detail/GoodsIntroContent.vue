<template>
	<view v-if="htmlContent || blockList.length" class="goods-intro-card">
		<text class="goods-intro-title">商品图文介绍</text>
		<rich-text v-if="htmlContent" class="goods-intro-rich" :nodes="processedHtml"></rich-text>
		<view v-else>
			<view v-for="item in blockList" :key="item.id" class="goods-intro-block">
				<text v-if="item.type === 'title'" class="goods-intro-block-title">{{ item.text }}</text>
				<text v-else-if="item.type === 'text'" class="goods-intro-block-text">{{ item.text }}</text>
				<view v-else class="goods-intro-block-image" :style="{ background: item.background }">
					<text class="goods-intro-block-image-text">{{ item.label }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	htmlContent: {
		type: String,
		default: ''
	},
	blockList: {
		type: Array,
		default: () => []
	}
})

const processedHtml = computed(() => {
	if (!props.htmlContent) return ''
	return props.htmlContent.replace(
		/<img/gi,
		'<img style="max-width:100%;height:auto;display:block;"'
	)
})
</script>

<style scoped>
.goods-intro-card {
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.goods-intro-title {
	display: block;
	margin-bottom: 20rpx;
	font-size: 30rpx;
	font-weight: 600;
	line-height: 40rpx;
	color: #111827;
}

.goods-intro-rich {
	width: 100%;
}

.goods-intro-block + .goods-intro-block {
	margin-top: 20rpx;
}

.goods-intro-block-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	line-height: 38rpx;
	color: #111827;
}

.goods-intro-block-text {
	display: block;
	font-size: 24rpx;
	line-height: 38rpx;
	color: #475467;
}

.goods-intro-block-image {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 360rpx;
	border-radius: 28rpx;
}

.goods-intro-block-image-text {
	font-size: 40rpx;
	font-weight: 700;
	line-height: 48rpx;
	letter-spacing: 6rpx;
	color: rgba(17, 24, 39, 0.68);
}
</style>
