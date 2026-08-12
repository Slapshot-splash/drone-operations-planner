import { supabase } from './lib/supabase'

const attachNavigation = () => {
  const navItems = document.querySelectorAll('.nav-item')
  const operationsSection = document.querySelector('.content-section')
  if (!navItems.length || !operationsSection) return false

  const overview = navItems[0]
  const operations = navItems[1]

  if (operations.dataset.enhanced !== 'true') {
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
  }

  enhanceOperationRows()
  return true
}

let deleteBusy = false

async function enhanceOperationRows() {
  const rows = [...document.querySelectorAll('.operation-row')]
  if (!rows.length || !supabase) return

  rows.forEach((row, index) => {
    if (row.querySelector('.operation-delete')) return

    const deleteAction = document.createElement('span')
    deleteAction.className = 'operation-delete'
    deleteAction.setAttribute('role', 'button')
    deleteAction.setAttribute('tabindex', '0')
    deleteAction.setAttribute('aria-label', 'Operatie verwijderen')
    deleteAction.title = 'Operatie verwijderen'
    deleteAction.innerHTML = '×'

    const remove = async (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (deleteBusy) return

      const operationName = row.querySelector('.operation-main strong')?.textContent?.trim() || 'deze operatie'
      if (!window.confirm(`Weet je zeker dat je "${operationName}" wilt verwijderen?`)) return

      deleteBusy = true
      deleteAction.textContent = '…'
      deleteAction.classList.add('is-busy')

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData.user) throw new Error('Je bent niet ingelogd.')

        const { data: operations, error: listError } = await supabase
          .from('operations')
          .select('id')
          .order('created_at', { ascending: false })

        if (listError) throw listError
        const operation = operations?.[index]
        if (!operation) throw new Error('Operatie kon niet worden gevonden. Vernieuw de pagina en probeer opnieuw.')

        const { error } = await supabase.from('operations').delete().eq('id', operation.id).eq('user_id', userData.user.id)
        if (error) throw error

        window.location.reload()
      } catch (error) {
        deleteBusy = false
        deleteAction.textContent = '×'
        deleteAction.classList.remove('is-busy')
        window.alert(error instanceof Error ? `Verwijderen mislukt: ${error.message}` : 'Verwijderen mislukt.')
      }
    }

    deleteAction.addEventListener('click', remove)
    deleteAction.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') remove(event)
    })

    row.appendChild(deleteAction)
  })
}

const style = document.createElement('style')
style.textContent = `
  .operation-row{position:relative;padding-right:58px!important}
  .operation-delete{position:absolute;right:16px;top:50%;transform:translateY(-50%);width:30px;height:30px;border:1px solid rgba(255,255,255,.1);border-radius:8px;display:grid;place-items:center;color:#8fa0b8;background:rgba(255,255,255,.03);font-size:20px;line-height:1;cursor:pointer;z-index:2;transition:all .15s ease}
  .operation-delete:hover{color:#ffb0b0;border-color:rgba(255,120,120,.35);background:rgba(255,90,90,.08)}
  .operation-delete:focus-visible{outline:2px solid #9fc2f4;outline-offset:2px}
  .operation-delete.is-busy{opacity:.5;cursor:wait}
`
document.head.appendChild(style)

const observer = new MutationObserver(() => {
  attachNavigation()
})

observer.observe(document.documentElement, { childList: true, subtree: true })
attachNavigation()
