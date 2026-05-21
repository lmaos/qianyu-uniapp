<template>
	<UserSubPageLayout title="我的钱包" @back="handleBack">
		<view class="wallet-asset-grid">
			<UserSectionCard
				v-for="item in pageMock.assetList"
				:key="item.key"
				class="wallet-asset-card"
			>
				<text class="wallet-asset-label">{{ item.label }}</text>
				<text class="wallet-asset-value">{{ item.value }}</text>
				<text class="wallet-asset-desc">{{ item.desc }}</text>
			</UserSectionCard>
		</view>

		<UserSectionCard class="wallet-section-gap" title="资产操作">
			<view class="wallet-action-row">
				<view class="wallet-action-button" @tap="handleWalletAction('recharge')">前往充值</view>
				<view class="wallet-action-button wallet-action-button--light" @tap="handleWalletAction('withdraw')">前往提现</view>
				<view class="wallet-action-button wallet-action-button--light" @tap="handleWalletAction('record')">资产明细</view>
			</view>
		</UserSectionCard>

		<UserSectionCard class="wallet-section-gap" title="最近资产记录">
			<view
				v-for="item in pageMock.recordList"
				:key="item.id"
				class="wallet-record-item"
			>
				<view class="wallet-record-main">
					<text class="wallet-record-title">{{ item.title }}</text>
					<text class="wallet-record-time">{{ item.timeText }}</text>
				</view>
				<view class="wallet-record-side">
					<text class="wallet-record-amount">{{ item.amount }}</text>
					<text class="wallet-record-type">{{ item.type }}</text>
				</view>
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getWalletPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getWalletPageMock())

onLoad((options) => {
	pageMock.value = getWalletPageMock(options?.userId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleWalletAction(actionKey) {
	onWalletAction(actionKey)
	uni.showToast({
		title: '钱包操作占位',
		icon: 'none'
	})
}

function onWalletAction(actionKey) {
	// TODO：替换钱包操作逻辑
	console.log('user-wallet-action', actionKey)
}
</script>

<style scoped>
.wallet-asset-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16rpx;
}

.wallet-asset-card {
	padding: 24rpx 20rpx;
}

.wallet-asset-label,
.wallet-asset-value,
.wallet-asset-desc {
	display: block;
}

.wallet-asset-label {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.wallet-asset-value {
	margin-top: 12rpx;
	font-size: 34rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.wallet-asset-desc {
	margin-top: 12rpx;
	font-size: 20rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.wallet-section-gap {
	margin-top: 20rpx;
}

.wallet-action-row {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.wallet-action-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 76rpx;
	padding: 0 28rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}

.wallet-action-button--light {
	background: #f8fafc;
	color: #0f172a;
}

.wallet-record-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.wallet-record-item + .wallet-record-item {
	margin-top: 18rpx;
	padding-top: 18rpx;
	border-top: 1rpx solid #eef2f7;
}

.wallet-record-title,
.wallet-record-time,
.wallet-record-amount,
.wallet-record-type {
	display: block;
}

.wallet-record-title {
	font-size: 26rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #0f172a;
}

.wallet-record-time,
.wallet-record-type {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.wallet-record-side {
	margin-left: 18rpx;
	text-align: right;
}

.wallet-record-amount {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #fe2c55;
}
</style>
