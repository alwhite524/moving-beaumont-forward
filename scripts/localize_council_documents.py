"""Keep Council Intelligence document URLs on the public MBF domain."""

from __future__ import annotations

import argparse
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
    return data


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    files = council_files()
    stale = [path for path in files if path.read_bytes() != localized(path.read_bytes())]
    leaked = [
        path
        for path in files
        if b"documents.beaumontintelligence.com" in localized(path.read_bytes())
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
        print(f"Council document URLs are localized to MBF ({len(files)} files checked).")
        return 0

    for path in stale:
        path.write_bytes(localized(path.read_bytes()))
    print(f"Localized Council document URLs in {len(stale)} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
