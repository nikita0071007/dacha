#!/usr/bin/env python3
"""Lightweight offline HTML game checks before building the APK."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
import tempfile

class GameParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.scripts = []
        self.in_script = False
        self.script_external = False
        self.current = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if "id" in data:
            if data["id"] in self.ids:
                raise ValueError("Duplicate HTML id: " + data["id"])
            self.ids.add(data["id"])
        if tag == "script":
            self.in_script = True
            self.script_external = "src" in data
            self.current = []

    def handle_data(self, data):
        if self.in_script and not self.script_external:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.in_script:
            if not self.script_external:
                self.scripts.append("".join(self.current))
            self.in_script = False

game = Path("index.html")
if not game.exists():
    sys.exit("Missing index.html")
p = GameParser()
p.feed(game.read_text(encoding="utf-8"))
for required in ("home", "game", "scene", "granny", "wardrobeBtn", "gardenStyleBtn", "musicBtn", "soundBtn"):
    if required not in p.ids:
        sys.exit("Missing game UI element: " + required)
if not p.scripts:
    sys.exit("Missing inline JavaScript")
with tempfile.TemporaryDirectory() as tmp:
    for index, js in enumerate(p.scripts):
        if not js.strip():
            continue
        target = Path(tmp) / f"inline_{index}.js"
        target.write_text(js, encoding="utf-8")
        subprocess.run(["node", "--check", str(target)], check=True)
print(f"HTML validated: {len(p.ids)} unique ids; {len(p.scripts)} inline scripts syntax-checked")
