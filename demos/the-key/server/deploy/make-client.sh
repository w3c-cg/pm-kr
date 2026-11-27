#!/bin/bash
# BSD-2-Clause. Make a public demo identity and discard the signing key.
set -euo pipefail
out=$(realpath "${1:?Give the assembled deployment directory}")
pki=$(mktemp -d)
trap 'rm -rf -- "$pki"' EXIT
cd "$pki"
umask 077
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -days 365   -subj '/CN=The Key demo client CA' -keyout ca.key -out ca.pem   -addext 'basicConstraints=critical,CA:TRUE' -addext 'keyUsage=critical,keyCertSign,cRLSign' 2>/dev/null
openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes   -subj '/CN=The Key test visitor' -keyout client.key -out client.csr 2>/dev/null
printf 'extendedKeyUsage=clientAuth\nbasicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\n' > client.ext
openssl x509 -req -in client.csr -CA ca.pem -CAkey ca.key -CAcreateserial -days 365   -extfile client.ext -out client.pem 2>/dev/null
openssl verify -purpose sslclient -CAfile ca.pem client.pem
install -m 0644 ca.pem "$out/client-ca.pem"
mkdir -p "$out/site/members"
openssl pkcs12 -export -inkey client.key -in client.pem -name 'The Key test visitor'   -passout pass:the-key-demo -out client.p12
install -m 0644 client.p12 "$out/site/members/test-visitor.p12"
