#!/usr/bin/env node
/**
 * FirstWeek pricing / profit scenario calculator.
 *
 * Plug in traffic, conversion, churn, and B2B deals — get monthly + annual
 * profit, contribution margins, LTV/CAC, and payback period.
 *
 * Grounded in the REAL unit costs from the codebase:
 *   - COGS/assessment  : measured ~$0.045 (tiered gpt-4o-mini + gpt-4o path)
 *                        src/lib/ai/client.ts (routing) + ai_logs.cost_usd (measured)
 *   - Pro price        : $19/mo  (src/components/pricing-cta.tsx, /pricing)
 *   - Free assessments : 1       (FREE_ASSESSMENTS, src/lib/billing/entitlement.ts)
 *   - Fixed infra      : ~$50/mo (Vercel Pro $20 + Supabase Pro $25 + domain)
 *
 * Usage:
 *   node scripts/pricing-model.mjs                 # run all preset scenarios
 *   node scripts/pricing-model.mjs --free=3000 --conv=0.03 --churn=0.15 --b2b=2
 *   node scripts/pricing-model.mjs --cac=8 --usage=20 --candidates=100
 */

// ---------------------------------------------------------------------------
// Cost & price constants (edit these to match measured reality)
// ---------------------------------------------------------------------------
const COST = {
  perAssessment: 0.045, // measured COGS, tiered model path
  proPrice: 19, // $/mo
  proAnnualPrice: 144, // $/yr (offered alongside monthly)
  b2bPerCandidate: 25, // $/candidate
  b2bCostPerCandidate: 0.09, // COGS for a B2B assessment (heavier path)
  fixedMonthly: 50, // Vercel + Supabase + domain
  stripePct: 0.029, // 2.9%
  stripeFlat: 0.3, // $0.30 per transaction
  revenueCatPct: 0.01, // ~1% of tracked revenue (RevenueCat)
};

// Processing fees on a single charge of `amount`.
const fees = (amount) => amount * (COST.stripePct + COST.revenueCatPct) + COST.stripeFlat;

// ---------------------------------------------------------------------------
// Preset scenarios — edit freely, or override any field from the CLI.
// ---------------------------------------------------------------------------
const PRESETS = [
  {
    name: "Conservative (organic only)",
    newFreeUsersPerMonth: 500,
    freeToPaidConversion: 0.02, // 2%
    monthlyChurn: 0.2, // job-seekers churn fast (~5mo lifetime)
    assessmentsPerProPerMonth: 12,
    cacPerPaidUser: 0, // pure organic / SEO
    b2bDeals: 0,
    candidatesPerDealPerMonth: 0,
  },
  {
    name: "Base (SEO traction + 2 employers)",
    newFreeUsersPerMonth: 3000,
    freeToPaidConversion: 0.03,
    monthlyChurn: 0.18,
    assessmentsPerProPerMonth: 15,
    cacPerPaidUser: 0,
    b2bDeals: 2,
    candidatesPerDealPerMonth: 80,
  },
  {
    name: "Aggressive (paid ads + B2B push)",
    newFreeUsersPerMonth: 15000,
    freeToPaidConversion: 0.04,
    monthlyChurn: 0.15,
    assessmentsPerProPerMonth: 18,
    cacPerPaidUser: 12, // buying growth
    b2bDeals: 10,
    candidatesPerDealPerMonth: 100,
  },
];

// ---------------------------------------------------------------------------
// The model
// ---------------------------------------------------------------------------
function model(s) {
  // --- Pro (subscription) side -------------------------------------------
  const newPaidPerMonth = s.newFreeUsersPerMonth * s.freeToPaidConversion;
  // Steady-state subscriber base: inflow / churn (Little's law).
  const steadyStateSubs = s.monthlyChurn > 0 ? newPaidPerMonth / s.monthlyChurn : Infinity;

  const proNetPerSub = COST.proPrice - fees(COST.proPrice);
  const proCogsPerSub = s.assessmentsPerProPerMonth * COST.perAssessment;
  const proContribPerSub = proNetPerSub - proCogsPerSub;

  const subsForTotals = Number.isFinite(steadyStateSubs) ? steadyStateSubs : newPaidPerMonth * 24;
  const proContribTotal = subsForTotals * proContribPerSub;

  // --- Free tier (a real cost: every free user burns 1 assessment) -------
  const freeTierCost = s.newFreeUsersPerMonth * COST.perAssessment * 1; // FREE_ASSESSMENTS = 1

  // --- B2B side ----------------------------------------------------------
  const b2bCandidates = s.b2bDeals * s.candidatesPerDealPerMonth;
  const b2bGross = b2bCandidates * COST.b2bPerCandidate;
  const b2bCogs = b2bCandidates * COST.b2bCostPerCandidate;
  const b2bFees = b2bGross * COST.stripePct; // invoiced; approximate as %-only
  const b2bContrib = b2bGross - b2bCogs - b2bFees;

  // --- Acquisition & fixed ----------------------------------------------
  const cacTotal = newPaidPerMonth * s.cacPerPaidUser;
  const fixed = COST.fixedMonthly;

  // --- Profit ------------------------------------------------------------
  const monthlyProfit = proContribTotal + b2bContrib - freeTierCost - cacTotal - fixed;
  const annualProfit = monthlyProfit * 12;

  // --- LTV / CAC ---------------------------------------------------------
  const avgLifetimeMonths = s.monthlyChurn > 0 ? 1 / s.monthlyChurn : Infinity;
  const ltv = proContribPerSub * avgLifetimeMonths; // contribution-based LTV
  const ltvCac = s.cacPerPaidUser > 0 ? ltv / s.cacPerPaidUser : Infinity;
  const paybackMonths = s.cacPerPaidUser > 0 ? s.cacPerPaidUser / proContribPerSub : 0;

  return {
    newPaidPerMonth,
    steadyStateSubs,
    proNetPerSub,
    proCogsPerSub,
    proContribPerSub,
    proContribTotal,
    freeTierCost,
    b2bCandidates,
    b2bGross,
    b2bContrib,
    cacTotal,
    fixed,
    monthlyProfit,
    annualProfit,
    avgLifetimeMonths,
    ltv,
    ltvCac,
    paybackMonths,
  };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
const usd = (n) =>
  !Number.isFinite(n)
    ? "∞"
    : (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
const num = (n, d = 0) => (!Number.isFinite(n) ? "∞" : n.toLocaleString("en-US", { maximumFractionDigits: d }));
const pct = (n) => (n * 100).toFixed(1) + "%";

function report(s) {
  const m = model(s);
  const line = "─".repeat(64);
  console.log("\n" + line);
  console.log(`  ${s.name}`);
  console.log(line);
  console.log("  INPUTS");
  console.log(`    New free users / mo .......... ${num(s.newFreeUsersPerMonth)}`);
  console.log(`    Free → paid conversion ....... ${pct(s.freeToPaidConversion)}`);
  console.log(`    Monthly churn ................ ${pct(s.monthlyChurn)}  (~${num(m.avgLifetimeMonths, 1)} mo lifetime)`);
  console.log(`    Assessments / Pro user / mo .. ${num(s.assessmentsPerProPerMonth)}`);
  console.log(`    CAC / paid user .............. ${usd(s.cacPerPaidUser)}`);
  console.log(`    B2B deals .................... ${num(s.b2bDeals)} × ${num(s.candidatesPerDealPerMonth)} candidates/mo`);

  console.log("\n  PRO (SUBSCRIPTION)");
  console.log(`    New paid subs / mo ........... ${num(m.newPaidPerMonth, 1)}`);
  console.log(`    Steady-state subscribers ..... ${num(m.steadyStateSubs, 0)}`);
  console.log(`    Net revenue / sub ............ ${usd(m.proNetPerSub)}  (after fees)`);
  console.log(`    COGS / sub ................... ${usd(m.proCogsPerSub)}`);
  console.log(`    Contribution / sub ........... ${usd(m.proContribPerSub)}  (${pct(m.proContribPerSub / COST.proPrice)} of price)`);
  console.log(`    Pro contribution total / mo .. ${usd(m.proContribTotal)}`);

  if (s.b2bDeals > 0) {
    console.log("\n  B2B (EMPLOYER)");
    console.log(`    Candidates assessed / mo ..... ${num(m.b2bCandidates)}`);
    console.log(`    B2B gross / mo ............... ${usd(m.b2bGross)}`);
    console.log(`    B2B contribution / mo ........ ${usd(m.b2bContrib)}`);
  }

  console.log("\n  COSTS");
  console.log(`    Free-tier COGS / mo .......... ${usd(m.freeTierCost)}`);
  console.log(`    Acquisition (CAC) / mo ....... ${usd(m.cacTotal)}`);
  console.log(`    Fixed infra / mo ............. ${usd(m.fixed)}`);

  console.log("\n  PROFIT");
  console.log(`    Monthly profit ............... ${usd(m.monthlyProfit)}`);
  console.log(`    Annualized ................... ${usd(m.annualProfit)}`);

  console.log("\n  UNIT ECONOMICS");
  console.log(`    LTV (Pro, contribution) ...... ${usd(m.ltv)}`);
  if (s.cacPerPaidUser > 0) {
    console.log(`    LTV / CAC .................... ${num(m.ltvCac, 1)}×  ${m.ltvCac >= 3 ? "✓ healthy (≥3)" : "⚠ thin (<3)"}`);
    console.log(`    CAC payback .................. ${num(m.paybackMonths, 1)} mo`);
  } else {
    console.log(`    LTV / CAC .................... ∞ (organic — no paid acquisition)`);
  }
}

// ---------------------------------------------------------------------------
// CLI overrides
// ---------------------------------------------------------------------------
function parseArgs() {
  const map = {
    free: "newFreeUsersPerMonth",
    conv: "freeToPaidConversion",
    churn: "monthlyChurn",
    usage: "assessmentsPerProPerMonth",
    cac: "cacPerPaidUser",
    b2b: "b2bDeals",
    candidates: "candidatesPerDealPerMonth",
  };
  const out = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--([a-z]+)=(.+)$/);
    if (m && map[m[1]]) out[map[m[1]]] = Number(m[2]);
  }
  return out;
}

const overrides = parseArgs();
console.log("\nFirstWeek — pricing / profit scenario model");
console.log(`(COGS/assessment $${COST.perAssessment} · Pro $${COST.proPrice}/mo · fixed $${COST.fixedMonthly}/mo)`);

if (Object.keys(overrides).length > 0) {
  // Single custom scenario built from the Base preset + overrides.
  const custom = { ...PRESETS[1], ...overrides, name: "Custom (CLI overrides)" };
  report(custom);
} else {
  for (const s of PRESETS) report(s);
}
console.log("");
