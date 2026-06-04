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
        :key="slot.uid"
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
  list: { type: Array, default: () => ([]) },
  pressThreshold: { type: Number, default: 5 },
  longpressDelay: { type: Number, default: 300 },
})
const emit = defineEmits(['totop', 'tobottom', 'change', 'rotate', 'click', 'longpress'])

const defaultColors = ['#0a9dff', '#4eff63', '#d94fff']
const BUFFER_SIZE = 5

// 简单拼接 buffer 状态（代替 map().join()）
function bufStr() {
  let s = ''
  for (const x of buffer.value) s += x.pageNo + ':' + x.uid + ' '
  return s
}

// ── 页面高度 ──────────────────────────────────────────
const _sysH = uni.getSystemInfoSync().windowHeight
const pageHeight = computed(() => {
  const h = props.style?.height
  if (h && typeof h === 'string') return parseFloat(h)
  return _sysH
})

// ── 最大页码 ──────────────────────────────────────────
const maxPageNo = computed(() =>
  props.list.length > 0
    ? Math.max(0, props.list.length - 1)
    : BUFFER_SIZE - 1
)

// ── Buffer ────────────────────────────────────────────
let slotUid = 0
function slot(pageNo) {
  return { pageNo: Math.max(0, pageNo), uid: slotUid++ }
}

const buffer = ref([])
function initBuffer(start) {
  const items = []
  for (let i = 0; i < BUFFER_SIZE; i++) {
	  items.push(slot(start + i))
  }
  buffer.value = items
}
initBuffer(0)

// ── 滚动状态 ──────────────────────────────────────────
const translateY = ref(0)   // track 实时 CSS translateY
const anchorY    = ref(0)   // touch 锁定的基准位置
const isAnimating = ref(false)
const pageNo = ref(0)       // 当前页码（原版计数器方式）

const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTime = ref(0)

let animTimer = null
let fromPageNo = 0          // 动画开始前的旧页码，供 change 事件用
let animateToTargetY = 0    // 动画目标位置，touch 时防抖动

// ── 像素 → 槽位索引（原版 getCurrentCursor） ──────────
// 用 anchorY（page-aligned 整页位置）算出当前在第几个槽。
// +1 是浮点容错：避免 pageHeight 除不尽时 floor 偏小 1，保证
// translateY 落在某一页范围内就能归到该页，不出现「悬空」的中间值。
function getCursor() {
  return Math.min(
    BUFFER_SIZE - 1,
    Math.max(0, Math.floor((Math.abs(anchorY.value) + 1) / pageHeight.value))
  )
}

// ── 触摸事件 ──────────────────────────────────────────
function touchstart(e) {
  touchStartX.value = e.touches[0].pageX
  touchStartY.value = e.touches[0].pageY
  touchStartTime.value = Date.now()
  // anchorY page-aligned：用「当前 cursor × pageHeight」代替直接存 translateY。
  // 优点：pageHeight 若除不尽（如 779.333…），链式 ±pageHeight 多次后会偏离
  // 整数位；每次 touchstart 用 cursor × pageHeight 重新算，保证 anchorY
  // 永远在整页边界上，累积误差每轮清零。
  const rawY = isAnimating.value ? animateToTargetY : translateY.value
  const cur = Math.min(BUFFER_SIZE - 1, Math.max(0, Math.floor((Math.abs(rawY) + 1) / pageHeight.value)))
  anchorY.value = -(cur * pageHeight.value)
}

function touchmove(e) {
  if (isAnimating.value) return
  const diffY = e.touches[0].pageY - touchStartY.value

  if (pageNo.value <= 0 && diffY > 0) { emit('totop'); return }
  if (pageNo.value >= maxPageNo.value && diffY < 0) { emit('tobottom'); return }

  translateY.value = anchorY.value + diffY
}

function touchend(e) {
  if (isAnimating.value) return

  const endX = e.changedTouches[0].pageX
  const endY = e.changedTouches[0].pageY

  const dx = Math.abs(endX - touchStartX.value)
  const dy = Math.abs(endY - touchStartY.value)
  if (dx < props.pressThreshold && dy < props.pressThreshold) {
    const elapsed = Date.now() - touchStartTime.value
    const cur = getCursor()
    const data = {
      current: {
        pageNo: pageNo.value,
        slotIndex: cur,
        item: props.list[pageNo.value] ?? null,
      },
    }
    emit(elapsed >= props.longpressDelay ? 'longpress' : 'click', data)
    translateY.value = anchorY.value
    return
  }

  const diffY = endY - touchStartY.value
  if (diffY === 0 || Math.abs(diffY) <= 15) {
    translateY.value = anchorY.value; return
  }

  const scrollDown = diffY < 0
  if (pageNo.value <= 0 && !scrollDown) { translateY.value = anchorY.value; return }
  if (pageNo.value >= maxPageNo.value && scrollDown) { translateY.value = anchorY.value; return }

  const scrollDist = Math.abs(translateY.value - anchorY.value)
  const stepCount  = Math.max(1, Math.round(scrollDist / pageHeight.value))

  let targetPageNo = scrollDown
    ? Math.min(maxPageNo.value, pageNo.value + stepCount)
    : Math.max(0, pageNo.value - stepCount)

  if (targetPageNo === pageNo.value) { translateY.value = anchorY.value; return }

  const scrollStep = targetPageNo - pageNo.value

  animateTo(scrollDown, targetPageNo, scrollStep)
}
function touchcancel() {
  if (isAnimating.value) return
  translateY.value = anchorY.value
}

// ── 吸附动画 (easeOutCubic) ──────────────────────────
function animateTo(scrollDown, targetPage, scrollStep, duration = 200) {
  isAnimating.value = true
  fromPageNo = pageNo.value

  // targetY = -(cursor + scrollStep) × pageHeight
  // 用整型 cursor + 整型步数直接算，避免 anchorY ± scrollStep × pageHeight
  // 的链式计算产生浮点漂移。结果永远是整页对齐，动画终点精准落在页边界上。
  let targetY = -(getCursor() + scrollStep) * pageHeight.value
  animateToTargetY = targetY

  // 预旋转：动画开始前处理 buffer，避免动画结束后闪烁
  const targetCur = Math.min(BUFFER_SIZE - 1,
    Math.max(0, Math.floor((Math.abs(targetY) + 1) / pageHeight.value)))
  const willRotate = (scrollDown && targetCur >= BUFFER_SIZE - 1) ||
                     (!scrollDown && targetCur <= 0)

  if (willRotate && rotateBuffer(scrollDown, targetPage)) {
    // 旋转后 ±pageHeight 补偿了 buffer 偏移，cursor 已变。用新 cursor
    // 重算 targetY，结果仍是整页对齐，不与历史 anchorY 链式计算。
    targetY = -(getCursor() + scrollStep) * pageHeight.value
    animateToTargetY = targetY
  }

  const startY = translateY.value
  const diff   = targetY - startY
  const t0     = Date.now()

  function step() {
    const p = Math.min(1, (Date.now() - t0) / duration)
    const pp = 1 - p; const ease = 1 - pp * pp * pp
    translateY.value = startY + diff * ease

    if (p < 1) {
      animTimer = setTimeout(step, 8)
    } else {
      translateY.value = targetY
      anchorY.value = targetY
      animTimer = null

      {
        const cur = getCursor()
        pageNo.value = targetPage
        isAnimating.value = false
        console.log('[card] step ' + fromPageNo + '→' + targetPage + ' ' + bufStr() + 'cur:' + cur + ' tY:' + Math.round(translateY.value))

        function slotInfo(pn) {
          if (pn < 0 || pn >= props.list.length) return null
          const idx = buffer.value.findIndex(s => s.pageNo === pn)
          return {
            pageNo: pn,
            slotIndex: idx >= 0 ? idx : -1,
            item: props.list[pn] ?? null,
          }
        }
        const nextDir = targetPage > fromPageNo ? 1 : -1
        emit('change', {
          from:    slotInfo(fromPageNo),
          current: slotInfo(targetPage),
          next:    slotInfo(targetPage + nextDir),
        })
      }
    }
  }
  step()
}

// ── 循环缓冲（边缘触发）─────────
// 由 animateTo 预旋转调用；animateTo 已用 targetCur 确认位置到边缘，
// 所以这里不重复检查 getCursor（调用时机保证 position 是正确的）。
// 仅在 page 边界（first≤0 / last≥max）拦截防止越界。
// 返回 true=已旋转, false=无需旋转（触底/顶）
function rotateBuffer(scrollDown, targetPage) {
  if (scrollDown) {
    const last = buffer.value[buffer.value.length - 1]
    if (last.pageNo >= maxPageNo.value) return false
    console.log('[card] rotDn ' + bufStr() + '→ shift.push(' + (last.pageNo + 1) + ')')
    buffer.value.shift()
    buffer.value.push(slot(last.pageNo + 1))
    translateY.value += pageHeight.value
    anchorY.value    += pageHeight.value
    console.log('[card] rotDn ok ' + bufStr())
    return true
  } else {
    const first = buffer.value[0]
    if (first.pageNo <= 0) return false
    console.log('[card] rotUp ' + bufStr() + '→ pop.unshift(' + (first.pageNo - 1) + ')')
    buffer.value.pop()
    buffer.value.unshift(slot(first.pageNo - 1))
    translateY.value -= pageHeight.value
    anchorY.value    -= pageHeight.value
    console.log('[card] rotUp ok ' + bufStr())
    return true
  }
}

// ── 外部控制接口 ──────────────────────────────────────
function goToPage(target) {
  const t = Math.max(0, Math.min(maxPageNo.value, target))
  if (t === pageNo.value) return
  const down = t > pageNo.value
  const step = t - pageNo.value
  animateTo(down, t, step)
}

function nextPage() {
  if (pageNo.value >= maxPageNo.value) { emit('tobottom'); return }
  goToPage(pageNo.value + 1)
}

function prevPage() {
  if (pageNo.value <= 0) { emit('totop'); return }
  goToPage(pageNo.value - 1)
}

function replaceList() {
  if (animTimer) { clearTimeout(animTimer); animTimer = null }
  isAnimating.value = false
  translateY.value = 0
  anchorY.value = 0
  pageNo.value = 0
  initBuffer(0)
}

defineExpose({
  buffer,
  pageNo,
  goToPage,
  nextPage,
  prevPage,
  replaceList,
})
</script>

<style scoped>
.cardlist-root { position: relative; }
.cardlist-track { position: relative; will-change: transform; }
.cardlist-page  { position: relative; overflow: hidden; }
</style>
