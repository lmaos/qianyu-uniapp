<template>
  <view class="cardlist-root"
    :style="[style, { overflow: 'hidden' }]"
    @touchstart="touchstart"
    @touchmove="touchmove"
    @touchend="touchend"
    @touchcancel="touchcancel"
  >
    <view class="cardlist-track" :style="{ transform: 'translateY(' + translateY + 'px)' }">
      <view
        v-for="(slot, i) in buffer"
        :key="slot.key"
        class="cardlist-page"
        :style="{ height: pageHeight + 'px' }"
      >
        <slot :pageNo="slot.pageNo" :index="i">
          <view :style="{
            width: '100%', height: pageHeight + 'px',
            backgroundColor: defaultColors[i % defaultColors.length]
          }"></view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  style: { type: Object, default: () => ({}) },
  list: { type: Array, default: () => ([]) }
})
const emit = defineEmits(['totop', 'tobottom', 'change'])

const defaultColors = ['#0a9dff', '#4eff63', '#d94fff']
const BUFFER_SIZE = 3

// ── 页面高度 ──────────────────────────────────────────
const pageHeight = computed(() => {
  const h = props.style?.height
  if (h && typeof h === 'string') return parseFloat(h)
  return uni.getSystemInfoSync().windowHeight
})

// ── 最大页码 ──────────────────────────────────────────
// 无数据（demo）时走 buffer 自身页数
const maxPageNo = computed(() =>
  props.list.length > 0
    ? Math.max(0, props.list.length - 1)
    : BUFFER_SIZE - 1
)

// ── Buffer ────────────────────────────────────────────
let uid = 0
function slot(pageNo) { return { key: ++uid, pageNo: Math.max(0, pageNo) } }

const buffer = ref([])
function initBuffer(start) {
  const items = []
  for (let i = 0; i < BUFFER_SIZE; i++) items.push(slot(start + i))
  buffer.value = items
}
initBuffer(0)

// ── 滚动状态 ──────────────────────────────────────────
// translateY  —— track 实时 CSS translateY（触摸拖拽 + 动画）
// anchorY     —— 每次 touchend 稳定后锁定的位置（下轮触摸的基准）
const translateY = ref(0)
const anchorY    = ref(0)
const isAnimating = ref(false)
const touchStartY = ref(0)

// ── 页码推导（全部从像素位置计算，不独立维护 state） ──
// 当前可见的 buffer slot 索引（0/1/2）
const visibleSlot = computed(() => {
  const y = Math.abs(anchorY.value)
  const slot = Math.round(y / pageHeight.value)
  return Math.min(BUFFER_SIZE - 1, Math.max(0, slot))
})

// 当前实际页码 = buffer[可见 slot].pageNo
// 这是唯一外部关心的值，传递给 slot 和 @change
const currentPageNo = computed(() =>
  buffer.value[visibleSlot.value]?.pageNo ?? 0
)

// ── 像素 → 页码（用于边界判断、步数计算） ────────────
// 保留你原版的 +1 防浮点误差
function pxToPage(y) {
  return parseInt((Math.abs(y) + 1) / pageHeight.value)
}

// ── 触摸事件 ──────────────────────────────────────────
function touchstart(e) {
  touchStartY.value = e.touches[0].pageY
  anchorY.value = translateY.value
}

function touchmove(e) {
  if (isAnimating.value) return
  const diffY = e.touches[0].pageY - touchStartY.value
  const pg = currentPageNo.value

  if (pg <= 0 && diffY > 0) { emit('totop'); return }
  if (pg >= maxPageNo.value && diffY < 0) { emit('tobottom'); return }

  translateY.value = anchorY.value + diffY
}

function touchend(e) {
  if (isAnimating.value) return

  const diffY = e.changedTouches[0].pageY - touchStartY.value
  if (diffY === 0 || Math.abs(diffY) <= 15) {
    translateY.value = anchorY.value; return
  }

  const scrollDown = diffY < 0
  const pg = currentPageNo.value

  if (pg <= 0 && !scrollDown) { translateY.value = anchorY.value; return }
  if (pg >= maxPageNo.value && scrollDown) { translateY.value = anchorY.value; return }

  // 翻了几页（原版 getChangeCursorSize 思路）
  const scrollDist = Math.abs(translateY.value - anchorY.value)
  const stepCount  = Math.max(1, Math.round(scrollDist / pageHeight.value))

  let targetPageNo = scrollDown
    ? Math.min(maxPageNo.value, pg + stepCount)
    : Math.max(0, pg - stepCount)

  if (targetPageNo === pg) { translateY.value = anchorY.value; return }

  // 相对位移
  const scrollStep = targetPageNo - pg
  const targetY = anchorY.value - (scrollStep * pageHeight.value)

  console.log('[card] touchend pg:', pg, '→ target:', targetPageNo, 'step:', scrollStep, 'buf:', buffer.value.map(s => s.pageNo))
  animateTo(targetY, scrollDown, targetPageNo)
}
function touchcancel() {
  if (isAnimating.value) return
  translateY.value = anchorY.value
}

// ── 吸附动画 (easeOutCubic) ──────────────────────────
let animTimer = null
let fromPageNo = 0  // 动画开始前的旧页码，供 change 事件用

function animateTo(targetY, scrollDown, targetPage, duration = 200) {
  isAnimating.value = true
  fromPageNo = currentPageNo.value  // 锁定旧页码
  const startY = translateY.value
  const diff   = targetY - startY
  const t0     = Date.now()

  function step() {
    const p = Math.min(1, (Date.now() - t0) / duration)
    const ease = 1 - Math.pow(1 - p, 3)
    translateY.value = startY + diff * ease

    if (p < 1) {
      animTimer = setTimeout(step, 4)
    } else {
      translateY.value = targetY
      anchorY.value = targetY
      animTimer = null

      // 先处理循环缓冲（补偿 translateY/anchorY），
      // 再解锁动画状态，防止 rotateBuffer 期间被 touch 事件打断
      rotateBuffer(scrollDown, targetPage)
      isAnimating.value = false

      const afterPg = currentPageNo.value
      const vs = visibleSlot.value
      console.log('[card] animDone → emit from:', fromPageNo, 'to:', targetPage, '| currPg:', afterPg, 'vs:', vs, 'buf:', buffer.value.map(s => s.pageNo))

      // 用 targetPage 而不是 currentPageNo.value（旋转补偿后 visibleSlot 会错位）
      emit('change', { from: fromPageNo, to: targetPage })
    }
  }
  step()
}

// ── 循环缓冲 ──────────────────────────────────────────
// 用 targetPage（动画目标页码）判断是否需要旋转，不用 pxToPage（补偿后漂移）。
function rotateBuffer(scrollDown, targetPage) {
  const first = buffer.value[0]
  const last  = buffer.value[buffer.value.length - 1]

  if (scrollDown) {
    let count = 0
    while (targetPage > buffer.value[buffer.value.length - 1].pageNo && buffer.value[buffer.value.length - 1].pageNo < maxPageNo.value) {
      const last = buffer.value[buffer.value.length - 1]
      const removed = buffer.value.shift()
      removed.pageNo = last.pageNo + 1
      buffer.value.push(removed)
      translateY.value += pageHeight.value
      anchorY.value    += pageHeight.value
      count++
    }
    if (count > 0) console.log('[card] shiftToPush ×' + count, JSON.stringify(buffer.value.map(s => s.pageNo)), 'target:', targetPage)
  } else {
    let count = 0
    while (targetPage < buffer.value[0].pageNo && buffer.value[0].pageNo > 0) {
      const first = buffer.value[0]
      const removed = buffer.value.pop()
      removed.pageNo = first.pageNo - 1
      buffer.value.unshift(removed)
      translateY.value -= pageHeight.value
      anchorY.value    -= pageHeight.value
      count++
    }
    if (count > 0) console.log('[card] popToUnshift ×' + count, JSON.stringify(buffer.value.map(s => s.pageNo)), 'target:', targetPage)
  }
}

// ── 外部控制接口 ──────────────────────────────────────
function goToPage(target) {
  const t = Math.max(0, Math.min(maxPageNo.value, target))
  const cur = currentPageNo.value
  if (t === cur) return
  const down = t > cur
  const targetY = anchorY.value - ((t - cur) * pageHeight.value)
  animateTo(targetY, down, t)
}

function nextPage() {
  const cur = currentPageNo.value
  if (cur >= maxPageNo.value) { emit('tobottom'); return }
  goToPage(cur + 1)
}

function prevPage() {
  const cur = currentPageNo.value
  if (cur <= 0) { emit('totop'); return }
  goToPage(cur - 1)
}

function replaceList() {
  if (animTimer) { clearTimeout(animTimer); animTimer = null }
  isAnimating.value = false
  translateY.value = 0
  anchorY.value = 0
  initBuffer(0)
}

function appendItems() {
  // maxPageNo 已自动跟随 props.list.length 更新，无需操作
}

defineExpose({
  buffer,
  currentPageNo,
  goToPage,
  nextPage,
  prevPage,
  replaceList,
  appendItems
})
</script>

<style scoped>
.cardlist-root { position: relative; }
.cardlist-track { position: relative; will-change: transform; }
.cardlist-page  { position: relative; overflow: hidden; }
</style>
