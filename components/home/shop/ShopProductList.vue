<template>
	<view class="shop-product-list">
		<template v-if="productList.length">
			<ShopProductItem
				v-for="item in productList"
				:key="item.id"
				:product-info="item"
				@item-click="handleItemClick"
			/>
		</template>

		<view v-else class="shop-product-empty">
			<text class="shop-product-empty-text">{{ emptyText }}</text>
		</view>
	</view>
</template>

<script setup>
import ShopProductItem from '@/components/home/shop/ShopProductItem.vue'

const props = defineProps({
	productList: {
		type: Array,
		default: () => []
	},
	emptyText: {
		type: String,
		default: '商品列表占位中'
	}
})

const emit = defineEmits(['product-click'])

// 商品列表本身只负责排版和转发点击事件，具体跳转交给外层内容组件。
function handleItemClick(productInfo) {
	emit('product-click', productInfo)
}
</script>

<style scoped>
.shop-product-list {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16rpx 14rpx;
}

.shop-product-empty {
	grid-column: 1 / -1;
	padding: 48rpx 24rpx;
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.88);
	text-align: center;
}

.shop-product-empty-text {
	font-size: 24rpx;
	line-height: 34rpx;
	color: #98a2b3;
}
</style>
