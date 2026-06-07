export type AnswerOption = {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
};

export type Question = {
  id: number;
  chapter: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  options: AnswerOption[];
  correctAnswers: string[];
  type: 'single' | 'multiple';
};

export type Chapter = {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  points: number;
  minDuration: number; // in minutes
};

export const CHAPTERS: Chapter[] = [
  { id: 1, title: 'Rechtliche Grundlagen der Versicherungsvermittlung', points: 65, minDuration: 20 },
  { id: 2, title: 'Altersvorsorge und Lebensversicherung', points: 70, minDuration: 22 },
  { id: 3, title: 'Betriebliche Altersvorsorge und Steuerrecht', points: 77, minDuration: 25 },
  { id: 4, title: 'Unfall-, Kranken- und Pflegeversicherung', points: 73, minDuration: 23 },
  { id: 5, title: 'Hausrat- und Gebäudeversicherung', points: 75, minDuration: 24 },
  { id: 6, title: 'Haftpflicht-, Kfz- und Rechtsschutzversicherung', points: 68, minDuration: 21 },
];

export const TOTAL_POINTS = CHAPTERS.reduce((sum, c) => sum + c.points, 0);

export const questions: Question[] = [
  // Kapitel 1: Rechtliche Grundlagen
  {
    id: 1,
    chapter: 1,
    text: 'Wer benötigt eine Erlaubnis nach § 34d GewO, um als Versicherungsvermittler tätig zu sein?',
    options: [
      { id: 'A', text: 'Nur Versicherungsvertreter, nicht jedoch Versicherungsmakler' },
      { id: 'B', text: 'Versicherungsvertreter und Versicherungsmakler, die gewerbsmäßig tätig sind' },
      { id: 'C', text: 'Ausschließlich Versicherungsmakler mit eigenem Büro' },
      { id: 'D', text: 'Nur Personen, die mehr als 5 Versicherungsverträge pro Jahr vermitteln' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 2,
    chapter: 1,
    text: 'Welche der folgenden Aussagen zur Eintragung ins Vermittlerregister sind korrekt?',
    options: [
      { id: 'A', text: 'Die Eintragung ins Register ist freiwillig' },
      { id: 'B', text: 'Das Vermittlerregister wird von der IHK geführt' },
      { id: 'C', text: 'Im Register sind Registrierungsnummer und Kontaktdaten eingetragen' },
      { id: 'D', text: 'Die Eintragung ist Voraussetzung für die Ausübung der Tätigkeit' },
    ],
    correctAnswers: ['C', 'D'],
    type: 'multiple',
  },
  {
    id: 3,
    chapter: 1,
    text: 'Was versteht man unter einem "gebundenen Versicherungsvertreter" gemäß § 34d GewO?',
    options: [
      { id: 'A', text: 'Ein Vertreter, der ausschließlich für einen einzigen Versicherer tätig ist und von diesem haftungsrechtlich übernommen wird' },
      { id: 'B', text: 'Ein Vertreter, der vertraglich an bestimmte Produktkategorien gebunden ist' },
      { id: 'C', text: 'Ein Vertreter, der mindestens 5 Jahre Berufserfahrung nachweisen muss' },
      { id: 'D', text: 'Ein Vertreter, der ausschließlich Lebensversicherungen vermitteln darf' },
    ],
    correctAnswers: ['A'],
    type: 'single',
  },
  {
    id: 4,
    chapter: 1,
    text: 'Welche Sachkundenachweise werden für die Erlaubnis nach § 34d GewO anerkannt?',
    options: [
      { id: 'A', text: 'Abgeschlossene Berufsausbildung zum Kaufmann für Versicherungen und Finanzen' },
      { id: 'B', text: 'Erfolgreich abgelegte IHK-Sachkundeprüfung' },
      { id: 'C', text: 'Hochschulabschluss in Betriebswirtschaftslehre ohne Versicherungsbezug' },
      { id: 'D', text: 'Mindestens 3 Jahre hauptberufliche Tätigkeit in der Versicherungsbranche vor dem 01.09.2009' },
    ],
    correctAnswers: ['A', 'B', 'D'],
    type: 'multiple',
  },
  {
    id: 5,
    chapter: 1,
    text: 'Was ist der wesentliche Unterschied zwischen einem Versicherungsvertreter und einem Versicherungsmakler?',
    options: [
      { id: 'A', text: 'Nur Makler dürfen Lebensversicherungen vermitteln' },
      { id: 'B', text: 'Der Vertreter handelt im Auftrag des Versicherers, der Makler im Auftrag des Kunden' },
      { id: 'C', text: 'Makler benötigen keine behördliche Erlaubnis' },
      { id: 'D', text: 'Vertreter müssen eine höhere Berufshaftpflichtversicherung abschließen' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },

  // Kapitel 2: Altersvorsorge und Lebensversicherung
  {
    id: 6,
    chapter: 2,
    text: 'Was ist das Hauptmerkmal einer Risikolebensversicherung?',
    options: [
      { id: 'A', text: 'Sie beinhaltet eine Sparkomponente für die Altersvorsorge' },
      { id: 'B', text: 'Sie zahlt nur im Todesfall während der Vertragslaufzeit' },
      { id: 'C', text: 'Sie garantiert eine lebenslange Rentenzahlung' },
      { id: 'D', text: 'Sie ist steuerlich vollständig absetzbar' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 7,
    chapter: 2,
    text: 'Welche Aussagen zur Riester-Rente sind korrekt?',
    options: [
      { id: 'A', text: 'Die staatliche Grundzulage beträgt 175 € pro Jahr' },
      { id: 'B', text: 'Riester-Verträge können nicht vorzeitig gekündigt werden' },
      { id: 'C', text: 'Für jedes förderberechtigte Kind gibt es eine zusätzliche Kinderzulage' },
      { id: 'D', text: 'Die Riester-Rente ist im Alter vollständig steuerfrei' },
    ],
    correctAnswers: ['A', 'C'],
    type: 'multiple',
  },
  {
    id: 8,
    chapter: 2,
    text: 'Was versteht man unter dem "Rückkaufswert" einer Lebensversicherung?',
    options: [
      { id: 'A', text: 'Den Betrag, den der Versicherer im Todesfall auszahlt' },
      { id: 'B', text: 'Den Betrag, den der Versicherungsnehmer bei vorzeitiger Kündigung erhält' },
      { id: 'C', text: 'Die Summe aller eingezahlten Beiträge ohne Zinsen' },
      { id: 'D', text: 'Den aktuellen Marktwert der Investmentfondsanteile' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 9,
    chapter: 2,
    text: 'Welche Arten von Lebensversicherungen gibt es?',
    options: [
      { id: 'A', text: 'Kapitallebensversicherung' },
      { id: 'B', text: 'Risikolebensversicherung' },
      { id: 'C', text: 'Rentenversicherung' },
      { id: 'D', text: 'Kreditversicherung' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    type: 'multiple',
  },

  // Kapitel 3: Betriebliche Altersvorsorge und Steuerrecht
  {
    id: 10,
    chapter: 3,
    text: 'Welche Durchführungswege der betrieblichen Altersvorsorge (bAV) gibt es in Deutschland?',
    options: [
      { id: 'A', text: 'Direktversicherung' },
      { id: 'B', text: 'Pensionskasse' },
      { id: 'C', text: 'Direktzusage (Pensionszusage)' },
      { id: 'D', text: 'Privatrente ohne Arbeitgeberbeteiligung' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    type: 'multiple',
  },
  {
    id: 11,
    chapter: 3,
    text: 'Bis zu welchem Prozentsatz der Beitragsbemessungsgrenze können Arbeitnehmer Beiträge zur bAV steuer- und sozialabgabenfrei einzahlen?',
    options: [
      { id: 'A', text: '2 %' },
      { id: 'B', text: '4 %' },
      { id: 'C', text: '6 %' },
      { id: 'D', text: '8 %' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 12,
    chapter: 3,
    text: 'Was regelt das Betriebsrentengesetz (BetrAVG)?',
    options: [
      { id: 'A', text: 'Die steuerliche Absetzbarkeit von Versicherungsbeiträgen' },
      { id: 'B', text: 'Den Anspruch auf Entgeltumwandlung für Arbeitnehmer' },
      { id: 'C', text: 'Die Unverfallbarkeit von Betriebsrentenansprüchen' },
      { id: 'D', text: 'Die Höhe des gesetzlichen Rentenanspruchs' },
    ],
    correctAnswers: ['B', 'C'],
    type: 'multiple',
  },

  // Kapitel 4: Unfall-, Kranken- und Pflegeversicherung
  {
    id: 13,
    chapter: 4,
    text: 'Was gilt als Unfall im Sinne der privaten Unfallversicherung?',
    options: [
      { id: 'A', text: 'Jede Erkrankung, die zum Arbeitsausfall führt' },
      { id: 'B', text: 'Ein plötzlich von außen auf den Körper wirkendes Ereignis, das unfreiwillig zu einem Gesundheitsschaden führt' },
      { id: 'C', text: 'Ausschließlich Verkehrsunfälle' },
      { id: 'D', text: 'Nur Unfälle am Arbeitsplatz' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 14,
    chapter: 4,
    text: 'Welche Leistungen können in der privaten Krankenversicherung (PKV) versichert werden?',
    options: [
      { id: 'A', text: 'Stationäre Behandlung als Privatpatient' },
      { id: 'B', text: 'Zahnersatz und kieferorthopädische Behandlungen' },
      { id: 'C', text: 'Krankengeld bei Arbeitsunfähigkeit' },
      { id: 'D', text: 'Gesetzliche Rentenversicherungsbeiträge' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    type: 'multiple',
  },

  // Kapitel 5: Hausrat- und Gebäudeversicherung
  {
    id: 15,
    chapter: 5,
    text: 'Was ist bei der Hausratversicherung durch den Begriff "gleitender Neuwert" gemeint?',
    options: [
      { id: 'A', text: 'Die Versicherungssumme passt sich automatisch an die Inflation an' },
      { id: 'B', text: 'Im Schadensfall wird der Zeitwert der beschädigten Sachen erstattet' },
      { id: 'C', text: 'Der Versicherungsschutz gilt auch für Gegenstände außer Haus' },
      { id: 'D', text: 'Die Prämie wird jährlich neu berechnet' },
    ],
    correctAnswers: ['A'],
    type: 'single',
  },
  {
    id: 16,
    chapter: 5,
    text: 'Welche Gefahren sind typischerweise in der Wohngebäudeversicherung mitversichert?',
    options: [
      { id: 'A', text: 'Feuer, Blitzschlag, Explosion' },
      { id: 'B', text: 'Leitungswasserschäden' },
      { id: 'C', text: 'Sturmschäden ab Windstärke 8' },
      { id: 'D', text: 'Überschwemmung durch Starkregen (standardmäßig)' },
    ],
    correctAnswers: ['A', 'B', 'C'],
    type: 'multiple',
  },

  // Kapitel 6: Haftpflicht-, Kfz- und Rechtsschutzversicherung
  {
    id: 17,
    chapter: 6,
    text: 'Was leistet die private Haftpflichtversicherung?',
    options: [
      { id: 'A', text: 'Sie ersetzt Schäden, die der Versicherungsnehmer vorsätzlich verursacht hat' },
      { id: 'B', text: 'Sie wehrt unberechtigte Schadenersatzforderungen ab' },
      { id: 'C', text: 'Sie reguliert berechtigte Schadenersatzansprüche Dritter' },
      { id: 'D', text: 'Sie übernimmt Bußgelder und Strafen' },
    ],
    correctAnswers: ['B', 'C'],
    type: 'multiple',
  },
  {
    id: 18,
    chapter: 6,
    text: 'Was ist der Unterschied zwischen der Kfz-Haftpflichtversicherung und der Kaskoversicherung?',
    options: [
      { id: 'A', text: 'Die Haftpflicht ist freiwillig, die Kasko ist Pflicht' },
      { id: 'B', text: 'Die Haftpflicht deckt Schäden an Dritten, die Kasko deckt Schäden am eigenen Fahrzeug' },
      { id: 'C', text: 'Die Kaskoversicherung ist günstiger als die Haftpflicht' },
      { id: 'D', text: 'Beide Versicherungen sind gesetzlich vorgeschrieben' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 19,
    chapter: 6,
    text: 'Welche Leistungen erbringt eine Rechtsschutzversicherung typischerweise?',
    options: [
      { id: 'A', text: 'Übernahme von Anwalts- und Gerichtskosten' },
      { id: 'B', text: 'Beratung durch einen Rechtsanwalt' },
      { id: 'C', text: 'Zahlung von Schadensersatz an den Gegner' },
      { id: 'D', text: 'Kostenübernahme für außergerichtliche Streitbeilegung' },
    ],
    correctAnswers: ['A', 'B', 'D'],
    type: 'multiple',
  },
  {
    id: 20,
    chapter: 1,
    text: 'Welche Informationspflichten hat ein Versicherungsvermittler gegenüber dem Kunden vor Abschluss eines Vertrages?',
    options: [
      { id: 'A', text: 'Name und Anschrift des Vermittlers' },
      { id: 'B', text: 'Ob er als Vertreter oder Makler tätig ist' },
      { id: 'C', text: 'Die genaue Provision, die er erhält' },
      { id: 'D', text: 'Das Versicherungsunternehmen, für das er tätig ist' },
    ],
    correctAnswers: ['A', 'B', 'D'],
    type: 'multiple',
  },
  {
    id: 21,
    chapter: 2,
    text: 'Welche steuerlichen Vorteile bietet die Basisrente (Rürup-Rente)?',
    options: [
      { id: 'A', text: 'Beiträge sind als Sonderausgaben steuerlich absetzbar' },
      { id: 'B', text: 'Die Auszahlungen im Rentenalter sind vollständig steuerfrei' },
      { id: 'C', text: 'Die Rente kann kapitalisiert und als Einmalbetrag ausgezahlt werden' },
      { id: 'D', text: 'Der Anspruch ist nicht pfändbar und nicht übertragbar' },
    ],
    correctAnswers: ['A', 'D'],
    type: 'multiple',
  },
  {
    id: 22,
    chapter: 3,
    text: 'Was bedeutet "Entgeltumwandlung" im Kontext der betrieblichen Altersvorsorge?',
    options: [
      { id: 'A', text: 'Der Arbeitgeber zahlt zusätzlich zum Gehalt in eine Betriebsrente ein' },
      { id: 'B', text: 'Der Arbeitnehmer verzichtet auf einen Teil seines Bruttogehalts zugunsten der bAV' },
      { id: 'C', text: 'Die Betriebsrente wird in eine private Rentenversicherung umgewandelt' },
      { id: 'D', text: 'Der Arbeitgeber wandelt Sachleistungen in Rentenansprüche um' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 23,
    chapter: 4,
    text: 'Welche Pflegegrade gibt es in der deutschen Pflegeversicherung?',
    options: [
      { id: 'A', text: 'Pflegegrad 1 bis 3' },
      { id: 'B', text: 'Pflegegrad 1 bis 5' },
      { id: 'C', text: 'Pflegestufe I bis III' },
      { id: 'D', text: 'Pflegegrad 0 bis 5' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 24,
    chapter: 5,
    text: 'Was ist bei der Hausratversicherung unter "Unterversicherung" zu verstehen?',
    options: [
      { id: 'A', text: 'Die Versicherungssumme ist höher als der tatsächliche Wert des Hausrats' },
      { id: 'B', text: 'Die Versicherungssumme deckt nicht den vollen Wert des versicherten Hausrats ab' },
      { id: 'C', text: 'Der Versicherungsnehmer hat zu wenige Gegenstände versichert' },
      { id: 'D', text: 'Das Haus ist nicht mitversichert' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
  {
    id: 25,
    chapter: 6,
    text: 'Was versteht man unter dem Schadenfreiheitsrabatt (SF-Rabatt) in der Kfz-Versicherung?',
    options: [
      { id: 'A', text: 'Einen Rabatt für Fahrzeuge mit geringem Schadstoffausstoß' },
      { id: 'B', text: 'Eine Prämienreduzierung für schadenfreie Fahrzeugführung über mehrere Jahre' },
      { id: 'C', text: 'Einen Nachlass für Fahrzeuge, die nur selten genutzt werden' },
      { id: 'D', text: 'Eine Reduzierung für Fahrer ohne Vorschäden aus dem Ausland' },
    ],
    correctAnswers: ['B'],
    type: 'single',
  },
];

export const TOTAL_QUESTIONS = questions.length;
export const EXAM_QUESTION_COUNT = 50;
export const EXAM_DURATION_MINUTES = 90;
export const RANDOM_QUIZ_COUNT = 50;
