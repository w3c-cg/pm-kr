#!/bin/sh
# BSD-2-Clause. Make a throwaway certificate authority, a server certificate for every
# test host of The Key and one client certificate, in the folder given. Test values only.
#   sh make-test-pki.sh DIR
set -eu
dir=${1:?Give an empty folder for the test certificates.}
mkdir -p "$dir"
cd "$dir"
umask 077
days=30
addresses=$(dirname "$(realpath "$0")")/../site-addresses.json
hosts=$(node --input-type=module - "$addresses" <<'JS'
import { readFileSync } from 'node:fs';
const { test } = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const { services, ...base } = test;
console.log([...new Set([...Object.values(base), ...Object.values(services)].map(value => new URL(value).hostname))].join(' '));
JS
)
server_name=${hosts%% *}
san=$(for h in $hosts; do printf 'DNS:%s,' "$h"; done)
san=${san%,}

openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -days "$days" \
  -subj "/CN=The Key test CA" -keyout ca-key.pem -out ca.pem \
  -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign" 2>/dev/null

openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -subj "/CN=$server_name" \
  -keyout server-key.pem -out server.csr 2>/dev/null
printf 'subjectAltName=%s\nextendedKeyUsage=serverAuth\nbasicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\n' "$san" > server.ext
openssl x509 -req -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -days "$days" \
  -extfile server.ext -out server.pem 2>/dev/null

openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -subj "/CN=Test Member 0001/O=The Key test hall" \
  -keyout client-key.pem -out client.csr 2>/dev/null
printf 'extendedKeyUsage=clientAuth\nbasicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\n' > client.ext
openssl x509 -req -in client.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -days "$days" \
  -extfile client.ext -out client.pem 2>/dev/null
head -c 18 /dev/urandom | base64 | tr -d '/+=' > client-p12-password
openssl pkcs12 -export -inkey client-key.pem -in client.pem -certfile ca.pem -name "Test Member 0001" \
  -passout "file:client-p12-password" -out client.p12 2>/dev/null
rm -f server.csr client.csr server.ext client.ext ca.srl
openssl verify -CAfile ca.pem server.pem client.pem
