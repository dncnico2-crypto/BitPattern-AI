import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { waitUntil } from 'base44:runtime';
import { fetchCurrentPrice, fetchDailyPrices, resolveAsset, mean, pearson, normalize } from '../../shared/bitcoinData.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (e) {}
    const assetKey = ['BTC', 'ETH', 'SOL', 'GOLD'].includes(body.asset) ? body.asset : 'BTC';
    const lang = body.language === 'es' ? 'es' : 'en';
    const asset = resolveAsset(assetKey);

    const now = Math.floor(Date.now() / 1000);
    const lookback = 2.4 * 365 * 86400;
    const [current, daily] = await Promise.all([
      fetchCurrentPrice(assetKey, 'USD'),
      fetchDailyPrices(assetKey, now - lookback, now, 'USD')
    ]);

    const prices = daily;
    const WINDOW = 60;
    const todayIdx = prices.length - 1;
    const currentWindow = prices.slice(todayIdx - WINDOW + 1, todayIdx + 1).map(p => p[1]);
    const currentNorm = normalize(currentWindow);

    const matches = [];
    for (let yearsAgo = 1; yearsAgo <= 2; yearsAgo++) {
      const targetIdx = todayIdx - yearsAgo * 365;
      if (targetIdx - WINDOW + 1 < 0) continue;
      const histWindow = prices.slice(targetIdx - WINDOW + 1, targetIdx + 1).map(p => p[1]);
      const histNorm = normalize(histWindow);
      const corr = pearson(currentNorm, histNorm);
      const sim = Math.abs(corr) * 100;
      const endPrice = prices[targetIdx][1];
      const p30 = prices[Math.min(targetIdx + 30, prices.length - 1)][1];
      const p90 = prices[Math.min(targetIdx + 90, prices.length - 1)][1];
      matches.push({
        year: new Date(prices[targetIdx][0] * 1000).getFullYear().toString(),
        similarity: Math.round(sim * 10) / 10,
        outcome_30d: Math.round((p30 - endPrice) / endPrice * 1000) / 10,
        outcome_90d: Math.round((p90 - endPrice) / endPrice * 1000) / 10
      });
    }

    const topMatches = matches.sort((a, b) => b.similarity - a.similarity).slice(0, 4);

    let bullW = 0, bearW = 0, bullW90 = 0, bearW90 = 0;
    for (const m of topMatches) {
      if (m.outcome_30d > 0) bullW += m.similarity * m.outcome_30d; else bearW += m.similarity * (-m.outcome_30d);
      if (m.outcome_90d > 0) bullW90 += m.similarity * m.outcome_90d; else bearW90 += m.similarity * (-m.outcome_90d);
    }
    const total30 = bullW + bearW, total90 = bullW90 + bearW90;
    const buyConf30 = total30 > 0 ? bullW / total30 * 100 : 50;
    const buyConf90 = total90 > 0 ? bullW90 / total90 * 100 : 50;
    const buyConf = Math.round((buyConf30 + buyConf90) / 2);
    const sellConf = 100 - buyConf;

    let signal = 'hold';
    if (buyConf >= 75) signal = 'strong_buy';
    else if (buyConf >= 60) signal = 'buy';
    else if (sellConf >= 75) signal = 'strong_sell';
    else if (sellConf >= 60) signal = 'sell';

    const avgSim = topMatches.length ? Math.round(mean(topMatches.map(m => m.similarity))) : 0;
    const matchedYears = topMatches.map(m => m.year);
    const avgOutcome30 = topMatches.length ? Math.round(mean(topMatches.map(m => m.outcome_30d)) * 10) / 10 : 0;

    const { name, ticker } = asset;
    const yearsLabel = matchedYears.length ? matchedYears.join(', ') : (lang === 'es' ? 'ningún año anterior' : 'no prior years');

    let summary;
    if (lang === 'es') {
      const direction = buyConf > sellConf ? 'subir' : 'bajar';
      summary = `Los últimos ${WINDOW} días de ${name} muestran ${avgSim}% de similitud con ${yearsLabel}. Tras esos patrones históricos, ${ticker} tendía a ${direction} ~${Math.abs(avgOutcome30)}% en los siguientes 30 días. Señal actual: ${buyConf}% de confianza de compra frente a ${sellConf}% de confianza de venta.`;
    } else {
      const direction = buyConf > sellConf ? 'rise' : 'fall';
      summary = `${name}'s last ${WINDOW} days show ${avgSim}% similarity with ${yearsLabel}. After those historical patterns, ${ticker} tended to ${direction} ~${Math.abs(avgOutcome30)}% over the following 30 days. Current signal: ${buyConf}% buy confidence vs ${sellConf}% sell confidence.`;
    }

    // News-based rationale: pull current world news via LLM with live web context
    let newsRationale = '';
    try {
      const isGold = asset.kind === 'gold';
      const persona = isGold ? 'commodities market analyst' : 'cryptocurrency market analyst';
      const drivers = isGold
        ? 'Federal Reserve / interest rate decisions, US dollar strength (DXY), inflation data, geopolitical tensions, central bank gold purchases, gold ETF inflows or outflows'
        : 'regulatory actions, Federal Reserve / interest rate decisions, spot ETF inflows or outflows, institutional moves, inflation / jobs data, geopolitics, major exchange news';
      const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a ${persona}. ${name} (${ticker}) currently trades at $${current.price.toLocaleString()} USD, with a 24-hour price change of ${current.change24h?.toFixed(2)}%. The pattern-based trading signal right now is "${signal}" (${buyConf}% buy confidence / ${sellConf}% sell confidence).\n\nUsing the LATEST real-world news and macroeconomic context available to you, explain in 2-4 sentences WHY ${name}'s price is currently rising or falling. Reference concrete recent events where possible (e.g. ${drivers}). Be factual, balanced and concise. Do NOT give financial advice or make future price predictions — only explain the current drivers. Plain text, no markdown. ${lang === 'es' ? 'Write the response in Spanish.' : 'Write the response in English.'}`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: { rationale: { type: 'string' } },
          required: ['rationale']
        }
      });
      newsRationale = (llmRes && typeof llmRes === 'object' && llmRes.rationale) ? llmRes.rationale : (typeof llmRes === 'string' ? llmRes : '');
    } catch (e) {
      newsRationale = '';
    }

    const analysis = await base44.entities.BitcoinAnalysis.create({
      asset: assetKey,
      price: current.price,
      price_change_24h: current.change24h,
      signal,
      buy_confidence: buyConf,
      sell_confidence: sellConf,
      pattern_similarity: avgSim,
      matched_years: matchedYears,
      matched_year_outcomes: topMatches,
      summary,
      news_rationale: newsRationale,
      analysis_date: new Date().toISOString()
    });

    if ((signal === 'strong_buy' || signal === 'strong_sell') && user.email) {
      waitUntil(
        base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `${name} Signal: ${signal.replace('_', ' ').toUpperCase()} — ${buyConf}% buy / ${sellConf}% sell`,
          body: `${summary}\n\nCurrent ${name} price: $${current.price.toLocaleString()}\n\nNews context: ${newsRationale}`
        }).catch(() => {})
      );
    }

    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}