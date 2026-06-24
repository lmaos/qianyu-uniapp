#!/usr/bin/env python3
"""测试用 HTTP 服务器 - 模拟后端 API"""

import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs


def _build_mock_feed_cards():
    """生成 mock 推荐 FeedCardVo 列表（轻量卡片）"""
    authors = [
        {'authorId': 100001, 'nickname': '千隅同学', 'avatar': 'https://picsum.photos/seed/fa1/100/100'},
        {'authorId': 100002, 'nickname': '阿青轻生活', 'avatar': 'https://picsum.photos/seed/fa2/100/100'},
        {'authorId': 100003, 'nickname': '逗咖萌主', 'avatar': 'https://picsum.photos/seed/fa3/100/100'},
        {'authorId': 100004, 'nickname': '白金今天穿什么', 'avatar': 'https://picsum.photos/seed/fa4/100/100'},
        {'authorId': 100005, 'nickname': '周末散步计划', 'avatar': ''},
        {'authorId': 100006, 'nickname': '奶油房间日记', 'avatar': None},
    ]
    titles = [
        ('今天的日落 🌇', 'video'),
        ('周末 city walk 的轻松穿搭灵感', 'image'),
        ('直播间里顺手挖到的新款单品', 'video'),
        ('把卧室角落布置成舒服又耐看的样子', 'image'),
        ('最近反复回看的护肤和居家清单', 'image'),
        ('下班后随手记录的一条图文笔记', 'image'),
        ('用一条宠物视频测试 nvue 滑轨', 'video'),
        ('复古胶片感手机摄影技巧分享', 'image'),
        ('一人食晚餐记录 🍜', 'video'),
        ('北欧家居灵感 🏠', 'image'),
    ]

    cards = []
    base_moment_id = 6257117397155800
    for i in range(40):
        author = authors[i % len(authors)]
        title_info = titles[i % len(titles)]
        is_video = title_info[1] == 'video'
        moment_id = base_moment_id - i
        cards.append({
            'momentId': moment_id,
            'authorId': author['authorId'],
            'nickname': author['nickname'],
            'avatar': author['avatar'] or '',
            'coverUrl': f'https://picsum.photos/seed/fc{i}/400/{600 if is_video else 500}',
            'title': title_info[0],
            'type': title_info[1],
            'likeCount': 42 + i * 7,
            'commentCount': 7 + i * 2,
            'viewCount': 2300 + i * 130 if is_video else 0,
            'hasLike': i % 3 == 0,
        })
    return cards


FEED_CARDS = _build_mock_feed_cards()

def _build_mock_contents(tab):
    """生成 mock 内容列表，每个 tab 返回固定数据"""
    items = {
        'moment': [
            {'momentId': 5257117397155845, 'coverUrl': 'https://picsum.photos/seed/m1/400/600', 'title': '记录今天的日落 🌇', 'type': 'video', 'commentCount': 3, 'likeCount': 15, 'viewCount': 2300},
            {'momentId': 5257117397155844, 'coverUrl': 'https://picsum.photos/seed/m2/400/500', 'title': '', 'type': 'image', 'commentCount': 0, 'likeCount': 5, 'viewCount': 0},
            {'momentId': 5257117397155843, 'coverUrl': 'https://picsum.photos/seed/m3/400/400', 'title': '周末探店分享 ☕', 'type': 'image', 'commentCount': 8, 'likeCount': 42, 'viewCount': 0},
            {'momentId': 5257117397155842, 'coverUrl': 'https://picsum.photos/seed/m4/400/700', 'title': '新入手的相机开箱', 'type': 'video', 'commentCount': 12, 'likeCount': 67, 'viewCount': 5600},
            {'momentId': 5257117397155841, 'coverUrl': 'https://picsum.photos/seed/m5/400/550', 'title': '深夜书房 📚', 'type': 'image', 'commentCount': 2, 'likeCount': 18, 'viewCount': 0},
            {'momentId': 5257117397155840, 'coverUrl': 'https://picsum.photos/seed/m6/400/480', 'title': '春日骑行路线分享 🚴', 'type': 'video', 'commentCount': 5, 'likeCount': 31, 'viewCount': 1800},
            {'momentId': 5257117397155839, 'coverUrl': 'https://picsum.photos/seed/m7/400/600', 'title': '', 'type': 'image', 'commentCount': 0, 'likeCount': 9, 'viewCount': 0},
            {'momentId': 5257117397155838, 'coverUrl': 'https://picsum.photos/seed/m8/400/420', 'title': '手工皮具制作过程', 'type': 'video', 'commentCount': 20, 'likeCount': 89, 'viewCount': 12000},
        ],
        'work': [
            {'momentId': 6257117397155845, 'coverUrl': 'https://picsum.photos/seed/w1/400/400', 'title': '作品1', 'type': 'video', 'commentCount': 10, 'likeCount': 120, 'viewCount': 8600},
            {'momentId': 6257117397155844, 'coverUrl': 'https://picsum.photos/seed/w2/400/400', 'title': '作品2', 'type': 'video', 'commentCount': 5, 'likeCount': 86, 'viewCount': 4200},
            {'momentId': 6257117397155843, 'coverUrl': 'https://picsum.photos/seed/w3/400/400', 'title': '作品3', 'type': 'video', 'commentCount': 2, 'likeCount': 34, 'viewCount': 1200},
            {'momentId': 6257117397155842, 'coverUrl': 'https://picsum.photos/seed/w4/400/400', 'title': '作品4', 'type': 'video', 'commentCount': 8, 'likeCount': 95, 'viewCount': 6800},
            {'momentId': 6257117397155841, 'coverUrl': 'https://picsum.photos/seed/w5/400/400', 'title': '作品5', 'type': 'video', 'commentCount': 15, 'likeCount': 210, 'viewCount': 15000},
            {'momentId': 6257117397155840, 'coverUrl': 'https://picsum.photos/seed/w6/400/400', 'title': '作品6', 'type': 'video', 'commentCount': 0, 'likeCount': 12, 'viewCount': 800},
        ],
        'like': [
            {'momentId': 7257117397155843, 'coverUrl': 'https://picsum.photos/seed/l1/400/550', 'title': '喜欢的咖啡拉花教程', 'type': 'video', 'commentCount': 4, 'likeCount': 56, 'viewCount': 3400},
            {'momentId': 7257117397155842, 'coverUrl': 'https://picsum.photos/seed/l2/400/500', 'title': '北欧家居灵感 🏠', 'type': 'image', 'commentCount': 1, 'likeCount': 23, 'viewCount': 0},
            {'momentId': 7257117397155841, 'coverUrl': 'https://picsum.photos/seed/l3/400/480', 'title': '一人食晚餐记录', 'type': 'image', 'commentCount': 6, 'likeCount': 78, 'viewCount': 0},
        ],
        'history': [],  # 历史未上线
    }
    return items.get(tab, [])


class TestHandler(BaseHTTPRequestHandler):

    def _send_json(self, code, body):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(body, ensure_ascii=False).encode())

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        ct = self.headers.get('Content-Type', '')
        if 'application/json' in ct:
            return json.loads(raw)
        if 'application/x-www-form-urlencoded' in ct:
            return dict(parse_qs(raw.decode()))
        return {'raw': raw.decode()}

    def _query_params(self):
        qs = urlparse(self.path).query
        return dict(parse_qs(qs))

    # ── Routes ─────────────────────────────────────

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qp = self._query_params()

        if path == '/api/echo':
            self._send_json(200, {
                'code': 200,
                'message': 'ok',
                'data': {k: v[0] if len(v) == 1 else v for k, v in qp.items()},
            })

        elif path == '/api/jsonp':
            cb = qp.get('callback', [None])[0]
            if cb:
                data = json.dumps({'code': 200, 'message': 'ok', 'data': {'name': 'jsonp_test'}})
                self.send_response(200)
                self.send_header('Content-Type', 'application/javascript')
                self.end_headers()
                self.wfile.write(f'{cb}({data})'.encode())
            else:
                self._send_json(400, {'code': 400, 'message': 'missing callback'})

        elif path == '/api/error':
            self._send_json(403, {'code': 403, 'message': '登录失败', 'data': None})

        elif path == '/api/server-error':
            self._send_json(500, {'code': 500, 'message': '数据库异常', 'data': None})

        elif path == '/api/bad-request':
            self._send_json(400, {'code': 400, 'message': '参数错误', 'data': None})

        elif path == '/api/gateway-error':
            self._send_json(502, {'code': 502, 'message': 'Bad Gateway', 'data': None})

        elif path == '/api/timeout':
            time.sleep(3)
            self._send_json(200, {'code': 200, 'message': 'ok', 'data': None})

        # ── 个人中心 API ─────────────────────────────────

        elif path == '/api/app/personal/center':
            self._send_json(200, {
                'requestId': 'test-pc-req-id',
                'status': 0,
                'state': 'OK',
                'content': {
                    'userProfile': {
                        'avatar': None,
                        'nickname': '千隅同学',
                        'userNo': 'QY13800138000',
                        'signature': '认真记录生活里的每一点灵感。',
                        'location': '广东省-深圳市-南山区',
                    },
                    'userStats': {
                        'likeCount': 12800,
                        'followCount': 326,
                        'fansCount': 8600,
                        'visitorCount': 28,
                    },
                    'shortcuts': [
                        {
                            'key': 'wallet',
                            'name': '我的钱包',
                            'visible': True,
                            'badgeCount': 0,
                            'linkUrl': 'page://open?page=/pages/user/wallet',
                        },
                        {
                            'key': 'orders',
                            'name': '订单中心',
                            'visible': True,
                            'badgeCount': 0,
                            'linkUrl': 'page://open?page=/pages/user/order-list',
                        },
                        {
                            'key': 'anchor',
                            'name': '主播中心',
                            'visible': True,
                            'badgeCount': 0,
                            'linkUrl': 'page://open?page=/pages/user/anchor-center',
                        },
                        {
                            'key': 'merchant',
                            'name': '商家管理',
                            'visible': True,
                            'badgeCount': 0,
                            'linkUrl': 'page://open?page=/pages/user/merchant-center',
                        },
                    ],
                },
                'message': 'OK',
            })

        elif path == '/api/app/personal/center/contents':
            tab = qp.get('tab', [None])[0] or ''
            cursor = int(qp.get('cursor', [0])[0] or '0')
            limit = int(qp.get('limit', [20])[0] or '20')

            if tab not in ('moment', 'work', 'like', 'history'):
                return self._send_json(422, {
                    'requestId': 'test-pc-req-id',
                    'status': 400020,
                    'state': 'R_NOT_SUPPORTED',
                    'content': None,
                    'message': '不支持的 tab 类型: ' + tab,
                })

            # 生成 mock 内容列表
            all_items = _build_mock_contents(tab)
            start = 0
            for i, item in enumerate(all_items):
                if cursor > 0 and item['momentId'] <= cursor:
                    start = i + 1
                else:
                    break
            page = all_items[start:start + limit]
            next_cursor = page[-1]['momentId'] if page else 0
            has_more = start + limit < len(all_items)

            self._send_json(200, {
                'requestId': 'test-pc-req-id',
                'status': 0,
                'state': 'OK',
                'content': {
                    'items': page,
                    'nextCursor': next_cursor,
                    'hasMore': has_more,
                },
                'message': 'OK',
            })

        # ── 推荐 Feed 卡片 API ──────────────────────────────

        elif path == '/api/social/feed/recommend/cards' or path == '/api/social/feed/following/cards':
            cursor = int(qp.get('cursor', [0])[0] or '0')
            limit = int(qp.get('limit', [20])[0] or '20')

            start = 0
            if cursor > 0:
                for i, card in enumerate(FEED_CARDS):
                    if card['momentId'] < cursor:
                        start = i
                        break
            page = FEED_CARDS[start:start + limit]
            next_cursor = page[-1]['momentId'] if page else 0
            has_more = start + limit < len(FEED_CARDS)

            self._send_json(200, {
                'requestId': 'test-feed-req-id',
                'status': 0,
                'state': 'OK',
                'content': {
                    'datas': page,
                    'nextCursor': next_cursor,
                    'hasMore': has_more,
                },
                'message': 'OK',
            })

        # ── 动态详情 ─────────────────────────────────

        elif path == '/api/social/moment/get':
            import time
            now_ms = int(time.time() * 1000)
            moment_id = int(qp.get('momentId', [0])[0] or '0')
            self._send_json(200, {
                'requestId': 'test-moment-req-id', 'status': 0, 'state': 'OK',
                'content': {
                    'momentId': moment_id, 'authorId': 100001,
                    'nickname': '千隅同学', 'avatar': 'https://picsum.photos/seed/detail_avatar/200/200',
                    'content': {
                        'type': 'image',
                        'text': {'text': '今天的日落 🌇 记录生活里的美好瞬间，分享给每一个热爱生活的你。', 'atIds': []},
                        'image': [{'imageId': 'img_001', 'imageUrl': 'https://picsum.photos/seed/detail1/800/600', 'width': 800, 'height': 600}],
                    },
                    'latitude': 22.5431, 'longitude': 114.0579, 'country': 'CN',
                    'likes': 42, 'comments': 7, 'hasLike': False, 'status': 0, 'createTime': now_ms,
                }, 'message': 'OK',
            })

        # ── 评论列表（游标分页）───────────────────────

        elif path == '/api/social/comment/moment/list':
            import time
            now_ms = int(time.time() * 1000)
            moment_id = int(qp.get('momentId', [0])[0] or '0')
            next_cid = int(qp.get('nextCommentId', [0])[0] or '0')
            limit = int(qp.get('limit', [20])[0] or '20')
            mock_comments = [
                {'commentId': 9001, 'momentId': moment_id, 'momentAuthorId': 100001, 'authorId': 100002,
                 'nickname': '阿青轻生活', 'avatar': 'https://picsum.photos/seed/c1/100/100',
                 'parentCommentId': 0, 'replyCommentId': 0, 'replyUserId': 0, 'commentLevel': 1,
                 'content': {'text': {'text': '拍得真好看！夕阳无限好 🌇', 'atIds': []}},
                 'status': 0, 'likes': 5, 'replies': 2, 'hasLike': False, 'clientTime': now_ms - 3600000},
                {'commentId': 9002, 'momentId': moment_id, 'momentAuthorId': 100001, 'authorId': 100003,
                 'nickname': '逗咖萌主', 'avatar': 'https://picsum.photos/seed/c2/100/100',
                 'parentCommentId': 0, 'replyCommentId': 0, 'replyUserId': 0, 'commentLevel': 1,
                 'content': {'text': {'text': '这是在哪拍的呀？', 'atIds': []}},
                 'status': 0, 'likes': 3, 'replies': 1, 'hasLike': True, 'clientTime': now_ms - 7200000},
            ]
            start = 0
            if next_cid > 0:
                for i, c in enumerate(mock_comments):
                    if c['commentId'] <= next_cid:
                        start = i + 1
                    else:
                        break
            page = mock_comments[start:start + limit]
            next_cursor_val = page[-1]['commentId'] if page else 0
            has_more = start + limit < len(mock_comments)
            self._send_json(200, {
                'requestId': 'test-cmt-req-id', 'status': 0, 'state': 'OK',
                'content': {
                    'momentId': moment_id, 'parentCommentId': 0,
                    'nextCommentId': next_cursor_val, 'hasMore': has_more,
                    'commentList': page,
                }, 'message': 'OK',
            })

        # ── 回复列表（游标分页）───────────────────────

        elif path == '/api/social/comment/reply/list':
            import time
            now_ms = int(time.time() * 1000)
            parent_id = int(qp.get('parentCommentId', [0])[0] or '0')
            next_cid = int(qp.get('nextCommentId', [0])[0] or '0')
            limit = int(qp.get('limit', [20])[0] or '20')
            mock_replies = [
                {'commentId': 9101, 'momentId': 0, 'momentAuthorId': 100001, 'authorId': 100001,
                 'nickname': '千隅同学', 'avatar': 'https://picsum.photos/seed/detail_avatar/200/200',
                 'parentCommentId': parent_id, 'replyCommentId': 9001, 'replyUserId': 100002,
                 'commentLevel': 2,
                 'content': {'text': {'text': '@阿青轻生活 谢谢！在深圳湾拍的 😄', 'atIds': [100002]}},
                 'status': 0, 'likes': 1, 'replies': 0, 'hasLike': False,
                 'clientTime': now_ms - 1800000},
            ]
            start = 0
            if next_cid > 0:
                for i, c in enumerate(mock_replies):
                    if c['commentId'] <= next_cid:
                        start = i + 1
                    else:
                        break
            page = mock_replies[start:start + limit]
            next_cursor_val = page[-1]['commentId'] if page else 0
            has_more = start + limit < len(mock_replies)
            self._send_json(200, {
                'requestId': 'test-reply-req-id', 'status': 0, 'state': 'OK',
                'content': {
                    'momentId': 0, 'parentCommentId': parent_id,
                    'nextCommentId': next_cursor_val, 'hasMore': has_more,
                    'commentList': page,
                }, 'message': 'OK',
            })

        else:
            self._send_json(404, {'code': 404, 'message': 'not found'})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_body()

        # ── 手机登录 API ────────────────────────────────

        if path == '/api/user/login/phone/verify_code':
            phone = body.get('phone', '')
            if not phone or not phone.startswith('+'):
                return self._send_json(400, {
                    'requestId': 'test-req-id',
                    'status': 300004,
                    'state': 'P_VALUE_ERROR',
                    'content': None,
                    'message': '手机号格式不正确',
                })
            if phone == '+86-13800138000' or phone == '+86-13800000000':
                return self._send_json(200, {
                    'requestId': 'test-req-id',
                    'status': 0,
                    'state': 'OK',
                    'content': {'needSecondVerify': False},
                    'message': 'OK',
                })
            # 其他手机号 → 频率限制
            return self._send_json(429, {
                'requestId': 'test-req-id',
                'status': 400005,
                'state': 'L_FREQUENT_ACCESS',
                'content': None,
                'message': '操作过于频繁',
            })

        if path == '/api/user/login/phone':
            phone = body.get('phone', '')
            auth_mode = body.get('authMode', 'CODE')
            if not phone or not phone.startswith('+'):
                return self._send_json(400, {
                    'requestId': 'test-req-id',
                    'status': 300004,
                    'state': 'P_VALUE_ERROR',
                    'content': None,
                    'message': '手机号格式不正确',
                })
            if auth_mode == 'CODE':
                code = body.get('code', '')
                if not code:
                    return self._send_json(400, {
                        'requestId': 'test-req-id',
                        'status': 300004,
                        'state': 'P_VALUE_ERROR',
                        'content': None,
                        'message': '验证码不能为空',
                    })
                if code != '123456':
                    return self._send_json(401, {
                        'requestId': 'test-req-id',
                        'status': 100002,
                        'state': 'AUTH_LOGIN_FAIL',
                        'content': None,
                        'message': '验证码不正确',
                    })
            elif auth_mode == 'PASSWORD':
                password = body.get('password', '')
                if password != 'qianyu123':
                    return self._send_json(401, {
                        'requestId': 'test-req-id',
                        'status': 100002,
                        'state': 'AUTH_LOGIN_FAIL',
                        'content': None,
                        'message': '账户或密码错误',
                    })
            else:
                return self._send_json(422, {
                    'requestId': 'test-req-id',
                    'status': 400020,
                    'state': 'R_ERROR',
                    'content': None,
                    'message': '不支持的 authMode 值',
                })

            # 登录成功
            import time
            now_ms = int(time.time() * 1000)
            return self._send_json(200, {
                'requestId': 'test-req-id',
                'status': 0,
                'state': 'OK',
                'content': {
                    'token': 'test-jwt-token-' + phone + '-' + str(now_ms),
                    'userInfo': {
                        'userNo': 'QY' + phone.replace('+86-', ''),
                        'userId': 100001,
                        'nickname': '千语用户_' + phone[-4:],
                        'avatar': None,
                        'bio': '',
                        'gender': 0,
                        'birthday': None,
                        'age': 0,
                        'phone': phone,
                        'phoneVerifiedTime': now_ms,
                        'email': None,
                        'country': 'CN',
                        'province': None,
                        'city': None,
                        'lastLoginTime': now_ms,
                        'status': 0,
                        'freezeEndTime': None,
                        'createTime': now_ms,
                        'updateTime': now_ms,
                    },
                },
                'message': 'OK',
            })

        # ── 文件上传 ─────────────────────────────────

        if path == '/api/storage/upload':
            import time
            file_id = int(time.time() * 1000) % 100000
            return self._send_json(200, {
                'requestId': 'test-storage-req-id',
                'status': 0,
                'state': 'OK',
                'content': {
                    'id': file_id,
                    'url': f'https://cdn.clmcat.com/moment/image/test_{file_id}.jpg',
                    'key': f'moment/image/test_{file_id}.jpg',
                    'platform': 'oss',
                    'fileType': 'jpg',
                },
                'message': 'OK',
            })

        # ── 动态发布 ─────────────────────────────────

        if path == '/api/social/moment/publish':
            content_data = body.get('content', {}) if isinstance(body, dict) else {}
            import time
            now_ms = int(time.time() * 1000)
            mock_moment_id = 8257117397155900 + (now_ms % 1000)
            return self._send_json(200, {
                'requestId': 'test-moment-req-id',
                'status': 0,
                'state': 'OK',
                'content': {
                    'momentId': mock_moment_id,
                    'authorId': 100001,
                    'content': content_data,
                    'latitude': body.get('latitude', 0),
                    'longitude': body.get('longitude', 0),
                    'country': body.get('country', 'CN'),
                    'likes': 0,
                    'comments': 0,
                    'hasLike': False,
                    'status': 0,
                    'createTime': now_ms,
                },
                'message': 'OK',
            })

        # ── 评论发布 ─────────────────────────────────

        if path == '/api/social/comment/publish':
            import time
            now_ms = int(time.time() * 1000)
            mock_comment_id = 9900 + (now_ms % 1000)
            parent_cid = body.get('parentCommentId', 0) if isinstance(body, dict) else 0
            return self._send_json(200, {
                'requestId': 'test-cmt-pub-req-id', 'status': 0, 'state': 'OK',
                'content': {
                    'commentId': mock_comment_id, 'momentId': body.get('momentId', 0),
                    'momentAuthorId': 100001, 'authorId': 100001,
                    'nickname': '千隅同学', 'avatar': '',
                    'parentCommentId': parent_cid,
                    'replyCommentId': body.get('replyCommentId', 0),
                    'replyUserId': 0, 'commentLevel': 1 if parent_cid == 0 else 2,
                    'content': body.get('content', {}),
                    'status': 0, 'likes': 0, 'replies': 0, 'hasLike': False,
                    'clientTime': now_ms,
                }, 'message': 'OK',
            })

        # ── 删除评论 ─────────────────────────────────

        elif path == '/api/social/comment/delete':
            return self._send_json(200, {
                'requestId': 'test-cmt-del-req-id', 'status': 0, 'state': 'OK',
                'content': True, 'message': 'OK',
            })

        # ── 点赞/取消点赞动态 ─────────────────────────

        elif path == '/api/social/like/moment':
            return self._send_json(200, {
                'requestId': 'test-like-req-id', 'status': 0, 'state': 'OK',
                'content': True, 'message': 'OK',
            })

        elif path == '/api/social/like/moment/cancel':
            return self._send_json(200, {
                'requestId': 'test-like-req-id', 'status': 0, 'state': 'OK',
                'content': True, 'message': 'OK',
            })

        # ── 点赞/取消点赞评论 ─────────────────────────

        elif path == '/api/social/like/comment':
            return self._send_json(200, {
                'requestId': 'test-like-req-id', 'status': 0, 'state': 'OK',
                'content': True, 'message': 'OK',
            })

        elif path == '/api/social/like/comment/cancel':
            return self._send_json(200, {
                'requestId': 'test-like-req-id', 'status': 0, 'state': 'OK',
                'content': True, 'message': 'OK',
            })

        # ── 默认回声 ─────────────────────────────────
        self._send_json(200, {
            'code': 200,
            'message': 'ok',
            'data': body,
        })

    def do_PUT(self):
        body = self._read_body()
        self._send_json(200, {
            'code': 200,
            'message': 'ok',
            'data': body,
        })

    def do_DELETE(self):
        body = self._read_body()
        self._send_json(200, {
            'code': 200,
            'message': 'ok',
            'data': body,
        })


if __name__ == '__main__':
    port = 18989
    server = HTTPServer(('127.0.0.1', port), TestHandler)
    print(f'[test-server] listening on http://127.0.0.1:{port}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n[test-server] stopped')
        server.server_close()
