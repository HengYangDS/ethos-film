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

| Part | Content                                                                                                              | Chinese s | English s |
| ---- | -------------------------------------------------------------------------------------------------------------------- | --------: | --------: |
| 01   | An Agent reports "done, all tests pass". What does that sentence establish?                                          |        47 |        48 |
| 02   | Why reliance is the hard part: lost meaning, claims beyond evidence, unsafe effects, and the cost of more governance |        98 |       101 |
| 03   | What ETHOS is: the path, the promise and the small kernel                                                            |       128 |       127 |
| 04   | Rule one, in the story: the summary that lost the exception                                                          |       111 |       109 |
| 05   | Rule two: what "all tests pass" does and does not permit                                                             |        78 |        73 |
| 06   | Rule three: the remembered branch and the green dashboard against a write-time check                                 |        91 |        86 |
| 07   | Rule four: the temporary script and the side sheet that retire                                                       |        68 |        63 |
| 08   | The requirement's whole life, and the second correction that revises the model                                       |       159 |       172 |
| 09   | Back to the opening sentence; the mark                                                                               |        42 |        46 |
|      | Credits                                                                                                              |         3 |         3 |

Five chapters group the parts: the question (01–02), what ETHOS is (03), why it is built this way (04–07), one requirement's life (08) and the close (09). The narrator's articulation cannot be slowed: a reference at a slower rate still left about 6.0 Chinese units and 4.0 to 4.4 English words per articulated second, so revision 4 lasted only about 671 s at its natural pace. On 2026-11-02 the user agreed to restore the length with more text rather than longer silences, delegated the remaining choices, and allowed an unreasonable runtime to change in whole minutes. At the native articulation, with about 0.8 s between thoughts, 1.6 s between paragraphs and 2.6 s between parts, revision 7 ran about 853 s in Chinese and 857 s in English, while 15 minutes would stretch every pause by about 40%; each edition therefore lasts 14 minutes, 837 s before 3 s of credits, its pauses fitted to that by no more than a fifth. With the repairs below, the editions run about 846 s and 849 s; the Chinese says 3,763 units and the English 2,552 words, 4.5 units per second and 182 words per minute over the film. The seconds above estimate each part's natural length from the rates measured on revision-4 narration (5.12 units and 3.46 words per second) with those pauses and 2.6 s between parts; each part's measured length replaces them once both editions are narrated. Speech is never time-stretched.

The user approved revision 7 (SHA-256 `221ae7d0…`) and its samples on 2026-11-02. Its words are cut into 101 thoughts in each edition, at the same places, so that each thought holds one idea. Three long sentences are cut at a sentence end, so three marks between their clauses become full stops, no word changing: the semicolon after 往下走 in 05, the colons after 不靠前一个的记忆 and 三件事要分开判断 in 08, and in English the colon after "the last one's memory" in 08, whose next word takes its capital.

The independent review of both scripts as written (`build/evidence/script-audit/v2-r7-scripts-audit.md`) found one material error: 08.5 had the Agent that takes over read the Change first and fresh facts last, while ETHOS has it observe current status first and then load the Change or source that result selects (Agent Rules, Rules; Evolution Campaign, Session-Independent Continuation). On 2026-11-02 the user approved three repairs: 08.5 in ETHOS's order; the end of 01 without the sentence that only announced the film's order; and in English "Only pass lets the work go ahead" (05.7), because "action" in this edition means the next step, and ETHOS names a safe next action after a block. Two repairs change no narration: segment 08 also cites Product Design Contract, Product, which states actual benefit, and the English heading of 05 says "only", as the Root Constraint does. The declared reading of 再说 left with the cut sentence.

The thoughts follow the approved samples, which were narrated a paragraph to a take from the unmodified identity root, at temperature 0.46 with an in-context repetition penalty of 1.05, and joined at about 1.65 s in Chinese and 1.87 s in English. Sentence-level thoughts would have left about 0.9 s at each of their 92 joins, so on 2026-11-03 the scripts were regrouped into one thought per paragraph of the draft: 54 in each edition, the five paragraphs that would run past about 28 s cut once at the sentence end nearest their middle. Every word stays, and every boundary is one of the 101 the script review accepted (`build/evidence/script-audit/v2-para-equivalence.json`). One take of each thought at the casts' settings held 736.9 s of Chinese speech, 5.11 units a second, and 738.0 s of English, 3.46 words a second. Joins of 1.62 s in Chinese and 1.60 s in English, 2.3 s between parts and 2.6 s between chapters then leave about 2 s for the gaps to take up. The longest take lasts 25.7 s in Chinese and 27.0 s in English, and the longest pause inside a take, 0.50 s and 0.85 s, sets the inner caps at 0.6 s and 0.7 s. The casts now hold the samples' settings, as in `ddwg-essentials-film`; the clear reference derived for revision 4 is no longer read.

On 2026-11-03 the first narration from these casts ended 35 of the 54 Chinese takes and 2 of the English ones inside their last syllable, and the assembly refused them. The Chinese cause is the speech engine's decode, not the voice or the text. mlx-audio counts a frame as valid only when its first codebook id is above 0. The reference tokenizer pads with −1 and counts every id above it (QwenLM/Qwen3-TTS 6cafe55). In-context narration decodes the reference's codes together with the take's, so every frame with id 0 in either one removes 80 ms from the end of the take. The Chinese identity root holds two such frames, so every Chinese take lost at least 160 ms; the English reference holds none.

The fix is proposed upstream as Blaizzy/mlx-audio#1116. Two other ways out were rejected:

- The engine's streaming decoder keeps every frame, but it sounds different from the reference decode: the log-spectral distance on Chinese takes is 3 to 4.7 dB, which would change the approved timbre.
- Patching the engine here is unnecessary, because filmkit's auditions already reach whole endings.

The casts' retakes therefore give 23 Chinese thoughts and both English ones an auditioned seed whose take still ends on its own after the trim. For each of the other 12 Chinese thoughts, none of eight seeds did. Each of those is narrated on into the thought that follows and cut in the quiet between, so the trim falls on the words cut away.

The English thoughts 04.1 and 06.1 open their recordings, and their takes began above heard quiet, which the assembly also refuses. Both take auditioned seeds that begin in quiet. With whole endings, the Chinese narration ran 1.66 s past 840 s at 2.3 s between parts and 2.6 s between chapters. The Chinese gaps are therefore 2.0 s between parts and 2.4 s between chapters, and its thought pauses keep their 1.62 s mean. Both editions now last exactly 840 s at −16.5 LUFS.

### 3. The running story

A research team's market-data pipeline ingests daily prices from a vendor and can be re-run. A researcher asks: re-running the same batch must not add duplicate records, and a vendor's correction must stay. After two handoffs, an Agent's summary reads "deduplicate by code and date", which would delete exactly the corrections; the accepted Change keeps the negative example and saves them (rule one). The Agent's "all tests pass" turns out to be one local proof of one commit, with hosted CI unknown and nothing published or used (rule two). A second Agent, trusting its memory of the branch and a green dashboard, is stopped at the write because the target has moved (rule three). A temporary deduplication script and a side progress sheet retire once the repository's own declared check carries the deduplication and the Change's task list carries the progress (rule four). In use, the vendor corrects the same price twice in one day; the pipeline knew only an original and one correction, so the second overwrote the first. The observation, the inferred cause and the proposed remedy are judged separately; this is a model gap, so a new Change revises what counts as the same record to include the vendor's revision, and the original goal is not relaxed. The pipeline and its events are illustrations, not measured results, and the narration says so.

### 4. The concept contract

`content/concepts.toml` holds one entry per concept: its source term, the exact passage and anchor at the pinned commit, its essence in one sentence, the approved Chinese and English renderings with the inflections the narration may use, and the counterexamples found. A segment of each script declares the concepts it states; both editions of a segment declare the same set. The script, captions and picture labels use only the approved rendering of a concept, and a reviewer reads the contract before the script. The seed entries:

| Concept                        | Source (pinned)                            | Essence                                                                                                                          | Chinese                              | English                                 | Found in v1                         |
| ------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------- | ----------------------------------- |
| authority                      | glossary, Authority                        | What a judgment may rest on; never a person by title and never a view.                                                           | 权威依据                             | authority                               | 有权决定的人; English made a person |
| view                           | glossary, Projection; Root Constraint      | Anything derived for reading that is not repository truth by itself.                                                             | 视图                                 | view                                    |                                     |
| intent; Change                 | glossary, Change                           | What is to be solved, why, and what counts as solved, in one carrier.                                                            | 意图；正式变更                       | intent; Change                          | 意图 heard without its meaning      |
| fresh facts                    | glossary, Facts                            | Observed again for each judgment, never stored as truth.                                                                         | 刚观察到的事实                       | fresh facts                             |                                     |
| plan                           | glossary, TransitionPlan                   | Compiled for one transition, then executed or discarded.                                                                         | 计划                                 | plan                                    |                                     |
| attestation                    | glossary, Attestation                      | The only lasting record: what was observed, judged, proved or done, by whom and where it holds.                                  | 存证                                 | attestation                             | 核验记录                            |
| pass, block, unknown           | Runner And Mutation; Required Gap          | Only pass permits an effect; unknown is never permission.                                                                        | 通过、拦下、未知                     | pass, block, unknown                    |                                     |
| proof                          | DR-0006                                    | An executed check of an exact commit that establishes local readiness.                                                           | 核验                                 | proof                                   | 本地证明                            |
| evidence planes                | Evidence Planes And Completion Claims      | Each kind of evidence supports only its own claim.                                                                               | 各自独立的证据                       | separate planes of evidence             |                                     |
| Work Lane                      | glossary, Work Lane                        | An isolated, held place for one change.                                                                                          | 工作通道                             | Work Lane                               |                                     |
| obligation; owner              | DR-0017                                    | Each duty a repository must meet has exactly one owner.                                                                          | 义务；归属                           | obligation; owner                       | 责任                                |
| model; Model Promotion         | Model Promotion; Recursive Domain Feedback | The concepts and structure that express meaning; revised at the smallest affected boundary when valid input cannot be expressed. | 模型；修订模型                       | model; revising the model               | 模型提升                            |
| authorized intent alignment    | Recursive Domain Feedback                  | A goal or standard changes only by authorized alignment, never by quiet relaxation.                                              | 经授权重新对齐意图                   | authorized intent alignment             |                                     |
| observation, inference, remedy | Agent Rules; Feedback Intent Preservation  | Judged separately; rejecting a remedy does not reject the observation.                                                           | 观察到的、推断的原因、提出的补救办法 | observation, inference, proposed remedy |                                     |
| interchangeable Agents         | Product Design Contract, Product           | Capabilities that can be replaced without losing meaning or authority.                                                           | 可以互相替换的 Agent                 | interchangeable Agents                  |                                     |
| actual benefit                 | Product Design Contract, Product           | Shown only by observations bound to the deployed version, environment, baseline and window.                                      | 实际效益                             | actual benefit                          |                                     |
| meaning                        | Product Design Contract, Root Constraint   | What a source or request means, kept intact through every handoff; intent is what is to be solved.                               | 原意                                 | meaning                                 |                                     |

The user approved these renderings on 2026-11-01. On 2026-11-02, approving the revision-4 script, the user also approved 实际效益 in place of the drafts' 实际收益, whose trading sense misleads, the meaning entry with 本意 as its counterexample, the verdict's forms (拦下, 未知; block, unknown) and the inflections that `content/concepts.toml` records. A rendering that a later review rejects changes here first, with the user's approval, and then everywhere it is used.

### 5. Pronunciation

The pronunciation contract declares ETHOS as /ˈiːθɒs/ in both editions (ARPAbet IY1 TH AA0 S), OpenSpec as two words, and Agent, Git, GitHub and GitLab as English words in the Chinese edition. Every Chinese character the narration speaks whose dictionary reading is ambiguous has its context reading declared, such as 行情 háng, 重新 chóng and the 得 of necessity, děi. filmkit's readings check (pronunciation contract schema version 2) refuses any watched character the narration says without a declared reading, and a declared reading the dictionary contradicts in context without a recorded reason; every dictionary proposal was reviewed in its contexts before it was declared. One approved occurrence of each name and of each declared polyphone serves as the reference, and every other occurrence must match it within the threshold the check is calibrated to; a mismatch is retaken before the picture is composed.

On 2026-11-03 the assembled Chinese narration was checked occurrence by occurrence. Each declared reading was cut from the soundtrack with its neighbours, and alone, and recognized. Every occurrence the recognizer did not confirm, and every reading the dictionary contradicts, was then compared with minimal pairs: the thought narrated again, from its own seed and a second one, with the character replaced by a homophone of the declared reading and by one of the alternative. Three words were said wrongly: 重 as zhòng in three of the four occurrences of 去重, and 当 as dāng in the first 就当 and in 当真相. No other auditioned seed of these thoughts said every occurrence as declared, so the spoken text carries 去虫, 就荡 and 荡真相 for them, as it carries 航情 for 行情; the words on screen and in the captions are unchanged. The English heteronyms, compared with respelled minimal pairs, are said as declared, though the measures leave "duplicate" in 04.2 undecided; ETHOS and Agent sound alike in every occurrence in each edition. What the measures cannot settle (难处 in 01.6 and 02.1, 退场 in 07.3, 也得 in 02.6, "duplicate" in 04.2 and the three occurrences each of GitHub and GitLab) goes to the user's listening with the narration (task 4.5).

### 6. Picture

The picture uses the ETHOS palette (ink, paper, one cinnabar accent and a muted secondary) and the DDWG visual system's rules. Its recurring figure is the mark: a cinnabar point, the opening claim, is not yet bound to evidence; each rule adds a part of the mark around it; the close shows the claim bound inside its boundary. The Root Constraint's verses may appear once at the close with the statement that they are design analogies. Scenes reuse v1 modules only where a v2 scene states the same thing. A part's heading appears only after its rule is spoken, or stays off screen, so the picture never names a rule before its scene; the user approved this with the revision-4 script.

### 7. Sources and review

The source manifest pinned ETHOS v0.2.0-alpha.25 and the SHA-256 of every cited document, and was re-pinned to v0.2.0-alpha.27, the latest release, before the script was frozen (task 1.1). Language review adds concept fidelity as a scored dimension and reads the concept contract with the script; a rendering that narrows, personifies or substitutes a concept is a material finding. The bilingual script, with the concept contract, goes to the user before any narration.

### 8. Supply

On 2026-11-02 the owner asked that every supply move to its latest stable release. The film moves to `filmkit` 0.4.0, which renders with HyperFrames 0.9.3, keeps Chrome Headless Shell 152.0.7977.30 and the `undici` 7.30.1 override, and narrates with mlx-audio 0.6.3 and MLX 0.32.4; puppeteer-core 25.16.0 and @puppeteer/browsers 3.2.6 move with it. esbuild moves to 0.28.2 and bundles `picture/film.js` byte for byte as 0.25.12 did. Node moves to 26.13.0, uv to 0.13.6, the CI's Mise to 2026.10.25, hatchling to 1.33.0, coverage to 7.17.0 and pytest to 9.2.0, and both locks take the newest releases their declarations admit; OSV reports no advisory in either lock. Python stays at 3.12.16, the newest release of the 3.12 line. The essence edition is narrated, composed and rendered on this supply from the start; a renderer that HyperFrames publishes during its production moves with the next recheck, as HyperFrames 0.9.4 does.

On 2026-11-03, after the narration and before any picture, the film moves to `filmkit` 0.5.0, which renders with HyperFrames 0.9.5 and narrates with mlx-audio 0.6.4. When `filmkit` 0.5.0 was cut, seven takes that mlx-audio 0.6.4 narrated from their recorded seeds matched their 0.6.3 recordings byte for byte, so the narration keeps every take it binds. The uv lock moves `filmkit` and mlx-audio and the npm lock HyperFrames and semver 7.8.6; every other package was already the newest its declaration admits, and OSV reports no advisory in either lock.

## Alternatives Considered

| Approach                                       | Trade-off                                                                                                                         | Decision |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Repair v1's wording in place                   | Cheapest; fixes the concepts but keeps the mechanism-first order the user rejected.                                               | Rejected |
| A lecture on the four rules                    | States the essence directly, but abstract rules heard once are hard to hold and nothing shows them at work.                       | Rejected |
| Essence first, one running story               | Answers what and why first and shows each rule in a scene; needs a new picture and a new story.                                   | Chosen   |
| A short essence film and a long mechanism film | Serves both audiences, but the user fixed one film of about 15 minutes, now 14, and that holds the essence and a compressed life. | Rejected |

## Risks / Trade-offs

- **The rules sound abstract.** → Each rule is introduced by its scene, and the scene comes before the rule's name.
- **A rendering is contested.** → The contract cites the source passage; the user decides the rendering once, and the decision changes every use.
- **ETHOS changes before the script freezes.** → Re-pin at the latest release and re-read every cited passage before narration; the concept contract's quotes are checked against the pinned bytes.
- **The story is mistaken for a real incident.** → The narration calls it an illustration, as v1 did.
- **The concept and pronunciation checks are new.** → filmkit v0.3.0 released them on 2026-11-02; no narration starts until the film pins it and both checks pass.

## Migration Plan

1. The user approved the concept contract's renderings on 2026-11-01.
2. Specifications and tasks follow; the scripts are written and reviewed, then approved by the user. The user approved revision 4 on 2026-11-02.
3. After filmkit v0.3.0, the release with the new checks, is pinned, and v0.4.0 with the latest stable supply after it, the narration is synthesized, checked and heard by the user, then the picture is composed, rendered and reviewed on v0.5.0, which keeps the narration's takes.
4. Both editions are delivered to Documents with readback, replacing v1.0.x only after qualification; v2.0.0 is released after the user confirms. v1.0.x stays available as its Release assets.

## Open Questions

The narration describes Model Promotion as revising the model and leaves the English name to the concept contract; that is a choice made here, not a question for the user.

- The edition titles stay v1's, "ETHOS · 让信任建立在证据上" and "ETHOS · Evidence-grounded Trust": the name's own words state the essence the film explains. This is our call, made when the approved script was written into the editions.
- Neither edition speaks the Root Constraint's verses; the approved close reads the mark instead: one origin, two passages, one boundary and the cinnabar point. Whether the picture shows the verses once is decided in the picture plan.
