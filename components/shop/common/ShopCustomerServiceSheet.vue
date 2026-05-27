<template>
	<view v-if="visible" class="shop-customer-service-sheet">
		<view class="shop-customer-service-sheet-mask" @tap="emit('close')"></view>

		<view class="shop-customer-service-sheet-panel">
			<view class="shop-customer-service-sheet-handle"></view>
			<view class="shop-customer-service-sheet-close" @tap="emit('close')">×</view>

			<text class="shop-customer-service-sheet-title">{{ sheetData.title || '客服中心' }}</text>
			<text v-if="sheetData.desc" class="shop-customer-service-sheet-desc">{{ sheetData.desc }}</text>

			<view v-if="sheetData.contextSummary" class="shop-customer-service-sheet-context">
				<text class="shop-customer-service-sheet-context-label">当前上下文</text>
				<text class="shop-customer-service-sheet-context-value">{{ sheetData.contextSummary }}</text>
			</view>

			<view v-if="sheetData.questionList?.length" class="shop-customer-service-sheet-section">
				<text class="shop-customer-service-sheet-section-title">快捷提问</text>
				<view class="shop-customer-service-sheet-question-list">
					<view
						v-for="item in sheetData.questionList"
						:key="item"
						class="shop-customer-service-sheet-question"
						@tap="emit('question-click', item)"
					>
						{{ item }}
					</view>
				</view>
			</view>

			<view v-if="sheetData.menuList?.length" class="shop-customer-service-sheet-section">
				<text class="shop-customer-service-sheet-section-title">常用服务</text>
				<view class="shop-customer-service-sheet-menu-list">
					<view
						v-for="item in sheetData.menuList"
						:key="item.key"
						class="shop-customer-service-sheet-menu-item"
						@tap="emit('menu-click', item)"
					>
						<view class="shop-customer-service-sheet-menu-main">
							<text class="shop-customer-service-sheet-menu-label">{{ item.label }}</text>
							<text class="shop-customer-service-sheet-menu-desc">{{ item.desc }}</text>
						</view>
						<text class="shop-customer-service-sheet-menu-arrow">›</text>
					</view>
				</view>
			</view>

			<view v-if="sheetData.faqText" class="shop-customer-service-sheet-faq">
				{{ sheetData.faqText }}
			</view>

			<SafeBottomArea
				:fixed="false"
				:top-padding-rpx="18"
				:gap-rpx="20"
				background="#ffffff"
				class="shop-customer-service-sheet-footer"
			>
				<view class="shop-customer-service-sheet-action-row">
					<view class="shop-customer-service-sheet-action shop-customer-service-sheet-action-light" @tap="emit('secondary')">
						{{ sheetData.secondaryText || '问题反馈' }}
					</view>
					<view class="shop-customer-service-sheet-action" @tap="emit('primary')">
						{{ sheetData.primaryText || '开始咨询' }}
					</view>
				</view>
			</SafeBottomArea>
		</view>
	</view>
</template>

<script setup>
import SafeBottomArea from '@/components/common/SafeBottomArea.vue'

defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	sheetData: {
		type: Object,
		default: () => ({})
	}
})

const emit = defineEmits(['close', 'question-click', 'menu-click', 'primary', 'secondary'])
</script>

<style scoped>
.shop-customer-service-sheet {
	position: fixed;
	inset: 0;
	z-index: 80;
}

.shop-customer-service-sheet-mask {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.36);
	backdrop-filter: blur(8rpx);
	-webkit-backdrop-filter: blur(8rpx);
}

.shop-customer-service-sheet-panel {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	padding: 22rpx 24rpx 0;
	border-radius: 36rpx 36rpx 0 0;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 251, 1) 100%);
	box-shadow: 0 -18rpx 40rpx rgba(148, 163, 184, 0.16);
}

.shop-customer-service-sheet-handle {
	width: 88rpx;
	height: 8rpx;
	margin: 0 auto 20rpx;
	border-radius: 999rpx;
	background: rgba(148, 163, 184, 0.26);
}

.shop-customer-service-sheet-close {
	position: absolute;
	top: 20rpx;
	right: 24rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 999rpx;
	background: rgba(15, 23, 42, 0.06);
	font-size: 30rpx;
	line-height: 56rpx;
	color: #475467;
	text-align: center;
}

.shop-customer-service-sheet-title,
.shop-customer-service-sheet-desc,
.shop-customer-service-sheet-context-label,
.shop-customer-service-sheet-context-value,
.shop-customer-service-sheet-section-title,
.shop-customer-service-sheet-menu-label,
.shop-customer-service-sheet-menu-desc {
	display: block;
}

.shop-customer-service-sheet-title {
	font-size: 32rpx;
	font-weight: 700;
	line-height: 42rpx;
	color: #0f172a;
}

.shop-customer-service-sheet-desc {
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #64748b;
}

.shop-customer-service-sheet-context {
	margin-top: 22rpx;
	padding: 22rpx 20rpx;
	border-radius: 24rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.12) 0%, rgba(214, 228, 255, 0.18) 100%);
}

.shop-customer-service-sheet-context-label {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #667085;
}

.shop-customer-service-sheet-context-value {
	margin-top: 8rpx;
	font-size: 26rpx;
	font-weight: 600;
	line-height: 36rpx;
	color: #111827;
}

.shop-customer-service-sheet-section {
	margin-top: 24rpx;
}

.shop-customer-service-sheet-section-title {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.shop-customer-service-sheet-question-list {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	margin-top: 16rpx;
}

.shop-customer-service-sheet-question {
	padding: 16rpx 22rpx;
	border-radius: 999rpx;
	background: rgba(248, 250, 252, 0.96);
	font-size: 24rpx;
	line-height: 32rpx;
	color: #475467;
}

.shop-customer-service-sheet-menu-list {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
	margin-top: 16rpx;
}

.shop-customer-service-sheet-menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 22rpx 20rpx;
	border-radius: 24rpx;
	background: rgba(248, 250, 252, 0.94);
}

.shop-customer-service-sheet-menu-main {
	flex: 1;
	min-width: 0;
}

.shop-customer-service-sheet-menu-label {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.shop-customer-service-sheet-menu-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #64748b;
}

.shop-customer-service-sheet-menu-arrow {
	margin-left: 20rpx;
	font-size: 30rpx;
	line-height: 32rpx;
	color: #98a2b3;
}

.shop-customer-service-sheet-faq {
	margin-top: 22rpx;
	padding: 20rpx;
	border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.76);
	font-size: 22rpx;
	line-height: 34rpx;
	color: #64748b;
}

.shop-customer-service-sheet-action-row {
	display: flex;
	gap: 16rpx;
}

.shop-customer-service-sheet-action {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	height: 84rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
	font-size: 26rpx;
	font-weight: 600;
	color: #ffffff;
}

.shop-customer-service-sheet-action-light {
	background: rgba(248, 250, 252, 0.96);
	color: #475467;
}
</style>
