import React, { useState } from 'react';
import { ShoppingCart, RefreshCw, KeyRound, CheckCircle2, AlertCircle, ArrowUpRight, Copy } from 'lucide-react';
import { X402BazaarClient, X402Quote, X402Receipt, X402ChallengeResponse } from '../x402/X402BazaarClient';
import { SyncStatus } from '../x402/X402Synchronizer';
import bazaarSpec from '../config/x402-bazaar.json';

interface X402BazaarSyncProps {
  x402Client: X402BazaarClient;
  syncStatus: SyncStatus;
  onTriggerSync: () => void;
  onOpenQRWithAmount?: (amount: number, currency: string, resource: string) => void;
}

export const X402BazaarSync: React.FC<X402BazaarSyncProps> = ({
  x402Client,
  syncStatus,
  onTriggerSync,
  onOpenQRWithAmount
}) => {
  const [selectedResource, setSelectedResource] = useState(bazaarSpec.resources[0]);
  const [currentChallenge, setCurrentChallenge] = useState<X402ChallengeResponse | null>(null);
  const [receipts, setReceipts] = useState<X402Receipt[]>(() => x402Client.getReceipts());
  const [isSettling, setIsSettling] = useState(false);
  const [authorizedData, setAuthorizedData] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleRequestResource = async (res = selectedResource) => {
    setSelectedResource(res);
    setAuthorizedData(null);

    // Look if we already have a receipt for this resource
    const existingReceipt = receipts.find(r => r.quoteId.includes(res.resource.replace(/\//g, '_')));
    const result = await x402Client.requestResource(res.resource, existingReceipt?.authBearerToken);

    if (result.authenticated) {
      setAuthorizedData(result.data);
      setCurrentChallenge(null);
    } else if (result.challenge) {
      setCurrentChallenge(result.challenge);
    }
  };

  const handleSettleQuote = async (quote: X402Quote) => {
    setIsSettling(true);
    try {
      await new Promise(r => setTimeout(r, 600)); // simulation delay
      const payerAddr = bazaarSpec.provider.payTo.icp;
      const txProof = `icp_canister_block_${Date.now()}_${quote.nonce}`;
      const receipt = await x402Client.settleQuote(quote.quoteId, payerAddr, txProof);
      setReceipts(x402Client.getReceipts());

      // Now fetch protected data using bearer token
      const access = await x402Client.requestResource(quote.resourcePath, receipt.authBearerToken);
      if (access.authenticated) {
        setAuthorizedData(access.data);
      }
      setCurrentChallenge(null);
    } finally {
      setIsSettling(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <section className="bg-cyber-800/60 rounded-2xl border border-cyan-900/40 p-5 backdrop-blur-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              x402 Bazaar Protocol — Autonomous Agent Commerce
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            HTTP 402 standard for sovereign silicon IP, High-NA EUV beam time, and agent-to-agent micropayments
          </p>
        </div>

        {/* Facilitator Heartbeat & Sync Status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyber-900/90 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Facilitator: Online ({syncStatus.syncLatencyMs}ms)</span>
          </span>

          <button
            onClick={onTriggerSync}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resync</span>
          </button>
        </div>
      </div>

      {/* Resource Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {bazaarSpec.resources.map((res, i) => {
          const isSelected = selectedResource.resource === res.resource;
          const pricingEntries = Object.entries(res.pricing);

          return (
            <div
              key={i}
              onClick={() => handleRequestResource(res)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyber-700/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-cyber-900/60 border-cyan-900/40 hover:border-cyan-800'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">
                  {res.method}
                </span>
                <div className="flex gap-1 font-mono text-[10px] text-emerald-400 font-bold">
                  {pricingEntries.map(([curr, price]) => (
                    <span key={curr} className="bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      {price} {curr}
                    </span>
                  ))}
                </div>
              </div>

              <h4 className="font-bold text-white text-xs mb-1 line-clamp-1">{res.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{res.description}</p>
              <span className="text-[10px] font-mono text-slate-500 block truncate">{res.resource}</span>
            </div>
          );
        })}
      </div>

      {/* Live HTTP 402 Inspector & Settlement Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Challenge / Authorization Box */}
        <div className="lg:col-span-7 bg-cyber-900/90 rounded-xl border border-cyan-800/50 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>HTTP 402 Protocol Inspector</span>
            </span>
            <span className="text-[11px] text-slate-400">Target: {selectedResource.name}</span>
          </div>

          {currentChallenge ? (
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-700/50 text-rose-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>HTTP 402 PAYMENT REQUIRED</span>
                </div>
                <p className="text-[11px] text-rose-200">
                  Access requires microtransaction authorization under x402 Bazaar Protocol.
                </p>
              </div>

              <div className="bg-black/60 p-3 rounded-lg border border-cyan-950 space-y-1 text-slate-300">
                <div className="text-slate-500">// HTTP 402 Response Headers:</div>
                {Object.entries(currentChallenge.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-cyan-400 font-semibold">{k}:</span>
                    <span className="text-slate-200 break-all">{v}</span>
                  </div>
                ))}
              </div>

              {/* Settlement Action Bar */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleSettleQuote(currentChallenge.quote)}
                  disabled={isSettling}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSettling ? 'Settling Microtransaction...' : `Autonomous Settle (${currentChallenge.quote.amount} ${currentChallenge.quote.currency})`}
                  </span>
                </button>

                {onOpenQRWithAmount && (
                  <button
                    onClick={() => onOpenQRWithAmount(currentChallenge.quote.amount, currentChallenge.quote.currency, selectedResource.name)}
                    className="py-2 px-3 rounded-xl bg-cyber-800 hover:bg-cyber-700 text-cyan-300 border border-cyan-700/60 font-medium transition-all"
                  >
                    Open Payment QR
                  </button>
                )}
              </div>
            </div>
          ) : authorizedData ? (
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-700/50 text-emerald-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>200 OK — ACCESS AUTHORIZED VIA x402 BEARER TOKEN</span>
                </div>
                <p className="text-[11px] text-emerald-200">
                  Cryptographic receipt verified on Internet Computer Protocol canister.
                </p>
              </div>

              <div className="bg-black/60 p-3 rounded-lg border border-cyan-950 text-cyan-200 overflow-x-auto">
                <pre>{JSON.stringify(authorizedData, null, 2)}</pre>
              </div>

              <button
                onClick={() => handleRequestResource(selectedResource)}
                className="py-1.5 px-3 rounded-lg bg-cyber-800 hover:bg-cyber-700 text-slate-300 text-xs border border-cyan-900"
              >
                Refresh Resource Query
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 space-y-2">
              <p>Select any resource above and click to dispatch an autonomous HTTP 402 request.</p>
              <button
                onClick={() => handleRequestResource(selectedResource)}
                className="py-1.5 px-4 rounded-xl bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/50 text-xs"
              >
                Dispatch Query for "{selectedResource.name}"
              </button>
            </div>
          )}
        </div>

        {/* Cryptographic Receipts Ledger */}
        <div className="lg:col-span-5 bg-cyber-900/90 rounded-xl border border-cyan-800/50 p-4 space-y-3 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2 mb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>x402 Settlement Receipts</span>
              </span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
                {receipts.length} Settled
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {receipts.length === 0 ? (
                <div className="text-slate-500 text-center py-6">
                  No receipts yet. Settle a 402 quote to generate cryptographic proof.
                </div>
              ) : (
                receipts.map((rcpt, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-cyber-800/60 border border-cyan-900/60 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-cyan-300">{rcpt.amountPaid} {rcpt.currency}</span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(rcpt.settledAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[10px] truncate" title={rcpt.receiptId}>
                      Receipt: <span className="text-slate-200">{rcpt.receiptId}</span>
                    </div>
                    <div className="text-slate-400 text-[10px] truncate" title={rcpt.pqcSignature}>
                      PQC Sig: <span className="text-violet-300">{rcpt.pqcSignature}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-cyan-900/50 flex justify-between items-center text-[10px] text-slate-400">
            <span>CAIP-2: {bazaarSpec.provider.caip2}</span>
            <span className="text-cyan-400">PQC: FIPS 204 Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};
