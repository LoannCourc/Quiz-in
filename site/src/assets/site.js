// Site vitrine : menu du téléphone (burger).
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
