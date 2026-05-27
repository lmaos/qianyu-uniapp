# 千隅项目设计与开发规范对照表

## 1. 文档定位

本文档用于统一当前项目的：

1. 产品主体与体验方向
2. UI 风格、色彩与页面表面语言
3. 开发规范、调用规范与组件封装边界
4. 公共组件使用说明与后续维护要求

后续所有新增业务、公共组件、主题优化、样式重构，都需要对照本文档执行；如果规范发生变化，需要同步更新本文档。

浏览器查看版：`docs/qianyu-design-dev-standards.html`

---

## 2. 产品主体与体验方向

| 维度 | 当前规范 |
| --- | --- |
| 产品主体 | 年轻化内容社交 + 直播 + 电商 + 玩伴/小窝陪伴工具 |
| 体验关键词 | 年轻、轻盈、陪伴感、内容感、可记录、可发现、低压互动 |
| 内容表达方式 | 先浏览、再轻互动、再深入，不强推高压社交 |
| 业务结构 | 首页承接商城/直播/推荐，玩伴承接小窝式表达与共鸣，消息承接关系沉淀，我的承接记录与身份资产 |
| 交互目标 | 用户能快速理解当前页面、快速找到入口、点击后有即时反馈、后续可平滑替换真实 API/AI 能力 |

---

## 3. 视觉风格总则

### 3.1 总体风格

| 项目 | 规范 |
| --- | --- |
| 主风格 | 轻玻璃感、浅色渐变、圆角卡片、柔和阴影、轻社交氛围 |
| 情绪表达 | 不走厚重商务风，不走强游戏风，强调“年轻化 + 轻陪伴 + 内容感” |
| 卡片语言 | 大圆角、浅底、微阴影、局部渐变、必要时可加入轻流光 |
| 图标风格 | 优先 SVG，线条简洁、识别明确、可适配多语言，不依赖中文占位字 |
| 触感反馈 | 点击有按压态、必要时有轻动画/轻震动，不做过度花哨和噪音式动效 |
| 模块差异 | 直播维持沉浸式深色；其余内容页以浅色主题为主 |

### 3.2 模块风格对照

| 模块 | 主题 | 风格说明 | 参考来源 |
| --- | --- | --- | --- |
| 首页-商城/推荐 | 浅色 | 粉白/蓝白渐变背景，顶部毛玻璃子导航，内容卡片轻盈 | `pages/home/home.vue` |
| 首页-直播 | 深色 | 黑色沉浸式、强内容导向、榜单与分类并存、突出房间内容流 | `composables/useAppTheme.js`, `components/home/live/LiveTab.vue` |
| 直播间 | 深色 | 全屏沉浸、顶部信息悬浮、底部输入与礼物浮层、强调实时互动氛围 | `pages/live-room/live-room.vue`, `components/room/RoomIndex.vue` |
| 玩伴/小窝 | 浅色 | 粉蓝年轻化、轻社交、轻陪伴、轻反馈、轻流光 | `pages/friend/friend.vue`, `components/friend/playmateMock.js` |
| 个人中心/资料页 | 浅色 | 内容记录型、层级清晰、统一子页面表面层 | `components/user-center/common/userSubPageSurface.js` |
| 商城子页面 | 浅色 | 更偏商品导购，头部按钮与工具图标保持统一 SVG 与柔和渐变 | `components/shop/common/shopSurface.js` |
| 消息列表 | 浅色 | 清爽、结构化、联系人 + 会话双层信息、强调可读性与轻操作 | `pages/message/message.vue` |
| 私聊页 | 浅色 | 柔和浅渐变、对话气泡清晰、工具栏与输入栏稳定可用 | `pages/message/chat.vue` |

### 3.3 色彩系统

| 角色 | 当前主值 | 使用规范 | 参考来源 |
| --- | --- | --- | --- |
| 品牌主强调色 | `#fe2c55` | 激活态、选中态、关键 CTA、刷新高亮 | `composables/useAppTheme.js` |
| 品牌辅强调色 | `#d94f7b` | 图标描边、胶囊标签、次级高亮 | `components/shop/common/shopSurface.js` |
| 浅色主背景 | `#f8fafc` | 常规浅色页面基础底色 | `composables/useAppTheme.js` |
| 浅色渐变背景 | `#fcfdff → #f8fbff → #f4f7fc` | 个人中心/推荐/通用内容背景 | `components/user-center/common/userSubPageSurface.js` |
| 商城渐变背景 | `#fff9fb → #fff2f7 → #f8fafc → #f3f6fb` | 商城内容与商城子页 | `components/shop/common/shopSurface.js` |
| 深色背景 | `#000000` | 直播与深色沉浸面 | `App.vue`, `composables/useAppTheme.js` |
| 主文字色 | `#0f172a` | 标题、重点信息 | `UserSectionCard.vue`, `pages/friend/friend.vue` |
| 次文字色 | `#475467` | 正文、说明、描述 | 多处业务卡片 |
| 辅助文字色 | `#667085`, `#98a2b3` | 标签、提示、次级说明 | 多处业务卡片 |
| 分割/边框色 | `#e8edf3` / `rgba(226,232,240,0.72)` | 轻边框、浅分隔线 | `useAppTheme.js`, `UserSubPageLayout.vue` |

### 3.4 视觉尺寸与形态

| 项目 | 当前规范 |
| --- | --- |
| 开发单位 | 以 `rpx` 为主，只有安全区、滚动联动、系统高度换算时使用 px |
| 常用圆角 | `24rpx / 28rpx / 32rpx / 40rpx` |
| 常用按钮高度 | `50rpx ~ 84rpx`，胶囊优先 |
| 常用图标按钮尺寸 | `64rpx` 容器，`30rpx ~ 34rpx` 图标 |
| 页面头部行高 | 通用子页头部 `88rpx` |
| 首页二级导航高度 | `80rpx` |
| 卡片阴影 | 轻阴影，不用厚重投影；优先柔和扩散阴影 |

### 3.5 背景与样式来源规范

| 项目 | 规范 | 参考来源 |
| --- | --- | --- |
| 全局重置来源 | 全局基础背景、文字和按钮 reset 由 `App.vue` 统一提供 | `App.vue` |
| 全局主题来源 | 全局浅/深主题颜色由 `useAppTheme.js` 统一管理 | `composables/useAppTheme.js` |
| 首页浅色背景归属 | 首页浅色背景层统一归 `pages/home/home.vue` 管理，不放子组件内部 | `pages/home/home.vue` |
| 商城表面层来源 | 商城子页背景、头部背景、头部图标来源于 `shopSurface.js` | `components/shop/common/shopSurface.js` |
| 个人中心表面层来源 | 个人中心子页背景、卡片背景、返回图标来源于 `userSubPageSurface.js` | `components/user-center/common/userSubPageSurface.js` |
| 频道局部背景 | 私聊页、玩伴页、直播卡面等允许有业务域局部渐变，但不能脱离项目总风格 | `pages/message/chat.vue`, `pages/friend/friend.vue`, `components/home/live/LiveTab.vue` |
| uni.scss 使用原则 | 当前 `uni.scss` 仍是 uni-app 默认变量文件，不作为项目主视觉 token 来源；项目真实视觉 token 以 JS surface/theme 文件为准 | `uni.scss` |

---

## 4. 页面布局与主题规范

### 4.1 安全区与全屏布局

| 规范 | 说明 | 参考来源 |
| --- | --- | --- |
| 安全区统一初始化 | App 启动时统一初始化安全区，不允许页面各自重复计算一套 | `App.vue`, `composables/useSafeAreaMetrics.js` |
| 顶部安全区复用 | 顶部固定头部优先使用 `SafeTopArea.vue` | `components/common/SafeTopArea.vue` |
| 底部安全区复用 | 固定底部操作栏优先使用 `SafeBottomArea.vue` | `components/common/SafeBottomArea.vue` |
| 普通全屏子页 | 优先使用 `FullScreenPageLayout.vue` 承担头部/内容/底部预留 | `components/common/FullScreenPageLayout.vue` |
| 带固定顶部堆叠 + 下拉刷新页 | 优先使用 `RefreshTopStackLayout.vue`，顶部安全缓冲默认按 `24rpx` 处理 | `components/common/RefreshTopStackLayout.vue` |
| H5 滚动容器约束 | 共享布局里的滚动容器必须显式渲染 `scroll-view`，不要用动态 `:is="'scroll-view'"`，否则 H5 下容易出现顶部安全区错位、内容顶进固定头部、内部滚动失效 | `components/common/FullScreenPageLayout.vue`, `components/common/RefreshTopStackLayout.vue` |
| 下拉刷新/上拉加载页 | 优先使用 `PullPagingShell.vue`，不要各页重复造刷新容器 | `components/common/PullPagingShell.vue` |

### 4.2 主题切换

| 规范 | 说明 | 参考来源 |
| --- | --- | --- |
| 全局主题统一由 composable 管理 | 使用 `useAppTheme()` 统一控制浅色/深色主题 | `composables/useAppTheme.js` |
| Tab 场景切换驱动主题 | 首页进入直播切深色，其它内容默认浅色 | `pages/index/index.vue`, `pages/home/home.vue` |
| 页面不要自行分裂主题规则 | 新页面若需接入主题，优先接入现有主题体系，不单独定义一套主题状态 | `useAppTheme.js` |
| 首页浅色背景归属首页容器 | 首页浅色背景层定义在 `pages/home/home.vue`，不要下放到子组件导致背景跟随滚动 | `pages/home/home.vue` |

### 4.3 页面结构原则

| 规范 | 说明 |
| --- | --- |
| 根 Tab 页面只做容器，不堆业务逻辑 | `pages/index/index.vue` 负责 tab 切换与主题联动 |
| 页面负责状态与路由 | 页面/容器层负责解析参数、主题、滚动、刷新、分页、导航 |
| 业务展示组件只负责渲染与事件抛出 | 列表卡片、头部条、工具条等组件不直接绑定真实业务 API |
| 隐藏场景要停止资源占用 | Home 场景组件需接收 `active`，隐藏时停止轮播、定时器、异步 mock | `pages/home/home.vue` |

### 4.4 直播频道专项规范

| 维度 | 规范 | 参考来源 |
| --- | --- | --- |
| 频道定位 | 直播频道是首页唯一主深色内容场景，优先突出内容流、热度和房间氛围 | `components/home/live/LiveTab.vue` |
| 视觉风格 | 使用深色渐变封面、亮色标签、榜单入口，避免浅色页面那种大面积玻璃卡片语义 | `components/home/live/LiveTab.vue` |
| 首屏结构 | Banner → 分类栏 → 榜单入口 → 双列直播流，信息层级必须清晰 | `components/home/live/LiveTab.vue` |
| 列表渲染 | 直播流使用虚拟列表思路，保证高密度内容渲染时稳定 | `components/home/live/LiveTab.vue` |
| 频道切换 | 直播组件必须受 `active` 控制；隐藏后停止轮播、滚动参与和异步任务 | `components/home/live/LiveTab.vue`, `pages/home/home.vue` |
| 房间体验 | 直播间必须保持全屏沉浸，顶部信息、榜单、福袋、活动、在线用户、聊天、礼物都以浮层方式组织 | `pages/live-room/live-room.vue`, `components/room/RoomIndex.vue` |
| 交互规范 | 关注、榜单、福袋、活动、聊天输入、礼物发送、分享等全部保留占位回调，不在展示层接真实服务 | `pages/live-room/live-room.vue` |
| 组件边界 | `pages/live-room/live-room.vue` 负责参数与业务回调；`RoomIndex.vue` 负责房间 UI 组装；礼物/聊天/在线用户等子组件只负责渲染与 emit | `pages/live-room/live-room.vue`, `components/room/RoomIndex.vue` |

### 4.5 消息频道专项规范

| 维度 | 规范 | 参考来源 |
| --- | --- | --- |
| 频道定位 | 消息频道负责关系沉淀与持续互动，不做纯工具页，要保持轻社交感与高可读性 | `pages/message/message.vue` |
| 视觉风格 | 采用浅色背景、轻卡片、圆角联系人卡片、清晰会话列表，不做过厚装饰 | `pages/message/message.vue` |
| 首页结构 | 顶部标题/消息徽标 → 搜索入口 → 常用联系人横滑区 → 聊天列表 → mock 说明 | `pages/message/message.vue` |
| 刷新加载 | 消息页复用 `PullPagingShell`，但自定义下拉提示与底部加载状态，不直接照搬原生刷新样式 | `pages/message/message.vue`, `components/common/PullPagingShell.vue` |
| 列表交互 | 会话列表支持左滑删除、置顶样式、未读态、静音态、在线态；删除必须先有显式操作再执行 | `pages/message/message.vue` |
| 联系人信息 | 联系人卡需要同时表达头像、在线、动态、未读等关系状态 | `pages/message/message.vue`, `components/message/messageMock.js` |
| 私聊体验 | 私聊页保持浅色柔和渐变背景，聊天气泡、顶部资料、底部工具栏清晰稳定 | `pages/message/chat.vue` |
| 组件边界 | `messageMock.js` 统一提供联系人、会话、聊天、路由 builder；页面只消费 mock 与回调 | `components/message/messageMock.js` |

---

## 5. 开发规范与调用规范

### 5.1 代码风格

| 项目 | 规范 |
| --- | --- |
| Vue 语法 | 全部使用 Vue 3 + `<script setup>` |
| 单位 | 页面与组件视觉尺寸优先使用 `rpx` |
| 事件命名 | 页面交互处理函数优先使用 `handleXxx`；占位业务回调优先使用 `onXxx` |
| 注释风格 | 用 `TODO：替换...` 明确标记后续 API/AI/业务接入点 |
| 占位反馈 | 当前阶段点击后优先用 `console.log` / `uni.showToast({ icon: 'none' })` 提示 |
| 组件通信 | 优先 `props + emits`，避免跨层直接读写内部状态 |
| 共享逻辑 | 优先沉淀到 `composables/`、`*Mock.js`、公共表面层文件 |

### 5.2 引用路径与依赖路径规范

| 项目 | 规范 |
| --- | --- |
| 导入路径 | 统一优先使用 `@/` 别名引用，不使用长层级相对路径如 `../../../` |
| 页面依赖方向 | `pages/` 可以依赖 `components/`、`composables/`、`*Mock.js`、surface/helper 文件 |
| 业务组件依赖方向 | 业务组件优先依赖同业务域组件、`components/common/`、`composables/`、同域 `*Mock.js` |
| 公共组件依赖方向 | `components/common/` 只做通用能力，不直接依赖具体页面业务 |
| Mock/Surface 文件依赖方向 | `*Mock.js`、`*Surface.js`、`*Icons.js` 不依赖页面 `.vue` 文件，不耦合页面生命周期 |
| 禁止方向 | 组件禁止反向依赖 `pages/`；页面不能被当作公共模块导入到组件层 |
| 命名规范 | 页面目录、页面文件、子页面文件优先使用 kebab-case；helper 命名遵循 `buildXxx` / `getXxxMock` / `useXxx` |
| 启动入口 | `main.js` 只负责应用创建，不承载业务逻辑 |
| 路由注册 | `pages.json` 是页面注册唯一入口，新增页面必须同步登记 |

### 5.3 数据与调用规范

| 项目 | 规范 | 参考来源 |
| --- | --- | --- |
| Mock 数据集中管理 | 每个业务域优先放在对应 `*Mock.js`，不要把大块 mock 常量散落在页面里 | `components/user-center/userCenterMock.js`, `components/friend/playmateMock.js`, `components/shop/category/shopCategoryMock.js` |
| 路由参数构建 | 页面 URL 优先通过 builder/helper 生成，避免字符串硬拼 | `buildPageUrl()` in `components/user-center/userCenterMock.js` |
| 活动协议定义来源 | `actionUrl` 协议唯一收敛到 `components/common/activity/activityActionProtocol.js`，统一维护 `https://`、`http://`、`pages://` 规则与示例 | `components/common/activity/activityActionProtocol.js` |
| 活动协议分发 | 活动弹窗与活动入口的跳转统一通过 `dispatchActivityAction()` 分发，不在多个页面重复写协议解析 | `components/common/activity/activityActionRouter.js` |
| 外链承接页 | 外部活动链接统一进入 `pages/web/web-view.vue`，不要在业务页各自分散实现 web-view 页 | `pages/web/web-view.vue` |
| 页面注册 | 所有新页面必须同步写入 `pages.json` | `pages.json` |
| API 替换接口位 | 当前统一保留 mock-first / callback-first，不直接把真实接口写死在展示组件中 | 多处 `TODO：替换...` |
| 资源释放 | 轮播、刷新、分页、定时器都要支持在隐藏/离开时停止 | `pages/home/home.vue`, `components/home/live/LiveTab.vue` |
| 频道级 builder | 消息、个人中心、玩伴、直播榜单等频道优先提供 builder/mock helper，再由页面消费 | `components/message/messageMock.js`, `components/user-center/userCenterMock.js`, `components/friend/playmateMock.js`, `components/home/live/liveRankMock.js` |

### 5.4 业务实现约束

| 项目 | 必须做法 | 不推荐做法 |
| --- | --- | --- |
| 交互接入 | 先保留 mock 数据与占位回调，再替换真实 API | 直接在多个组件里分散接真实接口 |
| 主题接入 | 复用现有主题与表面层常量 | 页面自己写一套新的背景/按钮体系 |
| 路由跳转 | 统一由页面或 mock helper 构建 URL | 在深层展示组件硬编码复杂 query |
| 图标使用 | 优先 SVG/统一 icon helper | 中文字占位图标、不同模块风格割裂 |
| 布局容器 | 复用公共布局组件 | 每个页面重新计算安全区与头底预留 |
| 组件职责 | 父层负责数据/状态/路由，子层负责渲染/事件 | 子组件里混合页面状态、路由、接口、副作用 |

### 5.5 AI自动化UI测试

| 项目 | 方式 | 建议 |
| --- | --- | --- |
| 首选场景 | 安全区、固定头部、滚动容器、浮层遮挡、H5 布局错位、局部滚动异常 | 先做自动化测量，再结合肉眼看效果，不只凭截图判断 |
| 运行入口 | 优先使用本地 H5 预览地址，如 `http://localhost:5173/#/pages/...` | 直接访问具体路由，避免从首页手点影响排查效率 |
| 工具选择 | 优先使用 Playwright；浏览器优先复用系统已有 Edge / Chrome | 临时验证脚本放 session 临时目录，不把一次性测试脚本写进仓库 |
| 核心测量项 | 读取 `getBoundingClientRect()`、`scrollTop`、`scrollHeight`、`clientHeight`、`window.scrollY`、`document.body.getBoundingClientRect().top` | 不只判断“有没有挡住”，还要确认到底是谁在滚动 |
| 关键验证对象 | 固定头部、首屏首卡、顶部浮条、`scroll-view`、底部安全区、长列表页 | 至少抽样“异常页 + 共享子页 + 长列表页”各 1 个 |
| 回归原则 | 如果改的是共享布局壳，必须回归 `FullScreenPageLayout`、`RefreshTopStackLayout`、`UserSubPageLayout` 等复用页 | 禁止只修单页就结束 |
| 输出要求 | 结论里要带页面路由和关键位置数据 | 例如首卡 `top`、头部 `bottom`、滚动后 `scrollTop` 是否变化 |

1. 优先先查本地 H5 是否已可访问，再开始自动化验证。
2. 视觉类问题优先用 H5 做 DOM 级定位，因为浏览器最适合读取真实位置、滚动和尺寸。
3. 如果 Playwright 缺少内置浏览器，优先复用系统浏览器可执行文件，不为单次排查污染仓库依赖。
4. 共享布局问题要优先排查公共壳层实现，而不是先在业务页补局部 `padding-top`。
5. 自动化测试脚本属于调试资产，优先放 session 临时目录；只有形成长期测试体系时才进入仓库。
6. 一旦这类排查沉淀出稳定规则，必须同步更新本文档与 HTML 浏览版。

---

## 6. 公共能力与公共组件对照表

### 6.0 目录结构与职责规范

#### 根目录规范

| 目录/文件 | 职责 | 规范 |
| --- | --- | --- |
| `pages/` | 页面路由目录 | 按业务域拆分页面；所有页面都要在 `pages.json` 注册 |
| `components/` | 组件目录 | 按业务域与公共层拆分，避免跨业务混放 |
| `composables/` | 共享逻辑目录 | 放主题、安全区、SVG 等跨页面复用逻辑 |
| `docs/` | 规范与说明文档目录 | 本项目长期规范文档固定维护在这里 |
| `static/` | 静态资源目录 | 图片、静态文件按需放置 |
| `main.js` | 应用启动入口 | 只放启动相关逻辑 |
| `App.vue` | 应用全局入口 | 只放全局初始化和基础 reset |
| `pages.json` | 路由注册 | 新页面必须同步更新 |
| `uni.scss` | uni 默认变量文件 | 不作为项目主视觉规范来源 |
| `temp/` | 临时目录 | 不作为正式业务代码目录 |
| `unpackage/` | 构建产物目录 | 生成目录，不手动维护业务代码 |
| `.hbuilderx/` | IDE 配置 | 编辑器相关，不放业务实现 |

#### 页面目录分层

| 目录 | 当前职责 |
| --- | --- |
| `pages/index/` | 根 Tab 容器与全局主题联动入口 |
| `pages/home/` | 首页频道容器 |
| `pages/friend/` | 玩伴主频道首页 |
| `pages/playmate/` | 玩伴子流程页面，如发布页、回应列表页 |
| `pages/message/` | 消息频道页面，如消息首页、联系人、搜索、私聊 |
| `pages/live/` | 直播榜单等直播辅助页面 |
| `pages/live-room/` | 直播间主页面 |
| `pages/shop/` | 商城子页面，如分类、搜索、店铺首页、详情、购物车、订单、商家工作台等 |
| `pages/mine/` | 我的主页面 |
| `pages/user/` | 个人中心子页面集合 |
| `pages/user-profile/` | 他人资料页 |
| `pages/web/` | 内嵌网页承接页，如活动协议外链打开页 |
| `pages/login/` | 登录与手机号登录流程 |
| `pages/welcome/` | 欢迎与引导页 |

#### 组件目录分层

| 目录 | 当前职责 |
| --- | --- |
| `components/common/` | 安全区、全屏布局、刷新容器等跨业务公共能力 |
| `components/home/` | 首页频道壳层与首页子模块 |
| `components/home/live/` | 直播频道列表、榜单、卡片、直播频道元素 |
| `components/shop/` | 商城业务组件，按 `cart/category/common/detail` 分层 |
| `components/room/` | 直播间组件，按 `chat/gift/online` 分层 |
| `components/message/` | 消息域 mock 与后续消息公共组件承载层 |
| `components/friend/` | 玩伴/小窝业务组件、icon 与 mock |
| `components/user-center/` | 个人中心，按 `common/main/detail` 分层 |
| `components/user/` | 用户信息类可复用组件 |

#### 路由配置默认规则

| 项目 | 当前规则 | 参考来源 |
| --- | --- | --- |
| 导航栏方式 | 页面默认使用 `navigationStyle: custom` | `pages.json` |
| 页面背景色 | 浅色页默认 `#f8fafc`，直播/沉浸页按深色背景单独设置 | `pages.json` |
| 禁止页面滚动 | 欢迎页、登录页、直播间、部分沉浸页可显式 `disableScroll: true` | `pages.json` |
| App 端 bounce | 直播间等沉浸场景允许单独关闭 bounce | `pages.json` |

### 6.1 Composables / 工具能力

| 能力 | 文件 | 用途 | 使用要求 |
| --- | --- | --- | --- |
| 安全区与尺寸换算 | `composables/useSafeAreaMetrics.js` | 提供安全区、窗口尺寸、`rpxToPx/pxToRpx`、头部/底部预留计算 | 不要在页面里复制安全区算法 |
| 全局主题 | `composables/useAppTheme.js` | 提供浅色/深色主题配置与切换 | 页面不要自行维护第二套主题状态 |
| SVG Data URI | `composables/useSvgIcon.js` | 将 SVG 字符串转成可直接给 `image` 使用的资源 | 新 SVG 图标优先走统一生成方式 |
| 活动协议定义 | `components/common/activity/activityActionProtocol.js` | 统一维护活动弹窗 `actionUrl` 协议字段、类型与示例 | 新增活动跳转时优先补协议定义，不要先在页面硬编码 |
| 活动协议分发 | `components/common/activity/activityActionRouter.js` | 统一解析 `pages://` 与 `http(s)://` 并分发到页面、Tab、直播间、web-view | 页面层消费分发器，展示组件只 emit `action` |
| 商城流程 mock / builder | `components/shop/common/shopFlowMock.js` | 统一维护商城搜索、店铺首页、订单详情、商家工作台、客服弹层上下文 mock 与 URL builder | 新增商城子流程时优先扩展这里，不在页面里散落 route builder |

### 6.2 通用布局组件

| 组件 | 文件 | 适用场景 | 使用说明 |
| --- | --- | --- | --- |
| SafeTopArea | `components/common/SafeTopArea.vue` | 固定顶部安全区头部 | 负责顶部 inset、边框、背景、阴影 |
| SafeBottomArea | `components/common/SafeBottomArea.vue` | 固定底部操作栏 | 负责底部 inset、内边距、最小高度 |
| FullScreenPageLayout | `components/common/FullScreenPageLayout.vue` | 普通非 Tab 全屏子页 | 统一头部、内容、底部保留区 |
| RefreshTopStackLayout | `components/common/RefreshTopStackLayout.vue` | 顶部多层固定 + 下拉刷新页 | 默认包含 `24rpx` 顶部安全缓冲，适合商城检索/筛选类页面 |
| H5 scroll-view 约束 | `components/common/FullScreenPageLayout.vue`, `components/common/RefreshTopStackLayout.vue` | H5 滚动页 | 必须显式使用 `scroll-view`，保证安全区预留与内部滚动稳定 |
| PullPagingShell | `components/common/PullPagingShell.vue` | 下拉刷新 + 触底加载 + 自定义底部状态 | 页面只关心状态与事件，不重写刷新壳 |
| ActivityPopupShell | `components/common/activity/ActivityPopupShell.vue` | 活动弹窗公共壳层 | 统一遮罩、右上角 `X`、弹层层级与关闭行为 |
| ActivityImagePopup | `components/common/activity/ActivityImagePopup.vue` | 全图活动弹窗 | 用于活动大图/氛围图 + 单按钮动作 |
| ActivityActionPopup | `components/common/activity/ActivityActionPopup.vue` | 文本标题 + 按钮活动弹窗 | 用于说明型活动弹窗与协议跳转确认 |

### 6.3 页面表面层组件

| 组件/表面层 | 文件 | 适用场景 | 使用说明 |
| --- | --- | --- | --- |
| HomeSubNavShell | `components/home/HomeSubNavShell.vue` | 首页二级频道导航 | 支持浅深主题、刷新提示、额外导航区 |
| LiveBanner | `components/home/live/elements/LiveBanner.vue` | 直播频道 Banner | 只处理展示、切换与点击事件，不接频道业务 |
| LiveHotRankCard | `components/home/live/elements/LiveHotRankCard.vue` | 直播榜单入口卡 | 负责榜单入口展示，跳转由上层决定 |
| LiveCardItem | `components/home/live/elements/LiveCardItem.vue` | 直播双列流卡片 | 负责直播卡片展示与点击抛出 |
| RoomIndex | `components/room/RoomIndex.vue` | 直播间整页 UI 组装 | 负责房间表现层，业务事件全部向页面层抛出 |
| RoomChat / OnlinePanel / GiftPanel | `components/room/chat/*.vue`, `components/room/online/*.vue`, `components/room/gift/*.vue` | 直播间聊天、在线用户、礼物分层模块 | 属于房间内功能组件，不直接持有页面业务状态 |
| web-view 活动承接页 | `pages/web/web-view.vue` | `http(s)://` 活动外链 | 活动页统一从协议分发器进入，不单独散落多个 web-view 页面 |
| ShopSubPageHeader | `components/shop/common/ShopSubPageHeader.vue` | 商城子页面顶部标题栏 | 左返回 + 中标题 + 右侧操作占位 |
| ShopHeaderIconButton | `components/shop/common/ShopHeaderIconButton.vue` | 商城头部/工具 SVG 按钮 | 尺寸与激活态统一，优先复用 |
| shopSurface | `components/shop/common/shopSurface.js` | 商城背景、头部背景、SVG 图标集合 | 商城子页不要再单独造一套头部图标 |
| shopCategoryMock / shopDetailMock / shopCartMock / shopFlowMock | `components/shop/**/**Mock.js` | 商城分类、详情、购物车、搜索/店铺/订单/商家工作台 mock 能力层 | 商城页优先从对应 mock 文件取数据与 URL |
| ShopCustomerServiceSheet | `components/shop/common/ShopCustomerServiceSheet.vue` | 商品详情、订单列表、订单详情等客服承接弹层 | 客服入口优先复用统一底部弹层，页面层只传上下文与回调 |
| ShopProductList / ShopProductItem | `components/home/shop/ShopProductList.vue`, `components/home/shop/ShopProductItem.vue` | 商城商品卡片与商品列表复用层 | 首页商城、分类结果等商品流优先复用 |
| UserSubPageLayout | `components/user-center/common/UserSubPageLayout.vue` | 我的/资料类子页面骨架 | 统一浅色子页头部、内容区、底部区 |
| UserSectionCard | `components/user-center/common/UserSectionCard.vue` | 我的/资料页通用信息卡片 | 默认统一圆角、阴影、浅渐变背景 |
| userSubPageSurface | `components/user-center/common/userSubPageSurface.js` | 个人中心子页背景、头部、返回图标 | 子页统一引用，不单独重写 |
| userCenterMock | `components/user-center/userCenterMock.js` | 个人中心路由 builder 与核心 mock 数据源 | 个人中心与关联用户页优先复用它的 builder |
| messageMock | `components/message/messageMock.js` | 消息频道联系人、会话、私聊、搜索路由与 mock 数据源 | 消息页与相关跳转统一复用 |
| PlaymateLaunchSheet | `components/friend/PlaymateLaunchSheet.vue` | 玩伴发布入口弹层 | 属于业务域公共组件，后续扩展玩法时优先在此增强 |
| playmateMock / playmateIcons | `components/friend/playmateMock.js`, `components/friend/playmateIcons.js` | 玩伴频道 mock 数据与 SVG 图标来源 | 玩伴页与子流程优先统一复用 |
| UserInfoCard | `components/user/UserInfoCard.vue` | 用户资料摘要卡 | 资料类页面与关系页面优先复用，不重复造头像/昵称/状态头卡 |

---

## 7. 业务组件封装要求

### 7.1 分层职责

| 层级 | 职责 | 约束 |
| --- | --- | --- |
| Page 页面层 | 路由参数、主题、刷新、分页、弹层、导航、业务态组合 | 不要重复写公共布局，不要把大块静态 mock 散落在页面 |
| Scene/Container 容器层 | 某个业务频道的状态协调，如 Home/Shop/Live/Playmate 容器 | 需要支持 `active`、资源回收、局部刷新 |
| Presentational 展示层 | 卡片、列表项、头部、工具栏、统计条、弹窗内容 | 只接收 props / emits，不直接耦合真实 API |
| Mock/Builder 层 | mock 数据、路由 builder、默认配置、筛选项生成 | 作为真实 API 前的稳定契约层 |
| Surface/Icon 层 | 背景、颜色、图标、通用表面语言 | 统一输出视觉资源，避免重复定义 |

### 7.2 封装要求

| 方向 | 规范 |
| --- | --- |
| 页面封装 | 页面负责“组合”，公共组件负责“复用”，不要把一次性样式塞进公共层 |
| 模块封装 | 同一业务域的新能力优先放到现有业务域目录，例如玩伴相关优先放 `components/friend/` 与 `pages/playmate/` |
| 列表/卡片封装 | 结构复用超过 2 处时抽组件；只在一个页面出现且无稳定复用价值时保留本地 |
| 路由封装 | 带 query 的跳转优先抽 builder，避免不同页面拼接规则不一致 |
| 风格封装 | 背景、阴影、按钮、图标等可复用视觉语言优先抽 surface/helper 文件 |
| 变更方式 | 新增公共组件前先查现有组件是否已覆盖，能扩展就不新建重复组件 |

### 7.3 直播与消息频道边界要求

| 频道 | 页面层职责 | 组件层职责 | 禁止事项 |
| --- | --- | --- | --- |
| 直播频道 | 分类切换、分页、刷新、榜单跳转、房间参数解析、房间业务回调 | Banner、榜单卡、直播卡、房间 UI、礼物面板、在线面板等负责渲染与 emit | 不要在卡片组件里写真实房间接口、送礼接口、IM 接口 |
| 消息频道 | 联系人/会话分页、搜索跳转、联系人页跳转、私聊页参数与输入提交 | 会话卡、联系人卡、聊天消息展示与工具栏展示 | 不要在列表项组件里直接删会话、发消息、改关系状态 |

### 7.4 目录与依赖约束

| 项目 | 规范 |
| --- | --- |
| 页面目录 | 页面必须按业务域进入对应 `pages/<domain>/` 目录，不混放到根层 |
| 组件目录 | 组件必须先判断属于 `common` 还是具体业务域，再决定目录 |
| 新公共组件 | 只有在多个页面或多个业务域复用时，才进入 `components/common/` |
| 生成目录 | `unpackage/`、`.hbuilderx/`、`temp/` 不作为业务代码落点 |
| 文档目录 | 规范、说明、长期维护文档统一进入 `docs/` |
| 依赖方向 | 优先单向依赖：`pages -> domain components/mock -> common/composables` |

---

## 8. 业务落地时的实现清单

后续开发新业务时，默认按下面顺序落地：

1. 先定义页面入口与 `pages.json`
2. 先补 `*Mock.js` 数据结构与 URL builder
3. 页面只接入 mock 数据与占位回调
4. 公共视觉优先复用现有 surface/layout/icon 体系
5. 如果出现稳定复用，再抽成公共组件
6. 抽成公共组件后，必须补本文档中的“公共组件对照表”
7. 如果做了主题/配色/卡片/图标体系优化，必须同步更新本文档

---

## 9. 后续维护要求

### 9.1 必须维护本文档的场景

| 场景 | 必须更新内容 |
| --- | --- |
| 新增公共组件 | 组件名称、路径、用途、适用场景、使用说明 |
| 重构公共布局 | 布局规则、替代关系、旧组件废弃说明 |
| 调整主题或色彩 | 色彩表、模块风格表、视觉总则 |
| 新增业务域公共弹层/卡片/头部 | 公共组件对照表、封装要求 |
| 统一交互风格升级 | 触感反馈、动效约束、禁用项说明 |

### 9.2 维护要求

1. 本文档路径固定为：`docs/qianyu-design-dev-standards.md`
2. 后续新增的公共组件和风格优化，必须在同一任务内同步更新本文档
3. 如果仅做局部业务改动、没有形成新规范，可以不更新
4. 如果某次改动影响多个业务域的共同规范，优先先更新文档，再继续扩展页面

---

## 10. 当前项目的执行基线

| 类别 | 当前基线 |
| --- | --- |
| 开发语法 | Vue 3 + `<script setup>` |
| 视觉单位 | `rpx` 为主 |
| 数据方式 | Mock-first |
| 交互方式 | Callback-first |
| 真实接口替换点 | `TODO：替换...` |
| 全局主题 | `useAppTheme()` |
| 安全区与页面框架 | `useSafeAreaMetrics()` + 公共布局组件 |
| 图标策略 | SVG 优先 |
| 内容主色调 | 浅色粉白/蓝白渐变体系 + 局部品牌粉 |
| 深色场景 | 直播专用 |

---

## 11. 主要参考文件

1. `App.vue`
2. `main.js`
3. `pages.json`
4. `pages/index/index.vue`
5. `pages/home/home.vue`
6. `components/common/SafeTopArea.vue`
7. `components/common/SafeBottomArea.vue`
8. `components/common/FullScreenPageLayout.vue`
9. `components/common/RefreshTopStackLayout.vue`
10. `components/common/PullPagingShell.vue`
11. `components/shop/common/shopSurface.js`
12. `components/shop/common/ShopSubPageHeader.vue`
13. `components/shop/common/ShopHeaderIconButton.vue`
14. `components/user-center/common/userSubPageSurface.js`
15. `components/user-center/common/UserSubPageLayout.vue`
16. `components/user-center/common/UserSectionCard.vue`
17. `components/user-center/userCenterMock.js`
18. `components/message/messageMock.js`
19. `components/home/live/liveRankMock.js`
20. `components/friend/playmateMock.js`
21. `uni.scss`
