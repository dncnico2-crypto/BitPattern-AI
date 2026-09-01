import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';

export default function SignalCard({ analysis }) {
  const { t, formatPct } = useLocale();
  if (!analysis) return null;

  const SIGNALS = {
    strong_buy: { color: '#16c784', Icon: ArrowUpCircle },
    buy: { color: '#4ade80', Icon: ArrowUpCircle },
    hold: { color: '#fbbf24', Icon: MinusCircle },
    sell: { color: '#f87171', Icon: ArrowDownCircle },
    strong_sell: { color: '#ea3943', Icon: ArrowDownCircle }
  };
  const sig = SIGNALS[analysis.signal] || SIGNALS.hold;
  const { Icon } = sig;

  return (
    <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-slate-400 text-sm">{t('trading_signal')}</div>
          <div className="flex items-center gap-2 mt-1">
            <Icon className="w-6 h-6" style={{ color: sig.color }} />
            <span className="text-2xl font-bold" style={{ color: sig.color }}>{t(analysis.signal)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-sm">{t('pattern_match')}</div>
          <div className="text-2xl font-bold text-white">{formatPct(analysis.pattern_similarity, 0)}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-[#16c784] font-medium">{t('buy_confidence')}</span>
            <span className="text-white font-mono font-bold">{formatPct(analysis.buy_confidence, 0)}</span>
          </div>
          <div className="h-3 bg-[#0a0e1a] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${analysis.buy_confidence}%`, background: 'linear-gradient(90deg, #16c784, #4ade80)' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-[#ea3943] font-medium">{t('sell_confidence')}</span>
            <span className="text-white font-mono font-bold">{formatPct(analysis.sell_confidence, 0)}</span>
          </div>
          <div className="h-3 bg-[#0a0e1a] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${analysis.sell_confidence}%`, background: 'linear-gradient(90deg, #ea3943, #f87171)' }} />
          </div>
        </div>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mt-5 pt-5 border-t border-[#1e2a3d]">{analysis.summary}</p>
    </div>
  );
}