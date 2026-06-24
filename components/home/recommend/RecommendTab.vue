<template>
	<view class="recommend-tab">
		<RecommendFeedMasonry
			:item-list="feedItems"
			:active="active"
			:parent-scroll-top-px="parentScrollTop"
			:container-width-rpx="containerWidthRpx"
			@item-click="handleItemClick"
			@author-click="handleAuthorClick"
		/>

		<view v-if="footerText" class="recommend-footer">
			<text class="recommend-footer-text">{{ footerText }}</text>
		</view>
	</view>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import RecommendFeedMasonry from '@/components/home/recommend/RecommendFeedMasonry.vue'
import { fetchRecommendCards } from '@/composables/useRecommendApi.js'
import { dispatchNavigationAction } from '@/components/common/navigation/navigationActionRouter.js'

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

const PAGE_LIMIT = 20

const feedItems = ref([])
const cursor = ref(0)
const hasMore = ref(true)
const loadingMore = ref(false)
const loaded = ref(false)


/**
 * 推荐频道自己的尾部文案只保留“继续上滑”这种静态引导。
 * 真正的“加载中 / 已到底 / 无更多内容”统一交给首页外层 PullPagingShell，
 * 这样不会和通用触底提示条出现双份文案。
 */
// hasMore 由 API 返回的游标字段控制


const footerText = computed(() => {
	if (!hasMore.value || loadingMore.value || !loaded.value) {
		return ''
	}

	return '继续上滑，查看更多推荐'
})

// ── 初始加载 ─────────────────────────────────────

onMounted(() => {
	loadFirstPage()
})

async function loadFirstPage() {
	try {
		const result = await fetchRecommendCards(0, PAGE_LIMIT)
		feedItems.value = result.items
		cursor.value = result.nextCursor
		hasMore.value = result.hasMore
	} catch (err) {
		console.error('[RecommendTab] initial load failed', err)
	} finally {
		loaded.value = true
	}
}

function handleItemClick(item) {
	onRecommendItemClick(item)
	if (!item?.detailUrl) {
		return
	}

	if (item.detailUrl.startsWith('page://')) {
		dispatchNavigationAction(item.detailUrl)
	} else {
		uni.navigateTo({ url: item.detailUrl })
	}
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

async function handleParentReachLower() {
	if (!props.active || loadingMore.value) {
		return { status: 'busy' }
	}

	if (!hasMore.value) {
		return { status: 'no-more' }
	}

	loadingMore.value = true
	onLoadMore()

	try {
		const result = await fetchRecommendCards(cursor.value, PAGE_LIMIT)
		if (!props.active) {
			return { status: 'loaded' }
		}
		feedItems.value = [...feedItems.value, ...result.items]
		cursor.value = result.nextCursor
		hasMore.value = result.hasMore
		return { status: 'loaded' }
	} catch (err) {
		console.error('[RecommendTab] load more failed', err)
		return { status: 'loaded' }
	} finally {
		loadingMore.value = false
	}
}
async function handleParentRefresh() {
	if (!props.active) {
		return
	}

	onRefresh()
	loadingMore.value = false
	cursor.value = 0

	try {
		const result = await fetchRecommendCards(0, PAGE_LIMIT)
		if (!props.active) {
			return
		}
		feedItems.value = result.items
		cursor.value = result.nextCursor
		hasMore.value = result.hasMore
	} catch (err) {
		console.error('[RecommendTab] refresh failed', err)
	}
}

watch(
	() => props.active,
	(value) => {
		if (!value) {
			loadingMore.value = false
		}
	},
)


function onRefresh() {
	// 暂无埋点
}

function onLoadMore() {
	// 暂无埋点
}

function onRecommendItemClick(item) {
	// 暂无埋点
}

function onRecommendAuthorClick(item) {
	// 暂无埋点
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
