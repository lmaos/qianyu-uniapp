<template>
	<view class="shop-cart-list">
		<view class="shop-cart-select-all" @tap="emit('toggle-all')">
			<view :class="['shop-cart-select-all-icon', allChecked ? 'shop-cart-select-all-icon--active' : '']">
				<text v-if="allChecked" class="shop-cart-select-all-mark">✓</text>
			</view>
			<text class="shop-cart-select-all-text">全选</text>
		</view>

		<view v-if="cartList.length" class="shop-cart-item-list">
			<ShopCartItem
				v-for="item in cartList"
				:key="item.id"
				:item-info="item"
				:checked="item.checked"
				@toggle-check="emit('toggle-item', $event)"
				@increase-item="emit('increase-item', $event)"
				@decrease-item="emit('decrease-item', $event)"
				@delete-item="emit('delete-item', $event)"
			/>
		</view>

		<view v-else class="shop-cart-empty">购物车为空</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import ShopCartItem from '@/components/shop/cart/ShopCartItem.vue'

const props = defineProps({
	cartList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['toggle-all', 'toggle-item', 'increase-item', 'decrease-item', 'delete-item'])

const allChecked = computed(() => {
	return props.cartList.length > 0 && props.cartList.every((item) => item.checked)
})
</script>

<style scoped>
.shop-cart-list {
	display: flex;
	flex-direction: column;
}

.shop-cart-select-all {
	display: inline-flex;
	align-items: center;
	align-self: flex-start;
	margin-bottom: 24rpx;
	padding: 0 8rpx 0 4rpx;
}

.shop-cart-select-all-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	border: 2rpx solid #cbd5e1;
	background: #ffffff;
	box-sizing: border-box;
}

.shop-cart-select-all-icon--active {
	border-color: #ef4444;
	background: #ef4444;
}

.shop-cart-select-all-mark {
	font-size: 22rpx;
	line-height: 22rpx;
	color: #ffffff;
}

.shop-cart-select-all-text {
	margin-left: 12rpx;
	font-size: 26rpx;
	font-weight: 500;
	line-height: 34rpx;
	color: #111827;
}

.shop-cart-item-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.shop-cart-empty {
	padding: 88rpx 0;
	font-size: 26rpx;
	line-height: 36rpx;
	color: #64748b;
	text-align: center;
}
</style>
