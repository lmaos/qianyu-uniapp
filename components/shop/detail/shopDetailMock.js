import { resolveShopProductById } from '@/components/home/shop/shopProductMock.js'

const DETAIL_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
const SKU_NAME_LIST = ['标准款', '高配款', '轻享款', '礼盒款']
const THUMB_BACKGROUND_LIST = [
	'linear-gradient(135deg, #ffe4d6 0%, #fff1f4 100%)',
	'linear-gradient(135deg, #e5efff 0%, #f4ecff 100%)',
	'linear-gradient(135deg, #e3fff2 0%, #effaf4 100%)',
	'linear-gradient(135deg, #fff2d8 0%, #fff7e7 100%)',
	'linear-gradient(135deg, #dff4ff 0%, #eef8ff 100%)'
]
const REVIEW_NAME_LIST = ['小满', '晚风', '知夏', '阿柠', '半夏', '星野']

// 根据商品 ID 生成完整商品详情 mock，后续替换接口时只需要保留返回结构即可。
export function getGoodsDetailMock(productId = 'recommend-product-1-1') {
	const baseProduct = resolveShopProductById(productId)
	const skuList = createSkuList(baseProduct)

	return {
		productId: baseProduct.id,
		baseProduct,
		skuList,
		evaluateSummary: {
			totalCount: 2864,
			sevenDayPositiveRate: '98.7%',
			goodRate: '96%',
			neutralCount: 82,
			badCount: 16
		},
		reviewList: createReviewList(baseProduct),
		shopInfo: createShopInfo(baseProduct),
		introBlocks: createIntroBlocks(baseProduct),
		serviceMarkdown: createServiceMarkdown(baseProduct),
		cartCount: 3
	}
}

// 评价详情页使用同一份 mock 数据源，保证与详情页展示一致。
export function getGoodsEvaluateMock(productId = 'recommend-product-1-1') {
	const detailMock = getGoodsDetailMock(productId)
	return {
		productId: detailMock.productId,
		productTitle: detailMock.baseProduct.title,
		evaluateSummary: detailMock.evaluateSummary,
		reviewList: detailMock.reviewList
	}
}

function createSkuList(baseProduct) {
	return SKU_NAME_LIST.map((skuName, index) => {
		const skuIndex = index + 1
		const price = normalizePrice(baseProduct.price + index * 18 + (index === 3 ? 30 : 0))
		const originalPrice = normalizePrice(baseProduct.originalPrice + index * 20)
		const stockList = [28, 12, 0, 36]
		const stock = stockList[index] ?? 10

		return {
			id: `${baseProduct.id}-sku-${skuIndex}`,
			name: skuName,
			title: `${baseProduct.title} ${skuName}`,
			shortDesc: `${skuName}支持官方补贴与价保服务`,
			thumbnailBackground: THUMB_BACKGROUND_LIST[(skuIndex + baseProduct.id.length) % THUMB_BACKGROUND_LIST.length],
			thumbnailText: `${skuName}`.slice(0, 2),
			price,
			originalPrice,
			soldCount: `${4600 + skuIndex * 320}`,
			subsidyText: skuIndex % 2 === 0 ? '国补立减 30 元' : '平台补贴 20 元',
			discountText: skuIndex % 2 === 0 ? '限时 9 折' : '下单享 95 折',
			fullReductionText: '满 300 减 30',
			promotionText: '默认包邮，支持 7 天保价与发票',
			authTagList: ['7天保价', '支持发票', stock > 0 ? '24小时发货' : '暂无货'],
			logisticsInfo: {
				shipTime: stock > 0 ? (skuIndex % 2 === 0 ? '48小时发货' : '24小时发货') : '暂无货',
				logisticName: stock > 0 ? (skuIndex % 2 === 0 ? '京东物流' : '顺丰速运') : '暂无货'
			},
			afterSaleTagList: stock > 0 ? ['运费险', '坏损包退', '只换不修'] : ['支持发票'],
			stock,
			stockText: stock > 0 ? `库存 ${stock} 件` : '暂无货',
			mediaList: createMediaList(baseProduct, skuIndex),
			paramList: createParamList(skuName, skuIndex),
			benefitText: stock > 0 ? '下单送延保服务' : '当前 SKU 暂无货'
		}
	})
}

function createMediaList(baseProduct, skuIndex) {
	const imageList = Array.from({ length: 5 }, (_, index) => {
		const itemIndex = index + 1
		return {
			id: `${baseProduct.id}-sku-${skuIndex}-image-${itemIndex}`,
			type: 'image',
			url: createImageMockAsset(baseProduct, skuIndex, itemIndex),
			background: THUMB_BACKGROUND_LIST[(skuIndex + itemIndex) % THUMB_BACKGROUND_LIST.length],
			label: `${baseProduct.coverText}${itemIndex}`
		}
	})

	return [
		{
			id: `${baseProduct.id}-sku-${skuIndex}-video`,
			type: 'video',
			url: DETAIL_VIDEO_URL,
			poster: createVideoPoster(baseProduct, skuIndex),
			label: '视频'
		},
		...imageList
	]
}

function createParamList(skuName, skuIndex) {
	return [
		{ label: '规格', value: skuName },
		{ label: '颜色', value: skuIndex % 2 === 0 ? '云雾灰' : '星曜黑' },
		{ label: '容量', value: skuIndex % 2 === 0 ? '512GB' : '256GB' },
		{ label: '包装', value: '官方标配' },
		{ label: '保修', value: '全国联保 1 年' }
	]
}

function createReviewList(baseProduct) {
	return Array.from({ length: 6 }, (_, index) => {
		const reviewIndex = index + 1
		return {
			id: `${baseProduct.id}-review-${reviewIndex}`,
			nickname: REVIEW_NAME_LIST[index % REVIEW_NAME_LIST.length],
			avatarText: REVIEW_NAME_LIST[index % REVIEW_NAME_LIST.length].slice(0, 1),
			avatarBackground: THUMB_BACKGROUND_LIST[index % THUMB_BACKGROUND_LIST.length],
			memberLevel: `会员 Lv.${(index % 4) + 1}`,
			content: `${baseProduct.title} 到手后整体质感不错，包装完整，发货速度也比较快。当前展示为商品详情页评价 mock，后续可以直接替换为真实评价接口返回内容。`,
			imageList: Array.from({ length: index % 3 }, (_, imageIndex) => ({
				id: `${baseProduct.id}-review-${reviewIndex}-image-${imageIndex + 1}`,
				background: THUMB_BACKGROUND_LIST[(index + imageIndex) % THUMB_BACKGROUND_LIST.length],
				label: `图${imageIndex + 1}`
			}))
		}
	})
}

function createShopInfo(baseProduct) {
	return {
		name: `${baseProduct.shopName}`,
		desc: '主营数码家电 / 家居生活 / 轻奢好物',
		avatarText: '店',
		avatarBackground: THUMB_BACKGROUND_LIST[2],
		followerCount: '12.6万'
	}
}

function createIntroBlocks(baseProduct) {
	return [
		{
			id: `${baseProduct.id}-intro-title-1`,
			type: 'title',
			text: '商品亮点'
		},
		{
			id: `${baseProduct.id}-intro-text-1`,
			type: 'text',
			text: `${baseProduct.title} 采用轻量化商城详情 mock 结构，图文模块支持后续直接替换成后台返回的图文富文本。`
		},
		{
			id: `${baseProduct.id}-intro-image-1`,
			type: 'image',
			background: THUMB_BACKGROUND_LIST[1],
			label: '场景图 1'
		},
		{
			id: `${baseProduct.id}-intro-text-2`,
			type: 'text',
			text: '支持图文混排、模块化插入和多张图片连续展示，便于后续接入商品详情接口中的图文介绍字段。'
		},
		{
			id: `${baseProduct.id}-intro-image-2`,
			type: 'image',
			background: THUMB_BACKGROUND_LIST[3],
			label: '场景图 2'
		}
	]
}

function createServiceMarkdown(baseProduct) {
	return `## 服务说明

- 包装清单：${baseProduct.title} 主机、说明书、售后卡
- 发货说明：默认仓发货，库存以当前选中 SKU 为准
- 保障说明：支持发票、价保、运费险等能力按当前 SKU 展示

**温馨提示：** 当前为商品详情页 markdown mock 文本，后续可直接替换为后台编辑器内容。`
}

function normalizePrice(value) {
	const price = Number(value)
	return Number.isFinite(price) ? Number(price.toFixed(2)) : 0
}

function createVideoPoster(baseProduct, skuIndex) {
	const startColor = pickPosterColor(skuIndex)
	const endColor = pickPosterColor(skuIndex + 2)
	const titleText = encodeSvgText(baseProduct.coverText || '视频封面')
	const subText = encodeSvgText(`SKU ${skuIndex} 视频`)
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
			<defs>
				<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="${startColor}" />
					<stop offset="100%" stop-color="${endColor}" />
				</linearGradient>
			</defs>
			<rect width="900" height="900" rx="56" fill="url(#g)" />
			<circle cx="450" cy="390" r="112" fill="rgba(255,255,255,0.22)" />
			<polygon points="420,330 420,450 528,390" fill="#ffffff" />
			<text x="450" y="600" text-anchor="middle" font-size="72" font-weight="700" fill="rgba(17,24,39,0.78)">${titleText}</text>
			<text x="450" y="680" text-anchor="middle" font-size="36" fill="rgba(17,24,39,0.58)">${subText}</text>
		</svg>
	`

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function createImageMockAsset(baseProduct, skuIndex, itemIndex) {
	const startColor = pickPosterColor(skuIndex + itemIndex)
	const endColor = pickPosterColor(skuIndex + itemIndex + 2)
	const titleText = encodeSvgText(baseProduct.coverText || '商品图')
	const subText = encodeSvgText(`SKU ${skuIndex} · ${itemIndex}/5`)
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
			<defs>
				<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="${startColor}" />
					<stop offset="100%" stop-color="${endColor}" />
				</linearGradient>
			</defs>
			<rect width="900" height="900" rx="56" fill="url(#g)" />
			<text x="450" y="430" text-anchor="middle" font-size="88" font-weight="700" fill="rgba(17,24,39,0.76)">${titleText}</text>
			<text x="450" y="540" text-anchor="middle" font-size="40" fill="rgba(17,24,39,0.58)">${subText}</text>
		</svg>
	`

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function pickPosterColor(index) {
	const colorList = ['#ffd9cf', '#ffeef4', '#dff1ff', '#ebf6ea', '#fff0cf']
	return colorList[index % colorList.length]
}

function encodeSvgText(text) {
	return `${text || ''}`
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}
