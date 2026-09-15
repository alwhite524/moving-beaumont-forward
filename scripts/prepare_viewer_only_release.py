"""Prepare a viewer-only release using the preserved live deployment, without deploying."""
import hashlib,json,re,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'outputs/viewer-update-baseline'
OUT=ROOT/'outputs/viewer-only-release'
FILES=json.loads((BASE/'public-files.json').read_text())
VIEWER={'documents/viewer.html','documents/viewer.js','documents/pdf-reader.js'}
def clean(data):
    return re.sub(rb'<script\b[^>]*src="https://static.cloudflareinsights.com/[^>]*>\s*</script>\s*',b'',data)
def prepare():
    OUT.mkdir(parents=True,exist_ok=True)
    shutil.copytree(BASE/'worker',OUT/'preserved-worker',dirs_exist_ok=True)
    names={p.lstrip('/') for p in FILES}
    names.update(p.relative_to(BASE/'snapshot').as_posix() for p in (BASE/'snapshot/_next').rglob('*') if p.is_file())
    names.update(VIEWER)
    manifest=[]
    for name in sorted(names):
        original=BASE/'snapshot'/name
        data=(ROOT/'public'/name).read_bytes() if name in VIEWER else clean(original.read_bytes())
        target=OUT/'assets'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
        manifest.append({'file':name,'sha256':hashlib.sha256(data).hexdigest(),'change':'viewer' if name in VIEWER else 'preserved'})
    (OUT/'assets/_headers').write_text('# Preserved production asset caching\n/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n')
    shutil.copy2(ROOT/'worker/document-proxy.mjs',OUT/'document-proxy.mjs')
    (OUT/'entry.mjs').write_text("import live from './preserved-worker/index.js';\nimport { withDocumentProxy } from './document-proxy.mjs';\nexport default withDocumentProxy(live);\n")
    config={'name':'moving-beaumont-forward','account_id':'2e9aae1d93537787795a80429a6edb4c','main':'entry.mjs','compatibility_date':'2026-05-15','compatibility_flags':['nodejs_compat'],'no_bundle':True,'find_additional_modules':True,'rules':[{'type':'ESModule','globs':['preserved-worker/**/*.js','document-proxy.mjs']}],'assets':{'directory':'assets','binding':'ASSETS','not_found_handling':'none'},'images':{'binding':'IMAGES'},'routes':[{'pattern':'movingbeaumontforward.com','custom_domain':True}]}
    (OUT/'wrangler.json').write_text(json.dumps(config,indent=2))
    (OUT/'manifest.json').write_text(json.dumps({'baseline_version':'5ae02dba-6422-4ca1-9cc1-17cf325c14c6','files':manifest},indent=2))
    print(f'Prepared {len(names)} assets; only {len(VIEWER)} viewer assets differ from the preserved live site.')
    print(OUT)
if __name__=='__main__':prepare()
