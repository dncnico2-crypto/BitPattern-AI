import React from 'react';
import { Globe } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';

export default function LocaleSettings() {
  const { currency, language, setCurrency, setLanguage, t } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-400 hidden sm:block" />
      <div className="flex items-center gap-1.5 bg-[#131a2a] border border-[#1e2a3d] rounded-xl p-1">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label={t('currency_label')}
          className="bg-transparent text-white text-xs font-medium px-2 py-1 rounded-lg outline-none cursor-pointer hover:bg-[#1e2a3d] [&>option]:bg-[#131a2a]"
        >
          <option value="USD">USD $</option>
          <option value="EUR">EUR €</option>
        </select>
        <div className="w-px h-4 bg-[#1e2a3d]" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label={t('language_label')}
          className="bg-transparent text-white text-xs font-medium px-2 py-1 rounded-lg outline-none cursor-pointer hover:bg-[#1e2a3d] [&>option]:bg-[#131a2a]"
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
      </div>
    </div>
  );
}