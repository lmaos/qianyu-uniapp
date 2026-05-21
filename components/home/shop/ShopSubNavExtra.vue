<template>
	<view class="shop-sub-nav-extra">
		<view class="shop-header-panel">
			<view class="shop-header-top-row">
				<ShopTopBar
					compact
					:search-placeholder="searchPlaceholder"
					@search-click="emit('search-click')"
					@cart-click="emit('cart-click')"
				/>
			</view>

			<view class="shop-header-category-row">
				<ShopCategoryBar
					compact
					:category-list="categoryList"
					:active-id="activeId"
					@category-change="emit('category-change', $event)"
					@category-page-click="emit('category-page-click')"
				/>
			</view>
		</view>
	</view>
</template>

<script setup>
import ShopTopBar from '@/components/home/shop/ShopTopBar.vue'
import ShopCategoryBar from '@/components/home/shop/ShopCategoryBar.vue'

defineProps({
	searchPlaceholder: {
		type: String,
		default: '搜索商品'
	},
	categoryList: {
		type: Array,
		default: () => []
	},
	activeId: {
		type: String,
		default: ''
	}
})

// 将商城搜索、购物车和三级分类点击统一向外透传，方便首页壳层集中处理。
const emit = defineEmits(['search-click', 'cart-click', 'category-change', 'category-page-click'])
</script>

<style scoped>
.shop-sub-nav-extra {
	width: 100%;
	padding-top: 4rpx;
	box-sizing: border-box;
	background: transparent;
}

.shop-header-panel {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	background: transparent;
}

.shop-header-top-row {
	display: flex;
	align-items: center;
	min-height: 64rpx;
	padding: 12rpx 32rpx 0rpx;
	box-sizing: border-box;
}

.shop-header-category-row {
	display: flex;
	align-items: center;
	width: 100%;
	padding: 0rpx 32rpx 8rpx 32rpx;
	box-sizing: border-box;
}
</style>
