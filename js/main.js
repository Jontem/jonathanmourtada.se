(function () {
  "use strict";

  var RACES = window.RACES || [];
  var HALF_KM = 21.0975;

  /* ---------- Hjälpfunktioner ---------- */

  function toSeconds(t) {
    return t.split(":").reduce(function (acc, part) { return acc * 60 + Number(part); }, 0);
  }

  function formatTime(sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var ss = (s < 10 ? "0" : "") + s;
    if (h > 0) return h + ":" + (m < 10 ? "0" : "") + m + ":" + ss;
    return m + ":" + ss;
  }

  function realKm(km) {
    if (km === 21.1) return HALF_KM;
    return km;
  }

  function year(r) { return Number(r.date.slice(0, 4)); }

  function best(list) {
    return list.reduce(function (a, b) { return toSeconds(b.time) < toSeconds(a.time) ? b : a; });
  }

  /* ---------- Personbästa ---------- */

  var PB_DEFS = [
    { label: "Milen", test: function (r) { return r.km === 10; } },
    { label: "Halvmaraton", test: function (r) { return r.km === 21.1; } },
    { label: "Lidingöloppet 30 km", test: function (r) { return /lidingö/i.test(r.name); } }
  ];

  function renderPbs() {
    var el = document.getElementById("pbs");
    if (!el) return;
    var html = "";
    PB_DEFS.forEach(function (def) {
      var list = RACES.filter(def.test);
      if (!list.length) return;
      var b = best(list);
      html += '<div class="pb"><dt>' + def.label + "</dt>" +
        '<dd class="pb-time">' + formatTime(toSeconds(b.time)) + "</dd>" +
        '<dd class="pb-race">' + b.name + " " + year(b) + "</dd></div>";
    });
    el.innerHTML = html;
  }

  /* ---------- Graf ---------- */

  // Snabbaste lopp per år för en distans
  function bestPerYear(km) {
    var byYear = {};
    RACES.filter(function (r) { return r.km === km; }).forEach(function (r) {
      var y = year(r);
      if (!byYear[y] || toSeconds(r.time) < toSeconds(byYear[y].time)) byYear[y] = r;
    });
    return Object.keys(byYear).sort().map(function (y) {
      var r = byYear[y];
      var sec = toSeconds(r.time);
      return { year: Number(y), sec: sec, pace: sec / realKm(km), race: r };
    });
  }

  function buildSeries() {
    return [
      { key: "s10", points: bestPerYear(10), labelAbove: true },
      { key: "s21", points: bestPerYear(21.1), labelAbove: false }
    ];
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  function svgEl(name, attrs, parent) {
    var el = document.createElementNS(SVG_NS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  function formatPace(p) {
    var m = Math.floor(p / 60), s = Math.round(p % 60);
    if (s === 60) { m += 1; s = 0; }
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  var chartAnimated = false;

  function renderChart() {
    var box = document.getElementById("chart");
    if (!box) return;
    var series = buildSeries();
    var all = [];
    series.forEach(function (s) { all = all.concat(s.points); });
    if (!all.length) return;

    var width = Math.max(box.clientWidth, 300);
    var narrow = width < 560;
    var height = Math.round(Math.min(460, Math.max(300, width * 0.5)));
    var m = { top: 34, right: narrow ? 30 : 48, bottom: 40, left: narrow ? 44 : 56 };
    var w = width - m.left - m.right;
    var h = height - m.top - m.bottom;

    var years = all.map(function (p) { return p.year; });
    var y0 = Math.min.apply(null, years), y1 = Math.max.apply(null, years);
    var paces = all.map(function (p) { return p.pace; });
    var step = 30;
    var pMin = Math.floor((Math.min.apply(null, paces) - 8) / step) * step;
    var pMax = Math.ceil((Math.max.apply(null, paces) + 8) / step) * step;

    function x(yr) { return m.left + (y1 === y0 ? w / 2 : (yr - y0) / (y1 - y0) * w); }
    function y(p) { return m.top + (p - pMin) / (pMax - pMin) * h; }

    var svg = svgEl("svg", { viewBox: "0 0 " + width + " " + height, width: width, height: height, "aria-hidden": "true" });

    // Rutnät och tempoaxel
    var grid = svgEl("g", { "class": "grid" }, svg);
    var axis = svgEl("g", { "class": "axis" }, svg);
    for (var p = pMin; p <= pMax; p += step) {
      svgEl("line", { x1: m.left, x2: width - m.right + 10, y1: y(p), y2: y(p) }, grid);
      var t = svgEl("text", { x: m.left - 10, y: y(p) + 4, "text-anchor": "end" }, axis);
      t.textContent = formatPace(p);
    }
    var unit = svgEl("text", { x: 4, y: m.top - 16, "text-anchor": "start" }, axis);
    unit.textContent = "min/km";

    // År
    var yearG = svgEl("g", { "class": "year" }, svg);
    for (var yr = y0; yr <= y1; yr++) {
      var yt = svgEl("text", { x: x(yr), y: height - 14, "text-anchor": "middle" }, yearG);
      yt.textContent = narrow ? "’" + String(yr).slice(2) : yr;
    }

    // Linjer och punkter
    series.forEach(function (s) {
      var pts = s.points;
      if (!pts.length) return;
      var g = svgEl("g", { "class": "series " + s.key }, svg);
      if (pts.length > 1) {
        var d = pts.map(function (pt, i) { return (i ? "L" : "M") + x(pt.year) + "," + y(pt.pace); }).join("");
        svgEl("path", { "class": "line", d: d }, g);
      }

      var bestPt = pts.reduce(function (a2, b2) { return b2.pace < a2.pace ? b2 : a2; }, pts[0]);
      var lastIdx = pts.length - 1;

      pts.forEach(function (pt, i) {
        var cx = x(pt.year), cy = y(pt.pace);
        var isBest = pt === bestPt;
        if (isBest) svgEl("circle", { "class": "pb-ring", cx: cx, cy: cy, r: 9 }, g);
        svgEl("circle", { cx: cx, cy: cy, r: 4.5 }, g);

        // På smal skärm: bara första, bästa och sista (om sista inte krockar med bästa)
        var bestIdx = pts.indexOf(bestPt);
        var showLabel = !narrow || i === 0 || isBest || (i === lastIdx && lastIdx - bestIdx > 1);
        if (!showLabel) return;
        var anchor = i === 0 ? "start" : (i === lastIdx ? "end" : "middle");
        if (narrow && i === 0) anchor = "start";
        var dx = anchor === "start" ? -4 : (anchor === "end" ? 4 : 0);
        var ly = s.labelAbove ? cy - 14 : cy + 24;
        var lbl = svgEl("text", {
          "class": "label halo" + (isBest ? " label-strong" : ""),
          x: cx + dx, y: ly, "text-anchor": anchor
        }, g);
        lbl.textContent = formatTime(pt.sec);
      });
    });

    box.innerHTML = "";
    box.appendChild(svg);

    // Rita linjen en gång när grafen syns
    if (!chartAnimated && "IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var rect = box.getBoundingClientRect();
      var alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!alreadyVisible) {
        svg.querySelectorAll("path.line").forEach(function (path) {
          path.style.setProperty("--len", Math.ceil(path.getTotalLength()));
        });
        var io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            box.classList.add("drawing");
            io.disconnect();
          }
        }, { threshold: 0.35 });
        io.observe(box);
      }
    }
    chartAnimated = true;
  }

  /* ---------- Meny på mobil ---------- */

  function setupNav() {
    var btn = document.querySelector(".nav-toggle");
    var nav = document.getElementById("nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Stäng" : "Meny";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Meny";
      }
    });
  }

  /* ---------- Formulär ---------- */

  function setupForm() {
    var form = document.getElementById("apply-form");
    var status = document.getElementById("form-status");
    if (!form || !status) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";

      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      status.textContent = "Skickar ansökan …";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.className = "form-status ok";
        status.textContent = "Tack! Ansökan är skickad. Jag hör av mig inom ett par dagar.";
      }).catch(function () {
        status.innerHTML = 'Ansökan kunde inte skickas. Kontrollera din uppkoppling och försök igen, eller skriv till mig på <a href="https://www.instagram.com/jontem/" target="_blank" rel="noopener">Instagram</a>.';
      }).then(function () {
        button.disabled = false;
      });
    });
  }

  /* ---------- Loopande videoklipp ---------- */

  // Spelar bara när klippet syns. Med "minska rörelse" visas stillbilden.
  function setupVideos() {
    var videos = document.querySelectorAll("video.loop-video");
    if (!videos.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    videos.forEach(function (v) {
      if (reduce) {
        v.removeAttribute("autoplay");
        v.pause();
        return;
      }
      if (!("IntersectionObserver" in window)) return;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } else {
            v.pause();
          }
        });
      }, { threshold: 0.25 }).observe(v);
    });
  }

  /* ---------- E-post ---------- */

  // Adressen sätts ihop här så att den inte står i klartext i HTML:en.
  function setupEmail() {
    document.querySelectorAll(".email").forEach(function (el) {
      var addr = el.dataset.user + "@" + el.dataset.domain;
      var a = document.createElement("a");
      a.href = "mailto:" + addr;
      a.textContent = addr;
      el.replaceWith(a);
    });
  }

  /* ---------- Start ---------- */

  renderPbs();
  renderChart();
  setupNav();
  setupForm();
  setupVideos();
  setupEmail();

  var resizeTimer, lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderChart, 150);
  });
})();
