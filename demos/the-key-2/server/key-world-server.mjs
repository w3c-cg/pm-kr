// BSD-2-Clause. Test mechanisms and the local origin rig for The Key.
import { createServer as createHttp } from 'node:http';
import { createServer as createHttps } from 'node:https';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash, createPublicKey, generateKeyPairSync, randomBytes, sign, verify } from 'node:crypto';
import { extname, join, normalize } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (value.startsWith('--')) pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));
const site = args.site;
const pki = args.pki;
const mode = args.mode || 'test';
if (!site || !['test', 'public'].includes(mode) || (mode === 'test' && !pki)) {
  console.error('Usage: node key-world-server.mjs --site DIR [--mode test --pki DIR | --mode public --port PORT]');
  process.exit(2);
}
const publicMode = mode === 'public';
const addressFile = publicMode ? join(site, 'site-addresses.json') : new URL('../site-addresses.json', import.meta.url);
const addresses = JSON.parse(readFileSync(addressFile, 'utf8'))[mode];
const worldURL = new URL(addresses.world);
const webauthnURL = new URL(addresses.webauthn);
const authURL = new URL(addresses.auth);
const archiveURL = new URL(addresses.archive);
const memberURL = new URL(addresses.members);
const world = worldURL.origin;
const issuer = authURL.href.replace(/\/$/, '');
const demo = worldURL.pathname;
const port = publicMode ? Number(args.port || 8450) : Number(worldURL.port);
const membersPort = Number(memberURL.port);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.p2p': 'text/plain', '.wasm': 'application/wasm', '.css': 'text/css',
  '.glb': 'model/gltf-binary', '.png': 'image/png', '.svg': 'image/svg+xml', '.bin': 'application/octet-stream',
  '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8'
};
const services = Object.fromEntries(Object.entries({
  ...addresses.services, intranet: addresses.intranet
}).map(([id, address]) => [new URL(address).host, {
  map: 'floor-map', camera: 'camera-feed', pay: 'pay-portal'
}[id] || id]));
const log = (...parts) => console.log(new Date().toISOString(), ...parts);
const b64u = buffer => Buffer.from(buffer).toString('base64url');

// ── Signing key for the identity provider (made at start, never written to disk). ──
const { privateKey: idKey, publicKey: idPublic } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const kid = b64u(createHash('sha256').update(idPublic.export({ format: 'der', type: 'spki' })).digest()).slice(0, 16);
const jwks = { keys: [{ ...idPublic.export({ format: 'jwk' }), kid, alg: 'ES256', use: 'sig' }] };
function jwt(claims) {
  const head = b64u(JSON.stringify({ alg: 'ES256', typ: 'JWT', kid }));
  const body = b64u(JSON.stringify(claims));
  const signature = sign('sha256', Buffer.from(`${head}.${body}`), { key: idKey, dsaEncoding: 'ieee-p1363' });
  return `${head}.${body}.${b64u(signature)}`;
}

// ── State, all in memory and all test values. ──
const clients = new Map([['key-world', { redirect: new URL('callback.html', worldURL).href }]]);
const codes = new Map();
const tokens = new Map();
const challenges = new Map();
const credentials = new Map();
const testPerson = { sub: 'test-visitor-0001', name: 'Test Visitor', email: 'visitor@' + worldURL.hostname };

function send(res, status, body, headers = {}) {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'object' && !Buffer.isBuffer(body) ? 'application/json' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store', ...headers
  });
  res.end(data);
}
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    chunks.push(chunk);
    if (size > 1 << 20) throw new Error('body too large');
  }
  return Buffer.concat(chunks).toString('utf8');
}
async function staticFile(res, root, path, headers = {}) {
  const clean = normalize(decodeURIComponent(path)).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, clean.endsWith('/') ? clean + 'index.html' : clean);
  if (!file.startsWith(root)) return send(res, 403, 'Outside the site.');
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', ...headers });
    res.end(data);
  } catch {
    send(res, 404, 'Missing file: ' + path);
  }
}
function cors(req, extra = {}) {
  const origin = req.headers.origin;
  return origin === world ? { 'Access-Control-Allow-Origin': world, Vary: 'Origin', ...extra } : {};
}

// ── Minimal CBOR reader (RFC 8949 major types 0 to 5 and 7), enough for WebAuthn attestation. ──
function cbor(bytes) {
  let o = 0;
  const length = info => {
    if (info < 24) return info;
    const n = 1 << (info - 24);
    let value = 0;
    for (let i = 0; i < n; i++) value = value * 256 + bytes[o++];
    return value;
  };
  function item() {
    const head = bytes[o++];
    const major = head >> 5;
    const info = head & 31;
    if (major === 0) return length(info);
    if (major === 1) return -1 - length(info);
    if (major === 2) { const n = length(info); const v = bytes.subarray(o, o + n); o += n; return v; }
    if (major === 3) { const n = length(info); const v = Buffer.from(bytes.subarray(o, o + n)).toString('utf8'); o += n; return v; }
    if (major === 4) { const n = length(info); return Array.from({ length: n }, item); }
    if (major === 5) {
      const n = length(info);
      const map = new Map();
      for (let i = 0; i < n; i++) { const key = item(); map.set(key, item()); }
      return map;
    }
    if (major === 7) {
      if (info === 20) return false;
      if (info === 21) return true;
      if (info === 22) return null;
    }
    throw new Error(`CBOR item ${major}/${info} is not used by WebAuthn here`);
  }
  return item();
}
function coseToKey(cose) {
  // RFC 9053 EC2 key: 1 kty = 2, 3 alg = -7 (ES256), -1 crv = 1 (P-256), -2 x, -3 y.
  if (cose.get(1) !== 2 || cose.get(3) !== -7 || cose.get(-1) !== 1) throw new Error('Only ES256 P-256 keys are accepted.');
  return createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: b64u(cose.get(-2)), y: b64u(cose.get(-3)) }, format: 'jwk' });
}
function authenticatorData(raw) {
  const data = Buffer.from(raw);
  const flags = data[32];
  const result = {
    rpIdHash: data.subarray(0, 32), flags, userPresent: Boolean(flags & 1), userVerified: Boolean(flags & 4),
    signCount: data.readUInt32BE(33)
  };
  if (flags & 64) {
    const idLength = data.readUInt16BE(53);
    result.credentialId = data.subarray(55, 55 + idLength);
    result.publicKey = cbor(data.subarray(55 + idLength));
  }
  return result;
}

// ── WebAuthn relying party on the world host (W3C Web Authentication Level 3, sections 7.1 and 7.2). ──
async function webauthn(req, res, path) {
  const rpId = worldURL.hostname;
  const expectedOrigin = world;
  const body = req.method === 'POST' ? JSON.parse(await readBody(req) || '{}') : {};
  const visitor = publicMode ? body.visitor : 'rig';
  if (publicMode && !/^[A-Za-z0-9_-]{32}$/.test(visitor || '')) return send(res, 400, { error: 'Missing test visitor identifier.' });
  const kind = body.kind === 'platform' ? 'platform' : 'cross-platform';
  if (path === 'register-options' || path === 'login-options') {
    const challenge = randomBytes(32);
    challenges.set(b64u(challenge), { kind, visitor, at: Date.now(), path });
    const known = [...credentials.values()].filter(c => c.kind === kind && c.visitor === visitor);
    if (path === 'register-options') {
      return send(res, 200, {
        challenge: b64u(challenge), rp: { id: rpId, name: 'The Key test hall' },
        user: { id: b64u(Buffer.from(publicMode ? visitor : testPerson.sub)), name: testPerson.email, displayName: testPerson.name },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: kind, userVerification: kind === 'platform' ? 'required' : 'discouraged', residentKey: 'discouraged' },
        attestation: 'none', timeout: 20000, excludeCredentials: known.map(c => ({ type: 'public-key', id: c.id }))
      });
    }
    if (!known.length) return send(res, 409, { error: `No ${kind} credential is registered yet.` });
    return send(res, 200, {
      challenge: b64u(challenge), rpId, timeout: 20000, userVerification: kind === 'platform' ? 'required' : 'discouraged',
      allowCredentials: known.map(c => ({ type: 'public-key', id: c.id }))
    });
  }
  const clientData = JSON.parse(Buffer.from(body.clientDataJSON || '', 'base64url').toString('utf8') || '{}');
  const pending = challenges.get(clientData.challenge);
  challenges.delete(clientData.challenge);
  const expectedType = path === 'register' ? 'webauthn.create' : 'webauthn.get';
  if (!pending || pending.visitor !== visitor || Date.now() - pending.at > 120_000 || pending.path !== (path === 'register' ? 'register-options' : 'login-options') || clientData.type !== expectedType || clientData.origin !== expectedOrigin) {
    return send(res, 400, { error: 'The challenge, type or origin did not match.', type: clientData.type, origin: clientData.origin });
  }
  const rpIdHash = createHash('sha256').update(rpId).digest();
  if (path === 'register') {
    const attestation = cbor(Buffer.from(body.attestationObject, 'base64url'));
    const data = authenticatorData(attestation.get('authData'));
    if (!data.rpIdHash.equals(rpIdHash) || !data.userPresent) return send(res, 400, { error: 'The relying party hash or user presence did not match.' });
    if (pending.kind === 'platform' && !data.userVerified) return send(res, 400, { error: 'The platform authenticator did not verify the person.' });
    const key = coseToKey(data.publicKey);
    const id = b64u(data.credentialId);
    credentials.set(id, { id, key, visitor, kind: pending.kind, signCount: data.signCount, fmt: attestation.get('fmt') });
    log('webauthn register', pending.kind, attestation.get('fmt'), 'uv', data.userVerified);
    return send(res, 200, { registered: true, kind: pending.kind, format: attestation.get('fmt'), userVerified: data.userVerified });
  }
  const credential = credentials.get(body.id);
  if (!credential || credential.visitor !== visitor || credential.kind !== pending.kind) return send(res, 400, { error: 'This credential is not registered for this kind of key.' });
  const authData = Buffer.from(body.authenticatorData, 'base64url');
  const data = authenticatorData(authData);
  if (!data.rpIdHash.equals(rpIdHash) || !data.userPresent) return send(res, 400, { error: 'The relying party hash or user presence did not match.' });
  if (pending.kind === 'platform' && !data.userVerified) return send(res, 400, { error: 'The platform authenticator did not verify the person.' });
  const signed = Buffer.concat([authData, createHash('sha256').update(Buffer.from(body.clientDataJSON, 'base64url')).digest()]);
  const valid = verify('sha256', signed, { key: credential.key, dsaEncoding: 'der' }, Buffer.from(body.signature, 'base64url'));
  if (!valid) return send(res, 400, { error: 'The signature did not verify.' });
  if (data.signCount && data.signCount <= credential.signCount) return send(res, 400, { error: 'The signature counter went backwards.' });
  credential.signCount = data.signCount;
  log('webauthn assertion', credential.kind, 'uv', data.userVerified);
  return send(res, 200, { verified: true, kind: credential.kind, userVerified: data.userVerified, signCount: data.signCount });
}

// ── OAuth 2.0 (RFC 6749 4.1) with PKCE (RFC 7636) and OpenID Connect Core 1.0 on the test provider. ──
function consentPage(query) {
  const scope = query.get('scope') || '';
  const fields = ['response_type', 'client_id', 'redirect_uri', 'scope', 'state', 'code_challenge', 'code_challenge_method', 'nonce']
    .map(name => `<input type="hidden" name="${name}" value="${(query.get(name) || '').replace(/[&"<>]/g, '')}">`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Test sign-in</title>
<style>body{font:16px system-ui;background:#0f1a22;color:#e8eef2;display:grid;place-items:center;min-height:90vh}
main{max-width:30rem;border:1px solid #3a5260;padding:1.5rem;border-radius:.6rem}button{font:inherit;padding:.5rem 1rem}</style></head>
<body><main><h1>The Key test sign-in</h1><p>This is a test provider. No real account exists here.</p>
<p><strong>key-world</strong> asks for: <code>${scope.replace(/[&<>]/g, '')}</code>, for ${testPerson.name}.</p>
<form method="post" action="${new URL('authorize', authURL).pathname}">${fields}<button id="allow" name="decision" value="allow">Allow</button>
<button id="deny" name="decision" value="deny">Deny</button></form></main></body></html>`;
}
async function auth(req, res, url) {
  const path = url.pathname.slice(authURL.pathname.length - 1);
  if (path === '/.well-known/openid-configuration') {
    return send(res, 200, {
      issuer, authorization_endpoint: `${issuer}/authorize`, token_endpoint: `${issuer}/token`, jwks_uri: `${issuer}/jwks`,
      response_types_supported: ['code'], code_challenge_methods_supported: ['S256'], id_token_signing_alg_values_supported: ['ES256'],
      subject_types_supported: ['public'], scopes_supported: ['openid', 'profile', 'archive:read']
    }, { 'Access-Control-Allow-Origin': '*' });
  }
  if (path === '/jwks') return send(res, 200, jwks, { 'Access-Control-Allow-Origin': '*' });
  if (path === '/authorize' && req.method === 'GET') {
    const client = clients.get(url.searchParams.get('client_id'));
    if (!client || url.searchParams.get('redirect_uri') !== client.redirect) return send(res, 400, 'Unknown client or redirect address.');
    if (url.searchParams.get('code_challenge_method') !== 'S256' || !url.searchParams.get('code_challenge')) return send(res, 400, 'PKCE with S256 is required.');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(consentPage(url.searchParams));
  }
  if (path === '/authorize' && req.method === 'POST') {
    const form = new URLSearchParams(await readBody(req));
    const client = clients.get(form.get('client_id'));
    if (!client || form.get('redirect_uri') !== client.redirect) return send(res, 400, 'Unknown client or redirect address.');
    const back = new URL(client.redirect);
    back.searchParams.set('state', form.get('state') || '');
    if (form.get('decision') !== 'allow') {
      back.searchParams.set('error', 'access_denied');
    } else {
      const code = b64u(randomBytes(24));
      codes.set(code, {
        client: form.get('client_id'), redirect: client.redirect, scope: form.get('scope') || '',
        challenge: form.get('code_challenge'), nonce: form.get('nonce') || null, at: Date.now()
      });
      back.searchParams.set('code', code);
    }
    res.writeHead(303, { Location: back.href, 'Cache-Control': 'no-store' });
    return res.end();
  }
  if (path === '/token') {
    const headers = cors(req, { 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    if (req.method === 'OPTIONS') return send(res, 204, '', headers);
    const form = new URLSearchParams(await readBody(req));
    const grant = codes.get(form.get('code'));
    codes.delete(form.get('code'));
    if (!grant || form.get('grant_type') !== 'authorization_code' || grant.client !== form.get('client_id') || grant.redirect !== form.get('redirect_uri')) {
      return send(res, 400, { error: 'invalid_grant' }, headers);
    }
    const verifier = form.get('code_verifier') || '';
    if (b64u(createHash('sha256').update(verifier).digest()) !== grant.challenge) {
      log('token refused: PKCE verifier did not match');
      return send(res, 400, { error: 'invalid_grant', error_description: 'The PKCE code verifier does not match the challenge.' }, headers);
    }
    if (Date.now() - grant.at > 60_000) return send(res, 400, { error: 'invalid_grant', error_description: 'The code expired.' }, headers);
    const access = b64u(randomBytes(24));
    tokens.set(access, { scope: grant.scope, client: grant.client, expires: Date.now() + 600_000 });
    const answer = { access_token: access, token_type: 'Bearer', expires_in: 600, scope: grant.scope };
    if (grant.scope.split(' ').includes('openid')) {
      const now = Math.floor(Date.now() / 1000);
      answer.id_token = jwt({ iss: issuer, aud: grant.client, sub: testPerson.sub, name: testPerson.name, email: testPerson.email, nonce: grant.nonce, iat: now, exp: now + 600 });
    }
    log('token issued', grant.scope);
    return send(res, 200, answer, headers);
  }
  return send(res, 404, 'Unknown test provider address.');
}
function archive(req, res, url) {
  const headers = cors(req, { 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': 'Authorization' });
  if (req.method === 'OPTIONS') return send(res, 204, '', headers);
  if (url.pathname !== new URL('door', archiveURL).pathname) return send(res, 404, 'Unknown Archive address.', headers);
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const grant = tokens.get(token);
  if (!grant || grant.expires < Date.now()) return send(res, 401, { open: false, error: 'No valid grant was presented.' }, { ...headers, 'WWW-Authenticate': 'Bearer' });
  if (!grant.scope.split(' ').includes('archive:read')) return send(res, 403, { open: false, error: 'The grant does not include archive:read.' }, headers);
  return send(res, 200, { open: true, scope: grant.scope }, headers);
}

// ── Services: static pages and assets, each from its own origin. ──
const intranetState = { presses: 0, note: '', at: null };
async function service(req, res, host, url) {
  const folder = join(site, demo, 'services', services[host]);
  const path = url.pathname;
  if (path === '/addresses.mjs' || path === '/site-addresses.json') {
    return staticFile(res, join(site, demo), path);
  }
  if (services[host] === 'intranet' && path === '/state') {
    // What the intranet page last saw: lets a test check that input reached the page through a route.
    if (req.method === 'POST') Object.assign(intranetState, JSON.parse(await readBody(req) || '{}'), { at: new Date().toISOString() });
    return send(res, 200, intranetState, { 'Access-Control-Allow-Origin': '*' });
  }
  if (path.startsWith('/nocors/')) return staticFile(res, folder, path.slice('/nocors'.length));
  const embed = { 'Content-Security-Policy': `frame-ancestors ${world}` };
  if (path.startsWith('/assets/')) return staticFile(res, folder, path, { 'Access-Control-Allow-Origin': '*', 'Cross-Origin-Resource-Policy': 'cross-origin' });
  return staticFile(res, folder, path, embed);
}

// Expire unfinished requests even when visitors leave before completing a flow.
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of challenges) if (entry.at + 120_000 < now) challenges.delete(id);
  for (const [id, entry] of codes) if (entry.at + 60_000 < now) codes.delete(id);
  for (const [id, entry] of tokens) if (entry.expires < now) tokens.delete(id);
}, 60_000).unref();

function memberDoor(req, res) {
  const headers = { ...cors(req), 'Access-Control-Allow-Credentials': 'true' };
  const peer = req.socket.getPeerCertificate?.();
  const accepted = publicMode ? req.headers['x-the-key-client-verified'] === 'SUCCESS' : req.socket.authorized;
  if (!accepted) return send(res, 403, { open: false, error: 'A verified demo client certificate is required.' }, headers);
  const subject = publicMode ? req.headers['x-the-key-client-cn'] : peer?.subject?.CN;
  const issuer = publicMode ? req.headers['x-the-key-issuer-cn'] : peer?.issuer?.CN;
  return send(res, 200, { open: true, subject, issuer }, headers);
}

async function route(req, res) {
  const host = req.headers.host || '';
  const url = new URL(req.url, world);
  const path = url.pathname;
  try {
    if (publicMode || host === worldURL.host) {
      if (path.startsWith(webauthnURL.pathname)) {
        return await webauthn(req, res, path.slice(webauthnURL.pathname.length));
      }
      if (!publicMode) {
        if (path === '/') { res.writeHead(302, { Location: demo }); return res.end(); }
        return await staticFile(res, site, path, { 'Cross-Origin-Resource-Policy': 'same-site' });
      }
    }
    if ((publicMode || host === authURL.host) && path.startsWith(authURL.pathname)) return await auth(req, res, url);
    if ((publicMode || host === archiveURL.host) && path.startsWith(archiveURL.pathname)) return archive(req, res, url);
    if (publicMode && addresses.memberPort && path === new URL('door', memberURL).pathname) return memberDoor(req, res);
    if (!publicMode && Object.hasOwn(services, host)) return await service(req, res, host, url);
    return send(res, 404, 'This key server does not serve that address.');
  } catch (error) {
    log('error', req.method, error.message);
    return send(res, 500, { error: 'The test server could not complete the request.' });
  }
}

if (publicMode) {
  // Only Apache can route public requests here. Apache authenticates the member path.
  createHttp(route).listen(port, '127.0.0.1', () => log('serving behind Apache', port));
} else {
  const tls = {
    key: readFileSync(join(pki, 'server-key.pem')),
    cert: readFileSync(join(pki, 'server.pem')),
    ca: readFileSync(join(pki, 'ca.pem'))
  };
  createHttps(tls, route).listen(port, '127.0.0.1', () => log('serving', port));
  createHttps({ ...tls, requestCert: true, rejectUnauthorized: true }, (req, res) => {
    const url = new URL(req.url, memberURL);
    if (url.pathname === new URL('door', memberURL).pathname) return memberDoor(req, res);
    return send(res, 404, 'Unknown member door address.');
  }).listen(membersPort, '127.0.0.1', () => log('members door', membersPort));
}
