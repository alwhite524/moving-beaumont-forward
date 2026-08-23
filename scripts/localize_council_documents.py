"""Keep Council Intelligence document URLs on the public MBF domain."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


def council_files() -> list[Path]:
    files = list((PUBLIC / "briefings").glob("*.html"))
    files.extend(PUBLIC.glob("council-*.html"))
    files.extend((PUBLIC / "documents").glob("*.html"))
    files.extend((PUBLIC / "documents").glob("*.js"))
    return sorted(set(files))


def localized(data: bytes) -> bytes:
    replacements = (
        (
            b"url=https%3A%2F%2Fdocuments.beaumontintelligence.com%2Fofficial-documents%2F",
            b"pdf=",
        ),
        (
            b"https://documents.beaumontintelligence.com/official-documents/",
            b"/council-documents/",
        ),
        (b"/official-documents/${historyPdf}", b"/council-documents/${historyPdf}"),
        (b"/official-documents/${requestedPdf}", b"/council-documents/${requestedPdf}"),
        (b"${record.title} | Beaumont Intelligence", b"${record.title} | Moving Beaumont Forward"),
        (b"${filename} | Beaumont Intelligence", b"${filename} | Moving Beaumont Forward"),
        (
            b"Archived official document hosted by Beaumont Intelligence.",
            b"Archived official public document.",
        ),
        (b"const parsedUrl = new URL(url);", b"const parsedUrl = new URL(url, window.location.origin);"),
        (
            b'parsedUrl.protocol !== "https:" ||\n        parsedUrl.hostname !== "documents.beaumontintelligence.com"',
            b'parsedUrl.origin !== window.location.origin ||\n        !parsedUrl.pathname.startsWith("/council-documents/")',
        ),
        (
            b"if (requestedUrl) renderStandalone(requestedUrl);\n  else renderDocument(params.get(\"id\") || requestedRecord?.id);",
            b"if (requestedUrl) renderStandalone(requestedUrl);\n  else if (requestedPdf && !requestedRecord) renderStandalone(`/council-documents/${requestedPdf}`);\n  else renderDocument(params.get(\"id\") || requestedRecord?.id);",
        ),
    )
    for old, new in replacements:
        data = data.replace(old, new)
    data = re.sub(rb"(?m)^[ \t]+\r?$", b"", data)
    return data


BI_LINK = re.compile(
    rb'<a\b[^>]*href=["\']https://beaumontintelligence\.com/[^"\']*["\'][^>]*>(.*?)</a>',
    re.IGNORECASE | re.DOTALL,
)
BI_HEADER = re.compile(rb'<header class="app-header">.*?</header>', re.IGNORECASE | re.DOTALL)
AGENDA_CARD_LINK = re.compile(
    rb'<a class="text-link"[^>]*>Official agenda(?: package| and staff reports) [^<]*</a>',
    re.IGNORECASE,
)


def public_facing(data: bytes, *, remove_header: bool = False, remove_agenda_cards: bool = False) -> bytes:
    data = localized(data)
    if remove_header:
        data = BI_HEADER.sub(b"", data)
    if remove_agenda_cards:
        data = AGENDA_CARD_LINK.sub(b"", data)
    data = BI_LINK.sub(lambda match: match.group(1), data)
    replacements = (
        (b"https://documents.beaumontintelligence.com/official-documents/", b"/council-documents/"),
        (b"https://beaumontintelligence.com/", b"/"),
        (b"Beaumont Intelligence", b"Moving Beaumont Forward"),
        (b"BEAUMONT INTELLIGENCE", b"MOVING BEAUMONT FORWARD"),
        (b"BI Insights", b"Context"),
        (b"BI Insight", b"Key context"),
        (b"BI priority", b"Priority note"),
    )
    for old, new in replacements:
        data = data.replace(old, new)
    data = re.sub(rb"(?m)^[ \t]+\r?$", b"", data)
    return data


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    council = council_files()
    files = sorted(set(council + list(PUBLIC.rglob("*.html")) + list(PUBLIC.rglob("*.js"))))
    expected = {
        path: public_facing(
            path.read_bytes(),
            remove_header=path in council and path.suffix.lower() == ".html",
            remove_agenda_cards=path == PUBLIC / "council-intelligence.html",
        )
        for path in files
    }
    stale = [path for path in files if path.read_bytes() != expected[path]]
    leaked = [
        path
        for path in files
        if b"beaumontintelligence.com" in expected[path].lower()
        or b"Beaumont Intelligence" in expected[path]
    ]
    if leaked:
        for path in leaked:
            print(f"BI document hostname remains in {path.relative_to(ROOT)}", file=sys.stderr)
        return 1
    if args.check:
        if stale:
            for path in stale:
                print(f"Needs MBF document localization: {path.relative_to(ROOT)}", file=sys.stderr)
            return 1
        print(f"Public MBF content contains no BI site references ({len(files)} files checked).")
        return 0

    for path in stale:
        path.write_bytes(expected[path])
    print(f"Localized MBF branding and links in {len(stale)} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
