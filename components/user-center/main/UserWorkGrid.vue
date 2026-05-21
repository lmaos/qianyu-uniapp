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
						<text class="user-work-thumb-text">{{ item.coverText }}</text>
						<view class="user-work-thumb-mask"></view>
						<view class="user-work-play-meta">
							<view class="user-work-stat">
								<image class="user-work-stat-icon" :src="userViewStatIconSvg" mode="aspectFit" />
								<text class="user-work-stat-text">{{ item.playCountText }}</text>
							</view>
							<view class="user-work-stat">
								<image class="user-work-stat-icon" :src="userLikeStatIconSvg" mode="aspectFit" />
								<text class="user-work-stat-text">{{ item.likeCountText }}</text>
							</view>
							<view class="user-work-stat">
								<image class="user-work-stat-icon" :src="userCommentStatIconSvg" mode="aspectFit" />
								<text class="user-work-stat-text">{{ item.commentCountText }}</text>
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
import {
	userCommentStatIconSvg,
	userLikeStatIconSvg,
	userViewStatIconSvg
} from '@/components/user-center/main/userContentIcons.js'

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
	border-radius: 24rpx;
	background: #e2e8f0;
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.08);
}

.user-work-item--placeholder {
	visibility: hidden;
}

.user-work-thumb {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.user-work-thumb-text {
	position: relative;
	z-index: 1;
	font-size: 24rpx;
	font-weight: 700;
	line-height: 30rpx;
	color: rgba(255, 255, 255, 0.82);
}

.user-work-thumb-mask {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	height: 136rpx;
	background: linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.58) 100%);
}

.user-work-play-meta {
	position: absolute;
	left: 14rpx;
	right: 14rpx;
	bottom: 14rpx;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10rpx;
	padding: 10rpx 14rpx;
	border-radius: 18rpx;
	background: rgba(15, 23, 42, 0.44);
	backdrop-filter: blur(12rpx);
	-webkit-backdrop-filter: blur(12rpx);
}

.user-work-stat {
	display: inline-flex;
	align-items: center;
	min-width: 0;
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
