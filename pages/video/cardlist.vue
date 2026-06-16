<template>
  <view class="page" :style="{ height: wh + 'px', backgroundColor: '#000' }">
    <view class="content" :style="{ width: ww + 'px', height: vh + 'px', backgroundColor: '#000' }">
      <Cardlist
        ref="cardlistRef"
        :list="videoList"
        :style="{ width: ww + 'px', height: vh + 'px' }"
        @change="onPageChange"
        @click="onCardClick"
      >
        <template #default="{ pageNo, index }">
          <view class="card-shell" :style="{ width: ww + 'px', height: vh + 'px' }">
            <image
              class="cover-image"
              :style="{ width: ww + 'px', height: vh + 'px' }"
              :src="videoList[pageNo]?.cover"
              mode="aspectFill"
            />
            <view class="card-info">
              <text class="info-text">{{ videoList[pageNo]?.text }}</text>
              <view class="info-meta">
                <text class="info-stat">❤ {{ videoList[pageNo]?.likes }}</text>
                <text class="info-stat">💬 {{ videoList[pageNo]?.cmts }}</text>
              </view>
            </view>
          </view>
        </template>
      </Cardlist>
    </view>
  </view>
</template>

<script setup>
/**
 * pages/video/cardlist.vue — 视频卡片列表页面（占位）
 *
 * 注：完整视频流功能由 pages/video/feed.nvue 实现（含 video 标签播放）。
 * 本页面作为独立路由占位，使用 Cardlist 组件展示静态卡片列表。
 * 后续可扩展为单独的"图文视频卡片"场景。
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Cardlist from '@/components/common/cardlist.vue'

const systemInfo = uni.getSystemInfoSync()
const wh = systemInfo.windowHeight
const ww = systemInfo.windowWidth
const vh = wh   // 卡片区占满视口

// 占位视频列表（后续可接入后端 mch/merchant/video/list 等接口）
const videoList = ref([
  { id: 1, cover: 'https://cdn.test.com/cover-1.png', text: '占位视频卡片 1', likes: 1024, cmts: 32, url: '' },
  { id: 2, cover: 'https://cdn.test.com/cover-2.png', text: '占位视频卡片 2', likes: 888, cmts: 18, url: '' },
])

const currentPage = ref(0)
const cardlistRef = ref(null)

function onPageChange(pageNo) {
  currentPage.value = pageNo
}

function onCardClick(item, index) {
  // 占位：点击卡片可跳详情或播放
  console.log('cardlist-click', item, index)
}

onLoad(() => {
  // 占位页面：未来可在此处根据 query 拉取真实数据
})
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
}
.content {
  position: relative;
}
.card-shell {
  position: relative;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-image {
  position: absolute;
  top: 0;
  left: 0;
}
.card-info {
  position: absolute;
  bottom: 60rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 10;
  color: #ffffff;
}
.info-text {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 40rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.6);
  margin-bottom: 16rpx;
}
.info-meta {
  display: flex;
  gap: 24rpx;
  font-size: 24rpx;
  opacity: 0.9;
}
.info-stat {
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.5);
}
</style>
