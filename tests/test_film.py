"""This film's declaration, scripts and players on the engine release that the lock pins."""

import importlib.metadata
import re
import tomllib
from pathlib import Path

import filmkit
import filmkit.film as film
import filmkit.repository as repository
from filmkit.production import CODES, Edition

# Han characters and CJK or full-width punctuation.
CHINESE = re.compile(r"[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]")
# The release the lock pins the engine to, by its tag.
ENGINE_SOURCE = re.compile(r"^https://github\.com/HengYangDS/filmkit\?tag=v([^#]+)#[0-9a-f]{40}$")


def test_the_declaration_loads_with_both_editions():
    assert film.load(repository.ROOT) == film.FILM
    assert tuple(film.FILM.editions) == CODES


def test_the_engine_is_the_release_the_lock_pins():
    lock = tomllib.loads((repository.ROOT / "uv.lock").read_text())
    [engine] = [package for package in lock["package"] if package["name"] == "filmkit"]
    tag = ENGINE_SOURCE.match(engine["source"]["git"])
    assert tag is not None, engine["source"]
    assert tag.group(1) == engine["version"] == importlib.metadata.version("filmkit")
    # The engine is installed, not carried: its package lies outside the film's tracked tree.
    assert "site-packages" in Path(filmkit.__path__[0]).parts


def test_each_narration_mirror_holds_its_script_segments():
    for code in CODES:
        segments = repository.read(Edition(code).script)["segments"]
        mirror = (repository.ROOT / Edition(code).mirror).read_text()
        assert mirror == "\n\n".join(segment["text"] for segment in segments) + "\n"


def test_each_edition_has_its_own_player():
    for code in CODES:
        player = (repository.ROOT / Edition(code).player).read_text()
        assert player.count("/*CHAPTERS*/[]") == 1
        assert player.count("/*TRANSCRIPT*/") == 1
        assert f'data-file="{Edition(code).prefix}-1080p-captioned.mp4"' in player


def test_the_english_player_keeps_no_chinese_text():
    assert CHINESE.search((repository.ROOT / Edition("en").player).read_text()) is None
