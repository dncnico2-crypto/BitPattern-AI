import React from 'react';
import { History } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';

export default function PatternMatches({ matches }) {
  const { t, formatPct } = useLocale();
  if (!matches || !matches.length) {
    return (
      <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-6 text-slate-400 text-sm">
        {t('no_matches')}
      </div>
    );
  }
  return (
    <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-[#f7931a]" />
        <h3 className="text-white font-semibold">{t('hist_pattern_matches')}</h3>
      </div>
      <div className="space-y-3">
        {matches.map((m, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-[#0a0e1a] rounded-xl border border-[#1e2a3d]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f7931a]/10 border border-[#f7931a]/30 flex items-center justify-center text-[#f7931a] font-bold text-sm">
                {m.year}
              </div>
              <div>
                <div className="text-white text-sm font-medium">{formatPct(m.similarity)} {t('similar')}</div>
                <div className="text-slate-500 text-xs">{t('to_current')}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-0.5">{t('what_happened_next')}</div>
              <div className="flex gap-3 text-sm font-mono">
                <span className={m.outcome_30d >= 0 ? 'text-[#16c784]' : 'text-[#ea3943]'}>
                  30d: {m.outcome_30d >= 0 ? '+' : ''}{m.outcome_30d}%
                </span>
                <span className={m.outcome_90d >= 0 ? 'text-[#16c784]' : 'text-[#ea3943]'}>
                  90d: {m.outcome_90d >= 0 ? '+' : ''}{m.outcome_90d}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}