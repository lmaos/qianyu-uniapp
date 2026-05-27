import { buildStaticFrostBackground, STATIC_FROST_AREA_STYLE } from '@/components/common/frostSurface.js'
import { createSvgDataUri } from '@/composables/useSvgIcon.js'

export const SHOP_PAGE_BACKGROUND =
	'linear-gradient(180deg, #fff9fb 0%, #fff2f7 16%, #f8fafc 52%, #f3f6fb 100%)'

export const SHOP_HEADER_BACKGROUND = buildStaticFrostBackground(
	'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 248, 251, 0.9) 100%)'
)

export const SHOP_HEADER_BORDER = '1rpx solid rgba(255, 255, 255, 0.92)'

export const SHOP_HEADER_AREA_STYLE = STATIC_FROST_AREA_STYLE

export const SHOP_HEADER_BUTTON_BACKGROUND = buildStaticFrostBackground(
	'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 247, 250, 0.9) 100%)'
)

export const SHOP_HEADER_BUTTON_ACTIVE_BACKGROUND = buildStaticFrostBackground(
	'linear-gradient(180deg, rgba(255, 244, 248, 0.98) 0%, rgba(255, 233, 241, 0.94) 100%)'
)

export const SHOP_HEADER_BUTTON_BORDER = '1rpx solid rgba(255, 255, 255, 0.92)'

export const SHOP_TOP_BACK_ICON = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M14.5 5L8 12l6.5 7" stroke="#4a5565" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
`)

export const SHOP_TOP_SEARCH_ICON = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<circle cx="10.5" cy="10.5" r="5.8" stroke="#d94f7b" stroke-width="2" />
		<path d="M15 15l4.2 4.2" stroke="#d94f7b" stroke-width="2" stroke-linecap="round" />
	</svg>
`)

export const SHOP_TOP_CART_ICON = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M4 6h1.5c.7 0 1.3.5 1.4 1.2L7.4 10h10.5c.9 0 1.6.8 1.4 1.7l-.8 4a1.5 1.5 0 0 1-1.5 1.2H9.4c-.7 0-1.3-.5-1.4-1.2L6.9 8.6" stroke="#d94f7b" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
		<circle cx="10" cy="19" r="1.3" fill="#d94f7b" />
		<circle cx="17" cy="19" r="1.3" fill="#d94f7b" />
	</svg>
`)

export const SHOP_TOOL_SHOP_ICON = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M5.2 9.1 6 5.7c.1-.6.6-1 1.2-1h9.6c.6 0 1.1.4 1.2 1l.8 3.4" stroke="#475467" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
		<path d="M4.8 9.1h14.4c.7 0 1.2.6 1.2 1.2v1.2c0 1.1-.9 2-2 2h-1c-.8 0-1.5-.4-1.9-1.1l-.2-.4-.2.4c-.4.7-1.1 1.1-1.9 1.1h-1c-.8 0-1.5-.4-1.9-1.1l-.2-.4-.2.4c-.4.7-1.1 1.1-1.9 1.1h-1c-1.1 0-2-.9-2-2v-1.2c0-.6.5-1.2 1.2-1.2Z" stroke="#475467" stroke-width="1.8" stroke-linejoin="round" />
		<path d="M6.4 13.5v4.1c0 .9.7 1.6 1.6 1.6h8c.9 0 1.6-.7 1.6-1.6v-4.1" stroke="#475467" stroke-width="1.8" stroke-linecap="round" />
	</svg>
`)

export const SHOP_TOOL_SERVICE_ICON = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M6.4 10.2a5.6 5.6 0 1 1 11.2 0v3.2a2.8 2.8 0 0 1-2.8 2.8h-5.4" stroke="#475467" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
		<rect x="4.3" y="10.8" width="3.3" height="5.8" rx="1.4" stroke="#475467" stroke-width="1.8" />
		<rect x="16.4" y="10.8" width="3.3" height="5.8" rx="1.4" stroke="#475467" stroke-width="1.8" />
		<path d="M10.2 17.3h3.5" stroke="#475467" stroke-width="1.8" stroke-linecap="round" />
	</svg>
`)

export const SHOP_TOP_FAVORITE_ICON = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M12 19.3 5.8 13.6a4.1 4.1 0 0 1 0-5.9 4.2 4.2 0 0 1 5.8 0l.4.5.4-.5a4.2 4.2 0 0 1 5.8 0 4.1 4.1 0 0 1 0 5.9L12 19.3Z" stroke="#d94f7b" stroke-width="1.9" stroke-linejoin="round" />
	</svg>
`)

export const SHOP_TOP_FAVORITE_ACTIVE_ICON = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M12 20 5.5 14a4.3 4.3 0 0 1 6-6.2l.5.6.5-.6a4.3 4.3 0 0 1 6 6.2L12 20Z" fill="#ff5b90" />
		<path d="M12 20 5.5 14a4.3 4.3 0 0 1 6-6.2l.5.6.5-.6a4.3 4.3 0 0 1 6 6.2L12 20Z" stroke="#ff5b90" stroke-width="1.2" stroke-linejoin="round" />
	</svg>
`)
