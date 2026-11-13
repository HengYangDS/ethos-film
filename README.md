# ETHOS introduction films

Rebuild the ETHOS introduction films, a Chinese and an English edition, from tracked sources with [filmkit](https://github.com/HengYangDS/filmkit).

Each film explains [ETHOS](https://github.com/HengYangDS/ethos) as its documents state it at the commit that `content/source-manifest.json` pins. An Agent hands back one sentence, "Done. All tests pass.", and the film asks how much it establishes: why relying on such a report is hard when people and interchangeable Agents change one repository, what ETHOS is, and why it is designed around four rules: preserve meaning with the smallest model, distinguish only what changes action, keep authority separate from views, and retire a mechanism when its obligation disappears. One market-data requirement carries the rules from request to real use, and the film returns to the opening sentence and the ETHOS mark. The market-data pipeline in the films is illustrative, and planned capabilities are described as design. Each edition lasts exactly 900 seconds: 54,000 native 60 fps frames of 2D picture in 16:9, 48 kHz stereo narration in one synthetic voice, small single-line captions and no music. Each comes as a UHD master and a 1080p film, each with its captions drawn in the picture and again without them; the player's captions control switches between the two.

Author: Yang HENG.

## The films

All four films of each edition are published as release assets, together with their captions, transcripts, covers, independent review records and `SHA256SUMS`. [`content/release.json`](content/release.json) records each asset's name, size and SHA-256, the digests of the soundtrack and of the two staged pictures, with captions and without them, that each edition was made from, and those of the film-bound sources: the scripts, narration texts, voice contracts, reference recordings, source manifest, covers, fonts, composition and pages whose exact bytes the build reads. The independent review of the `v2.0.0` films scored the Chinese edition 99.4 and the English edition 99.2 out of 100, with every one of its twelve dimensions at 96 or above, each of its three levels, 信, 达 and 雅, passing and no material or minor finding; the published review records list its notes. That review scores the audio from automated evidence; human listening is a separate acceptance.

The films of `v2.0.0` are the current editions. They replace the films of `v1.0.0` and `v1.0.1`, an earlier film that explains ETHOS v0.2.0-alpha.21; those films stay available as the assets of their releases. A release that changes only how the films are built publishes no films of its own, and its tag names the source that rebuilds them.

## Rebuilding the films

The films are built by filmkit, the film engine, at the release that `pyproject.toml` pins by its tag `v0.21.2` and `uv.lock` by its commit; this repository holds the film's sources and none of the engine's. A rebuild needs an Apple-silicon Mac with [mise](https://mise.jdx.dev), which installs the locked Node, Python, uv and ETHOS, and three Homebrew tools: FFmpeg with VideoToolbox, ExifTool and rsync 3.

```bash
brew install mise ffmpeg exiftool rsync
```

```bash
mise install --locked
```

```bash
mise run bootstrap
```

`film:supply` is the only step that reaches the network. It installs the browser build that the locked renderer pins and the three speech models at their pinned revisions below `build/runtime/tool-cache/`, and checks each against its pinned SHA-256. Set `HF_ENDPOINT` to a Hugging Face mirror where the hub is unreachable.

```bash
mise run film:supply
```

`film:build` then narrates both editions from the seeds in their casts, assembles the soundtracks and captions, checks each edition's picture, renders it with its captions and again without them, compares the two at every frame, packages the four films of each edition and verifies every film, offline and only under `build/`. Each picture is drawn in Chrome's software rasterizer, as `content/film.toml` declares; on an M5 Max each of the four picture renders takes about 9 to 13 minutes.

```bash
mise run film:build
```

The stages also run one at a time: `film:narrate`, `film:sound`, `film:picture`, `film:package` and `film:verify`.

## Comparing a rebuild with the published films

Once a release is published, download its assets into `build/artifacts/release/` and compare; for `v2.0.0`:

```bash
gh release download v2.0.0 --repo HengYangDS/ethos-film --dir build/artifacts/release
```

```bash
mise run film:compare
```

The comparison refuses a published asset or a film-bound source that differs from the release manifest, and accepts a published review only when it binds the published films and the current script and composition. It then compares the rebuild layer by layer: each soundtrack and each edition's two staged picture documents, with captions and without them, must hold the recorded bytes, the captions, transcripts and covers the published bytes, and each of the eight films must have the published frame count, decoded audio, streams, chapters and tags, with every decoded frame's PSNR at or above the floor the release manifest records. The films are not compared byte for byte: packaging stamps each film with the time it was made, and two renders of one stage need not encode the same bytes. The pictures of `v2.0.0` are drawn in Chrome's software rasterizer, and those of `v1.0.0` and `v1.0.1` were captured on the GPU. The report goes to `build/evidence/reproduction/report.json`.

## Checks

`mise run check` runs the picture tests, the Markdown format check and the Python tests. The picture tests check that `picture/film.js` is the bundle of the modules under `picture/film/` and run the composition of each edition on the engine's headless runtime. The repository is governed by [ETHOS](https://github.com/HengYangDS/ethos): `ethos prove --full --execute` runs the portable proof that hosted CI also runs, including the `film-checks` gate, which runs the Python checks of the declaration, the engine pin, the narration mirrors, the listening plan and the fonts through the installed engine, and after a rebuild `ethos prove --host --gate film-media --gate film-reproduction --execute` verifies the films and their reproduction on this host.

## Layout

| Path                            | Contents                                                                                                                                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content/`                      | The film's declaration `film.toml` with each player's summary and colours, both editions' scripts, casts and narration texts, the entry page, the source manifest, the concept contract `concepts.toml` and the listening readings. |
| `picture/`                      | The picture composition: its modules under `picture/film/`, the bundle `picture/film.js` that the engine reads, and the page and styles that stage it.                                                                              |
| `assets/`                       | The narrator's reference recordings, the covers and the fonts.                                                                                                                                                                      |
| `tests/`                        | The film's tests: the composition of both editions, the declaration, the narration mirrors and the fonts.                                                                                                                           |
| `openspec/`                     | The accepted specification and any open Change.                                                                                                                                                                                     |
| `system/gates.toml`, `.config/` | The ETHOS gates, the check policies, the CI declaration and the locked toolchain with its tasks.                                                                                                                                    |

## License

The code is licensed under the [MIT License](LICENSE). The films' content, which is the scripts, narration texts, casts and pronunciation contract, the narrator's reference recordings, and the films, captions, transcripts and covers built from them, is licensed under [Creative Commons Attribution 4.0 International](LICENSES/CC-BY-4.0.txt). The fonts in `assets/fonts/` keep the SIL Open Font License 1.1, whose texts lie beside them. [NOTICE](NOTICE) names the content's paths, the third-party software and models the build installs under their own licenses, and where the narrator's voice came from.
