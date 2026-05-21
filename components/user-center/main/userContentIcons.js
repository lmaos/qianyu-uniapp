import { createSvgDataUri } from '@/composables/useSvgIcon.js'

function createViewIcon(color) {
	return createSvgDataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
			<path d="M2.8 12s3.3-5.4 9.2-5.4 9.2 5.4 9.2 5.4-3.3 5.4-9.2 5.4S2.8 12 2.8 12Z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" />
			<circle cx="12" cy="12" r="2.7" fill="${color}" />
		</svg>
	`)
}

function createLikeIcon(color) {
	return createSvgDataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
			<path d="M12 19.3 5.8 13.6a4.1 4.1 0 0 1 0-5.9 4.2 4.2 0 0 1 5.8 0l.4.5.4-.5a4.2 4.2 0 0 1 5.8 0 4.1 4.1 0 0 1 0 5.9L12 19.3Z" fill="${color}" />
		</svg>
	`)
}

function createCommentIcon(color) {
	return createSvgDataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
			<path d="M6 6.8h12a2 2 0 0 1 2 2v6.1a2 2 0 0 1-2 2H11l-3.9 3v-3H6a2 2 0 0 1-2-2V8.8a2 2 0 0 1 2-2Z" fill="${color}" />
		</svg>
	`)
}

function createShareIcon(color) {
	return createSvgDataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
			<path d="M9.2 14.8 16.8 7.2M12.4 7.2h4.4v4.4" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M16.4 13.5v2a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2V9.6a2 2 0 0 1 2-2h2" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	`)
}

export const userViewStatIconSvg = createViewIcon('#ffffff')
export const userLikeStatIconSvg = createLikeIcon('#ffffff')
export const userCommentStatIconSvg = createCommentIcon('#ffffff')

export const userViewStatDarkIconSvg = createViewIcon('#475467')
export const userLikeStatDarkIconSvg = createLikeIcon('#475467')
export const userCommentStatDarkIconSvg = createCommentIcon('#475467')
export const userShareStatDarkIconSvg = createShareIcon('#475467')
