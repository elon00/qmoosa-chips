import React, { useState } from 'react';
import { Wallet, QrCode, Copy, Check, ExternalLink, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { MultiWalletManager, WalletState, WalletType } from '../wallet/MultiWalletManager';
import { DynamicQRGenerator, PaymentRail, QRResult } from '../wallet/DynamicQRGenerator';

interface MultiWalletQRHubProps {
  walletManager: MultiWalletManager;
  activeWallet: WalletState;
  wallets: WalletState[];
  isOpen: boolean;
  onClose: () => void;
  presetAmount?: number;
  presetCurrency?: string;
  presetNote?: string;
}

export const MultiWalletQRHub: React.FC<MultiWalletQRHubProps> = ({
  walletManager,
  activeWallet,
  wallets,
  isOpen,
  onClose,
  presetAmount = 0.025,
  presetCurrency = 'ICP',
  presetNote = 'Silicon Litho Allocation'
}) => {
  const [selectedRail, setSelectedRail] = useState<PaymentRail>('ICP');
  const [amount, setAmount] = useState<number | string>(presetAmount);
  const [note, setNote] = useState<string>(presetNote);
  const [copied, setCopied] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate dynamic QR result
  const qrResult: QRResult = DynamicQRGenerator.createQR({
    rail: selectedRail,
    amount: amount || 0.01,
    note
  });

  const handleCopyUri = () => {
    navigator.clipboard?.writeText(qrResult.uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setSimulatedSuccess(`Payment of ${qrResult.displayAmount} verified on ${selectedRail} rail!`);
    setTimeout(() => {
      setSimulatedSuccess(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cyber-900 border border-cyan-500/40 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/60">
              <Wallet className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Multi-Wallet & Dual-Rail QR Engine (Fiat + Crypto)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Web 4.0 cross-rail liquidity: ICP, ckBTC, EVM, Solana & instant Fiat UPI/SEPA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-cyber-800 hover:bg-cyber-700 text-slate-300 font-mono text-sm px-3"
          >
            ✕ Close
          </button>
        </div>

        {/* Section 1: Multi-Wallet Connectors */}
        <div>
          <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider block mb-2.5">
            1. Connected Multi-Chain Wallets:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {wallets.map((w) => {
              const isActive = activeWallet.type === w.type;
              return (
                <div
                  key={w.type}
                  onClick={() => walletManager.setActiveWallet(w.type)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyber-700/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-cyber-800/60 border-cyan-900/40 hover:border-cyan-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{w.icon}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        walletManager.toggleConnect(w.type);
                      }}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        w.connected
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {w.connected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                  <h4 className="font-bold text-white text-xs truncate">{w.name}</h4>
                  <p className="text-xs font-mono text-cyan-300 mt-0.5">{w.balance}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Dynamic QR Code Generator (Fiat & Crypto) */}
        <div className="bg-cyber-800/60 border border-cyan-900/50 rounded-2xl p-4">
          <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider block mb-3">
            2. Dual-Rail Payment QR Generator:
          </span>

          {/* Rail Selector Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 font-mono text-xs">
            <span className="text-slate-400 text-xs self-center mr-1">Crypto:</span>
            {(['ICP', 'ckBTC', 'ETH', 'SOL', 'USDC'] as PaymentRail[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRail(r)}
                className={`px-3 py-1 rounded-xl transition-all border ${
                  selectedRail === r
                    ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-cyber-900 text-slate-300 border-cyan-900 hover:border-cyan-700'
                }`}
              >
                {r}
              </button>
            ))}

            <span className="text-slate-400 text-xs self-center ml-2 mr-1">Fiat:</span>
            {(['UPI', 'SEPA', 'STRIPE'] as PaymentRail[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRail(r)}
                className={`px-3 py-1 rounded-xl transition-all border ${
                  selectedRail === r
                    ? 'bg-emerald-400 text-black font-bold border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-cyber-900 text-emerald-300 border-emerald-950 hover:border-emerald-800'
                }`}
              >
                {r === 'UPI' ? 'UPI (India)' : r === 'SEPA' ? 'SEPA (Europe)' : 'Stripe / FedNow'}
              </button>
            ))}
          </div>

          {/* Inputs & Generated QR Display */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Input Controls */}
            <div className="md:col-span-7 space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Payment Amount ({selectedRail}):</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-cyber-950 border border-cyan-800/60 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Memo / Allocation Reference:</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-cyber-950 border border-cyan-800/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-3 bg-black/50 rounded-xl border border-cyan-950 space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Payment Standard:</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedRail === 'UPI' ? 'NPCI UPI VPA' : selectedRail === 'SEPA' ? 'EPC European QR' : `${selectedRail} Direct Chain`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Recipient Address / VPA:</span>
                  <span className="text-slate-200 truncate max-w-[200px]" title={qrResult.recipientAddress}>
                    {qrResult.recipientAddress}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCopyUri}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyber-800 hover:bg-cyber-700 text-cyan-300 border border-cyan-700/60 transition-all flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'URI Copied!' : 'Copy Payment URI'}</span>
                </button>

                <button
                  onClick={handleSimulatePayment}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" />
                  <span>Simulate Settle</span>
                </button>
              </div>

              {simulatedSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 text-center animate-bounce">
                  ✓ {simulatedSuccess}
                </div>
              )}
            </div>

            {/* Rendered SVG QR Code */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] border-4 border-cyan-400">
                <svg
                  width={180}
                  height={180}
                  viewBox={`0 0 ${qrResult.svgMatrix.length} ${qrResult.svgMatrix.length}`}
                  className="shape-rendering-crisp"
                >
                  {qrResult.svgMatrix.map((row, r) =>
                    row.map((cell, c) =>
                      cell ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c}
                          y={r}
                          width={1}
                          height={1}
                          fill="#070b14"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>
              <div className="mt-2 text-center font-mono">
                <span className="text-xs font-bold text-cyan-300 block">
                  Scan to Pay: {qrResult.displayAmount}
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedRail === 'UPI' ? 'Works on GPay, PhonePe, Paytm' : 'Compatible with all Web3 wallets'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
