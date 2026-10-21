import { html } from './html.mjs'

export function helpMain(ctx) {
  const { t, config } = ctx
  const h = t.help
  return html`<section class="page-narrow wrap">
<h1 class="page-title">${h.title}</h1>
<p class="lead page-lead">${h.sub}</p>
<div class="faq">
${h.items.map((item, index) => html`<details class="card faq-item"${index === 0 ? html` open` : ''}><summary>${item.q}</summary><p>${item.a}</p></details>
`)}</div>
<div class="contact-card">
<h2 class="contact-title">${h.contactTitle}</h2>
<p>${h.contactText}</p>
<a class="contact-mail" href="mailto:${config.contactEmail}">${config.contactEmail}</a>
</div>
</section>`
}

const LEGAL_TABS = [
  { id: 'privacy', label: (t) => t.common.privacy },
  { id: 'terms', label: (t) => t.common.terms },
  { id: 'notice', label: (t) => t.common.legal },
]

function legalTabs(ctx) {
  const { t, pageId } = ctx
  return html`<nav class="legal-tabs" aria-label="${t.legal.title}">
${LEGAL_TABS.map((tab) => html`<a class="legal-tab" href="${t.paths[tab.id]}"${tab.id === pageId ? html` aria-current="page"` : ''}>${tab.label(t)}</a>
`)}</nav>`
}

function legalBody(ctx) {
  const { legal } = ctx.t
  switch (ctx.pageId) {
    case 'privacy':
      return html`<p class="legal-date">${legal.lastUpdate}</p>
${legal.privacySections.map((section) => html`<section class="legal-section"><h2>${section.h}</h2><p>${section.p}</p></section>
`)}`
    case 'terms':
      return html`<p class="legal-date">${legal.lastUpdate}</p>
<p class="legal-text">${legal.termsText}</p>`
    default:
      return html`<p class="legal-text">${legal.noticeLines.map((line, index) => html`${index > 0 ? html`<br>` : ''}${line}`)}</p>`
  }
}

// Confidentialité, Conditions d'utilisation, Mentions légales : une adresse chacune, onglets en liens.
export function legalMain(ctx) {
  return html`<section class="page-narrow wrap">
<h1 class="page-title">${ctx.t.legal.title}</h1>
${legalTabs(ctx)}
<div class="legal-content">
${legalBody(ctx)}
</div>
</section>`
}

export function soonMain(ctx) {
  const { t, config } = ctx
  return html`<section class="page-narrow wrap soon">
<h1 class="page-title">${t.soon.title}</h1>
<p class="lead">${t.soon.text} <a class="contact-mail" href="mailto:${config.contactEmail}">${config.contactEmail}</a></p>
<a class="pill pill-yellow" href="${t.paths.home}">${t.soon.back}</a>
</section>`
}
