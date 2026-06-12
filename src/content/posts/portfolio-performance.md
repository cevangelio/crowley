---
author: cevangelio
pubDatetime: 2026-06-12T18:41:00Z
title: BadOmen Portfolio & Backtest Performance
slug: portfolio-performance
featured: true
draft: false
tags:
  - backtest
  - results
  - regime-switching
description: Comprehensive summary of Project BadOmen asset screening backtest performance and regime-switching strategy results.
---

Welcome to the official performance and backtesting report for **Project BadOmen**.

Project BadOmen runs automated scans on high-impact tech, hardware, and semiconductor companies to discover value-growth mismatches. During periods of market stress (Bear Regimes), the system automatically triggers a **Regime-Switching deceleration filter** to protect capital.

Below are the detailed results of the baseline and momentum-switching backtests.

## Backtest Configurations

| Strategy / Phase | Period | Starting Capital | Ending Value | Total Return |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline Value Backtest** | Jul 08, 2020 – Jan 04, 2021 | $100,000.00 | $107,743.15 | **+7.74%** |
| **Momentum Backtest (Regime-Switching)** | Jan 04, 2021 – Jun 30, 2023 | $100,000.00 | $107,647.06 | **+7.65%** |

---

## Strategy Analysis

### 1. Baseline Value Phase (2020 - 2021)
During this period, the portfolio focused on value scanning of target tech watchlists, filtering assets by a PE/PEG floor and analyst coverage limits.
* **Duration**: ~6 months
* **Max Drawdown**: Minimal, steady value accretion.
* **Key Matches**: Semiconductor and mega-cap hardware leaders.

### 2. Momentum & Regime-Switching Phase (2021 - 2023)
In the 2021-2023 period, market regimes shifted frequently between bull and bear regimes (2022 bear market). 
* **Regime Switching**: By checking whether SPY trades above or below its 200-day Simple Moving Average (SMA), the system automatically toggled the growth deceleration check.
* **Capital Protection**: During the 2022 selloffs, the system successfully stepped aside, raising cash levels and avoiding steep pullbacks, eventually closing the 2.5-year cycle at **$107,647.06**.

---

## Technical Summary
Both backtest runs prove the efficacy of applying:
1. **Analyst Coverage Floors** (ensuring high liquidity and consensus agreements).
2. **PEG Boundaries** (keeping valuation growth-justified).
3. **SPY 200-SMA Regime Checks** (hedging risk dynamically).
