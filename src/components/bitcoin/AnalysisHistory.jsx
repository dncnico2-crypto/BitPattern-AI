import React from 'react';
import { Clock } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';

const SIGNAL_DOT = {
  strong_buy: '#16c784', buy: '#4ade80', hold: '#fbbf24', sell: '#f87171', strong_sell: '#ea3943'
};

export default function AnalysisHistory({ history }) {
  const { t, formatPrice, formatDate } = useLocale();
  if (!history || !history.length) return null;
  return (
    <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[#f7931a]" />
        <h3 className="text-white font-semibold">{t('recent_analyses')}</h3>
      </div>
      <div className="space-y-2">
        {history.map((a) => (
          <div key={a.id} className="flex items-center justify-between p-3 bg-[#0a0e1a] rounded-xl border border-[#1e2a3d]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: SIGNAL_DOT[a.signal] || '#fbbf24' }} />
              <div>
                <div className="text-white text-sm font-mono">
                  {formatPrice(a.price, 0)}
                  {a.asset && a.asset !== 'BTC' && <span className="ml-1.5 text-[10px] text-[#f7931a] bg-[#f7931a]/10 px-1.5 py-0.5 rounded">{a.asset}</span>}
                </div>
                <div className="text-slate-500 text-xs">{formatDate(a.analysis_date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-[#16c784] font-mono">{a.buy_confidence}% {t('buy_label')}</div>
              <div className="text-[#ea3943] font-mono">{a.sell_confidence}% {t('sell_label')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}