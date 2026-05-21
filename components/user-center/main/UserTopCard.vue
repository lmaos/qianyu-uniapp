<template>
	<view class="user-top-card" :style="cardStyle">
		<view class="user-top-card-row-a">
			<view class="user-top-card-add-friend" @tap="emit('add-friend')">添加朋友</view>

			<view class="user-top-card-right-actions">
				<view class="user-top-card-visitor" @tap="emit('visitor-click')">
					<text class="user-top-card-visitor-text">新访客 {{ visitorCountText }}</text>
				</view>
				<view class="user-top-card-settings" @tap="emit('settings-click')">
					<image class="user-top-card-action-icon" :src="userCenterSettingsIconSvg" mode="aspectFit" />
				</view>
			</view>
		</view>

		<view class="user-top-card-row-b">
			<view class="user-top-card-avatar" :style="{ background: profileInfo.avatarBackground }">
				<text class="user-top-card-avatar-text">{{ profileInfo.avatarText }}</text>
			</view>

			<view class="user-top-card-meta">
				<text class="user-top-card-nickname">{{ profileInfo.nickname }}</text>
				<text class="user-top-card-id">专属ID：{{ profileInfo.displayId }}</text>
				<view v-if="(profileInfo.nestStatusList || []).length" class="user-top-card-status-row">
					<view
						v-for="item in profileInfo.nestStatusList || []"
						:key="item"
						class="user-top-card-status-chip"
					>
						{{ item }}
					</view>
				</view>
			</view>

			<view class="user-top-card-qrcode" @tap="emit('qrcode-click')">
				<image class="user-top-card-action-icon user-top-card-action-icon--qrcode" :src="userCenterQrCodeIconSvg" mode="aspectFit" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { userCenterQrCodeIconSvg, userCenterSettingsIconSvg } from '@/components/user-center/main/userCenterIcons.js'

const props = defineProps({
	profileInfo: {
		type: Object,
		default: () => ({})
	},
	showBackground: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['add-friend', 'visitor-click', 'settings-click', 'qrcode-click'])
const { safeTopPx } = useSafeAreaMetrics()

const cardStyle = computed(() => ({
	paddingTop: `${safeTopPx.value + 18}px`,
	background: props.showBackground ? props.profileInfo.coverBackground : 'transparent'
}))

const visitorCountText = computed(() => props.profileInfo.visitorCount || 0)
</script>

<style scoped>
.user-top-card {
	padding-right: 24rpx;
	padding-bottom: 28rpx;
	padding-left: 24rpx;
	border-radius: 0 0 36rpx 36rpx;
	box-sizing: border-box;
}

.user-top-card-row-a,
.user-top-card-row-b {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.user-top-card-row-b {
	margin-top: 28rpx;
}

.user-top-card-add-friend,
.user-top-card-visitor,
.user-top-card-settings,
.user-top-card-qrcode {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 64rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.84);
	border: 1rpx solid rgba(255, 255, 255, 0.86);
	box-shadow: 0 14rpx 28rpx rgba(255, 171, 191, 0.1);
}

.user-top-card-add-friend,
.user-top-card-visitor {
	padding: 0 24rpx;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #0f172a;
}

.user-top-card-right-actions {
	display: flex;
	align-items: center;
	gap: 14rpx;
}

.user-top-card-settings,
.user-top-card-qrcode {
	width: 64rpx;
}

.user-top-card-row-b {
	align-items: center;
}

.user-top-card-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 148rpx;
	height: 148rpx;
	border-radius: 50%;
	box-shadow: 0 20rpx 42rpx rgba(255, 171, 191, 0.2);
}

.user-top-card-avatar-text {
	font-size: 58rpx;
	font-weight: 700;
	line-height: 1;
	color: #ffffff;
}

.user-top-card-meta {
	flex: 1;
	min-width: 0;
	padding: 0 24rpx;
}

.user-top-card-nickname {
	display: block;
	font-size: 38rpx;
	font-weight: 700;
	line-height: 48rpx;
	color: #0f172a;
}

.user-top-card-id {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #475467;
}

.user-top-card-status-row {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
	margin-top: 14rpx;
}

.user-top-card-status-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 42rpx;
	padding: 0 14rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.68);
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #475467;
}

.user-top-card-qrcode {
	border-radius: 24rpx;
}

.user-top-card-action-icon {
	width: 30rpx;
	height: 30rpx;
}

.user-top-card-action-icon--qrcode {
	width: 32rpx;
	height: 32rpx;
}

.user-top-card-visitor-text {
	max-width: 220rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
