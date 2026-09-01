import React from 'react';
import { useLocale } from '@/lib/LocaleContext';

const OPTIONS = [
  { value: 'BTC', label: 'BTC', sub: 'Bitcoin' },
  { value: 'ETH', label: 'ETH', sub: 'Ethereum' },
  { value: 'SOL', label: 'SOL', sub: 'Solana' },
  { value: 'GOLD', label: 'XAU', sub: 'Gold' }
];

export default function AssetSelector({ asset, onChange }) {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-1.5 bg-[#131a2a] border border-[#1e2a3d] rounded-xl p-1">
      <select
        value={asset}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('asset_label')}
        className="bg-transparent text-white text-xs font-medium px-2 py-1 rounded-lg outline-none cursor-pointer hover:bg-[#1e2a3d] [&>option]:bg-[#131a2a]"
      >
        {OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label} · {o.sub}</option>
        ))}
      </select>
    </div>
  );
}