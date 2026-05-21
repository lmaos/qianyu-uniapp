<template>
	<view class="recommend-tab">
		<view class="placeholder-card">
			<text class="placeholder-title">{{ recommendMock.title }}</text>
			<text class="placeholder-desc">{{ recommendMock.desc }}</text>
			<view class="placeholder-button" @tap="handleActionClick">
				{{ recommendMock.buttonText }}
			</view>
		</view>
	</view>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
	active: {
		type: Boolean,
		default: false
	}
})

const recommendMock = {
	title: '推荐组件骨架',
	desc: 'TODO：替换推荐组件接口、信息流卡片和个性化推荐数据',
	buttonText: '推荐占位操作'
}

const pendingTaskList = new Set()

// 点击推荐占位按钮时，统一进入推荐页交互回调。
function handleActionClick() {
	onRecommendAction()
}

// 推荐页按钮占位回调，后续可替换成跳转或埋点逻辑。
function onRecommendAction() {
	// TODO：替换推荐组件点击回调
	console.log('recommend-tab-action')
}

// 推荐页统一实现触底加载协议，供 home.vue 调用。
function handleParentReachLower() {
	if (!props.active) {
		return Promise.resolve({ status: 'busy' })
	}

	// TODO：替换推荐组件触底加载回调
	console.log('recommend-tab-load-more')
	return scheduleTask({
		delay: 360,
		cancelValue: { status: 'busy' },
		run: (resolve) => {
			resolve({ status: 'no-more' })
		}
	})
}

// 推荐页统一实现下拉刷新协议，供 home.vue 调用。
function handleParentRefresh() {
	if (!props.active) {
		return Promise.resolve()
	}

	// TODO：替换推荐组件下拉刷新回调
	console.log('recommend-tab-refresh')
	return scheduleTask({
		delay: 500,
		cancelValue: undefined,
		run: (resolve) => {
			resolve()
		}
	})
}

// 推荐频道失活后，清理仍在等待中的 mock 定时任务。
watch(
	() => props.active,
	(value) => {
		if (value) {
			return
		}

		clearPendingTasks()
	}
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

// 向父组件暴露统一的刷新与触底方法，便于未来新增模块保持同一规范。
defineExpose({
	handleParentRefresh,
	handleParentReachLower
})
</script>

<style scoped>
.recommend-tab {
	height: 100%;
}

.placeholder-card {
	padding: 40rpx 32rpx;
	border-radius: 32rpx;
	background: #ffffff;
	box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.08);
}

.placeholder-title {
	display: block;
	font-size: 40rpx;
	font-weight: 600;
	line-height: 56rpx;
	color: #0f172a;
}

.placeholder-desc {
	display: block;
	margin-top: 20rpx;
	font-size: 26rpx;
	line-height: 38rpx;
	color: #667085;
}

.placeholder-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 72rpx;
	padding: 0 32rpx;
	margin-top: 40rpx;
	border-radius: 999rpx;
	background: #f2f4f7;
	font-size: 24rpx;
	color: #0f172a;
}
</style>
