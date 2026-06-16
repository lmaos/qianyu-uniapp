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

		<ShopCustomerServiceSheet
			:visible="serviceSheetVisible"
			:sheet-data="serviceSheetData"
			@close="handleCloseServiceSheet"
			@question-click="handleServiceQuestionClick"
			@menu-click="handleServiceMenuClick"
			@primary="handleServicePrimary"
			@secondary="handleServiceSecondary"
		/>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ShopCustomerServiceSheet from '@/components/shop/common/ShopCustomerServiceSheet.vue'
import UserContentTabBar from '@/components/user-center/main/UserContentTabBar.vue'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import {
	buildShopOrderDetailUrl,
	getShopCustomerServiceSheetMock
} from '@/components/shop/common/shopFlowMock.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { adaptOrderSimple, extractPage } from '@/utils/shopAdapter'

// status 映射：前端 tab key → 后端 status
const STATUS_TO_BACKEND = {
  'all': 0,
  'pending-pay': 1,
  'pending-send': 2,
  'pending-receive': 3,
  'completed': 4,
  'refund': 5,
  'cancelled': 6
}

const statusTabList = [
  { key: 'all', label: '全部' },
  { key: 'pending-pay', label: '待付款' },
  { key: 'pending-send', label: '待发货' },
  { key: 'pending-receive', label: '待收货' },
  { key: 'completed', label: '已完成' },
  { key: 'refund', label: '退款/售后' },
  { key: 'cancelled', label: '已取消' }
]

const orderList = ref([])
const activeStatus = ref('all')
const loading = ref(false)
const total = ref(0)
const currentUserId = ref('mine-self')
const serviceSheetVisible = ref(false)
const serviceSheetData = ref(getShopCustomerServiceSheetMock({ contextType: 'order' }))

const displayOrderList = computed(() => orderList.value)

// 加载订单列表（oms/orderList）
async function loadOrderList() {
	loading.value = true
	try {
		const { code, response } = await request.post({
			url: API.OMS_ORDER_LIST,
			data: {
				status: STATUS_TO_BACKEND[activeStatus.value] ?? 0,
				pageNum: 1,
				pageSize: 20
			}
		})
		if (code !== 200) return
		if (response?.state !== 'OK') return
		if (response?.state !== 'OK') return
		const page = extractPage(response.content)
		orderList.value = page.records.map(adaptOrderSimple)
		total.value = page.totalRow
	} finally {
		loading.value = false
	}
}

onLoad((options) => {
	currentUserId.value = options?.userId || 'mine-self'
	loadOrderList()
})

watch(activeStatus, () => loadOrderList())

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

function handleStatusChange(tabItem) {
	activeStatus.value = tabItem.key
	onStatusChange(tabItem)
}

function handleOrderDetail(item) {
	onOrderDetail(item)
	uni.navigateTo({
		url: buildShopOrderDetailUrl({
			orderId: item.id,
			userId: currentUserId.value
		})
	})
}

function handleOrderAction(item, actionKey) {
	onOrderAction(item, actionKey)
	if (actionKey === 'service') {
		serviceSheetData.value = getShopCustomerServiceSheetMock({
			contextType: 'order',
			orderId: item.id,
			userId: currentUserId.value
		})
		serviceSheetVisible.value = true
		return
	}

	uni.navigateTo({
		url: buildShopOrderDetailUrl({
			orderId: item.id,
			userId: currentUserId.value
		})
	})
}

function handleCloseServiceSheet() {
	serviceSheetVisible.value = false
}

function handleServiceQuestionClick(question) {
	onServiceQuestionClick(question)
	uni.showToast({
		title: '问题已带入咨询',
		icon: 'none'
	})
}

function handleServiceMenuClick(menuItem) {
	onServiceMenuClick(menuItem)
	uni.showToast({
		title: `${menuItem.label}占位`,
		icon: 'none'
	})
}

function handleServicePrimary() {
	onServicePrimary()
	uni.showToast({
		title: '开始咨询占位',
		icon: 'none'
	})
}

function handleServiceSecondary() {
	onServiceSecondary()
	uni.showToast({
		title: '投诉反馈占位',
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

function onServiceQuestionClick(question) {
	// TODO：替换订单客服快捷问题逻辑
	console.log('user-order-service-question', question)
}

function onServiceMenuClick(menuItem) {
	// TODO：替换订单客服菜单逻辑
	console.log('user-order-service-menu', menuItem.key)
}

function onServicePrimary() {
	// TODO：替换订单客服主 CTA 逻辑
	console.log('user-order-service-primary')
}

function onServiceSecondary() {
	// TODO：替换订单客服次 CTA 逻辑
	console.log('user-order-service-secondary')
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
