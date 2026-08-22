# BI-to-MBF publishing integration

Beaumont Intelligence is the private research and evidence source of truth.
Moving Beaumont Forward is the public publishing destination. Publication is
an intentional editorial handoff, not an automatic mirror of BI.

MBF reads the versioned publication manifest committed at
`docs/publishing/mbf-feed.json` in the `alwhite524/beaumont-intelligence`
repository. `BI_PUBLISH_FEED_URL` may override that default for preview or
testing. An empty manifest leaves the existing MBF page unchanged.

## Feed contract (version 1)

```json
{
  "version": 1,
  "items": [
    {
      "id": "stable-bi-content-id",
      "title": "Update title",
      "excerpt": "A plain-text summary suitable for the MBF homepage.",
      "url": "https://movingbeaumontforward.com/updates/example-update",
      "publishedAt": "2026-08-22T17:00:00Z",
      "imageUrl": "https://example.com/optional-image.jpg"
    }
  ]
}
```

Required fields are `id`, `title`, `excerpt`, `url`, and `publishedAt`.
`imageUrl` is optional and reserved for a later visual publishing slice. URLs
must use HTTP or HTTPS and dates must be valid ISO-8601 timestamps. MBF sorts
valid items newest-first and displays at most three.

The URL is the canonical MBF public version. It must not point to private BI
working material. If an override feed is protected, set
`BI_PUBLISH_FEED_TOKEN`; MBF sends it as a Bearer token. Secrets belong in the
hosting environment and must not be committed.

## Next connection step

Create the first MBF update route from a verified BI dossier. After editorial
approval, add that MBF URL to the manifest. Once the public version is live,
mark the BI dossier `Published` and record its MBF URL.
