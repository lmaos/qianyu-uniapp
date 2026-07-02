<template>
	<view class="message-search-page">
		<view class="message-search-top" :style="{ paddingTop: `${safeTopPx + 18}px` }">
			<view class="message-search-back" @tap="handleBack">‹</view>

			<view class="message-search-bar">
				<text class="message-search-bar-icon">搜</text>
				<input
					class="message-search-input"
					:value="keyword"
					:placeholder="searchPlaceholder"
					placeholder-style="color: #98a2b3;"
					confirm-type="search"
					@input="handleKeywordInput"
					@confirm="handleSearchConfirm"
				/>
			</view>
		</view>

		<scroll-view class="message-search-scroll" scroll-y show-scrollbar="false">
			<view class="message-search-content">
				<view v-if="!keyword.trim()" class="message-search-section">
					<view class="message-search-section-head">
						<text class="message-search-section-title">最近搜索</text>
					</view>

					<view class="message-search-chip-list">
						<view
							v-for="item in recentKeywordList"
							:key="item"
							class="message-search-chip"
							@tap="handleRecentKeywordClick(item)"
						>
							{{ item }}
						</view>
					</view>
				</view>

				<!-- 用户（按 userNo 精确搜索，走后端 /api/user/user_info/search） -->
				<view v-if="keyword.trim()" class="message-search-section">
					<view class="message-search-section-head">
						<text class="message-search-section-title">用户</text>
						<text v-if="userSearchState === 'searching'" class="message-search-section-count">搜索中…</text>
					</view>

					<view v-if="userSearchState === 'searching'" class="message-search-state">
						搜索中…
					</view>

					<view v-else-if="userSearchState === 'miss'" class="message-search-state">
						未找到用户“{{ keyword.trim() }}”
					</view>

					<view
						v-else-if="userSearchState === 'hit' && foundUserDisplay"
						class="message-search-card"
						@tap="handleUserClick"
					>
						<view class="message-search-avatar" :style="{ background: foundUserDisplay.avatarBackground }">
							{{ foundUserDisplay.avatarText }}
						</view>

						<view class="message-search-main">
							<text class="message-search-name">{{ foundUserDisplay.nickname }}</text>
							<text class="message-search-id">ID：{{ foundUserDisplay.displayId }}</text>
						</view>
					</view>
				</view>

				<view class="message-search-section">
					<view class="message-search-section-head">
						<text class="message-search-section-title">联系人</text>
						<text class="message-search-section-count">{{ filteredContactList.length }}</text>
					</view>

					<view
						v-for="item in filteredContactList"
						:key="item.id"
						class="message-search-card"
						@tap="handleContactClick(item)"
					>
						<view class="message-search-avatar" :style="{ background: item.avatarBackground }">
							{{ item.avatarText }}
						</view>

						<view class="message-search-main">
							<text class="message-search-name">{{ item.name }}</text>
							<text class="message-search-id">ID：{{ item.displayId }}</text>
						</view>

						<view v-if="item.hasMomentUpdate" class="message-search-side-badge">动态</view>
					</view>
				</view>

				<view class="message-search-section">
					<view class="message-search-section-head">
						<text class="message-search-section-title">聊天</text>
						<text class="message-search-section-count">{{ filteredConversationList.length }}</text>
					</view>

					<view
						v-for="item in filteredConversationList"
						:key="item.id"
						class="message-search-card"
						@tap="handleConversationClick(item)"
					>
						<view class="message-search-avatar" :style="{ background: item.avatarBackground }">
							{{ item.avatarText }}
						</view>

						<view class="message-search-main">
							<text class="message-search-name">{{ item.name }}</text>
							<text class="message-search-preview">{{ item.preview }}</text>
						</view>

						<view v-if="item.unreadCount" class="message-search-unread">{{ item.unreadCount }}</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
import { useIm } from '@/composables/useIm.js'
import { buildPageUrl } from '@/components/user-center/userCenterMock.js'
import { buildMessageSearchPageMock } from '@/components/message/messageMock.js'
import { searchByUserNo } from '@/core/user/UserService.js'
import { fetchFriendContacts } from '@/composables/useSocialApi.js'

const { safeTopPx } = useSafeAreaMetrics()
const im = useIm()

const pageMock = buildMessageSearchPageMock()
const keyword = ref('')
const searchPlaceholder = pageMock.searchPlaceholder
const recentKeywordList = pageMock.recentKeywordList
const contactList = ref([])  // 真实好友，由 loadContacts 拉取
const conversationList = ref([])

// userNo 用户搜索状态：idle（无搜索）/ searching（请求中）/ hit（命中）/ miss（未命中）
const userSearchState = ref('idle')
const foundUser = ref(null)
let _userSearchTimer = null

// 命中用户的展示对象（映射到既有 .message-search-card 结构）
const foundUserDisplay = computed(() => {
	const u = foundUser.value
	if (!u) return null
	return {
		userId: u.userId,
		nickname: u.nickname || u.userNo,
		displayId: u.userNo,
		avatar: u.avatar || '',
		avatarText: (u.nickname || u.userNo || '?').charAt(0).toUpperCase(),
		avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
		bio: u.bio || ''
	}
})

// 加载真实会话数据用于搜索
async function loadConversationData() {
	try {
		if (im.isReady.value) {
			const result = await im.getConversationList()
			const list = result.list || []
			conversationList.value = list.map((conv) => ({
				id: conv.conversationId || '',
				conversationId: conv.conversationId || '',
				targetId: conv.targetId || '',
				name: conv.name || conv.targetId || '',
				avatarText: conv.avatarText || (conv.name || '').charAt(0) || '?',
				avatarBackground: conv.avatarBackground || 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
				preview: conv.lastMessagePreview || '',
				unreadCount: conv.unreadCount || 0,
				chatType: conv.conversationId?.startsWith('group_') ? 2 : 1,
			}))
		} else {
			// IM 未就绪，使用 mock 数据
			conversationList.value = pageMock.conversationList
		}
	} catch (e) {
		console.error('[search.vue] 加载会话数据失败:', e)
		conversationList.value = pageMock.conversationList
	}
}

const filteredContactList = computed(() => {
	const normalizedKeyword = keyword.value.trim().toLowerCase()
	if (!normalizedKeyword) {
		return contactList.value
	}

	return contactList.value.filter((item) => {
		return [item.name, item.displayId, item.signature].some((field) => `${field || ''}`.toLowerCase().includes(normalizedKeyword))
	})
})

const filteredConversationList = computed(() => {
	const normalizedKeyword = keyword.value.trim().toLowerCase()
	if (!normalizedKeyword) {
		return conversationList.value
	}

	return conversationList.value.filter((item) => {
		return [item.name, item.preview].some((field) => `${field || ''}`.toLowerCase().includes(normalizedKeyword))
	})
})

function buildChatUrl(item) {
	return buildPageUrl('/pages/message/chat', {
		conversationId: item.conversationId || item.id || '',
		chatType: item.chatType || 1,
		targetId: item.targetId || item.userId || item.id || '',
		name: item.name || '',
	})
}

// 按 userNo 搜索用户（复用 core/user/UserService.searchByUserNo，镜像 add-friend.vue 状态机）
async function runUserSearch(rawKeyword) {
	const trimmed = `${rawKeyword || ''}`.trim()
	if (!trimmed) {
		userSearchState.value = 'idle'
		foundUser.value = null
		return
	}

	userSearchState.value = 'searching'
	const userInfo = await searchByUserNo(trimmed)
	if (userInfo) {
		userSearchState.value = 'hit'
		foundUser.value = userInfo
		console.log('[search.vue] userNo 搜索命中:', { userId: userInfo.userId, nickname: userInfo.nickname })
	} else {
		userSearchState.value = 'miss'
		foundUser.value = null
		console.log('[search.vue] userNo 搜索未命中:', trimmed)
	}
}

// 加载真实好友作为联系人候选（供本地关键字过滤）
async function loadContacts() {
	try {
		const list = await fetchFriendContacts()
		contactList.value = (list || []).map((f) => ({
			id: f.userId,
			userId: f.userId,
			name: f.nickname || f.userNo || '',
			displayId: f.userNo,
			avatarText: (f.nickname || f.userNo || '?').charAt(0).toUpperCase(),
			avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
			hasMomentUpdate: false
		}))
	} catch (e) {
		console.error('[search.vue] 加载联系人失败:', e)
	}
}

onLoad((options) => {
	keyword.value = decodeURIComponent(`${options.keyword || ''}`.trim())
	loadConversationData()
	loadContacts()
	// 消息页入口可带 keyword，直接触发一次 userNo 搜索
	if (keyword.value) {
		runUserSearch(keyword.value)
	}
})

watch(
	() => im.isReady.value,
	(value) => {
		if (!value) {
			return
		}

		loadConversationData()
	},
	{
		flush: 'post'
	}
)

function handleBack() {
	uni.navigateBack({
		delta: 1
	})
}

function handleKeywordInput(event) {
	keyword.value = `${event?.detail?.value || ''}`
	// 防抖 350ms 触发 userNo 用户搜索（避免每输入一个字符就发请求）
	if (_userSearchTimer) clearTimeout(_userSearchTimer)
	_userSearchTimer = setTimeout(() => {
		runUserSearch(keyword.value)
	}, 350)
}

function handleSearchConfirm() {
	console.log('message-search-confirm', keyword.value)
	// 回车立即搜索（取消挂起的防抖）
	if (_userSearchTimer) clearTimeout(_userSearchTimer)
	runUserSearch(keyword.value)
}

function handleRecentKeywordClick(item) {
	keyword.value = item
	runUserSearch(item)
}

function handleContactClick(item) {
	uni.navigateTo({
		url: buildChatUrl(item)
	})
}

function handleConversationClick(item) {
	uni.navigateTo({
		url: buildChatUrl(item)
	})
}

function handleUserClick() {
	const d = foundUserDisplay.value
	if (!d) return
	// user-profile 页待修复，暂跳「添加好友」页并带入 userNo 自动搜索
	uni.navigateTo({
		url: buildPageUrl('/pages/user/add-friend', { userNo: d.displayId })
	})
}
</script>

<style scoped>
.message-search-page {
	min-height: 100vh;
	background:
		radial-gradient(circle at top right, rgba(255, 195, 208, 0.38) 0%, rgba(255, 195, 208, 0) 30%),
		linear-gradient(180deg, #fff7fa 0%, #f8fafc 40%, #f8fafc 100%);
}

.message-search-top {
	display: flex;
	align-items: center;
	padding-right: 24rpx;
	padding-left: 24rpx;
	gap: 16rpx;
}

.message-search-back {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.84);
	box-shadow: 0 12rpx 26rpx rgba(255, 171, 191, 0.08);
	font-size: 34rpx;
	color: #0f172a;
	flex-shrink: 0;
}

.message-search-bar {
	display: flex;
	align-items: center;
	flex: 1;
	height: 84rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: 0 16rpx 32rpx rgba(255, 171, 191, 0.1);
}

.message-search-bar-icon {
	font-size: 24rpx;
	line-height: 32rpx;
	color: #98a2b3;
}

.message-search-input {
	flex: 1;
	height: 100%;
	margin-left: 12rpx;
	font-size: 24rpx;
	color: #0f172a;
}

.message-search-scroll {
	height: calc(100vh - 120rpx);
}

.message-search-content {
	padding: 28rpx 24rpx 36rpx;
	box-sizing: border-box;
}

.message-search-section + .message-search-section {
	margin-top: 28rpx;
}

.message-search-section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 18rpx;
}

.message-search-section-title {
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.message-search-section-count {
	font-size: 22rpx;
	line-height: 30rpx;
	color: #98a2b3;
}

.message-search-chip-list {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.message-search-chip {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 54rpx;
	padding: 0 20rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: 0 12rpx 24rpx rgba(255, 171, 191, 0.08);
	font-size: 22rpx;
	color: #667085;
}

.message-search-card {
	display: flex;
	align-items: center;
	padding: 20rpx 22rpx;
	border-radius: 30rpx;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: 0 16rpx 32rpx rgba(15, 23, 42, 0.05);
}

.message-search-card + .message-search-card {
	margin-top: 14rpx;
}

.message-search-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 84rpx;
	height: 84rpx;
	border-radius: 28rpx;
	font-size: 30rpx;
	font-weight: 700;
	color: #ffffff;
	flex-shrink: 0;
}

.message-search-main {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.message-search-name {
	display: block;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.message-search-id,
.message-search-preview {
	display: block;
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 32rpx;
	color: #667085;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.message-search-state {
	padding: 40rpx 0;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #98a2b3;
	text-align: center;
}

.message-search-side-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 40rpx;
	padding: 0 16rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, rgba(255, 151, 174, 0.14) 0%, rgba(255, 196, 160, 0.2) 100%);
	font-size: 18rpx;
	font-weight: 600;
	color: #d94f7b;
	flex-shrink: 0;
}

.message-search-unread {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 38rpx;
	height: 38rpx;
	padding: 0 10rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #ff97ae 0%, #ffc4a0 100%);
	font-size: 18rpx;
	font-weight: 700;
	color: #ffffff;
	box-sizing: border-box;
	flex-shrink: 0;
}
</style>
