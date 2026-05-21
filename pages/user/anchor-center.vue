<template>
	<UserSubPageLayout title="主播中心" @back="handleBack">
		<template #header-right>
			<view class="anchor-header-live" @tap="handleStartLive">去开播</view>
		</template>

		<UserSectionCard>
			<UserContentTabBar :tab-list="pageMock.periodTabList" :active-tab="activePeriod" @change="handlePeriodChange" />
		</UserSectionCard>

		<view class="anchor-stat-grid">
			<UserSectionCard
				v-for="item in displayStatList"
				:key="item.key"
				class="anchor-stat-card"
			>
				<text class="anchor-stat-value">{{ item.value }}</text>
				<text class="anchor-stat-label">{{ item.label }}</text>
			</UserSectionCard>
		</view>

		<UserSectionCard class="anchor-section-gap" title="开播提醒">
			<text
				v-for="(item, index) in pageMock.liveTips"
				:key="`${index}-${item}`"
				class="anchor-tip-item"
			>
				{{ item }}
			</text>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import UserContentTabBar from '@/components/user-center/main/UserContentTabBar.vue'
import { getAnchorCenterPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getAnchorCenterPageMock())
const activePeriod = ref('today')

const displayStatList = computed(() => pageMock.value.periodStatsMap?.[activePeriod.value] || [])

onLoad((options) => {
	pageMock.value = getAnchorCenterPageMock(options?.userId)
	activePeriod.value = 'today'
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handlePeriodChange(tabItem) {
	activePeriod.value = tabItem.key
	onPeriodChange(tabItem)
}

function handleStartLive() {
	onStartLive()
	uni.showToast({
		title: '开播入口占位',
		icon: 'none'
	})
}

function onPeriodChange(tabItem) {
	// TODO：替换主播中心统计周期切换逻辑
	console.log('user-anchor-period-change', tabItem.key)
}

function onStartLive() {
	// TODO：替换开播入口逻辑
	console.log('user-anchor-start-live')
}
</script>

<style scoped>
.anchor-header-live {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 108rpx;
	height: 56rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: #fe2c55;
	font-size: 22rpx;
	font-weight: 600;
	color: #ffffff;
}

.anchor-stat-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16rpx;
	margin-top: 20rpx;
}

.anchor-stat-card {
	padding: 28rpx 20rpx;
	text-align: center;
}

.anchor-stat-value,
.anchor-stat-label {
	display: block;
}

.anchor-stat-value {
	font-size: 34rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.anchor-stat-label {
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.anchor-section-gap {
	margin-top: 20rpx;
}

.anchor-tip-item {
	display: block;
	font-size: 24rpx;
	line-height: 38rpx;
	color: #475467;
}

.anchor-tip-item + .anchor-tip-item {
	margin-top: 12rpx;
}
</style>
