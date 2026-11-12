#!/usr/bin/env python3
"""Build a self-contained Android HTML asset without VK bridge or remote fonts."""
from pathlib import Path
import re

source = Path("index.html").read_text(encoding="utf-8")
patterns = (
    r'<script\s+src=["\']https://unpkg\.com/@vkontakte/vk-bridge/dist/browser\.min\.js["\']\s*></script>\s*',
    r'<link\s+rel=["\']preconnect["\']\s+href=["\']https://fonts\.googleapis\.com["\']\s*/?>\s*',
    r'<link\s+rel=["\']preconnect["\']\s+href=["\']https://fonts\.gstatic\.com["\']\s+crossorigin\s*/?>\s*',
    r'<link\s+href=["\']https://fonts\.googleapis\.com/css2[^"\']+["\']\s+rel=["\']stylesheet["\']\s*/?>\s*',
)
for pattern in patterns:
    source, count = re.subn(pattern, "", source, count=1)
    if count != 1:
        raise SystemExit("Offline Android asset: expected one match for " + pattern)

if re.search(r'<(?:script|link)\b[^>]*(?:src|href)=["\'](?:https?:)?//', source, re.I):
    raise SystemExit("Offline Android asset contains a remote script or stylesheet")
target = Path("app/src/main/assets/index.html")
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(source, encoding="utf-8")
print(f"Offline Android HTML asset created: {target} ({target.stat().st_size} bytes)")
