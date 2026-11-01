/* ==========================================================================
   Licenças — renderização
   Lê os dados de window.LICENSE_CONFIG (js/licenses.config.js) e monta a
   tabela em toda seção com [data-license-sheet]. É só informativa: não há
   compra nem seleção. Em telas largas as licenças viram colunas alinhadas
   (subgrid) e passar o mouse numa linha destaca o termo em todas elas.
   Em telas menores dá para alternar entre "Por licença" e "Comparar termos".
   ========================================================================== */

(function () {
  'use strict';

  const TEXT = {
    yes: 'Sim',
    no: 'Não',
    price: 'Preço',
    formats: 'Arquivos',
    notIncluded: 'não incluso',
    includedAll: 'Incluso em todas as licenças.',
    includedIn: (names) => `Incluso em: ${names}.`,
    viewsLabel: 'Modo de visualização',
    viewCards: 'Por licença',
    viewCompare: 'Comparar termos',
    infoTitle: 'Informações complementares',
    pendingTag: 'A confirmar',
    pendingLead: 'A confirmar antes de publicar:',
  };

  const UNLIMITED = 'ilimitado';

  /* Ícones de linha: traço de 1.6 em grade de 24px. A cruz é o emblema, cheia. */
  const ICONS = {
    mic: '<rect x="9" y="2.75" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/><path d="M9 21h6"/>',
    disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.25"/><path d="M12 6.5a5.5 5.5 0 0 0-5.5 5.5"/>',
    wave: '<path d="M3.5 10.5v3"/><path d="M7.25 7.5v9"/><path d="M11 4v16"/><path d="M14.75 8.5v7"/><path d="M18.5 6v12"/><path d="M21 10.5v3"/>',
    video: '<rect x="2.75" y="5.75" width="13.5" height="12.5" rx="2.25"/><path d="m16.25 10.25 5-2.75v9l-5-2.75"/>',
    ticket: '<path d="M3.75 7.25A1.5 1.5 0 0 1 5.25 5.75h13.5a1.5 1.5 0 0 1 1.5 1.5V9.5a2.5 2.5 0 0 0 0 5v2.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V14.5a2.5 2.5 0 0 0 0-5z"/><path d="M14.5 5.75v2"/><path d="M14.5 11v2"/><path d="M14.5 16.25v2"/>',
    radio: '<rect x="2.75" y="8.25" width="18.5" height="12" rx="2.25"/><path d="m6.5 8.25 10.5-4.5"/><circle cx="15.75" cy="14.25" r="2.5"/><path d="M6.5 12.75h3.5"/><path d="M6.5 15.75h3.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="m7 7 10 10"/><path d="M17 7 7 17"/>',
    infinity: '<path d="M12 12c-1.9-2.6-3.5-4-5.5-4a4 4 0 0 0 0 8c2 0 3.6-1.4 5.5-4Zm0 0c1.9 2.6 3.5 4 5.5 4a4 4 0 0 0 0-8c-2 0-3.6 1.4-5.5 4Z"/>',
    help: '<circle cx="12" cy="12" r="8.75"/><path d="M9.75 9.5a2.35 2.35 0 0 1 4.55.8c0 1.55-2.3 2-2.3 3.45"/><path d="M12 16.75h.01"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    flag: '<path d="M5.5 21V4"/><path d="M5.5 4.5h11l-2.25 4 2.25 4h-11"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.75"/><path d="M17 7h.01"/>',
    cross: '<path fill="currentColor" stroke="none" d="M10.6 7.6 10 3.2 12 1l2 2.2-.6 4.4 6-.6 2.2 2-2.2 2-6-.6.8 10.2L12 23l-2.2-2.4.8-10.2-6 .6-2.2-2 2.2-2Z"/>',
  };

  function icon(name, className = 'lic-icon') {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  const pad = (i) => String(i + 1).padStart(2, '0');
  const fullName = (plan) => (plan.suffix ? `${plan.name} ${plan.suffix}` : plan.name);
  const STATE_ICON = { yes: 'check', no: 'x', unlimited: 'infinity' };

  /* ---------- formatação ---------- */

  function createFormatters(config) {
    const number = new Intl.NumberFormat(config.locale, { notation: 'compact', maximumFractionDigits: 1 });
    const money = new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.currency });
    const list = new Intl.ListFormat(config.locale, { type: 'conjunction' });

    return {
      list: (items) => list.format(items),

      price(plan) {
        if (typeof plan.price !== 'number') return { text: plan.priceLabel || '', parts: null };
        const parts = money.formatToParts(plan.price);
        const pick = (...types) => parts.filter((p) => types.includes(p.type)).map((p) => p.value).join('');
        return {
          text: money.format(plan.price),
          parts: { currency: pick('currency'), amount: pick('integer', 'group'), cents: pick('decimal', 'fraction') },
        };
      },

      term(def, value) {
        if (def.type === 'boolean') return value ? { text: TEXT.yes, state: 'yes' } : { text: TEXT.no, state: 'no' };
        if (value === UNLIMITED || value === Infinity) return { text: def.unlimited, state: 'unlimited' };
        if (!value) return { text: TEXT.no, state: 'no' };
        return { text: def.limit.replace('{n}', number.format(value)), state: 'limit' };
      },
    };
  }

  /* ---------- textos de ajuda (tooltips) ---------- */

  function buildTips(config, fmt) {
    const tips = new Map();

    config.formats.forEach((f) => {
      if (!config.formatHelp?.[f]) return;
      const withFormat = config.plans.filter((p) => p.formats.includes(f));
      const extra = withFormat.length === config.plans.length
        ? TEXT.includedAll
        : TEXT.includedIn(fmt.list(withFormat.map(fullName)));
      tips.set(`format-${f}`, { title: f, text: config.formatHelp[f], extra });
    });

    config.terms.forEach((t) => {
      if (t.help) tips.set(`term-${t.key}`, { title: t.label, text: t.help });
    });

    config.plans.forEach((p) => {
      if (p.priceHelp) tips.set(`price-${p.id}`, { title: p.priceLabel, text: p.priceHelp });
    });

    return tips;
  }

  /* O texto de cada ajuda fica num elemento escondido, ligado ao botão por
     aria-describedby: leitores de tela o leem mesmo sem o tooltip aberto. */
  function descriptionsHTML(ctx) {
    return `<div hidden>${[...ctx.tips].map(([key, t]) =>
      `<span id="${ctx.uid}-d-${key}">${esc([t.text, t.extra].filter(Boolean).join(' '))}</span>`).join('')}</div>`;
  }

  const tipAttrs = (ctx, key) => `data-tip="${key}" aria-describedby="${ctx.uid}-d-${key}"`;

  function termLabelHTML(def, ctx) {
    const key = `term-${def.key}`;
    return ctx.tips.has(key)
      ? `<button type="button" class="lic-tipbtn" ${tipAttrs(ctx, key)}>${esc(def.label)}</button>`
      : `<span>${esc(def.label)}</span>`;
  }

  /* Legenda do canto da tabela: um formato por linha, com o resumo ao lado.
     A linha inteira abre a explicação completa. */
  function legendStackedHTML(ctx) {
    const { formats, formatShort = {} } = ctx.config;
    const rows = formats.map((f) => {
      const key = `format-${f}`;
      const hint = formatShort[f]
        ? `<span class="lic-sr">: </span><span class="lic-legend__hint">${esc(formatShort[f])}</span>`
        : '';
      return ctx.tips.has(key)
        ? `<li><button type="button" class="lic-legend__row" ${tipAttrs(ctx, key)}><span class="lic-format">${esc(f)}</span>${hint}</button></li>`
        : `<li class="lic-legend__row"><span class="lic-format">${esc(f)}</span>${hint}</li>`;
    }).join('');
    return `
      <div class="lic-legend lic-legend--stacked">
        <span class="lic-legend__label">${TEXT.formats}</span>
        <ul class="lic-legend__rows">${rows}</ul>
      </div>`;
  }

  function legendHTML(ctx) {
    const items = ctx.config.formats.map((f) => {
      const key = `format-${f}`;
      return ctx.tips.has(key)
        ? `<li><button type="button" class="lic-format lic-format--help" ${tipAttrs(ctx, key)}>${esc(f)}${icon('help', 'lic-icon lic-format__help')}</button></li>`
        : `<li class="lic-format">${esc(f)}</li>`;
    }).join('');
    return `
      <div class="lic-legend">
        <span class="lic-legend__label">${TEXT.formats}</span>
        <ul class="lic-legend__list">${items}</ul>
      </div>`;
  }

  /* ---------- templates da tabela ---------- */

  function nameHTML(plan) {
    return `${esc(plan.name)}${plan.suffix ? ` <span class="lic-suffix">${esc(plan.suffix)}</span>` : ''}`;
  }

  function priceHTML(plan, price, ctx) {
    if (!price.parts) {
      const key = `price-${plan.id}`;
      const label = ctx.tips.has(key)
        ? `<button type="button" class="lic-price__label lic-tipbtn" ${tipAttrs(ctx, key)}>${esc(price.text)}</button>`
        : `<span class="lic-price__label">${esc(price.text)}</span>`;
      return `<p class="lic-price lic-price--text">${label}</p>`;
    }
    const { currency, amount, cents } = price.parts;
    return `
      <p class="lic-price">
        <span class="lic-sr">${esc(price.text)}</span>
        <span class="lic-price__currency" aria-hidden="true">${esc(currency)}</span>
        <span class="lic-price__amount" aria-hidden="true">${esc(amount)}</span>
        <span class="lic-price__cents" aria-hidden="true">${esc(cents)}</span>
      </p>`;
  }

  function formatsHTML(plan, all) {
    return all.map((f) => {
      const on = plan.formats.includes(f);
      return `<li class="lic-format${on ? '' : ' is-off'}">${esc(f)}${on ? '' : `<span class="lic-sr"> (${TEXT.notIncluded})</span>`}</li>`;
    }).join('');
  }

  function valueHTML(t) {
    const stateIcon = STATE_ICON[t.state];
    return `${stateIcon ? icon(stateIcon, 'lic-icon lic-row__state') : ''}${esc(t.text)}`;
  }

  function rowHTML(def, value, row, ctx) {
    const t = ctx.fmt.term(def, value);
    return `
      <div class="lic-row is-${t.state}" data-row="${row}">
        <dt class="lic-row__label">
          ${icon(def.icon)}
          <span class="lic-row__btn">${termLabelHTML(def, ctx)}</span>
          <span class="lic-row__sr">${esc(def.label)}</span>
        </dt>
        <dd class="lic-row__value">${valueHTML(t)}</dd>
      </div>`;
  }

  function planHTML(plan, i, ctx) {
    const { uid, fmt, config } = ctx;
    const nameId = `${uid}-name-${plan.id}`;
    const classes = ['lic-plan', plan.badge && 'is-featured', plan.exclusive && 'is-exclusive'].filter(Boolean).join(' ');

    return `
      <article class="${classes}" aria-labelledby="${nameId}">
        ${plan.badge ? `<span class="lic-plan__tab">${esc(plan.badge)}</span>` : ''}
        <header class="lic-plan__header">
          <p class="lic-plan__meta">
            <span class="lic-plan__code">${pad(i)}</span>
            <span class="lic-plan__dot" aria-hidden="true"></span>
            <span>${esc(plan.type)}</span>
          </p>
          ${plan.exclusive ? `<span class="lic-plan__emblem">${icon('cross')}</span>` : ''}
          <h3 class="lic-plan__name" id="${nameId}">${nameHTML(plan)}</h3>
          ${priceHTML(plan, fmt.price(plan), ctx)}
          <ul class="lic-formats" aria-label="${TEXT.formats}">${formatsHTML(plan, config.formats)}</ul>
        </header>
        <p class="lic-plan__caption" aria-hidden="true">Termos de uso</p>
        <dl class="lic-plan__terms">
          ${config.terms.map((def, r) => rowHTML(def, plan.terms[def.key], r, ctx)).join('')}
        </dl>
      </article>`;
  }

  /* Coluna de rótulos: só aparece em telas largas, com a legenda dos
     arquivos no canto. Leitores de tela também leem os rótulos dentro de
     cada licença. */
  function labelsHTML(ctx) {
    return `
      <div class="lic-sheet__labels">
        <div class="lic-sheet__corner">${legendStackedHTML(ctx)}</div>
        ${ctx.config.terms.map((def, r) => `
          <div class="lic-sheet__label" data-row="${r}">${icon(def.icon)}${termLabelHTML(def, ctx)}</div>`).join('')}
      </div>`;
  }

  /* ---------- comparação por termo (telas menores) ---------- */

  function compareHTML(ctx) {
    const { config, fmt } = ctx;

    const item = (plan, i, value, state = '') => `
      <li class="lic-cmp__item${plan.badge ? ' is-featured' : ''}${state ? ` is-${state}` : ''}">
        <span class="lic-cmp__plan"><span class="lic-cmp__code">${pad(i)}</span><span>${nameHTML(plan)}</span></span>
        <span class="lic-cmp__value">${value}</span>
      </li>`;

    const block = (title, items) => `
      <section class="lic-cmp">
        <h3 class="lic-cmp__title">${title}</h3>
        <ul class="lic-cmp__list">${items}</ul>
      </section>`;

    const prices = block(
      `<span>${TEXT.price}</span>`,
      config.plans.map((p, i) => item(p, i, esc(fmt.price(p).text), p.price == null ? 'text' : '')).join(''),
    );

    const files = block(
      `<span>${TEXT.formats}</span>`,
      config.plans.map((p, i) => item(p, i, `<ul class="lic-formats lic-formats--inline">${formatsHTML(p, config.formats)}</ul>`)).join(''),
    );

    const terms = config.terms.map((def) => block(
      `${icon(def.icon)}${termLabelHTML(def, ctx)}`,
      config.plans.map((p, i) => {
        const t = fmt.term(def, p.terms[def.key]);
        return item(p, i, valueHTML(t), t.state);
      }).join(''),
    )).join('');

    return prices + files + terms;
  }

  function toolbarHTML(ctx) {
    return `
      <div class="lic-toolbar">
        ${legendHTML(ctx)}
        <div class="lic-views" role="group" aria-label="${TEXT.viewsLabel}">
          <button type="button" class="lic-views__btn" data-view-btn="cards" aria-pressed="true">${TEXT.viewCards}</button>
          <button type="button" class="lic-views__btn" data-view-btn="compare" aria-pressed="false">${TEXT.viewCompare}</button>
        </div>
      </div>`;
  }

  /* ---------- contato e informações ---------- */

  function contactHTML(config) {
    const c = config.contact;
    if (!c || !(c.title || c.text)) return '';
    const link = c.url ? `
      <a class="lic-cta__link" href="${esc(c.url)}" target="_blank" rel="noopener">
        ${icon('instagram')}
        <span>${esc(c.label)}</span>
        ${c.handle ? `<span class="lic-cta__handle">${esc(c.handle)}</span>` : ''}
        ${icon('arrow', 'lic-icon lic-cta__arrow')}
      </a>` : '';
    return `
      <div class="lic-cta">
        <p class="lic-cta__text">${c.title ? `<strong>${esc(c.title)}</strong> ` : ''}${esc(c.text)}</p>
        ${link}
      </div>`;
  }

  function infoHTML(ctx) {
    const { config, uid } = ctx;
    const show = config.showPending;
    const items = (config.info || []).filter((it) => it.text || (show && it.pending));
    if (!items.length) return '';

    return `
      <section class="lic-info" aria-labelledby="${uid}-info">
        <h3 class="lic-info__title" id="${uid}-info">${TEXT.infoTitle}</h3>
        <div class="lic-info__list">
          ${items.map((it) => {
            const pending = show && it.pending;
            return `
              <details class="lic-faq">
                <summary class="lic-faq__summary">
                  <span class="lic-faq__title">${esc(it.title)}</span>
                  ${pending ? `<span class="lic-pending-tag">${TEXT.pendingTag}</span>` : ''}
                  ${icon('chevron', 'lic-icon lic-faq__chevron')}
                </summary>
                <div class="lic-faq__body">
                  ${it.text ? `<p>${esc(it.text)}</p>` : ''}
                  ${pending ? `<p class="lic-pending">${icon('flag')}<span><strong>${TEXT.pendingLead}</strong> ${esc(it.pending)}</span></p>` : ''}
                </div>
              </details>`;
          }).join('')}
        </div>
      </section>`;
  }

  /* ---------- comportamento ---------- */

  function bindRowHover(sheet) {
    let current = null;
    const mark = (row, on) => sheet.querySelectorAll(`[data-row="${row}"]`).forEach((el) => el.classList.toggle('is-row-hover', on));

    function set(row) {
      if (row === current) return;
      if (current !== null) mark(current, false);
      current = row;
      if (row !== null) mark(row, true);
    }

    sheet.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const cell = e.target.closest('[data-row]');
      set(cell ? cell.dataset.row : null);
    });
    sheet.addEventListener('pointerleave', () => set(null));
  }

  /* Um único tooltip por seção. Abre ao passar o mouse, com foco do teclado
     ou com toque/clique (que o fixa); fecha com Esc, clique fora ou rolagem. */
  function bindTips(root, ctx) {
    const tip = document.createElement('div');
    tip.className = 'lic-tip';
    tip.setAttribute('role', 'tooltip');
    root.appendChild(tip);

    let current = null;
    let pinned = false;
    let hideTimer = 0;

    function place(trigger) {
      const r = trigger.getBoundingClientRect();
      const width = tip.offsetWidth;
      const height = tip.offsetHeight;
      const gap = 10;
      const margin = 8;
      let top = r.top - height - gap;
      const below = top < margin;
      if (below) top = r.bottom + gap;
      const center = r.left + r.width / 2;
      const left = Math.max(margin, Math.min(center - width / 2, window.innerWidth - width - margin));
      tip.style.top = `${Math.round(top)}px`;
      tip.style.left = `${Math.round(left)}px`;
      tip.style.setProperty('--lic-tip-arrow', `${Math.round(center - left)}px`);
      tip.classList.toggle('is-below', below);
    }

    function show(trigger, pin) {
      const data = ctx.tips.get(trigger.dataset.tip);
      if (!data) return;
      clearTimeout(hideTimer);
      if (current && current !== trigger) current.classList.remove('is-tip-open');
      current = trigger;
      pinned = pin;
      tip.innerHTML = `
        <p class="lic-tip__title">${esc(data.title)}</p>
        <p class="lic-tip__text">${esc(data.text)}</p>
        ${data.extra ? `<p class="lic-tip__extra">${esc(data.extra)}</p>` : ''}`;
      trigger.classList.add('is-tip-open');
      place(trigger);
      tip.classList.add('is-visible');
    }

    function hide() {
      clearTimeout(hideTimer);
      if (!current) return;
      current.classList.remove('is-tip-open');
      tip.classList.remove('is-visible');
      current = null;
      pinned = false;
    }

    const hideSoon = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 120);
    };

    root.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse' || pinned) return;
      const trigger = e.target.closest('[data-tip]');
      if (trigger) show(trigger, false);
    });

    root.addEventListener('pointerout', (e) => {
      if (e.pointerType !== 'mouse' || pinned) return;
      const trigger = e.target.closest('[data-tip]');
      if (trigger && trigger === current && !trigger.contains(e.relatedTarget)) hideSoon();
    });

    tip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
    tip.addEventListener('pointerleave', () => { if (!pinned) hideSoon(); });

    root.addEventListener('focusin', (e) => {
      const trigger = e.target.closest('[data-tip]');
      if (trigger && trigger.matches(':focus-visible')) show(trigger, false);
    });

    root.addEventListener('focusout', (e) => {
      if (current && e.target === current) hide();
    });

    root.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-tip]');
      if (!trigger) return;
      if (trigger === current && pinned) hide();
      else show(trigger, true);
    });

    document.addEventListener('pointerdown', (e) => {
      if (current && !e.target.closest('[data-tip]') && !tip.contains(e.target)) hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hide();
    });
    window.addEventListener('scroll', hide, { passive: true, capture: true });
    window.addEventListener('resize', hide);
  }

  function bindViews(region) {
    const buttons = [...region.querySelectorAll('[data-view-btn]')];
    region.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-view-btn]');
      if (!btn) return;
      region.dataset.view = btn.dataset.viewBtn;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    });
  }

  let instances = 0;

  function initLicenseSheet(root) {
    const config = window.LICENSE_CONFIG;
    if (!config || !Array.isArray(config.plans) || !config.plans.length) {
      console.error('[Licenças] window.LICENSE_CONFIG não encontrado. Carregue js/licenses.config.js antes de js/licenses.js.');
      return;
    }

    const fmt = createFormatters(config);
    const ctx = { config, fmt, uid: `lic${++instances}`, tips: buildTips(config, fmt) };

    const region = root.querySelector('[data-lic-region]');
    region.dataset.view = 'cards';
    region.innerHTML = `
      ${toolbarHTML(ctx)}
      <div class="lic-sheet" style="--lic-cols: ${config.plans.length}; --lic-rows: ${config.terms.length}">
        ${labelsHTML(ctx)}
        ${config.plans.map((p, i) => planHTML(p, i, ctx)).join('')}
      </div>
      <div class="lic-compare">${compareHTML(ctx)}</div>
      ${descriptionsHTML(ctx)}`;

    const after = root.querySelector('[data-lic-after]');
    if (after) after.innerHTML = contactHTML(config) + infoHTML(ctx);

    if (config.showPending) {
      const pending = (config.info || []).filter((it) => it.pending).map((it) => `• ${it.title}: ${it.pending}`);
      if (pending.length) console.warn(`[Licenças] A confirmar antes de publicar:\n${pending.join('\n')}`);
    }

    bindRowHover(region.querySelector('.lic-sheet'));
    bindTips(root, ctx);
    bindViews(region);
  }

  function boot() {
    document.querySelectorAll('[data-license-sheet]').forEach(initLicenseSheet);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
