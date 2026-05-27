import { buildStaticFrostBackground, STATIC_FROST_AREA_STYLE } from '@/components/common/frostSurface.js'
import { createSvgDataUri } from '@/composables/useSvgIcon.js'

export const USER_SUB_PAGE_BACKGROUND =
	'linear-gradient(180deg, #fcfdff 0%, #f8fbff 36%, #f4f7fc 100%)'

export const USER_SUB_PAGE_HEADER_BACKGROUND = buildStaticFrostBackground(
	'linear-gradient(180deg, rgba(248, 250, 252, 0.94) 0%, rgba(244, 247, 252, 0.9) 100%)'
)

export const USER_SUB_PAGE_FOOTER_BACKGROUND = buildStaticFrostBackground(
	'linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(244, 247, 252, 0.92) 100%)'
)

export const USER_SUB_PAGE_CARD_BACKGROUND = buildStaticFrostBackground(
	'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 248, 251, 0.98) 100%)'
)

export const USER_SUB_PAGE_HEADER_AREA_STYLE = STATIC_FROST_AREA_STYLE

export const USER_SUB_PAGE_FOOTER_AREA_STYLE = STATIC_FROST_AREA_STYLE

export const USER_SUB_PAGE_BACK_BUTTON_BACKGROUND = buildStaticFrostBackground(
	'rgba(255, 255, 255, 0.88)'
)

export const USER_SUB_PAGE_BACK_BUTTON_BORDER = '1rpx solid rgba(255, 255, 255, 0.94)'

export const userSubPageBackIconSvg = createSvgDataUri(`
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
		<path d="M14.5 5.5 8 12l6.5 6.5" stroke="#0f172a" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
`)
