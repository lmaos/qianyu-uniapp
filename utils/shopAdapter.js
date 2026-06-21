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
    productId: vo.id,
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
  60: 'closed',
}

// ===== TODO: 后端 OrderDetailVO 补字段后移除（summaryCard / timeline / actionList 降级映射）=====
/**
 * status → 顶部状态摘要（前端临时降级，等后端 OrderDetailVO 补 summaryCard 字段后删除）
 * status 取值对齐 OmsOrder 实体常量：10/20/30/40/50/60
 */
const ORDER_STATUS_SUMMARY_MAP = {
  10: {
    text: '待付款',
    desc: '请尽快完成支付，超过时限将自动取消订单',
    helper: '',
    actions: ['service', 'pay'],
  },
  20: {
    text: '待发货',
    desc: '商家正在备货，发货后会第一时间同步物流',
    helper: '',
    actions: ['service', 'rebuy'],
  },
  30: {
    text: '待收货',
    desc: '物流正在派送中，请保持电话畅通',
    helper: '签收后可进行评价与售后',
    actions: ['service', 'confirm-receive'],
  },
  40: {
    text: '已完成',
    desc: '订单已完成，商品支持再次购买',
    helper: '',
    actions: ['service', 'rebuy'],
  },
  50: {
    text: '已取消',
    desc: '订单已取消',
    helper: '',
    actions: ['service'],
  },
  60: {
    text: '已关闭',
    desc: '订单已关闭',
    helper: '',
    actions: ['service'],
  },
}

const ORDER_FOOTER_ACTION_LABEL_MAP = {
  service: '联系客服',
  pay: '继续支付',
  rebuy: '再次购买',
  'confirm-receive': '确认收货',
  'refund-progress': '查看进度',
}

/**
 * 订单详情底部按钮项
 * @param {string} key
 * @returns {{ key: string, label: string, light: boolean }}
 */
function buildOrderFooterAction(key) {
  return {
    key,
    label: ORDER_FOOTER_ACTION_LABEL_MAP[key] || '查看详情',
    light: key === 'service',
  }
}
// ===== TODO: 后端 OrderDetailVO 补字段后移除（结束）=====

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

/**
 * OrderDetailVO → 前端 orderDetailView
 *
 * 输出 7 块：summaryCard / timelineList / addressCard / goodsList / amountList / infoList / actionList
 *
 * 当前 summaryCard / timelineList / actionList 为前端临时降级映射，
 * 后端 OrderDetailVO 补完字段后改为直接透传 vo.summaryCard / vo.timelineList / vo.actionList。
 *
 * @param {object} vo OrderDetailVO
 */
export function adaptOrderDetail(vo) {
  if (!vo) return null

  const status = Number(vo.status)
  const statusKey = Number.isFinite(status) ? status : null
  const summary = ORDER_STATUS_SUMMARY_MAP[statusKey]
  if (!summary && statusKey !== null) {
    console.warn('未知 status:', vo.status)
  }

  // —— 1. summaryCard（前端临时降级）——
  const summaryCard = summary
    ? {
        statusText: summary.text,
        statusDesc: summary.desc,
        helperText: summary.helper,
      }
    : {
        statusText: vo.displayStatus || '',
        statusDesc: '',
        helperText: '',
      }

  // —— 2. timelineList（前端临时降级，依据时间字段派生）——
  const timelineList = buildOrderDetailTimeline(vo)

  // —— 3. addressCard（前端拼接 address 字符串）——
  const addressCard = adaptOrderDetailAddress(vo.address)

  // —— 4. goodsList（多商品，遍历 items[]）——
  const goodsList = (vo.items || []).map((item) => adaptOrderDetailGoods(item)).filter(Boolean)

  // —— 5. amountList（用 discountDetail 展开）——
  const amountList = buildOrderDetailAmountList(vo)

  // —— 6. infoList（订单信息，按需追加有时间值的节点）——
  const infoList = buildOrderDetailInfoList(vo)

  // —— 7. actionList（前端临时降级）——
  const actionList = (summary?.actions || ['service']).map(buildOrderFooterAction)

  return {
    orderId: vo.orderId,
    orderSn: vo.orderSn,
    status: vo.status,
    displayStatus: vo.displayStatus,
    afterSaleStatus: vo.afterSaleStatus,
    afterSaleType: vo.afterSaleType,
    remark: vo.remark,

    summaryCard,
    timelineList,
    addressCard,
    goodsList,
    amountList,
    infoList,
    actionList,
  }
}

/**
 * AddressSnapshotVO → addressCard
 * 拼接 province/city/district/detail 为单行 address，便于模板直接渲染
 */
function adaptOrderDetailAddress(address) {
  if (!address) {
    return { name: '', phone: '', address: '无收货地址' }
  }
  const segments = [address.province, address.city, address.district, address.detail].filter(
    (seg) => seg !== null && seg !== undefined && `${seg}`.trim() !== ''
  )
  return {
    name: address.name || '',
    phone: address.phone || '',
    address: segments.length ? segments.join(' ') : '无收货地址',
  }
}

/**
 * OrderItemDetailVO → goodsList item
 */
function adaptOrderDetailGoods(item) {
  if (!item) return null
  const title = item.spuName || ''
  return {
    key: `${item.skuId ?? item.id ?? ''}-${item.spuId ?? ''}`,
    spuId: item.spuId,
    skuId: item.skuId,
    title,
    specText: item.skuSpecs || '',
    coverImage: item.skuImage || '',
    coverText: title ? title.slice(0, 1) : '品',
    coverBackground: '',
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal,
    detailUrl: item.spuId ? `/pages/shop/product-detail?productId=${item.spuId}` : '',
  }
}

/**
 * 由 OrderDetailVO 派生 amountList：
 *   - 商品金额（items 小计合计，回退 totalAmount）
 *   - 运费
 *   - 遍历 discountDetail[]
 *   - 实付金额（高亮）
 */
function buildOrderDetailAmountList(vo) {
  const itemsTotal = (vo.items || []).reduce((sum, item) => {
    const sub = Number(item?.subtotal)
    if (Number.isFinite(sub) && sub > 0) return sum + sub
    const price = Number(item?.price)
    const qty = Number(item?.quantity)
    if (Number.isFinite(price) && Number.isFinite(qty)) return sum + price * qty
    return sum
  }, 0)
  const goodsAmount = itemsTotal > 0 ? itemsTotal : Number(vo.totalAmount || 0)

  const list = [
    { key: 'goods', label: '商品金额', value: formatYuan(goodsAmount) },
    { key: 'freight', label: '运费', value: formatYuan(vo.freightAmount) },
  ]

  ;(vo.discountDetail || []).forEach((d) => {
    if (!d) return
    const amount = Number(d.amount)
    if (!Number.isFinite(amount) || amount === 0) return
    list.push({
      key: `discount-${d.type || ''}-${d.id ?? ''}`,
      label: d.name || '优惠抵扣',
      value: `-¥${Math.abs(amount).toFixed(2)}`,
    })
  })

  list.push({
    key: 'pay',
    label: '实付金额',
    value: formatYuan(vo.payAmount),
    highlight: true,
  })
  return list
}

/**
 * 由 OrderDetailVO 派生 infoList，仅追加有时间/留言值的节点
 */
function buildOrderDetailInfoList(vo) {
  const list = [
    { key: 'order-sn', label: '订单编号', value: vo.orderSn || '' },
    { key: 'create-time', label: '下单时间', value: vo.createTime || '' },
  ]
  if (vo.payTime) {
    list.push({ key: 'pay-time', label: '支付时间', value: vo.payTime })
  }
  if (vo.shipTime) {
    list.push({ key: 'ship-time', label: '发货时间', value: vo.shipTime })
  }
  if (vo.payment?.payChannel) {
    list.push({ key: 'pay-channel', label: '支付方式', value: vo.payment.payChannel })
  }
  if (vo.remark) {
    list.push({ key: 'remark', label: '买家留言', value: vo.remark })
  }
  return list
}

/**
 * 由 createTime/payTime/shipTime/receiveTime 派生 timelineList（前端临时降级）
 * 每个有值的时间字段生成一个节点，最后一个为 active
 */
function buildOrderDetailTimeline(vo) {
  const nodes = [
    { key: 'created', title: '订单创建成功', time: vo.createTime },
    { key: 'paid', title: '支付完成', time: vo.payTime },
    { key: 'shipping', title: '商家已发货', time: vo.shipTime },
    { key: 'received', title: '确认收货', time: vo.receiveTime },
  ]
  const present = nodes.filter((n) => n.time)
  if (present.length === 0) return []
  return present.map((n, idx) => ({
    key: n.key,
    title: n.title,
    desc: n.time,
    active: idx === present.length - 1,
  }))
}

function formatYuan(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '¥0.00'
  return `¥${num.toFixed(2)}`
}
