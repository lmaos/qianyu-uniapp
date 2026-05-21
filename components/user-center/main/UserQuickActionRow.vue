<template>
	<view class="user-quick-action-row">
		<view
			v-for="item in actionList"
			:key="item.key"
			class="user-quick-action-item"
			@tap="emit('action-click', item)"
		>
			<image class="user-quick-action-icon" :src="item.iconSvg || resolveUserCenterMinimalIcon(item.key)" mode="aspectFit" />
			<text class="user-quick-action-label">{{ item.label }}</text>
		</view>
	</view>
</template>

<script setup>
import { resolveUserCenterMinimalIcon } from '@/components/user-center/main/userCenterIcons.js'

defineProps({
	actionList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['action-click'])
</script>

<style scoped>
.user-quick-action-row {
	display: grid;
	grid-template-columns: repeat(5, minmax(0, 1fr));
	gap: 10rpx;
}

.user-quick-action-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 10rpx 2rpx 10rpx;
}

.user-quick-action-icon {
	width: 64rpx;
	height: 64rpx;
}

.user-quick-action-label {
	margin-top: 12rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #334155;
	text-align: center;
}
</style>
