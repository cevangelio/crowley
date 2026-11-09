import fs from "node:fs";
import path from "node:path";

export interface PositionHolding {
  ticker: string;
  industry: string;
  shares: number;
  entryCost: number;
  currentPrice: number;
  pnl: number;
  pnlFormatted: string;
  isGreen: boolean;
  returnPct: string;
}

export interface RealizedTrade {
  ticker: string;
  shares: number;
  entryPrice: number;
  exitPrice: number;
  trigger: string;
  pnl: number;
  pnlFormatted: string;
  isGreen: boolean;
  date: string;
}

export interface IndustryExposure {
  industry: string;
  count: number;
  pct: number;
}

export interface PortfolioMetrics {
  baselineCapital: number;
  netEquity: number;
  netEquityFormatted: string;
  totalReturn: number;
  totalReturnFormatted: string;
  totalReturnPct: number;
  totalReturnPctFormatted: string;
  cashBalance: number;
  cashBalanceFormatted: string;
  capitalInvested: number;
  capitalInvestedFormatted: string;
  deployedPct: number;
  cashBufferPct: number;
  unrealizedPnlRaw: string;
  lastUpdated: string;
  holdings: PositionHolding[];
  activePositionsCount: number;
  activeGreenCount: number;
  activeRedCount: number;
  realizedTrades: RealizedTrade[];
  realizedCount: number;
  realizedWins: number;
  realizedLosses: number;
  realizedWinRatePct: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  payoffRatio: number;
  industryExposures: IndustryExposure[];
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
}

function parseCurrency(str: string | undefined): number {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function getPortfolioMetrics(): PortfolioMetrics {
  const contentPath = path.resolve("./src/content/posts/portfolio-performance.md");
  let content = "";
  try {
    content = fs.readFileSync(contentPath, "utf8");
  } catch (err) {
    console.error("Could not read portfolio-performance.md", err);
  }

  // Parse summary metrics
  const equityMatch = content.match(
    /\|\s*\*\*Net Portfolio Equity\*\*\s*\|\s*\*\*([^\*]+)\*\*/
  );
  const netEquity = parseCurrency(equityMatch ? equityMatch[1] : "100000");

  const cashMatch = content.match(
    /\|\s*\*\*Cash Balance\*\*\s*\|\s*([^\|]+)\|/
  );
  const cashBalance = parseCurrency(cashMatch ? cashMatch[1] : "0");

  const unpnlMatch = content.match(
    /\|\s*\*\*Total Unrealized P&L\*\*\s*\|\s*([^\|]+)\|/
  );
  const unrealizedPnlRaw = unpnlMatch ? unpnlMatch[1].trim() : "$0.00";

  const updatedMatch = content.match(
    /\|\s*\*\*Report Updated\*\*\s*\|\s*`([^`]+)`/
  );
  const lastUpdated = updatedMatch ? updatedMatch[1].trim() : "LIVE";

  const baselineCapital = 100000;
  const totalReturn = netEquity - baselineCapital;
  const totalReturnPct = ((netEquity - baselineCapital) / baselineCapital) * 100;
  const capitalInvested = Math.max(0, netEquity - cashBalance);
  const deployedPct = netEquity > 0 ? (capitalInvested / netEquity) * 100 : 0;
  const cashBufferPct = netEquity > 0 ? (cashBalance / netEquity) * 100 : 0;

  // Parse holdings and realized trades
  const lines = content.split("\n");
  let inHoldings = false;
  let inRealized = false;
  const holdings: PositionHolding[] = [];
  const realizedTrades: RealizedTrade[] = [];

  for (const line of lines) {
    if (line.includes("Current Position Holdings")) {
      inHoldings = true;
      inRealized = false;
      continue;
    }
    if (
      line.includes("Recent Realized Trades") ||
      line.includes("Realized Profits")
    ) {
      inHoldings = false;
      inRealized = true;
      continue;
    }
    if (line.startsWith("## ") || line.startsWith("# ")) {
      inHoldings = false;
      inRealized = false;
    }

    if (inHoldings && line.startsWith("| **")) {
      const parts = line.split("|").map(s => s.trim()).filter(Boolean);
      if (parts.length >= 7) {
        const pnl = parseCurrency(parts[5]);
        const isGreen = parts[5].includes("🟢") || pnl > 0;
        holdings.push({
          ticker: parts[0].replace(/\*\*/g, ""),
          industry: parts[1],
          shares: parseCurrency(parts[2]),
          entryCost: parseCurrency(parts[3]),
          currentPrice: parseCurrency(parts[4]),
          pnl,
          pnlFormatted: parts[5],
          isGreen,
          returnPct: parts[6],
        });
      }
    }

    if (inRealized && line.startsWith("| **")) {
      const parts = line.split("|").map(s => s.trim()).filter(Boolean);
      if (parts.length >= 7) {
        const pnl = parseCurrency(parts[5]);
        const isGreen = parts[5].includes("🟢") || pnl > 0;
        realizedTrades.push({
          ticker: parts[0].replace(/\*\*/g, ""),
          shares: parseCurrency(parts[1]),
          entryPrice: parseCurrency(parts[2]),
          exitPrice: parseCurrency(parts[3]),
          trigger: parts[4],
          pnl,
          pnlFormatted: parts[5],
          isGreen,
          date: parts[6],
        });
      }
    }
  }

  // Also include any historical closed trades from journal entries if not already in recent realized list
  try {
    const postsDir = path.resolve("./src/content/posts");
    const journalFiles = fs
      .readdirSync(postsDir)
      .filter(f => f.endsWith("-journal.md"));
    const seen = new Set(
      realizedTrades.map(t => `${t.ticker}_${t.shares}_${t.date}`)
    );

    for (const jFile of journalFiles) {
      const jContent = fs.readFileSync(path.join(postsDir, jFile), "utf8");
      const jLines = jContent.split("\n");
      let inJournalRealized = false;
      for (const jLine of jLines) {
        if (
          jLine.includes("Realized Profits & Closed Trades") ||
          jLine.includes("Recent Realized Trades")
        ) {
          inJournalRealized = true;
          continue;
        }
        if (inJournalRealized && jLine.startsWith("## ")) {
          inJournalRealized = false;
          continue;
        }
        if (inJournalRealized && jLine.startsWith("| **")) {
          const parts = jLine.split("|").map(s => s.trim()).filter(Boolean);
          if (parts.length >= 7) {
            const ticker = parts[0].replace(/\*\*/g, "");
            const shares = parseCurrency(parts[1]);
            const date = parts[6];
            const key = `${ticker}_${shares}_${date}`;
            if (!seen.has(key)) {
              seen.add(key);
              const pnl = parseCurrency(parts[5]);
              const isGreen = parts[5].includes("🟢") || pnl > 0;
              realizedTrades.push({
                ticker,
                shares,
                entryPrice: parseCurrency(parts[2]),
                exitPrice: parseCurrency(parts[3]),
                trigger: parts[4],
                pnl,
                pnlFormatted: parts[5],
                isGreen,
                date,
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error reading journal realized trades", err);
  }

  // Realized calculations
  const totalWins = realizedTrades.filter(r => r.isGreen);
  const totalLosses = realizedTrades.filter(r => !r.isGreen);
  const grossProfit = totalWins.reduce((sum, r) => sum + r.pnl, 0);
  const grossLoss = Math.abs(totalLosses.reduce((sum, r) => sum + r.pnl, 0));
  const realizedWinRatePct =
    realizedTrades.length > 0
      ? (totalWins.length / realizedTrades.length) * 100
      : 0;
  const profitFactor =
    grossLoss > 0
      ? grossProfit / grossLoss
      : grossProfit > 0
        ? Math.min(grossProfit / 100, 99.9)
        : 1.0;
  const avgWin = totalWins.length > 0 ? grossProfit / totalWins.length : 0;
  const avgLoss = totalLosses.length > 0 ? grossLoss / totalLosses.length : 0;
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? avgWin : 1.0;

  // Active positions statistics
  const activeGreenCount = holdings.filter(h => h.isGreen).length;
  const activeRedCount = holdings.filter(h => !h.isGreen).length;

  // Industry breakdown
  const industryCounts: Record<string, number> = {};
  for (const h of holdings) {
    industryCounts[h.industry] = (industryCounts[h.industry] || 0) + 1;
  }
  const industryExposures: IndustryExposure[] = Object.entries(industryCounts)
    .map(([industry, count]) => ({
      industry,
      count,
      pct: holdings.length > 0 ? (count / holdings.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Exit trigger tier breakdown
  let tier1Count = 0;
  let tier2Count = 0;
  let tier3Count = 0;

  for (const r of realizedTrades) {
    const trigLower = r.trigger.toLowerCase();
    if (trigLower.includes("tier 1") || trigLower.includes("profit lock")) {
      tier1Count++;
    } else if (
      trigLower.includes("tier 2") ||
      trigLower.includes("decel") ||
      trigLower.includes("earnings")
    ) {
      tier2Count++;
    } else {
      tier3Count++;
    }
  }

  const formatUSD = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(val);

  return {
    baselineCapital,
    netEquity,
    netEquityFormatted: formatUSD(netEquity),
    totalReturn,
    totalReturnFormatted: `${totalReturn >= 0 ? "+" : ""}${formatUSD(totalReturn)}`,
    totalReturnPct,
    totalReturnPctFormatted: `${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%`,
    cashBalance,
    cashBalanceFormatted: formatUSD(cashBalance),
    capitalInvested,
    capitalInvestedFormatted: formatUSD(capitalInvested),
    deployedPct,
    cashBufferPct,
    unrealizedPnlRaw,
    lastUpdated,
    holdings,
    activePositionsCount: holdings.length,
    activeGreenCount,
    activeRedCount,
    realizedTrades,
    realizedCount: realizedTrades.length,
    realizedWins: totalWins.length,
    realizedLosses: totalLosses.length,
    realizedWinRatePct,
    grossProfit,
    grossLoss,
    profitFactor,
    avgWin,
    avgLoss,
    payoffRatio,
    industryExposures,
    tier1Count,
    tier2Count,
    tier3Count,
  };
}

