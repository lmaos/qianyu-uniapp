#!/usr/bin/env python3
"""测试用 HTTP 服务器 - 模拟后端 API"""

import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs


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
