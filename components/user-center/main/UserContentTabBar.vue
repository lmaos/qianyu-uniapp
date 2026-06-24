<template>
	<scroll-view
		class="user-content-tab-bar"
		scroll-x
		:show-scrollbar="false"
		:scroll-into-view="activeAnchorId"
		:scroll-with-animation="true"
	>
		<view class="user-content-tab-track">
			<view
				v-for="item in props.tabList"
				:key="item.key"
				:id="`tab-${item.key}`"
				class="user-content-tab-item"
				:class="{
					'user-content-tab-item--active': item.key === props.activeTab,
					'user-content-tab-item--loading': Boolean(item.loading)
				}"
				@tap="emit('change', item)"
			>
				<view v-if="item.loading" class="user-content-tab-loading">
					<view class="user-content-tab-spinner"></view>
				</view>
				<template v-else>
					<text class="user-content-tab-text">{{ item.label }}</text>
					<text
						v-if="item.badge !== undefined && item.badge !== null && `${item.badge}` !== ''"
						class="user-content-tab-badge"
					>{{ item.badge }}</text>
				</template>
				<view class="user-content-tab-indicator"></view>
			</view>
		</view>
	</scroll-view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	tabList: {
		type: Array,
		default: () => []
	},
	activeTab: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['change'])

// 激活项锚点，配合 scroll-view 的 scroll-into-view 自动滚到可见位置
const activeAnchorId = computed(() => (props.activeTab ? `tab-${props.activeTab}` : ''))
</script>

<style scoped>
.user-content-tab-bar {
	width: 100%;
	white-space: nowrap;
}

.user-content-tab-track {
	display: inline-flex;
	align-items: center;
	gap: 40rpx;
	padding: 4rpx 4rpx 12rpx;
}

.user-content-tab-item {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 8rpx 4rpx 16rpx;
	flex-shrink: 0;
}

.user-content-tab-text {
	font-size: 26rpx;
	line-height: 36rpx;
	color: #64748b;
	transition: color 0.18s ease, font-weight 0.18s ease;
}

.user-content-tab-badge {
	margin-left: 8rpx;
	min-width: 28rpx;
	height: 28rpx;
	padding: 0 8rpx;
	border-radius: 999rpx;
	background: rgba(254, 44, 85, 0.12);
	font-size: 20rpx;
	line-height: 28rpx;
	color: #fe2c55;
	text-align: center;
}

.user-content-tab-indicator {
	position: absolute;
	left: 50%;
	bottom: 0;
	width: 0;
	height: 6rpx;
	border-radius: 999rpx;
	background: #fe2c55;
	transform: translateX(-50%);
	transition: width 0.22s ease;
}

.user-content-tab-item--active .user-content-tab-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #0f172a;
}

.user-content-tab-item--active .user-content-tab-indicator {
	width: 40rpx;
}

.user-content-tab-loading {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 52rpx;
	height: 36rpx;
}

.user-content-tab-spinner {
	width: 28rpx;
	height: 28rpx;
	border: 4rpx solid rgba(152, 162, 179, 0.22);
	border-top-color: #fe2c55;
	border-radius: 50%;
	animation: user-content-tab-spin 0.72s linear infinite;
}

.user-content-tab-item--loading .user-content-tab-spinner {
	border-top-color: #0f172a;
}

@keyframes user-content-tab-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
