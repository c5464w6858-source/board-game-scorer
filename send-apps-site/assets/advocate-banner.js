/*
 * IncludeMe Finder: "EHCP deadline calculator" banner
 * Drop-in, no dependencies. Add once, e.g. <script src="./advocate-banner.js" defer></script>.
 *
 * - A small dismissible card near the bottom of the screen, above any bottom navigation.
 * - Not shown on sign-in screens (any visible password box), and not shown again for 90 days once dismissed
 *   or once the link has been followed.
 * - Stores one value in localStorage (the dismissal date). No tracking, no network requests.
 * - Keyboard and screen reader friendly; honours reduced motion.
 */
(function () {
  "use strict";
  var LINK = "https://info.includeme.uk/ehcp-deadline-calculator/";
  var KEY = "includeme.advocateBanner.v1";
  var HIDE_DAYS = 90;
  var SHOW_AFTER_MS = 4000;      // let the app load and settle first
  var BOTTOM_NAV_CLEARANCE = 76; // px, so it sits above a bottom tab bar

  function remembered() {
    try { var t = Number(localStorage.getItem(KEY)); return t && Date.now() - t < HIDE_DAYS * 864e5; } catch (e) { return false; }
  }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }

  function onSignIn() {
    var boxes = document.querySelectorAll('input[type="password"]');
    for (var i = 0; i < boxes.length; i++) if (boxes[i].offsetParent !== null) return true;
    return false;
  }

  var el = null;
  function build() {
    var css = document.createElement("style");
    css.textContent =
      ".ehcp-b{position:fixed;left:12px;right:12px;bottom:calc(" + BOTTOM_NAV_CLEARANCE + "px + env(safe-area-inset-bottom));z-index:2147483000;max-width:460px;margin:0 auto;" +
      "background:#17214D;color:#F4F2EC;border-radius:16px;border-top:3px solid #E3B94E;box-shadow:0 12px 34px rgba(23,33,77,.35);padding:14px 16px;" +
      "font:500 14px/1.45 'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;transform:translateY(24px);opacity:0;transition:transform .35s ease,opacity .35s ease}" +
      ".ehcp-b.on{transform:none;opacity:1}" +
      ".ehcp-b b{display:block;font-size:15px;color:#fff;margin:0 28px 2px 0}" +
      ".ehcp-b p{margin:0 0 10px;color:#D8DBE8}" +
      ".ehcp-b .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}" +
      ".ehcp-b a.go{display:inline-flex;align-items:center;background:#E3B94E;color:#17214D;font-weight:700;text-decoration:none;border-radius:999px;padding:10px 16px;min-height:40px}" +
      ".ehcp-b button.no{display:inline-flex;align-items:center;background:none;border:0;color:#D8DBE8;font:inherit;text-decoration:underline;padding:10px 6px;min-height:40px;cursor:pointer}" +
      ".ehcp-b button.x{position:absolute;top:6px;right:6px;width:40px;height:40px;border:0;border-radius:50%;background:none;color:#D8DBE8;font-size:22px;line-height:1;cursor:pointer}" +
      ".ehcp-b a:focus-visible,.ehcp-b button:focus-visible{outline:3px solid #fff;outline-offset:2px}" +
      "@media (prefers-reduced-motion:reduce){.ehcp-b{transition:none;transform:none}}" +
      "@media print{.ehcp-b{display:none}}";
    document.head.appendChild(css);

    el = document.createElement("section");
    el.className = "ehcp-b";
    el.setAttribute("aria-label", "Free EHCP tool");
    el.innerHTML =
      '<b>Going through an EHCP?</b>' +
      '<p>Our free deadline calculator shows the 6, 16 and 20 week dates, with no sign-up.</p>' +
      '<div class="row"><a class="go" href="' + LINK + '" target="_blank" rel="noopener">Open the calculator</a>' +
      '<button type="button" class="no">Not now</button></div>' +
      '<button type="button" class="x" aria-label="Close this message">&times;</button>';
    el.querySelector(".go").addEventListener("click", function () { remember(); hide(); });
    el.querySelector(".no").addEventListener("click", function () { remember(); hide(); });
    el.querySelector(".x").addEventListener("click", function () { remember(); hide(); });
    el.addEventListener("keydown", function (e) { if (e.key === "Escape") { remember(); hide(); } });
    document.body.appendChild(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("on"); }); });
  }
  function hide() { if (el) { el.remove(); el = null; } }

  function maybeShow(force) {
    if (el) return;
    if (!force && (remembered() || onSignIn())) return;
    build();
  }

  // Re-check as the app changes screen (single page app): show once a non sign-in screen is up
  function start() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (el || remembered() || tries > 40) { clearInterval(timer); return; }
      if (!onSignIn()) { clearInterval(timer); maybeShow(false); }
    }, 1500);
  }

  window.__ehcpBanner = { show: function () { maybeShow(true); }, hide: hide, reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(start, SHOW_AFTER_MS); });
  else setTimeout(start, SHOW_AFTER_MS);
})();
