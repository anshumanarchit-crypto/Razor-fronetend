# WAPSI — AI Revenue Recovery Engine (Frontend)

WAPSI is an AI-powered revenue recovery intelligence platform designed for modern recurring and digital commerce. Unlike traditional blunt retry systems that spam users or blindly reissue transactions, WAPSI determines **causal incremental uplift**—predicting not just who pays, but who pays *specifically because of a strategic intervention*—while respecting strict compliance limits (NPCI, contact budgets, frequency caps) and preserving merchant trust.

## 🎯 Primary Source of Truth
This frontend implementation is a pixel-accurate reproduction of the Google Stitch Project:
[Google Stitch WAPSI Project](https://stitch.withgoogle.com/projects/11931954862282798683)

## 🧭 Core Product Screens (7 Routes)
- `/overview`: High-level pulse of revenue at risk, incremental recovery, AI opportunities, domain breakdown, funnel, and governance banner.
- `/recovery-center`: Live recovery mission control queue with recommended actions, incremental uplift %, decision confidence, evidence source, and interactive Case Intelligence Drawer.
- `/ai-decisions`: Deep causal uplift intelligence, treatment vs baseline comparison (No Action, Retry, WhatsApp, Voice, Incentive), timing hazard curves, network prior signal contribution, and model health.
- `/recovery-cases`: Comprehensive operational ledger of all recovery cases with multi-facet filtering, sorting, status tracking, and case causal attribution.
- `/analytics`: Causal recovery metrics, WAPSI vs Baseline counterfactual comparison, domain/outcome distributions, and real-time interactive Recovery Simulator.
- `/governance`: Enterprise policy controls (NPCI limits, contact budgets), Policy Health gauge, immutable Audit Trail timeline, Fairness & Bias monitor, and TEE Enclave simulation.
- `/settings`: Merchant profile, engine & model thresholds, communication channels, integrations, and data retention policies.

## 🛠️ Technology Stack
- **Framework**: React 18 / Vite 8 + TypeScript (Strict mode)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Custom Stitch Dark Navy Design System
- **Components**: Radix UI Primitives + Lucide Icons
- **Visualizations**: Recharts
- **State Management**: TanStack Query + Zustand (Cross-screen reactive demo store)
- **Animations**: Framer Motion

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run typecheck & build
npm run build
```

## 📁 Architecture Documentation
Detailed specifications are organized in `/docs`:
- `docs/01-product-spec.md`
- `docs/02-stitch-design-spec.md`
- `docs/03-design-system.md`
- `docs/04-frontend-architecture.md`
- `docs/05-api-contract.md`
- `docs/06-ml-contract.md`
- `docs/07-demo-flow.md`
- `docs/08-visual-validation.md`
