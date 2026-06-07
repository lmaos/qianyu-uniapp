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
				<ShopSubPageHeader title="商品管理" @back="handleBack" />
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
				v-for="item in displayGoodsList"
				:key="item.id"
				class="shop-merchant-item-card"
			>
				<view class="shop-merchant-item-cover" :style="{ background: item.coverBackground }">{{ item.coverText }}</view>
				<view class="shop-merchant-item-main">
					<text class="shop-merchant-item-title">{{ item.title }}</text>
					<text class="shop-merchant-item-desc">{{ item.stockText }}</text>
					<text class="shop-merchant-item-price">¥{{ item.price }} · {{ item.statusText }}</text>
					<view class="shop-merchant-item-actions">
						<view class="shop-merchant-item-button shop-merchant-item-button-light" @tap="handleGoodsAction(item, 'edit')">编辑商品</view>
						<view class="shop-merchant-item-button" @tap="handleGoodsAction(item, 'more')">更多操作</view>
					</view>
				</view>
			</view>

			<view class="shop-merchant-create-button" @tap="handleCreateGoods">新增商品</view>
		</FullScreenPageLayout>
	</view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { extractPage } from '@/utils/shopAdapter'

// filter → 后端值
const FILTER_TO_BACKEND = { all: 0, selling: 1, pending: 2, warning: 3 }

// 静态筛选 Tab（不依赖后端）
const filterList = [
  { key: 'all', label: '全部' },
  { key: 'selling', label: '在售' },
  { key: 'pending', label: '待上架' },
  { key: 'warning', label: '库存预警' }
]

const summaryList = ref([])
const goodsList = ref([])
const activeFilter = ref('all')
const loading = ref(false)

const contentProps = {
	'scroll-y': true
}

const contentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	paddingBottom: '36rpx'
}

const displayGoodsList = computed(() => {
	if (activeFilter.value === 'all') return goodsList.value
	if (activeFilter.value === 'selling') {
		return goodsList.value.filter((it) => it.statusText === '在售中')
	}
	if (activeFilter.value === 'pending') {
		return goodsList.value.filter((it) => it.statusText === '待上架' || it.statusText === '已下架')
	}
	return goodsList.value.filter((it) => it.statusText === '库存预警')
})

// 加载商品管理页（merchant/pms/goodsPage）
async function loadGoodsPage() {
	loading.value = true
	try {
		const { code, data } = await request.post({
			url: API.M_PMS_GOODS_PAGE,
			data: {
				filter: FILTER_TO_BACKEND[activeFilter.value] ?? 0,
				pageNum: 1,
				pageSize: 20
			}
		})
		if (code !== 200) return
		const content = data.content || {}
		summaryList.value = content.summaryList || []
		const page = extractPage(content.goodsList)
		goodsList.value = page.records
	} finally {
		loading.value = false
	}
}

// 上架/下架
async function changeSpuStatus(spuId, action) {
	const url = action === 'on' ? API.M_PMS_SPU_LIST_ON : API.M_PMS_SPU_LIST_OFF
	const { code } = await request.post({ url, data: { spuId } })
	if (code === 200) {
		uni.showToast({ title: action === 'on' ? '已上架' : '已下架', icon: 'success' })
		loadGoodsPage()
	} else {
		uni.showToast({ title: '操作失败', icon: 'none' })
	}
}

watch(activeFilter, () => loadGoodsPage())
loadGoodsPage()

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleFilterChange(filterItem) {
	activeFilter.value = filterItem.key
}

function handleGoodsAction(item, actionKey) {
	if (actionKey === 'edit') {
		uni.showToast({ title: '编辑商品占位', icon: 'none' })
		return
	}
	if (actionKey === 'on' || actionKey === 'off') {
		changeSpuStatus(item.id, actionKey)
		return
	}
	uni.showToast({ title: '更多操作占位', icon: 'none' })
}

function handleCreateGoods() {
	uni.showToast({ title: '新增商品占位', icon: 'none' })
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
.shop-merchant-item-card {
	padding: 24rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.06);
}

.shop-merchant-summary-value,
.shop-merchant-summary-label,
.shop-merchant-item-title,
.shop-merchant-item-desc,
.shop-merchant-item-price {
	display: block;
}

.shop-merchant-summary-value {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #111827;
}

.shop-merchant-summary-label,
.shop-merchant-item-desc {
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

.shop-merchant-item-card {
	display: flex;
	align-items: center;
	margin-top: 18rpx;
}

.shop-merchant-item-cover {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 144rpx;
	height: 144rpx;
	border-radius: 28rpx;
	flex-shrink: 0;
	font-size: 28rpx;
	font-weight: 700;
	color: rgba(17, 24, 39, 0.72);
}

.shop-merchant-item-main {
	flex: 1;
	min-width: 0;
	margin-left: 20rpx;
}

.shop-merchant-item-title {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #111827;
}

.shop-merchant-item-price {
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #ef4444;
}

.shop-merchant-item-actions {
	display: flex;
	gap: 14rpx;
	margin-top: 18rpx;
}

.shop-merchant-item-button,
.shop-merchant-create-button {
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

.shop-merchant-create-button {
	width: 100%;
	margin-top: 24rpx;
}
</style>
