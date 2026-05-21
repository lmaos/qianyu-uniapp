<template>
	<view v-if="visible" class="playmate-launch-sheet">
		<view class="playmate-launch-sheet-mask" @tap="emit('close')"></view>
		<view class="playmate-launch-sheet-panel">
			<view class="playmate-launch-sheet-handle"></view>
			<text class="playmate-launch-sheet-title">{{ sheetData?.title || '快捷发起' }}</text>
			<text class="playmate-launch-sheet-desc">{{ sheetData?.desc || '选一个更顺手的方式开始。' }}</text>

			<view class="playmate-launch-sheet-option-list">
				<view
					v-for="item in sheetData?.optionList || []"
					:key="item.key"
					:class="[
						'playmate-launch-sheet-option',
						activeOptionKey === item.key ? 'playmate-launch-sheet-option-active' : ''
					]"
					@tap="emit('option-select', item)"
				>
					<text class="playmate-launch-sheet-option-title">{{ item.label }}</text>
					<text class="playmate-launch-sheet-option-desc">{{ item.desc }}</text>
				</view>
			</view>

			<view class="playmate-launch-sheet-footer">
				<view class="playmate-launch-sheet-cancel" @tap="emit('close')">先等等</view>
				<view class="playmate-launch-sheet-confirm" @tap="emit('confirm')">继续</view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	sheetData: {
		type: Object,
		default: () => ({})
	},
	activeOptionKey: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['close', 'option-select', 'confirm'])
</script>

<style scoped>
.playmate-launch-sheet {
	position: fixed;
	inset: 0;
	z-index: 80;
}

.playmate-launch-sheet-mask {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.36);
	backdrop-filter: blur(8rpx);
	-webkit-backdrop-filter: blur(8rpx);
}

.playmate-launch-sheet-panel {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	padding: 20rpx 24rpx 28rpx;
	border-radius: 36rpx 36rpx 0 0;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 251, 1) 100%);
	box-shadow: 0 -18rpx 40rpx rgba(148, 163, 184, 0.16);
}

.playmate-launch-sheet-handle {
	width: 88rpx;
	height: 8rpx;
	margin: 0 auto 20rpx;
	border-radius: 999rpx;
	background: rgba(148, 163, 184, 0.26);
}

.playmate-launch-sheet-title,
.playmate-launch-sheet-desc,
.playmate-launch-sheet-option-title,
.playmate-launch-sheet-option-desc {
	display: block;
}

.playmate-launch-sheet-title {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.playmate-launch-sheet-desc {
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #64748b;
}

.playmate-launch-sheet-option-list {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
	margin-top: 24rpx;
}

.playmate-launch-sheet-option {
	padding: 22rpx 20rpx;
	border-radius: 24rpx;
	background: rgba(248, 250, 252, 0.94);
	border: 1rpx solid transparent;
}

.playmate-launch-sheet-option-active {
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.14) 0%, rgba(255, 196, 160, 0.2) 100%);
	border-color: rgba(255, 151, 174, 0.24);
}

.playmate-launch-sheet-option-title {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.playmate-launch-sheet-option-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #64748b;
}

.playmate-launch-sheet-footer {
	display: flex;
	gap: 16rpx;
	margin-top: 26rpx;
}

.playmate-launch-sheet-cancel,
.playmate-launch-sheet-confirm {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	height: 84rpx;
	border-radius: 999rpx;
	font-size: 26rpx;
	font-weight: 600;
}

.playmate-launch-sheet-cancel {
	background: rgba(248, 250, 252, 0.96);
	color: #475467;
}

.playmate-launch-sheet-confirm {
	background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
	color: #ffffff;
}
</style>
