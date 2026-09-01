import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bitcoin, RefreshCw, Bell, Sparkles } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';
import PriceHeader from '@/components/bitcoin/PriceHeader';
import PriceChart from '@/components/bitcoin/PriceChart';
import SignalCard from '@/components/bitcoin/SignalCard';
import PatternMatches from '@/components/bitcoin/PatternMatches';
import AnalysisHistory from '@/components/bitcoin/AnalysisHistory';
import NewsRationale from '@/components/bitcoin/NewsRationale';
import LocaleSettings from '@/components/bitcoin/LocaleSettings';
import AssetSelector from '@/components/bitcoin/AssetSelector';

export default function Home() {
  const { t, currency, language } = useLocale();
  const [asset, setAsset] = useState(() => localStorage.getItem('btc_asset') || 'BTC');
  const [chartData, setChartData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const changeAsset = (a) => { localStorage.setItem('btc_asset', a); setAsset(a); };

  useEffect(() => { loadInitial(); /* eslint-disable-next-line */ }, [currency, language, asset]);

  async function loadInitial() {
    setLoading(true);
    setError(null);
    try {
      const [chartRes, histRes] = await Promise.all([
        base44.functions.invoke('getBitcoinChart', { currency, asset }),
        base44.entities.BitcoinAnalysis.list('-analysis_date', 30)
      ]);
      setChartData(chartRes.data);
      const filtered = histRes.filter(a => (a.asset || 'BTC') === asset).slice(0, 10);
      setHistory(filtered);
      if (filtered.length) setAnalysis(filtered[0]);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
    setLoading(false);
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('analyzeBitcoinMarket', { language, asset });
      setAnalysis(res.data.analysis);
      setHistory(prev => [res.data.analysis, ...prev.filter(a => (a.asset || 'BTC') === asset)].slice(0, 10));
      const chartRes = await base44.functions.invoke('getBitcoinChart', { currency, asset });
      setChartData(chartRes.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
    setAnalyzing(false);
  }

  const strongSignal = analysis && (analysis.signal === 'strong_buy' || analysis.signal === 'strong_sell');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1e2a3d] border-t-[#f7931a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#f7931a] flex items-center justify-center">
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">{t('app_title')}</h1>
              <p className="text-slate-400 text-xs">{t('app_subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <AssetSelector asset={asset} onChange={changeAsset} />
            <LocaleSettings />
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2 bg-[#f7931a] hover:bg-[#e8860f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? t('analyzing') : t('run_analysis')}
            </button>
          </div>
        </header>

        {/* Strong signal alert */}
        {strongSignal && (
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border"
            style={{
              background: analysis.signal === 'strong_buy' ? 'rgba(22,199,132,0.08)' : 'rgba(234,57,67,0.08)',
              borderColor: analysis.signal === 'strong_buy' ? 'rgba(22,199,132,0.3)' : 'rgba(234,57,67,0.3)'
            }}>
            <Bell className="w-5 h-5" style={{ color: analysis.signal === 'strong_buy' ? '#16c784' : '#ea3943' }} />
            <p className="text-sm" style={{ color: analysis.signal === 'strong_buy' ? '#16c784' : '#ea3943' }}>
              <strong>{analysis.signal === 'strong_buy' ? t('strong_buy') : t('strong_sell')}</strong> — {analysis.signal === 'strong_buy' ? t('strong_buy_alert') : t('strong_sell_alert')}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#ea3943]/10 border border-[#ea3943]/30 text-[#ea3943] text-sm">
            {error}
          </div>
        )}

        {/* Price stats */}
        {chartData && <div className="mb-6"><PriceHeader data={chartData} /></div>}

        {/* Chart */}
        {chartData && <div className="mb-6"><PriceChart prices={chartData.prices} /></div>}

        {/* Signal + pattern matches */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <SignalCard analysis={analysis} />
          <PatternMatches matches={analysis?.matched_year_outcomes} />
        </div>

        {/* News-driven rationale */}
        {analysis && (
          <div className="mb-6">
            <NewsRationale analysis={analysis} loading={analyzing} />
          </div>
        )}

        {/* History */}
        <AnalysisHistory history={history} />

        {!analysis && !error && (
          <div className="text-center py-12 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#f7931a]" />
            <p>{t('no_analysis')}</p>
          </div>
        )}

        <footer className="mt-10 text-center text-slate-600 text-xs">
          {t('footer')}
        </footer>
      </div>
    </div>
  );
}