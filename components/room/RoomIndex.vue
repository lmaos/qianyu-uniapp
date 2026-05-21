<template>
	<view class="room-index">
		<view class="room-background">
			<view class="room-background-glow"></view>
			<view class="room-background-mask"></view>
			<view class="room-background-info">
				<!-- <text class="room-background-tag">直播内容区占位</text> -->
				<!-- <text class="room-background-title">{{ localRoomData.roomName }}</text> -->
			</view>
		</view>

		<view v-if="inputFocused" class="dismiss-layer" @tap="handleInputBlur"></view>

		<view class="top-float-area" :style="topFloatStyle">
			<view class="top-row top-row-first">
				<view class="top-left-group">

					<!--  主播头像 -->
					<view class="anchor-avatar" :style="{ background: localRoomData.anchorAvatarBackground }"></view>
					<view class="anchor-info">						
						<text class="room-name">{{ localRoomData.roomName }}</text>
						<text class="room-like-count">本场点赞: {{ localRoomData.roomLikeCount }}</text>
					</view>
					<view class="follow-button" @tap="emit('follow', localRoomData)">
						{{ localRoomData.followText }}
					</view>
				</view>

				<view class="top-right-group" @tap="handleOpenOnlinePanel">
					<view class="user-avatar-stack">
						<view
							v-for="(item, index) in topUsers.slice(0, 3)"
							:key="item.userId"
							class="stack-avatar"
							:style="getStackAvatarStyle(item, index)"
						></view>
					</view>
					<view class="online-count">{{ localRoomData.onlineText }}</view>
					
				</view>
				<view class="back-button" @tap="emit('back')">
					<text class="back-button-text">×</text>
				</view>
			</view>

			<view class="top-row">
				<view class="rank-entry" @tap="emit('rank', rankEntry)">
					<text class="rank-entry-label">{{ rankEntry.label }}</text>
					<text class="rank-entry-value">{{ rankEntry.value }}</text>
				</view>
			</view>

			<view class="top-row top-row-third">
				<view class="lucky-bag-entry" @tap="emit('lucky-bag', luckyBag)">
					<view class="lucky-bag-icon">
						<view class="lucky-bag-icon-handle"></view>
					</view>
					<text class="lucky-bag-title">{{ luckyBag.label }}</text>
					<text class="lucky-bag-desc">{{ luckyBag.desc }}</text>
				</view>

				<view class="activity-banner" @tap="emit('activity-banner', activityBanner)">
					<view class="activity-banner-left">
						<text class="activity-banner-value">{{ activityBanner.value }}</text>
						<text class="activity-banner-subtitle">{{ activityBanner.subtitle }}</text>
					</view>
					<view class="activity-banner-right">
						<text class="activity-banner-image-text">{{ activityBanner.imageText }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="room-chat-stack" :style="roomChatStackStyle">
			<RoomEnterTip ref="enterTipRef" />
			<RoomChat
				class="room-chat-panel"
				:messages="roomChatMessages"
				:temp-message="roomTempMessage"
				@item-click="handleChatMessageClick"
			/>
		</view>

		<view class="bottom-float-bar" :style="bottomFloatStyle">
			<view class="chat-input-wrap" @tap="handleInputFocus">
				<input
					class="chat-input"
					type="text"
					:value="inputValue"
					:focus="inputFocused"
					confirm-type="send"
					cursor-spacing="24"
					placeholder="说点什么..."
					placeholder-style="color: rgba(255, 255, 255, 0.42);"
					@focus="handleInputFocus"
					@input="handleInputChange"
					@confirm="handleInputConfirm"
					@blur="handleInputBlur"
				/>
			</view>

			<view class="action-button" @tap="handleHeartTap">
				<text class="action-button-text">心</text>
			</view>
			<view class="action-button" @tap="handleToggleGiftPanel">
				<text class="action-button-text">礼</text>
			</view>
			<view class="action-button" @tap="emit('share')">
				<text class="action-button-text">享</text>
			</view>
		</view>

		<GiftPanel
			ref="giftPanelRef"
			:model-value="giftPanelVisible"
			:gift-groups="giftGroupMap"
			:coin-balance="roomGiftCoinBalance"
			:loading="giftPanelLoading"
			:combo-duration="1"
			:z-index="giftPanelZIndex"
			@panel-show="handleGiftPanelShow"
			@panel-hide="handleGiftPanelHide"
			@send-gift="handleGiftDispatch"
			@send-success="handleGiftSuccess"
			@send-fail="handleGiftFail"
			@panel-close="handleGiftClose"
		/>

		<OnlinePanel
			:model-value="onlinePanelVisible"
			:room-id="localRoomData.roomId"
			:anchor-id="localRoomData.anchorId"
			:user-id="props.senderId"
			:contribution-list="contributionList"
			:online-list="onlineList"
			:my-rank="onlineMyRank"
			:loading="onlinePanelLoading"
			:z-index="onlinePanelZIndex"
			@user-click="handleOnlineUserClick"
			@panel-show="handleOnlinePanelShow"
			@panel-hide="handleOnlinePanelHide"
			@panel-close="handleOnlinePanelClose"
		/>

		<UserInfoCard
			ref="userInfoCardRef"
			:z-index="userInfoCardZIndex"
			@card-show="handleUserCardShow"
			@card-hide="handleUserCardHide"
			@follow-click="handleUserCardFollow"
			@detail-open="handleUserDetailOpen"
		/>
	</view>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import GiftPanel from '@/components/room/gift/GiftPanel.vue'
import RoomEnterTip from '@/components/room/chat/RoomEnterTip.vue'
import RoomChat from '@/components/room/chat/RoomChat.vue'
import OnlinePanel from '@/components/room/online/OnlinePanel.vue'
import UserInfoCard from '@/components/user/UserInfoCard.vue'

const roomSystemInfo = uni.getSystemInfoSync()
const ROOM_MOCK_ENTER_INTERVAL = 3400
const ROOM_MOCK_CHAT_INTERVAL = 4200
const ROOM_TICK_INTERVAL = 5000
const ROOM_OVERLAY_Z_INDEX_BASE = 60
const ROOM_CHAT_CACHE_LIMIT = 100
const ROOM_USER_AVATAR_BACKGROUNDS = [
	'linear-gradient(135deg, rgba(251, 191, 36, 0.94) 0%, rgba(249, 115, 22, 0.94) 100%)',
	'linear-gradient(135deg, rgba(96, 165, 250, 0.94) 0%, rgba(59, 130, 246, 0.94) 100%)',
	'linear-gradient(135deg, rgba(244, 114, 182, 0.94) 0%, rgba(168, 85, 247, 0.94) 100%)',
	'linear-gradient(135deg, rgba(52, 211, 153, 0.94) 0%, rgba(20, 184, 166, 0.94) 100%)'
]

const ROOM_GIFT_COLLECTIONS = {
	recommend: [
		['gift-heart', '小心心', 'linear-gradient(135deg, rgba(254, 44, 85, 0.96) 0%, rgba(255, 122, 69, 0.92) 100%)', 1, '轻量互动礼物，适合持续送出'],
		['gift-rose', '玫瑰', 'linear-gradient(135deg, rgba(244, 63, 94, 0.92) 0%, rgba(251, 113, 133, 0.92) 100%)', 9, '热门基础礼物占位'],
		['gift-firework', '烟花', 'linear-gradient(135deg, rgba(99, 102, 241, 0.92) 0%, rgba(168, 85, 247, 0.92) 100%)', 66, '直播间氛围礼物占位'],
		['gift-car', '跑车', 'linear-gradient(135deg, rgba(14, 165, 233, 0.92) 0%, rgba(34, 197, 94, 0.92) 100%)', 120, '中阶互动礼物占位'],
		['gift-yacht', '游艇', 'linear-gradient(135deg, rgba(56, 189, 248, 0.94) 0%, rgba(37, 99, 235, 0.94) 100%)', 888, '豪华出场礼物占位'],
		['gift-plane', '飞机', 'linear-gradient(135deg, rgba(45, 212, 191, 0.94) 0%, rgba(14, 165, 233, 0.94) 100%)', 666, '快速刷屏礼物占位'],
		['gift-balloon', '热气球', 'linear-gradient(135deg, rgba(251, 146, 60, 0.94) 0%, rgba(236, 72, 153, 0.92) 100%)', 399, '轻奢礼物占位'],
		['gift-wish-bottle', '星愿瓶', 'linear-gradient(135deg, rgba(96, 165, 250, 0.94) 0%, rgba(129, 140, 248, 0.92) 100%)', 520, '心愿互动礼物占位'],
		['gift-light-stick', '闪耀棒', 'linear-gradient(135deg, rgba(250, 204, 21, 0.94) 0%, rgba(249, 115, 22, 0.92) 100%)', 188, '直播助力礼物占位'],
		['gift-energy-card', '能量卡', 'linear-gradient(135deg, rgba(52, 211, 153, 0.94) 0%, rgba(16, 185, 129, 0.92) 100%)', 88, '轻交互礼物占位']
	],
	exclusive: [
		['gift-guardian-crown', '守护冠', 'linear-gradient(135deg, rgba(250, 204, 21, 0.96) 0%, rgba(234, 179, 8, 0.96) 100%)', 5200, '高阶礼物失败场景占位'],
		['gift-exclusive-cheer', '专属应援', 'linear-gradient(135deg, rgba(251, 191, 36, 0.96) 0%, rgba(249, 115, 22, 0.96) 100%)', 1999, '主播专属应援礼物占位'],
		['gift-throne', '荣耀王座', 'linear-gradient(135deg, rgba(129, 140, 248, 0.96) 0%, rgba(59, 130, 246, 0.96) 100%)', 2888, '高光进场礼物占位'],
		['gift-exclusive-car', '专属跑车', 'linear-gradient(135deg, rgba(56, 189, 248, 0.96) 0%, rgba(14, 165, 233, 0.94) 100%)', 1314, '粉丝团专属礼物占位'],
		['gift-glory-star', '荣耀之星', 'linear-gradient(135deg, rgba(244, 114, 182, 0.96) 0%, rgba(219, 39, 119, 0.94) 100%)', 888, '专属视觉礼物占位'],
		['gift-moon-ticket', '月光船票', 'linear-gradient(135deg, rgba(196, 181, 253, 0.96) 0%, rgba(129, 140, 248, 0.94) 100%)', 666, '守护陪伴礼物占位'],
		['gift-cape', '守护披风', 'linear-gradient(135deg, rgba(251, 113, 133, 0.96) 0%, rgba(254, 44, 85, 0.94) 100%)', 1200, '身份感礼物占位'],
		['gift-badge-box', '徽章盒', 'linear-gradient(135deg, rgba(45, 212, 191, 0.94) 0%, rgba(20, 184, 166, 0.92) 100%)', 520, '专属收藏礼物占位'],
		['gift-guardian-firework', '守护烟花', 'linear-gradient(135deg, rgba(96, 165, 250, 0.96) 0%, rgba(59, 130, 246, 0.94) 100%)', 1888, '守护庆典礼物占位'],
		['gift-streamer-mark', '流光徽记', 'linear-gradient(135deg, rgba(250, 204, 21, 0.94) 0%, rgba(245, 158, 11, 0.94) 100%)', 999, '高亮身份礼物占位']
	],
	activity: [
		['gift-stage', '应援台', 'linear-gradient(135deg, rgba(250, 204, 21, 0.92) 0%, rgba(249, 115, 22, 0.92) 100%)', 188, '直播间活动礼物占位'],
		['gift-carnival', '嘉年华', 'linear-gradient(135deg, rgba(251, 191, 36, 0.96) 0%, rgba(249, 115, 22, 0.96) 100%)', 1999, '直播间大场景礼物占位'],
		['gift-galaxy', '星海', 'linear-gradient(135deg, rgba(129, 140, 248, 0.96) 0%, rgba(59, 130, 246, 0.96) 100%)', 2888, '梦幻视觉礼物占位'],
		['gift-rank-light', '冲榜灯牌', 'linear-gradient(135deg, rgba(250, 204, 21, 0.94) 0%, rgba(251, 146, 60, 0.92) 100%)', 520, '活动冲榜礼物占位'],
		['gift-lucky-rain', '福袋雨', 'linear-gradient(135deg, rgba(34, 197, 94, 0.94) 0%, rgba(16, 185, 129, 0.92) 100%)', 333, '活动掉落礼物占位'],
		['gift-ribbon', '庆典彩带', 'linear-gradient(135deg, rgba(236, 72, 153, 0.94) 0%, rgba(168, 85, 247, 0.92) 100%)', 288, '庆典氛围礼物占位'],
		['gift-torch', '热榜火炬', 'linear-gradient(135deg, rgba(249, 115, 22, 0.96) 0%, rgba(239, 68, 68, 0.94) 100%)', 666, '冲榜助推礼物占位'],
		['gift-ticket', '派对门票', 'linear-gradient(135deg, rgba(96, 165, 250, 0.94) 0%, rgba(37, 99, 235, 0.92) 100%)', 168, '活动入场礼物占位'],
		['gift-dice', '幸运骰子', 'linear-gradient(135deg, rgba(192, 132, 252, 0.94) 0%, rgba(129, 140, 248, 0.92) 100%)', 88, '轻活动礼物占位'],
		['gift-trophy', '冠军奖杯', 'linear-gradient(135deg, rgba(250, 204, 21, 0.96) 0%, rgba(202, 138, 4, 0.94) 100%)', 1314, '榜单奖励礼物占位']
	],
	gameplay: [
		['gift-castle', '城堡', 'linear-gradient(135deg, rgba(45, 212, 191, 0.92) 0%, rgba(59, 130, 246, 0.92) 100%)', 520, '高价值礼物占位'],
		['gift-rocket', '火箭', 'linear-gradient(135deg, rgba(192, 132, 252, 0.92) 0%, rgba(244, 114, 182, 0.92) 100%)', 1314, '超值礼物占位'],
		['gift-drum', '连击鼓', 'linear-gradient(135deg, rgba(248, 113, 113, 0.94) 0%, rgba(249, 115, 22, 0.92) 100%)', 120, '连击玩法礼物占位'],
		['gift-blind-box', '盲盒机', 'linear-gradient(135deg, rgba(45, 212, 191, 0.94) 0%, rgba(14, 165, 233, 0.92) 100%)', 399, '抽奖玩法礼物占位'],
		['gift-wheel', '命运转盘', 'linear-gradient(135deg, rgba(250, 204, 21, 0.96) 0%, rgba(236, 72, 153, 0.92) 100%)', 666, '互动转盘礼物占位'],
		['gift-key', '闯关钥匙', 'linear-gradient(135deg, rgba(129, 140, 248, 0.94) 0%, rgba(99, 102, 241, 0.92) 100%)', 188, '闯关机制礼物占位'],
		['gift-block', '节奏方块', 'linear-gradient(135deg, rgba(52, 211, 153, 0.94) 0%, rgba(34, 197, 94, 0.92) 100%)', 99, '节奏玩法礼物占位'],
		['gift-challenge', '挑战令', 'linear-gradient(135deg, rgba(56, 189, 248, 0.94) 0%, rgba(37, 99, 235, 0.92) 100%)', 288, '挑战互动礼物占位'],
		['gift-flag', '战队旗', 'linear-gradient(135deg, rgba(244, 114, 182, 0.94) 0%, rgba(219, 39, 119, 0.92) 100%)', 520, '阵营玩法礼物占位'],
		['gift-chest', '通关宝箱', 'linear-gradient(135deg, rgba(250, 204, 21, 0.96) 0%, rgba(245, 158, 11, 0.92) 100%)', 999, '胜利奖励礼物占位']
	]
}

const props = defineProps({
	roomInfo: {
		type: Object,
		default: () => ({})
	},
	topUsers: {
		type: Array,
		default: () => []
	},
	rankEntry: {
		type: Object,
		default: () => ({
			label: '人气榜',
			value: '--'
		})
	},
	luckyBag: {
		type: Object,
		default: () => ({
			label: '福袋',
			desc: ''
		})
	},
	activityBanner: {
		type: Object,
		default: () => ({
			value: '',
			subtitle: '',
			imageText: ''
		})
	},
	inputValue: {
		type: String,
		default: ''
	},
	inputFocused: {
		type: Boolean,
		default: false
	},
	senderId: {
		type: String,
		default: ''
	},
	scene: {
		type: String,
		default: 'live_room'
	},
	safeTopPx: {
		type: Number,
		default: 0
	},
	safeBottomPx: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits([
	'back',
	'follow',
	'top-users',
	'rank',
	'lucky-bag',
	'activity-banner',
	'input-focus',
	'input-change',
	'input-confirm',
	'input-blur',
	'heart',
	'toggle-gift',
	'share',
	'send-gift',
	'send-success',
	'send-fail',
	'panel-close',
	'room-enter',
	'room-exit',
	'room-tick',
	'chat-message-click',
	'online-panel-show',
	'online-panel-hide',
	'online-user-click',
	'user-card-show',
	'user-card-hide',
	'user-card-follow',
	'user-detail-open'
])

const defaultRoomData = {
	roomId: '',
	anchorId: '',
	roomName: '直播中',
	anchorName: '',
	anchorAvatar: '',
	anchorAvatarBackground: 'linear-gradient(135deg, rgba(254, 44, 85, 0.92) 0%, rgba(255, 179, 71, 0.88) 100%)',
	onlineCount: 0,
	onlineText: '0',
	roomLikeCount: 0,
	followText: '关注',
	isFollowed: false,
	isLiking: false
}

const localRoomData = reactive({
	...defaultRoomData
})

const enterTipRef = ref(null)
const giftPanelRef = ref(null)
const userInfoCardRef = ref(null)
const overlayStack = ref([])
const giftPanelVisible = ref(false)
const onlinePanelVisible = ref(false)
const roomChatMessages = ref([])
const roomTempMessage = ref(null)
const roomGiftCoinBalance = ref(128520)
const giftPanelLoading = ref(false)
const giftGroupMap = ref({})
const contributionList = ref([])
const onlineList = ref([])
const onlineMyRank = ref('99+')
const onlinePanelLoading = ref(false)

let mockEnterTimer = null
let mockChatTimer = null
let mockBootstrapTimer = null
let roomTickTimer = null
let giftLoadTimer = null
let onlineLoadTimer = null
let giftLoadPromise = null
let mockEnterIndex = 0
let mockChatIndex = 0
let roomMessageId = 0

// 顶部浮层跟随设备安全区向下偏移。
const topFloatStyle = computed(() => {
	return {
		top: `${props.safeTopPx}px`
	}
})

// 底部操作栏补齐底部安全区。
const bottomFloatStyle = computed(() => {
	return {
		paddingBottom: `${props.safeBottomPx}px`
	}
})

// 聊天区整体悬浮在底部输入栏上方。
const roomChatStackStyle = computed(() => {
	return {
		bottom: `${props.safeBottomPx + rpxToPx(152)}px`
	}
})

// 各个弹层统一走 overlay 栈管理层级。
const giftPanelZIndex = computed(() => {
	return getOverlayZIndex('gift-panel', 1)
})

const onlinePanelZIndex = computed(() => {
	return getOverlayZIndex('online-panel', 2)
})

const userInfoCardZIndex = computed(() => {
	return getOverlayZIndex('user-card', 3)
})

// 房间基础信息变化时，同步刷新本地展示数据。
watch(
	() => props.roomInfo,
	(value) => {
		Object.assign(localRoomData, defaultRoomData, value || {})
	},
	{
		deep: true,
		immediate: true
	}
)

// 进入直播间时，预加载礼物、启动 mock 流量和房间心跳。
onMounted(() => {
	loadRoomGiftData()
	onRoomEnter(buildRoomLifecyclePayload())
	bootstrapRoomMockData()
	startRoomMockTraffic()
	startRoomTick()
})

// 离开直播间时，统一回收定时器和临时数据。
onBeforeUnmount(() => {
	stopRoomMockTraffic()
	stopRoomTick()
	clearRoomChat()
	clearRoomDataTimers()
	onRoomExit(buildRoomLifecyclePayload())
})

// 处理顶部在线头像堆叠的偏移样式。
function getStackAvatarStyle(item, index) {
	return {
		background: item.avatarBackground,
		marginLeft: index === 0 ? '0rpx' : '-14rpx'
	}
}

// 打开在线面板。
function handleOpenOnlinePanel() {
	onlinePanelVisible.value = true
}

// 切换礼物面板显隐，并同步通知父组件。
function handleToggleGiftPanel() {
	emit('input-blur')
	giftPanelVisible.value = !giftPanelVisible.value
	emit('toggle-gift', giftPanelVisible.value)
}

// 向进场提示子组件追加用户进入消息。
function addEnterMessage(userName) {
	enterTipRef.value?.addEnterMessage(userName)
}

// 聊天消息统一入口：临时消息进 temp，普通消息进入历史列表。
function addChatMessage(message) {
	const normalizedMessage = normalizeRoomMessage(message)

	if (normalizedMessage.isTemp) {
		roomTempMessage.value = normalizedMessage
		return normalizedMessage
	}

	roomChatMessages.value.push(normalizedMessage)

	if (roomChatMessages.value.length > ROOM_CHAT_CACHE_LIMIT) {
		roomChatMessages.value.splice(0, roomChatMessages.value.length - ROOM_CHAT_CACHE_LIMIT)
	}

	return normalizedMessage
}

// 清空当前直播间聊天缓存。
function clearRoomChat() {
	roomChatMessages.value = []
	roomTempMessage.value = null
}

// 发送自己输入的普通文本消息。
function appendSelfChatMessage(text) {
	addChatMessage({
		userId: props.senderId,
		nickname: '我',
		vipLevel: 6,
		msgType: 'text',
		isTemp: false,
		isSystemMessage: false,
		content: {
			text
		}
	})
}

// 在公屏追加一条送礼消息。
function appendGiftChatMessage({ giftName, giftNum, giftIcon, nickname = '我', userId = props.senderId, vipLevel = 6 }) {
	addChatMessage({
		userId,
		nickname,
		vipLevel,
		msgType: 'gift',
		isTemp: false,
		isSystemMessage: false,
		content: {
			giftName,
			giftNum,
			giftIcon
		}
	})
}

// 在公屏追加系统提示消息。
function appendSystemMessage(text, isTemp = false) {
	addChatMessage({
		userId: 'system',
		nickname: '系统消息',
		vipLevel: 0,
		msgType: 'text',
		isTemp,
		isSystemMessage: true,
		content: {
			text
		}
	})
}

// 输入框相关事件统一向父层透传。
function handleInputFocus() {
	emit('input-focus')
}

function handleInputChange(event) {
	emit('input-change', event.detail.value || '')
}

function handleInputConfirm(event) {
	const content = `${event.detail.value || ''}`.trim()

	if (content) {
		appendSelfChatMessage(content)
	}

	emit('input-confirm', {
		roomId: localRoomData.roomId,
		senderId: props.senderId,
		userId: props.senderId,
		content
	})
}

function handleInputBlur() {
	emit('input-blur')
}

// 小心心入口实际复用礼物发送链路，成功后再补发 heart 事件。
async function handleHeartTap() {
	const success = await sendRoomGift({
		giftId: 'gift-heart',
		giftNum: 1
	})

	if (!success) {
		return
	}

	emit('heart', {
		roomId: localRoomData.roomId,
		receiverId: localRoomData.anchorId,
		senderId: props.senderId,
		userId: props.senderId,
		scene: props.scene,
		giftId: 'gift-heart',
		giftNum: 1
	})
}

// 礼物面板显示后加入 overlay 栈并确保礼物数据已加载。
function handleGiftPanelShow() {
	activateOverlay('gift-panel')
	loadRoomGiftData()
}

// 礼物面板隐藏后移出 overlay 栈。
function handleGiftPanelHide() {
	deactivateOverlay('gift-panel')
}

// 礼物面板发起送礼前，先在房间层做余额校验并抛出业务事件。
function handleGiftDispatch(payload) {
	const giftNum = normalizeGiftCount(payload.giftNum)
	const totalPrice = Number(payload.price) * giftNum

	if (roomGiftCoinBalance.value < totalPrice) {
		handleGiftFail({
			message: '金币余额不足',
			giftInfo: payload
		})
		return
	}

	roomGiftCoinBalance.value = Math.max(0, roomGiftCoinBalance.value - totalPrice)
	emit('send-gift', {
		...payload,
		sendPayload: buildGiftSendPayload(payload, giftNum)
	})
}

// 送礼成功后，在公屏补一条礼物消息并通知父组件。
function handleGiftSuccess(payload) {
	const successPayload = {
		...payload,
		sendPayload: buildGiftSendPayload(payload, payload.giftNum)
	}

	appendGiftChatMessage({
		giftName: payload.name,
		giftNum: payload.giftNum || 1,
		giftIcon: payload.icon
	})
	emit('send-success', successPayload)
}

// 送礼失败时，插入一条临时系统提示。
function handleGiftFail(payload) {
	appendSystemMessage(payload.message || '送礼失败', true)
	emit('send-fail', payload)
}

// 关闭礼物面板，并通知父组件当前面板已关闭。
function handleGiftClose() {
	if (!giftPanelVisible.value) {
		return
	}

	giftPanelVisible.value = false
	emit('toggle-gift', false)
	emit('panel-close')
}

// 在线面板展示后，加入 overlay 栈并拉取榜单数据。
function handleOnlinePanelShow(payload) {
	activateOverlay('online-panel')
	loadOnlinePanelData()
	emit('online-panel-show', payload)
}

// 在线面板隐藏后，移出 overlay 栈。
function handleOnlinePanelHide(payload) {
	deactivateOverlay('online-panel')
	emit('online-panel-hide', payload)
}

// 点击在线面板关闭按钮时，更新显隐状态。
function handleOnlinePanelClose() {
	onlinePanelVisible.value = false
}

// 点击在线用户时，通知父组件并顺带打开用户卡片。
function handleOnlineUserClick(payload) {
	emit('online-user-click', payload)
	showUserInfoCard(payload, 'online-panel')
}

// 点击公屏消息时，通知父组件并尝试打开用户卡片。
function handleChatMessageClick(message) {
	onChatMessageClick(message)
	showUserInfoCard(message, 'room-chat')
}

// 用户卡片相关 show/hide/follow/detail 事件统一从这里向父层透传。
function handleUserCardShow(payload) {
	activateOverlay('user-card')
	emit('user-card-show', payload)
}

function handleUserCardHide(payload) {
	deactivateOverlay('user-card')
	emit('user-card-hide', payload)
}

function handleUserCardFollow(payload) {
	emit('user-card-follow', payload)
}

function handleUserDetailOpen(payload) {
	emit('user-detail-open', payload)
}

// 组装直播间生命周期公共载荷，供 enter / exit / tick 复用。
function buildRoomLifecyclePayload() {
	return {
		roomId: localRoomData.roomId,
		anchorId: localRoomData.anchorId,
		senderId: props.senderId,
		userId: props.senderId,
		scene: props.scene
	}
}

// 以下是直播间基础事件转发，占位给父组件接真实业务。
function onChatMessageClick(payload) {
	emit('chat-message-click', payload)
}

function onRoomEnter(payload) {
	emit('room-enter', payload)
}

function onRoomExit(payload) {
	emit('room-exit', payload)
}

function onRoomTick(payload) {
	emit('room-tick', payload)
}

// 打开用户资料卡前，先把外部数据规范化成统一结构。
function showUserInfoCard(userInfo, source = 'room') {
	const normalizedUser = normalizeUserCardPayload(userInfo, source)
	if (!normalizedUser) {
		return false
	}

	userInfoCardRef.value?.showUserCard(normalizedUser)
	return true
}

// 主动关闭用户资料卡。
function hideUserInfoCard() {
	userInfoCardRef.value?.hideCard()
}

// 按 overlay 栈顺序关闭最上层弹层，供页面返回键等场景复用。
function hideTopOverlay() {
	const topOverlay = overlayStack.value[overlayStack.value.length - 1]
	if (!topOverlay) {
		return false
	}

	if (topOverlay === 'user-card') {
		hideUserInfoCard()
		return true
	}

	if (topOverlay === 'online-panel') {
		onlinePanelVisible.value = false
		return true
	}

	if (topOverlay === 'gift-panel') {
		handleGiftClose()
		return true
	}

	return false
}

// overlay 栈入栈，保证后打开的弹层显示在最上层。
function activateOverlay(name) {
	if (!name) {
		return
	}

	overlayStack.value = [...overlayStack.value.filter((item) => item !== name), name]
}

// overlay 栈出栈。
function deactivateOverlay(name) {
	if (!name) {
		return
	}

	overlayStack.value = overlayStack.value.filter((item) => item !== name)
}

// 根据 overlay 栈顺序计算弹层 z-index。
function getOverlayZIndex(name, fallbackOrder) {
	const currentIndex = overlayStack.value.indexOf(name)
	const order = currentIndex === -1 ? fallbackOrder : currentIndex + 1
	return ROOM_OVERLAY_Z_INDEX_BASE + order * 20
}

// 统一规整用户卡片展示数据，系统消息等无效用户直接过滤。
function normalizeUserCardPayload(userInfo = {}, source = 'room') {
	const userId = `${userInfo.userId || ''}`.trim()
	if (!userId || userId === 'system') {
		return null
	}

	return {
		userId,
		nickname: `${userInfo.nickname || ''}`.trim() || '用户',
		avatar: resolveUserAvatar(userInfo),
		vipLevel: normalizeUserVipLevel(userInfo.vipLevel),
		isFollowed: Boolean(userInfo.isFollowed),
		source
	}
}

// 为用户生成稳定头像背景。
function resolveUserAvatar(userInfo = {}) {
	const avatarValue = `${userInfo.avatar || userInfo.avatarBackground || ''}`.trim()
	if (avatarValue) {
		return avatarValue
	}

	const seed = `${userInfo.userId || userInfo.nickname || 'room-user'}`
	let hash = 0
	for (const char of seed) {
		hash += char.charCodeAt(0)
	}

	return ROOM_USER_AVATAR_BACKGROUNDS[hash % ROOM_USER_AVATAR_BACKGROUNDS.length]
}

// 对用户 VIP 等级做安全兜底。
function normalizeUserVipLevel(value) {
	const vipLevel = Number(value) || 0
	return vipLevel > 0 ? Math.min(Math.floor(vipLevel), 10) : 0
}

// 对礼物数量做安全兜底。
function normalizeGiftCount(value) {
	const giftNum = Number(value) || 1
	return giftNum > 0 ? Math.floor(giftNum) : 1
}

// 统一把直播间消息格式化成 RoomChat 可直接消费的数据结构。
function normalizeRoomMessage(message = {}) {
	const messageType = ['gift', 'image'].includes(message.msgType) ? message.msgType : 'text'
	const normalizedBase = {
		id: message.id || createRoomMessageId(),
		userId: `${message.userId || ''}`.trim(),
		nickname: `${message.nickname || ''}`.trim() || '用户',
		avatar: resolveUserAvatar(message),
		vipLevel: normalizeUserVipLevel(message.vipLevel),
		msgType: messageType,
		isTemp: Boolean(message.isTemp),
		isSystemMessage: Boolean(message.isSystemMessage)
	}

	if (messageType === 'gift') {
		return {
			...normalizedBase,
			content: {
				giftName: `${message.content?.giftName || '礼物'}`.trim() || '礼物',
				giftNum: normalizeGiftCount(message.content?.giftNum),
				giftIcon: message.content?.giftIcon || ''
			}
		}
	}

	if (messageType === 'image') {
		return {
			...normalizedBase,
			content: {
				imgUrl: message.content?.imgUrl || '',
				imgText: `${message.content?.imgText || '图片消息'}`.trim() || '图片消息'
			}
		}
	}

	return {
		...normalizedBase,
		content: {
			text: `${message.content?.text || ''}`.trim() || '发送了一条消息'
		}
	}
}

// 生成直播间消息唯一 ID。
function createRoomMessageId() {
	roomMessageId += 1
	return `room-message-${Date.now()}-${roomMessageId}`
}

// 把礼物常量表转换成 GiftPanel 需要的分组结构。
function buildGiftGroupMap() {
	return Object.keys(ROOM_GIFT_COLLECTIONS).reduce((result, category) => {
		result[category] = ROOM_GIFT_COLLECTIONS[category].map(([id, name, icon, price, desc]) => ({
			id,
			name,
			icon,
			price,
			desc
		}))
		return result
	}, {})
}

// 懒加载礼物面板数据，避免重复构建。
function loadRoomGiftData() {
	if (Object.keys(giftGroupMap.value).length) {
		return Promise.resolve(giftGroupMap.value)
	}

	if (giftLoadPromise) {
		return giftLoadPromise
	}

	giftPanelLoading.value = true
	giftLoadPromise = new Promise((resolve) => {
		giftLoadTimer = setTimeout(() => {
			giftGroupMap.value = buildGiftGroupMap()
			giftPanelLoading.value = false
			giftLoadPromise = null
			giftLoadTimer = null
			resolve(giftGroupMap.value)
		}, 260)
	})

	return giftLoadPromise
}

// 根据礼物 ID 在直播间礼物池中反查礼物信息。
function findRoomGiftById(giftId) {
	const targetId = `${giftId || ''}`.trim()
	if (!targetId) {
		return null
	}

	for (const category of Object.keys(giftGroupMap.value)) {
		const gift = (giftGroupMap.value[category] || []).find((item) => item.id === targetId)
		if (gift) {
			return {
				category,
				gift
			}
		}
	}

	return null
}

// 统一构造房间层的送礼请求载荷。
function buildGiftSendPayload(giftInfo, giftNum) {
	return {
		roomId: localRoomData.roomId,
		senderId: props.senderId,
		receiverId: localRoomData.anchorId,
		scene: props.scene,
		giftId: giftInfo.id || giftInfo.giftId,
		giftNum: normalizeGiftCount(giftNum)
	}
}

// 暴露给父组件的送礼入口，本质上转调 GiftPanel 的 sendGift。
async function sendRoomGift(request = {}) {
	await loadRoomGiftData()
	await nextTick()
	return Boolean(await giftPanelRef.value?.sendGift({
		giftId: request.giftId,
		giftNum: request.giftNum
	}))
}

// 打开在线面板时模拟拉取贡献榜和在线用户列表。
function loadOnlinePanelData() {
	onlinePanelLoading.value = true

	if (onlineLoadTimer) {
		clearTimeout(onlineLoadTimer)
		onlineLoadTimer = null
	}

	onlineLoadTimer = setTimeout(() => {
		const nextContributionList = createContributionUsers()
		const nextOnlineList = createOnlineUsers()

		contributionList.value = nextContributionList
		onlineList.value = nextOnlineList

		const selfContribution = nextContributionList.find((item) => item.userId === props.senderId)
		onlineMyRank.value = selfContribution ? selfContribution.rank : '99+'
		onlinePanelLoading.value = false
		onlineLoadTimer = null
	}, 220)
}

// 生成贡献榜 mock 用户。
function createContributionUsers() {
	const nicknamePool = ['晴川', '夏至', '小鹿', '知秋', '晚星', '阿柠', '牧野', '小岛', '阿言', '北辰']
	const avatarPool = ROOM_USER_AVATAR_BACKGROUNDS

	const list = Array.from({ length: 99 }, (_, index) => {
		const rank = index + 1
		return {
			userId: `contribution-user-${rank}`,
			nickname: `${nicknamePool[index % nicknamePool.length]}${rank}`,
			avatar: avatarPool[index % avatarPool.length],
			vipLevel: ((99 - index) % 9) + 1,
			score: 9800 - index * 87,
			rank
		}
	})

	if (props.senderId) {
		list[25] = {
			userId: props.senderId,
			nickname: '我',
			avatar: 'linear-gradient(135deg, rgba(255, 196, 86, 0.92) 0%, rgba(255, 151, 45, 0.92) 100%)',
			vipLevel: 6,
			score: 7520,
			rank: 26
		}
	}

	return list
}

// 生成在线用户 mock 数据，并重新按积分排序。
function createOnlineUsers() {
	const nicknamePool = ['浮光', '清歌', '木木', '银河', '半夏', '阿栀', '向晚', '可乐', '听雨', '小北']
	const avatarPool = ROOM_USER_AVATAR_BACKGROUNDS

	const list = Array.from({ length: 50 }, (_, index) => {
		const rank = index + 1
		return {
			userId: `online-user-${rank}`,
			nickname: `${nicknamePool[index % nicknamePool.length]}${rank}`,
			avatar: avatarPool[index % avatarPool.length],
			vipLevel: ((50 - index) % 8) + 1,
			score: 5600 - index * 61,
			rank
		}
	})

	if (props.senderId) {
		list[10] = {
			userId: props.senderId,
			nickname: '我',
			avatar: 'linear-gradient(135deg, rgba(255, 196, 86, 0.92) 0%, rgba(255, 151, 45, 0.92) 100%)',
			vipLevel: 6,
			score: 4888,
			rank: 11
		}
	}

	return list.sort((left, right) => Number(right.score) - Number(left.score)).map((item, index) => ({
		...item,
		rank: index + 1
	}))
}

// 启动房间心跳定时器，模拟页面驻留中的周期事件。
function startRoomTick() {
	stopRoomTick()
	roomTickTimer = setInterval(() => {
		onRoomTick({
			...buildRoomLifecyclePayload(),
			timestamp: Date.now()
		})
	}, ROOM_TICK_INTERVAL)
}

// 停止房间心跳。
function stopRoomTick() {
	if (roomTickTimer) {
		clearInterval(roomTickTimer)
		roomTickTimer = null
	}
}

// 清理礼物与在线面板相关的数据请求定时器。
function clearRoomDataTimers() {
	if (giftLoadTimer) {
		clearTimeout(giftLoadTimer)
		giftLoadTimer = null
	}

	if (onlineLoadTimer) {
		clearTimeout(onlineLoadTimer)
		onlineLoadTimer = null
	}

	giftLoadPromise = null
	giftPanelLoading.value = false
	onlinePanelLoading.value = false
}

// TODO-MOCK-START：以下为直播间内数据与交互模拟逻辑，接入真实接口后可整体移除
// 初始化直播间的首屏 mock 数据。
function bootstrapRoomMockData() {
	if (mockBootstrapTimer) {
		clearTimeout(mockBootstrapTimer)
		mockBootstrapTimer = null
	}

	mockBootstrapTimer = setTimeout(() => {
		appendSystemMessage(`欢迎来到${localRoomData.roomName}`)
		addEnterMessage('小满')
		addEnterMessage('晚风')
		addEnterMessage('北岛')

		addChatMessage({
			userId: 'viewer-001',
			nickname: '小满',
			vipLevel: 3,
			msgType: 'text',
			isTemp: false,
			isSystemMessage: false,
			content: {
				text: '主播今天状态真不错'
			}
		})

		addChatMessage({
			userId: 'viewer-002',
			nickname: '晚风',
			vipLevel: 6,
			msgType: 'gift',
			isTemp: false,
			isSystemMessage: false,
			content: {
				giftName: '玫瑰',
				giftNum: 9,
				giftIcon: 'linear-gradient(135deg, rgba(244, 63, 94, 0.92) 0%, rgba(251, 113, 133, 0.92) 100%)'
			}
		})

		addChatMessage({
			userId: 'viewer-003',
			nickname: '北岛',
			vipLevel: 1,
			msgType: 'image',
			isTemp: false,
			isSystemMessage: false,
			content: {
				imgUrl: createMockImageDataUrl('HI', '#1f2937', '#7c3aed'),
				imgText: '发来了一张图片'
			}
		})

		addChatMessage({
			userId: 'system',
			nickname: '系统提示',
			vipLevel: 0,
			msgType: 'text',
			isTemp: true,
			isSystemMessage: true,
			content: {
				text: '欢迎来到千语直播间'
			}
		})
	}, 120)
}

// 启动模拟进场消息与公屏消息流量。
function startRoomMockTraffic() {
	stopRoomMockTraffic()

	mockEnterTimer = setInterval(() => {
		addEnterMessage(getNextMockViewerName())
	}, ROOM_MOCK_ENTER_INTERVAL)

	mockChatTimer = setInterval(() => {
		addChatMessage(getNextMockChatMessage())
	}, ROOM_MOCK_CHAT_INTERVAL)
}

// 停止所有 mock 流量定时器。
function stopRoomMockTraffic() {
	if (mockBootstrapTimer) {
		clearTimeout(mockBootstrapTimer)
		mockBootstrapTimer = null
	}

	if (mockEnterTimer) {
		clearInterval(mockEnterTimer)
		mockEnterTimer = null
	}

	if (mockChatTimer) {
		clearInterval(mockChatTimer)
		mockChatTimer = null
	}
}

// 轮流生成进场用户名。
function getNextMockViewerName() {
	const viewerNames = ['星野', '阿离', '向晚', '知夏', '可乐', '听风', '沐言', '柚子']
	const userName = viewerNames[mockEnterIndex % viewerNames.length]
	mockEnterIndex += 1
	return userName
}

// 轮流生成不同类型的 mock 公屏消息。
function getNextMockChatMessage() {
	const chatMessageFactories = [
		() => ({
			userId: 'viewer-004',
			nickname: '向晚',
			vipLevel: 2,
			msgType: 'text',
			isTemp: false,
			isSystemMessage: false,
			content: {
				text: '公屏滚动效果挺顺滑的'
			}
		}),
		() => ({
			userId: 'viewer-005',
			nickname: '知夏',
			vipLevel: 5,
			msgType: 'gift',
			isTemp: false,
			isSystemMessage: false,
			content: {
				giftName: '闪耀棒',
				giftNum: 3,
				giftIcon: 'linear-gradient(135deg, rgba(250, 204, 21, 0.94) 0%, rgba(249, 115, 22, 0.92) 100%)'
			}
		}),
		() => ({
			userId: 'viewer-006',
			nickname: '可乐',
			vipLevel: 1,
			msgType: 'image',
			isTemp: false,
			isSystemMessage: false,
			content: {
				imgUrl: createMockImageDataUrl('PIC', '#111827', '#ec4899'),
				imgText: '分享了一张图片'
			}
		}),
		() => ({
			userId: 'system',
			nickname: '系统提示',
			vipLevel: 0,
			msgType: 'text',
			isTemp: true,
			isSystemMessage: true,
			content: {
				text: '活动冲榜中，送礼可提升热度'
			}
		})
	]

	const messageFactory = chatMessageFactories[mockChatIndex % chatMessageFactories.length]
	mockChatIndex += 1
	return messageFactory()
}

// 生成图片消息用的内联 SVG 占位图。
function createMockImageDataUrl(label, startColor, endColor) {
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
			<defs>
				<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="${startColor}" />
					<stop offset="100%" stop-color="${endColor}" />
				</linearGradient>
			</defs>
			<rect width="96" height="96" rx="20" fill="url(#g)" />
			<text x="48" y="56" font-size="24" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif">${label}</text>
		</svg>
	`

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
// TODO-MOCK-END

// 将 rpx 转成设备像素，给悬浮区定位计算使用。
function rpxToPx(value) {
	return (Number(roomSystemInfo.windowWidth) || 375) * Number(value) / 750
}

// 暴露给页面层的几个常用控制入口。
defineExpose({
	showUserInfoCard,
	hideUserInfoCard,
	hideTopOverlay,
	sendGift: sendRoomGift
})
</script>

<style scoped>
.room-index {
	position: relative;
	height: 100%;
	overflow: hidden;
}

.room-background {
	position: absolute;
	inset: 0;
	z-index: 1;
	background: linear-gradient(180deg, rgba(22, 22, 28, 0.16) 0%, rgba(8, 8, 12, 0.86) 100%),
		linear-gradient(135deg, rgba(73, 37, 121, 0.88) 0%, rgba(15, 18, 30, 0.94) 54%, rgba(18, 18, 18, 0.96) 100%);
}

.room-background-glow {
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at top right, rgba(255, 128, 173, 0.24) 0%, transparent 32%),
		radial-gradient(circle at left center, rgba(95, 112, 255, 0.18) 0%, transparent 28%);
}

.room-background-mask {
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at top right, rgba(254, 44, 85, 0.16), transparent 36%),
		radial-gradient(circle at bottom left, rgba(255, 163, 26, 0.16), transparent 34%);
}

.room-background-info {
	position: absolute;
	left: 32rpx;
	right: 32rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 2;
}

.room-background-tag {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 44rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.12);
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.78);
}

.room-background-title {
	display: block;
	margin-top: 20rpx;
	font-size: 36rpx;
	font-weight: 700;
	line-height: 74rpx;
	color: rgba(255, 255, 255, 0.18);
}

.dismiss-layer {
	position: absolute;
	inset: 0;
	z-index: 12;
}

.top-float-area {
	position: absolute;
	left: 32rpx;
	right: 32rpx;
	z-index: 20;
	padding-top: 20rpx;
}

.top-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.top-row-first {
	min-height: 96rpx;
}

.top-row + .top-row {
	margin-top: 24rpx;
}

.top-row-third {
	align-items: stretch;
	gap: 24rpx;
}

.top-left-group {
	display: flex;
	align-items: center;
	min-width: 0;
	padding-right: 20rpx;
	border-radius: 50rpx 30rpx 30rpx 50rpx;
	background: rgba(13, 13, 18, 0.28);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 16rpx 28rpx rgba(0, 0, 0, 0.16);
	backdrop-filter: blur(24rpx);
	-webkit-backdrop-filter: blur(24rpx);
}

.back-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 48rpx;
	padding: 0 14rpx;
	margin-left: 16rpx;
	border-radius: 999rpx;
	background: rgba(13, 13, 18, 0.34);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.back-button-text {
	font-size: 32rpx;
	line-height: 32rpx;
	font-weight: 400;
	color: #ffffff;
}

.anchor-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	box-shadow: 0 12rpx 26rpx rgba(255, 126, 164, 0.2);
}

.anchor-info {
	display: flex;
	flex-direction: column;
	min-width: 0;
	margin-left: 16rpx;
}

/* .anchor-name {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #ffffff;
	overflow: hidden;
} */

.room-name {
	
	font-size: 24rpx;
	font-weight: 600;
	line-height: 30rpx;
	white-space: nowrap;
	text-overflow: ellipsis;   /* 末尾显示省略号 */
	color: rgba(255, 255, 255, 0.68);
}

.room-like-count {

	font-size: 18rpx;
	line-height: 30rpx;
	color: rgba(255, 255, 255, 0.68);
}
/* 关注区域 */
.follow-button {
	display: inline-flex;
	align-items: center;

	padding: 15rpx 15rpx;
	height: 60rpx;
	margin-left: 16rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 118, 165, 0.96) 0%, rgba(255, 194, 116, 0.92) 100%);
	font-size: 24rpx;
	line-height: 32rpx;
	color: #ffffff;
	flex-shrink: 0;
	box-shadow: 0 12rpx 24rpx rgba(255, 118, 165, 0.22);
}

.top-right-group {
	display: flex;
	align-items: center;
	margin-left: 20rpx;
	padding: 8rpx 10rpx 8rpx 0;
	border-radius: 999rpx;
	background: rgba(13, 13, 18, 0.24);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(20rpx);
	-webkit-backdrop-filter: blur(20rpx);
}

.user-avatar-stack {
	display: flex;
	align-items: center;
	background: transparent;
}

.stack-avatar {
	width: 56rpx;
	height: 56rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.4);
	border-radius: 50%;
}

.online-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 56rpx;
	padding: 0 18rpx;
	margin-left: 14rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.08);
	font-size: 24rpx;
	line-height: 32rpx;
	color: #ffffff;
}
/* 榜单区域宽高 */
.rank-entry {
	display: inline-flex;
	align-items: center;
	height: auto;
	padding: 5rpx 24rpx;
	border-radius: 24rpx;
	background: rgba(13, 13, 18, 0.24);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	box-sizing: border-box;
}
/* 榜单 label */
.rank-entry-label {
	font-size: 20rpx;
	line-height: 40rpx;
	color: rgba(255, 255, 255, 0.72);
}

.rank-entry-value {
	margin-left: 10rpx;
	font-size: 20rpx;
	line-height: 40rpx;
	color: #ffffff;
}

.lucky-bag-entry {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 120rpx;
	height: 64rpx;
	padding: 0 12rpx;
	border-radius: 24rpx;
	background: linear-gradient(135deg, rgba(255, 195, 93, 0.92) 0%, rgba(255, 116, 165, 0.9) 100%);
	box-sizing: border-box;
	flex-shrink: 0;
	box-shadow: 0 14rpx 28rpx rgba(255, 118, 165, 0.18);
}

.lucky-bag-icon {
	position: relative;
	width: 28rpx;
	height: 24rpx;
	margin-right: 8rpx;
	border-radius: 8rpx 8rpx 10rpx 10rpx;
	background: rgba(255, 255, 255, 0.22);
	border: 2rpx solid rgba(255, 255, 255, 0.76);
	box-sizing: border-box;
}

.lucky-bag-icon-handle {
	position: absolute;
	left: 50%;
	top: -10rpx;
	width: 16rpx;
	height: 10rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.76);
	border-bottom: none;
	border-radius: 12rpx 12rpx 0 0;
	transform: translateX(-50%);
	box-sizing: border-box;
}

.lucky-bag-title {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 30rpx;
	color: #ffffff;
}

.lucky-bag-desc {
	display: none;
	font-size: 24rpx;
	line-height: 28rpx;
	color: rgba(255, 255, 255, 0.88);
}

.activity-banner {
	display: flex;
	align-items: center;
	flex: 1;
	height: 64rpx;
	padding: 0 20rpx;
	border-radius: 24rpx;
	background: linear-gradient(135deg, rgba(59, 70, 123, 0.82) 0%, rgba(25, 18, 45, 0.92) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
	box-sizing: border-box;
	box-shadow: 0 14rpx 28rpx rgba(0, 0, 0, 0.16);
}

.activity-banner-left {
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.activity-banner-value {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 38rpx;
	color: #ffffff;
}

.activity-banner-subtitle {
	font-size: 24rpx;
	line-height: 32rpx;
	color: rgba(255, 255, 255, 0.68);
}

.activity-banner-right {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 112rpx;
	height: 48rpx;
	margin-left: 16rpx;
	border-radius: 24rpx;
	background: linear-gradient(135deg, rgba(255, 118, 165, 0.88) 0%, rgba(255, 194, 116, 0.88) 100%);
}

.activity-banner-image-text {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #ffffff;
}

.room-chat-stack {
	position: absolute;
	left: 32rpx;
	z-index: 24;
	display: flex;
	flex-direction: column;
	width: 520rpx;
	gap: 12rpx;
}

.room-chat-panel {
	width: 100%;
}

/* 底部发送信息区域，送礼物区域 */
.bottom-float-bar {
	position: fixed;
	left: 32rpx;
	right: 32rpx;
	bottom: 18rpx;
	z-index: 30;
	display: flex;
	align-items: center;
	min-height: 120rpx;
	gap: 20rpx;
	padding: 16rpx;
	border-radius: 36rpx;
	background: rgba(12, 12, 18, 0.28);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.22);
	backdrop-filter: blur(28rpx);
	-webkit-backdrop-filter: blur(28rpx);
	box-sizing: border-box;
}

.chat-input-wrap {
	flex: 1;
	height: 72rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.08);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.chat-input {
	width: 100%;
	height: 72rpx;
	font-size: 24rpx;
	line-height: 72rpx;
	color: #ffffff;
}

.action-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.08);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
	flex-shrink: 0;
}

.action-button-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
