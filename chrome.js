(() => {
  const rawPath = location.pathname.replace(/\/+$/, '') || '/';
  const page = rawPath === '/' ? '' : rawPath.split('/').pop().replace(/\.html$/i, '').toLowerCase();
  let menuBound = false;

  const navHtml = `
<nav class="nav" aria-label="Primary">
  <a class="brand" href="/"><img src="/assets/oryele-logo.png" alt="Oryele"></a>
  <div class="links">
    <a href="/platform" data-nav="platform">Platform</a>
    <a href="/solutions" data-nav="solutions">Solutions</a>
    <a href="/digital-workforce" data-nav="digital-workforce">Digital Workforce</a>
    <a href="/communications" data-nav="communications">Communications</a>
    <a href="/pricing" data-nav="pricing">Pricing</a>
    <a href="/trust" data-nav="trust">Trust</a>
    <a href="/resources" data-nav="resources">Resources</a>
    <a class="btn nav-login" href="https://app.oryele.com">Login</a>
    <a class="btn light nav-cta" href="/contact">Request Briefing</a>
  </div>
  <button class="menu" type="button" aria-label="Open menu">Menu</button>
</nav>
<div class="mobile" id="mobile-nav">
  <a href="/platform">Platform</a>
  <a href="/solutions">Solutions</a>
  <a href="/digital-workforce">Digital Workforce</a>
  <a href="/communications">Communications</a>
  <a href="/pricing">Pricing</a>
  <a href="/trust">Trust</a>
  <a href="/resources">Resources</a>
  <a href="/about">About</a>
  <a href="/contact">Request Briefing</a>
  <a href="https://app.oryele.com">Login</a>
</div>`;

  const footerHtml = `
<footer class="site-footer">
  <div class="footer-main">
    <div class="footer-company">
      <img src="/assets/oryele-icon-transparent.png" alt="Oryele">
      <div>
        <strong>Oryele LLC</strong>
        <p>1021 Broad St. #1129<br>Shrewsbury, NJ 07702<br>United States</p>
      </div>
    </div>
    <div class="footer-contact">
      <span class="footer-mail" aria-hidden="true">✉</span>
      <div>
        <strong>Sales Inquiries</strong>
        <a href="mailto:sales@oryele.com">sales@oryele.com</a>
      </div>
    </div>
    <div class="footer-contact">
      <span class="footer-mail" aria-hidden="true">✉</span>
      <div>
        <strong>General Inquiries</strong>
        <a href="mailto:info@oryele.com">info@oryele.com</a>
      </div>
    </div>
    <div class="footer-copyright">
      <div class="footer-social">
        <a href="https://www.linkedin.com/company/oryele" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>
        <a href="https://www.youtube.com/@oryele" target="_blank" rel="noopener" aria-label="YouTube">▶</a>
      </div>
      © 2026 Oryele LLC.<br>All rights reserved.
    </div>
  </div>
  <div class="footer-legal">
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms &amp; Conditions</a>
    <a href="/sms-consent">SMS Policy</a>
    <a href="/cookies">Cookie Policy</a>
    <a href="/contact">Contact</a>
    <a href="/sitemap">Sitemap</a>
  </div>
</footer>`;

  function fill(selector, html) {
    const el = document.querySelector(selector);
    if (!el) return false;
    el.insertAdjacentHTML('afterend', html.trim());
    el.remove();
    return true;
  }

  function ensureBackground() {
    if (!document.querySelector('.bg-glow')) {
      const glow = document.createElement('div');
      glow.className = 'bg-glow';
      document.body.prepend(glow);
    }
    if (!document.getElementById('network')) {
      const canvas = document.createElement('canvas');
      canvas.id = 'network';
      const glow = document.querySelector('.bg-glow');
      if (glow) glow.after(canvas);
      else document.body.prepend(canvas);
    }
  }

  function markActive() {
    const resourcePages = new Set(['resources', 'blog']);
    document.querySelectorAll('.links [data-nav]').forEach((link) => {
      const target = (link.getAttribute('data-nav') || '').toLowerCase();
      const isHome = page === '';
      if (!isHome && (target === page || (target === 'resources' && resourcePages.has(page)))) {
        link.classList.add('is-active');
      }
    });
  }

  function bindMenu() {
    if (menuBound) return;
    const menu = document.querySelector('.menu');
    const mobile = document.querySelector('.mobile');
    if (!menu || !mobile) return;
    menu.addEventListener('click', () => {
      mobile.classList.toggle('open');
      menu.setAttribute('aria-expanded', mobile.classList.contains('open') ? 'true' : 'false');
    });
    menuBound = true;
  }

  function mount() {
    document.querySelectorAll('.mobile-nav, .mobile-menu, .cinema, .aurora').forEach((node) => node.remove());
    fill('[data-site-chrome="header"]', navHtml);
    fill('[data-site-chrome="footer"]', footerHtml);
    ensureBackground();
    markActive();
    bindMenu();
    ensureAgent();
  }

  function ensureAgent() {
    if (document.querySelector('script[data-oryele-agent]')) return;
    const s = document.createElement('script');
    s.src = '/agent.js';
    s.defer = true;
    s.dataset.oryeleAgent = '1';
    document.body.appendChild(s);
  }

  mount();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
