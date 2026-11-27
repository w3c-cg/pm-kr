# SPDX-License-Identifier: BSD-2-Clause
"""Encode the intended place URL as geometric modules with a four-module border."""
import json
from io import BytesIO
from pathlib import Path
import subprocess
from PIL import Image

demo = Path(__file__).resolve().parents[1]
url = "https://w3c-cg.github.io/pm-kr/demos/the-key/#lobby"
image = Image.open(BytesIO(subprocess.check_output(
    ["qrencode", "-s", "1", "-m", "4", "-l", "M", "-o", "-", url]
))).convert("L")
rows = ["".join("1" if image.getpixel((x, y)) == 0 else "0" for x in range(image.width))
        for y in range(image.height)]
(demo / "models/qr.json").write_text(json.dumps({"url": url, "rows": rows}, indent=2) + "\n")
