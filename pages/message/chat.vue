<template>
	<view class="chat-page">
		<view class="chat-top-bar" :style="{ paddingTop: `${safeTopPx + 18}px` }">
			<view class="chat-back-button" @tap="handleBack">‹</view>

			<view class="chat-user-meta">
				<view class="chat-user-avatar" :style="{ background: pageMock.avatarBackground }">{{ pageMock.avatarText }}</view>
				<view class="chat-user-copy">
					<text class="chat-user-name">{{ pageMock.name }}</text>
					<text class="chat-user-status">{{ pageMock.statusText }}</text>
				</view>
			</view>

			<view class="chat-more-button" @tap="handleMoreClick">···</view>
		</view>

		<view class="chat-body">
			<view class="chat-history-button" @tap="handleHistoryLoadClick">
				{{ visibleStartIndex > 0 ? '查看更多消息' : '已经是最早消息' }}
			</view>

			<scroll-view class="chat-message-scroll" scroll-y show-scrollbar="false">
				<view class="chat-message-list">
					<view
						v-for="item in visibleMessageList"
						:key="item.id"
						:class="['chat-message-row', item.type === 'self' ? 'chat-message-row-self' : '']"
						@tap="handleMessageClick(item)"
					>
						<view v-if="item.type === 'system'" class="chat-system-chip">{{ item.text }}</view>

						<template v-else>
							<view
								v-if="item.type !== 'self'"
								class="chat-bubble-avatar"
								:style="{ background: pageMock.avatarBackground }"
							>
								{{ pageMock.avatarText }}
							</view>

							<view :class="['chat-bubble', item.type === 'self' ? 'chat-bubble-self' : 'chat-bubble-other']">
								{{ item.text }}
							</view>
						</template>
					</view>
				</view>
			</scroll-view>
		</view>

		<view class="chat-toolbar">
			<view class="chat-toolbar-actions">
				<view
					v-for="item in pageMock.actionList"
					:key="item.key"
					class="chat-toolbar-action"
					@tap="handleToolbarActionClick(item)"
				>
					{{ item.label }}
				</view>
			</view>

			<view class="chat-input-row">
				<input
					class="chat-input"
					:value="inputValue"
					placeholder="输入消息..."
					placeholder-style="color: #98a2b3;"
					confirm-type="send"
					@input="handleInputChange"
					@confirm="handleSendClick"
				/>
				<view class="chat-send-button" @tap="handleSendClick">发送</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { buildChatPageMock } from '@/components/message/messageMock.js'

const systemInfo = uni.getSystemInfoSync()
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0

const pageMock = ref(buildChatPageMock())
const inputValue = ref('')
const messageList = ref([])
const visibleStartIndex = ref(0)

const visibleMessageList = computed(() => {
	return messageList.value.slice(visibleStartIndex.value)
})

onLoad((options) => {
	const nextPageMock = buildChatPageMock(options.conversationId || '')
	pageMock.value = nextPageMock
	messageList.value = [...nextPageMock.messageList]
	visibleStartIndex.value = Math.max(0, nextPageMock.messageList.length - 6)
})

function handleBack() {
	onBack(pageMock.value.id)
	uni.navigateBack({
		delta: 1
	})
}

function handleMoreClick() {
	onMoreClick(pageMock.value.id)
	uni.showToast({
		title: '聊天设置占位',
		icon: 'none'
	})
}

function handleHistoryLoadClick() {
	if (visibleStartIndex.value <= 0) {
		uni.showToast({
			title: '没有更多历史消息',
			icon: 'none'
		})
		return
	}

	visibleStartIndex.value = Math.max(0, visibleStartIndex.value - 3)
	onHistoryLoad(pageMock.value.id)
}

function handleToolbarActionClick(item) {
	onToolbarAction(item)
	uni.showToast({
		title: `${item.label}入口占位`,
		icon: 'none'
	})
}

function handleInputChange(event) {
	inputValue.value = event.detail.value
}

function handleSendClick() {
	const content = `${inputValue.value || ''}`.trim()
	if (!content) {
		uni.showToast({
			title: '请输入内容',
			icon: 'none'
		})
		return
	}

	const nextMessage = {
		id: `self-${Date.now()}`,
		type: 'self',
		text: content
	}

	messageList.value = [...messageList.value, nextMessage]
	visibleStartIndex.value = Math.max(0, messageList.value.length - 8)
	onSendMessage({
		conversationId: pageMock.value.id,
		content
	})
	inputValue.value = ''
}

function handleMessageClick(message) {
	onMessageClick(message)
}

function onBack(conversationId) {
	// TODO：替换私聊返回前埋点或草稿保存逻辑
	console.log('message-chat-back', conversationId)
}

function onMoreClick(conversationId) {
	// TODO：替换私聊更多操作面板逻辑
	console.log('message-chat-more', conversationId)
}

function onHistoryLoad(conversationId) {
	// TODO：替换私聊历史消息加载接口
	console.log('message-chat-history-load', conversationId)
}

function onToolbarAction(item) {
	// TODO：替换私聊工具栏动作逻辑
	console.log('message-chat-toolbar-action', item.key)
}

function onSendMessage(payload) {
	// TODO：替换私聊发送消息接口
	console.log('message-chat-send', payload.conversationId, payload.content)
}

function onMessageClick(message) {
	// TODO：替换私聊消息点击事件
	console.log('message-chat-message-click', message.id)
}
</script>

<style scoped>
.chat-page {
	min-height: 100vh;
	background:
		radial-gradient(circle at top right, rgba(255, 201, 213, 0.4) 0%, rgba(255, 201, 213, 0) 32%),
		linear-gradient(180deg, #fff7fa 0%, #f8fafc 48%, #f8fafc 100%);
}

.chat-top-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-right: 28rpx;
	padding-left: 28rpx;
}

.chat-back-button,
.chat-more-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.82);
	box-shadow: 0 12rpx 26rpx rgba(255, 171, 191, 0.1);
	font-size: 34rpx;
	color: #0f172a;
	flex-shrink: 0;
}

.chat-user-meta {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	padding: 0 20rpx;
}

.chat-user-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 80rpx;
	height: 80rpx;
	border-radius: 28rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
	box-shadow: 0 16rpx 34rpx rgba(255, 171, 191, 0.18);
}

.chat-user-copy {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.chat-user-name {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 40rpx;
	color: #0f172a;
}

.chat-user-status {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.chat-body {
	padding: 28rpx 24rpx 0;
	box-sizing: border-box;
}

.chat-history-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 22rpx;
	margin: 0 auto 20rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.84);
	color: #98a2b3;
	font-size: 22rpx;
}

.chat-message-scroll {
	height: calc(100vh - 360rpx);
}

.chat-message-list {
	display: flex;
	flex-direction: column;
	padding-bottom: 40rpx;
}

.chat-message-row {
	display: flex;
	align-items: flex-end;
	margin-bottom: 18rpx;
}

.chat-message-row-self {
	justify-content: flex-end;
}

.chat-system-chip {
	margin: 0 auto;
	padding: 10rpx 20rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.76);
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.chat-bubble-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64rpx;
	height: 64rpx;
	margin-right: 16rpx;
	border-radius: 22rpx;
	font-size: 24rpx;
	font-weight: 700;
	color: #ffffff;
	flex-shrink: 0;
}

.chat-bubble {
	max-width: 76%;
	padding: 20rpx 24rpx;
	border-radius: 28rpx;
	font-size: 26rpx;
	line-height: 38rpx;
	word-break: break-word;
	box-sizing: border-box;
}

.chat-bubble-other {
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 14rpx 28rpx rgba(15, 23, 42, 0.06);
	color: #0f172a;
}

.chat-bubble-self {
	background: linear-gradient(135deg, #ff9eb3 0%, #ffc7a8 100%);
	box-shadow: 0 16rpx 30rpx rgba(255, 171, 191, 0.18);
	color: #ffffff;
}

.chat-toolbar {
	position: fixed;
	right: 0;
	bottom: 0;
	left: 0;
	padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
	background: rgba(248, 250, 252, 0.96);
	backdrop-filter: blur(20rpx);
	-webkit-backdrop-filter: blur(20rpx);
	box-shadow: 0 -14rpx 32rpx rgba(15, 23, 42, 0.05);
}

.chat-toolbar-actions {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.chat-toolbar-action {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 50rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.92);
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.chat-input-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.chat-input {
	flex: 1;
	height: 84rpx;
	padding: 0 28rpx;
	border-radius: 999rpx;
	background: #ffffff;
	font-size: 26rpx;
	color: #0f172a;
}

.chat-send-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 120rpx;
	height: 84rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff97ae 0%, #ffc4a0 100%);
	font-size: 26rpx;
	font-weight: 600;
	color: #ffffff;
	box-shadow: 0 16rpx 30rpx rgba(255, 171, 191, 0.18);
}
</style>
