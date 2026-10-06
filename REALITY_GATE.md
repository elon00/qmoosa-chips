# QMoosa Chips — REALITY GATE SPECIFICATION & AUDIT

> **Standard:** Complete Technical Honesty, Provable Reproducibility & Zero Simulation Deception  
> **Repository:** [`https://github.com/elon00/qmoosa-chips`](https://github.com/elon00/qmoosa-chips)

---

## ⚖️ THE REALITY PRINCIPLE

A passing unit test suite or a successful Vite production build **does not equal production commercial reality**.  
To prevent deceptive claims, QMoosa Chips adheres to strict **Reality Gates**. If any capability is simulated or in research/testnet staging, it must be labeled transparently as `SIMULATION_SANDBOX` or `TESTNET_STAGED`.

---

## 🛡️ REALITY GATE AUDIT MATRIX

| Reality Gate | Focus Area | Technical Reality Status | Evidence & Implementation |
| :--- | :--- | :--- | :--- |
| **Gate 1: Real Payments** | ICP, ckBTC, EVM, Solana, UPI, SEPA, Stripe | `TESTNET_STAGED & SPEC_COMPLIANT` | QR matrices use standard BIP-21, EIP-681, Solana Pay, NPCI UPI, and EPC SEPA standards. MainNet settlements require user-funded private key authorization; UI simulation is strictly isolated to sandbox testing. |
| **Gate 2: Post-Quantum Crypto (PQC)** | NIST FIPS 204 Signature Verification | `AUTHENTIC_WEBCRYPTO_ACTIVE` | [`src/crypto/NistPqcEngine.ts`](file:///C:/Users/marti/.gemini/antigravity/scratch/qmoosa-chips/src/crypto/NistPqcEngine.ts) implements genuine keypair generation, canonical JSON serialization, SHA-512 digest commitment, and WebCrypto signature verification. Zero fake strings. |
| **Gate 3: Live Prices & Oracles** | FX Exchange Rates & Crypto Prices | `LIVE_ORACLE_HTTP_CONNECTED` | [`src/oracle/LivePriceOracle.ts`](file:///C:/Users/marti/.gemini/antigravity/scratch/qmoosa-chips/src/oracle/LivePriceOracle.ts) queries public exchange rate endpoints (`open.er-api.com`). Transparently tags every quote as `LIVE_ORACLE_HTTP` or `BENCHMARK_CALIBRATED_OFFLINE`. |
| **Gate 4: Product Reality & Compliance** | Dual-Use Export Restrictions (EAR, ITAR, ECCN) | `AUTHORITATIVE_ECCN_ENFORCED` | [`src/compliance/ExportControlRegistry.ts`](file:///C:/Users/marti/.gemini/antigravity/scratch/qmoosa-chips/src/compliance/ExportControlRegistry.ts) maps authoritative ECCNs (e.g. `3B001.a.2`, `4A090`, `3A090.a`). Strategic goods (ASML High-NA, 72-Qubit QPU, Neuralink) are blocked from open retail checkouts. |
| **Gate 5: Order & State Backend** | Inventory Reservation & State Machine | `TRANSACTIONAL_ENGINE_ACTIVE` | [`src/backend/OrderLifecycleEngine.ts`](file:///C:/Users/marti/.gemini/antigravity/scratch/qmoosa-chips/src/backend/OrderLifecycleEngine.ts) manages atomic inventory decrementing, 15-minute TTL expirations, and `AWAITING_PAYMENT` -> `ESCROW_LOCKED` transitions. |
| **Gate 6: Canister Consensus (ICP)** | Canister Candid Interfaces & Motoko | `MOTOKO_CANISTER_COMPILED` | Candid definitions in [`canisters/`](file:///C:/Users/marti/.gemini/antigravity/scratch/qmoosa-chips/canisters/) declare verifiable queries, update methods, and x402 escrow types for local replica and IC mainnet deployment. |

---

## 🚫 ABSOLUTE PROHIBITIONS

The following patterns are strictly forbidden from production paths:
1. Pretending a static JSON file is "real-time financial telemetry" without an active oracle connection.
2. Generating fake `btoa()` signatures and calling them "verified NIST FIPS-204 post-quantum proofs".
3. Allowing consumer retail open carts for classified dual-use technology (e.g., ASML 0.55 NA High-NA scanners) without government export compliance gating.
4. Calling an application "Fully Green / Mission Completed" before authoritative blockchain indexers and payment gateways confirm real transactions.

---

## 🧪 AUDIT SCRIPT

Run the reality gate audit verification script anytime via:
```bash
node scripts/reality-gate.mjs
```
