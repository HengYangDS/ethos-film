# Design

## Context

The proposal states why the film is remade. This design records the understanding of ETHOS that the new script is written from, the concept and pronunciation contracts that keep both editions faithful to it, and the shape of the film. Every statement about ETHOS below is our reading of its documents at the pinned release; the concept contract cites the exact passages.

### What ETHOS is

ETHOS gives people and interchangeable Agent capabilities a reliable path from understanding a problem to evolving a repository and evaluating its use. It owns, once, what governed repositories share, so each repository carries only its own purpose. Its small trust kernel is a proof-carrying repository change compiler and transaction protocol: it compiles accepted intent and freshly observed facts into a bounded transition, rechecks preconditions at the moment of the effect, and attests what was observed, decided and effected. Its promise is preserved meaning, actionable uncertainty and recoverable results, not more governance (Product Design Contract, Product).

The kernel keeps four things apart by authority and lifetime. Accepted intent lives in one official OpenSpec Change. Facts are observed afresh every time and never stored as truth. The plan is compiled, executed or discarded, and never kept. Only the Attestation persists: a record of what was observed, judged, proved or done, with its verifier and the boundary in which it holds (glossary; Transition Plan).

### Why it exists

When many people and interchangeable Agents change one repository, writing a change stops being the hard part; relying on it becomes the hard part. The documents name three ways that reliance fails, and a fourth way the usual remedy fails:

1. **Meaning is lost between understanding and change.** Interpretation, summaries, handoffs and ended sessions stand in for the source. A valid specification can still encode the wrong goal, and conversation is input, not authority by repetition (Feedback Intent Preservation; Modern Engineering Foundations, obligation 1).
2. **Claims outrun their evidence.** A passing command is taken as a sufficient check, local proof as hosted CI, a merge as a publication, a deployment as a benefit (Evidence Planes And Completion Claims; DR-0006; Gate Runner).
3. **Effects outrun the facts.** Concurrent writers, stale bases and partial publication damage work, and a retry cannot manufacture certainty (Runner And Mutation; Modern Engineering Foundations, obligation 4).
4. **Governance becomes its own burden.** Ledgers, registries, duplicated policy and standing queues of open Changes cost more than the risk they control (DR-0010, DR-0016, DR-0017; Docs Registry).

### How it holds together

The Root Constraint's verses are authored design analogies that constrain judgment through four rules. Each rule explains a family of mechanisms, and the film carries the mechanisms as consequences of the rules rather than as a tour:

| Rule                                                | What follows from it                                                                                                                                                                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preserve meaning with the smallest sufficient model | One official Change carries intent, with positive and negative examples, and no second ledger. Interpretation stays open to challenge until it is accepted; the compiler cannot certify natural-language understanding.                                                               |
| Distinguish only what changes action                | A result is pass, block or unknown, and only pass permits an effect. Local proof, hosted CI, publication, use and benefit stay separate because each permits a different next action. A new state is admitted only if it changes action.                                              |
| Keep authority separate from views                  | A judgment rests on its authority: the current user instruction, repository truth, the accepted Change, fresh facts, applicable policy and valid Attestations. Summaries, dashboards, status output and Agent reports are views. A write rechecks the facts at the moment it happens. |
| Retire a mechanism when its obligation disappears   | Each obligation has one owner; a replacement is no weaker than what it replaces; a Change closes on what it delivered; a size limit is a tripwire, never a design target.                                                                                                             |

Feedback closes the loop: an observation, its inferred cause and a proposed remedy are judged separately; a failed implementation is not automatically a model gap; when valid input cannot be expressed by the current model, the smallest affected model is revised and its dependents recompiled. Revised goals or standards require authorized intent alignment, not silent relaxation to make a result pass (Recursive Domain Feedback; Model Promotion).

The brand mark draws the same ideas: one origin, a question bounded before it becomes a change; two passages, distinctions made only where they decide action; one boundary, inside which evidence and claims keep their scope. Its single cinnabar point marks where a claim must be bound to evidence (Brand Kit). The film is itself a view of this meaning and answers to 信、达、雅 as the Product Design Contract defines them.

### What the v1 films got wrong

- **Order.** Eleven of eighteen parts explain mechanisms; the four rules appear only in part 18, so the viewer meets lanes, leases and refs before learning why any of them exists.
- **Concepts.** The Chinese edition says 有权决定的人 for authority in 03.6, 04.6, 04.7, 09.5, 11.6, 14.3, 14.5 and 18.3, and the English edition makes authority a person in 03.6, 09.5 and 14.3. Attestation is heard as 核验记录, a record of verification only; obligation as 责任, which loses one owner for each obligation; Model Promotion as 模型提升, a raised level rather than a revised model; local proof as 本地证明, a demonstration rather than an executed check. 14.2's 含义重新编译, 17.4's 归属权 and 09.6's 唯一安全的下一步 each change what their sources say.
- **Pronunciation.** The round-3 Chinese review measured the ETHOS fricative against /s/ in twenty occurrences, from 11.6 dB below it to 2.8 dB below it, and the user heard the initial vowel vary; no check compares one occurrence with another.

## Goals / Non-Goals

**Goals:**

- A first-time viewer can say, after one viewing, what ETHOS is, the problem it exists for, and the four rules it is built on, and can recognize the rules in one requirement's life.
- Every concept the film names keeps its source definition, in one rendering per edition, in narration, captions and picture.
- Every name and polyphone is read as declared, the same way each time.

**Non-Goals:**

- A complete tour of commands, lanes, leases or release steps; the film names a mechanism only where a rule needs a concrete case.
- Claims beyond the pinned documents, including capabilities they describe as planned.
- Changes to the DDWG films or to ETHOS.

## Decisions

### 1. Essence first, carried by one story

The film answers the viewer's questions in their natural order: what a single "it's done" from an Agent actually establishes, why that question has become hard, what ETHOS is, why it is designed as it is, and how one requirement lives through it. Each of the four rules gets one scene from the same story, so the rules are heard as reasons for what the viewer sees, not as a list.

### 2. Structure and time

| Part | Content                                                                                                              | Seconds |
| ---- | -------------------------------------------------------------------------------------------------------------------- | ------: |
| 01   | An Agent reports "done, all tests pass". What does that sentence establish?                                          |      60 |
| 02   | Why reliance is the hard part: lost meaning, claims beyond evidence, unsafe effects, and the cost of more governance |     120 |
| 03   | What ETHOS is: the path, the promise and the small kernel                                                            |     125 |
| 04   | Rule one, in the story: the summary that lost the exception                                                          |     105 |
| 05   | Rule two: what "all tests pass" does and does not permit                                                             |     100 |
| 06   | Rule three: the remembered branch and the green dashboard against a write-time check                                 |     105 |
| 07   | Rule four: the temporary script and the side sheet that retire                                                       |      85 |
| 08   | The requirement's whole life, and the second correction that revises the model                                       |     155 |
| 09   | Back to the opening sentence; the mark                                                                               |      42 |
|      | Credits                                                                                                              |       3 |

Five chapters group the parts: the question (01–02), what ETHOS is (03), why it is built this way (04–07), one requirement's life (08) and the close (09). What and why take 700 of the 897 s before the credits. About 740 s of each edition is speech: about 3,200 Chinese units at no more than 4.5 per articulated second, and about 2,150 English words, about 150 per minute over the film. The narrator spoke v1 at 5.96 Chinese units and 3.87 English words per articulated second, which the user found too fast. The slower pace comes from the voice itself, through an in-context reference derived from the same identity root at the slower rate, and is qualified on a sample before full narration; speech is never time-stretched.

### 3. The running story

A research team's market-data pipeline ingests daily prices from a vendor and can be re-run. A researcher asks: re-running the same batch must not add duplicate records, and a vendor's correction must stay. After two handoffs, an Agent's summary reads "deduplicate by code and date", which would delete exactly the corrections; the accepted Change keeps the negative example and saves them (rule one). The Agent's "all tests pass" turns out to be one local proof of one commit, with hosted CI unknown and nothing published or used (rule two). A second Agent, trusting its memory of the branch and a green dashboard, is stopped at the write because the target has moved (rule three). A temporary deduplication script and a side progress sheet retire once the Change and the shared check carry their duties (rule four). In use, the vendor corrects the same price twice in one day; the pipeline knew only an original and one correction, so the second overwrote the first. The observation, the inferred cause and the proposed remedy are judged separately; this is a model gap, so a new Change revises what counts as the same record to include the vendor's revision, and the original goal is not relaxed. The pipeline and its events are illustrations, not measured results, and the narration says so.

### 4. The concept contract

`content/concepts.toml` holds one entry per concept: its source term, the exact passage and anchor at the pinned commit, its essence in one sentence, the approved Chinese and English renderings with the inflections the narration may use, and the counterexamples found. A segment of each script declares the concepts it states; both editions of a segment declare the same set. The script, captions and picture labels use only the approved rendering of a concept, and a reviewer reads the contract before the script. The seed entries:

| Concept                        | Source (pinned)                            | Essence                                                                                                                          | Chinese              | English                        | Found in v1                         |
| ------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------ | ----------------------------------- |
| authority                      | glossary, Authority                        | What a judgment may rest on; never a person by title and never a view.                                                           | 权威依据             | authority                      | 有权决定的人; English made a person |
| view                           | glossary, Projection; Root Constraint      | Anything derived for reading that is not repository truth by itself.                                                             | 视图                 | view                           |                                     |
| intent; Change                 | glossary, Change                           | What is to be solved, why, and what counts as solved, in one carrier.                                                            | 意图；正式变更       | intent; Change                 | 意图 heard without its meaning      |
| fresh facts                    | glossary, Facts                            | Observed again for each judgment, never stored as truth.                                                                         | 刚观察到的事实       | fresh facts                    |                                     |
| plan                           | glossary, TransitionPlan                   | Compiled for one transition, then executed or discarded.                                                                         | 计划                 | plan                           |                                     |
| attestation                    | glossary, Attestation                      | The only lasting record: what was observed, judged, proved or done, by whom and where it holds.                                  | 存证                 | attestation                    | 核验记录                            |
| pass, block, unknown           | Runner And Mutation; Required Gap          | Only pass permits an effect; unknown is never permission.                                                                        | 通过、拦下、未知     | pass, block, unknown           |                                     |
| proof                          | DR-0006                                    | An executed check of an exact commit that establishes local readiness.                                                           | 核验                 | proof                          | 本地证明                            |
| evidence planes                | Evidence Planes And Completion Claims      | Each kind of evidence supports only its own claim.                                                                               | 各自独立的证据       | separate planes of evidence    |                                     |
| Work Lane                      | glossary, Work Lane                        | An isolated, held place for one change.                                                                                          | 工作通道             | Work Lane                      |                                     |
| obligation; owner              | DR-0017                                    | Each duty a repository must meet has exactly one owner.                                                                          | 义务；归属           | obligation; owner              | 责任                                |
| model; Model Promotion         | Model Promotion; Recursive Domain Feedback | The concepts and structure that express meaning; revised at the smallest affected boundary when valid input cannot be expressed. | 模型；修订模型       | model; revising the model      | 模型提升                            |
| authorized intent alignment    | Recursive Domain Feedback                  | A goal or standard changes only by authorized alignment, never by quiet relaxation.                                              | 经授权重新对齐意图   | authorized intent alignment    |                                     |
| observation, inference, remedy | Feedback Intent Preservation               | Judged separately; rejecting a remedy does not reject the observation.                                                           | 观察、推断、补救办法 | observation, inference, remedy |                                     |
| interchangeable Agents         | Product Design Contract, Product           | Capabilities that can be replaced without losing meaning or authority.                                                           | 可以互相替换的 Agent | interchangeable Agents         |                                     |
| actual benefit                 | Product Design Contract, Product           | Shown only by observations bound to the deployed version, environment, baseline and window.                                      | 实际收益             | actual benefit                 |                                     |

The user approved these renderings on 2026-11-01. A rendering that a later review rejects changes here first, with the user's approval, and then everywhere it is used.

### 5. Pronunciation

The pronunciation contract declares ETHOS as /ˈiːθɒs/ in both editions (ARPAbet IY1 TH AA0 S), OpenSpec as two words, and Agent, Git, GitHub and GitLab as English words in the Chinese edition. Every Chinese character the narration speaks whose dictionary reading is ambiguous has its context reading declared, such as 行情 háng, 重新 chóng and the 得 of necessity, děi. One approved occurrence of each name and of each declared polyphone serves as the reference, and every other occurrence must match it within the threshold the check is calibrated to; a mismatch is retaken before the picture is composed.

### 6. Picture

The picture uses the ETHOS palette (ink, paper, one cinnabar accent and a muted secondary) and the DDWG visual system's rules. Its recurring figure is the mark: a cinnabar point, the opening claim, is not yet bound to evidence; each rule adds a part of the mark around it; the close shows the claim bound inside its boundary. The Root Constraint's verses may appear once at the close with the statement that they are design analogies. Scenes reuse v1 modules only where a v2 scene states the same thing.

### 7. Sources and review

The source manifest pins ETHOS v0.2.0-alpha.25 and the SHA-256 of every cited document, and is re-pinned to the latest release before the script is frozen. Language review adds concept fidelity as a scored dimension and reads the concept contract with the script; a rendering that narrows, personifies or substitutes a concept is a material finding. The bilingual script, with the concept contract, goes to the user before any narration.

## Alternatives Considered

| Approach                                       | Trade-off                                                                                                             | Decision |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------- |
| Repair v1's wording in place                   | Cheapest; fixes the concepts but keeps the mechanism-first order the user rejected.                                   | Rejected |
| A lecture on the four rules                    | States the essence directly, but abstract rules heard once are hard to hold and nothing shows them at work.           | Rejected |
| Essence first, one running story               | Answers what and why first and shows each rule in a scene; needs a new picture and a new story.                       | Chosen   |
| A short essence film and a long mechanism film | Serves both audiences, but the user fixed one 15-minute film, and 15 minutes holds the essence and a compressed life. | Rejected |

## Risks / Trade-offs

- **The rules sound abstract.** → Each rule is introduced by its scene, and the scene comes before the rule's name.
- **A rendering is contested.** → The contract cites the source passage; the user decides the rendering once, and the decision changes every use.
- **ETHOS changes before the script freezes.** → Re-pin at the latest release and re-read every cited passage before narration; the concept contract's quotes are checked against the pinned bytes.
- **The story is mistaken for a real incident.** → The narration calls it an illustration, as v1 did.
- **The concept and pronunciation checks are not yet released.** → No narration starts until the `filmkit` release that provides them is pinned.

## Migration Plan

1. The user approved the concept contract's renderings on 2026-11-01.
2. Specifications and tasks follow; the scripts are written and reviewed, then approved by the user.
3. After the `filmkit` release with the new checks is pinned, the narration is synthesized, checked and heard by the user, then the picture is composed, rendered and reviewed.
4. Both editions are delivered to Documents with readback, replacing v1.0.x only after qualification; v2.0.0 is released after the user confirms. v1.0.x stays available as its Release assets.

## Open Questions

The narration describes Model Promotion as revising the model and leaves the English name to the concept contract; that is a choice made here, not a question for the user.

- The edition titles; v1's "让信任建立在证据上" remains a candidate.
- Whether the close speaks the Root Constraint's verses in the Chinese edition, and whether the English edition shows them with a gloss or only the four rules.
