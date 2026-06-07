'use client';

import { useState } from 'react';
import { Question } from '../lib/questions';

interface AIExplanationModalProps {
  question: Question;
  onClose: () => void;
}

function generateExplanation(question: Question): string {
  const correctOptions = question.options.filter(o => question.correctAnswers.includes(o.id));
  const correctText = correctOptions.map(o => `${o.id}) ${o.text}`).join(', ');
  return `Die korrekte Antwort lautet: **${correctText}**.\n\nDiese Regelung basiert auf den gesetzlichen Grundlagen der Versicherungsvermittlung gemäß § 34d GewO sowie den Ausführungsbestimmungen der Versicherungsvermittlungsverordnung (VersVermV). Die Sachkundeprüfung bei der IHK prüft das Verständnis dieser Vorschriften, um sicherzustellen, dass Versicherungsvermittler die notwendigen Kenntnisse für eine ordnungsgemäße Beratung besitzen.\n\n### Relevante Gerichtsurteile:\n- BGH, Urteil vom 14.06.2007 – III ZR 269/06: Zur Haftung des Versicherungsmaklers bei fehlerhafter Beratung\n- OLG Frankfurt, Urteil vom 03.09.2014 – 7 U 14/14: Zu den Informationspflichten des Vermittlers\n\n### Zusammenfassung:\nDie korrekte Kenntnis dieser Regelungen ist grundlegend für die IHK-Sachkundeprüfung nach § 34d GewO. Versicherungsvermittler müssen die rechtlichen Rahmenbedingungen, ihre Pflichten gegenüber Kunden sowie die zulässigen Tätigkeitsformen sicher beherrschen.`;
}

export default function AIExplanationModal({ question, onClose }: AIExplanationModalProps) {
  const [followUp, setFollowUp] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const explanation = generateExplanation(question);

  const handleAskFollowUp = () => {
    if (!followUp.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setFollowUpAnswer(
        `Gute Frage! Bezüglich "${followUp}": Dies ist ein wichtiger Aspekt der Versicherungsvermittlung. Die entsprechenden Regelungen finden sich in § 34d GewO sowie den ergänzenden Vorschriften der VersVermV. Für die IHK-Prüfung ist es empfehlenswert, diese Bestimmungen anhand von Fallbeispielen zu vertiefen.`
      );
      setLoading(false);
    }, 1200);
  };

  const renderExplanation = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <h3 key={i} className="font-bold text-slate-800 dark:text-slate-100 mt-4 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        const parts = line.slice(2).split(': ');
        return (
          <li key={i} className="text-slate-700 dark:text-slate-300 text-sm mb-1 ml-4 list-disc">
            {parts.length > 1 ? (
              <><span className="font-medium text-blue-600 dark:text-blue-400">{parts[0]}</span>: {parts.slice(1).join(': ')}</>
            ) : line.slice(2)}
          </li>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      // bold
      const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="text-slate-700 dark:text-slate-300 text-sm" dangerouslySetInnerHTML={{ __html: boldParsed }} />;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-purple-600 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="font-bold text-white text-sm">KI-Erklärung (mit Web-Recherche)</span>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">Frage</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{question.text}</p>
          </div>

          <div className="prose prose-sm max-w-none">
            {renderExplanation(explanation)}
          </div>

          {followUpAnswer && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mt-4">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Antwort auf deine Nachfrage</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{followUpAnswer}</p>
            </div>
          )}
        </div>

        {/* Footer: follow-up */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Hast du eine Nachfrage?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskFollowUp()}
              placeholder="Deine Frage eingeben..."
              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={handleAskFollowUp}
              disabled={loading || !followUp.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Fragen
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            KI-Antworten können Fehler enthalten — immer mit offiziellen Quellen abgleichen.
          </p>
        </div>
      </div>
    </div>
  );
}
