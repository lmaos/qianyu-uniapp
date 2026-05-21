<template>
	<view class="shop-content-wrap">
		<component :is="resolvedComponent" :active="active" :category-id="categoryId" :section-count="sectionCount" />
	</view>
</template>

<script setup>
import { computed } from 'vue'
import ShopRecommendContent from '@/components/home/shop/ShopRecommendContent.vue'
import ShopCategoryContent from '@/components/home/shop/ShopCategoryContent.vue'

const props = defineProps({
	activeComponent: {
		type: String,
		default: 'recommend'
	},
	active: {
		type: Boolean,
		default: false
	},
	categoryId: {
		type: String,
		default: ''
	},
	sectionCount: {
		type: Number,
		default: 3
	}
})

// 根据父层传入的内容标识，切换推荐内容或分类内容组件。
const resolvedComponent = computed(() => {
	return props.activeComponent === 'recommend' ? ShopRecommendContent : ShopCategoryContent
})
</script>

<style scoped>
.shop-content-wrap {
	padding-top: 20rpx;
}
</style>
