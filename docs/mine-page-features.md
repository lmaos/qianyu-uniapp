# 个人中心 — API 对接状态

> 2026-06-09 完成首次对接

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/app/personal/center` | GET | 用户信息 + 统计数据 + 快捷入口 |
| `/api/app/personal/center/contents` | GET | 内容列表（游标分页） |

## 对接状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 用户基础信息 | ✅ 已对接 | avatar/nickname/userNo/signature/location |
| 统计数据 | ✅ 已对接 | 获赞/关注/粉丝/访客数 |
| 快捷入口 | ✅ 已对接 | 服务端返回 visible items 动态渲染 |
| 动态列表 | ✅ 已对接 | tab=moment，游标分页 |
| 作品列表 | ✅ 已对接 | tab=work，游标分页 |
| 喜欢列表 | ✅ 已对接 | tab=like，游标分页 |
| 历史列表 | ⏳ 服务端未上线 | tab=history，始终返回空 |
| 缩略图 | ✅ 已改造 | `<image>` 加载真封面，null 时渐变色兜底 |
| 小窝 | ⏳ 未上线 | `showNestCard = false` |

## 测试方式

```bash
# 启动测试服务器
python __tests__/test_server.py

# 测试账号：+86-13800138000 / 验证码 123456
```

## 改动文件

| 文件 | 改动 |
|------|------|
| `composables/useMineApi.js` | **新增** — API 调用 + 数据适配 |
| `composables/baseRequest.js` | 修 token header: `Authorization: Bearer` → `token` |
| `pages/mine/mine.vue` | 接 API 替换 mock；page→cursor 分页 |
| `components/user-center/main/UserDynamicList.vue` | 缩略图改 `<image :src="coverUrl">` |
| `components/user-center/main/UserWorkGrid.vue` | 缩略图改 `<image :src="coverUrl">` |
| `__tests__/test_server.py` | 新增 personal/center + contents 端点 |
