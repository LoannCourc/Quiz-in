// Gabarits HTML : html`…` échappe chaque valeur insérée (textes des fichiers de langue), sauf un
// fragment déjà produit par html`…` ou marqué raw(…). Un tableau est inséré élément par élément.

class Raw {
  constructor(value) {
    this.value = value
  }

  toString() {
    return this.value
  }
}

export function raw(value) {
  return new Raw(String(value))
}

export function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}

function render(value) {
  if (value === null || value === undefined || value === false) return ''
  if (value instanceof Raw) return value.value
  if (Array.isArray(value)) return value.map(render).join('')
  return escapeHtml(String(value))
}

export function html(strings, ...values) {
  let out = strings[0]
  values.forEach((value, index) => {
    out += render(value) + strings[index + 1]
  })
  return new Raw(out)
}
