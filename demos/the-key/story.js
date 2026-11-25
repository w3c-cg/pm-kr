// BSD-2-Clause
export const KEYS = [
  { id: 'visitor', name: 'Threshold', kind: 'Visitor key', scope: 'Public lobby', color: 'amber' },
  { id: 'account', name: 'Circuit', kind: 'Account key', scope: 'Members’ entrance', color: 'teal' },
  { id: 'mandate', name: 'Relay', kind: 'Lent key', scope: 'Mica’s parcel hatch', color: 'violet' }
];

export const STATIONS = [
  { id: 'public', label: 'Public lobby', x: 0, z: -5.9, room: 'hall', key: 'visitor' },
  { id: 'member', label: 'Members’ entrance', x: 5.05, z: -5.9, room: 'hall', key: 'account' },
  { id: 'false', label: 'Archive door', x: -5.05, z: -5.9, room: 'hall' },
  { id: 'desk', label: 'Account desk', x: 4.5, z: .35, room: 'hall' },
  { id: 'helper', label: 'Mica the helper', x: -4.5, z: .35, room: 'hall' },
  { id: 'hatch', label: 'Parcel hatch', x: -4.85, z: -3.05, room: 'hall', key: 'mandate' },
  { id: 'qr', label: 'Lobby address', x: -7.7, z: -2.35, room: 'hall' },
  { id: 'return', label: 'Return to the hall', x: 0, z: -4.35, room: 'lobby' }
];

export const LIMIT_SECONDS = 30;

export function createStory(directLobby = false) {
  const state = {
    room: directLobby ? 'lobby' : 'hall',
    keys: new Set(['visitor']),
    selected: 'visitor',
    mandate: null,
    parcel: false,
    notice: directLobby ? 'You arrived at the public lobby address.' : 'Threshold added to your keyring.',
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

  function nextKey() {
    const held = KEYS.filter(key => state.keys.has(key.id));
    const current = held.findIndex(key => key.id === state.selected);
    select(held[(current + 1) % held.length].id);
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
      case 'false':
        return tell('wrong-door', 'The Archive refuses this key. It was issued for a different door.');
      case 'qr':
        return tell('address', 'The wall code and the lobby link name the same place.');
      case 'return':
        state.room = 'hall';
        return tell('return', 'You returned to the headquarters hall.', 'hall');
    }

    if (state.selected !== station.key) {
      const selected = KEYS.find(key => key.id === state.selected);
      return tell('wrong-key', selected.name + ' is scoped to ' + selected.scope + '. This door stays closed.');
    }
    if (station.id === 'hatch') {
      if (state.mandate.spent) return tell('spent', 'Relay’s single permitted use is spent. The hatch stays closed.');
      if (now >= state.mandate.expires) return tell('expired', 'Relay’s 30-second mandate expired. The hatch stays closed.');
      state.mandate.spent = true;
      state.parcel = true;
      return tell('delivered', 'Mica used Relay once and delivered the parcel.');
    }
    state.room = 'lobby';
    return tell(station.id, station.id === 'member' ? 'Circuit opened the members’ entrance.' :
      'Threshold opened the public lobby.', 'lobby');
  }

  return { state, activate, select, nextKey };
}
