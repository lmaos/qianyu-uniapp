<template>
	<view
		v-if="cardMounted"
		:class="['user-info-card-overlay', cardVisible ? 'user-info-card-overlay-enter' : 'user-info-card-overlay-leave']"
		:style="overlayStyle"
	>
		<view class="user-info-card-mask" @tap="hideCard"></view>
		<view class="user-info-card-sheet" :style="sheetStyle" @tap="hideCard">
			<view class="user-info-card-profile" @tap.stop="handleProfileTap">
				<view class="user-info-card-avatar" :style="avatarStyle">
					<text v-if="avatarText" class="user-info-card-avatar-text">{{ avatarText }}</text>
				</view>

				<view class="user-info-card-meta">
					<view class="user-info-card-name-row">
						<text class="user-info-card-name">{{ currentUser.nickname }}</text>
						<text v-if="currentUser.vipLevel > 0" class="user-info-card-vip">VIP{{ currentUser.vipLevel }}</text>
					</view>
					<text class="user-info-card-id">用户ID：{{ currentUser.userId }}</text>
					<text class="user-info-card-tip">点击头像和资料区域进入独立资料页</text>
				</view>
			</view>

			<view class="user-info-card-follow" @tap.stop="handleFollowTap">
				{{ followButtonText }}
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const CARD_ENTER_DELAY = 20
const CARD_ANIMATION_DURATION = 300
const systemInfo = uni.getSystemInfoSync()

const props = defineProps({
	zIndex: {
		type: Number,
		default: 100
	}
})

const emit = defineEmits(['card-show', 'card-hide', 'follow-click', 'detail-open'])

const cardMounted = ref(false)
const cardVisible = ref(false)
const currentUser = ref(buildDefaultUser())

let enterTimer = null
let exitTimer = null

// 读取底部安全区，给弹层底部留出设备适配空间。
const safeBottomPx = computed(() => {
	return systemInfo.safeAreaInsets?.bottom || 0
})

// 控制整张卡片遮罩层的层级。
const overlayStyle = computed(() => {
	return {
		zIndex: `${props.zIndex}`
	}
})

// 为底部弹层补齐安全区内边距。
const sheetStyle = computed(() => {
	return {
		paddingBottom: `${safeBottomPx.value + 24}px`
	}
})

// 头像支持渐变色和图片两种展示方式，这里统一转成样式对象。
const avatarStyle = computed(() => {
	const avatarValue = `${currentUser.value.avatar || ''}`.trim()

	if (!avatarValue) {
		return {
			background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.94) 0%, rgba(249, 115, 22, 0.94) 100%)'
		}
	}

	if (avatarValue.includes('gradient(')) {
		return {
			background: avatarValue
		}
	}

	return {
		backgroundImage: `url(${avatarValue})`,
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover'
	}
})

// 没有图片头像时，回退成昵称首字母。
const avatarText = computed(() => {
	if (`${currentUser.value.avatar || ''}`.trim() && !`${currentUser.value.avatar || ''}`.includes('gradient(')) {
		return ''
	}

	return `${currentUser.value.nickname || '用户'}`.slice(0, 1)
})

// 根据关注状态切换按钮文案。
const followButtonText = computed(() => {
	return currentUser.value.isFollowed ? '已关注' : '关注'
})

// 对外展示用户卡片，并刷新当前展示用户数据。
function showUserCard(userInfo = {}) {
	clearTimers()
	currentUser.value = normalizeUser(userInfo)
	cardMounted.value = true
	emit('card-show', {
		...currentUser.value
	})
	enterTimer = setTimeout(() => {
		cardVisible.value = true
	}, CARD_ENTER_DELAY)
}

// 关闭用户卡片，并等待退场动画结束后再卸载节点。
function hideCard() {
	if (!cardMounted.value) {
		return
	}

	clearTimers()
	cardVisible.value = false
	emit('card-hide', {
		...currentUser.value
	})
	exitTimer = setTimeout(() => {
		cardMounted.value = false
	}, CARD_ANIMATION_DURATION)
}

// 切换关注状态，并把最新用户数据抛给父组件。
function handleFollowTap() {
	currentUser.value = {
		...currentUser.value,
		isFollowed: !currentUser.value.isFollowed
	}

	emit('follow-click', {
		...currentUser.value
	})
}

// 点击资料区后先通知父层，再跳转到资料页占位页。
function handleProfileTap() {
	const payload = {
		...currentUser.value
	}

	emit('detail-open', payload)
	hideCard()

	const query = [
		`userId=${encodeURIComponent(payload.userId)}`,
		`nickname=${encodeURIComponent(payload.nickname)}`,
		`avatar=${encodeURIComponent(payload.avatar)}`,
		`vipLevel=${encodeURIComponent(payload.vipLevel)}`,
		`isFollowed=${payload.isFollowed ? '1' : '0'}`
	].join('&')

	setTimeout(() => {
		uni.navigateTo({
			url: `/pages/user-profile/user-profile?${query}`
		})
	}, 120)
	// TODO：替换进入用户资料页前的业务校验逻辑
}

// 统一规整外部传入的用户数据，避免字段缺失。
function normalizeUser(userInfo = {}) {
	return {
		userId: `${userInfo.userId || ''}`.trim() || 'user-unknown',
		nickname: `${userInfo.nickname || ''}`.trim() || '用户',
		avatar: `${userInfo.avatar || userInfo.avatarBackground || ''}`.trim(),
		vipLevel: normalizeVipLevel(userInfo.vipLevel),
		isFollowed: Boolean(userInfo.isFollowed)
	}
}

// 对 VIP 等级做安全兜底和范围限制。
function normalizeVipLevel(value) {
	const vipLevel = Number(value) || 0
	return vipLevel > 0 ? Math.min(Math.floor(vipLevel), 10) : 0
}

// 生成卡片初始默认用户。
function buildDefaultUser() {
	return {
		userId: 'user-unknown',
		nickname: '用户',
		avatar: '',
		vipLevel: 0,
		isFollowed: false
	}
}

// 清理进场/退场动画定时器，避免重复 show/hide 时状态错乱。
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

defineExpose({
	showUserCard,
	hideCard,
	isVisible: () => cardMounted.value
})
</script>

<style scoped>
.user-info-card-overlay {
	position: absolute;
	inset: 0;
	overflow: hidden;
}

.user-info-card-mask {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.16);
	opacity: 0;
	transition: opacity 300ms ease;
}

.user-info-card-sheet {
	position: absolute;
	left: 24rpx;
	right: 24rpx;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 26rpx 26rpx 24rpx;
	border-radius: 32rpx 32rpx 0 0;
	background: #ffffff;
	box-shadow: 0 -12rpx 40rpx rgba(15, 23, 42, 0.16);
	transform: translate3d(0, 100%, 0);
	transition: transform 300ms ease;
	box-sizing: border-box;
}

.user-info-card-overlay-enter .user-info-card-mask {
	opacity: 1;
}

.user-info-card-overlay-enter .user-info-card-sheet {
	transform: translate3d(0, 0, 0);
}

.user-info-card-overlay-leave .user-info-card-mask {
	opacity: 0;
}

.user-info-card-overlay-leave .user-info-card-sheet {
	transform: translate3d(0, 100%, 0);
}

.user-info-card-profile {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	padding-right: 24rpx;
}

.user-info-card-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 108rpx;
	height: 108rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.user-info-card-avatar-text {
	font-size: 40rpx;
	font-weight: 700;
	line-height: 1;
	color: #ffffff;
}

.user-info-card-meta {
	display: flex;
	flex-direction: column;
	min-width: 0;
	margin-left: 22rpx;
}

.user-info-card-name-row {
	display: flex;
	align-items: center;
	min-width: 0;
}

.user-info-card-name {
	max-width: 300rpx;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-info-card-vip {
	margin-left: 12rpx;
	padding: 4rpx 12rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
	font-size: 20rpx;
	font-weight: 600;
	line-height: 28rpx;
	color: #ffffff;
	flex-shrink: 0;
}

.user-info-card-id,
.user-info-card-tip {
	font-size: 22rpx;
	line-height: 32rpx;
	color: #64748b;
}

.user-info-card-id {
	margin-top: 10rpx;
}

.user-info-card-tip {
	margin-top: 6rpx;
}

.user-info-card-follow {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 132rpx;
	height: 72rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #ffffff;
	flex-shrink: 0;
}
</style>
