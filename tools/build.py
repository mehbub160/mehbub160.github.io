#!/usr/bin/env python3
"""
Static site builder for mehbubalam.com
======================================

Plain Python 3 (standard library only) — no npm, no bundler, no dependencies.

    python3 tools/build.py

Sources
-------
    _src/site.json            site-wide details: navigation, social profiles, contact
    _src/publications.json    every publication record (single source of truth)
    _src/partials/*.html      <head>, site header and site footer shared by every page
    _src/pages/*.html         the body of each page, with a small front-matter block

Output (committed to the repository, so GitHub Pages needs no build step)
------------------------------------------------------------------------
    index.html  about.html  research.html  publications.html
    portal.html service.html contact.html
    publications/<id>.html    one detail page per publication
    sitemap.xml

Edit the sources, re-run this script, commit the result.
"""

import html
import json
import os
import re
import unicodedata
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "_src")

GENERATED_BANNER = (
    "<!-- ============================================================\n"
    "     GENERATED FILE — do not edit by hand.\n"
    "     Source: _src/pages/{src}  +  _src/partials/*  +  _src/*.json\n"
    "     Rebuild with:  python3 tools/build.py\n"
    "     ============================================================ -->\n"
)


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def write(path, text):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def fill(template, ctx):
    """Replace {{key}} tokens. Unknown tokens are left untouched on purpose."""
    def sub(match):
        key = match.group(1).strip()
        return ctx[key] if key in ctx else match.group(0)
    return re.sub(r"\{\{([a-zA-Z0-9_]+)\}\}", sub, template)


def esc(text):
    return html.escape(str(text or ""), quote=True)


def strip_accents(text):
    return "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))


SITE = json.loads(read(os.path.join(SRC, "site.json")))
PUBS = json.loads(read(os.path.join(SRC, "publications.json")))["publications"]
PARTIAL = {
    name: read(os.path.join(SRC, "partials", name + ".html"))
    for name in ("head", "header", "footer")
}
YEAR = str(date.today().year)


# ---------------------------------------------------------------------------
# inline SVG icon set (no external icon library, no network request)
# Brand marks from Simple Icons (CC0 1.0); UI glyphs are hand-drawn strokes.
# ---------------------------------------------------------------------------

BRAND_PATHS = {
    "linkedin": "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    "github": "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    "scholar": "M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z",
    "orcid": "M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z",
    "researchgate": "M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 8.365 8.365 0 0 0-.078.53 9 9 0 0 0-.05.727c-.01.282-.013.621-.013 1.016a31.121 31.123 0 0 0 .014 1.017 9 9 0 0 0 .05.727 7.946 7.946 0 0 0 .077.53h-.005a3.334 3.334 0 0 0 .113.438c.245.743.65 1.303 1.214 1.68.565.376 1.256.564 2.075.564.8 0 1.536-.213 2.105-.603.57-.39.94-.916 1.175-1.65.076-.235.135-.558.177-.93a10.9 10.9 0 0 0 .043-1.207v-.82c0-.095-.047-.142-.14-.142h-3.064c-.094 0-.14.047-.14.141v.956c0 .094.046.14.14.14h1.666c.056 0 .084.03.084.086 0 .36 0 .62-.036.865-.038.244-.1.447-.147.606-.108.385-.348.664-.638.876-.29.212-.738.35-1.227.35-.545 0-.901-.15-1.21-.353-.306-.203-.517-.454-.67-.915a3.136 3.136 0 0 1-.147-.762 17.366 17.367 0 0 1-.034-.656c-.01-.26-.014-.572-.014-.939a26.401 26.403 0 0 1 .014-.938 15.821 15.822 0 0 1 .035-.656 3.19 3.19 0 0 1 .148-.76 1.89 1.89 0 0 1 .742-1.01c.344-.244.593-.352 1.137-.352.508 0 .815.096 1.144.303.33.207.528.492.764.925.047.094.111.118.198.07l1.044-.43c.075-.048.09-.115.042-.199a3.549 3.549 0 0 0-.466-.742 3 3 0 0 0-.679-.607 3.313 3.313 0 0 0-.903-.41A4.068 4.068 0 0 0 19.586 0zM8.217 5.836c-1.69 0-3.036.086-4.297.086-1.146 0-2.291 0-3.007-.029v.831l1.088.2c.744.144 1.174.488 1.174 2.264v11.288c0 1.777-.43 2.12-1.174 2.263l-1.088.2v.832c.773-.029 2.12-.086 3.465-.086 1.29 0 2.951.057 3.667.086v-.831l-1.49-.2c-.773-.115-1.174-.487-1.174-2.264v-4.784c.688.057 1.29.057 2.206.057 1.748 3.123 3.41 5.472 4.355 6.56.86 1.032 2.177 1.691 3.839 1.691.487 0 1.003-.086 1.318-.23v-.744c-1.031 0-2.063-.716-2.808-1.518-1.26-1.376-2.95-3.582-4.355-6.074 2.32-.545 4.04-2.722 4.04-4.9 0-3.208-2.492-4.698-5.758-4.698zm-.515 1.29c2.406 0 3.839 1.26 3.839 3.552 0 2.263-1.547 3.782-4.097 3.782-.974 0-1.404-.03-2.063-.086v-7.19c.66-.059 1.547-.059 2.32-.059z",
    "email": "M1.5 4.5h21a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 18V6a1.5 1.5 0 0 1 1.5-1.5zm.85 2L12 12.6l9.65-6.1H2.35zM22 8.16l-9.47 5.99a1 1 0 0 1-1.06 0L2 8.16V17.5h20V8.16z",
}

STROKE_ICONS = {
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
    "arrow-down": '<path d="M12 5v14M6 13l6 6 6-6"/>',
    "chevron-left": '<path d="M15 6l-6 6 6 6"/>',
    "chevron-right": '<path d="M9 6l6 6-6 6"/>',
    "file-text": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    "download": '<path d="M12 3v12M7 11l5 5 5-5M5 20h14"/>',
    "link": '<path d="M10 13a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 1 0-5.66-5.66L11.5 5.84"/><path d="M14 11a4 4 0 0 0-5.66 0L5.5 13.84a4 4 0 1 0 5.66 5.66L12.5 18.1"/>',
    "quote": '<path d="M7 7h4v6a4 4 0 0 1-4 4"/><path d="M15 7h4v6a4 4 0 0 1-4 4"/>',
    "copy": '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    "presentation": '<path d="M3 4h18M4 4v10h16V4M12 14v4M9 21l3-3 3 3"/>',
    "book": '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    "flask": '<path d="M10 3h4M10 3v6L5 19a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 19l-5-10V3"/><path d="M7.5 14h9"/>',
    "cap": '<path d="M2 8.5 12 4l10 4.5-10 4.5z"/><path d="M6 10.7V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.3"/>',
    "award": '<circle cx="12" cy="9" r="5"/><path d="M9 13.5 8 22l4-2 4 2-1-8.5"/>',
    "users": '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M17 5.5a3.2 3.2 0 0 1 0 6.2M18 14.4a6.5 6.5 0 0 1 3.5 5.6"/>',
    "briefcase": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
    "shield": '<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    "cpu": '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 2v4M14 2v4M10 18v4M14 18v4M2 10h4M2 14h4M18 10h4M18 14h4"/>',
    "cloud": '<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6 11.2 3.5 3.5 0 0 0 7 18z"/>',
    "drone": '<circle cx="12" cy="12" r="2.5"/><path d="M9.8 9.8 6 6M14.2 9.8 18 6M9.8 14.2 6 18M14.2 14.2 18 18"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
    "pin": '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    "mail": '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6 9 6 9-6"/>',
    "mic": '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    "edit": '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/>',
}


def brand_icon(name):
    path = BRAND_PATHS[name]
    return ('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
            '<path d="%s"/></svg>' % path)


def icon(name, cls=""):
    body = STROKE_ICONS[name]
    class_attr = ' class="%s"' % cls if cls else ""
    return ('<svg%s viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
            "%s</svg>" % (class_attr, body))


def social_items():
    out = []
    for s in SITE["social"]:
        external = not s["url"].startswith("mailto:")
        rel = ' target="_blank" rel="noopener noreferrer"' if external else ""
        out.append(
            '<li><a class="social__link" href="%s"%s aria-label="%s"><span class="visually-hidden">%s</span>%s</a></li>'
            % (esc(s["url"]), rel, esc(s["label"]), esc(s["label"]), brand_icon(s["icon"]))
        )
    return "\n                    ".join(out)


def nav_items(active, base):
    out = []
    for item in SITE["nav"]:
        current = ' aria-current="page"' if item["key"] == active else ""
        out.append('<a class="nav__link" href="%s%s"%s>%s</a>'
                   % (base, item["href"], current, esc(item["label"])))
    return "\n            ".join(out)


# ---------------------------------------------------------------------------
# publication helpers
# ---------------------------------------------------------------------------

TYPE_LABEL = {
    "journal": "Journal Article",
    "conference": "Conference Paper",
    "other": "Other Research Work",
}

GROUPS = [
    ("journal", "Journal Articles", "Peer-reviewed articles in international journals and magazines."),
    ("conference", "Conference Papers", "Peer-reviewed papers in international conferences and workshops."),
    ("other", "Other Research Works", "Earlier research work carried out before the doctoral programme."),
]


def author_line(pub, bold_me=True):
    parts = []
    for a in pub["authors"]:
        name = esc(a["name"])
        parts.append('<span class="me">%s</span>' % name if (a.get("me") and bold_me) else name)
    if len(parts) > 1:
        return ", ".join(parts[:-1]) + " and " + parts[-1]
    return parts[0]


def venue_line(pub):
    bits = ["<em>%s</em>" % esc(pub["venue"])]
    if pub.get("volume"):
        bits.append("vol.&nbsp;%s" % esc(pub["volume"]))
    if pub.get("pages"):
        pages = esc(pub["pages"])
        bits.append(("art.&nbsp;no.&nbsp;%s" % pages) if "-" not in pages and len(pages) > 4
                    else "pp.&nbsp;%s" % pages)
    bits.append(esc(pub["year"]))
    return ", ".join(bits)


def doi_url(pub):
    return "https://doi.org/" + pub["doi"] if pub.get("doi") else ""


def paper_href(pub, base=""):
    return "%spublications/%s.html" % (base, pub["id"])


def ext_link(href, label, icon_name, primary=False, small=True):
    cls = "btn btn--primary" if primary else "btn btn--ghost"
    if small:
        cls += " btn--sm"
    return ('<a class="%s" href="%s" target="_blank" rel="noopener noreferrer">%s<span>%s</span>'
            '<span class="visually-hidden"> (opens in a new tab)</span></a>'
            % (cls, esc(href), icon(icon_name), esc(label)))


def int_link(href, label, icon_name, primary=False, small=True):
    cls = "btn btn--primary" if primary else "btn btn--ghost"
    if small:
        cls += " btn--sm"
    return '<a class="%s" href="%s">%s<span>%s</span></a>' % (cls, esc(href), icon(icon_name), esc(label))


def pub_card(pub, base=""):
    actions = [int_link(paper_href(pub, base), "Read Paper", "file-text", primary=True)]
    if pub.get("publisherUrl"):
        actions.append(ext_link(pub["publisherUrl"], "Publisher Page", "arrow-up-right"))
    if pub.get("doi"):
        actions.append(ext_link(doi_url(pub), "DOI", "link"))
    if pub.get("pdfUrl"):
        actions.append(ext_link(pub["pdfUrl"], "PDF", "download"))
    if pub.get("presentation"):
        actions.append(int_link(paper_href(pub, base) + "#presentation", "View Presentation", "presentation"))

    metrics = "".join('<span class="chip chip--plain">%s</span>' % esc(m) for m in pub.get("metrics", []))
    metrics_html = ('<div class="chip-row" style="margin-top:.55rem">%s</div>' % metrics) if metrics else ""

    abstract_html = ""
    if pub.get("abstract"):
        preview = pub["abstract"]
        abstract_html = (
            '\n                <details class="pub__abstract">'
            "\n                    <summary>Abstract</summary>"
            "\n                    <p>%s</p>"
            "\n                </details>" % esc(preview)
        )

    return """            <li class="pub" data-pub-type="%(type)s">
                <div class="pub__head">
                    <span class="pub__ref" aria-hidden="true">%(ref)s</span>
                    <h3 class="pub__title"><a href="%(href)s">%(title)s</a></h3>
                </div>
                <p class="pub__authors">%(authors)s</p>
                <p class="pub__venue">%(venue)s</p>
                %(metrics)s
                <div class="pub__actions">%(actions)s</div>%(abstract)s
            </li>""" % {
        "type": pub["type"],
        "ref": esc(pub["ref"]),
        "href": paper_href(pub, base),
        "title": esc(pub["title"]),
        "authors": author_line(pub),
        "venue": venue_line(pub),
        "metrics": metrics_html,
        "actions": "\n                    ".join(actions),
        "abstract": abstract_html,
    }


def publications_block(base=""):
    out = []
    for key, heading, blurb in GROUPS:
        items = [p for p in PUBS if p["type"] == key]
        if not items:
            continue
        cards = "\n".join(pub_card(p, base) for p in items)
        out.append("""        <section class="pub-group" aria-labelledby="group-%(key)s">
            <div class="pub-group__head">
                <h2 id="group-%(key)s">%(heading)s</h2>
                <span class="count">%(n)d</span>
            </div>
            <p class="tiny muted" style="margin-bottom:1rem">%(blurb)s</p>
            <ol class="pub-list">
%(cards)s
            </ol>
        </section>""" % {"key": key, "heading": esc(heading), "n": len(items),
                         "blurb": esc(blurb), "cards": cards})
    return "\n".join(out)


def recent_publications_block(n=4, base=""):
    """Compact teaser used on the home page."""
    cards = []
    for pub in PUBS[:n]:
        actions = [int_link(paper_href(pub, base), "Read Paper", "file-text", primary=True)]
        if pub.get("publisherUrl"):
            actions.append(ext_link(pub["publisherUrl"], "Publisher Page", "arrow-up-right"))
        if pub.get("presentation"):
            actions.append(int_link(paper_href(pub, base) + "#presentation", "Presentation", "presentation"))
        cards.append("""            <li class="pub" data-pub-type="%(type)s">
                <div class="pub__head">
                    <span class="pub__ref" aria-hidden="true">%(ref)s</span>
                    <h3 class="pub__title"><a href="%(href)s">%(title)s</a></h3>
                </div>
                <p class="pub__authors">%(authors)s</p>
                <p class="pub__venue">%(venue)s</p>
                <div class="pub__actions">%(actions)s</div>
            </li>""" % {
            "type": pub["type"], "ref": esc(pub["ref"]), "href": paper_href(pub, base),
            "title": esc(pub["title"]), "authors": author_line(pub), "venue": venue_line(pub),
            "actions": "\n                    ".join(actions)})
    return '        <ol class="pub-list">\n' + "\n".join(cards) + "\n        </ol>"


# ---------------------------------------------------------------------------
# citations
# ---------------------------------------------------------------------------

def initials(name):
    parts = [p for p in name.replace(".", " ").split() if p]
    if len(parts) == 1:
        return parts[0]
    return " ".join(p[0] + "." for p in parts[:-1]) + " " + parts[-1]


def surname(name):
    return name.split()[-1]


def ieee_citation(pub):
    names = [initials(a["name"]) for a in pub["authors"]]
    if len(names) > 1:
        authors = ", ".join(names[:-1]) + ", and " + names[-1]
    else:
        authors = names[0]
    bits = ['%s, "%s," ' % (authors, pub["title"])]
    bits.append("in " if pub["type"] == "conference" else "")
    bits.append(pub["venue"])
    if pub.get("volume"):
        bits.append(", vol. %s" % pub["volume"])
    if pub.get("pages"):
        bits.append(", pp. %s" % pub["pages"] if "-" in pub["pages"] else ", art. no. %s" % pub["pages"])
    bits.append(", %s" % pub["year"])
    if pub.get("doi"):
        bits.append(", doi: %s" % pub["doi"])
    bits.append(".")
    return "".join(bits)


def bibtex(pub):
    key = strip_accents(surname(pub["authors"][0]["name"]).lower())
    key = re.sub(r"[^a-z]", "", key) + pub["year"] + re.sub(r"[^a-z0-9]", "", pub["id"].split("-")[0])
    kind = {"journal": "article", "conference": "inproceedings"}.get(pub["type"], "misc")
    fields = [
        ("author", " and ".join(a["name"] for a in pub["authors"])),
        ("title", "{%s}" % pub["title"]),
        ("booktitle" if kind == "inproceedings" else "journal", pub["venue"]),
        ("year", pub["year"]),
    ]
    if pub.get("volume"):
        fields.append(("volume", pub["volume"]))
    if pub.get("pages"):
        fields.append(("pages", pub["pages"].replace("-", "--")))
    if pub.get("publisher"):
        fields.append(("publisher", pub["publisher"]))
    if pub.get("doi"):
        fields.append(("doi", pub["doi"]))
    body = ",\n".join("  %-9s = {%s}" % (k, v) for k, v in fields)
    return "@%s{%s,\n%s\n}" % (kind, key, body)


# ---------------------------------------------------------------------------
# presentation viewer
# ---------------------------------------------------------------------------

def slides_block(pub, base):
    pres = pub.get("presentation")
    if not pres:
        return ""
    slides = []
    for i in range(1, pres["slides"] + 1):
        slides.append(
            '                    <div class="slides__slide%s">'
            '<img src="%sassets/presentations/%s/slide-%d.jpg" width="1400" height="788" '
            'loading="%s" decoding="async" '
            'alt="Slide %d of %d from the visual summary of “%s”"></div>'
            % (" is-current" if i == 1 else "", base, pres["slug"], i,
               "eager" if i == 1 else "lazy", i, pres["slides"], esc(pub["title"]))
        )
    return """    <section class="paper-block" id="presentation">
        <h2>Presentation</h2>
        <p class="tiny muted" style="margin-bottom:1rem">A %d-slide visual summary of this paper.
            Use the arrows, the dots or the left/right arrow keys to move between slides.</p>

        <div class="slides reveal-img" data-slides tabindex="0" role="group" aria-roledescription="carousel"
             aria-label="Slide deck summarising %s">
            <div class="slides__stage">
                <div class="slides__track">
%s
                </div>
            </div>
            <div class="slides__bar">
                <button class="slides__nav" type="button" data-slide-prev aria-label="Previous slide">%s</button>
                <div class="slides__dots" role="group" aria-label="Choose a slide"></div>
                <span class="slides__status" aria-live="polite">%d slides</span>
                <button class="slides__nav" type="button" data-slide-next aria-label="Next slide">%s</button>
            </div>
        </div>

        <div class="btn-row" style="margin-top:1rem">
            <a class="btn btn--ghost btn--sm" href="%s%s" target="_blank" rel="noopener noreferrer">%s<span>Download slide deck (PDF)</span><span class="visually-hidden"> (opens in a new tab)</span></a>
        </div>
    </section>""" % (
        pres["slides"], esc(pub["title"]), "\n".join(slides),
        icon("chevron-left"), pres["slides"], icon("chevron-right"),
        base, pres["pdf"].replace(" ", "%20"), icon("download"))


# ---------------------------------------------------------------------------
# Continuous section colour blending
# ---------------------------------------------------------------------------
# Each top-level section declares the colour it shares with its neighbour above,
# its own colour, and the colour it shares with its neighbour below. Adjacent
# sections resolve to the same boundary colour, so scrolling shows one smooth
# vertical wash instead of a hard line at every section edge.

SECTION_COLOURS = {
    "main": "#eef2f4",
    "blue": "#e7eef3",
    "teal": "#e7f0ef",
    "lavender": "#eeeaf2",
    "slate": "#eaeef2",
    "warm": "#f1ede6",
    "contact": "#e7eef3",
    # earlier names, kept working
    "grey": "#eaeef2",
    "soft": "#eaeef2",
    "beige": "#f1ede6",
}

# The first class must be exactly "section", "hero" or "paper-hero" — this is
# what keeps helpers such as .section-head, and nested .pub-group / .paper-block
# sections, out of the blend chain.
TOP_LEVEL_SECTION = re.compile(
    r'<(?P<tag>section|div)\s+class="(?P<cls>(?:section|hero|paper-hero)(?:\s[^"]*)?)"(?P<rest>[^>]*)>')

TOKEN_RE = re.compile(r"section--(main|blue|teal|lavender|slate|warm|contact|grey|soft|beige)\b")


def _mix(a, b):
    """Midpoint of two #rrggbb colours."""
    pa = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    pb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join("%02x" % ((x + y) // 2) for x, y in zip(pa, pb))


def blend_sections(body):
    """Give every top-level section its three blend stops."""
    matches = list(TOP_LEVEL_SECTION.finditer(body))
    if not matches:
        return body

    colours = []
    for m in matches:
        cls = m.group("cls")
        token = TOKEN_RE.search(cls)
        if token:
            colours.append(SECTION_COLOURS[token.group(1)])
        elif "paper-hero" in cls:
            colours.append(SECTION_COLOURS["blue"])
        else:
            colours.append(SECTION_COLOURS["main"])

    out, cursor = [], 0
    for i, m in enumerate(matches):
        own = colours[i]
        top = _mix(colours[i - 1], own) if i > 0 else own
        bot = _mix(own, colours[i + 1]) if i < len(colours) - 1 else own
        style = "--sec-top:%s;--sec-mid:%s;--sec-bot:%s" % (top, own, bot)
        tag = '<%s class="%s section--blend"%s style="%s">' % (
            m.group("tag"), m.group("cls"), m.group("rest"), style)
        out.append(body[cursor:m.start()])
        out.append(tag)
        cursor = m.end()
    out.append(body[cursor:])
    return "".join(out)


# ---------------------------------------------------------------------------
# page assembly
# ---------------------------------------------------------------------------

FRONT_RE = re.compile(r"^\s*<!--\s*(.*?)\s*-->\s*", re.S)


def parse_front(text):
    m = FRONT_RE.match(text)
    if not m:
        raise SystemExit("page is missing its front-matter comment block")
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, text[m.end():]


def layout(meta, body, base="", jsonld="", src="(generated)"):
    body = blend_sections(body)
    canonical = SITE["origin"] + "/" + meta.get("output", "index.html")
    if meta.get("output") == "index.html":
        canonical = SITE["origin"] + "/"
    head = fill(PARTIAL["head"], {
        "title": esc(meta["title"]),
        "description": esc(meta["description"]),
        "keywords": esc(meta.get("keywords", SITE["keywords"])),
        "canonical": esc(canonical),
        "ogtype": meta.get("ogtype", "website"),
        "base": base,
        "jsonld": jsonld,
    })
    header = fill(PARTIAL["header"], {"base": base, "nav": nav_items(meta.get("nav", ""), base)})
    footer = fill(PARTIAL["footer"], {"base": base, "year": YEAR, "social": social_items()})

    return ("<!DOCTYPE html>\n<html lang=\"en\" class=\"no-js\">\n<head>\n"
            + GENERATED_BANNER.format(src=src)
            + head
            + "\n</head>\n\n<body>\n\n"
            + header
            + "\n\n<main id=\"main\">\n"
            + body.strip()
            + "\n</main>\n\n"
            + footer
            + "\n\n</body>\n</html>\n")


PERSON_JSONLD = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Dr. Mehbub Alam",
  "url": "https://mehbubalam.com",
  "image": "https://mehbubalam.com/assets/img/profile/og-card.jpg",
  "jobTitle": "Assistant Professor",
  "email": "mailto:mehbub@iiitr.ac.in",
  "worksFor": {
    "@type": "CollegeOrUniversity",
    "name": "Indian Institute of Information Technology Raichur",
    "url": "https://iiitr.ac.in/"
  },
  "alumniOf": [
    { "@type": "CollegeOrUniversity", "name": "Indian Institute of Information Technology Guwahati" },
    { "@type": "CollegeOrUniversity", "name": "North-Eastern Hill University, Shillong" }
  ],
  "knowsAbout": ["Drone Security", "UAV Remote Identification", "Cybersecurity", "Internet of Things",
                 "Fog Computing", "Edge Computing", "Wi-Fi HaLow", "IEEE 802.11ah", "Edge Intelligence"],
  "sameAs": [
    "https://scholar.google.com/citations?user=BFOhVCkAAAAJ",
    "https://orcid.org/0000-0003-0329-8765",
    "https://www.researchgate.net/profile/Mehbub-Alam-2",
    "https://www.linkedin.com/in/mehbubalam/",
    "https://github.com/mehbub160"
  ]
}
</script>"""


def scholarly_jsonld(pub):
    data = {
        "@context": "https://schema.org",
        "@type": "ScholarlyArticle",
        "headline": pub["title"],
        "name": pub["title"],
        "author": [{"@type": "Person", "name": a["name"]} for a in pub["authors"]],
        "datePublished": pub["year"],
        "isPartOf": {"@type": "Periodical", "name": pub["venue"]},
        "url": SITE["origin"] + "/publications/" + pub["id"] + ".html",
    }
    if pub.get("doi"):
        data["identifier"] = "https://doi.org/" + pub["doi"]
        data["sameAs"] = "https://doi.org/" + pub["doi"]
    if pub.get("publisher"):
        data["publisher"] = {"@type": "Organization", "name": pub["publisher"]}
    if pub.get("abstract"):
        data["abstract"] = pub["abstract"]
    if pub.get("keywords"):
        data["keywords"] = ", ".join(pub["keywords"])
    return '<script type="application/ld+json">\n%s\n</script>' % json.dumps(data, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# paper detail page
# ---------------------------------------------------------------------------

def paper_page(pub, prev_pub, next_pub):
    base = "../"
    actions = []
    if pub.get("publisherUrl"):
        actions.append(ext_link(pub["publisherUrl"], "Publisher Page", "arrow-up-right",
                                primary=True, small=False))
    if pub.get("doi"):
        actions.append(ext_link(doi_url(pub), "DOI", "link", small=False))
    if pub.get("pdfUrl"):
        actions.append(ext_link(pub["pdfUrl"], "Read full text (PDF)", "download", small=False))
    if pub.get("presentation"):
        actions.append('<a class="btn btn--ghost" href="#presentation">%s<span>View Presentation</span></a>'
                       % icon("presentation"))
    actions.append('<a class="btn btn--quiet" href="#cite">%s<span>Cite Paper</span></a>' % icon("quote"))

    metrics = "".join('<span class="chip chip--plain">%s</span>' % esc(m) for m in pub.get("metrics", []))
    status_chip = ('<span class="chip chip--sage">Published</span>' if pub["type"] != "other"
                   else '<span class="chip chip--plain">Early research work</span>')

    # ---- main column -------------------------------------------------------
    blocks = []

    if pub.get("abstract"):
        blocks.append('    <section class="paper-block" id="abstract">\n'
                      "        <h2>Abstract</h2>\n"
                      "        <p>%s</p>\n"
                      "    </section>" % esc(pub["abstract"]))
    else:
        blocks.append('    <section class="paper-block" id="abstract">\n'
                      "        <h2>Abstract</h2>\n"
                      '        <p class="muted">The abstract for this paper is available on the '
                      "publisher's page. %s</p>\n"
                      "    </section>" % (
                          ('<a href="%s" target="_blank" rel="noopener noreferrer">Read it on the publisher\'s '
                           'site</a><span class="visually-hidden"> (opens in a new tab)</span>.'
                           % esc(pub["publisherUrl"])) if pub.get("publisherUrl") else ""))

    if pub.get("highlights"):
        items = "\n".join("            <li>%s</li>" % esc(h) for h in pub["highlights"])
        blocks.append('    <section class="paper-block" id="highlights">\n'
                      "        <h2>Research Highlights</h2>\n"
                      '        <ol class="highlights">\n%s\n        </ol>\n'
                      "    </section>" % items)

    slides = slides_block(pub, base)
    if slides:
        blocks.append(slides)

    if pub.get("note"):
        blocks.append('    <section class="paper-block">\n'
                      '        <div class="callout callout--brass">\n'
                      '            <p class="tiny"><strong>Record note.</strong> %s</p>\n'
                      "        </div>\n    </section>" % esc(pub["note"]))

    # ---- side column -------------------------------------------------------
    meta_rows = [("Type", TYPE_LABEL[pub["type"]])]
    if pub.get("publishedVenue"):
        meta_rows.append(("Published in", pub["publishedVenue"]))
    else:
        meta_rows.append(("Published in", pub["venue"]))
    if pub.get("publisher"):
        meta_rows.append(("Publisher", pub["publisher"]))
    if pub.get("volume"):
        meta_rows.append(("Volume", pub["volume"]))
    if pub.get("pages"):
        is_article_no = "-" not in pub["pages"] and len(pub["pages"]) > 4
        meta_rows.append(("Article number" if is_article_no else "Pages", pub["pages"]))
    meta_rows.append(("Year", pub["year"]))
    if pub.get("doi"):
        meta_rows.append(("DOI", '<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>'
                          % (doi_url(pub), esc(pub["doi"]))))
    meta_rows.append(("Status", "Published" if pub["type"] != "other" else "Early research work"))

    rows_html = "\n".join(
        '                <li><span class="k">%s</span><span class="v">%s</span></li>'
        % (esc(k), v if k == "DOI" else esc(v)) for k, v in meta_rows)

    keywords_html = ""
    if pub.get("keywords"):
        kws = "".join('<li>%s</li>' % esc(k) for k in pub["keywords"])
        keywords_html = ('\n        <div class="card">\n            <h2 class="card__title">Keywords</h2>\n'
                         '            <ul class="pill-list" style="margin-top:.6rem">%s</ul>\n'
                         "        </div>" % kws)

    topics_html = ""
    if pub.get("topics"):
        tps = "".join('<li>%s</li>' % esc(t) for t in pub["topics"])
        topics_html = ('\n        <div class="card">\n            <h2 class="card__title">Research areas</h2>\n'
                       '            <ul class="pill-list" style="margin-top:.6rem">%s</ul>\n'
                       "        </div>" % tps)

    cite_id_ieee = "cite-ieee-" + pub["id"]
    cite_id_bib = "cite-bib-" + pub["id"]

    side = """        <div class="card">
            <h2 class="card__title">Publication details</h2>
            <ul class="meta-list">
%(rows)s
            </ul>
        </div>

        <div class="card" id="cite">
            <h2 class="card__title">Cite this paper</h2>
            <p class="tiny muted" style="margin-bottom:.7rem">IEEE style</p>
            <div class="citation"><pre id="%(cid)s">%(ieee)s</pre></div>
            <button class="copy-btn" type="button" data-copy="%(cid)s">%(copy)s<span data-copy-label>Copy citation</span></button>

            <p class="tiny muted" style="margin:1.1rem 0 .7rem">BibTeX</p>
            <div class="citation"><pre id="%(bid)s">%(bib)s</pre></div>
            <button class="copy-btn" type="button" data-copy="%(bid)s">%(copy)s<span data-copy-label>Copy BibTeX</span></button>
        </div>%(kw)s%(topics)s""" % {
        "rows": rows_html,
        "cid": cite_id_ieee,
        "bid": cite_id_bib,
        "ieee": esc(ieee_citation(pub)),
        "bib": esc(bibtex(pub)),
        "copy": icon("copy"),
        "kw": keywords_html,
        "topics": topics_html,
    }

    # ---- prev / next -------------------------------------------------------
    nav_links = []
    if prev_pub:
        nav_links.append('<a class="btn btn--quiet btn--sm" href="%s.html">%s<span>Previous: %s</span></a>'
                         % (esc(prev_pub["id"]), icon("chevron-left"), esc(prev_pub["ref"])))
    nav_links.append('<a class="btn btn--quiet btn--sm" href="../publications.html">%s<span>All publications</span></a>'
                     % icon("book"))
    if next_pub:
        nav_links.append('<a class="btn btn--quiet btn--sm" href="%s.html"><span>Next: %s</span>%s</a>'
                         % (esc(next_pub["id"]), esc(next_pub["ref"]), icon("chevron-right")))

    body = """
<nav class="breadcrumb wrap" aria-label="Breadcrumb">
    <ol>
        <li><a href="../index.html">Home</a></li>
        <li><a href="../publications.html">Publications</a></li>
        <li aria-current="page">%(ref)s</li>
    </ol>
</nav>

<div class="paper-hero">
    <div class="wrap">
        <div class="chip-row">
            <span class="chip">%(ref)s &middot; %(typelabel)s</span>
            %(status)s
            %(metrics)s
        </div>
        <h1>%(title)s</h1>
        <p class="paper-hero__authors">%(authors)s</p>
        <p class="paper-hero__venue">%(venue)s</p>
        <div class="btn-row">
            %(actions)s
        </div>
    </div>
</div>

<section class="section section--tight section--warm">
    <div class="wrap">
        <div class="paper-layout">
            <div>
%(blocks)s
            </div>
            <aside class="paper-side" aria-label="Publication metadata">
%(side)s
            </aside>
        </div>

        <nav class="btn-row" style="margin-top:2.5rem;padding-top:1.25rem;border-top:1px solid var(--line)"
             aria-label="Publication navigation">
            %(navlinks)s
        </nav>
    </div>
</section>
""" % {
        "ref": esc(pub["ref"]),
        "typelabel": esc(TYPE_LABEL[pub["type"]]),
        "status": status_chip,
        "metrics": metrics,
        "title": esc(pub["title"]),
        "authors": author_line(pub),
        "venue": venue_line(pub),
        "actions": "\n            ".join(actions),
        "blocks": "\n\n".join(blocks),
        "side": side,
        "navlinks": "\n        ".join(nav_links),
    }

    meta = {
        "title": "%s | Dr. Mehbub Alam" % pub["title"],
        "description": "%s — %s, %s. %s" % (
            pub["title"], pub["venue"], pub["year"],
            "Read the abstract, research highlights, presentation and citation details."),
        "keywords": ", ".join(pub.get("topics", []) + [a["name"] for a in pub["authors"]]),
        "output": "publications/%s.html" % pub["id"],
        "nav": "publications",
        "ogtype": "article",
    }
    return layout(meta, body, base="../", jsonld=scholarly_jsonld(pub), src="(publications template)")


# ---------------------------------------------------------------------------
# build
# ---------------------------------------------------------------------------

def stat_counts():
    journals = len([p for p in PUBS if p["type"] == "journal"])
    conferences = len([p for p in PUBS if p["type"] == "conference"])
    return {
        "count_journals": str(journals),
        "count_conferences": str(conferences),
        "count_publications": str(journals + conferences),
        "count_presentations": str(len([p for p in PUBS if p.get("presentation")])),
        "count_other": str(len([p for p in PUBS if p["type"] == "other"])),
    }


def build():
    written = []

    tokens = stat_counts()
    tokens["publications_all"] = publications_block(base="")
    tokens["publications_recent"] = recent_publications_block(4, base="")
    tokens["year"] = YEAR

    pages_dir = os.path.join(SRC, "pages")
    for filename in sorted(os.listdir(pages_dir)):
        if not filename.endswith(".html"):
            continue
        meta, body = parse_front(read(os.path.join(pages_dir, filename)))
        body = fill(body, tokens)
        jsonld = PERSON_JSONLD if meta.get("person") == "yes" else ""
        page = layout(meta, body, base="", jsonld=jsonld, src=filename)
        out = os.path.join(ROOT, meta["output"])
        write(out, page)
        written.append(meta["output"])

    for i, pub in enumerate(PUBS):
        prev_pub = PUBS[i - 1] if i > 0 else None
        next_pub = PUBS[i + 1] if i < len(PUBS) - 1 else None
        out = os.path.join(ROOT, "publications", pub["id"] + ".html")
        write(out, paper_page(pub, prev_pub, next_pub))
        written.append("publications/%s.html" % pub["id"])

    # sitemap ---------------------------------------------------------------
    today = date.today().isoformat()
    urls = []
    for item in SITE["nav"]:
        loc = SITE["origin"] + "/" + ("" if item["href"] == "index.html" else item["href"])
        pri = "1.0" if item["href"] == "index.html" else "0.8"
        urls.append((loc, pri))
    for pub in PUBS:
        urls.append((SITE["origin"] + "/publications/" + pub["id"] + ".html", "0.6"))
    urls.append((SITE["origin"] + "/insys.html", "0.5"))

    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, pri in urls:
        sitemap.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n"
                       "    <priority>%s</priority>\n  </url>" % (loc, today, pri))
    sitemap.append("</urlset>")
    write(os.path.join(ROOT, "sitemap.xml"), "\n".join(sitemap) + "\n")
    written.append("sitemap.xml")

    print("Built %d files:" % len(written))
    for w in written:
        print("  ", w)


if __name__ == "__main__":
    build()
