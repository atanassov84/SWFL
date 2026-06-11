// ===== STATE =====
const transactions = [
  { type: 'in', icon: '💼', name: 'Dividende Nestlé SA', note: 'Quartalsausschüttung Q4', amount: '+18.420,00', date: '10.06.2024' },
  { type: 'in', icon: '📈', name: 'ETF-Ausschüttung iShares', note: 'MSCI World Div.', amount: '+6.240,00', date: '08.06.2024' },
  { type: 'out', icon: '🏡', name: 'Penthouse München', note: 'Nebenkosten Mai', amount: '-3.200,00', date: '05.06.2024' },
  { type: 'in', icon: '🏦', name: 'Zinsgutschrift', note: 'Tagesgeldkonto 3,2%', amount: '+4.000,00', date: '03.06.2024' },
  { type: 'out', icon: '✈️', name: 'Emirates Business Class', note: 'Dubai – München Rückflug', amount: '-12.800,00', date: '01.06.2024' },
  { type: 'in', icon: '💰', name: 'Mieteinnahmen', note: 'Objekt Maxvorstadt 12', amount: '+8.500,00', date: '30.05.2024' },
  { type: 'out', icon: '🚗', name: 'Porsche Zentrum München', note: 'Service & Detailing', amount: '-4.200,00', date: '28.05.2024' },
  { type: 'in', icon: '📊', name: 'Depot-Gewinn realisiert', note: 'Apple Teilverkauf', amount: '+52.300,00', date: '25.05.2024' },
  { type: 'out', icon: '🍽', name: 'Tantris Restaurant', note: 'Business Dinner', amount: '-890,00', date: '22.05.2024' },
  { type: 'out', icon: '🌴', name: 'Hotel Burj Al Arab', note: 'Aufenthalt 3 Nächte', amount: '-18.600,00', date: '18.05.2024' },
];

// ===== INIT =====
window.onload = () => {
  const d = new Date();
  const el = document.getElementById('currentDate');
  if (el) el.textContent = d.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const dateInput = document.getElementById('transferDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  renderTransactions();
};

// ===== LOGIN =====
function doLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if (!user || !pass) { showToast('Bitte Benutzername und PIN eingeben.'); return; }

  const btn = document.querySelector('#loginPage .btn-primary');
  btn.textContent = 'Anmelden…';
  btn.disabled = true;

  setTimeout(() => {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.body.classList.remove('login-body');
    showToast('✓ Erfolgreich angemeldet. Willkommen, Alexander!');
  }, 1400);
}

function logout() {
  if (!confirm('Möchten Sie sich wirklich abmelden?')) return;
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
  document.body.classList.add('login-body');
  const btn = document.querySelector('#loginPage .btn-primary');
  btn.textContent = 'Anmelden';
  btn.disabled = false;
  showToast('Sie wurden sicher abgemeldet.');
}

// ===== NAVIGATION =====
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(name).classList.add('active');
  const navItems = document.querySelectorAll('.nav-item');
  const map = { overview: 0, transfer: 1, cards: 2, invest: 3, settings: 4 };
  if (map[name] !== undefined) navItems[map[name]].classList.add('active');
}

// ===== TRANSACTIONS =====
function renderTransactions(list = transactions) {
  const container = document.getElementById('transactionList');
  if (!container) return;
  container.innerHTML = list.map(tx => `
    <div class="transaction-item" onclick="showTxDetail('${tx.name}')">
      <div class="tx-icon ${tx.type}">${tx.icon}</div>
      <div class="tx-info">
        <div class="tx-name">${tx.name}</div>
        <div class="tx-note">${tx.note}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${tx.type}">${tx.amount} €</div>
        <div class="tx-date">${tx.date}</div>
      </div>
    </div>
  `).join('');
}

function showAllTransactions() {
  showToast('Alle Umsätze werden geladen…');
}

function showTxDetail(name) {
  showToast(`Umsatzdetails: ${name}`);
}

// ===== TRANSFER =====
function executeTransfer() {
  const name = document.getElementById('recipientName').value.trim();
  const iban = document.getElementById('recipientIban').value.trim();
  const amount = document.getElementById('transferAmount').value;
  const note = document.getElementById('transferNote').value.trim();

  if (!name || !iban || !amount) {
    showToast('⚠ Bitte alle Pflichtfelder ausfüllen.'); return;
  }
  if (parseFloat(amount) <= 0) {
    showToast('⚠ Bitte einen gültigen Betrag eingeben.'); return;
  }

  document.getElementById('tanModal').classList.remove('hidden');
}

function closeTan() {
  document.getElementById('tanModal').classList.add('hidden');
}

function confirmTan() {
  const tan = document.getElementById('tanInput').value.trim();
  if (tan.length < 4) { showToast('⚠ Bitte gültige TAN eingeben.'); return; }

  const amount = document.getElementById('transferAmount').value;
  const name = document.getElementById('recipientName').value.trim();
  const note = document.getElementById('transferNote').value.trim() || 'Überweisung';

  document.getElementById('tanModal').classList.add('hidden');

  // show success inside transfer section
  const section = document.getElementById('transfer');
  section.innerHTML = `
    <div class="success-screen">
      <div class="success-icon">✅</div>
      <h2>Überweisung erfolgreich!</h2>
      <p>Ihre Überweisung wurde erfolgreich ausgeführt.</p>
      <div class="success-detail">
        <div><span>Empfänger</span><strong>${name}</strong></div>
        <div><span>Betrag</span><strong>${parseFloat(amount).toLocaleString('de-DE', {minimumFractionDigits:2})} EUR</strong></div>
        <div><span>Verwendungszweck</span><strong>${note}</strong></div>
        <div><span>Ausführungsdatum</span><strong>Heute</strong></div>
        <div><span>Referenznummer</span><strong>LB${Date.now().toString().slice(-8)}</strong></div>
        <div><span>Status</span><strong style="color:var(--green)">Ausgeführt</strong></div>
      </div>
      <button class="btn-primary" onclick="resetTransfer()" style="max-width:260px;margin:0 auto">Neue Überweisung</button>
    </div>
  `;
}

function resetTransfer() {
  showSection('transfer');
  // reload the section
  location.reload();
}

function clearTransfer() {
  document.getElementById('recipientName').value = '';
  document.getElementById('recipientIban').value = '';
  document.getElementById('transferAmount').value = '';
  document.getElementById('transferNote').value = '';
  showToast('Formular zurückgesetzt.');
}

// ===== ACCOUNT MODALS =====
function openAccountDetail() {
  document.getElementById('accountModal').classList.remove('hidden');
}
function openSavingsDetail() {
  showToast('Tagesgeldkonto – Zinsgutschrift nächste Woche');
}
function openDepotDetail() {
  showSection('invest');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
function copyIBAN() {
  navigator.clipboard?.writeText('DE82500105170648489200').catch(() => {});
  showToast('✓ IBAN in Zwischenablage kopiert');
  closeModal('accountModal');
}

// ===== DAUERAUFTRAG =====
function showDauerauftrag() {
  showToast('Daueraufträge werden geladen…');
  setTimeout(() => showSection('transfer'), 800);
}

// ===== INVEST =====
function showPositionDetail(name) {
  showToast(`Kursdetails: ${name} werden geladen…`);
}

// ===== CARDS =====
function showCardNotif(msg) {
  showToast(`✓ ${msg}`);
}

// ===== SETTINGS =====
function showSettingNotif(msg) {
  showToast(`${msg} wird geöffnet…`);
}

// ===== PDF =====
function downloadPDF() {
  showToast('📄 Kontoauszug wird erstellt…');
  setTimeout(() => showToast('✓ Kontoauszug bereit zum Download'), 1500);
}

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.add('hidden');
  }
});

// Enter key on login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.getElementById('loginPage').classList.contains('hidden')) {
    doLogin();
  }
});
