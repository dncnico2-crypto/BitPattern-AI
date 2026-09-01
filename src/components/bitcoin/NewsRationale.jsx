import React from 'react';
import { Newspaper, Loader2 } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';

export default function NewsRationale({ analysis, loading }) {
  const { t } = useLocale();
  const isUp = analysis && analysis.price_change_24h >= 0;

  if (loading && (!analysis || !analysis.news_rationale)) {
    return (
      <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-[#f7931a]" />
          <h3 className="text-white font-semibold text-sm">{t('why_moving')}</h3>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t('reading_news')}
        </div>
      </div>
    );
  }

  if (!analysis || !analysis.news_rationale) return null;

  return (
    <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-[#f7931a]" />
        <h3 className="text-white font-semibold text-sm">{t('why_moving')}</h3>
        <span
          className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${isUp ? 'bg-[#16c784]/10 text-[#16c784]' : 'bg-[#ea3943]/10 text-[#ea3943]'}`}
        >
          {isUp ? t('rising') : t('falling')} {analysis.price_change_24h >= 0 ? '+' : ''}{analysis.price_change_24h?.toFixed(2)}%
        </span>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{analysis.news_rationale}</p>
      <p className="text-slate-600 text-[11px] mt-3 pt-3 border-t border-[#1e2a3d]">
        {t('powered_by')}
      </p>
    </div>
  );
}