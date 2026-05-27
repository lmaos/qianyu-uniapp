export const STATIC_FROST_BACKGROUND_IMAGE =
	"url('/static/images/common/frost-glass-light.png') center / 100% 100% no-repeat"

export const STATIC_FROST_AREA_STYLE = Object.freeze({
	overflow: 'hidden'
})

export function buildStaticFrostBackground(fallbackLayer = 'transparent') {
	return `${STATIC_FROST_BACKGROUND_IMAGE}, ${fallbackLayer}`
}
