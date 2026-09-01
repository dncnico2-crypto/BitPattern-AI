import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { fetchCurrentPrice, fetchDailyPrices } from '../../shared/bitcoinData.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (e) {}
    const currency = body.currency === 'EUR' ? 'EUR' : 'USD';
    const asset = ['BTC', 'ETH', 'SOL', 'GOLD'].includes(body.asset) ? body.asset : 'BTC';

    const now = Math.floor(Date.now() / 1000);
    const from = now - 90 * 86400;
    const [current, daily] = await Promise.all([fetchCurrentPrice(asset, currency), fetchDailyPrices(asset, from, now, currency)]);

    return Response.json({
      asset,
      currency,
      price: current.price,
      change24h: current.change24h,
      marketCap: current.marketCap,
      volume24h: current.volume24h,
      high24h: current.high24h,
      low24h: current.low24h,
      prices: daily.map(([t, p]) => ({ time: t, price: p }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}