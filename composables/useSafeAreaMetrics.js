import { computed, readonly, ref } from 'vue'

const safeTopPx = ref(0)
const safeBottomPx = ref(0)
const windowWidthPx = ref(375)
const windowHeightPx = ref(667)
const metricsReady = ref(false)

export function initSafeAreaMetrics() {
	const systemInfo = uni.getSystemInfoSync()
	safeTopPx.value = Number(systemInfo.safeAreaInsets?.top || systemInfo.statusBarHeight || 0)
	safeBottomPx.value = resolveSafeBottomPx(systemInfo)
	windowWidthPx.value = Number(systemInfo.windowWidth || systemInfo.screenWidth || 375) || 375
	windowHeightPx.value = Number(systemInfo.windowHeight || systemInfo.screenHeight || 667) || 667
	metricsReady.value = true
}

export function useSafeAreaMetrics() {
	if (!metricsReady.value) {
		initSafeAreaMetrics()
	}

	return {
		safeTopPx: readonly(safeTopPx),
		safeBottomPx: readonly(safeBottomPx),
		windowWidthPx: readonly(windowWidthPx),
		windowHeightPx: readonly(windowHeightPx),
		metricsReady: readonly(metricsReady),
		rpxToPx,
		pxToRpx,
		headerHeightPx,
		footerReservePx
	}
}

function rpxToPx(value) {
	return Math.round((windowWidthPx.value * Number(value || 0)) / 750)
}

function pxToRpx(value) {
	return Math.round((Number(value || 0) * 750) / windowWidthPx.value)
}

function headerHeightPx(rowHeightRpx = 88, safeGapRpx = 0) {
	return safeTopPx.value + rpxToPx(rowHeightRpx + safeGapRpx)
}

function footerReservePx({
	reserveRpx = 0,
	topPaddingRpx = 0,
	innerMinHeightRpx = 0,
	gapRpx = 0
} = {}) {
	const baseReserveRpx = reserveRpx > 0 ? reserveRpx : topPaddingRpx + innerMinHeightRpx + gapRpx
	return rpxToPx(baseReserveRpx) + safeBottomPx.value
}

function resolveSafeBottomPx(deviceInfo) {
	const safeInsetsBottom = Number(deviceInfo?.safeAreaInsets?.bottom || 0)
	if (safeInsetsBottom > 0) {
		return safeInsetsBottom
	}

	const safeAreaBottom = Number(deviceInfo?.safeArea?.bottom || 0)
	const windowHeightValue = Number(deviceInfo?.windowHeight || 0)
	if (safeAreaBottom > 0 && windowHeightValue > 0) {
		return Math.max(windowHeightValue - safeAreaBottom, 0)
	}

	return 0
}
