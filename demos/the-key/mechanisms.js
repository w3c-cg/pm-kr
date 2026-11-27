// BSD-2-Clause. The real mechanisms behind the keys, run against the local test server's origins.
// Nothing here is simulated: when a mechanism cannot run, it says why and the door stays closed.
const enc = new TextEncoder();
const b64u = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64u = text => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4)), c => c.charCodeAt(0));
const random = n => crypto.getRandomValues(new Uint8Array(n));

class Refusal extends Error {}

async function request(url, options) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000), ...options });
    if (response.status >= 500) throw new Error('HTTP ' + response.status);
    return response;
  } catch (error) {
    throw new Refusal(`The key server at ${url.host} could not be reached (${error.message}). The door stays closed.`);
  }
}

/** Open the provider in a window and wait for the callback page (same origin as the world) to hand back the code. */
function authorize(origins, params) {
  return new Promise((resolve, reject) => {
    const url = new URL('authorize', origins.auth);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const popup = window.open(url.href, 'key-world-auth', 'popup,width=520,height=560');
    if (!popup) { reject(new Refusal('The browser blocked the sign-in window. Allow pop-ups for this page and press Action again.')); return; }
    const timer = setTimeout(() => { cleanup(); reject(new Refusal('The test provider did not answer within 120 seconds. Check that its sign-in page opened.')); }, 120_000);
    function onMessage(event) {
      if (event.source !== popup || event.origin !== origins.worldOrigin || event.data?.kind !== 'key-world-callback') return;
      cleanup();
      if (event.data.error) reject(new Refusal('The test provider answered: ' + event.data.error + '.'));
      else if (event.data.state !== params.state) reject(new Refusal('The state did not match; the answer was not for this request.'));
      else resolve(event.data.code);
    }
    function cleanup() { clearTimeout(timer); window.removeEventListener('message', onMessage); try { popup.close(); } catch {} }
    window.addEventListener('message', onMessage);
  });
}

async function codeFlow(origins, scope) {
  const verifier = b64u(random(32));
  const challenge = b64u(await crypto.subtle.digest('SHA-256', enc.encode(verifier)));
  const state = b64u(random(16));
  const nonce = b64u(random(16));
  const redirect = new URL('callback.html', import.meta.url).href;
  const code = await authorize(origins, {
    response_type: 'code', client_id: 'key-world', redirect_uri: redirect, scope, state, nonce,
    code_challenge: challenge, code_challenge_method: 'S256'
  });
  const response = await request(new URL('token', origins.auth), {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect, client_id: 'key-world', code_verifier: verifier })
  });
  const answer = await response.json();
  if (!response.ok) throw new Refusal('The test provider refused the code: ' + (answer.error_description || answer.error) + '.');
  return { answer, nonce };
}

async function verifyIdToken(origins, token, nonce) {
  const [head, body, signature] = token.split('.');
  const header = JSON.parse(new TextDecoder().decode(fromB64u(head)));
  const claims = JSON.parse(new TextDecoder().decode(fromB64u(body)));
  const jwks = await (await request(new URL('jwks', origins.auth))).json();
  const jwk = jwks.keys.find(k => k.kid === header.kid);
  if (header.alg !== 'ES256' || !jwk) throw new Refusal('The ID token names no key that the test provider publishes.');
  const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, fromB64u(signature), enc.encode(head + '.' + body));
  if (!valid) throw new Refusal('The ID token signature did not verify.');
  if (claims.iss !== origins.auth.replace(/\/$/, '') || claims.aud !== 'key-world') throw new Refusal('The ID token was issued by or for someone else.');
  if (claims.nonce !== nonce) throw new Refusal('The ID token nonce did not match this sign-in.');
  if (claims.exp * 1000 < Date.now()) throw new Refusal('The ID token has expired.');
  return claims;
}

async function webauthn(origins, kind, enrolled, visitor) {
  if (!window.PublicKeyCredential) throw new Refusal('This browser has no Web Authentication API.');
  const post = (path, body) => request(new URL(path, origins.webauthn), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, visitor })
  });
  const label = kind === 'platform' ? 'fingerprint reader (platform authenticator)' : 'security key (roaming authenticator)';
  if (!enrolled.has(kind)) {
    const replyOptions = await post('register-options', { kind });
    const options = await replyOptions.json();
    if (!replyOptions.ok) throw new Refusal(options.error);
    let credential;
    try {
      credential = await navigator.credentials.create({ publicKey: {
        ...options, challenge: fromB64u(options.challenge), user: { ...options.user, id: fromB64u(options.user.id) },
        excludeCredentials: options.excludeCredentials.map(c => ({ ...c, id: fromB64u(c.id) }))
      } });
    } catch (error) {
      throw new Refusal(`No ${label} answered (${error.name}). The door stays closed.`);
    }
    const reply = await post('register', {
      kind, id: credential.id, clientDataJSON: b64u(credential.response.clientDataJSON), attestationObject: b64u(credential.response.attestationObject)
    });
    const result = await reply.json();
    if (!reply.ok) throw new Refusal('The server refused the new key: ' + result.error);
    enrolled.add(kind);
    return { enrolled: true, result };
  }
  const options = await post('login-options', { kind });
  const body = await options.json();
  if (!options.ok) throw new Refusal(body.error);
  let assertion;
  try {
    assertion = await navigator.credentials.get({ publicKey: {
      ...body, challenge: fromB64u(body.challenge), allowCredentials: body.allowCredentials.map(c => ({ ...c, id: fromB64u(c.id) }))
    } });
  } catch (error) {
    throw new Refusal(`The ${label} did not sign (${error.name}). The door stays closed.`);
  }
  const reply = await post('login', {
    kind, id: assertion.id, clientDataJSON: b64u(assertion.response.clientDataJSON),
    authenticatorData: b64u(assertion.response.authenticatorData), signature: b64u(assertion.response.signature)
  });
  const result = await reply.json();
  if (!reply.ok) throw new Refusal('The server refused the signature: ' + result.error);
  return { enrolled: false, result };
}

export const localMemberNotice = 'Runs in the local test rig. Public access needs a dedicated HTTPS port for the client-certificate handshake.';

export function memberDoorURL(origins) {
  const door = new URL('door', origins.members);
  if (origins.mode === 'public') {
    if (!origins.memberPort) return null;
    door.port = origins.memberPort;
  }
  return door;
}

/**
 * Run the mechanism a station asked for. Returns { ok, outcome, notice, grantKey?, door? }.
 * The mechanism runs only on a configured world origin.
 */
export function createMechanisms(origins) {
  const memory = { token: null, identity: null, enrolled: new Set(), visitor: b64u(random(24)) };
  const log = [];
  async function run(name) {
    const record = { name, at: new Date().toISOString() };
    log.push(record);
    if (!origins.present) {
      record.result = 'absent';
      return { ok: false, outcome: 'represented', notice: 'This copy has no key server. The key is represented here, and the door stays closed.' };
    }
    try {
      if (name === 'grant') {
        const { answer } = await codeFlow(origins, 'archive:read');
        memory.token = answer.access_token;
        record.result = 'grant';
        return { ok: true, outcome: 'grant', grantKey: 'oauth', notice: `Gatehouse added: the test provider issued a grant for ${answer.scope} after the PKCE check. Use it at the Archive.` };
      }
      if (name === 'archive') {
        const response = await request(new URL('door', origins.archive), { headers: { Authorization: 'Bearer ' + memory.token } });
        const answer = await response.json();
        record.result = response.status;
        if (!response.ok) return { ok: false, outcome: 'refused', notice: 'the Archive server refused the grant: ' + answer.error };
        return { ok: true, outcome: 'opened', door: 'false', notice: `The Archive opened: the Archive server accepted the bearer grant (${answer.scope}).` };
      }
      if (name === 'identity') {
        const { answer, nonce } = await codeFlow(origins, 'openid profile');
        const claims = await verifyIdToken(origins, answer.id_token, nonce);
        memory.identity = claims;
        record.result = 'identity';
        return { ok: true, outcome: 'signed-in', notice: `Signed in as ${claims.name}: the ID token from ${claims.iss} carries a valid ES256 signature, audience and nonce.` };
      }
      if (name === 'hwkey' || name === 'finger') {
        const kind = name === 'finger' ? 'platform' : 'cross-platform';
        const { enrolled, result } = await webauthn(origins, kind, memory.enrolled, memory.visitor);
        record.result = enrolled ? 'enrolled' : 'verified';
        const what = name === 'finger' ? 'Your fingerprint' : 'Your security key';
        if (enrolled) return { ok: true, outcome: 'enrolled', notice: `${what} is now enrolled here (attestation “${result.format}”). Press Action again to open.` };
        return { ok: true, outcome: 'opened', door: name === 'finger' ? 'office' : 'vault',
          notice: `${what} signed the challenge and the server verified it${result.userVerified ? ', with user verification' : ''}.` };
      }
      if (name === 'tls') {
        const url = memberDoorURL(origins);
        if (!url) {
          record.result = 'local-only';
          return { ok: false, outcome: 'represented', notice: localMemberNotice + ' The door stays closed here.' };
        }
        let response;
        try {
          response = await request(url, { credentials: 'include' });
        } catch (error) {
          record.result = 'handshake';
          return { ok: false, outcome: 'refused', notice: 'The member door could not complete the TLS request. It needs the demo client certificate and a reachable server. The door stays closed.' };
        }
        record.result = response.status;
        if (!response.ok) {
          return { ok: false, outcome: 'refused', notice: 'The member door could not verify the demo certificate. Check that the browser presented it. The door stays closed.' };
        }
        const answer = await response.json();
        if (!answer.open) throw new Refusal('The member door did not confirm the client certificate.');
        return { ok: true, outcome: 'opened', door: 'server', notice: `The server room opened: the member door read the certificate “${answer.subject}” issued by ${answer.issuer}.` };
      }
      throw new Refusal('Unknown mechanism ' + name + '.');
    } catch (error) {
      record.result = 'error';
      record.error = error.message;
      return { ok: false, outcome: 'refused', notice: error instanceof Refusal ? error.message : 'The mechanism failed: ' + error.message };
    }
  }
  return { run, origins, memory, log };
}
