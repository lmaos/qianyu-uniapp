<template>
	<view :class="['shop-category-bar', compact ? 'shop-category-bar-compact' : '']">
		<view :class="['shop-category-panel', compact ? 'shop-category-panel-compact' : '']">
			<scroll-view class="shop-category-scroll" scroll-x show-scrollbar="false">
				<view class="shop-category-list">
					<view
						v-for="item in categoryList"
						:key="item.id"
						:class="['shop-category-item', activeId === item.id ? 'shop-category-item-active' : '']"
						@tap="emit('category-change', item)"
					>
						<text :class="['shop-category-text', activeId === item.id ? 'shop-category-text-active' : '']">
							{{ item.name }}
						</text>
					</view>
				</view>
			</scroll-view>

			<view class="shop-category-entry" @tap="emit('category-page-click')">
				<text class="shop-category-entry-text">分类</text>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	compact: {
		type: Boolean,
		default: false
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

// 抛出三级分类切换和分类总入口点击事件，父组件据此切换内容区。
const emit = defineEmits(['category-change', 'category-page-click'])
</script>

<style scoped>
.shop-category-bar {
	display: flex;
	align-items: center;
	height: 96rpx;
	padding: 4rpx 0 0 8rpx;
}

.shop-category-bar-compact {
	width: 100%;
	height: auto;
	padding: 0;
}

.shop-category-panel {
	display: flex;
	align-items: center;
	width: 100%;
}

.shop-category-panel-compact {
	min-height: 78rpx;
	border-radius: 24rpx;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 249, 251, 0.82) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 14rpx 30rpx rgba(255, 171, 191, 0.08), inset 0 1rpx 0 rgba(255, 255, 255, 0.48);
	backdrop-filter: blur(14rpx);
	-webkit-backdrop-filter: blur(14rpx);
	box-sizing: border-box;
}

.shop-category-scroll {
	flex: 1;
	min-width: 0;
	white-space: nowrap;
}

.shop-category-list {
	display: inline-flex;
	align-items: center;
	padding-right: 12rpx;
}

.shop-category-bar-compact .shop-category-list {
	padding-right: 8rpx;
}

.shop-category-item {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
	height: 64rpx;
	padding: 0 20rpx;
	border-radius: 999rpx;
	background: linear-gradient(180deg, #ffffff 0%, #fff8fb 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.92);
	box-shadow: 0 10rpx 24rpx rgba(255, 171, 191, 0.06);
}

.shop-category-bar-compact .shop-category-item {
	height: 56rpx;
	padding: 0 16rpx;
	margin-right: 12rpx;
	background: rgba(255, 255, 255, 0.86);
	border: 1rpx solid rgba(255, 255, 255, 0.86);
	box-shadow: 0 8rpx 18rpx rgba(255, 171, 191, 0.06);
}

.shop-category-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #667085;
	white-space: nowrap;
}

.shop-category-bar-compact .shop-category-text {
	color: #5f6c7b;
}

/* 选中状态的样式 */
.shop-category-text-active {
	font-weight: 600;
	color: #d94f7b;
}

.shop-category-item-active .shop-category-text,
.shop-category-bar-compact .shop-category-text-active,
.shop-category-bar-compact .shop-category-item-active .shop-category-text {
	font-weight: 600;
	color: #d94f7b;
}

.shop-category-item-active {
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 247, 250, 0.94) 100%);
	box-shadow: 0 12rpx 24rpx rgba(255, 171, 191, 0.1);
}

.shop-category-entry {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 92rpx;
	height: 64rpx;
	padding: 0 22rpx;
	margin-left: 12rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.92);
	flex-shrink: 0;
	box-shadow: 0 12rpx 24rpx rgba(255, 171, 191, 0.1);
}

.shop-category-bar-compact .shop-category-entry {
	min-width: 84rpx;
	height: 56rpx;
	padding: 0 18rpx;
	margin-left: 8rpx;
	background: rgba(255, 255, 255, 0.88);
	box-shadow: 0 10rpx 22rpx rgba(255, 171, 191, 0.08);
}

.shop-category-entry-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #d94f7b;
}

.shop-category-bar-compact .shop-category-entry-text {
	color: #d94f7b;
}

/* #ifdef H5 */
.shop-category-scroll::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}
/* #endif */
</style>
