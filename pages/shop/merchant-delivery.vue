<template>
	<view class="shop-merchant-page">
		<FullScreenPageLayout
			:page-background="SHOP_PAGE_BACKGROUND"
			content-tag="scroll-view"
			:content-props="contentProps"
			:content-style="contentStyle"
			:content-top-offset-px="12"
			:header-height-rpx="88"
			:header-side-padding-rpx="24"
			:header-background="SHOP_HEADER_BACKGROUND"
			:header-area-style="SHOP_HEADER_AREA_STYLE"
			:header-z-index="20"
		>
			<template #header>
				<ShopSubPageHeader title="订单发货" @back="handleBack" />
			</template>

			<view class="shop-merchant-summary-grid">
				<view v-for="item in summaryList" :key="item.key" class="shop-merchant-summary-card">
					<text class="shop-merchant-summary-value">{{ item.value }}</text>
					<text class="shop-merchant-summary-label">{{ item.label }}</text>
				</view>
			</view>

			<view class="shop-merchant-filter-row">
				<view
					v-for="item in filterList"
					:key="item.key"
					:class="['shop-merchant-filter', activeFilter === item.key ? 'shop-merchant-filter-active' : '']"
					@tap="handleFilterChange(item)"
				>
					{{ item.label }}
				</view>
			</view>

			<view
				v-for="item in deliveryList"
				:key="item.id"
				class="shop-merchant-delivery-card"
			>
				<view class="shop-merchant-delivery-head">
					<text class="shop-merchant-delivery-order">{{ item.orderSn }}</text>
					<text class="shop-merchant-delivery-status">{{ item.statusText }}</text>
				</view>
				<text v-if="item.buyerNick" class="shop-merchant-delivery-desc">买家：{{ item.buyerNick }}</text>
				<text class="shop-merchant-delivery-title">{{ item.title }}</text>
				<text class="shop-merchant-delivery-desc">{{ item.specText }}</text>
				<view class="shop-merchant-item-actions">
					<view class="shop-merchant-item-button shop-merchant-item-button-light" @tap="handleDeliveryAction(item, 'logistics')">查看物流</view>
					<view
						v-if="activeFilter === 'pending'"
						class="shop-merchant-item-button"
						@tap="handleDeliveryAction(item, 'ship')"
					>去发货</view>
				</view>
			</view>

			<view v-if="!loading && !deliveryList.length" class="shop-merchant-empty">
				<text class="shop-merchant-empty-text">暂无订单</text>
			</view>
		</FullScreenPageLayout>
	</view>
</template>

<script setup>
import { ref, watch } from 'vue'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { adaptOrderSimple, extractPage } from '@/utils/shopAdapter'

// 前端 tab key → 后端 OrderQueryDTO.status（符号码，非 OmsOrder.status）
// 后端：1=待付款 2=待发货 3=待收货 4=已完成 5=售后中 6=已取消/已关闭
const FILTER_TO_BACKEND = { pending: 2, shipping: 3, signed: 4 }

const filterList = [
	{ key: 'pending', label: '待发货' },
	{ key: 'shipping', label: '运输中' },
	{ key: 'signed', label: '已签收' }
]

const summaryList = ref([])
const deliveryList = ref([])
const activeFilter = ref('pending')
const loading = ref(false)

const contentProps = {
	'scroll-y': true
}

const contentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	paddingBottom: '36rpx'
}

// 三个 tab 的 totalRow 都要展示，并行请求后取当前 tab 的 records
async function loadDeliveryPage() {
	loading.value = true
	try {
		const [pendingRes, shippingRes, signedRes] = await Promise.all([
			request.post({
				url: API.M_OMS_ORDER_LIST,
				data: { status: FILTER_TO_BACKEND.pending, pageNum: 1, pageSize: 20 }
			}),
			request.post({
				url: API.M_OMS_ORDER_LIST,
				data: { status: FILTER_TO_BACKEND.shipping, pageNum: 1, pageSize: 20 }
			}),
			request.post({
				url: API.M_OMS_ORDER_LIST,
				data: { status: FILTER_TO_BACKEND.signed, pageNum: 1, pageSize: 20 }
			})
		])

		const pendingTotal = pickTotalRow(pendingRes)
		const shippingTotal = pickTotalRow(shippingRes)
		const signedTotal = pickTotalRow(signedRes)

		summaryList.value = [
			{ key: 'pending', label: '待发货', value: String(pendingTotal) },
			{ key: 'shipping', label: '运输中', value: String(shippingTotal) },
			{ key: 'signed', label: '已签收', value: String(signedTotal) }
		]

		const activeRes = { pending: pendingRes, shipping: shippingRes, signed: signedRes }[activeFilter.value] || pendingRes
		const page = extractPage(activeRes?.response?.content)
		deliveryList.value = (page.records || []).map(adaptOrderSimple).filter(Boolean)
	} finally {
		loading.value = false
	}
}

function pickTotalRow(res) {
	if (res?.code !== 200) return 0
	if (res?.response?.state !== 'OK') return 0
	return extractPage(res.response.content).totalRow || 0
}

// 发货（MVP：物流公司/单号传占位，后续迭代接入弹窗）
async function shipOrder(orderId) {
	const { code, response } = await request.post({
		url: API.M_OMS_ORDER_SHIP,
		data: {
			orderId,
			logisticsCompany: '占位物流',
			logisticsNo: `SF${Date.now()}`
		}
	})
	if (code === 200 && response?.state === 'OK') {
		uni.showToast({ title: '已发货', icon: 'success' })
		loadDeliveryPage()
	} else {
		uni.showToast({ title: '发货失败', icon: 'none' })
	}
}

watch(activeFilter, () => loadDeliveryPage())
loadDeliveryPage()

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleFilterChange(filterItem) {
	activeFilter.value = filterItem.key
}

function handleDeliveryAction(item, actionKey) {
	if (actionKey === 'ship') {
		shipOrder(item.id)
		return
	}
	if (actionKey === 'logistics') {
		// MVP 阶段：直接跳物流查询页（C 端共用），后续可换 B 端专用物流详情
		uni.showToast({ title: '物流详情占位', icon: 'none' })
	}
}
</script>

<style scoped>
.shop-merchant-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-merchant-summary-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16rpx;
}

.shop-merchant-summary-card,
.shop-merchant-delivery-card {
	padding: 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-merchant-summary-value,
.shop-merchant-summary-label,
.shop-merchant-delivery-order,
.shop-merchant-delivery-status,
.shop-merchant-delivery-title,
.shop-merchant-delivery-desc {
	display: block;
}

.shop-merchant-summary-value {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #111827;
}

.shop-merchant-summary-label,
.shop-merchant-delivery-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.shop-merchant-filter-row {
	display: flex;
	gap: 16rpx;
	margin-top: 22rpx;
	margin-bottom: 22rpx;
}

.shop-merchant-filter {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 66rpx;
	padding: 0 28rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.9);
	font-size: 24rpx;
	line-height: 32rpx;
	color: #667085;
}

.shop-merchant-filter-active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.16) 0%, rgba(214, 228, 255, 0.16) 100%);
	font-weight: 700;
	color: #d94f7b;
}

.shop-merchant-delivery-card + .shop-merchant-delivery-card {
	margin-top: 18rpx;
}

.shop-merchant-delivery-head,
.shop-merchant-item-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
}

.shop-merchant-delivery-order {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 34rpx;
	color: #111827;
}

.shop-merchant-delivery-status {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #fe2c55;
}

.shop-merchant-delivery-title {
	margin-top: 16rpx;
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #111827;
}

.shop-merchant-item-actions {
	margin-top: 20rpx;
	justify-content: flex-end;
}

.shop-merchant-item-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 72rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}

.shop-merchant-item-button-light {
	background: #f8fafc;
	color: #0f172a;
}

.shop-merchant-empty {
	padding: 80rpx 0;
	text-align: center;
}

.shop-merchant-empty-text {
	font-size: 26rpx;
	color: #94a3b8;
}
</style>
