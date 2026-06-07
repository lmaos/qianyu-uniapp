<template>
	<UserSubPageLayout title="商家管理" @back="handleBack">
		<view class="merchant-stat-grid">
			<UserSectionCard
				v-for="item in dashboardData.statList"
				:key="item.key"
				class="merchant-stat-card"
			>
				<text class="merchant-stat-value">{{ item.value }}</text>
				<text class="merchant-stat-label">{{ item.label }}</text>
			</UserSectionCard>
		</view>

		<UserSectionCard class="merchant-section-gap" title="经营入口">
			<UserMenuList :item-list="menuList" @select="handleMenuSelect" />
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserMenuList from '@/components/user-center/common/UserMenuList.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import {
	buildShopMerchantDeliveryUrl,
	buildShopMerchantGoodsUrl,
	buildShopMerchantPromotionUrl
} from '@/components/shop/common/shopFlowMock.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'

const currentUserId = ref('mine-self')

// 仪表盘数据（merchant/merchant/dashboard）
const dashboardData = ref({
  merchantId: '',
  shopName: '',
  auditStatus: 0,
  status: 0,
  statList: []
})

// 经营入口（前端静态配置，不依赖后端）
const menuList = [
  { key: 'goods', label: '商品管理' },
  { key: 'delivery', label: '发货管理' },
  { key: 'promotion', label: '营销活动' }
]

async function loadDashboard() {
	const { code, data } = await request.post({ url: API.M_MCH_DASHBOARD })
	if (code !== 200) return
	const content = data.content || {}
	dashboardData.value = {
		merchantId: content.merchantId || '',
		shopName: content.shopName || '',
		auditStatus: content.auditStatus ?? 0,
		status: content.status ?? 0,
		statList: content.statList || []
	}
}

onLoad(async (options) => {
	currentUserId.value = options?.userId || 'mine-self'
	await loadDashboard()
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
