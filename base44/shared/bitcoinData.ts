const COINBASE = 'https://api.exchange.coinbase.com';
const UA = { headers: { 'User-Agent': 'Asset-Pattern-Tracker/1.0' } };
const DELAY = 3000;

export const ASSETS = {
  BTC: { symbol: 'BTC', name: 'Bitcoin', ticker: 'BTC', kind: 'crypto', supply: 19_850_000 },
  ETH: { symbol: 'ETH', name: 'Ethereum', ticker: 'ETH', kind: 'crypto', supply: 120_700_000 },
  SOL: { symbol: 'SOL', name: 'Solana', ticker: 'SOL', kind: 'crypto', supply: 490_000_000 },
  GOLD: { symbol: 'PAXG', name: 'Gold', ticker: 'XAU', kind: 'gold', supply: 0 }
};

export function resolveAsset(key) {
  return ASSETS[key] || ASSETS.BTC;
}

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, UA);
    if (res.ok) return res.json();
    if (res.status === 429 && i < retries - 1) {
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      continue;
    }
    const body = await res.text().catch(() => '');
    throw new Error(`Fetch ${res.status}: ${body.slice(0, 120)}`);
  }
}

// USD->EUR FX rate (free, no key). Cached for the function invocation.
let _fxEur = null;
async function getEurRate() {
  if (_fxEur) return _fxEur;
  const d = await fetchJson('https://open.er-api.com/v6/latest/USD');
  _fxEur = d && d.rates && typeof d.rates.EUR === 'number' ? d.rates.EUR : 0.86;
  return _fxEur;
}

// Gold (PAXG) only has a USD pair on Coinbase; EUR is derived via FX conversion.
function pairFor(asset, currency) {
  return asset.kind === 'gold' ? `${asset.symbol}-USD` : `${asset.symbol}-${currency}`;
}

export async function fetchCurrentPrice(assetKey, currency = 'USD') {
  const asset = resolveAsset(assetKey);
  const isGold = asset.kind === 'gold';
  const pair = pairFor(asset, currency);
  const d = await fetchJson(`${COINBASE}/products/${pair}/stats`);
  const last = parseFloat(d.last);
  const open = parseFloat(d.open);
  const high = parseFloat(d.high);
  const low = parseFloat(d.low);
  const vol = parseFloat(d.volume);
  let price = last, high24h = high, low24h = low, volume24h = vol * last;
  if (isGold && currency === 'EUR') {
    const r = await getEurRate();
    price = last * r; high24h = high * r; low24h = low * r; volume24h = vol * price;
  }
  return {
    price,
    change24h: open ? (last - open) / open * 100 : 0,
    marketCap: asset.supply ? price * asset.supply : null,
    volume24h,
    high24h,
    low24h
  };
}

export async function fetchDailyPrices(assetKey, fromUnix, toUnix, currency = 'USD') {
  const asset = resolveAsset(assetKey);
  const isGold = asset.kind === 'gold';
  const pair = pairFor(asset, currency);
  const results = [];
  const chunkSecs = 295 * 86400;
  let cursor = fromUnix;
  let first = true;
  while (cursor < toUnix) {
    if (!first) await new Promise(r => setTimeout(r, DELAY));
    first = false;
    const chunkEnd = Math.min(cursor + chunkSecs, toUnix);
    const data = await fetchJson(`${COINBASE}/products/${pair}/candles?granularity=86400&start=${new Date(cursor * 1000).toISOString()}&end=${new Date(chunkEnd * 1000).toISOString()}`);
    if (!Array.isArray(data) || !data.length) break;
    results.push(...data);
    cursor = chunkEnd;
  }
  results.sort((a, b) => a[0] - b[0]);
  const seen = new Set();
  let out = results
    .filter(k => { if (seen.has(k[0])) return false; seen.add(k[0]); return true; })
    .map(k => [k[0], k[4]]); // [time(seconds), close]
  if (isGold && currency === 'EUR') {
    const r = await getEurRate();
    out = out.map(([t, p]) => [t, p * r]);
  }
  return out;
}

export function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

export function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  const ma = mean(a.slice(0, n)), mb = mean(b.slice(0, n));
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { const xa = a[i] - ma, xb = b[i] - mb; num += xa * xb; da += xa * xa; db += xb * xb; }
  if (da === 0 || db === 0) return 0;
  return num / Math.sqrt(da * db);
}

export function normalize(series) {
  const base = series[0];
  return series.map(p => base ? (p - base) / base * 100 : 0);
}