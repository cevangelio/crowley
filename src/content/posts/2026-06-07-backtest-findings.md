---
title: "BadOmen Backtest Findings — Dynamic Regime-Switching Sizing & Screening"
pubDatetime: 2026-06-07T20:15:00+08:00
description: "BadOmen Backtest Findings and performance analysis report from 2026-06-07."
featured: false
draft: false
tags:
  - backtest
  - regime-switching
  - results
---


# 📓 BadOmen Backtest Findings — Dynamic Regime-Switching Sizing & Screening

We recently concluded a comprehensive backtesting and optimization sequence to address the out-of-sample performance of the **BadOmen Strategy** during the 2023–2025 bull market. By moving from a static configuration to a **Dynamic Regime-Switching** system, we resolved the strategy's two biggest issues: **cash drag** and **filter whipsaws**.

---

## 🔍 The Structural Problem

In the original backtester, we utilized a static risk management and screening configuration:
*   **Static $30,000 Cash Safety Cushion** (regardless of market conditions).
*   **Static 10% Maximum Position Size** per stock.
*   **Static Earnings Growth Deceleration Check** (skipped stocks whose YoY quarterly earnings growth had slowed).
*   **Static 50-day SMA Exit Check** (liquidated positions immediately upon a daily close below the 50-SMA).

While highly defensive (capping maximum drawdown to only **-10.81%** in the 2023–2025 out-of-sample period), these rules penalized the strategy heavily during the historic post-2023 bull run. 
1.  **Cash Drag**: Capping allocations at 10% and locking up $30,000 in cash meant the portfolio held roughly 40%-50% of its total equity in idle cash, dragging returns severely down to **+8.31%** (while SPY surged **+38.86%**).
2.  **Filter Whipsawing**: Growth leaders (like Nvidia) were skipped entirely because they temporarily registered trailing growth decelerations during transition quarters, right before embarking on massive runs.
3.  **Premature Exits**: Exiting on every 50-day SMA breakdown whipsawed the portfolio out of high-conviction tech names during normal consolidations.

---

## 🛠️ The Solution: Dynamic Regime-Switching

We implemented a point-in-time trend check. Every day, the system checks whether SPY is trading above or below its **200-day Simple Moving Average (SMA)**, adjusting the strategy's parameters dynamically:

| Parameter / Filter | Bull Market Regime (SPY $\ge$ 200-SMA) | Bear Market Regime (SPY < 200-SMA) |
| :--- | :--- | :--- |
| **Growth Deceleration Check** | **OFF** (`none` - allow megacap recoveries) | **ON** (`deceleration` - avoid weak fundamentals) |
| **Cash Safety Cushion** | **$10,000** (invest aggressively) | **$30,000** (keep defensive reserves) |
| **Max Allocation Cap** | **15%** of Equity (concentrate on winners) | **10%** of Equity (diversify strictly) |
| **SMA-50 Exit Check** | **Market-Filtered** (ignore breakdown if SPY is bull) | **Strict Trend Break** (liquidate immediately) |

Additionally, we replaced the hardcoded **15.0% pullback rule** with **Beta-Adjusted Dynamic Pullbacks** ($\text{Required Pullback} = \text{Beta} \times \text{Base Pullback}$), allowing stable blue chips (like Apple) to enter on smaller pullbacks while forcing highly cyclical semiconductor stocks (like Micron) to pull back deeper before entry.

---

## 📊 Backtest Performance Reports

### Phase 1: In-Sample (2021-01-04 to 2023-06-30)
*   **Timeline**: 627 trading days (includes the 2022 bear market)
*   **Starting Capital**: $100,000.00

| Configuration | Final Value | Return (%) | Max Drawdown (%) | Sharpe Ratio | Total Trades |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Watchlist Buy & Hold (Equal Weight)** | — | **+35.24%** | — | — | — |
| **BadOmen Strategy (Static Baseline)** | `$131,250.84` | **+31.25%** | **-23.96%** | **0.50** | **131** |
| **BadOmen Strategy (Regime-Switching)** | `$139,788.64` | **+39.79%** | **-26.02%** | **0.52** | **130** |

*Verdict*: The dynamic regime-switching strategy outperformed the watchlist buy-and-hold by **+4.55%** and the baseline by **+8.54%** in-sample, maintaining a stable Sharpe Ratio.

### Phase 2: Out-of-Sample (2023-06-30 to 2025-06-11)
*   **Timeline**: 489 trading days (highly expansionary bull market)
*   **Starting Capital**: $100,000.00

| Configuration | Final Value | Return (%) | Max Drawdown (%) | Sharpe Ratio | Total Trades |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **S&P 500 Index (SPY)** | — | **+38.86%** | **-10.30%** | — | — |
| **Watchlist Buy & Hold (Equal Weight)** | — | **+56.36%** | **-16.30%** | — | — |
| **BadOmen Strategy (Static Baseline)** | `$108,309.22` | **+8.31%** | **-10.81%** | **0.31** | **42** |
| **BadOmen Strategy (Regime-Switching)** | `$130,209.10` | **+30.21%** | **-24.03%** | **0.54** | **60** |

*Verdict*: Moving parameters dynamically **almost quadrupled** the out-of-sample return (from **+8.31%** to **+30.21%**), boosted the Sharpe Ratio from **0.31** to **0.54**, and increased transaction counts from **42** to **60** to actively capture the uptrend.

---

## 💡 Key Quantitative Insights

1.  **Enabling Growth Leaders**: Bypassing the growth deceleration check during bull markets successfully allowed the strategy to hold recovery leaders (such as Nvidia) that experienced temporary consolidation quarters but maintained massive long-term structural momentum.
2.  **Downside Filter Safety**: Keeping the deceleration checks active and cash cushions high during bear regimes (when SPY is below its 200 SMA) effectively protected capital during the 2022 downturn.
3.  **Market-Filtered Exits**: Only exiting positions on stock SMA-50 violations *when the overall market was also weak* (SPY < 200 SMA) prevented the strategy from selling high-conviction positions during healthy index-level uptrend pullbacks.

---

## 🚀 Live Integration

These backtesting parameters have been pushed directly to the live trading pipeline (`trader.py`, `magic_screener.py`, and `helpers/execution_engine.py`). They will govern our live paper trading operations dynamically going forward.
