<template>
	<UserSubPageLayout title="添加朋友" @back="handleBack">
		<view class="add-friend-search">
			<input
				class="add-friend-input"
				:value="searchKeyword"
				:placeholder="pageMock.searchPlaceholder"
				@input="handleSearchInput"
			/>
		</view>

		<UserSectionCard class="add-friend-section" :title="searchKeyword ? '搜索结果' : '推荐添加'">
			<!-- 搜索中 -->
			<view v-if="isSearching" class="add-friend-state">
				<text>搜索中…</text>
			</view>

			<!-- 未命中 -->
			<view v-else-if="isEmptyResult" class="add-friend-state">
				<text>未找到用户 "{{ searchKeyword }}"</text>
				<text class="add-friend-state-hint">请确认 userNo 正确后重试</text>
			</view>

			<!-- 列表（无搜索 = 推荐 / 有搜索 = 命中结果 1 条）-->
			<view
				v-for="item in displaySuggestionList"
				v-else
				:key="item.id"
				class="add-friend-item"
			>
				<view class="add-friend-avatar" :style="item.avatar ? '' : { background: item.avatarBackground }">
					<image v-if="item.avatar" class="add-friend-avatar-image" :src="item.avatar" mode="aspectFill"></image>
					<text v-else class="add-friend-avatar-text">{{ item.avatarText }}</text>
				</view>

				<view class="add-friend-meta">
					<text class="add-friend-name">{{ item.nickname }}</text>
					<text class="add-friend-id">ID：{{ item.displayId }}</text>
					<text class="add-friend-desc">{{ item.desc }}</text>
				</view>

				<view class="add-friend-button" @tap="handleAddFriend(item)">添加</view>
			</view>
		</UserSectionCard>
	</UserSubPageLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UserSectionCard from '@/components/user-center/common/UserSectionCard.vue'
import UserSubPageLayout from '@/components/user-center/common/UserSubPageLayout.vue'
import { getAddFriendPageMock } from '@/components/user-center/userCenterMock.js'
import { searchByUserNo } from '@/core/user/UserService.js'

const pageMock = ref(getAddFriendPageMock())
const searchKeyword = ref('')

// 搜索状态：idle（无搜索）/ searching（请求中）/ hit（命中）/ miss（未命中）
const searchState = ref('idle')
const searchResult = ref(null)        // 命中时的 userInfo

/**
 * 列表渲染逻辑：
 *   - 无搜索关键词 → 显示 mock 推荐列表（pageMock.suggestionList）
 *   - 有搜索关键词 → 显示搜索结果（命中：1 条 / 未命中：空状态）
 */
const displaySuggestionList = computed(() => {
	const keyword = searchKeyword.value.trim()
	if (!keyword) {
		// 退出搜索：复位状态
		if (searchState.value !== 'idle') {
			searchState.value = 'idle'
			searchResult.value = null
		}
		return pageMock.value.suggestionList || []
	}

	// 搜索中：临时清空（避免显示旧数据）
	if (searchState.value === 'searching') {
		return []
	}

	// 命中：1 条结果
	if (searchState.value === 'hit' && searchResult.value) {
		const u = searchResult.value
		return [{
			id: u.userId,
			nickname: u.nickname || u.userNo,
			displayId: u.userNo,
			avatar: u.avatar || '',
			avatarText: (u.nickname || u.userNo || '').charAt(0).toUpperCase() || '?',
			avatarBackground: 'linear-gradient(135deg, #98a7ff 0%, #88d6ff 100%)',
			desc: u.bio || '',
		}]
	}

	// 未命中：空
	return []
})

const isSearching = computed(() => searchState.value === 'searching')
const isEmptyResult = computed(() => searchKeyword.value.trim() && searchState.value === 'miss')
const isHit = computed(() => searchState.value === 'hit' && searchResult.value)

onLoad((options) => {
	pageMock.value = getAddFriendPageMock(options?.userId)
})

function handleBack() {
	uni.navigateBack({ delta: 1 })
}

let _searchTimer = null
function handleSearchInput(event) {
	const next = event.detail.value
	searchKeyword.value = next

	// 防抖 350ms（避免每输入一个字符就发请求）
	if (_searchTimer) clearTimeout(_searchTimer)
	_searchTimer = setTimeout(() => {
		onSearchChange(next)
	}, 350)
}

function handleAddFriend(item) {
	onAddFriend(item)
	uni.showToast({
		title: '好友申请已发送（占位）',
		icon: 'none'
	})
}

async function onSearchChange(keyword) {
	const trimmed = (keyword || '').trim()
	if (!trimmed) {
		// 清空搜索
		searchState.value = 'idle'
		searchResult.value = null
		return
	}

	searchState.value = 'searching'
	const userInfo = await searchByUserNo(trimmed)
	if (userInfo) {
		searchState.value = 'hit'
		searchResult.value = userInfo
		console.log('[add-friend] 搜索命中:', { userId: userInfo.userId, nickname: userInfo.nickname })
	} else {
		searchState.value = 'miss'
		searchResult.value = null
		console.log('[add-friend] 搜索未命中: userNo=', trimmed)
	}
}

function onAddFriend(item) {
	// TODO：后端无"加好友申请"专用接口；当前建议直接调 FollowService.follow(targetId) 走"直接关注"流程
	// （FollowController 已有 /api/social/follow/follow，添加好友 = 关注）
	console.log('user-add-friend-submit', { id: item.id, nickname: item.nickname })
}
</script>

<style scoped>
.add-friend-search {
	margin-top: 12rpx;
}

.add-friend-input {
	height: 84rpx;
	padding: 0 24rpx;
	border-radius: 26rpx;
	background: #ffffff;
	font-size: 24rpx;
	color: #0f172a;
	box-shadow: 0 12rpx 28rpx rgba(148, 163, 184, 0.1);
}

.add-friend-section {
	margin-top: 20rpx;
}

.add-friend-item {
	display: flex;
	align-items: center;
}

.add-friend-item + .add-friend-item {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #eef2f7;
}

.add-friend-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 86rpx;
	height: 86rpx;
	border-radius: 50%;
	flex-shrink: 0;
	overflow: hidden;
}

.add-friend-avatar-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.add-friend-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	font-size: 26rpx;
	color: #64748b;
}

.add-friend-state-hint {
	margin-top: 12rpx;
	font-size: 22rpx;
	color: #94a3b8;
}

.add-friend-avatar-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
}

.add-friend-meta {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.add-friend-name,
.add-friend-id,
.add-friend-desc {
	display: block;
}

.add-friend-name {
	font-size: 26rpx;
	font-weight: 700;
	line-height: 36rpx;
	color: #0f172a;
}

.add-friend-id,
.add-friend-desc {
	margin-top: 8rpx;
	font-size: 22rpx;
	line-height: 30rpx;
	color: #64748b;
}

.add-friend-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 68rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: linear-gradient(135deg, #fe2c55 0%, #fb7185 100%);
	font-size: 24rpx;
	font-weight: 600;
	color: #ffffff;
}
</style>
