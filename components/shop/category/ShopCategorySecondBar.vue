<template>
	<view class="shop-category-second-shell">
		<view class="shop-category-second-bar">
			<scroll-view
				class="shop-category-second-scroll"
				scroll-x
				enable-flex
				scroll-with-animation
				:scroll-into-view="scrollIntoViewId"
				show-scrollbar="false"
			>
				<view class="shop-category-second-list">
					<view
						v-for="item in secondCategoryList"
						:id="`second-tab-${item.id}`"
						:key="item.id"
						class="shop-category-second-item"
						:class="{ 'shop-category-second-item--active': item.id === activeId }"
						@tap="emit('tag-click', item)"
					>
						<text class="shop-category-second-text">{{ item.name }}</text>
					</view>
				</view>
			</scroll-view>

			<view class="shop-category-expand-trigger" @tap="emit('toggle-expand')">
				<text class="shop-category-expand-icon">{{ expanded ? '收' : '展' }}</text>
			</view>
		</view>

		<view v-if="expanded" class="shop-category-expand-panel">
			<view class="shop-category-expand-grid">
				<view
					v-for="item in secondCategoryList"
					:key="item.id"
					class="shop-category-expand-item"
					:class="{ 'shop-category-expand-item--active': item.id === activeId }"
					@tap="emit('expand-item-click', item)"
				>
					<text class="shop-category-expand-text">{{ item.name }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	secondCategoryList: {
		type: Array,
		default: () => []
	},
	activeId: {
		type: String,
		default: ''
	},
	expanded: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['tag-click', 'toggle-expand', 'expand-item-click'])

const scrollIntoViewId = computed(() => (props.activeId ? `second-tab-${props.activeId}` : ''))
</script>

<style scoped>
.shop-category-second-shell {
	position: relative;
	background: #ffffff;
}

.shop-category-second-bar {
	display: flex;
	align-items: center;
	padding: 16rpx 24rpx 20rpx;
	border-bottom: 1rpx solid #f1f5f9;
}

.shop-category-second-scroll {
	flex: 1;
	min-width: 0;
}

.shop-category-second-list {
	display: flex;
	align-items: center;
	padding-right: 16rpx;
}

.shop-category-second-item {
	flex-shrink: 0;
	margin-right: 18rpx;
	padding: 12rpx 24rpx;
	border-radius: 999rpx;
	border: 1rpx solid transparent;
	background: #f8fafc;
}

.shop-category-second-item--active {
	border-color: rgba(239, 68, 68, 0.3);
	background: rgba(239, 68, 68, 0.08);
}

.shop-category-second-text {
	font-size: 24rpx;
	color: #475569;
}

.shop-category-second-item--active .shop-category-second-text {
	color: #ef4444;
	font-weight: 600;
}

.shop-category-expand-trigger {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 56rpx;
	margin-left: 12rpx;
	border-radius: 20rpx;
	background: #f8fafc;
}

.shop-category-expand-icon {
	font-size: 24rpx;
	color: #0f172a;
}

.shop-category-expand-panel {
	position: absolute;
	top: 92rpx;
	left: 0;
	right: 0;
	z-index: 12;
	padding: 24rpx;
	background: #ffffff;
	box-shadow: 0 18rpx 40rpx rgba(15, 23, 42, 0.08);
}

.shop-category-expand-grid {
	display: flex;
	flex-wrap: wrap;
	margin-right: -16rpx;
	margin-bottom: -16rpx;
}

.shop-category-expand-item {
	display: flex;
	align-items: center;
	justify-content: center;
	width: calc(33.333% - 16rpx);
	height: 72rpx;
	margin-right: 16rpx;
	margin-bottom: 16rpx;
	border-radius: 24rpx;
	background: #f8fafc;
}

.shop-category-expand-item--active {
	background: rgba(239, 68, 68, 0.08);
}

.shop-category-expand-text {
	font-size: 24rpx;
	color: #475569;
}

.shop-category-expand-item--active .shop-category-expand-text {
	color: #ef4444;
	font-weight: 600;
}
</style>
