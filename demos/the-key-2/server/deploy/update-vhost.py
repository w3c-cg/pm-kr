#!/usr/bin/env python3
# BSD-2-Clause
"""Add a single include to the selected SSL virtual host."""
import re
import sys
from pathlib import Path

original, output, hostname, port, template, member_output = sys.argv[1:]
config = Path(original).read_text()
vhosts = list(re.finditer(r"(?ims)^\s*<VirtualHost\s+[^>]+>(.*?)^\s*</VirtualHost>", config))
matching = []
for vhost in vhosts:
    names = re.findall(r"(?im)^\s*Server(?:Name|Alias)\s+([^#\n]+)", vhost[1])
    if any(hostname == name.split(':')[0] for line in names for name in line.split()):
        matching.append(vhost)
if len(matching) > 1:
    # The same name on another port (a websocket proxy on 3000, say) is not the site: take the HTTPS one on 443.
    https = [vhost for vhost in matching if re.match(r"(?i)\s*<VirtualHost\s+[^>]*:443[\s>]", vhost[0])]
    if len(https) == 1:
        matching = https
if len(matching) != 1:
    sys.exit(f"Expected one named virtual host for {hostname} in {original}, found {len(matching)}.")

vhost, = matching
if "Include /opt/the-key-demo/apache-vhost.conf" in config:
    sys.exit("The Key include is already present.")
modules = {
    "headers": "headers_module",
    "proxy": "proxy_module",
    "proxy_http": "proxy_http_module",
}
loads = ''.join(
    f"<IfModule !{module}>\n    Include /etc/apache2/mods-available/{name}.load\n</IfModule>\n"
    for name, module in modules.items()
)
updated = (config[:vhost.start()] + "\n" + loads + config[vhost.start():vhost.end(1)]
           + "\n    Include /opt/the-key-demo/apache-vhost.conf\n" + config[vhost.end(1):])
if port:
    certificates = []
    for directive in ("SSLCertificateFile", "SSLCertificateKeyFile", "SSLCertificateChainFile"):
        matches = re.findall(r"(?im)^\s*" + directive + r"[ \t]+(\S[^\n]*?)\s*$", vhost[1])
        if len(matches) != 1:
            if directive == "SSLCertificateChainFile" and not matches:
                continue
            sys.exit(f"Expected one {directive} in the main SSL virtual host for the optional member port.")
        certificates.append(f"{directive} {matches[0]}")
    rules = Path(template).read_text()
    rules = rules.replace("@PORT@", port).replace("@HOST@", hostname)
    rules = rules.replace("@SERVER_TLS@", "\n    ".join(certificates))
    Path(member_output).write_text(rules)
    updated += "\nInclude /opt/the-key-demo/member-vhost.conf\n"
Path(output).write_text(updated)
