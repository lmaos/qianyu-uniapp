<template>
	<view
		v-if="panelMounted"
		:class="['online-panel-overlay', panelVisible ? 'online-panel-overlay-enter' : 'online-panel-overlay-leave']"
		:style="overlayStyle"
	>
		<view class="online-panel-mask" @tap="handleClose"></view>
		<view class="online-panel" :style="panelStyle">
			<view class="online-panel-header">
				<text class="online-panel-title">在线用户</text>
				<view class="online-panel-close" @tap="handleClose">关闭</view>
			</view>

			<view class="online-panel-tabs">
				<view
					:class="['online-panel-tab', activeTab === 'contribution' ? 'online-panel-tab-active' : '']"
					@tap="handleTabChange('contribution')"
				>
					贡献榜
				</view>
				<view
					:class="['online-panel-tab', activeTab === 'online' ? 'online-panel-tab-active' : '']"
					@tap="handleTabChange('online')"
				>
					在线用户
				</view>
			</view>

			<view class="online-panel-body">
				<view v-if="loading" class="online-panel-loading">
					<view class="online-panel-loading-spinner"></view>
					<text class="online-panel-loading-text">在线数据加载中...</text>
				</view>
				<template v-else>
					<ContributionRank
						v-show="activeTab === 'contribution'"
						:list="contributionList"
						:my-rank="myRank"
						:user-id="userId"
						@user-item-click="handleUserClick"
					/>
					<OnlineUserList
						v-show="activeTab === 'online'"
						:list="onlineList"
						@user-item-click="handleUserClick"
					/>
				</template>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ContributionRank from '@/components/room/online/ContributionRank.vue'
import OnlineUserList from '@/components/room/online/OnlineUserList.vue'

const PANEL_ANIMATION_DURATION = 300
const PANEL_ENTER_DELAY = 20
const systemInfo = uni.getSystemInfoSync()

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	},
	roomId: {
		type: String,
		default: ''
	},
	anchorId: {
		type: String,
		default: ''
	},
	userId: {
		type: String,
		default: ''
	},
	contributionList: {
		type: Array,
		default: () => []
	},
	onlineList: {
		type: Array,
		default: () => []
	},
	myRank: {
		type: [String, Number],
		default: '99+'
	},
	loading: {
		type: Boolean,
		default: false
	},
	zIndex: {
		type: Number,
		default: 100
	}
})

const emit = defineEmits(['user-click', 'panel-show', 'panel-hide', 'panel-close', 'tab-change'])

const panelMounted = ref(props.modelValue)
const panelVisible = ref(false)
const activeTab = ref('contribution')

let enterTimer = null
let exitTimer = null

// 读取底部安全区，保证面板底部不会被设备手势区遮挡。
const safeBottomPx = computed(() => {
	return systemInfo.safeAreaInsets?.bottom || 0
})

// 统一约束在线面板高度为屏幕一半。
const panelHeightPx = computed(() => {
	return Math.floor((Number(systemInfo.windowHeight) || 667) / 2)
})

// 组合面板高度与底部安全区样式。
const panelStyle = computed(() => {
	return {
		height: `${panelHeightPx.value}px`,
		paddingBottom: `${safeBottomPx.value}px`
	}
})

// 控制在线面板最外层遮罩的 z-index。
const overlayStyle = computed(() => {
	return {
		zIndex: `${props.zIndex}`
	}
})

// 监听开关状态，统一驱动面板挂载、动画和 show/hide 事件。
watch(
	() => props.modelValue,
	(value) => {
		clearTimers()

		if (value) {
			panelMounted.value = true
			emit('panel-show', buildPanelPayload())
			enterTimer = setTimeout(() => {
				panelVisible.value = true
			}, PANEL_ENTER_DELAY)
			return
		}

		panelVisible.value = false
		if (!panelMounted.value) {
			return
		}

		activeTab.value = 'contribution'
		emit('panel-hide', buildPanelPayload())
		exitTimer = setTimeout(() => {
			panelMounted.value = false
		}, PANEL_ANIMATION_DURATION)
	},
	{
		immediate: true
	}
)

// 点击关闭按钮后，通知父组件更新面板开关状态。
function handleClose() {
	emit('panel-close', buildPanelPayload())
}

// 切换排行榜 / 在线用户标签，并把当前 tab 透传给父层。
function handleTabChange(tab) {
	if (activeTab.value === tab) {
		return
	}

	activeTab.value = tab
	emit('tab-change', {
		...buildPanelPayload(),
		tab
	})
}

// 点击列表用户后，把用户信息回传给父组件继续处理。
function handleUserClick(userInfo) {
	emit('user-click', userInfo)
}

// 统一构建在线面板相关事件的基础上下文。
function buildPanelPayload() {
	return {
		roomId: props.roomId,
		anchorId: props.anchorId,
		userId: props.userId
	}
}

// 清理面板进退场动画定时器。
function clearTimers() {
	if (enterTimer) {
		clearTimeout(enterTimer)
		enterTimer = null
	}

	if (exitTimer) {
		clearTimeout(exitTimer)
		exitTimer = null
	}
}

onBeforeUnmount(() => {
	clearTimers()
})
</script>

<style scoped>
.online-panel-overlay {
	position: absolute;
	inset: 0;
	z-index: 999;
	overflow: hidden;
}

.online-panel-mask {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.28);
	opacity: 0;
	transition: opacity 300ms ease;
}

.online-panel {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	padding: 24rpx 24rpx 0;
	border-radius: 32rpx 32rpx 0 0;
	background: #ffffff;
	box-shadow: 0 -16rpx 40rpx rgba(15, 23, 42, 0.14);
	box-sizing: border-box;
	transform: translate3d(0, 100%, 0);
	transition: transform 300ms ease;
}

.online-panel-overlay-enter .online-panel-mask {
	opacity: 1;
}

.online-panel-overlay-enter .online-panel {
	transform: translate3d(0, 0, 0);
}

.online-panel-overlay-leave .online-panel-mask {
	opacity: 0;
}

.online-panel-overlay-leave .online-panel {
	transform: translate3d(0, 100%, 0);
}

.online-panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 18rpx;
}

.online-panel-title {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.online-panel-close {
	padding: 8rpx 0 8rpx 20rpx;
	font-size: 24rpx;
	line-height: 32rpx;
	color: #64748b;
}

.online-panel-tabs {
	display: flex;
	align-items: center;
	height: 72rpx;
	padding: 8rpx;
	border-radius: 999rpx;
	background: rgba(241, 245, 249, 0.96);
}

.online-panel-tab {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	height: 56rpx;
	border-radius: 999rpx;
	font-size: 26rpx;
	font-weight: 500;
	line-height: 34rpx;
	color: #64748b;
}

.online-panel-tab-active {
	background: #ffffff;
	box-shadow: 0 8rpx 20rpx rgba(148, 163, 184, 0.12);
	color: #0f172a;
}

.online-panel-body {
	flex: 1;
	min-height: 0;
	padding: 20rpx 0 0;
}

.online-panel-loading {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.online-panel-loading-spinner {
	width: 44rpx;
	height: 44rpx;
	border: 4rpx solid rgba(148, 163, 184, 0.24);
	border-top-color: rgba(59, 130, 246, 0.9);
	border-radius: 50%;
	animation: online-panel-spin 0.9s linear infinite;
}

.online-panel-loading-text {
	margin-top: 20rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #64748b;
}

@keyframes online-panel-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
