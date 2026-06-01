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
// ════════════════════════════════════════════════════════════
// IndexSubNavBar.vue — 首页二级导航栏组件
// ════════════════════════════════════════════════════════════
//
// 职责：渲染首页顶部固定定位的二级导航行 + 扩展导航区（如商城分类）。
//       同时展示下拉刷新过程中的覆盖层提示。
//
// 数据来源：所有 props 由 index.vue 的 resolvedSubNavProps computed 提供，
//          该 computed 合并了 navigationResolver 的输出 + 布局值 + 滚动状态。
//
// 组件结构（从上到下）：
//   1. 下拉刷新覆盖层（refreshState === 'pulling' 时显示）
//   2. 子导航标签行（如 商城 | 直播 | 推荐 | 短视频）
//   3. 发布按钮（showPublishAction 为 true 时，在右侧）
//   4. 扩展导航区（extraComponent，如商城的三级分类搜索/购物车）
//
// 【未来改什么】
//   - 导航项样式修改 → 改 .sub-nav-text / .sub-nav-text-active 的 CSS。
//   - 新增导航交互（如下划线动画、徽标）→ 在 tabList item 追加字段，
//     模板中渲染，index.vue 的 resolvedSubNavProps 透传。
//   - 更换发布按钮图标 → 改 lightPublishIcon / darkPublishIcon 的 SVG。
//   - 导航栏滚动吸顶效果 → 增加 sticky / transform 逻辑，
//     需要 index.vue 配合传递滚动偏移量。

import { computed } from 'vue'
import { createSvgDataUri } from '@/composables/useSvgIcon.js'

// ── Props 说明 ─────────────────────────────────────────────
//
// 以下是 index.vue 从 navigationResolver 和布局计算中获取后传入的所有 prop。
// 不应从本组件内部调用 resolver — props 是从 index.vue 单向传入的。
//
const props = defineProps({
	// ── 子导航项列表 ──
	// 每一项：{ key, label, active }，由 resolver 的 subNavTabList 生成
	tabList: {
		type: Array,
		default: () => []
	},
	// ── 当前激活的子导航 key ──
	activeTab: {
		type: String,
		default: ''
	},
	// ── 主题控制 ──
	lightTheme: { type: Boolean, default: false },        // true=浅色, false=深色
	transparentPanel: { type: Boolean, default: false },   // 是否透明背景（目前未用）

	// ── 布局定位 ──
	safeTopOffsetRpx: { type: Number, default: 0 },        // 安全区顶部偏移
	navHeightRpx: { type: Number, default: 80 },           // 导航行高度
	navSidePaddingRpx: { type: Number, default: 32 },      // 左右内边距
	navItemGapRpx: { type: Number, default: 56 },          // 导航项间距
	panelHeightRpx: { type: Number, default: 0 },          // 整个面板高度
	panelBottomInsetRpx: { type: Number, default: 0 },     // 底部额外内边距

	// ── 下拉刷新态 ──
	refreshState: { type: String, default: 'idle' },       // idle | pulling | refreshing
	refreshPullText: { type: String, default: '' },        // 刷新文案（如"下拉刷新商城频道"）
	refreshPullDistancePx: { type: Number, default: 0 },   // 已拉出的距离 px
	refreshRevealDistancePx: { type: Number, default: 1 }, // 触发显示的距离阈值 px

	// ── 扩展导航插槽 ──
	extraComponent: { type: [Object, Function], default: null },  // 动态组件（如 ShopSubNavExtra）
	extraProps: { type: Object, default: () => ({}) },           // 传给 extra 组件的 props
	extraListeners: { type: Object, default: () => ({}) },       // 传给 extra 组件的事件

	// ── 发布按钮 ──
	showPublishAction: { type: Boolean, default: false },
	publishActionIcon: { type: String, default: '' }       // 自定义图标 SVG Data URI
})

const emit = defineEmits(['tab-change', 'publish-click'])

// ── 计算属性 ──────────────────────────────────────────────

/** 是否有扩展组件（如商城三级导航） */
const hasExtraNav = computed(() => {
	return Boolean(props.extraComponent)
})

/** 整个顶部导航壳层高度，供父层内容区预留空间（面板本身固定定位）。 */
const shellStyle = computed(() => {
	return {
		height: `${props.panelHeightRpx}rpx`
	}
})

/** 导航面板顶部安全区 + 底部圆角内边距。lightTheme 有额外底部留白。 */
const panelStyle = computed(() => {
	return {
		paddingTop: `${props.safeTopOffsetRpx}rpx`,
		paddingBottom: `${props.panelBottomInsetRpx}rpx`
	}
})

/** 二级导航行的高度与左右间距。 */
const subNavStyle = computed(() => {
	return {
		height: `${props.navHeightRpx}rpx`,
		paddingLeft: `${props.navSidePaddingRpx}rpx`,
		paddingRight: `${props.navSidePaddingRpx}rpx`
	}
})

/**
 * 导航标签区域样式。
 * 当 showPublishAction 为 true 时，右侧预留发布按钮空间（88rpx）。
 */
const tabsStyle = computed(() => {
	const sideReserveRpx = props.showPublishAction ? 88 : 0
	return {
		paddingRight: `${sideReserveRpx}rpx`
	}
})

/**
 * 下拉刷新提示覆盖层的位置和动画。
 * 逻辑：覆盖层从顶部以 translateY 负偏移滑入，
 * 同时 opacity 从 0 → 1 渐变，pullDistance 达到 revealDistance 时完全显示。
 */
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

// ── 发布按钮图标 ──────────────────────────────────────────

/** 浅色主题的加号 SVG 图标（灰黑色） */
const lightPublishIcon = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M12 5.5v13M5.5 12h13" stroke="#475467" stroke-width="2.1" stroke-linecap="round" />
	</svg>
`)

/** 深色主题的加号 SVG 图标（白色） */
const darkPublishIcon = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M12 5.5v13M5.5 12h13" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" />
	</svg>
`)

/** 最终使用的图标：优先使用自定义 icon，否则按当前主题选择 */
const resolvedPublishIcon = computed(() => {
	if (props.publishActionIcon) {
		return props.publishActionIcon
	}

	return props.lightTheme ? lightPublishIcon : darkPublishIcon
})

// ── 方法 ──────────────────────────────────────────────────

/**
 * 获取子导航项的样式（主要是间距）。
 * 最后一项不设右边距，其余项按 navItemGapRpx 设 marginRight。
 */
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
