/* ============================================
   Intelligent LON Homepage v1
   i18n + Dynamic Rendering + Interactions
   ============================================ */

const DEFAULT_LANG = 'ko';

// v1: KO only. Change to ['ko', 'en', 'ja'] when translations are QA'd.
const SUPPORTED_LANGS = ['ko'];

// Site config — update these per deployment environment
const SITE_CONFIG = {
  loginUrl: 'https://www.intelligentlon.com/auth/login',
  contactEmail: 'contact@intelligentlon.com',
};

// --- i18n ---

function resolveKey(obj, key) {
  return key.split('.').reduce((o, k) => o?.[k], obj);
}

async function loadTranslations(lang) {
  try {
    const res = await fetch(`translations/${lang}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Failed to load ${lang}.json, falling back to ko`);
    if (lang !== 'ko') {
      const res = await fetch('translations/ko.json');
      return res.json();
    }
    return {};
  }
}

function applyTranslations(t) {
  // textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const value = resolveKey(t, el.getAttribute('data-i18n'));
    if (value) el.textContent = value;
  });
  // placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const value = resolveKey(t, el.getAttribute('data-i18n-placeholder'));
    if (value) el.placeholder = value;
  });
}

// --- Dynamic Section Rendering ---

const ICONS = {
  compare: '⚖️', delay: '⏱️', priority: '🎯',
  price: '📊', review: '💬', unified: '🔗', briefing: '📋'
};

function renderDynamic(t) {
  // Problem cards
  const problemGrid = document.getElementById('problem-cards');
  if (problemGrid && t.problem?.cards) {
    problemGrid.innerHTML = t.problem.cards.map(c => `
      <div class="problem__card">
        <div class="problem__card-icon">${ICONS[c.icon] || '📌'}</div>
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
      </div>
    `).join('');
  }

  // Solution steps
  const solutionFlow = document.getElementById('solution-steps');
  if (solutionFlow && t.solution?.steps) {
    solutionFlow.innerHTML = t.solution.steps.map((s, i) => `
      ${i > 0 ? '<span class="solution__arrow">→</span>' : ''}
      <div class="solution__step">
        <span class="solution__step-label">${s.label}</span>
        <p>${s.desc}</p>
      </div>
    `).join('');
  }

  // Feature cards
  const featGrid = document.getElementById('features-cards');
  if (featGrid && t.features?.cards) {
    featGrid.innerHTML = t.features.cards.map(c => `
      <div class="feature__card">
        <div class="feature__card-icon">${ICONS[c.icon] || '✦'}</div>
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
      </div>
    `).join('');
  }

  // Why AI points
  const whyList = document.getElementById('whyai-points');
  if (whyList && t.whyai?.points) {
    whyList.innerHTML = t.whyai.points.map(p => `<li>${p}</li>`).join('');
  }

  // Different cards
  const diffGrid = document.getElementById('different-cards');
  if (diffGrid && t.different?.points) {
    diffGrid.innerHTML = t.different.points.map(p => `
      <div class="diff__card">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
      </div>
    `).join('');
  }

  // Overlay points
  const overlayList = document.getElementById('overlay-points');
  if (overlayList && t.overlay?.points) {
    overlayList.innerHTML = t.overlay.points.map(p => `<li>${p}</li>`).join('');
  }

  // For Who items
  const forWhoList = document.getElementById('forwho-items');
  if (forWhoList && t.forwho?.items) {
    forWhoList.innerHTML = t.forwho.items.map(item => `<li>${item}</li>`).join('');
  }

  // Trust evidence
  const trustEvidence = document.getElementById('trust-evidence');
  if (trustEvidence && t.trust?.evidence) {
    trustEvidence.innerHTML = t.trust.evidence.map(e => `<li>✓ ${e}</li>`).join('');
  }

  // Trust report items
  const reportItems = document.getElementById('trust-report-items');
  if (reportItems && t.trust?.report_items) {
    reportItems.innerHTML = t.trust.report_items.map(r => `<li>${r}</li>`).join('');
  }
}

// --- Nav Scroll Effect ---

function setupNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// --- Login Links (configurable per deployment) ---

function setupLoginLinks() {
  document.querySelectorAll('a[href="/auth/login"]').forEach(el => {
    el.href = SITE_CONFIG.loginUrl;
  });
}

// --- Form Handler ---

function setupForm() {
  const form = document.getElementById('demo-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    // mailto-based demo request — opens user's email client
    const subject = encodeURIComponent(`[데모 요청] ${data.hotel || 'Hotel'}`);
    const body = encodeURIComponent(
      `담당자: ${data.name}\n호텔: ${data.hotel}\n이메일: ${data.email}\n연락처: ${data.phone || '-'}`
    );
    window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${subject}&body=${body}`;
  });
}

// --- Messaging CTA (show only if real URLs configured) ---

function setupMessaging() {
  const container = document.getElementById('messaging-cta');
  if (!container) return;

  // Configure real URLs here when ready
  const kakaoUrl = null; // e.g., 'https://open.kakao.com/o/...'
  const lineUrl = null;  // e.g., 'https://line.me/R/ti/p/...'

  const kakaoBtn = document.getElementById('kakao-btn');
  const lineBtn = document.getElementById('line-btn');

  if (kakaoUrl && kakaoBtn) { kakaoBtn.href = kakaoUrl; }
  if (lineUrl && lineBtn) { lineBtn.href = lineUrl; }

  if (kakaoUrl || lineUrl) {
    container.style.display = 'flex';
    if (!kakaoUrl && kakaoBtn) kakaoBtn.style.display = 'none';
    if (!lineUrl && lineBtn) lineBtn.style.display = 'none';
  }
}

// --- Skin Switcher ---

function setupSkinSwitcher() {
  const buttons = document.querySelectorAll('[data-skin]');
  const saved = localStorage.getItem('skin') || 'dark';
  applySkin(saved);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const skin = btn.getAttribute('data-skin');
      applySkin(skin);
      localStorage.setItem('skin', skin);
    });
  });
}

function applySkin(skin) {
  document.documentElement.setAttribute('data-skin', skin);
  document.querySelectorAll('[data-skin]').forEach(btn => {
    btn.classList.toggle('skin-btn--active', btn.getAttribute('data-skin') === skin);
  });
}

// --- Language Switcher (hidden in v1, ready for v1.1) ---

function setupLangSwitcher() {
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.getAttribute('data-lang');
      if (!SUPPORTED_LANGS.includes(lang)) return;
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang;
      const t = await loadTranslations(lang);
      applyTranslations(t);
      renderDynamic(t);
    });
  });
}

// --- Init ---

async function init() {
  const storedLang = localStorage.getItem('lang');
  const lang = SUPPORTED_LANGS.includes(storedLang) ? storedLang : DEFAULT_LANG;
  document.documentElement.lang = lang;
  const t = await loadTranslations(lang);
  applyTranslations(t);
  renderDynamic(t);
  setupNav();
  setupSkinSwitcher();
  setupLoginLinks();
  setupForm();
  setupMessaging();
  setupLangSwitcher();
}

document.addEventListener('DOMContentLoaded', init);
