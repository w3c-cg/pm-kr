#!/usr/bin/env python3
# SPDX-License-Identifier: BSD-2-Clause
"""Assemble an Apache release and the four static service directories from a checkout."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
from urllib.parse import urlsplit


def digest(file):
    return hashlib.file_digest(file.open("rb"), "sha256").hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("checkout", type=Path)
    parser.add_argument("people", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    demo = args.checkout / "demos/the-key"
    source = demo / "server/deploy"
    addresses = json.loads((demo / "site-addresses.json").read_text())["public"]
    world = urlsplit(addresses["world"])
    services = {name: urlsplit(url) for name, url in addresses["services"].items()}
    origins = {(site.scheme, site.netloc) for site in [world, *services.values()]}
    if len(origins) != 5 or any(scheme != "https" for scheme, host in origins):
        parser.error("The world and its four services require five different HTTPS origins.")

    manifest = json.loads((args.people / "index.json").read_text())
    figures = [*manifest["figures"], manifest["mica"]]
    if len(figures) != 7 or len({entry["figure"] for entry in figures}) != 7 or figures[-1]["id"] != "mica":
        parser.error("The release needs six distinct people and Mica's own model.")
    args.output.mkdir(exist_ok=True)
    if any(args.output.iterdir()):
        parser.error(f"Start with an empty release directory: {args.output}")
    site = args.output / "site"
    site.mkdir()
    excluded = {"server", "source", "services", "people", "ASSETS.sha256"}
    for file in demo.iterdir():
        if file.name not in excluded:
            if file.is_dir():
                shutil.copytree(file, site / file.name)
            else:
                shutil.copy2(file, site)
    if (site / "vendor/dave-raggett").exists():
        parser.error("Remove the review-only reader from the release checkout.")

    people = site / "people"
    people.mkdir()
    for entry in figures:
        for name in [entry["figure"], *entry["clips"].values()]:
            if not re.fullmatch(r"[A-Za-z0-9_-]+\.(splat|anim)\.bin", name) or name.startswith("dancer"):
                parser.error(f"Unexpected public figure or clip path: {name}")
            shutil.copy2(args.people / name, people / name)
    shutil.copy2(args.people / "index.json", people)
    shutil.copy2(demo / "people/README.md", people)

    texture_src = demo.parent / "procedural-texture-rendering"
    texture_dst = site / "texture-player"
    (texture_dst / "player").mkdir(parents=True)
    for name in ("wasm-worker.js", "player/ptr-player.wasm", "LICENSE.txt", "CREDITS.md", "ATTRIBUTIONS.md"):
        shutil.copy2(texture_src / name, texture_dst / name)

    procedures = texture_dst / "scene/procedures"
    procedures.mkdir(parents=True)
    for name in ("floor_tiles_06.p2p", "metal_plate.p2p", "rusty_metal_02.p2p", "rock_05.p2p"):
        shutil.copy2(texture_src / "scene/procedures" / name, procedures)

    lobby = addresses["world"] + "#lobby"
    qr = subprocess.check_output(["qrencode", "-t", "ASCII", "-m", "4", "-l", "M", "-o", "-", lobby], text=True)
    rows = ["".join("0" if line[i:i + 2] == "  " else "1" for i in range(0, len(line), 2)) for line in qr.splitlines()]
    if not rows or len(rows) != len(rows[0]) or not {"0", "1"} <= set("".join(rows)):
        parser.error("qrencode did not emit a square matrix.")
    (site / "models/qr.json").write_text(json.dumps({"url": lobby, "rows": rows}, indent=2) + "\n")

    for folder in ("floor-map", "catalogue", "camera-feed", "pay-portal", "intranet"):
        page = args.output / "pages" / folder
        shutil.copytree(demo / "services" / folder, page)
        for file in ("site-addresses.json", "addresses.mjs", "LICENSE.txt"):
            shutil.copy2(demo / file, page)

    for file in ("the-key-demo.service", "deploy.sh", "update-vhost.py"):
        shutil.copy2(source / file, args.output)
    shutil.copy2(demo / "server/key-world-server.mjs", args.output)
    (site / "members").mkdir()
    shutil.copy2(source / "member.html", site / "members/index.html")
    subprocess.run(["bash", str(source / "make-client.sh"), str(args.output)], check=True)
    api = str(Path(urlsplit(addresses["auth"]).path).parent) + "/"
    members = urlsplit(addresses["members"]).path
    for template in ("apache-vhost.conf", "apache-member.conf"):
        rules = (source / (template + ".in")).read_text()
        rules = rules.replace("@WORLD@", world.path).replace("@API@", api).replace("@MEMBERS_RE@", re.escape(members))
        (args.output / template).write_text(rules)
    (args.output / "SOURCE-COMMIT").write_text(subprocess.check_output(
        ["git", "-C", str(args.checkout), "rev-parse", "HEAD"], text=True))
    files = sorted(file for file in args.output.rglob("*") if file.is_file())
    (args.output / "SHA256SUMS").write_text("".join(f"{digest(file)}  {file.relative_to(args.output)}\n" for file in files))


if __name__ == "__main__":
    main()
