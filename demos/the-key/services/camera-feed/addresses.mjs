// BSD-2-Clause. This module and its address list travel together to each service.
let list;
function addressList() {
  list ??= fetch(new URL('site-addresses.json', import.meta.url)).then(response => {
    if (!response.ok) throw new Error('The Key address list could not be loaded.');
    return response.json();
  });
  return list;
}

export async function worldAddresses(location) {
  const { test, public: deployed } = await addressList();
  const mode = new URL(deployed.world).origin === location.origin ? 'public' : 'test';
  const addresses = mode === 'public' ? deployed : test;
  const world = new URL(addresses.world);
  return { ...addresses, mode, worldOrigin: world.origin, present: world.origin === location.origin };
}

export async function serviceAddresses(location) {
  const { test, public: deployed } = await addressList();
  const bases = [...Object.values(deployed.services), deployed.intranet];
  return bases.some(base => location.href.startsWith(base)) ? deployed : test;
}
