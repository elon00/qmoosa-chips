import React, { useState } from 'react';
import { Cpu, Zap, ShieldAlert, Award, ExternalLink, Activity, Play } from 'lucide-react';
import chipsCompanies from '../config/chips-companies.json';

interface GlobalChipsTrackerProps {
  onRequestQuote: (resourcePath: string) => void;
  onSimulateNode: (companyId: string) => void;
}

export const GlobalChipsTracker: React.FC<GlobalChipsTrackerProps> = ({
  onRequestQuote,
  onSimulateNode
}) => {
  const [selectedCompany, setSelectedCompany] = useState(chipsCompanies[2]); // default to SMIC/SMEE (Why China Hiding This Machine)
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section className="bg-cyber-800/60 rounded-2xl border border-cyan-900/40 p-5 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Global Semiconductor Fabs & Lithography Grid
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Decentralized node tracking across Western EUV monopolies & Eastern sovereign particle accelerators
          </p>
        </div>

        {/* Video Feature Button */}
        <button
          onClick={() => setShowVideoModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 text-xs font-mono transition-all shadow-[0_0_12px_rgba(244,63,94,0.2)]"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Case Study: Why Is China Hiding This Machine?</span>
        </button>
      </div>

      {/* Grid of Global Chip Titans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chipsCompanies.map((c) => {
          const isSelected = selectedCompany.id === c.id;
          const isChinaSovereign = c.id === 'smic-smee';
          const isASML = c.id === 'asml';

          return (
            <div
              key={c.id}
              onClick={() => setSelectedCompany(c)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-cyber-700/80 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'bg-cyber-900/60 border-cyan-900/40 hover:border-cyan-700/60 hover:bg-cyber-800/70'
              }`}
            >
              {isChinaSovereign && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-amber-500 text-[10px] font-bold font-mono text-black px-2 py-0.5 rounded-bl-lg">
                  SSMB BREAKTHROUGH
                </div>
              )}
              {isASML && (
                <div className="absolute top-0 right-0 bg-cyan-500 text-[10px] font-bold font-mono text-black px-2 py-0.5 rounded-bl-lg">
                  HIGH-NA MONOPOLY
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                    {c.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{c.country}</span>
                </div>
              </div>

              <p className="text-xs text-cyan-200/90 mb-3 line-clamp-1">{c.role}</p>

              <div className="space-y-1.5 text-xs font-mono bg-black/40 p-2.5 rounded-lg border border-cyan-950">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Capacity:</span>
                  <span className="text-slate-200">{c.waferCapacityMonthly}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Market Cap:</span>
                  <span className="text-cyan-300">{c.marketCap}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">x402 Quote:</span>
                  <span className="text-emerald-400 font-bold">{c.x402QuoteCost}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestQuote(c.x402ResourceEndpoint);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-xs font-mono text-center transition-all"
                >
                  Request x402 Quote
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSimulateNode(c.id);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-mono transition-all flex items-center gap-1"
                  title="Simulate Wafer Yield"
                >
                  <Activity className="w-3 h-3 text-cyan-300" />
                  <span>Yield</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Detailed Inspector */}
      {selectedCompany && (
        <div className="mt-5 p-4 rounded-xl bg-cyber-900/90 border border-cyan-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h4 className="font-bold text-cyan-200 text-sm font-mono">
                FLAGSHIP NODE TELEMETRY: {selectedCompany.name} ({selectedCompany.country})
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-cyber-800 px-2 py-0.5 rounded border border-cyan-900/60">
              Canister Node: {selectedCompany.canisterNode}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {selectedCompany.flagshipNodes.map((fn, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-cyber-800/70 border border-cyan-900/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{fn.name}</span>
                  <span className="text-emerald-400 text-[11px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    {fn.status}
                  </span>
                </div>
                <div className="text-slate-400">
                  Resolution: <span className="text-cyan-300">{fn.resolution}</span>
                </div>
                <div className="text-slate-400">
                  Power Source: <span className="text-slate-200">{fn.powerSource}</span>
                </div>
                <div className="text-slate-400">
                  Chokepoint Risk: <span className="text-amber-400">{fn.chokepointRisk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Deep-Dive Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-900 border border-rose-500/50 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🔬</span>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Video Briefing: Why Is China Hiding This Machine?
                  </h3>
                  <p className="text-xs text-rose-400 font-mono">
                    Analysis by GetsetflySCIENCE • YouTube Reference: PJo1WeS-7zs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-cyber-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans bg-black/40 p-4 rounded-xl border border-rose-950">
              <p>
                <strong className="text-cyan-300">1. The Geopolitical Chokepoint:</strong> ASML’s Twinscan High-NA EUV lithography machines represent the single most complex machine in human history, costing \$380M+ each and containing over 100,000 components. Strict export bans blocked China from acquiring 7nm/5nm/3nm EUV capabilities.
              </p>
              <p>
                <strong className="text-rose-400">2. The Secret SSMB Accelerator:</strong> Rather than replicating ASML’s tin droplet laser-plasma technology, Chinese researchers at Tsinghua University engineered a <strong>Steady-State Microbunching (SSMB)</strong> synchrotron particle accelerator.
              </p>
              <p>
                <strong className="text-amber-300">3. Why it Changes Everything:</strong> An electron storage ring emits continuous, coherent 13.5nm EUV radiation with far higher power (kilowatts vs ASML's 250W-500W). A single circular accelerator can power an entire underground cluster of lithography steppers simultaneously.
              </p>
              <p>
                <strong className="text-emerald-400">4. QMoosa Chips Coordination:</strong> By combining ICP Protocol canisters, the x402 Bazaar Protocol, and Conway cellular automata, QMoosa Chips enables decentralized yield verification and micro-commerce across both Western and sovereign Asian fabs.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setSelectedCompany(chipsCompanies[2]);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                Inspect SMIC/SMEE SSMB Canister
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
