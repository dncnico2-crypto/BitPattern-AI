import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    app_title: 'BTC Pattern Tracker',
    app_subtitle: 'Historical similarity & buy/sell signals',
    run_analysis: 'Run Analysis',
    analyzing: 'Analyzing...',
    strong_buy_alert: 'Strong Buy signal detected — you\'ve been notified by email.',
    strong_sell_alert: 'Strong Sell signal detected — you\'ve been notified by email.',
    price: 'Price',
    market_cap: 'Market Cap',
    volume_24h: '24h Volume',
    range_24h: '24h Range',
    trading_signal: 'Trading Signal',
    pattern_match: 'Pattern Match',
    buy_confidence: 'Buy Confidence',
    sell_confidence: 'Sell Confidence',
    hist_pattern_matches: 'Historical Pattern Matches',
    similar: 'similar',
    to_current: 'to current pattern',
    what_happened_next: 'What happened next',
    no_matches: 'No historical pattern matches found.',
    why_moving: 'Why is BTC moving?',
    rising: 'Rising',
    falling: 'Falling',
    reading_news: 'Reading the latest news...',
    powered_by: 'Powered by live web search · not financial advice',
    recent_analyses: 'Recent Analyses',
    buy_label: 'buy',
    sell_label: 'sell',
    no_analysis: 'No analysis yet. Click "Run Analysis" to study the market.',
    footer: 'Not financial advice. Analysis based on historical price patterns via Coinbase data.',
    currency_label: 'Currency',
    language_label: 'Language',
    asset_label: 'Asset',
    strong_buy: 'Strong Buy',
    buy: 'Buy',
    hold: 'Hold',
    sell: 'Sell',
    strong_sell: 'Strong Sell'
  },
  es: {
    app_title: 'Rastreador de Patrones BTC',
    app_subtitle: 'Similitud histórica y señales de compra/venta',
    run_analysis: 'Ejecutar análisis',
    analyzing: 'Analizando...',
    strong_buy_alert: 'Señal de compra fuerte detectada — has sido notificado por email.',
    strong_sell_alert: 'Señal de venta fuerte detectada — has sido notificado por email.',
    price: 'Precio',
    market_cap: 'Cap. de mercado',
    volume_24h: 'Volumen 24h',
    range_24h: 'Rango 24h',
    trading_signal: 'Señal de trading',
    pattern_match: 'Coincidencia de patrón',
    buy_confidence: 'Confianza de compra',
    sell_confidence: 'Confianza de venta',
    hist_pattern_matches: 'Coincidencias de patrones históricos',
    similar: 'similar',
    to_current: 'al patrón actual',
    what_happened_next: 'Qué pasó después',
    no_matches: 'No se encontraron coincidencias históricas.',
    why_moving: '¿Por qué se mueve BTC?',
    rising: 'Subiendo',
    falling: 'Bajando',
    reading_news: 'Leyendo las últimas noticias...',
    powered_by: 'Impulsado por búsqueda web en vivo · no es asesoramiento financiero',
    recent_analyses: 'Análisis recientes',
    buy_label: 'compra',
    sell_label: 'venta',
    no_analysis: 'Aún no hay análisis. Haz clic en "Ejecutar análisis" para estudiar el mercado.',
    footer: 'No es asesoramiento financiero. Análisis basado en patrones históricos de precio vía datos de Coinbase.',
    currency_label: 'Moneda',
    language_label: 'Idioma',
    asset_label: 'Activo',
    strong_buy: 'Compra fuerte',
    buy: 'Comprar',
    hold: 'Mantener',
    sell: 'Vender',
    strong_sell: 'Venta fuerte'
  }
};

const CURRENCY_SYMBOL = { USD: '$', EUR: '€' };

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => localStorage.getItem('btc_currency') || 'USD');
  const [language, setLanguageState] = useState(() => localStorage.getItem('btc_language') || 'en');

  const setCurrency = (c) => { localStorage.setItem('btc_currency', c); setCurrencyState(c); };
  const setLanguage = (l) => { localStorage.setItem('btc_language', l); setLanguageState(l); };

  const t = (key) => translations[language]?.[key] ?? translations.en[key] ?? key;
  const localeCode = language === 'es' ? 'es-ES' : 'en-US';
  const currencySymbol = CURRENCY_SYMBOL[currency] || '$';

  const formatPrice = (n, digits = 2) => {
    if (n == null || isNaN(n)) return '';
    return `${currencySymbol}${n.toLocaleString(localeCode, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
  };
  const formatLarge = (n) => {
    if (n == null || isNaN(n)) return '';
    return `${currencySymbol}${n.toLocaleString(localeCode, { maximumFractionDigits: 0 })}`;
  };
  const formatPct = (n, digits = 1) => {
    if (n == null || isNaN(n)) return '';
    return `${n.toLocaleString(localeCode, { maximumFractionDigits: digits, minimumFractionDigits: digits })}%`;
  };
  const formatDate = (d, opts) => new Date(d).toLocaleString(localeCode, opts);

  return (
    <LocaleContext.Provider value={{ currency, language, setCurrency, setLanguage, t, formatPrice, formatLarge, formatPct, formatDate, currencySymbol, localeCode }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);