# ETHOS introduction films

Rebuild the ETHOS introduction films, a Chinese and an English edition, from tracked sources with [filmkit](https://github.com/HengYangDS/filmkit).

Each film explains [ETHOS](https://github.com/HengYangDS/ethos) as its documents state it at the commit that `content/source-manifest.json` pins: how people and agents working on a project keep their understanding of the problem joined to the answers that code, data and real use give back. It covers intent written into a Change, one owner for each obligation, Work Lanes and Leases, the trust kernel and separate evidence, review, release, real use, feedback and Model Promotion, and finally adoption, handoff and exit. The market-data pipeline and the stock-selection study in the films are illustrative, and planned capabilities are described as design. Each edition lasts exactly 900 seconds: 54,000 native 60 fps frames of 2D picture in 16:9, 48 kHz stereo narration in one synthetic voice, small single-line captions and no music. Each comes as a UHD master and a captioned 1080p film. The films are in production, and no release has been published yet.

Author: Yang HENG.

## Rebuilding the films

The films are built by filmkit, the film engine, at the release that `pyproject.toml` pins by its tag `v0.1.1` and `uv.lock` by its commit; this repository holds the film's sources and none of the engine's. A rebuild needs an Apple-silicon Mac with [mise](https://mise.jdx.dev), which installs the locked Node, Python, uv and ETHOS, and three Homebrew tools: FFmpeg with VideoToolbox, ExifTool and rsync 3.

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

`film:build` then narrates both editions from the seeds in their casts, assembles the soundtracks and captions, renders and packages the pictures and verifies every film, offline and only under `build/`. On an M5 Max each UHD picture render takes 20 to 30 minutes.

```bash
mise run film:build
```

The stages also run one at a time: `film:narrate`, `film:sound`, `film:picture`, `film:package` and `film:verify`.

## Comparing a rebuild with the published films

Once a release is published, download its assets into `build/artifacts/release/` and compare; for `v1.0.0`:

```bash
gh release download v1.0.0 --repo HengYangDS/ethos-film --dir build/artifacts/release
```

```bash
mise run film:compare
```

The comparison refuses a published asset or a film-bound source that differs from the release manifest, and accepts a published review only when it binds the published films and the current script and composition. It then compares the rebuild layer by layer: each soundtrack and staged picture document must hold the recorded bytes, the captions, transcripts and covers the published bytes, and each film must have the published frame count, decoded audio, streams, chapters and tags, with every decoded frame's PSNR at or above the floor the release manifest records. The picture alone is not byte-identical, because GPU capture and encoding vary between renders of the same stage. The report goes to `build/evidence/reproduction/report.json`.

## Checks

`mise run check` runs the picture tests, the Markdown format check and the Python tests. The picture tests check that `picture/film.js` is the bundle of the modules under `picture/film/` and run the composition of each edition on the engine's headless runtime. The repository is governed by [ETHOS](https://github.com/HengYangDS/ethos): `ethos prove --full --execute` runs the portable proof that hosted CI also runs, including the `film-checks` gate, which runs the Python checks of the declaration, the engine pin, the narration mirrors, the listening plan, the players and the fonts through the installed engine, and after a rebuild `ethos prove --host --gate film-media --gate film-reproduction --execute` verifies the films and their reproduction on this host.

## Layout

| Path                            | Contents                                                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content/`                      | The film's declaration `film.toml`, both editions' scripts, casts, narration texts and players, the entry page, the source manifest and the listening readings. |
| `picture/`                      | The picture composition: its modules under `picture/film/`, the bundle `picture/film.js` that the engine reads, and the page and styles that stage it.          |
| `assets/`                       | The narrator's reference recordings, the covers and the fonts.                                                                                                  |
| `tests/`                        | The film's tests: the composition of both editions, the declaration, the narration mirrors, the players and the fonts.                                          |
| `openspec/`                     | The accepted specification and any open Change.                                                                                                                 |
| `system/gates.toml`, `.config/` | The ETHOS gates, the check policies, the CI declaration and the locked toolchain with its tasks.                                                                |

## License

The code is licensed under the [MIT License](LICENSE). The films' content, which is the scripts, narration texts, casts and pronunciation contract, the narrator's reference recordings, and the films, captions, transcripts and covers built from them, is licensed under [Creative Commons Attribution 4.0 International](LICENSES/CC-BY-4.0.txt). The fonts in `assets/fonts/` keep the SIL Open Font License 1.1, whose texts lie beside them. [NOTICE](NOTICE) names the content's paths, the third-party software and models the build installs under their own licenses, and where the narrator's voice came from.
