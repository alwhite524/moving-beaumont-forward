"""Check the public council bundle for missing links, excluded content, and source copies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import subprocess

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
errors=[]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.links=[];self.ids=set();self.scripts=[];self.script=None;self.visible=[];self.skip=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        for key in ('href','src'):
            if a.get(key): self.links.append(a[key])
        if tag in ('script','style'): self.skip+=1
        if tag=='script' and not a.get('src'): self.script=''
    def handle_endtag(self, tag):
        if tag=='script' and self.script is not None: self.scripts.append(self.script);self.script=None
        if tag in ('script','style'): self.skip=max(0,self.skip-1)
    def handle_data(self, data):
        if self.script is not None:self.script+=data
        if not self.skip:self.visible.append(data)

inline=[]
for file in PUBLIC.rglob('*.html'):
    p=Page();p.feed(file.read_text(encoding='utf-8'))
    visible=' '.join(p.visible)
    for banned in ['Beaumont Intelligence','Research Library','Intelligence Centers','PD technology dossier']:
        if banned.lower() in visible.lower():errors.append(f'{file.name}: excluded text {banned}')
    for link in p.links:
        url=urlsplit(link)
        if url.hostname in ('beaumontintelligence.com','www.beaumontintelligence.com'): errors.append(f'{file.name}: BI website link')
        if url.scheme or url.netloc or not url.path:continue
        target=PUBLIC/unquote(url.path.lstrip('/')) if url.path.startswith('/') else file.parent/unquote(url.path)
        if url.path!='/' and not target.exists(): errors.append(f'{file.name}: missing {link}')
    inline.extend(p.scripts)
    if file.name=='viewer.html' and 'viewer-back-link' not in p.ids: errors.append('Document viewer missing return link')
for extension in ('*.pdf','*.mp4','*.docx'):
    for file in PUBLIC.rglob(extension): errors.append(f'Copied source: {file}')
result=subprocess.run(['node','-e',"const vm=require('vm');let input='';process.stdin.on('data',s=>input+=s);process.stdin.on('end',()=>{for(const s of JSON.parse(input))new vm.Script(s)});"],input=json.dumps(inline),capture_output=True,text=True)
if result.returncode:errors.append(result.stderr)
for file in PUBLIC.rglob('*.js'):
    result=subprocess.run(['node','--check',str(file)],capture_output=True,text=True)
    if result.returncode:errors.append(result.stderr)
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(list(PUBLIC.rglob("*.html")))} pages; all local links resolve; no excluded branding, BI website links, or copied source documents; scripts parse.')
