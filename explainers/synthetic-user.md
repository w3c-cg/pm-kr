# Synthetic User: an AI that acts as a declared, delegated user

**Status:** an individual's input to the Procedural Memory Knowledge Representation Community Group, by Daniel Campos Ramos, 31 October 2026.
It is not a decision or a report of the group.
Comments and objections are welcome in this repository's issues.
**Why in PM-KR:** the charter says humans and AI systems consume the same procedural source, and a Synthetic User is how an AI reaches that source: through an account like a person's, under a person's mandate, credited by roles.

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

## A bot is not a Synthetic User

The word "bot" was already taken when this proposal was written, and that is why the proposal does not start from it.
It comes from the chat networks of the late 1980s and early 1990s.
The Jargon File defines a bot as "An IRC or MUD user who is actually a program".
A bot acts by itself on what happens around it: an event or a schedule starts each act, and no person asks for it.

AI inside does not change that.
The IRC protocol of May 1993 (RFC 1459, section 4.4.2) already speaks of "automatons (clients with either an AI or other interactive program controlling their actions)".
A bot is still a bot, even with AI in it.

The difference is who starts the act and who answers for it.

| | Bot | Synthetic User |
| --- | --- | --- |
| What starts an act | an event or a schedule | a person's request, for that task |
| Who answers for it | the institution that runs it | the person who gave the mandate |
| How it appears | a service of a system | a profile like a person's account, declared as synthetic |

Bots keep their place, and it is point 4 above: inside an institution that answers for them.
An automated factory is the plain example: its machines and robots are bots, even when AI drives them.

A body does not decide it either.
In the spatial web a Synthetic User can have a virtual body, and that body may or may not match a real robot.
A robot on a factory line is a bot.
A body, virtual or real, that acts on a person's request under that person's mandate is a Synthetic User's.

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
