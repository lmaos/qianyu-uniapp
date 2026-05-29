<template>
	<UserVirtualRows
		:row-list="rowList"
		:row-stride-rpx="334"
		:parent-scroll-top-px="parentScrollTopPx"
		:list-start-offset-px="listStartOffsetPx"
		:visible-buffer-rows="12"
		:active="active"
	>
		<template #row="{ row }">
			<view :key="row.rowIndex" class="user-work-row">
				<view
					v-for="item in row.items"
					:key="item.id"
					class="user-work-item"
					@tap="emit('item-click', item)"
				>
					<view class="user-work-thumb" :style="{ background: item.coverBackground }">
						<view class="user-work-play-meta">
							<view class="user-work-stat">
								<image class="user-work-stat-icon" :src="userViewStatIconSvg" mode="aspectFit" />
								<text class="user-work-stat-text">{{ item.playCountText }}</text>
							</view>
						</view>
					</view>
				</view>

				<view
					v-for="placeholderIndex in Math.max(0, 3 - row.items.length)"
					:key="`placeholder-${row.rowIndex}-${placeholderIndex}`"
					class="user-work-item user-work-item--placeholder"
				></view>
			</view>
		</template>
	</UserVirtualRows>
</template>

<script setup>
import UserVirtualRows from '@/components/user-center/main/UserVirtualRows.vue'
import { userViewStatIconSvg } from '@/components/user-center/main/userContentIcons.js'

defineProps({
	rowList: {
		type: Array,
		default: () => []
	},
	parentScrollTopPx: {
		type: Number,
		default: 0
	},
	listStartOffsetPx: {
		type: Number,
		default: 0
	},
	active: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['item-click'])
</script>

<style scoped>
.user-work-row {
	display: flex;
	gap: 14rpx;
	margin-bottom: 14rpx;
}

.user-work-item {
	overflow: hidden;
	flex: 1;
	min-width: 0;
	height: 320rpx;
	border-radius: 16rpx;
	background: #e2e8f0;
}

.user-work-item--placeholder {
	visibility: hidden;
}

.user-work-thumb {
	position: relative;
	height: 100%;
	border-radius: 16rpx;
}

.user-work-play-meta {
	position: absolute;
	left: 16rpx;
	bottom: 14rpx;
	display: flex;
	align-items: center;
}

.user-work-stat {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
}

.user-work-stat-icon {
	flex-shrink: 0;
	width: 20rpx;
	height: 20rpx;
}

.user-work-stat-text {
	font-size: 20rpx;
	line-height: 28rpx;
	color: #ffffff;
}
</style>
