"""Publish the canonical Beaumont Intelligence PD Technology dossier to MBF."""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path


MBF_ROOT = Path(__file__).resolve().parents[1]
BI_ROOT = MBF_ROOT.parent / "beaumont-intelligence"
SOURCE = BI_ROOT / "data" / "police" / "pd-technology.html"
SOURCE_CSS = BI_ROOT / "docs" / "styles.css"
SOURCE_JS = BI_ROOT / "docs" / "dossiers" / "police" / "dossier.js"
SOURCE_LOGO = BI_ROOT / "docs" / "mbf-logo.png"
OUTPUT = MBF_ROOT / "public" / "pd-technology-dossier.html"
OUTPUT_CSS = MBF_ROOT / "public" / "pd-technology.css"
OUTPUT_JS = MBF_ROOT / "public" / "pd-technology.js"
OUTPUT_LOGO = MBF_ROOT / "public" / "pd-technology-logo.png"


def public_html(source: str) -> str:
    result, stylesheet_count = re.subn(
        r'<link href="\.\./\.\./styles\.css\?v=[^"]+" rel="stylesheet">',
        '<link href="/pd-technology.css" rel="stylesheet">',
        source,
        count=1,
    )
    result, script_count = re.subn(
        r'src="dossier\.js\?v=[^"]+"',
        'src="/pd-technology.js"',
        result,
        count=1,
    )
    if stylesheet_count != 1 or script_count != 1:
        raise ValueError("Expected versioned dossier stylesheet and script references were not found")

    replacements = {
        '<link href="../../favicon.png" rel="icon">': '<link href="/favicon.svg" rel="icon">',
        'src="../../mbf-logo.png"': 'src="/pd-technology-logo.png"',
        '<div class="brand" aria-label="Moving Beaumont Forward">': '<a class="brand" href="/" aria-label="Return to Moving Beaumont Forward home">',
        '</span></div>\n</div></header>': '</span></a>\n</div></header>',
        'href="viewer.html?doc=': 'href="/pd-source-viewer.html?doc=',
        'href="../../briefings/': 'href="/briefings/',
        '<strong>Internal research dossier</strong><span>Source-of-truth working record · Publication review not complete</span>': '<strong>Public accountability dossier</strong><span>Source-linked record · Updated as evidence becomes available</span>',
        '<span class="status-pill">Research active</span>': '<span class="status-pill">Public record active</span>',
        '<dt>Publication status</dt><dd>Not approved</dd>': '<dt>Publication status</dt><dd>Published</dd>',
        '<div class="eyebrow">Publication gate</div>': '<div class="eyebrow">Research completion</div>',
        '<h2>What must be completed before public release</h2>': '<h2>What remains to complete the public record</h2>',
        '<li><span>Final gate</span>Claim-by-claim verification and editorial approval.</li>': '<li><span>Ongoing review</span>Claim-by-claim verification and editorial review as new records become available.</li>',
    }
    for old, new in replacements.items():
        if old not in result:
            raise ValueError(f"Expected source fragment was not found: {old}")
        result = result.replace(old, new)

    video_links = {
        "flock": "https://www.youtube.com/watch?v=pJere8tXO7M&t=14901s",
        "axon": "https://www.youtube.com/watch?v=cfqIZpAQfg4&t=11176s",
        "drone": "https://www.youtube.com/watch?v=f0e7yqc3XYs&t=10461s",
        "peregrine": "https://www.youtube.com/watch?v=WnQ5OtILrzU&t=4434s",
    }
    for segment, url in video_links.items():
        result = result.replace(
            f'href="video-viewer.html?segment={segment}"',
            f'href="{url}" target="_blank" rel="noopener"',
        )

    document_links = {
        'href="https://www.beaumontca.gov/DocumentCenter/View/37037/Beaumont-Police-Department-Policy-PDF" target="_blank" rel="noopener"': 'href="/pd-source-viewer.html?doc=bpd-policy-450"',
        'href="https://www.beaumontca.gov/DocumentCenter/View/37037/Beaumont-Police-Department-Policy-PDF#page=400" target="_blank" rel="noopener"': 'href="/pd-source-viewer.html?doc=bpd-policy-450"',
        'href="https://www.beaumontca.gov/DocumentCenter/View/37037/Beaumont-Police-Department-Policy-PDF#page=526" target="_blank" rel="noopener"': 'href="/pd-source-viewer.html?doc=bpd-policy-612"',
        'href="https://www.beaumontca.gov/DocumentCenter/View/39570/AB-481-Report-March-2025" target="_blank" rel="noopener"': 'href="/pd-source-viewer.html?doc=drone-inventory-2025"',
    }
    for old, new in document_links.items():
        result = result.replace(old, new)

    # BI's private document viewer is not published on MBF. Keep its useful
    # link labels as plain text instead of exposing BI-only URLs or dead links.
    result = re.sub(
        r'<a\b[^>]*href="https://beaumontintelligence\.com/dossiers/police/viewer\.html\?doc=[^"]+"[^>]*>(.*?)</a>',
        r'\1',
        result,
        flags=re.DOTALL,
    )
    result = re.sub(
        r'<a\b[^>]*href="https://beaumontintelligence\.com[^"]*"[^>]*>(.*?)</a>',
        r'\1',
        result,
        flags=re.DOTALL,
    )
    canonical = '  <link rel="canonical" href="https://movingbeaumontforward.com/pd-technology.html">\n'
    result = result.replace('  <meta name="theme-color" content="#0b3567">\n', '  <meta name="theme-color" content="#0b3567">\n' + canonical)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    required = (SOURCE, SOURCE_CSS, SOURCE_JS, SOURCE_LOGO)
    missing = [path for path in required if not path.is_file()]
    if missing:
        for path in missing:
            print(f"Missing source: {path}", file=sys.stderr)
        return 1

    expected_html = public_html(SOURCE.read_text(encoding="utf-8"))
    outputs = {
        OUTPUT: expected_html.encode("utf-8"),
        OUTPUT_CSS: SOURCE_CSS.read_bytes(),
        OUTPUT_JS: SOURCE_JS.read_bytes(),
        OUTPUT_LOGO: SOURCE_LOGO.read_bytes(),
    }

    if args.check:
        stale = [path for path, data in outputs.items() if not path.is_file() or path.read_bytes() != data]
        if stale:
            for path in stale:
                print(f"Out of date: {path.relative_to(MBF_ROOT)}", file=sys.stderr)
            return 1
        print("MBF PD Technology dossier matches Beaumont Intelligence.")
        return 0

    for path, data in outputs.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    print(f"Published {SOURCE.relative_to(BI_ROOT)} to {OUTPUT.relative_to(MBF_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
