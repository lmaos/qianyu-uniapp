// ════════════════════════════════════════════════════════════
// pages/shop/_productUrl.js — 商品详情页 URL 工具
// ════════════════════════════════════════════════════════════
//
// 从原 components/home/shop/shopProductMock.js 抽出来的纯 URL 工具。
// 商城列表（`MallScene`）跳详情时只需要构造 URL，详情页的"首屏预览"数据
// （buildShopProductDetailPreview / resolveShopProductDetailPreview）仍留在
// shopProductMock.js 给详情页自己消费。

/**
 * 把商品对象（或列表里的 summary）编码成商品详情页路由 query
 * 详情页会用这些 query 拼一个"首屏预览"，等真实 API 返回后再覆盖
 */
export function buildShopProductDetailUrl(productInfo = {}) {
	const params = []
	appendParam(params, 'productId', productInfo.id)
	appendParam(params, 'title', productInfo.title || productInfo.name)
	appendParam(params, 'price', productInfo.price)
	appendParam(params, 'originalPrice', productInfo.originalPrice)
	appendParam(params, 'shopName', productInfo.shopName || productInfo.merchantName)
	appendParam(params, 'coverBackground', productInfo.coverBackground || productInfo.thumbImage)
	appendParam(params, 'coverText', productInfo.coverText)
	appendParam(params, 'compactBadge', productInfo.compactBadge)
	if (Array.isArray(productInfo.activityTags) && productInfo.activityTags.length) {
		appendParam(params, 'activityTags', productInfo.activityTags.join('|'))
	}
	if (productInfo.badges && typeof productInfo.badges === 'object') {
		appendParam(params, 'topLeftBadge', productInfo.badges.topLeft)
		appendParam(params, 'topRightBadge', productInfo.badges.topRight)
		appendParam(params, 'bottomLeftBadge', productInfo.badges.bottomLeft)
		appendParam(params, 'bottomRightBadge', productInfo.badges.bottomRight)
	}
	return `/pages/shop/product-detail${params.length ? '?' + params.join('&') : ''}`
}

function appendParam(list, key, value) {
	if (value === undefined || value === null || `${value}` === '') return
	list.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
}
