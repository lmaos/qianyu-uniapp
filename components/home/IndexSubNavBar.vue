<template>
	<view class="sub-nav-shell" :style="shellStyle">
		<view
			:class="[
				'sub-nav-panel',
				lightTheme ? 'sub-nav-panel-light' : '',
				transparentPanel ? 'sub-nav-panel-transparent' : '',
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
				<view class="sub-nav-tabs" :style="tabsStyle">
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

				<view
					v-if="showPublishAction"
					:class="[
						'sub-nav-publish-button',
						lightTheme ? 'sub-nav-publish-button-light' : '',
						transparentPanel ? 'sub-nav-publish-button-transparent' : ''
					]"
					:style="publishButtonStyle"
					@tap.stop="emit('publish-click')"
				>
					<image class="sub-nav-publish-icon" :src="resolvedPublishIcon" mode="aspectFit" />
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
import { createSvgDataUri } from '@/composables/useSvgIcon.js'

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
	transparentPanel: {
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
	},
	showPublishAction: {
		type: Boolean,
		default: false
	},
	publishActionIcon: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['tab-change', 'publish-click'])

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

const tabsStyle = computed(() => {
	const sideReserveRpx = props.showPublishAction ? 88 : 0
	return {
		paddingRight: `${sideReserveRpx}rpx`
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

const publishButtonStyle = computed(() => {
	return {
		right: `${props.navSidePaddingRpx}rpx`
	}
})

const lightPublishIcon = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M12 5.5v13M5.5 12h13" stroke="#475467" stroke-width="2.1" stroke-linecap="round" />
	</svg>
`)

const darkPublishIcon = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M12 5.5v13M5.5 12h13" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" />
	</svg>
`)

const resolvedPublishIcon = computed(() => {
	if (props.publishActionIcon) {
		return props.publishActionIcon
	}

	return props.lightTheme ? lightPublishIcon : darkPublishIcon
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
	background:
		url('/static/images/home/home-subnav-dark.png') center / 100% 100% no-repeat,
		linear-gradient(180deg, rgba(10, 10, 10, 0.72) 0%, rgba(10, 10, 10, 0.56) 100%);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
	box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.22);
	box-sizing: border-box;
	overflow: hidden;
}

/* 浅色主题的导航背景。 */
.sub-nav-panel-light {
	background:
		url('/static/images/home/home-subnav-light.png') center / 100% 100% no-repeat,
		linear-gradient(180deg, rgba(255, 251, 252, 0.5) 0%, rgba(248, 250, 252, 0.72) 100%);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.52);
	box-shadow: 0 18rpx 42rpx rgba(255, 171, 191, 0.08);
}

.sub-nav-panel-compact {
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}

.sub-nav-panel-light.sub-nav-panel-compact {
	background:
		url('/static/images/home/home-subnav-light.png') center / 100% 100% no-repeat,
		linear-gradient(180deg, rgba(255, 251, 252, 0.42) 0%, rgba(248, 250, 252, 0.62) 100%);
	border-bottom: 1rpx solid rgba(255, 255, 255, 0.44);
	box-shadow: 0 16rpx 34rpx rgba(255, 171, 191, 0.06);
}

.sub-nav-panel-transparent,
.sub-nav-panel-light.sub-nav-panel-transparent,
.sub-nav-panel-light.sub-nav-panel-transparent.sub-nav-panel-compact {
	background: transparent;
	border-bottom: none;
	box-shadow: none;
}

/* 二级导航项所在行。 */
.sub-nav-row {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	width: 100%;
	box-sizing: border-box;
	transition: opacity 120ms ease;
	z-index: 1;
}

.sub-nav-tabs {
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: flex-start;
	width: auto;
	min-width: 0;
	box-sizing: border-box;
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
	min-width: 96rpx;
}

/* 浅色主题下的选中态二级导航胶囊。 */
.sub-nav-item-active-light {
	height: auto;
	padding: 0;
	background: transparent;
	border: none;
	box-shadow: none;
}

.sub-nav-text {
	font-size: 28rpx;
	line-height: 40rpx;
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
	display: inline-block;
	font-weight: 700;
	transform: scale(1.08);
	transform-origin: center center;
}

.sub-nav-refresh-cover {
	position: absolute;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	pointer-events: none;
	z-index: 2;
}

.sub-nav-refresh-cover-light {
	background: transparent;
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

.sub-nav-publish-button {
	position: absolute;
	top: 50%;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	transform: translateY(-50%);
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	border: 1rpx solid rgba(255, 255, 255, 0.12);
}

.sub-nav-publish-button-light {
	background: rgba(255, 255, 255, 0.78);
	border-color: rgba(255, 255, 255, 0.88);
}

.sub-nav-publish-button-transparent {
	background: rgba(15, 23, 42, 0.16);
	border-color: rgba(255, 255, 255, 0.12);
}

.sub-nav-publish-icon {
	width: 30rpx;
	height: 30rpx;
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
