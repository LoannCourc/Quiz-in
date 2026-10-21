// Site vitrine : choix de langue mémorisé, menu du téléphone (burger).

// Clé lue aussi par assets/lang.js (généré par scripts/build.mjs) : un choix mémorisé empêche la redirection.
;(function () {
  document.querySelectorAll('.lang-switch a[data-lang]').forEach((link) => {
    link.addEventListener('click', () => {
      try {
        localStorage.setItem('quizin-site:lang', link.dataset.lang)
      } catch (error) {
        // Stockage refusé (navigation privée) : la bascule fonctionne quand même, sans mémoire.
      }
    })
  })
})()

;(function () {
  const burger = document.querySelector('.burger')
  const menu = document.getElementById('menu-mobile')
  if (!burger || !menu) return

  function setOpen(isOpen) {
    burger.setAttribute('aria-expanded', String(isOpen))
    menu.hidden = !isOpen
  }

  burger.addEventListener('click', () => setOpen(menu.hidden))
  // Un lien du menu (ancre de la même page) referme le menu.
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false)
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false)
      burger.focus()
    }
  })
})()
