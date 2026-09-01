import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';

export default function PriceHeader({ data }) {
  const { t, formatPrice, formatLarge } = useLocale();
  if (!data) return null;
  const up = data.change24h >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <DollarSign className="w-3.5 h-3.5" /> {t('price')}
        </div>
        <div className="text-2xl font-bold text-white font-mono">{formatPrice(data.price)}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${up ? 'text-[#16c784]' : 'text-[#ea3943]'}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {up ? '+' : ''}{data.change24h?.toFixed(2)}%
        </div>
      </div>
      <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <BarChart3 className="w-3.5 h-3.5" /> {t('market_cap')}
        </div>
        <div className="text-2xl font-bold text-white font-mono">{data.marketCap == null ? '—' : formatLarge(data.marketCap)}</div>
      </div>
      <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-4">
        <div className="text-slate-400 text-xs mb-1">{t('volume_24h')}</div>
        <div className="text-2xl font-bold text-white font-mono">{data.volume24h == null ? '—' : formatLarge(data.volume24h)}</div>
      </div>
      <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-4">
        <div className="text-slate-400 text-xs mb-1">{t('range_24h')}</div>
        <div className="text-sm font-mono text-white">{formatPrice(data.low24h)}</div>
        <div className="text-sm font-mono text-slate-500">{formatPrice(data.high24h)}</div>
      </div>
    </div>
  );
}