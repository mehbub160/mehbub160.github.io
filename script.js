/* ==========================================================================
   Dr. Mehbub Alam — Academic Portfolio
   Progressive-enhancement behaviours. Every feature below is optional:
   the pages are fully readable and navigable with JavaScript disabled.
   ========================================================================== */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function ready(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    /* ----------------------------------------------------------------------
       Mobile navigation
       ---------------------------------------------------------------------- */
    function initNav() {
        var toggle = $(".nav-toggle");
        var nav = $("#primary-nav");
        if (!toggle || !nav) return;

        function setOpen(open) {
            toggle.setAttribute("aria-expanded", String(open));
            nav.classList.toggle("is-open", open);
        }

        toggle.addEventListener("click", function () {
            setOpen(toggle.getAttribute("aria-expanded") !== "true");
        });

        nav.addEventListener("click", function (e) {
            if (e.target.closest("a")) setOpen(false);
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
                setOpen(false);
                toggle.focus();
            }
        });

        document.addEventListener("click", function (e) {
            if (toggle.getAttribute("aria-expanded") !== "true") return;
            if (nav.contains(e.target) || toggle.contains(e.target)) return;
            setOpen(false);
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 960) setOpen(false);
        });
    }

    /* ----------------------------------------------------------------------
       A single rAF-throttled scroll loop drives every scroll-linked effect,
       so no expensive work is attached directly to the scroll event.
       ---------------------------------------------------------------------- */
    var scrollJobs = [];
    var scrollTicking = false;

    function onScrollFrame() {
        for (var i = 0; i < scrollJobs.length; i++) scrollJobs[i]();
        scrollTicking = false;
    }

    function requestScrollFrame() {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(onScrollFrame);
    }

    function addScrollJob(fn) {
        scrollJobs.push(fn);
        fn();
    }

    window.addEventListener("scroll", requestScrollFrame, { passive: true });
    window.addEventListener("resize", requestScrollFrame, { passive: true });
    /* Background tabs pause requestAnimationFrame; re-sync as soon as we are shown. */
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) requestScrollFrame();
    });

    /* ----------------------------------------------------------------------
       Scroll reveal
       ---------------------------------------------------------------------- */
    function initReveal() {
        /* Timeline entries and publication cards animate individually so they
           arrive progressively rather than as one block. */
        $$(".timeline .tl-item").forEach(function (el) { el.classList.add("reveal"); });

        /* Content groups that were not tagged by hand still get a staggered
           entrance, so no block of the page arrives without any motion. */
        $$(".stats, .split-list, .pill-list, .logo-strip, .highlights, .meta-list," +
            " .aside-col, .contact-grid, .paper-side, .grid, .plain-list, .social")
            .forEach(function (el) {
                if (el.classList.contains("reveal") || el.classList.contains("reveal-stagger")) return;
                if (el.parentElement && el.parentElement.closest(".reveal, .reveal-stagger")) return;
                el.classList.add("reveal-stagger");
            });
        $$(".pub-list .pub").forEach(function (el, i) {
            el.classList.add("reveal");
            el.style.setProperty("--i", String(Math.min(i, 6)));
        });

        var targets = $$(".reveal, .reveal-stagger, .reveal-img");
        if (!targets.length) return;

        if (reduceMotion.matches || !("IntersectionObserver" in window)) {
            targets.forEach(function (el) { el.classList.add("is-in"); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-in");
                io.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

        targets.forEach(function (el) { io.observe(el); });

        /* Safety net: content must never stay invisible. Backgrounded tabs pause
           transitions and can delay observer callbacks, so re-check on load and
           whenever the page becomes visible again. */
        function revealVisible() {
            targets.forEach(function (el) {
                if (el.classList.contains("is-in")) return;
                var r = el.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) {
                    el.classList.add("is-in");
                    io.unobserve(el);
                }
            });
        }

        window.addEventListener("load", revealVisible);
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) revealVisible();
        });
    }

    /* ----------------------------------------------------------------------
       Timeline progress rail
       ---------------------------------------------------------------------- */
    function initTimelines() {
        var timelines = $$(".timeline");
        if (!timelines.length) return;

        timelines.forEach(function (tl) {
            var fill = document.createElement("span");
            fill.className = "timeline__fill";
            fill.setAttribute("aria-hidden", "true");
            tl.insertBefore(fill, tl.firstChild);
            tl._fill = fill;
        });

        function update() {
            var mid = window.innerHeight * 0.62;
            timelines.forEach(function (tl) {
                var r = tl.getBoundingClientRect();
                var span = Math.max(r.height - 16, 1);
                var pct = Math.min(Math.max((mid - r.top) / span, 0), 1);
                tl._fill.style.height = (pct * 100) + "%";

                $$(".tl-item", tl).forEach(function (item) {
                    var ir = item.getBoundingClientRect();
                    item.classList.toggle("is-active", ir.top < mid && ir.bottom > 0);
                });
            });
        }

        addScrollJob(update);
    }

    /* ----------------------------------------------------------------------
       Reading progress indicator
       ---------------------------------------------------------------------- */
    function initReadProgress() {
        var bar = $("[data-read-progress]");
        if (!bar) return;

        addScrollJob(function () {
            var doc = document.documentElement;
            var max = doc.scrollHeight - window.innerHeight;
            var p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
            bar.style.setProperty("--read", p.toFixed(4));
        });
    }

    /* ----------------------------------------------------------------------
       Interactive honeycomb surface
       ----------------------------------------------------------------------
       A tessellated grid of clip-path hexagons fills the viewport behind the
       content. The tile nearest the pointer lifts, darkens and tilts; its
       neighbours follow with a distance falloff, producing a soft local mound
       rather than one tile popping out. Everything is driven through CSS
       custom properties inside requestAnimationFrame, so pointer movement
       never triggers a layout recalculation.
       ---------------------------------------------------------------------- */
    function initHexSurface() {
        var surface = $("[data-hex-surface]");
        var grid = $("[data-hex-grid]");
        if (!surface || !grid) return;

        var coarse = window.matchMedia("(pointer: coarse)");
        var tiles = [];            /* flat list, row-major */
        var live = [];             /* tiles currently lifted or easing back */
        var cols = 0, rows = 0;
        var tileW = 0, tileH = 0, rowStep = 0;
        var px = -9999, py = -9999;
        var pointerOn = false;
        var touchTimer = null;
        var rebuildTimer = null;
        var shift = 0;
        var animating = false;

        var RADIUS_FACTOR = 2.0;   /* bulge radius = two tile widths, i.e. two rings */
        var FALLOFF = 1.15;        /* fitted so ring 1 ~44% and ring 2 ~10% */
        var VIS_FACTOR = 4.6;      /* the pattern itself fades out over this radius */
        var VIS_FALLOFF = 1.6;
        var MAX_LIFT = 9;          /* px */
        var REST_SCALE = 0.984;
        var MAX_SCALE = 1.052;
        var MAX_TILT = 1.6;        /* deg */
        var EASE = 0.16;           /* per-frame approach — settles in ~450ms */

        function tileWidth() {
            var w = window.innerWidth;
            if (w <= 560) return 54;
            if (w <= 900) return 66;
            return 78;
        }

        function build() {
            grid.textContent = "";
            tiles = [];
            live = [];

            tileW = tileWidth();
            tileH = tileW * 1.15470054;   /* pointy-top hexagon, 2/sqrt(3) */
            rowStep = tileH * 0.75;       /* rows interlock by a quarter height */

            grid.style.setProperty("--w", tileW + "px");
            grid.style.setProperty("--h", tileH + "px");

            /* Overflow on every side so parallax never exposes an edge. */
            cols = Math.ceil(window.innerWidth / tileW) + 2;
            rows = Math.ceil(window.innerHeight / rowStep) + 4;

            var frag = document.createDocumentFragment();
            var idleEvery = reduceMotion.matches ? 0 : 11;

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    var x = c * tileW - tileW / 2 + (r % 2 ? tileW / 2 : 0);
                    var y = r * rowStep - tileH / 2 - rowStep;

                    var el = document.createElement("span");
                    el.className = "hex-tile";
                    el.style.left = x + "px";
                    el.style.top = y + "px";

                    var index = r * cols + c;
                    if (idleEvery && index % idleEvery === 3) {
                        el.classList.add("is-idle");
                        el.style.setProperty("--idur", (11 + (index % 5)) + "s");
                        el.style.setProperty("--idelay", "-" + (index % 9) + "s");
                    }

                    frag.appendChild(el);
                    tiles.push({
                        el: el,
                        cx: x + tileW / 2,
                        cy: y + tileH / 2,
                        t: 0,
                        target: 0,
                        near: 0,
                        nearTarget: 0,
                        written: -1,
                        tiltX: 0,
                        tiltY: 0,
                        lifted: false
                    });
                }
            }

            grid.appendChild(frag);
        }

        function writeTile(tile) {
            var el = tile.el;
            var t = tile.t;

            /* Visibility is quantised so a slow-moving pointer does not rewrite
               every nearby tile on every single frame. */
            var q = Math.round(tile.near * 100) / 100;
            if (q !== tile.written) {
                tile.written = q;
                if (q <= 0) el.style.removeProperty("--near");
                else el.style.setProperty("--near", String(q));
            }

            if (t < 0.004) {
                el.style.removeProperty("--lift");
                el.style.removeProperty("--scale");
                el.style.removeProperty("--shade");
                el.style.removeProperty("--tilt-x");
                el.style.removeProperty("--tilt-y");
                if (tile.lifted) { el.classList.remove("is-lifted"); tile.lifted = false; }
                return;
            }

            el.style.setProperty("--lift", (-MAX_LIFT * t).toFixed(2) + "px");
            el.style.setProperty("--scale", (REST_SCALE + (MAX_SCALE - REST_SCALE) * t).toFixed(4));
            el.style.setProperty("--shade", t.toFixed(3));
            el.style.setProperty("--tilt-x", (tile.tiltX * t).toFixed(2) + "deg");
            el.style.setProperty("--tilt-y", (tile.tiltY * t).toFixed(2) + "deg");

            if (!tile.lifted && t > 0.02) { el.classList.add("is-lifted"); tile.lifted = true; }
        }

        function step() {
            var bulgeR = tileW * RADIUS_FACTOR;
            var visR = tileW * VIS_FACTOR;
            var touched = null;

            if (pointerOn) {
                /* Only the grid cells that can fall inside the visibility radius
                   are examined — never the whole grid. */
                var localY = py - shift;
                var r0 = Math.max(0, Math.floor((localY - visR) / rowStep) - 1);
                var r1 = Math.min(rows - 1, Math.ceil((localY + visR) / rowStep) + 1);
                var c0 = Math.max(0, Math.floor((px - visR) / tileW) - 1);
                var c1 = Math.min(cols - 1, Math.ceil((px + visR) / tileW) + 1);

                touched = [];
                for (var r = r0; r <= r1; r++) {
                    for (var c = c0; c <= c1; c++) {
                        var tile = tiles[r * cols + c];
                        if (!tile) continue;
                        var dx = px - tile.cx;
                        var dy = localY - tile.cy;
                        var d = Math.sqrt(dx * dx + dy * dy);
                        if (d > visR) continue;

                        /* Outer falloff: how visible the tile is at all. */
                        tile.nearTarget = Math.pow(1 - d / visR, VIS_FALLOFF);

                        /* Inner falloff, fitted to the hexagonal spacing: the tile
                           under the pointer gets the full lift, its six immediate
                           neighbours (one tile width away) about 44%, and the next
                           ring (~1.73 widths) about 10%. */
                        tile.target = d > bulgeR ? 0 : Math.pow(1 - d / bulgeR, FALLOFF);
                        tile.tiltX = (dy / bulgeR) * MAX_TILT;
                        tile.tiltY = -(dx / bulgeR) * MAX_TILT;

                        touched.push(tile);
                        if (live.indexOf(tile) === -1) live.push(tile);
                    }
                }
            }

            for (var i = live.length - 1; i >= 0; i--) {
                var lt = live[i];
                if (!touched || touched.indexOf(lt) === -1) {
                    lt.target = 0;
                    lt.nearTarget = 0;
                }
                lt.t += (lt.target - lt.t) * EASE;
                lt.near += (lt.nearTarget - lt.near) * EASE;
                if (lt.nearTarget === 0 && lt.t < 0.004 && lt.near < 0.006) {
                    lt.t = 0;
                    lt.near = 0;
                    writeTile(lt);
                    live.splice(i, 1);
                    continue;
                }
                writeTile(lt);
            }

            if (live.length || pointerOn) window.requestAnimationFrame(step);
            else animating = false;
        }

        function kick() {
            if (animating) return;
            animating = true;
            window.requestAnimationFrame(step);
        }

        function onPointerMove(e) {
            if (e.pointerType === "touch") return;
            px = e.clientX;
            py = e.clientY;
            pointerOn = true;
            kick();
        }

        function onPointerLeave() {
            pointerOn = false;
            kick();
        }

        /* Touch: a brief lift where the finger lands, then it settles back. */
        function onPointerDown(e) {
            if (e.pointerType !== "touch") return;
            px = e.clientX;
            py = e.clientY;
            pointerOn = true;
            kick();
            window.clearTimeout(touchTimer);
            touchTimer = window.setTimeout(function () {
                pointerOn = false;
                kick();
            }, 550);
        }

        build();

        if (!reduceMotion.matches) {
            /* Gentle vertical parallax, capped so the pattern never drifts far. */
            addScrollJob(function () {
                var next = -((window.scrollY * 0.055) % 44) + 22;
                if (Math.abs(next - shift) < 0.3) return;
                shift = next;
                grid.style.setProperty("--surface-shift", shift.toFixed(1) + "px");
            });

            if (!coarse.matches) {
                document.addEventListener("pointermove", onPointerMove, { passive: true });
                document.addEventListener("pointerleave", onPointerLeave, { passive: true });
                document.addEventListener("pointercancel", onPointerLeave, { passive: true });
            }
            document.addEventListener("pointerdown", onPointerDown, { passive: true });
        }

        window.addEventListener("resize", function () {
            window.clearTimeout(rebuildTimer);
            rebuildTimer = window.setTimeout(function () {
                pointerOn = false;
                build();
            }, 200);
        });
    }

    /* ----------------------------------------------------------------------
       Counters
       ---------------------------------------------------------------------- */
    function initCounters() {
        var nums = $$("[data-count-to]");
        if (!nums.length) return;

        function paint(el, value) {
            el.textContent = value + (el.getAttribute("data-count-suffix") || "");
        }

        function run(el) {
            var target = parseFloat(el.getAttribute("data-count-to")) || 0;
            if (reduceMotion.matches) { paint(el, target); return; }
            var start = null;
            var dur = 1100;
            function step(ts) {
                if (start === null) start = ts;
                var p = Math.min((ts - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                paint(el, Math.round(target * eased));
                if (p < 1) window.requestAnimationFrame(step);
            }
            window.requestAnimationFrame(step);
        }

        if (!("IntersectionObserver" in window)) {
            nums.forEach(function (el) { paint(el, parseFloat(el.getAttribute("data-count-to")) || 0); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                run(entry.target);
                io.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        nums.forEach(function (el) { io.observe(el); });
    }

    /* ----------------------------------------------------------------------
       Back to top
       ---------------------------------------------------------------------- */
    function initBackToTop() {
        var btn = $(".to-top");
        if (!btn) return;

        function update() {
            btn.classList.toggle("is-visible", window.scrollY > 520);
        }

        btn.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: reduceMotion.matches ? "auto" : "smooth"
            });
            var first = $("a.skip-link") || document.body;
            if (first.focus) first.focus({ preventScroll: true });
        });

        addScrollJob(update);
    }

    /* ----------------------------------------------------------------------
       In-page section navigation (scroll spy)
       ---------------------------------------------------------------------- */
    function initScrollSpy() {
        var rail = $("[data-spy]");
        if (!rail) return;

        var links = $$("a[href^='#']", rail);
        if (!links.length) return;

        var sections = links.map(function (a) {
            return document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
        });

        function update() {
            var probe = window.scrollY + (window.innerHeight * 0.28);
            var activeIndex = 0;
            sections.forEach(function (sec, i) {
                if (sec && sec.offsetTop <= probe) activeIndex = i;
            });
            links.forEach(function (a, i) {
                if (i === activeIndex) a.setAttribute("aria-current", "true");
                else a.removeAttribute("aria-current");
            });
        }

        addScrollJob(update);
    }

    /* ----------------------------------------------------------------------
       News carousel
       ---------------------------------------------------------------------- */
    function initNews() {
        var root = $("[data-news]");
        if (!root) return;

        var track = $(".news__track", root);
        var items = $$(".news__item", root);
        var prev = $("[data-news-prev]", root);
        var next = $("[data-news-next]", root);
        var status = $(".news__status", root);
        if (!track || items.length < 2) return;

        var index = 0;

        function render() {
            track.style.transform = "translateX(" + (-index * 100) + "%)";
            items.forEach(function (item, i) {
                item.setAttribute("aria-hidden", String(i !== index));
                $$("a, button", item).forEach(function (el) {
                    if (i !== index) el.setAttribute("tabindex", "-1");
                    else el.removeAttribute("tabindex");
                });
            });
            if (prev) prev.disabled = index === 0;
            if (next) next.disabled = index === items.length - 1;
            if (status) status.textContent = (index + 1) + " / " + items.length;
        }

        function go(delta) {
            index = Math.min(Math.max(index + delta, 0), items.length - 1);
            render();
        }

        if (prev) prev.addEventListener("click", function () { go(-1); });
        if (next) next.addEventListener("click", function () { go(1); });

        root.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft") { go(-1); }
            else if (e.key === "ArrowRight") { go(1); }
        });

        render();
    }

    /* ----------------------------------------------------------------------
       Slide viewer (presentation decks)
       ---------------------------------------------------------------------- */
    function initSlides() {
        $$("[data-slides]").forEach(function (root) {
            var slides = $$(".slides__slide", root);
            if (slides.length < 2) return;

            var prev = $("[data-slide-prev]", root);
            var next = $("[data-slide-next]", root);
            var dots = $(".slides__dots", root);
            var status = $(".slides__status", root);
            var index = 0;

            var dotButtons = [];
            if (dots) {
                slides.forEach(function (_, i) {
                    var b = document.createElement("button");
                    b.type = "button";
                    b.className = "slides__dot";
                    b.setAttribute("aria-label", "Show slide " + (i + 1));
                    b.addEventListener("click", function () { show(i); });
                    dots.appendChild(b);
                    dotButtons.push(b);
                });
            }

            function show(i) {
                index = Math.min(Math.max(i, 0), slides.length - 1);
                slides.forEach(function (s, n) {
                    s.classList.toggle("is-current", n === index);
                    var img = s.querySelector("img");
                    /* Warm the next slide so navigation feels instant. */
                    if (img && n === index + 1) img.setAttribute("loading", "eager");
                });
                dotButtons.forEach(function (b, n) {
                    if (n === index) b.setAttribute("aria-current", "true");
                    else b.removeAttribute("aria-current");
                });
                if (prev) prev.disabled = index === 0;
                if (next) next.disabled = index === slides.length - 1;
                if (status) status.textContent = (index + 1) + " / " + slides.length;
            }

            if (prev) prev.addEventListener("click", function () { show(index - 1); });
            if (next) next.addEventListener("click", function () { show(index + 1); });

            root.addEventListener("keydown", function (e) {
                if (e.key === "ArrowLeft") { show(index - 1); }
                else if (e.key === "ArrowRight") { show(index + 1); }
            });

            show(0);
        });
    }

    /* ----------------------------------------------------------------------
       Publication filters
       ---------------------------------------------------------------------- */
    function initFilters() {
        var toolbar = $("[data-pub-filter]");
        if (!toolbar) return;

        var buttons = $$(".filter-btn", toolbar);
        var counter = $(".pub-count");
        var items = $$("[data-pub-type]");
        var groups = $$(".pub-group");

        function apply(type) {
            var shown = 0;
            items.forEach(function (item) {
                var match = type === "all" || item.getAttribute("data-pub-type") === type;
                item.hidden = !match;
                if (match) shown++;
            });
            groups.forEach(function (group) {
                var any = $$("[data-pub-type]", group).some(function (i) { return !i.hidden; });
                group.hidden = !any;
            });
            buttons.forEach(function (b) {
                b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === type));
            });
            if (counter) {
                counter.textContent = shown + (shown === 1 ? " entry shown" : " entries shown");
            }
        }

        buttons.forEach(function (b) {
            b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); });
        });

        apply("all");
    }

    /* ----------------------------------------------------------------------
       Copy-to-clipboard (citations)
       ---------------------------------------------------------------------- */
    function initCopy() {
        $$("[data-copy]").forEach(function (btn) {
            var label = btn.querySelector("[data-copy-label]") || btn;
            var original = label.textContent;

            btn.addEventListener("click", function () {
                var target = document.getElementById(btn.getAttribute("data-copy"));
                if (!target) return;
                var text = target.textContent.trim();

                function done(ok) {
                    label.textContent = ok ? "Copied" : "Press Ctrl/Cmd + C";
                    window.setTimeout(function () { label.textContent = original; }, 2200);
                }

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
                } else {
                    var sel = window.getSelection();
                    var range = document.createRange();
                    range.selectNodeContents(target);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    done(false);
                }
            });
        });
    }

    /* ----------------------------------------------------------------------
       Custom cursor — desktop, fine pointer, motion allowed only
       ---------------------------------------------------------------------- */
    function initCursor() {
        var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        var wide = window.matchMedia("(min-width: 1024px)");
        var ring = null, dot = null, raf = null, bound = false;
        var mx = -100, my = -100, rx = -100, ry = -100;

        var HOT = "a, button, [role='button'], summary, input, textarea, select, label," +
            " .pub, .card--hover, .logo-tile, .slide-preview, .feed-item";

        function move(e) {
            mx = e.clientX;
            my = e.clientY;
            if (dot) dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
        }

        function loop() {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
            raf = window.requestAnimationFrame(loop);
        }

        function over(e) {
            if (!ring) return;
            var hot = e.target.closest && e.target.closest(HOT);
            ring.classList.toggle("is-hot", !!hot);
            if (dot) dot.classList.toggle("is-hot", !!hot);
        }

        function down() { if (ring) ring.classList.add("is-down"); }
        function up() { if (ring) ring.classList.remove("is-down"); }
        function leave() { if (ring) ring.style.opacity = "0"; if (dot) dot.style.opacity = "0"; }
        function enter() { if (ring) ring.style.opacity = ""; if (dot) dot.style.opacity = ""; }

        function enable() {
            if (bound) return;
            bound = true;
            ring = document.createElement("div");
            ring.className = "cursor-ring";
            ring.setAttribute("aria-hidden", "true");
            dot = document.createElement("div");
            dot.className = "cursor-dot";
            dot.setAttribute("aria-hidden", "true");
            document.body.appendChild(ring);
            document.body.appendChild(dot);
            document.documentElement.classList.add("has-cursor");

            document.addEventListener("pointermove", move, { passive: true });
            document.addEventListener("pointerover", over, { passive: true });
            document.addEventListener("pointerdown", down, { passive: true });
            document.addEventListener("pointerup", up, { passive: true });
            document.addEventListener("mouseleave", leave);
            document.addEventListener("mouseenter", enter);
            raf = window.requestAnimationFrame(loop);
        }

        function disable() {
            if (!bound) return;
            bound = false;
            document.removeEventListener("pointermove", move);
            document.removeEventListener("pointerover", over);
            document.removeEventListener("pointerdown", down);
            document.removeEventListener("pointerup", up);
            document.removeEventListener("mouseleave", leave);
            document.removeEventListener("mouseenter", enter);
            if (raf) window.cancelAnimationFrame(raf);
            document.documentElement.classList.remove("has-cursor");
            if (ring) ring.remove();
            if (dot) dot.remove();
            ring = dot = null;
        }

        function sync() {
            if (fine.matches && wide.matches && !reduceMotion.matches) enable();
            else disable();
        }

        function listen(mq) {
            if (mq.addEventListener) mq.addEventListener("change", sync);
            else if (mq.addListener) mq.addListener(sync);
        }

        listen(fine); listen(wide); listen(reduceMotion);
        sync();
    }

    /* ----------------------------------------------------------------------
       Contact form (Discord webhook, same endpoint as before)
       ---------------------------------------------------------------------- */
    function initContactForm() {
        var form = $("#contact-form");
        if (!form) return;

        var status = $(".form-status", form);
        var endpoint = form.getAttribute("data-endpoint");
        var submit = form.querySelector("button[type='submit']");

        form.addEventListener("submit", function (e) {
            if (!endpoint) return; /* let the browser handle it natively */
            e.preventDefault();

            var data = new FormData(form);
            var name = (data.get("name") || "").toString().trim();
            var email = (data.get("email") || "").toString().trim();
            var subject = (data.get("subject") || "").toString().trim();
            var message = (data.get("message") || "").toString().trim();

            if (!name || !email || !message) {
                status.dataset.state = "error";
                status.textContent = "Please fill in your name, email and message.";
                return;
            }

            status.dataset.state = "";
            status.textContent = "Sending…";
            if (submit) submit.disabled = true;

            fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: "**New message from mehbubalam.com**",
                    embeds: [{
                        title: subject || "Website contact form",
                        color: 1521997,
                        fields: [
                            { name: "Name", value: name.slice(0, 256) },
                            { name: "Email", value: email.slice(0, 256) },
                            { name: "Message", value: message.slice(0, 1000) }
                        ]
                    }]
                })
            }).then(function (res) {
                if (!res.ok) throw new Error("Request failed");
                status.dataset.state = "ok";
                status.textContent = "Thank you — your message has been sent.";
                form.reset();
            }).catch(function () {
                status.dataset.state = "error";
                status.textContent = "Sorry, the message could not be sent. Please email mehbub@iiitr.ac.in directly.";
            }).finally(function () {
                if (submit) submit.disabled = false;
            });
        });
    }

    /* ---------------------------------------------------------------------- */
    ready(function () {
        initNav();
        initReveal();
        initTimelines();
        initCounters();
        initBackToTop();
        initScrollSpy();
        initReadProgress();
        initHexSurface();
        initNews();
        initSlides();
        initFilters();
        initCopy();
        initCursor();
        initContactForm();
    });
})();
