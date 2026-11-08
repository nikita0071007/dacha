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
        self.duplicate_ids = set()
        self.external_scripts = []
        self.scripts = []
        self.in_script = False
        self.script_external = False
        self.current = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if "id" in data:
            if data["id"] in self.ids:
                self.duplicate_ids.add(data["id"])
            self.ids.add(data["id"])
        if tag == "script":
            self.in_script = True
            self.script_external = "src" in data
            if self.script_external:
                self.external_scripts.append(data["src"])
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
if p.duplicate_ids:
    sys.exit("Duplicate HTML IDs: " + ", ".join(sorted(p.duplicate_ids)))
if any(src.startswith(("http://", "https://", "//")) for src in p.external_scripts):
    sys.exit("External scripts are incompatible with offline APK")
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
print(f"HTML validated: {len(p.ids)} ids discovered; {len(p.scripts)} inline scripts syntax-checked")

# Regression guards for the agreed visual and gameplay progression.
source = game.read_text(encoding="utf-8")
checks = {
    "six produce types": "['🍅','🥕','🥒','🍓','🥬','🍎']",
    "house stage persistence": "S.houseStage=houseStage()+1",
    "house progression": "const HOUSE_STAGES=[",
    "ruined house damage": "const damage=stage===0?",
    "final green shutters": "const shutters=stage>=5?",
    "pet walking routes": "const PET_PATHS = {",
    "pet motion accessibility": "function walkPets(){",
    "grandma speech animation": "marina-mouth",
    "three wardrobe outfits": "Зелёное в горошек",
    "marina outfit sprite": 'class="marina-dress"',
    "bengal cat sprite": 'Бенгальская кошка',
    "dark brindle bulldog": '#57443C',
    "direct house repair": "d.onclick=renovateHouse",
    "direct fence repair": "d.onclick=renovateFence",
    "save data recovery": "if (!Array.isArray(S.bought)) S.bought = [];",
    "persist visitor name": "S.visitorName = name;",
    "level unlock guard": "i>S.level",
    "clock-safe life recovery": "if(S.lifeTs>now)S.lifeTs=now",
}
for name, token in checks.items():
    if token not in source:
        sys.exit("Missing gameplay regression marker: " + name)
print(f"Gameplay regression markers verified: {len(checks)}")
