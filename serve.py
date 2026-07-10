#!/usr/bin/env python3
"""Static server with clean URLs: /platform -> platform.html, / -> index.html"""
from __future__ import annotations

import argparse
import mimetypes
import urllib.parse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent


class CleanURLHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)

        # Redirect *.html to clean URL
        if path.endswith(".html"):
            name = path.rsplit("/", 1)[-1]
            clean = "/" if name == "index.html" else "/" + name[:-5]
            target = clean + (("?" + parsed.query) if parsed.query else "")
            self.send_response(301)
            self.send_header("Location", target)
            self.end_headers()
            return

        # Map clean path to file
        candidate = self._resolve(path)
        if candidate is not None:
            self.path = "/" + candidate.relative_to(ROOT).as_posix()
            if parsed.query:
                self.path += "?" + parsed.query
        return SimpleHTTPRequestHandler.do_GET(self)

    def _resolve(self, path: str) -> Path | None:
        if path in ("", "/"):
            return ROOT / "index.html"

        rel = path.lstrip("/")
        direct = ROOT / rel
        if direct.is_file():
            return direct
        if direct.is_dir() and (direct / "index.html").is_file():
            return direct / "index.html"

        # extensionless page
        html = ROOT / f"{rel}.html"
        if html.is_file():
            return html

        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=5501)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), CleanURLHandler)
    print(f"Serving {ROOT} at http://{args.host}:{args.port}/")
    print("Clean URLs enabled (e.g. /platform, /solutions)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
