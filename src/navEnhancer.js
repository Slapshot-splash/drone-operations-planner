const attachNavigation = () => {
  const navItems = document.querySelectorAll('.nav-item')
  const operationsSection = document.querySelector('.content-section')
  if (!navItems.length || !operationsSection) return false

  const overview = navItems[0]
  const operations = navItems[1]
  if (operations.dataset.enhanced === 'true') return true

  const setActive = (item) => {
    navItems.forEach((button) => button.classList.remove('active'))
    item.classList.add('active')
  }

  operations.addEventListener('click', () => {
    setActive(operations)
    operationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  overview.addEventListener('click', () => {
    setActive(overview)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  navItems.forEach((button, index) => {
    if (index > 1) button.addEventListener('click', () => setActive(button))
  })

  operations.dataset.enhanced = 'true'
  return true
}

const observer = new MutationObserver(() => {
  if (attachNavigation()) observer.disconnect()
})

observer.observe(document.documentElement, { childList: true, subtree: true })
attachNavigation()
