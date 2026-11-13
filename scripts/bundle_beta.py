#!/usr/bin/env python3
"""Copy only isolated beta web files into Android WebView assets; strip network dependencies.
Preserve vegetable-only gameplay and animated Marina beta assets.
"""
from pathlib import Path
import re,shutil
source=Path('beta/index.html').read_text(encoding='utf-8')
rules=[
 r'<script\s+src=["\']https://unpkg\.com/@vkontakte/vk-bridge/dist/browser\.min\.js["\']\s*></script>\s*',
 r'<link\s+rel=["\']preconnect["\']\s+href=["\']https://fonts\.googleapis\.com["\']\s*/?>\s*',
 r'<link\s+rel=["\']preconnect["\']\s+href=["\']https://fonts\.gstatic\.com["\']\s+crossorigin\s*/?>\s*',
 r'<link\s+href=["\']https://fonts\.googleapis\.com/css2[^"\']+["\']\s+rel=["\']stylesheet["\']\s*/?>\s*'
]
for rule in rules:
 source,n=re.subn(rule,'',source,count=1)
 if n!=1:raise SystemExit('Missing expected remote resource: '+rule)
if re.search(r'<(?:script|link)\b[^>]*(?:src|href)=["\'](?:https?:)?//',source,re.I):
 raise SystemExit('Offline beta still includes remote script/style')
assets=Path('app/src/main/assets')
assets.mkdir(parents=True,exist_ok=True)
(assets/'index.html').write_text(source,encoding='utf-8')
for file in ['step1.js','step1.css','letter.js','letter.css','music.js','music.css','support.js','splash.js','splash.css']:
 shutil.copyfile(Path('beta')/file,assets/file)
print('Bundled Android beta assets:',', '.join(f.name for f in assets.iterdir()))
