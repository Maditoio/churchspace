"use client";

import { Calculator, Percent, Wallet } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

const DEFAULT_LOAN_AMOUNT = 1_500_000;
const DEFAULT_INTEREST_RATE = 10.25;
const TERM_OPTIONS = [5, 10, 20, 25, 30] as const;

const currencyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 2,
});

function calculateBondRepayment(loanAmount: number, annualInterestRate: number, years: number) {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const totalMonths = years * 12;

  if (!Number.isFinite(loanAmount) || loanAmount <= 0 || totalMonths <= 0) {
    return {
      monthlyRepayment: 0,
      totalRepayment: 0,
      totalInterest: 0,
    };
  }

  if (monthlyInterestRate === 0) {
    const monthlyRepayment = loanAmount / totalMonths;
    return {
      monthlyRepayment,
      totalRepayment: monthlyRepayment * totalMonths,
      totalInterest: 0,
    };
  }

  const growthFactor = (1 + monthlyInterestRate) ** totalMonths;
  const monthlyRepayment = loanAmount * ((monthlyInterestRate * growthFactor) / (growthFactor - 1));
  const totalRepayment = monthlyRepayment * totalMonths;

  return {
    monthlyRepayment,
    totalRepayment,
    totalInterest: totalRepayment - loanAmount,
  };
}

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function BondCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULT_LOAN_AMOUNT.toString());
  const [interestRate, setInterestRate] = useState(DEFAULT_INTEREST_RATE.toFixed(2));

  const parsedLoanAmount = Number(loanAmount.replace(/,/g, ""));
  const parsedInterestRate = Number(interestRate);
  const safeLoanAmount = Number.isFinite(parsedLoanAmount) && parsedLoanAmount > 0 ? parsedLoanAmount : 0;
  const safeInterestRate = Number.isFinite(parsedInterestRate) && parsedInterestRate >= DEFAULT_INTEREST_RATE
    ? parsedInterestRate
    : DEFAULT_INTEREST_RATE;

  const results = TERM_OPTIONS.map((years) => ({
    years,
    ...calculateBondRepayment(safeLoanAmount, safeInterestRate, years),
  }));

  return (
    <div className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,169,110,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(18,49,43,0.12),transparent_30%),linear-gradient(180deg,rgba(255,252,246,0.95),rgba(246,241,232,0.88))]" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <section className="rounded-(--radius-xl) border border-(--border-strong) bg-white/88 p-6 shadow-(--shadow-lg) backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--accent-light) px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-(--accent-strong)">
              <Calculator className="h-4 w-4" />
              Bond calculator
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] text-foreground">Estimate your monthly bond repayment.</h1>
            <p className="mt-4 text-sm leading-7 text-(--text-secondary)">
              Compare repayment terms for church property finance over 5, 10, 20, 25, and 30 years using a base interest rate of 10.25% that you can adjust upward.
            </p>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Wallet className="h-4 w-4 text-(--accent-strong)" />
                  Loan amount (capital)
                </span>
                <Input
                  type="number"
                  min="1"
                  step="1000"
                  inputMode="numeric"
                  value={loanAmount}
                  onChange={(event) => setLoanAmount(event.target.value)}
                  placeholder="1500000"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Percent className="h-4 w-4 text-(--accent-strong)" />
                  Interest rate (%)
                </span>
                <Input
                  type="number"
                  min={DEFAULT_INTEREST_RATE}
                  step="0.01"
                  inputMode="decimal"
                  value={interestRate}
                  onChange={(event) => setInterestRate(event.target.value)}
                  placeholder={DEFAULT_INTEREST_RATE.toFixed(2)}
                />
                <p className="mt-2 text-xs text-(--text-muted)">
                  Minimum interest rate is {DEFAULT_INTEREST_RATE.toFixed(2)}%.
                </p>
              </label>
            </div>

            <div className="mt-8 rounded-(--radius-lg) border border-(--border) bg-(--surface-raised) p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-strong)">Disclaimer</p>
              <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                This calculator is for estimation only and does not constitute financial advice, a credit offer, or lender approval. Results exclude bank fees,
                insurance, transfer costs, registration costs, and any changes in interest rates over time.
              </p>
            </div>
          </section>

          <section>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {results.map((result) => (
                <article
                  key={result.years}
                  className="overflow-hidden rounded-(--radius-xl) border border-(--border) bg-white/92 shadow-(--shadow-md)"
                >
                  <div className="border-b border-(--border) bg-[linear-gradient(135deg,rgba(18,49,43,0.98),rgba(33,80,71,0.96))] px-5 py-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Term</p>
                    <h2 className="mt-1 font-display text-4xl">{result.years} years</h2>
                    <p className="mt-2 text-sm text-white/75">At {safeInterestRate.toFixed(2)}% interest</p>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="rounded-(--radius-lg) bg-(--primary-soft) p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-strong)">Monthly repayment</p>
                      <p className="mt-2 font-display text-4xl text-foreground">{formatCurrency(result.monthlyRepayment)}</p>
                    </div>
                    <dl className="space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-4 border-b border-(--border) pb-3">
                        <dt className="text-(--text-secondary)">Loan value capital</dt>
                        <dd className="font-semibold text-foreground">{formatCurrency(safeLoanAmount)}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-b border-(--border) pb-3">
                        <dt className="text-(--text-secondary)">Total interest</dt>
                        <dd className="font-semibold text-foreground">{formatCurrency(result.totalInterest)}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-(--text-secondary)">Total repayment</dt>
                        <dd className="font-semibold text-foreground">{formatCurrency(result.totalRepayment)}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}