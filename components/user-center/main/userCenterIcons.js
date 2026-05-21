import { createSvgDataUri } from '@/composables/useSvgIcon.js'

function createIcon(svg) {
	return createSvgDataUri(svg)
}

function createBadgeIcon({ startColor, endColor, symbol }) {
	return createIcon(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
			<defs>
				<linearGradient id="g" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
					<stop stop-color="${startColor}" />
					<stop offset="1" stop-color="${endColor}" />
				</linearGradient>
			</defs>
			<circle cx="32" cy="32" r="24" fill="url(#g)" />
			<circle cx="24" cy="22" r="10" fill="rgba(255,255,255,0.18)" />
			${symbol}
		</svg>
	`)
}

function createMinimalIcon(symbol) {
	return createIcon(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
			${symbol}
		</svg>
	`)
}

const actionIconMap = {
	'anchor-center': createBadgeIcon({
		startColor: '#ff8fb3',
		endColor: '#ffb68f',
		symbol: `
			<rect x="26" y="17" width="12" height="18" rx="6" fill="#ffffff" />
			<rect x="24" y="14" width="16" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.92" />
			<path d="M22 24a10 10 0 0 0 20 0" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" />
			<path d="M32 37v5" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" />
		`
	}),
	orders: createBadgeIcon({
		startColor: '#8ec5ff',
		endColor: '#7ca8ff',
		symbol: `
			<rect x="21" y="16" width="22" height="28" rx="6" fill="#ffffff" />
			<rect x="25" y="12" width="14" height="6" rx="3" fill="#ffffff" fill-opacity="0.9" />
			<path d="M26.5 24h11M26.5 30h11M26.5 36h7" stroke="#7ca8ff" stroke-width="3" stroke-linecap="round" />
		`
	}),
	merchant: createBadgeIcon({
		startColor: '#ff9bb3',
		endColor: '#ff7cb1',
		symbol: `
			<path d="M20 26h24v4c0 4.4-3.6 8-8 8h-8c-4.4 0-8-3.6-8-8v-4Z" fill="#ffffff" />
			<path d="M22 24l2-7h16l2 7" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M25 38v8h14v-8" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
		`
	}),
	wallet: createBadgeIcon({
		startColor: '#ffbf6b',
		endColor: '#ff8f7a',
		symbol: `
			<path d="M20 24c0-3.3 2.7-6 6-6h15a3 3 0 0 1 0 6H27.5a3.5 3.5 0 0 0-3.5 3.5V36a6 6 0 0 0 6 6h11a5 5 0 0 0 5-5V26H38" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
			<circle cx="38.5" cy="31" r="2" fill="#ffffff" />
		`
	}),
	'all-functions': createBadgeIcon({
		startColor: '#a58bff',
		endColor: '#7f7bff',
		symbol: `
			<rect x="21" y="21" width="8" height="8" rx="2.6" fill="#ffffff" />
			<rect x="35" y="21" width="8" height="8" rx="2.6" fill="#ffffff" fill-opacity="0.96" />
			<rect x="21" y="35" width="8" height="8" rx="2.6" fill="#ffffff" fill-opacity="0.96" />
			<rect x="35" y="35" width="8" height="8" rx="2.6" fill="#ffffff" />
		`
	}),
	friends: createBadgeIcon({
		startColor: '#72d5b4',
		endColor: '#55c9d2',
		symbol: `
			<circle cx="28" cy="26" r="5.5" fill="#ffffff" />
			<circle cx="39" cy="28" r="4.5" fill="#ffffff" fill-opacity="0.92" />
			<path d="M21.5 42a8.5 8.5 0 0 1 13 0" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" />
			<path d="M36 41c1.4-2 3.5-3.2 6-3.4" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
		`
	}),
	visitors: createBadgeIcon({
		startColor: '#6dd0ff',
		endColor: '#6ca7ff',
		symbol: `
			<path d="M17.5 32s5.4-8 14.5-8 14.5 8 14.5 8-5.4 8-14.5 8-14.5-8-14.5-8Z" fill="#ffffff" fill-opacity="0.96" />
			<circle cx="32" cy="32" r="5" fill="#6ca7ff" />
		`
	}),
	settings: createIcon(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
			<path d="M6 7.5h12M6 12h12M6 16.5h12" stroke="#d94f7b" stroke-width="1.8" stroke-linecap="round" />
			<circle cx="9" cy="7.5" r="1.5" fill="#ffffff" stroke="#d94f7b" stroke-width="1.6" />
			<circle cx="15" cy="12" r="1.5" fill="#ffffff" stroke="#d94f7b" stroke-width="1.6" />
			<circle cx="11" cy="16.5" r="1.5" fill="#ffffff" stroke="#d94f7b" stroke-width="1.6" />
		</svg>
	`),
	edit: createBadgeIcon({
		startColor: '#ff93c2',
		endColor: '#ff7a92',
		symbol: `
			<path d="M23 41.5 38.4 26l4.6 4.6L27.5 46H22v-4.5Z" fill="#ffffff" />
			<path d="m36.2 28.2 3.3-3.4a3.2 3.2 0 0 1 4.5 0l1.2 1.2a3.2 3.2 0 0 1 0 4.5l-3.4 3.3" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
		`
	})
}

export function resolveUserCenterActionIcon(key = '') {
	return actionIconMap[key] || actionIconMap['all-functions']
}

const minimalActionIconMap = {
	wallet: createMinimalIcon(`
		<path d="M5.5 7.4A2.4 2.4 0 0 1 7.9 5h8.7a1.8 1.8 0 0 1 0 3.6H8.4A2.9 2.9 0 0 0 5.5 11.5v4.1a3 3 0 0 0 3 3H17a2.5 2.5 0 0 0 2.5-2.5v-6H15a1.8 1.8 0 1 1 0-3.6h4.5"
			stroke="#667085" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
		<circle cx="15.8" cy="13.4" r="1" fill="#667085" />
	`),
	orders: createMinimalIcon(`
		<rect x="6.2" y="4.8" width="11.6" height="14.8" rx="2.2" stroke="#667085" stroke-width="1.6" />
		<path d="M9 8.6h6M9 12h6M9 15.4h3.6" stroke="#667085" stroke-width="1.6" stroke-linecap="round" />
	`),
	merchant: createMinimalIcon(`
		<path d="M5.4 9.4 6.2 5.9c.1-.6.6-1.1 1.2-1.1h9.2c.6 0 1.1.5 1.2 1.1l.8 3.5" stroke="#667085" stroke-width="1.6" stroke-linecap="round" />
		<path d="M4.8 9.5h14.4v1.1a2.4 2.4 0 0 1-2.4 2.4H7.2a2.4 2.4 0 0 1-2.4-2.4V9.5Z" stroke="#667085" stroke-width="1.6" stroke-linejoin="round" />
		<path d="M7.2 13v5.6h9.6V13" stroke="#667085" stroke-width="1.6" stroke-linecap="round" />
	`),
	anchor: createMinimalIcon(`
		<path d="M4.4 10.6 6.1 7.4l4.2 3.8 1.7-4.2 1.8 4.2 4.1-3.8 1.7 3.2" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		<path d="M5.2 10.6h13.6" stroke="#667085" stroke-width="1.5" stroke-linecap="round" />
		<path d="M6.4 10.6v4.1a1.8 1.8 0 0 0 1.8 1.8h7.6a1.8 1.8 0 0 0 1.8-1.8v-4.1" stroke="#667085" stroke-width="1.5" stroke-linecap="round" />
	`),
	'anchor-center': createMinimalIcon(`
		<path d="M4.4 10.6 6.1 7.4l4.2 3.8 1.7-4.2 1.8 4.2 4.1-3.8 1.7 3.2" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		<path d="M5.2 10.6h13.6" stroke="#667085" stroke-width="1.5" stroke-linecap="round" />
		<path d="M6.4 10.6v4.1a1.8 1.8 0 0 0 1.8 1.8h7.6a1.8 1.8 0 0 0 1.8-1.8v-4.1" stroke="#667085" stroke-width="1.5" stroke-linecap="round" />
	`),
	friends: createMinimalIcon(`
		<circle cx="9" cy="9" r="3" stroke="#667085" stroke-width="1.6" />
		<path d="M4.8 18a4.8 4.8 0 0 1 8.4-3" stroke="#667085" stroke-width="1.6" stroke-linecap="round" />
		<path d="M16.8 10.8v6.2M13.7 13.9H20" stroke="#667085" stroke-width="1.6" stroke-linecap="round" />
	`),
	visitors: createMinimalIcon(`
		<path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" stroke="#667085" stroke-width="1.6" stroke-linejoin="round" />
		<circle cx="12" cy="12" r="2.4" stroke="#667085" stroke-width="1.6" />
	`),
	settings: createMinimalIcon(`
		<path d="M6 7.5h12M6 12h12M6 16.5h12" stroke="#667085" stroke-width="1.6" stroke-linecap="round" />
		<circle cx="9" cy="7.5" r="1.4" fill="#ffffff" stroke="#667085" stroke-width="1.5" />
		<circle cx="15" cy="12" r="1.4" fill="#ffffff" stroke="#667085" stroke-width="1.5" />
		<circle cx="11" cy="16.5" r="1.4" fill="#ffffff" stroke="#667085" stroke-width="1.5" />
	`),
	'all-functions': createMinimalIcon(`
		<rect x="5.3" y="5.3" width="5.4" height="5.4" rx="1.5" stroke="#667085" stroke-width="1.5" />
		<rect x="13.3" y="5.3" width="5.4" height="5.4" rx="1.5" stroke="#667085" stroke-width="1.5" />
		<rect x="5.3" y="13.3" width="5.4" height="5.4" rx="1.5" stroke="#667085" stroke-width="1.5" />
		<rect x="13.3" y="13.3" width="5.4" height="5.4" rx="1.5" stroke="#667085" stroke-width="1.5" />
	`),
	edit: createMinimalIcon(`
		<path d="m7 16.8 7.7-7.7 2.3 2.3-7.7 7.7L6 19l1-2.2Z" stroke="#667085" stroke-width="1.6" stroke-linejoin="round" />
		<path d="m13.8 7.8 1.5-1.5a1.8 1.8 0 0 1 2.5 0l.9.9a1.8 1.8 0 0 1 0 2.5L17.2 11" stroke="#667085" stroke-width="1.6" stroke-linecap="round" />
	`)
}

export function resolveUserCenterMinimalIcon(key = '') {
	return minimalActionIconMap[key] || minimalActionIconMap.settings
}

export const userCenterSettingsIconSvg = actionIconMap.settings

export const userCenterQrCodeIconSvg = createIcon(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" stroke="#0f172a" stroke-width="1.8" />
		<path d="M15 14h1.8v1.8H15zM18.2 14H20v1.8h-1.8zM15 17.2h5M18.2 17.2V20" stroke="#0f172a" stroke-width="1.8" stroke-linecap="square" />
	</svg>
`)

export const userCenterArrowIconSvg = createIcon(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M9 5.5 15 12l-6 6.5" stroke="#98a2b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
`)

export const userCenterQrPanelIconSvg = createIcon(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" fill="none">
		<rect width="320" height="320" rx="40" fill="#ffffff" />
		<rect x="28" y="28" width="72" height="72" rx="16" stroke="#111827" stroke-width="16" />
		<rect x="52" y="52" width="24" height="24" rx="4" fill="#111827" />
		<rect x="220" y="28" width="72" height="72" rx="16" stroke="#111827" stroke-width="16" />
		<rect x="244" y="52" width="24" height="24" rx="4" fill="#111827" />
		<rect x="28" y="220" width="72" height="72" rx="16" stroke="#111827" stroke-width="16" />
		<rect x="52" y="244" width="24" height="24" rx="4" fill="#111827" />
		<rect x="136" y="36" width="20" height="20" rx="4" fill="#111827" />
		<rect x="168" y="36" width="20" height="20" rx="4" fill="#111827" />
		<rect x="136" y="68" width="20" height="20" rx="4" fill="#111827" />
		<rect x="168" y="68" width="20" height="20" rx="4" fill="#111827" />
		<rect x="136" y="124" width="20" height="20" rx="4" fill="#111827" />
		<rect x="168" y="124" width="20" height="20" rx="4" fill="#111827" />
		<rect x="200" y="124" width="20" height="20" rx="4" fill="#111827" />
		<rect x="232" y="124" width="20" height="20" rx="4" fill="#111827" />
		<rect x="264" y="124" width="20" height="20" rx="4" fill="#111827" />
		<rect x="124" y="156" width="20" height="20" rx="4" fill="#111827" />
		<rect x="156" y="156" width="20" height="20" rx="4" fill="#111827" />
		<rect x="220" y="156" width="20" height="20" rx="4" fill="#111827" />
		<rect x="252" y="156" width="20" height="20" rx="4" fill="#111827" />
		<rect x="124" y="188" width="20" height="20" rx="4" fill="#111827" />
		<rect x="188" y="188" width="20" height="20" rx="4" fill="#111827" />
		<rect x="220" y="188" width="20" height="20" rx="4" fill="#111827" />
		<rect x="252" y="188" width="20" height="20" rx="4" fill="#111827" />
		<rect x="124" y="220" width="20" height="20" rx="4" fill="#111827" />
		<rect x="156" y="220" width="20" height="20" rx="4" fill="#111827" />
		<rect x="220" y="220" width="20" height="20" rx="4" fill="#111827" />
		<rect x="188" y="252" width="20" height="20" rx="4" fill="#111827" />
		<rect x="220" y="252" width="20" height="20" rx="4" fill="#111827" />
		<rect x="252" y="252" width="20" height="20" rx="4" fill="#111827" />
	</svg>
`)
