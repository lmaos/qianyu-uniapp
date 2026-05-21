<template>
	<view class="goods-shop-card">
		<view class="goods-shop-left">
			<view class="goods-shop-avatar" :style="{ background: shopInfo.avatarBackground }">
				{{ shopInfo.avatarText }}
			</view>
			<view class="goods-shop-meta">
				<text class="goods-shop-name">{{ shopInfo.name }}</text>
				<text class="goods-shop-desc">{{ shopInfo.desc }}</text>
				<text class="goods-shop-followers">关注 {{ shopInfo.followerCount }}</text>
			</view>
		</view>

		<view class="goods-shop-actions">
			<view class="goods-shop-button goods-shop-button-light" @tap="emit('follow-click')">
				{{ followed ? '已关注' : '关注' }}
			</view>
			<view class="goods-shop-button goods-shop-button-primary" @tap="emit('enter-click')">进店逛逛</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	shopInfo: {
		type: Object,
		default: () => ({
			name: '店铺名称',
			desc: '',
			avatarText: '店',
			avatarBackground: 'linear-gradient(135deg, #ffe4d6 0%, #fff1f4 100%)',
			followerCount: '0'
		})
	},
	followed: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['follow-click', 'enter-click'])
</script>

<style scoped>
.goods-shop-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 24rpx;
	padding: 28rpx 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.goods-shop-left {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.goods-shop-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 80rpx;
	height: 80rpx;
	border-radius: 24rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: rgba(17, 24, 39, 0.72);
}

.goods-shop-meta {
	display: flex;
	flex-direction: column;
	min-width: 0;
	margin-left: 16rpx;
}

.goods-shop-name {
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #111827;
}

.goods-shop-desc,
.goods-shop-followers {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.goods-shop-actions {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-left: 18rpx;
}

.goods-shop-button {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 64rpx;
	padding: 0 20rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	font-weight: 600;
	line-height: 30rpx;
}

.goods-shop-button-light {
	color: #344054;
	background: #f2f4f7;
}

.goods-shop-button-primary {
	color: #ffffff;
	background: linear-gradient(135deg, #fe2c55 0%, #ff7a45 100%);
}
</style>
