<template>
	<view class="chat-page">
		<view class="chat-top-bar" :style="{ paddingTop: `${safeTopPx + 18}px` }">
			<view class="chat-back-button" @tap="handleBack">‹</view>

			<view class="chat-user-meta">
				<view class="chat-user-avatar" :style="{ background: chatInfo.avatarBackground }">{{ chatInfo.avatarText }}</view>
				<view class="chat-user-copy">
					<text class="chat-user-name">{{ chatInfo.name }}</text>
					<text class="chat-user-status">{{ chatInfo.statusText }}</text>
				</view>
			</view>

			<view class="chat-more-button" @tap="handleMoreClick">···</view>
		</view>

		<view class="chat-body" :style="chatBodyStyle">
			<view class="chat-history-button" @tap="handleHistoryLoadClick">
				{{ hasMoreHistory ? '查看更多消息' : '已经是最早消息' }}
			</view>

			<scroll-view class="chat-message-scroll" scroll-y show-scrollbar="false" :scroll-top="scrollTop" :scroll-with-animation="true">
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
								:style="{ background: chatInfo.avatarBackground }"
							>
								{{ chatInfo.avatarText }}
							</view>

							<view :class="['chat-bubble', item.type === 'self' ? 'chat-bubble-self' : 'chat-bubble-other']">
								{{ item.text }}
							</view>
						</template>
					</view>
				</view>
			</scroll-view>
		</view>

		<SafeBottomArea
			:gap-rpx="30"
			:top-padding-rpx="16"
			:side-padding-rpx="24"
			:inner-min-height-rpx="150"
			background="url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat, rgba(248, 250, 252, 0.96)"
			box-shadow="0 -14rpx 32rpx rgba(15, 23, 42, 0.05)"
		>
			<view class="chat-toolbar">
				<view class="chat-toolbar-actions">
					<view
						v-for="item in actionList"
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
		</SafeBottomArea>
	</view>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { onLoad, onShow, onHide } from '@dcloudio/uni-app'
import SafeBottomArea from '@/components/common/SafeBottomArea.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { useIm } from '@/composables/useIm.js'
import { getMessageDirection } from '@/core/im/models/MessageEntity.js'

const im = useIm()

const CHAT_COMPOSER_LAYOUT = {
	topPaddingRpx: 16,
	innerMinHeightRpx: 150,
	gapRpx: 30
}

const { safeTopPx, footerReservePx } = useSafeAreaMetrics()
const chatBodyStyle = computed(() => ({
	paddingBottom: `${footerReservePx(CHAT_COMPOSER_LAYOUT)}px`
}))

// ===== 页面状态 =====

const chatInfo = ref({
	conversationId: '',
	chatType: 1,
	targetId: '',
	name: '聊天',
	statusText: '',
	avatarText: '?',
	avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
})

const actionList = ref([
	{ key: 'album', label: '相册' },
	{ key: 'voice', label: '语音' },
	{ key: 'more', label: '更多' },
])

const inputValue = ref('')
const messageList = ref([])
const scrollTop = ref(0)
const hasMoreHistory = ref(true)
const historyCursor = ref(null)

const currentUserId = computed(() => im.getCurrentUserId())

const visibleMessageList = computed(() => {
	return messageList.value.map((msg) => ({
		id: msg.msgId || msg.id || `msg-${Date.now()}-${Math.random()}`,
		type: msg.type || getMessageDirection(msg, currentUserId.value),
		text: msg.content || msg.text || '',
	}))
})

// ===== 消息方向辅助 =====

function scrollToBottom() {
	nextTick(() => {
		scrollTop.value = scrollTop.value + 1
	})
}

// ===== 生命周期 =====

onLoad((options) => {
	chatInfo.value = {
		conversationId: options.conversationId || '',
		chatType: Number(options.chatType) || 1,
		targetId: options.targetId || '',
		name: decodeURIComponent(options.name || '聊天'),
		statusText: '',
		avatarText: (decodeURIComponent(options.name || '聊天')).charAt(0),
		avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
	}

	console.log('[chat.vue] onLoad: convId=', chatInfo.value.conversationId, ', targetId=', chatInfo.value.targetId)
	loadMessages()
})

onShow(() => {
	// 进入聊天页面 → 立即标记已读（本地 storage 同步清零）
	if (chatInfo.value.conversationId) {
		im.markConversationRead(chatInfo.value.conversationId, chatInfo.value.chatType).catch(() => {})
	}

	// 绑定 listener：收到属于当前会话的消息时追加到列表
	const listener = {
		register() { console.log('[chat.vue] listener register') },
		leave() { console.log('[chat.vue] listener leave') },
		onMessage(body) {
			const convId = body.chatType === 1
				? `private_${body.sender === currentUserId.value ? body.receiver : body.sender}`
				: `group_${body.receiver}`

			if (convId === chatInfo.value.conversationId) {
				console.log('[chat.vue] 收到当前会话消息: sender=', body.sender)
				messageList.value = [...messageList.value, body]
				scrollToBottom()
			}
		},
	}
	im.bindListener(listener)
})

onHide(() => {
	// 解绑 listener
	im.unbindListener({
		leave() { console.log('[chat.vue] listener unbind') },
	})

	// 标记已读
	if (chatInfo.value.conversationId) {
		im.markConversationRead(chatInfo.value.conversationId, chatInfo.value.chatType).catch(() => {})
	}
})

watch(
	() => im.isReady.value,
	(value) => {
		if (!value || !chatInfo.value.conversationId) {
			return
		}

		loadMessages()
		im.markConversationRead(chatInfo.value.conversationId, chatInfo.value.chatType).catch(() => {})
	},
	{
		flush: 'post'
	}
)

// ===== 消息加载 =====

async function loadMessages() {
	try {
		const result = await im.getMessages(
			chatInfo.value.conversationId,
			chatInfo.value.chatType,
			15,
			null
		)
		const list = (result.list || []).reverse()
		messageList.value = list
		hasMoreHistory.value = result.hasMore !== false
		historyCursor.value = result.cursor || null
		scrollToBottom()
		console.log('[chat.vue] 加载消息: count=', list.length, ', hasMore=', hasMoreHistory.value)
	} catch (e) {
		console.error('[chat.vue] 加载消息失败:', e)
	}
}

async function loadMoreHistory() {
	if (!hasMoreHistory.value) return

	try {
		const result = await im.getMessages(
			chatInfo.value.conversationId,
			chatInfo.value.chatType,
			15,
			historyCursor.value
		)
		const olderMessages = (result.list || []).reverse()
		if (olderMessages.length > 0) {
			messageList.value = [...olderMessages, ...messageList.value]
		}
		hasMoreHistory.value = result.hasMore !== false
		historyCursor.value = result.cursor || null
		console.log('[chat.vue] 加载更多消息: count=', olderMessages.length, ', hasMore=', hasMoreHistory.value)
	} catch (e) {
		console.error('[chat.vue] 加载更多消息失败:', e)
	}
}

// ===== 事件处理 =====

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleMoreClick() {
	uni.showToast({
		title: '聊天设置占位',
		icon: 'none'
	})
}

function handleHistoryLoadClick() {
	if (!hasMoreHistory.value) {
		uni.showToast({
			title: '没有更多历史消息',
			icon: 'none'
		})
		return
	}

	loadMoreHistory()
}

function handleToolbarActionClick(item) {
	uni.showToast({
		title: `${item.label}入口占位`,
		icon: 'none'
	})
}

function handleInputChange(event) {
	inputValue.value = event.detail.value
}

async function handleSendClick() {
	const content = `${inputValue.value || ''}`.trim()
	if (!content) {
		uni.showToast({
			title: '请输入内容',
			icon: 'none'
		})
		return
	}

	inputValue.value = ''

	try {
		// 确定接收者：如果是私聊，接收者就是 targetId
		const receiver = chatInfo.value.targetId
		if (!receiver) {
			console.error('[chat.vue] 发送失败: 缺少 targetId')
			return
		}

		await im.sendMessage({
			messageType: 'text',
			content,
			receiver,
			chatType: chatInfo.value.chatType,
		})

		scrollToBottom()
		console.log('[chat.vue] 消息发送成功')
	} catch (e) {
		console.error('[chat.vue] 消息发送失败:', e)
		uni.showToast({
			title: '发送失败',
			icon: 'none'
		})
	}
}

function handleMessageClick(message) {
	console.log('message-chat-message-click', message.id)
}
</script>

<style scoped>
.chat-page {
	height: 100vh;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
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
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
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
	flex: 1;
	min-height: 0;
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
	width: 100%;
	box-sizing: border-box;
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
