import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLocale } from '@/lib/LocaleContext';

export default function PriceChart({ prices }) {
  const { currencySymbol, localeCode } = useLocale();
  if (!prices || !prices.length) return null;
  const data = prices.map(p => ({
    date: new Date(p.time * 1000).toLocaleDateString(localeCode, { month: 'short', day: 'numeric' }),
    price: p.price
  }));

  return (
    <div className="bg-[#131a2a] border border-[#1e2a3d] rounded-2xl p-4 h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7931a" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f7931a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" vertical={false} />
          <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} minTickGap={30} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['dataMin', 'dataMax']} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} width={48} />
          <Tooltip
            contentStyle={{ background: '#0a0e1a', border: '1px solid #1e2a3d', borderRadius: 12, color: '#fff' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v) => [`${currencySymbol}${v.toLocaleString(localeCode, { maximumFractionDigits: 0 })}`, 'BTC']}
          />
          <Area type="monotone" dataKey="price" stroke="#f7931a" strokeWidth={2} fill="url(#btcGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}