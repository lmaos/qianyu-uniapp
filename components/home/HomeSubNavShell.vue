<template>
	<view class="sub-nav-shell" :style="shellStyle">
		<view
			:class="[
				'sub-nav-panel',
				lightTheme ? 'sub-nav-panel-light' : '',
				hasExtraNav ? 'sub-nav-panel-with-extra' : 'sub-nav-panel-compact'
			]"
			:style="panelStyle"
		>
			<view
				v-if="refreshState === 'pulling'"
				:class="['sub-nav-refresh-cover', lightTheme ? 'sub-nav-refresh-cover-light' : '']"
				:style="refreshCoverStyle"
			>
				<text :class="['sub-nav-refresh-text', lightTheme ? 'sub-nav-refresh-text-light' : '']">
					{{ refreshPullText }}
				</text>
			</view>

			<view class="sub-nav-row" :class="refreshState === 'pulling' ? 'sub-nav-row-hidden' : ''" :style="subNavStyle">
				<view
					v-for="(item, index) in tabList"
					:key="item.key"
					:class="[
						'sub-nav-item',
						lightTheme && activeTab === item.key ? 'sub-nav-item-active-light' : ''
					]"
					:style="getSubNavItemStyle(index)"
					@tap="emit('tab-change', item)"
				>
					<view
						v-if="refreshState === 'refreshing' && activeTab === item.key"
						:class="['sub-nav-refresh-spinner', lightTheme ? 'sub-nav-refresh-spinner-light' : '']"
					></view>
					<template v-else>
						<text
							:class="[
								'sub-nav-text',
								activeTab === item.key ? 'sub-nav-text-active' : '',
								lightTheme ? 'sub-nav-text-light' : '',
								lightTheme && activeTab === item.key ? 'sub-nav-text-active-light' : ''
							]"
						>
							{{ item.label }}
						</text>
					</template>
				</view>
			</view>

			<view v-if="extraComponent" class="sub-nav-extra">
				<component :is="extraComponent" v-bind="extraProps" v-on="extraListeners" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	tabList: {
		type: Array,
		default: () => []
	},
	activeTab: {
		type: String,
		default: ''
	},
	lightTheme: {
		type: Boolean,
		default: false
	},
	safeTopOffsetRpx: {
		type: Number,
		default: 0
	},
	navHeightRpx: {
		type: Number,
		default: 80
	},
	navSidePaddingRpx: {
		type: Number,
		default: 32
	},
	navItemGapRpx: {
		type: Number,
		default: 56
	},
	panelHeightRpx: {
		type: Number,
		default: 0
	},
	panelBottomInsetRpx: {
		type: Number,
		default: 0
	},
	refreshState: {
		type: String,
		default: 'idle'
	},
	refreshPullText: {
		type: String,
		default: ''
	},
	refreshPullDistancePx: {
		type: Number,
		default: 0
	},
	refreshRevealDistancePx: {
		type: Number,
		default: 1
	},
	extraComponent: {
		type: [Object, Function],
		default: null
	},
	extraProps: {
		type: Object,
		default: () => ({})
	},
	extraListeners: {
		type: Object,
		default: () => ({})
	}
})

const emit = defineEmits(['tab-change'])

const hasExtraNav = computed(() => {
	return Boolean(props.extraComponent)
})

// 计算整个顶部导航壳层高度，供父层内容区预留空间。
const shellStyle = computed(() => {
	return {
		height: `${props.panelHeightRpx}rpx`
	}
})

// 计算导航壳层顶部安全区内边距。
const panelStyle = computed(() => {
	return {
		paddingTop: `${props.safeTopOffsetRpx}rpx`,
		paddingBottom: `${props.panelBottomInsetRpx}rpx`
	}
})

// 计算二级导航行的高度与左右间距。
const subNavStyle = computed(() => {
	return {
		height: `${props.navHeightRpx}rpx`,
		paddingLeft: `${props.navSidePaddingRpx}rpx`,
		paddingRight: `${props.navSidePaddingRpx}rpx`
	}
})

// 计算下拉刷新提示层的位移和透明度，让提示从顶部平缓滑入。
const refreshCoverStyle = computed(() => {
	const revealDistance = Math.max(1, props.refreshRevealDistancePx)
	const offsetPx = Math.min(0, props.refreshPullDistancePx - revealDistance)
	return {
		top: `${props.safeTopOffsetRpx}rpx`,
		height: `${props.navHeightRpx}rpx`,
		transform: `translateY(${offsetPx}px)`,
		opacity: Math.min(1, props.refreshPullDistancePx / revealDistance)
	}
})

// 控制二级导航项之间的横向间距。
function getSubNavItemStyle(index) {
	if (index === props.tabList.length - 1) {
		return undefined
	}

	return {
		marginRight: `${props.navItemGapRpx}rpx`
	}
}
</script>

<style scoped>
/* 顶部二级导航外壳：固定在页面顶部。 */
.sub-nav-shell {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 30;
}

/* 默认深色主题的导航背景。 */
.sub-nav-panel {
	position: relative;
	display: flex;
	flex-direction: column;
	background: rgba(10, 10, 10, 0.58);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
	box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.22);
	backdrop-filter: blur(24rpx);
	-webkit-backdrop-filter: blur(24rpx);
	box-sizing: border-box;
	overflow: hidden;
}

/* 浅色主题的导航背景。 */
.sub-nav-panel-light {
	background: linear-gradient(
		180deg,
		rgba(255, 251, 252, 0.42) 0%,
		rgba(250, 251, 253, 0.58) 38%,
		rgba(248, 250, 252, 0.72) 100%
	);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.52);
	box-shadow: 0 18rpx 42rpx rgba(255, 171, 191, 0.08);
	backdrop-filter: blur(32rpx) saturate(165%);
	-webkit-backdrop-filter: blur(32rpx) saturate(165%);
}

.sub-nav-panel-light::before {
	content: '';
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at top left, rgba(255, 196, 209, 0.24) 0%, rgba(255, 196, 209, 0) 42%),
		radial-gradient(circle at top right, rgba(196, 223, 255, 0.2) 0%, rgba(196, 223, 255, 0) 38%),
		linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%);
	pointer-events: none;
	z-index: 0;
}

.sub-nav-panel-compact {
	border-bottom-left-radius: 28rpx;
	border-bottom-right-radius: 28rpx;
}

.sub-nav-panel-light.sub-nav-panel-compact {
	background: linear-gradient(
		180deg,
		rgba(255, 251, 252, 0.34) 0%,
		rgba(250, 251, 253, 0.48) 42%,
		rgba(248, 250, 252, 0.58) 100%
	);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.44);
	box-shadow: 0 16rpx 34rpx rgba(255, 171, 191, 0.06);
}

.sub-nav-panel-light.sub-nav-panel-compact::after {
	content: '';
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 56rpx;
	background: linear-gradient(180deg, rgba(255, 248, 250, 0.02) 0%, rgba(255, 248, 250, 0.24) 100%);
	pointer-events: none;
	z-index: 0;
}

/* 二级导航项所在行。 */
.sub-nav-row {
	position: relative;
	display: flex;
	align-items: center;
	width: 100%;
	box-sizing: border-box;
	transition: opacity 120ms ease;
	z-index: 1;
}

/* 下拉刷新文案出现时，先隐藏原导航项。 */
.sub-nav-row-hidden {
	opacity: 0;
}

/* 单个二级导航按钮容器。 */
.sub-nav-item {
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 浅色主题下的选中态二级导航胶囊。 */
.sub-nav-item-active-light {
	height: 62rpx;
	padding: 0 22rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.66) 0%, rgba(255, 248, 250, 0.74) 100%);
	border: 1rpx solid rgba(255, 255, 255, 0.76);
	box-shadow: 0 12rpx 26rpx rgba(255, 171, 191, 0.08);
}

.sub-nav-text {
	font-size: 30rpx;
	line-height: 42rpx;
	color: rgba(255, 255, 255, 0.48);
}

.sub-nav-text-light {
	color: #667085;
}

.sub-nav-text-active {
	color: #ffffff;
	font-weight: 600;
}

.sub-nav-text-active-light {
	color: #fe2c55;
}

.sub-nav-refresh-cover {
	position: absolute;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(10, 10, 10, 0.92);
	pointer-events: none;
	z-index: 2;
}

.sub-nav-refresh-cover-light {
	background:
		radial-gradient(circle at top left, rgba(255, 196, 209, 0.22) 0%, rgba(255, 196, 209, 0) 42%),
		linear-gradient(180deg, rgba(255, 247, 250, 0.58) 0%, rgba(248, 250, 252, 0.46) 100%);
	backdrop-filter: blur(22rpx) saturate(160%);
	-webkit-backdrop-filter: blur(22rpx) saturate(160%);
}

.sub-nav-refresh-text {
	font-size: 24rpx;
	font-weight: 500;
	line-height: 34rpx;
	color: rgba(255, 255, 255, 0.9);
}

.sub-nav-refresh-text-light {
	color: #667085;
}

.sub-nav-refresh-spinner {
	width: 28rpx;
	height: 28rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.18);
	border-top-color: #ffffff;
	border-radius: 50%;
	animation: sub-nav-refresh-spin 0.8s linear infinite;
}

.sub-nav-refresh-spinner-light {
	border-color: rgba(17, 24, 39, 0.08);
	border-top-color: #fe2c55;
}

.sub-nav-extra {
	position: relative;
	width: 100%;
	box-sizing: border-box;
	z-index: 1;
}

@keyframes sub-nav-refresh-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}
</style>
