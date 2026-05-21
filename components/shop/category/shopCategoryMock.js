import { buildShopProductDetailUrl } from '@/components/home/shop/shopProductMock'

const LEGACY_ENTRY_CATEGORY_MAP = {
	recommend: 'computer-office',
	'type-1': 'digital',
	'type-2': 'home-appliance',
	'type-3': 'personal-care',
	'type-4': 'home-furniture',
	'type-5': 'fashion'
}

const FIRST_CATEGORY_CONFIG = [
	{
		id: 'computer-office',
		name: '电脑办公',
		secondCategories: [
			createSecondCategoryConfig('network-products', '网络产品', ['路由器', '交换机', '网线', '光纤模块', '机柜', '配线架'], ['华为', 'TP-LINK', '锐捷', 'H3C', '腾达', '中兴'], [
				createSpecGroup('connection', '连接方式', ['Wi-Fi 6', '千兆有线', 'POE供电']),
				createSpecGroup('scene', '适用场景', ['家用', '办公', '企业'])
			]),
			createSecondCategoryConfig('office-paper', '办公用纸', ['复印纸', '相片纸', '条码标签纸', '卡纸', '电脑打印纸', '收银纸', '不干胶标签纸', '工程纸'], ['得力', '晨光', '齐心', 'Double A', 'APP', '金旗舰'], [
				createSpecGroup('size', '纸张规格', ['A4', 'A3', 'B5']),
				createSpecGroup('weight', '纸张克重', ['70g', '80g', '100g'])
			]),
			createSecondCategoryConfig('office-consumables', '办公耗材', ['硒鼓', '墨盒', '碳粉', '色带', '热敏纸', '装订耗材'], ['惠普', '佳能', '兄弟', '天威', '格之格', '爱普生'], [
				createSpecGroup('consumable-type', '耗材类型', ['原装', '兼容', '大容量']),
				createSpecGroup('fit-model', '适配场景', ['家用', '小型办公', '企业办公'])
			]),
			createSecondCategoryConfig('office-equipment', '办公设备', ['打印机', '扫描仪', '碎纸机', '考勤机', '塑封机', '点钞机'], ['得力', '联想', '惠普', '爱普生', '晨光', '中控'], [
				createSpecGroup('equipment-scene', '使用场景', ['桌面办公', '财务室', '会议室']),
				createSpecGroup('equipment-level', '设备档位', ['入门款', '主力款', '高效款'])
			])
		]
	},
	{
		id: 'digital',
		name: '数码',
		secondCategories: [
			createSecondCategoryConfig('smart-learning', '智能学习', ['电纸书', '学习机', '录音笔', '电子词典/词典笔', '翻译机', '智能手写板'], ['科大讯飞', '步步高', '文石', '汉王', '网易有道', '小度'], [
				createSpecGroup('grade-level', '适用阶段', ['小学', '初中', '高中']),
				createSpecGroup('memory', '存储版本', ['64GB', '128GB', '256GB'])
			]),
			createSecondCategoryConfig('audio-equipment', '音频设备', ['耳机', '音箱', '麦克风', '播放器', '声卡', '收音设备'], ['索尼', 'JBL', '漫步者', '飞利浦', '小米', 'beats'], [
				createSpecGroup('wear-mode', '佩戴方式', ['头戴式', '入耳式', '开放式']),
				createSpecGroup('noise-cancel', '降噪等级', ['无降噪', '主动降噪', '旗舰降噪'])
			]),
			createSecondCategoryConfig('camera-video', '摄影摄像', ['运动相机', '微单', '镜头', '稳定器', '补光灯', '三脚架'], ['大疆', '索尼', '佳能', '尼康', '富士', '影石'], [
				createSpecGroup('shoot-scene', '拍摄场景', ['旅行', '直播', '专业创作']),
				createSpecGroup('definition', '清晰度', ['4K', '6K', '8K'])
			]),
			createSecondCategoryConfig('smart-wear', '智能穿戴', ['智能手表', '运动手环', '儿童手表', 'AR眼镜', '健康设备', '定位器'], ['华为', '小米', 'Apple', 'OPPO', '荣耀', 'vivo'], [
				createSpecGroup('wear-scene', '佩戴场景', ['日常', '运动', '儿童']),
				createSpecGroup('watch-network', '联网方式', ['蓝牙版', 'eSIM版', '独立通话'])
			])
		]
	},
	{
		id: 'home-appliance',
		name: '家用电器',
		secondCategories: [
			createSecondCategoryConfig('air-conditioner', '空调', ['壁挂式空调', '柜式空调', '中央空调', '新风系统', '除湿机', '空调配件']),
			createSecondCategoryConfig('kitchen-appliance', '厨房电器', ['电饭煲', '空气炸锅', '料理机', '净水器', '蒸烤箱', '洗碗机']),
			createSecondCategoryConfig('living-appliance', '生活电器', ['吸尘器', '洗地机', '电风扇', '加湿器', '除螨仪', '挂烫机']),
			createSecondCategoryConfig('video-audio', '影音家电', ['电视', '投影仪', '回音壁', '音箱', '机顶盒', '家庭影院'])
		]
	},
	{
		id: 'personal-care',
		name: '个护美妆',
		secondCategories: [
			createSecondCategoryConfig('skin-care', '护肤', ['面霜', '精华', '面膜', '爽肤水', '乳液', '防晒']),
			createSecondCategoryConfig('make-up', '彩妆', ['粉底', '口红', '眼影', '眉笔', '散粉', '腮红']),
			createSecondCategoryConfig('hair-care', '美发造型', ['吹风机', '卷发棒', '直发器', '染发膏', '护发精油', '发膜']),
			createSecondCategoryConfig('oral-care', '口腔护理', ['电动牙刷', '冲牙器', '牙膏', '漱口水', '牙线', '牙刷'])
		]
	},
	{
		id: 'home-furniture',
		name: '家居家装',
		secondCategories: [
			createSecondCategoryConfig('bedroom', '卧室家具', ['床', '床垫', '床头柜', '梳妆台', '衣柜', '斗柜']),
			createSecondCategoryConfig('living-room', '客厅家具', ['沙发', '茶几', '电视柜', '单椅', '边柜', '地毯']),
			createSecondCategoryConfig('kitchen-supplies', '厨具用品', ['锅具', '刀具', '餐具', '保温杯', '砧板', '收纳架']),
			createSecondCategoryConfig('home-textile', '家纺', ['被子', '四件套', '枕头', '毛毯', '床笠', '凉席'])
		]
	},
	{
		id: 'fashion',
		name: '服饰内衣',
		secondCategories: [
			createSecondCategoryConfig('women-fashion', '女装', ['连衣裙', '衬衫', '西装', '针织衫', '半身裙', '外套']),
			createSecondCategoryConfig('men-fashion', '男装', ['T恤', '衬衫', '休闲裤', '夹克', '西装', '卫衣']),
			createSecondCategoryConfig('underwear', '内衣', ['文胸', '家居服', '内裤', '塑身衣', '袜子', '秋衣秋裤']),
			createSecondCategoryConfig('shoes-bags', '鞋靴箱包', ['运动鞋', '皮鞋', '高跟鞋', '背包', '单肩包', '旅行箱'])
		]
	},
	{
		id: 'sports',
		name: '运动户外',
		secondCategories: [
			createSecondCategoryConfig('fitness', '健身训练', ['跑步机', '哑铃', '瑜伽垫', '筋膜枪', '跳绳', '臂力器']),
			createSecondCategoryConfig('outdoor', '户外装备', ['帐篷', '睡袋', '登山杖', '照明灯', '野餐炉具', '折叠椅']),
			createSecondCategoryConfig('cycling', '骑行运动', ['山地车', '公路车', '头盔', '骑行服', '码表', '打气筒']),
			createSecondCategoryConfig('ball', '球类运动', ['篮球', '足球', '羽毛球', '网球', '乒乓球', '护具'])
		]
	},
	{
		id: 'food',
		name: '食品生鲜',
		secondCategories: [
			createSecondCategoryConfig('snacks', '休闲零食', ['坚果', '饼干', '糕点', '肉干', '膨化食品', '糖果']),
			createSecondCategoryConfig('fresh', '生鲜', ['牛排', '海鲜', '水果', '蔬菜', '速冻食品', '乳品']),
			createSecondCategoryConfig('grain-oil', '粮油调味', ['大米', '面粉', '食用油', '酱油', '火锅底料', '调味礼盒']),
			createSecondCategoryConfig('tea-wine', '茶酒饮料', ['白酒', '红酒', '啤酒', '茶叶', '咖啡', '饮料'])
		]
	},
	{
		id: 'mother-baby',
		name: '母婴',
		secondCategories: [
			createSecondCategoryConfig('milk-powder', '奶粉', ['婴儿奶粉', '儿童奶粉', '孕妇奶粉', '特配奶粉', '羊奶粉', '有机奶粉']),
			createSecondCategoryConfig('diaper', '尿裤湿巾', ['纸尿裤', '拉拉裤', '纸尿片', '湿巾', '隔尿垫', '护理垫']),
			createSecondCategoryConfig('feeding', '喂养用品', ['奶瓶', '消毒器', '辅食机', '餐椅', '吸奶器', '恒温壶']),
			createSecondCategoryConfig('toy', '玩具乐器', ['积木', '毛绒玩具', '遥控玩具', '滑板车', '钢琴', '绘本'])
		]
	},
	{
		id: 'medicine',
		name: '医药保健',
		secondCategories: [
			createSecondCategoryConfig('healthcare', '营养保健', ['维生素', '鱼油', '蛋白粉', '益生菌', '辅酶Q10', '钙片']),
			createSecondCategoryConfig('medical-device', '医疗器械', ['血压计', '血糖仪', '制氧机', '雾化器', '轮椅', '理疗仪']),
			createSecondCategoryConfig('traditional', '中西药品', ['感冒用药', '肠胃用药', '皮肤用药', '跌打损伤', '维矿补益', '慢病用药']),
			createSecondCategoryConfig('care', '健康护理', ['口罩', '创可贴', '护理垫', '酒精棉片', '护具', '体温计'])
		]
	},
	{
		id: 'car',
		name: '汽车用品',
		secondCategories: [
			createSecondCategoryConfig('car-electronics', '车载电器', ['行车记录仪', '车载吸尘器', '车载冰箱', '充气泵', '逆变器', '车载充电']),
			createSecondCategoryConfig('car-care', '美容清洗', ['洗车液', '车蜡', '镀膜剂', '玻璃水', '毛巾', '清洁套装']),
			createSecondCategoryConfig('car-accessory', '汽车装饰', ['坐垫', '脚垫', '方向盘套', '香薰', '摆件', '收纳箱']),
			createSecondCategoryConfig('security', '安全自驾', ['应急电源', '灭火器', '拖车绳', '安全锤', '反光背心', '胎压监测'])
		]
	},
	{
		id: 'luxury',
		name: '奢品',
		secondCategories: [
			createSecondCategoryConfig('bags', '箱包', ['托特包', '链条包', '双肩包', '手拿包', '旅行包', '零钱包']),
			createSecondCategoryConfig('watch', '腕表', ['机械表', '石英表', '情侣表', '智能表', '表带', '表盒']),
			createSecondCategoryConfig('jewel', '珠宝首饰', ['项链', '戒指', '手链', '耳饰', '胸针', '吊坠']),
			createSecondCategoryConfig('luxury-fashion', '轻奢服饰', ['丝巾', '皮带', '太阳镜', '钱包', '鞋靴', '帽饰'])
		]
	}
]

export function getShopCategoryPageMock(entryCategoryId = '') {
	const firstCategoryList = buildFirstCategoryList()
	const initialFirstCategoryId = resolveEntryFirstCategoryId(entryCategoryId, firstCategoryList)

	return {
		firstCategoryList,
		initialFirstCategoryId
	}
}

export function getCategorySearchPageMock(query = {}) {
	const firstCategoryList = buildFirstCategoryList()
	const firstCategoryId = resolveEntryFirstCategoryId(query.firstCategoryId || query.categoryId, firstCategoryList)
	const firstCategory = firstCategoryList.find((item) => item.id === firstCategoryId) || firstCategoryList[0]
	const secondCategory = resolveSecondCategory(firstCategory, query.secondCategoryId, query.thirdCategoryId)
	const activeThirdCategoryId = resolveThirdCategoryId(secondCategory, query.thirdCategoryId)
	const productSourceList = buildSearchProductList(firstCategory, secondCategory)

	return {
		firstCategory,
		secondCategory,
		activeThirdCategoryId,
		productSourceList,
		thirdCategoryTabList: [
			{
				id: '',
				name: '全部'
			},
			...secondCategory.thirdCategoryList.map((item) => ({
				id: item.id,
				name: item.name
			}))
		]
	}
}

export function getMallCategoryHomeMock(entryCategoryId = '', sectionCount = 3) {
	const firstCategoryList = buildFirstCategoryList()
	const firstCategoryId = resolveEntryFirstCategoryId(entryCategoryId, firstCategoryList)
	const firstCategory = firstCategoryList.find((item) => item.id === firstCategoryId) || firstCategoryList[0]
	const primarySecondCategory = firstCategory.secondCategoryList[0]
	const thirdCategoryList = firstCategory.secondCategoryList
		.flatMap((secondCategory) =>
			secondCategory.thirdCategoryList.map((thirdCategory) => ({
				...thirdCategory,
				firstCategoryId: firstCategory.id,
				firstCategoryName: firstCategory.name,
				secondCategoryId: secondCategory.id,
				secondCategoryName: secondCategory.name,
				iconText: `${thirdCategory.name}`.slice(0, 2),
				coverBackground: buildProductCardBackground(thirdCategory.name.length + secondCategory.name.length)
			}))
		)
		.slice(0, 9)

	const newProductList = buildSearchProductList(firstCategory, primarySecondCategory)
		.slice(0, 4)
		.map((productItem, index) => ({
			...productItem,
			compactBadge: productItem.activityTags?.[0] || (index % 2 === 0 ? '精选' : '新品')
		}))

	const feedPool = firstCategory.secondCategoryList.flatMap((secondCategory) =>
		buildSearchProductList(firstCategory, secondCategory)
	)

	return {
		firstCategoryId: firstCategory.id,
		firstCategoryName: firstCategory.name,
		thirdCategoryList,
		newProductList,
		feedProductList: feedPool.slice(0, normalizeEvenCount(Math.max(6, (Number(sectionCount) || 0) * 4)))
	}
}

export function buildMallHomeNavCategoryList() {
	const firstCategoryList = buildFirstCategoryList()
	const legacyCategoryIdList = ['recommend', 'type-1', 'type-2', 'type-3', 'type-4', 'type-5']

	return legacyCategoryIdList.map((categoryId) => {
		if (categoryId === 'recommend') {
			return {
				id: categoryId,
				name: '推荐'
			}
		}

		const mappedFirstCategoryId = resolveEntryFirstCategoryId(categoryId, firstCategoryList)
		const matchedFirstCategory = firstCategoryList.find((item) => item.id === mappedFirstCategoryId)

		return {
			id: categoryId,
			name: matchedFirstCategory?.name || categoryId
		}
	})
}

export function buildCategorySearchUrl(payload = {}) {
	const queryList = []

	appendQuery(queryList, 'firstCategoryId', payload.firstCategoryId)
	appendQuery(queryList, 'secondCategoryId', payload.secondCategoryId)
	appendQuery(queryList, 'thirdCategoryId', payload.thirdCategoryId)

	return `/pages/shop/category-search${queryList.length ? `?${queryList.join('&')}` : ''}`
}

export function buildCategoryListUrl(payload = {}) {
	const queryList = []

	appendQuery(queryList, 'firstCategoryId', payload.firstCategoryId)
	appendQuery(queryList, 'categoryId', payload.categoryId)

	return `/pages/shop/category-list${queryList.length ? `?${queryList.join('&')}` : ''}`
}

export function buildShopSearchPlaceholderUrl() {
	return '/pages/shop/search'
}

function createSecondCategoryConfig(id, name, thirdNames, brands = [], specGroups = []) {
	return {
		id,
		name,
		thirdNames,
		brands,
		specGroups
	}
}

function createSpecGroup(id, name, options) {
	return {
		id,
		name,
		options
	}
}

function buildFirstCategoryList() {
	return FIRST_CATEGORY_CONFIG.map((firstCategory) => ({
		id: firstCategory.id,
		name: firstCategory.name,
		secondCategoryList: firstCategory.secondCategories.map((secondCategory) => {
			const thirdCategoryList = secondCategory.thirdNames.map((thirdName, thirdIndex) => ({
				id: `${secondCategory.id}-third-${thirdIndex + 1}`,
				name: thirdName,
				imageUrl: createCategoryImageAsset(thirdName),
				parentSecondCategoryId: secondCategory.id
			}))

			return {
				id: secondCategory.id,
				name: secondCategory.name,
				anchorId: `anchor-${secondCategory.id}`,
				thirdCategoryList,
				brandList: buildBrandList(secondCategory.brands, secondCategory.name),
				specGroupList: buildSpecGroupList(secondCategory.specGroups, secondCategory.name)
			}
		})
	}))
}

function resolveEntryFirstCategoryId(entryCategoryId, firstCategoryList) {
	const normalizedEntryId = LEGACY_ENTRY_CATEGORY_MAP[entryCategoryId] || entryCategoryId
	const matchedCategory = firstCategoryList.find((item) => item.id === normalizedEntryId)

	return matchedCategory?.id || firstCategoryList[0]?.id || ''
}

function resolveSecondCategory(firstCategory, secondCategoryId, thirdCategoryId) {
	const matchedSecondCategory = firstCategory.secondCategoryList.find((item) => item.id === secondCategoryId)

	if (matchedSecondCategory) {
		return matchedSecondCategory
	}

	if (thirdCategoryId) {
		const secondCategoryByThird = firstCategory.secondCategoryList.find((item) =>
			item.thirdCategoryList.some((thirdItem) => thirdItem.id === thirdCategoryId)
		)

		if (secondCategoryByThird) {
			return secondCategoryByThird
		}
	}

	return firstCategory.secondCategoryList[0]
}

function resolveThirdCategoryId(secondCategory, thirdCategoryId) {
	if (!thirdCategoryId) {
		return ''
	}

	return secondCategory.thirdCategoryList.some((item) => item.id === thirdCategoryId) ? thirdCategoryId : ''
}

function buildBrandList(brandNames, secondCategoryName) {
	const fallbackBrandList = ['京严选', '速享', '品智', '优选', '诚品', '甄选', '旗舰', '自营']
	const sourceBrandList = brandNames.length ? brandNames : fallbackBrandList.map((brandName) => `${brandName}${secondCategoryName}`)

	return sourceBrandList.map((brandName, index) => ({
		id: `brand-${sanitizeId(brandName)}-${index + 1}`,
		name: brandName
	}))
}

function buildSpecGroupList(specGroupList, secondCategoryName) {
	if (specGroupList.length) {
		return specGroupList.map((group) => ({
			id: group.id,
			name: group.name,
			options: group.options.map((optionName, index) => ({
				id: `${group.id}-${index + 1}`,
				name: optionName
			}))
		}))
	}

	return [
		{
			id: 'scene',
			name: '使用场景',
			options: ['家用', '办公', '热门款'].map((name, index) => ({
				id: `scene-${index + 1}`,
				name
			}))
		},
		{
			id: 'level',
			name: `${secondCategoryName}档位`,
			options: ['入门款', '主力款', '高配款'].map((name, index) => ({
				id: `level-${index + 1}`,
				name
			}))
		}
	]
}

function buildSearchProductList(firstCategory, secondCategory) {
	return secondCategory.thirdCategoryList.flatMap((thirdCategory, thirdIndex) =>
		Array.from({ length: 6 }, (_, itemIndex) =>
			buildCategoryProductItem({
				firstCategory,
				secondCategory,
				thirdCategory,
				thirdIndex,
				itemIndex,
				brandList: secondCategory.brandList,
				specGroupList: secondCategory.specGroupList
			})
		)
	)
}

function buildCategoryProductItem(payload) {
	const { firstCategory, secondCategory, thirdCategory, thirdIndex, itemIndex, brandList, specGroupList } = payload
	const seed = thirdIndex * 11 + itemIndex + 1
	const brand = brandList[(thirdIndex + itemIndex) % brandList.length]
	const specValues = buildProductSpecValues(specGroupList, seed)
	const currentPrice = normalizePrice(159 + thirdIndex * 78 + itemIndex * 23 + (seed % 3) * 17)
	const originalPrice = normalizePrice(currentPrice + 60 + (seed % 4) * 30)
	const productId = `${secondCategory.id}-product-${thirdIndex + 1}-${itemIndex + 1}`
	const productTitle = `${brand.name} ${thirdCategory.name} ${buildProductSuffix(seed)}`

	const productInfo = {
		id: productId,
		title: productTitle,
		price: currentPrice.toFixed(2),
		originalPrice: originalPrice.toFixed(2),
		shopName: `${brand.name}官方店`,
		activityTags: buildActivityTagList(seed),
		badges: buildBadgeState(seed),
		coverBackground: buildProductCardBackground(seed),
		coverText: thirdCategory.name,
		firstCategoryId: firstCategory.id,
		secondCategoryId: secondCategory.id,
		thirdCategoryId: thirdCategory.id,
		thirdCategoryName: thirdCategory.name,
		brandId: brand.id,
		brandName: brand.name,
		commentCount: 520 + thirdIndex * 168 + itemIndex * 39,
		salesCount: 280 + thirdIndex * 120 + itemIndex * 28,
		recommendScore: 960 - thirdIndex * 12 - itemIndex * 4,
		specValues
	}

	return {
		...productInfo,
		detailUrl: buildShopProductDetailUrl(productInfo)
	}
}

function buildProductSpecValues(specGroupList, seed) {
	return specGroupList.reduce((result, group, index) => {
		const option = group.options[(seed + index) % group.options.length]
		result[group.id] = option.id
		result[`${group.id}Name`] = option.name
		return result
	}, {})
}

function buildProductSuffix(seed) {
	const suffixList = ['高效版', '畅享版', '升级版', '旗舰版', '轻量版', '精选版']
	return suffixList[seed % suffixList.length]
}

function buildActivityTagList(seed) {
	const sourceTagList = ['今日精选', '品质保障', '满减券', '店铺补贴', '限时直降']
	const firstTag = sourceTagList[seed % sourceTagList.length]
	const secondTag = sourceTagList[(seed + 2) % sourceTagList.length]

	return [firstTag, secondTag].filter((tag, index, list) => list.indexOf(tag) === index)
}

function buildBadgeState(seed) {
	return {
		topLeft: seed % 2 === 0 ? '自营' : '新品',
		topRight: seed % 3 === 0 ? '热卖' : '',
		bottomLeft: seed % 4 === 0 ? '品牌' : '',
		bottomRight: seed % 5 === 0 ? '直降' : ''
	}
}

function buildProductCardBackground(seed) {
	const gradientList = [
		'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',
		'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
		'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
		'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
		'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
		'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
	]

	return gradientList[seed % gradientList.length]
}

function createCategoryImageAsset(label) {
	const safeLabel = String(label || '分类').slice(0, 8)
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
			<defs>
				<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#fff1f2" />
					<stop offset="100%" stop-color="#ffe4e6" />
				</linearGradient>
			</defs>
			<rect width="120" height="120" rx="28" fill="url(#g)" />
			<circle cx="60" cy="44" r="18" fill="#fb7185" fill-opacity="0.16" />
			<rect x="24" y="68" width="72" height="18" rx="9" fill="#fb7185" fill-opacity="0.18" />
			<text x="60" y="106" text-anchor="middle" font-size="16" fill="#be123c" font-family="Arial, sans-serif">${safeLabel}</text>
		</svg>
	`

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`
}

function appendQuery(queryList, key, value) {
	if (!value) {
		return
	}

	queryList.push(`${key}=${encodeURIComponent(value)}`)
}

function sanitizeId(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

function normalizePrice(value) {
	return Number(Math.max(0, value).toFixed(2))
}

function normalizeEvenCount(value) {
	const normalizedValue = Math.max(2, Number(value) || 0)
	return normalizedValue % 2 === 0 ? normalizedValue : normalizedValue - 1
}
