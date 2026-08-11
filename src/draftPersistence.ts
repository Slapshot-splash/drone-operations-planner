const STORAGE_KEY = 'drone-operations-planner:draft-v1'

type SavedDraft = {
  values: string[]
  checked: boolean[]
  step: number
  updatedAt: string
}

function readDraft(): SavedDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as SavedDraft : null
  } catch {
    return null
  }
}

function saveDraft(modal: HTMLElement) {
  const controls = Array.from(modal.querySelectorAll('input, select')) as (HTMLInputElement | HTMLSelectElement)[]
  const draft: SavedDraft = {
    values: controls.map((control) => control instanceof HTMLInputElement && control.type === 'checkbox' ? '' : control.value),
    checked: controls.map((control) => control instanceof HTMLInputElement && control.type === 'checkbox' ? control.checked : false),
    step: Math.max(0, Array.from(modal.querySelectorAll('.wizard-steps button')).findIndex((button) => button.classList.contains('current'))),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  updateDraftStatus(modal, draft.updatedAt)
}

function restoreDraft(modal: HTMLElement) {
  const draft = readDraft()
  if (!draft) return

  const controls = Array.from(modal.querySelectorAll('input, select')) as (HTMLInputElement | HTMLSelectElement)[]
  controls.forEach((control, index) => {
    if (control instanceof HTMLInputElement && control.type === 'checkbox') {
      if (typeof draft.checked[index] === 'boolean') {
        control.checked = draft.checked[index]
        control.dispatchEvent(new Event('change', { bubbles: true }))
      }
      return
    }
    if (draft.values[index] !== undefined) {
      control.value = draft.values[index]
      control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
    }
  })

  const targetStep = Math.max(0, Math.min(draft.step ?? 0, modal.querySelectorAll('.wizard-steps button').length - 1))
  const stepButton = modal.querySelectorAll('.wizard-steps button')[targetStep] as HTMLButtonElement | undefined
  if (stepButton && targetStep > 0) stepButton.click()

  updateDraftStatus(modal, draft.updatedAt)
}

function updateDraftStatus(modal: HTMLElement, updatedAt?: string) {
  let status = modal.querySelector('.draft-status') as HTMLElement | null
  if (!status) {
    status = document.createElement('span')
    status.className = 'draft-status'
    const header = modal.querySelector('.modal-header')
    header?.appendChild(status)
  }
  status.textContent = updatedAt ? `Concept opgeslagen · ${new Date(updatedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}` : 'Concept opgeslagen'
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY)
}

let activeModal: HTMLElement | null = null
let restoreTimer: number | undefined

const observer = new MutationObserver(() => {
  const modal = document.querySelector('.planner-modal') as HTMLElement | null
  if (!modal) {
    activeModal = null
    return
  }

  if (modal !== activeModal) {
    activeModal = modal
    window.clearTimeout(restoreTimer)
    restoreTimer = window.setTimeout(() => restoreDraft(modal), 100)

    const save = () => saveDraft(modal)
    modal.addEventListener('input', save)
    modal.addEventListener('change', save)
    modal.querySelector('.wizard-steps')?.addEventListener('click', () => window.setTimeout(save, 20))

    const actions = modal.querySelector('.modal-actions')
    if (actions && !actions.querySelector('.draft-save-button')) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'secondary-button draft-save-button'
      button.textContent = 'Opslaan & sluiten'
      button.addEventListener('click', () => {
        saveDraft(modal)
        const close = modal.querySelector('.close-button') as HTMLButtonElement | null
        close?.click()
      })
      actions.insertBefore(button, actions.firstChild)
    }

    const close = modal.querySelector('.close-button') as HTMLButtonElement | null
    close?.addEventListener('click', () => saveDraft(modal), { once: true })
  }

  const finishButton = Array.from(modal.querySelectorAll('.modal-actions button')).find((button) => button.textContent?.includes('Operatie opslaan'))
  if (finishButton && !finishButton.getAttribute('data-draft-clear')) {
    finishButton.setAttribute('data-draft-clear', 'true')
    finishButton.addEventListener('click', () => clearDraft())
  }
})

observer.observe(document.body, { childList: true, subtree: true })
