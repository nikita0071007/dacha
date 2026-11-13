#!/usr/bin/env python3
"""Copy only isolated beta web files into Android WebView assets; strip network dependencies.
Preserve vegetable-only gameplay and animated Marina beta assets.
"""
from pathlib import Path
import re,shutil
source=Path('beta/index.html').read_text(encoding='utf-8')
# Beta HTML itself contains no remote VK bridge or Google Fonts.
# Fail build rather than silently stripping new network dependencies.
if re.search(r"""<(?:script|link)\b[^>]*(?:src|href)=['"](?:https?:)?//""", source, re.I):
 raise SystemExit('Offline beta contains remote script or style')
if 'fonts.googleapis.com' in source or 'fonts.gstatic.com' in source:
 raise SystemExit('Remote Google Fonts still present')
assets=Path('app/src/main/assets')
assets.mkdir(parents=True,exist_ok=True)
(assets/'index.html').write_text(source,encoding='utf-8')
for file in ['step1.js','step1.css','letter.js','letter.css','music.js','music.css','support.js','splash.js','splash.css','screen-lock.css']:
 shutil.copyfile(Path('beta')/file,assets/file)
print('Bundled Android beta assets:',', '.join(f.name for f in assets.iterdir()))
