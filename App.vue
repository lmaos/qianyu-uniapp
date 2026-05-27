<script setup>
	import { onLaunch, onShow } from '@dcloudio/uni-app'
	import { initSafeAreaMetrics } from '@/composables/useSafeAreaMetrics.js'
	import { useIm } from '@/composables/useIm.js'
	import imConfig from '@/core/im/im.config.js'
	import { initUserService } from '@/core/user/UserService.js'

	let startupWarmupScheduled = false
	let imStartupPromise = null

	onLaunch(() => {
		initSafeAreaMetrics()
		console.log('App Launch')
		initUserService({ baseUrl: imConfig.baseUrl })
		syncRootSurfaceBackground()
		initAndroidSystemNavigationBar()
	})

	onShow(() => {
		schedulePostLaunchWarmup()
	})

	async function initImService() {
		const { start } = useIm()
		await start(10001, imConfig)
	}

	function schedulePostLaunchWarmup() {
		if (startupWarmupScheduled) {
			return
		}

		startupWarmupScheduled = true
		runAfterFirstFrame(() => {
			void ensureImServiceStarted()
		})
	}

	async function ensureImServiceStarted() {
		if (imStartupPromise) {
			return imStartupPromise
		}

		imStartupPromise = initImService().catch((error) => {
			console.error('[App] IM 服务初始化失败:', error)
			imStartupPromise = null
			throw error
		})
		return imStartupPromise
	}

	function runAfterFirstFrame(task) {
		// #ifdef H5
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					task()
				})
			})
			return
		}
		// #endif

		setTimeout(task, 32)
	}

	function syncRootSurfaceBackground() {
		// #ifdef H5
		if (typeof document === 'undefined') {
			return
		}

		const rootBackgroundColor = '#f8fafc'
		document.documentElement.style.backgroundColor = rootBackgroundColor
		if (document.body) {
			document.body.style.backgroundColor = rootBackgroundColor
		}
		// #endif
	}

	function initAndroidSystemNavigationBar() {
		// #ifdef APP-PLUS
		const systemInfo = uni.getSystemInfoSync()
		if (systemInfo.platform !== 'android') {
			return
		}
		const applyTransparentNavigationBar = () => {
			const Color = plus.android.importClass('android.graphics.Color')
			plus.android.importClass('android.view.Window')
			const mainActivity = plus.android.runtimeMainActivity()
			const windowAndroid = mainActivity.getWindow()
			const WindowManager = plus.android.importClass('android.view.WindowManager')
			const View = plus.android.importClass('android.view.View')

			// 让页面绘制到系统导航栏区域，再把导航栏本身设为透明。
			windowAndroid.clearFlags(
				WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS |
				WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION
			)
			windowAndroid.getDecorView().setSystemUiVisibility(
				View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
				View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
				View.SYSTEM_UI_FLAG_LAYOUT_STABLE
			)
			windowAndroid.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
			windowAndroid.setNavigationBarColor(Color.TRANSPARENT)
		}

		if (typeof plus === 'undefined') {
			document.addEventListener('plusready', applyTransparentNavigationBar, { once: true })
			return
		}

		applyTransparentNavigationBar()
		// #endif
	}
</script>

<style>
	page,
	html,
	body,
	#app,
	uni-app {
		background: #f8fafc;
		color: #101828;
		height: 100%;
		min-height: 100%;
	}

	uni-page,
	uni-page-wrapper,
	uni-page-body {
		background: transparent;
		color: inherit;
		height: 100%;
		min-height: 100%;
	}

	view,
	text,
	button {
		box-sizing: border-box;
	}

	button {
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		line-height: 1;
	}

	button::after {
		border: 0;
	}
</style>