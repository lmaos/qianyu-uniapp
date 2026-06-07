<template>
	<view class="shop-cart-page">
		<FullScreenPageLayout
			:page-background="SHOP_PAGE_BACKGROUND"
			content-tag="scroll-view"
			:content-props="cartContentProps"
			:content-style="cartContentStyle"
			:content-top-offset-px="12"
			:header-height-rpx="88"
			:header-side-padding-rpx="24"
			:header-background="SHOP_HEADER_BACKGROUND"
			:header-area-style="SHOP_HEADER_AREA_STYLE"
			:header-z-index="20"
			:footer-reserve-rpx="126"
			:footer-gap-rpx="18"
			:footer-top-padding-rpx="20"
			:footer-side-padding-rpx="24"
			:footer-inner-min-height-rpx="88"
			footer-background="#ffffff"
			footer-border-top="1rpx solid rgba(226, 232, 240, 0.88)"
		>
			<template #header>
				<ShopSubPageHeader title="购物车" @back="handleBack" />
			</template>

			<ShopCartList
				:cart-list="cartList"
				@toggle-all="handleToggleAll"
				@toggle-item="handleToggleItem"
				@increase-item="handleIncreaseItem"
				@decrease-item="handleDecreaseItem"
				@delete-item="handleDeleteItem"
			/>

			<template #footer>
				<view class="shop-cart-bottom-inner">
					<view class="shop-cart-clear" @tap="handleClearCart">清空</view>

					<view class="shop-cart-action-group">
						<view class="shop-cart-total">
							<text class="shop-cart-total-label">合计</text>
							<text class="shop-cart-total-value">¥{{ formattedTotalPrice }}</text>
						</view>

						<view class="shop-cart-checkout" @tap="handleCheckout">去结算</view>
					</view>
				</view>
			</template>
		</FullScreenPageLayout>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import FullScreenPageLayout from '@/components/common/FullScreenPageLayout.vue'
import ShopSubPageHeader from '@/components/shop/common/ShopSubPageHeader.vue'
import ShopCartList from '@/components/shop/cart/ShopCartList.vue'
import { buildCartOrderSubmitUrl } from '@/components/shop/cart/shopCartMock.js'
import {
	SHOP_HEADER_AREA_STYLE,
	SHOP_HEADER_BACKGROUND,
	SHOP_PAGE_BACKGROUND
} from '@/components/shop/common/shopSurface.js'
import request from '@/composables/baseRequest'
import API from '@/utils/api'
import { adaptCartItem } from '@/utils/shopAdapter'

const cartList = ref([])
const totalPrice = ref('0.00')
const loading = ref(false)
const cartContentProps = {
	'scroll-y': true
}
const cartContentStyle = {
	paddingRight: '24rpx',
	paddingLeft: '24rpx',
	height: '100%'
}

const selectedCartList = computed(() => cartList.value.filter((item) => item.checked))
const formattedTotalPrice = computed(() => {
	return formatPrice(
		selectedCartList.value.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0)
	)
})

// ── 加载购物车（oms/cartList） ────────────────────────
async function loadCartList() {
	loading.value = true
	try {
		const { code, data } = await request.post({ url: API.OMS_CART_LIST })
		if (code !== 200) return
		const content = data.content || {}
		cartList.value = (content.list || []).map(adaptCartItem)
		totalPrice.value = content.totalPrice || '0.00'
	} finally {
		loading.value = false
	}
}

onLoad(loadCartList)
onShow(loadCartList)   // 从其他页面返回时刷新

// 更新数量（oms/cartUpdate）
async function updateCartItemQuantity(cartItemId, quantity) {
	const { code } = await request.post({
		url: API.OMS_CART_UPDATE,
		data: { cartItemId, quantity }
	})
	if (code !== 200) {
		uni.showToast({ title: '更新数量失败', icon: 'none' })
		await loadCartList()
	}
}

// 删除商品（oms/cartDelete）
async function removeCartItems(cartItemIds) {
	const { code } = await request.post({
		url: API.OMS_CART_DELETE,
		data: { cartItemIds }
	})
	if (code === 200) {
		uni.showToast({ title: '删除成功', icon: 'none' })
	} else {
		await loadCartList()
	}
}

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleToggleAll() {
	const nextChecked = !(cartList.value.length > 0 && cartList.value.every((item) => item.checked))
	cartList.value = cartList.value.map((item) => ({
		...item,
		checked: nextChecked
	}))
	onToggleAll({
		checked: nextChecked
	})
}

function handleToggleItem(itemInfo) {
	cartList.value = cartList.value.map((item) =>
		item.id === itemInfo.id
			? {
					...item,
					checked: !item.checked
			  }
			: item
	)
	onToggleItem(itemInfo)
}

function handleIncreaseItem(itemInfo) {
	const matchedItem = cartList.value.find((item) => item.id === itemInfo.id)
	if (!matchedItem) {
		return
	}

	if (matchedItem.quantity >= matchedItem.stock) {
		uni.showToast({
			title: '已达最大数量',
			icon: 'none'
		})
		return
	}

	const newQty = matchedItem.quantity + 1
	matchedItem.quantity = newQty   // 乐观更新
	updateCartItemQuantity(matchedItem.id, newQty)
}

function handleDecreaseItem(itemInfo) {
	const matchedItem = cartList.value.find((item) => item.id === itemInfo.id)
	if (!matchedItem) {
		return
	}

	if (matchedItem.quantity > 1) {
		const newQty = matchedItem.quantity - 1
		matchedItem.quantity = newQty
		updateCartItemQuantity(matchedItem.id, newQty)
		return
	}

	uni.showModal({
		title: '删除商品',
		content: '当前数量减到 0 后将移除该商品，是否确认删除？',
		success: (result) => {
			if (result.confirm) {
				removeCartItem(itemInfo)
				return
			}

			uni.showToast({
				title: '已保留 1 件',
				icon: 'none'
			})
		}
	})
}

function handleDeleteItem(itemInfo) {
	removeCartItem(itemInfo)
}

function handleCheckout() {
	if (!selectedCartList.value.length) {
		uni.showToast({
			title: '请选择商品',
			icon: 'none'
		})
		return
	}

	onCheckout(selectedCartList.value)
	uni.navigateTo({
		url: buildCartOrderSubmitUrl(selectedCartList.value)
	})
}

function handleClearCart() {
	if (!cartList.value.length) {
		uni.showToast({
			title: '购物车已空',
			icon: 'none'
		})
		return
	}

	const clearedItemList = cartList.value.map((item) => ({
		id: item.id,
		productId: item.productId,
		skuId: item.skuId,
		quantity: item.quantity
	}))
	removeCartItems(clearedItemList.map((i) => i.id))
}

function removeCartItem(itemInfo) {
	cartList.value = cartList.value.filter((item) => item.id !== itemInfo.id)
	removeCartItems([itemInfo.id])
}

function onToggleAll(payload) {
	// TODO：替换购物车全选逻辑
	console.log('shop-cart-toggle-all', payload.checked)
}

function onToggleItem(itemInfo) {
	// TODO：替换购物车单项选中逻辑
	console.log('shop-cart-toggle-item', itemInfo.id)
}

function onQuantityChange(payload) {
	// TODO：替换购物车数量变更逻辑
	console.log('shop-cart-quantity-change', payload.id, payload.action)
}

function onDeleteItem(itemInfo) {
	// TODO：替换购物车删除逻辑
	console.log('shop-cart-delete-item', itemInfo.id, itemInfo.productId, itemInfo.skuId)
}

function onCheckout(selectedList) {
	// TODO：替换购物车去结算逻辑
	console.log(
		'shop-cart-checkout',
		selectedList.map((item) => `${item.productId}:${item.skuId}:${item.quantity}`).join('|')
	)
}

function onClearCart(clearedItemList) {
	// TODO：替换购物车清空逻辑
	console.log(
		'shop-cart-clear',
		clearedItemList.map((item) => `${item.productId}:${item.skuId}:${item.quantity}`).join('|')
	)
}

function formatPrice(value) {
	const price = Number(value)
	if (!Number.isFinite(price)) {
		return '0.00'
	}

	return `${price.toFixed(2)}`.replace(/\.00$/, '')
}
</script>

<style scoped>
.shop-cart-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%);
}

.shop-cart-bottom-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 88rpx;
	padding-left: 10rpx;
	padding-right: 10rpx;
	box-sizing: border-box;
	padding-bottom: 15rpx;
}

.shop-cart-clear {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.shop-cart-action-group {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.shop-cart-total {
	display: flex;
	align-items: baseline;
	gap: 10rpx;
}

.shop-cart-total-label {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.shop-cart-total-value {
	font-size: 34rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #ef4444;
}

.shop-cart-checkout {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 220rpx;
	height: 88rpx;
	padding: 0 36rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
