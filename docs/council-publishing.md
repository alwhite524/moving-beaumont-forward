# MBF council publishing

MBF is public. BI's site and its access policy are unchanged. Public official documents are loaded from `documents.beaumontintelligence.com`, separate from BI website access. No authenticated BI content is fetched or proxied.

Refresh the presentation from the read-only BI checkout before publishing:

```powershell
python scripts/sync_council.py --source C:/Users/arwhi/OneDrive/Documents/GitHub/beaumont-intelligence/docs
python scripts/audit_council.py
```

The importer includes dated briefings and interactive agendas from the previous calendar year through upcoming meetings. It copies HTML, scripts, styles, and minimal document metadata. It never copies source PDFs or media. The homepage and archive calculate the rolling window in Beaumont time; each sync prunes expired presentation files. Re-run the import and publish to add new or revised BI briefings. This is not an automatic scheduled sync.

The original retired MBF pages and copied document images are preserved locally under `legacy-static/pre-council-overhaul/` and in Git history. They are excluded from the published site. The former intelligence and year-archive URLs redirect to Council Briefings; dossier routes return Gone.

The existing npm lockfile is retained. On a Windows host without npm, the equivalent existing build entrypoint is `node node_modules/vinext/dist/cli.js build`.
