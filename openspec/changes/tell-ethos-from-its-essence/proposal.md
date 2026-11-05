# Proposal

## Why

The v1.0 films explain ETHOS faithfully but mostly as mechanisms: eleven of their eighteen parts describe lanes, leases, proof, integration and publication, and the reasons that hold those mechanisms together arrive only in the closing part. On 2026-11-01 the user judged the film not essential enough, asked that both films weigh what a thing is and why it exists above how it works, and asked that the films be made from a complete, first-hand understanding of ETHOS rather than from a walk through its documents.

The user also found renderings that change ETHOS's concepts. The Chinese edition calls authority 有权决定的人, a person with the power to decide, where ETHOS defines authority as the inputs of a judgment; the English edition makes the same concept a person in three parts. A fresh audit found more concepts narrowed in the same way (Attestation, obligation, Model Promotion and local proof among them), and no artifact binds a term to its source definition, so neither authoring nor review could catch them. Finally, the user heard ETHOS pronounced inconsistently and asked that every Chinese polyphone be read as its context requires.

## What Changes

- **Breaking:** a v2.0.0 edition replaces the v1 script, narration and picture. Each edition lasts 15 minutes (900 s) at 60 fps, 2D, without music, with the same narrator, spoken at the narrator's native pace. It states what ETHOS is and why it exists before how it works, carries the four judgment rules of the Product Design Contract's Root Constraint as its spine, and tells one requirement's life as its running story. The v1.0.x films remain available as their Release assets.
- A concept contract binds every ETHOS concept the film names to its definition at the pinned source, its essence in one sentence and one approved rendering in each edition, with the counterexamples found in v1. Both editions are composed from that contract, not translated from each other, and the user approves its renderings with the script.
- The pronunciation contract declares one reading for every name the narration speaks, ETHOS as /ˈiːθɒs/ in both editions, and the context reading of every Chinese polyphone; every occurrence in the delivered narration is checked against the declared reading.
- Language review judges concept fidelity against the contract's definitions as its own dimension.
- The source manifest pins ETHOS at its latest release.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `film-production`: what the films explain and in which order, concept fidelity to the pinned sources, and pronunciation of names and polyphones.

## Impact

- Depends on a `filmkit` release that checks concept contracts and pronunciation against every occurrence; those checks are separate `filmkit` Changes. Until it is released, the contracts are authored and reviewed by hand, and no narration starts.
- The ETHOS repository stays read only, at the newly pinned release.
- `~/Documents/ethos-introduction-film/` receives v2.0.0 only after both editions are qualified; the v1.0.1 endings repair is independent of this Change.
- Out of scope: the DDWG films, a shared library of picture primitives, music, 3D, and publishing before the user confirms.
