import { computed, readonly, ref } from 'vue'

const APP_THEME_MAP = {
	dark: {
		key: 'dark',
		pageBackground: '#000000',
		tabBarBackground: '#000000',
		tabBarBorderColor: 'rgba(255, 255, 255, 0.12)',
		tabBarTextColor: 'rgba(255, 255, 255, 0.48)',
		tabBarActiveColor: '#ffffff',
		tabBarShadow: 'none'
	},
	light: {
		key: 'light',
		pageBackground: '#f8fafc',
		tabBarBackground: '#ffffff',
		tabBarBorderColor: '#e8edf3',
		tabBarTextColor: '#667085',
		tabBarActiveColor: '#fe2c55',
		tabBarShadow: '0 -12rpx 30rpx rgba(15, 23, 42, 0.08)'
	}
}

const currentThemeName = ref('light')

function resolveAppTheme(themeName = 'light') {
	return APP_THEME_MAP[themeName] || APP_THEME_MAP.light
}

function setAppTheme(themeName = 'light') {
	currentThemeName.value = resolveAppTheme(themeName).key
}

function setLightTheme() {
	setAppTheme('light')
}

function setDarkTheme() {
	setAppTheme('dark')
}

function resetAppTheme() {
	setLightTheme()
}

export function useAppTheme() {
	const themeConfig = computed(() => resolveAppTheme(currentThemeName.value))

	return {
		themeName: readonly(currentThemeName),
		themeConfig,
		setAppTheme,
		setLightTheme,
		setDarkTheme,
		resetAppTheme
	}
}
