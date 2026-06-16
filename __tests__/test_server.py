#!/usr/bin/env python3
"""测试用 HTTP 服务器 - 模拟后端 API"""

import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs


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
