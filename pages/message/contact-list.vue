<template>
	<view class="contact-page">
		<view class="contact-top-bar" :style="{ paddingTop: `${safeTopPx + 18}px` }">
			<view class="contact-back-button" @tap="handleBack">‹</view>
			<text class="contact-page-title">{{ pageMock.title }}</text>
			<view class="contact-search-entry" @tap="handleSearchClick">搜索</view>
		</view>

		<scroll-view class="contact-scroll" scroll-y show-scrollbar="false">
			<view class="contact-content">
				<view
					v-for="item in contactList"
					:key="item.id"
					class="contact-card"
					@tap="handleContactClick(item)"
				>
					<view class="contact-avatar-shell">
						<view class="contact-avatar" :style="{ background: item.avatarBackground }">
							{{ item.avatarText }}
						</view>
						<view v-if="item.hasNewMessage" class="contact-message-dot"></view>
					</view>

					<text class="contact-name">{{ item.name }}</text>

					<view class="contact-badge-group">
						<view
							v-if="item.hasMomentUpdate"
							class="contact-moment-bubble"
							@tap.stop="handleMomentClick(item)"
						>
							动态
						</view>
						<view
							v-if="item.onlineState !== 'hidden'"
							:class="[
								'contact-presence-dot',
								item.onlineState === 'online' ? 'contact-presence-dot-online' : 'contact-presence-dot-offline'
							]"
						></view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { fetchFriendContacts } from '@/composables/useSocialApi.js'
import { buildPageUrl } from '@/components/user-center/userCenterMock.js'
import {
	buildMessageContactListPageMock,
	buildMessageSearchUrl,
	buildMessageUserProfileUrl
} from '@/components/message/messageMock.js'

const { safeTopPx } = useSafeAreaMetrics()
const pageMock = buildMessageContactListPageMock()
// 联系人列表：拉取真实好友；红点(hasNewMessage)/动态标识(hasMomentUpdate)/在线态 暂保留设计、先不接后端
const contactList = ref([])

async function loadContacts() {
	try {
		const list = await fetchFriendContacts()
		contactList.value = (list || []).map((f) => ({
			id: f.userId,
			userId: f.userId,
			name: f.nickname || f.userNo || '',
			avatarText: (f.nickname || f.userNo || '?').charAt(0).toUpperCase(),
			avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
			hasNewMessage: false,
			hasMomentUpdate: false,
			onlineState: 'offline'
		}))
	} catch (e) {
		console.error('[contact-list] 加载联系人失败:', e)
	}
}

onShow(() => {
	loadContacts()
})

function buildChatUrl(item) {
	return buildPageUrl('/pages/message/chat', {
		conversationId: item.conversationId || item.id || '',
		chatType: 1,
		targetId: item.userId || item.id || '',
		name: item.name || '',
	})
}

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleSearchClick() {
	uni.navigateTo({
		url: buildMessageSearchUrl()
	})
}

function handleContactClick(item) {
	uni.navigateTo({
		url: buildChatUrl(item)
	})
}

function handleMomentClick(item) {
	uni.navigateTo({
		url: buildMessageUserProfileUrl(item)
	})
}
</script>

<style scoped>
.contact-page {
	min-height: 100vh;
	background:
		radial-gradient(circle at top right, rgba(255, 195, 208, 0.38) 0%, rgba(255, 195, 208, 0) 30%),
		linear-gradient(180deg, #fff7fa 0%, #f8fafc 40%, #f8fafc 100%);
}

.contact-top-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-right: 24rpx;
	padding-left: 24rpx;
}

.contact-back-button,
.contact-search-entry {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 72rpx;
	height: 72rpx;
	padding: 0 18rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.84);
	box-shadow: 0 12rpx 26rpx rgba(255, 171, 191, 0.08);
	font-size: 24rpx;
	color: #0f172a;
	box-sizing: border-box;
}

.contact-page-title {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.contact-scroll {
	height: calc(100vh - 120rpx);
}

.contact-content {
	padding: 28rpx 24rpx 36rpx;
	box-sizing: border-box;
}

.contact-card {
	display: flex;
	align-items: center;
	padding: 20rpx 22rpx;
	border-radius: 32rpx;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: 0 16rpx 34rpx rgba(15, 23, 42, 0.05);
}

.contact-card + .contact-card {
	margin-top: 16rpx;
}

.contact-avatar-shell {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 84rpx;
	height: 84rpx;
	flex-shrink: 0;
}

.contact-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 84rpx;
	height: 84rpx;
	border-radius: 28rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
}

.contact-message-dot {
	position: absolute;
	width: 18rpx;
	height: 18rpx;
	border: 4rpx solid #ffffff;
	border-radius: 50%;
	box-sizing: content-box;
}

.contact-message-dot {
	top: -2rpx;
	right: -4rpx;
	background: #ff5b7e;
	box-shadow: 0 10rpx 20rpx rgba(255, 91, 126, 0.28);
}

.contact-name {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.contact-badge-group {
	display: flex;
	align-items: center;
	gap: 14rpx;
	margin-left: 18rpx;
	flex-shrink: 0;
}

.contact-moment-bubble {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 42rpx;
	padding: 0 18rpx;
	border-radius: 999rpx 999rpx 999rpx 10rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 12rpx 24rpx rgba(255, 171, 191, 0.12);
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #d94f7b;
}

.contact-presence-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
}

.contact-presence-dot-online {
	background: #22c55e;
	box-shadow: 0 8rpx 18rpx rgba(34, 197, 94, 0.18);
}

.contact-presence-dot-offline {
	background: #cbd5e1;
	box-shadow: 0 8rpx 18rpx rgba(148, 163, 184, 0.16);
}
</style>
