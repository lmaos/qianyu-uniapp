<template>
	<view class="page-shell" :style="pageShellStyle">
		<view class="page-content">
			<HomePage
				v-show="activeTab === 'home'"
				:active="activeTab === 'home'"
				:initial-scene="activeHomeScene"
			/>
			<FriendPage v-show="activeTab === 'friend'" :active="activeTab === 'friend'" />
			<MessagePage v-show="activeTab === 'message'" />
			<MinePage v-show="activeTab === 'mine'" :active="activeTab === 'mine'" />
		</view>

		<view class="tab-bar" :style="tabBarStyle">
			<view
				v-for="item in tabList"
				:key="item.key"
				class="tab-item"
				@tap="handleTabClick(item)"
			>
				<text class="tab-text" :style="getTabTextStyle(item.key)">
					{{ item.label }}
				</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppTheme } from '@/composables/useAppTheme.js'
import HomePage from '../home/home.vue'
import FriendPage from '../friend/friend.vue'
import MessagePage from '../message/message.vue'
import MinePage from '../mine/mine.vue'

const tabList = [
	{ key: 'home', label: '首页' },
	{ key: 'friend', label: '玩伴' },
	{ key: 'message', label: '消息' },
	{ key: 'mine', label: '我的' }
]

const rootMock = {
	defaultTab: 'home'
	// TODO：替换底部TAB接口数据
}

const ROOT_TAB_KEY_LIST = tabList.map((item) => item.key)
const activeTab = ref(rootMock.defaultTab)
const activeHomeScene = ref('')
const { themeConfig, setLightTheme } = useAppTheme()

const pageShellStyle = computed(() => {
	return {
		background: themeConfig.value.pageBackground
	}
})

const tabBarStyle = computed(() => {
	return {
		background: themeConfig.value.tabBarBackground,
		borderTopColor: themeConfig.value.tabBarBorderColor,
		boxShadow: themeConfig.value.tabBarShadow
	}
})

function getTabTextStyle(tabKey) {
	const isActive = activeTab.value === tabKey
	return {
		color: isActive ? themeConfig.value.tabBarActiveColor : themeConfig.value.tabBarTextColor,
		fontWeight: isActive ? 600 : 400
	}
}

function handleTabClick(tabItem) {
	if (activeTab.value === tabItem.key) {
		onTabRepeat(tabItem)
		return
	}

	activeTab.value = tabItem.key
	onTabChange(tabItem)
}

onLoad((options) => {
	applyRouteTarget(options)
})

function onTabChange(tabItem) {
	// TODO：替换真实TAB切换回调
	console.log('root-tab-change', tabItem.key)
}

function onTabRepeat(tabItem) {
	// TODO：替换真实TAB重复点击回调
	console.log('root-tab-repeat', tabItem.key)
}

function applyRouteTarget(options = {}) {
	const nextTab = normalizeTabKey(options?.tab)
	activeTab.value = nextTab
	activeHomeScene.value = nextTab === 'home' ? normalizeHomeScene(options?.scene) : ''
}

function normalizeTabKey(tabKey) {
	return ROOT_TAB_KEY_LIST.includes(tabKey) ? tabKey : rootMock.defaultTab
}

function normalizeHomeScene(sceneKey) {
	const homeSceneKeyList = ['mall', 'live', 'recommend']
	return homeSceneKeyList.includes(sceneKey) ? sceneKey : ''
}

watch(
	() => activeTab.value,
	(value) => {
		if (value !== 'home') {
			setLightTheme()
		}
	},
	{
		immediate: true,
		flush: 'sync'
	}
)
</script>

<style scoped>
.page-shell {
	display: flex;
	flex-direction: column; /* 纵向排列：上 → 下 */
	height: 100vh;
}

.page-content {
	flex: 1; /* 关键：自动占满剩余高度 */
	min-height: 0;
	overflow: hidden; /* 子页面自行滚动，避免外层跟着滚 */
}

.tab-bar {
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 20;
	display: flex;
	height: 140rpx;
	border-top: 1rpx solid transparent;
}

.tab-item {
	display: flex;
	flex: 1;
	padding-top: 25rpx;
	justify-content: center;
}

.tab-text {
	font-size: 26rpx;
	line-height: 36rpx;
}
</style>
