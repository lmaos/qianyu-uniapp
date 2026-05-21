<template>
	<view
		v-if="panelMounted"
		:class="['gift-panel-overlay', panelVisible ? 'gift-panel-overlay-enter' : 'gift-panel-overlay-leave']"
		:style="overlayStyle"
	>
		<view class="gift-panel-mask" @tap="handleMaskTap"></view>
		<view class="gift-panel" @tap="handlePanelBodyTap">
			<view class="gift-panel-header">
				<view class="gift-panel-categories">
					<view
						v-for="item in giftCategoryOptions"
						:key="item.value"
						:class="[
							'gift-panel-category',
							activeCategory === item.value ? 'gift-panel-category-active' : ''
						]"
						@tap.stop="handleCategoryChange(item.value)"
					>
						{{ item.label }}
					</view>
				</view>
				<view class="gift-panel-balance">
					<view class="gift-panel-balance-icon">
						<text class="gift-panel-balance-icon-text">币</text>
					</view>
					<text class="gift-panel-balance-text">{{ coinBalanceText }}</text>
				</view>
			</view>

			<view v-if="giftLoading" class="gift-loading-state">
				<view class="gift-loading-spinner"></view>
				<text class="gift-loading-text">礼物数据加载中...</text>
			</view>

			<scroll-view v-else class="gift-list-scroll" scroll-y show-scrollbar="false">
				<view class="gift-grid">
					<view
						v-for="item in giftList"
						:key="item.id"
						class="gift-grid-item"
						@tap.stop="handleGiftSelect(item)"
					>
						<GiftItem
							:gift-info="item"
							:is-selected="selectedGiftId === item.id"
						/>
					</view>
				</view>
			</scroll-view>

			<view class="gift-panel-footer">
				<view class="gift-selected-info">
					<text class="gift-selected-name">{{ selectedGift ? selectedGift.name : '请选择礼物' }}</text>
					<text class="gift-selected-desc">
						{{ selectedGift ? selectedGift.desc : '选择后可赠送给主播' }}
					</text>
				</view>

				<view class="gift-send-area">
					<view
						v-if="quantitySelectorVisible && canOperateSelectedGift"
						class="gift-quantity-popover"
					>
						<scroll-view
							class="gift-quantity-scroll"
							scroll-x
							show-scrollbar="false"
						>
							<view class="gift-quantity-list">
								<view
									v-for="quantity in quickQuantityOptions"
									:key="quantity"
									class="gift-quantity-item"
									@tap.stop="handleQuickSend(quantity)"
								>
									x{{ quantity }}
								</view>
							</view>
						</scroll-view>
					</view>

					<view class="gift-send-button-anchor">
						<view
							:class="[
								'gift-send-button',
								comboButtonActive ? 'gift-send-button-combo' : '',
								!canOperateSelectedGift ? 'gift-send-button-disabled' : ''
							]"
							@tap.stop="handleSendButtonTap"
							@longpress.stop="handleSendButtonLongPress"
						>
							<template v-if="comboButtonActive">
								<text class="gift-send-button-main">继续赠送</text>
								<text class="gift-send-button-sub">x1 · 已送 {{ comboDisplayCount }}</text>
							</template>
							<template v-else>
								{{ sendButtonText }}
							</template>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import GiftItem from '@/components/room/gift/GiftItem.vue'

const PANEL_ENTER_DELAY = 20
const PANEL_EXIT_DURATION = 160

const GIFT_CATEGORY_OPTIONS = [
	{ label: '推荐', value: 'recommend' },
	{ label: '专属', value: 'exclusive' },
	{ label: '活动', value: 'activity' },
	{ label: '玩法', value: 'gameplay' }
]

const QUICK_QUANTITY_OPTIONS = [2, 6, 10, 66, 99]

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	},
	giftGroups: {
		type: Object,
		default: () => ({})
	},
	coinBalance: {
		type: [Number, String],
		default: 0
	},
	loading: {
		type: Boolean,
		default: false
	},
	comboDuration: {
		type: Number,
		default: 2
	},
	zIndex: {
		type: Number,
		default: 80
	}
})

const emit = defineEmits([
	'panel-show',
	'panel-hide',
	'panel-close',
	'category-change',
	'gift-select',
	'send-gift',
	'send-success',
	'send-fail'
])

const activeCategory = ref('recommend')
const selectedGiftId = ref('')
const panelMounted = ref(props.modelValue)
const panelVisible = ref(false)
const quantitySelectorVisible = ref(false)
const comboButtonActive = ref(false)
const pendingSummary = ref(null)

let enterTimer = null
let exitTimer = null
let comboFinalizeTimer = null

const giftCategoryOptions = GIFT_CATEGORY_OPTIONS
const quickQuantityOptions = QUICK_QUANTITY_OPTIONS

// 统一透传父层 loading 状态，便于模板里直接使用。
const giftLoading = computed(() => {
	return props.loading
})

// 控制礼物面板遮罩层级。
const overlayStyle = computed(() => {
	return {
		zIndex: `${props.zIndex}`
	}
})

// 根据当前分类拿到需要渲染的礼物列表。
const giftList = computed(() => {
	return props.giftGroups[activeCategory.value] || []
})

// 当前选中的礼物对象。
const selectedGift = computed(() => {
	return giftList.value.find((item) => item.id === selectedGiftId.value) || null
})

// 格式化金币余额文案。
const coinBalanceText = computed(() => {
	return formatCoinCount(props.coinBalance)
})

// 连击时长统一转成安全的整数秒。
const normalizedComboDuration = computed(() => {
	const duration = Number(props.comboDuration)
	if (!Number.isFinite(duration) || duration < 0) {
		return 0
	}

	return Math.floor(duration)
})

// 连击可用时间窗口，单位毫秒。
const comboWindowMs = computed(() => {
	return normalizedComboDuration.value * 1000
})

// 当前是否允许对选中礼物继续操作。
const canOperateSelectedGift = computed(() => {
	return !giftLoading.value && !!selectedGift.value
})

// 连击态下显示的累计赠送数量。
const comboDisplayCount = computed(() => {
	return pendingSummary.value?.totalGiftNum || 0
})

// 赠送按钮根据当前状态显示不同文案。
const sendButtonText = computed(() => {
	if (giftLoading.value) {
		return '加载中...'
	}

	if (!selectedGift.value) {
		return '请选择礼物'
	}

	return '赠送'
})

// 礼物数据源变化时，自动修正当前选中礼物。
watch(
	() => props.giftGroups,
	() => {
		syncSelectedGift()
	},
	{
		deep: true,
		immediate: true
	}
)

// 根据面板显隐状态统一处理进退场动画和对外事件。
watch(
	() => props.modelValue,
	(value) => {
		clearPanelAnimationTimers()

		if (value) {
			panelMounted.value = true
			syncSelectedGift()
			emit('panel-show')
			enterTimer = setTimeout(() => {
				panelVisible.value = true
			}, PANEL_ENTER_DELAY)
			return
		}

		finalizeComboSession()
		panelVisible.value = false

		if (!panelMounted.value) {
			return
		}

		emit('panel-hide')
		exitTimer = setTimeout(() => {
			panelMounted.value = false
		}, PANEL_EXIT_DURATION)
	},
	{
		immediate: true
	}
)

onBeforeUnmount(() => {
	finalizeComboSession()
	clearPanelAnimationTimers()
	clearComboFinalizeTimer()
})

function formatCoinCount(value) {
	const numberValue = Number(value) || 0
	return `${numberValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 选择某个礼物时，重置连击态并向父层抛出当前礼物信息。
function handleGiftSelect(item) {
	if (giftLoading.value) {
		return
	}

	finalizeComboSession()
	quantitySelectorVisible.value = false
	selectedGiftId.value = item.id
	emit('gift-select', {
		...item,
		category: activeCategory.value
	})
}

// 切换礼物分类，同时修正该分类下的选中礼物。
function handleCategoryChange(category) {
	if (giftLoading.value || activeCategory.value === category) {
		return
	}

	finalizeComboSession()
	activeCategory.value = category
	syncSelectedGift()
	emit('category-change', {
		category
	})
}

// 保证当前分类和选中礼物始终落在可用礼物列表内。
function syncSelectedGift() {
	const nextCategory = findAvailableCategory(activeCategory.value)
	activeCategory.value = nextCategory
	const currentList = props.giftGroups[activeCategory.value] || []

	if (currentList.some((item) => item.id === selectedGiftId.value)) {
		return
	}

	selectedGiftId.value = currentList[0]?.id || ''
}

// 找到一个实际可用的礼物分类，避免切到空分类。
function findAvailableCategory(preferredCategory) {
	if ((props.giftGroups[preferredCategory] || []).length) {
		return preferredCategory
	}

	const availableCategory = giftCategoryOptions.find((item) => {
		return (props.giftGroups[item.value] || []).length
	})

	return availableCategory?.value || preferredCategory
}

// 根据礼物 ID 反查礼物所在分类，并同步当前选中状态。
function syncSelectionByGiftId(giftId) {
	const giftLocation = findGiftById(giftId)
	if (!giftLocation) {
		return null
	}

	activeCategory.value = giftLocation.category
	selectedGiftId.value = giftLocation.gift.id
	return giftLocation
}

// 点击遮罩时关闭面板并收尾当前连击。
function handleMaskTap() {
	finalizeComboSession()
	emit('panel-close')
}

// 点击面板主体空白区域时，收起数量选择器和连击状态。
function handlePanelBodyTap() {
	if (!quantitySelectorVisible.value && !comboButtonActive.value && !pendingSummary.value) {
		return
	}

	finalizeComboSession()
}

// 长按赠送按钮时，展开快捷数量选择器。
function handleSendButtonLongPress() {
	if (!canOperateSelectedGift.value) {
		return
	}

	quantitySelectorVisible.value = true
}

// 使用快捷数量直接赠送礼物。
async function handleQuickSend(quantity) {
	await sendGift({
		giftId: selectedGiftId.value,
		giftNum: quantity
	})
}

// 点击赠送按钮时，按默认数量 1 发起赠送。
async function handleSendButtonTap() {
	if (!selectedGift.value) {
		return
	}

	await sendGift({
		giftId: selectedGiftId.value,
		giftNum: 1
	})
}

// 礼物面板统一送礼入口，负责校验礼物、余额和连击状态。
async function sendGift(request = {}) {
	const targetGiftId = request.giftId || selectedGiftId.value
	const giftLocation = syncSelectionByGiftId(targetGiftId)
	if (!giftLocation) {
		emitFail('礼物不存在')
		return false
	}

	const giftNum = normalizeGiftCount(request.giftNum)
	const totalPrice = Number(giftLocation.gift.price) * giftNum
	if ((Number(props.coinBalance) || 0) < totalPrice) {
		emitFail('金币余额不足', giftLocation.gift)
		return false
	}

	finalizeComboSessionIfNeeded(giftLocation.gift.id)
	quantitySelectorVisible.value = false
	comboButtonActive.value = comboWindowMs.value > 0

	registerSendSuccess({
		gift: giftLocation.gift,
		category: giftLocation.category,
		giftNum
	})

	return true
}

// 记录一次送礼成功，并进入连击汇总逻辑。
function registerSendSuccess({ gift, category, giftNum }) {
	if (!pendingSummary.value) {
		pendingSummary.value = {
			gift,
			category,
			totalGiftNum: 0
		}
	}

	pendingSummary.value.totalGiftNum += giftNum
	pendingSummary.value.gift = gift
	pendingSummary.value.category = category

	emit('send-gift', {
		...gift,
		category,
		giftId: gift.id,
		giftNum,
		comboGiftNum: pendingSummary.value.totalGiftNum
	})

	if (comboWindowMs.value <= 0) {
		finalizeComboSession()
		return
	}

	armComboFinalizeTimer()
}

// 如果下一次送礼切换了礼物，则先把旧连击会话结算掉。
function finalizeComboSessionIfNeeded(nextGiftId) {
	if (!pendingSummary.value) {
		return
	}

	if (pendingSummary.value.gift.id !== nextGiftId) {
		finalizeComboSession()
	}
}

// 结束当前连击会话，并把合并后的送礼结果抛给父组件。
function finalizeComboSession() {
	clearComboFinalizeTimer()

	if (pendingSummary.value?.gift) {
		emit('send-success', {
			...pendingSummary.value.gift,
			category: pendingSummary.value.category,
			giftId: pendingSummary.value.gift.id,
			giftNum: pendingSummary.value.totalGiftNum,
			comboGiftNum: pendingSummary.value.totalGiftNum
		})
	}

	pendingSummary.value = null
	comboButtonActive.value = false
	quantitySelectorVisible.value = false
}

// 重新启动连击自动结算定时器。
function armComboFinalizeTimer() {
	clearComboFinalizeTimer()
	comboFinalizeTimer = setTimeout(() => {
		finalizeComboSession()
	}, comboWindowMs.value)
}

// 清理连击自动结算定时器。
function clearComboFinalizeTimer() {
	if (comboFinalizeTimer) {
		clearTimeout(comboFinalizeTimer)
		comboFinalizeTimer = null
	}
}

// 根据礼物 ID 在所有分类里查找对应礼物。
function findGiftById(giftId) {
	const targetId = `${giftId || ''}`.trim()
	if (!targetId) {
		return null
	}

	for (const category of Object.keys(props.giftGroups)) {
		const gift = (props.giftGroups[category] || []).find((item) => item.id === targetId)
		if (gift) {
			return {
				category,
				gift
			}
		}
	}

	return null
}

// 统一抛出送礼失败事件，并修正连击按钮状态。
function emitFail(message, gift = null) {
	quantitySelectorVisible.value = false

	if (pendingSummary.value && comboWindowMs.value > 0) {
		comboButtonActive.value = true
		armComboFinalizeTimer()
	} else if (!pendingSummary.value) {
		comboButtonActive.value = false
		clearComboFinalizeTimer()
	}

	emit('send-fail', {
		message,
		giftInfo: gift
			? {
				...gift
			}
			: null
	})
}

// 对礼物数量做安全兜底，避免传入非法值。
function normalizeGiftCount(value) {
	const giftNum = Number(value) || 1
	return giftNum > 0 ? Math.floor(giftNum) : 1
}

// 清理面板进退场动画定时器。
function clearPanelAnimationTimers() {
	if (enterTimer) {
		clearTimeout(enterTimer)
		enterTimer = null
	}

	if (exitTimer) {
		clearTimeout(exitTimer)
		exitTimer = null
	}
}

// 暴露送礼方法给直播间父组件，便于小心心等外部入口复用。
defineExpose({
	sendGift
})
</script>

<style scoped>
.gift-panel-overlay {
	position: absolute;
	inset: 0;
	z-index: 40;
	overflow: hidden;
}

.gift-panel-mask {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.34);
	opacity: 0;
	transition: opacity 240ms ease;
}

.gift-panel {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(840rpx + env(safe-area-inset-bottom));
	padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
	border-radius: 32rpx 32rpx 0 0;
	background: rgba(12, 12, 12, 0.96);
	border-top: 1rpx solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 -18rpx 48rpx rgba(0, 0, 0, 0.32);
	box-sizing: border-box;
	transform: translate3d(0, 100%, 0);
	opacity: 0.98;
	will-change: transform, opacity;
	transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease;
}

.gift-panel-overlay-enter .gift-panel-mask {
	opacity: 1;
}

.gift-panel-overlay-enter .gift-panel {
	transform: translate3d(0, 0, 0);
	opacity: 1;
}

.gift-panel-overlay-leave .gift-panel-mask {
	opacity: 0;
	transition-duration: 140ms;
}

.gift-panel-overlay-leave .gift-panel {
	transform: translate3d(0, 100%, 0);
	opacity: 0.98;
	transition-duration: 160ms;
	transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}

.gift-panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.gift-panel-categories {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.gift-panel-category {
	position: relative;
	margin-right: 40rpx;
	padding: 8rpx 0 12rpx;
	font-size: 28rpx;
	line-height: 36rpx;
	color: rgba(255, 255, 255, 0.52);
	white-space: nowrap;
}

.gift-panel-category-active {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
}

.gift-panel-category-active::after {
	content: '';
	position: absolute;
	left: 50%;
	bottom: 0;
	width: 34rpx;
	height: 6rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #ff7a45 100%);
	transform: translateX(-50%);
}

.gift-panel-balance {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 18rpx 10rpx 12rpx;
	border-radius: 999rpx;
	background: rgba(255, 214, 10, 0.12);
	border: 1rpx solid rgba(255, 221, 87, 0.26);
	box-shadow: inset 0 0 18rpx rgba(255, 225, 125, 0.08);
}

.gift-panel-balance-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36rpx;
	height: 36rpx;
	margin-right: 10rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #ffe16a 0%, #ffb800 100%);
	box-shadow: 0 8rpx 16rpx rgba(255, 184, 0, 0.24);
}

.gift-panel-balance-icon-text {
	font-size: 20rpx;
	font-weight: 700;
	line-height: 1;
	color: #8c5a00;
}

.gift-panel-balance-text {
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #ffe38a;
}

.gift-loading-state {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.gift-loading-spinner {
	width: 40rpx;
	height: 40rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.14);
	border-top-color: rgba(255, 255, 255, 0.82);
	border-radius: 50%;
	animation: gift-panel-spin 0.9s linear infinite;
}

.gift-loading-text {
	margin-top: 18rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: rgba(255, 255, 255, 0.58);
}

.gift-list-scroll {
	flex: none;
	height: 552rpx;
	margin-top: 28rpx;
}

.gift-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	grid-column-gap: 24rpx;
	grid-row-gap: 24rpx;
	padding-bottom: 12rpx;
}

.gift-grid-item {
	width: 100%;
}

.gift-panel-footer {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	margin-top: 24rpx;
}

.gift-selected-info {
	display: flex;
	flex: 1;
	flex-direction: column;
	min-width: 0;
	padding-right: 24rpx;
}

.gift-selected-name {
	font-size: 28rpx;
	font-weight: 600;
	line-height: 38rpx;
	color: #ffffff;
}

.gift-selected-desc {
	margin-top: 6rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: rgba(255, 255, 255, 0.52);
}

.gift-send-area {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	flex-shrink: 0;
}

.gift-quantity-popover {
	position: absolute;
	right: 0;
	bottom: 124rpx;
	width: 360rpx;
	padding: 14rpx 0;
	border-radius: 999rpx;
	background: rgba(25, 25, 25, 0.96);
	border: 1rpx solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 16rpx 36rpx rgba(0, 0, 0, 0.34);
}

.gift-quantity-scroll {
	width: 100%;
	white-space: nowrap;
}

.gift-quantity-list {
	display: inline-flex;
	align-items: center;
	padding: 0 14rpx;
}

.gift-quantity-item {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 56rpx;
	padding: 0 20rpx;
	margin-right: 12rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.08);
	font-size: 24rpx;
	font-weight: 600;
	line-height: 32rpx;
	color: #ffffff;
}

.gift-quantity-item:last-child {
	margin-right: 0;
}

.gift-send-button-anchor {
	position: relative;
	height: 92rpx;
	display: flex;
	align-items: center;
}

.gift-send-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 164rpx;
	height: 72rpx;
	padding: 0 32rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(254, 44, 85, 0.96) 0%, rgba(255, 122, 69, 0.94) 100%);
	box-shadow: 0 14rpx 28rpx rgba(254, 44, 85, 0.28);
	font-size: 28rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #ffffff;
	transform-origin: right bottom;
	transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.gift-send-button-combo {
	min-width: 212rpx;
	height: 92rpx;
	padding: 0 36rpx;
	border-radius: 999rpx;
	transform: translate3d(0, -12rpx, 0) scale(1.02);
	box-shadow: 0 22rpx 40rpx rgba(254, 44, 85, 0.34);
}

.gift-send-button-disabled {
	opacity: 0.5;
	box-shadow: none;
}

.gift-send-button-main {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	line-height: 34rpx;
}

.gift-send-button-sub {
	display: block;
	margin-left: 12rpx;
	font-size: 20rpx;
	line-height: 26rpx;
	color: rgba(255, 255, 255, 0.78);
}

@keyframes gift-panel-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

/* #ifdef H5 */
.gift-list-scroll::-webkit-scrollbar,
.gift-quantity-scroll::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}
/* #endif */
</style>
