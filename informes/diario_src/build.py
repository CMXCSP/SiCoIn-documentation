"""Une el código fuente en un solo HTML autocontenido.
Uso: python build.py   →   dist/tablero_peritos.html
"""
from pathlib import Path

ROOT = Path(__file__).parent
JS_ORDER = ["config", "data", "state", "charts", "cards", "app"]   # el orden importa

def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    js = "\n".join((ROOT / "js" / f"{n}.js").read_text(encoding="utf-8") for n in JS_ORDER)
    lib = (ROOT / "vendor" / "xlsx.mini.min.js").read_text(encoding="utf-8")
    assert "</script" not in lib.lower() and "</script" not in js.lower()
    # Todo el código vive en una función para no dejar variables globales
    app = '(() => {\n"use strict";\n' + js + "\n})();"
    for mark, content in [("/*@@STYLES@@*/", css), ("/*@@SHEETJS@@*/", lib), ("/*@@SCRIPTS@@*/", app)]:
        assert html.count(mark) == 1, mark
        html = html.replace(mark, content)
    out = ROOT / "dist" / "tablero_peritos.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"{out}  ({out.stat().st_size/1024:.0f} KB)")

if __name__ == "__main__":
    main()
