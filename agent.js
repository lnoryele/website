(() => {
  const AGENT_NAME = 'Oryele Agent';
  const STORAGE_KEY = 'oryele-agent-chat-v1';
  let knowledge = null;
  let open = false;
  let busy = false;
  let history = [];

  const stop = new Set([
    'a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'is', 'are', 'was', 'be',
    'with', 'as', 'at', 'by', 'from', 'it', 'this', 'that', 'you', 'your', 'me', 'my',
    'we', 'our', 'can', 'do', 'does', 'how', 'what', 'when', 'where', 'who', 'why',
    'about', 'tell', 'please', 'any', 'some'
  ]);

  function tokens(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9+\s/-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !stop.has(t));
  }

  function scoreText(queryTokens, text, boost = 1) {
    if (!queryTokens.length) return 0;
    const hay = String(text || '').toLowerCase();
    let score = 0;
    for (const t of queryTokens) {
      if (hay.includes(t)) score += boost;
      if (new RegExp(`\\b${t}\\b`).test(hay)) score += boost * 0.5;
    }
    return score;
  }

  function rank(query) {
    const q = tokens(query);
    const faqs = (knowledge.faqs || []).map((f) => {
      const s =
        scoreText(q, f.question, 3) +
        scoreText(q, (f.tags || []).join(' '), 2.5) +
        scoreText(q, f.answer, 1);
      return { type: 'faq', item: f, score: s };
    });
    const pages = (knowledge.pages || []).map((p) => {
      const s =
        scoreText(q, p.title, 2.5) +
        scoreText(q, p.description, 2) +
        scoreText(q, (p.keywords || []).join(' '), 1.5) +
        scoreText(q, p.content, 0.8);
      return { type: 'page', item: p, score: s };
    });
    return [...faqs, ...pages].filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  }

  function snippet(text, query, max = 220) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const q = tokens(query)[0];
    const idx = q ? clean.toLowerCase().indexOf(q) : -1;
    if (idx < 0) return clean.slice(0, max - 1) + '…';
    const start = Math.max(0, idx - 40);
    const end = Math.min(clean.length, start + max);
    return (start > 0 ? '…' : '') + clean.slice(start, end).trim() + (end < clean.length ? '…' : '');
  }

  function answer(query) {
    const ranked = rank(query);
    if (!ranked.length) {
      return {
        html: escape(knowledge.agent.fallback),
        links: [{ label: 'Contact', url: '/contact' }, { label: 'Pricing', url: '/pricing' }]
      };
    }

    const top = ranked[0];
    const links = [];
    let html = '';

    if (top.type === 'faq' && top.score >= 2) {
      html = escape(top.item.answer).replace(/\n/g, '<br>');
      if (top.item.url) links.push({ label: 'Learn more', url: top.item.url });
    } else {
      const pageHits = ranked.filter((r) => r.type === 'page').slice(0, 2);
      const faqHit = ranked.find((r) => r.type === 'faq');
      if (faqHit && faqHit.score >= 1.5) {
        html = escape(faqHit.item.answer).replace(/\n/g, '<br>');
        if (faqHit.item.url) links.push({ label: 'Learn more', url: faqHit.item.url });
      } else if (pageHits.length) {
        const parts = pageHits.map((h) => {
          const title = escape(h.item.title);
          const desc = escape(h.item.description || snippet(h.item.content, query));
          links.push({ label: h.item.title, url: h.item.url });
          return `<strong>${title}</strong><br>${desc}`;
        });
        html = parts.join('<br><br>');
      } else {
        html = escape(knowledge.agent.fallback);
        links.push({ label: 'Contact', url: '/contact' });
      }
    }

    const related = ranked.find((r) => r.type === 'page' && !links.some((l) => l.url === r.item.url));
    if (related && links.length < 3) {
      links.push({ label: related.item.title, url: related.item.url });
    }

    return { html, links };
  }

  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.messages)) return null;
      return data;
    } catch {
      return null;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages: history,
          open,
          updatedAt: Date.now()
        })
      );
    } catch {}
  }

  function mountUI() {
    if (document.getElementById('oryele-agent-root')) return;

    const root = el(`
      <div id="oryele-agent-root" class="oa-root">
        <button type="button" class="oa-launcher" aria-label="Open Oryele Agent" aria-expanded="false">
          <span class="oa-launcher-icon" aria-hidden="true">✦</span>
          <span class="oa-launcher-label">Oryele Agent</span>
        </button>
        <section class="oa-panel" role="dialog" aria-label="Oryele Agent chat" aria-hidden="true">
          <header class="oa-header">
            <div class="oa-identity">
              <div class="oa-avatar" aria-hidden="true">OA</div>
              <div>
                <strong>${AGENT_NAME}</strong>
                <span class="oa-status"><span class="oa-dot"></span> Online</span>
              </div>
            </div>
            <button type="button" class="oa-close" aria-label="Close chat">×</button>
          </header>
          <div class="oa-messages" id="oa-messages"></div>
          <div class="oa-suggestions" id="oa-suggestions"></div>
          <form class="oa-form" id="oa-form">
            <input id="oa-input" type="text" placeholder="Ask about platform, pricing, demos…" autocomplete="off" maxlength="400" aria-label="Message Oryele Agent">
            <button type="submit" class="oa-send" aria-label="Send">Send</button>
          </form>
        </section>
      </div>
    `);

    document.body.appendChild(root);

    const launcher = root.querySelector('.oa-launcher');
    const panel = root.querySelector('.oa-panel');
    const closeBtn = root.querySelector('.oa-close');
    const form = root.querySelector('#oa-form');
    const input = root.querySelector('#oa-input');
    const messages = root.querySelector('#oa-messages');
    const suggestions = root.querySelector('#oa-suggestions');
    const saved = loadState();

    function setOpen(next, persist = true) {
      open = next;
      root.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        setTimeout(() => {
          input.focus();
          messages.scrollTop = messages.scrollHeight;
        }, 50);
      }
      if (persist) saveState();
    }

    function persistFromDom() {
      history = Array.from(messages.querySelectorAll('.oa-msg')).map((row) => {
        const role = row.classList.contains('oa-msg-user') ? 'user' : 'agent';
        const body = row.querySelector('.oa-bubble-body');
        return { role, html: body ? body.innerHTML : '' };
      });
      saveState();
    }

    function addMessage(role, html, persist = true) {
      const row = el(`<div class="oa-msg oa-msg-${role}"></div>`);
      if (role === 'agent') {
        row.innerHTML = `<div class="oa-bubble"><div class="oa-bubble-label">${AGENT_NAME}</div><div class="oa-bubble-body">${html}</div></div>`;
      } else {
        row.innerHTML = `<div class="oa-bubble"><div class="oa-bubble-body">${html}</div></div>`;
      }
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
      if (persist) persistFromDom();
      return row;
    }

    function addLinks(links) {
      if (!links || !links.length) return;
      const wrap = el('<div class="oa-links"></div>');
      links.forEach((l) => {
        const a = el(`<a class="oa-link" href="${escape(l.url)}">${escape(l.label)}</a>`);
        wrap.appendChild(a);
      });
      const last = messages.querySelector('.oa-msg-agent:last-child .oa-bubble-body');
      if (last) last.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
      persistFromDom();
    }

    function renderSuggestions() {
      suggestions.innerHTML = '';
      const hasUserMsg = history.some((m) => m.role === 'user');
      if (hasUserMsg) {
        suggestions.hidden = true;
        return;
      }
      suggestions.hidden = false;
      (knowledge.agent.suggested || []).forEach((text) => {
        const b = el(`<button type="button" class="oa-chip">${escape(text)}</button>`);
        b.addEventListener('click', () => {
          input.value = text;
          form.requestSubmit();
        });
        suggestions.appendChild(b);
      });
    }

    async function handleSubmit(q) {
      const query = String(q || '').trim();
      if (!query || busy) return;
      busy = true;
      suggestions.hidden = true;
      addMessage('user', escape(query));
      input.value = '';
      const thinking = addMessage('agent', '<span class="oa-typing">Thinking</span>', false);
      await new Promise((r) => setTimeout(r, 280 + Math.random() * 220));
      const result = answer(query);
      thinking.querySelector('.oa-bubble-body').innerHTML = result.html;
      addLinks(result.links);
      busy = false;
      messages.scrollTop = messages.scrollHeight;
    }

    launcher.addEventListener('click', () => setOpen(!open));
    closeBtn.addEventListener('click', () => setOpen(false));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(input.value);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    });

    if (saved && saved.messages.length) {
      history = saved.messages;
      saved.messages.forEach((m) => {
        if (m && (m.role === 'user' || m.role === 'agent') && m.html) {
          addMessage(m.role, m.html, false);
        }
      });
      persistFromDom();
      setOpen(Boolean(saved.open), false);
    } else {
      addMessage('agent', escape(knowledge.agent.greeting));
    }

    renderSuggestions();
  }

  async function boot() {
    try {
      const res = await fetch('/oryele-knowledge.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('knowledge missing');
      knowledge = await res.json();
      mountUI();
    } catch (err) {
      console.warn('Oryele Agent failed to load knowledge:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
