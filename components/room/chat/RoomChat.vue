<template>
	<view class="room-chat">
		<scroll-view
			class="room-chat-scroll"
			scroll-y
			show-scrollbar="false"
			:scroll-top="scrollTop"
			:scroll-with-animation="true"
		>
			<view class="room-chat-list">
				<template v-if="displayedMessages.length">
					<view
						v-for="message in displayedMessages"
						:key="message.renderKey"
						class="room-chat-row"
						@tap="handleMessageClick(message)"
					>
						<RoomChatItem :message="message" />
					</view>
				</template>

				<view v-else class="room-chat-empty">
					<text class="room-chat-empty-text">快来聊两句，公屏消息会显示在这里</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import RoomChatItem from '@/components/room/chat/RoomChatItem.vue'

const CHAT_CACHE_LIMIT = 100
const TEMP_MESSAGE_DURATION = 1600
const TEMP_MESSAGE_FADE_DURATION = 220
const SCROLL_DEBOUNCE_DURATION = 48
const ROOM_CHAT_AVATAR_BACKGROUNDS = [
	'linear-gradient(135deg, rgba(251, 191, 36, 0.94) 0%, rgba(249, 115, 22, 0.94) 100%)',
	'linear-gradient(135deg, rgba(96, 165, 250, 0.94) 0%, rgba(59, 130, 246, 0.94) 100%)',
	'linear-gradient(135deg, rgba(244, 114, 182, 0.94) 0%, rgba(168, 85, 247, 0.94) 100%)',
	'linear-gradient(135deg, rgba(52, 211, 153, 0.94) 0%, rgba(20, 184, 166, 0.94) 100%)'
]

const props = defineProps({
	messages: {
		type: Array,
		default: () => []
	},
	tempMessage: {
		type: Object,
		default: null
	}
})

const emit = defineEmits(['item-click'])

const tempDisplayMessage = ref(null)
const scrollTop = ref(0)

let messageId = 0
let lastTempMessageId = ''
let scrollTimer = null
let tempHoldTimer = null
let tempFadeTimer = null

// 历史消息统一做标准化后再进入渲染层。
const normalizedHistoryMessages = computed(() => {
	return props.messages.slice(-CHAT_CACHE_LIMIT).map((message) => normalizeMessage(message))
})

// 如果当前有临时系统消息，则把它拼接到历史消息后面一并渲染。
const displayedMessages = computed(() => {
	if (!tempDisplayMessage.value) {
		return normalizedHistoryMessages.value
	}

	return [...normalizedHistoryMessages.value, tempDisplayMessage.value]
})

// 历史消息更新时，自动滚到底部。
watch(
	() => props.messages,
	() => {
		scheduleScrollToBottom()
	},
	{
		deep: true,
		immediate: true
	}
)

// 临时消息更新时，触发替换动画并滚到底部。
watch(
	() => props.tempMessage,
	(message) => {
		if (!message) {
			return
		}

		const normalizedMessage = normalizeMessage(message)
		if (normalizedMessage.id === lastTempMessageId) {
			return
		}

		lastTempMessageId = normalizedMessage.id
		replaceTempMessage(normalizedMessage)
		scheduleScrollToBottom()
	},
	{
		deep: true,
		immediate: true
	}
)

// 用于接管临时消息的进入、停留和消失动画。
function replaceTempMessage(messageObject) {
	clearTempTimers()

	tempDisplayMessage.value = {
		...messageObject,
		tempVisible: false,
		renderKey: `${messageObject.id}-prepare`
	}

	nextTick(() => {
		if (!tempDisplayMessage.value) {
			return
		}

		tempDisplayMessage.value = {
			...tempDisplayMessage.value,
			tempVisible: true,
			renderKey: `${messageObject.id}-active`
		}
	})

	tempHoldTimer = setTimeout(() => {
		if (!tempDisplayMessage.value) {
			return
		}

		tempDisplayMessage.value = {
			...tempDisplayMessage.value,
			tempVisible: false,
			renderKey: `${messageObject.id}-leave`
		}

		tempFadeTimer = setTimeout(() => {
			tempDisplayMessage.value = null
		}, TEMP_MESSAGE_FADE_DURATION)
	}, TEMP_MESSAGE_DURATION)
}

// 统一把文本、礼物、图片三类消息规整成模板可直接消费的结构。
function normalizeMessage(messageObject = {}) {
	const messageType = ['gift', 'image'].includes(messageObject.msgType) ? messageObject.msgType : 'text'
	const normalizedBase = {
		id: messageObject.id || createMessageId(),
		userId: `${messageObject.userId || ''}`.trim(),
		nickname: `${messageObject.nickname || ''}`.trim() || '用户',
		avatar: resolveAvatarBackground(messageObject),
		vipLevel: normalizeVipLevel(messageObject.vipLevel),
		msgType: messageType,
		isTemp: Boolean(messageObject.isTemp),
		isSystemMessage: Boolean(messageObject.isSystemMessage)
	}

	if (messageType === 'gift') {
		return {
			...normalizedBase,
			renderKey: normalizedBase.id,
			content: {
				giftName: `${messageObject.content?.giftName || '礼物'}`.trim() || '礼物',
				giftNum: normalizeGiftCount(messageObject.content?.giftNum),
				giftIcon: messageObject.content?.giftIcon || ''
			}
		}
	}

	if (messageType === 'image') {
		return {
			...normalizedBase,
			renderKey: normalizedBase.id,
			content: {
				imgUrl: messageObject.content?.imgUrl || '',
				imgText: `${messageObject.content?.imgText || '图片消息'}`.trim() || '图片消息'
			}
		}
	}

	return {
		...normalizedBase,
		renderKey: normalizedBase.id,
		content: {
			text: `${messageObject.content?.text || ''}`.trim() || '发送了一条消息'
		}
	}
}

// 通过递增 scrollTop 的方式把聊天列表滚到最底部。
function scheduleScrollToBottom() {
	clearScrollTimer()
	scrollTimer = setTimeout(() => {
		scrollTop.value += 1200
	}, SCROLL_DEBOUNCE_DURATION)
}

// 聊天项点击后，把消息对象透传给父组件。
function handleMessageClick(message) {
	emit('item-click', {
		...message
	})
}

// 清理滚动防抖定时器。
function clearScrollTimer() {
	if (scrollTimer) {
		clearTimeout(scrollTimer)
		scrollTimer = null
	}
}

// 清理临时消息相关的停留和淡出定时器。
function clearTempTimers() {
	if (tempHoldTimer) {
		clearTimeout(tempHoldTimer)
		tempHoldTimer = null
	}

	if (tempFadeTimer) {
		clearTimeout(tempFadeTimer)
		tempFadeTimer = null
	}
}

// 生成聊天消息唯一 ID。
function createMessageId() {
	messageId += 1
	return `room-chat-${Date.now()}-${messageId}`
}

// 对 VIP 等级做安全兜底。
function normalizeVipLevel(value) {
	const level = Number(value) || 0
	return level > 0 ? Math.min(level, 10) : 0
}

// 对礼物数量做安全兜底。
function normalizeGiftCount(value) {
	const count = Number(value) || 1
	return count > 0 ? count : 1
}

// 消息头像为空时，根据用户种子生成一个稳定的渐变头像。
function resolveAvatarBackground(messageObject = {}) {
	const avatarValue = `${messageObject.avatar || messageObject.avatarBackground || ''}`.trim()
	if (avatarValue) {
		return avatarValue
	}

	const seed = `${messageObject.userId || messageObject.nickname || 'room-user'}`
	let hash = 0
	for (const char of seed) {
		hash += char.charCodeAt(0)
	}

	return ROOM_CHAT_AVATAR_BACKGROUNDS[hash % ROOM_CHAT_AVATAR_BACKGROUNDS.length]
}

onBeforeUnmount(() => {
	clearTempTimers()
	clearScrollTimer()
})
</script>

<style scoped>
.room-chat {
	width: 100%;
	height: 420rpx;
	border-radius: 28rpx;
	background: linear-gradient(180deg, rgba(10, 10, 16, 0.1) 0%, rgba(10, 10, 16, 0.18) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(18rpx);
	-webkit-backdrop-filter: blur(18rpx);
	overflow: hidden;
}

.room-chat-scroll {
	height: 420rpx;
}

.room-chat-list {
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	min-height: 420rpx;
	padding: 0 0 8rpx;
	box-sizing: border-box;
}

.room-chat-row + .room-chat-row {
	margin-top: 8rpx;
}

.room-chat-empty {
	display: flex;
	align-items: flex-end;
	height: 100%;
	padding: 0 8rpx 10rpx 8rpx;
	box-sizing: border-box;
}

.room-chat-empty-text {
	font-size: 24rpx;
	line-height: 32rpx;
	color: rgba(255, 255, 255, 0.54);
}
</style>
