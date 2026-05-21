<template>
	<view v-if="visible" class="shop-filter-sidebar-root">
		<view class="shop-filter-sidebar-mask" @tap="handleClose"></view>

		<view
			class="shop-filter-sidebar-panel"
			:style="panelStyle"
		>
			<view class="shop-filter-sidebar-header" :style="headerStyle">
				<text class="shop-filter-sidebar-title">筛选</text>
				<text class="shop-filter-sidebar-close" @tap="handleClose">关闭</text>
			</view>

			<scroll-view class="shop-filter-sidebar-scroll" scroll-y enable-flex>
				<view class="shop-filter-sidebar-section">
					<text class="shop-filter-sidebar-label">价格区间</text>

					<view class="shop-filter-sidebar-price-row">
						<input
							class="shop-filter-sidebar-input"
							type="digit"
							:value="draftMinPrice"
							placeholder="最低价"
							@input="handleMinPriceInput"
						/>
						<text class="shop-filter-sidebar-split">-</text>
						<input
							class="shop-filter-sidebar-input"
							type="digit"
							:value="draftMaxPrice"
							placeholder="最高价"
							@input="handleMaxPriceInput"
						/>
					</view>
				</view>

				<view class="shop-filter-sidebar-section">
					<view class="shop-filter-sidebar-brand-head">
						<text class="shop-filter-sidebar-label">品牌</text>
						<text class="shop-filter-sidebar-more" @tap="brandExpanded = !brandExpanded">
							{{ brandExpanded ? '收起' : '展开' }}
						</text>
					</view>

					<view class="shop-filter-sidebar-chip-grid">
						<view
							v-for="brand in visibleBrandList"
							:key="brand.id"
							class="shop-filter-sidebar-chip"
							:class="{ 'shop-filter-sidebar-chip--active': selectedBrandIdList.includes(brand.id) }"
							@tap="handleBrandToggle(brand.id)"
						>
							<text class="shop-filter-sidebar-chip-text">{{ brand.name }}</text>
						</view>
					</view>
				</view>

				<view
					v-for="group in specGroupList"
					:key="group.id"
					class="shop-filter-sidebar-section"
				>
					<text class="shop-filter-sidebar-label">{{ group.name }}</text>

					<view class="shop-filter-sidebar-chip-grid">
						<view
							v-for="option in group.options"
							:key="option.id"
							class="shop-filter-sidebar-chip"
							:class="{ 'shop-filter-sidebar-chip--active': selectedSpecMap[group.id] === option.id }"
							@tap="handleSpecOptionSelect(group.id, option.id)"
						>
							<text class="shop-filter-sidebar-chip-text">{{ option.name }}</text>
						</view>
					</view>
				</view>
			</scroll-view>

			<SafeBottomArea
				:fixed="false"
				:gap-rpx="bottomGapRpx"
				top-padding-rpx="24"
				side-padding-rpx="24"
				background="#ffffff"
				border-top="1rpx solid #f1f5f9"
				class="shop-filter-sidebar-footer"
			>
				<view class="shop-filter-sidebar-reset" @tap="handleReset">重置</view>
				<view class="shop-filter-sidebar-confirm" @tap="handleConfirm">确定</view>
			</SafeBottomArea>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import SafeBottomArea from '@/components/common/SafeBottomArea.vue'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	bottomGapRpx: {
		type: Number,
		default: 18
	},
	filterState: {
		type: Object,
		default: () => ({
			minPrice: '',
			maxPrice: '',
			selectedBrandIdList: [],
			selectedSpecMap: {}
		})
	},
	brandList: {
		type: Array,
		default: () => []
	},
	specGroupList: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['close', 'confirm'])
const { safeTopPx } = useSafeAreaMetrics()

const draftMinPrice = ref('')
const draftMaxPrice = ref('')
const selectedBrandIdList = ref([])
const selectedSpecMap = ref({})
const brandExpanded = ref(false)

const visibleBrandList = computed(() => (brandExpanded.value ? props.brandList : props.brandList.slice(0, 6)))
const panelStyle = computed(() => ({
	paddingTop: `${safeTopPx.value}px`
}))
const headerStyle = computed(() => ({
	paddingTop: `${safeTopPx.value ? 8 : 0}px`
}))

watch(
	() => [props.visible, props.filterState],
	() => {
		if (!props.visible) {
			return
		}

		draftMinPrice.value = props.filterState.minPrice || ''
		draftMaxPrice.value = props.filterState.maxPrice || ''
		selectedBrandIdList.value = [...(props.filterState.selectedBrandIdList || [])]
		selectedSpecMap.value = { ...(props.filterState.selectedSpecMap || {}) }
		brandExpanded.value = false
	},
	{
		immediate: true,
		deep: true
	}
)

function handleMinPriceInput(event) {
	draftMinPrice.value = event.detail.value
}

function handleMaxPriceInput(event) {
	draftMaxPrice.value = event.detail.value
}

function handleBrandToggle(brandId) {
	const nextBrandIdList = [...selectedBrandIdList.value]
	const activeIndex = nextBrandIdList.indexOf(brandId)

	if (activeIndex >= 0) {
		nextBrandIdList.splice(activeIndex, 1)
	} else {
		nextBrandIdList.push(brandId)
	}

	selectedBrandIdList.value = nextBrandIdList
}

function handleSpecOptionSelect(groupId, optionId) {
	selectedSpecMap.value = {
		...selectedSpecMap.value,
		[groupId]: selectedSpecMap.value[groupId] === optionId ? '' : optionId
	}
}

function handleReset() {
	draftMinPrice.value = ''
	draftMaxPrice.value = ''
	selectedBrandIdList.value = []
	selectedSpecMap.value = {}
}

function handleConfirm() {
	emit('confirm', {
		minPrice: draftMinPrice.value,
		maxPrice: draftMaxPrice.value,
		selectedBrandIdList: [...selectedBrandIdList.value],
		selectedSpecMap: { ...selectedSpecMap.value }
	})
}

function handleClose() {
	emit('close')
}
</script>

<style scoped>
.shop-filter-sidebar-root {
	position: fixed;
	inset: 0;
	z-index: 60;
}

.shop-filter-sidebar-mask {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.4);
}

.shop-filter-sidebar-panel {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 70%;
	display: flex;
	flex-direction: column;
	background: #ffffff;
	box-shadow: -12rpx 0 36rpx rgba(15, 23, 42, 0.08);
	animation: shop-filter-sidebar-enter 0.18s ease-out;
}

.shop-filter-sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 24rpx 20rpx;
	border-bottom: 1rpx solid #f1f5f9;
}

.shop-filter-sidebar-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #0f172a;
}

.shop-filter-sidebar-close {
	font-size: 24rpx;
	color: #64748b;
}

.shop-filter-sidebar-scroll {
	flex: 1;
	min-height: 0;
	padding: 24rpx;
	box-sizing: border-box;
}

.shop-filter-sidebar-section {
	padding-bottom: 32rpx;
}

.shop-filter-sidebar-label {
	display: block;
	margin-bottom: 20rpx;
	font-size: 26rpx;
	font-weight: 600;
	color: #0f172a;
}

.shop-filter-sidebar-price-row {
	display: flex;
	align-items: center;
}

.shop-filter-sidebar-input {
	flex: 1;
	height: 72rpx;
	padding: 0 20rpx;
	border-radius: 24rpx;
	background: #f8fafc;
	font-size: 24rpx;
	color: #0f172a;
}

.shop-filter-sidebar-split {
	padding: 0 16rpx;
	font-size: 24rpx;
	color: #94a3b8;
}

.shop-filter-sidebar-brand-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.shop-filter-sidebar-more {
	font-size: 22rpx;
	color: #64748b;
}

.shop-filter-sidebar-chip-grid {
	display: flex;
	flex-wrap: wrap;
	margin-right: -16rpx;
	margin-bottom: -16rpx;
}

.shop-filter-sidebar-chip {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: calc(50% - 16rpx);
	height: 72rpx;
	margin-right: 16rpx;
	margin-bottom: 16rpx;
	padding: 0 20rpx;
	border-radius: 24rpx;
	background: #f8fafc;
	box-sizing: border-box;
}

.shop-filter-sidebar-chip--active {
	background: rgba(239, 68, 68, 0.08);
}

.shop-filter-sidebar-chip-text {
	font-size: 24rpx;
	color: #475569;
}

.shop-filter-sidebar-chip--active .shop-filter-sidebar-chip-text {
	color: #ef4444;
	font-weight: 600;
}

.shop-filter-sidebar-footer {
	display: flex;
	align-items: center;
}

.shop-filter-sidebar-reset,
.shop-filter-sidebar-confirm {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 84rpx;
	border-radius: 24rpx;
	font-size: 28rpx;
	font-weight: 600;
}

.shop-filter-sidebar-reset {
	flex: 1;
	margin-right: 16rpx;
	background: #f8fafc;
	color: #0f172a;
}

.shop-filter-sidebar-confirm {
	flex: 1.2;
	background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
	color: #ffffff;
}

@keyframes shop-filter-sidebar-enter {
	from {
		transform: translateX(100%);
	}

	to {
		transform: translateX(0);
	}
}
</style>
