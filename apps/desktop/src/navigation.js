for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => {
    for (const panel of document.querySelectorAll('.app-view'))
      panel.hidden = panel.id !== `${button.dataset.view}-view`
    for (const item of document.querySelectorAll('[data-view]'))
      item.removeAttribute('aria-current')
    button.setAttribute('aria-current', 'page')
    document.getElementById('view-title').textContent = button.textContent
  })
}
