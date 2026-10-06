import React from 'react';
import { Cpu, ShieldCheck, Zap, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { WalletState } from '../wallet/MultiWalletManager';
import { SyncStatus } from '../x402/X402Synchronizer';

interface HeaderProps {
  activeWallet: WalletState;
  syncStatus: SyncStatus;
  onOpenWalletModal: () => void;
  onTriggerSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeWallet,
  syncStatus,
  onOpenWalletModal,
  onTriggerSync
}) => {
  return (
    <header className="border-b border-cyan-900/40 bg-cyber-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-violet-600/20 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Cpu className="w-6 h-6 text-cyan-300 animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-cyber-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-cyber-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                QMoosa Chips
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                Web 4.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <span>ICP Protocol</span>
              <span className="text-cyan-500">•</span>
              <span>Caffeine.ai Mesh</span>
              <span className="text-cyan-500">•</span>
              <span>x402 Bazaar</span>
            </p>
          </div>
        </div>

        {/* System Badges & Telemetry */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <button
            onClick={onTriggerSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-800 border border-cyan-800/40 hover:border-cyan-500 text-cyan-300 transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            title="Trigger x402 P2P Sync"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-cyan-400" />
            <span>x402 Sync: R{syncStatus.syncRound} ({syncStatus.syncLatencyMs}ms)</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-800/80 border border-emerald-500/30 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ICP Subnet Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-800/80 border border-violet-500/30 text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Caffeine AI 2.4</span>
          </div>

          {/* Active Wallet Trigger Button */}
          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all transform active:scale-95"
          >
            <span>{activeWallet.icon}</span>
            <span className="hidden md:inline">{activeWallet.name.split(' ')[0]}</span>
            <span className="text-cyan-200 font-mono text-[11px] bg-black/30 px-1.5 py-0.5 rounded">
              {activeWallet.balance.split(' ')[0]} {activeWallet.currency}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
