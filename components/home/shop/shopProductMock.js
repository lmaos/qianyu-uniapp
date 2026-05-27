const CATEGORY_LABEL_MAP = {
	recommend: '推荐',
	'type-1': '数码',
	'type-2': '家用电器',
	'type-3': '个护美妆',
	'type-4': '家居家装',
	'type-5': '服饰内衣'
}

const PRODUCT_TITLE_POOL = [
	'轻享空气炸锅 5L 家用智能菜单大容量',
	'亲肤磨毛四件套 秋冬柔软床品套装',
	'便携保温杯 316 不锈钢大容量',
	'蓝牙降噪耳机 长续航游戏音乐双模式',
	'山野乌龙茶礼盒 清香回甘独立包装',
	'氨基酸洗面奶 温和清洁保湿不紧绷',
	'高腰阔腿牛仔裤 显瘦通勤休闲百搭',
	'便携投影仪 家用卧室高清智能语音'
]
const PRODUCT_ACTIVITY_TAG_POOL = [
	['平台补贴', '满减直降'],
	['限时秒杀', '跨店每满减'],
	['店铺券', '会员专享'],
	['包邮到家', '次日达'],
	['直播同款', '新品尝鲜'],
	['官方补贴', '以旧换新']
]
const PRODUCT_COVER_TEXT_POOL = ['热卖', '新品', '优选', '好评', '爆款', '精选']
const PRODUCT_SHOP_NAME_POOL = [
	'千语自营旗舰店',
	'千语生活馆',
	'轻享家居旗舰店',
	'每日好物专营店',
	'品质电器优选店',
	'城市精选买手店'
]
const PRODUCT_COVER_BACKGROUND_POOL = [
	'linear-gradient(135deg, #ffe4e9 0%, #fff7f3 100%)',
	'linear-gradient(135deg, #ebe6ff 0%, #f8f5ff 100%)',
	'linear-gradient(135deg, #e5faf2 0%, #f4fffb 100%)',
	'linear-gradient(135deg, #fff1de 0%, #fffaf1 100%)',
	'linear-gradient(135deg, #e4f5ff 0%, #f3fbff 100%)'
]
const RECOMMEND_BANNER_POOL = [
	{
		id: 'banner-subsidy',
		title: '推荐会场',
		desc: '精选热卖与补贴商品',
		actionText: '立即抢购',
		tagText: '今日焦点',
		image: '/static/images/home/shop-banner-1.jpg'
	},
	{
		id: 'banner-brand',
		title: '品牌上新',
		desc: '大牌新品直降',
		actionText: '查看新品',
		tagText: '质感新色',
		image: '/static/images/home/shop-banner-2.jpg'
	},
	{
		id: 'banner-life',
		title: '生活好物',
		desc: '家居电器与日用品专区',
		actionText: '进入专区',
		tagText: '温润生活',
		image: '/static/images/home/shop-banner-3.jpg'
	}
]
const RECOMMEND_ZONE_CONFIG = [
	{
		id: 'subsidy-picks',
		title: '百亿补贴',
		tagText: '官方直补',
		moreText: '更多',
		layoutMode: 'quad-card',
		count: 4,
		surfaceBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 247, 250, 0.94) 100%)',
		surfaceShadow: '0 16rpx 40rpx rgba(255, 171, 191, 0.08)'
	},
	{
		id: 'today-picks',
		title: '今日精选',
		tagText: '精选上新',
		moreText: '更多',
		layoutMode: 'double',
		count: 4,
		surfaceBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 250, 0.94) 100%)',
		surfaceShadow: '0 16rpx 40rpx rgba(255, 171, 191, 0.08)'
	},
	{
		id: 'flash-picks',
		title: '超值推荐',
		tagText: '轻奢好物',
		moreText: '更多',
		layoutMode: 'double',
		count: 2,
		surfaceBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.94) 100%)',
		surfaceShadow: '0 16rpx 40rpx rgba(255, 171, 191, 0.08)'
	}
]
const CATEGORY_LEAF_MAP = {
	recommend: ['爆款榜单', '超值补贴', '品牌馆', '生活好物', '居家日用', '热卖会场', '新品尝鲜', '精选店铺', '今日上新'],
	'type-1': ['显卡', '键盘', '固态', '内存', '显示器', '平板电脑', '台式机', '笔记本', '办公配件'],
	'type-2': ['电饭煲', '空气炸锅', '咖啡机', '净水器', '破壁机', '扫地机', '微波炉', '洗地机', '养生壶'],
	'type-3': ['面膜', '精华', '防晒', '口红', '粉底', '香水', '洗护', '护肤套装', '美容工具'],
	'type-4': ['沙发', '床垫', '茶几', '餐桌', '衣柜', '台灯', '地毯', '收纳柜', '床头柜'],
	'type-5': ['羽绒服', '卫衣', '牛仔裤', '运动鞋', '双肩包', '针织衫', '半身裙', '休闲裤', '配饰箱包']
}

// 统一返回分类名称，后续替换分类配置接口时可以直接集中改这里。
export function getShopCategoryLabel(categoryId = 'recommend') {
	return CATEGORY_LABEL_MAP[categoryId] || `${categoryId || '分类'}`
}

// 推荐页顶部 Banner 数据，通常一次性渲染即可。
export function buildRecommendBannerList() {
	return RECOMMEND_BANNER_POOL.map((item) => ({
		...item
	}))
}

// 推荐区固定区域数据，支持双列商品区和一行四列商品区两种模式。
export function buildRecommendZoneList(categoryId = 'recommend') {
	return RECOMMEND_ZONE_CONFIG.map((zoneConfig, index) => ({
		id: zoneConfig.id,
		title: zoneConfig.title,
		moreText: zoneConfig.moreText,
		layoutMode: zoneConfig.layoutMode,
		productList: buildProductList({
			categoryId,
			sectionIndex: index + 1,
			count: normalizeEvenCount(zoneConfig.count)
		})
	}))
}

// 推荐流商品列表走分页思路，`sectionCount` 每次增加后会扩充一批双列商品。
export function buildRecommendFeedList(categoryId = 'recommend', sectionCount = 3) {
	const normalizedCount = normalizeEvenCount(Math.max(6, (Number(sectionCount) || 0) * 4))
	return buildProductList({
		categoryId,
		sectionIndex: 20,
		count: normalizedCount
	})
}

// 生成分类内容下的商品列表数据，触底加载时直接增加数量即可。
export function buildCategoryProductList(categoryId = 'recommend', sectionCount = 3) {
	const normalizedCount = normalizeEvenCount(Math.max(6, (Number(sectionCount) || 0) * 4))
	return buildProductList({
		categoryId,
		sectionIndex: 10,
		count: normalizedCount
	})
}

// 一级分类下的最终子分类，用于分类内容顶部展示。
export function buildCategoryLeafList(categoryId = 'recommend') {
	return (CATEGORY_LEAF_MAP[categoryId] || CATEGORY_LEAF_MAP.recommend).map((name, index) => {
		const seed = index + categoryId.length
		return {
			id: `${categoryId}-leaf-${index + 1}`,
			name,
			iconText: `${name}`.slice(0, 2),
			coverBackground: PRODUCT_COVER_BACKGROUND_POOL[seed % PRODUCT_COVER_BACKGROUND_POOL.length]
		}
	})
}

// 分类内容里的“新品”区域，固定展示一行四列。
export function buildCategoryNewProductList(categoryId = 'recommend') {
	return buildProductList({
		categoryId,
		sectionIndex: 40,
		count: 4
	})
}

// 生成商品详情页路由，直接把商品 ID 和基础信息带过去做 mock 展示。
export function buildShopProductDetailUrl(productInfo = {}) {
	return `/pages/shop/product-detail?productId=${encodeURIComponent(productInfo.id || '')}`
}

// 根据商品 ID 反查商品 mock 数据，详情页只需要携带 productId 即可完成初始化。
export function resolveShopProductById(productId = '') {
	const normalizedId = `${productId || ''}`.trim()
	const matchedGroups = normalizedId.match(/^(.*)-product-(\d+)-(\d+)$/)

	if (!matchedGroups) {
		return buildProductList({
			categoryId: 'recommend',
			sectionIndex: 1,
			count: 1
		})[0]
	}

	const categoryId = matchedGroups[1] || 'recommend'
	const sectionIndex = Number(matchedGroups[2]) || 1
	const itemIndex = Number(matchedGroups[3]) || 1

	return buildProductList({
		categoryId,
		sectionIndex,
		count: itemIndex
	})[itemIndex - 1]
}

// 将路由参数恢复成详情页可直接消费的商品对象。
export function buildShopProductFromQuery(query = {}) {
	return {
		id: `${query.productId || ''}`.trim() || 'shop-product-detail',
		title: `${query.title || '商品详情占位'}`.trim() || '商品详情占位',
		price: normalizePrice(query.price, 199),
		originalPrice: normalizePrice(query.originalPrice, 259),
		shopName: `${query.shopName || '千语自营旗舰店'}`.trim() || '千语自营旗舰店',
		coverBackground: `${query.coverBackground || PRODUCT_COVER_BACKGROUND_POOL[0]}`.trim() || PRODUCT_COVER_BACKGROUND_POOL[0],
		coverText: `${query.coverText || '热卖'}`.trim() || '热卖',
		activityTags: `${query.activityTags || ''}`
			.split('|')
			.map((item) => item.trim())
			.filter(Boolean),
		badges: {
			topLeft: `${query.topLeftBadge || ''}`.trim(),
			topRight: `${query.topRightBadge || ''}`.trim(),
			bottomLeft: `${query.bottomLeftBadge || ''}`.trim(),
			bottomRight: `${query.bottomRightBadge || ''}`.trim()
		}
	}
}

function buildProductList({ categoryId = 'recommend', sectionIndex = 1, count = 4 }) {
	const categoryLabel = getShopCategoryLabel(categoryId)

	return Array.from({ length: count }, (_, index) => {
		const itemIndex = index + 1
		const seed = sectionIndex * 12 + itemIndex * 5 + categoryId.length
		const price = normalizePrice(59 + seed * 3.4, 199)
		const originalPrice = normalizePrice(price + 36 + (seed % 6) * 12, 299)

		return {
			id: `${categoryId}-product-${sectionIndex}-${itemIndex}`,
			title: `${categoryLabel}${PRODUCT_TITLE_POOL[(seed + itemIndex) % PRODUCT_TITLE_POOL.length]}`,
			price,
			originalPrice,
			shopName: PRODUCT_SHOP_NAME_POOL[(seed + sectionIndex) % PRODUCT_SHOP_NAME_POOL.length],
			coverBackground: PRODUCT_COVER_BACKGROUND_POOL[(seed + itemIndex) % PRODUCT_COVER_BACKGROUND_POOL.length],
			coverText: PRODUCT_COVER_TEXT_POOL[(seed + sectionIndex) % PRODUCT_COVER_TEXT_POOL.length],
			compactBadge: seed % 2 === 0 ? '国补' : '补贴',
			activityTags: PRODUCT_ACTIVITY_TAG_POOL[(seed + itemIndex) % PRODUCT_ACTIVITY_TAG_POOL.length],
			badges: buildBadgeMap(seed, categoryLabel)
		}
	})
}

function buildBadgeMap(seed, categoryLabel) {
	return {
		topLeft: seed % 2 === 0 ? '自营' : '',
		topRight: seed % 3 === 0 ? '618' : '',
		bottomLeft: seed % 4 === 0 ? `${categoryLabel}券` : '',
		bottomRight: seed % 5 === 0 ? '包邮' : ''
	}
}

function normalizeEvenCount(value) {
	const normalizedValue = Math.max(2, Number(value) || 0)
	return normalizedValue % 2 === 0 ? normalizedValue : normalizedValue - 1
}

function normalizePrice(value, fallbackValue) {
	const numericValue = Number(value)
	const finalValue = Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallbackValue
	return Number(finalValue.toFixed(2))
}
