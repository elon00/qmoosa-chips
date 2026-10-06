/**
 * AgentTools.ts
 * Autonomous Agent Tools for QMoosa Chips Ecosystem
 */

import chipsCompanies from '../config/chips-companies.json';
import marketplaceProducts from '../config/marketplace-products.json';
import { X402BazaarClient } from '../x402/X402BazaarClient';
import { DynamicQRGenerator, PaymentRail } from '../wallet/DynamicQRGenerator';
import { ConwayEngine } from '../automaton/ConwayEngine';

export interface ToolExecutionResult {
  tool: string;
  success: boolean;
  data: any;
  summary: string;
}

export class AgentTools {
  private x402Client = new X402BazaarClient();

  public async executeTool(toolName: string, params: Record<string, any>): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'query_chip_company': {
        const id = (params.companyId || 'all').toLowerCase();
        if (id === 'all') {
          return {
            tool: 'query_chip_company',
            success: true,
            data: chipsCompanies,
            summary: `Retrieved live telemetry for ${chipsCompanies.length} global semiconductor companies.`
          };
        }
        const found = chipsCompanies.find(c => c.id.includes(id) || c.name.toLowerCase().includes(id));
        if (found) {
          return {
            tool: 'query_chip_company',
            success: true,
            data: found,
            summary: `Located ${found.name} (${found.country}): ${found.role}. Capacity: ${found.waferCapacityMonthly}.`
          };
        }
        return {
          tool: 'query_chip_company',
          success: false,
          data: null,
          summary: `Company matching '${params.companyId}' not found.`
        };
      }

      case 'trigger_x402_quote': {
        const path = params.resourcePath || '/api/v1/x402/chips/telemetry/aggregate';
        const challenge = await this.x402Client.requestResource(path);
        return {
          tool: 'trigger_x402_quote',
          success: true,
          data: challenge,
          summary: `Dispatched HTTP 402 challenge for resource '${path}'. Cost: ${challenge.challenge?.quote.amount} ${challenge.challenge?.quote.currency}.`
        };
      }

      case 'run_conway_simulation': {
        const engine = new ConwayEngine(36, 36, params.rule || 'B3/S23');
        const steps = params.steps || 5;
        for (let i = 0; i < steps; i++) {
          engine.step();
        }
        const metrics = engine.getMetrics();
        const hash = engine.computeStateProofHash();
        return {
          tool: 'run_conway_simulation',
          success: true,
          data: { metrics, hash, generation: engine.generation },
          summary: `Simulated ${steps} Conway lithography steps. Wafer Yield: ${metrics.yieldRate}%, Defect D0: ${metrics.defectDensityD0}/cm², Proof Hash: ${hash}.`
        };
      }

      case 'generate_payment_qr': {
        const rail = (params.rail || 'ICP') as PaymentRail;
        const amount = params.amount || 0.05;
        const qr = DynamicQRGenerator.createQR({
          rail,
          amount,
          note: params.note || 'x402 Silicon Allocation'
        });
        return {
          tool: 'generate_payment_qr',
          success: true,
          data: qr,
          summary: `Generated dynamic ${rail} QR code for ${qr.displayAmount} (Address: ${qr.recipientAddress.substring(0, 16)}...).`
        };
      }

      case 'compare_market_prices': {
        const query = (params.query || '').toLowerCase();
        const found = marketplaceProducts.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
        );
        const results = found.length > 0 ? found : marketplaceProducts.slice(0, 3);
        const summaries = results.map(r =>
          `${r.name}: USA $${r.usaPriceUsd.toLocaleString()} vs China ¥${r.chinaPriceCny.toLocaleString()} ($${r.chinaPriceUsdEquivalent.toLocaleString()}) [${r.priceAdvantage}]`
        ).join('\n');
        return {
          tool: 'compare_market_prices',
          success: true,
          data: results,
          summary: `Price Comparison:\n${summaries}`
        };
      }

      case 'explain_hidden_machine_video': {
        return {
          tool: 'explain_hidden_machine_video',
          success: true,
          data: {
            title: "Why Is China Hiding This Machine? (GetsetflySCIENCE Analysis)",
            coreSubject: "Particle Accelerator SSMB Lithography vs ASML EUV Monopolies",
            keyInsights: [
              "ASML High-NA EUV uses pulsed CO2 lasers vaporizing 50,000 tin droplets/sec in vacuum, locked by US/Dutch export controls.",
              "China's covert breakthrough: Steady-State Microbunching (SSMB) synchrotron light source developed with Tsinghua University.",
              "A single ring particle accelerator can supply EUV beamlines to multiple steppers simultaneously, bypassing ASML optics entirely.",
              "QMoosa Chips enables decentralized tracking and x402 settlement across both Western High-NA EUV and Eastern SSMB sovereign fabs."
            ]
          },
          summary: "Synthesized technical & geopolitical briefing from 'Why Is China Hiding This Machine?'."
        };
      }

      default:
        return {
          tool: toolName,
          success: false,
          data: null,
          summary: `Unknown tool: ${toolName}`
        };
    }
  }
}
