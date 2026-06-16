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
		</view>
	</view>
</template>

<script setup>
// ════════════════════════════════════════════════════════════
// ShopSubNavExtra.vue — 商城顶部扩展导航（仅搜索框 + 购物车）
// ════════════════════════════════════════════════════════════
//
// 原设计：搜索框 + 三级分类条。
// 新设计：分类条已迁到 MallScene 内（根据 cms-homePage 的 tabList 渲染 + defaultTabKey 高亮），
//        此处只保留搜索框 / 购物车入口。categoryList / activeId / category-change /
//        category-page-click 等 prop & event 仍声明以便兼容上层 extraProps，但不再渲染。

import ShopTopBar from '@/components/home/shop/ShopTopBar.vue'

defineProps({
	searchPlaceholder: {
		type: String,
		default: '搜索商品'
	},
	// 保留以兼容 index.vue 的 extraProps，但当前不再渲染
	categoryList: {
		type: Array,
		default: () => []
	},
	activeId: {
		type: String,
		default: ''
	}
})

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
</style>
