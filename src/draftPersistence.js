const STORAGE_KEY = 'drone-operations-planner:draft-v1'

const readDraft = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}

const updateStatus = (modal, updatedAt) => {
  let status = modal.querySelector('.draft-status')
  if (!status) {
    status = document.createElement('span')
    status.className = 'draft-status'
    modal.querySelector('.modal-header')?.appendChild(status)
  }
  status.textContent = updatedAt
    ? `Concept opgeslagen · ${new Date(updatedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
    : 'Concept opgeslagen'
}

const saveDraft = (modal) => {
  const controls = [...modal.querySelectorAll('input, select')]
  const draft = {
    values: controls.map(c => c.type === 'checkbox' ? '' : c.value),
    checked: controls.map(c => c.type === 'checkbox' ? c.checked : false),
    step: Math.max(0, [...modal.querySelectorAll('.wizard-steps button')].findIndex(b => b.classList.contains('current'))),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  updateStatus(modal, draft.updatedAt)
}

const restoreDraft = (modal) => {
  const draft = readDraft()
  if (!draft) return
  const controls = [...modal.querySelectorAll('input, select')]
  controls.forEach((control, index) => {
    if (control.type === 'checkbox') {
      if (typeof draft.checked?.[index] === 'boolean') control.checked = draft.checked[index]
    } else if (draft.values?.[index] !== undefined) {
      control.value = draft.values[index]
    }
  })
  updateStatus(modal, draft.updatedAt)
}

const observer = new MutationObserver(() => {
  const modal = document.querySelector('.planner-modal')
  if (!modal || modal.dataset.persistenceReady) return
  modal.dataset.persistenceReady = 'true'

  restoreDraft(modal)

  const save = () => saveDraft(modal)
  modal.addEventListener('input', save)
  modal.addEventListener('change', save)

  const actions = modal.querySelector('.modal-actions')
  if (actions) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'secondary-button draft-save-button'
    button.textContent = 'Opslaan & sluiten'
    button.addEventListener('click', () => {
      saveDraft(modal)
      modal.querySelector('.close-button')?.click()
    })
    actions.insertBefore(button, actions.firstChild)
  }

  const finish = [...modal.querySelectorAll('.modal-actions button')].find(b => b.textContent?.includes('Operatie opslaan'))
  finish?.addEventListener('click', () => localStorage.removeItem(STORAGE_KEY))
})

observer.observe(document.body, { childList: true, subtree: true })
