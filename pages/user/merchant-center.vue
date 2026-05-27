<template>
	<UserSubPageLayout title="商家管理" @back="handleBack">
		<view class="merchant-stat-grid">
			<UserSectionCard
				v-for="item in pageMock.statList"
				:key="item.key"
				class="merchant-stat-card"
			>
				<text class="merchant-stat-value">{{ item.value }}</text>
				<text class="merchant-stat-label">{{ item.label }}</text>
			</UserSectionCard>
		</view>

		<UserSectionCard class="merchant-section-gap" title="经营入口">
			<UserMenuList :item-list="pageMock.menuList" @select="handleMenuSelect" />
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserMenuList from '@/components/user-center/common/UserMenuList.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getMerchantCenterPageMock } from '@/components/user-center/userCenterMock.js'
import {
	buildShopMerchantDeliveryUrl,
	buildShopMerchantGoodsUrl,
	buildShopMerchantPromotionUrl
} from '@/components/shop/common/shopFlowMock.js'

const currentUserId = ref('mine-self')

const pageMock = ref(getMerchantCenterPageMock())

onLoad((options) => {
	pageMock.value = getMerchantCenterPageMock(options?.userId)
	currentUserId.value = options?.userId || 'mine-self'
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleMenuSelect(item) {
	onMenuSelect(item)
	const routeMap = {
		goods: buildShopMerchantGoodsUrl(currentUserId.value),
		delivery: buildShopMerchantDeliveryUrl(currentUserId.value),
		promotion: buildShopMerchantPromotionUrl(currentUserId.value)
	}

	if (routeMap[item.key]) {
		uni.navigateTo({
			url: routeMap[item.key]
		})
		return
	}

	uni.showToast({
		title: `${item.label}占位`,
		icon: 'none'
	})
}

function onMenuSelect(item) {
	// TODO：替换商家管理入口逻辑
	console.log('user-merchant-menu-click', item.key)
}
</script>

<style scoped>
.merchant-stat-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16rpx;
}

.merchant-stat-card {
	padding: 28rpx 24rpx;
}

.merchant-stat-value,
.merchant-stat-label {
	display: block;
}

.merchant-stat-value {
	font-size: 34rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.merchant-stat-label {
	margin-top: 12rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.merchant-section-gap {
	margin-top: 20rpx;
}
</style>
