# Editing this site

The site is plain static HTML/CSS/JS — no framework, no npm, no bundler.
GitHub Pages serves the generated `.html` files directly, so **nothing has to be
built at deploy time**. The generator only exists so that the navigation, footer,
icons and the 18 publication pages don't have to be maintained by hand.

## Layout

```
_src/
  site.json           navigation, social profiles, contact details
  publications.json   every publication record — the single source of truth
  partials/
    head.html         everything inside <head>
    header.html       skip link, background decoration, header + navigation
    footer.html       footer, back-to-top control, script tag
  pages/
    index.html        → index.html
    about.html        → about.html
    research.html     → research.html
    publications.html → publications.html
    teaching.html     → portal.html
    service.html      → service.html
    contact.html      → contact.html
tools/build.py        the generator (Python 3 standard library only)
```

Generated output (committed to the repository):

```
index.html  about.html  research.html  publications.html
portal.html service.html contact.html
publications/<id>.html   one page per publication
sitemap.xml
```

Every generated file carries a `GENERATED FILE — do not edit by hand` banner.

## Rebuilding

```bash
python3 tools/build.py
```

## Common tasks

**Add or edit a publication** — edit `_src/publications.json`, then rebuild.
Each record supports:

| field           | notes                                                                |
| --------------- | -------------------------------------------------------------------- |
| `id`            | URL slug; becomes `publications/<id>.html`                            |
| `ref`           | short label shown as a chip, e.g. `J1`, `C4`, `O2`                    |
| `type`          | `journal`, `conference` or `other`                                    |
| `title`         | as it should be displayed                                             |
| `authors`       | list of `{ "name": …, "me": true|false }`; `me` bolds the name        |
| `venue`         | journal or proceedings name                                           |
| `publisher`     | IEEE, Elsevier, Springer, Nature Portfolio …                          |
| `year`          | publication year                                                      |
| `volume`/`pages`| optional                                                              |
| `doi`           | bare DOI, e.g. `10.1109/TSC.2024.3414371`                             |
| `publisherUrl`  | canonical publisher page                                              |
| `pdfUrl`        | publisher-hosted open-access PDF only; leave empty otherwise          |
| `abstract`      | verbatim publisher abstract, or empty                                 |
| `keywords`      | publisher keywords                                                    |
| `metrics`       | chips such as `"Impact Factor 6.8"`, `"Q1"`                           |
| `topics`        | research-area chips                                                   |
| `highlights`    | author-written bullet points                                          |
| `note`          | shown in a highlighted callout on the detail page                     |
| `presentation`  | `{ "slug": …, "pdf": …, "slides": 5 }`, or `null`                     |

Citations (IEEE style and BibTeX) are generated from these fields — there is
nothing to keep in sync by hand.

**Add a presentation** — put the source PDF in `Presentations/`, render its
pages to `assets/presentations/<slug>/slide-N.jpg` (plus `thumb.jpg`), then
point the publication's `presentation` field at that slug.

**Change the navigation, social links or contact details** — edit
`_src/site.json`.

**Change the look** — edit `style.css`. All colours, spacing, typography and
motion live in the `:root` token block at the top.

**Change behaviour** — edit `script.js`. Every feature is progressive
enhancement: the site is fully readable and navigable with JavaScript disabled.
