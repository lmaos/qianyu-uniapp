export function createSvgDataUri(svg) {
	return `data:image/svg+xml;utf8,${encodeURIComponent(String(svg || '').replace(/\s+/g, ' ').trim())}`
}
