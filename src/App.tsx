import React, { useState, useEffect } from 'react';
import { Cpu, Layers, ShoppingCart, Bot, Terminal, Wallet, Sparkles, RefreshCw, Globe2 } from 'lucide-react';
import { Header } from './components/Header';
import { GlobalChipsTracker } from './components/GlobalChipsTracker';
import { ConwayWaferSimulator } from './components/ConwayWaferSimulator';
import { X402BazaarSync } from './components/X402BazaarSync';
import { MultiModelAIChat } from './components/MultiModelAIChat';
import { MultiWalletQRHub } from './components/MultiWalletQRHub';
import { AutomationConsole } from './components/AutomationConsole';

import { MultiWalletManager, WalletState } from './wallet/MultiWalletManager';
import { X402BazaarClient } from './x402/X402BazaarClient';
import { X402Synchronizer, SyncStatus } from './x402/X402Synchronizer';
import { MultiModelAgent } from './agents/MultiModelAgent';

type ActiveTab = 'overview' | 'chips' | 'conway' | 'x402' | 'agent' | 'automation';

export const App: React.FC = () => {
  // Instantiations
  const [walletManager] = useState(() => new MultiWalletManager());
  const [x402Client] = useState(() => new X402BazaarClient());
  const [synchronizer] = useState(() => new X402Synchronizer());
  const [agent] = useState(() => new MultiModelAgent());

  // Reactive States
  const [wallets, setWallets] = useState<WalletState[]>(() => walletManager.getWallets());
  const [activeWallet, setActiveWallet] = useState<WalletState>(() => walletManager.getActiveWallet());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => synchronizer.getInitialStatus());
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Wallet Modal & QR state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [qrPreset, setQrPreset] = useState<{ amount: number; currency: string; resource: string }>({
    amount: 0.015,
    currency: 'ICP',
    resource: 'ASML High-NA EUV Allocation'
  });

  // Subscribe to wallet manager changes
  useEffect(() => {
    const unsub = walletManager.subscribe((newWallets, newActive) => {
      setWallets(newWallets);
      setActiveWallet(newActive);
    });
    return unsub;
  }, [walletManager]);

  // Subscribe to x402 synchronizer changes
  useEffect(() => {
    const unsub = synchronizer.subscribe((status) => {
      setSyncStatus(status);
    });
    return unsub;
  }, [synchronizer]);

  const handleTriggerSync = async () => {
    await synchronizer.triggerSync();
  };

  const handleOpenQRWithAmount = (amount: number, currency: string, resource: string) => {
    setQrPreset({ amount, currency, resource });
    setIsWalletModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Global Navigation Header */}
      <Header
        activeWallet={activeWallet}
        syncStatus={syncStatus}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onTriggerSync={handleTriggerSync}
      />

      {/* Main Tab Navigation Bar */}
      <div className="bg-cyber-900/60 border-b border-cyan-900/40 sticky top-[69px] z-30 px-4 lg:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-cyber-800'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Master Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('chips')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'chips'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-cyber-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Global Chips & Litho</span>
          </button>

          <button
            onClick={() => setActiveTab('conway')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'conway'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-cyber-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Conway Wafer Automaton</span>
          </button>

          <button
            onClick={() => setActiveTab('x402')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'x402'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-cyber-800'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>x402 Bazaar Protocol</span>
          </button>

          <button
            onClick={() => setActiveTab('agent')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'agent'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-cyber-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Multi-Model AI Agentics</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'automation'
                ? 'bg-emerald-400 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-cyber-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>End-to-End Automation</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6">
        {/* Banner Pill for Context */}
        <div className="bg-gradient-to-r from-blue-950/60 via-cyber-800/80 to-purple-950/60 border border-cyan-800/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <h2 className="text-sm font-bold text-cyan-200">
                QMoosa Chips — Sovereign Silicon & Lithography Coordination Protocol
              </h2>
              <p className="text-xs text-slate-400">
                Bridging Western High-NA EUV (ASML) with Sovereign Eastern Synchrotrons (SMIC/SMEE SSMB) via ICP smart canisters & x402 micro-settlements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyber-900 hover:bg-cyber-800 text-cyan-300 border border-cyan-700/60 text-xs font-mono transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Multi-Wallet & QR Rails</span>
            </button>
          </div>
        </div>

        {/* Tab Displays */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <GlobalChipsTracker
              onRequestQuote={(path) => handleOpenQRWithAmount(0.015, 'ICP', path)}
              onSimulateNode={() => setActiveTab('conway')}
            />
            <ConwayWaferSimulator />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <X402BazaarSync
                x402Client={x402Client}
                syncStatus={syncStatus}
                onTriggerSync={handleTriggerSync}
                onOpenQRWithAmount={handleOpenQRWithAmount}
              />
              <MultiModelAIChat
                agent={agent}
                onOpenQRWithAmount={handleOpenQRWithAmount}
              />
            </div>
            <AutomationConsole x402Client={x402Client} />
          </div>
        )}

        {activeTab === 'chips' && (
          <GlobalChipsTracker
            onRequestQuote={(path) => handleOpenQRWithAmount(0.015, 'ICP', path)}
            onSimulateNode={() => setActiveTab('conway')}
          />
        )}

        {activeTab === 'conway' && (
          <ConwayWaferSimulator />
        )}

        {activeTab === 'x402' && (
          <X402BazaarSync
            x402Client={x402Client}
            syncStatus={syncStatus}
            onTriggerSync={handleTriggerSync}
            onOpenQRWithAmount={handleOpenQRWithAmount}
          />
        )}

        {activeTab === 'agent' && (
          <MultiModelAIChat
            agent={agent}
            onOpenQRWithAmount={handleOpenQRWithAmount}
          />
        )}

        {activeTab === 'automation' && (
          <AutomationConsole x402Client={x402Client} />
        )}
      </main>

      {/* Multi-Wallet & Dual-Rail QR Modal */}
      <MultiWalletQRHub
        walletManager={walletManager}
        activeWallet={activeWallet}
        wallets={wallets}
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        presetAmount={qrPreset.amount}
        presetCurrency={qrPreset.currency}
        presetNote={qrPreset.resource}
      />

      {/* Footer */}
      <footer className="border-t border-cyan-950 bg-cyber-900/80 py-4 px-4 lg:px-8 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QMoosa Chips Protocol © 2026 • Web 4.0 Semiconductor Infrastructure</span>
          <span className="text-cyan-400">Deployed via Caffeine.ai on Internet Computer Protocol (ICP)</span>
        </div>
      </footer>
    </div>
  );
};
