/**
 * utils/api.js — 千语商城 Mall Service API 路径常量
 *
 * 对接后端：qianyu-app-service
 * 接口文档：D:/qianyu-mall/docs/mall/app接入实现/02-页面接口映射详案 v1.html
 * 接口基线：mall-api.html（2026-06-04，72 端点）
 *
 * 使用方式：
 *   import API from '@/utils/api'
 *   await request.post({ url: API.PMS_SPU_DETAIL, data: { spuId } })
 *
 * 响应统一通过 import request from '@/composables/baseRequest' 发起：
 *   const { code, response } = await request.post({ url: API.PMS_SPU_DETAIL, data: { spuId } })
 *   if (code === 200) {
 *     const content = response.data.content   // 业务数据
 *   }
 */

export default {
  // ========== CMS 首页聚合 ==========
  CMS_HOME_PAGE: '/api/mall/cms/homePage',
  CMS_TAB_ZONE_LIST: '/api/mall/cms/tabZoneList',

  // ========== PMS 商品（C 端）==========
  PMS_CATEGORY_TREE: '/api/mall/pms/categoryTree',
  PMS_CATEGORY_PAGE: '/api/mall/pms/categoryPage',
  PMS_CATEGORY_SEARCH: '/api/mall/pms/categorySearch',
  PMS_BRAND_LIST: '/api/mall/pms/brandList',
  PMS_SPU_LIST: '/api/mall/pms/spuList',
  PMS_SPU_SEARCH: '/api/mall/pms/spuSearch',
  PMS_SPU_DETAIL: '/api/mall/pms/spuDetail',
  PMS_SPU_DETAIL_BY_SKU: '/api/mall/pms/spuDetailBySku',
  PMS_SKU_LIST: '/api/mall/pms/skuList',

  // ========== OMS 订单/购物车/售后 ==========
  OMS_ORDER_CREATE: '/api/mall/oms/orderCreate',
  OMS_ORDER_LIST: '/api/mall/oms/orderList',
  OMS_ORDER_DETAIL: '/api/mall/oms/orderDetail',
  OMS_ORDER_CANCEL: '/api/mall/oms/orderCancel',
  OMS_ORDER_RECEIVE: '/api/mall/oms/orderReceive',
  OMS_ORDER_DELETE: '/api/mall/oms/orderDelete',
  OMS_CART_ADD: '/api/mall/oms/cartAdd',
  OMS_CART_UPDATE: '/api/mall/oms/cartUpdate',
  OMS_CART_DELETE: '/api/mall/oms/cartDelete',
  OMS_CART_LIST: '/api/mall/oms/cartList',
  OMS_AFTERSALE_APPLY: '/api/mall/oms/aftersaleApply',
  OMS_AFTERSALE_LIST: '/api/mall/oms/aftersaleList',
  OMS_AFTERSALE_DETAIL: '/api/mall/oms/aftersaleDetail',
  OMS_AFTERSALE_CANCEL: '/api/mall/oms/aftersaleCancel',

  // ========== REV 评价（C 端）==========
  REV_REVIEW_LIST: '/api/mall/pms/rev/reviewList',
  REV_REVIEW_STAT: '/api/mall/pms/rev/reviewStat',
  REV_REVIEW_PAGE: '/api/mall/pms/rev/reviewPage',
  REV_REVIEW_SUBMIT: '/api/mall/oms/rev/reviewSubmit',
  REV_MY_REVIEW_LIST: '/api/mall/oms/rev/myReviewList',

  // ========== MCH 商家/店铺（C 端）==========
  MCH_SHOP_HOME: '/api/mall/mch/shopHome',
  MCH_SHOP_PRODUCT_LIST: '/api/mall/mch/shopProductList',
  MCH_STORE_HOME: '/api/mall/mch/storeHome',

  // ========== PAY 支付 ==========
  PAY_APPLY: '/api/mall/pay/payApply',
  PAY_RESULT: '/api/mall/pay/payResult',

  // ========== ADS 地址 ==========
  ADS_ADDRESS_LIST: '/api/mall/ads/addressList',
  ADS_ADDRESS_DETAIL: '/api/mall/ads/addressDetail',
  ADS_ADDRESS_CREATE: '/api/mall/ads/addressCreate',
  ADS_ADDRESS_UPDATE: '/api/mall/ads/addressUpdate',
  ADS_ADDRESS_DELETE: '/api/mall/ads/addressDelete',
  ADS_ADDRESS_SET_DEFAULT: '/api/mall/ads/addressSetDefault',
  ADS_REGION_TREE: '/api/mall/ads/regionTree',

  // ========== FAV 收藏 ==========
  FAV_ADD: '/api/mall/fav/favAdd',
  FAV_CANCEL: '/api/mall/fav/favCancel',
  FAV_LIST: '/api/mall/fav/favList',
  FAV_STATUS: '/api/mall/fav/favStatus',
  FAV_BATCH_STATUS: '/api/mall/fav/favBatchStatus',
  FAV_BATCH_CANCEL: '/api/mall/fav/favBatchCancel',

  // ========== HIS 历史/搜索 ==========
  HIS_BROWSE_LIST: '/api/mall/his/browseHistoryList',
  HIS_BROWSE_RECORD: '/api/mall/his/browseRecord',
  HIS_BROWSE_DELETE: '/api/mall/his/browseHistoryDelete',
  HIS_SEARCH_HOT: '/api/mall/his/searchHotKeywords',
  HIS_SEARCH_RECORD: '/api/mall/his/searchKeywordRecord',

  // ========== LOG 物流 ==========
  LOG_QUERY: '/api/mall/log/logisticsQuery',
  LOG_TRACK: '/api/mall/log/logisticsTrack',

  // ========== B 端：商品管理 ==========
  M_PMS_GOODS_PAGE: '/api/mall/merchant/pms/goodsPage',
  M_PMS_SPU_CREATE: '/api/mall/merchant/pms/spuCreate',
  M_PMS_SPU_UPDATE: '/api/mall/merchant/pms/spuUpdate',
  M_PMS_SPU_LIST_ON: '/api/mall/merchant/pms/spuListOn',
  M_PMS_SPU_LIST_OFF: '/api/mall/merchant/pms/spuListOff',
  M_PMS_SKU_BATCH: '/api/mall/merchant/pms/skuBatchUpdate',
  M_PMS_CATEGORY_CREATE: '/api/mall/merchant/pms/categoryCreate',
  M_PMS_CATEGORY_UPDATE: '/api/mall/merchant/pms/categoryUpdate',
  M_PMS_CATEGORY_DELETE: '/api/mall/merchant/pms/categoryDelete',
  M_PMS_BRAND_CREATE: '/api/mall/merchant/pms/brandCreate',
  M_PMS_BRAND_UPDATE: '/api/mall/merchant/pms/brandUpdate',
  M_PMS_BRAND_DELETE: '/api/mall/merchant/pms/brandDelete',

  // ========== B 端：订单/售后 ==========
  M_OMS_ORDER_LIST: '/api/mall/merchant/oms/orderList',
  M_OMS_ORDER_DETAIL: '/api/mall/merchant/oms/orderDetail',
  M_OMS_ORDER_SHIP: '/api/mall/merchant/oms/orderShip',
  M_OMS_AFTERSALE_AUDIT: '/api/mall/merchant/oms/aftersaleAudit',

  // ========== B 端：评价 ==========
  M_REV_REVIEW_LIST: '/api/mall/merchant/merchant/rev/reviewList',
  M_REV_REVIEW_REPLY: '/api/mall/merchant/merchant/rev/reviewReply',

  // ========== B 端：商家管理/入驻 ==========
  M_MCH_DASHBOARD: '/api/mall/merchant/merchant/dashboard',
  M_MCH_SETTLE_APPLY: '/api/mall/merchant/merchant/settleApply',
  M_MCH_SETTLE_RESULT: '/api/mall/merchant/merchant/settleResult',
  M_MCH_SHOP_INFO: '/api/mall/merchant/merchant/shopInfo',
  M_MCH_SHOP_INFO_UPDATE: '/api/mall/merchant/merchant/shopInfoUpdate',

  // ========== B 端：财务/运费模板 ==========
  M_MCH_ACCOUNT_INFO: '/api/mall/merchant/mch/accountInfo',
  M_MCH_BILL_LIST: '/api/mall/merchant/mch/billList',
  M_MCH_SETTLEMENT_LIST: '/api/mall/merchant/mch/settlementList',
  M_MCH_WITHDRAW_APPLY: '/api/mall/merchant/mch/withdrawApply',
  M_MCH_WITHDRAW_LIST: '/api/mall/merchant/mch/withdrawList',
  M_MCH_FREIGHT_LIST: '/api/mall/merchant/mch/freightTemplateList',
  M_MCH_FREIGHT_DETAIL: '/api/mall/merchant/mch/freightTemplateDetail',
  M_MCH_FREIGHT_CREATE: '/api/mall/merchant/mch/freightTemplateCreate',
  M_MCH_FREIGHT_UPDATE: '/api/mall/merchant/mch/freightTemplateUpdate',
  M_MCH_FREIGHT_DELETE: '/api/mall/merchant/mch/freightTemplateDelete',

  // ========== B 端：物流/库存 ==========
  M_LOG_CREATE: '/api/mall/merchant/log/logisticsCreate',
  M_LOG_UPDATE: '/api/mall/merchant/log/logisticsUpdate',
  M_INV_STOCK_ADJUST: '/api/mall/merchant/inv/stockAdjust',
  M_INV_STOCK_LOG: '/api/mall/merchant/inv/stockLog',
}
