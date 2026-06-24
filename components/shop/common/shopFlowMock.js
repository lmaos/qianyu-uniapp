import {
	buildRecommendFeedList,
	getShopCategoryLabel,
	buildShopProductDetailUrl,
	resolveShopProductById
} from '@/components/home/shop/shopProductMock.js'
import { getGoodsDetailMock } from '@/components/shop/detail/shopDetailMock.js'
import { buildPageUrl, getOrderListPageMock } from '@/components/user-center/userCenterMock.js'

const DEFAULT_USER_ID = 'mine-self'

export function buildShopSearchUrl({ keyword = '', categoryId = '' } = {}) {
	return buildPageUrl('/pages/shop/search', {
		keyword,
		categoryId
	})
}

export function buildShopStoreHomeUrl({ merchantId = '', storeId = '', storeName = '', productId = '' } = {}) {
	return buildPageUrl('/pages/shop/store-home', {
		merchantId,
		storeId,
		storeName,
		productId
	})
}

export function buildShopOrderDetailUrl({ orderId = '', userId = DEFAULT_USER_ID, productId = '' } = {}) {
	return buildPageUrl('/pages/shop/order-detail', {
		orderId,
		userId,
		productId
	})
}

export function buildShopMerchantGoodsUrl(userId = DEFAULT_USER_ID) {
	return buildPageUrl('/pages/shop/merchant-goods', { userId })
}

export function buildShopMerchantDeliveryUrl(userId = DEFAULT_USER_ID) {
	return buildPageUrl('/pages/shop/merchant-delivery', { userId })
}

export function buildShopMerchantPromotionUrl(userId = DEFAULT_USER_ID) {
	return buildPageUrl('/pages/shop/merchant-promotion', { userId })
}

export function getShopSearchPageMock({ keyword = '', categoryId = '' } = {}) {
	const normalizedKeyword = `${keyword || ''}`.trim()
	const resolvedCategoryId = normalizeSearchCategoryId(categoryId, normalizedKeyword)
	const categoryLabel = getShopCategoryLabel(resolvedCategoryId)
	const specGroupList = buildSearchSpecGroupList()
	const productList = buildRecommendFeedList(resolvedCategoryId, normalizedKeyword ? 5 : 4)
		.slice(0, 18)
		.map((item, index) => buildSearchProductItem(item, index, specGroupList))
	const brandList = buildSearchBrandList(productList)

	const storeList = Array.from({ length: 3 }, (_, index) => {
		const leadProduct = productList[index * 2] || productList[index] || resolveShopProductById('recommend-product-1-1')
		return {
			id: `search-store-${index + 1}`,
			name: leadProduct.shopName,
			scoreText: `4.${9 - index}`,
			desc: index === 0 ? '官方补贴 · 闪电发货 · 每日上新' : index === 1 ? '轻家电精选 · 直播同款 · 会员专享' : '生活好物集合 · 爆款返场',
			followerText: `${12 + index * 3}.6万关注`,
			tagList: ['官方', '包邮', index === 0 ? '24小时发货' : '客服秒回'],
			storeUrl: buildShopStoreHomeUrl({
				merchantId: leadProduct.merchantId,
				storeId: `search-store-${index + 1}`,
				storeName: leadProduct.shopName,
				productId: leadProduct.id
			}),
			recommendList: productList.slice(index * 2, index * 2 + 2).map((item) => ({
				id: item.id,
				title: item.title,
				price: item.price
			}))
		}
	})

	return {
		categoryId: resolvedCategoryId,
		categoryLabel,
		searchPlaceholder: '搜索商品 / 店铺 / 品牌',
		historyList: ['蓝牙耳机', '空气炸锅', '保温杯', '美妆礼盒'],
		hotKeywordList: ['直播同款', '今日上新', '百亿补贴', '家电国补', '母婴专区', '折扣清仓'],
		shortcutList: [
			{ key: 'subsidy', label: '补贴会场', desc: '官方补贴与品牌直降' },
			{ key: 'coupon', label: '优惠券专区', desc: '店铺券、跨店满减' },
			{ key: 'live', label: '直播热卖', desc: '直播间同款商品集合' }
		],
		suggestionList: buildSuggestionList(normalizedKeyword),
		brandList,
		specGroupList,
		productResultList: productList,
		storeResultList: storeList
	}
}

export function getShopStoreHomeMock({ storeId = '', storeName = '', productId = 'recommend-product-1-1' } = {}) {
	const normalizedProductId = `${productId || 'recommend-product-1-1'}`.trim() || 'recommend-product-1-1'
	const leadProduct = resolveShopProductById(normalizedProductId)
	const resolvedStoreName = `${storeName || leadProduct.shopName || '千语自营旗舰店'}`.trim() || '千语自营旗舰店'
	const baseGoodsList = buildRecommendFeedList('recommend', 3).slice(0, 10)
	const goodsList = baseGoodsList.map((item) => ({
		...item,
		detailUrl: buildShopProductDetailUrl(item)
	}))

	return {
		storeId: `${storeId || `${normalizedProductId}-store`}`.trim(),
		storeInfo: {
			name: resolvedStoreName,
			desc: '主营数码家电 / 家居生活 / 轻奢好物',
			avatarText: `${resolvedStoreName}`.slice(0, 1) || '店',
			avatarBackground: leadProduct.coverBackground,
			followerText: '12.6万',
			scoreText: '4.9',
			replyRateText: '98%',
			goodsCountText: `${goodsList.length * 8}+`,
			coverBackground: 'linear-gradient(135deg, rgba(255, 189, 205, 0.92) 0%, rgba(255, 229, 210, 0.92) 48%, rgba(213, 231, 255, 0.92) 100%)'
		},
		couponList: ['店铺券满299减30', '关注店铺领10元券', '新人首单包邮'],
		guaranteeList: ['假一赔四', '7天价保', '48小时内发货'],
		tabList: [
			{ key: 'home', label: '首页' },
			{ key: 'goods', label: '全部商品' },
			{ key: 'new', label: '新品上架' },
			{ key: 'hot', label: '热销排行' }
		],
		featuredProductList: goodsList.slice(0, 2),
		goodsMap: {
			home: goodsList.slice(0, 6),
			goods: goodsList,
			new: goodsList.slice(2, 10),
			hot: [...goodsList].sort((left, right) => Number(right.price || 0) - Number(left.price || 0)).slice(0, 8)
		}
	}
}

export function buildShopCustomerServiceSheetPreview(productInfo = {}) {
	const baseProduct = productInfo?.id ? productInfo : resolveShopProductById(productInfo?.productId || 'recommend-product-1-1')
	return {
		title: '商品客服',
		desc: '首屏先展示轻量客服信息，后续可异步替换真实客服会话能力。',
		contextSummary: `${baseProduct.shopName} · ${baseProduct.title}`,
		questionList: ['什么时候发货？', '支持哪些售后？', '现在有优惠吗？'],
		menuList: [
			{ key: 'goods-stock', label: '库存与规格', desc: '查看当前商品库存与规格说明' },
			{ key: 'promotion-price', label: '优惠与活动', desc: '了解补贴、券和活动价格' },
			{ key: 'delivery-service', label: '发货与物流', desc: '查看发货时效与物流服务' },
			{ key: 'manual-service', label: '人工客服', desc: '转人工处理复杂问题' }
		],
		faqText: '当前是商品详情页首屏轻量客服数据，后续可以切换成真实客服接口。',
		primaryText: '开始咨询',
		secondaryText: '问题反馈'
	}
}

export function getShopCustomerServiceSheetMock({
	contextType = 'product',
	productId = 'recommend-product-1-1',
	orderId = '',
	userId = DEFAULT_USER_ID
} = {}) {
	if (contextType === 'order') {
		const orderDetail = getShopOrderDetailMock({
			orderId,
			userId,
			productId
		})

		return {
			title: '订单客服',
			desc: '优先展示与当前订单相关的咨询入口。',
			contextSummary: `${orderDetail.summaryCard.statusText} · ${orderDetail.goodsCard.title}`,
			questionList: ['物流什么时候到？', '如何申请售后？', '地址能修改吗？'],
			menuList: [
				{ key: 'order-consult', label: '订单咨询', desc: '处理付款、发票与订单信息问题' },
				{ key: 'delivery-progress', label: '物流进度', desc: '查看物流节点与催促发货' },
				{ key: 'refund-after-sale', label: '退款售后', desc: '申请退货退款与售后协商' },
				{ key: 'manual-service', label: '人工客服', desc: '转人工处理复杂问题' }
			],
			faqText: '当前是商城客服弹层 mock，后续可切换为真实 IM 会话、工单或电话客服入口。',
			primaryText: '开始咨询',
			secondaryText: '投诉反馈'
		}
	}

	const baseProduct = resolveShopProductById(productId)
	return {
		title: '商品客服',
		desc: '先用快捷问题定位，再决定是否进入人工咨询。',
		contextSummary: `${baseProduct.shopName} · ${baseProduct.title}`,
		questionList: ['什么时候发货？', '支持哪些售后？', '直播同款有优惠吗？'],
		menuList: [
			{ key: 'goods-stock', label: '库存与规格', desc: '咨询规格、库存和 SKU 差异' },
			{ key: 'promotion-price', label: '优惠与活动', desc: '了解补贴、券和活动价格' },
			{ key: 'delivery-service', label: '发货与物流', desc: '查看发货时效与物流服务' },
			{ key: 'manual-service', label: '人工客服', desc: '转人工处理复杂问题' }
		],
		faqText: '支持后续替换为真实商品客服会话、FAQ 接口与服务工单系统。',
		primaryText: '开始咨询',
		secondaryText: '问题反馈'
	}
}

export function getShopOrderDetailMock({
	orderId = 'user-order-1',
	userId = DEFAULT_USER_ID,
	productId = ''
} = {}) {
	const orderPageMock = getOrderListPageMock(userId)
	const fallbackIndex = extractIndexFromText(orderId)
	const fallbackOrder = orderPageMock.orderList[fallbackIndex % orderPageMock.orderList.length] || orderPageMock.orderList[0]
	const matchedOrder = orderPageMock.orderList.find((item) => item.id === orderId) || fallbackOrder
	const resolvedProductId = `${productId || `recommend-product-1-${(fallbackIndex % 4) + 1}`}`.trim() || 'recommend-product-1-1'
	const goodsDetail = getGoodsDetailMock(resolvedProductId)
	const summaryMap = {
		'pending-pay': {
			statusText: '待付款',
			statusDesc: '请尽快完成支付，超过时限将自动取消订单。',
			helperText: '剩余 23 分钟自动关闭',
			actionList: ['service', 'pay']
		},
		'pending-send': {
			statusText: '待发货',
			statusDesc: '商家正在备货，发货后会第一时间同步物流。',
			helperText: '支持催单与发票咨询',
			actionList: ['service', 'rebuy']
		},
		'pending-receive': {
			statusText: '待收货',
			statusDesc: '物流正在派送中，请保持电话畅通。',
			helperText: '签收后可进行评价与售后',
			actionList: ['service', 'confirm-receive']
		},
		completed: {
			statusText: '已完成',
			statusDesc: '订单已完成，商品支持再次购买。',
			helperText: '可继续查看售后说明',
			actionList: ['service', 'rebuy']
		},
		refund: {
			statusText: '退款中',
			statusDesc: '退款申请已提交，等待平台或商家处理。',
			helperText: '如有疑问可联系人工客服',
			actionList: ['service', 'refund-progress']
		}
	}
	const summaryConfig = summaryMap[matchedOrder.status] || summaryMap.completed
	const quantity = Number(matchedOrder.quantity || 1)
	const price = Number(matchedOrder.price || goodsDetail.skuList[0]?.price || 0)
	const goodsAmount = Number((price * quantity).toFixed(2))
	const discountAmount = Number((quantity * 6).toFixed(2))
	const payAmount = Math.max(0, Number((goodsAmount - discountAmount).toFixed(2)))

	return {
		orderId: matchedOrder.id,
		productId: resolvedProductId,
		summaryCard: {
			statusText: summaryConfig.statusText,
			statusDesc: summaryConfig.statusDesc,
			helperText: summaryConfig.helperText
		},
		timelineList: buildOrderTimelineList(matchedOrder),
		addressCard: {
			name: '张三',
			phone: '13800000000',
			address: '广东省深圳市南山区科技园科苑路 1001 号 mock 地址'
		},
		goodsCard: {
			title: goodsDetail.baseProduct.title,
			specText: matchedOrder.specText || goodsDetail.skuList[0]?.name || '默认规格',
			coverText: matchedOrder.coverText,
			coverBackground: matchedOrder.coverBackground,
			price: formatPrice(price),
			quantity,
			detailUrl: buildShopProductDetailUrl({
				id: resolvedProductId
			})
		},
		amountList: [
			{ key: 'goods', label: '商品金额', value: `¥${formatPrice(goodsAmount)}` },
			{ key: 'freight', label: '运费', value: '¥0' },
			{ key: 'discount', label: '优惠抵扣', value: `-¥${formatPrice(discountAmount)}` },
			{ key: 'pay', label: '实付金额', value: `¥${formatPrice(payAmount)}`, highlight: true }
		],
		infoList: [
			{ key: 'order-id', label: '订单编号', value: matchedOrder.id },
			{ key: 'create-time', label: '下单时间', value: matchedOrder.timeText },
			{ key: 'pay-way', label: '支付方式', value: matchedOrder.status === 'pending-pay' ? '待支付' : '微信支付' },
			{ key: 'invoice', label: '发票信息', value: '个人电子发票' }
		],
		actionList: summaryConfig.actionList.map((actionKey) => ({
			key: actionKey,
			label: resolveOrderActionLabel(actionKey),
			light: actionKey === 'service'
		}))
	}
}

export function getShopMerchantGoodsPageMock() {
	return {
		summaryList: [
			{ key: 'all', label: '全部商品', value: '86' },
			{ key: 'selling', label: '在售中', value: '62' },
			{ key: 'warning', label: '库存预警', value: '8' }
		],
		filterList: [
			{ key: 'all', label: '全部' },
			{ key: 'selling', label: '在售' },
			{ key: 'pending', label: '待上架' },
			{ key: 'warning', label: '库存预警' }
		],
		goodsList: buildRecommendFeedList('recommend', 2).slice(0, 6).map((item, index) => ({
			id: item.id,
			title: item.title,
			price: formatPrice(item.price),
			stockText: `${18 + index * 6} 件库存`,
			statusText: index % 3 === 0 ? '库存预警' : index % 2 === 0 ? '待上架' : '在售中',
			coverText: item.coverText,
			coverBackground: item.coverBackground
		}))
	}
}

export function getShopMerchantDeliveryPageMock() {
	return {
		summaryList: [
			{ key: 'pending', label: '待发货', value: '18' },
			{ key: 'shipping', label: '运输中', value: '26' },
			{ key: 'signed', label: '已签收', value: '42' }
		],
		filterList: [
			{ key: 'pending', label: '待发货' },
			{ key: 'shipping', label: '运输中' },
			{ key: 'signed', label: '已签收' }
		],
		deliveryList: Array.from({ length: 6 }, (_, index) => ({
			id: `delivery-item-${index + 1}`,
			orderId: `shop-order-${index + 1001}`,
			title: `待发货商品 ${index + 1}`,
			specText: index % 2 === 0 ? '高配款 / 云雾灰' : '标准款 / 星曜黑',
			addressText: '深圳市南山区科技园 mock 地址 1001 室',
			status: index % 3 === 0 ? 'shipping' : index % 2 === 0 ? 'signed' : 'pending',
			statusText: index % 3 === 0 ? '运输中' : index % 2 === 0 ? '已签收' : '待发货'
		}))
	}
}

export function getShopMerchantPromotionPageMock() {
	return {
		summaryList: [
			{ key: 'running', label: '进行中活动', value: '6' },
			{ key: 'coupon', label: '优惠券包', value: '12' },
			{ key: 'flash', label: '秒杀场次', value: '3' }
		],
		promotionList: [
			{ key: 'coupon-pack', title: '店铺券拉新活动', statusText: '进行中', statText: '已领取 286 次', desc: '满 199 减 20，提升新客转化' },
			{ key: 'flash-sale', title: '午间秒杀场', statusText: '待开始', statText: '报名商品 18 个', desc: '今日 12:00-14:00 限时秒杀' },
			{ key: 'live-hot', title: '直播同款会场', statusText: '进行中', statText: '曝光 1.2w', desc: '承接直播间商品挂载与会场流量' },
			{ key: 'full-reduction', title: '跨店满减活动', statusText: '草稿', statText: '待发布', desc: '满 299 减 30，支持叠加店铺券' }
		]
	}
}

function buildSuggestionList(keyword) {
	if (!keyword) {
		return []
	}

	return [
		`${keyword} 官方补贴`,
		`${keyword} 直播同款`,
		`${keyword} 爆款推荐`,
		`${keyword} 店铺专场`
	].map((text, index) => ({
		id: `suggestion-${index + 1}`,
		text
	}))
}

function normalizeSearchCategoryId(categoryId, keyword) {
	const normalizedCategoryId = `${categoryId || ''}`.trim()
	if (normalizedCategoryId) {
		return normalizedCategoryId
	}

	return keyword ? 'type-1' : 'recommend'
}

function buildSearchProductItem(productItem, index, specGroupList) {
	const deliveryGroup = specGroupList[0]
	const benefitGroup = specGroupList[1]
	const serviceGroup = specGroupList[2]
	const deliveryOption = deliveryGroup.options[index % deliveryGroup.options.length]
	const benefitOption = benefitGroup.options[(index + 1) % benefitGroup.options.length]
	const serviceOption = serviceGroup.options[(index + 2) % serviceGroup.options.length]
	const brandId = `search-brand-${sanitizeSearchToken(productItem.shopName)}`

	return {
		...productItem,
		detailUrl: buildShopProductDetailUrl(productItem),
		brandId,
		brandName: productItem.shopName,
		commentCount: 960 - index * 17,
		salesCount: 5200 - index * 143,
		recommendScore: 1180 - index * 11,
		specValues: {
			[deliveryGroup.id]: deliveryOption.id,
			[`${deliveryGroup.id}Name`]: deliveryOption.name,
			[benefitGroup.id]: benefitOption.id,
			[`${benefitGroup.id}Name`]: benefitOption.name,
			[serviceGroup.id]: serviceOption.id,
			[`${serviceGroup.id}Name`]: serviceOption.name
		}
	}
}

function buildSearchBrandList(productList) {
	return productList.reduce((result, item) => {
		if (result.some((brand) => brand.id === item.brandId)) {
			return result
		}

		result.push({
			id: item.brandId,
			name: item.shopName
		})
		return result
	}, [])
}

function buildSearchSpecGroupList() {
	return [
		{
			id: 'delivery',
			name: '发货时效',
			options: ['24小时发货', '48小时发货', '次日达'].map((name, index) => ({
				id: `delivery-${index + 1}`,
				name
			}))
		},
		{
			id: 'benefit',
			name: '优惠权益',
			options: ['平台补贴', '店铺券', '直播同款', '包邮到家'].map((name, index) => ({
				id: `benefit-${index + 1}`,
				name
			}))
		},
		{
			id: 'service',
			name: '服务保障',
			options: ['运费险', '7天价保', '坏损包退'].map((name, index) => ({
				id: `service-${index + 1}`,
				name
			}))
		}
	]
}

function sanitizeSearchToken(value) {
	return `${value || 'shop'}`
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

function buildOrderTimelineList(orderItem) {
	const baseTimeline = [
		{ key: 'created', title: '订单创建成功', desc: `下单时间：${orderItem.timeText}`, active: true },
		{ key: 'paid', title: '支付完成', desc: '当前为 mock 支付结果展示', active: orderItem.status !== 'pending-pay' },
		{ key: 'shipping', title: '商家备货 / 发货', desc: '后续可替换真实物流节点', active: !['pending-pay', 'pending-send'].includes(orderItem.status) },
		{ key: 'received', title: '订单完成', desc: '签收后可进入评价或售后', active: ['completed', 'refund'].includes(orderItem.status) }
	]

	return baseTimeline
}

function resolveOrderActionLabel(actionKey) {
	const labelMap = {
		service: '联系客服',
		pay: '继续支付',
		rebuy: '再次购买',
		'confirm-receive': '确认收货',
		'refund-progress': '查看进度'
	}

	return labelMap[actionKey] || '查看详情'
}

function extractIndexFromText(text) {
	const matched = `${text || ''}`.match(/(\d+)/)
	return Math.max(0, Number(matched?.[1] || 1) - 1)
}

function formatPrice(value) {
	const price = Number(value)
	if (!Number.isFinite(price)) {
		return '0.00'
	}

	return `${price.toFixed(2)}`.replace(/\.00$/, '')
}
