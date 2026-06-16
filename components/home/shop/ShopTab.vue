<template>
	<view class="shop-tab">
		<ShopContentWrap
			:active-component="activeComponent"
			:active="active"
			:category-id="activeCategoryId"
			:section-count="currentSectionCount"
		/>
	</view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ShopContentWrap from '@/components/home/shop/ShopContentWrap.vue'

const props = defineProps({
	activeCategoryId: {
		type: String,
		default: 'recommend'
	},
	active: {
		type: Boolean,
		default: false
	}
})

// 【MOCK-DISABLED】临时观察真实数据：原 maxPage=3 控制"无更多"触发时机，先置大避免误触发
const shopMock = {
	maxPage: Number.MAX_SAFE_INTEGER
}

const loadingMore = ref(false)
const pendingTaskList = new Set()
const categoryPageMap = ref({
	recommend: 1,
	'type-1': 1,
	'type-2': 1,
	'type-3': 1,
	'type-4': 1,
	'type-5': 1
})
const categoryNoMoreMap = ref({
	recommend: false,
	'type-1': false,
	'type-2': false,
	'type-3': false,
	'type-4': false,
	'type-5': false
})

// 当前分类决定展示推荐内容组件还是通用分类内容组件。
const activeComponent = computed(() => {
	return props.activeCategoryId === 'recommend' ? 'recommend' : 'category'
})

// 用页码映射骨架楼层数量，方便触底加载时直接增量展示。
const currentSectionCount = computed(() => {
	const page = categoryPageMap.value[props.activeCategoryId] || 1
	return page + 2
})

// 兜底初始化新增分类的分页状态和“无更多”状态。
watch(
	() => props.activeCategoryId,
	(value) => {
		if (categoryPageMap.value[value]) {
			return
		}

		categoryPageMap.value = {
			...categoryPageMap.value,
			[value]: 1
		}
		categoryNoMoreMap.value = {
			...categoryNoMoreMap.value,
			[value]: false
		}
	},
	{
		immediate: true
	}
)

// 响应父层下拉刷新，重置当前分类页码并清空“无更多”状态。
function handleParentRefresh() {
	if (!props.active) {
		return Promise.resolve()
	}

	const currentCategoryId = props.activeCategoryId

	return scheduleTask({
		delay: 520,
		cancelValue: undefined,
		run: (resolve) => {
		onRefresh(currentCategoryId)
			categoryPageMap.value = {
				...categoryPageMap.value,
				[currentCategoryId]: 1
			}
			categoryNoMoreMap.value = {
				...categoryNoMoreMap.value,
				[currentCategoryId]: false
			}
			resolve()
		}
	})
}

// 响应父层触底加载，先模拟一次分页请求，再决定返回 loaded 或 no-more。
function handleParentReachLower() {
	if (!props.active || loadingMore.value) {
		return Promise.resolve({ status: 'busy' })
	}

	const currentCategoryId = props.activeCategoryId
	loadingMore.value = true
	categoryNoMoreMap.value = {
		...categoryNoMoreMap.value,
		[currentCategoryId]: false
	}
	onLoadMore(currentCategoryId)
	return scheduleTask({
		delay: 480,
		cancelValue: { status: 'busy' },
		run: (resolve) => {
			const nextPage = (categoryPageMap.value[currentCategoryId] || 1) + 1
			if (nextPage > shopMock.maxPage) {
				categoryNoMoreMap.value = {
					...categoryNoMoreMap.value,
					[currentCategoryId]: true
				}
				loadingMore.value = false
				resolve({ status: 'no-more' })
				return
			}

			categoryPageMap.value = {
				...categoryPageMap.value,
				[currentCategoryId]: nextPage
			}
			loadingMore.value = false
			resolve({ status: 'loaded' })
		}
	})
}

// 商城频道失活后，及时关闭未完成的 mock 异步任务，避免隐藏页面继续占用资源。
watch(
	() => props.active,
	(value) => {
		if (value) {
			return
		}

		loadingMore.value = false
		clearPendingTasks()
	}
)

onBeforeUnmount(() => {
	loadingMore.value = false
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

// 商城下拉刷新占位回调，后续替换真实接口。
function onRefresh(categoryId) {
	// TODO：替换商城首页下拉刷新接口
	console.log('shop-refresh', categoryId)
}

// 商城触底分页占位回调，后续替换真实接口。
function onLoadMore(categoryId) {
	// TODO：替换商城首页分页加载接口
	console.log('shop-load-more', categoryId)
}

// 对父组件暴露统一的刷新和触底加载方法，供 home.vue 统一调度。
defineExpose({
	handleParentRefresh,
	handleParentReachLower
})
</script>

<style scoped>
.shop-tab {
	min-height: 100%;
}
</style>
