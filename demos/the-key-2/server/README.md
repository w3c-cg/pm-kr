# The Key's local test server

The keys in The Key say on themselves which mechanism is real.
OAuth 2.0, OpenID Connect, WebAuthn and the TLS client certificate run for real only against this server, on one machine, with test values made when it starts.
Without it, those keys say that their mechanism needs it, and their doors stay closed.

## What it serves

| Host name | Role |
| --- | --- |
| `key-world.test` | The world page and its WebAuthn relying party (W3C Web Authentication, registration and authentication ceremonies; the server checks the attestation, the signature and user verification). |
| `auth.test` | An OAuth 2.0 authorization server ([RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) section 4.1) that requires PKCE with S256 ([RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)), and an OpenID Connect provider whose ID tokens are signed with ES256. |
| `archive.test` | A resource server that opens only for a bearer token with the scope `archive:read`. |
| `members.test` (port 9443) | A door that asks for a client certificate in the TLS handshake ([RFC 8446](https://www.rfc-editor.org/rfc/rfc8446) section 4.3.2) and names the certificate it received. |
| `floor-map.test`, `catalogue.test`, `camera-feed.test`, `pay-portal.test`, `intranet.test` | The services the person composes, and the ordinary intranet page the tablet shows. Each is its own site. |

No account, password or key of any real service is used.
The `.test` names are reserved for testing by [RFC 6761](https://www.rfc-editor.org/rfc/rfc6761).

## Run it

```sh
sh server/make-test-pki.sh /path/to/empty/folder
node server/key-world-server.mjs --site /path/to/pm-kr --pki /path/to/empty/folder
```

Resolve the host names above to `127.0.0.1` in the hosts file of the machine (or container) running the browser, make the browser trust `ca.pem`, and open `https://key-world.test:8443/demos/the-key/`.
For the member certificate, import `client.p12` (its password is in `client-p12-password`) into the browser.
The test certificates last 30 days.

## Public deployment

The address profiles are in [site-addresses.json](../site-addresses.json).
The public copy uses Apache for the static site and TLS, and starts the key server on loopback with `--mode public` under systemd.
The authorization provider, archive and WebAuthn are under the demo API path.
The public member key describes the local rig while its dedicated listener is disabled.
An administrator can install with `bash deploy.sh --members-port PORT` to enable a dedicated Apache TLS virtual host.
Use the same port externally and on the server so the world’s address matches the listener.
This requires a free port and an explicit certificate and key pair in the existing world virtual host.
The listener uses that certificate and asks for the demo client identity during the initial TLS handshake.
The main HTTPS virtual host retains its own TLS policy.
The dedicated listener accepts only the member-door path.
The browser's demo certificate represents a shared test identity and is suitable only for this demonstration.

Build the CC0 figures with `source/build-people.py` under Blender with MPFB installed in its local extension repository.
Use the [figure credits](../people/README.md) to locate the source assets and BVH recordings.
Then run `python3 demos/the-key/server/deploy/assemble.py CHECKOUT FIGURES OUTPUT` with Python 3.11 or newer, OpenSSL and qrencode.
The checkout should be clean and OUTPUT should be empty.

The assembled folder contains the Apache snippet, the systemd unit, the server, the static site and the Pages files.
Install it with `bash deploy.sh` on the Apache host, as root.
The script checks the bundle sums and tests Apache configuration before it reloads.
Use `bash deploy.sh --undo` to restore the previous site and virtual host and stop the demo service.
The backup remains under `/var/backups/the-key-demo/`.
