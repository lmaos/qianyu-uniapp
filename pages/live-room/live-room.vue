<template>
	<view class="live-room-page">
		<RoomIndex
			:room-info="roomInfo"
			:top-users="topUsers"
			:rank-entry="rankEntry"
			:lucky-bag="luckyBag"
			:activity-banner="activityBanner"
			:input-value="inputValue"
			:input-focused="inputFocused"
			:sender-id="senderId"
			:scene="sceneId"
			:safe-top-px="safeTopPx"
			:safe-bottom-px="safeBottomPx"
			@back="handleBack"
			@follow="handleFollow"
			@rank="handleRank"
			@lucky-bag="handleLuckyBag"
			@activity-banner="handleActivityBanner"
			@input-focus="handleInputFocus"
			@input-change="handleInputChange"
			@input-confirm="handleInputConfirm"
			@input-blur="handleInputBlur"
			@heart="handleHeartGift"
			@toggle-gift="handleToggleGiftPanel"
			@share="handleShare"
			@send-gift="handleSendGift"
			@send-success="handleSendGiftSuccess"
			@send-fail="handleSendGiftFail"
			@panel-close="handleCloseGiftPanel"
			@room-enter="handleRoomEnter"
			@room-exit="handleRoomExit"
			@room-tick="handleRoomTick"
			@chat-message-click="handleChatMessageClick"
			@online-panel-show="handleOnlinePanelShow"
			@online-panel-hide="handleOnlinePanelHide"
			@online-user-click="handleOnlineUserClick"
			@user-card-show="handleUserCardShow"
			@user-card-hide="handleUserCardHide"
			@user-card-follow="handleUserCardFollow"
			@user-detail-open="handleUserDetailOpen"
		/>

		<ActivityImagePopup
			v-if="activePopup.popupType === ACTIVITY_POPUP_TYPES.IMAGE"
			:visible="activityPopupVisible"
			:title="activePopup.title"
			:desc="activePopup.desc"
			:image-url="activePopup.imageUrl"
			:confirm-text="activePopup.confirmText"
			:cancel-text="activePopup.cancelText"
			:show-close="activePopup.showClose"
			:close-on-mask="activePopup.closeOnMask"
			:action-url="activePopup.actionUrl"
			:action-payload="activePopup.actionPayload"
			@close="handleActivityPopupClose"
			@confirm="handleActivityPopupConfirm"
			@action="handleActivityPopupAction"
		/>

		<ActivityActionPopup
			v-else-if="activityPopupVisible"
			:visible="activityPopupVisible"
			:title="activePopup.title"
			:desc="activePopup.desc"
			:confirm-text="activePopup.confirmText"
			:cancel-text="activePopup.cancelText"
			:show-close="activePopup.showClose"
			:close-on-mask="activePopup.closeOnMask"
			:action-url="activePopup.actionUrl"
			:action-payload="activePopup.actionPayload"
			@close="handleActivityPopupClose"
			@confirm="handleActivityPopupConfirm"
			@action="handleActivityPopupAction"
		/>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ActivityActionPopup from '@/components/common/activity/ActivityActionPopup.vue'
import ActivityImagePopup from '@/components/common/activity/ActivityImagePopup.vue'
import { dispatchActivityAction } from '@/components/common/activity/activityActionRouter.js'
import {
	ACTIVITY_POPUP_TYPES,
	ACTIVITY_ACTION_PROTOCOL_REFERENCE,
	buildActivityActionUrl,
	normalizeActivityPopupConfig
} from '@/components/common/activity/activityActionProtocol.js'
import RoomIndex from '@/components/room/RoomIndex.vue'

const systemInfo = uni.getSystemInfoSync()
const safeTopPx = systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0
const safeBottomPx = systemInfo.safeAreaInsets?.bottom || 0

const roomInfo = ref({
	roomId: 'hot-room-1001',
	anchorId: 'anchor-1001',
	roomName: '千语直播间',
	anchorName: '千语主播',
	anchorAvatarBackground: 'linear-gradient(135deg, rgba(254, 44, 85, 0.92) 0%, rgba(255, 179, 71, 0.88) 100%)',
	onlineText: '8.8w'
})

const topUsers = ref([
	{
		userId: 'top-user-1',
		avatarBackground: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(56, 189, 248, 0.9) 100%)'
	},
	{
		userId: 'top-user-2',
		avatarBackground: 'linear-gradient(135deg, rgba(250, 204, 21, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)'
	},
	{
		userId: 'top-user-3',
		avatarBackground: 'linear-gradient(135deg, rgba(52, 211, 153, 0.9) 0%, rgba(14, 165, 233, 0.9) 100%)'
	}
])

const rankEntry = ref({
	label: '人气榜',
	value: '第3名'
})

const luckyBag = ref({
	label: '福袋',
	desc: '03:28后开奖'
})

const activityBanner = ref({
	value: '2888热度',
	subtitle: '活动冲榜进行中',
	imageText: '活动位'
})

const senderId = ref('user-self-10001')
const sceneId = 'live_room'
const inputValue = ref('')
const inputFocused = ref(false)
const activityPopupVisible = ref(false)
const activityPopupConfig = ref(normalizeActivityPopupConfig())
const activePopup = computed(() => {
	return normalizeActivityPopupConfig({
		...activityPopupConfig.value,
		visible: activityPopupVisible.value
	})
})

onLoad((options) => {
	const roomId = options.roomId || roomInfo.value.roomId
	const anchorId = options.anchorId || roomInfo.value.anchorId
	const roomName = options.roomName ? decodeURIComponent(options.roomName) : roomInfo.value.roomName

	roomInfo.value = {
		...roomInfo.value,
		roomId,
		anchorId,
		roomName,
		anchorName: `${roomName}`,
		onlineText: '12.8w'
	}

	rankEntry.value = {
		label: '人气榜',
		value: `${roomName.slice(0, 2)}榜单`
	}
})

function handleBack() {
	onBack(roomInfo.value)
	uni.navigateBack({
		delta: 1
	})
}

function handleFollow(payload) {
	onFollow(payload)
	uni.showToast({
		title: '关注回调占位',
		icon: 'none'
	})
}

function handleRank(payload) {
	onRankClick(payload)
	openActivityPopup({
		popupType: ACTIVITY_POPUP_TYPES.ACTION,
		title: `${payload?.label || '人气榜'}正在升温`,
		desc: '当前协议统一收敛在 navigationActionProtocol.js。这里先演示 page://open 普通页面跳转，后续可直接替换为真实活动或榜单接口。',
		confirmText: '查看榜单',
		cancelText: '稍后再看',
		actionUrl: buildActivityActionUrl('open', {
			page: '/pages/live/rank'
		}),
		actionPayload: {
			title: payload?.label || '人气榜'
		}
	})
}

function handleLuckyBag(payload) {
	onLuckyBagClick(payload)
	openActivityPopup({
		popupType: ACTIVITY_POPUP_TYPES.ACTION,
		title: `${payload?.label || '福袋'}入口已接协议跳转`,
		desc: '这里演示 page://tab 协议：点击后会直接回到首页，并切到直播频道，适合承接直播首页、频道内子组件、活动分区等内部目标。',
		confirmText: '回到直播频道',
		cancelText: '留在房间',
		actionUrl: buildActivityActionUrl('tab', {
			tab: 'home',
			scene: 'live'
		}),
		actionPayload: {
			title: '直播频道'
		}
	})
}

function handleActivityBanner(payload) {
	onActivityBannerClick(payload)
	openActivityPopup({
		popupType: ACTIVITY_POPUP_TYPES.IMAGE,
		title: `${payload?.subtitle || '活动进行中'}`,
		desc: `当前支持 ${ACTIVITY_ACTION_PROTOCOL_REFERENCE.supportedPrefixes.join(' / ')}，这里演示 http(s) 外链进内嵌页面。`,
		imageUrl:
			'linear-gradient(135deg, rgba(254, 44, 85, 0.98) 0%, rgba(251, 146, 60, 0.94) 48%, rgba(59, 130, 246, 0.9) 100%)',
		confirmText: '查看活动说明',
		cancelText: '继续看直播',
		actionUrl: 'https://example.com/',
		actionPayload: {
			title: '活动说明'
		}
	})
}

function handleInputFocus() {
	inputFocused.value = true
	onInputFocus(roomInfo.value.roomId)
}

function handleInputChange(value) {
	inputValue.value = value
}

function handleInputConfirm(payload) {
	const content = `${payload?.content || inputValue.value}`.trim()
	if (!content) {
		uni.showToast({
			title: '请输入内容',
			icon: 'none'
		})
		return
	}

	onSendMessage({
		roomId: payload?.roomId || roomInfo.value.roomId,
		senderId: payload?.senderId || senderId.value,
		userId: payload?.userId || senderId.value,
		content
	})
	uni.showToast({
		title: '发送成功',
		icon: 'none'
	})
	inputValue.value = ''
	inputFocused.value = false
	uni.hideKeyboard()
}

function handleInputBlur() {
	inputFocused.value = false
	uni.hideKeyboard()
	onInputBlur(roomInfo.value.roomId)
}

function handleToggleGiftPanel(visible) {
	inputFocused.value = false
	uni.hideKeyboard()
	onToggleGiftPanel(Boolean(visible))
}

function handleCloseGiftPanel() {
	onCloseGiftPanel(roomInfo.value.roomId)
}

function handleSendGiftSuccess(payload) {
	onSendGiftSuccess(payload)
	uni.showToast({
		title: `连击结束，共送出${payload.name} x${payload.giftNum || 1}`,
		icon: 'none'
	})
}

function handleSendGiftFail(payload) {
	onSendGiftFail(payload)
	uni.showToast({
		title: payload.message,
		icon: 'none'
	})
}

function handleHeartGift(payload) {
	onHeartGift(payload)
}

function handleShare() {
	onShareRoom(roomInfo.value)
	openActivityPopup({
		popupType: ACTIVITY_POPUP_TYPES.ACTION,
		title: '推荐你去另一个直播间看看',
		desc: '这里演示 page://live-room 协议：可以直达指定房间，也方便后续从活动弹层、浮条、卡片直接跳转到特定直播间。',
		confirmText: '打开新房间',
		cancelText: '先不切换',
		actionUrl: buildActivityActionUrl('live-room', {
			roomId: 'hot-room-2002',
			anchorId: 'anchor-2002',
			roomName: '夜语音乐现场'
		}),
		actionPayload: {
			title: '直播间跳转'
		}
	})
}

function handleRoomEnter(payload) {
	onRoomEnter(payload)
}

function handleRoomExit(payload) {
	onRoomExit(payload)
}

function handleRoomTick(payload) {
	onRoomTick(payload)
}

function handleSendGift(payload) {
	onSendGift(payload)
	uni.showToast({
		title: `送出${payload.name} x${payload.comboGiftNum || payload.giftNum || 1}`,
		icon: 'none'
	})
}

function handleChatMessageClick(payload) {
	onChatMessageClick(payload)
}

function handleUserCardShow(payload) {
	onUserCardShow(payload)
}

function handleUserCardHide(payload) {
	onUserCardHide(payload)
}

function handleUserCardFollow(payload) {
	onUserCardFollow(payload)
	uni.showToast({
		title: payload.isFollowed ? `已关注 ${payload.nickname}` : `已取消关注 ${payload.nickname}`,
		icon: 'none'
	})
}

function handleUserDetailOpen(payload) {
	onUserDetailOpen(payload)
}

function handleOnlinePanelShow(payload) {
	onOnlinePanelShow(payload)
}

function handleOnlinePanelHide(payload) {
	onOnlinePanelHide(payload)
}

function handleOnlineUserClick(payload) {
	onOnlineUserClick(payload)
}

function handleActivityPopupClose(payload) {
	onActivityPopupClose(payload)
	activityPopupVisible.value = false
}

function handleActivityPopupConfirm(payload) {
	onActivityPopupConfirm(payload)
}

function handleActivityPopupAction(payload) {
	onActivityPopupAction(payload)
	const result = dispatchActivityAction(payload?.actionUrl, payload?.actionPayload)
	if (result.handled) {
		activityPopupVisible.value = false
		return
	}

	uni.showToast({
		title: '协议暂未支持',
		icon: 'none'
	})
}

function onBack(payload) {
	// TODO：替换直播间返回回调
	console.log('live-room-back', payload.roomId)
}

function onFollow(payload) {
	// TODO：替换关注主播接口
	console.log('live-room-follow', payload.anchorId)
}

function onRankClick(payload) {
	// TODO：替换人气榜点击回调
	console.log('live-room-rank-click', payload.value)
}

function onLuckyBagClick(payload) {
	// TODO：替换福袋点击回调
	console.log('live-room-lucky-bag-click', payload.label)
}

function onActivityBannerClick(payload) {
	// TODO：替换活动Banner点击回调
	console.log('live-room-activity-click', payload.value)
}

function onInputFocus(roomId) {
	// TODO：替换直播间输入框聚焦回调
	console.log('live-room-input-focus', roomId)
}

function onInputBlur(roomId) {
	// TODO：替换直播间输入框失焦回调
	console.log('live-room-input-blur', roomId)
}

function onSendMessage(payload) {
	// TODO：替换直播间公屏发送接口
	console.log('live-room-send-message', payload.userId, payload.content)
}

function onToggleGiftPanel(visible) {
	// TODO：替换礼物面板开关回调
	console.log('live-room-toggle-gift-panel', visible)
}

function onCloseGiftPanel(roomId) {
	// TODO：替换礼物面板关闭回调
	console.log('live-room-close-gift-panel', roomId)
}

function onSendGift(payload) {
	// TODO：替换送礼接口
	console.log('live-room-send-gift', payload.sendPayload?.giftId, payload.giftNum)
}

function onSendGiftSuccess(payload) {
	// TODO：替换送礼成功回调
	console.log('live-room-send-gift-success', payload.id, payload.giftNum)
}

function onSendGiftFail(payload) {
	// TODO：替换送礼失败回调
	console.log('live-room-send-gift-fail', payload.giftInfo?.id, payload.message)
}

function onHeartGift(payload) {
	// TODO：替换小心心一键送礼回调
	console.log('live-room-heart-gift', payload.giftId, payload.giftNum)
}

function onShareRoom(payload) {
	// TODO：替换直播间分享回调
	console.log('live-room-share', payload.roomId)
}

function onRoomEnter(payload) {
	// TODO：替换进入直播间回调
	console.log('live-room-enter', payload.roomId)
}

function onRoomExit(payload) {
	// TODO：替换退出直播间回调
	console.log('live-room-exit', payload.roomId)
}

function onRoomTick(payload) {
	// TODO：替换直播间5秒触发回调
	console.log('live-room-tick', payload.roomId, payload.timestamp)
}

function onChatMessageClick(payload) {
	// TODO：替换直播间消息点击回调
	console.log('live-room-chat-message-click', payload.userId, payload.nickname)
}

function onUserCardShow(payload) {
	// TODO：替换用户信息卡片显示回调
	console.log('live-room-user-card-show', payload.userId, payload.nickname)
}

function onUserCardHide(payload) {
	// TODO：替换用户信息卡片隐藏回调
	console.log('live-room-user-card-hide', payload.userId, payload.nickname)
}

function onUserCardFollow(payload) {
	// TODO：替换用户卡片关注回调
	console.log('live-room-user-card-follow', payload.userId, payload.isFollowed)
}

function onUserDetailOpen(payload) {
	// TODO：替换用户资料页打开前回调
	console.log('live-room-user-detail-open', payload.userId, payload.nickname)
}

function onOnlinePanelShow(payload) {
	// TODO：替换在线面板显示回调
	console.log('live-room-online-panel-show', payload.roomId)
}

function onOnlinePanelHide(payload) {
	// TODO：替换在线面板隐藏回调
	console.log('live-room-online-panel-hide', payload.roomId)
}

function onOnlineUserClick(payload) {
	// TODO：替换在线面板用户点击回调
	console.log('live-room-online-user-click', payload.userId, payload.nickname)
}

function onActivityPopupClose(payload) {
	// TODO：替换活动弹窗关闭回调
	console.log('live-room-activity-popup-close', payload?.reason || 'close')
}

function onActivityPopupConfirm(payload) {
	// TODO：替换活动弹窗确认回调
	console.log('live-room-activity-popup-confirm', payload?.trigger || 'confirm-button')
}

function onActivityPopupAction(payload) {
	// TODO：替换活动弹窗 actionUrl 分发前回调
	console.log('live-room-activity-popup-action', payload?.actionUrl)
}

function openActivityPopup(config) {
	activityPopupConfig.value = normalizeActivityPopupConfig({
		...config,
		visible: true
	})
	activityPopupVisible.value = true
}
</script>

<style>
page {
	height: 100%;
	overflow: hidden;
	background: #000000;
	overscroll-behavior: none;
}
</style>

<style scoped>
.live-room-page {
	position: fixed;
	inset: 0;
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background: #000000;
	overscroll-behavior: none;
}
</style>
