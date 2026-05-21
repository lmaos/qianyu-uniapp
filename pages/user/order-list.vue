<template>
	<UserSubPageLayout title="我的订单" @back="handleBack">
		<UserSectionCard>
			<UserContentTabBar :tab-list="statusTabList" :active-tab="activeStatus" @change="handleStatusChange" />
		</UserSectionCard>

		<UserSectionCard class="order-section-gap">
			<view
				v-for="item in displayOrderList"
				:key="item.id"
				class="order-card"
			>
				<view class="order-card-head">
					<text class="order-card-status">{{ item.statusText }}</text>
					<text class="order-card-time">{{ item.timeText }}</text>
				</view>

				<view class="order-card-body" @tap="handleOrderDetail(item)">
					<view class="order-card-cover" :style="{ background: item.coverBackground }">
						<text class="order-card-cover-text">{{ item.coverText }}</text>
					</view>

					<view class="order-card-meta">
						<text class="order-card-title">{{ item.title }}</text>
						<text class="order-card-spec">{{ item.specText }}</text>
						<text class="order-card-price">￥{{ item.price }} x {{ item.quantity }}</text>
					</view>
				</view>

				<view class="order-card-actions">
					<view class="order-card-button order-card-button--light" @tap="handleOrderAction(item, 'service')">联系客服</view>
					<view class="order-card-button" @tap="handleOrderAction(item, 'detail')">查看详情</view>
				</view>
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserContentTabBar from '@/components/user-center/main/UserContentTabBar.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { filterOrderListByStatus, getOrderListPageMock } from '@/components/user-center/userCenterMock.js'

const pageMock = ref(getOrderListPageMock())
const activeStatus = ref('all')

const statusTabList = computed(() => pageMock.value.statusTabList || [])
const displayOrderList = computed(() => filterOrderListByStatus(pageMock.value.orderList || [], activeStatus.value))

onLoad((options) => {
	pageMock.value = getOrderListPageMock(options?.userId)
	activeStatus.value = 'all'
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleStatusChange(tabItem) {
	activeStatus.value = tabItem.key
	onStatusChange(tabItem)
}

function handleOrderDetail(item) {
	onOrderDetail(item)
	uni.showToast({
		title: '订单详情占位',
		icon: 'none'
	})
}

function handleOrderAction(item, actionKey) {
	onOrderAction(item, actionKey)
	uni.showToast({
		title: actionKey === 'service' ? '客服入口占位' : '订单详情占位',
		icon: 'none'
	})
}

function onStatusChange(tabItem) {
	// TODO：替换订单状态切换逻辑
	console.log('user-order-status-change', tabItem.key)
}

function onOrderDetail(item) {
	// TODO：替换订单详情跳转逻辑
	console.log('user-order-detail', item.id)
}

function onOrderAction(item, actionKey) {
	// TODO：替换订单操作逻辑
	console.log('user-order-action', item.id, actionKey)
}
</script>

<style scoped>
.order-section-gap {
	margin-top: 20rpx;
}

.order-card + .order-card {
	margin-top: 24rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid #eef2f7;
}

.order-card-head,
.order-card-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.order-card-status {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 34rpx;
	color: #fe2c55;
}

.order-card-time {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.order-card-body {
	display: flex;
	margin-top: 18rpx;
}

.order-card-cover {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 152rpx;
	height: 152rpx;
	border-radius: 28rpx;
	flex-shrink: 0;
}

.order-card-cover-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.order-card-meta {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.order-card-title,
.order-card-spec,
.order-card-price {
	display: block;
}

.order-card-title {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.order-card-spec,
.order-card-price {
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.order-card-actions {
	margin-top: 18rpx;
	justify-content: flex-end;
	gap: 16rpx;
}

.order-card-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 68rpx;
	padding: 0 26rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}

.order-card-button--light {
	background: #f8fafc;
	color: #0f172a;
}
</style>
