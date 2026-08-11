import { supabase, supabaseConfigured } from './lib/supabase'

const root = document.getElementById('root')

if (root && supabaseConfigured && supabase) {
  const client = supabase
  const gate = document.createElement('div')
  gate.id = 'auth-gate'
  gate.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand"><div class="auth-mark">D</div><div><strong>Drone Ops</strong><span>Operations Planner</span></div></div>
      <span class="auth-eyebrow">Drone Operations Planner</span>
      <h1 id="auth-title">Inloggen</h1>
      <p id="auth-description">Log in om je operaties veilig op te slaan en later verder te gaan.</p>
      <form id="auth-form">
        <label>E-mailadres<input id="auth-email" type="email" autocomplete="email" required placeholder="naam@bedrijf.nl"></label>
        <label>Wachtwoord<input id="auth-password" type="password" autocomplete="current-password" required minlength="6" placeholder="Minimaal 6 tekens"></label>
        <button id="auth-submit" class="auth-primary" type="submit">Inloggen</button>
      </form>
      <button id="auth-toggle" class="auth-link" type="button">Nog geen account? Account aanmaken</button>
      <p id="auth-message" class="auth-message" aria-live="polite"></p>
    </div>
  `
  document.body.appendChild(gate)

  const style = document.createElement('style')
  style.textContent = `
    #auth-gate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;background:#07101d;color:#eef4ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .auth-card{width:min(440px,100%);background:#0d1828;border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:32px;box-shadow:0 24px 80px rgba(0,0,0,.45)}
    .auth-brand{display:flex;align-items:center;gap:12px;margin-bottom:34px}.auth-brand strong{display:block;font-size:16px}.auth-brand span{display:block;color:#8fa0b8;font-size:12px;margin-top:3px}.auth-mark{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:#dce9ff;color:#07101d;font-weight:800}
    .auth-eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#7e95b4}.auth-card h1{margin:8px 0 8px;font-size:30px}.auth-card>p{color:#94a5bb;line-height:1.5;margin:0 0 24px}
    #auth-form{display:grid;gap:16px}.auth-card label{display:grid;gap:7px;font-size:13px;color:#b8c5d7}.auth-card input{width:100%;box-sizing:border-box;padding:12px 13px;border-radius:10px;border:1px solid #2a3b52;background:#091321;color:#eef4ff;outline:none}.auth-card input:focus{border-color:#7aa7e8}
    .auth-primary{margin-top:4px;padding:13px;border:0;border-radius:10px;background:#eef4ff;color:#07101d;font-weight:700;cursor:pointer}.auth-primary:disabled{opacity:.6;cursor:wait}.auth-link{margin-top:18px;border:0;background:none;color:#9fc2f4;cursor:pointer;padding:4px 0}.auth-message{min-height:20px!important;margin:14px 0 0!important;color:#9fc2f4!important;font-size:13px!important}.auth-message.error{color:#ff9d9d!important}
    @media(max-width:600px){#auth-gate{padding:16px}.auth-card{padding:24px;border-radius:18px}}
  `
  document.head.appendChild(style)

  const title = document.getElementById('auth-title') as HTMLElement
  const description = document.getElementById('auth-description') as HTMLElement
  const form = document.getElementById('auth-form') as HTMLFormElement
  const email = document.getElementById('auth-email') as HTMLInputElement
  const password = document.getElementById('auth-password') as HTMLInputElement
  const submit = document.getElementById('auth-submit') as HTMLButtonElement
  const toggle = document.getElementById('auth-toggle') as HTMLButtonElement
  const message = document.getElementById('auth-message') as HTMLElement

  let signUpMode = false

  function renderMode() {
    title.textContent = signUpMode ? 'Account aanmaken' : 'Inloggen'
    description.textContent = signUpMode
      ? 'Maak een account aan om operaties veilig in Supabase op te slaan.'
      : 'Log in om je operaties veilig op te slaan en later verder te gaan.'
    submit.textContent = signUpMode ? 'Account aanmaken' : 'Inloggen'
    toggle.textContent = signUpMode ? 'Al een account? Inloggen' : 'Nog geen account? Account aanmaken'
    password.autocomplete = signUpMode ? 'new-password' : 'current-password'
    message.textContent = ''
    message.classList.remove('error')
  }

  toggle.addEventListener('click', () => {
    signUpMode = !signUpMode
    renderMode()
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    submit.disabled = true
    message.textContent = signUpMode ? 'Account wordt aangemaakt…' : 'Bezig met inloggen…'
    message.classList.remove('error')

    const result = signUpMode
      ? await client.auth.signUp({
          email: email.value.trim(),
          password: password.value,
          options: { emailRedirectTo: window.location.origin },
        })
      : await client.auth.signInWithPassword({
          email: email.value.trim(),
          password: password.value,
        })

    submit.disabled = false

    if (result.error) {
      message.textContent = result.error.message
      message.classList.add('error')
      return
    }

    if (signUpMode && !result.data.session) {
      message.textContent = 'Account aangemaakt. Controleer je e-mail om je account te bevestigen.'
      form.reset()
      return
    }

    gate.remove()
  })

  client.auth.getSession().then(({ data }) => {
    if (data.session) gate.remove()
  })

  client.auth.onAuthStateChange((_event, session) => {
    if (session) gate.remove()
  })
}
