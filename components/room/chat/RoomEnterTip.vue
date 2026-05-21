<template>
	<view v-if="currentMessage" class="room-enter-tip-host">
		<view :class="['room-enter-tip', `room-enter-tip-${animationStage}`]">
			<text class="room-enter-tip-text">{{ currentMessage.userName }} 进入直播间</text>
		</view>
	</view>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

const ENTER_DURATION = 300
const STAY_DURATION = 800
const LEAVE_DURATION = 300
const ENTER_DELAY = 20
const MAX_QUEUE_LENGTH = 10

const messageQueue = ref([])
const currentMessage = ref(null)
const animationStage = ref('prepare')
const isPlaying = ref(false)

let timerIds = []
let enterMessageId = 0

// 向进场消息队列追加一条用户进入提示，并尝试播放。
function addEnterMessage(userName) {
	const normalizedUserName = `${userName || ''}`.trim() || '新朋友'
	const nextMessage = {
		id: createMessageId(),
		userName: normalizedUserName
	}

	if (messageQueue.value.length >= MAX_QUEUE_LENGTH) {
		messageQueue.value.shift()
	}

	messageQueue.value.push(nextMessage)
	playNextMessage()
}

// 顺序播放队列中的下一条进场提示，避免多条消息同时挤在一起。
function playNextMessage() {
	if (isPlaying.value || !messageQueue.value.length) {
		return
	}

	const nextMessage = messageQueue.value.shift()
	if (!nextMessage) {
		return
	}

	isPlaying.value = true
	currentMessage.value = nextMessage
	animationStage.value = 'prepare'

	pushTimer(() => {
		animationStage.value = 'enter'
	}, ENTER_DELAY)

	pushTimer(() => {
		animationStage.value = 'stay'
	}, ENTER_DELAY + ENTER_DURATION)

	pushTimer(() => {
		animationStage.value = 'leave'
	}, ENTER_DELAY + ENTER_DURATION + STAY_DURATION)

	pushTimer(() => {
		currentMessage.value = null
		animationStage.value = 'prepare'
		isPlaying.value = false
		timerIds = []
		playNextMessage()
	}, ENTER_DELAY + ENTER_DURATION + STAY_DURATION + LEAVE_DURATION)
}

// 统一注册一个定时器，便于组件销毁时集中清理。
function pushTimer(callback, delay) {
	const timerId = setTimeout(callback, delay)
	timerIds.push(timerId)
}

// 清理所有进场消息动画定时器。
function clearTimers() {
	timerIds.forEach((timerId) => clearTimeout(timerId))
	timerIds = []
}

// 生成进场消息唯一 ID，避免队列渲染 key 冲突。
function createMessageId() {
	enterMessageId += 1
	return `room-enter-tip-${Date.now()}-${enterMessageId}`
}

onBeforeUnmount(() => {
	clearTimers()
})

// 暴露给直播间父组件，用来追加新的进场提示。
defineExpose({
	addEnterMessage
})
</script>

<style scoped>
.room-enter-tip-host {
	height: 48rpx;
	overflow: hidden;
}

.room-enter-tip {
	display: inline-flex;
	align-items: center;
	max-width: 500rpx;
	height: 48rpx;
	padding: 0 24rpx;
	border-radius: 24rpx;
	background: rgba(0, 0, 0, 0.6);
	box-sizing: border-box;
	opacity: 0;
	transform: translate3d(110%, 0, 0);
	transition: transform 300ms ease, opacity 300ms ease;
}

.room-enter-tip-prepare {
	opacity: 0;
	transform: translate3d(110%, 0, 0);
}

.room-enter-tip-enter,
.room-enter-tip-stay {
	opacity: 1;
	transform: translate3d(0, 0, 0);
}

.room-enter-tip-leave {
	opacity: 0;
	transform: translate3d(-110%, 0, 0);
}

.room-enter-tip-text {
	max-width: 452rpx;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #ffffff;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
