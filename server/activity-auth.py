#!/usr/bin/env python3
import base64
import hashlib
import hmac
import json
import os
import threading
import time
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = int(os.environ.get("ACTIVITIES_AUTH_PORT", "8765"))
ACCESS_CODE = os.environ.get("ACTIVITIES_ACCESS_CODE", "")
SECRET = os.environ.get("ACTIVITIES_SESSION_SECRET", "").encode()
TTL = 3600
FAILURES = {}
FAILURE_LOCK = threading.Lock()

if not ACCESS_CODE or len(SECRET) < 32:
    raise RuntimeError("ACTIVITIES_ACCESS_CODE and a 32+ character ACTIVITIES_SESSION_SECRET are required")


def signature(value):
    digest = hmac.new(SECRET, value.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode()


def session_value():
    expires = str(int(time.time()) + TTL)
    return f"{expires}.{signature(expires)}"


class Handler(BaseHTTPRequestHandler):
    server_version = "CalculatorReadinessAuth/1.0"

    def log_message(self, fmt, *args):
        return

    def respond(self, status, headers=None):
        self.send_response(status)
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()

    def client_ip(self):
        forwarded = self.headers.get("X-Forwarded-For", "")
        return forwarded.split(",", 1)[0].strip() or self.client_address[0]

    def valid_session(self):
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get("Cookie", ""))
            value = cookie["cr_activity"].value
            expires, supplied = value.split(".", 1)
            return expires.isdigit() and int(expires) > int(time.time()) and hmac.compare_digest(supplied, signature(expires))
        except (KeyError, ValueError):
            return False

    def do_GET(self):
        if self.path != "/check":
            return self.respond(404)
        self.respond(204 if self.valid_session() else 401)

    def do_DELETE(self):
        if self.path != "/session":
            return self.respond(404)
        self.respond(204, {"Set-Cookie": "cr_activity=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict"})

    def do_POST(self):
        if self.path != "/session":
            return self.respond(404)
        ip = self.client_ip()
        now = time.time()
        with FAILURE_LOCK:
            entry = FAILURES.get(ip)
            if entry and entry[1] > now and entry[0] >= 5:
                return self.respond(429, {"Retry-After": "900"})
            if entry and entry[1] <= now:
                FAILURES.pop(ip, None)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 1024:
                return self.respond(413)
            supplied = str(json.loads(self.rfile.read(length)).get("code", ""))
        except (ValueError, json.JSONDecodeError):
            supplied = ""
        if not hmac.compare_digest(supplied, ACCESS_CODE):
            with FAILURE_LOCK:
                count, reset = FAILURES.get(ip, (0, now + 900))
                FAILURES[ip] = (count + 1, reset)
            return self.respond(401)
        with FAILURE_LOCK:
            FAILURES.pop(ip, None)
        self.respond(204, {"Set-Cookie": f"cr_activity={session_value()}; Max-Age={TTL}; Path=/; HttpOnly; Secure; SameSite=Strict"})


ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
