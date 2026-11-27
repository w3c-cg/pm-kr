// BSD-2-Clause
// What the person carries. Each key says on itself which mechanism is real in this demo and which is only represented.
export const KEYS = [
  { id: 'visitor', name: 'Threshold', kind: 'Visitor key', scope: 'Public lobby', color: 'amber', shape: 'visitor',
    mechanism: 'Represented: a visitor pass held in the page. No real credential.' },
  { id: 'account', name: 'Circuit', kind: 'Account key', scope: 'Members’ entrance', color: 'teal', shape: 'account',
    mechanism: 'Represented: a game-store account key held in the page. No real account.' },
  { id: 'mandate', name: 'Relay', kind: 'Lent key', scope: 'Mica’s parcel hatch', color: 'violet', shape: 'mandate',
    mechanism: 'Represented: a mandate with one use and 30 seconds, held in the page.' },
  { id: 'identity', name: 'Studio ID', kind: 'Account identity', scope: 'Identity kiosk', color: 'white', shape: 'badge',
    mechanism: 'Real with the test server: OpenID Connect sign-in at the test provider, an ES256 ID token checked in the page. It stands for an account such as an Apple ID; no real service is used.' },
  { id: 'oauth', name: 'Gatehouse', kind: 'OAuth grant', scope: 'Archive', color: 'amber', shape: 'tag',
    mechanism: 'Real with the test server: OAuth 2.0 authorization code with PKCE (S256) from the test provider; the Archive checks the bearer token.' },
  { id: 'hwkey', name: 'Security key', kind: 'Hardware key', scope: 'Vault', color: 'signal', shape: 'fob',
    mechanism: 'Real: WebAuthn with a roaming authenticator (a USB security key; a virtual one in the test rig). The server checks the signature.' },
  { id: 'finger', name: 'Fingerprint', kind: 'Platform key', scope: 'Studio office', color: 'teal', shape: 'finger',
    mechanism: 'Real: WebAuthn with the platform authenticator and user verification (a fingerprint reader; a virtual one in the test rig).' },
  { id: 'tls', name: 'Member certificate', kind: 'TLS client key', scope: 'Server room', color: 'violet', shape: 'certificate',
    mechanism: 'Real when the browser holds the test client certificate: the member door checks it over TLS.' }
];

// Services the person carries as cards. The page does not decide which services exist: the person
// adds any address; these three are this person's starting cards, kept in this browser.
export const DEFAULT_CARDS = [
  { id: 'map', name: 'Floor map', color: 'teal' },
  { id: 'catalogue', name: 'Catalogue', color: 'amber' },
  { id: 'camera', name: 'Camera feed', color: 'signal' }
];

export const ROOMS = {
  hall: { z: 0, label: 'Headquarters hall' },
  lobby: { z: -26, label: 'Public lobby' },
  lab: { z: -48, label: 'Members’ lab' }
};

export const STATIONS = [
  { id: 'public', label: 'Public lobby', x: 0, z: -5.9, room: 'hall', key: 'visitor', door: true },
  { id: 'member', label: 'Members’ entrance', x: 5.05, z: -5.9, room: 'hall', key: 'account', door: true },
  { id: 'false', label: 'Archive door', x: -5.05, z: -5.9, room: 'hall', key: 'oauth', door: true },
  { id: 'desk', label: 'Account desk', x: 4.5, z: .35, room: 'hall' },
  { id: 'helper', label: 'Mica the helper', x: -3.2, z: -4.68, room: 'hall' },
  { id: 'hatch', label: 'Parcel hatch', x: -4.85, z: -3.05, room: 'hall', key: 'mandate' },
  { id: 'qr', label: 'Lobby address', x: -7.7, z: -2.35, room: 'hall' },
  { id: 'kiosk', label: 'Identity kiosk', x: -1.75, z: -5.35, room: 'hall', key: 'identity' },
  { id: 'vault', label: 'Vault', x: 7.85, z: -4.0, yaw: -Math.PI / 2, room: 'hall', key: 'hwkey', door: true },
  { id: 'server', label: 'Server room', x: 7.85, z: -1.55, yaw: -Math.PI / 2, room: 'hall', key: 'tls', door: true },
  { id: 'office', label: 'Studio office', x: -7.85, z: .9, yaw: Math.PI / 2, room: 'hall', key: 'finger', door: true },
  { id: 'return', label: 'Return to the hall', x: 0, z: -4.35, room: 'lobby' },
  { id: 'lab-return', label: 'Return to the hall', x: 0, z: -4.35, room: 'lab' }
];

export const LIMIT_SECONDS = 30;
export const START_KEYS = ['visitor', 'identity', 'hwkey', 'finger', 'tls'];

/**
 * The story state and its rules. Stations whose key has a real mechanism hand the work to
 * the mechanisms module (asynchronous); the story only records what the mechanism answered.
 */
export function createStory(directLobby = false) {
  const state = {
    room: directLobby ? 'lobby' : 'hall',
    keys: new Set(START_KEYS),
    selected: 'visitor',
    mandate: null,
    parcel: false,
    opened: new Set(),
    notice: directLobby ? 'You arrived at the public lobby address.'
      : 'Threshold, your Studio ID, a security key, your fingerprint and a member certificate are in your inventory.',
    outcome: 'arrival'
  };

  function tell(outcome, notice, move) {
    state.outcome = outcome;
    state.notice = notice;
    return move;
  }

  function select(id) {
    if (state.keys.has(id)) state.selected = id;
  }

  function activate(station, now) {
    switch (station.id) {
      case 'desk':
        state.keys.add('account');
        select('account');
        return tell('account', 'Circuit added. The members’ entrance is now visible.');
      case 'helper':
        if (state.mandate?.spent) return tell('spent', 'Mica has already used Relay’s one allowed delivery.');
        if (state.mandate && now < state.mandate.expires) {
          return tell('lent', 'Mica already holds Relay. Take it to the parcel hatch.');
        }
        state.keys.add('mandate');
        state.mandate = { expires: now + LIMIT_SECONDS * 1000, spent: false };
        select('mandate');
        return tell('lent', 'You lent Relay to Mica for one delivery within 30 seconds.');
      case 'qr':
        return tell('address', 'The wall code and the lobby link name the same place.');
      case 'return':
      case 'lab-return':
        state.room = 'hall';
        return tell('return', 'You returned to the headquarters hall.', 'hall');
    }
    if (station.id === 'false' && state.selected === 'identity' && !state.keys.has('oauth')) {
      tell('pending', 'The Archive asks the test provider for an OAuth grant in your name…');
      return { mechanism: 'grant' };
    }
    if (state.selected !== station.key) {
      const selected = KEYS.find(key => key.id === state.selected);
      if (station.id === 'false') {
        return tell('wrong-door', 'The Archive refuses ' + selected.name + '. It accepts an OAuth grant: use your Studio ID here to ask for one.');
      }
      return tell('wrong-key', selected.name + ' is scoped to ' + selected.scope + '. This door stays closed.');
    }
    const real = { kiosk: 'identity', false: 'archive', vault: 'hwkey', office: 'finger', server: 'tls' }[station.id];
    if (real) {
      tell('pending', 'Asking the real mechanism behind ' + KEYS.find(key => key.id === station.key).name + '…');
      return { mechanism: real };
    }
    if (station.id === 'hatch') {
      if (state.mandate.spent) return tell('spent', 'Relay’s single permitted use is spent. The hatch stays closed.');
      if (now >= state.mandate.expires) return tell('expired', 'Relay’s 30-second mandate expired. The hatch stays closed.');
      state.mandate.spent = true;
      state.parcel = true;
      return tell('delivered', 'Mica used Relay once and delivered the parcel.');
    }
    if (station.id === 'member') {
      state.room = 'lab';
      state.opened.add('member');
      return tell('member', 'Circuit opened the members’ lab.', state.room);
    }
    state.room = 'lobby';
    state.opened.add('public');
    return tell('public', 'Threshold opened the public lobby.', state.room);
  }

  return { state, activate, select, tell };
}
