#!/bin/bash
# BSD-2-Clause. Deploy The Key on Debian with Apache and systemd.
set -euo pipefail

package=$(dirname "$(realpath "$0")")
site=/var/www/html/demos/the-key
app=/opt/the-key-demo
unit_name=the-key-demo.service
unit=/etc/systemd/system/$unit_name
wants=/etc/systemd/system/multi-user.target.wants/$unit_name
vhost_link=/etc/apache2/sites-enabled/default-ssl.conf
history=/var/backups/the-key-demo

die() { printf 'The Key: %s\n' "$*" >&2; exit 1; }
exists() { [[ -e $1 || -L $1 ]]; }
[[ $EUID == 0 ]] || die "Run as root on the deployment machine."
port_listening() {
  python3 - "$1" <<'PYPORT'
from socket import create_connection
import sys
try:
    with create_connection(("127.0.0.1", int(sys.argv[1])), timeout=1):
        pass
except OSError:
    sys.exit(1)
PYPORT
}
member_port=
if [[ $# == 2 && $1 == --members-port ]]; then
  [[ $2 =~ ^[1-9][0-9]{0,4}$ ]] && (( $2 <= 65535 && $2 != 8450 )) ||
    die "Choose a member port from 1 to 65535 other than the key server's port 8450."
  member_port=$2
elif [[ $# != 0 && ! ($# == 1 && $1 == --undo) ]]; then
  die "Usage: deploy.sh [--members-port PORT | --undo]"
fi
exec 9>/run/lock/the-key-demo.lock
flock -n 9 || die "Another deployment is running."
if [[ -n $member_port ]] && port_listening "$member_port"; then
  die "Member port $member_port is already in use."
fi

restore() {
  local snapshot=$1
  local vhost
  vhost=$(cat "$snapshot/vhost-path") || return
  if systemctl is-active --quiet "$unit_name"; then
    systemctl stop "$unit_name" || return
  fi
  local -a targets=("$site" "$app" "$unit" "$wants")
  local index
  for index in "${!targets[@]}"; do
    rm -rf -- "${targets[index]}" || return
    if exists "$snapshot/before-$index"; then
      cp -a -- "$snapshot/before-$index" "${targets[index]}" || return
    fi
  done
  cp -a -- "$snapshot/vhost" "$vhost" || return
  if [[ -f $snapshot/no-demos-directory ]]; then
    rmdir -- "$(dirname "$site")" || true
  fi
  systemctl daemon-reload || return
  apache2ctl configtest || return
  systemctl reload apache2 9>&- || return
}

if [[ ${1:-} == --undo ]]; then
  [[ -L $history/current ]] || die "There is no active deployment to undo."
  snapshot=$(realpath "$history/current")
  vhost=$(cat "$snapshot/vhost-path")
  if [[ -f $snapshot/deployed-vhost.sha256 ]]; then
    sha256sum --quiet -c "$snapshot/deployed-vhost.sha256" ||
      die "Apache configuration changed after deployment. Review its backup in $snapshot before undo."
  fi
  restore "$snapshot"
  rm -- "$history/current"
  printf 'The Key deployment undone. Backup retained in %s.\n' "$snapshot"
  exit
fi

[[ ! -L $history/current ]] || die "Undo the active deployment before installing another."
[[ $(/usr/bin/node --version) == v18.20.4 ]] || die "Expected /usr/bin/node version 18.20.4."
vhost=$(realpath -e "$vhost_link") || die "Cannot resolve $vhost_link."
[[ -f $vhost ]] || die "The Apache virtual host is missing."
for path in "$site" "$app" "$unit" "$wants"; do
  [[ ! -L $path ]] || die "Refusing to replace symbolic link $path."
done
if exists "$app" || exists "$unit" || exists "$wants" ||
    [[ $(systemctl show -p LoadState --value "$unit_name") != not-found ]]; then
  die "A different installation occupies the service name or application path."
fi
apache2ctl configtest
(cd "$package" && sha256sum --quiet -c SHA256SUMS)
[[ -f $package/site/people/mica.splat.bin ]] || die "The public figure set is missing."

install -d -m 0700 "$history"
snapshot=$(mktemp -d "$history/deploy-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
printf '%s\n' "$vhost" > "$snapshot/vhost-path"
hostname=$(/usr/bin/node -p 'new URL(require(process.argv[1]).public.world).hostname' "$package/site/site-addresses.json")
cp -a -- "$vhost" "$snapshot/vhost"
cp -a -- "$vhost" "$snapshot/configured-vhost"
python3 "$package/update-vhost.py" "$vhost" "$snapshot/configured-vhost" "$hostname" \
  "$member_port" "$package/apache-member.conf" "$snapshot/member-vhost.conf"
targets=("$site" "$app" "$unit" "$wants")
for index in "${!targets[@]}"; do
  if exists "${targets[index]}"; then
    cp -a -- "${targets[index]}" "$snapshot/before-$index"
  fi
done
[[ -d $(dirname "$site") ]] || touch "$snapshot/no-demos-directory"

stage=
rollback() {
  local status=$?
  trap - EXIT
  if [[ -n $stage ]]; then rm -rf -- "$stage"; fi
  if ((status != 0)); then
    if restore "$snapshot"; then
      rm -f -- "$history/current"
      printf 'Deployment failed. Restored the backup in %s.\n' "$snapshot" >&2
    else
      printf 'Deployment failed and restoration needs attention. Backup is in %s.\n' "$snapshot" >&2
    fi
  fi
  exit "$status"
}
ln -s -- "$snapshot" "$history/current"
trap rollback EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

install -d -m 0755 "$(dirname "$site")"
stage=$(mktemp -d "$(dirname "$site")/.the-key-XXXXXX")
cp -a -- "$package/site/." "$stage/"
if [[ -n $member_port ]]; then
  /usr/bin/node - "$stage/site-addresses.json" "$member_port" <<'JS'
const fs = require('node:fs');
const [, , file, port] = process.argv;
const addresses = JSON.parse(fs.readFileSync(file, 'utf8'));
addresses.public.memberPort = Number(port);
fs.writeFileSync(file, JSON.stringify(addresses, null, 2) + '\n');
JS
fi
chown -R root:root "$stage"
chmod -R u=rwX,go=rX "$stage"
rm -rf -- "$site"
mv -T -- "$stage" "$site"
stage=
install -d -m 0755 "$app"
install -m 0644 "$package/key-world-server.mjs" "$package/apache-vhost.conf" "$app/"
if [[ -n $member_port ]]; then
  install -d -m 0755 "$app/member-root"
  install -m 0644 "$package/client-ca.pem" "$app/"
  install -m 0644 "$snapshot/member-vhost.conf" "$app/member-vhost.conf"
fi
install -m 0644 "$package/$unit_name" "$unit"
cp -a -- "$snapshot/configured-vhost" "$vhost"
apache2ctl configtest
systemctl daemon-reload
systemctl enable --now "$unit_name" 9>&-
ready=$(/usr/bin/node -p "new URL('.well-known/openid-configuration', require(process.argv[1]).public.auth).pathname" "$site/site-addresses.json")
for attempt in 1 2 3 4 5; do
  if curl --silent --fail --max-time 2 "http://127.0.0.1:8450$ready" >/dev/null; then break; fi
  (( attempt < 5 )) || die "The key server did not start."
  sleep 1
done
systemctl reload apache2 9>&-
if [[ -n $member_port ]]; then
  for attempt in 1 2 3 4 5; do
    if port_listening "$member_port"; then break; fi
    (( attempt < 5 )) || die "Apache did not open member port $member_port."
    sleep 1
  done
fi
sha256sum "$vhost" > "$snapshot/deployed-vhost.sha256"
printf 'The Key deployed. Undo with %s/deploy.sh --undo. Backup is in %s.\n' "$package" "$snapshot"
