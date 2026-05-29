<template>
	<view class="recommend-tab">
		<RecommendFeedMasonry
			:item-list="renderList"
			:active="active"
			:parent-scroll-top-px="parentScrollTop"
			:container-width-rpx="containerWidthRpx"
			@item-click="handleItemClick"
			@author-click="handleAuthorClick"
		/>

		<view class="recommend-footer">
			<text class="recommend-footer-text">{{ footerText }}</text>
		</view>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import RecommendFeedMasonry from '@/components/home/recommend/RecommendFeedMasonry.vue'
import { buildRecommendFeedSource, recommendFeedMock } from '@/components/home/recommend/recommendFeedMock.js'

const props = defineProps({
	active: {
		type: Boolean,
		default: false
	},
	parentScrollTop: {
		type: Number,
		default: 0
	},
	containerWidthRpx: {
		type: Number,
		default: 686
	}
})

const sourceList = buildRecommendFeedSource(40)
const currentPage = ref(1)
const refreshCursor = ref(0)
const loadingMore = ref(false)
const pendingTaskList = new Set()

const rotatedSourceList = computed(() => {
	if (!sourceList.length) {
		return []
	}

	const offset = refreshCursor.value % sourceList.length
	return offset ? [...sourceList.slice(offset), ...sourceList.slice(0, offset)] : sourceList
})

const renderList = computed(() => {
	return rotatedSourceList.value.slice(0, currentPage.value * recommendFeedMock.pageSize)
})

const footerText = computed(() => {
	if (loadingMore.value) {
		return '正在加载更多推荐...'
	}

	if (renderList.value.length >= rotatedSourceList.value.length) {
		return '推荐内容已经到底啦'
	}

	return '继续上滑，查看更多推荐'
})

function handleItemClick(item) {
	onRecommendItemClick(item)
	if (!item?.detailUrl) {
		return
	}

	uni.navigateTo({
		url: item.detailUrl
	})
}

function handleAuthorClick(item) {
	onRecommendAuthorClick(item)
	if (!item?.profileUrl) {
		return
	}

	uni.navigateTo({
		url: item.profileUrl
	})
}

function handleParentReachLower() {
	if (!props.active || loadingMore.value) {
		return Promise.resolve({ status: 'busy' })
	}

	loadingMore.value = true
	onLoadMore()
	return scheduleTask({
		delay: recommendFeedMock.loadDelayMs,
		cancelValue: { status: 'busy' },
		run: (resolve) => {
			if (renderList.value.length >= rotatedSourceList.value.length) {
				loadingMore.value = false
				resolve({ status: 'no-more' })
				return
			}

			currentPage.value += 1
			loadingMore.value = false
			resolve({ status: 'loaded' })
		}
	})
}

function handleParentRefresh() {
	if (!props.active) {
		return Promise.resolve()
	}

	onRefresh()
	return scheduleTask({
		delay: recommendFeedMock.refreshDelayMs,
		cancelValue: undefined,
		run: (resolve) => {
			refreshCursor.value =
				(refreshCursor.value + recommendFeedMock.refreshRotateStep) % Math.max(1, sourceList.length)
			currentPage.value = 1
			loadingMore.value = false
			resolve()
		}
	})
}

watch(
	() => props.active,
	(value) => {
		if (!value) {
			loadingMore.value = false
			clearPendingTasks()
		}
	},
)

onBeforeUnmount(() => {
	clearPendingTasks()
})

function scheduleTask({ delay = 0, cancelValue, run }) {
	return new Promise((resolve) => {
		const task = {
			timer: null,
			resolve,
			cancelValue
		}

		task.timer = setTimeout(() => {
			pendingTaskList.delete(task)
			run(resolve)
		}, delay)

		pendingTaskList.add(task)
	})
}

function clearPendingTasks() {
	pendingTaskList.forEach((task) => {
		clearTimeout(task.timer)
		task.resolve(task.cancelValue)
	})
	pendingTaskList.clear()
}

function onRefresh() {
	// TODO：替换推荐流下拉刷新接口
	console.log('recommend-refresh')
}

function onLoadMore() {
	// TODO：替换推荐流分页加载接口
	console.log('recommend-load-more')
}

function onRecommendItemClick(item) {
	// TODO：替换推荐流卡片点击埋点或路由协议
	console.log('recommend-item-click', item?.id)
}

function onRecommendAuthorClick(item) {
	// TODO：替换推荐流作者点击埋点或主页跳转协议
	console.log('recommend-author-click', item?.id)
}

defineExpose({
	handleParentRefresh,
	handleParentReachLower
})
</script>

<style scoped>
.recommend-tab {
	min-height: 100%;
}

.recommend-footer {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 28rpx 0 12rpx;
}

.recommend-footer-text {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	padding: 0 22rpx;
	border-radius: 999rpx;
	background: #f5f7fb;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #667085;
}
</style>
