/* ============================================================
   SkillPilot – Premium Quiz Platform
   Main Application Script
   ============================================================ */

'use strict';

const memoryStore = {};
const storage = {
  get(key, fallback = null) {
    try {
      const store = globalThis.localStorage;
      if (store) return store.getItem(key) ?? fallback;
    } catch (_) {}
    return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : fallback;
  },
  set(key, value) {
    const stringValue = String(value);
    try {
      const store = globalThis.localStorage;
      if (store) {
        store.setItem(key, stringValue);
        return;
      }
    } catch (_) {}
    memoryStore[key] = stringValue;
  }
};

// ── State ────────────────────────────────────────────────────
const state = {
  page: 'dashboard',
  theme: storage.get('sp-theme', 'light'),
  nickname: storage.get('sp-nick', 'Alex M.'),
  xp: parseInt(storage.get('sp-xp', '1240')),
  streak: parseInt(storage.get('sp-streak', '7')),
  quizStreak: 0,
  currentQ: 0,
  selected: [],
  answered: false,
  timerInterval: null,
  timerSeconds: 60,
  countdownInterval: null,
  quizMode: 'all',
  quizSearch: '',
  selectedCategory: null,
  showLobby: true,
  checkoutPlan: 'pro',
  accountPanel: 'profile',
  activityPeriod: 'week',
  examDate: storage.get('sp-exam-date', '2026-07-15'),
  history: JSON.parse(storage.get('sp-history', '[]')),
  totalCorrect: parseInt(storage.get('sp-correct', '0')),
  totalAnswered: parseInt(storage.get('sp-answered', '0')),
  filteredQuestions: [],
  quizActive: false,
};

// ── Questions Bank ────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    chapter: '§34d GewO Grundlagen',
    chapterKey: 'grundlagen',
    text: 'Welche Voraussetzungen muss ein Versicherungsvermittler für die Erlaubniserteilung nach §34d GewO nachweisen?',
    type: 'multi',
    difficulty: 'medium',
    options: [
      'Persönliche Zuverlässigkeit',
      'Geordnete Vermögensverhältnisse',
      'Sachkundenachweis (IHK)',
      'Hochschulstudium der Betriebswirtschaft',
      'Berufshaftpflichtversicherung',
    ],
    correct: [0, 1, 2, 4],
    explanation: 'Gemäß §34d GewO sind persönliche Zuverlässigkeit, geordnete Vermögensverhältnisse, der Sachkundenachweis (IHK-Prüfung) sowie eine Berufshaftpflichtversicherung Pflichtvoraussetzungen. Ein Hochschulstudium ist nicht erforderlich.',
  },
  {
    id: 2,
    chapter: '§34d GewO Grundlagen',
    chapterKey: 'grundlagen',
    text: 'Was ist der wesentliche Unterschied zwischen einem Versicherungsmakler und einem Versicherungsvertreter?',
    type: 'single',
    difficulty: 'easy',
    options: [
      'Der Makler vertritt die Interessen des Versicherers, der Vertreter die des Kunden',
      'Der Makler vertritt treuhänderisch die Interessen des Kunden, der Vertreter ist an einen oder mehrere Versicherer gebunden',
      'Es gibt keinen rechtlichen Unterschied',
      'Nur der Vertreter benötigt eine IHK-Zulassung',
    ],
    correct: [1],
    explanation: 'Der Versicherungsmakler ist rechtlich als Sachwalter des Kunden tätig und handelt in dessen Interesse. Der Vertreter (§84 HGB) ist dagegen für einen oder mehrere Versicherer tätig und hat damit eine andere Interessenlage.',
  },
  {
    id: 3,
    chapter: 'Beratung & Dokumentation',
    chapterKey: 'beratung',
    text: 'Welche Pflichten hat ein Versicherungsvermittler gegenüber dem Kunden im Beratungsgespräch?',
    type: 'multi',
    difficulty: 'medium',
    options: [
      'Beratungspflicht auf Basis der Kundenangaben',
      'Dokumentationspflicht des Beratungsgesprächs',
      'Informationspflicht über Vergütung',
      'Pflicht zur ausschließlichen Empfehlung teurer Produkte',
      'Pflicht zur Übergabe eines Beratungsprotokolls',
    ],
    correct: [0, 1, 2, 4],
    explanation: 'Vermittler müssen den Kunden bedarfsgerecht beraten, das Gespräch dokumentieren, die eigene Vergütung offenlegen und ein Beratungsprotokoll aushändigen. Die Empfehlung teurer Produkte ist keine gesetzliche Pflicht.',
  },
  {
    id: 4,
    chapter: 'Beratung & Dokumentation',
    chapterKey: 'beratung',
    text: 'Was versteht man unter der "Bedarfsermittlung" im Versicherungsvertrieb?',
    type: 'single',
    difficulty: 'easy',
    options: [
      'Die Ermittlung des günstigsten Versicherungstarifs am Markt',
      'Die systematische Analyse der Lebenssituation und Risikolage des Kunden zur Bestimmung des Versicherungsbedarfs',
      'Die Überprüfung der Kreditwürdigkeit des Kunden',
      'Die Berechnung der Versicherungsprämie',
    ],
    correct: [1],
    explanation: 'Die Bedarfsermittlung ist ein zentraler Schritt der Beratung: Der Vermittler analysiert Lebenssituation, vorhandene Absicherungen und Risiken des Kunden, um den tatsächlichen Versicherungsbedarf zu ermitteln.',
  },
  {
    id: 5,
    chapter: 'Beratung & Dokumentation',
    chapterKey: 'beratung',
    text: 'Welche Angaben müssen im Beratungsprotokoll nach VVG enthalten sein?',
    type: 'multi',
    difficulty: 'hard',
    options: [
      'Anlass und Gegenstand der Beratung',
      'Die persönlichen Wünsche des Kunden',
      'Der Name des Beraters und das Datum',
      'Die Privatanschrift des Vermittlers',
      'Begründung der gegebenen Empfehlung',
    ],
    correct: [0, 1, 2, 4],
    explanation: 'Das Beratungsprotokoll muss Anlass, Gegenstand, Kundenwünsche, Beraterangaben (Name, Datum) und die Begründung der Empfehlung enthalten. Die Privatanschrift des Vermittlers ist nicht erforderlich.',
  },
  {
    id: 6,
    chapter: 'Lebensversicherung',
    chapterKey: 'leben',
    text: 'Was ist eine Risikolebensversicherung?',
    type: 'single',
    difficulty: 'easy',
    options: [
      'Eine Lebensversicherung mit Sparanteil und garantiertem Auszahlungsbetrag',
      'Eine Versicherung, die ausschließlich im Todesfall eine Leistung erbringt, ohne Sparanteil',
      'Eine Versicherung gegen Berufsunfähigkeitsrisiken',
      'Eine Versicherung für Hochrisikoberufe',
    ],
    correct: [1],
    explanation: 'Die Risikolebensversicherung sichert ausschließlich das Todesfallrisiko ab. Es gibt keinen Sparanteil – stirbt der Versicherte, wird die Versicherungssumme ausgezahlt; erlebt er das Vertragsende, gibt es keine Leistung.',
  },
  {
    id: 7,
    chapter: 'Lebensversicherung',
    chapterKey: 'leben',
    text: 'Welche Merkmale kennzeichnen eine kapitalbildende Lebensversicherung?',
    type: 'multi',
    difficulty: 'medium',
    options: [
      'Kombination aus Risikoabsicherung und Sparanteil',
      'Garantierte Mindestverzinsung',
      'Überschussbeteiligung',
      'Keine Todesfallleistung',
      'Auszahlung bei Vertragsende oder Todesfall',
    ],
    correct: [0, 1, 2, 4],
    explanation: 'Die kapitalbildende Lebensversicherung verbindet Risikoabsicherung mit einem Sparanteil. Sie bietet eine garantierte Mindestverzinsung, Überschussbeteiligung und zahlt sowohl bei Erleben des Vertragsendes als auch im Todesfall.',
  },
  {
    id: 8,
    chapter: 'Berufsunfähigkeit',
    chapterKey: 'bu',
    text: 'Was versteht man unter dem Begriff "Berufsunfähigkeit" im Versicherungssinne?',
    type: 'single',
    difficulty: 'medium',
    options: [
      'Jede vorübergehende Arbeitsunfähigkeit durch Krankheit',
      'Die dauerhafte Unfähigkeit, eine beliebige Tätigkeit auszuüben',
      'Die Unfähigkeit, den zuletzt ausgeübten Beruf zu mindestens 50% auszuüben, voraussichtlich dauerhaft',
      'Der vollständige Verlust aller körperlichen Fähigkeiten',
    ],
    correct: [2],
    explanation: 'Berufsunfähigkeit liegt vor, wenn der Versicherte seinen zuletzt ausgeübten Beruf infolge Krankheit, Körperverletzung oder Kräfteverfalls voraussichtlich dauerhaft (i.d.R. ab 6 Monate) zu mindestens 50% nicht mehr ausüben kann.',
  },
  {
    id: 9,
    chapter: 'Berufsunfähigkeit',
    chapterKey: 'bu',
    text: 'Welche Voraussetzungen müssen für den Bezug von Berufsunfähigkeitsleistungen erfüllt sein?',
    type: 'multi',
    difficulty: 'hard',
    options: [
      'Mindestens 50% Berufsunfähigkeit',
      'Arztliche Feststellung der Berufsunfähigkeit',
      'Voraussichtlich dauerhafter Zustand',
      'Mindestalter von 60 Jahren',
      'Einhaltung der vertraglichen Wartezeit',
    ],
    correct: [0, 1, 2, 4],
    explanation: 'Leistungsvoraussetzungen sind mindestens 50% BU, ärztliche Feststellung, voraussichtliche Dauerhaftigkeit und die Einhaltung einer etwaigen Wartezeit. Ein Mindestalter von 60 Jahren ist keine Voraussetzung.',
  },
  {
    id: 10,
    chapter: 'Altersvorsorge',
    chapterKey: 'altersvorsorge',
    text: 'Was ist die gesetzliche Rentenversicherung in Deutschland?',
    type: 'single',
    difficulty: 'easy',
    options: [
      'Eine freiwillige private Vorsorge für Selbstständige',
      'Ein staatliches Pflichtversicherungssystem für Arbeitnehmer, finanziert im Umlageverfahren',
      'Ein kapitalgedecktes System wie ein Aktienfonds',
      'Eine betriebliche Altersvorsorge',
    ],
    correct: [1],
    explanation: 'Die gesetzliche Rentenversicherung ist ein Pflichtversicherungssystem für Arbeitnehmer, das im Umlageverfahren funktioniert: Die Beiträge der heutigen Erwerbstätigen finanzieren direkt die Renten der heutigen Rentner.',
  },
  {
    id: 11,
    chapter: 'Altersvorsorge',
    chapterKey: 'altersvorsorge',
    text: 'Welche Steuervorteile bietet die betriebliche Altersvorsorge (bAV)?',
    type: 'multi',
    difficulty: 'hard',
    options: [
      'Beiträge aus Entgeltumwandlung sind sozialabgabenfrei bis 4% der BBG',
      'Steuerfreiheit der Beiträge bis 8% der Beitragsbemessungsgrenze',
      'Vollständige Steuerfreiheit der Rentenleistungen',
      'Arbeitgeberzuschuss ist Pflicht bei Entgeltumwandlung',
      'Keine Besteuerung bei Auszahlung',
    ],
    correct: [0, 1, 3],
    explanation: 'Bei der bAV sind Beiträge bis 4% der BBG sozialversicherungsfrei und bis 8% der BBG steuerbefreit. Seit 2022 ist ein Arbeitgeberzuschuss von 15% Pflicht. Die Rentenleistungen werden hingegen voll nachgelagert besteuert.',
  },
  {
    id: 12,
    chapter: 'Altersvorsorge',
    chapterKey: 'altersvorsorge',
    text: 'Was ist Entgeltumwandlung?',
    type: 'single',
    difficulty: 'medium',
    options: [
      'Der Tausch von Urlaubstagen gegen Gehalt',
      'Die Umwandlung von Teilen des Bruttogehalts in Beiträge zur betrieblichen Altersvorsorge',
      'Eine Gehaltserhöhung durch den Arbeitgeber',
      'Die Übertragung von Rentenansprüchen auf Familienangehörige',
    ],
    correct: [1],
    explanation: 'Bei der Entgeltumwandlung verzichtet der Arbeitnehmer auf einen Teil seines Bruttogehalts, der stattdessen als Beitrag in eine betriebliche Altersversorgung eingezahlt wird. Dies reduziert das zu versteuernde Einkommen.',
  },
  {
    id: 13,
    chapter: 'Sachversicherung',
    chapterKey: 'sach',
    text: 'Was deckt eine Privathaftpflichtversicherung ab?',
    type: 'multi',
    difficulty: 'medium',
    options: [
      'Personen- und Sachschäden, die der Versicherte anderen zufügt',
      'Eigenschäden des Versicherungsnehmers',
      'Vermögensschäden, die aus Personen- oder Sachschäden folgen',
      'Vorsätzlich herbeigeführte Schäden',
      'Prüfung unberechtigter Schadensersatzforderungen',
    ],
    correct: [0, 2, 4],
    explanation: 'Die Privathaftpflicht übernimmt Personen- und Sachschäden Dritter, daraus folgende Vermögensschäden sowie die Abwehr unberechtigter Ansprüche. Eigenschäden und vorsätzlich verursachte Schäden sind ausgeschlossen.',
  },
  {
    id: 14,
    chapter: 'Kfz-Versicherung',
    chapterKey: 'kfz',
    text: 'Was ist bei der Kfz-Haftpflichtversicherung in Deutschland gesetzlich vorgeschrieben?',
    type: 'single',
    difficulty: 'easy',
    options: [
      'Eine Vollkaskoversicherung ist Pflicht',
      'Die Kfz-Haftpflichtversicherung ist für alle motorisierten Fahrzeuge im Straßenverkehr Pflicht',
      'Nur Fahrzeuge über 50 PS benötigen eine Pflichtversicherung',
      'Die Versicherungspflicht gilt nur für Fahrten im Ausland',
    ],
    correct: [1],
    explanation: 'Gemäß PflVG ist die Kfz-Haftpflichtversicherung für alle Kraftfahrzeuge, die am öffentlichen Straßenverkehr teilnehmen, Pflicht. Ohne Versicherungsschutz ist keine Zulassung möglich.',
  },
  {
    id: 15,
    chapter: 'Kfz-Versicherung',
    chapterKey: 'kfz',
    text: 'Was versteht man unter Kaskoversicherung?',
    type: 'single',
    difficulty: 'easy',
    options: [
      'Versicherung gegen Schäden an fremden Fahrzeugen',
      'Versicherung gegen Schäden am eigenen Fahrzeug (Teilkasko: Naturgewalten, Diebstahl; Vollkasko: zusätzlich Unfall, Vandalism)',
      'Eine Haftpflichtversicherung für Bootseigner',
      'Eine Versicherung für Reisegepäck im Fahrzeug',
    ],
    correct: [1],
    explanation: 'Die Kaskoversicherung schützt das eigene Fahrzeug. Teilkasko deckt Schäden durch Naturgewalten, Diebstahl, Glasbruch etc. Die Vollkasko deckt zusätzlich selbstverschuldete Unfallschäden und Vandalismus.',
  },
  {
    id: 16,
    chapter: 'Sachversicherung',
    chapterKey: 'sach',
    text: 'Was deckt eine Hausratversicherung ab?',
    type: 'multi',
    difficulty: 'medium',
    options: [
      'Einbruchdiebstahl und Vandalism',
      'Schäden durch Leitungswasser',
      'Feuer, Blitzschlag und Explosion',
      'Sturmschäden ab Windstärke 8',
      'Das Gebäude selbst und seine Außenwände',
    ],
    correct: [0, 1, 2, 3],
    explanation: 'Die Hausratversicherung deckt den beweglichen Hausrat gegen Feuer, Leitungswasser, Einbruch/Diebstahl, Sturm (ab Windstärke 8) und weitere Risiken. Das Gebäude selbst ist nicht Bestandteil – dafür gibt es die Wohngebäudeversicherung.',
  },
  {
    id: 17,
    chapter: 'Sachversicherung',
    chapterKey: 'sach',
    text: 'Was ist der zentrale Unterschied zwischen Gebäude- und Hausratversicherung?',
    type: 'single',
    difficulty: 'easy',
    options: [
      'Es gibt keinen Unterschied – beide decken dasselbe ab',
      'Die Gebäudeversicherung schützt das Gebäude und dessen feste Bestandteile; die Hausratversicherung schützt den beweglichen Inhalt',
      'Die Hausratversicherung ist nur für Mieter, die Gebäudeversicherung nur für Eigentümer',
      'Die Gebäudeversicherung ist freiwillig, die Hausratversicherung ist Pflicht',
    ],
    correct: [1],
    explanation: 'Die Wohngebäudeversicherung schützt das Gebäude selbst, also Mauern, Dach, fest eingebaute Einrichtungen. Die Hausratversicherung deckt dagegen den beweglichen Inhalt ab, z.B. Möbel, Elektrogeräte, Kleidung.',
  },
  {
    id: 18,
    chapter: 'Berufsunfähigkeit',
    chapterKey: 'bu',
    text: 'Was ist eine Berufsunfähigkeitszusatzversicherung (BUZ)?',
    type: 'single',
    difficulty: 'medium',
    options: [
      'Eine eigenständige BU-Versicherung',
      'Eine BU-Absicherung, die als Zusatz zu einer Lebens- oder Rentenversicherung abgeschlossen wird',
      'Eine staatliche Ergänzungsleistung zur Erwerbsminderungsrente',
      'Eine Unfallversicherung für berufliche Risiken',
    ],
    correct: [1],
    explanation: 'Die BUZ ist eine Berufsunfähigkeitsversicherung, die als Rider (Zusatzbaustein) an eine Hauptversicherung (z.B. Risikoleben oder Rentenversicherung) gekoppelt wird. Bei BU werden Beiträge der Hauptversicherung übernommen und/oder eine BU-Rente gezahlt.',
  },
  {
    id: 19,
    chapter: 'Krankenversicherung',
    chapterKey: 'kranken',
    text: 'Welche Leistungen bietet die gesetzliche Krankenversicherung (GKV) ihren Versicherten?',
    type: 'multi',
    difficulty: 'medium',
    options: [
      'Ambulante und stationäre Behandlung',
      'Zahnärztliche Versorgung (Basisleistungen)',
      'Unbegrenzte Chefarztbehandlung ohne Zuzahlung',
      'Krankengeld ab der 7. Woche',
      'Vorsorgeuntersuchungen und Schutzimpfungen',
    ],
    correct: [0, 1, 3, 4],
    explanation: 'Die GKV umfasst ambulante/stationäre Behandlung, zahnärztliche Basisversorgung, Krankengeld (ab 7. Woche bei Arbeitsunfähigkeit), sowie Vorsorge und Impfungen. Eine unbegrenzte Chefarztbehandlung ohne Zuzahlung ist kein GKV-Leistungsanspruch.',
  },
  {
    id: 20,
    chapter: 'Krankenversicherung',
    chapterKey: 'kranken',
    text: 'Was ist eine private Krankenversicherung (PKV)?',
    type: 'single',
    difficulty: 'easy',
    options: [
      'Eine Zusatzversicherung, die nur für GKV-Versicherte zugänglich ist',
      'Ein System mit einkommensabhängigen Beiträgen',
      'Eine Krankenversicherung mit risikoadäquaten Beiträgen und individuell vereinbartem Leistungsumfang, zugänglich für Selbstständige und Arbeitnehmer ab der Versicherungspflichtgrenze',
      'Eine staatliche Versicherung für Beamte',
    ],
    correct: [2],
    explanation: 'Die PKV ist ein privatrechtliches System: Beiträge richten sich nach Alter, Gesundheitszustand und gewähltem Tarif – nicht nach dem Einkommen. Zugang haben Selbstständige und Arbeitnehmer, die die Jahresarbeitsentgeltgrenze überschreiten.',
  },
  {
    id: 21,
    chapter: '§34d GewO Grundlagen',
    chapterKey: 'grundlagen',
    text: 'Wer ist zur Eintragung im Versicherungsvermittlerregister (DIHK) verpflichtet?',
    type: 'single',
    difficulty: 'medium',
    options: [
      'Nur Versicherungsmakler mit mehr als 100 Kunden',
      'Alle erlaubnispflichtigen Versicherungsvermittler und -berater nach §34d GewO',
      'Nur Versicherungsgesellschaften',
      'Ausschließlich Finanzdienstleister nach KWG',
    ],
    correct: [1],
    explanation: 'Alle nach §34d GewO erlaubnispflichtigen Versicherungsvermittler (Makler, Mehrfachagenten) und Versicherungsberater sind verpflichtet, sich im Vermittlerregister einzutragen. Dieses wird beim DIHK geführt.',
  },
  {
    id: 22,
    chapter: '§34d GewO Grundlagen',
    chapterKey: 'grundlagen',
    text: 'Was versteht man unter einer "Nettopolice" im Versicherungsvertrieb?',
    type: 'single',
    difficulty: 'hard',
    options: [
      'Eine günstige Einsteigerpolice ohne Extras',
      'Ein Versicherungsvertrag, bei dem keine Abschluss- und Vertriebsprovisionen in den Prämien enthalten sind; der Vermittler erhält stattdessen ein separates Honorar',
      'Eine Police mit Nettobeiträgen nach Steuerabzug',
      'Eine Police ohne Todesfall-Schutz',
    ],
    correct: [1],
    explanation: 'Die Nettopolice (auch: Honorarpolice) ist provisionsfrei: Der Versicherer zahlt keine Provision. Stattdessen schließt der Kunde einen separaten Beratervertrag und zahlt dem Vermittler ein Honorar direkt. Dies soll Interessenkonflikte reduzieren.',
  },
];

const CATEGORY_META = {
  grundlagen: {
    title: '§34d Grundlagen',
    subtitle: 'Erlaubnis, Register, Makler vs. Vertreter',
    icon: '⚖️',
    color: 'blue',
    search: '',
  },
  beratung: {
    title: 'Beratung & Dokumentation',
    subtitle: 'Bedarfsermittlung, Protokoll, Vergütung',
    icon: '📝',
    color: 'violet',
    search: '',
  },
  leben: {
    title: 'Lebensversicherung',
    subtitle: 'Risiko, Kapitalbildung, Überschüsse',
    icon: '🛡️',
    color: 'green',
    search: '',
  },
  bu: {
    title: 'Berufsunfähigkeit',
    subtitle: 'BU, BUZ, Leistungsvoraussetzungen',
    icon: '🧑‍⚕️',
    color: 'amber',
    search: '',
  },
  altersvorsorge: {
    title: 'Altersvorsorge',
    subtitle: 'bAV, Rentenversicherung, Entgeltumwandlung',
    icon: '🏦',
    color: 'red',
    search: '',
  },
  haftpflicht: {
    title: 'Haftpflicht',
    subtitle: 'Privathaftpflicht, Ansprüche, Ausschlüsse',
    icon: '🤝',
    color: 'teal',
    chapterKey: 'sach',
    search: 'haftpflicht',
  },
  hausrat: {
    title: 'Hausrat',
    subtitle: 'Einbruch, Leitungswasser, Feuer, Sturm',
    icon: '🏠',
    color: 'blue',
    chapterKey: 'sach',
    search: 'hausrat',
  },
  sach: {
    title: 'Sachversicherung gesamt',
    subtitle: 'Hausrat, Gebäude, Haftpflicht gemischt',
    icon: '📦',
    color: 'violet',
    search: '',
  },
  kfz: {
    title: 'Kfz-Versicherung',
    subtitle: 'Haftpflicht, Teilkasko, Vollkasko',
    icon: '🚗',
    color: 'green',
    search: '',
  },
  kranken: {
    title: 'Krankenversicherung',
    subtitle: 'GKV, PKV, Leistungen, Grenzen',
    icon: '🏥',
    color: 'red',
    search: '',
  },
};

// ── Leaderboard data ─────────────────────────────────────────
const LEADERBOARD = [
  { name: 'Sarah K.',  xp: 4820, score: 96, delta: +2, color: '#7C3AED' },
  { name: 'Jonas M.', xp: 4410, score: 94, delta: +1, color: '#2563EB' },
  { name: 'Lena B.',  xp: 3980, score: 91, delta: -1, color: '#059669' },
  { name: 'Max W.',   xp: 3640, score: 89, delta: 0,  color: '#D97706' },
  { name: 'Lea F.',   xp: 3200, score: 86, delta: +3, color: '#DC2626' },
  { name: 'Tim H.',   xp: 2890, score: 84, delta: -2, color: '#0891B2' },
  { name: 'Anna S.',  xp: 2540, score: 81, delta: +1, color: '#7C3AED' },
  { name: state.nickname, xp: state.xp, score: Math.round(state.xp / 50), delta: +1, isMe: true, color: '#2563EB' },
  { name: 'Klaus R.', xp: 1100, score: 72, delta: 0,  color: '#059669' },
  { name: 'Petra N.', xp:  840, score: 68, delta: -1, color: '#D97706' },
];

// Sort leaderboard
LEADERBOARD.sort((a, b) => b.xp - a.xp);

const PLANS = {
  pro: {
    name: 'SkillPilot Pro',
    price: '19,99€',
    interval: 'Monat',
    priceId: 'price_pro_monthly_demo',
    features: ['Unbegrenzte Fragen', 'KI-Coach Max', 'Alle Kapitel', 'PDF-Rechnungen'],
  },
  team: {
    name: 'SkillPilot Team',
    price: '49,00€',
    interval: 'Monat',
    priceId: 'price_team_monthly_demo',
    features: ['Bis 10 Nutzer', 'Team-Ranglisten', 'Admin-Dashboard', 'Fortschrittsberichte'],
  },
};

const INVOICES = [
  { id: 'SP-2026-0003', date: '07.06.2026', plan: 'Testphase', amount: '0,00€', status: 'Bezahlt' },
  { id: 'SP-2026-0002', date: '07.05.2026', plan: 'Pro Demo', amount: '19,99€', status: 'Entwurf' },
  { id: 'SP-2026-0001', date: '07.04.2026', plan: 'Pro Demo', amount: '19,99€', status: 'Bezahlt' },
];

const ACTIVITY_DATA = {
  week: {
    label: 'diese Woche',
    questions: 6,
    correct: 0,
    time: '42m',
    ai: 3,
    risk: 2,
    bars: [
      ['Mo', 34],
      ['Di', 52],
      ['Mi', 22],
      ['Do', 72],
      ['Fr', 44],
      ['Sa', 64],
      ['So', 88],
    ],
  },
  month: {
    label: 'diesen Monat',
    questions: 28,
    correct: 17,
    time: '3h 20m',
    ai: 12,
    risk: 5,
    bars: [
      ['KW 1', 46],
      ['KW 2', 68],
      ['KW 3', 52],
      ['KW 4', 84],
    ],
  },
};

function getExamDate() {
  return new Date(`${state.examDate}T09:00:00`);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  initNav();
  initCookie();
  initAICoach();
  initThemeToggle();
  initNotifications();
  initSidebarCollapse();
  buildDashboard();
  buildLeaderboard();
  buildBilling();
  buildAccount();
  initMobileMenu();
  startCountdown();
  navigateTo(storage.get('sp-demo-auth') === 'logged-in' ? 'dashboard' : 'home');
});

// ── Theme ─────────────────────────────────────────────────────
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  state.theme = t;
  storage.set('sp-theme', t);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
  const mobileBtn = document.getElementById('topbarThemeBtnMobile');
  if (mobileBtn) mobileBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  const moreTheme = document.getElementById('moreThemeIcon');
  if (moreTheme) moreTheme.textContent = t === 'dark' ? '☀️' : '🌙';
}

function initThemeToggle() {
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });
}

// ── Navigation ────────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.page));
  });
  document.querySelectorAll('.period-toggle button[data-period]').forEach(btn => {
    btn.addEventListener('click', () => setActivityPeriod(btn.dataset.period));
  });
}

function navigateTo(pageId) {
  state.page = pageId;
  const isPublicPage = pageId === 'home' || pageId === 'login';
  document.body.classList.toggle('auth-mode', isPublicPage);
  closeTopbarMenus();
  closeMoreSheet();

  // Update nav items
  document.querySelectorAll('.nav-item, .bottom-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });

  // Show page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    // Reset animation
    target.style.animation = 'none';
    requestAnimationFrame(() => { target.style.animation = ''; });
  }

  // Page-specific init
  if (pageId === 'quiz') initQuizPage();
  if (pageId === 'dashboard') refreshDashboard();
  if (pageId === 'leaderboard') animateLeaderboard();
  if (pageId === 'account') buildAccount();
  if (pageId === 'checkout') renderCheckout();

  // Update topbar title
  const titles = { home: 'Startseite', dashboard: 'Zentrale', quiz: 'Training', leaderboard: 'Liga', billing: 'Abo', account: 'Konto', checkout: 'Checkout', login: 'Login' };
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = titles[pageId] || pageId;

  // Close mobile menu
  document.querySelector('.sidebar').classList.remove('mobile-open');
}

function logoutUser() {
  storage.set('sp-demo-auth', 'logged-out');
  navigateTo('home');
}

function loginUser() {
  storage.set('sp-demo-auth', 'logged-in');
  document.body.classList.remove('auth-mode');
  showToast('Willkommen zurück!', '✓');
  navigateTo('dashboard');
}

function toggleTopbarMenu(menu) {
  const ids = { usage: 'usagePopover', profile: 'profilePopover', notif: 'notifPopover' };
  const target = document.getElementById(ids[menu]);
  const willOpen = target && !target.classList.contains('open');
  closeTopbarMenus();
  if (willOpen) target.classList.add('open');
}

// ── Notifications ─────────────────────────────────────────────
let notifState = JSON.parse(localStorage.getItem('sp-notifs') || 'null') || { dismissed: [], read: [] };

function saveNotifState() { localStorage.setItem('sp-notifs', JSON.stringify(notifState)); }

function updateNotifBadge() {
  const unread = document.querySelectorAll('#notifList .notif-item.unread').length;
  const badge = document.getElementById('notifBadge');
  if (badge) { badge.textContent = unread > 0 ? unread : ''; badge.style.display = unread > 0 ? '' : 'none'; }
}

function dismissNotif(btn, id) {
  const item = btn.closest('.notif-item');
  item.style.transition = 'opacity .18s, max-height .22s';
  item.style.opacity = '0';
  item.style.maxHeight = '0';
  item.style.overflow = 'hidden';
  setTimeout(() => {
    item.remove();
    notifState.dismissed.push(id);
    saveNotifState();
    updateNotifBadge();
    checkNotifEmpty();
  }, 220);
}

function markAllNotifRead() {
  document.querySelectorAll('#notifList .notif-item.unread').forEach(el => el.classList.remove('unread'));
  notifState.read = Array.from(document.querySelectorAll('#notifList .notif-item')).map(el => +el.dataset.id);
  saveNotifState();
  updateNotifBadge();
}

function checkNotifEmpty() {
  const list = document.getElementById('notifList');
  if (list && list.children.length === 0) {
    list.innerHTML = '<div class="notif-empty">Keine neuen Benachrichtigungen</div>';
  }
}

function initNotifications() {
  notifState.dismissed.forEach(id => {
    const el = document.querySelector(`#notifList [data-id="${id}"]`);
    if (el) el.remove();
  });
  notifState.read.forEach(id => {
    const el = document.querySelector(`#notifList [data-id="${id}"]`);
    if (el) el.classList.remove('unread');
  });
  checkNotifEmpty();
  updateNotifBadge();
}

function closeTopbarMenus() {
  document.querySelectorAll('.topbar-popover.open').forEach(popover => popover.classList.remove('open'));
}

function toggleMoreSheet() {
  const sheet = document.getElementById('mobileMoreSheet');
  const backdrop = document.getElementById('moreBackdrop');
  const isOpen = sheet && sheet.classList.contains('open');
  closeTopbarMenus();
  if (sheet) sheet.classList.toggle('open', !isOpen);
  if (backdrop) backdrop.classList.toggle('open', !isOpen);
  document.querySelector('.bottom-more-tab')?.classList.toggle('active', !isOpen);
  document.body.classList.toggle('more-open', !isOpen);
}

function closeMoreSheet() {
  const sheet = document.getElementById('mobileMoreSheet');
  const backdrop = document.getElementById('moreBackdrop');
  if (sheet) sheet.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.querySelector('.bottom-more-tab')?.classList.remove('active');
  document.body.classList.remove('more-open');
}

function navigateAndCloseMore(page) {
  closeMoreSheet();
  navigateTo(page);
}

function toggleMoreTopbar(menu) {
  closeMoreSheet();
  setTimeout(() => toggleTopbarMenu(menu), 40);
}

function openMobileSearch() {
  state.showLobby = false;
  state.quizMode = 'all';
  state.quizSearch = '';
  navigateAndCloseMore('quiz');
  setTimeout(() => {
    const input = document.getElementById('quizSearch');
    if (input) input.focus();
  }, 80);
}

function showCategoriesFromHeader() {
  state.showLobby = true;
  state.selectedCategory = null;
  navigateTo('quiz');
  showCategoryLobby();
  setTimeout(() => {
    document.getElementById('categoryLobby')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

function toggleSearch() {
  const popover = document.getElementById('searchPopover');
  const isOpen = popover.classList.contains('open');
  closeTopbarMenus();
  if (!isOpen) {
    popover.classList.add('open');
    initTopbarSearch();
    setTimeout(() => document.getElementById('topbarSearchInput')?.focus(), 60);
  }
}

function closeSearch() {
  const popover = document.getElementById('searchPopover');
  if (popover) popover.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });
});

// wire up search input after DOM ready — attach once
function initTopbarSearch() {
  const input = document.getElementById('topbarSearchInput');
  if (!input || input._bound) return;
  input._bound = true;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) {
        state.quizSearch = q;
        state.quizMode = 'all';
        state.showLobby = false;
        closeSearch();
        navigateTo('quiz');
      }
    }
  });
  input.addEventListener('input', () => {
    const hint = document.getElementById('searchHint');
    if (hint) hint.textContent = input.value.trim()
      ? `Enter → "${input.value.trim()}" in Training suchen`
      : 'Enter drücken → zum Training';
  });
}

document.addEventListener('click', event => {
  if (!event.target.closest('.topbar-menu-wrap')) closeTopbarMenus();
});

// ── Cookie Banner ──────────────────────────────────────────────
function initCookie() {
  if (storage.get('sp-cookie')) return;
  const banner = document.getElementById('cookieBanner');
  setTimeout(() => banner.classList.add('show'), 800);
  document.getElementById('cookieAccept').addEventListener('click', () => {
    banner.style.transform = 'translateY(100%)';
    storage.set('sp-cookie', '1');
  });
  document.getElementById('cookieDecline').addEventListener('click', () => {
    banner.style.transform = 'translateY(100%)';
  });
}

// ── AI Coach ──────────────────────────────────────────────────
function initAICoach() {
  const btn = document.getElementById('aiCoachBtn');
  const panel = document.getElementById('aiCoachPanel');
  btn.addEventListener('click', () => panel.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
}

// ── Mobile Menu ───────────────────────────────────────────────
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      const isMobile = window.matchMedia('(max-width: 640px)').matches;
      if (document.body.classList.contains('sidebar-collapsed')) {
        document.body.classList.remove('sidebar-collapsed');
        const collapseBtn = document.getElementById('sidebarCollapseBtn');
        if (collapseBtn) collapseBtn.classList.remove('is-collapsed');
        storage.set('sp-sidebar-collapsed', '0');
        if (!isMobile) return;
      }
      document.querySelector('.sidebar').classList.toggle('mobile-open');
    });
  }
}

function initSidebarCollapse() {
  const btn = document.getElementById('sidebarCollapseBtn');
  if (!btn) return;
  if (storage.get('sp-sidebar-collapsed') === '1') {
    document.body.classList.add('sidebar-collapsed');
    btn.classList.add('is-collapsed');
  }
}

function toggleSidebarCollapse(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const btn = document.getElementById('sidebarCollapseBtn');
  document.body.classList.toggle('sidebar-collapsed');
  const collapsed = document.body.classList.contains('sidebar-collapsed');
  if (collapsed) document.querySelector('.sidebar').classList.remove('mobile-open');
  if (btn) btn.classList.toggle('is-collapsed', collapsed);
  storage.set('sp-sidebar-collapsed', collapsed ? '1' : '0');
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, icon = '✅', duration = 2800) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Countdown ─────────────────────────────────────────────────
function startCountdown() {
  if (state.countdownInterval) clearInterval(state.countdownInterval);
  function tick() {
    const diff = getExamDate() - Date.now();
    if (diff <= 0) {
      ['cdDays', 'cdHours', 'cdMins', 'cdSecs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      const small = document.getElementById('cdDaysSmall');
      if (small) small.textContent = '0';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val).padStart(2, '0'); };
    setEl('cdDays', d); setEl('cdHours', h); setEl('cdMins', m); setEl('cdSecs', s);
    const small = document.getElementById('cdDaysSmall');
    if (small) small.textContent = String(d);
  }
  tick();
  state.countdownInterval = setInterval(tick, 1000);
}

// ── Dashboard ─────────────────────────────────────────────────
function buildDashboard() {
  buildRadarChart();
  buildProgressRing();
  buildGapList();
}

function refreshDashboard() {
  // Update streak
  const streakEl = document.getElementById('streakCount');
  if (streakEl) streakEl.textContent = state.streak;

  // Update stats
  const xpEl = document.getElementById('dashXp');
  if (xpEl) xpEl.textContent = state.xp.toLocaleString('de');

  const corrEl = document.getElementById('dashCorrect');
  if (corrEl) corrEl.textContent = state.totalCorrect;

  const ansEl = document.getElementById('dashAnswered');
  if (ansEl) ansEl.textContent = state.totalAnswered;

  // Accuracy
  const accEl = document.getElementById('dashAccuracy');
  const acc = state.totalAnswered > 0 ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;
  if (accEl) {
    accEl.textContent = acc + '%';
  }
  renderActivity();

  buildRecentHistory();
  buildProgressRing();
  buildGapList();
  updateReadiness();
}

function setActivityPeriod(period = 'week') {
  state.activityPeriod = ACTIVITY_DATA[period] ? period : 'week';
  renderActivity();
}

function renderActivity() {
  const base = ACTIVITY_DATA[state.activityPeriod] || ACTIVITY_DATA.week;
  const bonusQuestions = state.activityPeriod === 'week'
    ? Math.min(state.totalAnswered, 48)
    : Math.min(state.totalAnswered + 22, 160);
  const bonusCorrect = state.activityPeriod === 'week'
    ? Math.min(state.totalCorrect, 41)
    : Math.min(state.totalCorrect + 17, 128);
  const questions = Math.max(base.questions, bonusQuestions);
  const correct = Math.min(questions, Math.max(base.correct, bonusCorrect));
  const accuracy = questions > 0 ? Math.round((correct / questions) * 100) : 0;

  document.querySelectorAll('.period-toggle button[data-period]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === state.activityPeriod);
  });

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText('activityQuestions', questions);
  setText('activityCorrect', correct);
  setText('activityAccuracy', accuracy + '%');
  setText('activityPeriodLabel', base.label);
  setText('activityTime', base.time);
  setText('activityAi', base.ai);
  setText('activityRisk', base.risk);

  const chart = document.getElementById('activityChart');
  if (chart) {
    chart.innerHTML = base.bars.map(([label, height]) => (
      `<div style="height:${height}%"><span>${label}</span></div>`
    )).join('');
  }
}

function updateReadiness() {
  const el = document.getElementById('readinessScore');
  if (!el) return;
  const base = 58;
  const accuracy = state.totalAnswered > 0 ? Math.round((state.totalCorrect / state.totalAnswered) * 24) : 0;
  const streakBoost = Math.min(state.streak, 10);
  el.textContent = Math.min(96, base + accuracy + streakBoost);
}

function buildGapList() {
  const container = document.getElementById('gapList');
  if (!container) return;
  const gaps = getSkillGaps();
  container.innerHTML = gaps.map(g => `
    <button class="gap-row" onclick="startGapSession('${g.key}')">
      <span class="gap-meter" style="--gap:${g.risk}%"><i></i></span>
      <span><strong>${g.label}</strong><small>${g.copy}</small></span>
      <em>${g.risk}% Risiko</em>
    </button>
  `).join('');
}

function getSkillGaps() {
  const misses = state.history.filter(h => !h.correct);
  const byChapter = misses.reduce((acc, h) => {
    acc[h.chapter] = (acc[h.chapter] || 0) + 1;
    return acc;
  }, {});
  const defaults = [
    { key: 'Beratung & Dokumentation', label: 'Beratung & Dokumentation', risk: 74, copy: 'Dokumentationspflichten und Bedarfsermittlung' },
    { key: 'Berufsunfähigkeit', label: 'Berufsunfähigkeit', risk: 61, copy: 'Definition, Leistungsvoraussetzungen, BUZ' },
    { key: 'Altersvorsorge', label: 'Altersvorsorge', risk: 48, copy: 'bAV, Entgeltumwandlung, Besteuerung' },
  ];
  return defaults.map(item => ({
    ...item,
    risk: Math.min(92, item.risk + (byChapter[item.key] || 0) * 6),
  }));
}

function startSmartSession() {
  state.quizMode = 'Beratung & Dokumentation';
  state.quizSearch = '';
  state.selectedCategory = 'beratung';
  state.showLobby = false;
  navigateTo('quiz');
}

function startGapSession(chapter) {
  state.quizMode = chapter;
  state.quizSearch = '';
  state.selectedCategory = null;
  state.showLobby = false;
  navigateTo('quiz');
}

function startWeaknessMode() {
  state.quizMode = 'wrong';
  state.quizSearch = '';
  state.showLobby = false;
  applyFilter();
  renderQuizFilter();
  showToast('Schwächenmodus aktiviert', '🎯');
}

function setQuizMode(mode) {
  state.quizMode = mode;
  state.quizSearch = '';
  state.selectedCategory = null;
  state.showLobby = false;
  applyFilter();
  renderQuizFilter();
}

function buildRecentHistory() {
  const container = document.getElementById('recentHistory');
  if (!container) return;
  const recent = state.history.slice(-5).reverse();
  if (recent.length === 0) {
    container.innerHTML = '<p class="text-sm text-muted" style="padding:16px 0">Noch keine Fragen beantwortet. Starte das Training!</p>';
    return;
  }
  container.innerHTML = recent.map(h => `
    <div class="history-item">
      <div class="history-icon" style="background:${h.correct ? 'var(--green-dim)' : 'var(--red-dim)'}">
        ${h.correct ? '✓' : '✗'}
      </div>
      <div class="history-info">
        <div class="history-q">${h.question}</div>
        <div class="history-meta">${h.chapter} · ${h.time}</div>
      </div>
      <span class="history-result ${h.correct ? 'right' : 'wrong'}">${h.correct ? 'Richtig' : 'Falsch'}</span>
    </div>
  `).join('');
}

function buildProgressRing() {
  const acc = state.totalAnswered > 0 ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;
  const circumference = 2 * Math.PI * 35; // r=35
  const offset = circumference - (acc / 100) * circumference;
  const fill = document.getElementById('ringFill');
  const label = document.getElementById('ringLabel');
  if (fill) {
    fill.style.strokeDasharray = circumference;
    fill.style.strokeDashoffset = circumference;
    setTimeout(() => { fill.style.strokeDashoffset = offset; }, 200);
  }
  if (label) label.textContent = acc + '%';
}

function buildRadarChart() {
  const chapters = [
    { label: '§34d', key: 'grundlagen', color: '#2563EB' },
    { label: 'Beratg.', key: 'beratung', color: '#7C3AED' },
    { label: 'Leben', key: 'leben', color: '#059669' },
    { label: 'BU', key: 'bu', color: '#D97706' },
    { label: 'Alters.', key: 'altersvorsorge', color: '#DC2626' },
    { label: 'Sach', key: 'sach', color: '#0891B2' },
    { label: 'Kfz', key: 'kfz', color: '#7C3AED' },
    { label: 'Krank.', key: 'kranken', color: '#059669' },
  ];

  const n = chapters.length;
  const cx = 150, cy = 150, r = 110;
  const levels = [0.25, 0.5, 0.75, 1];

  // Fake progress per chapter (would be real in production)
  const progress = { grundlagen: 0.72, beratung: 0.85, leben: 0.60, bu: 0.45, altersvorsorge: 0.78, sach: 0.65, kfz: 0.90, kranken: 0.55 };

  function angle(i) { return (i * 2 * Math.PI / n) - Math.PI / 2; }
  function point(i, frac) {
    const a = angle(i);
    return { x: cx + frac * r * Math.cos(a), y: cy + frac * r * Math.sin(a) };
  }

  // Grid lines
  let gridSvg = levels.map(lv => {
    const pts = chapters.map((_, i) => point(i, lv));
    return `<polygon points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--border-2)" stroke-width="1"/>`;
  }).join('');

  // Axis lines
  let axesSvg = chapters.map((_, i) => {
    const p = point(i, 1);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="var(--border-2)" stroke-width="1"/>`;
  }).join('');

  // Data polygon
  const dataPts = chapters.map((c, i) => point(i, progress[c.key] || 0.3));
  const dataSvg = `<polygon points="${dataPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(37,99,235,0.15)" stroke="#2563EB" stroke-width="2" stroke-linejoin="round"/>`;

  // Dots on polygon
  const dotsSvg = dataPts.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#2563EB" stroke="var(--surface)" stroke-width="2"/>`).join('');

  // Labels
  const labelsSvg = chapters.map((c, i) => {
    const p = point(i, 1.22);
    return `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="600" font-family="Inter,sans-serif" fill="var(--text-2)">${c.label}</text>`;
  }).join('');

  const svg = `<svg width="300" height="300" viewBox="0 0 300 300">
    <defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient></defs>
    ${gridSvg}${axesSvg}${dataSvg}${dotsSvg}${labelsSvg}
  </svg>`;

  const container = document.getElementById('radarChart');
  if (container) container.innerHTML = svg;
}

// ── Quiz ──────────────────────────────────────────────────────
function initQuizPage() {
  state.filteredQuestions = [...QUESTIONS];
  state.currentQ = 0;
  state.quizStreak = 0;
  state.quizActive = false;
  if (state.showLobby) {
    showCategoryLobby();
    return;
  }
  renderQuizFilter();
  if (state.quizMode !== 'all' || state.quizSearch) {
    applyFilter();
    return;
  }
  renderQuestion();
}

function showCategoryLobby() {
  state.showLobby = true;
  state.selectedCategory = null;
  clearTimer();
  const lobby = document.getElementById('categoryLobby');
  const filterBar = document.getElementById('quizFilterBar');
  const content = document.getElementById('quizContent');
  if (filterBar) filterBar.innerHTML = '';
  if (content) content.innerHTML = '';
  if (!lobby) return;

  const categories = buildCategoryCards();
  lobby.innerHTML = `
    <div class="category-hero card">
      <div>
        <span class="smart-pill">Themen auswählen</span>
        <h3>Wähle erst dein Lerngebiet.</h3>
        <p>Starte gezielt mit Haftpflicht, Hausrat, Kfz, Krankenversicherung oder einem ganzen Kapitel. So fühlt sich das Training wieder kontrolliert an.</p>
      </div>
      <button class="btn btn-primary" onclick="startMixedTraining()">Alle Fragen mischen</button>
    </div>
    <div class="course-status">
      <span>✓ Sehr gut, du hast ${categories.filter(cat => cat.total > 0).length} Lernbereiche zur Auswahl.</span>
      <small>Wähle ein Feld oder starte direkt einen gemischten Test.</small>
    </div>
    <div class="category-grid">
      ${categories.map(renderCategoryCard).join('')}
    </div>
  `;
}

function buildCategoryCards() {
  const base = Object.entries(CATEGORY_META).map(([key, meta]) => {
    const qs = questionsForCategory(key);
    const answered = state.history.filter(h => qs.some(q => q.id === h.id)).length;
    const correct = state.history.filter(h => h.correct && qs.some(q => q.id === h.id)).length;
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    return { key, ...meta, total: qs.length, answered, accuracy };
  });
  return base.filter(cat => cat.total > 0 || ['haftpflicht', 'hausrat'].includes(cat.key));
}

function questionsForCategory(key) {
  const meta = CATEGORY_META[key] || {};
  return QUESTIONS.filter(q => {
    const chapterMatch = meta.chapterKey ? q.chapterKey === meta.chapterKey : q.chapterKey === key;
    const search = (meta.search || '').toLowerCase();
    const searchMatch = search ? (q.text + ' ' + q.options.join(' ') + ' ' + q.explanation).toLowerCase().includes(search) : true;
    return chapterMatch && searchMatch;
  });
}

function renderCategoryCard(cat) {
  const progress = cat.total ? Math.round((cat.answered / cat.total) * 100) : 0;
  const locked = cat.total === 0;
  return `
    <button class="category-card ${cat.color || 'blue'} ${locked ? 'locked' : ''}" onclick="${locked ? "showToast('Für dieses Thema fehlen noch Fragen im Pool', 'ℹ️')" : `startCategory('${cat.key}')`}">
      <div class="category-icon">${cat.icon}</div>
      <div class="category-body">
        <strong>${cat.title}</strong>
        <span>${cat.subtitle}</span>
        <div class="category-meta">
          <small>${cat.total} Fragen</small>
          <small>${cat.answered} bearbeitet</small>
          <small>${cat.accuracy || '—'}% Quote</small>
        </div>
        <div class="progress-wrap"><div class="progress-bar" style="width:${progress}%"></div></div>
      </div>
      <em>${locked ? 'leer' : 'Starten →'}</em>
    </button>
  `;
}

function startCategory(key) {
  state.showLobby = false;
  state.selectedCategory = key;
  const meta = CATEGORY_META[key] || {};
  const chapterKey = meta.chapterKey || key;
  const chapter = QUESTIONS.find(q => q.chapterKey === chapterKey)?.chapter || 'all';
  state.quizMode = chapter;
  state.quizSearch = meta.search || '';
  state.currentQ = 0;
  renderQuizFilter();
  applyFilter();
  showToast(`${meta.title || 'Kategorie'} gestartet`, meta.icon || '✅', 1500);
}

function startMixedTraining() {
  state.showLobby = false;
  state.selectedCategory = null;
  state.quizMode = 'all';
  state.quizSearch = '';
  state.currentQ = 0;
  renderQuizFilter();
  applyFilter();
}

function renderQuizFilter() {
  const chapters = [...new Set(QUESTIONS.map(q => q.chapter))];
  const filterBar = document.getElementById('quizFilterBar');
  if (!filterBar) return;
  const selectedMeta = state.selectedCategory ? CATEGORY_META[state.selectedCategory] : null;

  filterBar.innerHTML = `
    <button class="filter-chip" onclick="showCategoryLobby()">▦ Kategorien</button>
    ${selectedMeta ? `<span class="active-category-pill">${selectedMeta.icon} ${selectedMeta.title}</span>` : ''}
    <input type="text" class="search-input" id="quizSearch" placeholder="Fragen durchsuchen…" value="${state.quizSearch}">
    <button class="filter-chip ${state.quizMode === 'all' ? 'active' : ''}" data-mode="all">Alle</button>
    ${chapters.slice(0, 4).map(ch => `
      <button class="filter-chip ${state.quizMode === ch ? 'active' : ''}" data-mode="${ch}">${ch.split(' ')[0]}</button>
    `).join('')}
    <button class="filter-chip ${state.quizMode === 'wrong' ? 'active' : ''}" data-mode="wrong">Falsch</button>
  `;

  filterBar.querySelector('#quizSearch').addEventListener('input', e => {
    state.quizSearch = e.target.value;
    applyFilter();
  });
  filterBar.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.quizMode = btn.dataset.mode;
      applyFilter();
      renderQuizFilter();
    });
  });
}

function applyFilter() {
  let qs = [...QUESTIONS];
  if (state.quizMode !== 'all' && state.quizMode !== 'wrong') {
    qs = qs.filter(q => q.chapter === state.quizMode);
  }
  if (state.quizMode === 'wrong') {
    const wrongIds = state.history.filter(h => !h.correct).map(h => h.id);
    qs = qs.filter(q => wrongIds.includes(q.id));
    if (qs.length === 0) qs = [...QUESTIONS];
  }
  if (state.quizSearch) {
    const q = state.quizSearch.toLowerCase();
    qs = qs.filter(qn => qn.text.toLowerCase().includes(q) || qn.chapter.toLowerCase().includes(q));
  }
  state.filteredQuestions = qs;
  state.currentQ = 0;
  renderQuestion();
}

function renderQuestion() {
  const lobby = document.getElementById('categoryLobby');
  if (lobby) lobby.innerHTML = '';
  clearTimer();
  state.answered = false;
  state.selected = [];
  state.quizActive = true;

  const qs = state.filteredQuestions;
  if (!qs || qs.length === 0) {
    document.getElementById('quizContent').innerHTML = `
      <div class="card result-card">
        <span class="result-emoji">🔍</span>
        <div class="result-label">Keine Fragen gefunden. Ändere den Filter.</div>
        <button class="btn btn-primary mt-4" onclick="initQuizPage()">Filter zurücksetzen</button>
      </div>`;
    return;
  }

  const q = qs[state.currentQ % qs.length];
  const diffLabel = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' };
  const diffClass = { easy: 'diff-easy', medium: 'diff-medium', hard: 'diff-hard' };
  const keyLabels = ['A', 'B', 'C', 'D', 'E'];

  const answersHtml = q.options.map((opt, i) => `
    <button class="answer-btn" data-idx="${i}" ${q.type === 'single' ? '' : ''}>
      <span class="answer-key">${keyLabels[i]}</span>
      <span class="answer-text">${opt}</span>
    </button>
  `).join('');

  document.getElementById('quizContent').innerHTML = `
    <div class="quiz-header">
      <div class="quiz-meta">
        <span class="quiz-chapter-tag">${q.chapter}</span>
        <span class="difficulty-badge ${diffClass[q.difficulty]}">
          <span class="dot"></span>${diffLabel[q.difficulty]}
        </span>
        ${q.type === 'multi' ? '<span class="multi-hint">Mehrfachauswahl möglich</span>' : ''}
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="combo-badge" id="comboBadge">
          ⚡ Streak: <span id="streakNum">${state.quizStreak}</span>
        </div>
        <div class="quiz-progress-text">
          ${(state.currentQ % qs.length) + 1} / ${qs.length}
        </div>
      </div>
    </div>

    <div class="timer-label"><span id="timerSec">60</span>s</div>
    <div class="timer-container">
      <div class="timer-bar" id="timerBar"></div>
    </div>

    <div class="question-card">
      <div class="question-number">Frage ${(state.currentQ % qs.length) + 1}</div>
      <div class="question-text">${q.text}</div>
    </div>

    <div class="answers-grid" id="answersGrid">
      ${answersHtml}
    </div>

    <div class="explanation-box" id="explanationBox">
      <strong>💡 Erklärung:</strong> ${q.explanation}
      <div class="ai-review" id="aiReviewBox"></div>
    </div>

    <div class="quiz-controls">
      <div></div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary" id="checkBtn" onclick="checkAnswer()">Antwort prüfen</button>
        <button class="btn btn-primary" id="nextBtn" onclick="nextQuestion()" style="display:none">Weiter →</button>
      </div>
    </div>
  `;

  // Attach answer listeners
  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleAnswer(parseInt(btn.dataset.idx), q.type));
  });

  // Keyboard shortcuts
  setupKeyboardShortcuts(q);

  // Start timer
  startTimer(q);
}

function toggleAnswer(idx, type) {
  if (state.answered) return;
  if (type === 'single') {
    state.selected = [idx];
    document.querySelectorAll('.answer-btn').forEach((b, i) => b.classList.toggle('selected', i === idx));
  } else {
    const pos = state.selected.indexOf(idx);
    if (pos === -1) state.selected.push(idx);
    else state.selected.splice(pos, 1);
    document.querySelectorAll('.answer-btn').forEach((b, i) => b.classList.toggle('selected', state.selected.includes(i)));
  }
}

function checkAnswer() {
  if (state.answered) return;
  const qs = state.filteredQuestions;
  const q = qs[state.currentQ % qs.length];
  if (state.selected.length === 0) { showToast('Bitte wähle mindestens eine Antwort', '⚠️', 1800); return; }

  clearTimer();
  state.answered = true;

  const correct = q.correct;
  const isCorrect = correct.length === state.selected.length && correct.every(c => state.selected.includes(c));

  document.querySelectorAll('.answer-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (correct.includes(i)) btn.classList.add('correct');
    else if (state.selected.includes(i) && !correct.includes(i)) btn.classList.add('wrong');
  });

  document.getElementById('explanationBox').classList.add('show');
  const aiReview = document.getElementById('aiReviewBox');
  if (aiReview) {
    aiReview.innerHTML = isCorrect
      ? '<strong>KI-Review:</strong> Sehr gut. Speichere diese Frage als sichere Kompetenz und gehe zur nächsten Schwierigkeit.'
      : `<strong>KI-Review:</strong> Dein nächster Schritt: wiederhole "${q.chapter}" mit 5 kurzen Drill-Fragen. <button class="btn btn-primary btn-sm" onclick="startGapSession('${q.chapter.replace(/'/g, "\\'")}')">Drill starten</button>`;
  }
  document.getElementById('checkBtn').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'inline-flex';

  // Update stats
  state.totalAnswered++;
  if (isCorrect) {
    state.totalCorrect++;
    state.quizStreak++;
    state.xp += 10;
    storage.set('sp-correct', state.totalCorrect);
    storage.set('sp-xp', state.xp);
    showXpFloat();
    if (state.quizStreak > 1) showToast(`${state.quizStreak}× Streak! 🔥`, '⚡', 2000);
    else showToast('Richtig! +10 XP', '✅', 1800);
    const combo = document.getElementById('comboBadge');
    if (combo) { combo.classList.remove('bump'); void combo.offsetWidth; combo.classList.add('bump'); }
  } else {
    state.quizStreak = 0;
    showToast('Leider falsch. Schau dir die Erklärung an.', '❌', 2500);
  }
  storage.set('sp-answered', state.totalAnswered);

  const streakNumEl = document.getElementById('streakNum');
  if (streakNumEl) streakNumEl.textContent = state.quizStreak;

  // Save to history
  const time = new Date().toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' });
  state.history.push({ id: q.id, question: q.text.slice(0, 55) + '…', chapter: q.chapter, correct: isCorrect, time });
  if (state.history.length > 50) state.history = state.history.slice(-50);
  storage.set('sp-history', JSON.stringify(state.history));
}

function nextQuestion() {
  state.currentQ++;
  const qs = state.filteredQuestions;
  if (state.currentQ >= qs.length) {
    showResultSummary();
    return;
  }
  renderQuestion();
}

function showResultSummary() {
  const total = state.filteredQuestions.length;
  const correct = state.history.slice(-total).filter(h => h.correct).length;
  const pct = Math.round((correct / total) * 100);
  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';

  document.getElementById('quizContent').innerHTML = `
    <div class="card result-card">
      <span class="result-emoji">${emoji}</span>
      <div class="result-score gradient-text">${pct}%</div>
      <div class="result-label">${correct} von ${total} Fragen richtig</div>
      <div style="max-width:300px;margin:0 auto 28px">
        <div class="progress-wrap"><div class="progress-bar ${pct >= 80 ? 'green' : pct >= 60 ? '' : 'amber'}" style="width:${pct}%"></div></div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary btn-lg" onclick="initQuizPage()">Nochmal starten</button>
        <button class="btn btn-secondary btn-lg" onclick="navigateTo('dashboard')">Zur Zentrale</button>
      </div>
    </div>`;
  clearTimer();
}

function startTimer(q) {
  state.timerSeconds = 60;
  const bar = document.getElementById('timerBar');
  const lbl = document.getElementById('timerSec');
  if (!bar) return;

  bar.style.width = '100%';
  bar.classList.remove('warn', 'danger', 'running');
  void bar.offsetWidth;
  bar.style.transition = 'none';

  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    if (lbl) lbl.textContent = state.timerSeconds;
    const pct = (state.timerSeconds / 60) * 100;
    bar.style.width = pct + '%';

    if (state.timerSeconds <= 15 && state.timerSeconds > 5) {
      bar.classList.add('warn'); bar.classList.remove('danger');
    } else if (state.timerSeconds <= 5) {
      bar.classList.add('danger'); bar.classList.remove('warn');
    }

    if (state.timerSeconds <= 0) {
      clearTimer();
      if (!state.answered) {
        state.selected = [];
        showToast('Zeit abgelaufen!', '⏱️', 2000);
        checkAnswerForced();
      }
    }
  }, 1000);
}

function checkAnswerForced() {
  state.answered = true;
  const qs = state.filteredQuestions;
  const q = qs[state.currentQ % qs.length];
  document.querySelectorAll('.answer-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (q.correct.includes(i)) btn.classList.add('correct');
  });
  document.getElementById('explanationBox').classList.add('show');
  document.getElementById('checkBtn').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'inline-flex';
  state.quizStreak = 0;
  state.totalAnswered++;
  storage.set('sp-answered', state.totalAnswered);
}

function clearTimer() {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
}

function setupKeyboardShortcuts(q) {
  document.onkeydown = (e) => {
    if (state.answered) {
      if (e.key === 'Enter') nextQuestion();
      return;
    }
    const map = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4 };
    const idx = map[e.key.toLowerCase()];
    if (idx !== undefined && idx < q.options.length) {
      toggleAnswer(idx, q.type);
    }
    if (e.key === 'Enter') checkAnswer();
  };
}

function showXpFloat() {
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = '+10 XP';
  el.style.left = (Math.random() * 40 + 30) + 'vw';
  el.style.top = '40vh';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

// ── Leaderboard ────────────────────────────────────────────────
function buildLeaderboard() {
  const sorted = [...LEADERBOARD].sort((a, b) => b.xp - a.xp);
  const tbody = document.getElementById('lbBody');
  if (!tbody) return;
  const maxXp = sorted[0].xp;

  tbody.innerHTML = sorted.map((p, i) => {
    const rank = i + 1;
    const cls = rank === 1 ? 'gold-row' : rank === 2 ? 'silver-row' : rank === 3 ? 'bronze-row' : p.isMe ? 'my-row' : '';
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
    const initials = p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const deltaHtml = p.delta > 0
      ? `<span class="rank-arrow rank-up">▲${p.delta}</span>`
      : p.delta < 0
        ? `<span class="rank-arrow rank-down">▼${Math.abs(p.delta)}</span>`
        : `<span class="rank-arrow rank-same">–</span>`;
    const barW = Math.round((p.xp / maxXp) * 100);

    return `<tr class="lb-row ${cls}">
      <td><span class="lb-rank">${medal}</span></td>
      <td>
        <div class="lb-player">
          <div class="lb-avatar" style="background:${p.color}">${initials}</div>
          <div>
            <div style="font-weight:700;font-size:14px">${p.name}${p.isMe ? ' <span style="font-size:10px;color:var(--blue);background:var(--blue-dim);padding:1px 6px;border-radius:99px">Du</span>' : ''}</div>
            <div style="font-size:11px;color:var(--text-3)">${p.score}% Trefferquote</div>
          </div>
        </div>
      </td>
      <td><span class="lb-xp">${p.xp.toLocaleString('de')} XP</span></td>
      <td>
        <div class="lb-score-bar">
          <div class="lb-score-track"><div class="lb-score-fill" style="width:${barW}%"></div></div>
          ${deltaHtml}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function animateLeaderboard() {
  // Re-animate bars
  document.querySelectorAll('.lb-score-fill').forEach(el => {
    const w = el.style.width;
    el.style.width = '0';
    setTimeout(() => { el.style.width = w; }, 100);
  });
}

// ── Billing ───────────────────────────────────────────────────
const BILLING = {
  monthly: {
    pro:  { main: '19', cents: ',99€', period: 'pro Monat' },
    team: { main: '49', cents: '€',   period: 'pro Monat / bis 10 Nutzer' },
  },
  annual: {
    pro:  { main: '12', cents: ',59€', period: 'pro Monat, jährlich abgerechnet' },
    team: { main: '41', cents: '€',   period: 'pro Monat, jährlich abgerechnet' },
  },
};

function buildBilling() {
  setBillingCycle(state.billingCycle || 'monthly');
}

function setBillingCycle(cycle) {
  state.billingCycle = cycle;
  const isAnnual = cycle === 'annual';

  document.querySelectorAll('.billing-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === (isAnnual ? 'billAnnual' : 'billMonthly'));
  });

  const prices = BILLING[cycle];

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const show = (id, visible) => { const el = document.getElementById(id); if (el) el.style.display = visible ? '' : 'none'; };

  set('priceProMain',   prices.pro.main);
  set('priceProCents',  prices.pro.cents);
  set('planProPeriod',  prices.pro.period);
  set('priceTeamMain',  prices.team.main);
  set('priceTeamCents', prices.team.cents);
  set('planTeamPeriod', prices.team.period);

  show('planProSavings',  isAnnual);
  show('planTeamSavings', isAnnual);
  show('savingsCalc', isAnnual);

  if (isAnnual) {
    const proSavings = Math.round(19.99 * 12 - 12.59 * 12);
    set('savingsAmount', proSavings + '€');
  }
}

function startCheckout(planKey = 'pro') {
  state.checkoutPlan = PLANS[planKey] ? planKey : 'pro';
  navigateTo('checkout');
}

function renderCheckout() {
  const plan = PLANS[state.checkoutPlan] || PLANS.pro;
  const summary = document.getElementById('checkoutSummary');
  if (!summary) return;
  summary.innerHTML = `
    <div class="summary-plan">
      <div>
        <span class="text-xs text-muted">Ausgewählter Plan</span>
        <strong>${plan.name}</strong>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="navigateTo('billing')">Ändern</button>
    </div>
    <div class="summary-price">
      <span>${plan.price}</span>
      <small>pro ${plan.interval}</small>
    </div>
    <ul class="summary-features">
      ${plan.features.map(f => `<li>✓ ${f}</li>`).join('')}
    </ul>
    <div class="summary-row"><span>Zwischensumme</span><strong>${plan.price}</strong></div>
    <div class="summary-row"><span>MwSt. inkl.</span><strong>enthalten</strong></div>
    <div class="summary-total"><span>Heute fällig</span><strong>${plan.price}</strong></div>
    <div class="payment-config">
      <code>PREIS_ID=${plan.priceId}</code>
    </div>
  `;
}

function redirectToPaymentCheckout() {
  const plan = PLANS[state.checkoutPlan] || PLANS.pro;
  showToast('Sichere Zahlung wird vorbereitet …', '💳', 1800);
  setTimeout(() => {
    showToast(`Demo: Backend würde jetzt den Zahlungsanbieter mit ${plan.priceId} öffnen`, '🔒', 4200);
  }, 700);
}

// ── Account ───────────────────────────────────────────────────
function buildAccount() {
  buildStreakCalendar();
  renderInvoices();
  const examInput = document.getElementById('examDateInput');
  if (examInput) examInput.value = state.examDate;
  setAccountPanel(state.accountPanel || 'profile');
}

function setAccountPanel(panel = 'profile') {
  const titles = {
    profile: 'Profil',
    general: 'Allgemein',
    notifications: 'Benachrichtigungen',
    subscription: 'Nutzung und Paket',
    invoices: 'Rechnungen',
    privacy: 'Datenschutz'
  };
  state.accountPanel = titles[panel] ? panel : 'profile';
  document.querySelectorAll('.settings-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === state.accountPanel);
  });
  document.querySelectorAll('.settings-panel').forEach(panelEl => {
    panelEl.classList.toggle('active', panelEl.dataset.panel === state.accountPanel);
  });
  const title = document.getElementById('accountPanelTitle');
  if (title) title.textContent = titles[state.accountPanel];
  if (state.accountPanel === 'invoices') renderInvoices();
  if (state.accountPanel === 'profile') buildStreakCalendar();
}

function renderInvoices() {
  const container = document.getElementById('invoiceList');
  if (!container) return;
  container.innerHTML = INVOICES.map(inv => `
    <div class="invoice-row">
      <div>
        <strong>${inv.id}</strong>
        <span>${inv.date} · ${inv.plan}</span>
      </div>
      <em>${inv.amount}</em>
      <button class="btn btn-secondary btn-sm" onclick="downloadInvoice('${inv.id}')">Download</button>
    </div>
  `).join('');
}

function downloadInvoice(invoiceId) {
  const inv = INVOICES.find(item => item.id === invoiceId);
  if (!inv) return;
  const html = `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><title>Rechnung ${inv.id}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#111827} .box{border:1px solid #d1d5db;padding:24px;border-radius:8px} h1{margin-top:0}.row{display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding:12px 0}.total{font-size:22px;font-weight:700}</style></head>
<body><div class="box"><h1>Rechnung ${inv.id}</h1><p><strong>SkillPilot GmbH</strong><br>Demo-Rechnung für Alex Müller</p><div class="row"><span>Datum</span><strong>${inv.date}</strong></div><div class="row"><span>Plan</span><strong>${inv.plan}</strong></div><div class="row"><span>Status</span><strong>${inv.status}</strong></div><div class="row total"><span>Betrag</span><strong>${inv.amount}</strong></div><p>Hinweis: In Produktion wird diese Rechnung aus deinem Abrechnungssystem oder Backend als PDF bereitgestellt.</p></div></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${inv.id}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast(`Rechnung ${inv.id} heruntergeladen`, '📄');
}

function downloadAllInvoices() {
  INVOICES.forEach((inv, index) => setTimeout(() => downloadInvoice(inv.id), index * 250));
}

function buildStreakCalendar() {
  const container = document.getElementById('streakCalendar');
  if (!container) return;
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const today = new Date().getDay(); // 0=Sun
  // Mock: last 7 days with some active
  const active = [true, true, false, true, true, true, true];
  const html = days.map((d, i) => {
    const isToday = i === ((today + 6) % 7);
    return `<div class="streak-day ${active[i] ? 'active' : 'inactive'} ${isToday ? 'today' : ''}">
      <span style="font-size:8px">${d}</span>
      <span>${active[i] ? '🔥' : '·'}</span>
    </div>`;
  }).join('');
  container.innerHTML = html;
}

// ── Account Detail Inline Edit ────────────────────────────────
function editDetailRow(btn, field, currentValue) {
  const row = btn.closest('[data-field]');
  if (!row || row.querySelector('.detail-input-wrap')) return;

  const valueSpan = row.querySelector('.detail-value');
  const isPassword = field === 'password';
  const inputType = isPassword ? 'password' : (field === 'email' || field === 'username' ? 'email' : 'text');

  valueSpan.style.display = 'none';
  btn.style.display = 'none';

  const wrap = document.createElement('div');
  wrap.className = 'detail-input-wrap';
  wrap.innerHTML = `
    <input type="${inputType}" class="form-input detail-inline-input"
      value="${isPassword ? '' : currentValue.replace(/"/g, '&quot;')}"
      placeholder="${isPassword ? 'Neues Passwort eingeben' : ''}"
      autocomplete="${isPassword ? 'new-password' : 'off'}"
      data-lpignore="true" data-1p-ignore>
    <div class="detail-inline-actions">
      <button class="btn btn-primary btn-sm" onclick="saveDetailRow(this,'${field}')">Speichern</button>
      <button class="btn btn-secondary btn-sm" onclick="cancelDetailRow(this)">Abbrechen</button>
    </div>
  `;
  row.insertBefore(wrap, btn);
  wrap.querySelector('input').focus();

  wrap.querySelector('input').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveDetailRow(wrap.querySelector('.btn-primary'), field);
    if (e.key === 'Escape') cancelDetailRow(wrap.querySelector('.btn-secondary'));
  });
}

function saveDetailRow(btn, field) {
  const row = btn.closest('[data-field]');
  const wrap = row.querySelector('.detail-input-wrap');
  const input = wrap.querySelector('input');
  const newValue = input.value.trim();

  if (!newValue) { showToast('Feld darf nicht leer sein', '⚠️', 2000); return; }

  const valueSpan = row.querySelector('.detail-value');
  const editBtn = row.querySelector('.detail-edit-btn');

  if (field === 'password') {
    valueSpan.textContent = '••••••••••••••';
    showToast('Passwort aktualisiert', '✅');
  } else {
    valueSpan.textContent = newValue;
    if (field === 'name') {
      state.nickname = newValue;
      storage.set('sp-nick', newValue);
      const av = document.getElementById('profileAvatar');
      if (av) av.textContent = newValue.slice(0, 2).toUpperCase();
      document.querySelectorAll('.profile-mini, .profile-menu-avatar').forEach(el => el.textContent = newValue.slice(0,2).toUpperCase());
    }
    showToast(`${row.querySelector('strong').textContent} gespeichert`, '✅');
  }

  wrap.remove();
  valueSpan.style.display = '';
  editBtn.style.display = '';
}

function cancelDetailRow(btn) {
  const row = btn.closest('[data-field]');
  const wrap = row.querySelector('.detail-input-wrap');
  const valueSpan = row.querySelector('.detail-value');
  const editBtn = row.querySelector('.detail-edit-btn');
  wrap.remove();
  valueSpan.style.display = '';
  editBtn.style.display = '';
}

function editAllDetails() {
  document.querySelectorAll('.detail-edit-btn:not([disabled])').forEach(btn => {
    const row = btn.closest('[data-field]');
    if (!row.querySelector('.detail-input-wrap')) btn.click();
  });
}

// ── Account Form Save ─────────────────────────────────────────
function saveAccount() {
  const nick = document.getElementById('nickInput').value.trim();
  const examInput = document.getElementById('examDateInput');
  if (nick) {
    state.nickname = nick;
    storage.set('sp-nick', nick);
    const av = document.getElementById('profileAvatar');
    if (av) av.textContent = nick.slice(0, 2).toUpperCase();
  }
  if (examInput && examInput.value) {
    state.examDate = examInput.value;
    storage.set('sp-exam-date', state.examDate);
    startCountdown();
  }
  showToast('Gespeichert!', '✅');
}

// ── Expose globals ────────────────────────────────────────────
window.navigateTo = navigateTo;
window.logoutUser = logoutUser;
window.loginUser = loginUser;
window.toggleTopbarMenu = toggleTopbarMenu;
window.closeTopbarMenus = closeTopbarMenus;
window.toggleMoreSheet = toggleMoreSheet;
window.closeMoreSheet = closeMoreSheet;
window.navigateAndCloseMore = navigateAndCloseMore;
window.toggleMoreTopbar = toggleMoreTopbar;
window.openMobileSearch = openMobileSearch;
window.showCategoriesFromHeader = showCategoriesFromHeader;
window.dismissNotif = dismissNotif;
window.markAllNotifRead = markAllNotifRead;
window.toggleSidebarCollapse = toggleSidebarCollapse;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.initQuizPage = initQuizPage;
window.saveAccount = saveAccount;
window.setAccountPanel = setAccountPanel;
window.showCategoryLobby = showCategoryLobby;
window.startCategory = startCategory;
window.startMixedTraining = startMixedTraining;
window.startSmartSession = startSmartSession;
window.startGapSession = startGapSession;
window.startWeaknessMode = startWeaknessMode;
window.setQuizMode = setQuizMode;
window.startCheckout = startCheckout;
window.setBillingCycle = setBillingCycle;
window.toggleSearch = toggleSearch;
window.editDetailRow = editDetailRow;
window.saveDetailRow = saveDetailRow;
window.cancelDetailRow = cancelDetailRow;
window.editAllDetails = editAllDetails;
window.closeSearch = closeSearch;
window.redirectToPaymentCheckout = redirectToPaymentCheckout;
window.downloadInvoice = downloadInvoice;
window.downloadAllInvoices = downloadAllInvoices;
