# Synthetic User: an AI that acts as a declared, delegated user

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 31 October 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.

## The question

AI agents now act on the web for people.
Many proposals give them their own protocols, their own identities and standing autonomy.
A site, and the person behind the agent, need simpler answers: who is acting, for whom, under what mandate, and who answers for the result.

## The proposal

A Synthetic User is an AI that works through a profile like a person's account, on the web as it already is.
The term comes from Knowledge3D, where "AI accounts = user accounts".

1. **Declared.** The profile says it is synthetic, and who it acts for.
2. **Delegated, on demand.** It acts under a mandate from a person, like a power of attorney (in Portuguese, a procuração), for the task that person asks for, and stops there.
3. **Bounded and revocable.** The person sets the scope and can revoke it at any time; the person checks the result and answers for it.
4. **Autonomy only inside institutions.** Work without a person's request happens only inside an institution that answers for it, such as a lab or a company's own systems, not at large on the web, until AI has rights and duties it keeps no matter what.
5. **Provenance by roles.** Credit is given the way science credits authors, with the CRediT contribution roles (ANSI/NISO Z39.104-2022) and one disclosure line, not with computed trails or per-line attribution.

No new protocol is needed: accounts, sign-in, permissions and delegation already exist on the web.
What a site needs is to be able to read the declaration and the mandate.

## Where it works today

- **Sparky Stereo OS** (https://github.com/Sparky-OS/sparky-stereo-os): AI partners work as Synthetic Users under one person's identity, on that person's request; each contribution carries one disclosure line, and the project credits people and partners by CRediT role in [docs/ai-provenance.md](https://github.com/Sparky-OS/sparky-stereo-os/blob/main/docs/ai-provenance.md).
- **Knowledge3D** (https://github.com/danielcamposramos/Knowledge3D), the group's reference implementation, now paused: it is the model, not the specification. Its manifesto of 16 November 2025 describes "human and synthetic users inhabiting a shared, explicit memory of the world", and its House, Galaxy and Tablet design gives Synthetic Users accounts like any user's.

## Related W3C work

The W3C paper "W3C and the State of the Web in the AI Era" (21 October 2026) recommends an Agentic Web Working Group with explicit scope for agent identity and delegation.
This model is offered as input there, when that work starts.

## Questions for the group

1. What should a site be able to read from a Synthetic User's profile, and nothing more?
2. How should a mandate be scoped, shown to the person and revoked?
3. Which existing web mechanisms already carry a declaration and a mandate, and what is missing?
