import { getGoodsDetailMock } from '@/components/shop/detail/shopDetailMock.js'

const CART_PRODUCT_CONFIG = [
	{ productId: 'recommend-product-1-1', skuIndex: 0, quantity: 1, checked: true },
	{ productId: 'type-1-product-1-2', skuIndex: 1, quantity: 2, checked: true },
	{ productId: 'type-2-product-1-3', skuIndex: 0, quantity: 1, checked: false },
	{ productId: 'type-3-product-1-1', skuIndex: 3, quantity: 1, checked: true }
]

export function getShopCartMockList() {
	return CART_PRODUCT_CONFIG.map((config, index) => {
		const detailMock = getGoodsDetailMock(config.productId)
		const skuInfo = detailMock.skuList[config.skuIndex] || detailMock.skuList[0]

		return {
			id: `cart-item-${index + 1}`,
			productId: detailMock.productId,
			skuId: skuInfo.id,
			title: skuInfo.title,
			thumbnailBackground: skuInfo.thumbnailBackground,
			thumbnailText: skuInfo.thumbnailText,
			price: Number(skuInfo.price) || 0,
			stock: Number(skuInfo.stock) || 0,
			quantity: Math.min(Math.max(1, config.quantity), Math.max(1, Number(skuInfo.stock) || 1)),
			checked: Boolean(config.checked),
			shipTime: skuInfo.logisticsInfo?.shipTime || '24小时发货'
		}
	})
}

export function buildCartOrderSubmitUrl(selectedCartList = []) {
	const orderItemList = selectedCartList.map((item) => ({
		productId: item.productId,
		skuId: item.skuId,
		quantity: item.quantity
	}))

	return `/pages/shop/order-submit?cartItems=${encodeURIComponent(JSON.stringify(orderItemList))}`
}
