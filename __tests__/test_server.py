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

        elif path == '/api/timeout':
            time.sleep(3)
            self._send_json(200, {'code': 200, 'message': 'ok', 'data': None})

        else:
            self._send_json(404, {'code': 404, 'message': 'not found'})

    def do_POST(self):
        parsed = urlparse(self.path)
        body = self._read_body()
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
