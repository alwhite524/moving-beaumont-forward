"""Import council presentation files only. Source PDFs remain on the shared host."""
import argparse
import calendar
from datetime import date
import html
import json
from pathlib import Path
import posixpath
import re
import subprocess
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
HEADER = '''<header class="app-header"><div class="wrap header-row"><a class="brand" href="/" aria-label="Moving Beaumont Forward home"><img class="brand-logo" src="/moving-beaumont-forward-logo.jpg" alt=""><span class="brand-copy"><strong><span class="red">MOVING</span> <span class="blue">BEAUMONT</span> <span class="red">FORWARD</span></strong><small>Council Briefings</small><em>Connecting Today’s Decisions to Tomorrow’s Beaumont.</em></span></a><nav class="primary-nav" aria-label="Primary navigation"><a href="/">Home</a><a href="/council-briefings.html">Council briefings</a><a href="/council-meeting-sources.html">Videos &amp; agenda packets</a></nav></div></header>'''
FOOTER = '''<footer class="footer"><div class="wrap"><strong>Moving Beaumont Forward</strong><p><a href="/council-briefings.html">Council briefings</a> · <a href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noopener">Instagram</a></p></div></footer>'''

def plain(text):
    return html.unescape(re.sub('<[^>]+>', '', text)).strip()

def brand(text):
    text = re.sub(r'The meeting transcript is indexed for word-and-phrase searches in the Research Library\.', '', text)
    text = text.replace('Archived official document hosted by Beaumont Intelligence.', 'Archived official public document.')
    text = text.replace('Official Source Library', 'Official document')
    for old, new in [('Beaumont Intelligence', 'Moving Beaumont Forward'), ('BEAUMONT INTELLIGENCE', 'MOVING BEAUMONT FORWARD'), ('Council Intelligence', 'Council Briefings'), ('BI Insights', 'Context'), ('BI Insight', 'Key context'), ('BI priority', 'Priority note'), ('BI_', 'MBF_')]:
        text = text.replace(old, new)
    return text

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True, help='BI docs directory (read only)')
    parser.add_argument('--as-of', type=date.fromisoformat, default=date.today())
    args = parser.parse_args()
    source = args.source.resolve()
    today = args.as_of
    cutoff = today.replace(year=today.year-1, day=min(today.day, calendar.monthrange(today.year-1, today.month)[1]))
    meeting_data = (source/'council-meeting-sources.js').read_text(encoding='utf-8-sig')
    meeting_sources = {r['date']:r for r in json.loads(meeting_data.split('=',1)[1].strip().rstrip(';'))}
    files = [p for p in (source/'briefings').glob('*') if re.match(r'\d{4}-\d{2}-\d{2}(?:-sources)?\.(html|js)$', p.name) and date.fromisoformat(p.name[:10]) >= cutoff]
    files += [source/'briefings'/name for name in ['video-viewer.html', 'video-viewer.js']]
    files += [source/name for name in ['council-meeting-sources.html', 'council-meeting-sources.js', 'styles.css', 'meeting-records.css', 'briefing-clips.js', 'briefing-record-documents.js', 'documents/viewer.html', 'documents/viewer.js']]
    bundled = {p.relative_to(source).as_posix() for p in files}
    bundled.update(['app.js', 'documents/document-data.js', 'council-briefings.html', 'moving-beaumont-forward-logo.jpg', 'favicon.png'])

    def url_for(value, page):
        for _ in range(4):
            decoded=html.unescape(value)
            if decoded==value:break
            value=decoded
        parts = urlsplit(value)
        if value.startswith('#') or parts.scheme in ('mailto', 'tel', 'data', 'javascript', 'about') or '${' in value:
            return value
        if parts.netloc and parts.hostname not in ('beaumontintelligence.com', 'www.beaumontintelligence.com'):
            return value
        local = posixpath.normpath(parts.path.lstrip('/') if parts.path.startswith('/') or parts.netloc else posixpath.join(posixpath.dirname(page), parts.path))
        if local in ('index.html', '.'):
            return '/'
        if local in ('council-intelligence.html', 'council-briefings-2026.html'):
            return '/council-briefings.html'
        if local in ('mbf-logo.png',):
            return '/moving-beaumont-forward-logo.jpg'
        if local.startswith(('official-documents/', 'records/', 'transcripts/')):
            return urlunsplit(('https', 'documents.beaumontintelligence.com', '/'+local, parts.query, parts.fragment))
        if local in bundled:
            return urlunsplit(('', '', '/'+local, parts.query, parts.fragment))
        return None

    def transform(text, page):
        if page == 'documents/viewer.html':
            text = text.replace('  ← Back to previous page', '')
            text = re.sub(r'(<main\b[^>]*>)', r'\1<a id="viewer-back-link" class="text-link" href="/council-briefings.html">← Back to council briefings</a>', text, count=1)
        if page == 'documents/viewer.js':
            text = text.replace('(() => {', '(() => {\n  if (window.self !== window.top) document.body.classList.add("embedded-document");', 1)
            text = text.replace('const returnUrl = params.get("returnUrl");', '''let returnUrl = params.get("returnUrl");
  try {
    const back = new URL(returnUrl || '/council-briefings.html', location.href);
    returnUrl = back.origin === location.origin ? back.href : null;
  } catch { returnUrl = null; }''')
            text = text.replace('"index.html"', '"/council-briefings.html"').replace('Official Source Library', 'council records')
            text = text.replace('else renderDocument(\n', 'else if (requestedPdf && !requestedRecord) renderStandalone(`https://documents.beaumontintelligence.com/official-documents/${requestedPdf}`);\n  else renderDocument(\n')
        text = re.sub(r'<header\b[^>]*class=["\'][^"\']*app-header[^"\']*["\'][^>]*>.*?</header>', HEADER, text, flags=re.S|re.I)
        text = re.sub(r'<footer\b[^>]*>.*?</footer>', FOOTER, text, flags=re.S|re.I)
        def anchor(m):
            element = m.group(0)
            attr = re.search(r'href=(["\'])(.*?)\1', element, re.S)
            if not attr: return element
            url = url_for(attr.group(2), page)
            if url is None:
                # Preserve substantive prose while removing links to excluded BI sections.
                label = re.sub(r'^<a\b[^>]*>|</a>$', '', element, flags=re.S)
                if re.search(r'Research Library|Intelligence Centers|About|Budget Center|Open Budget|Explore.*Center', plain(label), re.I): return ''
                return label
            return element[:attr.start(2)] + html.escape(url, quote=True) + element[attr.end(2):]
        text = re.sub(r'<a\b[^>]*>.*?</a>', anchor, text, flags=re.S|re.I)
        def asset(m):
            url = url_for(m.group(3), page)
            if url is None: raise ValueError(f'Missing dependency {page}: {m.group(3)}')
            return m.group(1)+m.group(2)+html.escape(url, quote=True)+m.group(2)
        text = re.sub(r'(\b(?:src|href)=)(["\'])([^"\']+)\2', asset, text) if page.endswith('.html') else text
        text = re.sub(r'<script[^>]+src=["\'][^"\']*data\.js[^"\']*["\'][^>]*></script>', '', text) if page.startswith('briefings/') else text
        text = brand(text)
        text = text.replace('https://beaumontintelligence.com', 'https://movingbeaumontforward.com')
        if page.endswith('.html'):
            text = text.replace('</head>', '<link rel="stylesheet" href="/council-brand.css"><script defer src="/council-window.js"></script></head>')
        return text

    # Remove obsolete script imports before dependency validation.
    catalog = []
    for p in files:
        rel = p.relative_to(source).as_posix()
        text = p.read_text(encoding='utf-8-sig')
        if rel == 'council-meeting-sources.js':
            text = 'window.BI_COUNCIL_MEETING_SOURCES=' + json.dumps([r for r in meeting_sources.values() if date.fromisoformat(r['date']) >= cutoff]) + ';'
        if rel == 'council-meeting-sources.html':
            text = text.replace('const records = window.BI_COUNCIL_MEETING_SOURCES || [];', '''const now = new Date();
      const cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear()-1);
      const records = (window.BI_COUNCIL_MEETING_SOURCES || []).filter(r => new Date(r.date+'T23:59:59') >= cutoff);''')
        if rel.startswith('briefings/'):
            text = re.sub(r'<script[^>]+src=["\'][^"\']*(?<!-)data\.js[^"\']*["\'][^>]*></script>', '', text)
            meeting_video = meeting_sources.get(p.name[:10],{}).get('video')
            if meeting_video and re.fullmatch(r'\d{4}-\d{2}-\d{2}\.html', p.name) and 'youtube.com/watch' not in text:
                text = re.sub(r'(<div class="(?:status-actions|record-actions)">)', lambda m:m.group(1)+f'<a class="btn secondary" href="{meeting_video}" target="_blank" rel="noopener">Watch meeting video ↗</a>', text, count=1)
        if re.fullmatch(r'briefings/\d{4}-\d{2}-\d{2}\.html', rel):
            desc = re.search(r'<p[^>]*class=["\'][^"\']*(?:briefing-subtitle|lead-copy)[^"\']*["\'][^>]*>(.*?)</p>', text, re.S)
            title = re.search(r'<h1[^>]*>(.*?)</h1>', text, re.S)
            catalog.append({'date': p.stem, 'title': brand(plain(title.group(1))) if title else p.stem, 'summary': brand(plain(desc.group(1))) if desc else 'Meeting context, official documents, and available video.', 'briefing': '/'+rel, 'agenda': f'/briefings/{p.stem}-sources.html' if (source/'briefings'/f'{p.stem}-sources.html').exists() else None})
        destination = PUBLIC/rel
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(transform(text, rel), encoding='utf-8')
    # Carry just document metadata for the included meetings, never the PDF files.
    result = subprocess.run(['node', '-e', "const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(process.argv[1],'utf8')+';this.result=documentLibrary;',c);console.log(JSON.stringify(c.result));", str(source/'documents/document-data.js')], check=True, capture_output=True, text=True, encoding='utf-8')
    records = json.loads(result.stdout)
    retained = {p.name[:10] for p in files if p.parent.name == 'briefings' and p.name[0].isdigit()}
    records = [r for r in records if r.get('meetingDate') in retained]
    for record in records:
        record.pop('pageImages', None)
        for key in ['pdf', 'briefing']:
            if isinstance(record.get(key), str):
                record[key] = url_for(record[key], 'documents/document-data.js') or '/council-briefings.html'
    (PUBLIC/'documents/document-data.js').write_text('const documentLibrary = '+brand(json.dumps(records, ensure_ascii=False))+';\n', encoding='utf-8')
    catalog.sort(key=lambda r: r['date'], reverse=True)
    (ROOT/'app/council-records.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (PUBLIC/'council-records.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    def card(r):
        actions = f'<a class="btn" href="{r["briefing"]}">Open briefing</a>'
        if r['agenda']: actions += f'<a class="btn secondary" href="{r["agenda"]}">Interactive agenda</a>'
        label = date.fromisoformat(r['date']).strftime('%B %d, %Y').replace(' 0', ' ')
        return f'<article class="archive-card" data-meeting-date="{r["date"]}"><time datetime="{r["date"]}">{label}</time><h3>{html.escape(r["title"])}</h3><p>{html.escape(r["summary"])}</p><div class="status-actions">{actions}</div></article>'
    upcoming = ''.join(card(r) for r in catalog if r['date'] >= today.isoformat())
    past = ''.join(card(r) for r in catalog if r['date'] < today.isoformat())
    archive = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Council Briefings | Moving Beaumont Forward</title><meta name="description" content="Upcoming Beaumont City Council briefings and the previous 12 months of meeting records, interactive agendas, and videos."><link rel="icon" href="/favicon.png"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/council-brand.css"><script defer src="/council-window.js"></script></head><body><a class="skip-link" href="#main">Skip to content</a>{HEADER}<main id="main"><section class="archive-intro"><div class="wrap"><h1>Council briefings</h1><p>What’s coming before Council. What happened at recent meetings.</p><p>Read the briefing, explore the agenda, and follow the official documents and meeting video.</p></div></section><section class="archive-section" data-record-section><div class="wrap"><h2>Upcoming meetings</h2><p>Pre-meeting briefings for published agendas.</p><div class="archive-list" id="upcoming-records">{upcoming}</div><p class="archive-empty" {'hidden' if upcoming else ''}>No upcoming pre-meeting briefing is available yet.</p></div></section><section class="archive-section" data-record-section><div class="wrap"><h2>Previous 12 months</h2><p>Available briefings and meeting records, with interactive agendas and video where available.</p><div class="archive-list" id="past-records">{past}</div><p class="archive-empty" {'hidden' if past else ''}>No meeting records are available in this period.</p></div></section></main>{FOOTER}</body></html>'''
    (PUBLIC/'council-briefings.html').write_text(archive, encoding='utf-8')
    for name in ['council-intelligence.html', 'council-briefings-2026.html']:
        (PUBLIC/name).write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Council Briefings | Moving Beaumont Forward</title><meta http-equiv="refresh" content="0;url=/council-briefings.html"><a href="/council-briefings.html">Council briefings</a></html>', encoding='utf-8')
    for p in (PUBLIC/'briefings').glob('*'):
        if p.is_file() and p.relative_to(PUBLIC).as_posix() not in bundled:
            p.unlink()
    print(f'Imported {len(catalog)} briefings and {len(files)} presentation files; cutoff {cutoff}; no source documents copied.')

if __name__ == '__main__': main()
