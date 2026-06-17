/**
 * 用户信息实体
 * 与后端 UserInfoVo 字段对齐
 * @module core/user/UserInfo
 */

/**
 * 从后端响应创建 UserInfo 对象~
 * @param {Object} data 后端返回的用户信息 JSON
 * @returns {UserInfo}
 */
export function createUserInfo(data) {
  return {
    userId: data.userId || 0,
    userNo: data.userNo || '',
    nickname: data.nickname || '',
    avatar: data.avatar || '',
    bio: data.bio || '',
    gender: data.gender || 0,
    birthday: data.birthday || null,
    age: data.age || 0,
    phone: data.phone || '',
    email: data.email || '',
    country: data.country || '',
    province: data.province || '',
    city: data.city || '',
    status: data.status || 0,
    createTime: data.createTime || 0,
    updateTime: data.updateTime || 0,
  }
}

/**
 * 获取用户显示名称（昵称优先，否则取 userId）
 * @param {UserInfo} userInfo
 * @returns {string}
 */
export function getUserDisplayName(userInfo) {
  if (!userInfo) return ''
  return userInfo.nickname || String(userInfo.userId) || ''
}

/**
 * 获取用户头像首字（无头像时用于生成文字头像）
 * @param {UserInfo} userInfo
 * @returns {string}
 */
export function getUserAvatarText(userInfo) {
  if (!userInfo) return '?'
  return (userInfo.nickname || '').charAt(0) || String(userInfo.userId).charAt(0) || '?'
}
