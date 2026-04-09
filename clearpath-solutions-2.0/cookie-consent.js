/**
 * Cookie Consent — Clearpath Solutions
 * Injects a GDPR-compliant banner and gates Google Analytics on user choice.
 * Replace GA_MEASUREMENT_ID with the real ID when Analytics is set up.
 */

(function () {
  const STORAGE_KEY = 'clearpath_cookie_consent';

  /* ── Inject styles ─────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #cc-banner {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 10000;
      background: #162540;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 20px 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.35);
    }

    #cc-banner.cc-visible {
      transform: translateY(0);
    }

    #cc-banner.cc-hide {
      transform: translateY(100%);
    }

    .cc-text {
      flex: 1;
      min-width: 240px;
    }

    .cc-text strong {
      display: block;
      font-family: 'Bricolage Grotesque', 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #EEF2FF;
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }

    .cc-text p {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 300;
      color: #7A93B8;
      line-height: 1.6;
      margin: 0;
    }

    .cc-text a {
      color: #3EC9FF;
      text-decoration: none;
      border-bottom: 1px solid rgba(62,201,255,0.3);
      transition: border-color 0.2s;
    }

    .cc-text a:hover {
      border-color: #3EC9FF;
    }

    .cc-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
      align-items: center;
    }

    #cc-decline {
      padding: 10px 22px;
      background: none;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 4px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 400;
      color: #7A93B8;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
      white-space: nowrap;
    }

    #cc-decline:hover {
      border-color: rgba(255,255,255,0.35);
      color: #EEF2FF;
    }

    #cc-accept {
      padding: 10px 24px;
      background: #3EC9FF;
      border: 1px solid #3EC9FF;
      border-radius: 4px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #0E1B2E;
      cursor: pointer;
      transition: background 0.2s, opacity 0.2s;
      white-space: nowrap;
    }

    #cc-accept:hover {
      opacity: 0.88;
    }

    @media (max-width: 680px) {
      #cc-banner {
        padding: 20px 24px;
        flex-direction: column;
        align-items: flex-start;
      }

      .cc-actions {
        width: 100%;
      }

      #cc-decline, #cc-accept {
        flex: 1;
        text-align: center;
      }
    }
  `;
  document.head.appendChild(style);

  /* ── Grant analytics consent (Consent Mode v2) ──────────────────── */
  function loadAnalytics() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage:        'denied'
      });
    }
  }

  /* ── Banner logic ───────────────────────────────────────────────── */
  function hideBanner(banner) {
    banner.classList.add('cc-hide');
    banner.classList.remove('cc-visible');
    setTimeout(function () { banner.remove(); }, 420);
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'cc-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="cc-text">
        <strong>We use cookies</strong>
        <p>We use analytics cookies to understand how visitors use our site and improve your experience.
           Read our <a href="/privacy-policy.html">Privacy Policy</a> for details.</p>
      </div>
      <div class="cc-actions">
        <button id="cc-decline" type="button">Decline</button>
        <button id="cc-accept" type="button">Accept cookies</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Trigger slide-in on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('cc-visible');
      });
    });

    document.getElementById('cc-accept').addEventListener('click', function () {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      loadAnalytics();
      hideBanner(banner);
    });

    document.getElementById('cc-decline').addEventListener('click', function () {
      localStorage.setItem(STORAGE_KEY, 'declined');
      hideBanner(banner);
    });
  }

  /* ── Init ───────────────────────────────────────────────────────── */
  var stored = localStorage.getItem(STORAGE_KEY);

  if (stored === 'accepted') {
    loadAnalytics();
  } else if (!stored) {
    // Show banner after a short delay so the page has time to render
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(showBanner, 800);
      });
    } else {
      setTimeout(showBanner, 800);
    }
  }
  // If 'declined', do nothing — no banner, no analytics
})();
