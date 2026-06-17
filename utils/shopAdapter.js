/**
 * utils/shopAdapter.js — 商城域 VO → 前端数据格式适配
 *
 * 来源：D:/qianyu-mall/docs/mall/app接入实现/03-字段映射对照表 v1.html
 * 作用：将后端 VO 字段映射/重命名为前端组件使用的字段
 *
 * 适配函数均与请求无关，仅做纯数据变换。可独立于 API 调用复用。
 */

/**
 * SpuSimpleVo / SpuListItemVo → 前端 product item
 * 字段差异：
 *   - 后端 name  →  前端 title
 *   - 后端 merchantName  →  前端 shopName
 *   - 后端 mainImage (URL)  →  前端 coverImage
 */
export function adaptProductItem(vo) {
  if (!vo) return null
  return {
    id: vo.id,
    title: vo.name || vo.title,           // 兼容 SpuSimpleVo (name) / SpuListItemVo (title)
    price: vo.price,
    originalPrice: vo.originalPrice,
    shopName: vo.merchantName || vo.shopName,
    coverImage: vo.mainImage,
    coverText: (vo.name || vo.title || '').slice(0, 1),
    sales: vo.sales || 0,
    commentCount: vo.commentCount || 0,
    avgScore: vo.avgScore || 0,
    merchantId: vo.merchantId,
    storeId: vo.storeId,
    storeName: vo.storeName,
    compactBadge: vo.compactBadge || '',
    // 营销字段后端暂未提供
    activityTags: [],
    badges: { topLeft: '', topRight: '', bottomLeft: '', bottomRight: '' },
  }
}

/**
 * SpuDetailVo → 前端 baseProduct
 */
export function adaptSpuDetail(vo) {
  if (!vo) return null
  return {
    id: vo.id,
    title: vo.name,
    subTitle: vo.subTitle,
    price: vo.price,
    originalPrice: vo.originalPrice,
    coverImage: vo.mainImage,
    images: vo.images || [],
    description: vo.description,
    shopName: vo.shopInfo?.shopName || vo.merchantName,
    sales: vo.sales,
    commentCount: vo.commentCount,
    avgScore: vo.avgScore,
    defaultSkuId: vo.defaultSkuId,
    merchantId: vo.merchantId,
    storeId: vo.storeId,
    storeName: vo.storeName,
    specGroups: vo.specGroups || [],
    skuList: (vo.skuList || []).map(adaptSkuItem),
    reviewStat: adaptReviewStat(vo.reviewStat),
    shopInfo: adaptShopSimpleVo(vo.shopInfo),
    // 营销字段后端暂未提供
    activityTags: [],
    badges: { topLeft: '', topRight: '', bottomLeft: '', bottomRight: '' },
  }
}

/**
 * SkuItemVo → 前端 sku item
 */
export function adaptSkuItem(vo) {
  if (!vo) return null
  return {
    id: vo.id,
    name: vo.skuName,
    title: vo.skuName,
    shortDesc: vo.specs,
    price: vo.price,
    originalPrice: vo.originalPrice,
    stock: vo.stock,
    soldCount: 0,                    // SPU 级销量暂用，前端展示 SKU 销量
    coverImage: vo.image,
    paramList: buildParamList(vo.specs, vo._specGroups || []),
    isDefault: vo.isDefault,
  }
}

/**
 * ReviewStatVo → 前端 evaluateSummary
 */
export function adaptReviewStat(vo) {
  if (!vo) return { totalCount: 0, goodRate: '0%', sevenDayPositiveRate: 0, neutralCount: 0, badCount: 0 }
  return {
    totalCount: vo.totalCount || 0,
    goodRate: vo.goodRate || '0%',
    sevenDayPositiveRate: vo.avgScore || 0,
    neutralCount: vo.mediumCount || 0,
    badCount: vo.badCount || 0,
    goodCount: vo.goodCount || 0,
    hasImageCount: vo.hasImageCount || 0,
  }
}

/**
 * ShopSimpleVo（嵌入 SpuDetailVo）→ 前端 shopInfo
 */
export function adaptShopSimpleVo(vo) {
  if (!vo) return { name: '', avatarText: '', avatarBackground: '', desc: '' }
  return {
    merchantId: vo.merchantId,
    storeId: vo.storeId,
    name: vo.shopName,
    avatarText: (vo.shopName || '').slice(0, 1),
    avatarBackground: vo.shopLogo,
    desc: vo.description,
  }
}

/**
 * ReviewItemVO → 前端 review item
 * 后端 images 是 String[]，前端 imageList 期望 { background, label }[]
 */
export function adaptReviewItem(vo) {
  if (!vo) return null
  return {
    id: vo.id,
    nickname: vo.userNick,
    avatarText: (vo.userNick || '匿').slice(0, 1),
    avatarBackground: vo.userAvatar,
    content: vo.content,
    score: vo.score,
    imageList: (vo.images || []).map((url) => ({ background: url, label: '' })),
    specText: vo.skuSpecs,
    merchantReply: vo.merchantReply?.content || null,
    memberLevel: vo.memberLevel || '',
    createTime: vo.createTime,
  }
}

/**
 * CartItemVO → 前端 cart item
 */
export function adaptCartItem(vo) {
  if (!vo) return null
  return {
    id: vo.id,
    productId: vo.spuId,
    skuId: vo.skuId,
    title: vo.spuName,
    specText: vo.skuSpecs,
    coverImage: vo.skuImage,
    coverText: (vo.spuName || '').slice(0, 1),
    price: vo.price,
    stock: vo.stock,
    quantity: vo.quantity,
    checked: vo.checked,
    shipTime: '',
    merchantId: vo.merchantId,
    merchantName: vo.merchantName,
  }
}

/**
 * OrderSimpleVO → 前端 order item
 * 订单列表里的 title / coverText 等从 items[0] 取
 */
export function adaptOrderSimple(vo) {
  if (!vo) return null
  const firstItem = (vo.items || [])[0] || {}
  return {
    id: vo.orderId,
    orderSn: vo.orderSn,
    status: vo.status,
    statusText: vo.displayStatus,
    afterSaleStatus: vo.afterSaleStatus,
    afterSaleType: vo.afterSaleType,
    totalAmount: vo.totalAmount,
    priceText: vo.payAmount,
    totalQuantity: vo.totalQuantity,
    title: firstItem.spuName,
    coverBackground: firstItem.skuImage,
    coverText: (firstItem.spuName || '').slice(0, 1),
    specText: firstItem.skuSpecs,
    price: firstItem.price,
    quantity: firstItem.quantity,
    timeText: vo.createTime,
    items: vo.items || [],
  }
}

/**
 * StoreHomeVO → 前端 storeInfo
 */
export function adaptStoreHome(vo) {
  if (!vo) return null
  return {
    merchantId: vo.merchantId,
    storeId: vo.storeId,
    name: vo.shopName,
    avatarText: (vo.shopName || '').slice(0, 1),
    avatarBackground: vo.shopLogo,
    coverBackground: vo.shopBanner,
    desc: vo.description,
    scoreText: vo.scoreText || String(vo.score || ''),
    goodsCountText: vo.goodsCountText || String(vo.spuCount || 0),
    followerText: vo.followerText || '',
    replyRateText: vo.replyRateText || '',
    spuCount: vo.spuCount,
    salesCount: vo.salesCount,
    hotProducts: (vo.hotProducts || []).map(adaptProductItem),
    newProducts: (vo.newProducts || []).map(adaptProductItem),
  }
}

/**
 * AddressItemVO → 前端 address item
 */
export function adaptAddressItem(vo) {
  if (!vo) return null
  return {
    id: vo.id,
    name: vo.name,
    phone: vo.phone,
    province: vo.province,
    city: vo.city,
    district: vo.district,
    detail: vo.detail,
    address: vo.fullAddress,
    isDefault: vo.isDefault,
    tag: '',
  }
}

/**
 * 将后端 specs ("红色,XL") + specGroups 转换为前端 paramList 格式
 */
export function buildParamList(specs, specGroups) {
  if (!specs) return []
  const values = String(specs).split(',')
  if (!Array.isArray(specGroups) || specGroups.length === 0) {
    return values.map((v) => ({ label: '', value: v }))
  }
  return specGroups.map((group, i) => ({
    label: group.name || '',
    value: values[i] || '',
  }))
}

/**
 * 订单状态码 → 前端 mock key
 */
export const ORDER_STATUS_MAP = {
  10: 'pending-pay',
  20: 'pending-send',
  30: 'pending-receive',
  40: 'completed',
  50: 'cancelled',
}

/**
 * 通用：分页结构提取
 */
export function extractPage(content) {
  if (!content) return { records: [], totalRow: 0, pageNumber: 1, pageSize: 10, totalPage: 0 }
  return {
    records: content.records || [],
    totalRow: content.totalRow || 0,
    pageNumber: content.pageNumber || 1,
    pageSize: content.pageSize || 10,
    totalPage: content.totalPage || 0,
  }
}
