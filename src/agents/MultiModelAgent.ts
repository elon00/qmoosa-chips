/**
 * MultiModelAgent.ts
 * Multi-Model Agentic AI Orchestrator for QMoosa Chips
 * Supports DeepSeek Coder, ICP On-Chain Neural Canister, Claude 3.5 Sonnet, and Gemini 2.0 Pro.
 */

import { AgentTools, ToolExecutionResult } from './AgentTools';

export type AIModelId = 'deepseek-coder' | 'icp-onchain-slm' | 'claude-3-5-sonnet' | 'gemini-2-0-pro';

export interface AIModelProfile {
  id: AIModelId;
  name: string;
  badge: string;
  description: string;
  avatar: string;
  accentColor: string;
  systemPrompt: string;
}

export const AI_MODELS: Record<AIModelId, AIModelProfile> = {
  'gemini-2-0-pro': {
    id: 'gemini-2-0-pro',
    name: 'Gemini 2.0 Pro',
    badge: 'Orchestrator & Fast Reasoning',
    description: 'Real-time multi-agent coordination, x402 Bazaar auction, multi-wallet settlement, and geopolitical chip analysis.',
    avatar: '✨',
    accentColor: '#38bdf8',
    systemPrompt: `You are Gemini 2.0 Pro, the Lead Orchestrator of the QMoosa Chips protocol on ICP and Caffeine.ai. You understand the global chip war, ASML lithography, China's covert SSMB particle accelerator EUV machines (featured in 'Why Is China Hiding This Machine?'), and x402 Bazaar autonomous commerce.`
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder / V3',
    badge: 'Silicon RTL & Verilog Synthesis',
    description: 'Hardware description language (HDL), gate-level synthesis, RISC-V extensions, and timing closure.',
    avatar: '⚡',
    accentColor: '#10b981',
    systemPrompt: `You are DeepSeek Coder, specializing in semiconductor architecture, Verilog/SystemVerilog RTL synthesis, and gate-level validation for 2nm/3nm nodes.`
  },
  'icp-onchain-slm': {
    id: 'icp-onchain-slm',
    name: 'ICP On-Chain Neural Canister',
    badge: 'Deterministic Web4 Consensus',
    description: 'Decentralized canister AI running on Internet Computer subnets. Zero third-party trust, deterministic silicon verification.',
    avatar: '🌐',
    accentColor: '#a855f7',
    systemPrompt: `You are the ICP On-Chain Neural Canister (Canister ID: rdmx6-jaaaa-aaaaa-aaadq-cai). You execute deterministic silicon proofs, Did:chip provenance, and threshold BLS signatures.`
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    badge: 'Lithography Optics & Physics',
    description: 'Extreme Ultraviolet (EUV) physics, High-NA anamorphic mirrors, tin plasma laser sources, and defect clustering.',
    avatar: '🧠',
    accentColor: '#f59e0b',
    systemPrompt: `You are Claude 3.5 Sonnet, a specialist in optical physics, EUV lithography (13.5nm wavelength, 0.55 High-NA), and yield modelling (Poisson/Murphy equations).`
  }
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  modelId: AIModelId;
  text: string;
  timestamp: number;
  toolCall?: {
    tool: string;
    params: any;
    result?: ToolExecutionResult;
  };
}

export class MultiModelAgent {
  private activeModel: AIModelId = 'gemini-2-0-pro';
  private tools = new AgentTools();
  private history: ChatMessage[] = [];

  constructor() {
    this.seedDefaultHistory();
  }

  private seedDefaultHistory() {
    this.history = [
      {
        id: 'msg_0',
        sender: 'agent',
        modelId: 'gemini-2-0-pro',
        text: `⚡ **Welcome to QMoosa Chips Web 4.0 Intelligence Hub.**\n\nI am synchronized with the Internet Computer Protocol (ICP) and the Caffeine.ai sovereign mesh. Based on the breakthrough analysis in **"Why Is China Hiding This Machine?"**, we track the global semiconductor war—from ASML's High-NA EUV lithography monopoly to China's secret Steady-State Microbunching (SSMB) synchrotron particle accelerator.\n\nHow can I assist your silicon coordination today? Try asking me about **the hidden machine**, **ASML vs SMIC telemetry**, **x402 payment quotes**, **Conway wafer yield simulations**, or **generating a dynamic crypto/UPI QR code**!`,
        timestamp: Date.now() - 60000
      }
    ];
  }

  public getHistory(): ChatMessage[] {
    return this.history;
  }

  public getActiveModel(): AIModelProfile {
    return AI_MODELS[this.activeModel];
  }

  public setActiveModel(modelId: AIModelId) {
    if (AI_MODELS[modelId]) {
      this.activeModel = modelId;
    }
  }

  public async sendMessage(userPrompt: string): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      modelId: this.activeModel,
      text: userPrompt,
      timestamp: Date.now()
    };
    this.history.push(userMsg);

    // Analyze prompt for intent and tool trigger
    const lower = userPrompt.toLowerCase();
    let toolToCall: string | null = null;
    let toolParams: Record<string, any> = {};

    if (lower.includes('hiding') || lower.includes('machine') || lower.includes('video') || lower.includes('china')) {
      toolToCall = 'explain_hidden_machine_video';
    } else if (lower.includes('asml') || lower.includes('tsmc') || lower.includes('smic') || lower.includes('company') || lower.includes('chip') || lower.includes('fab') || lower.includes('telemetry')) {
      toolToCall = 'query_chip_company';
      if (lower.includes('asml')) toolParams.companyId = 'asml';
      else if (lower.includes('tsmc')) toolParams.companyId = 'tsmc';
      else if (lower.includes('smic')) toolParams.companyId = 'smic';
      else if (lower.includes('nvidia')) toolParams.companyId = 'nvidia';
      else if (lower.includes('intel')) toolParams.companyId = 'intel';
      else toolParams.companyId = 'all';
    } else if (lower.includes('x402') || lower.includes('quote') || lower.includes('bazaar') || lower.includes('payment required')) {
      toolToCall = 'trigger_x402_quote';
      toolParams.resourcePath = '/api/v1/x402/chips/asml/high-na-telemetry';
    } else if (lower.includes('conway') || lower.includes('automaton') || lower.includes('wafer') || lower.includes('yield') || lower.includes('defect')) {
      toolToCall = 'run_conway_simulation';
      toolParams.steps = 10;
    } else if (lower.includes('price') || lower.includes('market') || lower.includes('compare') || lower.includes('gadget') || lower.includes('laptop') || lower.includes('quantum') || lower.includes('amazon') || lower.includes('cost')) {
      toolToCall = 'compare_market_prices';
      toolParams.query = lower.includes('laptop') ? 'laptop' : lower.includes('quantum') ? 'quantum' : lower.includes('gadget') ? 'gadget' : '';
    } else if (lower.includes('qr') || lower.includes('upi') || lower.includes('pay') || lower.includes('wallet') || lower.includes('fiat') || lower.includes('crypto')) {
      toolToCall = 'generate_payment_qr';
      if (lower.includes('upi')) toolParams.rail = 'UPI';
      else if (lower.includes('sol')) toolParams.rail = 'SOL';
      else if (lower.includes('eth')) toolParams.rail = 'ETH';
      else if (lower.includes('ckbtc')) toolParams.rail = 'ckBTC';
      else toolParams.rail = 'ICP';
      toolParams.amount = 0.05;
    }

    let agentResponseText = '';
    let toolResult: ToolExecutionResult | undefined;

    if (toolToCall) {
      toolResult = await this.tools.executeTool(toolToCall, toolParams);
    }

    // Synthesize response based on the active model
    const currentProfile = AI_MODELS[this.activeModel];

    if (toolToCall === 'compare_market_prices') {
      agentResponseText = `**[${currentProfile.name}] Global Semiconductor & Quantum Market Analysis:**\n\n` +
        `${toolResult?.summary}\n\n` +
        `**Key Economic Drivers:**\n` +
        `- **US Market (Silicon Valley):** High domestic design margins, export license controls on advanced dual-use QPUs & RTX 5090 chips.\n` +
        `- **Chinese Market (Shenzhen / Hefei):** Subsidized domestic manufacturing (Origin Quantum & Kirin AI), 15-38% price advantage on domestic supply chains, but subject to Western export blocks.\n` +
        `- **Distributor Wholesale:** Authorized distributors can access up to 35% bulk discounts (MOQ applied) with dual-rail fiat & crypto settlement via QMoosa Prime.`;
    } else if (toolToCall === 'explain_hidden_machine_video') {
      agentResponseText = `### 🔍 Analysis of "Why Is China Hiding This Machine?"\n\n` +
        `The video details the critical chokepoint in the global semiconductor race. ASML holds a global monopoly on High-NA EUV lithography machines ($380M+ per tool) using pulsed CO2 lasers on molten tin droplets. Under Western export restrictions, China was barred from purchasing EUV tools.\n\n` +
        `**The Secret Breakthrough:** Researchers at Tsinghua University developed **Steady-State Microbunching (SSMB)**—using an electron storage ring (particle accelerator synchrotron) as a continuous, high-power 13.5nm EUV radiation source. Instead of tiny laser-plasma sources, an entire accelerator facility can radiate intense EUV beams into multiple lithography steppers simultaneously.\n\n` +
        `**QMoosa Chips Protocol Integration:** Our Web 4.0 ICP canister tracks both ASML High-NA EUV nodes and SMIC/SMEE SSMB beamlines, using the **x402 Bazaar Protocol** to verify sovereign wafer yields without geopolitical intermediaries.`;
    } else if (toolToCall === 'query_chip_company') {
      agentResponseText = `**[${currentProfile.name}] Semiconductor Telemetry Retrieved:**\n\n` +
        `${toolResult?.summary}\n\n` +
        `Global lithography allocations are currently operating at peak capacity. Die yields for 2nm/3nm nodes are being validated across our ICP smart canisters using Murphy-Poisson yield curves.`;
    } else if (toolToCall === 'trigger_x402_quote') {
      agentResponseText = `**[${currentProfile.name}] x402 Bazaar Protocol Challenge:**\n\n` +
        `The requested silicon resource returned an **HTTP 402 Payment Required** status.\n` +
        `- **Quote ID:** \`${toolResult?.data?.challenge?.quote?.quoteId}\`\n` +
        `- **Cost:** \`${toolResult?.data?.challenge?.quote?.amount} ${toolResult?.data?.challenge?.quote?.currency}\`\n` +
        `- **PayTo:** \`${toolResult?.data?.challenge?.quote?.payTo}\`\n` +
        `- **Facilitator:** \`${toolResult?.data?.challenge?.headers?.['X-402-Facilitator']}\`\n\n` +
        `Settlement can be authorized autonomously via connected Web3 multiwallets or fiat QR.`;
    } else if (toolToCall === 'run_conway_simulation') {
      const m = toolResult?.data?.metrics;
      agentResponseText = `**[${currentProfile.name}] Conway Wafer Automaton Executed:**\n\n` +
        `- **Simulated Generation:** ${toolResult?.data?.generation}\n` +
        `- **Good Dies / Total:** ${m?.goodDies} / ${m?.totalDies}\n` +
        `- **Calculated Yield:** **${m?.yieldRate}%** (Poisson: ${m?.poissonYield}%, Murphy: ${m?.murphyYield}%)\n` +
        `- **Defect Density ($D_0$):** ${m?.defectDensityD0} defects/cm²\n` +
        `- **On-Chain Proof Hash:** \`${toolResult?.data?.hash}\`\n\n` +
        `The cellular automaton demonstrates how particle contamination evolves across the 300mm wafer lattice.`;
    } else if (toolToCall === 'generate_payment_qr') {
      const qr = toolResult?.data;
      agentResponseText = `**[${currentProfile.name}] Dynamic Payment QR Dispatched:**\n\n` +
        `- **Rail:** ${qr?.rail}\n` +
        `- **Amount:** ${qr?.displayAmount}\n` +
        `- **Recipient:** \`${qr?.recipientAddress}\`\n` +
        `- **URI:** \`${qr?.uri}\`\n\n` +
        `The QR modal on your screen is ready for camera scan or wallet dispatch.`;
    } else {
      agentResponseText = `**[${currentProfile.name}] Silicon Consultation:**\n\n` +
        `Received: "${userPrompt}".\n\n` +
        `Operating within the Web 4.0 QMoosa Silicon Grid on Internet Computer (ICP). All canister states and x402 Bazaar micro-settlements are synchronized with Caffeine.ai runtime. Let me know if you would like to run a lithography simulation, inspect ASML/TSMC specs, or trigger an autonomous payment.`;
    }

    const agentMsg: ChatMessage = {
      id: `agent_${Date.now()}`,
      sender: 'agent',
      modelId: this.activeModel,
      text: agentResponseText,
      timestamp: Date.now(),
      toolCall: toolToCall ? { tool: toolToCall, params: toolParams, result: toolResult } : undefined
    };

    this.history.push(agentMsg);
    return agentMsg;
  }
}
