import { createSvgDataUri } from '@/composables/useSvgIcon.js'

function createIcon(symbol) {
	return createSvgDataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
			${symbol}
		</svg>
	`)
}

export const playmateTreeHoleIconSvg = createIcon(`
	<path d="M5.2 7.4h13.6a2.2 2.2 0 0 1 2.2 2.2v5.3a2.2 2.2 0 0 1-2.2 2.2H11l-3.8 2.9V17H5.2A2.2 2.2 0 0 1 3 14.9V9.6a2.2 2.2 0 0 1 2.2-2.2Z" stroke="#0f172a" stroke-width="1.7" stroke-linejoin="round" />
	<path d="M8.5 11.1h7M8.5 14.1h4.5" stroke="#d94f7b" stroke-width="1.7" stroke-linecap="round" />
`)

export const playmateBuddyIconSvg = createIcon(`
	<circle cx="9" cy="9" r="3" stroke="#0f172a" stroke-width="1.7" />
	<path d="M4.8 18a4.8 4.8 0 0 1 8.4-3" stroke="#0f172a" stroke-width="1.7" stroke-linecap="round" />
	<path d="M16.8 10.8v6.2M13.7 13.9H20" stroke="#d94f7b" stroke-width="1.7" stroke-linecap="round" />
`)

export const playmateExpandIconSvg = createIcon(`
	<rect x="4.8" y="5" width="14.4" height="14" rx="3" stroke="#0f172a" stroke-width="1.7" />
	<path d="M8.3 9.5h7.4M8.3 13.1h5.2" stroke="#0f172a" stroke-width="1.7" stroke-linecap="round" />
	<circle cx="16.8" cy="16.2" r="2.2" fill="#d94f7b" />
`)

export const playmateEmotionNeedIconSvg = createIcon(`
	<path d="M12 19.3 5.8 13.6a4.1 4.1 0 0 1 0-5.9 4.2 4.2 0 0 1 5.8 0l.4.5.4-.5a4.2 4.2 0 0 1 5.8 0 4.1 4.1 0 0 1 0 5.9L12 19.3Z" fill="#d94f7b" />
`)

export const playmateResponseNeedIconSvg = createIcon(`
	<path d="M4.8 7.2h14.4A1.8 1.8 0 0 1 21 9v6.5a1.8 1.8 0 0 1-1.8 1.8h-6.8l-3.8 2.7v-2.7H4.8A1.8 1.8 0 0 1 3 15.5V9a1.8 1.8 0 0 1 1.8-1.8Z" stroke="#0f172a" stroke-width="1.7" stroke-linejoin="round" />
	<circle cx="9" cy="12.3" r="1" fill="#d94f7b" />
	<circle cx="12" cy="12.3" r="1" fill="#d94f7b" />
	<circle cx="15" cy="12.3" r="1" fill="#d94f7b" />
`)

export const playmateCompanionNeedIconSvg = createIcon(`
	<path d="M6.4 17.6c1.6-2.7 4.1-4.1 5.6-4.1 1.5 0 4 1.4 5.6 4.1" stroke="#0f172a" stroke-width="1.7" stroke-linecap="round" />
	<circle cx="8.8" cy="9.2" r="2.4" stroke="#0f172a" stroke-width="1.7" />
	<circle cx="15.2" cy="9.2" r="2.4" stroke="#d94f7b" stroke-width="1.7" />
`)

export const playmateRecordNeedIconSvg = createIcon(`
	<rect x="6" y="4.8" width="12" height="14.8" rx="2.2" stroke="#0f172a" stroke-width="1.7" />
	<path d="M9 8.6h6M9 12h6M9 15.4h3.6" stroke="#d94f7b" stroke-width="1.7" stroke-linecap="round" />
`)
