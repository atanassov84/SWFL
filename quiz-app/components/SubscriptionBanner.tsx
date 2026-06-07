'use client';

interface SubscriptionBannerProps {
  questionsUsed: number;
  questionsTotal: number;
}

export default function SubscriptionBanner({ questionsUsed, questionsTotal }: SubscriptionBannerProps) {
  const remaining = questionsTotal - questionsUsed;
  return (
    <div className="bg-orange-500 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 rounded-xl shadow-md">
      <span className="text-sm font-medium">
        Kostenloser Testzugang aktiv — noch{' '}
        <strong>{remaining} von {questionsTotal} Fragen</strong> verfügbar
      </span>
      <button className="shrink-0 bg-white text-orange-600 font-semibold text-sm px-4 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
        Jetzt Abo sichern →
      </button>
    </div>
  );
}
