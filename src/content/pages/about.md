---
title: "About BadOmen & Crowley"
description: "Learn about the BadOmen quantitative stock trading algorithm and the Crowley companion website."
---

Welcome to **Crowley**, the public reporting companion site for the **BadOmen** algorithmic stock trading pipeline. 

This platform serves as a daily execution log, dashboard, and research repository tracking our automated growth portfolio. All logs, positions, and performance metrics are updated in real-time using historical API endpoints and paper trading accounts.

---

## 📓 What is BadOmen?

**BadOmen** is a proprietary trend-following and momentum-breakout stock trading algorithm designed to capture upside in leading sectors while dynamically hedging during market downturns. The algorithm screens liquid, high-growth US equities and executes automated limit buy orders on pullbacks, while managing risk using a multi-tiered exit system.

### Core Algorithmic Mechanics

1. **Dynamic Market Regime-Switching:** 
   The system runs a daily check on the overall market trend (using `SPY` against its **200-day Simple Moving Average**).
   * **Bull Regime (SPY $\ge$ 200-SMA):** Bypasses earnings deceleration filters, lowers the cash safety buffer, concentrates capital, and relaxes exits to capture high-conviction growth.
   * **Bear Regime (SPY < 200-SMA):** Restricts buys to strict growth-acceleration metrics, enforces a defensive Cash Safety Cushion, and activates tight trendline exit checks.
   
2. **Beta-Adjusted Pullback Entries:**
   Rather than using static entry metrics, BadOmen calculates historical asset volatility (Beta) to define entry pullback targets. High-Beta stocks are required to undergo deeper consolidations before entry, while stable low-Beta stocks are entered on smaller pullbacks.

3. **Multi-Tiered Exit Strategy:**
   Risk is mitigated by executing partial liquidations at designated thresholds:
   * **Tier 1 (Profit Lock):** Liquidates 1/3 of the position when the asset rises 30% to 50% above average entry cost.
   * **Tier 2 (Growth Decay):** Liquidates 1/3 of the position if future consensus earnings growth rates decelerate significantly.
   * **Tier 3 (Trend Break):** Exits the remaining holdings entirely if the stock price closes below its **50-day SMA** during a market-wide bear regime.

---

## 🛠️ The Tech Stack

The automated pipeline is built on a modular, clean python setup:
* **Quantitative Engine:** Python, `pandas`, `numpy`, and `yfinance` for core screening calculations, regime checks, and indicator calculations.
* **Order Execution:** Integrates directly with the **Alpaca API** for real-time asset data, active position monitoring, and paper order routing.
* **Automated Alerting:** Dispatches order queues, exit triggers, and status updates directly to a private Slack workspace via incoming webhooks.
* **Reporting & Publishing:** Automatically compiles execution logs into markdown posts, plots equity curves using `matplotlib`, and updates the companion **AstroPaper** blog on GitHub Pages.

---

## ⚠️ Disclaimer

*All performance metrics, journal entries, and order sheets published on this site represent dry-run and paper-trading allocations for educational and quantitative research purposes only. Nothing on this website constitutes direct financial advice, investment recommendations, or solicitation to trade live capital.*
