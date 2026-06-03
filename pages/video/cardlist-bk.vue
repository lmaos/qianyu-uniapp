<template>
	<view  @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" :style="style">
			<view :style="{ transform: 'translateY(' + translateYVal + 'px)'}">
				<!-- <view ref="myref" :style="{ ...style , backgroundColor: '#0a9dff'}" class="ss2"></view>
						
						
				<view :style="{ ...style , backgroundColor: '#4eff63'}" class="ss2"></view>
						
						
				<view :style="{ ...style , backgroundColor: '#d94fff'}" class="ss2"></view>	 -->
				<template v-for="(item,index) in pageList" :key="item.key">
					<view :style="item.style" class="ss2"></view>
				</template>
			</view>
	</view>
</template>

<script setup>
	import { ref, computed, watch, onMounted } from 'vue'
	
	const props = defineProps({
	  // 外部可以通过 :style 传入宽高等样式，将直接绑定到根 view
	  style: {
	    type: Object,
	    default: () => ({})
	  },
	});
	const pageList = computed(() => [
	  { key: 'A', style: { ...props.style, backgroundColor: '#0a9dff' } },
	  { key: 'B', style: { ...props.style, backgroundColor: '#4eff63' } },
	  { key: 'C', style: { ...props.style, backgroundColor: '#d94fff' } },
	  // { key: 'D', style: { ...props.style, backgroundColor: '#5286ff' } },
	  // { key: 'E', style: { ...props.style, backgroundColor: '#37ffde' } }
	])
	const pageNo = ref(0)
	
	const disableTouch = ref(true)
	const touchStart = ref({})
	const translateYVal = ref(0)
	const translateYValStart = ref(0)
	const isSmoothing = ref(false) // 是否播放吸附动画
	
	const pageHeight = computed(() => {
	  const h = props.style?.height
	  if (h && typeof h === 'string') return parseFloat(h)
	  return uni.getSystemInfoSync().windowHeight  // 降级方案
	})
	
	function touchcancel(e) {
		console.log("touchmove",  e.changedTouches[0])
	}
	
	function touchstart(e) {
		//stopAnimate()
		console.log("touchstart", parseInt (Math.abs(translateYVal.value) / pageHeight.value))
		touchStart.value = e.touches[0];
		
		if (animateToTimeout == null) {
			translateYValStart.value = -parseInt (Math.abs(translateYVal.value) / pageHeight.value) * pageHeight.value // 直接计算 页数 * 页宽
		} else {
			translateYValStart.value = animateToTargetY
		}
	}
	
	function touchmove(e) {
		if (animateToTimeout) {
			touchStart.value = e.touches[0];
			return
		}
		// console.log("touchmove", e.touches[0])
		const pageX = touchStart.value.pageX;
		const pageY = touchStart.value.pageY;
		const moveXY = e.touches[0];
		
		const diffY = parseFloat(moveXY.pageY - pageY);
		
		const translateY = translateYValStart.value + diffY
		// 页数
		if (pageNo.value <= 0 && diffY > 0) {
			return
		}
		
		
		console.log("touchmove" , "Y距离: " + diffY, "pageNo："+ pageNo.value)
		translateYVal.value = translateY;	
	}
	
	function getCurrentCursor() {
		return parseInt((Math.abs(translateYValStart.value) + 1) / pageHeight.value)
	}
	
	function getChangeCursorSize() {
		let scrollDiffY = Math.abs(translateYVal.value - translateYValStart.value)
		return parseInt((scrollDiffY + pageHeight.value) / pageHeight.value)
	}
	
	function touchend(e) {
		// 动画结束，才可以进去
		if (animateToTimeout) {
			return;
		}
		const moveXY = e.changedTouches[0];
		const diffY = moveXY.pageY - touchStart.value.pageY; // 滑动距离
		if (diffY == 0) {
			translateYVal.value = translateYValStart.value
			return
		}
		// true 向下滚动，false 向上滚动
		let scrollDown = diffY < 0
		let targetY = 0
		// 滚动的总差异距离
		// let scrollDiffY = Math.abs(translateYVal.value - translateYValStart.value)
		// let scrollA = parseInt((scrollDiffY + pageHeight.value) / pageHeight.value)  // 翻几页
		let scrollA = getChangeCursorSize() // 变化几个位置
		// let scrollB = parseInt((Math.abs(translateYValStart.value) + 1) / pageHeight.value)  // 当前页所在位置，0 第一页， 1 第二页
		let scrollB = getCurrentCursor(); // 当前的位置。
		
		if (pageNo.value <= 0 && !scrollDown) {
			translateYVal.value = translateYValStart.value
			return
		}
		// 变化差异过小还原
		if(Math.abs(diffY) <= 15) {
			translateYVal.value = translateYValStart.value
			return;
		}
		if (translateYValStart.value + parseInt(diffY) >= 0) {
			translateYVal.value = translateYValStart.value
			return;
		}

		 if (scrollDown) { // 向下滑动
			targetY =  - (scrollA + scrollB) * pageHeight.value
		 } else {
			targetY = - (scrollB - scrollA ) * pageHeight.value
		 }
		// 变化最终位置
		translateYValStart.value = targetY
		console.log("当前页:" + scrollB, "翻几页" + scrollA , scrollDown ? "下":"上", "targetY=" + targetY)
		animateTo(targetY, diffY < 0)
	}
	
	let animateToVersion = 0;
	let animateToTimeout = null
	let animateToTargetY = 0;

	// 动画函数：从当前偏移量平滑移动到目标偏移量，持续 duration 毫秒
	function animateTo(targetY, scrollDown, duration = 200) {
		animateToTimeout = true
		const startY = translateYVal.value
		const diff = targetY - startY
		const startTime = Date.now()	
		animateToTargetY = targetY
		
		function step() {
			const now = Date.now()
			const elapsed = now - startTime
			let progress = Math.min(1, elapsed / duration)
			// easeOutCubic 缓动
			const ease = 1 - Math.pow(1 - progress, 3)
			translateYVal.value = startY + diff * ease
			if (progress < 1) {
				animateToTimeout = setTimeout(step, 4) // 约 60fps
			} else {
				translateYVal.value = targetY
				animeteToTheEnd(scrollDown);
				animateToTimeout = null
				console.log("动画结束")
			}
		}
		step()
	}

	function animeteToTheEnd(scrollDown) {
		let pageCursor = getCurrentCursor()
		console.log("pageCursor:" + pageCursor)
		if (scrollDown) {
			
			if (pageCursor == 2) { // [] [1] [2] -> [1] [2] [0]
				console.log("下滚动，0：pageNo：" + pageNo.value, "pageCursor:" + pageCursor)
				shiftToPush()
				translateYVal.value = -pageHeight.value
				translateYValStart.value = -pageHeight.value
				pageCursor = getCurrentCursor()
				console.log("下滚动, 1: pageNo：" + pageNo.value, "pageCursor:" + pageCursor)
			}
			pageNo.value++
		} else {
			if (pageCursor == 0) { // [0] [1] [] -> [2] [0] [1]
				console.log("上滚动 0：pageNo：" + pageNo.value, "pageCursor:" + pageCursor)
				popToUnshift()	
				translateYVal.value = -pageHeight.value
				translateYValStart.value = -pageHeight.value
				pageCursor = getCurrentCursor()
				console.log("上滚动 1: pageNo：" + pageNo.value, "pageCursor:" + pageCursor)
			}
			pageNo.value--
		}
	}
	
	
	// 方法1：头部元素移到尾部
	function shiftToPush() {
	  if (pageList.value.length === 0) return
	  const first = pageList.value.shift()
	  pageList.value.push(first)
	}
	
	// 方法2：尾部元素移到头部
	function popToUnshift() {
	  if (pageList.value.length === 0) return
	  const last = pageList.value.pop()
	  pageList.value.unshift(last)
	}
</script>

<style>
/* 默认有动画 */
.scroll-content {
 transition: transform 0.3s ease;
}
/* 拖拽时加上这个 class，动画就没了 */
.no-transition {
 transition: none !important;
}
</style>
